// Exhaustive search over combinations of the three published blocks.
//
// This is the code behind the ranking in Section 4 of the accompanying note. It draws three
// blocks with repetition from Tandon n6, n8, n11 and the Polak-Schrijver base, in both
// orientations, applies each of the eight ternary rules of the BPZ library, and reads the
// result either through one of the three terminal codes or directly as an independent set
// of size |F_B| + |F_O|. That is 8^3 x 8 x 4 = 16384 candidates.
//
// Self-contained: no imports, no network, no local libraries. Run with  node search.mjs
//
// The rule library is reproduced from the Lean sources of the BPZ repository
// (ShannonBounds/Substitutions.lean and ShannonBounds/TerminalCodes.lean) at commit
// aa21eeb12b75b0413d3fa9fb4208b5d0bf2c4d65. The word counts and both admissibility
// conditions are re-checked below before anything is searched.

const LAB = ["B","N","A","D","O","H","V"];
const IX = Object.fromEntries(LAB.map((l, i) => [l, i]));
const SEP = { B: "OHV", N: "ADOHV", A: "NDH", D: "NAV", O: "BN", H: "BNA", V: "BND" };
const sep = (a, b) => SEP[a].includes(b);

const RULES = {
  S2a: { arity: 2, T: {
    B: ["BB","HD","VA","DV","AH"],
    N: ["NN","AA","AD","DA","DD"],
    A: ["AN","ND"],
    D: ["DN","NA"],
    O: ["ON","NO"],
    H: ["HN","NV"],
    V: ["VN","NH"],
  } },
  S2b: { arity: 2, T: {
    B: ["AV","BB","DH"],
    N: ["AA","NN"],
    A: ["AN","BD","DV","VH"],
    D: ["DN","NA"],
    O: [],
    H: ["HB","NV"],
    V: ["HA","NH","VD","VN"],
  } },
  S3a: { arity: 3, T: {
    B: ["AHN","ANV","BAH","BBB","BDV","BHD","BVA","DNH","DVN","HDN","HNA","VAN","VND"],
    N: ["AAN","ADN","ANA","AND","DAN","DDN","DNA","DND","NAA","NAD","NDA","NDD","NNN"],
    A: ["AAA","AAD","ADA","ADD","ANN","NAN","NNA"],
    D: ["DAA","DAD","DDA","DDD","DNN","NDN","NND"],
    O: ["OAA","OAD","ODA","ODD"],
    H: ["HAA","HAD","HDA","HDD","HNN","NHN","NNH"],
    V: ["NNV","NVN","VAA","VAD","VDA","VDD","VNN"],
  } },
  S3b: { arity: 3, T: {
    B: ["BBB","BHA","NAV","NDH","NVD","ABH","AHN","AHD","DBV","DVN","DVD","HND","HDN","HDD","VNA","VAB","VDA"],
    N: ["BVD","NNN","NVA","ANH","ADH","AHN","DNV","DDH","DHN","HVD"],
    A: ["NBA","NAN","ABB","AAV","AHA"],
    D: ["NBD","NDN","DBB","DAV","DHA"],
    O: [],
    H: ["NNH","NHN","HNN","HVV"],
    V: ["NNV","NVN","VNN","VVV"],
  } },
  S3c: { arity: 3, T: {
    B: ["ABV","AHH","AVA","BBB","DAH","DHA","DNH","HAA","HAN","HHH","NHD","NVA","VAD","VDB"],
    N: ["AAD","ADA","BHD","DAB","DBH","HHA","HVH","NNN","VAA","VDH"],
    A: ["ABN","AND","BNA","BVV","HDN","NAB","NDA","VNV","VVN"],
    D: ["DNN","NDN","NND"],
    O: [],
    H: ["BHN","HNB","NBH"],
    V: ["AVN","DHN","HNA","NAH","NDV","NNV","NVN","VND","VNN"],
  } },
  S3d: { arity: 3, T: {
    B: ["ABV","BBB","BHD","BVA","DAH","DDV","DNH","HAA","HAN","VAD","VDN","VHA","VHH"],
    N: ["AAD","BHD","DAB","DBH","HVH","NNN","VAA","VDH","VHA"],
    A: ["ABN","AND","BDA","BNA","BVV","HDN","NAB","VNV","VVN"],
    D: ["DNN","NDN","NND"],
    O: [],
    H: ["BHN","HNB","NBH"],
    V: ["AVN","DHN","HNA","NAH","NDV","NNV","NVN","VND","VNN"],
  } },
  S3e: { arity: 3, T: {
    B: ["AHN","BAH","BBB","BDV","BHD","BVA","DVN","HDN","HNA","VAN","VND"],
    N: ["AAN","AHN","DAN","DDN","HNA","NAA","NAD","NDA","NDD","NNN"],
    A: ["AAA","AAD","ADA","ADD","ANN","BNA","HND","NAN"],
    D: ["AND","DAA","DAD","DDA","DDD","DNN","NDN","NND"],
    O: [],
    H: ["BNH","HAA","HAD","HDD","HHA","HNN","NHN"],
    V: ["ANV","DNH","NNV","NVN","VAA","VAD","VDA","VDD","VNN"],
  } },
  S3f: { arity: 3, T: {
    B: ["AHD","AHN","BAH","BBB","BDV","BVA","HDB","HHH","HNA","NHD","VND"],
    N: ["AHB","BHH","DHA","HDD","HNA","NAA","NAH","NHA","NNN","VHV"],
    A: ["AAA","AAH","ABN","BNA","HHN","HNH","NAN"],
    D: ["AND","DAA","DAD","DBN","NDN","NND"],
    O: [],
    H: ["BNH","HAB","HAV","HNN","NHN"],
    V: ["ANV","DNH","DVN","NNV","NVN","VAB","VAV","VNN"],
  } },
  S3g: { arity: 3, T: {
    B: ["AHN","BAH","BBB","BDV","BHD","BVA","HDN","HNA","VHA","VHH","VND"],
    N: ["AHB","BHH","DHA","HDD","HNA","NAA","NAH","NHA","NNN","VHV"],
    A: ["AAA","AAH","ABN","BNA","HHN","HNH","NAN"],
    D: ["AND","DAA","DAH","DBN","NDN","NND"],
    O: [],
    H: ["BNH","HAB","HAV","HNN","NHN"],
    V: ["ANV","DNH","DVN","NNV","NVN","VAB","VAV","VNN"],
  } },
  S3h: { arity: 3, T: {
    B: ["BBB","BHA","NAV","NDH","NVD","ABH","AHN","AHD","DBV","DVN","DVD","HND","HDN","HDD","VNA","VAB","VDA"],
    N: ["BVD","NNN","NVA","ANH","ADH","AHN","DNV","DDH","DHN","HVD"],
    A: ["NBD","NDN","DBB","DAV","DHA"],
    D: ["NBA","NAN","ABB","AAV","AHA"],
    O: [],
    H: ["NNV","NVN","VNN","VVV"],
    V: ["NNH","NHN","HNN","HVV"],
  } },
};

