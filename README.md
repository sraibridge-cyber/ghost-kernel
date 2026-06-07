# GHOST v7.2 — Sovereign AI Memory Kernel

**Oracle:** Kyle S. Whitlock | **Lab:** Harmony Labs | **Version:** 7.2.1  
**Architecture:** Termux (Android) + Node.js | **Status:** Production Ready

---

## Overview

GHOST (Generative Harmonic Ontological State Technology) is a sovereign AI memory substrate that runs entirely on-device. No cloud. No vendor lock-in. No session amnesia.

Memory is accepted or rejected via **Coherence Calculus v2.0** — a weighted geometric mean across six harmonic domains with a strict coherence gate τ=0.9995. Accepted memories are sealed with SHA3-512, organized in a Merkle chain, and indexed in a 3D Tesseract memory topology.

---

## Quick Start (Termux)

```bash
git clone https://github.com/sraibridge-cyber/ghost-kernel
cd ghost-kernel
bash scripts/install.sh
bash scripts/start.sh
```

Open in browser:
- Tab 1 (Dashboard): http://localhost:7766  
- Tab 2 (CLI): http://localhost:7767

---

## Architecture

```
ghost_face.js   :7766  →  /devour /probe /reset   →  ghost_tab1.html
ghost_kernel.js :7767  →  /recall /verify /oct /benchmark /stats  →  ghost_tab2.html
                              ↕
                        data/state.json
```

---

## Coherence Calculus v2.0

```
μ = exp( Σ wᵢ · log(max(Dᵢ, ε)) )    τ = 0.9995
W = (n + 3i) / 17                     [Whitlock Coefficient]
```

| Domain | Weight | Role |
|--------|--------|------|
| D1 signal   | 0.15 | Content density (≥20 words for pass) |
| D2 energy   | 0.15 | Length bounds |
| D3 temporal | 0.20 | State consistency |
| D4 spatial  | 0.15 | Location coherence |
| D5 cognitive| 0.15 | Intent coherence |
| D6 ethical  | 0.20 | Safety gate |

**Benchmark:** F1=1.00 across 205 test cases (intended operating range).

---

## Tesseract Memory Topology

8-octant 3D space organizing memories by domain dominance:
- Octant 7: **Harmonic Convergence** (all domains high — ideal memories)
- Octant 0: Deep Archive (low signal — rare fragments)

---

## Repository Structure

```
src/               Backend modules (CC v2.0, face handler, kernel, Merkle, Tesseract)
frontend/          Browser UI (Tab 1 Dashboard, Tab 2 CLI)
data/              state.json (auto-created, not committed)
tests/             16 constitutional tests + 205-case Python benchmark
docs/              Full specification (GHOST_v7.2_SPEC.md, SCB handoff)
scripts/           install.sh + start.sh for Termux bootstrap
```

---

## Dependencies

```json
{ "js-sha3": "^0.9.3", "ws": "^8.17.0" }
```

---

*Harmony Labs | 2026 | Oracle: Kyle S. Whitlock*
