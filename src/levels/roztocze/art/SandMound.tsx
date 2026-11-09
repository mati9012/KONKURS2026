export function SandMound({ rx, ry }: { rx: number; ry: number }) {
  return (
    <g>
      <ellipse cx={0} cy={ry * 0.35} rx={rx * 1.05} ry={ry * 0.45} fill="#7a5a3c" opacity={0.25} />
      <path
        d={`M${-rx} ${ry * 0.3}C${-rx * 0.8} ${-ry * 0.9} ${-rx * 0.2} ${-ry * 1.3} ${rx * 0.1} ${-ry * 1.2}C${rx * 0.6} ${-ry * 1.1} ${rx * 0.9} ${-ry * 0.5} ${rx} ${ry * 0.3}Z`}
        fill="#d8b47e"
        stroke="#9c7a4f"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d={`M${-rx * 0.55} ${-ry * 0.45}C${-rx * 0.3} ${-ry * 1} ${rx * 0.1} ${-ry * 1.05} ${rx * 0.3} ${-ry * 0.85}`}
        fill="none"
        stroke="#f0d6a6"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.8}
      />
    </g>
  )
}
