const http = require("http");
const https = require("https");
const { pipeline } = require("stream");
const zlib = require("zlib");
const crypto = require("crypto");

const _0x1a2b = Number(process.env.PORT || 6969);
const _0x3c4d = process.env.UPSTREAM_HOST || "api.xingchiapi.com";
const _0x5e6f = process.env.UPSTREAM_PROTOCOL || "https";
const _0x7g8h = _0x5e6f === "https" ? 443 : 80;
const _0x9i0j = Number(process.env.UPSTREAM_PORT || _0x7g8h);
const _0x1k2l = process.env.MODE || "1";

const _0x3m4n = [
  "codex-session",
  "codex_session",
  "codexsession",
  "codex-session-id",
  "codex_session_id",
  "codexsessionid",
  "session-id",
  "session_id",
  "sessionid",
  "thread-id",
  "thread_id",
  "threadid",
  "x-client-request-id",
  "x-codex-window-id",
  "x-codex-turn-metadata",
  "prompt_cache_key",
  "client_metadata",
  "conversation_id",
  "x-conversation-id",
  "x-session-id",
  "x-session-affinity",
  "x-opencode-session",
  "x-thread-id",
  "x-codex-thread-id",
  "installation_id",
  "turn_id",
  "parent_turn_id",
  "root_turn_id",
  "parent_thread_id",
  "forked_from_thread_id",
  "window_id",
  "context_window_id",
  "x-codex-parent-thread-id",
  "x-codex-installation-id",
  "x-codex-turn-state",
  "x-codex-routing-hint",
];

const _0x5o6p = (process.env.FILTER_NAMES || "")
  .split(",")
  .map((n) => n.trim())
  .filter(Boolean);

const _0x7q8r = new Set([..._0x3m4n, ..._0x5o6p].map(_0x9s0t));

