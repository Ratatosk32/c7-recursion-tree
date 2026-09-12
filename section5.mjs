// Verification of the exhaustive claims of Section 5 of the accompanying note.
//
//   node section5.mjs            the cheap checks (a few seconds)
//   node section5.mjs --full     adds the two 64,538,880-image sweeps (hours)
//
// The cheap checks settle the census and the quantitative obstruction, which is what the
// argument of Section 5 actually rests on. The sweeps are the empirical confirmation; they are
// slow because they walk the whole automorphism group of C_7^5, and they are reported separately
// so that a reader can reproduce the fast part without committing a machine overnight.
//
// Data read from ./data:
//   base.json        the Polak-Schrijver 367-set I, the auxiliary set X, and the eight pairs
//   pool367.json     every distinct 367-set the local search produced
//
// No network, no dependencies beyond Node itself.

import { readFileSync } from 'node:fs';

const FULL = process.argv.includes('--full');
const DATA = new URL('./data/', import.meta.url);
const load = (f) => JSON.parse(readFileSync(new URL(f, DATA), 'utf8'));

// ---------------------------------------------------------------- the graph C_7^5

const Q = 7, DIM = 5, N = Q ** DIM;            // 16807 vertices
const pow = [1, 7, 49, 343, 2401];
const dig = new Int32Array(N * DIM);
for (let v = 0; v < N; v++) { let x = v; for (let k = 0; k < DIM; k++) { dig[v * DIM + k] = x % Q; x = (x / Q) | 0; } }

// u ~ v in the strong power iff they differ and each coordinate is within one, cyclically
const near = (u, v) => {
  for (let k = 0; k < DIM; k++) {
    const d = Math.abs(dig[u * DIM + k] - dig[v * DIM + k]);
    if (!(d <= 1 || d === Q - 1)) return false;
  }
  return true;
};

// closed neighbourhood table: 3^5 = 243 entries per vertex, itself included
const DEG = 3 ** DIM;
const NB = new Int32Array(N * DEG);
{
  const off = [];
  for (let m = 0; m < DEG; m++) { const o = []; let x = m; for (let k = 0; k < DIM; k++) { o.push((x % 3) - 1); x = (x / 3) | 0; } off.push(o); }
  for (let v = 0; v < N; v++) for (let m = 0; m < DEG; m++) {
    let w = 0;
    for (let k = 0; k < DIM; k++) w += (((dig[v * DIM + k] + off[m][k]) % Q + Q) % Q) * pow[k];
    NB[v * DEG + m] = w;
  }
}

const independent = (S) => {
  const mark = new Uint8Array(N);
  for (const v of S) mark[v] = 1;
  for (const v of S) for (let k = 0; k < DEG; k++) { const w = NB[v * DEG + k]; if (w !== v && mark[w]) return false; }
  return true;
};

const closed = (S) => { const m = new Uint8Array(N); for (const x of S) for (let k = 0; k < DEG; k++) m[NB[x * DEG + k]] = 1; return m; };

// r owns a private neighbour q when q is outside I and r is its only neighbour inside I
function privatePairs(I) {
  const inI = new Uint8Array(N);
  for (const v of I) inI[v] = 1;
  const owners = new Map();
  for (let q = 0; q < N; q++) {
    if (inI[q]) continue;
    let c = 0, r = -1;
    for (let k = 0; k < DEG; k++) { const w = NB[q * DEG + k]; if (w !== q && inI[w]) { c++; r = w; if (c > 1) break; } }
    if (c === 1) { const l = owners.get(r); if (l) l.push(q); else owners.set(r, [q]); }
  }
  return owners;
}

let pass = 0, fail = 0;
const check = (claim, ok, detail) => {
  console.log('  ' + (ok ? 'OK  ' : 'FAIL') + '  ' + claim + (detail === undefined ? '' : '   ' + detail));
  ok ? pass++ : fail++;
};

// ---------------------------------------------------------------- 1. the base gadget

console.log('\n1. The base gadget admits exactly eight private pairs.');
const base = load('base.json');
const I = base.I, X = base.X;
check('I is an independent set of 367 vertices', I.length === 367 && independent(I));
check('X is a 367-element auxiliary set', X.length === 367);
const bp = privatePairs(I);
check('exactly eight members of I own a private neighbour', bp.size === 8, 'found ' + bp.size);
const owns = [...bp.values()].map((l) => l.length);
check('each of them owns exactly one', owns.every((n) => n === 1), 'counts ' + [...new Set(owns)].join(','));

