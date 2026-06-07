'use strict';
/**
 * ghost_face.js — Port 7766
 * GHOST v7.2 | Harmony Labs
 *
 * Responsibilities:
 *   - Serve ghost_tab1.html (Midnight Grimoire v2.1 dashboard)
 *   - Receive devour events from browser via POST /devour
 *   - Run CC v2.0 scorer pipeline
 *   - Write accepted nodes to state.json (shared IPC with ghost_kernel.js)
 *   - Return INTEN_SIGNAL or INGESTION_BLOCK to browser
 */

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const cc     = require('./coherence_calculus');
const merkle = require('./merkle');
const tess   = require('./tesseract');

const PORT       = 7766;
const STATE_PATH = path.join(__dirname, '..', 'data', 'state.json');
const FRONTEND   = path.join(__dirname, '..', 'frontend');

// ── State helpers ─────────────────────────────────────────────────────────────

function loadState() {
    try {
        return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    } catch {
        return { merkle_root: '0'.repeat(128), mu: 0.5, ingestions: 0, whitlock: 0, nodes: [] };
    }
}

function saveState(state) {
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

// ── HTTP server ───────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];

    // ── CORS headers for local dev ─────────────────────────────────────────
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // ── GET / → serve ghost_tab1.html ─────────────────────────────────────
    if (req.method === 'GET' && (url === '/' || url === '/ghost_tab1.html')) {
        const filePath = path.join(FRONTEND, 'ghost_tab1.html');
        try {
            const html = fs.readFileSync(filePath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch {
            res.writeHead(404); res.end('ghost_tab1.html not found');
        }
        return;
    }

    // ── GET /state → current state snapshot ───────────────────────────────
    if (req.method === 'GET' && url === '/state') {
        const st = loadState();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mu: st.mu, ingestions: st.ingestions, whitlock: st.whitlock, merkle_root: st.merkle_root }));
        return;
    }

    // ── POST /devour → ingest DLC fragment ────────────────────────────────
    if (req.method === 'POST' && url === '/devour') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { rawHTML, id } = JSON.parse(body);
                const state = loadState();

                const result = cc.evaluateDLC(rawHTML || '', state.ingestions);
                console.log(`[FACE] ${result.decision} id=${id || '?'} mu=${result.mu.toFixed(6)} domain=${result.failed}`);

                let response;
                if (result.decision === 'ALLOW') {
                    state.ingestions++;
                    state.mu      = 0.3 * state.mu + 0.7 * result.mu; // EMA
                    state.whitlock = result.whitlock;

                    // Build memory node
                    const prevNode  = state.nodes[state.nodes.length - 1] || null;
                    const octant    = tess.assignOctant(result.signals);
                    const node      = merkle.buildNode({
                        index:     state.nodes.length,
                        text:      result.signals._text,
                        mu:        result.mu,
                        domains:   result.signals,
                        whitlock:  result.whitlock,
                        octant,
                        prevNode
                    });
                    state.nodes.push(node);
                    state.merkle_root = merkle.computeRoot(state.nodes);
                    saveState(state);

                    response = {
                        type:       'INTEN_SIGNAL',
                        mu:         state.mu,
                        whitlock:   state.whitlock,
                        ingestions: state.ingestions,
                        seal:       node.seal,
                        octant,
                        status:     'INTERNALIZED',
                        domains:    result.signals
                    };
                } else {
                    response = {
                        type:          'INGESTION_BLOCK',
                        reason:        'mu_below_threshold',
                        failed_domain: result.failed,
                        mu:            result.mu,
                        domains:       result.signals
                    };
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
            } catch (e) {
                console.error('[FACE] Error:', e.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    // ── POST /probe → state readout ────────────────────────────────────────
    if (req.method === 'POST' && url === '/probe') {
        const st = loadState();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ type: 'probe_ack', mu: st.mu, ingestions: st.ingestions, whitlock: st.whitlock, ts: Date.now() }));
        return;
    }

    // ── POST /reset → clear state ──────────────────────────────────────────
    if (req.method === 'POST' && url === '/reset') {
        saveState({ merkle_root: '0'.repeat(128), mu: 0.5, ingestions: 0, whitlock: 0, nodes: [] });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ type: 'RESET_ACK', ts: Date.now() }));
        return;
    }

    res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[GHOST FACE] v7.2 running on http://127.0.0.1:${PORT}`);
    console.log(`[GHOST FACE] Open ghost_tab1.html in browser`);
    const st = loadState();
    console.log(`[GHOST FACE] State: mu=${st.mu.toFixed(6)} ingestions=${st.ingestions}`);
});
