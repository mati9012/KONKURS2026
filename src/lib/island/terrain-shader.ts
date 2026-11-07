import type { WebGLProgramParametersWithUniforms } from 'three'

const NOISE = `
  float terrainHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float terrainNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(terrainHash(i), terrainHash(i + vec2(1.0, 0.0)), u.x),
      mix(terrainHash(i + vec2(0.0, 1.0)), terrainHash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
`

const SURFACE_SHADING = `
  #include <color_fragment>
  {
    vec2 world = vTerrainWorld.xz;
    float c = cos(0.45);
    float s = sin(0.45);
    vec2 field = vec2(world.x * c - world.y * s, world.x * s + world.y * c);
    float grain = terrainNoise(world * 26.0);
    if (vSurface > 0.5 && vSurface < 1.5) {
      float rows = 0.5 + 0.5 * sin(field.x * 70.0);
      diffuseColor.rgb *= mix(0.8, 1.1, rows) * mix(0.92, 1.05, grain);
    } else if (vSurface > 1.5 && vSurface < 2.5) {
      float rows = 0.5 + 0.5 * sin(field.x * 60.0);
      float blossom = smoothstep(0.4, 0.75, terrainNoise(world * 55.0));
      vec3 bloom = mix(vec3(0.55, 0.38, 0.8), vec3(0.85, 0.65, 0.98), blossom);
      diffuseColor.rgb = mix(diffuseColor.rgb * 0.7, bloom, 0.55 + 0.35 * rows);
    } else if (vSurface > 2.5) {
      diffuseColor.rgb *= mix(0.85, 1.08, grain);
    } else {
      float sunlit = smoothstep(0.45, 0.85, terrainNoise(world * 1.7));
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.14, 1.12, 0.8), sunlit * 0.6);
    }
  }
`

export function applyTerrainShading(shader: WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      '#include <common>\nattribute float surface;\nvarying float vSurface;\nvarying vec3 vTerrainWorld;',
    )
    .replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvSurface = surface;\nvTerrainWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;',
    )
  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      `#include <common>\nvarying float vSurface;\nvarying vec3 vTerrainWorld;\n${NOISE}`,
    )
    .replace('#include <color_fragment>', SURFACE_SHADING)
}
