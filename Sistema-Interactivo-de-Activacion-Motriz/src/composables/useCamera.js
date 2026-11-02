import { ref, reactive } from 'vue'
import { initializePoseDetector } from '../services/poseDetector'
import { buildBodyInteraction } from '../game/bodyCollision'
import { useHandCursor } from './useHandCursor'

// Global shared camera state so navigating between views does not reset or flicker the webcam
const stream = ref(null)
const isCameraActive = ref(false)
const isLoadingDetector = ref(false)
const isDetectorReady = ref(false)
const cameraError = ref('')
const bodyDetected = ref(false)
const isAligned = ref(false) // Whether user is centered inside calibration silhouette
const alignmentScore = ref(0) // 0 to 100%

const bodyState = reactive({
  landmarks: null,
  points: [],
  segments: [],
  mapped: [],
  centerPoint: { x: 0.5, y: 0.5 },
  headY: 0.2,
  feetY: 0.85,
  armSpan: 0.5,
})

let detector = null
let sharedVideoEl = null
let lastVideoTimestamp = 0

export function useCamera() {
  async function initCamera(videoElement) {
    if (videoElement) {
      sharedVideoEl = videoElement
    }

    const hasLiveTracks = stream.value?.getVideoTracks()?.some((t) => t.readyState === 'live')

    if (stream.value && stream.value.active && hasLiveTracks && sharedVideoEl) {
      if (sharedVideoEl.srcObject !== stream.value) {
        sharedVideoEl.srcObject = stream.value
      }
      try {
        await sharedVideoEl.play()
      } catch (e) {
        // play might require interaction
      }
      isCameraActive.value = true
      return true
    }

    cameraError.value = ''
    isLoadingDetector.value = true

    try {
      if (!detector) {
        detector = await initializePoseDetector()
        isDetectorReady.value = true
      }

      if (!stream.value || !stream.value.active || !hasLiveTracks) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        stream.value = mediaStream
      }

      if (sharedVideoEl && stream.value) {
        sharedVideoEl.srcObject = stream.value
        await sharedVideoEl.play()
      }

      isCameraActive.value = true
      return true
    } catch (err) {
      console.error('Error al inicializar cámara o detector:', err)
      if (err?.name === 'NotAllowedError') {
        cameraError.value = 'Permiso de cámara denegado. Por favor autoriza el acceso a la cámara.'
      } else if (err?.name === 'NotFoundError') {
        cameraError.value = 'No se encontró ninguna cámara disponible en tu dispositivo.'
      } else {
        cameraError.value = 'No se pudo inicializar la cámara o el reconocimiento corporal.'
      }
      return false
    } finally {
      isLoadingDetector.value = false
    }
  }

  function attachVideo(videoElement) {
    sharedVideoEl = videoElement
    if (sharedVideoEl && stream.value) {
      sharedVideoEl.srcObject = stream.value
      sharedVideoEl.play().catch(() => {})
    }
  }

  function processVideoFrame(video, width, height, timestamp) {
    if (!detector || !video || video.readyState < 2) return

    try {
      // Enforce strictly monotonic increasing timestamp for MediaPipe PoseLandmarker
      let ts = typeof timestamp === 'number' && !isNaN(timestamp) && timestamp > 0 ? timestamp : performance.now()
      if (ts <= lastVideoTimestamp) {
        ts = lastVideoTimestamp + 1
      }
      lastVideoTimestamp = ts

      const result = detector.detectForVideo(video, ts)
      const landmarks = result?.landmarks?.[0]

      if (!landmarks || landmarks.length === 0) {
        bodyDetected.value = false
        isAligned.value = false
        alignmentScore.value = 0
        bodyState.landmarks = null
        bodyState.points = []
        bodyState.segments = []
        const { updateHandCursor } = useHandCursor()
        updateHandCursor(null)
        return
      }

      bodyState.landmarks = landmarks
      const interaction = buildBodyInteraction(landmarks, { width, height }, video)
      bodyState.points = interaction.points
      bodyState.segments = interaction.segments
      bodyState.mapped = interaction.mapped

      bodyDetected.value = interaction.points.length >= 6

      // Update virtual hand cursor for motion control & dwell click
      const { updateHandCursor } = useHandCursor()
      updateHandCursor(landmarks, width, height, 0.016)

      // Key landmarks (MediaPipe Pose):
      // 0: nose, 11: left shoulder, 12: right shoulder, 23: left hip, 24: right hip, 27: left ankle, 28: right ankle
      const nose = landmarks[0]
      const leftShoulder = landmarks[11]
      const rightShoulder = landmarks[12]
      const leftHip = landmarks[23]
      const rightHip = landmarks[24]

      if (nose && leftShoulder && rightShoulder && leftHip && rightHip) {
        const centerX = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4
        const centerY = (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4
        bodyState.centerPoint = { x: centerX, y: centerY }
        bodyState.headY = nose.y

        // Alignment check (Screen 3: Colócate en el centro de la cámara)
        // Center of user should be roughly between 0.35 and 0.65 horizontally
        // and nose should be in top third (0.10 to 0.45)
        const isCenteredX = centerX >= 0.35 && centerX <= 0.65
        const isGoodHeight = nose.y >= 0.1 && nose.y <= 0.5
        const shouldersWidth = Math.abs(leftShoulder.x - rightShoulder.x)
        const isGoodDistance = shouldersWidth >= 0.12 && shouldersWidth <= 0.45

        if (isCenteredX && isGoodHeight && isGoodDistance) {
          isAligned.value = true
          alignmentScore.value = 100
        } else {
          isAligned.value = false
          let score = 30
          if (isCenteredX) score += 35
          if (isGoodHeight) score += 20
          if (isGoodDistance) score += 15
          alignmentScore.value = score
        }
      }
    } catch (e) {
      console.warn('Error detectando pose en frame:', e)
      // Auto-recreate detector if corrupted or closed
      if (e?.message?.includes?.('closed') || e?.message?.includes?.('monotonically')) {
        detector = null
        initializePoseDetector().then((d) => {
          detector = d
          isDetectorReady.value = true
        })
      }
    }
  }

  function stopCamera() {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
      stream.value = null
    }
    isCameraActive.value = false
  }

  return {
    stream,
    isCameraActive,
    isLoadingDetector,
    isDetectorReady,
    cameraError,
    bodyDetected,
    isAligned,
    alignmentScore,
    bodyState,
    initCamera,
    attachVideo,
    processVideoFrame,
    stopCamera,
  }
}
