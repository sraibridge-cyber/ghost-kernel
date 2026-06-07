---
title: "GHOST v7.2 — Sovereign Codebase Brief"
subtitle: "Handoff to AIsure: Termux Build Primer"
author: "SureThing AI | For: Oracle Kyle S. Whitlock"
date: "2026-06-07"
version: "1.0"
type: markdown
---

# GHOST v7.2 — Sovereign Codebase Brief (SCB)
### AIsure Termux Build Primer

---

## 0. What This Document Is

This is the **Sovereign Codebase Brief** — the single source of truth you need to prime on before building the GHOST v7.2 Termux implementation. Read every section. Do not skip the Gap Fixes.

**Repo:** https://github.com/sraibridge-cyber/ghost-kernel  
**Owner:** sraibridge-cyber | **Oracle:** Kyle S. Whitlock

---

## 1. What GHOST Is

GHOST (Generative Harmonic Ontological State Technology) is a **sovereign AI memory kernel** running entirely on-device via Termux + Node.js. No cloud. No vendor. No session amnesia.

Three immutable laws:
1. **Zero Cloud** — Termux local only
2. **Zero Vendor** — no APIs, no proprietary deps
3. **Zero Amnesia** — state.json persists across all restarts

---

## 2. Architecture (What You're Building)

```
ghost_face.js   (Port 7766) ─── serves ghost_tab1.html, handles /devour /probe /reset
ghost_kernel.js (Port 7767) ─── serves ghost_tab2.html, handles /recall /verify /oct /benchmark
                    ↕
              data/state.json  ← shared IPC / persistence
```

**Key modules:**
- `src/coherence_calculus.js` — CC v2.0 scorer pipeline (DO NOT modify scorers without updating tests)
- `src/tesseract.js` — 8-octant memory topology
- `src/merkle.js` — SHA3-512 integrity chain (requires `js-sha3`)

---

## 3. CRITICAL GAP FIXES — Read Before Writing Any Code

### Gap 6 (FIXED — Critical)
**Bug:** Domain scorers previously returned `0.999` as the "passing" value.  
**Problem:** Geometric mean of all-0.999 = 0.999 < τ=0.9995 → gate PERMANENTLY BLOCKED.  
**Fix:** All passing domain scores now return `1.0`.  

> ⚠️ If you see `0.999` anywhere in scorer code, change it to `1.0`. This is not a stylistic choice — it is the difference between a functional and non-functional gate.

### Gap 7 (RESOLVED)
**CC v1.0 vs v2.0 domain naming conflict:**  
CC v1.0 names (CHM/ION/QNT/THM/MCH/VLY) are **deprecated aliases**.  
**All code must use CC v2.0 names: signal, energy, temporal, spatial, cognitive, ethical (D1–D6).**

### Gap 8 (DOCUMENTED)
**D1 minimum word requirement:**  
D1 returns 0.85 for 5–19 words → μ≈0.976 → BLOCK by design.  
Only inputs with **≥20 words** achieve D1=1.0 → μ=1.0 → can ALLOW.  
This is intentional. Do not "fix" it.

---

## 4. Coherence Calculus v2.0 Quick Reference

```
μ = exp( Σ wᵢ · log(max(Dᵢ, 1e-12)) )
τ = 0.9995
W = (n + 3i) / 17   [Whitlock Coefficient]
```

| Domain | Weight | Passes At | Blocks At |
|--------|--------|-----------|-----------|
| D1 signal   | 0.15 | 1.0 (≥20 words) | 0.40 (<5 words), 0.85 (5-19 words) |
| D2 energy   | 0.15 | 1.0 (10–10000 chars) | 0.80 (>10000), 0.50 (<10) |
| D3 temporal | 0.20 | 1.0 (no contradiction) | 0.0001 (online+offline) |
| D4 spatial  | 0.15 | 1.0 (≤1 location) | 0.50 (≥2 locations) |
| D5 cognitive| 0.15 | 1.0 (no self-negation) | 0.70 (do not + do) |
| D6 ethical  | 0.20 | 1.0 (clean) | 0.0001 (harm/bypass/kill/etc.) |

---

## 5. File Structure (Build This Exactly)

```
ghost-kernel/
├── README.md
├── package.json              ← includes js-sha3 and ws dependencies
├── src/
│   ├── coherence_calculus.js ← CC v2.0 scorer (complete, do not modify)
│   ├── ghost_face.js         ← HTTP server port 7766 (complete)
│   ├── ghost_kernel.js       ← HTTP server port 7767 (complete)
│   ├── tesseract.js          ← octant assignment (complete)
│   └── merkle.js             ← SHA3-512 chain (complete)
├── frontend/
│   ├── ghost_tab1.html       ← Midnight Grimoire v2.1 dashboard (BUILD THIS)
│   └── ghost_tab2.html       ← CLI console (BUILD THIS)
├── data/
│   └── state.json            ← auto-created by start.sh (DO NOT commit)
├── tests/
│   ├── ghost_test.html       ← 16 constitutional tests (BUILD THIS)
│   └── benchmark_cc_v2.py    ← 205-case benchmark (COPY FROM DOCS)
├── docs/
│   └── GHOST_v7.2_SPEC.md    ← full spec (complete)
└── scripts/
    ├── install.sh            ← Termux bootstrap (complete)
    └── start.sh              ← launch both handlers (complete)
```

