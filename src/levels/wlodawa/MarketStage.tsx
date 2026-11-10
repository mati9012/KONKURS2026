'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { GOOD_NAMES, MARKET_HINTS, MARKET_ROUNDS } from '@/content/wlodawa'
import type { GoodId } from '@/content/wlodawa'
import { CardTray } from '@/levels/kock/CardTray'
import { DragGhost } from '@/levels/kock/DragGhost'
import { useCardDrag } from '@/levels/kock/useCardDrag'
import { CustomerArt } from '@/levels/wlodawa/art/CustomerArt'
import type { CustomerMood } from '@/levels/wlodawa/art/CustomerArt'
import { GoodIcon } from '@/levels/wlodawa/art/GoodIcon'
import { MarketBackdrop, marketStall } from '@/levels/wlodawa/art/MarketBackdrop'
import type { SceneLayout } from '@/levels/wlodawa/scene-layout'
import { shuffled } from '@/lib/shuffle'

const SHAKE_MS = 450
const THANKS_MS = 1100
const CUSTOMER = 'customer'

type MarketStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

export function MarketStage({ layout, round, playing, onRound }: MarketStageProps) {
  const { unit, ground, portrait } = layout
  const size = portrait ? 1.9 : 1.5
  const plan = MARKET_ROUNDS[Math.min(round, MARKET_ROUNDS.length - 1)]
  const [orders] = useState(() => shuffled(plan.orders))
  const [deck] = useState(() =>
    shuffled([...plan.orders.map((order) => order.good), ...plan.decoys]),
  )
  const [served, setServed] = useState(0)
  const [thanking, setThanking] = useState(false)
  const [mood, setMood] = useState<CustomerMood>('waiting')
  const [hint, setHint] = useState<string>(MARKET_HINTS.start)
  const [shaking, setShaking] = useState<string | null>(null)
  const backdrop = useMemo(() => <MarketBackdrop layout={layout} />, [layout])
  const drag = useCardDrag(drop)
  const stall = marketStall(layout)
  const order = orders[Math.min(served, orders.length - 1)]
  const sold = orders.slice(0, served + (thanking ? 1 : 0)).map((entry) => entry.good)
  const cards = deck
    .filter((id) => !sold.includes(id))
    .map((id) => ({
      id,
      label: GOOD_NAMES[id],
      icon: <GoodIcon id={id} className="size-10 sm:size-12" />,
    }))
  const draggedId = drag.drag?.moved ? (drag.drag.id as GoodId) : null
  const showTarget = playing && !thanking && (drag.selected || drag.drag?.moved)

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  useEffect(() => {
    if (!thanking) return
    const timer = setTimeout(() => {
      setThanking(false)
      setMood('waiting')
      const next = served + 1
      setServed(next)
      if (next === orders.length) onRound(round)
      else setHint(MARKET_HINTS.start)
    }, THANKS_MS)
    return () => clearTimeout(timer)
  }, [thanking, served, orders.length, onRound, round])

  function drop(card: string, target: string) {
    if (!playing || thanking || target !== CUSTOMER || served >= orders.length) return
    if (card !== order.good) {
      setShaking(card)
      setMood('puzzled')
      setHint(MARKET_HINTS.wrong)
      return
    }
    setMood('happy')
    setThanking(true)
    setHint(`${MARKET_HINTS.good} ${GOOD_NAMES[order.good]} jak znalazł.`)
  }

  const done = served >= orders.length

  return (
    <div className="absolute inset-0" {...drag.handlers}>
      <svg
        viewBox={`0 0 ${layout.world.width} ${layout.world.height}`}
        className="absolute inset-0 size-full select-none"
      >
        <WatercolorDefs />
        {backdrop}
        <AnimatePresence>
          {!done && (
            <motion.g
              key={`customer-${served}`}
              initial={{ x: -400 * unit, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400 * unit, opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              <g
                role="button"
                tabIndex={0}
                aria-label="Klient przy kramie"
                data-target={CUSTOMER}
                data-wants={order.good}
                className="cursor-pointer outline-none"
                onClick={() => drag.pick(CUSTOMER)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  drag.pick(CUSTOMER)
                }}
              >
                <rect
                  x={stall.x - 60 * size * unit}
                  y={ground - 154 * size * unit}
                  width={120 * size * unit}
                  height={194 * size * unit}
                  rx={18 * unit}
                  fill="#ffe7a3"
                  fillOpacity={drag.hovered === CUSTOMER ? 0.5 : showTarget ? 0.28 : 0}
                  stroke={drag.hovered === CUSTOMER ? '#1f5c50' : '#f2b84b'}
                  strokeOpacity={showTarget ? 1 : 0}
                  strokeWidth={3}
                  strokeDasharray="10 7"
                  className={showTarget ? 'zw-pulse' : undefined}
                />
                <g
                  transform={`translate(${stall.x} ${ground + 34 * size * unit}) scale(${unit * size})`}
                >
                  <CustomerArt look={round * 3 + served} mood={mood} />
                </g>
                {thanking && (
                  <g
                    transform={`translate(${stall.x + 34 * size * unit} ${ground - 134 * size * unit})`}
                  >
                    <motion.g initial={{ opacity: 0, y: 10 * unit }} animate={{ opacity: 1, y: 0 }}>
                      <circle r={34 * unit} fill="#fbf0d6" stroke="#b8894f" strokeWidth={3} />
                      <g transform={`translate(${-26 * unit} ${-26 * unit})`}>
                        <GoodIcon id={order.good} size={52 * unit} />
                      </g>
                    </motion.g>
                  </g>
                )}
              </g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {draggedId && drag.drag && (
        <DragGhost x={drag.drag.x} y={drag.drag.y} over={drag.hovered !== null}>
          <GoodIcon id={draggedId} className="size-16" />
        </DragGhost>
      )}

      <AnimatePresence>
        {playing && (
          <CardTray
            key={`goods-${round}`}
            label="Towary"
            cards={cards}
            selected={drag.selected}
            shaking={shaking}
            dragged={draggedId}
            onSelect={(id) => drag.setSelected((current) => (current === id ? null : id))}
            onDragStart={(id, event) => drag.start(id, event)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="market-panel"
            aria-label="Czworobok na rynku"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<GoodIcon id="bread" className="size-6" />}
              counter={`Klienci: ${served} / ${orders.length}`}
              hint={hint}
            >
              {!done && (
                <p className="mt-2 text-sm text-[#5a4630] italic sm:text-base">„{order.request}”</p>
              )}
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
