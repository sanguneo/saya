// Generated from contracts/tsuba.openapi.json by bun run contract:generate. Do not edit.
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  function ucs2length(str) {
    const len = str.length;
    let length = 0;
    let pos = 0;
    let value;
    while (pos < len) {
      length++;
      value = str.charCodeAt(pos++);
      if (value >= 55296 && value <= 56319 && pos < len) {
        value = str.charCodeAt(pos);
        if ((value & 64512) === 56320)
          pos++;
      }
    }
    return length;
  }
  exports.default = ucs2length;
  ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
});

// node_modules/ajv-formats/dist/formats.js
var require_formats = __commonJS(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.formatNames = exports.fastFormats = exports.fullFormats = undefined;
  function fmtDef(validate, compare) {
    return { validate, compare };
  }
  exports.fullFormats = {
    date: fmtDef(date, compareDate),
    time: fmtDef(getTime(true), compareTime),
    "date-time": fmtDef(getDateTime(true), compareDateTime),
    "iso-time": fmtDef(getTime(), compareIsoTime),
    "iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex,
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    byte,
    int32: { type: "number", validate: validateInt32 },
    int64: { type: "number", validate: validateInt64 },
    float: { type: "number", validate: validateNumber },
    double: { type: "number", validate: validateNumber },
    password: true,
    binary: true
  };
  exports.fastFormats = {
    ...exports.fullFormats,
    date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
    time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
    "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
    "iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
    "iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  };
  exports.formatNames = Object.keys(exports.fullFormats);
  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
  var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
  var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function date(str) {
    const matches = DATE.exec(str);
    if (!matches)
      return false;
    const year = +matches[1];
    const month = +matches[2];
    const day = +matches[3];
    return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
  }
  function compareDate(d1, d2) {
    if (!(d1 && d2))
      return;
    if (d1 > d2)
      return 1;
    if (d1 < d2)
      return -1;
    return 0;
  }
  var TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function getTime(strictTimeZone) {
    return function time(str) {
      const matches = TIME.exec(str);
      if (!matches)
        return false;
      const hr = +matches[1];
      const min = +matches[2];
      const sec = +matches[3];
      const tz = matches[4];
      const tzSign = matches[5] === "-" ? -1 : 1;
      const tzH = +(matches[6] || 0);
      const tzM = +(matches[7] || 0);
      if (tzH > 23 || tzM > 59 || strictTimeZone && !tz)
        return false;
      if (hr <= 23 && min <= 59 && sec < 60)
        return true;
      const utcMin = min - tzM * tzSign;
      const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
      return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
    };
  }
  function compareTime(s1, s2) {
    if (!(s1 && s2))
      return;
    const t1 = new Date("2020-01-01T" + s1).valueOf();
    const t2 = new Date("2020-01-01T" + s2).valueOf();
    if (!(t1 && t2))
      return;
    return t1 - t2;
  }
  function compareIsoTime(t1, t2) {
    if (!(t1 && t2))
      return;
    const a1 = TIME.exec(t1);
    const a2 = TIME.exec(t2);
    if (!(a1 && a2))
      return;
    t1 = a1[1] + a1[2] + a1[3];
    t2 = a2[1] + a2[2] + a2[3];
    if (t1 > t2)
      return 1;
    if (t1 < t2)
      return -1;
    return 0;
  }
  var DATE_TIME_SEPARATOR = /t|\s/i;
  function getDateTime(strictTimeZone) {
    const time = getTime(strictTimeZone);
    return function date_time(str) {
      const dateTime = str.split(DATE_TIME_SEPARATOR);
      return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1]);
    };
  }
  function compareDateTime(dt1, dt2) {
    if (!(dt1 && dt2))
      return;
    const d1 = new Date(dt1).valueOf();
    const d2 = new Date(dt2).valueOf();
    if (!(d1 && d2))
      return;
    return d1 - d2;
  }
  function compareIsoDateTime(dt1, dt2) {
    if (!(dt1 && dt2))
      return;
    const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
    const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
    const res = compareDate(d1, d2);
    if (res === undefined)
      return;
    return res || compareTime(t1, t2);
  }
  var NOT_URI_FRAGMENT = /\/|:/;
  var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function uri(str) {
    return NOT_URI_FRAGMENT.test(str) && URI.test(str);
  }
  var BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function byte(str) {
    BYTE.lastIndex = 0;
    return BYTE.test(str);
  }
  var MIN_INT32 = -(2 ** 31);
  var MAX_INT32 = 2 ** 31 - 1;
  function validateInt32(value) {
    return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
  }
  function validateInt64(value) {
    return Number.isInteger(value);
  }
  function validateNumber() {
    return true;
  }
  var Z_ANCHOR = /[^\\]\\Z/;
  function regex(str) {
    if (Z_ANCHOR.test(str))
      return false;
    try {
      new RegExp(str);
      return true;
    } catch (e) {
      return false;
    }
  }
});

