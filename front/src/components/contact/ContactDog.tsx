import * as React from 'react'
import { motion, useInView, useReducedMotion, type TargetAndTransition } from 'framer-motion'

// Light theme: a black Frenchie. Dark theme: deep charcoal plus a soft outline so
// the dog doesn't disappear into the near-black page.
const THEME =
  '[--dog:#171717] [--dog-shade:#0a0a0a] [--dog-hi:#2e2e2e] [--dog-line:transparent] ' +
  'dark:[--dog:#2a2a2f] dark:[--dog-shade:#1d1d21] dark:[--dog-hi:#3d3d44] dark:[--dog-line:#55555e] ' +
  '[@media(prefers-color-scheme:dark)]:[--dog:#2a2a2f] [@media(prefers-color-scheme:dark)]:[--dog-shade:#1d1d21] ' +
  '[@media(prefers-color-scheme:dark)]:[--dog-hi:#3d3d44] [@media(prefers-color-scheme:dark)]:[--dog-line:#55555e]'

const LINE = { stroke: 'var(--dog-line)', strokeWidth: 1.5 }
// Scale/rotate SVG parts around their own boxes rather than the SVG origin.
const pivot = (origin: string): React.CSSProperties => ({ transformBox: 'fill-box', transformOrigin: origin })

/**
 * Decorative animated French Bulldog beside the contact heading: black with a
 * small white chest patch. It breathes, blinks, twitches an ear and tilts its
 * head — only while on screen, and not at all for reduced-motion visitors.
 */
export function ContactDog() {
  const ref = React.useRef<SVGSVGElement>(null)
  const inView = useInView(ref)
  const reduce = useReducedMotion()
  const live = inView && !reduce
  const loop = (keyframes: TargetAndTransition): TargetAndTransition | undefined => (live ? keyframes : undefined)

  return (
    <svg ref={ref} viewBox="0 0 280 200" aria-hidden="true" className={`h-full w-full overflow-visible ${THEME}`}>
      {/* ground shadow */}
      <ellipse cx="140" cy="189" rx="66" ry="6" fill="currentColor" className="text-foreground/10" />

      {/* body: breathes from the ground up */}
      <motion.g
        style={pivot('50% 100%')}
        animate={loop({ scaleY: [1, 1.025, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } })}
      >
        {/* tail stub */}
        <ellipse cx="182" cy="176" rx="9" ry="6" fill="var(--dog-shade)" {...LINE} />
        {/* haunches */}
        <ellipse cx="100" cy="172" rx="27" ry="16" fill="var(--dog-shade)" {...LINE} />
        <ellipse cx="180" cy="172" rx="27" ry="16" fill="var(--dog-shade)" {...LINE} />
        {/* stocky torso and broad chest */}
        <path d="M98 112 C 86 136, 86 166, 96 186 L 184 186 C 194 166, 194 136, 182 112 Z" fill="var(--dog)" {...LINE} />
        {/* the little white chest patch */}
        <path d="M140 124 C 151 127, 155 137, 147 148 C 144 152, 136 152, 133 148 C 125 137, 129 127, 140 124 Z" fill="#f5f5f4" />
        {/* short, thick, slightly bowed front legs: just their side contours, so they grow out of the chest */}
        <path
          d="M111 160 C 109 170, 110 180, 112 186 M131 156 C 133 166, 133 177, 132 186 M169 160 C 171 170, 170 180, 168 186 M149 156 C 147 166, 147 177, 148 186"
          fill="none"
          stroke="var(--dog-hi)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <ellipse cx="121" cy="186" rx="13" ry="5" fill="var(--dog-hi)" />
        <ellipse cx="159" cy="186" rx="13" ry="5" fill="var(--dog-hi)" />
      </motion.g>

      {/* head: slow curious tilt around the neck */}
      <motion.g
        style={pivot('50% 90%')}
        animate={loop({ rotate: [0, -5, -5, 3, 3, 0], transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' } })}
      >
        {/* bat ears; the left one twitches now and then */}
        <motion.g
          style={pivot('70% 100%')}
          animate={loop({ rotate: [0, 0, -14, 0, 0], transition: { duration: 4.5, repeat: Infinity, times: [0, 0.7, 0.76, 0.84, 1] } })}
        >
          <path d="M100 66 C 84 48, 80 22, 91 11 C 102 2, 121 13, 129 30 C 133 39, 133 48, 129 54 Z" fill="var(--dog)" {...LINE} />
          <path d="M104 56 C 94 42, 92 27, 97 21 C 103 15, 115 23, 120 33 C 123 40, 123 46, 121 50 Z" fill="#6d5058" />
        </motion.g>
        <g>
          <path d="M180 66 C 196 48, 200 22, 189 11 C 178 2, 159 13, 151 30 C 147 39, 147 48, 151 54 Z" fill="var(--dog)" {...LINE} />
          <path d="M176 56 C 186 42, 188 27, 183 21 C 177 15, 165 23, 160 33 C 157 40, 157 46, 159 50 Z" fill="#6d5058" />
        </g>

        {/* skull and jowls */}
        <path
          d="M98 58 C 110 46, 170 46, 182 58 C 193 70, 195 93, 186 107 C 178 119, 160 125, 140 125 C 120 125, 102 119, 94 107 C 85 93, 87 70, 98 58 Z"
          fill="var(--dog)"
          {...LINE}
        />
        {/* brow wrinkles */}
        <path d="M129 64 C 134 60, 146 60, 151 64 M132 70 C 136 67, 144 67, 148 70" fill="none" stroke="var(--dog-hi)" strokeWidth="2" strokeLinecap="round" />

        {/* eyes blink together */}
        <motion.g
          style={pivot('50% 50%')}
          animate={loop({ scaleY: [1, 1, 0.1, 1], transition: { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] } })}
        >
          <circle cx="117" cy="86" r="9" fill="#3a271d" />
          <circle cx="117" cy="86" r="5.5" fill="#050505" />
          <circle cx="120" cy="83" r="2.4" fill="#ffffff" />
          <circle cx="163" cy="86" r="9" fill="#3a271d" />
          <circle cx="163" cy="86" r="5.5" fill="#050505" />
          <circle cx="166" cy="83" r="2.4" fill="#ffffff" />
        </motion.g>

        {/* short flat muzzle, nose, mouth */}
        <ellipse cx="140" cy="104" rx="25" ry="14" fill="var(--dog-hi)" />
        <path d="M123 93 C 131 87, 149 87, 157 93" fill="none" stroke="var(--dog)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M129 99 C 129 93, 151 93, 151 99 C 151 103, 145 105, 140 105 C 135 105, 129 103, 129 99 Z" fill="#050505" />
        <ellipse cx="135" cy="96" rx="3.2" ry="1.6" fill="#ffffff" opacity="0.35" />
        <path d="M140 105 L 140 109" stroke="#050505" strokeWidth="2" strokeLinecap="round" />
        {/* tongue: a slow little pant */}
        <motion.path
          d="M134 112 C 134 121, 146 121, 146 112 Z"
          fill="#e8798a"
          style={pivot('50% 0%')}
          animate={loop({ scaleY: [1, 1.35, 1], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } })}
        />
        {/* heavy jowls */}
        <path d="M117 104 C 116 116, 131 119, 140 110 C 149 119, 164 116, 163 104" fill="var(--dog-hi)" stroke="#050505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </svg>
  )
}