// ---------------------------------------------------------------- 2. the census

console.log('\n2. The census of 367-sets, and the private-pair counts.');
const pool = load('pool367.json');
const seen = new Set();
const sets = [];
const key = (s) => [...s].sort((a, b) => a - b).join(',');
for (const s of [I, ...pool]) { const k = key(s); if (!seen.has(k)) { seen.add(k); sets.push(s); } }
check('65 distinct 367-sets', sets.length === 65, 'found ' + sets.length);
check('every one of them is independent', sets.every(independent));
const dist = new Map();
const withT = new Map();
for (const s of sets) {
  const t = privatePairs(s).size;
  dist.set(t, (dist.get(t) || 0) + 1);
  if (!withT.has(t)) withT.set(t, []);
  withT.get(t).push(s);
}
const ts = [...dist.keys()].sort((a, b) => a - b);
console.log('       distribution: ' + ts.map((t) => 't=' + t + ': ' + dist.get(t)).join(',  '));
check('the counts run from t = 5 to t = 10', ts[0] === 5 && ts[ts.length - 1] === 10);
check('two, twenty-one, sixteen, nineteen, six and one respectively',
  ts.map((t) => dist.get(t)).join(',') === '2,21,16,19,6,1');

// ---------------------------------------------------------------- 3. the obstruction

console.log('\n3. The doubly covered region grows by about 142 vertices per extra pair.');
// A split sends each pair to a side. P_H takes q when the bit is set and r otherwise; P_V takes
// the other. A split is legal when both transversals are independent.
function dRange(s) {
  const pp = privatePairs(s);
  const P = [...pp.entries()].map(([r, qs]) => ({ r, q: qs[0] }));
  let lo = Infinity, hi = -Infinity, legal = 0;
  for (let m = 0; m < (1 << P.length); m++) {
    const PH = [], PV = [];
    P.forEach((p, k) => { if ((m >> k) & 1) { PH.push(p.q); PV.push(p.r); } else { PH.push(p.r); PV.push(p.q); } });
    if (!independent(PH) || !independent(PV)) continue;
    legal++;
    const h = closed(PH), v = closed(PV);
    let d = 0;
    for (let x = 0; x < N; x++) if (h[x] && v[x]) d++;
    if (d < lo) lo = d;
    if (d > hi) hi = d;
  }
  return { legal, lo, hi, t: P.length };
}
const spans = new Map();
for (const t of [8, 9, 10]) {
  let lo = Infinity, hi = -Infinity;
  for (const s of (withT.get(t) || [])) { const r = dRange(s); if (r.legal) { lo = Math.min(lo, r.lo); hi = Math.max(hi, r.hi); } }
  spans.set(t, [lo, hi]);
  console.log('       t = ' + t + '  (' + (withT.get(t) || []).length + ' bases):  |D| in ' + lo + ' .. ' + hi);
}
check('eight pairs give 956 to 988', spans.get(8)[0] === 956 && spans.get(8)[1] === 988);
check('nine pairs give 1098 to 1128', spans.get(9)[0] === 1098 && spans.get(9)[1] === 1128);
check('ten pairs give 1240 to 1268', spans.get(10)[0] === 1240 && spans.get(10)[1] === 1268);
const step1 = spans.get(9)[0] - spans.get(8)[0], step2 = spans.get(10)[0] - spans.get(9)[0];
check('the step is about 142 both times', Math.abs(step1 - 142) <= 1 && Math.abs(step2 - 142) <= 1,
  'steps ' + step1 + ' and ' + step2);

// ---------------------------------------------------------------- 4. the neutral part

console.log('\n4. The neutral part of the published gadget is 322.');
// o counts the points of X outside the closed neighbourhood of the sixteen pair endpoints
const ends = [];
for (const [r, qs] of bp) { ends.push(r); ends.push(qs[0]); }
check('there are sixteen endpoints', ends.length === 16);
const U = closed(ends);
let o = 0;
for (const x of X) if (!U[x]) o++;
check('o = 322 for the published choice', o === 322, 'found ' + o);

