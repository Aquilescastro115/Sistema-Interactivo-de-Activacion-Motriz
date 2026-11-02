import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'

const VERSION = '0.10.35'
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

export async function initializePoseDetector() {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL)

  const commonOptions = {
    baseOptions: {
      modelAssetPath: MODEL_URL,
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.45,
    minPosePresenceConfidence: 0.45,
    minTrackingConfidence: 0.45,
  }

  // Intentamos GPU primero para lograr mejor fluidez. Si el navegador/equipo
  // no lo soporta correctamente, MediaPipe se crea nuevamente sin delegate.
  try {
    return await PoseLandmarker.createFromOptions(vision, {
      ...commonOptions,
      baseOptions: {
        ...commonOptions.baseOptions,
        delegate: 'GPU',
      },
    })
  } catch (gpuError) {
    console.warn('No se pudo iniciar MediaPipe con GPU. Se usará CPU.', gpuError)
    return await PoseLandmarker.createFromOptions(vision, commonOptions)
  }
}
