Ancillary files for "Searching the recursion tree improves the lower bound on the
Shannon capacity of C_7".

  certificate.txt   the seven-family cardinality vector of S_3b(n_6, n_11, n_11), a
                    representation in C_7^(box 140), and the 288-digit independent set
                    in C_7^(box 560) that K_4a returns on four copies of it
  verify.mjs        verifier for Node.js 20, no dependencies
  verify.py         verifier for Python 3, no dependencies
  search.mjs        the exhaustive search behind the ranking of Section 4
  section5.mjs      the census and obstruction checks behind Section 5
  data/base.json    the Polak-Schrijver 367-set, the auxiliary set, the eight pairs
  data/pool367.json the other 64 distinct 367-sets the local search produced

Usage:

  node verify.mjs
  python verify.py
  node search.mjs
  node section5.mjs           (add --full for the 64,538,880-image sweep, which takes hours)

The two verifiers share no code and have no dependencies, so agreement between them is
not evidence from a single implementation. They also differ in where their copies of the
rules come from: verify.mjs reproduces S_3b and K_4a from the Lean sources of the
Buys-Polak-Zuiddam repository at commit aa21eeb12b75b0413d3fa9fb4208b5d0bf2c4d65, while
verify.py takes them from the printed tables of Appendix A of arXiv:2608.30273.

Each begins by reproducing the published construction. If a script does not print

  control: K4a(S3b(n6, n11, n8)) reproduces his M exactly: true

then something is wrong with the script and its verdict on the new construction means
nothing. Only after that control passes does it evaluate the one claimed here.

Both also check the result against the Lovasz bound theta(C_7) = 3.3176672..., which no
lower bound may exceed.

section5.mjs expects the two data files in a subdirectory data/ beside it, and falls back
to looking for them in the same directory if that is absent.

The search and all of the above were written with the assistance of a large language
model. The Python verifier was written independently of the search code and from the
printed rule tables rather than the machine-readable sources, so that it does not share
the assumptions of the code that produced the result.
