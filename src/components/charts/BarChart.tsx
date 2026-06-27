import { useEffect, useRef, useState } from 'react'

interface BarGroup {
  label: string
  values: [number, number, number]
}

interface BarChartProps {
  groups: BarGroup[]
  colors?: [string, string, string]
}

const DEFAULT_COLORS: [string, string, string] = ['var(--green)', 'var(--red)', 'var(--blue)']

export function BarChart({ groups, colors = DEFAULT_COLORS }: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setWidth(w)
    })
    ro.observe(containerRef.current)
    setWidth(containerRef.current.clientWidth)
    return () => ro.disconnect()
  }, [])

  const height = 180
  const padLeft = 40
  const padRight = 8
  const padTop = 8
  const padBottom = 24

  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom
  const n = groups.length
  const groupW = chartW / n
  const barCount = 3
  const barGap = 2
  const barW = Math.max(2, (groupW - barGap * (barCount + 1)) / barCount)

  const maxVal = Math.max(...groups.flatMap((g) => g.values), 1)

  const toY = (v: number) => padTop + chartH - (v / maxVal) * chartH

  const yTicks = 4
  const tickVals = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal / yTicks) * i)

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height}>
        {tickVals.map((v) => {
          const y = toY(v)
          return (
            <g key={v}>
              <line x1={padLeft} x2={width - padRight} y1={y} y2={y} stroke="var(--border)" strokeWidth={1} />
              <text x={padLeft - 4} y={y + 4} textAnchor="end" fill="var(--text-dim)" fontSize={9}>
                {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}
              </text>
            </g>
          )
        })}

        {groups.map((g, gi) => {
          const gx = padLeft + gi * groupW
          return (
            <g key={gi}>
              {g.values.map((v, bi) => {
                const barH = (v / maxVal) * chartH
                const x = gx + barGap + bi * (barW + barGap)
                const y = toY(v)
                return (
                  <rect
                    key={bi}
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(0, barH)}
                    fill={colors[bi]}
                    opacity={0.85}
                    rx={2}
                  />
                )
              })}
              <text
                x={gx + groupW / 2}
                y={height - 4}
                textAnchor="middle"
                fill="var(--text-dim)"
                fontSize={9}
              >
                {g.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
