<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { initializePoseDetector } from '../services/poseDetector'
import { BODY_CONNECTIONS } from '../effects/bodyConnections'
import { getRainbowColor } from '../effects/rainbow'
import { burst, clearParticles, drawParticles, updateParticles } from '../effects/particles'
import { buildBodyInteraction, findBodyHit } from '../game/bodyCollision'

const videoRef = ref(null)
const canvasRef = ref(null)
const stageRef = ref(null)
const nameRef = ref(null)

const cameraActive = ref(false)
const loadingDetector = ref(false)
const bodyDetected = ref(false)
const running = ref(false)
const gameOver = ref(false)
const countdown = ref(0)
const showSkeleton = ref(true)
const score = ref(0)
const lives = ref(3)
const timeLeft = ref(45)
const hits = ref(0)
const status = ref('Activa la cámara para comenzar el Desafío CIF.')
const error = ref('')
const playerName = ref('')
const ranking = ref(loadRanking())
const rankingSaved = ref(false)

let detector = null
let stream = null
let frameId = 0
let lastVideoTime = -1
let lastFrame = performance.now()
let spawnAccumulator = 0
let secondAccumulator = 0
let balloons = []
let body = { points: [], segments: [], mapped: [] }
let countdownTimer = null

const GAME_SECONDS = 45

const techTypes = [
  { key: 'code', label: '</>', name: 'Programación', points: 10, color: '#22d3ee' },
  { key: 'ai', label: 'AI', name: 'Inteligencia Artificial', points: 20, color: '#a78bfa' },
  { key: 'cloud', label: '☁', name: 'Cloud', points: 15, color: '#60a5fa' },
  { key: 'security', label: '🔐', name: 'Ciberseguridad', points: 20, color: '#34d399' },
  { key: 'game', label: '🎮', name: 'Juegos Serios', points: 15, color: '#fbbf24' },
  { key: 'db', label: 'DB', name: 'Bases de Datos', points: 15, color: '#fb7185' },
]

const resultMessage = computed(() => {
  if (score.value >= 450) return '¡Nivel experto! Excelente coordinación y velocidad.'
  if (score.value >= 300) return '¡Gran resultado! Estás dominando el desafío tecnológico.'
  if (score.value >= 180) return '¡Muy bien! Superaste una gran cantidad de tecnologías.'
  return '¡Buen intento! Puedes volver a jugar y superar tu puntaje.'
})

async function activateCamera() {
  if (cameraActive.value || loadingDetector.value) return
  error.value = ''
  loadingDetector.value = true
  status.value = 'Cargando reconocimiento corporal…'

  try {
    detector = await initializePoseDetector()
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })

    await nextTick()
    const video = videoRef.value
    video.srcObject = stream
    await video.play()
    cameraActive.value = true
    status.value = 'Cámara activa. Aléjate hasta que se vea tu cuerpo completo.'

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    lastFrame = performance.now()
    frameId = requestAnimationFrame(loop)
  } catch (e) {
    console.error(e)
    if (e?.name === 'NotAllowedError') error.value = 'Debes autorizar el uso de la cámara para jugar.'
    else if (e?.name === 'NotFoundError') error.value = 'No se encontró una cámara disponible.'
    else error.value = 'No fue posible iniciar la cámara o cargar el detector corporal.'
  } finally {
    loadingDetector.value = false
  }
}

function requestStart() {
  if (!cameraActive.value) {
    status.value = 'Primero debes activar la cámara.'
    return
  }
  if (!bodyDetected.value) {
    status.value = 'Ubícate de cuerpo completo frente a la cámara antes de comenzar.'
    return
  }
  if (running.value || countdown.value > 0) return

  resetRound()
  countdown.value = 3
  status.value = 'Prepárate…'
  playTone(440, 0.06)

  countdownTimer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value > 0) playTone(440 + (3 - countdown.value) * 90, 0.06)
    if (countdown.value <= 0) {
      window.clearInterval(countdownTimer)
      countdownTimer = null
      running.value = true
      status.value = '¡Atrapa tecnología y evita los BUGS!'
      playTone(820, 0.09)
    }
  }, 850)
}

