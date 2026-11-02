<script setup>
import { playClickTone } from '../../composables/useAudio'

const emit = defineEmits(['close'])

function handleClose() {
  playClickTone()
  emit('close')
}
</script>

<template>
  <div class="motriz-modal-overlay" @click.self="handleClose">
    <div class="motriz-card help-card">
      <div class="modal-top">
        <h2 class="help-title">Guía de Ayuda</h2>
        <button type="button" class="close-x-btn" @click="handleClose">✕</button>
      </div>

      <div class="help-sections">
        <div class="help-box">
          <div class="help-icon">🧍</div>
          <div>
            <strong>¿Cómo jugar con la cámara?</strong>
            <p>
              Párate frente a la cámara de forma que se vea tu torso y brazos. Mueve tus manos hacia las esferas de colores que van apareciendo en pantalla para tocarlas.
            </p>
          </div>
        </div>

        <div class="help-box">
          <div class="help-icon">📏</div>
          <div>
            <strong>Estatura y Calibración (RF7)</strong>
            <p>
              El terapeuta o encargado registra tu estatura para que los objetos aparezcan exactamente a tu alcance cómodo, sin necesidad de agacharte ni esforzar la postura.
            </p>
          </div>
        </div>

        <div class="help-box">
          <div class="help-icon">🔒</div>
          <div>
            <strong>Seguridad y Privacidad (RNF6)</strong>
            <p>
              Las imágenes de la cámara no se graban ni se envían a ningún servidor. La detección de movimiento ocurre completamente en la memoria de este computador.
            </p>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="btn-motriz-primary btn-got-it"
          @click="handleClose"
        >
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-card {
  width: 100%;
  max-width: 600px;
  padding: 34px 38px;
  background: #FFFDF9;
}

.modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.help-title {
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

.help-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.help-box {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: #FDFBF7;
  border: 1.5px solid #EADBCC;
  border-radius: 20px;
  padding: 16px 20px;
}

.help-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.help-box strong {
  display: block;
  font-size: 1.05rem;
  color: var(--motriz-text-main);
  margin-bottom: 4px;
}

.help-box p {
  margin: 0;
  font-size: 0.88rem;
  color: var(--motriz-text-muted);
  line-height: 1.45;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.btn-got-it {
  padding: 12px 38px;
  font-size: 1.2rem;
}
</style>
