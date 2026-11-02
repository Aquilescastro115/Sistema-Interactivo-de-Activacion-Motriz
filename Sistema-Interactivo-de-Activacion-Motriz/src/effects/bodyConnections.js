// Conexiones principales de MediaPipe Pose usadas para dibujar un esqueleto
// completo. Los índices corresponden a los 33 landmarks del Pose Landmarker.
export const BODY_CONNECTIONS = [
  // cabeza
  [0, 7], [0, 8], [7, 11], [8, 12],

  // hombros y brazos
  [11, 12],
  [11, 13], [13, 15], [15, 17], [15, 19],
  [12, 14], [14, 16], [16, 18], [16, 20],

  // torso
  [11, 23], [12, 24], [23, 24],

  // piernas
  [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
  [24, 26], [26, 28], [28, 30], [30, 32], [28, 32],
]
