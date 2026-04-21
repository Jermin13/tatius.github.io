import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import LilyFlower from '../components/LilyFlower'

const CANASTA_WIDTH = 72
const CANASTA_HEIGHT = 36
const OBJ_SIZE = 36
const AREA_WIDTH = Math.min(360, window.innerWidth - 32)
const AREA_HEIGHT = 500
const PLAYER_SPEED = 260
const SPAWN_INTERVAL = 1000
const TYPES = [
  { type: 'lily', weight: 45 },
  { type: 'flower', weight: 45 },
  { type: 'thorn', weight: 10 }
]

function getRandomType() {
  const total = TYPES.reduce((sum, t) => sum + t.weight, 0)
  let rand = Math.random() * total
  for (const t of TYPES) {
    if (rand < t.weight) return t.type
    rand -= t.weight
  }
  return 'lily'
}

function getInitialObjects() {
  return Array.from({ length: 25 }, (_, i) => ({
    id: i,
    type: getRandomType(),
    x: Math.random() * (AREA_WIDTH - OBJ_SIZE),
    y: -Math.random() * 400,
    speed: 120 + Math.random() * 60
  }))
}

function Canasta({ x }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        bottom: 20,
        width: CANASTA_WIDTH,
        height: CANASTA_HEIGHT,
        backgroundColor: '#FFF8DC',
        border: '2px solid #D4A574',
        borderRadius: '8px 8px 4px 4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ 
        width: '80%', 
        height: '60%', 
        background: 'linear-gradient(to bottom, rgba(212,165,116,0.3), transparent)',
        borderRadius: '4px'
      }} />
    </div>
  )
}

function FallingObject({ obj }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: obj.x,
        top: obj.y,
        width: OBJ_SIZE,
        height: OBJ_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <LilyFlower size={OBJ_SIZE - 4} variant={obj.type} />
    </div>
  )
}

function Hearts({ lives }) {
  const hearts = []
  for (let i = 0; i < 3; i++) {
    hearts.push(
      <span key={i} style={{ fontSize: '20px', opacity: i < lives ? 1 : 0.3 }}>
        ❤️
      </span>
    )
  }
  return <>{hearts}</>
}

