import { reactive } from 'vue'
import { playClickTone, playSuccessChime, playPopTone } from './useAudio'

// Global hand cursor state
export const handCursorState = reactive({
  active: false,
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  smoothX: window.innerWidth / 2,
  smoothY: window.innerHeight / 2,
  isHovering: false,
  dwellProgress: 0, // 0 to 1
  hoverTargetName: '',
  lastClickedAt: 0,
})

let currentHoverElement = null
let dwellTimer = 0
const DWELL_DURATION = 0.32 // Reducido a la mitad para una activación ultra rápida y fluida

export function useHandCursor() {
  function updateHandCursor(landmarks, videoWidth, videoHeight, dt = 0.016) {
    if (!landmarks || landmarks.length === 0) {
      handCursorState.active = false
      handCursorState.dwellProgress = 0
      currentHoverElement = null
      return
    }

    // MediaPipe Pose Landmarks:
    // 15: left_wrist, 16: right_wrist, 19: left_index, 20: right_index
    const leftIndex = landmarks[19] || landmarks[15]
    const rightIndex = landmarks[20] || landmarks[16]

    // Determine which hand is active / higher
    let chosenHand = null
    if (leftIndex && rightIndex) {
      chosenHand = leftIndex.y < rightIndex.y ? leftIndex : rightIndex
    } else {
      chosenHand = leftIndex || rightIndex
    }

    if (!chosenHand) {
      handCursorState.active = false
      return
    }

    // Hand visibility threshold (tolerante para evitar parpadeos)
    const vis = chosenHand.visibility ?? 1
    if (vis < 0.2) {
      handCursorState.active = false
      return
    }

    handCursorState.active = true

    // Mirroring: user right hand is on physical right
    const mirroredX = 1 - chosenHand.x
    const mirroredY = chosenHand.y

    // Reach amplification (1.45x from center) so seniors don't strain to reach edges
    const centerX = 0.5
    const centerY = 0.5
    const gain = 1.45

    const targetNormX = Math.max(0.04, Math.min(0.96, centerX + (mirroredX - centerX) * gain))
    const targetNormY = Math.max(0.04, Math.min(0.96, centerY + (mirroredY - centerY) * gain))

    const targetScreenX = targetNormX * window.innerWidth
    const targetScreenY = targetNormY * window.innerHeight

    // Exponential smoothing / Lerp
    const lerpSpeed = 0.32
    handCursorState.smoothX += (targetScreenX - handCursorState.smoothX) * lerpSpeed
    handCursorState.smoothY += (targetScreenY - handCursorState.smoothY) * lerpSpeed

    handCursorState.x = handCursorState.smoothX
    handCursorState.y = handCursorState.smoothY

    // Process Hover and Dwell Click
    processHoverAndDwell(handCursorState.x, handCursorState.y, dt)
  }

  function processHoverAndDwell(x, y, dt) {
    const now = performance.now()
    if (now - handCursorState.lastClickedAt < 350) {
      handCursorState.dwellProgress = 0
      return
    }

    // Find interactive element under hand cursor
    const element = document.elementFromPoint(x, y)
    const clickable = findClickable(element)

    if (clickable) {
      handCursorState.isHovering = true
      handCursorState.hoverTargetName = clickable.innerText?.slice(0, 20) || 'Botón'

      if (clickable === currentHoverElement) {
        dwellTimer += dt
        handCursorState.dwellProgress = Math.min(dwellTimer / DWELL_DURATION, 1.0)

        // Trigger Click when dwell completes!
        if (handCursorState.dwellProgress >= 1.0) {
          handCursorState.lastClickedAt = now
          handCursorState.dwellProgress = 0
          dwellTimer = 0
          playSuccessChime()

          try {
            clickable.click()
            clickable.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
            clickable.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
          } catch (e) {
            console.warn('Error clicking element via hand:', e)
          }
        }
      } else {
        currentHoverElement = clickable
        dwellTimer = 0
        handCursorState.dwellProgress = 0
        playPopTone()
      }
    } else {
      handCursorState.isHovering = false
      handCursorState.hoverTargetName = ''
      currentHoverElement = null
      dwellTimer = 0
      handCursorState.dwellProgress = 0
    }
  }

  function findClickable(el) {
    if (!el) return null
    let cur = el
    while (cur && cur !== document.body) {
      if (cur.classList.contains('motriz-modal-overlay') || cur.tagName === 'CANVAS' || cur.tagName === 'VIDEO') {
        return null
      }
      if (
        cur.tagName === 'BUTTON' ||
        cur.tagName === 'A' ||
        cur.getAttribute('role') === 'button' ||
        cur.classList.contains('clickable') ||
        cur.classList.contains('btn-motriz-primary') ||
        cur.classList.contains('btn-motriz-secondary') ||
        cur.classList.contains('btn-round-action') ||
        cur.classList.contains('lab-card') ||
        cur.classList.contains('game-card') ||
        cur.classList.contains('profile-item-card') ||
        cur.classList.contains('tab-btn') ||
        cur.classList.contains('diff-pill') ||
        cur.classList.contains('avatar-opt-btn')
      ) {
        return cur
      }
      cur = cur.parentElement
    }
    return null
  }

  return {
    handCursorState,
    updateHandCursor,
  }
}
