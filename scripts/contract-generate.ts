import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import addFormats from "ajv-formats";
import openapiTS, { astToString } from "openapi-typescript";

export const contractDirectory = new URL("../src/contract/", import.meta.url);
const root = new URL("../", import.meta.url);
type Schema = Record<string, unknown>;
type OpenApi = {
  info: { version: string };
  components: { schemas: Record<string, Schema> };
  paths: Record<
    string,
    {
      get?: {
        responses?: Record<
          string,
          { content?: Record<string, { schema?: Schema }> }
        >;
        "x-sse-events"?: Record<string, { schema: { $ref: string } }>;
      };
    }
  >;
};

/** One copied contract: where it lives, the bytes it must be, and where its artifacts go. */
export type ContractSpec = {
  source: string;
  hash: string;
  directory: URL;
  /** In-memory widenings of the decoding projection that the document's own prose asks for. */
  widen: (document: OpenApi, decoded: OpenApi) => void;
  sse: boolean;
};

function schemaNamed(document: OpenApi, name: string): Schema {
  const schema = document.components.schemas[name];
  if (!schema) throw new Error(`Missing schema ${name}`);
  return schema;
}

function propertyNamed(schema: Schema, name: string): Schema {
  const property = (schema.properties as Record<string, Schema> | undefined)?.[
    name
  ];
  if (!property) throw new Error(`Missing property ${name}`);
  return property;
}

function withoutEnums(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) withoutEnums(item);
  } else if (value && typeof value === "object") {
    Reflect.deleteProperty(value, "enum");
    for (const child of Object.values(value)) withoutEnums(child);
  }
}

export const contracts: readonly ContractSpec[] = [
  {
    // The KakaoTalk contract, byte-identical to nichirin's root openapi.json (kanao and kamado).
    source: "contracts/kakao.openapi.json",
    hash: "298fb1d6250181a0055779d5808cd2d8c3a4a5f4913d70f7aa2673834595ebfd",
    directory: contractDirectory,
    sse: true,
    widen(document, decoded) {
      // The published enum documents known codes; its own prose requires an open
      // consumer type. Only this in-memory decoding projection widens that enum.
      Reflect.deleteProperty(schemaNamed(decoded, "ErrorCode"), "enum");
      // Upstream cores emit additional room kinds (e.g. open-group, open-direct, channel).
      // A forward-compatible consumer accepts unknown room kinds rather than rejecting the catalog.
      Reflect.deleteProperty(
        propertyNamed(schemaNamed(decoded, "Room"), "kind"),
        "enum",
      );
      // Also delete enum from the validation schema of Room so AJV doesn't validate it against closed enum in Context
      Reflect.deleteProperty(
        propertyNamed(schemaNamed(document, "Room"), "kind"),
        "enum",
      );
    },
  },
  {
    // The tsuba adapter contract, byte-identical to tsuba's contract/openapi.json.
    source: "contracts/tsuba.openapi.json",
    hash: "7661a06fdc3e572d53a0ae85de41053f041e9a1b3a1bf9fe285fa4cc41e673a3",
    directory: new URL("../src/contract/tsuba/", import.meta.url),
    sse: true,
    widen(_document, decoded) {
      // Its prose: error codes grow, and an enum value a client does not know
      // means the least that field can mean. No closed enum is decoded.
      withoutEnums(decoded.components.schemas);
    },
  },
];

