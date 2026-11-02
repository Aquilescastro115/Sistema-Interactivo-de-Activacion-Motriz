<script setup>
import { ref } from 'vue'
import { playClickTone, playSelectTone } from '../../composables/useAudio'

const emit = defineEmits(['select-game', 'back'])

const games = [
  {
    id: 'alcanza-colores',
    title: 'Alcanza los colores',
    subtitle: 'Mueve tus brazos',
    description: 'Toca las esferas de colores usando tus brazos y manos.',
    badge: 'Recomendado',
    active: true,
    accentColor: '#EF4444',
    iconType: 'balloons',
  },
  {
    id: 'equilibrio',
    title: 'Equilibrio',
    subtitle: 'Mantén tu postura',
    description: 'Párate derecho y mantén la posición para entrenar estabilidad.',
    badge: 'Postura',
    active: true,
    accentColor: '#F59E0B',
    iconType: 'balance',
  },
  {
    id: 'paso-a-paso',
    title: 'Paso a paso',
    subtitle: 'Camina en el lugar',
    description: 'Levanta las rodillas al ritmo para estimular la marcha.',
    badge: 'Piernas',
    active: true,
    accentColor: '#10B981',
    iconType: 'steps',
  },
  {
    id: 'atrapa-frutas',
    title: 'Atrapa frutas',
    subtitle: 'Sigue el ritmo',
    description: 'Recolecta manzanas y naranjas coordinando ambos lados.',
    badge: 'Coordinación',
    active: true,
    accentColor: '#8B5CF6',
    iconType: 'fruits',
  },
]

const selectedCard = ref('alcanza-colores')

function handleCardClick(game) {
  selectedCard.value = game.id
  playSelectTone()
  emit('select-game', game)
}

function handleBack() {
  playClickTone()
  emit('back')
}
</script>

<template>
  <div class="game-select-container">
    <div class="select-header">
      <h1 class="select-title">Selecciona un juego</h1>
      <p class="select-subtitle">Elige la actividad que más te guste hoy</p>
    </div>

    <!-- 4 Games Grid -->
    <div class="games-grid">
      <div
        v-for="game in games"
        :key="game.id"
        class="game-card"
        :class="{ 'card-active': selectedCard === game.id }"
        @click="handleCardClick(game)"
      >
        <!-- Card Illustration Stage -->
        <div class="card-stage" :style="{ '--accent': game.accentColor }">
          <!-- Floating Badge -->
          <span v-if="game.badge" class="game-badge">{{ game.badge }}</span>

          <!-- Custom SVG Illustrations matching the mockups -->
          <!-- 1. Balloons (Alcanza los colores) -->
          <div v-if="game.iconType === 'balloons'" class="stage-illustration">
            <svg viewBox="0 0 160 160" class="stage-svg">
              <circle cx="65" cy="80" r="32" fill="#38BDF8" opacity="0.9" />
              <circle cx="95" cy="70" r="34" fill="#EF4444" opacity="0.9" />
              <circle cx="80" cy="100" r="30" fill="#FBBF24" opacity="0.95" />
              <!-- Highlight gloss -->
              <ellipse cx="60" cy="70" rx="8" ry="12" fill="#FFFFFF" opacity="0.6" transform="rotate(-25 60 70)" />
              <ellipse cx="90" cy="60" rx="8" ry="12" fill="#FFFFFF" opacity="0.6" transform="rotate(-25 90 60)" />
              <ellipse cx="75" cy="90" rx="7" ry="10" fill="#FFFFFF" opacity="0.6" transform="rotate(-25 75 90)" />
            </svg>
          </div>

          <!-- 2. Balance (Equilibrio) -->
          <div v-else-if="game.iconType === 'balance'" class="stage-illustration">
            <svg viewBox="0 0 160 160" class="stage-svg">
              <!-- Soft wooden platform or ground -->
              <ellipse cx="80" cy="140" rx="60" ry="14" fill="#E2CDBA" />
              <!-- Stylized figure balancing on one leg -->
              <circle cx="80" cy="40" r="14" fill="#E26D5C" />
              <path d="M 30 75 Q 80 65 130 75" stroke="#E26D5C" stroke-width="10" stroke-linecap="round" fill="none" />
              <line x1="80" y1="52" x2="80" y2="105" stroke="#4A5568" stroke-width="12" stroke-linecap="round" />
              <!-- Standing leg -->
              <line x1="80" y1="105" x2="80" y2="135" stroke="#4A5568" stroke-width="9" stroke-linecap="round" />
              <!-- Raised leg -->
              <path d="M 80 105 L 105 115 L 85 125" stroke="#4A5568" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </svg>
          </div>

          <!-- 3. Steps (Paso a paso) -->
          <div v-else-if="game.iconType === 'steps'" class="stage-illustration">
            <svg viewBox="0 0 160 160" class="stage-svg">
              <!-- Stepping circles pathway -->
              <ellipse cx="45" cy="120" rx="22" ry="12" fill="#10B981" />
              <ellipse cx="80" cy="95" rx="20" ry="11" fill="#34D399" />
              <ellipse cx="115" cy="70" rx="22" ry="12" fill="#10B981" />
              <ellipse cx="75" cy="45" rx="18" ry="10" fill="#6EE7B7" />
              <!-- Footprints -->
              <circle cx="45" cy="120" r="4" fill="#FFFFFF" opacity="0.8" />
              <circle cx="80" cy="95" r="4" fill="#FFFFFF" opacity="0.8" />
              <circle cx="115" cy="70" r="4" fill="#FFFFFF" opacity="0.8" />
            </svg>
          </div>

          <!-- 4. Fruits (Atrapa frutas) -->
          <div v-else class="stage-illustration">
            <svg viewBox="0 0 160 160" class="stage-svg">
              <!-- Apple -->
              <circle cx="60" cy="75" r="26" fill="#EF4444" />
              <path d="M 60 50 Q 64 42 70 44" stroke="#854D0E" stroke-width="4" fill="none" stroke-linecap="round" />
              <!-- Orange -->
              <circle cx="105" cy="85" r="24" fill="#F97316" />
              <!-- Banana -->
              <path d="M 45 110 Q 80 145 125 105 Q 85 130 50 100 Z" fill="#FBBF24" />
            </svg>
          </div>
        </div>

        <!-- Card Body Info -->
        <div class="card-info">
          <h3 class="card-title">{{ game.title }}</h3>
          <p class="card-subtitle">{{ game.subtitle }}</p>
          <span class="card-desc">{{ game.description }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Bar -->
    <div class="select-bottom-actions">
      <button
        type="button"
        class="btn-motriz-secondary btn-volver"
        @click="handleBack"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Volver</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.game-select-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: calc(100vh - 88px);
  padding: 30px 40px 40px;
  box-sizing: border-box;
}

