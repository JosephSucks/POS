'use client'

import React, { useEffect, useRef } from 'react'

interface TubesBackgroundProps {
  children?: React.ReactNode
  className?: string
}

export function TubesBackground({ children, className = '' }: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animated particles for background
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      maxLife: number
      hue: number
    }> = []

    const createParticle = () => {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        life: 1,
        maxLife: Math.random() * 3 + 2,
        hue: Math.random() * 60 + 150,
      })
    }

    for (let i = 0; i < 50; i++) {
      createParticle()
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= 1 / 60

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        if (p.life <= 0) {
          particles.splice(i, 1)
        } else {
          const alpha = Math.max(0, p.life) * 0.5
          ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${alpha})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
          ctx.fill()

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j]
            const dx = p.x - p2.x
            const dy = p.y - p2.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 150) {
              ctx.strokeStyle = `hsla(${p.hue}, 100%, 50%, ${alpha * 0.3})`
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.stroke()
            }
          }
        }
      }

      if (particles.length < 100 && Math.random() < 0.3) {
        createParticle()
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default TubesBackground
