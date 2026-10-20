# Writes cmb-map.dat: a random, statistically isotropic temperature pattern on the sphere
# (a sum of random plane waves), drawn in the Hammer equal-area projection.
# It only imitates the look of a CMB map; it is not real data. Run: python3 make-cmb.py
import math, random
random.seed(2026)
waves = []
for _ in range(700):
    z = random.uniform(-1, 1); a = random.uniform(0, 2*math.pi); r = math.sqrt(1 - z*z)
    k = random.uniform(5, 30)
    waves.append((k*r*math.cos(a), k*r*math.sin(a), k*z, k**-0.9, random.uniform(0, 2*math.pi)))
NL, NB = 121, 61
vals = []
for j in range(NB):
    b = -math.pi/2 + math.pi*j/(NB - 1)
    row = []
    for i in range(NL):
        l = -math.pi + 2*math.pi*i/(NL - 1)
        n = (math.cos(b)*math.cos(l), math.cos(b)*math.sin(l), math.sin(b))
        t = sum(A*math.cos(kx*n[0] + ky*n[1] + kz*n[2] + p) for kx, ky, kz, A, p in waves)
        d = math.sqrt(1 + math.cos(b)*math.cos(l/2))
        row.append((2*math.sqrt(2)*math.cos(b)*math.sin(l/2)/d, math.sqrt(2)*math.sin(b)/d, t))
    vals.append(row)
ts = [t for row in vals for _, _, t in row]
m = sum(ts)/len(ts); s = math.sqrt(sum((t - m)**2 for t in ts)/len(ts))
with open('cmb-map.dat', 'w') as f:
    f.write('x y t\n')
    for row in vals:
        for x, y, t in row:
            f.write(f'{x:.3f} {y:.3f} {(t - m)/s:.2f}\n')
        f.write('\n')
