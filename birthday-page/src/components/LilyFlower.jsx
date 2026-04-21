import { useMemo } from 'react'

function LilyFlower({ size = 36, variant = 'lily' }) {
  const s = size / 40

  if (variant === 'thorn') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <polygon 
          points="12,2 22,12 12,22 2,12" 
          fill="#3b1b2b" 
          stroke="#8b0000" 
          strokeWidth="1" 
          opacity="0.9" 
        />
        <circle cx="12" cy="12" r="3" fill="#500" />
      </svg>
    )
  }

  const petalColor = variant === 'lily' ? '#fddd25' : '#ffd966'
  const centerColor = variant === 'lily' ? '#DAA520' : '#F4C430'

  return (
    <div style={{ 
      position: 'relative', 
      width: size, 
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg 
        width={size - 4} 
        height={size - 4} 
        viewBox="0 0 40 40"
        style={{ filter: `drop-shadow(0 0 ${3 * s}px ${variant === 'lily' ? '#FFD700' : '#FFD966'})` }}
      >
        <g transform={`translate(20, 20) scale(${s}) translate(-20, -20)`}>
          <ellipse 
            cx="20" 
            cy="8" 
            rx="4" 
            ry="6" 
            fill={petalColor} 
            opacity="0.9" 
            transform="rotate(0 20 20)"
          />
          <ellipse 
            cx="16" 
            cy="10" 
            rx="3" 
            ry="5" 
            fill={petalColor} 
            opacity="0.8" 
            transform="rotate(-30 16 10)"
          />
          <ellipse 
            cx="24" 
            cy="10" 
            rx="3" 
            ry="5" 
            fill={petalColor} 
            opacity="0.8" 
            transform="rotate(30 24 10)"
          />
          <ellipse 
            cx="14" 
            cy="14" 
            rx="2.5" 
            ry="4" 
            fill={petalColor} 
            opacity="0.75" 
            transform="rotate(-50 14 14)"
          />
          <ellipse 
            cx="26" 
            cy="14" 
            rx="2.5" 
            ry="4" 
            fill={petalColor} 
            opacity="0.75" 
            transform="rotate(50 26 14)"
          />
          <circle 
            cx="20" 
            cy="14" 
            r="4" 
            fill={centerColor} 
          />
          <circle 
            cx="18" 
            cy="12" 
            r="1.5" 
            fill="rgba(255,255,255,0.5)" 
          />
        </g>
      </svg>
    </div>
  )
}

export default LilyFlower