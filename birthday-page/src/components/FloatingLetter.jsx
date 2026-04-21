import { useState, useEffect, useMemo, useRef } from 'react'

const BUTTON_SIZE = 64
const MARGIN = 48
const NUM_WAYPOINTS = 7
const NUM_WAYPOINTS2 = 5
const ANIMATION_DURATION = 20

function generateWaypoints(count) {
  if (typeof window === 'undefined') {
    return Array(count + 1).fill({ x: 100, y: 100 })
  }
  const maxX = window.innerWidth - BUTTON_SIZE - MARGIN
  const maxY = window.innerHeight - BUTTON_SIZE - MARGIN
  const points = []
  for (let i = 0; i < count; i++) {
    points.push({
      x: MARGIN + Math.random() * maxX,
      y: MARGIN + Math.random() * maxY
    })
  }
  points.push(points[0])
  return points
}

function createKeyframes(waypoints) {
  const totalPoints = waypoints.length
  return waypoints.map((pt, i) => {
    const pct = Math.round((i / (totalPoints - 1)) * 100)
    return `${pct}% { transform: translate(${pt.x}px, ${pt.y}px); }`
  }).join('\n')
}

function FloatingLetter() {
  const [isOpen, setIsOpen] = useState(false)
  const [envelopePhase, setEnvelopePhase] = useState('closed')
  const [isHovered, setIsHovered] = useState(false)

  const openTimeout1 = useRef(null)
  const openTimeout2 = useRef(null)

  const waypoints = useMemo(() => generateWaypoints(NUM_WAYPOINTS), [])
  const keyframes = useMemo(() => createKeyframes(waypoints), [waypoints])
  const waypoints2 = useMemo(() => generateWaypoints(NUM_WAYPOINTS2), [])
  const keyframes2 = useMemo(() => createKeyframes(waypoints2), [waypoints2])

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.id = 'floating-letter-keyframes'
    styleEl.textContent = `@keyframes floatRandom {\n${keyframes}\n}@keyframes floatRandom2 {\n${keyframes2}\n}`
    document.head.appendChild(styleEl)
    return () => {
      const existing = document.getElementById('floating-letter-keyframes')
      if (existing) existing.remove()
    }
  }, [keyframes, keyframes2])

  useEffect(() => {
    const handleResize = () => {
      const existing = document.getElementById('floating-letter-keyframes')
      if (existing) existing.remove()
      const newPoints = generateWaypoints(NUM_WAYPOINTS)
      const newKeyframes = createKeyframes(newPoints)
      const newPoints2 = generateWaypoints(NUM_WAYPOINTS2)
      const newKeyframes2 = createKeyframes(newPoints2)
      const styleEl = document.createElement('style')
      styleEl.id = 'floating-letter-keyframes'
      styleEl.textContent = `@keyframes floatRandom {\n${newKeyframes}\n}@keyframes floatRandom2 {\n${newKeyframes2}\n}`
      document.head.appendChild(styleEl)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleOpen = () => {
    if (isOpen) return
    setIsOpen(true)
    openTimeout1.current = setTimeout(() => setEnvelopePhase('opening'), 100)
    openTimeout2.current = setTimeout(() => setEnvelopePhase('letterVisible'), 900)
  }

  const handleClose = () => {
    if (openTimeout1.current) clearTimeout(openTimeout1.current)
    if (openTimeout2.current) clearTimeout(openTimeout2.current)
    setEnvelopePhase('closed')
    setTimeout(() => {
      setIsOpen(false)
    }, 400)
  }

  useEffect(() => {
    return () => {
      if (openTimeout1.current) clearTimeout(openTimeout1.current)
      if (openTimeout2.current) clearTimeout(openTimeout2.current)
    }
  }, [])

  const bubbleStyle = {
    position: 'fixed',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #1e3a5f, #050510)',
    border: '2px solid #D4A574',
    boxShadow: '0 0 20px rgba(212, 165, 116, 0.5)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    filter: isHovered ? 'brightness(1.3) drop-shadow(0 0 12px rgba(212,165,116,0.8))' : 'none',
    transition: 'filter 0.2s, box-shadow 0.2s'
  }

  const tooltipStyle = {
    position: 'absolute',
    right: '100%',
    marginRight: '12px',
    whiteSpace: 'nowrap',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: 'white',
    background: '#1e3a5f',
    border: '1px solid rgba(212, 165, 116, 0.5)',
    opacity: 0,
    transform: 'translateX(10px)',
    transition: 'opacity 0.2s, transform 0.2s',
    pointerEvents: 'none'
  }

  if (!isOpen) {
    return (
      <>
        <button
          onClick={handleOpen}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...bubbleStyle,
            top: 0,
            left: 0,
            animation: 'floatRandom 20s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
            animationPlayState: isHovered ? 'paused' : 'running'
          }}
        >
          <span style={{ fontSize: '28px' }}>💌</span>
          <span
            style={tooltipStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0'
              e.currentTarget.style.transform = 'translateX(10px)'
            }}
          >
            Una carta para ti 💛
          </span>
        </button>
        <button
          onClick={handleOpen}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...bubbleStyle,
            top: 0,
            left: 0,
            marginTop: '64px',
            marginLeft: '64px',
            animation: 'floatRandom2 18s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
            animationDelay: '0s',
            animationPlayState: isHovered ? 'paused' : 'running'
          }}
        >
          <span style={{ fontSize: '28px' }}>🎂</span>
          <span
            style={{ ...tooltipStyle, bottom: '100%', top: '100%', marginTop: '8px', marginRight: 0, right: 'auto', left: '100%', marginLeft: '12px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0'
              e.currentTarget.style.transform = 'translateX(10px)'
            }}
          >
            Mi amor cada vez mas cerca a la hora esperada, te amo mucho que emoción que alegria en mi corazon, 💛
          </span>
        </button>
        
      </>
    )
  }

  return (
    <>
      <button
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #1e3a5f, #050510)',
          border: '2px solid #D4A574',
          boxShadow: '0 0 20px rgba(212, 165, 116, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'none',
          filter: isHovered ? 'brightness(1.3) drop-shadow(0 0 12px rgba(212,165,116,0.8))' : 'none',
          transition: 'filter 0.2s, box-shadow 0.2s',
          pointerEvents: 'none',
          opacity: 0
        }}
      >
        <span style={{ fontSize: '28px' }}>💌</span>
        <span
          className="absolute right-full mr-3 whitespace-nowrap px-3 py-1 rounded-lg text-sm text-white bg-[#1e3a5f] border border-[#D4A574]/50"
          style={{
            opacity: 0,
            transform: 'translateX(10px)',
            transition: 'opacity 0.2s, transform 0.2s',
            pointerEvents: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'translateX(0)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0'
            e.currentTarget.style.transform = 'translateX(10px)'
          }}
        >
          Una carta para ti 💛
        </span>
      </button>
      <button
        onClick={handleOpen}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #1e3a5f, #050510)',
          border: '2px solid #D4A574',
          boxShadow: '0 0 20px rgba(212, 165, 116, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'none',
          filter: 'none',
          pointerEvents: 'none',
          opacity: 0
        }}
      >
        <span style={{ fontSize: '28px' }}>🎂</span>
      </button>

      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 5, 16, 0.88)',
          backdropFilter: 'blur(6px)',
          zIndex: 99,
          cursor: 'pointer'
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(320px, 90vw)',
            maxHeight: '90vh',
            zIndex: 100
          }}
        >
          <div
            style={{
              width: 'min(320px, 90vw)',
              height: '220px',
              position: 'relative',
              transform: envelopePhase === 'opening' 
                ? 'scale(1) translateY(0)' 
                : 'scale(0.4) translateY(40px)',
              transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              margin: '0 auto'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#FFF8DC',
                border: '1px solid #D4A574',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: '#f5e6c8',
                  clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                  transform: envelopePhase === 'letterVisible' 
                    ? 'rotateX(-180deg)' 
                    : 'rotateX(0deg)',
                  transformOrigin: 'top center',
                  transition: 'transform 600ms ease-in',
                  zIndex: 2
                }}
              />
              <svg width="40" height="50" viewBox="0 0 40 50" style={{ position: 'absolute', bottom: '10px', left: '10px', transform: 'rotate(-15deg)' }}>
                <line x1="20" y1="50" x2="20" y2="20" stroke="#D4A574" strokeWidth="1.5" opacity="0.7"/>
                <ellipse cx="20" cy="12" rx="4" ry="12" fill="#D4A574" opacity="0.6"/>
                <ellipse cx="20" cy="15" rx="4" ry="10" fill="#D4A574" opacity="0.5" transform="rotate(-30 20 15)"/>
                <ellipse cx="20" cy="15" rx="4" ry="10" fill="#D4A574" opacity="0.5" transform="rotate(30 20 15)"/>
              </svg>
              <svg width="40" height="50" viewBox="0 0 40 50" style={{ position: 'absolute', bottom: '10px', right: '10px', transform: 'rotate(15deg) scaleX(-1)' }}>
                <line x1="20" y1="50" x2="20" y2="20" stroke="#D4A574" strokeWidth="1.5" opacity="0.7"/>
                <ellipse cx="20" cy="12" rx="4" ry="12" fill="#D4A574" opacity="0.6"/>
                <ellipse cx="20" cy="15" rx="4" ry="10" fill="#D4A574" opacity="0.5" transform="rotate(-30 20 15)"/>
                <ellipse cx="20" cy="15" rx="4" ry="10" fill="#D4A574" opacity="0.5" transform="rotate(30 20 15)"/>
              </svg>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#D4A574',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: envelopePhase === 'letterVisible' ? 0 : 1,
                  transition: 'opacity 300ms ease',
                  zIndex: 3,
                  fontFamily: 'Georgia, serif',
                  color: '#8B6914',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                T
              </div>
            </div>
          </div>

          {envelopePhase === 'letterVisible' && (
            <Letter onClose={handleClose} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </>
  )
}