// Strip annotations, not constraints. In particular, Cursor.additionalProperties
// is a value schema, not a ban on additive object members, and must be retained.
function validationSchema(schema: Schema): Schema {
  const result: Schema = {};
  const annotations = new Set([
    "title",
    "description",
    "examples",
    "example",
    "default",
    "$comment",
    "deprecated",
    "readOnly",
    "writeOnly",
    "externalDocs",
    "xml",
  ]);
  for (const [key, value] of Object.entries(schema)) {
    if (annotations.has(key) || key.startsWith("x-")) continue;
    if (["properties", "patternProperties", "$defs"].includes(key)) {
      result[key] = Object.fromEntries(
        Object.entries(value as Record<string, Schema>).map(([name, child]) => [
          name,
          validationSchema(child),
        ]),
      );
    } else if (
      ["items", "additionalProperties", "not", "if", "then", "else"].includes(
        key,
      ) &&
      typeof value === "object" &&
      value !== null
    ) {
      result[key] = validationSchema(value as Schema);
    } else if (["allOf", "anyOf", "oneOf", "prefixItems"].includes(key)) {
      result[key] = (value as Schema[]).map(validationSchema);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function generateContract(
  spec: ContractSpec,
): Promise<Map<string, string>> {
  const header = `// Generated from ${spec.source} by bun run contract:generate. Do not edit.\n`;
  const bytes = await readFile(new URL(spec.source, root));
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== spec.hash)
    throw new Error(`OpenAPI byte identity failed for ${spec.source}: ${hash}`);
  const document: OpenApi = JSON.parse(bytes.toString("utf8"));
  const decoded = structuredClone(document);
  spec.widen(document, decoded);
  const files = new Map<string, string>([
    [
      "version.ts",
      `${header}/** The contract version these artifacts were generated from. */\nexport const CONTRACT_VERSION = ${JSON.stringify(document.info.version)};\n`,
    ],
    [
      "schema.d.ts",
      header + astToString(await openapiTS(JSON.stringify(document))),
    ],
    [
      "decoded.d.ts",
      header + astToString(await openapiTS(JSON.stringify(decoded))),
    ],
  ]);

  const schemas = Object.fromEntries(
    Object.entries(decoded.components.schemas).map(([name, schema]) => [
      name,
      validationSchema(schema),
    ]),
  );
  const declarations = Object.keys(schemas).map(
    (name) =>
      `export const validate${name}: ValidateFunction<components["schemas"][${JSON.stringify(name)}]>;`,
  );
  // Health and rooms are inline response schemas, so derive their validators
  // from paths too rather than maintaining a second hand-written envelope.
  for (const [path, item] of Object.entries(document.paths)) {
    const schema =
      item.get?.responses?.["200"]?.content?.["application/json"]?.schema;
    if (!schema || "$ref" in schema) continue;
    const name = `${path.slice(1, 2).toUpperCase()}${path.slice(2)}Response`;
    schemas[name] = validationSchema(schema);
    declarations.push(
      `export const validate${name}: ValidateFunction<paths[${JSON.stringify(path)}]["get"]["responses"][200]["content"]["application/json"]>;`,
    );
  }

  const ajv = new Ajv2020({
    strict: true,
    code: { source: true, esm: true },
    inlineRefs: false,
  });
  // `uri` arrives with Photo: a picture's address carries format: uri.
  addFormats(ajv, { formats: ["date-time", "uri"], mode: "full" });
  // `binary` marks a file part of a multipart upload; it constrains no JSON value.
  ajv.addFormat("binary", true);
  // Register each schema separately so refs still point at the canonical names,
  // without admitting arbitrary OpenAPI keywords into Ajv's JSON Schema dialect.
  for (const [name, schema] of Object.entries(schemas)) {
    ajv.addSchema(schema, `#/components/schemas/${name}`);
  }
  const exports = Object.fromEntries(
    Object.keys(schemas).map((name) => [
      `validate${name}`,
      `#/components/schemas/${name}`,
    ]),
  );
  const standalone = standaloneCode(ajv, exports);
  // Ajv emits ESM exports but its tiny format/Unicode helpers use require().
  // Bundle that standalone artifact (never the compiler) into browser-native ESM.
  const result = await Bun.build({
    entrypoints: ["saya:validators"],
    target: "browser",
    format: "esm",
    minify: false,
    plugins: [
      {
        name: "standalone-contract",
        setup(build) {
          build.onResolve({ filter: /^saya:validators$/ }, () => ({
            path: "validators",
            namespace: "contract",
          }));
          build.onLoad({ filter: /.*/, namespace: "contract" }, () => ({
            contents: standalone,
            loader: "js",
            resolveDir: fileURLToPath(root),
          }));
        },
      },
    ],
  });
  if (!result.success)
    throw new AggregateError(
      result.logs,
      "Standalone validator bundling failed",
    );
  if (result.outputs.length !== 1 || !result.outputs[0])
    throw new Error("Expected one validator artifact");
  files.set("validators.js", header + (await result.outputs[0].text()));
  files.set(
    "validators.d.ts",
    `${header}import type { ValidateFunction } from "ajv";\nimport type { components, paths } from "./decoded";\n\n${declarations.join("\n")}\n`,
  );

  if (!spec.sse) return files;
  const events = document.paths["/stream"]?.get?.["x-sse-events"];
  if (!events) throw new Error(`${spec.source} declares no SSE events`);
  const eventSchemas = Object.fromEntries(
    Object.entries(events).map(([name, event]) => {
      const schema = event.schema.$ref.replace("#/components/schemas/", "");
      if (!(schema in schemas))
        throw new Error(`Unknown SSE schema: ${schema}`);
      return [name, schema];
    }),
  );
  const eventImports = [...new Set(Object.values(eventSchemas))].map(
    (name) => `validate${name}`,
  );
  files.set(
    "sse.ts",
    `${header}import type { components } from "./decoded";\nimport { ${eventImports.join(", ")} } from "./validators.js";\n\nexport const sseEventSchemas = ${JSON.stringify(eventSchemas, null, 2)} as const;\n\nexport type SseEventName = keyof typeof sseEventSchemas;\nexport type SsePayloads = { [Name in SseEventName]: components["schemas"][(typeof sseEventSchemas)[Name]] };\n\nexport const sseValidators = {\n${Object.entries(
      eventSchemas,
    )
      .map(([name, schema]) => `  ${JSON.stringify(name)}: validate${schema},`)
      .join("\n")}\n} as const;\n`,
  );
  return files;
}

if (import.meta.main) {
  for (const spec of contracts) {
    const files = await generateContract(spec);
    await mkdir(spec.directory, { recursive: true });
    for (const [name, content] of files)
      await writeFile(new URL(name, spec.directory), content);
    console.log(
      `Generated ${files.size} contract artifacts from canonical ${spec.source}`,
    );
  }
}