function FloatingDecorations() {
  const fireflies = useCallback(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 80 + 10,
      size: 2 + Math.random() * 2,
      duration: 8 + Math.random() * 8,
      delay: Math.random() * 10
    }))
  , [])

  const ff = fireflies()
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {ff.map(fly => (
        <div
          key={fly.id}
          className="absolute rounded-full"
          style={{
            left: `${fly.x}%`,
            top: `${fly.y}%`,
            width: fly.size,
            height: fly.size,
            backgroundColor: '#ffffaa',
            boxShadow: `0 0 ${fly.size * 2}px ${fly.size}px rgba(255, 255, 100, 0.8)`,
            animation: `firefly-float ${fly.duration}s ease-in-out infinite`,
            animationDelay: `${fly.delay}s`,
            opacity: 0.6
          }}
        />
      ))}
      <style>{`
        @keyframes firefly-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(10px, -15px) scale(1.2); opacity: 0.8; }
          50% { transform: translate(-5px, -30px) scale(0.9); opacity: 0.6; }
          75% { transform: translate(15px, -20px) scale(1.1); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}

function CatchLiliesGame() {
  const navigate = useNavigate()
  
  const [gameState, setGameState] = useState('waiting')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [playerX, setPlayerX] = useState(AREA_WIDTH / 2 - CANASTA_WIDTH / 2)
  const [objects, setObjects] = useState([])
  
  const keysPressed = useRef({ left: false, right: false })
  const lastTimeRef = useRef(0)
  const spawnTimerRef = useRef(0)
  const objIdRef = useRef(0)
  const animationRef = useRef(null)
  const touchStartX = useRef(null)

  const spawnObject = useCallback((currentObjects) => {
    const newObj = {
      id: objIdRef.current++,
      type: getRandomType(),
      x: Math.random() * (AREA_WIDTH - OBJ_SIZE),
      y: -OBJ_SIZE,
      speed: 120 + Math.random() * 60 + (score * 2)
    }
    return [...currentObjects, newObj]
  }, [score])

  const resetGame = useCallback(() => {
    setScore(0)
    setLives(3)
    setPlayerX(AREA_WIDTH / 2 - CANASTA_WIDTH / 2)
    setObjects([])
    objIdRef.current = 0
    setGameState('waiting')
  }, [])

  const gameLoop = useCallback((timestamp) => {
    if (gameState !== 'running') return

    if (!lastTimeRef.current) lastTimeRef.current = timestamp
    const deltaTime = (timestamp - lastTimeRef.current) / 1000
    lastTimeRef.current = timestamp

    setPlayerX(prevX => {
      let newX = prevX
      if (keysPressed.current.left) newX -= PLAYER_SPEED * deltaTime
      if (keysPressed.current.right) newX += PLAYER_SPEED * deltaTime
      return Math.max(0, Math.min(AREA_WIDTH - CANASTA_WIDTH, newX))
    })

    spawnTimerRef.current += deltaTime * 1000
    if (spawnTimerRef.current > SPAWN_INTERVAL - Math.min(200, score * 10)) {
      spawnTimerRef.current = 0
      setObjects(prev => spawnObject(prev))
    }

    setObjects(prev => {
      const updated = prev
        .map(obj => ({ ...obj, y: obj.y + obj.speed * deltaTime }))
        .filter(obj => obj.y < AREA_HEIGHT)

      for (let i = updated.length - 1; i >= 0; i--) {
        const obj = updated[i]
        const objBottom = obj.y + OBJ_SIZE
        const playerTop = AREA_HEIGHT - 60

        if (objBottom > playerTop && obj.y < playerTop + CANASTA_HEIGHT) {
          if (obj.x + OBJ_SIZE > playerX && obj.x < playerX + CANASTA_WIDTH) {
            if (obj.type === 'thorn') {
              setLives(l => {
                const newLives = l - 1
                if (newLives <= 0) {
                  setGameState('gameover')
                }
                return newLives
              })
            } else {
              setScore(s => s + 1)
            }
            updated.splice(i, 1)
          }
        }
      }
return updated
    })

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, playerX, spawnObject, lives, score])

  useEffect(() => {
    if (gameState === 'running') {
      lastTimeRef.current = 0
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [gameState, gameLoop])

  useEffect(() => {
    if (gameState === 'gameover') {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [gameState])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') keysPressed.current.left = true
      if (e.key === 'ArrowRight') keysPressed.current.right = true
      if (e.key === 'Enter' && gameState === 'waiting') setGameState('running')
    }
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') keysPressed.current.left = false
      if (e.key === 'ArrowRight') keysPressed.current.right = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState])

  const handleTouchStart = (e) => {
    if (gameState === 'waiting') {
      setGameState('running')
      return
    }
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    if (touchStartX.current === null || gameState !== 'running') return
    
    const deltaX = e.touches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) > 30) {
      setPlayerX(prev => {
        const newX = deltaX > 0 ? prev + 40 : prev - 40
        return Math.max(0, Math.min(AREA_WIDTH - CANASTA_WIDTH, newX))
      })
      touchStartX.current = e.touches[0].clientX
    }
  }

  const handleTouchEnd = () => {
    touchStartX.current = null
  }

  return (
    <div className="w-screen min-h-screen bg-[#050510] flex flex-col relative overflow-hidden">
      <FloatingDecorations />

      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-3 left-3 z-20 p-2 text-white/70 hover:text-white text-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        ← Volver
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h1 className="font-vintage text-xl md:text-2xl font-bold text-[#D4A574] text-center mb-1">
          Juego 3: Atrapa los Lirios
        </h1>
        <p className="text-white/50 text-xs mb-4 text-center">
          Mueve la canasta y atrapa las flores, evita las espinas
        </p>

        <div className="flex justify-between w-full max-w-[360px] mb-2 px-2">
          <span className="text-[#D4A574] font-semibold">Puntos: {score}</span>
          <span><Hearts lives={lives} /></span>
        </div>

        <div
          className="relative overflow-hidden rounded-xl border-2 border-[#D4A574]/30"
          style={{
            width: AREA_WIDTH,
            height: AREA_HEIGHT,
            backgroundColor: 'rgba(5,5,16,0.8)',
            boxShadow: '0 0 30px rgba(212,165,116,0.2)'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {gameState === 'waiting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
              <p className="text-white text-center px-4">
                Toca o presiona ENTER para empezar
              </p>
            </div>
          )}

          {objects.map(obj => (
            <FallingObject key={obj.id} obj={obj} />
          ))}

          <Canasta x={playerX} />

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <p className="text-[#FFD700] text-2xl font-vintage mb-2">
                ¡felicidades amor! 🎉
              </p>
              <p className="text-white/80 text-sm mb-4">
                Tu puntaje: {score} flores atrapadas
              </p>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-[#D4A574] text-[#050510] rounded-lg font-semibold min-h-[44px]"
              >
                Jugar otra vez
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes firefly-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(10px, -15px) scale(1.2); opacity: 0.8; }
          50% { transform: translate(-5px, -30px) scale(0.9); opacity: 0.6; }
          75% { transform: translate(15px, -20px) scale(1.1); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}

export default CatchLiliesGame