import { DoubleSide, ShaderMaterial } from 'three'

const vertexShader = `
  attribute float _edge;
  attribute float _flow;
  varying float vEdge;
  varying float vFlow;
  varying vec3 vWorld;
  void main() {
    vEdge = _edge;
    vFlow = _flow;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = `
  uniform float time;
  varying float vEdge;
  varying float vFlow;
  varying vec3 vWorld;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec3 deep = vec3(0.04, 0.36, 0.56);
    vec3 shallow = vec3(0.28, 0.76, 0.8);
    vec3 color = mix(deep, shallow, smoothstep(0.15, 0.95, vEdge));
    vec2 drift = vec2(vWorld.x * 3.0, vWorld.z * 3.0) + vec2(time * 0.15, -time * 0.1);
    float ripple = noise(drift) * 0.6 + noise(drift * 2.3 + 7.0) * 0.4;
    float streak = smoothstep(0.62, 0.85, noise(vec2(vFlow * 3.5 - time * 0.9, vEdge * 2.0 + vWorld.x * 0.7)));
    color += vec3(0.1, 0.14, 0.12) * ripple;
    color += vec3(0.7, 0.9, 0.95) * streak * 0.22;
    float sparkle = step(0.965, noise(drift * 6.0 + time * 0.4));
    color += vec3(1.0, 0.95, 0.8) * sparkle * 0.5;
    float foam = smoothstep(0.78, 1.0, vEdge) * (0.55 + 0.45 * noise(drift * 3.0));
    color = mix(color, vec3(0.85, 0.96, 0.98), foam * 0.45);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export function createWaterMaterial() {
  return new ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader,
    fragmentShader,
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  })
}
