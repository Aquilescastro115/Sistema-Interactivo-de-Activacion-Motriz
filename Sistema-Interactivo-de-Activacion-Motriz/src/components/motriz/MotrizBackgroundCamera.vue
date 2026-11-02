<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useCamera } from '../../composables/useCamera'
import { BODY_CONNECTIONS } from '../../effects/bodyConnections'
import { getRainbowColor } from '../../effects/rainbow'

const videoRef = ref(null)
const canvasRef = ref(null)
let animId = null

const {
  isCameraActive,
  isLoadingDetector,
  cameraError,
  bodyDetected,
  bodyState,
  initCamera,
  processVideoFrame,
} = useCamera()

onMounted(async () => {
  if (videoRef.value) {
    await initCamera(videoRef.value)
    startCameraLoop()
  }
})

onBeforeUnmount(() => {
  if (animId) cancelAnimationFrame(animId)
})

function startCameraLoop() {
  if (animId) cancelAnimationFrame(animId)

  const loop = (timestamp) => {
    const video = videoRef.value
    const canvas = canvasRef.value

    // Auto-resume playback if paused or reconnected
    if (video) {
      if (video.paused && stream.value && stream.value.active) {
        video.play().catch(() => {})
      }
      if (stream.value && video.srcObject !== stream.value) {
        video.srcObject = stream.value
        video.play().catch(() => {})
      }
    }

    if (video && canvas && video.readyState >= 2) {
      const ctx = canvas.getContext('2d')
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      const w = canvas.width
      const h = canvas.height

      // Process MediaPipe pose & update hand cursor
      processVideoFrame(video, w, h, timestamp)

      // Clear overlay canvas
      ctx.clearRect(0, 0, w, h)

      // Draw full body skeleton with sticks ("palitos") and joints ("articulaciones")
      if (bodyDetected.value && bodyState.mapped?.length) {
        drawBodySkeleton(ctx)
      }
    }

    animId = requestAnimationFrame(loop)
  }

  animId = requestAnimationFrame(loop)
}

function drawBodySkeleton(ctx) {
  const mapped = bodyState.mapped
  if (!mapped?.length) return

  // 1. Draw connection bones / sticks ("palitos")
  BODY_CONNECTIONS.forEach(([start, end], index) => {
    const p1 = mapped[start]
    const p2 = mapped[end]
    if (!p1 || !p2 || (p1.visibility ?? 1) < 0.25 || (p2.visibility ?? 1) < 0.25) return

    const color = getRainbowColor(index)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.strokeStyle = color
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.shadowColor = color
    ctx.shadowBlur = 16
    ctx.stroke()
    ctx.restore()
  })

  // 2. Draw articulation joint points ("puntos de articulaciones")
  bodyState.points.forEach((point, index) => {
    const color = getRainbowColor(index + 3)
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.shadowColor = color
    ctx.shadowBlur = 14
    ctx.beginPath()
    // Radius proportional to body joint
    const radius = Math.max(8, (point.r || 30) * 0.35)
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Inner bright center core
    ctx.beginPath()
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.restore()
  })
}
</script>

<template>
  <div class="fullscreen-camera-layer">
    <!-- Fullscreen Live Webcam Video (Mirrored like a mirror) -->
    <video
      ref="videoRef"
      playsinline
      muted
      class="fullscreen-video mirror-feed"
    ></video>

    <!-- Fullscreen Pose Tracking Overlay Canvas (Rendered directly with aligned mirrored coordinates) -->
    <canvas
      ref="canvasRef"
      class="fullscreen-canvas"
    ></canvas>

    <!-- Warm Vignette (semi-transparent so the body and skeleton remain crystal clear) -->
    <div class="motriz-ambient-vignette"></div>

    <!-- Camera Startup Overlay if waiting for permission -->
    <div v-if="!isCameraActive" class="camera-startup-overlay">
      <div class="startup-card">
        <div class="startup-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8C1D2C" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        <h2>Sistema Asistencia Motriz</h2>
        <p v-if="cameraError" class="err-text">{{ cameraError }}</p>
        <p v-else>
          El sistema requiere acceso a la cámara para detectar tus movimientos y permitirte interactuar con tu mano o con el mouse.
        </p>
        <button
          type="button"
          class="btn-motriz-primary"
          :disabled="isLoadingDetector"
          @click="initCamera(videoRef)"
        >
          {{ isLoadingDetector ? 'Iniciando Detector...' : 'Activar Cámara' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fullscreen-camera-layer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
  background-color: #1a0e10;
}

.fullscreen-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mirror-feed {
  transform: scaleX(-1);
}

.fullscreen-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* Not scaleX flipped, because bodyCollision.mapLandmark already calculates mirrored coordinates */
}

/* Warm Ambient Vignette: subtle cream gradient at the extreme top & bottom */
.motriz-ambient-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: 
    linear-gradient(180deg, rgba(247, 243, 236, 0.85) 0%, rgba(247, 243, 236, 0.15) 16%, rgba(247, 243, 236, 0.04) 50%, rgba(247, 243, 236, 0.2) 80%, rgba(247, 243, 236, 0.88) 100%),
    radial-gradient(circle at 50% 50%, transparent 65%, rgba(60, 20, 25, 0.14) 100%);
}

.camera-startup-overlay {
  position: absolute;
  inset: 0;
  background: rgba(247, 243, 236, 0.96);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
}

.startup-card {
  max-width: 480px;
  background: #FFFFFF;
  border: 3px solid #E8DDD0;
  border-radius: 32px;
  padding: 36px;
  text-align: center;
  box-shadow: 0 14px 36px rgba(70, 30, 20, 0.12);
}

.startup-icon {
  width: 76px;
  height: 76px;
  background: #FDF2E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}

.startup-card h2 {
  margin: 0 0 12px;
  color: var(--motriz-red-primary);
  font-size: 1.7rem;
  font-weight: 900;
}

.startup-card p {
  color: var(--motriz-text-muted);
  line-height: 1.5;
  margin: 0 0 24px;
  font-size: 1.05rem;
}

.err-text {
  color: #DC2626 !important;
  font-weight: 700;
}
</style>
