/**
 * FOOTER: the wordmark as a signal. A wave packet travels across the
 * wordmark; pointer movement adds energy at the hand, and a brass trace rides
 * the wave between the letters.
 */

import { glyphChunk } from "@/lib/gl/glyphAtlas";

export const WORDMARK_WORDS = 2;

export const signalWordmarkFragment = /* glsl */ `
varying vec2 vUv;
uniform float uTime; uniform vec2 uResolution; uniform vec2 uMouse; uniform float uEnergy; uniform float uText;
${glyphChunk(WORDMARK_WORDS)}
const vec3 PAPER=vec3(0.95,0.92,0.86); const vec3 COLD=vec3(1.0,0.93,0.78); const vec3 HOT=vec3(0.87,0.65,0.31);
void main(){
  vec2 p=vec2(vUv.x,1.0-vUv.y)*uResolution; float x=vUv.x; float t=uTime;
  float packetX=fract(t*0.16)*1.6-0.3;
  float packet=exp(-pow((x-packetX)*7.0,2.0))*0.55;
  float hand=exp(-pow((x-uMouse.x)*4.0,2.0))*uEnergy;
  float env=0.04+packet+hand;
  float phase=x*34.0-t*7.0; float amp=uResolution.y*0.07*env;
  float dy=amp*sin(phase); float slope=amp*cos(phase);
  vec2 g=glyph(p-vec2(0.0,dy))*uText; float hol=glyphHollow;
  float cold=glyph(p-vec2(0.0,dy+slope*0.35)).x*uText;
  float warm=glyph(p-vec2(0.0,dy-slope*0.35)).x*uText;
  float a=g.x; vec3 col=mix(PAPER*0.72,HOT,hol*0.9)*a;
  float fc=max(cold-g.x,0.0), fw=max(warm-g.x,0.0);
  col+=COLD*fc*0.85+HOT*fw*0.85; a=max(a,max(fc,fw)*0.85);
  float traceY=uResolution.y*0.5+dy*1.6;
  float trace=(1.0-smoothstep(0.6,2.0,abs(p.y-traceY)))*smoothstep(0.03,0.25,env)*(1.0-a);
  col+=HOT*trace*0.8; a+=trace*0.8;
  a=clamp(a,0.0,1.0);
  gl_FragColor=vec4(min(col,vec3(a)),a);
}`;
