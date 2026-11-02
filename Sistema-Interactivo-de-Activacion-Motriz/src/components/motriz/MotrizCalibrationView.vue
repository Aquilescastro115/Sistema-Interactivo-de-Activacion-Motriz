<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useCamera } from '../../composables/useCamera'
import { useProfiles } from '../../composables/useProfiles'
import { playClickTone, playSelectTone, playSuccessChime } from '../../composables/useAudio'

const emit = defineEmits(['start-play', 'exit'])

const canvasRef = ref(null)
let animId = null
let hasChimedSuccess = false

const {
  isAligned,
  alignmentScore,
  bodyDetected,
  bodyState,
} = useCamera()

const { activeProfile } = useProfiles()

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  startRenderLoop()
})

onBeforeUnmount(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('resize', resizeCanvas)
})

function resizeCanvas() {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
}

function startRenderLoop() {
  const loop = () => {
    const canvas = canvasRef.value
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Play success chime once when user gets fully aligned
      if (isAligned.value && !hasChimedSuccess) {
        hasChimedSuccess = true
        playSuccessChime()
      } else if (!isAligned.value) {
        hasChimedSuccess = false
      }

      drawCalibrationSilhouette(ctx, w, h, isAligned.value, bodyDetected.value)
    }
    animId = requestAnimationFrame(loop)
  }
  animId = requestAnimationFrame(loop)
}

function drawCalibrationSilhouette(ctx, width, height, aligned, detected) {
  ctx.save()
  const strokeColor = aligned
    ? 'rgba(34, 197, 94, 0.95)' // glowing green
    : detected
    ? 'rgba(245, 158, 11, 0.9)' // warm amber
    : 'rgba(255, 255, 255, 0.85)' // clean white dashed

  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 4
  ctx.setLineDash([14, 12])
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (aligned) {
    ctx.shadowColor = 'rgba(34, 197, 94, 0.85)'
    ctx.shadowBlur = 24
  }

  // Proportional human guide centered on screen
  const cx = width * 0.42 // Centered towards the camera viewing area (leaving right sidebar clear)
  const headRadius = height * 0.08
  const headCy = height * 0.22

  // 1. Head circle
  ctx.beginPath()
  ctx.arc(cx, headCy, headRadius, 0, Math.PI * 2)
  ctx.stroke()

  // 2. Torso and Outstretched Arms
  const shoulderY = headCy + headRadius + height * 0.04
  const hipY = shoulderY + height * 0.28
  const hipWidth = width * 0.12
  const armSpan = width * 0.22

  ctx.beginPath()
  ctx.moveTo(cx - armSpan, shoulderY + 12)
  ctx.lineTo(cx - width * 0.07, shoulderY)
  ctx.lineTo(cx, shoulderY - 8)
  ctx.lineTo(cx + width * 0.07, shoulderY)
  ctx.lineTo(cx + armSpan, shoulderY + 12)
  ctx.stroke()

  // Torso box
  ctx.beginPath()
  ctx.moveTo(cx - width * 0.06, shoulderY)
  ctx.lineTo(cx - hipWidth * 0.5, hipY)
  ctx.lineTo(cx + hipWidth * 0.5, hipY)
  ctx.lineTo(cx + width * 0.06, shoulderY)
  ctx.stroke()

  // Left Leg
  ctx.beginPath()
  ctx.moveTo(cx - hipWidth * 0.4, hipY)
  ctx.lineTo(cx - hipWidth * 0.5, height * 0.72)
  ctx.lineTo(cx - hipWidth * 0.5, height * 0.9)
  ctx.stroke()

  // Right Leg
  ctx.beginPath()
  ctx.moveTo(cx + hipWidth * 0.4, hipY)
  ctx.lineTo(cx + hipWidth * 0.5, height * 0.72)
  ctx.lineTo(cx + hipWidth * 0.5, height * 0.9)
  ctx.stroke()

  // Center target crosshair (RF7: Calibración de Punto Central)
  const centerCy = (shoulderY + hipY) / 2
  ctx.setLineDash([])
  ctx.strokeStyle = aligned ? 'rgba(34, 197, 94, 0.85)' : 'rgba(245, 158, 11, 0.7)'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(cx, centerCy, 20, 0, Math.PI * 2)
  ctx.moveTo(cx - 30, centerCy)
  ctx.lineTo(cx + 30, centerCy)
  ctx.moveTo(cx, centerCy - 30)
  ctx.lineTo(cx, centerCy + 30)
  ctx.stroke()

  ctx.restore()
}

function handleStart() {
  playSelectTone()
  emit('start-play')
}

function handleExit() {
  playClickTone()
  emit('exit')
}
</script>

