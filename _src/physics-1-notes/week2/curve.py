# Hermite knots (t, x, slope) for the x-t graph of Figure 3.3
K=[(0,1,0),(1,1,0),(1.6,1.9,3.0),(2,3.1,3.0),(3,4.3,0.4),(3.4,5.3,0),(4,2.0,-8.5),
   (4.12,1.45,-2.0),(4.5,1.2,-0.3),(5,1.0,-0.7),(5.4,0.6,-1.2)]
def f(v): return ("%.4f"%v).rstrip('0').rstrip('.')
out="(%s,%s)"%(f(K[0][0]),f(K[0][1]))
for (t0,x0,m0),(t1,x1,m1) in zip(K,K[1:]):
    h=t1-t0
    out+=" .. controls (%s,%s) and (%s,%s) .. (%s,%s)"%(f(t0+h/3),f(x0+m0*h/3),f(t1-h/3),f(x1-m1*h/3),f(t1),f(x1))
print(out)
# check monotonic t and sample min/max, concavity sign changes
import numpy as np
for (t0,x0,m0),(t1,x1,m1) in zip(K,K[1:]):
    h=t1-t0; s=np.linspace(0,1,201)
    D=x1-x0; a=m0*h; b=m1*h
    x=x0+a*s+(3*D-2*a-b)*s**2+(a+b-2*D)*s**3
    v=(a+2*(3*D-2*a-b)*s+3*(a+b-2*D)*s**2)/h
    acc=(2*(3*D-2*a-b)+6*(a+b-2*D)*s)/h**2
    print(t0,t1,"x[%.2f,%.2f] v[%.2f,%.2f] a[%.2f,%.2f]"%(x.min(),x.max(),v.min(),v.max(),acc.min(),acc.max()))
