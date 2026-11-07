'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  Color,
  InstancedBufferAttribute,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from 'three'
import type { InstancedMesh } from 'three'
import { SKY_COLORS, SUN_DIRECTION } from '@/components/scene/sky/SkyDome'
import { createCloudField, createPuffTexture } from '@/lib/sky/cloud-field'
import type { CloudPuff } from '@/lib/sky/cloud-field'
import type { Quality } from '@/store/game-store'

const vertexShader = `
  attribute float shade;
  attribute float spin;
  attribute float variant;
  varying vec2 vUv;
  varying float vShade;
  varying float vDepth;
  varying vec3 vCenter;
  void main() {
    vec4 center = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float scale = length(instanceMatrix[0].xyz);
    vec4 view = viewMatrix * center;
    float c = cos(spin);
    float s = sin(spin);
    view.xy += mat2(c, -s, s, c) * position.xy * scale;
    vUv = (uv + vec2(mod(variant, 2.0), floor(variant / 2.0))) * 0.5;
    vShade = shade;
    vDepth = -view.z;
    vCenter = center.xyz;
    gl_Position = projectionMatrix * view;
  }
`

const fragmentShader = `
  uniform sampler2D map;
  uniform vec3 litColor;
  uniform vec3 shadowColor;
  uniform vec3 warmColor;
  uniform vec3 hazeColor;
  uniform float hazeNear;
  uniform float hazeFar;
  uniform float opacity;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying float vShade;
  varying float vDepth;
  varying vec3 vCenter;
  void main() {
    vec4 puff = texture2D(map, vUv);
    if (puff.a < 0.01) discard;
    float light = clamp(puff.r * 1.05 + vShade * 0.25 - 0.05, 0.0, 1.0);
    light = smoothstep(-0.1, 1.05, light);
    vec3 color = mix(shadowColor, litColor, light);
    color = mix(color, warmColor, smoothstep(0.7, 1.0, light) * 0.5 * vShade);
    float low = 1.0 - smoothstep(-17.0, -5.0, vCenter.y);
    color *= mix(vec3(1.0), vec3(0.82, 0.84, 0.97), low * (1.0 - light * 0.5));
    float sunward = max(dot(normalize(vec3(vCenter.x, 0.0, vCenter.z) + 0.001), normalize(vec3(sunDirection.x, 0.0, sunDirection.z))), 0.0);
    color = mix(color, color * vec3(1.06, 0.97, 0.9), sunward * light * 0.6);
    color = mix(color, hazeColor, smoothstep(hazeNear, hazeFar, vDepth) * 0.6);
    gl_FragColor = vec4(color, puff.a * opacity);
    #include <colorspace_fragment>
  }
`

function writeInstances(mesh: InstancedMesh, puffs: CloudPuff[], order: number[]) {
  const dummy = new Object3D()
  const shade = mesh.geometry.getAttribute('shade') as InstancedBufferAttribute
  const spin = mesh.geometry.getAttribute('spin') as InstancedBufferAttribute
  const variant = mesh.geometry.getAttribute('variant') as InstancedBufferAttribute
  order.forEach((puffIndex, slot) => {
    const puff = puffs[puffIndex]
    dummy.position.set(...puff.position)
    dummy.scale.setScalar(puff.size)
    dummy.updateMatrix()
    mesh.setMatrixAt(slot, dummy.matrix)
    shade.setX(slot, puff.shade)
    spin.setX(slot, puff.spin)
    variant.setX(slot, puff.variant)
  })
  mesh.instanceMatrix.needsUpdate = true
  shade.needsUpdate = true
  spin.needsUpdate = true
  variant.needsUpdate = true
}

function sortByDistance(puffs: CloudPuff[], eye: Vector3) {
  const distances = puffs.map((puff) => {
    const dx = puff.position[0] - eye.x
    const dy = puff.position[1] - eye.y
    const dz = puff.position[2] - eye.z
    return dx * dx + dy * dy + dz * dz
  })
  return puffs.map((_, index) => index).sort((a, b) => distances[b] - distances[a])
}

type CloudPuffsProps = {
  puffs: CloudPuff[]
  opacity?: number
}

export function CloudPuffs({ puffs, opacity = 1 }: CloudPuffsProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const lastSort = useRef(new Vector3(Infinity, 0, 0))
  const camera = useThree((state) => state.camera)
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(1, 1)
    plane.setAttribute('shade', new InstancedBufferAttribute(new Float32Array(puffs.length), 1))
    plane.setAttribute('spin', new InstancedBufferAttribute(new Float32Array(puffs.length), 1))
    plane.setAttribute('variant', new InstancedBufferAttribute(new Float32Array(puffs.length), 1))
    return plane
  }, [puffs])
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          map: { value: createPuffTexture() },
          litColor: { value: new Color('#fffdf8') },
          shadowColor: { value: new Color('#9097cb') },
          warmColor: { value: new Color('#ffd9c4') },
          hazeColor: { value: new Color(SKY_COLORS.coolHorizon) },
          hazeNear: { value: 40 },
          hazeFar: { value: 200 },
          opacity: { value: opacity },
          sunDirection: { value: SUN_DIRECTION },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    [opacity],
  )

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    writeInstances(mesh, puffs, sortByDistance(puffs, camera.position))
    lastSort.current.copy(camera.position)
  }, [puffs, camera])

  useEffect(
    () => () => {
      geometry.dispose()
      material.uniforms.map.value.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh || camera.position.distanceTo(lastSort.current) < 1.5) return
    writeInstances(mesh, puffs, sortByDistance(puffs, camera.position))
    lastSort.current.copy(camera.position)
  })

  return (
    <instancedMesh
      key={puffs.length}
      ref={meshRef}
      args={[geometry, material, puffs.length]}
      frustumCulled={false}
      renderOrder={1}
    />
  )
}

type CloudSeaProps = {
  quality: Quality
}

export function CloudSea({ quality }: CloudSeaProps) {
  const puffs = useMemo(() => createCloudField(quality === 'high' ? 1 : 0.5), [quality])
  return <CloudPuffs puffs={puffs} />
}
