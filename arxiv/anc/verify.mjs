// Verification of the bound Theta(C7) >= 3.258834362237710794...
//
// Self-contained: no imports, no network, no local libraries. Run with  node verify.mjs
//
// The rule S3b and the terminal code K4a are reproduced here from the Lean sources of the BPZ
// repository (ShannonBounds/Substitutions.lean and ShannonBounds/TerminalCodes.lean at commit
// aa21eeb12b75b0413d3fa9fb4208b5d0bf2c4d65). The companion script verify.py takes them instead
// from the printed tables of Appendix A of arXiv:2608.30273, so the two scripts differ in
// language, in implementation and in the source of their data.
//
// Each script first reproduces the published construction, and only then evaluates ours.
const LAB = ['B', 'N', 'A', 'D', 'O', 'H', 'V'];
const IX = Object.fromEntries(LAB.map((l, i) => [l, i]));

const S3b = {
  B: ["BBB","BHA","NAV","NDH","NVD","ABH","AHN","AHD","DBV","DVN","DVD","HND","HDN","HDD","VNA","VAB","VDA"],
  N: ["BVD","NNN","NVA","ANH","ADH","AHN","DNV","DDH","DHN","HVD"],
  A: ["NBA","NAN","ABB","AAV","AHA"],
  D: ["NBD","NDN","DBB","DAV","DHA"],
  O: [],
  H: ["NNH","NHN","HNN","HVV"],
  V: ["NNV","NVN","VNN","VVV"],
};
const K4a = ["BBBB","BNVB","BAHB","BDVB","BHNB","BHDB","BVAB","NBBV","NNVH","NAVH","NDHH",
  "NHNH","NHAH","NVDV","ABBV","ANHH","AAVH","ADHH","AHAH","AVNH","AVDH","DBBH","DNVV","DAVV",
  "DDHV","DHNV","DHAV","DVDV","HBBA","HNVD","HAHD","HAVN","HDHN","HDVD","HHNN","HHND","HHAN",
  "HHDD","HVAD","HVDN","VBBN","VBBD","VNVN","VNVA","VAHA","VDVA","VHDA","VVNA","VVAA"];

const words = LAB.reduce((n, l) => n + S3b[l].length, 0);
console.log('S3b holds ' + words + ' words (the paper states 45); K4a holds ' + K4a.length + ' (49)');

// the separation relation, used only to re-check admissibility of S3b
const SEP = { B: 'OHV', N: 'ADOHV', A: 'NDH', D: 'NAV', O: 'BN', H: 'BNA', V: 'BND' };
const sep = (a, b) => SEP[a].includes(b);
let ok = true;
for (const l of LAB) { const T = S3b[l];
  for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
    let good = false;
    for (let k = 0; k < 3; k++) if (sep(T[i][k], T[j][k])) good = true;
    if (!good) ok = false; } }
for (const l of LAB) for (const m of LAB) { if (!sep(l, m)) continue;
  for (const a of S3b[l]) for (const b of S3b[m]) {
    let good = false;
    for (let k = 0; k < 3; k++) if (sep(a[k], b[k])) good = true;
    if (!good) ok = false; } }
console.log('S3b satisfies both admissibility conditions: ' + ok);

const apply3 = (rule, x, y, z) => LAB.map((l) => rule[l].reduce((s, w) =>
  s + x[IX[w[0]]] * y[IX[w[1]]] * z[IX[w[2]]], 0n));
const code4 = (W, a, b, c, d) => W.reduce((s, w) =>
  s + a[IX[w[0]]] * b[IX[w[1]]] * c[IX[w[2]]] * d[IX[w[3]]], 0n);

// the three cardinality vectors of Appendix B.4 of arXiv:2608.30273
const n6 = [2278849120333921n, 1426136268314719n, 508695301664940n, 509731462042710n,
  176870111100096n, 176870111100096n, 176870111100096n];
const n8 = [305690338043117314945n, 179001784071649220449n, 62536648997146835644n,
  87767535795425989412n, 26071517201241409024n, 26071517201241409024n, 26071517201241409024n];
const n11 = [15103429137780549256646118183n, 8049523822718249447032963650n,
  3444579390015851502852512947n, 4810790311425867030231560474n,
  1375259276200664518625890664n, 1375259276200664518625890664n, 1375259276200664518625890664n];
const M_pub = BigInt('3396467291811745694340851757371833322531739075465110' +
  '0605971152590324909277046876400440353958428359262989' +
  '6215203947372766811966557767583863304708327733085591' +
  '5999031707610213141337406106659583482352927456098895' +
  '0698158729501949866486079791784996498585401881281');

// control: the published construction
const hisN25 = apply3(S3b, n6, n11, n8);
const hisM = code4(K4a, hisN25, hisN25, hisN25, hisN25);
console.log('\ncontrol: K4a(S3b(n6, n11, n8)) reproduces his M exactly: ' + (hisM === M_pub));

// ours
const v = apply3(S3b, n6, n11, n11);
console.log('\nours, v = S3b(n6, n11, n11), a representation in C7^140:');
LAB.forEach((l, i) => console.log('  F_' + l + ' = ' + v[i]));
const M = code4(K4a, v, v, v, v);
const s = M.toString();
console.log('\nK4a on four copies: an independent set in C7^560 of ' + s.length + ' digits');
console.log(s);
// the rate, from the full decimal expansion
const log10 = Math.log10(Number(s.slice(0, 17))) + (s.length - 17);
const rate = Math.pow(10, log10 / 560);
const hisRate = Math.pow(10, (Math.log10(Number(M_pub.toString().slice(0, 17))) +
  (M_pub.toString().length - 17)) / 500);
console.log('\nours ' + rate.toFixed(13) + '   his ' + hisRate.toFixed(13));
console.log('larger: ' + (rate > hisRate));
console.log('below the Lovasz bound 3.3176672: ' + (rate < 3.3176672));
