import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Landing3DScene({ className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const width = container.clientWidth || 400
    const height = container.clientHeight || 400

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 6.5

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xa5b4fc, 2.2) // soft indigo/lavender
    dirLight1.position.set(5, 6, 4)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x7dd3fc, 1.8) // soft sky blue
    dirLight2.position.set(-5, -3, 3)
    scene.add(dirLight2)

    const dirLight3 = new THREE.DirectionalLight(0xfbcfe8, 1.5) // soft peach/blush
    dirLight3.position.set(0, 5, -4)
    scene.add(dirLight3)

    // Main 3D Group
    const mainGroup = new THREE.Group()
    scene.add(mainGroup)

    // 1. Central 3D Frosted Polyhedron
    const icoGeo = new THREE.IcosahedronGeometry(1.6, 0)
    const icoMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.65, // frosted glass transmission
      thickness: 1.2,
      ior: 1.5,
      transparent: true,
      opacity: 0.95,
      reflectivity: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    })
    const icosahedron = new THREE.Mesh(icoGeo, icoMat)
    mainGroup.add(icosahedron)

    // 1b. Inner glowing wireframe for high-tech holographic depth
    const wireGeo = new THREE.IcosahedronGeometry(1.62, 0)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    mainGroup.add(wireMesh)

    // 2. Orbiting Torus Rings
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      metalness: 0.8,
    })
    const ringGeo1 = new THREE.TorusGeometry(2.35, 0.045, 16, 100)
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1)
    ring1.rotation.x = Math.PI / 3.2
    ring1.rotation.y = Math.PI / 6
    mainGroup.add(ring1)

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.25,
      metalness: 0.75,
    })
    const ringGeo2 = new THREE.TorusGeometry(2.7, 0.035, 16, 100)
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2)
    ring2.rotation.x = -Math.PI / 4
    ring2.rotation.y = Math.PI / 3
    mainGroup.add(ring2)

    // 3. Floating satellite spheres
    const satellites = []
    const satCount = 7
    const satColors = [0x2563eb, 0xfacc15, 0x3b82f6, 0xca8a04, 0x1d4ed8, 0x60a5fa, 0xfde047]
    for (let i = 0; i < satCount; i++) {
      const satGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 24, 24)
      const satMat = new THREE.MeshStandardMaterial({
        color: satColors[i % satColors.length],
        roughness: 0.2,
        metalness: 0.6,
      })
      const sat = new THREE.Mesh(satGeo, satMat)
      const angle = (i / satCount) * Math.PI * 2
      const radius = 2.4 + Math.random() * 0.5
      sat.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 1.5,
        Math.sin(angle) * radius
      )
      sat.userData = {
        angle,
        radius,
        speed: 0.008 + Math.random() * 0.01,
        yOffset: sat.position.y,
        ySpeed: 0.015 + Math.random() * 0.01,
      }
      mainGroup.add(sat)
      satellites.push(sat)
    }

    // Mouse Interaction
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      targetX = x * 0.7
      targetY = y * 0.7
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth
      const newH = container.clientHeight
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }
    window.addEventListener('resize', handleResize)

    // Animation Loop with Visibility & Intersection Optimization (Eliminates lag when scrolled)
    let animId = null
    let isVisible = true
    let clock = new THREE.Clock()

    const animate = () => {
      if (!isVisible) return
      animId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Smooth mouse lerp
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05

      // Gentle floating oscillation
      mainGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12
      mainGroup.rotation.y = elapsedTime * 0.25 + currentX
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15 - currentY * 0.6

      // Rotate individual elements
      icosahedron.rotation.x += 0.004
      icosahedron.rotation.y += 0.006
      wireMesh.rotation.x += 0.004
      wireMesh.rotation.y += 0.006

      ring1.rotation.z += 0.008
      ring2.rotation.z -= 0.006

      // Orbit satellites
      satellites.forEach((sat) => {
        sat.userData.angle += sat.userData.speed
        sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius
        sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius
        sat.position.y = sat.userData.yOffset + Math.sin(elapsedTime * 2 + sat.userData.angle) * 0.2
      })

      renderer.render(scene, camera)
    }

    const observer = new IntersectionObserver(([entry]) => {
      const currentlyVisible = entry.isIntersecting && !document.hidden
      if (currentlyVisible !== isVisible) {
        isVisible = currentlyVisible
        if (isVisible) {
          clock.start()
          animate()
        } else if (animId) {
          cancelAnimationFrame(animId)
        }
      }
    }, { threshold: 0.05 })

    observer.observe(container)
    animate()

    return () => {
      observer.disconnect()
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      icoGeo.dispose()
      icoMat.dispose()
      wireGeo.dispose()
      wireMat.dispose()
      ringGeo1.dispose()
      ringMat1.dispose()
      ringGeo2.dispose()
      ringMat2.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ minHeight: '340px' }}
    />
  )
}
