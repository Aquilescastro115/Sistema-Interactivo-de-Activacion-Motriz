<script setup>
import { onMounted, onBeforeUnmount, ref, reactive, computed } from 'vue'
import { useCamera } from '../../composables/useCamera'
import { useProfiles } from '../../composables/useProfiles'
import { playClickTone, playPopTone, playSuccessChime, playFanfareTune } from '../../composables/useAudio'
import { burst, clearParticles, drawParticles, updateParticles } from '../../effects/particles'
import { findBodyHit } from '../../game/bodyCollision'

const props = defineProps({
  gameMode: {
    type: String,
    default: 'alcanza-colores',
  },
})

const emit = defineEmits(['finish', 'exit'])

const videoRef = ref(null)
const canvasRef = ref(null)
const stageRef = ref(null)

const {
  isCameraActive,
  bodyDetected,
  bodyState,
  initCamera,
  processVideoFrame,
} = useCamera()

const { activeProfile, updateActiveStats } = useProfiles()

const isPaused = ref(false)
const score = ref(0)
const timeLeft = ref(45)
const hitsCount = ref(0)
const comboCount = ref(1)
const feedbackMessage = ref('')
const feedbackPoints = ref(0)
let feedbackTimeout = null

let animId = null
let lastFrameTime = performance.now()
let spawnAccumulator = 0
let secondAccumulator = 0
let balloons = []

// Target palettes based on Document Page 6: Warm high-contrast colors (Red, Orange, Yellow)
const TARGET_COLORS = [
  { name: 'Rojo Radiante', color: '#EF4444', points: 10, label: '¡Muy bien!' },
  { name: 'Naranja Vivo', color: '#F97316', points: 15, label: '¡Excelente!' },
  { name: 'Dorado Brillante', color: '#FBBF24', points: 20, label: '¡Genial!' },
  { name: 'Cielo Claro', color: '#38BDF8', points: 10, label: '¡Muy bien!' },
]

onMounted(async () => {
  if (videoRef.value) {
    await initCamera(videoRef.value)
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    resetGame()
    lastFrameTime = performance.now()
    animId = requestAnimationFrame(gameLoop)
  }
})

onBeforeUnmount(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('resize', resizeCanvas)
  clearParticles()
})

function resetGame() {
  score.value = 0
  timeLeft.value = 45
  hitsCount.value = 0
  comboCount.value = 1
  balloons = []
  clearParticles()
  spawnAccumulator = 0
  secondAccumulator = 0
  isPaused.value = false
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

function gameLoop(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.05)
  lastFrameTime = now

  const video = videoRef.value
  const canvas = canvasRef.value
  const stage = stageRef.value

  if (video && canvas && stage && video.readyState >= 2) {
    const rect = stage.getBoundingClientRect()
    processVideoFrame(video, rect.width, rect.height, now)

    if (!isPaused.value) {
      updateGameLogic(dt, rect.width, rect.height)
    }

    updateParticles(dt)
    drawScene(canvas.getContext('2d'), rect.width, rect.height)
  }

  animId = requestAnimationFrame(gameLoop)
}

function spawnTarget(width, height) {
  // RF5 & RF7: Dynamic positioning adapted to player's height and comfortable arm range
  const config = TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)]
  const radius = 38 * (0.95 + Math.random() * 0.2)

  // Height adaptation: objects float down at gentle speed suitable for seniors
  const speed = activeProfile.value?.difficulty === 'facil' ? 65 : 85

  balloons.push({
    id: `target-${Date.now()}-${Math.random()}`,
    x: radius + 20 + Math.random() * Math.max(10, width - radius * 2 - 40),
    y: -radius * 1.5,
    r: radius,
    speed: speed + Math.random() * 25,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 1 + Math.random(),
    popped: false,
    ...config,
  })
}

function updateGameLogic(dt, width, height) {
  spawnAccumulator += dt * 1000
  secondAccumulator += dt

  // Spawn interval: every 1.1s
  if (spawnAccumulator >= 1100) {
    spawnAccumulator = 0
    if (balloons.length < 5) {
      spawnTarget(width, height)
    }
  }

  // Timer countdown
  if (secondAccumulator >= 1) {
    const elapsed = Math.floor(secondAccumulator)
    secondAccumulator -= elapsed
    timeLeft.value = Math.max(0, timeLeft.value - elapsed)

    if (timeLeft.value <= 0) {
      finishGame()
      return
    }
  }

  // Update target positions & collision
  for (const b of balloons) {
    b.y += b.speed * dt
    b.sway += b.swaySpeed * dt
    b.x += Math.sin(b.sway) * 12 * dt

    // Collision with detected body points
    if (bodyState.points.length > 0) {
      const hit = findBodyHit(b, { points: bodyState.points, segments: bodyState.segments, mapped: bodyState.mapped })
      if (hit) {
        b.popped = true
        hitsCount.value += 1
        const gained = b.points * comboCount.value
        score.value += gained
        comboCount.value = Math.min(comboCount.value + 1, 5)

        triggerFeedback(b.label, gained)
        burst(b.x, b.y, b.color)
        playPopTone()
      }
    }
  }

  // Filter out popped and off-screen balloons
  balloons = balloons.filter((b) => !b.popped && b.y < height + 80)
}

