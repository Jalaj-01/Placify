import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function GlassStairs3D({ scrollProgressRef, activeStep }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ── 1. Scene, Camera & Renderer ──
    const scene = new THREE.Scene()
    let width = container.clientWidth || window.innerWidth
    let height = container.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000)
    camera.position.set(-2.5, 0.8, 8.8)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // ── 2. Atmospheric Lighting ──
    const ambientLight = new THREE.AmbientLight(0xf0f7ff, 1.8)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8)
    sunLight.position.set(8, 12, 6)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    scene.add(sunLight)

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 2.0)
    rimLight.position.set(-8, -4, 4)
    scene.add(rimLight)

    const peachLight = new THREE.DirectionalLight(0xffe4e6, 1.3)
    peachLight.position.set(0, 5, -6)
    scene.add(peachLight)

    // ── 3. Build Floating Glass Staircase ──
    const stairsGroup = new THREE.Group()
    scene.add(stairsGroup)

    const stepCount = 14
    const stepMeshes = []
    const edgeMeshes = []

    // Base Frosted Glass Material (matches reference image)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0f9ff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      ior: 1.52,
      thickness: 0.7,
      reflectivity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
    })

    // Active Glow Materials for the 3 Pillars
    // Student Glow (Cyan)
    const studentGlowMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      transmission: 0.75,
      transparent: true,
      roughness: 0.05,
      ior: 1.55,
      thickness: 0.9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
    })

    // Faculty Glow (Purple / Indigo)
    const facultyGlowMat = new THREE.MeshPhysicalMaterial({
      color: 0xc4b5fd,
      transmission: 0.75,
      transparent: true,
      roughness: 0.05,
      ior: 1.55,
      thickness: 0.9,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.45,
    })

    // PhD Glow (Emerald / Teal)
    const phdGlowMat = new THREE.MeshPhysicalMaterial({
      color: 0x6ee7b7,
      transmission: 0.75,
      transparent: true,
      roughness: 0.05,
      ior: 1.55,
      thickness: 0.9,
      emissive: 0x059669,
      emissiveIntensity: 0.45,
    })

    const stepGeo = new THREE.BoxGeometry(2.4, 0.16, 1.3)
    const stepEdgesGeo = new THREE.EdgesGeometry(stepGeo)

    for (let i = 0; i < stepCount; i++) {
      const stepMesh = new THREE.Mesh(stepGeo, glassMat)
      stepMesh.castShadow = true
      stepMesh.receiveShadow = true

      const t = i / (stepCount - 1)
      const x = -3.2 + t * 5.8 + Math.sin(t * Math.PI) * 0.4
      const y = -2.6 + t * 5.8
      const z = 1.8 - t * 4.6
      const rotY = -0.15 + t * 0.85

      stepMesh.position.set(x, y, z)
      stepMesh.rotation.y = rotY

      // Luminous cyan edge outline (from reference image)
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.5,
        linewidth: 1,
      })
      const edgeLine = new THREE.LineSegments(stepEdgesGeo, edgeMat)
      stepMesh.add(edgeLine)
      edgeMeshes.push(edgeLine)

      stairsGroup.add(stepMesh)
      stepMeshes.push(stepMesh)
    }

    // ── 4. Floating Glint Sparkles ──
    const glintCount = 40
    const glintGeo = new THREE.BufferGeometry()
    const glintPos = new Float32Array(glintCount * 3)
    for (let i = 0; i < glintCount; i++) {
      const idx = i * 3
      const stepIdx = Math.floor(Math.random() * stepCount)
      const basePos = stepMeshes[stepIdx].position
      glintPos[idx] = basePos.x + (Math.random() - 0.5) * 3.2
      glintPos[idx + 1] = basePos.y + (Math.random() - 0.5) * 1.8 + 0.3
      glintPos[idx + 2] = basePos.z + (Math.random() - 0.5) * 2.2
    }
    glintGeo.setAttribute('position', new THREE.BufferAttribute(glintPos, 3))
    const glintMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
    })
    const glintParticles = new THREE.Points(glintGeo, glintMat)
    scene.add(glintParticles)

    // Radiant Sun Starburst Flare at Top of Stairs
    const flareGeo = new THREE.SphereGeometry(0.35, 16, 16)
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    })
    const flareMesh = new THREE.Mesh(flareGeo, flareMat)
    const topStepPos = stepMeshes[stepCount - 1].position
    flareMesh.position.set(topStepPos.x + 0.4, topStepPos.y + 0.6, topStepPos.z - 0.2)
    scene.add(flareMesh)

    const summitGlow = new THREE.PointLight(0x7dd3fc, 2.5, 9)
    summitGlow.position.copy(flareMesh.position)
    scene.add(summitGlow)

    // ── 5. Mouse & Scroll Interaction ──
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

    // ── 6. Animation Loop ──
    let animId
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      const targetProgress = scrollProgressRef?.current || 0
      smoothProgress += (targetProgress - smoothProgress) * 0.07

      // Progress mapped to stair index
      const camTargetT = Math.min(1, Math.max(0, smoothProgress * 1.03))
      const targetStepIdx = Math.min(stepCount - 1, Math.floor(camTargetT * (stepCount - 1)))

      // Dynamic Step Coloring based on Pillar:
      // Steps 0-4 (Pillar 1: Student): Cyan
      // Steps 5-8 (Pillar 2: Faculty): Purple
      // Steps 9-13 (Pillar 3: PhD): Emerald/Teal
      stepMeshes.forEach((mesh, idx) => {
        const isCurrent = Math.abs(idx - targetStepIdx) <= 1
        if (isCurrent) {
          if (idx <= 4) {
            mesh.material = studentGlowMat
            edgeMeshes[idx].material.color.setHex(0x06b6d4)
          } else if (idx <= 8) {
            mesh.material = facultyGlowMat
            edgeMeshes[idx].material.color.setHex(0xa855f7)
          } else {
            mesh.material = phdGlowMat
            edgeMeshes[idx].material.color.setHex(0x10b981)
          }
          edgeMeshes[idx].material.opacity = 0.95
        } else {
          mesh.material = glassMat
          edgeMeshes[idx].material.color.setHex(0x38bdf8)
          edgeMeshes[idx].material.opacity = 0.35
        }
      })

      // Interpolate camera coordinates along stairs
      const camX = THREE.MathUtils.lerp(-2.5, 2.2, camTargetT) + mouseX * 0.3
      const camY = THREE.MathUtils.lerp(0.8, 4.4, camTargetT) + mouseY * 0.25
      const camZ = THREE.MathUtils.lerp(8.8, 3.8, camTargetT)

      const lookT = Math.min(1, camTargetT + 0.18)
      const lookStep = stepMeshes[Math.min(stepCount - 1, Math.floor(lookT * (stepCount - 1)))]
      camera.position.set(camX, camY, camZ)
      camera.lookAt(lookStep.position.x, lookStep.position.y, lookStep.position.z)

      // Sparkle float
      const positions = glintGeo.attributes.position.array
      for (let i = 0; i < glintCount; i++) {
        const idx = i * 3
        positions[idx + 1] += Math.sin(elapsedTime * 2 + i) * 0.003
      }
      glintGeo.attributes.position.needsUpdate = true

      // Flare pulse
      flareMesh.scale.setScalar(1 + Math.sin(elapsedTime * 3) * 0.15)
      summitGlow.intensity = 2.2 + Math.sin(elapsedTime * 3) * 0.6

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
      stepGeo.dispose()
      stepEdgesGeo.dispose()
      glassMat.dispose()
      studentGlowMat.dispose()
      facultyGlowMat.dispose()
      phdGlowMat.dispose()
      glintGeo.dispose()
      glintMat.dispose()
      flareGeo.dispose()
      flareMat.dispose()
    }
  }, [scrollProgressRef])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}
