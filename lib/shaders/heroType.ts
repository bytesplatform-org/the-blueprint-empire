/**
 * HERO: the headline drawn through a fluid. The moving medium refracts the
 * type (with cold/warm fringes), heat burns it toward brass, and each line is
 * revealed by a ragged flame front.
 */

import { glyphChunk } from "@/lib/gl/glyphAtlas";
import { NOISE } from "./noise";

export const HERO_WORDS = 6;

export const heroTypeFragment = /* glsl */ `
varying vec2 vUv;
uniform sampler2D uVelocity; uniform sampler2D uHeat;
${glyphChunk(HERO_WORDS)}
uniform vec2 uResolution; uniform float uText; uniform vec3 uReveal; uniform vec3 uRevealDir; uniform vec2 uLineX[3];
${NOISE}
const vec3 PAPER=vec3(0.95,0.92,0.86);
const vec3 COLD=vec3(1.0,0.93,0.78);
const vec3 HOT=vec3(0.87,0.65,0.31);
vec3 burn(float k){ k=clamp(k,0.0,1.0); return k<0.5?mix(vec3(0.45,0.25,0.06),HOT,k*2.0):mix(HOT,vec3(1.0,0.97,0.88),k*2.0-1.0); }
void main(){
  vec2 vel=texture2D(uVelocity,vUv).xy; float heat=texture2D(uHeat,vUv).r;
  vec2 p=vec2(vUv.x,1.0-vUv.y)*uResolution;
  // Refraction: the moving medium bends what is seen through it.
  vec2 off=vec2(vel.x,-vel.y)*uResolution.y*0.022; float ol=length(off); if(ol>90.0) off*=90.0/ol;
  vec2 g=glyph(p-off)*uText; float word=glyphWord; float hol=glyphHollow;
  float cold=glyph(p-off*1.9).x*uText; float warm=glyph(p-off*0.45).x*uText;
  float present=1.0; float lick=0.0;
  if(word>=0.0){
    int li=int(floor(word*0.5+0.01));
    float rv=li==0?uReveal.x:(li==1?uReveal.y:uReveal.z);
    float dir=li==0?uRevealDir.x:(li==1?uRevealDir.y:uRevealDir.z);
    vec2 lx=uLineX[li];
    float along=clamp((p.x-lx.x)/max(lx.y-lx.x,1.0),0.0,1.0); if(dir<0.0) along=1.0-along;
    float ragged=along+(snoise(p*0.012)*0.06+snoise(p*0.05)*0.02);
    float front=rv*1.25-0.12;
    present=smoothstep(front+0.01,front-0.03,ragged);
    float flame=(1.0-smoothstep(0.0,0.07,abs(ragged-front)))*step(rv,0.999)*step(0.001,rv);
    lick=flame*g.y;
  }
  g*=present; cold*=present; warm*=present;
  float k=smoothstep(0.05,0.85,heat);
  float a=max(g.x,g.y*k);
  vec3 base=mix(PAPER,HOT,hol*0.85);
  vec3 col=mix(base,burn(k),k)*a;
  float fc=max(cold-g.x,0.0), fw=max(warm-g.x,0.0);
  col+=COLD*fc*0.85+HOT*fw*0.85; a=max(a,max(fc,fw)*0.85);
  col=col*(1.0-lick)+burn(0.55+0.45*lick)*lick; a=a*(1.0-lick)+lick;
  a=clamp(a,0.0,1.0);
  gl_FragColor=vec4(min(col,vec3(a)),a);
}`;
