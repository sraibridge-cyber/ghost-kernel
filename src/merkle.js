'use strict';
/**
 * merkle.js — SHA3-512 Merkle Integrity Chain
 * GHOST v7.2 | Harmony Labs
 *
 * Requires: npm install js-sha3
 *
 * Each node seals its content and chains to the previous node's hash,
 * forming an immutable cryptographic chain of custody.
 */

const { sha3_512 } = require('js-sha3');

// ── Build a single memory node ────────────────────────────────────────────────
function buildNode({ index, text, mu, domains, whitlock, octant, prevNode }) {
    const payload = JSON.stringify({ index, text, mu, domains, whitlock, octant });
    const seal_full  = sha3_512(payload);
    const seal       = seal_full.slice(0, 16);
    const prev_hash  = prevNode ? prevNode.seal_full : '0'.repeat(128);

    return {
        index,
        text,
        mu,
        domains,
        whitlock,
        octant,
        timestamp: Date.now(),
        seal,
        seal_full,
        prev_hash
    };
}

// ── Compute Merkle root from all nodes ────────────────────────────────────────
function computeRoot(nodes) {
    if (!nodes.length) return '0'.repeat(128);
    const combined = nodes.map(n => n.seal_full).join('');
    return sha3_512(combined);
}

// ── Verify a single node's integrity ─────────────────────────────────────────
function verifyNode(node, prevNode) {
    const payload = JSON.stringify({
        index:    node.index,
        text:     node.text,
        mu:       node.mu,
        domains:  node.domains,
        whitlock: node.whitlock,
        octant:   node.octant
    });
    const expectedSealFull = sha3_512(payload);
    const expectedPrevHash = prevNode ? prevNode.seal_full : '0'.repeat(128);

    return (
        expectedSealFull === node.seal_full &&
        node.seal === node.seal_full.slice(0, 16) &&
        expectedPrevHash === node.prev_hash
    );
}

module.exports = { buildNode, computeRoot, verifyNode };
