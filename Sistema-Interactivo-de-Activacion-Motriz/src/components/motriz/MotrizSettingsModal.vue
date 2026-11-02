<script setup>
import { ref } from 'vue'
import { playClickTone } from '../../composables/useAudio'

const emit = defineEmits(['close', 'open-original-cif'])

const soundEnabled = ref(true)
const mirrorMode = ref(true)
const showSkeleton = ref(true)
const highContrast = ref(false)

function handleClose() {
  playClickTone()
  emit('close')
}

function handleOpenOriginalCIF() {
  playClickTone()
  emit('open-original-cif')
}
</script>

<template>
  <div class="motriz-modal-overlay" @click.self="handleClose">
    <div class="motriz-card settings-card">
      <div class="modal-top">
        <h2 class="settings-title">Configuración del Sistema</h2>
        <button type="button" class="close-x-btn" @click="handleClose">✕</button>
      </div>

      <div class="settings-list">
        <!-- Sound effects -->
        <div class="setting-item">
          <div>
            <strong class="item-title">Efectos de sonido</strong>
            <p class="item-desc">Sonidos de confirmación e interacciones estilo Motriz.</p>
          </div>
          <input
            v-model="soundEnabled"
            type="checkbox"
            class="motriz-switch"
          />
        </div>

        <!-- Mirror Mode -->
        <div class="setting-item">
          <div>
            <strong class="item-title">Modo espejo en cámara</strong>
            <p class="item-desc">Invierte la imagen horizontalmente para mayor naturalidad.</p>
          </div>
          <input
            v-model="mirrorMode"
            type="checkbox"
            class="motriz-switch"
          />
        </div>

        <!-- Skeleton overlay -->
        <div class="setting-item">
          <div>
            <strong class="item-title">Visualizar puntos corporales</strong>
            <p class="item-desc">Muestra los puntos de seguimiento en manos y cuerpo.</p>
          </div>
          <input
            v-model="showSkeleton"
            type="checkbox"
            class="motriz-switch"
          />
        </div>

        <!-- RNF6 Retención Cero -->
        <div class="setting-item privacy-item">
          <div>
            <strong class="item-title">Privacidad y Retención Cero (RNF6)</strong>
            <p class="item-desc">
              El procesamiento de video se realiza 100% en la memoria RAM local.
              No se almacena ni transmite ninguna imagen ni video a servidores externos.
            </p>
          </div>
          <span class="active-badge">✓ Activo</span>
        </div>

        <!-- Switch to original test game -->
        <div class="setting-item test-game-item">
          <div>
            <strong class="item-title">Juego de prueba CIF original</strong>
            <p class="item-desc">Acceder a la pantalla de prueba técnica original con tecnologías y bugs.</p>
          </div>
          <button
            type="button"
            class="btn-motriz-secondary btn-test-switch"
            @click="handleOpenOriginalCIF"
          >
            Abrir prueba
          </button>
        </div>
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="btn-motriz-primary btn-save-settings"
          @click="handleClose"
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-card {
  width: 100%;
  max-width: 580px;
  padding: 34px 38px;
  background: #FFFDF9;
}

.modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.settings-title {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 900;
  color: var(--motriz-red-primary);
}

.close-x-btn {
  background: #EFE7DE;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--motriz-text-muted);
  cursor: pointer;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #FDFBF7;
  border: 1.5px solid #EADBCC;
  border-radius: 20px;
  padding: 16px 20px;
}

.item-title {
  display: block;
  font-size: 1.05rem;
  color: var(--motriz-text-main);
  margin-bottom: 4px;
}

.item-desc {
  margin: 0;
  font-size: 0.84rem;
  color: var(--motriz-text-muted);
  line-height: 1.35;
}

.motriz-switch {
  width: 26px;
  height: 26px;
  accent-color: var(--motriz-red-primary);
  cursor: pointer;
}

.privacy-item {
  background: #F0FDF4;
  border-color: #BBF7D0;
}

.active-badge {
  background: #16A34A;
  color: #FFFFFF;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 9999px;
  white-space: nowrap;
}

.test-game-item {
  background: #FFF7ED;
  border-color: #FED7AA;
}

.btn-test-switch {
  padding: 8px 18px;
  font-size: 0.95rem;
  white-space: nowrap;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.btn-save-settings {
  padding: 12px 38px;
  font-size: 1.2rem;
}
</style>