const CODES = {
  K3a: { arity: 3, W: ["ABV","AHN","AVH","BAB","BDD","BHA","BNB","DAH","DDN","DNH","HBA","HHH","HVN","NBV","NHN","NVH","VBD","VBN","VVA"] },
  K4a: { arity: 4, W: ["BBBB","BNVB","BAHB","BDVB","BHNB","BHDB","BVAB","NBBV","NNVH","NAVH","NDHH","NHNH","NHAH","NVDV","ABBV","ANHH","AAVH","ADHH","AHAH","AVNH","AVDH","DBBH","DNVV","DAVV","DDHV","DHNV","DHAV","DVDV","HBBA","HNVD","HAHD","HAVN","HDHN","HDVD","HHNN","HHND","HHAN","HHDD","HVAD","HVDN","VBBN","VBBD","VNVN","VNVA","VAHA","VDVA","VHDA","VVNA","VVAA"] },
  K4b: { arity: 4, W: ["AAAV","AANV","ABHA","AHAA","AHAN","AHNA","AHNN","ANAV","ANDH","ANHN","ANNH","AVDB","BADH","BAVN","BBBB","BBVD","BDBH","BDHN","BHHH","BVAD","BVND","DAVA","DHHA","DNBV","DNVA","DNVN","DVBA","DVBN","HABH","HBDB","HBVH","HDAB","HDNB","HNND","HVHD","HVHN","NAAV","NANV","NBHA","NHAN","NHBA","NNAV","NNDH","NNNV","NNVN","NVDN","NVHA","NVNN","VAAB","VANB","VDDH","VHAH","VHNH","VNAB","VNNA","VNNN","VVHV"] },
};