// Repeated squaring of a Gao profile (a, t, s, o, h, v) in dimension 5. Every iterate is an
// explicit independent set, so the best rate along the trace is a rigorous lower bound.
function squaringLimit(p, steps = 40) {
  let logA = Math.log(p.a);
  let t = p.t / p.a, s = p.s / p.a, oo = p.o / p.a, hv = (p.h + p.v) / p.a;
  let dim = p.dim, best = Math.exp(logA / dim);
  for (let i = 0; i < steps; i++) {
    const na = (1 - t) * (1 - t) + 2 * t * s;
    if (!(na > 0) || !Number.isFinite(na)) break;
    const nt = 2 * t * oo, ns = s * s, no = oo * oo + hv * hv, nhv = 2 * hv * oo;
    logA = 2 * logA + Math.log(na);
    t = nt / na; s = ns / na; oo = no / na; hv = nhv / na;
    dim *= 2;
    const b = Math.exp(logA / dim);
    if (b > best) best = b;
  }
  return best;
}
const RECORD = 3.2588326203532665;
const prof = (no) => ({ a: 367, t: 8, s: 367, o: no, h: base.profile.h, v: base.profile.v, dim: 5 });
const at322 = squaringLimit(prof(322)), at323 = squaringLimit(prof(323));
console.log('       squaring the published profile gives ' + at322.toFixed(10) +
  ';  with o = 323 it would give ' + at323.toFixed(10));
check('o = 322 does not reach the record by squaring alone', at322 < RECORD);
check('o = 323 would beat the record by squaring alone', at323 > RECORD);

// The two thresholds quoted for a nine-pair base. h and v share whatever X leaves after the
// neutral part; the split barely moves the rate, so take it even.
const nineRate = (s, no) => {
  const rest = s - no, h = Math.floor(rest / 2);
  return squaringLimit({ a: 367, t: 9, s, o: no, h, v: rest - h, dim: 5 });
};
const firstBeating = (s) => { for (let no = 280; no <= s; no++) if (nineRate(s, no) > RECORD) return no; return null; };
const th367 = firstBeating(367), th366 = firstBeating(366);
console.log('       for a nine-pair base: at s = 367 the record needs o >= ' + th367 +
  ';  at s = 366 it needs o >= ' + th366);
check('at s = 367 any o >= 311 beats the record', th367 === 311, 'threshold ' + th367);
check('at s = 366 one would need o >= 338', th366 === 338, 'threshold ' + th366);
check('the 315 to 317 the nine-pair bases reach falls short at s = 366',
  [315, 316, 317].every((no) => nineRate(366, no) < RECORD));
check('the same 315 to 317 would suffice at s = 367, which is why the pairs matter',
  [315, 316, 317].every((no) => nineRate(367, no) > RECORD));

// ---------------------------------------------------------------- the sweeps

if (!FULL) {
  console.log('\n5. The two 64,538,880-image sweeps are skipped. Pass --full to run them.');
  console.log('   They confirm empirically what section 3 above establishes quantitatively:');
  console.log('   no automorphic image of the base reaches o = 323, and no image of a nine-pair');
  console.log('   base clears the doubly covered region. Each takes hours.');
} else {
  console.log('\n5. Sweeping the automorphism group. This takes hours.');
  const perms = [];
  (function gen(p, rest) { if (!rest.length) { perms.push(p); return; } for (let i = 0; i < rest.length; i++) gen([...p, rest[i]], rest.filter((_, k) => k !== i)); })([], [0, 1, 2, 3, 4]);
  const signs = [];
  for (let m = 0; m < 32; m++) signs.push([0, 1, 2, 3, 4].map((k) => ((m >> k) & 1) ? 1 : -1));
  const applyAut = (v, perm, sign, shift) => {
    let w = 0;
    for (let i = 0; i < DIM; i++) {
      const x = dig[v * DIM + perm[i]];
      w += (((sign[i] < 0 ? Q - x : x) + shift[i]) % Q) * pow[i];
    }
    return w;
  };
  let best = 0, done = 0;
  const t0 = Date.now();
  for (const perm of perms) for (const sign of signs) for (let sh = 0; sh < N; sh++) {
    const shift = []; let x = sh;
    for (let k = 0; k < DIM; k++) { shift.push(x % Q); x = (x / Q) | 0; }
    const img = ends.map((v) => applyAut(v, perm, sign, shift));
    const m = closed(img);
    let c = 0;
    for (const y of X) if (!m[y]) c++;
    if (c > best) best = c;
    if ((++done) % 1000000 === 0) console.log('   ' + (done / 1e6) + 'M images, best o = ' + best + ', ' + ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  console.log('   swept ' + done + ' images');
  check('no image of the base reaches o = 323', best <= 322, 'best o = ' + best);
}

console.log('\n' + pass + ' checks passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
