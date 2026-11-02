const POINT_DEFINITIONS = [
  { index: 0,  name: 'cabeza',            radius: 54 },
  { index: 11, name: 'hombro izquierdo',  radius: 33 },
  { index: 12, name: 'hombro derecho',    radius: 33 },
  { index: 13, name: 'codo izquierdo',    radius: 31 },
  { index: 14, name: 'codo derecho',      radius: 31 },
  { index: 15, name: 'mano izquierda',    radius: 42 },
  { index: 16, name: 'mano derecha',      radius: 42 },
  { index: 19, name: 'mano izquierda',    radius: 38 },
  { index: 20, name: 'mano derecha',      radius: 38 },
  { index: 23, name: 'cadera izquierda',  radius: 34 },
  { index: 24, name: 'cadera derecha',    radius: 34 },
  { index: 25, name: 'rodilla izquierda', radius: 34 },
  { index: 26, name: 'rodilla derecha',   radius: 34 },
  { index: 27, name: 'tobillo izquierdo', radius: 31 },
  { index: 28, name: 'tobillo derecho',   radius: 31 },
  { index: 31, name: 'pie izquierdo',     radius: 44 },
  { index: 32, name: 'pie derecho',       radius: 44 },
]

const SEGMENT_DEFINITIONS = [
  { a: 11, b: 12, name: 'hombros',            thickness: 25 },
  { a: 11, b: 13, name: 'brazo izquierdo',    thickness: 23 },
  { a: 13, b: 15, name: 'antebrazo izquierdo',thickness: 23 },
  { a: 12, b: 14, name: 'brazo derecho',      thickness: 23 },
  { a: 14, b: 16, name: 'antebrazo derecho',  thickness: 23 },
  { a: 11, b: 23, name: 'torso',              thickness: 29 },
  { a: 12, b: 24, name: 'torso',              thickness: 29 },
  { a: 11, b: 24, name: 'pecho',              thickness: 24 },
  { a: 12, b: 23, name: 'pecho',              thickness: 24 },
  { a: 23, b: 24, name: 'cadera',             thickness: 28 },
  { a: 23, b: 25, name: 'muslo izquierdo',    thickness: 27 },
  { a: 25, b: 27, name: 'pierna izquierda',   thickness: 25 },
  { a: 24, b: 26, name: 'muslo derecho',      thickness: 27 },
  { a: 26, b: 28, name: 'pierna derecha',     thickness: 25 },
  { a: 27, b: 31, name: 'pie izquierdo',      thickness: 23 },
  { a: 28, b: 32, name: 'pie derecho',        thickness: 23 },
]

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function visible(landmark, threshold = 0.25) {
  return Boolean(landmark && (landmark.visibility ?? 1) >= threshold)
}

// Convierte las coordenadas normalizadas de MediaPipe a las coordenadas reales
// del elemento video mostrado con object-fit: cover y transform: scaleX(-1).
function mapLandmark(landmark, stage, video) {
  const videoWidth = video.videoWidth || stage.width
  const videoHeight = video.videoHeight || stage.height
  const scale = Math.max(stage.width / videoWidth, stage.height / videoHeight)
  const renderedWidth = videoWidth * scale
  const renderedHeight = videoHeight * scale
  const offsetX = (stage.width - renderedWidth) / 2
  const offsetY = (stage.height - renderedHeight) / 2

  const unmirroredX = offsetX + landmark.x * renderedWidth
  return {
    x: stage.width - unmirroredX,
    y: offsetY + landmark.y * renderedHeight,
  }
}

export function buildBodyInteraction(landmarks, stage, video) {
  if (!landmarks?.length) return { points: [], segments: [], mapped: [] }

  const mapped = landmarks.map((landmark) => {
    if (!landmark) return null
    const position = mapLandmark(landmark, stage, video)
    return {
      ...position,
      visibility: landmark.visibility ?? 1,
    }
  })

  const scale = clamp(Math.min(stage.width, stage.height) / 720, 0.62, 1.35)

  const points = POINT_DEFINITIONS
    .filter((definition) => visible(landmarks[definition.index]))
    .map((definition) => ({
      ...mapped[definition.index],
      index: definition.index,
      name: definition.name,
      r: definition.radius * scale,
    }))

  const segments = SEGMENT_DEFINITIONS
    .filter((definition) => visible(landmarks[definition.a]) && visible(landmarks[definition.b]))
    .map((definition) => ({
      a: mapped[definition.a],
      b: mapped[definition.b],
      name: definition.name,
      thickness: definition.thickness * scale,
    }))

  return { points, segments, mapped }
}

function distanceSquaredPointToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax
  const vy = by - ay
  const wx = px - ax
  const wy = py - ay
  const lengthSq = vx * vx + vy * vy

  if (lengthSq === 0) {
    const dx = px - ax
    const dy = py - ay
    return dx * dx + dy * dy
  }

  const t = clamp((wx * vx + wy * vy) / lengthSq, 0, 1)
  const cx = ax + t * vx
  const cy = ay + t * vy
  const dx = px - cx
  const dy = py - cy
  return dx * dx + dy * dy
}

export function findBodyHit(balloon, body) {
  for (const point of body.points) {
    const dx = balloon.x - point.x
    const dy = balloon.y - point.y
    const collisionRadius = balloon.r + point.r
    if (dx * dx + dy * dy <= collisionRadius * collisionRadius) {
      return point.name
    }
  }

  for (const segment of body.segments) {
    const collisionRadius = balloon.r + segment.thickness
    const distanceSq = distanceSquaredPointToSegment(
      balloon.x,
      balloon.y,
      segment.a.x,
      segment.a.y,
      segment.b.x,
      segment.b.y,
    )
    if (distanceSq <= collisionRadius * collisionRadius) {
      return segment.name
    }
  }

  return null
}
