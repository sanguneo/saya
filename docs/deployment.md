# Deployment: static client behind a same-origin proxy

The production artifact is `dist/` plus saya's server (`server/serve.ts`).
Serve `dist/` through Caddy or nginx; the proxy forwards the browser's
same-origin `/api/*`, `/adapters*` and `/unfurl*` to saya's server, which
forwards `/api` and `/adapters` to whichever KakaoTalk core and messenger
adapters registered with it ([docs/register.md](register.md)).

saya holds one secret, `SAYA_REGISTER_TOKEN`. Cores and adapters hold saya's
register address, that token, and their own token, which they hand to saya
when they register. No core or adapter address or token is configured on
saya's side, and the browser never receives any of them: do not add a
`VITE_` prefix, put a token in HTML, or use a build-time replacement.

The development server (`bun run dev`) still reads `SAYA_CORE_URL`,
`SAYA_CORE_TOKEN`, `SAYA_ADAPTERS` and `SAYA_ADAPTER_<ID>_URL`/`_TOKEN`
from `.env` (`server/adapters.ts`); that is a development convenience, not
how production is configured.

## Caddy

1. Build the static artifact with `bun run build`.
2. Start saya's server with a register token of at least 32 characters, kept
   out of source control:

   ```sh
   SAYA_REGISTER_TOKEN=... SAYA_SERVER_PORT=8791 bun server/serve.ts
   ```

3. Run Caddy from the repository root so `root * dist` resolves to the built
   artifact:

   ```sh
   caddy run --config deploy/Caddyfile.example
   ```

4. Point each core and adapter at saya: `SAYA_REGISTER_URL`,
   `SAYA_REGISTER_TOKEN`, and `SAYA_ADVERTISE_URL` when saya does not reach
   it on `http://127.0.0.1:<its port>`. It appears in the lists within one
   heartbeat, and disappears 90 seconds after it stops.

`deploy/Caddyfile.example` binds `http://127.0.0.1:8080` by default and holds
no token. It streams SSE with `flush_interval -1` and deliberately sets no
stream or idle timeout: neither contract promises a ping cadence, so a short
timeout would silently sever a healthy stream. saya's server lifts Bun's idle
limit for the requests it forwards for the same reason.

The proxy returns `403` for `POST`, `PUT`, `PATCH`, and `DELETE` unless all of
the following are true:

- `Origin` is this site's origin;
- `Sec-Fetch-Site` is `same-origin`;
- `Content-Type` is `application/json`, or `multipart/form-data` on one of the
  two upload routes, `/api/upload` and `/adapters/<id>/upload`.

Those two routes also carry `request_body max_size 60MiB`, above the largest
`maxBytes` a core or adapter declares (50 MB): the proxy passes on no more than
that, whatever the request claims. The core or adapter answers a file past its
own limit with `400`, from the declared length or while it reads; measured on
the tailnet deployment, a 61 MiB upload to a 10 MiB adapter was refused by the
adapter both with a declared length and chunked. Keep both parts when you copy
the example: without the multipart allowance a file send is refused with `403`,
and without the size bound a body is limited only by the core or adapter
behind it.

This is a fail-closed browser-write boundary, not a substitute for user access
control. The registered credentials remain hidden from JavaScript, but anyone
who can use the proxy's origin can otherwise act with them.

## Remote exposure

The loopback configuration is the safe default. Do **not** change it to a
remote binding unless both conditions are in place:

1. TLS terminates at the public proxy; and
2. a separate user-authentication and authorization layer protects the site.

For a remote Caddy deployment, replace the site address and the `Origin`
matcher in the example with the same HTTPS public origin, and add the
organization's authentication handler before the `/api` handler. Keep saya's
server, and every core and adapter, bound to loopback. If either TLS or
separate user authentication is unavailable, leave the proxy loopback-only.

nginx deployments must implement the same contract: `proxy_pass` of `/api`,
`/adapters` and `/unfurl` to saya's server unchanged, `proxy_buffering off`
for SSE, no short read/idle timeout, the sandbox headers on `/adapters`, and
the same fail-closed Origin, Fetch-Metadata, and JSON write checks before
proxying.

