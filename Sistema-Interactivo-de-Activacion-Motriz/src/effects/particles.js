const particles = []

export function burst(x, y, color, amount = 18) {
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 90 + Math.random() * 220
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 5,
      color,
      life: 0.5 + Math.random() * 0.45,
      maxLife: 0.95,
    })
  }
}

export function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 220 * dt
    p.life -= dt
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].life <= 0) particles.splice(i, 1)
  }
}

export function drawParticles(ctx) {
  for (const p of particles) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife)
    ctx.fillStyle = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur = 14
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

export function clearParticles() {
  particles.length = 0
}
