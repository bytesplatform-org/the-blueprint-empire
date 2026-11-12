/**
 * FOR AGENCIES: an engraved credential seal in gold foil.
 *
 * Guilloche (the interlaced line-work printed on bonds, certificates and
 * official documents) in two layers: crossing wave bands across the plate,
 * and a rosette seal at its centre with a beaded ring and a domed medallion.
 * The pointer is a light: every engraved line glints where it runs across
 * the light's direction, as engraving does on foil. The seal draws itself in
 * (uDraw) as the plate scrolls into view.
 */

import { NOISE } from "./noise";

export const credentialSealFragment = /* glsl */ `
varying vec2 vUv;
uniform float uTime; uniform vec2 uResolution; uniform vec2 uLight; uniform float uLightAmt; uniform float uDraw;
${NOISE}
const float PI=3.14159265;
const vec3 BASE=vec3(0.028,0.025,0.022);
const vec3 GOLD_D=vec3(0.44,0.32,0.14);
const vec3 GOLD=vec3(0.86,0.66,0.33);
const vec3 HI=vec3(1.0,0.93,0.74);

vec2 cmul(vec2 a, vec2 b){ return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x); }
// a thin antialiased line wherever f crosses an integer
float lineOf(float f, float w){ float fw=max(fwidth(f),1e-4); float d=abs(fract(f+0.5)-0.5); return 1.0-smoothstep(w*fw*0.5, w*fw*0.5+fw, d); }
// how strongly a line of the field f glints under a light at L
float glint(float f, vec2 p, vec2 L){
  vec2 g=vec2(dFdx(f),dFdy(f)); float gl=length(g);
  if(gl<1e-6) return 0.0;
  return pow(abs(dot(g/gl, normalize(L-p+1e-5))), 6.0);
}
float ringLine(float r, float r0, float w){ float fw=max(fwidth(r),1e-5); return 1.0-smoothstep(w, w+fw*1.2, abs(r-r0)); }

void main(){
  float aspect=uResolution.x/uResolution.y;
  vec2 p=(vUv-0.5)*vec2(aspect,1.0);
  float t=uTime;
  float r=length(p);
  vec2 L=uLight;
  float near=exp(-dot(L-p,L-p)*2.4)*uLightAmt;
  float lit=0.25+0.75*near;
  vec3 col=BASE;

  // ---- background bands: two crossing wave families, quiet around the seal
  float g1=p.y*38.0+2.6*sin(p.x*4.2+t*0.12)+1.3*sin(p.x*11.0+p.y*3.0);
  float g2=p.y*38.0+2.6*sin(p.x*4.2+PI+t*0.12)+1.3*sin(p.x*11.0-p.y*3.0+1.7);
  float l1=lineOf(g1,0.8), l2=lineOf(g2,0.8);
  float clearSeal=smoothstep(0.41,0.48,r);
  float open=1.0-smoothstep(uDraw*aspect*0.62-0.06, uDraw*aspect*0.62+0.02, abs(p.x));
  float bandMask=clearSeal*open;
  col+=GOLD_D*max(l1,l2)*bandMask*(0.35+0.4*lit);
  col+=HI*max(glint(g1,p,L)*l1, glint(g2,p,L)*l2)*bandMask*near*0.9;

  // ---- the seal: angles from complex powers of the direction (no seam at ±π)
  vec2 z=r>1e-5?p/r:vec2(1.0,0.0);
  vec2 z2=cmul(z,z), z4=cmul(z2,z2), z8=cmul(z4,z4), z12=cmul(z8,z4);
  vec2 z16=cmul(z8,z8), z32=cmul(z16,z16), z60=cmul(cmul(z32,z16),z12);
  float a01=fract(atan(p.y,p.x)/(2.0*PI)+0.75);           // sweep from the top, clockwise-ish
  float sweep=uDraw*1.25-0.12;
  float vis=1.0-smoothstep(sweep-0.04, sweep, a01);
  float R=0.30;
  float inR=1.0-smoothstep(R-0.002, R+0.002, r);
  // rosette: two crossing petal families, sin(12θ ± r·18)
  float s1=z12.y*cos(r*18.0)+z12.x*sin(r*18.0);
  float s2=z12.y*cos(r*18.0)-z12.x*sin(r*18.0);
  float ro1=r*70.0+2.0*s1;
  float ro2=r*70.0-2.0*s2;
  float q1=lineOf(ro1,0.8), q2=lineOf(ro2,0.8);
  float rosette=max(q1,q2)*inR*smoothstep(0.075,0.09,r);
  col+=mix(GOLD_D,GOLD,0.55)*rosette*vis*(0.45+0.55*lit);
  col+=HI*max(glint(ro1,p,L)*q1, glint(ro2,p,L)*q2)*inR*smoothstep(0.075,0.09,r)*vis*near*1.1;
  // rings and beads
  float rings=ringLine(r,0.318,0.0012)+ringLine(r,0.347,0.0012);
  float bead=smoothstep(0.55,1.0,z60.x)*(1.0-smoothstep(0.0035,0.0075,abs(r-0.3325)));
  col+=GOLD*(rings+bead)*vis*(0.5+0.5*lit);
  col+=HI*bead*vis*near*0.5;
  // domed medallion, lit from the pointer's side
  float mr=0.075;
  float dome=1.0-smoothstep(mr-0.002, mr+0.002, r);
  vec3 n=normalize(vec3(p/mr*0.9, sqrt(max(1.0-dot(p/mr,p/mr),0.04))));
  vec3 ld=normalize(vec3(L-p, 0.55));
  float diff=max(dot(n,ld),0.0);
  float spec=pow(max(dot(reflect(-ld,n),vec3(0.0,0.0,1.0)),0.0),18.0);
  vec3 medal=GOLD_D*0.7+GOLD*diff*(0.35+0.65*uLightAmt)+HI*spec*(0.25+0.75*near);
  col=mix(col, medal, dome*smoothstep(0.0,0.3,uDraw));
  col+=GOLD*ringLine(r,0.062,0.0009)*dome*0.4;

  // ---- vignette and grain
  vec2 v=vUv-0.5; col*=1.0-0.9*dot(v,v);
  col+=(hash12(vUv*uResolution+fract(t)*41.0)-0.5)*0.025;
  gl_FragColor=vec4(col,1.0);
}`;
