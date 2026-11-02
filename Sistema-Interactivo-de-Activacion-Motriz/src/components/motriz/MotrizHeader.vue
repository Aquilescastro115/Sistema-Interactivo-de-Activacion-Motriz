<script setup>
import { useProfiles } from '../../composables/useProfiles'
import { playClickTone } from '../../composables/useAudio'

const props = defineProps({
  showBack: {
    type: Boolean,
    default: false,
  },
  backLabel: {
    type: String,
    default: 'Volver',
  },
})

const emit = defineEmits(['back', 'open-settings', 'open-help', 'open-profiles'])

const { activeProfile } = useProfiles()

function handleBack() {
  playClickTone()
  emit('back')
}

function handleSettings() {
  playClickTone()
  emit('open-settings')
}

function handleHelp() {
  playClickTone()
  emit('open-help')
}

function handleProfiles() {
  playClickTone()
  emit('open-profiles')
}
</script>

<template>
  <header class="motriz-header">
    <div class="logo-area" @click="handleProfiles">
      <!-- Asistencia Motriz Motriz Emblem Icon -->
      <div class="logo-emblem">
        <svg viewBox="0 0 100 100" class="emblem-svg">
          <circle cx="50" cy="50" r="46" fill="#8C1D2C" />
          <!-- Stylized human body with outstretched arms -->
          <circle cx="50" cy="27" r="10" fill="#FFFDF9" />
          <path
            d="M 23 45 Q 50 35 77 45 Q 70 55 58 50 L 58 64 L 66 85 L 54 85 L 50 72 L 46 85 L 34 85 L 42 64 L 42 50 Q 30 55 23 45 Z"
            fill="#FFFDF9"
          />
        </svg>
      </div>

      <div class="brand-text">
        <span class="brand-title">ASISTENCIA</span>
        <span class="brand-subtitle">MOTRIZ</span>
      </div>

      <div v-if="activeProfile" class="profile-pill-badge" title="Cambiar o editar perfil">
        <span class="profile-avatar">{{ activeProfile.avatar }}</span>
        <div class="profile-meta">
          <span class="profile-name">{{ activeProfile.name }}</span>
          <span class="profile-height">{{ activeProfile.heightCm }} cm</span>
        </div>
      </div>
    </div>

    <div class="header-actions">
      <button
        v-if="showBack"
        type="button"
        class="btn-motriz-secondary header-back-btn"
        @click="handleBack"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ backLabel }}</span>
      </button>

      <button
        type="button"
        class="btn-round-action"
        title="Configuración del sistema"
        aria-label="Configuración"
        @click="handleSettings"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="currentColor" fill-opacity="0.2"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button
        type="button"
        class="btn-round-action"
        title="Ayuda y recomendaciones"
        aria-label="Ayuda"
        @click="handleHelp"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke-linecap="round"/>
          <line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.motriz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 36px;
  background: rgba(255, 253, 249, 0.88);
  backdrop-filter: blur(14px);
  border-bottom: 2px solid var(--motriz-card-border);
  position: relative;
  z-index: 30;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}

.logo-emblem {
  width: 52px;
  height: 52px;
  filter: drop-shadow(0 3px 6px rgba(140, 29, 44, 0.25));
  transition: transform 0.2s ease;
}

.logo-area:hover .logo-emblem {
  transform: scale(1.06);
}

.emblem-svg {
  width: 100%;
  height: 100%;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.brand-title {
  color: var(--motriz-red-primary);
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: 0.05em;
}

.brand-subtitle {
  color: var(--motriz-red-hover);
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.profile-pill-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 20px;
  padding: 6px 16px;
  background: #FFF9F2;
  border: 1.5px solid #E5D5C4;
  border-radius: 9999px;
  box-shadow: 0 2px 6px rgba(90, 60, 40, 0.06);
  transition: all 0.2s;
}

.profile-pill-badge:hover {
  background: #FFFFFF;
  border-color: var(--motriz-red-primary);
  transform: translateY(-1px);
}

.profile-avatar {
  font-size: 1.4rem;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.profile-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--motriz-text-main);
}

.profile-height {
  font-size: 0.76rem;
  color: var(--motriz-text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-back-btn {
  padding: 10px 22px;
  font-size: 1.05rem;
}

@media (max-width: 768px) {
  .motriz-header {
    padding: 12px 18px;
  }
  .profile-pill-badge {
    display: none;
  }
}
</style>
