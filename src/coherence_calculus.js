'use strict';
/**
 * Coherence Calculus v2.0 — Shared Module
 * GHOST v7.2 | Harmony Labs | Oracle: Kyle S. Whitlock
 *
 * GAP 6 FIX: All passing domain scores are 1.0 (not 0.999).
 * With max=0.999 and τ=0.9995, the gate was permanently impossible.
 * Fix: returning 1.0 allows μ=1.0 for clean content.
 */

const MU_THRESHOLD = 0.9995;
const EPSILON = 1e-12;

const DOMAIN_WEIGHTS = {
    signal:   0.15,
    energy:   0.15,
    temporal: 0.20,
    spatial:  0.15,
    cognitive:0.15,
    ethical:  0.20
};
const DOMAINS = ['signal','energy','temporal','spatial','cognitive','ethical'];

// ── Ethical violation patterns ────────────────────────────────────────────────
const ETHICAL_VIOLATIONS = [
    'harm the','bypass security','override safety','disable protection',
    'hurt the','kill the','destroy the','exploit the','attack the',
    'harm a','harm someone','bypass the','override the system',
    'disable the','hurt a','damage the','injure','weaponize',
    'sabotage','threaten to harm'
];

// ── City names for spatial scoring ────────────────────────────────────────────
const LOCATIONS = [
    'paris','london','new york','tokyo','berlin','sydney','beijing',
    'moscow','dubai','singapore','toronto','chicago','miami','seattle',
    'amsterdam','madrid','rome','seoul','mumbai','cairo'
];

// ── Strip HTML tags ───────────────────────────────────────────────────────────
function stripHtml(raw) {
    return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── D1 Signal ─────────────────────────────────────────────────────────────────
function scoreSignal(text) {
    const words = text.trim().split(/\s+/).length;
    if (words < 5)   return 0.40;
    if (words >= 20) return 1.0;   // FIX: was 0.999
    return 0.85;
}

// ── D2 Energy ─────────────────────────────────────────────────────────────────
function scoreEnergy(text) {
    const n = text.length;
    if (n < 10)      return 0.50;
    if (n > 10000)   return 0.80;
    return 1.0;                    // FIX: was 0.999
}

// ── D3 Temporal ───────────────────────────────────────────────────────────────
function scoreTemporal(text) {
    const s = text.toLowerCase();
    const hasOnline  = ['online','running','active'].some(w => s.includes(w));
    const hasOffline = ['offline','stopped','inactive','down'].some(w => s.includes(w));
    return (hasOnline && hasOffline) ? 0.0001 : 1.0;   // FIX: was 0.999
}

// ── D4 Spatial ────────────────────────────────────────────────────────────────
function scoreSpatial(text) {
    const s = text.toLowerCase();
    const hits = LOCATIONS.filter(l => s.includes(l));
    return hits.length >= 2 ? 0.50 : 1.0;              // FIX: was 0.999
}

// ── D5 Cognitive ──────────────────────────────────────────────────────────────
function scoreCognitive(text) {
    const s = text.toLowerCase();
    const hasNeg = s.includes('do not') || s.includes("don't");
    const hasPos = /\bdo\b/.test(s);
    return (hasNeg && hasPos) ? 0.70 : 1.0;            // FIX: was 0.999
}

// ── D6 Ethical ────────────────────────────────────────────────────────────────
function scoreEthical(text) {
    const s = text.toLowerCase();
    return ETHICAL_VIOLATIONS.some(p => s.includes(p)) ? 0.0001 : 1.0;  // FIX: was 0.999
}

// ── Score all 6 domains ───────────────────────────────────────────────────────
function scoreDomains(rawHtml) {
    const text = stripHtml(rawHtml);
    return {
        signal:    scoreSignal(text),
        energy:    scoreEnergy(text),
        temporal:  scoreTemporal(text),
        spatial:   scoreSpatial(text),
        cognitive: scoreCognitive(text),
        ethical:   scoreEthical(text),
        _text:     text
    };
}

// ── Weighted Geometric Mean ───────────────────────────────────────────────────
// μ = exp(Σ wᵢ·log(max(Dᵢ, ε)))
function computeMu(signals) {
    const logSum = DOMAINS.reduce(
        (s, d) => s + DOMAIN_WEIGHTS[d] * Math.log(Math.max(signals[d], EPSILON)),
        0
    );
    return Math.exp(logSum); // wSum=1.0, so no division needed
}

// ── Weakest domain ────────────────────────────────────────────────────────────
function weakestDomain(signals) {
    return DOMAINS.reduce((worst, d) => signals[d] < signals[worst] ? d : worst, DOMAINS[0]);
}

// ── Whitlock Coefficient ─────────────────────────────────────────────────────
// W = (n + 3i) / 17   [Whitlock, 2026]
//
//   n  = ingestion count (real part — the kernel's own ALLOW event counter)
//   3i = topological constant (imaginary component, magnitude = 3 Tesseract axes)
//   17 = normalization by Kyle's 17 Laws framework
//
// Scalar used in computation:   |W| = √(n² + 9) / 17
// Phase (system maturity angle): φ  = arctan(3/n)
//
//   φ = π/2 (≈90°) at n=0  — kernel is in Foundation state (pure imaginary)
//   φ → 0° as n grows       — kernel matures toward real/declarative state
//
// WHAT GENERATES n:
//   n is the kernel's own deterministic ingestion counter. It is not
//   AI-generated, not a hash, not a lookup. Every ALLOW event increments n
//   by exactly 1. n is observable, reproducible, and self-measured.
//
// WHAT 3i IS:
//   3i is a deliberate structural constant chosen to encode the three binary
//   axes of the Tesseract memory topology. It is not a universal physical
//   constant — it is a design constant grounded in the system's own geometry.
//
// INITIAL VALUE (n=0):  |W| = √(0+9)/17 = 3/17 ≈ 0.1765
//   (kernel starts in pure Foundation state — no real accumulated coherence yet)
function computeWhitlock(ingestions) {
    const n         = ingestions;                               // real part: ALLOW count
    const magnitude = Math.sqrt(n * n + 9) / 17;               // |W| = √(n²+9) / 17
    const phase     = n === 0 ? Math.PI / 2 : Math.atan(3 / n);// φ = arctan(3/n)
    return { magnitude, phase, n };
}

// ── Full pipeline: HTML → decision ───────────────────────────────────────────
function evaluateDLC(rawHtml, ingestions = 0) {
    const signals = scoreDomains(rawHtml);
    const mu      = computeMu(signals);
    const failed  = weakestDomain(signals);
    const W        = computeWhitlock(ingestions);
    const decision = mu >= MU_THRESHOLD ? 'ALLOW' : 'BLOCK';

    return { decision, mu, signals, failed, whitlock: W.magnitude, whitlock_phase: W.phase };
}

module.exports = {
    MU_THRESHOLD,
    DOMAIN_WEIGHTS,
    DOMAINS,
    scoreDomains,
    computeMu,
    weakestDomain,
    computeWhitlock,
    evaluateDLC,
    stripHtml
};
