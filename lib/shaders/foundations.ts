/**
 * PILLARS: each foundation's photograph, "developed" in GL.
 *
 * At rest a photo is printed as a gold-and-ink duotone. When its chapter
 * lights it bleeds in from the centre like ink soaking into paper (a ragged,
 * noise-driven front with a dark wet rim). Under the pointer a glass lens
 * refracts the print and shows the photograph in full colour, with a slight
 * chromatic split and a gold rim. One canvas draws all three plates; rects,
 * strength (show), growth and origin are per plate.
 */

import { NOISE } from "./noise";

export const foundationsFragment = /* glsl */ `
varying vec2 vUv;
uniform float uTime; uniform vec2 uResolution; uniform vec2 uMouse; uniform float uRadius;
uniform vec4 uRects[3]; uniform float uShow[3]; uniform float uGrow[3]; uniform vec2 uOrigin[3];
uniform sampler2D uTex0; uniform sampler2D uTex1; uniform sampler2D uTex2;
uniform vec3 uAspect; uniform vec3 uReady;
${NOISE}
const vec3 INK=vec3(0.075,0.062,0.05);
const vec3 GOLD=vec3(0.80,0.60,0.30);
const vec3 CREAM=vec3(0.97,0.93,0.85);
vec3 photo(int i, vec2 uv){
  if(i==0) return texture2D(uTex0,uv).rgb;
  if(i==1) return texture2D(uTex1,uv).rgb;
  return texture2D(uTex2,uv).rgb;
}
vec3 duotone(vec3 c){
  float l=dot(c,vec3(0.299,0.587,0.114));
  vec3 d=mix(INK,GOLD,smoothstep(0.04,0.62,l));
  return mix(d,CREAM,smoothstep(0.62,1.0,l));
}
void main(){
  vec2 frag=vec2(vUv.x,1.0-vUv.y);
  int row=-1; vec4 r=vec4(0.0); float show=0.0; float grow=0.0; vec2 org=vec2(0.0); float asp=1.0; float ready=0.0;
  for(int i=0;i<3;i++){
    vec4 b=uRects[i];
    if(frag.x>=b.x&&frag.x<=b.z&&frag.y>=b.y&&frag.y<=b.w){
      row=i; r=b; show=uShow[i]; grow=uGrow[i]; org=uOrigin[i];
      asp=i==0?uAspect.x:(i==1?uAspect.y:uAspect.z);
      ready=i==0?uReady.x:(i==1?uReady.y:uReady.z);
    }
  }
  if(row<0||ready<0.5){gl_FragColor=vec4(0.0);return;}
  float bh=max((r.w-r.y)*uResolution.y,1.0);
  float W=(r.z-r.x)*uResolution.x/bh;
  vec2 q=vec2((frag.x-r.x)*uResolution.x/bh,(frag.y-r.y)*uResolution.y/bh);
  float t=uTime;
  vec2 m=vec2((uMouse.x-r.x)*uResolution.x/bh,(uMouse.y-r.y)*uResolution.y/bh);

  // object-fit: cover, with a slow breathing zoom while lit
  vec2 p01=vec2(q.x/W,q.y);
  vec2 uv=p01-0.5;
  if(W>asp) uv.y*=asp/W; else uv.x*=W/asp;
  uv*=1.0-0.05*show-0.012*sin(t*0.35);
  uv+=0.5;
  uv.y=1.0-uv.y; // textures load with flipY

  // the lens: only while the pointer is over this plate
  vec2 dq=q-m; float d=length(dq);
  float inside=smoothstep(-0.02,0.04,m.x)*smoothstep(W+0.02,W-0.04,m.x)*smoothstep(-0.02,0.04,m.y)*smoothstep(1.02,0.96,m.y);
  float R=0.30;
  float lens=(1.0-smoothstep(R*0.86,R,d))*inside*show;
  // a smooth magnifier (about 1.5x at the centre, none at the rim) with a little liquid wobble
  float k=clamp(1.0-(d*d)/(R*R),0.0,1.0);
  vec2 wob=vec2(snoise(q*3.0+t*0.4),snoise(q*3.0-t*0.37+7.1))*0.006;
  vec2 off=-dq*0.34*k+wob;
  off.x/=max(W,0.001);
  off.y=-off.y;
  vec2 lu=uv+off*lens;
  vec3 col=vec3(photo(row,lu+vec2(0.003,0.0)*lens*(1.0-k)).r,photo(row,lu).g,photo(row,lu-vec2(0.003,0.0)*lens*(1.0-k)).b);
  vec3 printed=duotone(photo(row,uv));
  col=mix(printed,col*1.04,lens);
  // gold rim and a soft inner glint
  float rim=(1.0-smoothstep(0.0,0.012,abs(d-R*0.93)))*inside*show;
  col=mix(col,vec3(0.95,0.76,0.42),rim*0.75);
  col+=vec3(1.0,0.92,0.75)*pow(max(0.0,1.0-length(dq-vec2(-0.08,-0.09))/0.12),3.0)*lens*0.18;

  // ink bleed: the print soaks in from where it was lit
  vec2 o=vec2(org.x*W,org.y);
  float reach=grow*(W*1.25+1.1);
  float ragged=length(q-o)+fbm3(q*3.2+3.0)*0.32;
  float soaked=1.0-smoothstep(reach-0.18,reach,ragged);
  float wet=smoothstep(reach-0.22,reach-0.04,ragged)*soaked*step(grow,0.999);
  col=mix(col,INK,wet*0.55);

  // grain, rounded plate edge, rest strength
  col+=(hash12(frag*uResolution+fract(t)*31.0)-0.5)*0.035;
  vec2 sz=(r.zw-r.xy)*uResolution; vec2 pp=(frag-r.xy)*uResolution-sz*0.5;
  vec2 qq=abs(pp)-(sz*0.5-uRadius); float sd=length(max(qq,0.0))+min(max(qq.x,qq.y),0.0)-uRadius;
  float edge=1.0-smoothstep(-1.5,0.0,sd);
  float a=soaked*edge*mix(0.35,1.0,show);
  col=clamp(col,0.0,1.0);
  gl_FragColor=vec4(col*a,a);
}`;
