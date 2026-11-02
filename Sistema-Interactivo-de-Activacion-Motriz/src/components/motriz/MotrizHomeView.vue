<script setup>
import { useCamera } from '../../composables/useCamera'
import { useProfiles } from '../../composables/useProfiles'
import { handCursorState } from '../../composables/useHandCursor'
import { playClickTone, playSelectTone } from '../../composables/useAudio'

const emit = defineEmits(['start-game', 'create-profile', 'open-lab'])

const { bodyDetected, isAligned } = useCamera()
const { activeProfile } = useProfiles()

function handleStart() {
  playSelectTone()
  emit('start-game')
}

function handleProfile() {
  playClickTone()
  emit('create-profile')
}

function handleLab() {
  playClickTone()
  emit('open-lab')
}
</script>

<template>
  <div class="home-screen-overlay">
    <!-- Top-Center Guidance Pill -->
    <div class="top-guidance-pill">
      <span class="pulse-dot" :class="{ 'dot-active': bodyDetected }"></span>
      <span class="guidance-text">
        {{
          bodyDetected
            ? handCursorState.active
              ? '🖐️ Mano activa: Apunta hacia un botón para pulsar (o haz clic con el mouse)'
              : '🧍 Cuerpo detectado: Levanta una mano para apuntar (o usa el mouse)'
            : 'Párate frente a la cámara para iniciar el control gestual'
        }}
      </span>
    </div>

    <!-- Center Stage Greeting (Translucent & Senior-friendly) -->
    <div v-if="activeProfile" class="center-welcome-tag">
      <span class="tag-label">SESIÓN ACTIVA</span>
      <h2 class="tag-name">{{ activeProfile.name }}</h2>
      <span class="tag-meta">{{ activeProfile.heightCm }} cm estatura • Movilidad: {{ activeProfile.difficulty }}</span>
    </div>

    <!-- Bottom Capsule Buttons Area (Enlarged for Easy Accessibility) -->
    <div class="home-action-dock">
      <!-- 🚀 NUEVA PARTIDA (Crimson 3D Capsule - Extra Large) -->
      <button
        type="button"
        class="btn-motriz-primary btn-home-primary"
        @click="handleStart"
      >
        <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.13 2.21C11.39 3.06 9.87 4.54 8.79 6.32C8.36 7.03 8.04 7.82 7.84 8.65L9.67 9.38C9.9 8.68 10.23 8.02 10.66 7.42C11.53 6.22 12.63 5.25 13.9 4.58L13.13 2.21M17.7 2C15.82 2.76 14.15 4.14 13 6L14.7 7C15.5 5.7 16.7 4.8 18 4.3L17.7 2M12 7C9.24 7 7 9.24 7 12C7 13.38 7.56 14.63 8.46 15.54L4 20H8.46L11.08 17.38C11.38 17.46 11.69 17.5 12 17.5C14.76 17.5 17 15.26 17 12.5C17 9.74 14.76 7 12 7M12 9A3 3 0 0 1 15 12A3 3 0 0 1 12 15A3 3 0 0 1 9 12A3 3 0 0 1 12 9M2.81 14.81L5.63 17.63L3.5 19.76L0.69 16.94L2.81 14.81M14.81 2.81L17.63 5.63L19.76 3.5L16.94 0.69L14.81 2.81Z"/>
        </svg>
        <span class="btn-label">NUEVA PARTIDA</span>
      </button>

      <!-- 👤+ CREAR NUEVO PERFIL (Ivory 3D Capsule - Extra Large) -->
      <button
        type="button"
        class="btn-motriz-secondary btn-home-secondary"
        @click="handleProfile"
      >
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14" stroke-linecap="round"/>
          <line x1="23" y1="11" x2="17" y2="11" stroke-linecap="round"/>
        </svg>
        <span class="btn-label">CREAR NUEVO PERFIL</span>
      </button>

      <!-- 🧪 ZONA DE PRUEBAS / PROTOTIPOS -->
      <button
        type="button"
        class="btn-motriz-secondary btn-home-lab"
        title="Juegos de prueba originales y prototipos"
        @click="handleLab"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M10 2v7.31L4.1 18.2A2 2 0 0 0 5.8 21h12.4a2 2 0 0 0 1.7-2.8L14 9.31V2"/>
          <path d="M8.5 2h7"/>
          <path d="M14 9.3l-3.5 5.2"/>
        </svg>
        <span>Zona de Pruebas</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.home-screen-overlay {
  position: relative;
  width: 100%;
  height: calc(100vh - 96px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 24px 36px 54px;
  box-sizing: border-box;
  z-index: 10;
  pointer-events: none;
}

.home-screen-overlay > * {
  pointer-events: auto;
}

.top-guidance-pill {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 253, 249, 0.95);
  backdrop-filter: blur(14px);
  padding: 14px 32px;
  border-radius: 9999px;
  border: 2px solid var(--motriz-card-border);
  box-shadow: 0 8px 22px rgba(70, 30, 20, 0.14);
  transition: all 0.3s ease;
}

.pulse-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #F59E0B;
  transition: all 0.3s ease;
}

.pulse-dot.dot-active {
  background: #16A34A;
  box-shadow: 0 0 14px #16A34A;
}

.guidance-text {
  font-size: 1.12rem;
  font-weight: 800;
  color: var(--motriz-text-main);
}

.center-welcome-tag {
  background: rgba(255, 253, 249, 0.9);
  backdrop-filter: blur(12px);
  padding: 14px 34px;
  border-radius: 32px;
  border: 2px solid rgba(232, 221, 208, 0.8);
  box-shadow: 0 8px 24px rgba(60, 25, 20, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.tag-label {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--motriz-red-primary);
  letter-spacing: 0.14em;
}

.tag-name {
  margin: 3px 0 6px;
  font-size: 1.75rem;
  font-weight: 900;
  color: var(--motriz-text-main);
}

.tag-meta {
  font-size: 0.92rem;
  color: var(--motriz-text-muted);
  font-weight: 600;
}

/* Bottom Action Dock (Extra Large & Accessible) */
.home-action-dock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  width: 100%;
  max-width: 1200px;
}

.btn-home-primary {
  min-width: 370px;
  padding: 24px 48px;
  font-size: 1.65rem;
  border-width: 3px;
}

.btn-home-secondary {
  min-width: 370px;
  padding: 24px 44px;
  font-size: 1.5rem;
  border-width: 3px;
}

.btn-home-lab {
  padding: 22px 32px;
  font-size: 1.22rem;
  border-width: 2.5px;
}

.action-icon {
  width: 34px;
  height: 34px;
}

@media (max-width: 960px) {
  .home-action-dock {
    flex-direction: column;
    gap: 16px;
  }
  .btn-home-primary,
  .btn-home-secondary,
  .btn-home-lab {
    width: 100%;
    min-width: unset;
  }
}
</style>
