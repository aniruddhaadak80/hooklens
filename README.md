<div align="center">

# $ hooklens_

**Catch, inspect & debug webhooks in real time — a bin URL that records every request, a terminal UI that explains every payload, and MCP tools so your AI agent debugs webhooks itself.**

[![Live Demo](https://img.shields.io/badge/demo-live-a3e635?style=for-the-badge)](https://hooklens-brown.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-34d399?style=for-the-badge)](./LICENSE)
[![Next.js](https://img.shields.io/badge/next.js-16-black?style=for-the-badge)](https://nextjs.org)
[![Neon Postgres](https://img.shields.io/badge/store-neon_postgres-22d3ee?style=for-the-badge)](https://neon.tech)
[![MCP](https://img.shields.io/badge/MCP-json--rpc-fbbf24?style=for-the-badge)](#-agent-interface)

[Live App](https://hooklens-brown.vercel.app) · [Bins](https://hooklens-brown.vercel.app/bins) · [Docs](https://hooklens-brown.vercel.app/docs) · [MCP](https://hooklens-brown.vercel.app/api/mcp) · [Issues](https://github.com/aniruddhaadak80/hooklens/issues)

</div>

## ✨ Features

- 📥 **Bin URLs that catch anything** — `POST /api/hook/:id` accepts GET/POST/PUT/PATCH/DELETE, stores headers + query + body (256 KB cap), answers in ms
- 🔍 **Deterministic inspector** — JSON/form/XML detection, signature-header spotting, malformed-body + missing-signature warnings, one-click replay `curl`, JSON export
- 🔗 **Hash-sealed captures** — `SHA-384(prevSeal ‖ canonicalJson)` chained per bin, `seal ok / BROKEN` shown inline, re-verifiable offline
- 🤖 **MCP tools that mutate** — `create_bin`, `list_bins`, `get_requests`, `inspect_request`, `clear_bin` + live in-page console
- 🖥️ **Terminal identity** — phosphor green, scanlines, blinking cursor, live polling stream; zero globes were harmed
- 🗄️ **Real Postgres** (Neon) — bins and captures survive redeploys; full CRUD through UI, REST, and agents

## 🏗️ System architecture

```mermaid
flowchart LR
    S[senders: Stripe GitHub Twilio] --> H["/api/hook/:id"]
    H --> P[(Neon Postgres)]
    P --> UI["/bins/:id live stream"]
    P --> R["REST: bins + requests + export"]
    P --> M["/api/mcp 5 tools"]
    I["inspectRequest()"] --> UI
    I --> R
    I --> M
    classDef live fill:#22d3ee,color:#04060c
    classDef engine fill:#a78bfa,color:#04060c
    classDef agent fill:#34d399,color:#04060c
    classDef ext fill:#fbbf24,color:#04060c
    class S ext
    class H,P,UI,R live
    class I engine
    class M agent
```

## 🌊 Capture pipeline

```mermaid
flowchart TB
    R[HTTP hit any method] --> B{bin exists?}
    B -->|no| N[404]
    B -->|yes| C[cap headers + query + body]
    C --> S["seal = SHA-384(prev + json)"]
    S --> W[insert + bump count]
    W --> J["200 {ok, id, seal}"]
    classDef live fill:#22d3ee,color:#04060c
    classDef caution fill:#fbbf24,color:#04060c
    classDef risk fill:#fb7185,color:#04060c
    class R,C,S,W,J live
    class B caution
    class N risk
```

## 🧮 Inspector flow

```mermaid
flowchart LR
    C[content-type] --> K{body kind?}
    K --> J[json: parse + keys]
    K --> F[form: fields]
    K --> X[xml / text / empty]
    J --> G[signature? size? sender?]
    F --> G
    X --> G
    G --> V[replay seal chain]
    V --> O[findings + seal ok?]
    classDef engine fill:#a78bfa,color:#04060c
    classDef live fill:#22d3ee,color:#04060c
    classDef agent fill:#34d399,color:#04060c
    class C,K live
    class J,F,X,G engine
    class V,O agent
```

## 🤖 Agent (MCP) sequence

```mermaid
sequenceDiagram
    participant A as Agent
    participant M as /api/mcp
    participant D as Neon
    A->>M: tools/call create_bin
    M->>D: INSERT bin
    D-->>M: bin id
    M-->>A: hook_path
    A->>M: tools/call get_requests
    M->>D: SELECT captures
    M-->>A: requests JSON
    A->>M: tools/call inspect_request
    M-->>A: findings + sealValid
```

## 🔗 Seal chain

```mermaid
flowchart TB
    R["record: id method headers query body size"] --> J[canonicalJson sorted keys]
    J --> H["SHA-384 prevSeal + json"]
    H --> S[stored seal]
    S --> V{inspector replay?}
    V -->|match| OK[seal ok]
    V -->|mismatch| BAD[seal BROKEN]
    classDef engine fill:#a78bfa,color:#04060c
    classDef agent fill:#34d399,color:#04060c
    classDef risk fill:#fb7185,color:#04060c
    class R,J,H engine
    class S,V,OK agent
    class BAD risk
```

## 🚀 Deployment pipeline

```mermaid
flowchart LR
    P[push to main] --> CI[Actions: lint + build]
    CI --> V[vercel --prod]
    V --> E[DATABASE_URL env]
    E --> H["/api/health 200"]
    H --> M[mutation proof: create bin + hook + read back]
    M --> L[live alias verified]
    classDef infra fill:#94a3b8,color:#04060c
    classDef live fill:#22d3ee,color:#04060c
    classDef agent fill:#34d399,color:#04060c
    class P,CI,V,E infra
    class H live
    class M,L agent
```

## 🧭 User-journey flow

```mermaid
flowchart TB
    L[land: create bin or fire demo] --> B[open bin: copy endpoint]
    B --> S[POST a webhook from anywhere]
    S --> W[watch it stream in live]
    W --> I[inspect + replay curl + export]
    I --> A[agent does it all via MCP]
    classDef live fill:#22d3ee,color:#04060c
    classDef engine fill:#a78bfa,color:#04060c
    classDef agent fill:#34d399,color:#04060c
    class L,B,S,W live
    class I engine
    class A agent
```

## 🚀 Quickstart

```bash
git clone https://github.com/aniruddhaadak80/hooklens.git
cd hooklens
npm install
```

Needs one env var — a Postgres URL (free at [neon.tech](https://neon.tech), then run the 3 `CREATE TABLE` statements from `src/lib` schema via the Neon SQL editor):

```bash
# .env.local
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
npm run dev   # open http://localhost:3000
```

Prod: `vercel env add DATABASE_URL production` (and CI secret `DATABASE_URL`).

## 🔌 API

```bash
BASE=https://hooklens-brown.vercel.app
curl -X POST $BASE/api/bins -H 'content-type: application/json' -d '{"name":"stripe"}'
# → {"bin":{"id":"bin_k7q2m9xd", ...}} — grab the id
curl -X POST $BASE/api/hook/bin_k7q2m9xd -H 'content-type: application/json' -d '{"type":"order.paid"}'
curl $BASE/api/bins/bin_k7q2m9xd/requests?limit=5   # read back the capture ↑
curl $BASE/api/bins/bin_k7q2m9xd/requests/req_xyz   # inspection + seal check
curl -O $BASE/api/bins/bin_k7q2m9xd/export          # download JSON
curl -X POST $BASE/api/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"create_bin","arguments":{"name":"agent"}}}}'
```

Agent setup (`mcp.json` block — full manifest in `public/mcp.json`):

```json
{
  "mcpServers": {
    "hooklens": { "url": "https://hooklens-brown.vercel.app/api/mcp", "transport": "json-rpc" }
  }
}
```

## 📁 Project map

| Path | What |
|---|---|
| `src/app/page.tsx` | `/` landing: create bin, fire demo, stats |
| `src/app/bins/page.tsx` | `/bins` dashboard: list, create, delete |
| `src/app/bins/[id]/page.tsx` | `/bins/:id` inspector: endpoint, curl, live stream, export, clear |
| `src/app/docs/page.tsx` | `/docs` REST + MCP docs + live console |
| `src/app/api/hook/[id]/route.ts` | Public catcher: any method → sealed capture |
| `src/app/api/bins*/route.ts` | CRUD bins, requests, export |
| `src/app/api/mcp/route.ts` | JSON-RPC: 5 tools incl. mutations |
| `src/lib/db.ts` / `inspect.ts` / `seal.ts` | Neon access, deterministic inspector, hash chain |

## 🗺️ Roadmap

- [x] **Now — catch + inspect + automate** (wow outcome = `curl` once, watch it stream in, replay it)
- [ ] **Next — saved replays & alerts** (wow outcome = re-fire any capture on a schedule, get notified on match)
- [ ] **Later — request diffing** (wow outcome = diff two captures side-by-side to spot breaking webhook changes)

```mermaid
flowchart LR
    C[capture] --> F[filters + search]
    F --> A[alerts on match]
    classDef live fill:#22d3ee,color:#04060c
    classDef engine fill:#a78bfa,color:#04060c
    class A engine
    class C,F live
```

```mermaid
flowchart TB
    R[saved replay] --> S[schedule]
    S --> N[notify on diff]
    classDef agent fill:#34d399,color:#04060c
    classDef engine fill:#a78bfa,color:#04060c
    class R engine
    class S,N agent
```

```mermaid
flowchart LR
    A[capture A] --> D[side-by-side diff]
    B[capture B] --> D
    classDef risk fill:#fb7185,color:#04060c
    classDef live fill:#22d3ee,color:#04060c
    class A,B live
    class D risk
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). MIT licensed — see [LICENSE](./LICENSE). Security notes in [SECURITY.md](./SECURITY.md).

> ⚠️ Debugging tool: bins are unlisted but unprotected — never POST real secrets, cards, or PII.