.select-header {
  text-align: center;
  margin-bottom: 30px;
}

.select-title {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 900;
  color: var(--motriz-red-primary);
  letter-spacing: -0.02em;
}

.select-subtitle {
  margin: 8px 0 0;
  font-size: 1.25rem;
  color: var(--motriz-text-muted);
  font-weight: 600;
}

/* 4-Card Grid */
.games-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 1220px;
  margin-bottom: 30px;
}

.game-card {
  background: #FFFDF9;
  border: 3px solid var(--motriz-card-border);
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 
    0 8px 20px rgba(90, 50, 40, 0.08),
    inset 0 1px 2px rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
}

.game-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: var(--motriz-red-primary);
  box-shadow: 
    0 16px 36px rgba(140, 29, 44, 0.18),
    0 0 0 3px rgba(140, 29, 44, 0.12);
}

.game-card.card-active {
  border-color: var(--motriz-red-primary);
  box-shadow: 
    0 14px 32px rgba(140, 29, 44, 0.22),
    0 0 0 4px var(--motriz-red-primary);
}

.card-stage {
  height: 200px;
  background: linear-gradient(180deg, #F9F4EC 0%, #EFE5D8 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid #E5D8C9;
}

.game-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: var(--motriz-red-primary);
  color: #FFFFFF;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 12px;
  border-radius: 9999px;
  box-shadow: 0 2px 6px rgba(140, 29, 44, 0.3);
}

.stage-illustration {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease;
}

.game-card:hover .stage-illustration {
  transform: scale(1.08);
}

.stage-svg {
  width: 100%;
  height: 100%;
}

.card-info {
  padding: 22px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--motriz-red-primary);
}

.card-subtitle {
  margin: 6px 0 10px;
  font-size: 1.02rem;
  font-weight: 700;
  color: #B45309;
}

.card-desc {
  font-size: 0.88rem;
  color: var(--motriz-text-muted);
  line-height: 1.4;
  margin-top: auto;
}

.select-bottom-actions {
  display: flex;
  justify-content: center;
  width: 100%;
}

.btn-volver {
  min-width: 220px;
  padding: 14px 34px;
  font-size: 1.2rem;
}

@media (max-width: 1024px) {
  .games-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
  .game-select-container {
    padding: 20px 16px;
  }
}
</style>
