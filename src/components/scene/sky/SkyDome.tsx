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
  uniform vec3 horizon;
  uniform vec3 below;
  uniform vec3 sunDirection;
  uniform vec3 sunColor;
  varying vec3 vDirection;
  void main() {
    float h = vDirection.y;
    vec3 color = mix(horizon, middle, smoothstep(0.0, 0.25, h));
    color = mix(color, zenith, smoothstep(0.25, 0.85, h));
    color = mix(color, below, smoothstep(0.0, -0.35, h));
    float sun = max(dot(normalize(vDirection), normalize(sunDirection)), 0.0);
    color += sunColor * (pow(sun, 18.0) * 0.55 + pow(sun, 400.0) * 1.4);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export const SUN_DIRECTION = new Vector3(-0.5, 0.6, -0.6).normalize()

export function SkyDome() {
  const uniforms = useMemo(
    () => ({
      zenith: { value: new Color('#5e72c4') },
      middle: { value: new Color('#b9a2dd') },
      horizon: { value: new Color('#ffcfa3') },
      below: { value: new Color('#e7b8d6') },
      sunDirection: { value: SUN_DIRECTION },
      sunColor: { value: new Color('#ffe6b0') },
    }),
    [],
  )

  return (
    <mesh scale={160} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 16]} />
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
