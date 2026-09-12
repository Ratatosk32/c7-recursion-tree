"""Independent verification, written from the printed appendix rather than from the Lean sources.

The rule S3b and the terminal code K4a are typed here from Appendix A of arXiv:2608.30273; the
vectors n6, n8, n11 and the published M are typed from Appendix B.4. Nothing is imported from the
JavaScript side, and the arithmetic is Python's own arbitrary-precision integers, with the root
taken in exact decimal.

Control: his construction must reproduce his printed M.
Claim:   replacing n8 by a second copy of n11 gives a larger set at dimension 560.
"""
from decimal import Decimal, getcontext

LAB = "BNADOHV"
IX = {c: i for i, c in enumerate(LAB)}

S3b = {
    "B": "BBB BHA NAV NDH NVD ABH AHN AHD DBV DVN DVD HND HDN HDD VNA VAB VDA",
    "N": "BVD NNN NVA ANH ADH AHN DNV DDH DHN HVD",
    "A": "NBA NAN ABB AAV AHA",
    "D": "NBD NDN DBB DAV DHA",
    "O": "",
    "H": "NNH NHN HNN HVV",
    "V": "NNV NVN VNN VVV",
}
K4a = """BBBB BNVB BAHB BDVB BHNB BHDB BVAB NBBV NNVH NAVH NDHH NHNH NHAH NVDV ABBV
ANHH AAVH ADHH AHAH AVNH AVDH DBBH DNVV DAVV DDHV DHNV DHAV DVDV HBBA HNVD HAHD
HAVN HDHN HDVD HHNN HHND HHAN HHDD HVAD HVDN VBBN VBBD VNVN VNVA VAHA VDVA VHDA
VVNA VVAA"""

s3b = {k: [w for w in v.split()] for k, v in S3b.items()}
k4a = K4a.split()
assert sum(len(v) for v in s3b.values()) == 45, "S3b should hold 45 words"
assert len(k4a) == 49, "K4a should hold 49 words"
assert all(len(w) == 3 for v in s3b.values() for w in v)
assert all(len(w) == 4 for w in k4a)
print("typed in: S3b has 45 words, K4a has 49, as the paper states")

def apply3(rule, x, y, z):
    out = []
    for lab in LAB:
        s = 0
        for w in rule[lab]:
            s += x[IX[w[0]]] * y[IX[w[1]]] * z[IX[w[2]]]
        out.append(s)
    return out

def code4(words, a, b, c, d):
    s = 0
    for w in words:
        s += a[IX[w[0]]] * b[IX[w[1]]] * c[IX[w[2]]] * d[IX[w[3]]]
    return s

n6 = [2278849120333921, 1426136268314719, 508695301664940, 509731462042710,
      176870111100096, 176870111100096, 176870111100096]
n8 = [305690338043117314945, 179001784071649220449, 62536648997146835644,
      87767535795425989412, 26071517201241409024, 26071517201241409024, 26071517201241409024]
n11 = [15103429137780549256646118183, 8049523822718249447032963650,
       3444579390015851502852512947, 4810790311425867030231560474,
       1375259276200664518625890664, 1375259276200664518625890664, 1375259276200664518625890664]
n25_pub = [12651555102711866584006925012965893561076969596025225905818339799,
           3066132745665704601020173586804414424611769880543231510544034510,
           4664412231532807578550047842170656906931895714626194718133859805,
           5561607824514622663538712910059154540700557990699908637174352708, 0,
           911561283323995002333709184151818987697897558779375600768623640,
           911561283323995002333709184151818987697897558779375600768623640]
M_pub = int("3396467291811745694340851757371833322531739075465110"
            "0605971152590324909277046876400440353958428359262989"
            "6215203947372766811966557767583863304708327733085591"
            "5999031707610213141337406106659583482352927456098895"
            "0698158729501949866486079791784996498585401881281")

n25 = apply3(s3b, n6, n11, n8)
print("control, S3b(n6, n11, n8) equals his printed n25:", n25 == n25_pub)
M = code4(k4a, n25, n25, n25, n25)
print("control, K4a on four copies equals his printed M:", M == M_pub)

getcontext().prec = 60
def rate(n, dim):
    return Decimal(n) ** (Decimal(1) / Decimal(dim))

print("his rate at dimension 500:", str(rate(M_pub, 500))[:20])

v = apply3(s3b, n6, n11, n11)
print("\nours, S3b(n6, n11, n11), the O coordinate is", v[4])
M2 = code4(k4a, v, v, v, v)
print("independent set in C7^560:", len(str(M2)), "digits")
r = rate(M2, 560)
print("our rate at dimension 560:", str(r)[:20])
print("his                       ", str(rate(M_pub, 500))[:20])
better = r > rate(M_pub, 500)
print("\nlarger:", better, " by", str(r - rate(M_pub, 500))[:12])
print("below the Lovasz bound 3.3176672:", r < Decimal("3.3176672"))
