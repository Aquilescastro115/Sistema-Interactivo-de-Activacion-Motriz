export const rainbowColors = [
  '#ff335f',
  '#ff9f1c',
  '#ffe66d',
  '#2ee6a6',
  '#33d6ff',
  '#5773ff',
  '#d45cff',
]

export function getRainbowColor(index) {
  return rainbowColors[index % rainbowColors.length]
}
