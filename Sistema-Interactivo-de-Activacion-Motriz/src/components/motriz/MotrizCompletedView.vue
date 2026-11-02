<script setup>
import { onMounted } from 'vue'
import { playClickTone, playSelectTone, playFanfareTune } from '../../composables/useAudio'

const props = defineProps({
  results: {
    type: Object,
    default: () => ({
      score: 320,
      hits: 18,
      timeSpent: '1:25',
      stars: 3,
    }),
  },
})

const emit = defineEmits(['menu', 'next-level', 'view-progress', 'finish'])

onMounted(() => {
  playFanfareTune()
})

function handleMenu() {
  playClickTone()
  emit('menu')
}

function handleNext() {
  playSelectTone()
  emit('next-level')
}

function handleProgress() {
  playClickTone()
  emit('view-progress')
}

function handleFinish() {
  playClickTone()
  emit('finish')
}
</script>

<template>
  <div class="completed-container motriz-ambient-bg">
    <div class="completed-card-shell">
      <!-- Golden Trophy Header -->
      <div class="trophy-wrapper">
        <div class="trophy-badge">
          <svg viewBox="0 0 100 100" class="trophy-svg">
            <!-- Trophy cup -->
            <path d="M25 25 L75 25 L70 55 C68 68 56 75 50 75 C44 75 32 68 30 55 Z" fill="#FBBF24" stroke="#D97706" stroke-width="3" />
            <!-- Handles -->
            <path d="M26 30 C15 30 15 50 28 52" fill="none" stroke="#D97706" stroke-width="5" stroke-linecap="round" />
            <path d="M74 30 C85 30 85 50 72 52" fill="none" stroke="#D97706" stroke-width="5" stroke-linecap="round" />
            <!-- Stem and Base -->
            <rect x="45" y="75" width="10" height="12" fill="#D97706" />
            <rect x="30" y="87" width="40" height="8" rx="3" fill="#B45309" />
            <circle cx="50" cy="45" r="10" fill="#FEF08A" opacity="0.8" />
          </svg>
        </div>
        <h1 class="completed-title">¡Nivel completado!</h1>
      </div>

      <!-- 3 Shiny Golden Stars -->
      <div class="stars-row">
        <div
          v-for="i in 3"
          :key="i"
          class="star-item"
          :class="{ 'star-earned': i <= (results.stars || 3) }"
          :style="{ animationDelay: `${i * 0.2}s` }"
        >
          <svg viewBox="0 0 100 100" class="star-svg">
            <polygon
              points="50,5 64,36 98,38 72,61 80,95 50,76 20,95 28,61 2,38 36,36"
              fill="url(#starGrad)"
              stroke="#D97706"
              stroke-width="3"
            />
            <defs>
              <linearGradient id="starGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FEF08A" />
                <stop offset="50%" stop-color="#FBBF24" />
                <stop offset="100%" stop-color="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <!-- Results Badges Row (Screen 7) -->
      <div class="metrics-grid">
        <!-- Tiempo -->
        <div class="metric-card">
          <div class="metric-icon-bubble">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C1D2C" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Tiempo</span>
            <strong class="metric-value">{{ results.timeSpent || '0:45' }}</strong>
          </div>
        </div>

        <!-- Puntos -->
        <div class="metric-card">
          <div class="metric-icon-bubble">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Puntos</span>
            <strong class="metric-value">{{ results.score || 320 }}</strong>
          </div>
        </div>

        <!-- Movimientos correctos -->
        <div class="metric-card">
          <div class="metric-icon-bubble">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Movimientos correctos</span>
            <strong class="metric-value">{{ results.hits || 18 }} / 20</strong>
          </div>
        </div>
      </div>

      <!-- Encouraging message banner (Screen 9) -->
      <div class="cheer-banner">
        <span class="cheer-heart">❤️</span>
        <div class="cheer-text">
          <strong>Tu esfuerzo cuenta.</strong>
          <span>Sigue así, la constancia fortalece tu movilidad y bienestar.</span>
        </div>
      </div>

      <!-- Action Buttons Row (Screen 7 & 9) -->
      <div class="completed-actions">
        <button
          type="button"
          class="btn-motriz-secondary btn-comp-action"
          @click="handleMenu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <span>Menú</span>
        </button>

        <button
          type="button"
          class="btn-motriz-secondary btn-comp-action"
          @click="handleProgress"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Ver mi progreso</span>
        </button>

        <button
          type="button"
          class="btn-motriz-primary btn-comp-action"
          @click="handleNext"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>Siguiente nivel</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.completed-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 88px);
  padding: 30px 20px;
  box-sizing: border-box;
}

.completed-card-shell {
  width: 100%;
  max-width: 820px;
  background: #FFFDF9;
  border: 3px solid var(--motriz-card-border);
  border-radius: 36px;
  padding: 44px 48px;
  box-shadow: var(--motriz-shadow-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.trophy-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.trophy-badge {
  width: 58px;
  height: 58px;
}

.trophy-svg {
  width: 100%;
  height: 100%;
}

.completed-title {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 2.8rem);
  font-weight: 900;
  color: var(--motriz-red-primary);
}

/* Stars */
.stars-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 34px;
}

.star-item {
  width: 74px;
  height: 74px;
  animation: motrizPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
  filter: drop-shadow(0 4px 10px rgba(245, 158, 11, 0.4));
}

.star-svg {
  width: 100%;
  height: 100%;
}

/* Metrics Row */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  width: 100%;
  margin-bottom: 30px;
}

.metric-card {
  background: #FDF9F3;
  border: 2px solid #E8DDD0;
  border-radius: 24px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(80, 40, 30, 0.05);
}

.metric-icon-bubble {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 1.5px solid #E5D5C4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--motriz-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 1.45rem;
  font-weight: 900;
  color: var(--motriz-text-main);
}

/* Cheer banner */
.cheer-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #FFF1F2;
  border: 2px solid #FECDD3;
  border-radius: 22px;
  padding: 14px 24px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 34px;
}

.cheer-heart {
  font-size: 1.8rem;
}

.cheer-text {
  display: flex;
  flex-direction: column;
}

.cheer-text strong {
  color: var(--motriz-red-primary);
  font-size: 1.05rem;
}

.cheer-text span {
  color: var(--motriz-text-muted);
  font-size: 0.92rem;
}

/* Actions */
.completed-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.btn-comp-action {
  flex: 1;
  padding: 16px 24px;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .completed-actions {
    flex-direction: column;
  }
  .completed-card-shell {
    padding: 28px 20px;
  }
}
</style>
