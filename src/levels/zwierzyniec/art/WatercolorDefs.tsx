export const PAINT = 'url(#zw-paint)'
export const PAINT_SOFT = 'url(#zw-paint-soft)'
export const PAINT_WASH = 'url(#zw-wash)'

const GRANULATION = '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.45 1.05'
const RIM = '0.5 0 0 0 0  0 0.5 0 0 0  0 0 0.55 0 0  0 0 0 0.55 0'

export function WatercolorDefs() {
  return (
    <defs>
      <filter id="zw-paint" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="4" />
        <feDisplacementMap
          in="SourceGraphic"
          scale="10"
          xChannelSelector="R"
          yChannelSelector="G"
          result="shape"
        />
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="9" />
        <feColorMatrix values={GRANULATION} result="grain" />
        <feComposite in="shape" in2="grain" operator="in" result="pigment" />
        <feMorphology in="shape" operator="erode" radius="2" />
        <feGaussianBlur stdDeviation="2.5" result="core" />
        <feComposite in="shape" in2="core" operator="out" />
        <feColorMatrix values={RIM} result="rim" />
        <feMerge>
          <feMergeNode in="pigment" />
          <feMergeNode in="rim" />
        </feMerge>
      </filter>
      <filter id="zw-paint-soft" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="2" />
        <feDisplacementMap
          in="SourceGraphic"
          scale="16"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feGaussianBlur stdDeviation="1.6" result="shape" />
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="5" />
        <feColorMatrix values={GRANULATION} result="grain" />
        <feComposite in="shape" in2="grain" operator="in" />
      </filter>
      <filter id="zw-wash" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves="4" seed="11" />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.88  0 0 0 -0.9 0.55" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
    </defs>
  )
}