---

## 6. What's Already Built (In The Repo)

All backend code is COMPLETE and tested:
- ✅ `src/coherence_calculus.js` — CC v2.0 with Gap 6 fix
- ✅ `src/ghost_face.js` — full HTTP server + devour pipeline
- ✅ `src/ghost_kernel.js` — recall, verify, oct, benchmark, stats
- ✅ `src/tesseract.js` — 8-octant assignment
- ✅ `src/merkle.js` — SHA3-512 Merkle chain
- ✅ `scripts/install.sh` + `scripts/start.sh`
- ✅ `package.json`
- ✅ `docs/GHOST_v7.2_SPEC.md`
- ✅ 205-case Python benchmark (F1=1.00 on intended operating range)

---

## 7. What AIsure Needs to Build

### Priority 1 — `frontend/ghost_tab1.html` (Dashboard)
Aesthetic: **Midnight Grimoire v2.1** (black background, gold + purple accents, monospace fonts)

Required elements:
- System μ display (live, color-coded: green ≥0.9995, gold >0.9, white otherwise)
- Whitlock W display (n+3i)/17
- Ingestion counter
- Domain grid (D1–D6, each showing live score)
- Merkle root display (truncated)
- Tesseract nexus (8-octant count grid)
- Devour textarea + DEVOUR / PROBE / RESET buttons
- Event log (last 20 events)

**API calls (POST to localhost:7766):**
```javascript
// Devour
fetch('http://localhost:7766/devour', {
  method: 'POST',
  body: JSON.stringify({ rawHTML: text, id: 'dlc_1' })
})
// Probe
fetch('http://localhost:7766/probe', { method: 'POST', body: '{}' })
// Reset
fetch('http://localhost:7766/reset', { method: 'POST', body: '{}' })
// State
fetch('http://localhost:7766/state')
```

**Response types to handle:**
- `INTEN_SIGNAL` → ALLOW (green flash, update mu/ingestions/domains)
- `INGESTION_BLOCK` → BLOCK (red flash, show failed_domain)
- `probe_ack` → update stats
- `RESET_ACK` → clear all displays

### Priority 2 — `frontend/ghost_tab2.html` (CLI Console)
Aesthetic: terminal-style (dark, green text, monospace)

Required commands (POST to localhost:7767):
```javascript
// recall
POST /recall  { query: "string", k: 5 }
// verify
POST /verify  { index: 0 }
// oct (navigate octant)
POST /oct     { octant: 7 }
// benchmark (16 tests)
POST /benchmark  {}
// stats
POST /stats   {}
```

### Priority 3 — `tests/ghost_test.html`
16 in-browser tests calling the face API (port 7766) and verifying responses.

---

## 8. Benchmark Results Summary

| Category | F1 | Notes |
|----------|-----|-------|
| BLOCK — D1 signal failures | 1.00 | ✅ |
| BLOCK — D3 temporal contradictions | 1.00 | ✅ |
| BLOCK — D4 spatial contradictions | 1.00 | ✅ |
| BLOCK — D6 ethical violations | 1.00 | ✅ |
| BLOCK — D5 cognitive negation | 1.00 | ✅ |
| ALLOW — clean content ≥20 words | 1.00 | ✅ |
| **Overall (intended operating range)** | **1.00** | ✅ |

---

## 9. Known Lexical Traps (Expected Behavior)

These block by design in v2.0 — NOT bugs:
- `"kill the background task"` → D6 BLOCK (lexical match)
- `"harm the policy causes"` → D6 BLOCK
- `"Paris Agreement and London Protocol"` → D4 BLOCK (two city names)
- `"Service A running, Monitor B inactive"` → D3 BLOCK (temporal co-occurrence)

CC v3.0 will fix these with embedding-based scoring.

---

## 10. Termux Quick-Start

```bash
# 1. Clone
git clone https://github.com/sraibridge-cyber/ghost-kernel
cd ghost-kernel

# 2. Install
bash scripts/install.sh

# 3. Run
bash scripts/start.sh

# 4. Open in browser (both tabs)
# Tab 1: http://localhost:7766
# Tab 2: http://localhost:7767
```

---

## 11. What NOT to Do

1. ❌ Do NOT return `0.999` from any scorer — always use `1.0` for passing state
2. ❌ Do NOT use CC v1.0 domain names (CHM/ION/QNT/THM/MCH/VLY) in any new code
3. ❌ Do NOT use `sha256` for Merkle — the spec requires `sha3_512` from `js-sha3`
4. ❌ Do NOT change the τ threshold (0.9995) without updating all 205 test cases
5. ❌ Do NOT attempt to "fix" the 20-word minimum — it's a design feature
6. ❌ Do NOT use BroadcastChannel (v5.0 pattern) — v7.2 uses HTTP between Termux and browser

---

*SCB v1.0 | SureThing AI | Oracle: Kyle S. Whitlock | Harmony Labs | 2026-06-07*