function resetRound() {
  score.value = 0
  lives.value = 3
  timeLeft.value = GAME_SECONDS
  hits.value = 0
  balloons = []
  clearParticles()
  spawnAccumulator = 0
  secondAccumulator = 0
  gameOver.value = false
  rankingSaved.value = false
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const stage = stageRef.value
  if (!canvas || !stage) return
  const rect = stage.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(rect.width * dpr)
  canvas.height = Math.round(rect.height * dpr)
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
  canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
}

function loop(now) {
  const video = videoRef.value
  const canvas = canvasRef.value
  const stage = stageRef.value
  if (!video || !canvas || !stage) {
    frameId = requestAnimationFrame(loop)
    return
  }

  const rect = stage.getBoundingClientRect()
  const dt = Math.min((now - lastFrame) / 1000, 0.05)
  lastFrame = now
  detectBody(video, rect.width, rect.height, now)
  if (running.value) updateGame(dt, rect.width, rect.height)
  updateParticles(dt)
  draw(canvas.getContext('2d'), rect.width, rect.height)
  frameId = requestAnimationFrame(loop)
}

function detectBody(video, width, height, now) {
  if (!detector || video.readyState < 2 || video.currentTime === lastVideoTime) return
  lastVideoTime = video.currentTime
  try {
    const result = detector.detectForVideo(video, now)
    const landmarks = result?.landmarks?.[0]
    if (!landmarks) {
      bodyDetected.value = false
      body = { points: [], segments: [], mapped: [] }
      return
    }
    body = buildBodyInteraction(landmarks, { width, height }, video)
    bodyDetected.value = body.points.length >= 6
  } catch (e) {
    console.error('Error detectando el cuerpo:', e)
  }
}

function spawnBalloon(width) {
  const isBug = Math.random() < 0.18
  const item = isBug
    ? { key: 'bug', label: 'BUG', name: 'BUG', points: 0, color: '#111827', isBug: true }
    : { ...techTypes[Math.floor(Math.random() * techTypes.length)], isBug: false }

  const radius = 34 * (0.85 + Math.random() * 0.3)
  balloons.push({
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    x: radius + Math.random() * Math.max(1, width - radius * 2),
    y: -radius * 1.7,
    r: radius,
    speed: 78 + Math.random() * 48,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 1 + Math.random() * 1.5,
    popped: false,
    missed: false,
    ...item,
  })
}

function updateGame(dt, width, height) {
  spawnAccumulator += dt * 1000
  secondAccumulator += dt

  if (spawnAccumulator >= 720) {
    spawnAccumulator = 0
    spawnBalloon(width)
  }

  if (secondAccumulator >= 1) {
    const elapsed = Math.floor(secondAccumulator)
    secondAccumulator -= elapsed
    timeLeft.value = Math.max(0, timeLeft.value - elapsed)
    if (timeLeft.value <= 0) {
      endGame()
      return
    }
  }

  for (const balloon of balloons) {
    balloon.y += balloon.speed * dt
    balloon.sway += balloon.swaySpeed * dt
    balloon.x += Math.sin(balloon.sway) * 13 * dt

    const hitName = findBodyHit(balloon, body)
    if (hitName) {
      balloon.popped = true
      hits.value += 1

      if (balloon.isBug) {
        lives.value -= 1
        burst(balloon.x, balloon.y, '#ef4444')
        playTone(130, 0.12)
        status.value = '🐞 ¡BUG! Perdiste una vida.'
        if (lives.value <= 0) {
          endGame()
          return
        }
      } else {
        score.value += balloon.points
        burst(balloon.x, balloon.y, balloon.color)
        playTone(620 + balloon.points * 10, 0.055)
        status.value = `${balloon.name}: +${balloon.points} puntos`
      }
      continue
    }

    if (balloon.y - balloon.r > height) balloon.missed = true
  }

  balloons = balloons.filter((balloon) => !balloon.popped && !balloon.missed)
}

function endGame() {
  if (!running.value && gameOver.value) return
  running.value = false
  gameOver.value = true
  balloons = []
  status.value = `Desafío finalizado: ${score.value} puntos.`
  playTone(180, 0.22)
  nextTick(() => nameRef.value?.focus())
}