function triggerFeedback(label, pts) {
  feedbackMessage.value = label
  feedbackPoints.value = pts
  if (feedbackTimeout) clearTimeout(feedbackTimeout)
  feedbackTimeout = setTimeout(() => {
    feedbackMessage.value = ''
  }, 1100)
}

function drawScene(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)

  // 1. Draw glowing spheres / balloons
  for (const b of balloons) {
    ctx.save()
    // Sphere body
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = b.color
    ctx.shadowColor = b.color
    ctx.shadowBlur = 16
    ctx.fill()

    // 3D Spherical shine (Motriz style)
    const grad = ctx.createRadialGradient(
      b.x - b.r * 0.35,
      b.y - b.r * 0.35,
      b.r * 0.1,
      b.x,
      b.y,
      b.r
    )
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)')
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    // Subtle outline
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#FFFFFF'
    ctx.stroke()
    ctx.restore()
  }

  // 2. Draw user hand trackers
  if (bodyState.points.length > 0) {
    ctx.save()
    bodyState.points.forEach((pt) => {
      if (pt.name.includes('wrist') || pt.name.includes('index') || pt.name.includes('hand')) {
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 22, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.fill()
        ctx.lineWidth = 4
        ctx.strokeStyle = '#EF4444'
        ctx.stroke()

        // Inner glowing core
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.fill()
      }
    })
    ctx.restore()
  }

  // 3. Draw particles burst
  drawParticles(ctx)
}

function finishGame() {
  playFanfareTune()
  updateActiveStats({
    minutes: 1,
    points: score.value,
    hits: hitsCount.value,
  })
  emit('finish', {
    score: score.value,
    hits: hitsCount.value,
    timeSpent: '0:45',
    stars: score.value >= 250 ? 3 : score.value >= 140 ? 2 : 1,
  })
}

function togglePause() {
  playClickTone()
  isPaused.value = !isPaused.value
}

function restartGame() {
  playClickTone()
  resetGame()
}

function exitToMenu() {
  playClickTone()
  emit('exit')
}

const formattedTimer = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `0${m}:${s < 10 ? '0' : ''}${s}`
})
</script>

<template>
  <div class="game-view-container">
    <!-- Top Motriz In-Game HUD (Screen 5 & 6) -->
    <div class="game-hud-bar">
      <!-- Left: Game Info Pill -->
      <div class="hud-game-pill">
        <div class="hud-pill-icon">
          <svg viewBox="0 0 100 100" class="mini-balloons">
            <circle cx="45" cy="50" r="24" fill="#38BDF8"/>
            <circle cx="65" cy="45" r="25" fill="#EF4444"/>
            <circle cx="55" cy="65" r="22" fill="#FBBF24"/>
          </svg>
        </div>
        <span class="hud-pill-title">Alcanza los colores</span>
      </div>

      <!-- Center: Timer Capsule (Screen 4) -->
      <div class="hud-timer-capsule">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="timer-digits">{{ formattedTimer }}</span>
      </div>

      <!-- Right: Points Badge & Pause Button -->
      <div class="hud-right-group">
        <div class="hud-points-badge">
          <span class="points-star">★</span>
          <div class="points-content">
            <span class="points-label">PUNTOS</span>
            <span class="points-val">{{ score }}</span>
          </div>
        </div>

        <button
          type="button"
          class="btn-round-action hud-pause-btn"
          title="Pausar juego"
          aria-label="Pausa"
          @click="togglePause"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="2"/>
            <rect x="14" y="4" width="4" height="16" rx="2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Active Camera Game Stage -->
    <div ref="stageRef" class="game-stage">
      <video
        ref="videoRef"
        playsinline
        muted
        class="game-video mirror-feed"
      ></video>

      <canvas
        ref="canvasRef"
        class="game-canvas mirror-feed"
      ></canvas>

      <!-- Cheerful In-Game Motivational Toast (Screen 5 & 6) -->
      <transition name="motriz-pop">
        <div v-if="feedbackMessage" class="feedback-toast">
          <span class="feedback-text">{{ feedbackMessage }}</span>
          <span class="feedback-pts">+{{ feedbackPoints }}</span>
        </div>
      </transition>

      <!-- Combo Bar (Screen 6) -->
      <div class="combo-gauge-card">
        <span class="combo-label">Combo</span>
        <div class="gauge-tube">
          <div
            class="gauge-fill"
            :style="{ height: `${(comboCount / 5) * 100}%` }"
          ></div>
        </div>
        <span class="combo-multiplier">x{{ comboCount }}</span>
      </div>

      <!-- Pause Overlay Modal -->
      <div v-if="isPaused" class="motriz-modal-overlay">
        <div class="motriz-card pause-modal-card">
          <h2 class="pause-title">Pausa</h2>
          <p class="pause-desc">Tómate un respiro. Puedes continuar cuando gustes.</p>

          <div class="pause-actions">
            <button
              type="button"
              class="btn-motriz-primary pause-btn"
              @click="togglePause"
            >
              Continuar
            </button>
            <button
              type="button"
              class="btn-motriz-secondary pause-btn"
              @click="restartGame"
            >
              Reiniciar
            </button>
            <button
              type="button"
              class="btn-motriz-secondary pause-btn"
              @click="exitToMenu"
            >
              Salir al Menú
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-view-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F7F2EC;
  position: relative;
  overflow: hidden;
}