// contract:validators
var validatePositiveInteger = validate52;
function validate52(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate52.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(typeof data == "number" && (!(data % 1) && !isNaN(data)) && isFinite(data))) {
    validate52.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
    return false;
  }
  if (errors === 0) {
    if (typeof data == "number" && isFinite(data)) {
      if (data < 1 || isNaN(data)) {
        validate52.errors = [{ instancePath, schemaPath: "#/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
        return false;
      }
    }
  }
  validate52.errors = vErrors;
  return errors === 0;
}
validate52.evaluated = { dynamicProps: false, dynamicItems: false };
var validateErrorCode = validate53;
function validate53(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate53.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (typeof data !== "string") {
    validate53.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  validate53.errors = vErrors;
  return errors === 0;
}
validate53.evaluated = { dynamicProps: false, dynamicItems: false };
var validateErrorEnvelope = validate54;
function validate54(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate54.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.error === undefined && (missing0 = "error")) {
        validate54.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== false) {
            validate54.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.error !== undefined) {
            let data1 = data.error;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
                let missing1;
                if (data1.code === undefined && (missing1 = "code") || data1.message === undefined && (missing1 = "message")) {
                  validate54.errors = [{ instancePath: instancePath + "/error", schemaPath: "#/properties/error/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                  return false;
                } else {
                  if (data1.code !== undefined) {
                    const _errs4 = errors;
                    if (!validate53(data1.code, { instancePath: instancePath + "/error/code", parentData: data1, parentDataProperty: "code", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate53.errors : vErrors.concat(validate53.errors);
                      errors = vErrors.length;
                    }
                    var valid1 = _errs4 === errors;
                  } else {
                    var valid1 = true;
                  }
                  if (valid1) {
                    if (data1.message !== undefined) {
                      const _errs5 = errors;
                      if (typeof data1.message !== "string") {
                        validate54.errors = [{ instancePath: instancePath + "/error/message", schemaPath: "#/properties/error/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs5 === errors;
                    } else {
                      var valid1 = true;
                    }
                  }
                }
              } else {
                validate54.errors = [{ instancePath: instancePath + "/error", schemaPath: "#/properties/error/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate54.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate54.errors = vErrors;
  return errors === 0;
}
validate54.evaluated = { props: { ok: true, error: true }, dynamicProps: false, dynamicItems: false };
var validateHealth = validate56;
function validate56(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate56.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok")) {
        validate56.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          if (data.ok !== true) {
            validate56.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
        }
      }
    } else {
      validate56.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate56.errors = vErrors;
  return errors === 0;
}
validate56.evaluated = { props: { ok: true }, dynamicProps: false, dynamicItems: false };
var validateCapabilities = validate57;
var pattern3 = new RegExp("^[a-z][a-z0-9-]*$", "u");
var pattern4 = new RegExp("^[0-9a-f]{16}$", "u");
var func1 = require_ucs2length().default;
function validate59(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate59.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate59.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate59.errors = vErrors;
  return errors === 0;
}
validate59.evaluated = { dynamicProps: false, dynamicItems: false };
function validate61(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate61.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.paging === undefined && (missing0 = "paging") || data.maxLimit === undefined && (missing0 = "maxLimit")) {
        validate61.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.paging !== undefined) {
          const _errs1 = errors;
          if (typeof data.paging !== "string") {
            validate61.errors = [{ instancePath: instancePath + "/paging", schemaPath: "#/properties/paging/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.maxLimit !== undefined) {
            const _errs3 = errors;
            if (!validate52(data.maxLimit, { instancePath: instancePath + "/maxLimit", parentData: data, parentDataProperty: "maxLimit", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate61.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate61.errors = vErrors;
  return errors === 0;
}
validate61.evaluated = { props: { paging: true, maxLimit: true }, dynamicProps: false, dynamicItems: false };
function validate64(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate64.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.resume === undefined && (missing0 = "resume")) {
        validate64.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.resume !== undefined) {
          const _errs1 = errors;
          if (typeof data.resume !== "string") {
            validate64.errors = [{ instancePath: instancePath + "/resume", schemaPath: "#/properties/resume/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.events !== undefined) {
            let data1 = data.events;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (Array.isArray(data1)) {
                var valid1 = true;
                const len0 = data1.length;
                for (let i0 = 0;i0 < len0; i0++) {
                  let data2 = data1[i0];
                  const _errs5 = errors;
                  if (errors === _errs5) {
                    if (typeof data2 === "string") {
                      if (func1(data2) < 1) {
                        validate64.errors = [{ instancePath: instancePath + "/events/" + i0, schemaPath: "#/properties/events/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate64.errors = [{ instancePath: instancePath + "/events/" + i0, schemaPath: "#/properties/events/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid1 = _errs5 === errors;
                  if (!valid1) {
                    break;
                  }
                }
                if (valid1) {
                  let i1 = data1.length;
                  let j0;
                  if (i1 > 1) {
                    const indices0 = {};
                    for (;i1--; ) {
                      let item0 = data1[i1];
                      if (typeof item0 !== "string") {
                        continue;
                      }
                      if (typeof indices0[item0] == "number") {
                        j0 = indices0[item0];
                        validate64.errors = [{ instancePath: instancePath + "/events", schemaPath: "#/properties/events/uniqueItems", keyword: "uniqueItems", params: { i: i1, j: j0 }, message: "must NOT have duplicate items (items ## " + j0 + " and " + i1 + " are identical)" }];
                        return false;
                        break;
                      }
                      indices0[item0] = i1;
                    }
                  }
                }
              } else {
                validate64.errors = [{ instancePath: instancePath + "/events", schemaPath: "#/properties/events/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate64.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate64.errors = vErrors;
  return errors === 0;
}
validate64.evaluated = { props: { resume: true, events: true }, dynamicProps: false, dynamicItems: false };
function validate66(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate66.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.maxLength === undefined && (missing0 = "maxLength") || data.receipt === undefined && (missing0 = "receipt")) {
        validate66.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.maxLength !== undefined) {
          const _errs1 = errors;
          if (!validate52(data.maxLength, { instancePath: instancePath + "/maxLength", parentData: data, parentDataProperty: "maxLength", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.receipt !== undefined) {
            const _errs2 = errors;
            if (typeof data.receipt !== "string") {
              validate66.errors = [{ instancePath: instancePath + "/receipt", schemaPath: "#/properties/receipt/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate66.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate66.errors = vErrors;
  return errors === 0;
}
validate66.evaluated = { props: { maxLength: true, receipt: true }, dynamicProps: false, dynamicItems: false };
function validate69(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate69.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate69.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate69.errors = vErrors;
  return errors === 0;
}
validate69.evaluated = { dynamicProps: false, dynamicItems: false };
function validate71(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate71.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.maxLength === undefined && (missing0 = "maxLength")) {
        validate71.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.maxLength !== undefined) {
          const _errs1 = errors;
          if (!validate52(data.maxLength, { instancePath: instancePath + "/maxLength", parentData: data, parentDataProperty: "maxLength", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.maxAgeSeconds !== undefined) {
            const _errs2 = errors;
            if (!validate52(data.maxAgeSeconds, { instancePath: instancePath + "/maxAgeSeconds", parentData: data, parentDataProperty: "maxAgeSeconds", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate71.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate71.errors = vErrors;
  return errors === 0;
}
validate71.evaluated = { props: { maxLength: true, maxAgeSeconds: true }, dynamicProps: false, dynamicItems: false };
function validate75(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate75.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.forEveryone === undefined && (missing0 = "forEveryone")) {
        validate75.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.forEveryone !== undefined) {
          if (typeof data.forEveryone !== "boolean") {
            validate75.errors = [{ instancePath: instancePath + "/forEveryone", schemaPath: "#/properties/forEveryone/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
            return false;
          }
        }
      }
    } else {
      validate75.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate75.errors = vErrors;
  return errors === 0;
}
validate75.evaluated = { props: { forEveryone: true }, dynamicProps: false, dynamicItems: false };
function validate77(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate77.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate77.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate77.errors = vErrors;
  return errors === 0;
}
validate77.evaluated = { dynamicProps: false, dynamicItems: false };
function validate79(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate79.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.maxPerMessage !== undefined) {
        if (!validate52(data.maxPerMessage, { instancePath: instancePath + "/maxPerMessage", parentData: data, parentDataProperty: "maxPerMessage", rootData, dynamicAnchors })) {
          vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
          errors = vErrors.length;
        }
      }
    } else {
      validate79.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate79.errors = vErrors;
  return errors === 0;
}
validate79.evaluated = { props: { maxPerMessage: true }, dynamicProps: false, dynamicItems: false };
function validate82(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate82.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate82.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate82.errors = vErrors;
  return errors === 0;
}
validate82.evaluated = { dynamicProps: false, dynamicItems: false };
function validate84(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate84.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate84.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate84.errors = vErrors;
  return errors === 0;
}
validate84.evaluated = { dynamicProps: false, dynamicItems: false };
function validate86(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate86.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate86.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate86.errors = vErrors;
  return errors === 0;
}
validate86.evaluated = { dynamicProps: false, dynamicItems: false };
function validate88(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate88.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate88.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate88.errors = vErrors;
  return errors === 0;
}
validate88.evaluated = { dynamicProps: false, dynamicItems: false };
function validate90(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate90.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate90.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate90.errors = vErrors;
  return errors === 0;
}
validate90.evaluated = { dynamicProps: false, dynamicItems: false };
var pattern5 = new RegExp("^[a-z0-9][a-z0-9!#$&^_.+-]*/[a-z0-9][a-z0-9!#$&^_.+-]*$", "u");
function validate92(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate92.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.maxBytes === undefined && (missing0 = "maxBytes") || data.caption === undefined && (missing0 = "caption") || data.receipt === undefined && (missing0 = "receipt")) {
        validate92.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.maxBytes !== undefined) {
          const _errs1 = errors;
          if (!validate52(data.maxBytes, { instancePath: instancePath + "/maxBytes", parentData: data, parentDataProperty: "maxBytes", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.caption !== undefined) {
            const _errs2 = errors;
            if (typeof data.caption !== "boolean") {
              validate92.errors = [{ instancePath: instancePath + "/caption", schemaPath: "#/properties/caption/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.captionMaxLength !== undefined) {
              const _errs4 = errors;
              if (!validate52(data.captionMaxLength, { instancePath: instancePath + "/captionMaxLength", parentData: data, parentDataProperty: "captionMaxLength", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.types !== undefined) {
                let data3 = data.types;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (Array.isArray(data3)) {
                    if (data3.length < 1) {
                      validate92.errors = [{ instancePath: instancePath + "/types", schemaPath: "#/properties/types/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                      return false;
                    } else {
                      var valid1 = true;
                      const len0 = data3.length;
                      for (let i0 = 0;i0 < len0; i0++) {
                        let data4 = data3[i0];
                        const _errs7 = errors;
                        if (errors === _errs7) {
                          if (typeof data4 === "string") {
                            if (!pattern5.test(data4)) {
                              validate92.errors = [{ instancePath: instancePath + "/types/" + i0, schemaPath: "#/properties/types/items/pattern", keyword: "pattern", params: { pattern: "^[a-z0-9][a-z0-9!#$&^_.+-]*/[a-z0-9][a-z0-9!#$&^_.+-]*$" }, message: 'must match pattern "' + "^[a-z0-9][a-z0-9!#$&^_.+-]*/[a-z0-9][a-z0-9!#$&^_.+-]*$" + '"' }];
                              return false;
                            }
                          } else {
                            validate92.errors = [{ instancePath: instancePath + "/types/" + i0, schemaPath: "#/properties/types/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                        var valid1 = _errs7 === errors;
                        if (!valid1) {
                          break;
                        }
                      }
                      if (valid1) {
                        let i1 = data3.length;
                        let j0;
                        if (i1 > 1) {
                          const indices0 = {};
                          for (;i1--; ) {
                            let item0 = data3[i1];
                            if (typeof item0 !== "string") {
                              continue;
                            }
                            if (typeof indices0[item0] == "number") {
                              j0 = indices0[item0];
                              validate92.errors = [{ instancePath: instancePath + "/types", schemaPath: "#/properties/types/uniqueItems", keyword: "uniqueItems", params: { i: i1, j: j0 }, message: "must NOT have duplicate items (items ## " + j0 + " and " + i1 + " are identical)" }];
                              return false;
                              break;
                            }
                            indices0[item0] = i1;
                          }
                        }
                      }
                    }
                  } else {
                    validate92.errors = [{ instancePath: instancePath + "/types", schemaPath: "#/properties/types/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                    return false;
                  }
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.receipt !== undefined) {
                  const _errs9 = errors;
                  if (typeof data.receipt !== "string") {
                    validate92.errors = [{ instancePath: instancePath + "/receipt", schemaPath: "#/properties/receipt/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate92.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate92.errors = vErrors;
  return errors === 0;
}
validate92.evaluated = { props: { maxBytes: true, caption: true, captionMaxLength: true, types: true, receipt: true }, dynamicProps: false, dynamicItems: false };
var pattern6 = new RegExp("^x-[a-z][a-z0-9-]*\\.", "u");
function validate58(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate58.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data["rooms.list"] !== undefined) {
        const _errs1 = errors;
        if (!validate59(data["rooms.list"], { instancePath: instancePath + "/rooms.list", parentData: data, parentDataProperty: "rooms.list", rootData, dynamicAnchors })) {
          vErrors = vErrors === null ? validate59.errors : vErrors.concat(validate59.errors);
          errors = vErrors.length;
        }
        var valid0 = _errs1 === errors;
      } else {
        var valid0 = true;
      }
      if (valid0) {
        if (data["messages.read"] !== undefined) {
          const _errs2 = errors;
          if (!validate61(data["messages.read"], { instancePath: instancePath + "/messages.read", parentData: data, parentDataProperty: "messages.read", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate61.errors : vErrors.concat(validate61.errors);
            errors = vErrors.length;
          }
          var valid0 = _errs2 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data["messages.stream"] !== undefined) {
            const _errs3 = errors;
            if (!validate64(data["messages.stream"], { instancePath: instancePath + "/messages.stream", parentData: data, parentDataProperty: "messages.stream", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate64.errors : vErrors.concat(validate64.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data["messages.send"] !== undefined) {
              const _errs4 = errors;
              if (!validate66(data["messages.send"], { instancePath: instancePath + "/messages.send", parentData: data, parentDataProperty: "messages.send", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate66.errors : vErrors.concat(validate66.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data["messages.reply"] !== undefined) {
                const _errs5 = errors;
                if (!validate69(data["messages.reply"], { instancePath: instancePath + "/messages.reply", parentData: data, parentDataProperty: "messages.reply", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate69.errors : vErrors.concat(validate69.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data["messages.edit"] !== undefined) {
                  const _errs6 = errors;
                  if (!validate71(data["messages.edit"], { instancePath: instancePath + "/messages.edit", parentData: data, parentDataProperty: "messages.edit", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
                    errors = vErrors.length;
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data["messages.delete"] !== undefined) {
                    const _errs7 = errors;
                    if (!validate75(data["messages.delete"], { instancePath: instancePath + "/messages.delete", parentData: data, parentDataProperty: "messages.delete", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate75.errors : vErrors.concat(validate75.errors);
                      errors = vErrors.length;
                    }
                    var valid0 = _errs7 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data["reactions.read"] !== undefined) {
                      const _errs8 = errors;
                      if (!validate77(data["reactions.read"], { instancePath: instancePath + "/reactions.read", parentData: data, parentDataProperty: "reactions.read", rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
                        errors = vErrors.length;
                      }
                      var valid0 = _errs8 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data["reactions.send"] !== undefined) {
                        const _errs9 = errors;
                        if (!validate79(data["reactions.send"], { instancePath: instancePath + "/reactions.send", parentData: data, parentDataProperty: "reactions.send", rootData, dynamicAnchors })) {
                          vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
                          errors = vErrors.length;
                        }
                        var valid0 = _errs9 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data["read.mark"] !== undefined) {
                          const _errs10 = errors;
                          if (!validate82(data["read.mark"], { instancePath: instancePath + "/read.mark", parentData: data, parentDataProperty: "read.mark", rootData, dynamicAnchors })) {
                            vErrors = vErrors === null ? validate82.errors : vErrors.concat(validate82.errors);
                            errors = vErrors.length;
                          }
                          var valid0 = _errs10 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data["typing.send"] !== undefined) {
                            const _errs11 = errors;
                            if (!validate84(data["typing.send"], { instancePath: instancePath + "/typing.send", parentData: data, parentDataProperty: "typing.send", rootData, dynamicAnchors })) {
                              vErrors = vErrors === null ? validate84.errors : vErrors.concat(validate84.errors);
                              errors = vErrors.length;
                            }
                            var valid0 = _errs11 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data["threads.read"] !== undefined) {
                              const _errs12 = errors;
                              if (!validate86(data["threads.read"], { instancePath: instancePath + "/threads.read", parentData: data, parentDataProperty: "threads.read", rootData, dynamicAnchors })) {
                                vErrors = vErrors === null ? validate86.errors : vErrors.concat(validate86.errors);
                                errors = vErrors.length;
                              }
                              var valid0 = _errs12 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data["attachments.read"] !== undefined) {
                                const _errs13 = errors;
                                if (!validate88(data["attachments.read"], { instancePath: instancePath + "/attachments.read", parentData: data, parentDataProperty: "attachments.read", rootData, dynamicAnchors })) {
                                  vErrors = vErrors === null ? validate88.errors : vErrors.concat(validate88.errors);
                                  errors = vErrors.length;
                                }
                                var valid0 = _errs13 === errors;
                              } else {
                                var valid0 = true;
                              }
                              if (valid0) {
                                if (data["avatars.read"] !== undefined) {
                                  const _errs14 = errors;
                                  if (!validate90(data["avatars.read"], { instancePath: instancePath + "/avatars.read", parentData: data, parentDataProperty: "avatars.read", rootData, dynamicAnchors })) {
                                    vErrors = vErrors === null ? validate90.errors : vErrors.concat(validate90.errors);
                                    errors = vErrors.length;
                                  }
                                  var valid0 = _errs14 === errors;
                                } else {
                                  var valid0 = true;
                                }
                                if (valid0) {
                                  if (data["attachments.send"] !== undefined) {
                                    const _errs15 = errors;
                                    if (!validate92(data["attachments.send"], { instancePath: instancePath + "/attachments.send", parentData: data, parentDataProperty: "attachments.send", rootData, dynamicAnchors })) {
                                      vErrors = vErrors === null ? validate92.errors : vErrors.concat(validate92.errors);
                                      errors = vErrors.length;
                                    }
                                    var valid0 = _errs15 === errors;
                                  } else {
                                    var valid0 = true;
                                  }
                                  if (valid0) {
                                    var props0 = {};
                                    props0["rooms.list"] = true;
                                    props0["messages.read"] = true;
                                    props0["messages.stream"] = true;
                                    props0["messages.send"] = true;
                                    props0["messages.reply"] = true;
                                    props0["messages.edit"] = true;
                                    props0["messages.delete"] = true;
                                    props0["reactions.read"] = true;
                                    props0["reactions.send"] = true;
                                    props0["read.mark"] = true;
                                    props0["typing.send"] = true;
                                    props0["threads.read"] = true;
                                    props0["attachments.read"] = true;
                                    props0["avatars.read"] = true;
                                    props0["attachments.send"] = true;
                                    for (const key0 in data) {
                                      if (pattern6.test(key0)) {
                                        let data15 = data[key0];
                                        if (!(data15 && typeof data15 == "object" && !Array.isArray(data15))) {
                                          validate58.errors = [{ instancePath: instancePath + "/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/patternProperties/%5Ex-%5Ba-z%5D%5Ba-z0-9-%5D*%5C./type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                                          return false;
                                        }
                                        props0[key0] = true;
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate58.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate58.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate58.evaluated = { dynamicProps: true, dynamicItems: false };
function validate57(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate57.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.contract === undefined && (missing0 = "contract") || data.adapter === undefined && (missing0 = "adapter") || data.provider === undefined && (missing0 = "provider") || data.account === undefined && (missing0 = "account") || data.revision === undefined && (missing0 = "revision") || data.features === undefined && (missing0 = "features")) {
        validate57.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate57.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.contract !== undefined) {
            let data1 = data.contract;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
                let missing1;
                if (data1.version === undefined && (missing1 = "version")) {
                  validate57.errors = [{ instancePath: instancePath + "/contract", schemaPath: "#/properties/contract/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                  return false;
                } else {
                  if (data1.version !== undefined) {
                    if (typeof data1.version !== "string") {
                      validate57.errors = [{ instancePath: instancePath + "/contract/version", schemaPath: "#/properties/contract/properties/version/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                }
              } else {
                validate57.errors = [{ instancePath: instancePath + "/contract", schemaPath: "#/properties/contract/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.adapter !== undefined) {
              let data3 = data.adapter;
              const _errs6 = errors;
              if (errors === _errs6) {
                if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
                  let missing2;
                  if (data3.name === undefined && (missing2 = "name") || data3.version === undefined && (missing2 = "version")) {
                    validate57.errors = [{ instancePath: instancePath + "/adapter", schemaPath: "#/properties/adapter/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" }];
                    return false;
                  } else {
                    if (data3.name !== undefined) {
                      const _errs8 = errors;
                      if (typeof data3.name !== "string") {
                        validate57.errors = [{ instancePath: instancePath + "/adapter/name", schemaPath: "#/properties/adapter/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid2 = _errs8 === errors;
                    } else {
                      var valid2 = true;
                    }
                    if (valid2) {
                      if (data3.version !== undefined) {
                        const _errs10 = errors;
                        if (typeof data3.version !== "string") {
                          validate57.errors = [{ instancePath: instancePath + "/adapter/version", schemaPath: "#/properties/adapter/properties/version/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                        var valid2 = _errs10 === errors;
                      } else {
                        var valid2 = true;
                      }
                    }
                  }
                } else {
                  validate57.errors = [{ instancePath: instancePath + "/adapter", schemaPath: "#/properties/adapter/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                  return false;
                }
              }
              var valid0 = _errs6 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.provider !== undefined) {
                let data6 = data.provider;
                const _errs12 = errors;
                if (errors === _errs12) {
                  if (data6 && typeof data6 == "object" && !Array.isArray(data6)) {
                    let missing3;
                    if (data6.id === undefined && (missing3 = "id") || data6.name === undefined && (missing3 = "name")) {
                      validate57.errors = [{ instancePath: instancePath + "/provider", schemaPath: "#/properties/provider/required", keyword: "required", params: { missingProperty: missing3 }, message: "must have required property '" + missing3 + "'" }];
                      return false;
                    } else {
                      if (data6.id !== undefined) {
                        let data7 = data6.id;
                        const _errs14 = errors;
                        if (errors === _errs14) {
                          if (typeof data7 === "string") {
                            if (!pattern3.test(data7)) {
                              validate57.errors = [{ instancePath: instancePath + "/provider/id", schemaPath: "#/properties/provider/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9-]*$" }, message: 'must match pattern "' + "^[a-z][a-z0-9-]*$" + '"' }];
                              return false;
                            }
                          } else {
                            validate57.errors = [{ instancePath: instancePath + "/provider/id", schemaPath: "#/properties/provider/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                        var valid3 = _errs14 === errors;
                      } else {
                        var valid3 = true;
                      }
                      if (valid3) {
                        if (data6.name !== undefined) {
                          const _errs16 = errors;
                          if (typeof data6.name !== "string") {
                            validate57.errors = [{ instancePath: instancePath + "/provider/name", schemaPath: "#/properties/provider/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                          var valid3 = _errs16 === errors;
                        } else {
                          var valid3 = true;
                        }
                        if (valid3) {
                          if (data6.icon !== undefined) {
                            let data9 = data6.icon;
                            const _errs18 = errors;
                            if (errors === _errs18) {
                              if (typeof data9 === "string") {
                                if (func1(data9) > 64) {
                                  validate57.errors = [{ instancePath: instancePath + "/provider/icon", schemaPath: "#/properties/provider/properties/icon/maxLength", keyword: "maxLength", params: { limit: 64 }, message: "must NOT have more than 64 characters" }];
                                  return false;
                                } else {
                                  if (func1(data9) < 1) {
                                    validate57.errors = [{ instancePath: instancePath + "/provider/icon", schemaPath: "#/properties/provider/properties/icon/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate57.errors = [{ instancePath: instancePath + "/provider/icon", schemaPath: "#/properties/provider/properties/icon/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid3 = _errs18 === errors;
                          } else {
                            var valid3 = true;
                          }
                        }
                      }
                    }
                  } else {
                    validate57.errors = [{ instancePath: instancePath + "/provider", schemaPath: "#/properties/provider/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs12 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.account !== undefined) {
                  let data10 = data.account;
                  const _errs20 = errors;
                  if (errors === _errs20) {
                    if (data10 && typeof data10 == "object" && !Array.isArray(data10)) {
                      let missing4;
                      if (data10.kind === undefined && (missing4 = "kind")) {
                        validate57.errors = [{ instancePath: instancePath + "/account", schemaPath: "#/properties/account/required", keyword: "required", params: { missingProperty: missing4 }, message: "must have required property '" + missing4 + "'" }];
                        return false;
                      } else {
                        if (data10.kind !== undefined) {
                          if (typeof data10.kind !== "string") {
                            validate57.errors = [{ instancePath: instancePath + "/account/kind", schemaPath: "#/properties/account/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                      }
                    } else {
                      validate57.errors = [{ instancePath: instancePath + "/account", schemaPath: "#/properties/account/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                      return false;
                    }
                  }
                  var valid0 = _errs20 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.revision !== undefined) {
                    let data12 = data.revision;
                    const _errs24 = errors;
                    if (errors === _errs24) {
                      if (typeof data12 === "string") {
                        if (!pattern4.test(data12)) {
                          validate57.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/pattern", keyword: "pattern", params: { pattern: "^[0-9a-f]{16}$" }, message: 'must match pattern "' + "^[0-9a-f]{16}$" + '"' }];
                          return false;
                        }
                      } else {
                        validate57.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                    }
                    var valid0 = _errs24 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.features !== undefined) {
                      const _errs26 = errors;
                      if (!validate58(data.features, { instancePath: instancePath + "/features", parentData: data, parentDataProperty: "features", rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate58.errors : vErrors.concat(validate58.errors);
                        errors = vErrors.length;
                      }
                      var valid0 = _errs26 === errors;
                    } else {
                      var valid0 = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate57.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate57.errors = vErrors;
  return errors === 0;
}
validate57.evaluated = { props: { ok: true, contract: true, adapter: true, provider: true, account: true, revision: true, features: true }, dynamicProps: false, dynamicItems: false };
var validateFeatures = validate58;
var validateFeatureRoomsList = validate59;
var validateFeatureMessagesRead = validate61;
var validateFeatureMessagesStream = validate64;
var validateFeatureMessagesSend = validate66;
var validateFeatureMessagesReply = validate69;
var validateFeatureMessagesEdit = validate71;
var validateFeatureMessagesDelete = validate75;
var validateFeatureReactionsRead = validate77;
var validateFeatureReactionsSend = validate79;
var validateFeatureReadMark = validate82;
var validateFeatureTypingSend = validate84;
var validateFeatureThreadsRead = validate86;
var validateFeatureAttachmentsRead = validate88;
var validateFeatureAvatarsRead = validate90;
var validateFeatureAttachmentsSend = validate92;
var validateRoomFeatures = validate97;
function validate97(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate97.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data["rooms.list"] !== undefined) {
        let data0 = data["rooms.list"];
        const _errs1 = errors;
        const _errs2 = errors;
        let valid1 = false;
        const _errs3 = errors;
        if (data0 !== false) {
          const err0 = { instancePath: instancePath + "/rooms.list", schemaPath: "#/properties/rooms.list/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
        var _valid0 = _errs3 === errors;
        valid1 = valid1 || _valid0;
        const _errs4 = errors;
        if (!validate59(data0, { instancePath: instancePath + "/rooms.list", parentData: data, parentDataProperty: "rooms.list", rootData, dynamicAnchors })) {
          vErrors = vErrors === null ? validate59.errors : vErrors.concat(validate59.errors);
          errors = vErrors.length;
        }
        var _valid0 = _errs4 === errors;
        valid1 = valid1 || _valid0;
        if (!valid1) {
          const err1 = { instancePath: instancePath + "/rooms.list", schemaPath: "#/properties/rooms.list/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
          validate97.errors = vErrors;
          return false;
        } else {
          errors = _errs2;
          if (vErrors !== null) {
            if (_errs2) {
              vErrors.length = _errs2;
            } else {
              vErrors = null;
            }
          }
        }
        var valid0 = _errs1 === errors;
      } else {
        var valid0 = true;
      }
      if (valid0) {
        if (data["messages.read"] !== undefined) {
          let data1 = data["messages.read"];
          const _errs5 = errors;
          const _errs6 = errors;
          let valid2 = false;
          const _errs7 = errors;
          if (data1 !== false) {
            const err2 = { instancePath: instancePath + "/messages.read", schemaPath: "#/properties/messages.read/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
            if (vErrors === null) {
              vErrors = [err2];
            } else {
              vErrors.push(err2);
            }
            errors++;
          }
          var _valid1 = _errs7 === errors;
          valid2 = valid2 || _valid1;
          const _errs8 = errors;
          if (!validate61(data1, { instancePath: instancePath + "/messages.read", parentData: data, parentDataProperty: "messages.read", rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate61.errors : vErrors.concat(validate61.errors);
            errors = vErrors.length;
          }
          var _valid1 = _errs8 === errors;
          valid2 = valid2 || _valid1;
          if (_valid1) {
            var props0 = {};
            props0.paging = true;
            props0.maxLimit = true;
          }
          if (!valid2) {
            const err3 = { instancePath: instancePath + "/messages.read", schemaPath: "#/properties/messages.read/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
            if (vErrors === null) {
              vErrors = [err3];
            } else {
              vErrors.push(err3);
            }
            errors++;
            validate97.errors = vErrors;
            return false;
          } else {
            errors = _errs6;
            if (vErrors !== null) {
              if (_errs6) {
                vErrors.length = _errs6;
              } else {
                vErrors = null;
              }
            }
          }
          var valid0 = _errs5 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data["messages.stream"] !== undefined) {
            let data2 = data["messages.stream"];
            const _errs9 = errors;
            const _errs10 = errors;
            let valid3 = false;
            const _errs11 = errors;
            if (data2 !== false) {
              const err4 = { instancePath: instancePath + "/messages.stream", schemaPath: "#/properties/messages.stream/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            var _valid2 = _errs11 === errors;
            valid3 = valid3 || _valid2;
            const _errs12 = errors;
            if (!validate64(data2, { instancePath: instancePath + "/messages.stream", parentData: data, parentDataProperty: "messages.stream", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate64.errors : vErrors.concat(validate64.errors);
              errors = vErrors.length;
            }
            var _valid2 = _errs12 === errors;
            valid3 = valid3 || _valid2;
            if (_valid2) {
              var props1 = {};
              props1.resume = true;
              props1.events = true;
            }
            if (!valid3) {
              const err5 = { instancePath: instancePath + "/messages.stream", schemaPath: "#/properties/messages.stream/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
              validate97.errors = vErrors;
              return false;
            } else {
              errors = _errs10;
              if (vErrors !== null) {
                if (_errs10) {
                  vErrors.length = _errs10;
                } else {
                  vErrors = null;
                }
              }
            }
            var valid0 = _errs9 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data["messages.send"] !== undefined) {
              let data3 = data["messages.send"];
              const _errs13 = errors;
              const _errs14 = errors;
              let valid4 = false;
              const _errs15 = errors;
              if (data3 !== false) {
                const err6 = { instancePath: instancePath + "/messages.send", schemaPath: "#/properties/messages.send/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
              var _valid3 = _errs15 === errors;
              valid4 = valid4 || _valid3;
              const _errs16 = errors;
              if (!validate66(data3, { instancePath: instancePath + "/messages.send", parentData: data, parentDataProperty: "messages.send", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate66.errors : vErrors.concat(validate66.errors);
                errors = vErrors.length;
              }
              var _valid3 = _errs16 === errors;
              valid4 = valid4 || _valid3;
              if (_valid3) {
                var props2 = {};
                props2.maxLength = true;
                props2.receipt = true;
              }
              if (!valid4) {
                const err7 = { instancePath: instancePath + "/messages.send", schemaPath: "#/properties/messages.send/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
                validate97.errors = vErrors;
                return false;
              } else {
                errors = _errs14;
                if (vErrors !== null) {
                  if (_errs14) {
                    vErrors.length = _errs14;
                  } else {
                    vErrors = null;
                  }
                }
              }
              var valid0 = _errs13 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data["messages.reply"] !== undefined) {
                let data4 = data["messages.reply"];
                const _errs17 = errors;
                const _errs18 = errors;
                let valid5 = false;
                const _errs19 = errors;
                if (data4 !== false) {
                  const err8 = { instancePath: instancePath + "/messages.reply", schemaPath: "#/properties/messages.reply/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
                var _valid4 = _errs19 === errors;
                valid5 = valid5 || _valid4;
                const _errs20 = errors;
                if (!validate69(data4, { instancePath: instancePath + "/messages.reply", parentData: data, parentDataProperty: "messages.reply", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate69.errors : vErrors.concat(validate69.errors);
                  errors = vErrors.length;
                }
                var _valid4 = _errs20 === errors;
                valid5 = valid5 || _valid4;
                if (!valid5) {
                  const err9 = { instancePath: instancePath + "/messages.reply", schemaPath: "#/properties/messages.reply/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                  if (vErrors === null) {
                    vErrors = [err9];
                  } else {
                    vErrors.push(err9);
                  }
                  errors++;
                  validate97.errors = vErrors;
                  return false;
                } else {
                  errors = _errs18;
                  if (vErrors !== null) {
                    if (_errs18) {
                      vErrors.length = _errs18;
                    } else {
                      vErrors = null;
                    }
                  }
                }
                var valid0 = _errs17 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data["messages.edit"] !== undefined) {
                  let data5 = data["messages.edit"];
                  const _errs21 = errors;
                  const _errs22 = errors;
                  let valid6 = false;
                  const _errs23 = errors;
                  if (data5 !== false) {
                    const err10 = { instancePath: instancePath + "/messages.edit", schemaPath: "#/properties/messages.edit/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                    if (vErrors === null) {
                      vErrors = [err10];
                    } else {
                      vErrors.push(err10);
                    }
                    errors++;
                  }
                  var _valid5 = _errs23 === errors;
                  valid6 = valid6 || _valid5;
                  const _errs24 = errors;
                  if (!validate71(data5, { instancePath: instancePath + "/messages.edit", parentData: data, parentDataProperty: "messages.edit", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
                    errors = vErrors.length;
                  }
                  var _valid5 = _errs24 === errors;
                  valid6 = valid6 || _valid5;
                  if (_valid5) {
                    var props3 = {};
                    props3.maxLength = true;
                    props3.maxAgeSeconds = true;
                  }
                  if (!valid6) {
                    const err11 = { instancePath: instancePath + "/messages.edit", schemaPath: "#/properties/messages.edit/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                    if (vErrors === null) {
                      vErrors = [err11];
                    } else {
                      vErrors.push(err11);
                    }
                    errors++;
                    validate97.errors = vErrors;
                    return false;
                  } else {
                    errors = _errs22;
                    if (vErrors !== null) {
                      if (_errs22) {
                        vErrors.length = _errs22;
                      } else {
                        vErrors = null;
                      }
                    }
                  }
                  var valid0 = _errs21 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data["messages.delete"] !== undefined) {
                    let data6 = data["messages.delete"];
                    const _errs25 = errors;
                    const _errs26 = errors;
                    let valid7 = false;
                    const _errs27 = errors;
                    if (data6 !== false) {
                      const err12 = { instancePath: instancePath + "/messages.delete", schemaPath: "#/properties/messages.delete/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                      if (vErrors === null) {
                        vErrors = [err12];
                      } else {
                        vErrors.push(err12);
                      }
                      errors++;
                    }
                    var _valid6 = _errs27 === errors;
                    valid7 = valid7 || _valid6;
                    const _errs28 = errors;
                    if (!validate75(data6, { instancePath: instancePath + "/messages.delete", parentData: data, parentDataProperty: "messages.delete", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate75.errors : vErrors.concat(validate75.errors);
                      errors = vErrors.length;
                    }
                    var _valid6 = _errs28 === errors;
                    valid7 = valid7 || _valid6;
                    if (_valid6) {
                      var props4 = {};
                      props4.forEveryone = true;
                    }
                    if (!valid7) {
                      const err13 = { instancePath: instancePath + "/messages.delete", schemaPath: "#/properties/messages.delete/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                      if (vErrors === null) {
                        vErrors = [err13];
                      } else {
                        vErrors.push(err13);
                      }
                      errors++;
                      validate97.errors = vErrors;
                      return false;
                    } else {
                      errors = _errs26;
                      if (vErrors !== null) {
                        if (_errs26) {
                          vErrors.length = _errs26;
                        } else {
                          vErrors = null;
                        }
                      }
                    }
                    var valid0 = _errs25 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data["reactions.read"] !== undefined) {
                      let data7 = data["reactions.read"];
                      const _errs29 = errors;
                      const _errs30 = errors;
                      let valid8 = false;
                      const _errs31 = errors;
                      if (data7 !== false) {
                        const err14 = { instancePath: instancePath + "/reactions.read", schemaPath: "#/properties/reactions.read/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                        if (vErrors === null) {
                          vErrors = [err14];
                        } else {
                          vErrors.push(err14);
                        }
                        errors++;
                      }
                      var _valid7 = _errs31 === errors;
                      valid8 = valid8 || _valid7;
                      const _errs32 = errors;
                      if (!validate77(data7, { instancePath: instancePath + "/reactions.read", parentData: data, parentDataProperty: "reactions.read", rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
                        errors = vErrors.length;
                      }
                      var _valid7 = _errs32 === errors;
                      valid8 = valid8 || _valid7;
                      if (!valid8) {
                        const err15 = { instancePath: instancePath + "/reactions.read", schemaPath: "#/properties/reactions.read/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                        if (vErrors === null) {
                          vErrors = [err15];
                        } else {
                          vErrors.push(err15);
                        }
                        errors++;
                        validate97.errors = vErrors;
                        return false;
                      } else {
                        errors = _errs30;
                        if (vErrors !== null) {
                          if (_errs30) {
                            vErrors.length = _errs30;
                          } else {
                            vErrors = null;
                          }
                        }
                      }
                      var valid0 = _errs29 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data["reactions.send"] !== undefined) {
                        let data8 = data["reactions.send"];
                        const _errs33 = errors;
                        const _errs34 = errors;
                        let valid9 = false;
                        const _errs35 = errors;
                        if (data8 !== false) {
                          const err16 = { instancePath: instancePath + "/reactions.send", schemaPath: "#/properties/reactions.send/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                          if (vErrors === null) {
                            vErrors = [err16];
                          } else {
                            vErrors.push(err16);
                          }
                          errors++;
                        }
                        var _valid8 = _errs35 === errors;
                        valid9 = valid9 || _valid8;
                        const _errs36 = errors;
                        if (!validate79(data8, { instancePath: instancePath + "/reactions.send", parentData: data, parentDataProperty: "reactions.send", rootData, dynamicAnchors })) {
                          vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
                          errors = vErrors.length;
                        }
                        var _valid8 = _errs36 === errors;
                        valid9 = valid9 || _valid8;
                        if (_valid8) {
                          var props5 = {};
                          props5.maxPerMessage = true;
                        }
                        if (!valid9) {
                          const err17 = { instancePath: instancePath + "/reactions.send", schemaPath: "#/properties/reactions.send/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                          if (vErrors === null) {
                            vErrors = [err17];
                          } else {
                            vErrors.push(err17);
                          }
                          errors++;
                          validate97.errors = vErrors;
                          return false;
                        } else {
                          errors = _errs34;
                          if (vErrors !== null) {
                            if (_errs34) {
                              vErrors.length = _errs34;
                            } else {
                              vErrors = null;
                            }
                          }
                        }
                        var valid0 = _errs33 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data["read.mark"] !== undefined) {
                          let data9 = data["read.mark"];
                          const _errs37 = errors;
                          const _errs38 = errors;
                          let valid10 = false;
                          const _errs39 = errors;
                          if (data9 !== false) {
                            const err18 = { instancePath: instancePath + "/read.mark", schemaPath: "#/properties/read.mark/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                            if (vErrors === null) {
                              vErrors = [err18];
                            } else {
                              vErrors.push(err18);
                            }
                            errors++;
                          }
                          var _valid9 = _errs39 === errors;
                          valid10 = valid10 || _valid9;
                          const _errs40 = errors;
                          if (!validate82(data9, { instancePath: instancePath + "/read.mark", parentData: data, parentDataProperty: "read.mark", rootData, dynamicAnchors })) {
                            vErrors = vErrors === null ? validate82.errors : vErrors.concat(validate82.errors);
                            errors = vErrors.length;
                          }
                          var _valid9 = _errs40 === errors;
                          valid10 = valid10 || _valid9;
                          if (!valid10) {
                            const err19 = { instancePath: instancePath + "/read.mark", schemaPath: "#/properties/read.mark/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                            if (vErrors === null) {
                              vErrors = [err19];
                            } else {
                              vErrors.push(err19);
                            }
                            errors++;
                            validate97.errors = vErrors;
                            return false;
                          } else {
                            errors = _errs38;
                            if (vErrors !== null) {
                              if (_errs38) {
                                vErrors.length = _errs38;
                              } else {
                                vErrors = null;
                              }
                            }
                          }
                          var valid0 = _errs37 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data["typing.send"] !== undefined) {
                            let data10 = data["typing.send"];
                            const _errs41 = errors;
                            const _errs42 = errors;
                            let valid11 = false;
                            const _errs43 = errors;
                            if (data10 !== false) {
                              const err20 = { instancePath: instancePath + "/typing.send", schemaPath: "#/properties/typing.send/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                              if (vErrors === null) {
                                vErrors = [err20];
                              } else {
                                vErrors.push(err20);
                              }
                              errors++;
                            }
                            var _valid10 = _errs43 === errors;
                            valid11 = valid11 || _valid10;
                            const _errs44 = errors;
                            if (!validate84(data10, { instancePath: instancePath + "/typing.send", parentData: data, parentDataProperty: "typing.send", rootData, dynamicAnchors })) {
                              vErrors = vErrors === null ? validate84.errors : vErrors.concat(validate84.errors);
                              errors = vErrors.length;
                            }
                            var _valid10 = _errs44 === errors;
                            valid11 = valid11 || _valid10;
                            if (!valid11) {
                              const err21 = { instancePath: instancePath + "/typing.send", schemaPath: "#/properties/typing.send/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                              if (vErrors === null) {
                                vErrors = [err21];
                              } else {
                                vErrors.push(err21);
                              }
                              errors++;
                              validate97.errors = vErrors;
                              return false;
                            } else {
                              errors = _errs42;
                              if (vErrors !== null) {
                                if (_errs42) {
                                  vErrors.length = _errs42;
                                } else {
                                  vErrors = null;
                                }
                              }
                            }
                            var valid0 = _errs41 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data["threads.read"] !== undefined) {
                              let data11 = data["threads.read"];
                              const _errs45 = errors;
                              const _errs46 = errors;
                              let valid12 = false;
                              const _errs47 = errors;
                              if (data11 !== false) {
                                const err22 = { instancePath: instancePath + "/threads.read", schemaPath: "#/properties/threads.read/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                                if (vErrors === null) {
                                  vErrors = [err22];
                                } else {
                                  vErrors.push(err22);
                                }
                                errors++;
                              }
                              var _valid11 = _errs47 === errors;
                              valid12 = valid12 || _valid11;
                              const _errs48 = errors;
                              if (!validate86(data11, { instancePath: instancePath + "/threads.read", parentData: data, parentDataProperty: "threads.read", rootData, dynamicAnchors })) {
                                vErrors = vErrors === null ? validate86.errors : vErrors.concat(validate86.errors);
                                errors = vErrors.length;
                              }
                              var _valid11 = _errs48 === errors;
                              valid12 = valid12 || _valid11;
                              if (!valid12) {
                                const err23 = { instancePath: instancePath + "/threads.read", schemaPath: "#/properties/threads.read/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                if (vErrors === null) {
                                  vErrors = [err23];
                                } else {
                                  vErrors.push(err23);
                                }
                                errors++;
                                validate97.errors = vErrors;
                                return false;
                              } else {
                                errors = _errs46;
                                if (vErrors !== null) {
                                  if (_errs46) {
                                    vErrors.length = _errs46;
                                  } else {
                                    vErrors = null;
                                  }
                                }
                              }
                              var valid0 = _errs45 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data["attachments.read"] !== undefined) {
                                let data12 = data["attachments.read"];
                                const _errs49 = errors;
                                const _errs50 = errors;
                                let valid13 = false;
                                const _errs51 = errors;
                                if (data12 !== false) {
                                  const err24 = { instancePath: instancePath + "/attachments.read", schemaPath: "#/properties/attachments.read/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                                  if (vErrors === null) {
                                    vErrors = [err24];
                                  } else {
                                    vErrors.push(err24);
                                  }
                                  errors++;
                                }
                                var _valid12 = _errs51 === errors;
                                valid13 = valid13 || _valid12;
                                const _errs52 = errors;
                                if (!validate88(data12, { instancePath: instancePath + "/attachments.read", parentData: data, parentDataProperty: "attachments.read", rootData, dynamicAnchors })) {
                                  vErrors = vErrors === null ? validate88.errors : vErrors.concat(validate88.errors);
                                  errors = vErrors.length;
                                }
                                var _valid12 = _errs52 === errors;
                                valid13 = valid13 || _valid12;
                                if (!valid13) {
                                  const err25 = { instancePath: instancePath + "/attachments.read", schemaPath: "#/properties/attachments.read/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                  if (vErrors === null) {
                                    vErrors = [err25];
                                  } else {
                                    vErrors.push(err25);
                                  }
                                  errors++;
                                  validate97.errors = vErrors;
                                  return false;
                                } else {
                                  errors = _errs50;
                                  if (vErrors !== null) {
                                    if (_errs50) {
                                      vErrors.length = _errs50;
                                    } else {
                                      vErrors = null;
                                    }
                                  }
                                }
                                var valid0 = _errs49 === errors;
                              } else {
                                var valid0 = true;
                              }
                              if (valid0) {
                                if (data["avatars.read"] !== undefined) {
                                  let data13 = data["avatars.read"];
                                  const _errs53 = errors;
                                  const _errs54 = errors;
                                  let valid14 = false;
                                  const _errs55 = errors;
                                  if (data13 !== false) {
                                    const err26 = { instancePath: instancePath + "/avatars.read", schemaPath: "#/properties/avatars.read/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                                    if (vErrors === null) {
                                      vErrors = [err26];
                                    } else {
                                      vErrors.push(err26);
                                    }
                                    errors++;
                                  }
                                  var _valid13 = _errs55 === errors;
                                  valid14 = valid14 || _valid13;
                                  const _errs56 = errors;
                                  if (!validate90(data13, { instancePath: instancePath + "/avatars.read", parentData: data, parentDataProperty: "avatars.read", rootData, dynamicAnchors })) {
                                    vErrors = vErrors === null ? validate90.errors : vErrors.concat(validate90.errors);
                                    errors = vErrors.length;
                                  }
                                  var _valid13 = _errs56 === errors;
                                  valid14 = valid14 || _valid13;
                                  if (!valid14) {
                                    const err27 = { instancePath: instancePath + "/avatars.read", schemaPath: "#/properties/avatars.read/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                    if (vErrors === null) {
                                      vErrors = [err27];
                                    } else {
                                      vErrors.push(err27);
                                    }
                                    errors++;
                                    validate97.errors = vErrors;
                                    return false;
                                  } else {
                                    errors = _errs54;
                                    if (vErrors !== null) {
                                      if (_errs54) {
                                        vErrors.length = _errs54;
                                      } else {
                                        vErrors = null;
                                      }
                                    }
                                  }
                                  var valid0 = _errs53 === errors;
                                } else {
                                  var valid0 = true;
                                }
                                if (valid0) {
                                  if (data["attachments.send"] !== undefined) {
                                    let data14 = data["attachments.send"];
                                    const _errs57 = errors;
                                    const _errs58 = errors;
                                    let valid15 = false;
                                    const _errs59 = errors;
                                    if (data14 !== false) {
                                      const err28 = { instancePath: instancePath + "/attachments.send", schemaPath: "#/properties/attachments.send/anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                                      if (vErrors === null) {
                                        vErrors = [err28];
                                      } else {
                                        vErrors.push(err28);
                                      }
                                      errors++;
                                    }
                                    var _valid14 = _errs59 === errors;
                                    valid15 = valid15 || _valid14;
                                    const _errs60 = errors;
                                    if (!validate92(data14, { instancePath: instancePath + "/attachments.send", parentData: data, parentDataProperty: "attachments.send", rootData, dynamicAnchors })) {
                                      vErrors = vErrors === null ? validate92.errors : vErrors.concat(validate92.errors);
                                      errors = vErrors.length;
                                    }
                                    var _valid14 = _errs60 === errors;
                                    valid15 = valid15 || _valid14;
                                    if (_valid14) {
                                      var props6 = {};
                                      props6.maxBytes = true;
                                      props6.caption = true;
                                      props6.captionMaxLength = true;
                                      props6.types = true;
                                      props6.receipt = true;
                                    }
                                    if (!valid15) {
                                      const err29 = { instancePath: instancePath + "/attachments.send", schemaPath: "#/properties/attachments.send/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                      if (vErrors === null) {
                                        vErrors = [err29];
                                      } else {
                                        vErrors.push(err29);
                                      }
                                      errors++;
                                      validate97.errors = vErrors;
                                      return false;
                                    } else {
                                      errors = _errs58;
                                      if (vErrors !== null) {
                                        if (_errs58) {
                                          vErrors.length = _errs58;
                                        } else {
                                          vErrors = null;
                                        }
                                      }
                                    }
                                    var valid0 = _errs57 === errors;
                                  } else {
                                    var valid0 = true;
                                  }
                                  if (valid0) {
                                    var props7 = {};
                                    props7["rooms.list"] = true;
                                    props7["messages.read"] = true;
                                    props7["messages.stream"] = true;
                                    props7["messages.send"] = true;
                                    props7["messages.reply"] = true;
                                    props7["messages.edit"] = true;
                                    props7["messages.delete"] = true;
                                    props7["reactions.read"] = true;
                                    props7["reactions.send"] = true;
                                    props7["read.mark"] = true;
                                    props7["typing.send"] = true;
                                    props7["threads.read"] = true;
                                    props7["attachments.read"] = true;
                                    props7["avatars.read"] = true;
                                    props7["attachments.send"] = true;
                                    for (const key0 in data) {
                                      if (pattern6.test(key0)) {
                                        let data15 = data[key0];
                                        const _errs62 = errors;
                                        let valid17 = false;
                                        const _errs63 = errors;
                                        if (data15 !== false) {
                                          const err30 = { instancePath: instancePath + "/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/patternProperties/%5Ex-%5Ba-z%5D%5Ba-z0-9-%5D*%5C./anyOf/0/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" };
                                          if (vErrors === null) {
                                            vErrors = [err30];
                                          } else {
                                            vErrors.push(err30);
                                          }
                                          errors++;
                                        }
                                        var _valid15 = _errs63 === errors;
                                        valid17 = valid17 || _valid15;
                                        const _errs64 = errors;
                                        if (!(data15 && typeof data15 == "object" && !Array.isArray(data15))) {
                                          const err31 = { instancePath: instancePath + "/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/patternProperties/%5Ex-%5Ba-z%5D%5Ba-z0-9-%5D*%5C./anyOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                                          if (vErrors === null) {
                                            vErrors = [err31];
                                          } else {
                                            vErrors.push(err31);
                                          }
                                          errors++;
                                        }
                                        var _valid15 = _errs64 === errors;
                                        valid17 = valid17 || _valid15;
                                        if (!valid17) {
                                          const err32 = { instancePath: instancePath + "/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/patternProperties/%5Ex-%5Ba-z%5D%5Ba-z0-9-%5D*%5C./anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                          if (vErrors === null) {
                                            vErrors = [err32];
                                          } else {
                                            vErrors.push(err32);
                                          }
                                          errors++;
                                          validate97.errors = vErrors;
                                          return false;
                                        } else {
                                          errors = _errs62;
                                          if (vErrors !== null) {
                                            if (_errs62) {
                                              vErrors.length = _errs62;
                                            } else {
                                              vErrors = null;
                                            }
                                          }
                                        }
                                        props7[key0] = true;
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate97.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate97.errors = vErrors;
  evaluated0.props = props7;
  return errors === 0;
}
validate97.evaluated = { dynamicProps: true, dynamicItems: false };
var validateRoom = validate113;
var formats0 = require_formats().fullFormats["date-time"];
function validate113(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate113.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === undefined && (missing0 = "id") || data.title === undefined && (missing0 = "title") || data.kind === undefined && (missing0 = "kind") || data.unread === undefined && (missing0 = "unread")) {
        validate113.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.id !== undefined) {
          let data0 = data.id;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (func1(data0) < 1) {
                validate113.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                return false;
              }
            } else {
              validate113.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.title !== undefined) {
            const _errs3 = errors;
            if (typeof data.title !== "string") {
              validate113.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.avatar !== undefined) {
              let data2 = data.avatar;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (typeof data2 === "string") {
                  if (func1(data2) < 1) {
                    validate113.errors = [{ instancePath: instancePath + "/avatar", schemaPath: "#/properties/avatar/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate113.errors = [{ instancePath: instancePath + "/avatar", schemaPath: "#/properties/avatar/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.kind !== undefined) {
                const _errs7 = errors;
                if (typeof data.kind !== "string") {
                  validate113.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.unread !== undefined) {
                  let data4 = data.unread;
                  const _errs9 = errors;
                  if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
                    validate113.errors = [{ instancePath: instancePath + "/unread", schemaPath: "#/properties/unread/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                    return false;
                  }
                  if (errors === _errs9) {
                    if (typeof data4 == "number" && isFinite(data4)) {
                      if (data4 < 0 || isNaN(data4)) {
                        validate113.errors = [{ instancePath: instancePath + "/unread", schemaPath: "#/properties/unread/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                        return false;
                      }
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.lastActivityAt !== undefined) {
                    let data5 = data.lastActivityAt;
                    const _errs11 = errors;
                    if (errors === _errs11) {
                      if (errors === _errs11) {
                        if (typeof data5 === "string") {
                          if (!formats0.validate(data5)) {
                            validate113.errors = [{ instancePath: instancePath + "/lastActivityAt", schemaPath: "#/properties/lastActivityAt/format", keyword: "format", params: { format: "date-time" }, message: 'must match format "' + "date-time" + '"' }];
                            return false;
                          }
                        } else {
                          validate113.errors = [{ instancePath: instancePath + "/lastActivityAt", schemaPath: "#/properties/lastActivityAt/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                      }
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.lastMessage !== undefined) {
                      let data6 = data.lastMessage;
                      const _errs13 = errors;
                      if (errors === _errs13) {
                        if (data6 && typeof data6 == "object" && !Array.isArray(data6)) {
                          let missing1;
                          if (data6.text === undefined && (missing1 = "text") || data6.fromMe === undefined && (missing1 = "fromMe")) {
                            validate113.errors = [{ instancePath: instancePath + "/lastMessage", schemaPath: "#/properties/lastMessage/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                            return false;
                          } else {
                            if (data6.text !== undefined) {
                              const _errs15 = errors;
                              if (typeof data6.text !== "string") {
                                validate113.errors = [{ instancePath: instancePath + "/lastMessage/text", schemaPath: "#/properties/lastMessage/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                              var valid1 = _errs15 === errors;
                            } else {
                              var valid1 = true;
                            }
                            if (valid1) {
                              if (data6.fromMe !== undefined) {
                                const _errs17 = errors;
                                if (typeof data6.fromMe !== "boolean") {
                                  validate113.errors = [{ instancePath: instancePath + "/lastMessage/fromMe", schemaPath: "#/properties/lastMessage/properties/fromMe/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                  return false;
                                }
                                var valid1 = _errs17 === errors;
                              } else {
                                var valid1 = true;
                              }
                            }
                          }
                        } else {
                          validate113.errors = [{ instancePath: instancePath + "/lastMessage", schemaPath: "#/properties/lastMessage/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                          return false;
                        }
                      }
                      var valid0 = _errs13 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.features !== undefined) {
                        const _errs19 = errors;
                        if (!validate97(data.features, { instancePath: instancePath + "/features", parentData: data, parentDataProperty: "features", rootData, dynamicAnchors })) {
                          vErrors = vErrors === null ? validate97.errors : vErrors.concat(validate97.errors);
                          errors = vErrors.length;
                        }
                        var valid0 = _errs19 === errors;
                      } else {
                        var valid0 = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate113.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate113.errors = vErrors;
  return errors === 0;
}
validate113.evaluated = { props: { id: true, title: true, avatar: true, kind: true, unread: true, lastActivityAt: true, lastMessage: true, features: true }, dynamicProps: false, dynamicItems: false };
var validateRoomsAnswer = validate115;
function validate115(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate115.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.rooms === undefined && (missing0 = "rooms") || data.complete === undefined && (missing0 = "complete")) {
        validate115.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate115.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.rooms !== undefined) {
            let data1 = data.rooms;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (Array.isArray(data1)) {
                var valid1 = true;
                const len0 = data1.length;
                for (let i0 = 0;i0 < len0; i0++) {
                  const _errs4 = errors;
                  if (!validate113(data1[i0], { instancePath: instancePath + "/rooms/" + i0, parentData: data1, parentDataProperty: i0, rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate113.errors : vErrors.concat(validate113.errors);
                    errors = vErrors.length;
                  }
                  var valid1 = _errs4 === errors;
                  if (!valid1) {
                    break;
                  }
                }
              } else {
                validate115.errors = [{ instancePath: instancePath + "/rooms", schemaPath: "#/properties/rooms/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.complete !== undefined) {
              const _errs5 = errors;
              if (typeof data.complete !== "boolean") {
                validate115.errors = [{ instancePath: instancePath + "/complete", schemaPath: "#/properties/complete/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate115.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate115.errors = vErrors;
  return errors === 0;
}
validate115.evaluated = { props: { ok: true, rooms: true, complete: true }, dynamicProps: false, dynamicItems: false };
var validateAttachment = validate117;
function validate117(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate117.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === undefined && (missing0 = "id") || data.kind === undefined && (missing0 = "kind")) {
        validate117.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.id !== undefined) {
          let data0 = data.id;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (func1(data0) > 512) {
                validate117.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/maxLength", keyword: "maxLength", params: { limit: 512 }, message: "must NOT have more than 512 characters" }];
                return false;
              } else {
                if (func1(data0) < 1) {
                  validate117.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              }
            } else {
              validate117.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.kind !== undefined) {
            const _errs3 = errors;
            if (typeof data.kind !== "string") {
              validate117.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.name !== undefined) {
              const _errs5 = errors;
              if (typeof data.name !== "string") {
                validate117.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.mimeType !== undefined) {
                const _errs7 = errors;
                if (typeof data.mimeType !== "string") {
                  validate117.errors = [{ instancePath: instancePath + "/mimeType", schemaPath: "#/properties/mimeType/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.size !== undefined) {
                  let data4 = data.size;
                  const _errs9 = errors;
                  if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
                    validate117.errors = [{ instancePath: instancePath + "/size", schemaPath: "#/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                    return false;
                  }
                  if (errors === _errs9) {
                    if (typeof data4 == "number" && isFinite(data4)) {
                      if (data4 < 0 || isNaN(data4)) {
                        validate117.errors = [{ instancePath: instancePath + "/size", schemaPath: "#/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                        return false;
                      }
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.width !== undefined) {
                    const _errs11 = errors;
                    if (!validate52(data.width, { instancePath: instancePath + "/width", parentData: data, parentDataProperty: "width", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
                      errors = vErrors.length;
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.height !== undefined) {
                      const _errs12 = errors;
                      if (!validate52(data.height, { instancePath: instancePath + "/height", parentData: data, parentDataProperty: "height", rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
                        errors = vErrors.length;
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.durationSeconds !== undefined) {
                        let data7 = data.durationSeconds;
                        const _errs13 = errors;
                        if (errors === _errs13) {
                          if (typeof data7 == "number" && isFinite(data7)) {
                            if (data7 < 0 || isNaN(data7)) {
                              validate117.errors = [{ instancePath: instancePath + "/durationSeconds", schemaPath: "#/properties/durationSeconds/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                              return false;
                            }
                          } else {
                            validate117.errors = [{ instancePath: instancePath + "/durationSeconds", schemaPath: "#/properties/durationSeconds/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                            return false;
                          }
                        }
                        var valid0 = _errs13 === errors;
                      } else {
                        var valid0 = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate117.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate117.errors = vErrors;
  return errors === 0;
}
validate117.evaluated = { props: { id: true, kind: true, name: true, mimeType: true, size: true, width: true, height: true, durationSeconds: true }, dynamicProps: false, dynamicItems: false };
var validateReaction = validate120;
function validate120(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate120.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.emoji === undefined && (missing0 = "emoji") || data.count === undefined && (missing0 = "count") || data.mine === undefined && (missing0 = "mine")) {
        validate120.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.emoji !== undefined) {
          let data0 = data.emoji;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (func1(data0) < 1) {
                validate120.errors = [{ instancePath: instancePath + "/emoji", schemaPath: "#/properties/emoji/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                return false;
              }
            } else {
              validate120.errors = [{ instancePath: instancePath + "/emoji", schemaPath: "#/properties/emoji/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.count !== undefined) {
            const _errs3 = errors;
            if (!validate52(data.count, { instancePath: instancePath + "/count", parentData: data, parentDataProperty: "count", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.mine !== undefined) {
              const _errs4 = errors;
              if (typeof data.mine !== "boolean") {
                validate120.errors = [{ instancePath: instancePath + "/mine", schemaPath: "#/properties/mine/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate120.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate120.errors = vErrors;
  return errors === 0;
}
validate120.evaluated = { props: { emoji: true, count: true, mine: true }, dynamicProps: false, dynamicItems: false };
var validateMessage = validate122;
function validate122(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate122.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === undefined && (missing0 = "id") || data.roomId === undefined && (missing0 = "roomId") || data.sender === undefined && (missing0 = "sender") || data.text === undefined && (missing0 = "text") || data.kind === undefined && (missing0 = "kind") || data.sentAt === undefined && (missing0 = "sentAt") || data.fromMe === undefined && (missing0 = "fromMe")) {
        validate122.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.id !== undefined) {
          let data0 = data.id;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (func1(data0) < 1) {
                validate122.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                return false;
              }
            } else {
              validate122.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.roomId !== undefined) {
            let data1 = data.roomId;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (typeof data1 === "string") {
                if (func1(data1) < 1) {
                  validate122.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate122.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.senderId !== undefined) {
              let data2 = data.senderId;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (typeof data2 === "string") {
                  if (func1(data2) < 1) {
                    validate122.errors = [{ instancePath: instancePath + "/senderId", schemaPath: "#/properties/senderId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate122.errors = [{ instancePath: instancePath + "/senderId", schemaPath: "#/properties/senderId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.sender !== undefined) {
                const _errs7 = errors;
                if (typeof data.sender !== "string") {
                  validate122.errors = [{ instancePath: instancePath + "/sender", schemaPath: "#/properties/sender/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.senderAvatar !== undefined) {
                  let data4 = data.senderAvatar;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (typeof data4 === "string") {
                      if (func1(data4) > 512) {
                        validate122.errors = [{ instancePath: instancePath + "/senderAvatar", schemaPath: "#/properties/senderAvatar/maxLength", keyword: "maxLength", params: { limit: 512 }, message: "must NOT have more than 512 characters" }];
                        return false;
                      } else {
                        if (func1(data4) < 1) {
                          validate122.errors = [{ instancePath: instancePath + "/senderAvatar", schemaPath: "#/properties/senderAvatar/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                          return false;
                        }
                      }
                    } else {
                      validate122.errors = [{ instancePath: instancePath + "/senderAvatar", schemaPath: "#/properties/senderAvatar/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs9 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.text !== undefined) {
                    const _errs11 = errors;
                    if (typeof data.text !== "string") {
                      validate122.errors = [{ instancePath: instancePath + "/text", schemaPath: "#/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    var valid0 = _errs11 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.kind !== undefined) {
                      const _errs13 = errors;
                      if (typeof data.kind !== "string") {
                        validate122.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid0 = _errs13 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.sentAt !== undefined) {
                        let data7 = data.sentAt;
                        const _errs15 = errors;
                        if (errors === _errs15) {
                          if (errors === _errs15) {
                            if (typeof data7 === "string") {
                              if (!formats0.validate(data7)) {
                                validate122.errors = [{ instancePath: instancePath + "/sentAt", schemaPath: "#/properties/sentAt/format", keyword: "format", params: { format: "date-time" }, message: 'must match format "' + "date-time" + '"' }];
                                return false;
                              }
                            } else {
                              validate122.errors = [{ instancePath: instancePath + "/sentAt", schemaPath: "#/properties/sentAt/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                          }
                        }
                        var valid0 = _errs15 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.editedAt !== undefined) {
                          let data8 = data.editedAt;
                          const _errs17 = errors;
                          if (errors === _errs17) {
                            if (errors === _errs17) {
                              if (typeof data8 === "string") {
                                if (!formats0.validate(data8)) {
                                  validate122.errors = [{ instancePath: instancePath + "/editedAt", schemaPath: "#/properties/editedAt/format", keyword: "format", params: { format: "date-time" }, message: 'must match format "' + "date-time" + '"' }];
                                  return false;
                                }
                              } else {
                                validate122.errors = [{ instancePath: instancePath + "/editedAt", schemaPath: "#/properties/editedAt/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                          }
                          var valid0 = _errs17 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.fromMe !== undefined) {
                            const _errs19 = errors;
                            if (typeof data.fromMe !== "boolean") {
                              validate122.errors = [{ instancePath: instancePath + "/fromMe", schemaPath: "#/properties/fromMe/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                              return false;
                            }
                            var valid0 = _errs19 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.replyTo !== undefined) {
                              let data10 = data.replyTo;
                              const _errs21 = errors;
                              if (errors === _errs21) {
                                if (typeof data10 === "string") {
                                  if (func1(data10) < 1) {
                                    validate122.errors = [{ instancePath: instancePath + "/replyTo", schemaPath: "#/properties/replyTo/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                } else {
                                  validate122.errors = [{ instancePath: instancePath + "/replyTo", schemaPath: "#/properties/replyTo/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                              var valid0 = _errs21 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data.groupId !== undefined) {
                                let data11 = data.groupId;
                                const _errs23 = errors;
                                if (errors === _errs23) {
                                  if (typeof data11 === "string") {
                                    if (func1(data11) < 1) {
                                      validate122.errors = [{ instancePath: instancePath + "/groupId", schemaPath: "#/properties/groupId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                      return false;
                                    }
                                  } else {
                                    validate122.errors = [{ instancePath: instancePath + "/groupId", schemaPath: "#/properties/groupId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                }
                                var valid0 = _errs23 === errors;
                              } else {
                                var valid0 = true;
                              }
                              if (valid0) {
                                if (data.attachments !== undefined) {
                                  let data12 = data.attachments;
                                  const _errs25 = errors;
                                  if (errors === _errs25) {
                                    if (Array.isArray(data12)) {
                                      if (data12.length < 1) {
                                        validate122.errors = [{ instancePath: instancePath + "/attachments", schemaPath: "#/properties/attachments/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                                        return false;
                                      } else {
                                        var valid1 = true;
                                        const len0 = data12.length;
                                        for (let i0 = 0;i0 < len0; i0++) {
                                          const _errs27 = errors;
                                          if (!validate117(data12[i0], { instancePath: instancePath + "/attachments/" + i0, parentData: data12, parentDataProperty: i0, rootData, dynamicAnchors })) {
                                            vErrors = vErrors === null ? validate117.errors : vErrors.concat(validate117.errors);
                                            errors = vErrors.length;
                                          }
                                          var valid1 = _errs27 === errors;
                                          if (!valid1) {
                                            break;
                                          }
                                        }
                                      }
                                    } else {
                                      validate122.errors = [{ instancePath: instancePath + "/attachments", schemaPath: "#/properties/attachments/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                      return false;
                                    }
                                  }
                                  var valid0 = _errs25 === errors;
                                } else {
                                  var valid0 = true;
                                }
                                if (valid0) {
                                  if (data.reactions !== undefined) {
                                    let data14 = data.reactions;
                                    const _errs28 = errors;
                                    if (errors === _errs28) {
                                      if (Array.isArray(data14)) {
                                        if (data14.length < 1) {
                                          validate122.errors = [{ instancePath: instancePath + "/reactions", schemaPath: "#/properties/reactions/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                                          return false;
                                        } else {
                                          var valid2 = true;
                                          const len1 = data14.length;
                                          for (let i1 = 0;i1 < len1; i1++) {
                                            const _errs30 = errors;
                                            if (!validate120(data14[i1], { instancePath: instancePath + "/reactions/" + i1, parentData: data14, parentDataProperty: i1, rootData, dynamicAnchors })) {
                                              vErrors = vErrors === null ? validate120.errors : vErrors.concat(validate120.errors);
                                              errors = vErrors.length;
                                            }
                                            var valid2 = _errs30 === errors;
                                            if (!valid2) {
                                              break;
                                            }
                                          }
                                        }
                                      } else {
                                        validate122.errors = [{ instancePath: instancePath + "/reactions", schemaPath: "#/properties/reactions/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                        return false;
                                      }
                                    }
                                    var valid0 = _errs28 === errors;
                                  } else {
                                    var valid0 = true;
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate122.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate122.errors = vErrors;
  return errors === 0;
}
validate122.evaluated = { props: { id: true, roomId: true, senderId: true, sender: true, senderAvatar: true, text: true, kind: true, sentAt: true, editedAt: true, fromMe: true, replyTo: true, groupId: true, attachments: true, reactions: true }, dynamicProps: false, dynamicItems: false };
var validateMessagesAnswer = validate125;
function validate125(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate125.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.messages === undefined && (missing0 = "messages") || data.hasEarlier === undefined && (missing0 = "hasEarlier")) {
        validate125.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate125.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.messages !== undefined) {
            let data1 = data.messages;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (Array.isArray(data1)) {
                var valid1 = true;
                const len0 = data1.length;
                for (let i0 = 0;i0 < len0; i0++) {
                  const _errs4 = errors;
                  if (!validate122(data1[i0], { instancePath: instancePath + "/messages/" + i0, parentData: data1, parentDataProperty: i0, rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate122.errors : vErrors.concat(validate122.errors);
                    errors = vErrors.length;
                  }
                  var valid1 = _errs4 === errors;
                  if (!valid1) {
                    break;
                  }
                }
              } else {
                validate125.errors = [{ instancePath: instancePath + "/messages", schemaPath: "#/properties/messages/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.hasEarlier !== undefined) {
              const _errs5 = errors;
              if (typeof data.hasEarlier !== "boolean") {
                validate125.errors = [{ instancePath: instancePath + "/hasEarlier", schemaPath: "#/properties/hasEarlier/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate125.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate125.errors = vErrors;
  return errors === 0;
}
validate125.evaluated = { props: { ok: true, messages: true, hasEarlier: true }, dynamicProps: false, dynamicItems: false };
var validateCursor = validate127;
function validate127(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate127.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      for (const key0 in data) {
        const _errs2 = errors;
        if (typeof data[key0] !== "string") {
          validate127.errors = [{ instancePath: instancePath + "/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
          return false;
        }
        var valid0 = _errs2 === errors;
        if (!valid0) {
          break;
        }
      }
    } else {
      validate127.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate127.errors = vErrors;
  return errors === 0;
}
validate127.evaluated = { props: true, dynamicProps: false, dynamicItems: false };
var validateStreamReady = validate128;
function validate128(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate128.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.resumed === undefined && (missing0 = "resumed") || data.cursor === undefined && (missing0 = "cursor")) {
        validate128.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate128.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.resumed !== undefined) {
            const _errs2 = errors;
            if (typeof data.resumed !== "boolean") {
              validate128.errors = [{ instancePath: instancePath + "/resumed", schemaPath: "#/properties/resumed/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.cursor !== undefined) {
              const _errs4 = errors;
              if (!validate127(data.cursor, { instancePath: instancePath + "/cursor", parentData: data, parentDataProperty: "cursor", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate127.errors : vErrors.concat(validate127.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate128.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate128.errors = vErrors;
  return errors === 0;
}
validate128.evaluated = { props: { ok: true, resumed: true, cursor: true }, dynamicProps: false, dynamicItems: false };
var validateStreamMessage = validate130;
function validate130(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate130.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.message === undefined && (missing0 = "message")) {
        validate130.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate130.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.message !== undefined) {
            const _errs2 = errors;
            if (!validate122(data.message, { instancePath: instancePath + "/message", parentData: data, parentDataProperty: "message", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate122.errors : vErrors.concat(validate122.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate130.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate130.errors = vErrors;
  return errors === 0;
}
validate130.evaluated = { props: { ok: true, message: true }, dynamicProps: false, dynamicItems: false };
var validateStreamMessagesDeleted = validate132;
function validate132(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate132.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.roomId === undefined && (missing0 = "roomId") || data.messageIds === undefined && (missing0 = "messageIds")) {
        validate132.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate132.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.roomId !== undefined) {
            let data1 = data.roomId;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data1 === "string") {
                if (func1(data1) < 1) {
                  validate132.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate132.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.messageIds !== undefined) {
              let data2 = data.messageIds;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (Array.isArray(data2)) {
                  if (data2.length < 1) {
                    validate132.errors = [{ instancePath: instancePath + "/messageIds", schemaPath: "#/properties/messageIds/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                    return false;
                  } else {
                    var valid1 = true;
                    const len0 = data2.length;
                    for (let i0 = 0;i0 < len0; i0++) {
                      let data3 = data2[i0];
                      const _errs6 = errors;
                      if (errors === _errs6) {
                        if (typeof data3 === "string") {
                          if (func1(data3) < 1) {
                            validate132.errors = [{ instancePath: instancePath + "/messageIds/" + i0, schemaPath: "#/properties/messageIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                            return false;
                          }
                        } else {
                          validate132.errors = [{ instancePath: instancePath + "/messageIds/" + i0, schemaPath: "#/properties/messageIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                      }
                      var valid1 = _errs6 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  }
                } else {
                  validate132.errors = [{ instancePath: instancePath + "/messageIds", schemaPath: "#/properties/messageIds/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate132.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate132.errors = vErrors;
  return errors === 0;
}
validate132.evaluated = { props: { ok: true, roomId: true, messageIds: true }, dynamicProps: false, dynamicItems: false };
var validateStreamReactionsUpdated = validate133;
function validate133(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate133.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.roomId === undefined && (missing0 = "roomId") || data.messageId === undefined && (missing0 = "messageId") || data.reactions === undefined && (missing0 = "reactions")) {
        validate133.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate133.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.roomId !== undefined) {
            let data1 = data.roomId;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data1 === "string") {
                if (func1(data1) < 1) {
                  validate133.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate133.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.messageId !== undefined) {
              let data2 = data.messageId;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data2 === "string") {
                  if (func1(data2) < 1) {
                    validate133.errors = [{ instancePath: instancePath + "/messageId", schemaPath: "#/properties/messageId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate133.errors = [{ instancePath: instancePath + "/messageId", schemaPath: "#/properties/messageId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.reactions !== undefined) {
                let data3 = data.reactions;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (Array.isArray(data3)) {
                    var valid1 = true;
                    const len0 = data3.length;
                    for (let i0 = 0;i0 < len0; i0++) {
                      const _errs8 = errors;
                      if (!validate120(data3[i0], { instancePath: instancePath + "/reactions/" + i0, parentData: data3, parentDataProperty: i0, rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate120.errors : vErrors.concat(validate120.errors);
                        errors = vErrors.length;
                      }
                      var valid1 = _errs8 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate133.errors = [{ instancePath: instancePath + "/reactions", schemaPath: "#/properties/reactions/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate133.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate133.errors = vErrors;
  return errors === 0;
}
validate133.evaluated = { props: { ok: true, roomId: true, messageId: true, reactions: true }, dynamicProps: false, dynamicItems: false };
var validateStreamCursor = validate135;
function validate135(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate135.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.cursor === undefined && (missing0 = "cursor")) {
        validate135.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate135.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.cursor !== undefined) {
            const _errs2 = errors;
            if (!validate127(data.cursor, { instancePath: instancePath + "/cursor", parentData: data, parentDataProperty: "cursor", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate127.errors : vErrors.concat(validate127.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate135.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate135.errors = vErrors;
  return errors === 0;
}
validate135.evaluated = { props: { ok: true, cursor: true }, dynamicProps: false, dynamicItems: false };
var validateStreamPing = validate137;
function validate137(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate137.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok")) {
        validate137.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          if (data.ok !== true) {
            validate137.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
        }
      }
    } else {
      validate137.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate137.errors = vErrors;
  return errors === 0;
}
validate137.evaluated = { props: { ok: true }, dynamicProps: false, dynamicItems: false };
var validateSendRequest = validate138;
function validate138(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate138.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.roomId === undefined && (missing0 = "roomId") || data.text === undefined && (missing0 = "text")) {
        validate138.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.roomId !== undefined) {
          let data0 = data.roomId;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (func1(data0) < 1) {
                validate138.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                return false;
              }
            } else {
              validate138.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.text !== undefined) {
            let data1 = data.text;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (typeof data1 === "string") {
                if (func1(data1) < 1) {
                  validate138.errors = [{ instancePath: instancePath + "/text", schemaPath: "#/properties/text/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate138.errors = [{ instancePath: instancePath + "/text", schemaPath: "#/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.replyTo !== undefined) {
              let data2 = data.replyTo;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (typeof data2 === "string") {
                  if (func1(data2) < 1) {
                    validate138.errors = [{ instancePath: instancePath + "/replyTo", schemaPath: "#/properties/replyTo/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate138.errors = [{ instancePath: instancePath + "/replyTo", schemaPath: "#/properties/replyTo/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate138.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate138.errors = vErrors;
  return errors === 0;
}
validate138.evaluated = { props: { roomId: true, text: true, replyTo: true }, dynamicProps: false, dynamicItems: false };
var validateSendAnswer = validate139;
function validate139(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate139.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.message === undefined && (missing0 = "message")) {
        validate139.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate139.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.message !== undefined) {
            const _errs2 = errors;
            if (!validate122(data.message, { instancePath: instancePath + "/message", parentData: data, parentDataProperty: "message", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate122.errors : vErrors.concat(validate122.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate139.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate139.errors = vErrors;
  return errors === 0;
}
validate139.evaluated = { props: { ok: true, message: true }, dynamicProps: false, dynamicItems: false };
var validateUploadRequest = validate141;
function validate141(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate141.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.roomId === undefined && (missing0 = "roomId") || data.file === undefined && (missing0 = "file")) {
        validate141.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "roomId" || key0 === "file" || key0 === "caption" || key0 === "replyTo")) {
            validate141.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.roomId !== undefined) {
            let data0 = data.roomId;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate141.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate141.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.file !== undefined) {
              const _errs4 = errors;
              if (errors === _errs4) {
                if (errors === _errs4) {
                  if (!(typeof data.file === "string")) {
                    validate141.errors = [{ instancePath: instancePath + "/file", schemaPath: "#/properties/file/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.caption !== undefined) {
                let data2 = data.caption;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (func1(data2) < 1) {
                      validate141.errors = [{ instancePath: instancePath + "/caption", schemaPath: "#/properties/caption/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                      return false;
                    }
                  } else {
                    validate141.errors = [{ instancePath: instancePath + "/caption", schemaPath: "#/properties/caption/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.replyTo !== undefined) {
                  let data3 = data.replyTo;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (func1(data3) < 1) {
                        validate141.errors = [{ instancePath: instancePath + "/replyTo", schemaPath: "#/properties/replyTo/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate141.errors = [{ instancePath: instancePath + "/replyTo", schemaPath: "#/properties/replyTo/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate141.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate141.errors = vErrors;
  return errors === 0;
}
validate141.evaluated = { props: true, dynamicProps: false, dynamicItems: false };
var validateEditRequest = validate142;
function validate142(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate142.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.roomId === undefined && (missing0 = "roomId") || data.messageId === undefined && (missing0 = "messageId") || data.text === undefined && (missing0 = "text")) {
        validate142.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.roomId !== undefined) {
          let data0 = data.roomId;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (func1(data0) < 1) {
                validate142.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                return false;
              }
            } else {
              validate142.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.messageId !== undefined) {
            let data1 = data.messageId;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (typeof data1 === "string") {
                if (func1(data1) < 1) {
                  validate142.errors = [{ instancePath: instancePath + "/messageId", schemaPath: "#/properties/messageId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate142.errors = [{ instancePath: instancePath + "/messageId", schemaPath: "#/properties/messageId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.text !== undefined) {
              let data2 = data.text;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (typeof data2 === "string") {
                  if (func1(data2) < 1) {
                    validate142.errors = [{ instancePath: instancePath + "/text", schemaPath: "#/properties/text/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate142.errors = [{ instancePath: instancePath + "/text", schemaPath: "#/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate142.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate142.errors = vErrors;
  return errors === 0;
}
validate142.evaluated = { props: { roomId: true, messageId: true, text: true }, dynamicProps: false, dynamicItems: false };
var validateEditAnswer = validate143;
function validate143(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate143.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.message === undefined && (missing0 = "message")) {
        validate143.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate143.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.message !== undefined) {
            const _errs2 = errors;
            if (!validate122(data.message, { instancePath: instancePath + "/message", parentData: data, parentDataProperty: "message", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate122.errors : vErrors.concat(validate122.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate143.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate143.errors = vErrors;
  return errors === 0;
}
validate143.evaluated = { props: { ok: true, message: true }, dynamicProps: false, dynamicItems: false };
var validateDeleteRequest = validate145;
function validate145(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate145.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.roomId === undefined && (missing0 = "roomId") || data.messageId === undefined && (missing0 = "messageId")) {
        validate145.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.roomId !== undefined) {
          let data0 = data.roomId;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (func1(data0) < 1) {
                validate145.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                return false;
              }
            } else {
              validate145.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.messageId !== undefined) {
            let data1 = data.messageId;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (typeof data1 === "string") {
                if (func1(data1) < 1) {
                  validate145.errors = [{ instancePath: instancePath + "/messageId", schemaPath: "#/properties/messageId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate145.errors = [{ instancePath: instancePath + "/messageId", schemaPath: "#/properties/messageId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate145.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate145.errors = vErrors;
  return errors === 0;
}
validate145.evaluated = { props: { roomId: true, messageId: true }, dynamicProps: false, dynamicItems: false };
var validateReactRequest = validate146;
function validate146(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate146.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.roomId === undefined && (missing0 = "roomId") || data.messageId === undefined && (missing0 = "messageId") || data.emojis === undefined && (missing0 = "emojis")) {
        validate146.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.roomId !== undefined) {
          let data0 = data.roomId;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (func1(data0) < 1) {
                validate146.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                return false;
              }
            } else {
              validate146.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.messageId !== undefined) {
            let data1 = data.messageId;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (typeof data1 === "string") {
                if (func1(data1) < 1) {
                  validate146.errors = [{ instancePath: instancePath + "/messageId", schemaPath: "#/properties/messageId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate146.errors = [{ instancePath: instancePath + "/messageId", schemaPath: "#/properties/messageId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.emojis !== undefined) {
              let data2 = data.emojis;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (Array.isArray(data2)) {
                  var valid1 = true;
                  const len0 = data2.length;
                  for (let i0 = 0;i0 < len0; i0++) {
                    let data3 = data2[i0];
                    const _errs7 = errors;
                    if (errors === _errs7) {
                      if (typeof data3 === "string") {
                        if (func1(data3) < 1) {
                          validate146.errors = [{ instancePath: instancePath + "/emojis/" + i0, schemaPath: "#/properties/emojis/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                          return false;
                        }
                      } else {
                        validate146.errors = [{ instancePath: instancePath + "/emojis/" + i0, schemaPath: "#/properties/emojis/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                    }
                    var valid1 = _errs7 === errors;
                    if (!valid1) {
                      break;
                    }
                  }
                  if (valid1) {
                    let i1 = data2.length;
                    let j0;
                    if (i1 > 1) {
                      const indices0 = {};
                      for (;i1--; ) {
                        let item0 = data2[i1];
                        if (typeof item0 !== "string") {
                          continue;
                        }
                        if (typeof indices0[item0] == "number") {
                          j0 = indices0[item0];
                          validate146.errors = [{ instancePath: instancePath + "/emojis", schemaPath: "#/properties/emojis/uniqueItems", keyword: "uniqueItems", params: { i: i1, j: j0 }, message: "must NOT have duplicate items (items ## " + j0 + " and " + i1 + " are identical)" }];
                          return false;
                          break;
                        }
                        indices0[item0] = i1;
                      }
                    }
                  }
                } else {
                  validate146.errors = [{ instancePath: instancePath + "/emojis", schemaPath: "#/properties/emojis/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate146.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate146.errors = vErrors;
  return errors === 0;
}
validate146.evaluated = { props: { roomId: true, messageId: true, emojis: true }, dynamicProps: false, dynamicItems: false };
var validateReactAnswer = validate147;
function validate147(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate147.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok") || data.reactions === undefined && (missing0 = "reactions")) {
        validate147.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          const _errs1 = errors;
          if (data.ok !== true) {
            validate147.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.reactions !== undefined) {
            let data1 = data.reactions;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (Array.isArray(data1)) {
                var valid1 = true;
                const len0 = data1.length;
                for (let i0 = 0;i0 < len0; i0++) {
                  const _errs4 = errors;
                  if (!validate120(data1[i0], { instancePath: instancePath + "/reactions/" + i0, parentData: data1, parentDataProperty: i0, rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate120.errors : vErrors.concat(validate120.errors);
                    errors = vErrors.length;
                  }
                  var valid1 = _errs4 === errors;
                  if (!valid1) {
                    break;
                  }
                }
              } else {
                validate147.errors = [{ instancePath: instancePath + "/reactions", schemaPath: "#/properties/reactions/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate147.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate147.errors = vErrors;
  return errors === 0;
}
validate147.evaluated = { props: { ok: true, reactions: true }, dynamicProps: false, dynamicItems: false };
var validateReadRequest = validate149;
function validate149(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate149.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.roomId === undefined && (missing0 = "roomId") || data.messageId === undefined && (missing0 = "messageId")) {
        validate149.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.roomId !== undefined) {
          let data0 = data.roomId;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (typeof data0 === "string") {
              if (func1(data0) < 1) {
                validate149.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                return false;
              }
            } else {
              validate149.errors = [{ instancePath: instancePath + "/roomId", schemaPath: "#/properties/roomId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.messageId !== undefined) {
            let data1 = data.messageId;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (typeof data1 === "string") {
                if (func1(data1) < 1) {
                  validate149.errors = [{ instancePath: instancePath + "/messageId", schemaPath: "#/properties/messageId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate149.errors = [{ instancePath: instancePath + "/messageId", schemaPath: "#/properties/messageId/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate149.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate149.errors = vErrors;
  return errors === 0;
}
validate149.evaluated = { props: { roomId: true, messageId: true }, dynamicProps: false, dynamicItems: false };
var validateDone = validate150;
function validate150(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate150.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.ok === undefined && (missing0 = "ok")) {
        validate150.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.ok !== undefined) {
          if (data.ok !== true) {
            validate150.errors = [{ instancePath: instancePath + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
            return false;
          }
        }
      }
    } else {
      validate150.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate150.errors = vErrors;
  return errors === 0;
}
validate150.evaluated = { props: { ok: true }, dynamicProps: false, dynamicItems: false };
export {
  validateAttachment,
  validateCapabilities,
  validateCursor,
  validateDeleteRequest,
  validateDone,
  validateEditAnswer,
  validateEditRequest,
  validateErrorCode,
  validateErrorEnvelope,
  validateFeatureAttachmentsRead,
  validateFeatureAttachmentsSend,
  validateFeatureAvatarsRead,
  validateFeatureMessagesDelete,
  validateFeatureMessagesEdit,
  validateFeatureMessagesRead,
  validateFeatureMessagesReply,
  validateFeatureMessagesSend,
  validateFeatureMessagesStream,
  validateFeatureReactionsRead,
  validateFeatureReactionsSend,
  validateFeatureReadMark,
  validateFeatureRoomsList,
  validateFeatureThreadsRead,
  validateFeatureTypingSend,
  validateFeatures,
  validateHealth,
  validateMessage,
  validateMessagesAnswer,
  validatePositiveInteger,
  validateReactAnswer,
  validateReactRequest,
  validateReaction,
  validateReadRequest,
  validateRoom,
  validateRoomFeatures,
  validateRoomsAnswer,
  validateSendAnswer,
  validateSendRequest,
  validateStreamCursor,
  validateStreamMessage,
  validateStreamMessagesDeleted,
  validateStreamPing,
  validateStreamReactionsUpdated,
  validateStreamReady,
  validateUploadRequest
};
