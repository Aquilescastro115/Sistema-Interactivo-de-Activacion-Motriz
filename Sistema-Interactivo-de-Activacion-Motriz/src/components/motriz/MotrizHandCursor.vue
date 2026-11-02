<script setup>
import { computed } from 'vue'
import { handCursorState } from '../../composables/useHandCursor'

const radius = 40
const circumference = 2 * Math.PI * radius // ~251.33
const strokeDashoffset = computed(() => {
  return circumference * (1 - handCursorState.dwellProgress)
})
</script>

<template>
  <div
    v-if="handCursorState.active"
    class="virtual-hand-cursor"
    :class="{ 'cursor-hovering': handCursorState.isHovering }"
    :style="{
      transform: `translate3d(${handCursorState.x}px, ${handCursorState.y}px, 0)`,
    }"
  >
    <!-- Radial Dwell Progress Ring (Larger & Clearer) -->
    <svg class="dwell-ring-svg" viewBox="0 0 96 96">
      <!-- Background track when hovering -->
      <circle
        v-if="handCursorState.isHovering"
        cx="48"
        cy="48"
        :r="radius"
        fill="none"
        stroke="rgba(255, 255, 255, 0.45)"
        stroke-width="7"
      />
      <!-- Active fill ring -->
      <circle
        v-if="handCursorState.dwellProgress > 0"
        cx="48"
        cy="48"
        :r="radius"
        fill="rgba(140, 29, 44, 0.25)"
        stroke="#F59E0B"
        stroke-width="7"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        transform="rotate(-90 48 48)"
      />
    </svg>

    <!-- Large Hand Pointer Glove Icon -->
    <div class="hand-icon-wrap">
      <svg viewBox="0 0 48 48" class="hand-svg">
        <filter id="handShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="4" stdDeviation="3.5" flood-color="rgba(0,0,0,0.4)"/>
        </filter>
        <g filter="url(#handShadow)">
          <!-- Glove shape: pointing index finger up-left -->
          <path
            d="M 18 10 C 18 6 22 6 22 10 L 22 22 L 25 18 C 27 15 31 18 29 22 L 26 26 L 31 23 C 34 21 36 25 33 28 L 27 34 C 23 38 18 40 12 36 L 8 32 C 6 30 7 26 10 26 L 14 26 L 14 10 C 14 6 18 6 18 10 Z"
            fill="#FFFFFF"
            stroke="#8C1D2C"
            stroke-width="3"
            stroke-linejoin="round"
          />
          <!-- Glove cuff lines -->
          <line x1="8" y1="36" x2="16" y2="40" stroke="#8C1D2C" stroke-width="3" stroke-linecap="round" />
        </g>
      </svg>
    </div>

    <!-- Hover tooltip label -->
    <div v-if="handCursorState.isHovering && handCursorState.dwellProgress > 0.12" class="hand-tooltip">
      <span>Mantén la mano fija</span>
    </div>
  </div>
</template>

<style scoped>
.virtual-hand-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 96px;
  height: 96px;
  margin-left: -48px;
  margin-top: -48px;
  pointer-events: none;
  z-index: 99999;
  transition: transform 0.04s linear;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dwell-ring-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hand-icon-wrap {
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.cursor-hovering .hand-icon-wrap {
  transform: scale(1.18);
}

.hand-svg {
  width: 100%;
  height: 100%;
}

.hand-tooltip {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(140, 29, 44, 0.95);
  color: #FFFFFF;
  font-size: 0.86rem;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 9999px;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  animation: motrizPopIn 0.2s ease-out;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
}
</style>