/* HUD Bar */
.game-hud-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  background: rgba(255, 253, 249, 0.94);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid var(--motriz-card-border);
  z-index: 20;
}

.hud-game-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FFFFFF;
  padding: 8px 22px;
  border-radius: 9999px;
  border: 2px solid #E6D8C8;
  box-shadow: 0 4px 12px rgba(80, 40, 30, 0.08);
}

.hud-pill-icon {
  width: 34px;
  height: 34px;
}

.mini-balloons {
  width: 100%;
  height: 100%;
}

.hud-pill-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--motriz-red-primary);
}

.hud-timer-capsule {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%);
  color: #FFFFFF;
  padding: 8px 26px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.5),
    0 6px 16px rgba(29, 78, 216, 0.3);
}

.timer-digits {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  font-family: monospace;
}

.hud-right-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hud-points-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(180deg, #F59E0B 0%, #D97706 100%);
  color: #FFFFFF;
  padding: 6px 20px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.6),
    0 6px 16px rgba(217, 119, 6, 0.35);
}

.points-star {
  font-size: 1.4rem;
  color: #FEF08A;
}

.points-content {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.points-label {
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  font-weight: 800;
  opacity: 0.9;
}

.points-val {
  font-size: 1.3rem;
  font-weight: 900;
}

.hud-pause-btn {
  width: 48px;
  height: 48px;
}

/* Stage */
.game-stage {
  flex-grow: 1;
  position: relative;
  background: #000000;
  overflow: hidden;
}

.game-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mirror-feed {
  transform: scaleX(-1);
}

.game-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Feedback Toast */
.feedback-toast {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  border: 3px solid var(--motriz-red-primary);
  border-radius: 28px;
  padding: 16px 36px;
  box-shadow: 0 12px 32px rgba(140, 29, 44, 0.35);
  display: flex;
  align-items: center;
  gap: 14px;
  pointer-events: none;
  z-index: 10;
}

.feedback-text {
  font-size: 2rem;
  font-weight: 900;
  color: var(--motriz-red-primary);
}

.feedback-pts {
  font-size: 1.6rem;
  font-weight: 900;
  color: #D97706;
}

.motriz-pop-enter-active {
  animation: motrizPopIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.motriz-pop-leave-active {
  transition: all 0.25s ease-out;
  opacity: 0;
  transform: translate(-50%, -60%) scale(0.9);
}

/* Combo Gauge (Screen 6) */
.combo-gauge-card {
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border: 2px solid #E2D2C1;
  border-radius: 24px;
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(60, 30, 20, 0.15);
  z-index: 10;
}

.combo-label {
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--motriz-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gauge-tube {
  width: 14px;
  height: 140px;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border: 1px solid #D1D5DB;
}

.gauge-fill {
  width: 100%;
  background: linear-gradient(180deg, #10B981 0%, #059669 100%);
  border-radius: 9999px;
  transition: height 0.2s ease;
}

.combo-multiplier {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--motriz-red-primary);
}

/* Pause Modal */
.pause-modal-card {
  max-width: 440px;
  width: 90%;
  padding: 36px 30px;
  text-align: center;
}

.pause-title {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--motriz-red-primary);
}

.pause-desc {
  color: var(--motriz-text-muted);
  margin: 10px 0 28px;
  font-size: 1.05rem;
}

.pause-actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pause-btn {
  width: 100%;
  padding: 14px 20px;
  font-size: 1.15rem;
}
</style>