function saveScore() {
  if (rankingSaved.value) return
  const name = playerName.value.trim().slice(0, 18) || 'Visitante CIF'
  const next = [...ranking.value, { name, score: score.value, date: new Date().toISOString() }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
  ranking.value = next
  localStorage.setItem('desafio-cif-ranking', JSON.stringify(next))
  rankingSaved.value = true
}

function loadRanking() {
  try {
    return JSON.parse(localStorage.getItem('desafio-cif-ranking') || '[]')
  } catch {
    return []
  }
}

function draw(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
  for (const balloon of balloons) drawBalloon(ctx, balloon)
  drawParticles(ctx)
  if (showSkeleton.value && bodyDetected.value) drawBodySkeleton(ctx)
}

function drawBodySkeleton(ctx) {
  const mapped = body.mapped
  if (!mapped?.length) return
  BODY_CONNECTIONS.forEach(([start, end], index) => {
    const p1 = mapped[start]
    const p2 = mapped[end]
    if (!p1 || !p2 || p1.visibility < 0.25 || p2.visibility < 0.25) return
    const color = getRainbowColor(index)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.shadowColor = color
    ctx.shadowBlur = 15
    ctx.stroke()
    ctx.restore()
  })

  body.points.forEach((point, index) => {
    const color = getRainbowColor(index + 2)
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,.14)'
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(point.x, point.y, Math.max(7, point.r * 0.33), 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  })
}

function drawBalloon(ctx, balloon) {
  ctx.save()
  const color = balloon.isBug ? '#111827' : balloon.color
  const gradient = ctx.createRadialGradient(
    balloon.x - balloon.r * 0.32,
    balloon.y - balloon.r * 0.38,
    balloon.r * 0.08,
    balloon.x,
    balloon.y,
    balloon.r,
  )
  gradient.addColorStop(0, balloon.isBug ? '#6b7280' : '#ffffff')
  gradient.addColorStop(0.15, color)
  gradient.addColorStop(1, color)
  ctx.fillStyle = gradient
  ctx.shadowColor = balloon.isBug ? '#ef4444' : color
  ctx.shadowBlur = balloon.isBug ? 24 : 18
  ctx.beginPath()
  ctx.ellipse(balloon.x, balloon.y, balloon.r * 0.84, balloon.r, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(balloon.x - 6, balloon.y + balloon.r - 3)
  ctx.lineTo(balloon.x + 6, balloon.y + balloon.r - 3)
  ctx.lineTo(balloon.x, balloon.y + balloon.r + 11)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = `900 ${Math.max(13, balloon.r * 0.48)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(balloon.label, balloon.x, balloon.y + 1)
  ctx.restore()
}

function playTone(frequency, duration) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const audio = new AudioContext()
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.05, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration)
    oscillator.connect(gain).connect(audio.destination)
    oscillator.start()
    oscillator.stop(audio.currentTime + duration)
    oscillator.onended = () => audio.close()
  } catch {}
}

function shutdown() {
  cancelAnimationFrame(frameId)
  if (countdownTimer) window.clearInterval(countdownTimer)
  window.removeEventListener('resize', resizeCanvas)
  stream?.getTracks().forEach((track) => track.stop())
  detector?.close?.()
}

onBeforeUnmount(shutdown)
</script>

<template>
  <main class="app-shell">
    <header class="hero cif-hero">
      <div>
        <p class="eyebrow">UNIVERSIDAD ADVENTISTA DE CHILE · CASA ABIERTA</p>
        <h1>DESAFÍO <span>CIF</span></h1>
        <p class="subtitle"><strong>Tu cuerpo es el control.</strong> Atrapa tecnologías y evita los BUGS.</p>
      </div>

      <div class="scoreboard" aria-label="Marcador">
        <div><span>Puntaje</span><strong>{{ score }}</strong></div>
        <div><span>Tiempo</span><strong>{{ timeLeft }} s</strong></div>
        <div class="last-hit"><span>Vidas</span><strong>{{ '❤️'.repeat(Math.max(0, lives)) || '—' }}</strong></div>
      </div>
    </header>

    <section class="tech-legend" aria-label="Puntajes">
      <span>&lt;/&gt; +10</span><span>AI +20</span><span>☁ +15</span><span>🔐 +20</span><span>🎮 +15</span><span>DB +15</span><span class="bug">BUG − ❤️</span>
    </section>

    <section class="controls compact-controls">
      <button class="primary" :disabled="cameraActive || loadingDetector" @click="activateCamera">
        {{ loadingDetector ? 'Cargando detector…' : cameraActive ? '✓ Cámara activa' : '📷 Activar cámara' }}
      </button>
      <button class="success big-start" :disabled="!cameraActive || !bodyDetected || running || countdown > 0" @click="requestStart">
        ▶ {{ gameOver ? 'NUEVO DESAFÍO' : 'COMENZAR DESAFÍO' }}
      </button>
      <label class="toggle"><input v-model="showSkeleton" type="checkbox" /> Mostrar IA</label>
    </section>

    <section ref="stageRef" class="game-stage">
      <video ref="videoRef" class="camera" autoplay muted playsinline></video>
      <canvas ref="canvasRef" class="game-canvas"></canvas>

      <div v-if="!cameraActive" class="stage-message">
        <div class="camera-icon">🧍‍♂️ 💻</div>
        <h2>Tu cuerpo será el control</h2>
        <p>Activa la cámara y ubícate de cuerpo completo frente a la pantalla.</p>
      </div>

      <div v-if="cameraActive" class="detection-pill" :class="{ ok: bodyDetected }">
        <span class="dot"></span>{{ bodyDetected ? 'Cuerpo detectado por IA' : 'Buscando cuerpo completo…' }}
      </div>

      <div v-if="running" class="game-hint">ATRAPA TECNOLOGÍA · EVITA BUG</div>

      <div v-if="countdown > 0" class="countdown-overlay">
        <div class="countdown-number">{{ countdown }}</div>
        <p>¡Prepárate!</p>
      </div>

      <div v-if="gameOver" class="game-over">
        <div class="game-over-card casa-card">
          <p class="mini-title">INGENIERÍA CIVIL EN INFORMÁTICA</p>
          <h2>¡Desafío completado!</h2>
          <strong>{{ score }} puntos</strong>
          <p>{{ resultMessage }}</p>
          <p class="game-over-copy">{{ hits }} interacciones detectadas mediante visión computacional.</p>

          <div class="name-row" v-if="!rankingSaved">
            <input ref="nameRef" v-model="playerName" maxlength="18" placeholder="Nombre o nickname" @keyup.enter="saveScore" />
            <button class="primary" @click="saveScore">Guardar</button>
          </div>
          <p v-else class="saved">✓ Puntaje guardado en el TOP 5 local</p>

          <button class="success replay" @click="requestStart">Jugar otra vez</button>
          <p class="learn-copy">Este juego usa <strong>visión computacional</strong> para detectar tu cuerpo en tiempo real.</p>
        </div>
      </div>
    </section>

    <p class="status" :class="{ error }" role="status">{{ error || status }}</p>

    <section class="bottom-grid">
      <article class="info-card">
        <p class="eyebrow">¿CÓMO FUNCIONA?</p>
        <h3>Inteligencia Artificial + Programación</h3>
        <p>MediaPipe identifica puntos de tu cuerpo y el juego calcula colisiones en tiempo real directamente desde el navegador.</p>
        <strong>Ingeniería Civil en Informática · UNACH</strong>
      </article>

      <article class="ranking-card">
        <p class="eyebrow">TOP 5 · CASA ABIERTA</p>
        <ol v-if="ranking.length">
          <li v-for="(item, index) in ranking" :key="`${item.name}-${item.date}`">
            <span>{{ index + 1 }}. {{ item.name }}</span><strong>{{ item.score }}</strong>
          </li>
        </ol>
        <p v-else class="empty-ranking">Aún no hay puntajes. ¡Sé el primero!</p>
      </article>
    </section>
  </main>
</template>
