import { useEffect, useRef } from 'react'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Metrics from '@/components/landing/Metrics'
import FeaturesGrid from '@/components/landing/FeaturesGrid'
import Comparison from '@/components/landing/Comparison'
import Pricing from '@/components/landing/Pricing'
import Footer from '@/components/landing/Footer'

// 3D Canvas Particle Background Network
function Canvas3DBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Create 3D Particles in a rotating sphere/mesh
    const particleCount = 65
    const particles = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 - 400,
        radius: Math.random() * 2.5 + 1.5,
        color: ['#06b6d4', '#6366f1', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 4)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.5,
      })
    }

    let angleX = 0.001
    let angleY = 0.0012

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2
      const focalLength = 400

      // Rotate and update particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

        if (p.x < -width) p.x = width
        if (p.x > width) p.x = -width
        if (p.y < -height) p.y = height
        if (p.y > height) p.y = -height
        if (p.z < -400) p.z = 400
        if (p.z > 400) p.z = -400

        // 3D rotation math
        const cosX = Math.cos(angleX)
        const sinX = Math.sin(angleX)
        const cosY = Math.cos(angleY)
        const sinY = Math.sin(angleY)

        let y1 = p.y * cosX - p.z * sinX
        let z1 = p.z * cosX + p.y * sinX

        let x2 = p.x * cosY + z1 * sinY
        let z2 = z1 * cosY - p.x * sinY

        p.x = x2
        p.y = y1
        p.z = z2

        // Perspective scale projection
        const scale = focalLength / (focalLength + p.z + 500)
        const projectedX = p.x * scale + cx
        const projectedY = p.y * scale + cy

        if (scale > 0) {
          ctx.beginPath()
          ctx.arc(projectedX, projectedY, Math.max(1, p.radius * scale * 1.5), 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.shadowBlur = 12
          ctx.shadowColor = p.color
          ctx.globalAlpha = Math.min(1, Math.max(0.2, scale * 0.8))
          ctx.fill()
        }
      })

      // Draw 3D laser lines between nearby particles
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dz = p1.z - p2.z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < 170) {
            const scale1 = focalLength / (focalLength + p1.z + 500)
            const scale2 = focalLength / (focalLength + p2.z + 500)

            const x1 = p1.x * scale1 + cx
            const y1 = p1.y * scale1 + cy
            const x2 = p2.x * scale2 + cx
            const y2 = p2.y * scale2 + cy

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.strokeStyle = '#6366f1'
            ctx.globalAlpha = (1 - dist / 170) * 0.2
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-base text-text-primary relative overflow-hidden font-sans selection:bg-accent/30 selection:text-white transition-colors duration-300">
      {/* 3D WebGL Canvas Background */}
      <Canvas3DBackground />

      {/* Decorative Radial Spotlight Gradients */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-to-tr from-accent/20 via-cyan-500/15 to-purple-600/15 rounded-full blur-[170px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[800px] h-[800px] bg-semantic-green/10 rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* 1. Header / Navigation Bar */}
      <Navbar />

      {/* 2. High-Impact Hero Section with Interactive Live Role Sandbox */}
      <Hero />

      {/* 3. Social Proof & Metrics Bar */}
      <Metrics />

      {/* 4. Interactive Feature Bento Box Grid */}
      <FeaturesGrid />

      {/* 5. "Why Placify vs. Legacy Tools" Comparison Table */}
      <Comparison />

      {/* 6. Interactive Pricing / Access Tiers */}
      <Pricing />

      {/* 7. World-Class Footer */}
      <Footer />
    </div>
  )
}
