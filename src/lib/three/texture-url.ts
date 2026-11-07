export function textureUrl(file: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/textures/${file}`
}