function Letter({ onClose }) {
  const [text, setText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  const letterText = "Hola mi amor, espero que hayas tenido un lindo domingo 🌸 cada día estamos más cerca de un día muy especial, pero créeme que disfruto y me emociona tanto estar compartiendo un momento dentro de tu hermosa vida ✨ eres una bendición para todos los que rodeas"

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < letterText.length) {
        setText(letterText.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
      }
    }, 28)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 'min(300px, 85vw)',
        minHeight: '280px',
        background: 'linear-gradient(160deg, #fffef7, #FFF8DC)',
        border: '1px solid rgba(212, 165, 116, 0.4)',
        borderRadius: '4px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,165,116,0.2)',
        fontFamily: 'Georgia, serif',
        position: 'absolute',
        bottom: '-20px',
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'letterSlide 500ms cubic-bezier(0.34, 1.2, 0.64, 1) forwards',
        margin: '0 auto',
        cursor: 'default'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          color: '#9a7a5a',
          fontSize: '20px',
          cursor: 'pointer',
          minWidth: '44px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.target.style.color = '#D4A574'}
        onMouseLeave={(e) => e.target.style.color = '#9a7a5a'}
      >
        ×
      </button>

      <div style={{ fontSize: '11px', color: '#9a7a5a', textAlign: 'right', marginBottom: '16px' }}>
        21 · 04 · 2026
      </div>

      <p style={{
        fontSize: '14px',
        lineHeight: 1.9,
        color: '#3a2a1a',
        fontStyle: 'italic',
        marginBottom: '20px'
      }}>
        {text}
        <span style={{ 
          animation: 'blink 530ms infinite',
          opacity: showCursor ? 1 : 0
        }}>|</span>
      </p>

      <div style={{ textAlign: 'center', marginTop: 'auto' }}>
        <div style={{ fontSize: '12px', color: '#9a7a5a', fontStyle: 'italic', marginBottom: '4px' }}>
          con amor
        </div>
        <div style={{ color: '#D4A574', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <svg width="20" height="24" viewBox="0 0 20 24">
            <line x1="10" y1="24" x2="10" y2="8" stroke="#D4A574" strokeWidth="1" opacity="0.6"/>
            <ellipse cx="10" cy="5" rx="2.5" ry="5" fill="#D4A574" opacity="0.5"/>
            <ellipse cx="10" cy="7" rx="2.5" ry="4" fill="#D4A574" opacity="0.4" transform="rotate(-25 10 7)"/>
            <ellipse cx="10" cy="7" rx="2.5" ry="4" fill="#D4A574" opacity="0.4" transform="rotate(25 10 7)"/>
          </svg>
          Jermin Shadin ♥ :)
        </div>
      </div>

      <style>{`
        @keyframes letterSlide {
          from { transform: translateX(-50%) translateY(100%); }
          to { transform: translateX(-50%) translateY(-30%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default FloatingLetter