function _0x9s0t(n) {
  return String(n).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function _0x1u2v(n) {
  const _n = _0x9s0t(n);
  if (_0x7q8r.has(_n)) return true;
  return _n.includes("codex") && (_n.includes("session") || _n.includes("requestid"));
}

function _0x3w4x(p) {
  const q = p.indexOf("?");
  if (q === -1) return p;
  const pn = p.slice(0, q);
  const rq = p.slice(q + 1);
  const ps = new URLSearchParams(rq);
  for (const n of [...ps.keys()]) {
    if (_0x1u2v(n)) ps.delete(n);
  }
  const qs = ps.toString();
  return qs ? `${pn}?${qs}` : pn;
}

function _0x5y6z(v) {
  if (Array.isArray(v)) return v.map(_0x5y6z);
  if (v && typeof v === "object") {
    const r = {};
    for (const [k, c] of Object.entries(v)) {
      if (!_0x1u2v(k)) {
        r[k] = ["input", "messages", "tools", "functions", "text", "response_format"].includes(k) ? c : _0x5y6z(c);
      }
    }
    return r;
  }
  return v;
}

function _0x7a8b(b, h) {
  const enc = String(h["content-encoding"] || "identity").split(",").map(e => e.trim().toLowerCase()).reverse();
  let d = b;
  for (const e of enc) {
    if (e === "gzip") d = zlib.gunzipSync(d);
    else if (e === "deflate") d = zlib.inflateSync(d);
    else if (e === "br") d = zlib.brotliDecompressSync(d);
    else if (e === "zstd" && typeof zlib.zstdDecompressSync === "function") d = zlib.zstdDecompressSync(d);
    else if (e !== "identity") throw new Error(`Unsupported content-encoding: ${e}`);
  }
  return d;
}

function _0x9c0d(b, h) {
  const p = JSON.parse(_0x7a8b(b, h).toString("utf8"));
  return Buffer.from(JSON.stringify(_0x5y6z(p)));
}

function _0x1e2f(h) {
  const r = {};
  for (const [n, v] of Object.entries(h)) {
    if (!_0x1u2v(n)) r[n] = v;
  }
  return r;
}

const _0x3g4h = new Map();
const _0x5i6j = new Map();
const _0x7k8l = new Map();
const _0x9m0n = 88;

function _0x1o2p(sid) {
  return crypto.randomBytes(16).toString("hex");
}

function _0x3q4r(orig, fresh) {
  let cur = orig;
  while (_0x3g4h.has(cur)) cur = _0x3g4h.get(cur);
  _0x3g4h.set(cur, fresh);
  _0x5i6j.set(fresh, 0);
  _0x7k8l.set(fresh, cur);
}

function _0x5s6t(sid) {
  if (!_0x5i6j.has(sid)) return sid;
  const cnt = _0x5i6j.get(sid) + 1;
  _0x5i6j.set(sid, cnt);
  if (cnt >= _0x9m0n) {
    const fresh = _0x1o2p();
    _0x3q4r(sid, fresh);
    return fresh;
  }
  return sid;
}

function _0x7u8v(headers) {
  const sidKeys = ["x-session-id", "session-id", "session_id", "x-codex-session-id", "codex-session-id"];
  for (const k of sidKeys) {
    const lk = k.toLowerCase();
    if (headers[lk]) {
      const fresh = _0x5s6t(headers[lk]);
      if (fresh !== headers[lk]) {
        headers[lk] = fresh;
        for (const kk of sidKeys) {
          const llk = kk.toLowerCase();
          if (headers[llk] && headers[llk] !== fresh) headers[llk] = fresh;
        }
      }
      break;
    }
  }
  return headers;
}

function _0x9w0x(cr, cs) {
  const rp = cr.url || "/";
  const ch = [];
  cr.on("data", c => ch.push(c));
  cr.on("end", () => {
    let bd = Buffer.concat(ch);
    const ct = cr.headers["content-type"] || "";
    let hd = _0x1e2f(cr.headers);
    if (_0x1k2l === "2") hd = _0x7u8v(hd);
    if (/^application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i.test(ct) && bd.length > 0) {
      try {
        bd = _0x9c0d(bd, cr.headers);
        delete hd["content-encoding"];
      } catch (e) {
        cs.writeHead(400, { "content-type": "application/json" });
        cs.end(JSON.stringify({ error: { code: "invalid_request_body", message: `Cannot filter JSON request body: ${e.message}` } }));
        return;
      }
    }
    hd.host = _0x3c4d;
    delete hd["transfer-encoding"];
    if (bd.length > 0) hd["content-length"] = String(bd.length);
    else delete hd["content-length"];
    const tr = _0x5e6f === "http" ? http : https;
    const ur = tr.request({
      protocol: `${_0x5e6f}:`,
      hostname: _0x3c4d,
      port: _0x9i0j,
      method: cr.method,
      path: _0x3w4x(rp),
      headers: hd,
    }, (urs) => {
      cs.writeHead(urs.statusCode, urs.headers);
      pipeline(urs, cs, () => {});
    });
    ur.on("error", e => {
      if (cs.headersSent) { cs.destroy(); return; }
      cs.writeHead(502, { "content-type": "text/plain" });
      cs.end(`Upstream proxy error: ${e.message}`);
    });
    if (bd.length > 0) ur.write(bd);
    ur.end();
  });
}

const srv = http.createServer((cr, cs) => _0x9w0x(cr, cs));

if (require.main === module) {
  srv.listen(_0x1a2b, () => {
    const up = _0x9i0j === _0x7g8h ? "" : `:${_0x9i0j}`;
    const m = _0x1k2l === "2" ? "AUTO-ROTATE (88 req/session)" : "STANDARD";
    console.log(`
 ███▄    █  ▄▄▄     ▓██   ██▓ █    ██  ███▄ ▄███▓ ██▓     ▓█████▄ ▓█████ ██▒   █▓
 ██ ▀█   █ ▒████▄    ▒██  ██▒ ██  ▓██▒▓██▒▀█▀ ██▒▓██▒     ▒██▀ ██▌▓█   ▀▓██░   █▒
▓██  ▀█ ██▒▒██  ▀█▄   ▒██ ██░▓██  ▒██░▓██    ▓██░▒██▒     ░██   █▌▒███   ▓██  █▒░
▓██▒  ▐▌██▒░██▄▄▄▄██  ░ ▐██▓░▓▓█  ░██░▒██    ▒██ ░██░     ░▓█▄   ▌▒▓█  ▄  ▒██ █░░
▒██░   ▓██░ ▓█   ▓██▒ ░ ██▒▓░▒▒█████▓ ▒██▒   ░██▒░██░ ██▓ ░▒████▓ ░▒████▒  ▒▀█░  
░ ▒░   ▒ ▒  ▒▒   ▓▒█░  ██▒▒▒ ░▒▓▒ ▒ ▒ ░ ▒░   ░  ░░▓   ▒▓▒  ▒▒▓  ▒ ░░ ▒░ ░  ░ ▐░  
░ ░░   ░ ▒░  ▒   ▒▒ ░▓██ ░▒░ ░░▒░ ░ ░ ░  ░      ░ ▒ ░ ░▒   ░ ▒  ▒  ░ ░  ░  ░ ░░  
   ░   ░ ░   ░   ▒   ▒ ▒ ░░   ░░░ ░ ░ ░      ░    ▒ ░ ░    ░ ░  ░    ░       ░░  
         ░       ░  ░░ ░        ░            ░    ░    ░     ░       ░  ░     ░  
                     ░ ░                               ░   ░                 ░

    Nayumi.DEV | XingChi Session Filter
    Mode       ${m}
    Proxy      http://localhost:${srv.address().port}
    Upstream   ${_0x5e6f}://${_0x3c4d}${up}
    Donate     https://github.com/sponsors/nayumiDEV
    `);
  });
}

module.exports = { server: srv, filterQuery: _0x3w4x, filterJsonValue: _0x5y6z, filterHeaders: _0x1e2f, isFilteredName: _0x1u2v };