// the word counts the paper states, as a first check on the transcription
const DECLARED = { S2a: 20, S2b: 17, S3a: 58, S3b: 45, S3c: 48, S3d: 46, S3e: 53, S3f: 47,
  S3g: 47, S3h: 45, K3a: 19, K4a: 49, K4b: 57 };
let bad = 0;
for (const [n, r] of Object.entries(RULES)) {
  const c = LAB.reduce((s, l) => s + r.T[l].length, 0);
  if (c !== DECLARED[n]) { console.log("  MISMATCH " + n + ": " + c + " vs " + DECLARED[n]); bad++; }
}
for (const [n, c] of Object.entries(CODES)) {
  if (c.W.length !== DECLARED[n]) { console.log("  MISMATCH " + n); bad++; }
}
console.log("word counts against the published table: " + (bad ? bad + " MISMATCHES" : "all 13 agree"));

// admissibility: separation within a component, and across components with separated labels
const adm = (r) => {
  for (const l of LAB) {
    const T = r.T[l];
    for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
      let ok = false;
      for (let k = 0; k < T[i].length; k++) if (sep(T[i][k], T[j][k])) ok = true;
      if (!ok) return false;
    }
  }
  for (const l of LAB) for (const m of LAB) {
    if (!sep(l, m)) continue;
    for (const a of r.T[l]) for (const b of r.T[m]) {
      let ok = false;
      for (let k = 0; k < a.length; k++) if (sep(a[k], b[k])) ok = true;
      if (!ok) return false;
    }
  }
  return true;
};
const admC = (c) => {
  const W = c.W;
  for (let i = 0; i < W.length; i++) for (let j = i + 1; j < W.length; j++) {
    let ok = false;
    for (let k = 0; k < W[i].length; k++) if (sep(W[i][k], W[j][k])) ok = true;
    if (!ok) return false;
  }
  return true;
};
console.log("all ten combining rules admissible: " + Object.values(RULES).every(adm));
console.log("all three terminal codes admissible: " + Object.values(CODES).every(admC));

const apply = (r, v) => LAB.map((l) => r.T[l].reduce((s, w) => {
  let p = 1n;
  for (let k = 0; k < w.length; k++) p *= v[k][IX[w[k]]];
  return s + p;
}, 0n));
const applyCode = (c, v) => c.W.reduce((s, w) => {
  let p = 1n;
  for (let k = 0; k < w.length; k++) p *= v[k][IX[w[k]]];
  return s + p;
}, 0n);

// Tandon three published cardinality vectors (Appendix B.4), and the Polak-Schrijver base.
// Orientation reversal swaps A with D and H with V; it is a symmetry of the separation
// relation, so the conjugate of a representation is again a representation.
const n6 = [2278849120333921n, 1426136268314719n, 508695301664940n, 509731462042710n,
  176870111100096n, 176870111100096n, 176870111100096n];
const n8 = [305690338043117314945n, 179001784071649220449n, 62536648997146835644n,
  87767535795425989412n, 26071517201241409024n, 26071517201241409024n, 26071517201241409024n];
const n11 = [15103429137780549256646118183n, 8049523822718249447032963650n,
  3444579390015851502852512947n, 4810790311425867030231560474n,
  1375259276200664518625890664n, 1375259276200664518625890664n, 1375259276200664518625890664n];
