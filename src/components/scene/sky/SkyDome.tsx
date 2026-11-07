'use client'

import { useMemo } from 'react'
import { BackSide, Color, Vector3 } from 'three'

const vertexShader = `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform vec3 zenith;
  uniform vec3 middle;
  uniform vec3 coolHorizon;
  uniform vec3 warmHorizon;
  uniform vec3 below;
  uniform vec3 sunDirection;
  uniform vec3 sunColor;
  varying vec3 vDirection;

  float hash(float n) {
    return fract(sin(n) * 43758.5453);
  }

  void main() {
    vec3 direction = normalize(vDirection);
    vec3 sun = normalize(sunDirection);
    float h = direction.y;
    float facing = max(dot(normalize(vec3(direction.x, 0.0, direction.z)), normalize(vec3(sun.x, 0.0, sun.z))), 0.0);
    vec3 horizon = mix(coolHorizon, warmHorizon, pow(facing, 2.0));
    vec3 color = mix(horizon, middle, smoothstep(0.02, 0.32, h));
    color = mix(color, zenith, smoothstep(0.32, 0.9, h));
    color = mix(color, below, smoothstep(0.0, -0.4, h));
    float alignment = max(dot(direction, sun), 0.0);
    color += sunColor * (pow(alignment, 6.0) * 0.35 + pow(alignment, 60.0) * 0.6 + pow(alignment, 900.0) * 2.5);
    vec3 tangent = normalize(cross(sun, vec3(0.0, 1.0, 0.0)));
    vec3 bitangent = normalize(cross(tangent, sun));
    float angle = atan(dot(direction, bitangent), dot(direction, tangent));
    float ray = 0.0;
    for (int i = 0; i < 3; i++) {
      float frequency = 9.0 + float(i) * 7.0;
      ray += smoothstep(0.55, 1.0, sin(angle * frequency + hash(float(i)) * 6.28) * 0.5 + 0.5);
    }
    color += sunColor * ray * 0.12 * pow(alignment, 3.0) * smoothstep(0.995, 0.9, alignment);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export const SUN_DIRECTION = new Vector3(0.55, 0.42, -0.72).normalize()

export const SKY_COLORS = {
  zenith: '#aab6ec',
  middle: '#c2cbf1',
  coolHorizon: '#d4daf4',
  warmHorizon: '#e8dcec',
  below: '#bcc5ee',
}

export function SkyDome() {
  const uniforms = useMemo(
    () => ({
      zenith: { value: new Color(SKY_COLORS.zenith) },
      middle: { value: new Color(SKY_COLORS.middle) },
      coolHorizon: { value: new Color(SKY_COLORS.coolHorizon) },
      warmHorizon: { value: new Color(SKY_COLORS.warmHorizon) },
      below: { value: new Color(SKY_COLORS.below) },
      sunDirection: { value: SUN_DIRECTION },
      sunColor: { value: new Color('#ffe2b0') },
    }),
    [],
  )

  return (
    <mesh scale={300} renderOrder={-1}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}
