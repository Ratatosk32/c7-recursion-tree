# arXiv submission checklist

Everything below is ready to paste into the arXiv submission form. The upload is
`arxiv-submission.tar.gz`. arXiv compiles the LaTeX itself, so no local TeX installation is
needed.

## 0. Endorsement

This is a first submission and needs an endorsement. Start the submission in **cs.IT**; arXiv
then issues an endorsement code tied to that archive. The code is archive-specific — a code
issued for math.CO will not work for a cs.IT submission, so request it for the archive you
actually intend to post to.

Ravi Tandon (arXiv:2608.30273, whose bound this improves) has seen the result, confirmed it is
ours, and said he would cite the preprint when he next revises his IEEE Transactions on
Information Theory manuscript. He is an established cs.IT author and the natural endorser. The
draft request is in the working notes as `LETTER-TANDON-4.md`.

## 1. Upload

`arxiv-submission.tar.gz`, contents:

```
note.tex
anc/README.txt
anc/certificate.txt
anc/verify.mjs
anc/verify.py
anc/search.mjs
anc/section5.mjs
anc/data/base.json
anc/data/pool367.json
```

Files under `anc/` become arXiv **ancillary files**, listed on the abstract page and downloadable
next to the PDF. That is the point of the exercise: the certificate, both verifiers and the
search then live on arXiv under the author's name.

Regenerate the tarball from the repository root with:

```
rm -rf arxiv && mkdir -p arxiv/anc/data
cp note.tex arxiv/
cp certificate.txt verify.mjs verify.py search.mjs section5.mjs arxiv/anc/
cp data/base.json data/pool367.json arxiv/anc/data/
# write arxiv/anc/README.txt, then
cd arxiv && tar -czf ../arxiv-submission.tar.gz note.tex anc && cd ..
```

Both the staging directory `arxiv/` and the built tarball are committed, so the upload is
reproducible from a clean checkout.

Checked before packaging: source is pure ASCII, braces balanced, dollar signs even (454), all
eight bibliography entries cited and all citations resolved, packages limited to `inputenc`,
`fontenc`, `amsmath`/`amssymb`/`amsthm`, `geometry`, `hyperref`, `booktabs`. All four scripts
were rerun from inside a clean extraction of `anc/` and pass, both with `data/` present and with
it flattened into the same directory.

## 2. Form fields

**Title**

```
Searching the recursion tree improves the lower bound on the Shannon capacity of C_7
```

**Authors**

```
Oleksii Stavriianov
```

ORCID 0009-0002-8504-3626.

**Abstract** (plain text, no macros)

```
The recent sequence of improvements to the lower bound on the Shannon capacity of the
seven-cycle shares a common shape: a library of admissible combining rules is applied along a
fixed recursion tree. The rules have been studied carefully; the tree has not. We show that
optimising the tree, using no data beyond what is already published, gives Theta(C_7) >=
3.258834362237710794..., improving the bound 3.258832620353266309... of Tandon. The
construction is K_4a applied to four copies of S_3b(n_6, n_11, n_11), where n_6 and n_11 are
Tandon's own published cardinality vectors and S_3b, K_4a are rules of Buys, Polak and Zuiddam:
the only change is that the third input is a second copy of n_11 rather than n_8. Among all
16384 combinations of the three published blocks, the published choice is third by value.

We also record what does not help, since several natural avenues can be closed exhaustively
rather than merely explored. The base gadget of Polak and Schrijver admits exactly eight private
pairs and this is a structural ceiling; its neutral auxiliary part cannot exceed 322 over the
entire automorphism orbit; nine and even ten private pairs do exist, on other 367-sets, but are
incompatible with a full-sized auxiliary set, and the obstruction is quantitative, the region
the auxiliary set must avoid growing by about 142 vertices with each extra pair; and the
published twist is optimal over all 64538880 automorphisms. Finally we note two traps that
internal consistency does not catch.
```

**Comments**

```
7 pages. Certificate, two independent dependency-free verifiers, the exhaustive search and the
Section 5 checks included as ancillary files. Code and data at
https://github.com/Ratatosk32/c7-recursion-tree, archived at doi:10.5281/zenodo.22727743
```

**Primary category**

```
cs.IT   (arXiv mirrors this to math.IT automatically)
```

**Cross-lists**

```
math.CO
```

**MSC class**

```
94A24, 05C69, 05C76
```

**ACM class**

```
E.4
```

**License**

```
CC BY 4.0
```

## 3. After it is posted

- Add the arXiv identifier to `README.md` and to the Zenodo record.
- Tell Tandon, who asked to be told so that he can cite it in his revision.
- Send Sven Polak the Section 5 findings about the 367-set; those are about his own object and
  are worth sending whether or not anything else comes of it.
