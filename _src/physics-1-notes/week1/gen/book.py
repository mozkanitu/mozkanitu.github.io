# Generates the TikZ code of the finite-rotation figure (book rotated about two fixed axes).
# World axes: X toward the viewer, Y to the right (axis 2), Z up (axis 1). Right-handed.
import math
def cross(a,b): return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def norm(a):
    n=math.sqrt(dot(a,a)); return tuple(x/n for x in a)
def add(*vs): return tuple(sum(c) for c in zip(*vs))
def mul(k,a): return tuple(k*x for x in a)
d = norm((1.0,0.62,0.55))           # direction from the scene to the viewer
right = norm(cross((0,0,1),d)); up = cross(d,right)
def P(p): return (dot(p,right), dot(p,up))
def rot(axis,ang):
    # rotation matrix about a world axis (0:X,1:Y,2:Z), counterclockwise seen from the tip
    c,s=math.cos(ang),math.sin(ang)
    if axis==2: return lambda v:(c*v[0]-s*v[1], s*v[0]+c*v[1], v[2])
    if axis==1: return lambda v:(c*v[0]+s*v[2], v[1], -s*v[0]+c*v[2])
    if axis==0: return lambda v:(v[0], c*v[1]-s*v[2], s*v[1]+c*v[2])
W,H,T = 0.95,1.40,0.34   # width (u), height (v), thickness (w)
def book(R):
    u=R((0,1,0)); v=R((0,0,1)); w=R((1,0,0))
    return u,v,w
def fmt(p): return "(%.3f,%.3f)"%p
def draw(R, shift, out):
    u,v,w = book(R)
    def pt(a,b,c): return add(mul(a*W/2,u),mul(b*H/2,v),mul(c*T/2,w))
    faces=[]
    # (outward normal, corner list, style, decoration)
    faces.append((w,[pt(-1,-1,1),pt(1,-1,1),pt(1,1,1),pt(-1,1,1)],'front'))
    faces.append((mul(-1,w),[pt(-1,-1,-1),pt(1,-1,-1),pt(1,1,-1),pt(-1,1,-1)],'back'))
    faces.append((mul(-1,u),[pt(-1,-1,-1),pt(-1,1,-1),pt(-1,1,1),pt(-1,-1,1)],'spine'))
    faces.append((u,[pt(1,-1,-1),pt(1,1,-1),pt(1,1,1),pt(1,-1,1)],'edgeU'))
    faces.append((v,[pt(-1,1,-1),pt(1,1,-1),pt(1,1,1),pt(-1,1,1)],'edgeV'))
    faces.append((mul(-1,v),[pt(-1,-1,-1),pt(1,-1,-1),pt(1,-1,1),pt(-1,-1,1)],'edgeV'))
    sx,sy=shift
    S=lambda p:(P(p)[0]+sx,P(p)[1]+sy)
    # axes: axis 1 along Z, axis 2 along Y; draw hidden parts first
    L1,L2 = 1.25, 1.30
    def exit_t(dirv):
        # distance from centre along dirv to leave the box
        t=1e9
        for e,half in ((u,W/2),(v,H/2),(w,T/2)):
            c=abs(dot(dirv,e))
            if c>1e-9: t=min(t,half/c)
        return t
    def occluded(p):
        # is point p hidden by the box (ray from p toward viewer hits box)?
        # sample along the ray
        for k in range(1,400):
            q=add(p,mul(k*0.01,d))
            if abs(dot(q,u))<W/2 and abs(dot(q,v))<H/2 and abs(dot(q,w))<T/2: return True
        return False
    axes=[((0,0,1),L1,'1'),((0,1,0),L2,'2')]
    front_segments=[]
    for a,Lp,name in axes:
        t0=exit_t(a)
        for sgn in (1,-1):
            dirv=mul(sgn,a)
            Lend = Lp if sgn==1 else Lp*0.85
            if Lend<=t0: continue
            mid=mul((t0+Lend)/2,dirv)
            seg=(mul(t0,dirv),mul(Lend if sgn==-1 else Lend,dirv),sgn,name)
            if occluded(mid): out.append("\\draw[fzgray,thin] %s -- %s;"%(fmt(S(seg[0])),fmt(S(seg[1]))))
            else: front_segments.append(seg)
    for n,pts,kind in faces:
        if dot(n,d)<=1e-6: continue
        poly=" -- ".join(fmt(S(p)) for p in pts)+" -- cycle"
        style={'front':'fill=fzvec!55','back':'fill=fzaux!22','spine':'fill=fzcomp!80',
               'edgeU':'fill=white','edgeV':'fill=white'}[kind]
        out.append("\\filldraw[%s,draw=fzboard,line join=round] %s;"%(style,poly))
        if kind=='front':
            a0=add(pt(0,-0.45,1)); a1=add(pt(0,0.45,1))
            out.append("\\draw[-{Stealth[length=2.2mm]},very thick,white] %s -- %s;"%(fmt(S(a0)),fmt(S(a1))))
        if kind=='edgeU':
            for f in (-0.5,0,0.5):
                out.append("\\draw[fzgray,very thin] %s -- %s;"%(fmt(S(add(pt(1,-0.9,f)))),fmt(S(add(pt(1,0.9,f))))))
        if kind=='edgeV':
            s=1 if dot(n,v)>0 else -1
            for f in (-0.5,0,0.5):
                out.append("\\draw[fzgray,very thin] %s -- %s;"%(fmt(S(add(pt(-0.8,s,f)))),fmt(S(add(pt(0.9,s,f))))))
    for p0,p1,sgn,name in front_segments:
        if sgn==1:
            lab = "above" if name=='1' else "right"
            out.append("\\draw[-{Stealth[length=1.8mm]},fzgray!70!black] %s -- %s node[%s,font=\\scriptsize,text=black]{%s};"%(fmt(S(p0)),fmt(S(p1)),lab,name))
        else:
            out.append("\\draw[fzgray,thin] %s -- %s;"%(fmt(S(p0)),fmt(S(p1))))
    # if the positive end was occluded (unlikely), still label it
I=lambda v:v
R1=rot(2,math.pi/2); R2=rot(1,math.pi/2)
comp=lambda f,g:(lambda x:f(g(x)))
out=[]
dx=3.6; dy=-3.4
rows=[ [I, R1, comp(R2,R1)], [I, R2, comp(R1,R2)] ]
labels=[("$\\pi/2$ about 1","$\\pi/2$ about 2"),("$\\pi/2$ about 2","$\\pi/2$ about 1")]
for r,row in enumerate(rows):
    out.append("\\node[font=\\small] at (-1.55,%.3f) {(%s)};"%(r*dy,'ab'[r]))
    for c,R in enumerate(row):
        draw(R,(c*dx,r*dy),out)
    for c in range(2):
        x0=c*dx+1.05; x1=(c+1)*dx-1.05
        out.append("\\draw[-{Stealth[length=2mm]},thick,fzaux] (%.3f,%.3f) to[bend left=25] node[above=1pt,font=\\footnotesize,text=black]{%s} (%.3f,%.3f);"%(x0,r*dy+0.15,labels[r][c],x1,r*dy+0.15))
print("\n".join(out))
# report orientation of final states
for name,R in (("a",comp(R2,R1)),("b",comp(R1,R2))):
    u,v,w=book(R)
    import sys
    print("%% %s: u(width)->%s v(height)->%s w(front normal)->%s"%(name,tuple(round(x) for x in u),tuple(round(x) for x in v),tuple(round(x) for x in w)))
