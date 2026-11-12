/**
 * Stable-fluids solver passes, with heat carried as dye. Each is a
 * fullscreen-quad fragment shader over a half-float target.
 */

const HEAD = /* glsl */ `varying vec2 vUv;\n`;

export const advect = HEAD + /* glsl */ `
uniform sampler2D uSource; uniform sampler2D uVelocity; uniform float uDt; uniform float uDissipation;
void main(){ vec2 c=vUv-uDt*texture2D(uVelocity,vUv).xy; gl_FragColor=texture2D(uSource,c)*uDissipation; }`;

export const splat = HEAD + /* glsl */ `
uniform sampler2D uTarget; uniform vec2 uPoint; uniform vec3 uValue; uniform float uRadius; uniform float uAspect;
void main(){ vec2 p=vUv-uPoint; p.x*=uAspect; vec3 base=texture2D(uTarget,vUv).xyz; gl_FragColor=vec4(base+uValue*exp(-dot(p,p)/uRadius),1.0); }`;

export const curl = HEAD + /* glsl */ `
uniform sampler2D uVelocity; uniform vec2 uTexel;
void main(){ float l=texture2D(uVelocity,vUv-vec2(uTexel.x,0.0)).y; float r=texture2D(uVelocity,vUv+vec2(uTexel.x,0.0)).y;
 float b=texture2D(uVelocity,vUv-vec2(0.0,uTexel.y)).x; float t=texture2D(uVelocity,vUv+vec2(0.0,uTexel.y)).x;
 gl_FragColor=vec4(0.5*(r-l-t+b),0.0,0.0,1.0); }`;

export const forces = HEAD + /* glsl */ `
uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform sampler2D uHeat; uniform vec2 uTexel; uniform float uCurlStrength; uniform float uBuoyancy; uniform float uDt;
void main(){
 float l=abs(texture2D(uCurl,vUv-vec2(uTexel.x,0.0)).x); float r=abs(texture2D(uCurl,vUv+vec2(uTexel.x,0.0)).x);
 float b=abs(texture2D(uCurl,vUv-vec2(0.0,uTexel.y)).x); float t=abs(texture2D(uCurl,vUv+vec2(0.0,uTexel.y)).x);
 float c=texture2D(uCurl,vUv).x;
 vec2 force=0.5*vec2(t-b,r-l); force/=length(force)+0.0001; force*=uCurlStrength*c; force.y*=-1.0;
 vec2 v=texture2D(uVelocity,vUv).xy+force*uDt; v.y+=texture2D(uHeat,vUv).r*uBuoyancy*uDt;
 gl_FragColor=vec4(v,0.0,1.0); }`;

export const divergence = HEAD + /* glsl */ `
uniform sampler2D uVelocity; uniform vec2 uTexel;
void main(){ float l=texture2D(uVelocity,vUv-vec2(uTexel.x,0.0)).x; float r=texture2D(uVelocity,vUv+vec2(uTexel.x,0.0)).x;
 float b=texture2D(uVelocity,vUv-vec2(0.0,uTexel.y)).y; float t=texture2D(uVelocity,vUv+vec2(0.0,uTexel.y)).y;
 gl_FragColor=vec4(0.5*(r-l+t-b),0.0,0.0,1.0); }`;

export const pressure = HEAD + /* glsl */ `
uniform sampler2D uPressure; uniform sampler2D uDivergence; uniform vec2 uTexel;
void main(){ float l=texture2D(uPressure,vUv-vec2(uTexel.x,0.0)).x; float r=texture2D(uPressure,vUv+vec2(uTexel.x,0.0)).x;
 float b=texture2D(uPressure,vUv-vec2(0.0,uTexel.y)).x; float t=texture2D(uPressure,vUv+vec2(0.0,uTexel.y)).x;
 gl_FragColor=vec4((l+r+b+t-texture2D(uDivergence,vUv).x)*0.25,0.0,0.0,1.0); }`;

export const gradient = HEAD + /* glsl */ `
uniform sampler2D uPressure; uniform sampler2D uVelocity; uniform vec2 uTexel;
void main(){ float l=texture2D(uPressure,vUv-vec2(uTexel.x,0.0)).x; float r=texture2D(uPressure,vUv+vec2(uTexel.x,0.0)).x;
 float b=texture2D(uPressure,vUv-vec2(0.0,uTexel.y)).x; float t=texture2D(uPressure,vUv+vec2(0.0,uTexel.y)).x;
 gl_FragColor=vec4(texture2D(uVelocity,vUv).xy-0.5*vec2(r-l,t-b),0.0,1.0); }`;
