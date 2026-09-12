# Searching the recursion tree improves the lower bound on the Shannon capacity of C₇

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22727743.svg)](https://doi.org/10.5281/zenodo.22727743)

    Θ(C₇) ≥ 3.258834362237710794…

improving `3.258832620353266309…` (Tandon, [arXiv:2608.30273](https://arxiv.org/abs/2608.30273)).

| | bound | dimension | source |
|---|---|---|---|
| Gao | 3.2587891539… | | [arXiv:2607.27869](https://arxiv.org/abs/2607.27869) |
| Buys, Polak, Zuiddam | 3.2588279859… | | [arXiv:2607.29681](https://arxiv.org/abs/2607.29681) |
| Tandon | 3.2588326203… | 500 | [arXiv:2608.30273](https://arxiv.org/abs/2608.30273) |
| **this repository** | **3.2588343622…** | 560 | `certificate.txt` |

Nothing here is new except the combination. The cardinality vectors are Tandon's, the rules are
Buys–Polak–Zuiddam's, and the cardinality formula is theirs.

## The construction, in one line

Take Tandon's published cardinality vectors `n6` and `n11`, apply the BPZ ternary rule `S3b` to
`(n6, n11, n11)`, and apply the terminal code `K4a` to four copies of the result. That is an
independent set of 288 digits in `C₇^⊠560`.

The published construction is `K4a` applied to four copies of `S3b(n6, n11, n8)`: the ordered
split `25 = 6 + 11 + 8`. The only change is the third input, a second copy of `n11` in place of
`n8`, giving `28 = 6 + 11 + 11`.

What the note argues is that the *recursion tree* is a free parameter that nobody in this line of
work optimises, and that optimising it beats the record on published data alone.

## Verify

```
node verify.mjs
python verify.py
```

Two scripts built to share nothing: they differ in language, in implementation, and in where
their copies of the rules come from. `verify.mjs` reproduces `S3b` and `K4a` from the Lean sources
of the BPZ repository at commit `aa21eeb12b75b0413d3fa9fb4208b5d0bf2c4d65`; `verify.py` takes them
from the printed tables of Appendix A of arXiv:2608.30273. Neither imports anything, neither
touches the network, and each runs in about a second.

Each begins by reproducing the *published* construction. If a script does not print

    control: K4a(S3b(n6, n11, n8)) reproduces his M exactly: true

then something is wrong with the script and its verdict on the new construction means nothing.
Only after that control passes does it evaluate ours.

Both also check the result against the Lovász bound `ϑ(C₇) = 3.3176672…`, which no lower bound may
exceed. This is not ceremony. During this work a construction that satisfied every internal
invariant, with exact arithmetic throughout, produced 4.11; only the comparison with the upper
bound exposed it. The offending object was a codebook living in a graph of the wrong dimension.

## Reproduce the search

```
node search.mjs
```

Carries the whole BPZ library, re-checks the thirteen word counts and both admissibility
conditions, then evaluates all 16384 combinations of the three published blocks: three blocks
drawn with repetition in both orientations, eight ternary rules, three terminal codes, plus
reading each product directly as an independent set of size `|F_B| + |F_O|`.

One point of bookkeeping, since the note and the script must agree. The published construction is
third **by value** but ninth among the 16384 candidates taken individually, because the best value
is reached four times: by `S3b` and by `S3h`, each on `n6` and on its orientation reversal. Those
four do not merely agree to the digits printed — their seven-family vectors differ in the `A` and
`D` coordinates, yet `K4a` returns the same 288-digit integer for all four. The script prints both
ranks and checks the coincidence.

## Reproduce the negative results

```
node section5.mjs            # the census and the obstruction, a few seconds
node section5.mjs --full     # adds the 64538880-image sweep, hours
```

Section 5 of the note closes several natural avenues exhaustively rather than merely exploring
them. The cheap checks settle the census and the quantitative obstruction, which is what the
argument rests on:

- the Polak–Schrijver 367-set admits exactly eight private pairs, each owner owning exactly one;
- the local search produced 65 distinct 367-sets, with private-pair counts running `t = 5` to
  `t = 10` (two, twenty-one, sixteen, nineteen, six and one);
- the doubly covered region `D = N[P_H] ∩ N[P_V]`, which the auxiliary set must avoid, runs
  956–988 over the nineteen eight-pair bases, 1098–1128 over the six with nine pairs, and
  1240–1268 for the single base with ten — about 142 further forbidden vertices per pair, three
  times over;
- the published gadget has `o = 322`, and squaring shows why `o = 323` would suffice on its own.

The `--full` sweep is the empirical confirmation and is slow because it walks the whole
automorphism group of `C₇^⊠5`.

## Files

    note.tex          the accompanying note, self-contained LaTeX
    certificate.txt   the seven-family vector and the 288-digit independent set, as plain text
    verify.mjs        verification in JavaScript, rules from the Lean sources
    verify.py         verification in Python, rules from the printed tables
    search.mjs        the exhaustive search behind the ranking in Section 4
    section5.mjs      the census and obstruction checks behind Section 5
    data/base.json    the 367-set, the auxiliary set, and the eight private pairs
    data/pool367.json the other 64 distinct 367-sets the search produced

## Scope

The improvement is in the seventh significant digit, as were the four before it in 2026, and the
distance to the upper bound is unchanged at about `2.9e-2` — four orders of magnitude larger than
everything this line of work has gained in total. The construction is one substitution in someone
else's recursion, and stating it makes it reproducible in an afternoon by anyone holding the same
data. We expect it to be superseded quickly, most likely by the authors whose data it uses.

What may be more durable is the observation about the tree, which applies to whatever construction
comes next, and the exhaustive verifications above, which close doors rather than open them but
were expensive to establish and are cheap to reuse.

## Cite

    Oleksii Stavriianov, "Searching the recursion tree improves the lower bound on the
    Shannon capacity of C7", Zenodo, 2026. doi:10.5281/zenodo.22727743

## Related

[c7-independent-sets](https://github.com/Ratatosk32/c7-independent-sets) — an independent set of
size 1129 in `C₇^⊠6`, which improves a table entry rather than the capacity bound.

## Assistance

The search, the verifications and both implementations were carried out with the assistance of a
large language model. The Python verification was written independently of the search code and
from the printed tables rather than the machine-readable sources, so that it does not share the
assumptions of the code that produced the result.