const w = [359n, 322n, 19n, 26n, 8n, 8n, 8n];
const bar = (x) => [x[0], x[1], x[3], x[2], x[4], x[6], x[5]];

const RECORD = 3.2588326203532663;
const rate = (M, dim) => {
  const s = M.toString();
  return Math.pow(10, (Math.log10(Number(s.slice(0, 17))) + (s.length - 17)) / dim);
};

// each block carries its dimension, in units of five
const stock = [["w", w, 1], ["w~", bar(w), 1], ["n6", n6, 6], ["n6~", bar(n6), 6],
  ["n8", n8, 8], ["n8~", bar(n8), 8], ["n11", n11, 11], ["n11~", bar(n11), 11]];
const TER = ["S3a", "S3b", "S3c", "S3d", "S3e", "S3f", "S3g", "S3h"];

const out = [];
for (const A of stock) for (const B of stock) for (const C of stock) {
  const u = A[2] + B[2] + C[2];
  for (const rn of TER) {
    const v = apply(RULES[rn], [A[1], B[1], C[1]]);
    if (v.some((q) => q < 0n) || !(v[0] + v[4] > 0n)) continue;
    for (const [cn, c] of Object.entries(CODES)) {
      const M = applyCode(c, new Array(c.arity).fill(v));
      if (!(M > 0n)) continue;
      out.push({ r: rate(M, 5 * u * c.arity), dim: 5 * u * c.arity,
        how: cn + "(" + rn + "(" + A[0] + ", " + B[0] + ", " + C[0] + "))" });
    }
    out.push({ r: rate(v[0] + v[4], 5 * u), dim: 5 * u,
      how: rn + "(" + A[0] + ", " + B[0] + ", " + C[0] + ") read as B+O" });
  }
}

out.sort((a, b) => b.r - a.r);
console.log("\ncandidates searched: " + out.length);
console.log("\nthe ranking begins:");
for (const x of out.slice(0, 6)) {
  console.log("  " + x.r.toFixed(13) + "  dim " + String(x.dim).padStart(4) + "  " + x.how +
    (x.r > RECORD ? "   above the record" : ""));
}

const pub = out.findIndex((x) => x.how === "K4a(S3b(n6, n11, n8))");
const pubR = out[pub].r;
// the top value is attained more than once, so the two ways of ranking differ
const above = new Set(out.filter((x) => x.r > pubR + 1e-12).map((x) => x.r.toFixed(12)));
console.log("\nthe published construction K4a(S3b(n6, n11, n8)) is at " + pubR.toFixed(13));
console.log("  distinct values strictly above it: " + above.size + "   so it is " + (above.size + 1) +
  (above.size === 2 ? "rd" : "th") + " by value");
console.log("  among the " + out.length + " candidates individually it is " + (pub + 1) + "th,");
console.log("  because the top value is attained " + out.filter((x) => x.r > out[0].r - 1e-12).length + " times");
console.log("the best is " + out[0].how + " at " + out[0].r.toFixed(13));
console.log("above the record " + RECORD + " by " + (out[0].r - RECORD).toExponential(3));
console.log("below the Lovasz bound 3.3176672: " + (out[0].r < 3.3176672));

// the four top entries are not merely equal to the printed digits: they are the same integer,
// although their seven-family vectors differ in the A and D coordinates
const tops = [["S3b", n6], ["S3h", n6], ["S3b", bar(n6)], ["S3h", bar(n6)]].map(([rn, first]) => {
  const v = apply(RULES[rn], [first, n11, n11]);
  return { v, M: applyCode(CODES.K4a, [v, v, v, v]) };
});
console.log("\nthe four realisations of the best value give the same integer: " +
  tops.every((t) => t.M === tops[0].M));
console.log("their seven-family vectors are nevertheless distinct: " +
  !tops.every((t) => t.v.every((x, i) => x === tops[0].v[i])));
