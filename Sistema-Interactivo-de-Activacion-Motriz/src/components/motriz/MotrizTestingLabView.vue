<script setup>
import { ref } from 'vue'
import { playClickTone, playSelectTone } from '../../composables/useAudio'
import BalloonGame from '../BalloonGame.vue'
import MotrizGameView from './MotrizGameView.vue'

const emit = defineEmits(['back'])

const activeTab = ref('hub') // 'hub' | 'unach-cif' | 'alcanza-colores'

function handleSelect(tab) {
  playSelectTone()
  activeTab.value = tab
}

function handleBack() {
  playClickTone()
  if (activeTab.value !== 'hub') {
    activeTab.value = 'hub'
  } else {
    emit('back')
  }
}
</script>

<template>
  <div class="lab-container">
    <!-- Sub-Game: UNACH CIF Test Game -->
    <div v-if="activeTab === 'unach-cif'" class="subgame-wrapper cif-theme">
      <div class="subgame-nav">
        <button type="button" class="btn-motriz-secondary btn-nav-back" @click="activeTab = 'hub'">
          ← Volver a Zona de Pruebas
        </button>
        <span class="subgame-title">Juego de Prueba UNACH · Desafío CIF</span>
      </div>
      <BalloonGame />
    </div>

    <!-- Sub-Game: Prototype Balloons -->
    <div v-else-if="activeTab === 'alcanza-colores'" class="subgame-wrapper">
      <div class="subgame-nav">
        <button type="button" class="btn-motriz-secondary btn-nav-back" @click="activeTab = 'hub'">
          ← Volver a Zona de Pruebas
        </button>
        <span class="subgame-title">Prototipo Alcanza los Colores</span>
      </div>
      <MotrizGameView @finish="activeTab = 'hub'" @exit="activeTab = 'hub'" />
    </div>

    <!-- Lab Hub Main View -->
    <div v-else class="lab-hub-content">
      <div class="lab-header">
        <h1 class="lab-title">Zona de Pruebas y Prototipos</h1>
        <p class="lab-subtitle">
          Aquí se conservan intactos los juegos de prueba mientras diseñas el sistema de minijuegos rápidos inspirado en Pureya (cambio cada 5 segundos) y Motriz.
        </p>
      </div>

      <div class="lab-cards-grid">
        <!-- 1. Pureya Concept Card -->
        <div class="lab-card pureya-concept-card">
          <div class="card-pill-tag">En Diseño</div>
          <div class="card-icon">⚡</div>
          <h3>Modo Pureya + Motriz</h3>
          <p>
            Minijuegos ultrarrápidos que cambian cada 5 segundos: recolectar esferas, esquivar, sostener postura y ritmo sin pausas largas.
          </p>
          <div class="concept-features">
            <span>⏱ Cambio cada 5s</span>
            <span>🖐 Control con mano</span>
            <span>🪙 Recompensas arcade</span>
          </div>
        </div>

        <!-- 2. Original UNACH CIF Game -->
        <div class="lab-card" @click="handleSelect('unach-cif')">
          <div class="card-pill-tag tag-ready">Listo para Probar</div>
          <div class="card-icon">🎮</div>
          <h3>Desafío UNACH CIF Original</h3>
          <p>
            El juego de prueba original de detección corporal: revienta tecnologías (código, IA, cloud) y esquiva bugs.
          </p>
          <button type="button" class="btn-motriz-primary btn-launch">
            Abrir Desafío UNACH
          </button>
        </div>

        <!-- 3. Prototype Color Sphere Catcher -->
        <div class="lab-card" @click="handleSelect('alcanza-colores')">
          <div class="card-pill-tag tag-ready">Listo para Probar</div>
          <div class="card-icon">🎈</div>
          <h3>Prototipo Alcanza Colores</h3>
          <p>
            Esferas en tonos cálidos adaptadas a la visión del adulto mayor con feedback motivacional y multiplicador de combo.
          </p>
          <button type="button" class="btn-motriz-primary btn-launch">
            Abrir Prototipo
          </button>
        </div>
      </div>

      <div class="lab-footer">
        <button type="button" class="btn-motriz-secondary btn-volver" @click="handleBack">
          ← Volver al Menú Principal
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lab-container {
  min-height: calc(100vh - 88px);
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.lab-hub-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 24px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
}

.lab-header {
  text-align: center;
  margin-bottom: 32px;
}

.lab-title {
  margin: 0;
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  font-weight: 900;
  color: var(--motriz-red-primary);
}

.lab-subtitle {
  margin: 10px auto 0;
  max-width: 680px;
  font-size: 1.1rem;
  color: var(--motriz-text-muted);
  line-height: 1.5;
}

.lab-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
  margin-bottom: 36px;
}

.lab-card {
  background: rgba(255, 253, 249, 0.95);
  backdrop-filter: blur(12px);
  border: 3px solid var(--motriz-card-border);
  border-radius: 28px;
  padding: 28px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 26px rgba(70, 30, 20, 0.08);
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;
}

.lab-card:hover {
  transform: translateY(-6px);
  border-color: var(--motriz-red-primary);
  box-shadow: 0 14px 32px rgba(140, 29, 44, 0.16);
}

.card-pill-tag {
  position: absolute;
  top: 14px;
  right: 14px;
  background: #E2D2C1;
  color: var(--motriz-text-main);
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 9999px;
}

.tag-ready {
  background: #16A34A;
  color: #FFFFFF;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.lab-card h3 {
  margin: 0 0 10px;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--motriz-red-primary);
}

.lab-card p {
  margin: 0 0 20px;
  font-size: 0.9rem;
  color: var(--motriz-text-muted);
  line-height: 1.45;
  flex-grow: 1;
}

.btn-launch {
  width: 100%;
  padding: 12px 18px;
  font-size: 1.05rem;
}

.pureya-concept-card {
  border: 3px dashed #E5A323;
  background: rgba(255, 251, 240, 0.95);
  cursor: default;
}

.pureya-concept-card:hover {
  transform: none;
  border-color: #E5A323;
}

.concept-features {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  font-size: 0.8rem;
  font-weight: 700;
  color: #B45309;
}

.lab-footer {
  display: flex;
  justify-content: center;
}

.btn-volver {
  padding: 14px 34px;
  font-size: 1.15rem;
}

/* Subgame */
.subgame-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.subgame-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(255, 253, 249, 0.95);
  border-bottom: 2px solid var(--motriz-card-border);
}

.btn-nav-back {
  padding: 8px 18px;
  font-size: 1rem;
}

.subgame-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--motriz-red-primary);
}

@media (max-width: 900px) {
  .lab-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
