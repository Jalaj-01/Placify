import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Scroll3DCanvas({ scrollProgressRef }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene & Camera
    const scene = new THREE.Scene()
    let width = (container.clientWidth || window.innerWidth)
    let height = (container.clientHeight || window.innerHeight)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 7.5)

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)

    // Lighting (matches soft pastel theme)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6)
    scene.add(ambientLight)

    const peachLight = new THREE.DirectionalLight(0xffd6dd, 2.4)
    peachLight.position.set(-6, 8, 5)
    scene.add(peachLight)

    const skyLight = new THREE.DirectionalLight(0xc1e4f8, 2.0)
    skyLight.position.set(6, -4, 4)
    scene.add(skyLight)

    const violetLight = new THREE.DirectionalLight(0xdfe0fb, 1.8)
    violetLight.position.set(0, 6, -5)
    scene.add(violetLight)

    // Main 3D World Group
    const worldGroup = new THREE.Group()
    scene.add(worldGroup)

    // 1. Central Multifaceted Frosted Crystalline Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.35, 0)
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.08,
      roughness: 0.14,
      transmission: 0.72,
      thickness: 1.4,
      ior: 1.52,
      transparent: true,
      opacity: 0.95,
      reflectivity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    worldGroup.add(coreMesh)

    // 1b. Glowing Wireframe Shell for high-tech holographic structure
    const wireGeo = new THREE.IcosahedronGeometry(1.37, 0)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    worldGroup.add(wireMesh)

    // 2. Nested Orbital Rings
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.25,
      metalness: 0.8,
    })
    const ringGeo1 = new THREE.TorusGeometry(2.0, 0.035, 16, 120)
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1)
    ring1.rotation.x = Math.PI / 3
    worldGroup.add(ring1)

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.25,
      metalness: 0.75,
    })
    const ringGeo2 = new THREE.TorusGeometry(2.35, 0.028, 16, 120)
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2)
    ring2.rotation.x = -Math.PI / 4
    ring2.rotation.y = Math.PI / 4
    worldGroup.add(ring2)

    const ringMat3 = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.3,
      metalness: 0.7,
    })
    const ringGeo3 = new THREE.TorusGeometry(2.7, 0.022, 16, 120)
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3)
    ring3.rotation.z = Math.PI / 5
    worldGroup.add(ring3)

    // 3. Orbiting Planetary Nodes / Satellites
    const satellites = []
    const satCount = 9
    const satPalette = [0x818cf8, 0x38bdf8, 0x34d399, 0xfbbf24, 0xf472b6, 0x6366f1, 0x06b6d4, 0xa78bfa, 0x10b981]
    const satGroup = new THREE.Group()
    worldGroup.add(satGroup)

    for (let i = 0; i < satCount; i++) {
      const radius = 0.11 + (i % 3) * 0.04
      const geo = new THREE.SphereGeometry(radius, 24, 24)
      const mat = new THREE.MeshStandardMaterial({
        color: satPalette[i % satPalette.length],
        roughness: 0.2,
        metalness: 0.6,
      })
      const sat = new THREE.Mesh(geo, mat)
      const angle = (i / satCount) * Math.PI * 2
      const dist = 2.4 + (i % 4) * 0.5
      sat.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 1.6, Math.sin(angle) * dist)
      sat.userData = {
        angle,
        dist,
        speed: 0.006 + (i % 3) * 0.004,
        yBase: sat.position.y,
        ySpeed: 0.015 + (i % 2) * 0.01,
      }
      satGroup.add(sat)
      satellites.push(sat)
    }

    // 4. Floating 3D Star Constellation Network
    const starCount = 45
    const starGeo = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 22
      starPositions[i + 1] = (Math.random() - 0.5) * 18
      starPositions[i + 2] = (Math.random() - 0.5) * 12
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
    })
    const starMesh = new THREE.Points(starGeo, starMat)
    scene.add(starMesh)

    // Smooth Variables
    let smoothProgress = 0
    let mouseX = 0
    let mouseY = 0
    let targetMouseX = 0
    let targetMouseY = 0

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    const handleResize = () => {
      if (!container) return
      width = container.clientWidth || window.innerWidth
      height = container.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Animation Loop
    let animId
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Interpolate mouse & scroll smoothly
      mouseX += (targetMouseX - mouseX) * 0.06
      mouseY += (targetMouseY - mouseY) * 0.06

      const targetProgress = scrollProgressRef?.current || 0
      smoothProgress += (targetProgress - smoothProgress) * 0.08

      // ─── 3D SCROLL CHOREOGRAPHY ───
      // As user scrolls from 0 to 1, the camera and core dynamically navigate the 3D space:
      // Phase 0: Hero / Center
      // Phase 1 (0.25): Placement Engine -> Core shifts right, camera tilts
      // Phase 2 (0.50): Coding & DSA Lab -> Core shifts left, rings align
      // Phase 3 (0.75): AI Coach & Invites -> Core ascends, rings orbit orthogonally
      // Phase 4 (1.00): Conclusion -> Core returns center with halo

      let targetCamX = 0
      let targetCamY = 0
      let targetCamZ = 8.5
      let targetGroupX = 0
      let targetGroupY = -0.2
      let targetGroupScale = 1

      if (smoothProgress < 0.25) {
        // Hero section: Center stage, gentle float slightly lower so title shines
        const p = smoothProgress / 0.25
        targetCamX = THREE.MathUtils.lerp(0, -1.2, p)
        targetCamY = THREE.MathUtils.lerp(0, 0.2, p)
        targetCamZ = THREE.MathUtils.lerp(8.5, 7.2, p)
        targetGroupX = THREE.MathUtils.lerp(0, 2.3, p)
        targetGroupY = THREE.MathUtils.lerp(-0.2, 0, p)
        targetGroupScale = THREE.MathUtils.lerp(1, 1.1, p)
      } else if (smoothProgress < 0.50) {
        // Placement Engine: Core cleanly on right side
        const p = (smoothProgress - 0.25) / 0.25
        targetCamX = THREE.MathUtils.lerp(-1.2, 1.2, p)
        targetCamY = THREE.MathUtils.lerp(0.2, -0.2, p)
        targetCamZ = THREE.MathUtils.lerp(7.2, 7.0, p)
        targetGroupX = THREE.MathUtils.lerp(2.3, -2.3, p)
        targetGroupScale = THREE.MathUtils.lerp(1.1, 1.15, p)
      } else if (smoothProgress < 0.75) {
        // Coding & AI: Core cleanly on left side
        const p = (smoothProgress - 0.50) / 0.25
        targetCamX = THREE.MathUtils.lerp(1.2, -1.2, p)
        targetCamY = THREE.MathUtils.lerp(-0.2, 0.4, p)
        targetCamZ = THREE.MathUtils.lerp(7.0, 7.2, p)
        targetGroupX = THREE.MathUtils.lerp(-2.3, 2.3, p)
        targetGroupScale = THREE.MathUtils.lerp(1.15, 1.1, p)
      } else {
        // CTA & Finish: Core returns center
        const p = (smoothProgress - 0.75) / 0.25
        targetCamX = THREE.MathUtils.lerp(-1.2, 0, p)
        targetCamY = THREE.MathUtils.lerp(0.4, 0, p)
        targetCamZ = THREE.MathUtils.lerp(7.2, 8.2, p)
        targetGroupX = THREE.MathUtils.lerp(2.3, 0, p)
        targetGroupScale = THREE.MathUtils.lerp(1.1, 1.05, p)
      }

      // Apply camera transitions with mouse parallax
      camera.position.x = targetCamX + mouseX * 0.4
      camera.position.y = targetCamY + mouseY * 0.4
      camera.position.z = targetCamZ
      camera.lookAt(targetGroupX * 0.4, targetGroupY * 0.4, 0)

      // Move World Group
      worldGroup.position.x = targetGroupX
      worldGroup.position.y = targetGroupY + Math.sin(elapsedTime * 1.2) * 0.12
      worldGroup.scale.setScalar(targetGroupScale)

      // Dynamic rotations driven by elapsed time and scroll progress
      coreMesh.rotation.x = elapsedTime * 0.22 + smoothProgress * Math.PI * 2
      coreMesh.rotation.y = elapsedTime * 0.35 + smoothProgress * Math.PI * 3
      wireMesh.rotation.copy(coreMesh.rotation)

      ring1.rotation.z = elapsedTime * 0.3 + smoothProgress * Math.PI * 2
      ring1.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 0.5) * 0.2
      ring2.rotation.z = -elapsedTime * 0.25 - smoothProgress * Math.PI * 2
      ring3.rotation.y = elapsedTime * 0.2 + smoothProgress * Math.PI

      // Orbit satellites
      satellites.forEach((sat) => {
        sat.userData.angle += sat.userData.speed * (1 + smoothProgress)
        const dist = sat.userData.dist * (1 + Math.sin(smoothProgress * Math.PI) * 0.2)
        sat.position.x = Math.cos(sat.userData.angle) * dist
        sat.position.z = Math.sin(sat.userData.angle) * dist
        sat.position.y = sat.userData.yBase + Math.sin(elapsedTime * 2 + sat.userData.angle) * 0.25
      })

      // Slowly rotate starfield
      starMesh.rotation.y = elapsedTime * 0.02

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      coreGeo.dispose()
      coreMat.dispose()
      wireGeo.dispose()
      wireMat.dispose()
      ringGeo1.dispose()
      ringMat1.dispose()
      ringGeo2.dispose()
      ringMat2.dispose()
      ringGeo3.dispose()
      ringMat3.dispose()
      starGeo.dispose()
      starMat.dispose()
    }
  }, [scrollProgressRef])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}