## Registration

Cores and adapters register themselves; [docs/register.md](register.md) is
the contract. In short:

- `POST /register` on saya's register listener (`SAYA_REGISTER_PORT`,
  default `8798`, loopback) with saya's token and
  `{kind, id, url, token}`, repeated every 30 seconds; a registration ends 90
  seconds after the last one, or at once on `DELETE /register`.
- The register listener is never served on the site's origin. Registrants on
  the same machine use `http://127.0.0.1:8798`; others reach it over the
  tailnet only (`tailscale serve --bg --https=8798 http://127.0.0.1:8798`).
- Only loopback and tailnet addresses are accepted (`127.0.0.0/8`, `::1`,
  `100.64.0.0/10`, `fd7a:115c:a1e0::/48`, `*.ts.net`), so a leaked register
  token cannot point the proxy at an arbitrary host. Never put a core or an
  adapter on a public address to make it reachable.

What the browser sees is unchanged:

- `GET /adapters`: the index, `{"adapters":[{"id":"telegram"}]}`, live
  adapters sorted by id. It is a facility of saya's server, not part of either
  messenger contract.
- `/adapters/<id>/*`: stripped of that prefix and forwarded to the adapter's
  registered address, with its registered token. An address with a path
  (`tailscale serve --set-path /slack`) keeps it in front of every route.
- `/api/*`: forwarded to the KakaoTalk core that registered most recently, or
  `503` when none is live, which the client draws as KakaoTalk being away.

`/adapters/<id>/media` answers the bytes of a file somebody else sent, opened
at this origin. The adapter already answers it sandboxed, but saya does not
rely on that: saya's server and the Caddyfile example both set
`Content-Security-Policy: default-src 'none'; sandbox` and
`X-Content-Type-Options: nosniff` on every adapter answer, over the upstream's
own headers. Cache-Control is a default only, so `/media` keeps its
`private, max-age=86400` while everything else is `no-store`.

## Running it as a service on a tailnet

