<script setup>
import { ref } from 'vue'
import { useProfiles } from '../../composables/useProfiles'
import { playClickTone } from '../../composables/useAudio'

const emit = defineEmits(['close'])

const { activeProfile } = useProfiles()

const currentTab = ref('semanal')

const weeklyData = [
  { day: 'Lun', minutes: 12 },
  { day: 'Mié', minutes: 18 },
  { day: 'Jue', minutes: 22 },
  { day: 'Vie', minutes: 28 },
  { day: 'Sáb', minutes: 16 },
  { day: 'Dom', minutes: 24 },
]

function handleClose() {
  playClickTone()
  emit('close')
}
</script>

<template>
  <div class="motriz-modal-overlay" @click.self="handleClose">
    <div class="motriz-card progress-modal-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title-wrap">
          <div class="mini-logo">
            <svg viewBox="0 0 100 100" class="mini-logo-svg">
              <circle cx="50" cy="50" r="46" fill="#8C1D2C" />
              <circle cx="50" cy="27" r="10" fill="#FFFDF9" />
              <path d="M 23 45 Q 50 35 77 45 Q 70 55 58 50 L 58 64 L 66 85 L 54 85 L 50 72 L 46 85 L 34 85 L 42 64 L 42 50 Q 30 55 23 45 Z" fill="#FFFDF9"/>
            </svg>
          </div>
          <div>
            <h2 class="modal-title">Tu progreso</h2>
            <span class="modal-patient">{{ activeProfile?.name || 'Rosa Gutiérrez' }}</span>
          </div>
        </div>

        <!-- Segmented Tab Controls (Screen 8) -->
        <div class="tabs-capsule">
          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn-active': currentTab === 'semanal' }"
            @click="currentTab = 'semanal'"
          >
            Semanal
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn-active': currentTab === 'mensual' }"
            @click="currentTab = 'mensual'"
          >
            Mensual
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn-active': currentTab === 'total' }"
            @click="currentTab = 'total'"
          >
            Total
          </button>
        </div>
      </div>

      <!-- Main Chart Stage (RF9) -->
      <div class="chart-section">
        <div class="chart-viewport">
          <!-- Y-Axis labels -->
          <div class="y-axis">
            <span>30m</span>
            <span>20m</span>
            <span>10m</span>
            <span>0m</span>
          </div>

          <!-- Bars container -->
          <div class="bars-container">
            <div
              v-for="item in weeklyData"
              :key="item.day"
              class="bar-column"
            >
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ height: `${(item.minutes / 30) * 100}%` }"
                  :title="`${item.minutes} minutos de actividad`"
                >
                  <span class="bar-val-tooltip">{{ item.minutes }}m</span>
                </div>
              </div>
              <span class="x-label">{{ item.day }}</span>
            </div>
          </div>
        </div>

        <!-- Highlight Badge (Screen 8) -->
        <div class="chart-highlight-card">
          <span class="hl-tag">Esta semana</span>
          <div class="hl-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8C1D2C" stroke-width="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <strong class="hl-title">¡Excelente avance!</strong>
          <span class="hl-subtitle">Mayor movilidad en hombros y codos.</span>
        </div>
      </div>

      <!-- Stats Summary Strip (RF3) -->
      <div class="stats-strip">
        <div class="stat-box">
          <div class="stat-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C1D2C" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <span class="stat-label">Tiempo total</span>
            <strong class="stat-val">{{ activeProfile?.stats?.totalMinutes || 42 }} min</strong>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C1D2C" stroke-width="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div>
            <span class="stat-label">Juegos realizados</span>
            <strong class="stat-val">{{ activeProfile?.stats?.sessionsCompleted || 5 }}</strong>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <span class="stat-label">Puntos totales</span>
            <strong class="stat-val">{{ activeProfile?.stats?.totalPoints || 1250 }}</strong>
          </div>
        </div>
      </div>

      <!-- Bottom Button (Screen 8: "← Volver") -->
      <div class="modal-footer">
        <button
          type="button"
          class="btn-motriz-secondary btn-modal-back"
          @click="handleClose"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Volver</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-modal-card {
  width: 100%;
  max-width: 760px;
  padding: 34px 38px;
  background: #FFFDF9;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mini-logo {
  width: 44px;
  height: 44px;
}

.mini-logo-svg {
  width: 100%;
  height: 100%;
}

.modal-title {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 900;
  color: var(--motriz-red-primary);
}

.modal-patient {
  font-size: 0.95rem;
  color: var(--motriz-text-muted);
  font-weight: 600;
}

/* Tabs */
.tabs-capsule {
  display: flex;
  background: #EFE7DE;
  padding: 4px;
  border-radius: 9999px;
  border: 1px solid #DFD5C7;
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 8px 18px;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--motriz-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn-active {
  background: var(--motriz-red-primary);
  color: #FFFFFF;
  box-shadow: 0 2px 6px rgba(140, 29, 44, 0.3);
}

/* Chart */
.chart-section {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 20px;
  background: #FAF5EE;
  border: 2px solid #EADBCC;
  border-radius: 26px;
  padding: 24px 20px;
  margin-bottom: 24px;
}

.chart-viewport {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  height: 200px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160px;
  font-size: 0.78rem;
  color: var(--motriz-text-muted);
  font-weight: 700;
  padding-bottom: 24px;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  flex-grow: 1;
  height: 100%;
}

.bar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.bar-track {
  flex-grow: 1;
  width: 32px;
  display: flex;
  align-items: flex-end;
  background: rgba(220, 205, 190, 0.25);
  border-radius: 12px 12px 0 0;
  padding: 3px;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #C22A3E 0%, #8C1D2C 100%);
  border-radius: 9px 9px 0 0;
  box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.4);
  position: relative;
  transition: height 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.bar-val-tooltip {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--motriz-red-primary);
}

.x-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--motriz-text-main);
}

/* Highlight */
.chart-highlight-card {
  background: #FFFDF9;
  border: 2px solid #E8DDD0;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
}

.hl-tag {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--motriz-text-muted);
}

.hl-icon-wrap {
  margin: 8px 0;
}

.hl-title {
  color: var(--motriz-red-primary);
  font-size: 1.05rem;
  font-weight: 900;
}

.hl-subtitle {
  font-size: 0.8rem;
  color: var(--motriz-text-muted);
  margin-top: 4px;
}

/* Stats */
.stats-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.stat-box {
  background: #FDF9F3;
  border: 1.5px solid #EADDCF;
  border-radius: 20px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-label {
  display: block;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--motriz-text-muted);
  text-transform: uppercase;
}

.stat-val {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--motriz-text-main);
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.btn-modal-back {
  padding: 12px 32px;
  font-size: 1.15rem;
}
</style>
