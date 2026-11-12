/**
 * Pointer liquid-film trail: a small velocity field carries a thin film of
 * "height" that the display lights like a wet surface.
 */

const HEAD = /* glsl */ `varying vec2 vUv;\n`;

const NEIGHBOURS = /* glsl */ `uniform sampler2D uSource; uniform vec2 uTexel;
vec4 L(){return texture2D(uSource,vUv-vec2(uTexel.x,0.0));} vec4 R(){return texture2D(uSource,vUv+vec2(uTexel.x,0.0));}
vec4 B(){return texture2D(uSource,vUv-vec2(0.0,uTexel.y));} vec4 T(){return texture2D(uSource,vUv+vec2(0.0,uTexel.y));}`;

export const filmAdvect = HEAD + /* glsl */ `uniform sampler2D uSource; uniform sampler2D uVelocity; uniform float uDecay; uniform float uDt;
void main(){ vec2 v=texture2D(uVelocity,vUv).xy; gl_FragColor=texture2D(uSource,clamp(vUv-v*uDt,0.001,0.999))*uDecay; }`;

export const filmSplat = HEAD + /* glsl */ `uniform sampler2D uSource; uniform vec2 uPoint; uniform vec2 uDelta; uniform float uAspect; uniform float uFilm; uniform float uAmount;
void main(){ vec2 p=vUv-uPoint; p.x*=uAspect; float g=exp(-dot(p,p)/0.00065); vec4 base=texture2D(uSource,vUv);
 if(uFilm>0.5) base.r=min(base.r+g*uAmount,1.2); else base.xy+=uDelta*g*30.0; gl_FragColor=base; }`;

export const filmDivergence = HEAD + NEIGHBOURS + /* glsl */ `
void main(){ gl_FragColor=vec4((R().x-L().x+T().y-B().y)*0.5,0.0,0.0,1.0); }`;

export const filmSolve = HEAD + NEIGHBOURS + /* glsl */ `
uniform sampler2D uDiv; void main(){ gl_FragColor=vec4((L().x+R().x+B().x+T().x-texture2D(uDiv,vUv).x)*0.25,0.0,0.0,1.0); }`;

export const filmProject = HEAD + NEIGHBOURS + /* glsl */ `
uniform sampler2D uVelocity; void main(){ vec2 v=texture2D(uVelocity,vUv).xy-0.5*vec2(R().x-L().x,T().x-B().x); gl_FragColor=vec4(v,0.0,1.0); }`;

export const filmDisplay = HEAD + /* glsl */ `uniform sampler2D uFilm; uniform vec2 uTexel;
float hAt(vec2 p){return texture2D(uFilm,p).r;}
void main(){
  float h=hAt(vUv); float wet=smoothstep(0.025,0.10,h);
  if(wet<0.001){gl_FragColor=vec4(0.0);return;}
  vec2 slope=vec2(hAt(vUv+vec2(uTexel.x,0.0))-hAt(vUv-vec2(uTexel.x,0.0)),hAt(vUv+vec2(0.0,uTexel.y))-hAt(vUv-vec2(0.0,uTexel.y)));
  vec3 n=normalize(vec3(-slope*60.0,1.0)); float bend=1.0-n.z;
  float light=dot(n,normalize(vec3(-0.4,0.6,1.0))); float spec=pow(max(light,0.0),14.0);
  float band=n.x*0.7+n.y*0.5;
  vec3 tint=mix(vec3(0.55,0.43,0.24),vec3(0.98,0.94,0.86),smoothstep(-0.3,0.65,band));
  float crest=pow(max(0.0,1.0-abs(light-0.78)*8.0),3.0);
  tint=mix(tint,vec3(0.95,0.72,0.36),clamp(crest*0.5+spec*0.25,0.0,0.6));
  float a=clamp(0.015+bend*0.28+crest*0.36+spec*0.10,0.0,0.46)*wet;
  gl_FragColor=vec4(tint*a,a);
}`;
