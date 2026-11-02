import { ref, computed } from 'vue'

const STORAGE_KEY = 'asistencia_motriz_profiles_v1'
const ACTIVE_PROFILE_KEY = 'asistencia_motriz_active_id'

const defaultProfiles = [
  {
    id: 'prof-1',
    name: 'Rosa Gutiérrez',
    age: 72,
    heightCm: 158,
    difficulty: 'facil', // facil, medio, adaptado
    avatar: '👵',
    stats: {
      totalMinutes: 42,
      sessionsCompleted: 5,
      totalPoints: 1250,
      weeklyDays: [
        { day: 'Lun', minutes: 12 },
        { day: 'Mié', minutes: 15 },
        { day: 'Jue', minutes: 18 },
        { day: 'Vie', minutes: 25 },
        { day: 'Sáb', minutes: 15 },
        { day: 'Dom', minutes: 20 },
      ],
    },
  },
  {
    id: 'prof-2',
    name: 'Don Carlos',
    age: 68,
    heightCm: 170,
    difficulty: 'medio',
    avatar: '👴',
    stats: {
      totalMinutes: 28,
      sessionsCompleted: 3,
      totalPoints: 840,
      weeklyDays: [
        { day: 'Lun', minutes: 10 },
        { day: 'Mié', minutes: 8 },
        { day: 'Jue', minutes: 10 },
        { day: 'Vie', minutes: 0 },
        { day: 'Sáb', minutes: 0 },
        { day: 'Dom', minutes: 0 },
      ],
    },
  },
]

function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Error cargando perfiles:', e)
  }
  return defaultProfiles
}

function loadActiveId() {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'prof-1'
  } catch (e) {
    return 'prof-1'
  }
}

const profiles = ref(loadProfiles())
const activeId = ref(loadActiveId())

function saveProfiles() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles.value))
    localStorage.setItem(ACTIVE_PROFILE_KEY, activeId.value)
  } catch (e) {
    console.error('Error guardando perfiles:', e)
  }
}

export function useProfiles() {
  const activeProfile = computed(() => {
    return profiles.value.find((p) => p.id === activeId.value) || profiles.value[0] || null
  })

  function selectProfile(id) {
    activeId.value = id
    saveProfiles()
  }

  function addProfile({ name, age, heightCm, difficulty = 'facil', avatar = '👵' }) {
    const newProfile = {
      id: `prof-${Date.now()}`,
      name: name.trim() || 'Nuevo Jugador',
      age: Number(age) || 70,
      heightCm: Number(heightCm) || 160,
      difficulty,
      avatar,
      stats: {
        totalMinutes: 0,
        sessionsCompleted: 0,
        totalPoints: 0,
        weeklyDays: [
          { day: 'Lun', minutes: 0 },
          { day: 'Mié', minutes: 0 },
          { day: 'Jue', minutes: 0 },
          { day: 'Vie', minutes: 0 },
          { day: 'Sáb', minutes: 0 },
          { day: 'Dom', minutes: 0 },
        ],
      },
    }
    profiles.value.push(newProfile)
    activeId.value = newProfile.id
    saveProfiles()
    return newProfile
  }

  function updateActiveStats({ minutes = 1, points = 100, hits = 10 }) {
    if (!activeProfile.value) return
    const p = activeProfile.value
    p.stats.totalMinutes = (p.stats.totalMinutes || 0) + minutes
    p.stats.sessionsCompleted = (p.stats.sessionsCompleted || 0) + 1
    p.stats.totalPoints = (p.stats.totalPoints || 0) + points

    // Update current day (assuming Lun-Dom)
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const todayName = dayNames[new Date().getDay()]
    const dayEntry = p.stats.weeklyDays.find((d) => d.day === todayName)
    if (dayEntry) {
      dayEntry.minutes += minutes
    }
    saveProfiles()
  }

  return {
    profiles,
    activeProfile,
    selectProfile,
    addProfile,
    updateActiveStats,
  }
}