One way that keeps every listener on loopback: the proxy and saya's server run
under systemd on a server, and Tailscale is both the TLS terminator and the
user boundary (only the owner's tailnet devices reach it).

1. On the server: clone this repository, `bun install --frozen-lockfile`,
   `bun run build`. Copy `deploy/Caddyfile.example` outside the repository and
   set: a loopback listener (`http://:8796` with `bind 127.0.0.1` accepts the
   host name tailscale forwards), `root` to the built `dist`, the Origin matcher
   to the tailnet origin (`https://<server>.<tailnet>.ts.net`), and saya's
   server port on the `/unfurl`, `/api` and `/adapters` handles.
2. Write an env file readable only by the service user (`chmod 600`) with
   `SAYA_REGISTER_TOKEN` alone. Never print it.
3. Install `deploy/saya-proxy.service` and `deploy/saya-server.service`
   (adjust user and paths), then `systemctl enable --now saya-proxy saya-server`.
4. `tailscale serve --bg --https=443 --set-path / http://127.0.0.1:8796` for
   the site, and `tailscale serve --bg --https=8798 http://127.0.0.1:8798` for
   registration. Paths other services already hold on that address keep
   working.
5. On each core and adapter, set `SAYA_REGISTER_URL` (`http://127.0.0.1:8798`
   on this server, `https://<server>.<tailnet>.ts.net:8798` elsewhere),
   `SAYA_REGISTER_TOKEN`, and, when it is on another machine behind
   `tailscale serve`, `SAYA_ADVERTISE_URL` (`https://<pc>.<tailnet>.ts.net:8765`).

Check, from a tailnet device: `/` is the client, `/adapters` lists what
registered, `/api/health` answers, and a `POST` without this site's `Origin`
is `403`. To update, pull and `bun run build`; the proxy serves the new
`dist/` without a restart (restart `saya-server` when `server/` changed;
registrations return within one heartbeat). Adding an adapter changes nothing
on this server. While a core's machine is off, KakaoTalk is simply absent from
the lists.

### Moving between cores

When one account is served by `kanao serve` on a PC some days and by
`kamado serve` on a Mac on others, both register as `kind: "kakao"` and
`/api` follows the one that registered last; nothing on saya changes.

- Keep only one running. A stopped core sends `DELETE /register` and leaves
  the list at once; one that vanished is forgotten after 90 seconds.
- Requests in a switch may fail once. saya's server never retries a request,
  so a send that reached a core is never sent again elsewhere. An open stream
  ends when its core stops, and the client reconnects with its cursor; log ids
  are the account's, so the cursor means the same thing on the other machine.
- The two builds share the contract, so nothing in saya changes; keys one build
  adds (`typeCode`) are ignored by the other's readers.

## The link-preview endpoint

`/unfurl` is optional. It is **not** part of `openapi.json` and never reaches a
core: it fetches the page at a URL that appeared in a message and returns the
few Open Graph fields a card needs. Omit it and the client draws plain links.

```sh
SAYA_UNFURL_PORT=8791 bun server/serve.ts
```

It binds loopback and has no authentication of its own; the site's proxy is what
fronts it, which is why `deploy/Caddyfile.example` routes `/unfurl*` to it rather
than exposing it. Keep it on loopback.

Two properties are not optional if you run it:

- **The address is attacker-chosen.** Whoever wrote the message picked it, and
  the fetch runs from inside your network. `server/guard.ts` refuses non-HTTP
  schemes, credentials in the URL, ports other than 80/443, and every private,
  loopback, link-local, CGNAT, unique-local and v4-mapped address — re-checking
  on **each** redirect hop, because one public answer does not bind the next.
  `tests/server/guard.test.ts` is that boundary's test; read it before changing
  the guard.
- **The browser never contacts the linked site.** Card images are relayed
  through `/unfurl/image`, so the CSP below stays `default-src 'self'`, the
  reader's address is not disclosed to the site, and an `image/svg+xml` answer
  is refused rather than rendered.

Bodies are capped (512 KiB for a page, 2 MiB for an image), the deadline is six
seconds, redirects stop at three, and results are cached in memory for thirty
minutes. Nothing is written to disk.

## Response and log policy

The proxy contract is:

- `/api/*`: `Cache-Control: no-store`.
- Vite hashed files under `/assets/`: `Cache-Control: public, max-age=31536000, immutable`.
- `index.html` and SPA fallbacks: `Cache-Control: no-cache`.
- CSP: `default-src 'self'; connect-src 'self' https://heoooooon.github.io; worker-src 'self'; object-src 'none'; frame-ancestors 'none'`.
  `connect-src` names the theme gallery's origin; see [Theme gallery](#theme-gallery).
  The example also restricts scripts and styles to `'self'`; it permits neither
  inline code nor eval.
- Do not enable access or error logging that records credential headers,
  request bodies, or message text. The example discards Caddy logs by default.
  If operational logs are required, use a reviewed redaction policy that omits
  those fields rather than logging raw requests or upstream errors.

## Theme gallery

The theme sheet's 테마 모음 reads a catalog that lives outside this repository:
[saya-themes](https://github.com/Heoooooon/saya-themes), served from GitHub
Pages. When the sheet opens, the browser fetches
`https://heoooooon.github.io/saya-themes/gallery.json`; when a card is pressed,
it fetches that theme's JSON from the same origin (the client drops any list
entry that points at another origin) and runs it through `parseTheme` like a
pasted theme. GitHub Pages answers with `Access-Control-Allow-Origin: *`, and
no credentials or app data are sent.

- **CSP:** the origin must be in `connect-src`. With `default-src 'self'` and no
  `connect-src`, the browser blocks the fetch and the sheet shows its "could not
  load" line. The Caddyfile example allows `https://heoooooon.github.io`.
- **Card pictures:** a list entry may carry `preview`, a path to an SVG beside
  the catalog, drawn on the card as an `<img>`; the client keeps it only when it
  resolves to the catalog's own origin, so `img-src` must allow that origin too
  (the Caddyfile example's `img-src 'self' https: data:` does). Without a
  usable `preview` the card shows the theme's four colours instead.
- **Another catalog:** build with `VITE_THEME_GALLERY_URL=<url of gallery.json>`
  and put that origin in `connect-src` instead. It is a public address, not a
  secret; never put a token in a `VITE_*` variable.
- **Seasonal entries:** a character in `gallery.json` may set `from` and/or
  `until` to a real `yyyy-MM-dd` date. Both dates are inclusive on the Korean
  calendar (UTC+09:00), regardless of the device's time zone. Missing bounds
  are open; outside-period entries, malformed dates and reversed ranges are
  hidden. This only hides catalog cards, not a theme already saved or applied.
- **No gallery:** leave the origin out of `connect-src`. Nothing else changes;
  pasted and built-in themes keep working.

## Development is not production

`bun run dev` uses Vite's loopback development proxy. It can read
`SAYA_CORE_URL` and `SAYA_CORE_TOKEN` from the process environment, strips
`/api`, and injects the header server-side. It is not part of `dist/` and is not
a production BFF. Production uses the external proxy above; the static client
continues to call relative `/api` paths only.

A successful unauthenticated `GET /health` shows only that the core is alive.
It does not prove the bearer configuration is valid or that authenticated routes
will succeed.

## 문의 모아보기 reply help (optional)

`#/assist` (문의 모아보기) draws up to eight KakaoTalk rooms side by side. It
works without anything below: each room keeps its live wall and its own
composer, whose 보내기 still asks for confirmation before `/api/send`.

Reply help is `/assist` on saya's server, off by default and **not** part of
either messenger contract. When it is on, each room shows what the other person
wants and up to three reply candidates: the browser sends the newest 30 text
messages it already holds for that room to saya's server, which asks an
OpenAI-compatible model for a summary and three candidates, then asks JEV
(`POST <jev.url>/v1/systemone`, one call per room) how well each fits, whether
it sounds like the configured person, and whether it discloses anything. Risky
or off-topic candidates are hidden; if JEV does not answer, no candidate is
shown. A candidate only fills the input box; nothing is sent automatically.

Everything that changes per person is one file, named by `SAYA_ASSIST_CONFIG`
(see `deploy/assist.config.example.json`):

- `user.name`, `user.toneExamples`: whose tone the model writes in and JEV checks.
- `send.prefix`, `send.prefixOn`: text put before a candidate (empty means none;
  the toggle is then disabled).
- `kakaoCore`: where the development proxy finds the KakaoTalk core when
  `SAYA_CORE_URL` is unset. Production still reaches cores by registration.
- `llm.url`, `llm.model`, `llm.keyEnv` (the name of the env variable holding the key).
- `jev.url`, `jev.model`, `jev.keyFile` (a path to a file holding the key).
- `agent` (optional): the person's own assistant, asked before the model.
  `agent.name` is shown on the candidates ("<name> 판단"); `agent.command` is an
  argv run without a shell that reads one request (instructions and the
  transcript) on stdin and prints one JSON object, `{ want, open, candidates }`
  or `{ "need_more": true }`; `agent.timeoutMs` (default 120000) and
  `agent.concurrency` (default 2). The command gets only `PATH`, `HOME`, `USER`,
  `LANG`, `LC_ALL` and `SSH_AUTH_SOCK`, never this server's keys. It must not
  read KakaoTalk itself: the transcript is what saya already holds. A
  `need_more` answer makes the room widen its wall once and ask again with up
  to 120 messages; that answer stands. An agent that fails, times out or
  answers out of shape is replaced by the model for that request, and the
  candidates say "모델 대체". JEV checks the agent's candidates exactly as it
  checks the model's.

`GET /assist` returns `{ enabled, user, prefix, prefixOn, agent }` (the agent's
name or null) and nothing about
addresses or keys. Point the model at one you are allowed to send these
conversations to. Route `/assist` to saya's server after the write rules, as
for `/unfurl`.
