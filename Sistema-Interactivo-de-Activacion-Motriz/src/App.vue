<script setup>
import { ref } from 'vue'
import MotrizBackgroundCamera from './components/motriz/MotrizBackgroundCamera.vue'
import MotrizHandCursor from './components/motriz/MotrizHandCursor.vue'
import MotrizHeader from './components/motriz/MotrizHeader.vue'
import MotrizHomeView from './components/motriz/MotrizHomeView.vue'
import MotrizCalibrationView from './components/motriz/MotrizCalibrationView.vue'
import MotrizTestingLabView from './components/motriz/MotrizTestingLabView.vue'
import MotrizProfileModal from './components/motriz/MotrizProfileModal.vue'
import MotrizProgressModal from './components/motriz/MotrizProgressModal.vue'
import MotrizSettingsModal from './components/motriz/MotrizSettingsModal.vue'
import MotrizHelpModal from './components/motriz/MotrizHelpModal.vue'

// Current active view
const currentView = ref('home') // 'home' | 'calibration' | 'lab'

// Modals
const showProfileModal = ref(false)
const showProgressModal = ref(false)
const showSettingsModal = ref(false)
const showHelpModal = ref(false)

function handleStartNewGame() {
  currentView.value = 'calibration'
}

function handleOpenLab() {
  currentView.value = 'lab'
}

function handleOpenOriginalCIF() {
  showSettingsModal.value = false
  currentView.value = 'lab'
}
</script>

<template>
  <div class="app-root">
    <!-- 1. FULLSCREEN CAMERA BACKGROUND (Always runs fullscreen across entire screen) -->
    <MotrizBackgroundCamera />

    <!-- 2. VIRTUAL HAND CURSOR (Tracks hand movement & performs dwell click; mouse also works natively) -->
    <MotrizHandCursor />

    <!-- 3. TOP ASISTENCIA MOTRIZ HEADER -->
    <MotrizHeader
      :show-back="currentView !== 'home'"
      :back-label="currentView === 'calibration' ? 'Salir' : 'Menú Principal'"
      @back="currentView = 'home'"
      @open-settings="showSettingsModal = true"
      @open-help="showHelpModal = true"
      @open-profiles="showProfileModal = true"
    />

    <!-- 4. ACTIVE VIEW LAYER (Floating seamlessly over the fullscreen live camera) -->
    <main class="motriz-main-stage">
      <!-- Main Menu (Screen 1 with Fullscreen Camera) -->
      <MotrizHomeView
        v-if="currentView === 'home'"
        @start-game="handleStartNewGame"
        @create-profile="showProfileModal = true"
        @open-lab="handleOpenLab"
      />

      <!-- Preparation & Calibration Screen (Screen 3 with Fullscreen Silhouette) -->
      <MotrizCalibrationView
        v-else-if="currentView === 'calibration'"
        @start-play="handleOpenLab"
        @exit="currentView = 'home'"
      />

      <!-- Testing Lab: Preserves original UNACH CIF game + prototypes without deleting anything -->
      <MotrizTestingLabView
        v-else-if="currentView === 'lab'"
        @back="currentView = 'home'"
      />
    </main>

    <!-- 5. ASISTENCIA MOTRIZ MODALS -->
    <!-- Profile creation & selection (RF4, RF5, RF7) -->
    <MotrizProfileModal
      v-if="showProfileModal"
      @close="showProfileModal = false"
    />

    <!-- Progress & Activity Reports (RF3, RF9) -->
    <MotrizProgressModal
      v-if="showProgressModal"
      @close="showProgressModal = false"
    />

    <!-- Settings (Sound, camera, Zero-retention privacy RNF6) -->
    <MotrizSettingsModal
      v-if="showSettingsModal"
      @close="showSettingsModal = false"
      @open-original-cif="handleOpenOriginalCIF"
    />

    <!-- Help & Caregiver guidance -->
    <MotrizHelpModal
      v-if="showHelpModal"
      @close="showHelpModal = false"
    />
  </div>
</template>

<style scoped>
.app-root {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.motriz-main-stage {
  flex-grow: 1;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
</style>