<template>
  <div class="prep-screen-overlay">
    <!-- Dashed Silhouette Fullscreen Overlay Canvas -->
    <canvas ref="canvasRef" class="silhouette-canvas"></canvas>

    <div class="prep-ui-layout">
      <!-- Left / Center: Status Feedback -->
      <div class="prep-center-info">
        <div
          class="alignment-pill-badge"
          :class="{ 'badge-aligned': isAligned, 'badge-waiting': !isAligned }"
        >
          <span class="status-indicator-dot"></span>
          <span>
            {{
              isAligned
                ? '¡Excelente! Estás centrado y calibrado.'
                : bodyDetected
                ? 'Colócate dentro de la silueta para calibrar tu postura.'
                : 'Párate de cuerpo completo frente a la cámara.'
            }}
          </span>
        </div>

        <div v-if="activeProfile" class="rf7-calibration-tag">
          <strong>Calibración Antropométrica (RF7):</strong>
          <span>Estatura: {{ activeProfile.heightCm }} cm • Punto central ajustado a tu campo de visión</span>
        </div>
      </div>

      <!-- Right Column: Advice Card + Actions -->
      <div class="prep-right-dock">
        <div class="motriz-card advice-card">
          <div class="advice-header-row">
            <h2 class="advice-title">¡Prepárate!</h2>
            <button type="button" class="btn-motriz-secondary btn-mini-exit" @click="handleExit">
              ✕ Salir
            </button>
          </div>
          <p class="advice-lead">Colócate en el centro de la cámara</p>

          <div class="advice-list">
            <div class="advice-row">
              <div class="advice-bubble">📐</div>
              <div>
                <strong>Espacio suficiente</strong>
                <p>1.5 a 2 metros libres frente a la pantalla.</p>
              </div>
            </div>

            <div class="advice-row">
              <div class="advice-bubble">💡</div>
              <div>
                <strong>Iluminación adecuada</strong>
                <p>Luz frontal sin reflejos directos en la lente.</p>
              </div>
            </div>

            <div class="advice-row">
              <div class="advice-bubble">🧍</div>
              <div>
                <strong>Postura relajada</strong>
                <p>Mantén los brazos sueltos y mira a la cámara.</p>
              </div>
            </div>
          </div>

          <div class="advice-action-box">
            <button
              type="button"
              class="btn-motriz-primary btn-commence"
              @click="handleStart"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span>Comenzar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prep-screen-overlay {
  position: relative;
  width: 100%;
  height: calc(100vh - 88px);
  z-index: 10;
  pointer-events: none;
}

.prep-screen-overlay * {
  pointer-events: auto;
}

.silhouette-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 5;
}

.prep-ui-layout {
  position: relative;
  z-index: 15;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 30px 40px 40px;
  box-sizing: border-box;
}

.prep-center-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 16px;
  max-width: 520px;
}

.alignment-pill-badge {
  padding: 14px 28px;
  border-radius: 9999px;
  font-size: 1.1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 8px 24px rgba(40, 20, 15, 0.2);
  backdrop-filter: blur(10px);
}

.badge-waiting {
  background: rgba(255, 253, 249, 0.94);
  color: var(--motriz-text-main);
  border: 2px solid #E2D2C1;
}

.badge-aligned {
  background: #15803D;
  color: #FFFFFF;
  border: 2px solid #86EFAC;
  box-shadow: 0 10px 28px rgba(22, 163, 74, 0.45);
}

.status-indicator-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: currentColor;
}

.rf7-calibration-tag {
  background: rgba(255, 253, 249, 0.92);
  backdrop-filter: blur(10px);
  padding: 10px 22px;
  border-radius: 18px;
  border: 1.5px solid #E0D2C2;
  font-size: 0.88rem;
  color: var(--motriz-text-main);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rf7-calibration-tag strong {
  color: var(--motriz-red-primary);
}

/* Right Dock */
.prep-right-dock {
  width: 380px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.advice-card {
  padding: 32px 28px;
  background: rgba(255, 253, 249, 0.96);
  backdrop-filter: blur(14px);
  box-shadow: 0 12px 32px rgba(70, 30, 20, 0.15);
}

.advice-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.advice-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 900;
  color: var(--motriz-red-primary);
}

.btn-mini-exit {
  padding: 6px 14px;
  font-size: 0.88rem;
}

.advice-lead {
  margin: 0 0 24px;
  font-size: 1.05rem;
  color: var(--motriz-text-muted);
  font-weight: 700;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 28px;
}

.advice-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.advice-bubble {
  font-size: 1.6rem;
  width: 44px;
  height: 44px;
  background: #FDF2E9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.advice-row strong {
  display: block;
  font-size: 1rem;
  color: var(--motriz-text-main);
  margin-bottom: 2px;
}

.advice-row p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--motriz-text-muted);
  line-height: 1.35;
}

.btn-commence {
  width: 100%;
  padding: 16px 28px;
  font-size: 1.35rem;
}
</style>
