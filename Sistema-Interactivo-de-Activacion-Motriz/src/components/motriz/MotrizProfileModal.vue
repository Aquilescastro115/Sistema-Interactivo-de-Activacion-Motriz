<script setup>
import { ref } from 'vue'
import { useProfiles } from '../../composables/useProfiles'
import { playClickTone, playSelectTone } from '../../composables/useAudio'

const emit = defineEmits(['close'])

const { profiles, activeProfile, selectProfile, addProfile } = useProfiles()

const isCreating = ref(false)
const newName = ref('')
const newAge = ref(72)
const newHeight = ref(160)
const newDifficulty = ref('facil')
const newAvatar = ref('👵')

const avatarOptions = ['👵', '👴', '👩', '👨', '🧑']

function handleSelect(id) {
  playSelectTone()
  selectProfile(id)
  emit('close')
}

function handleCreate() {
  if (!newName.value.trim()) return
  playSelectTone()
  addProfile({
    name: newName.value,
    age: newAge.value,
    heightCm: newHeight.value,
    difficulty: newDifficulty.value,
    avatar: newAvatar.value,
  })
  isCreating.value = false
  emit('close')
}

function handleClose() {
  playClickTone()
  emit('close')
}
</script>

<template>
  <div class="motriz-modal-overlay" @click.self="handleClose">
    <div class="motriz-card profile-modal-card">
      <div class="modal-top">
        <h2 class="profile-modal-title">
          {{ isCreating ? 'Crear Nuevo Perfil' : 'Perfiles de Jugador' }}
        </h2>
        <button type="button" class="close-x-btn" @click="handleClose">✕</button>
      </div>

      <!-- Create Form -->
      <div v-if="isCreating" class="create-profile-form">
        <div class="form-group">
          <label class="form-label">Nombre del Jugador / Paciente</label>
          <input
            v-model="newName"
            type="text"
            placeholder="Ej. Abuelita Rosa"
            class="motriz-input"
            autofocus
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Edad (años)</label>
            <input
              v-model.number="newAge"
              type="number"
              min="10"
              max="115"
              class="motriz-input"
            />
          </div>

          <!-- RF7 Calibración Antropométrica -->
          <div class="form-group">
            <label class="form-label">Estatura (cm)</label>
            <input
              v-model.number="newHeight"
              type="number"
              min="100"
              max="220"
              class="motriz-input"
            />
            <span class="input-hint">RF7: Calibra el punto central y la altura de juego</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Nivel de Movilidad / Dificultad (RF5)</label>
          <div class="difficulty-options">
            <button
              type="button"
              class="diff-pill"
              :class="{ 'diff-active': newDifficulty === 'facil' }"
              @click="newDifficulty = 'facil'"
            >
              Suave / Asistido
            </button>
            <button
              type="button"
              class="diff-pill"
              :class="{ 'diff-active': newDifficulty === 'medio' }"
              @click="newDifficulty = 'medio'"
            >
              Intermedio
            </button>
            <button
              type="button"
              class="diff-pill"
              :class="{ 'diff-active': newDifficulty === 'adaptado' }"
              @click="newDifficulty = 'adaptado'"
            >
              Sentado / Rango Bajo
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Avatar</label>
          <div class="avatar-selector">
            <button
              v-for="av in avatarOptions"
              :key="av"
              type="button"
              class="avatar-opt-btn"
              :class="{ 'avatar-opt-active': newAvatar === av }"
              @click="newAvatar = av"
            >
              {{ av }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn-motriz-secondary form-btn"
            @click="isCreating = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn-motriz-primary form-btn"
            :disabled="!newName.trim()"
            @click="handleCreate"
          >
            Guardar Perfil
          </button>
        </div>
      </div>

      <!-- Profile Selector List -->
      <div v-else class="profiles-list-section">
        <p class="section-desc">
          Selecciona un perfil existente o crea uno nuevo para registrar las sesiones del usuario.
        </p>

        <div class="profiles-grid">
          <div
            v-for="p in profiles"
            :key="p.id"
            class="profile-item-card"
            :class="{ 'profile-item-active': activeProfile?.id === p.id }"
            @click="handleSelect(p.id)"
          >
            <span class="p-avatar">{{ p.avatar }}</span>
            <div class="p-details">
              <strong class="p-name">{{ p.name }}</strong>
              <span class="p-meta">{{ p.age }} años • {{ p.heightCm }} cm</span>
              <span class="p-diff">Movilidad: {{ p.difficulty }}</span>
            </div>
            <div v-if="activeProfile?.id === p.id" class="p-badge-active">
              Activo
            </div>
          </div>
        </div>

        <div class="profiles-list-actions">
          <button
            type="button"
            class="btn-motriz-primary btn-add-p"
            @click="isCreating = true"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Crear Nuevo Perfil</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-modal-card {
  width: 100%;
  max-width: 620px;
  padding: 34px 38px;
  background: #FFFDF9;
}

.modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.profile-modal-title {
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

.section-desc {
  margin: 0 0 20px;
  color: var(--motriz-text-muted);
  font-size: 0.95rem;
  line-height: 1.4;
}

.profiles-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  margin-bottom: 24px;
}

.profile-item-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #FDFBF7;
  border: 2px solid #EADBCC;
  border-radius: 20px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-item-card:hover {
  border-color: var(--motriz-red-primary);
  background: #FFFFFF;
  transform: translateY(-2px);
}

.profile-item-active {
  border-color: var(--motriz-red-primary);
  background: #FFF7F5;
  box-shadow: 0 0 0 2px var(--motriz-red-primary);
}

.p-avatar {
  font-size: 2.2rem;
}

.p-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.p-name {
  font-size: 1.15rem;
  color: var(--motriz-text-main);
}

.p-meta {
  font-size: 0.85rem;
  color: var(--motriz-text-muted);
}

.p-diff {
  font-size: 0.78rem;
  font-weight: 700;
  color: #B45309;
  text-transform: capitalize;
}

.p-badge-active {
  background: var(--motriz-red-primary);
  color: #FFFFFF;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 9999px;
}

.profiles-list-actions {
  display: flex;
  justify-content: center;
}

.btn-add-p {
  padding: 14px 32px;
  font-size: 1.15rem;
}

/* Form */
.create-profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-label {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--motriz-text-main);
}

.motriz-input {
  background: #FDFBF7;
  border: 2px solid #E2D5C4;
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 1.05rem;
  color: var(--motriz-text-main);
  outline: none;
}

.motriz-input:focus {
  border-color: var(--motriz-red-primary);
  background: #FFFFFF;
}

.input-hint {
  font-size: 0.76rem;
  color: #B45309;
  font-weight: 600;
}

.difficulty-options {
  display: flex;
  gap: 10px;
}

.diff-pill {
  flex: 1;
  border: 2px solid #E2D5C4;
  background: #FDFBF7;
  border-radius: 12px;
  padding: 10px 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--motriz-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.diff-pill.diff-active {
  border-color: var(--motriz-red-primary);
  background: var(--motriz-red-primary);
  color: #FFFFFF;
}

.avatar-selector {
  display: flex;
  gap: 12px;
}

.avatar-opt-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #E2D5C4;
  background: #FFFFFF;
  font-size: 1.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-opt-active {
  border-color: var(--motriz-red-primary);
  transform: scale(1.15);
  box-shadow: 0 4px 10px rgba(140, 29, 44, 0.25);
}

.form-actions {
  display: flex;
  gap: 14px;
  margin-top: 10px;
}

.form-btn {
  flex: 1;
  padding: 14px 20px;
  font-size: 1.15rem;
}
</style>
