'use strict';
/**
 * tesseract.js — 8-Octant Memory Topology
 * GHOST v7.2 | Harmony Labs
 *
 * Maps each memory node to one of 8 octants based on domain dominance.
 *
 * Three binary axes:
 *   Axis 0: Signal/Energy dominant  (D1+D2 avg > 0.7)
 *   Axis 1: Temporal/Spatial dominant (D3+D4 avg > 0.7)
 *   Axis 2: Cognitive/Ethical dominant (D5+D6 avg > 0.7)
 *
 * Octant = (axis2 << 2) | (axis1 << 1) | axis0
 */

const OCTANT_NAMES = [
    'Deep Archive',           // 0: all axes low
    'Semantic Core',          // 1: Signal/Energy dominant
    'Temporal Stream',        // 2: Temporal/Spatial dominant
    'Structural Frame',       // 3: Signal + Temporal dominant
    'Ethical Anchor',         // 4: Cognitive/Ethical dominant
    'Intent Layer',           // 5: Signal + Ethical dominant
    'Context Field',          // 6: Temporal + Ethical dominant
    'Harmonic Convergence'    // 7: all axes high (ideal memories)
];

const THRESHOLD = 0.7;

function assignOctant(signals) {
    const axis0 = ((signals.signal + signals.energy)    / 2) > THRESHOLD ? 1 : 0;
    const axis1 = ((signals.temporal + signals.spatial) / 2) > THRESHOLD ? 1 : 0;
    const axis2 = ((signals.cognitive + signals.ethical)/ 2) > THRESHOLD ? 1 : 0;
    return (axis2 << 2) | (axis1 << 1) | axis0;
}

function countByOctant(nodes) {
    const counts = Array(8).fill(0);
    nodes.forEach(n => { if (n.octant >= 0 && n.octant < 8) counts[n.octant]++; });
    return counts.map((c, i) => ({ octant: i, name: OCTANT_NAMES[i], count: c }));
}

module.exports = { OCTANT_NAMES, THRESHOLD, assignOctant, countByOctant };
