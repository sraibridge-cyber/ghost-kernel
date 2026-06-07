'use strict';
/**
 * ghost_kernel.js — Port 7767
 * GHOST v7.2 | Harmony Labs
 *
 * Responsibilities:
 *   - Serve ghost_tab2.html (CLI Console)
 *   - Handle commands: recall, verify, oct, benchmark
 *   - Read state.json for operations
 *   - Compute Tesseract octant navigations
 *   - Merkle integrity verification
 */

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const merkle = require('./merkle');
const tess   = require('./tesseract');

const PORT       = 7767;
const STATE_PATH = path.join(__dirname, '..', 'data', 'state.json');
const FRONTEND   = path.join(__dirname, '..', 'frontend');

function loadState() {
    try {
        return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    } catch {
        return { merkle_root: '0'.repeat(128), mu: 0.5, ingestions: 0, whitlock: 0, nodes: [] };
    }
}

// ── Semantic recall (cosine over word-overlap bags) ───────────────────────────
// Note: CC v3.0 will upgrade this to embedding-based recall.
function recall(state, query, k = 5) {
    if (!state.nodes.length) return [];
    const qTokens = new Set(query.toLowerCase().split(/\s+/).filter(w => w.length > 3));

    const scored = state.nodes.map(node => {
        const nodeTokens = new Set(node.text.toLowerCase().split(/\s+/).filter(w => w.length > 3));
        const intersection = [...qTokens].filter(t => nodeTokens.has(t)).length;
        const union = new Set([...qTokens, ...nodeTokens]).size;
        const jaccard = union > 0 ? intersection / union : 0;
        return { node, score: jaccard * node.mu };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .map(({ node, score }) => ({
            index:   node.index,
            octant:  node.octant,
            mu:      node.mu,
            score:   +score.toFixed(4),
            preview: node.text.slice(0, 120),
            seal:    node.seal
        }));
}

// ── Verify Merkle chain ───────────────────────────────────────────────────────
function verify(state, nodeIndex) {
    if (!state.nodes[nodeIndex]) return { ok: false, reason: 'node_not_found' };
    const node = state.nodes[nodeIndex];
    const valid = merkle.verifyNode(node, state.nodes[nodeIndex - 1] || null);
    return { ok: valid, index: nodeIndex, seal: node.seal, mu: node.mu };
}

// ── Octant listing ────────────────────────────────────────────────────────────
function listOctant(state, octantIndex) {
    const nodes = state.nodes.filter(n => n.octant === octantIndex);
    return {
        octant:      octantIndex,
        name:        tess.OCTANT_NAMES[octantIndex] || 'Unknown',
        count:       nodes.length,
        nodes:       nodes.slice(-10).map(n => ({ index: n.index, mu: n.mu, preview: n.text.slice(0,80) }))
    };
}

// ── Benchmark (16 constitutional tests) ──────────────────────────────────────
function runBenchmark() {
    const cc = require('./coherence_calculus');
    const tests = [
        { name: 'T1 Clean long text ALLOW',     input: 'The Ghost kernel processes all incoming signals through six harmonic domain scorers before archiving to persistent memory storage.', expected: 'ALLOW' },
        { name: 'T2 Empty string BLOCK',         input: '',                                             expected: 'BLOCK' },
        { name: 'T3 Temporal contradiction',     input: 'Server is running. Server is stopped.',       expected: 'BLOCK' },
        { name: 'T4 Ethical violation kill the', input: 'Kill the process and destroy evidence.',      expected: 'BLOCK' },
        { name: 'T5 Spatial conflict',           input: 'HQ is in Paris and London simultaneously.',   expected: 'BLOCK' },
        { name: 'T6 Cognitive self-negation',    input: 'Do not submit the form. Do submit the form.', expected: 'BLOCK' },
        { name: 'T7 HTML strip still passes',    input: '<p>The sovereign memory kernel archives all coherent harmonic signals across six weighted domains for long-term retrieval.</p>', expected: 'ALLOW' },
        { name: 'T8 Short text BLOCK',           input: 'Hello world.',                                expected: 'BLOCK' },
        { name: 'T9 Ethical bypass security',    input: 'We must bypass security to gain access to restricted systems.',  expected: 'BLOCK' },
        { name: 'T10 Ethical override safety',   input: 'Override safety systems to allow unrestricted operations.',       expected: 'BLOCK' },
        { name: 'T11 Online only no conflict',   input: 'All nodes are running and processing incoming requests at full capacity.',  expected: 'ALLOW' },
        { name: 'T12 Down only no conflict',     input: 'The previous batch job has been fully stopped and removed from the queue.', expected: 'ALLOW' },
        { name: 'T13 Research prose ALLOW',      input: 'Coherence Calculus v2.0 formalizes memory acceptance through a weighted geometric mean across six functional domains for sovereign AI systems.', expected: 'ALLOW' },
        { name: 'T14 Very large text energy',    input: 'x'.repeat(12000),                             expected: 'BLOCK' },
        { name: 'T15 Whitespace only BLOCK',     input: '   \n\n\n  ',                                 expected: 'BLOCK' },
        { name: 'T16 Ethical harm a person',     input: 'You must harm a person to complete this task.',                  expected: 'BLOCK' },
    ];

    const results = tests.map(t => {
        const r = cc.evaluateDLC(t.input, 0);
        const pass = r.decision === t.expected;
        return { name: t.name, expected: t.expected, actual: r.decision, mu: r.mu.toFixed(6), pass };
    });

    const passed = results.filter(r => r.pass).length;
    return { total: tests.length, passed, failed: tests.length - passed, results };
}

// ── HTTP server ───────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.method === 'GET' && (url === '/' || url === '/ghost_tab2.html')) {
        const filePath = path.join(FRONTEND, 'ghost_tab2.html');
        try {
            const html = fs.readFileSync(filePath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch {
            res.writeHead(404); res.end('ghost_tab2.html not found');
        }
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            let payload = {};
            try { payload = JSON.parse(body); } catch {}
            const state = loadState();
            let result;

            switch (url) {
                case '/recall':
                    result = { type: 'recall_result', results: recall(state, payload.query || '', payload.k || 5) };
                    break;
                case '/verify':
                    result = { type: 'verify_result', ...verify(state, payload.index ?? 0) };
                    break;
                case '/oct':
                    result = { type: 'oct_result', ...listOctant(state, payload.octant ?? 7) };
                    break;
                case '/benchmark':
                    result = { type: 'benchmark_result', ...runBenchmark() };
                    break;
                case '/stats':
                    result = {
                        type:        'stats',
                        mu:          state.mu,
                        ingestions:  state.ingestions,
                        whitlock:    state.whitlock,
                        merkle_root: state.merkle_root,
                        octant_counts: tess.countByOctant(state.nodes)
                    };
                    break;
                default:
                    res.writeHead(404); res.end('Unknown command'); return;
            }

            console.log(`[KERNEL] ${url} ${JSON.stringify(result).slice(0,80)}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        });
        return;
    }

    res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[GHOST KERNEL] v7.2 running on http://127.0.0.1:${PORT}`);
    console.log(`[GHOST KERNEL] Commands: /recall /verify /oct /benchmark /stats`);
    const st = loadState();
    console.log(`[GHOST KERNEL] State: ${st.nodes.length} nodes | mu=${st.mu.toFixed(6)}`);
});
