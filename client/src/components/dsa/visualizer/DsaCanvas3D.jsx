import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Maximize2, RotateCcw, Compass, Camera, Sparkles, Layers } from 'lucide-react'
import { useDsaLabStore } from '@/store/useDsaLabStore'

export default function DsaCanvas3D({ sceneState }) {
  const containerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const cameraPreset = useDsaLabStore((s) => s.cameraPreset)
  const setCameraPreset = useDsaLabStore((s) => s.setCameraPreset)

  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const objectsGroupRef = useRef(null)
  const animFrameIdRef = useRef(null)

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 450

    // 1. Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x090d16)
    scene.fog = new THREE.FogExp2(0x090d16, 0.02)
    sceneRef.current = scene

    // 2. Camera: Optimized framing for DSA nodes
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 5, 14)
    cameraRef.current = camera

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.innerHTML = ''
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 50
    controls.minDistance = 4
    controls.target.set(0, 1.8, 0)
    controls.maxPolarAngle = Math.PI / 2 - 0.05 // Don't flip below ground
    controlsRef.current = controls

    // 5. Lighting: Enhanced multi-point vibrant illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1)
    scene.add(ambientLight)

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.4)
    frontLight.position.set(0, 10, 18)
    frontLight.castShadow = true
    scene.add(frontLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2)
    mainLight.position.set(10, 20, 10)
    scene.add(mainLight)

    const cyanGlow = new THREE.PointLight(0x06b6d4, 3, 40)
    cyanGlow.position.set(-10, 8, -5)
    scene.add(cyanGlow)

    const indigoGlow = new THREE.PointLight(0x818cf8, 3, 40)
    indigoGlow.position.set(10, 8, 5)
    scene.add(indigoGlow)

    // 6. Ground Grid Floor
    const grid = new THREE.GridHelper(40, 40, 0x6366f1, 0x1e263d)
    grid.position.y = -0.01
    scene.add(grid)

    // 7. Dynamic Objects Group
    const objectsGroup = new THREE.Group()
    scene.add(objectsGroup)
    objectsGroupRef.current = objectsGroup

    // 8. Animation Loop
    let clock = new THREE.Clock()
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Subtle float animation on pointers
      if (objectsGroupRef.current) {
        objectsGroupRef.current.traverse((child) => {
          if (child.userData?.isPointer) {
            child.position.y = child.userData.baseY + Math.sin(elapsedTime * 4 + child.userData.offset) * 0.25
          }
          if (child.userData?.isRotator) {
            child.rotation.y = elapsedTime * 0.5
          }
        })
      }

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animFrameIdRef.current)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Handle Camera Presets
  useEffect(() => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    if (cameraPreset === 'top') {
      camera.position.set(0, 22, 0.1)
    } else if (cameraPreset === 'isometric') {
      camera.position.set(14, 14, 14)
    } else {
      camera.position.set(0, 10, 18)
    }
    controls.target.set(0, 2, 0)
    controls.update()
  }, [cameraPreset])

  // Update 3D Geometry whenever sceneState changes
  useEffect(() => {
    const group = objectsGroupRef.current
    if (!group || !sceneState) return

    // Clear previous geometries and materials safely
    while (group.children.length > 0) {
      const obj = group.children[0]
      group.remove(obj)
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
        else obj.material.dispose()
      }
    }

    const { type } = sceneState

    if (type === 'array_1d' || type === 'array') {
      render1DArray(group, sceneState)
    } else if (type === 'linked_list' || type === 'doubly_linked_list' || type === 'circular_linked_list') {
      renderLinkedList(group, sceneState)
    } else if (type === 'stack') {
      renderStack(group, sceneState)
    } else if (type === 'queue') {
      renderQueue(group, sceneState)
    } else if (type === 'tree' || type === 'tree_binary' || type === 'tree_avl' || type === 'tree_bst') {
      renderTree(group, sceneState)
    } else if (type === 'heap' || type === 'tree_heap') {
      renderHeap(group, sceneState)
    } else if (type === 'graph' || type === 'graph_spatial') {
      renderGraph(group, sceneState)
    } else if (type === 'dp_grid' || type === 'array_2d' || type === 'matrix') {
      renderDpGrid(group, sceneState)
    } else {
      render1DArray(group, sceneState)
    }

    // Safety fallback: Ensure scene is never completely empty
    if (group.children.length === 0) {
      render1DArray(group, {
        array: sceneState.array || sceneState.data || [10, 25, 40, 65, 80],
        pointers: [{ name: 'ACTIVE', index: 0, color: '#38bdf8' }],
      })
    }
  }, [sceneState])

  // Helper: Create Text Sprite for numbers & labels in 3D
  const createTextSprite = (message, color = '#ffffff', fontSize = 28, bgColor = 'transparent') => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 256
    canvas.height = 128

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor
      ctx.roundRect ? ctx.roundRect(10, 10, 236, 108, 16) : ctx.rect(10, 10, 236, 108)
      ctx.fill()
    }

    ctx.font = `bold ${fontSize}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.fillText(message, 128, 64)

    const texture = new THREE.CanvasTexture(canvas)
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(2, 1, 1)
    return sprite
  }

  // 1. Render 1D Array
  const render1DArray = (group, state) => {
    const rawArr = state.array || state.data || state.arr || [10, 25, 40, 65, 80]
    const arr = Array.isArray(rawArr) ? rawArr : [10, 25, 40, 65, 80]
    const pointers = (state.pointers || []).map((p) => {
      const idx = p.index !== undefined ? p.index : p.nodeId !== undefined ? p.nodeId : 0
      return { ...p, index: idx }
    })
    const highlightIndices = state.highlightIndices || state.highlightedIndices || []
    const activeRange = state.activeRange || [0, arr.length - 1]
    const bestRange = state.bestRange || null
    const n = arr.length
    const spacing = 1.6
    const startX = -((n - 1) * spacing) / 2

    arr.forEach((val, idx) => {
      const x = startX + idx * spacing
      const isHighlighted = highlightIndices.includes(idx)
      const inActiveRange = idx >= activeRange[0] && idx <= activeRange[1]
      const inBestRange = bestRange && idx >= bestRange[0] && idx <= bestRange[1]
      const isNull = val === null || val === undefined || val === '-'

      // Height proportional to value (clamped)
      const numVal = isNull ? 0 : Number(val) || 0
      const clampedVal = isNull ? 0.8 : Math.max(1.5, Math.min(10, Math.abs(numVal) * 0.18 + 1.8))
      const boxGeo = new THREE.BoxGeometry(1.4, clampedVal, 1.4)

      let color = 0x3b82f6 // vibrant blue
      if (inBestRange) color = 0x22c55e // green
      else if (isHighlighted) color = 0xf59e0b // amber
      else if (inActiveRange && !isNull) color = 0x6366f1 // indigo
      else if (isNull) color = 0x475569
      else color = 0x475569

      const boxMat = new THREE.MeshStandardMaterial({
        color,
        roughness: isNull ? 0.8 : 0.2,
        metalness: isNull ? 0.1 : 0.6,
        wireframe: isNull,
        transparent: isNull,
        opacity: isNull ? 0.4 : 1.0,
        emissive: isHighlighted ? 0xf59e0b : inActiveRange && !isNull ? 0x4f46e5 : 0x1d4ed8,
        emissiveIntensity: isHighlighted ? 0.8 : 0.35,
      })

      const mesh = new THREE.Mesh(boxGeo, boxMat)
      mesh.position.set(x, clampedVal / 2, 0)
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add(mesh)

      // Value label on top of bar with dark badge background
      const displayVal = isNull ? '∅' : String(val)
      const valSprite = createTextSprite(displayVal, '#ffffff', 32, 'rgba(15,23,42,0.85)')
      valSprite.position.set(x, clampedVal + 0.8, 0)
      group.add(valSprite)

      // Index label below bar
      const idxSprite = createTextSprite(`[${idx}]`, '#38bdf8', 22, 'rgba(15,23,42,0.75)')
      idxSprite.position.set(x, -0.6, 0)
      group.add(idxSprite)
    })

    // Render floating pointers above bars
    pointers.forEach((p, pIdx) => {
      if (p.index === undefined || p.index === null || p.index < 0 || p.index >= n) return
      const x = startX + p.index * spacing
      const valAtIdx = arr[p.index]
      const isNull = valAtIdx === null || valAtIdx === undefined || valAtIdx === '-'
      const numVal = isNull ? 0 : Number(valAtIdx) || 0
      const clampedVal = isNull ? 0.8 : Math.max(1.5, Math.min(10, Math.abs(numVal) * 0.18 + 1.8))
      const y = clampedVal + 1.8 + pIdx * 1.0

      // Pointer Cone
      const coneGeo = new THREE.ConeGeometry(0.35, 0.7, 16)
      coneGeo.rotateX(Math.PI) // point downwards
      const coneMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.color || '#38bdf8'),
        emissive: new THREE.Color(p.color || '#38bdf8'),
        emissiveIntensity: 0.8,
      })
      const cone = new THREE.Mesh(coneGeo, coneMat)
      cone.position.set(x, y - 0.4, 0)
      cone.userData = { isPointer: true, baseY: y - 0.4, offset: pIdx * 1.5 }
      group.add(cone)

      // Pointer Label Badge
      const badge = createTextSprite(p.name, p.color || '#38bdf8', 28, 'rgba(15,23,42,0.9)')
      badge.position.set(x, y + 0.5, 0)
      badge.userData = { isPointer: true, baseY: y + 0.5, offset: pIdx * 1.5 }
      group.add(badge)
    })
  }

  // 2. Render Linked List
  const renderLinkedList = (group, state) => {
    const rawList = state.nodes || state.data || state.array || [10, 20, 30, 40]
    const nodes = (Array.isArray(rawList) ? rawList : [10, 20, 30, 40]).map((item, idx, list) => {
      if (typeof item === 'object' && item !== null && 'val' in item) {
        return {
          id: item.id !== undefined ? item.id : idx,
          val: item.val,
          nextId: item.nextId !== undefined ? item.nextId : idx < list.length - 1 ? idx + 1 : null,
        }
      }
      return {
        id: idx,
        val: item,
        nextId: idx < list.length - 1 ? idx + 1 : null,
      }
    })

    const pointers = (state.pointers || []).map((p) => {
      const id = p.nodeId !== undefined ? p.nodeId : p.index !== undefined ? p.index : 0
      return { ...p, nodeId: id }
    })
    const spacing = 3.2
    const startX = -((nodes.length - 1) * spacing) / 2

    nodes.forEach((node, idx) => {
      const x = startX + idx * spacing
      const y = 2

      // 3D Large Glowing Node Sphere
      const sphereGeo = new THREE.SphereGeometry(1.05, 32, 32)
      const isReversed = state.reversedEdges?.includes(idx)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isReversed ? 0x10b981 : 0x6366f1,
        roughness: 0.25,
        metalness: 0.8,
        emissive: isReversed ? 0x059669 : 0x4f46e5,
        emissiveIntensity: 0.55,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(x, y, 0)
      group.add(sphere)

      // Value label with dark rounded pill background
      const valSprite = createTextSprite(String(node.val), '#ffffff', 32, 'rgba(15,23,42,0.9)')
      valSprite.position.set(x, y, 1.2)
      group.add(valSprite)

      // Memory Address label
      const addrSprite = createTextSprite(`0x${(1000 + idx * 8).toString(16)}`, '#38bdf8', 22, 'rgba(15,23,42,0.8)')
      addrSprite.position.set(x, y - 1.5, 0)
      group.add(addrSprite)

      // Pointer Arrow Tube to Next Node (thicker glowing cyan forward)
      if (node.nextId !== null && idx < nodes.length - 1 && !isReversed) {
        const nextX = startX + (idx + 1) * spacing
        const arrowLength = spacing - 2.1
        const cylinderGeo = new THREE.CylinderGeometry(0.12, 0.12, arrowLength, 16)
        cylinderGeo.rotateZ(Math.PI / 2)
        const cylinderMat = new THREE.MeshStandardMaterial({
          color: 0x00f5ff,
          emissive: 0x00f5ff,
          emissiveIntensity: 0.8,
        })
        const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat)
        cylinder.position.set(x + 1.05 + arrowLength / 2, y + (state.isDoubly ? 0.35 : 0), 0)
        group.add(cylinder)

        // Arrow head cone
        const headGeo = new THREE.ConeGeometry(0.28, 0.55, 16)
        headGeo.rotateZ(-Math.PI / 2)
        const headMat = new THREE.MeshStandardMaterial({
          color: 0x00f5ff,
          emissive: 0x00f5ff,
          emissiveIntensity: 0.8,
        })
        const head = new THREE.Mesh(headGeo, headMat)
        head.position.set(nextX - 1.05, y + (state.isDoubly ? 0.35 : 0), 0)
        group.add(head)
      } else if (isReversed && idx > 0) {
        // Reversed curved laser pointing backwards
        const prevX = startX + (idx - 1) * spacing
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(x - 0.8, y, 0),
          new THREE.Vector3((x + prevX) / 2, y + 1.2, 0),
          new THREE.Vector3(prevX + 0.8, y, 0)
        )
        const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.08, 8, false)
        const tubeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.6 })
        const tube = new THREE.Mesh(tubeGeo, tubeMat)
        group.add(tube)
      }

      // If Doubly Linked List, render backward PREV arrow (magenta backward)
      if (state.isDoubly && idx > 0) {
        const prevX = startX + (idx - 1) * spacing
        const arrowLength = spacing - 1.6
        const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, arrowLength, 16)
        cylGeo.rotateZ(Math.PI / 2)
        const cylMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.5 })
        const cyl = new THREE.Mesh(cylGeo, cylMat)
        cyl.position.set(prevX + 0.8 + arrowLength / 2, y - 0.3, 0)
        group.add(cyl)

        // Arrow head pointing LEFT to prev
        const headGeo = new THREE.ConeGeometry(0.2, 0.4, 16)
        headGeo.rotateZ(Math.PI / 2)
        const headMat = new THREE.MeshStandardMaterial({ color: 0xec4899 })
        const head = new THREE.Mesh(headGeo, headMat)
        head.position.set(prevX + 0.8, y - 0.3, 0)
        group.add(head)
      }

      // Circular link from tail back to head
      if (state.isCircular && idx === nodes.length - 1 && nodes.length > 1) {
        const headX = startX
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(x + 0.8, y, 0),
          new THREE.Vector3((x + headX) / 2, y - 2.4, 0),
          new THREE.Vector3(headX - 0.8, y, 0)
        )
        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.08, 8, false)
        const tubeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.6 })
        const tube = new THREE.Mesh(tubeGeo, tubeMat)
        group.add(tube)

        const loopBadge = createTextSprite('↺ Circular (Tail.next -> Head)', '#38bdf8', 22)
        loopBadge.position.set((x + headX) / 2, y - 2.9, 0)
        group.add(loopBadge)
      }
    })

    // Pointer Badges (head, curr, prev)
    pointers.forEach((p) => {
      if (p.nodeId === null || p.nodeId === undefined) return
      const x = startX + p.nodeId * spacing
      const badge = createTextSprite(p.name, p.color || '#ec4899', 28)
      badge.position.set(x, 4.0, 0)
      badge.userData = { isPointer: true, baseY: 4.0, offset: 0 }
      group.add(badge)
    })
  }

  // 3. Render Stack (Vertical Hopper)
  const renderStack = (group, state) => {
    const rawStack = state.stack || state.data || state.array || [10, 20, 30]
    const stack = (Array.isArray(rawStack) ? rawStack : [10, 20, 30]).map((item) =>
      typeof item === 'object' && item !== null && 'val' in item ? item : { val: item }
    )
    const array = state.array || state.inputArray || []
    const highlightIndex = state.highlightIndex

    // Transparent Glass Cylinder Hopper
    const glassGeo = new THREE.CylinderGeometry(1.6, 1.6, 8, 32, 1, true)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.5,
    })
    const glass = new THREE.Mesh(glassGeo, glassMat)
    glass.position.set(4, 4, 0)
    group.add(glass)

    // Stack Base Plate
    const baseGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.4, 32)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
    const base = new THREE.Mesh(baseGeo, baseMat)
    base.position.set(4, 0.2, 0)
    group.add(base)

    // Stack Discs
    stack.forEach((item, idx) => {
      const discGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.6, 32)
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.3,
      })
      const disc = new THREE.Mesh(discGeo, discMat)
      const yPos = 0.8 + idx * 0.8
      disc.position.set(4, yPos, 0)
      group.add(disc)

      const label = createTextSprite(String(item.val), '#ffffff', 32)
      label.position.set(4, yPos, 1.4)
      group.add(label)
    })

    // Top indicator
    if (stack.length > 0) {
      const topBadge = createTextSprite('TOP', '#38bdf8', 26)
      topBadge.position.set(4, 0.8 + stack.length * 0.8 + 0.6, 0)
      group.add(topBadge)
    }

    // Input Array on the left
    const startX = -8
    array.forEach((val, idx) => {
      const x = startX + idx * 1.4
      const isHi = idx === highlightIndex
      const boxGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0)
      const boxMat = new THREE.MeshStandardMaterial({
        color: isHi ? 0xf59e0b : 0x334155,
        emissive: isHi ? 0xf59e0b : 0x000000,
        emissiveIntensity: isHi ? 0.5 : 0,
      })
      const mesh = new THREE.Mesh(boxGeo, boxMat)
      mesh.position.set(x, 1, 0)
      group.add(mesh)

      const sp = createTextSprite(String(val), '#ffffff', 30)
      sp.position.set(x, 1, 0.7)
      group.add(sp)
    })
  }

  // 4. Render Queue (Horizontal Pipe)
  const renderQueue = (group, state) => {
    const rawQueue = state.queue || state.data || state.array || [10, 20, 30, 40]
    const queue = (Array.isArray(rawQueue) ? rawQueue : [10, 20, 30, 40]).map((item) =>
      typeof item === 'object' && item !== null && 'val' in item ? item.val : item
    )
    const spacing = 1.8
    const startX = -((queue.length - 1) * spacing) / 2

    // Entry / Exit conduits
    const pipeGeo = new THREE.CylinderGeometry(1.2, 1.2, (queue.length + 2) * spacing, 32, 1, true)
    pipeGeo.rotateZ(Math.PI / 2)
    const pipeMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.2,
      roughness: 0.1,
    })
    const pipe = new THREE.Mesh(pipeGeo, pipeMat)
    pipe.position.set(0, 2, 0)
    group.add(pipe)

    queue.forEach((val, idx) => {
      const x = startX + idx * spacing
      const sphereGeo = new THREE.SphereGeometry(0.7, 32, 32)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0x22c55e : 0x6366f1,
        emissive: idx === 0 ? 0x16a34a : 0x4338ca,
        emissiveIntensity: 0.4,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(x, 2, 0)
      group.add(sphere)

      const label = createTextSprite(String(val), '#ffffff', 30)
      label.position.set(x, 2, 0.8)
      group.add(label)
    })

    // FRONT / REAR Markers
    if (queue.length > 0) {
      const frontBadge = createTextSprite('FRONT (OUT)', '#22c55e', 24)
      frontBadge.position.set(startX, 3.6, 0)
      group.add(frontBadge)

      const rearBadge = createTextSprite('REAR (IN)', '#38bdf8', 24)
      rearBadge.position.set(startX + (queue.length - 1) * spacing, 3.6, 0)
      group.add(rearBadge)
    }
  }

  // 5. Render Binary / AVL Tree
  const renderTree = (group, state) => {
    let tree = state.tree || state.nodes || [
      { id: 1, val: 1, left: 2, right: 3, x: 0, y: 5, z: 0 },
      { id: 2, val: 2, left: 4, right: 5, x: -3.5, y: 3, z: 0 },
      { id: 3, val: 3, left: 6, right: 7, x: 3.5, y: 3, z: 0 },
      { id: 4, val: 4, left: null, right: null, x: -5, y: 1, z: 0 },
      { id: 5, val: 5, left: null, right: null, x: -2, y: 1, z: 0 },
      { id: 6, val: 6, left: null, right: null, x: 2, y: 1, z: 0 },
      { id: 7, val: 7, left: null, right: null, x: 5, y: 1, z: 0 },
    ]

    // If tree is array of numbers, construct balanced tree coordinates
    if (tree.length > 0 && typeof tree[0] !== 'object') {
      const coords = [
        { x: 0, y: 5, z: 0 },
        { x: -3.5, y: 3, z: 0 },
        { x: 3.5, y: 3, z: 0 },
        { x: -5, y: 1, z: 0 },
        { x: -2, y: 1, z: 0 },
        { x: 2, y: 1, z: 0 },
        { x: 5, y: 1, z: 0 },
      ]
      tree = tree.map((val, idx) => ({
        id: idx + 1,
        val,
        x: coords[idx]?.x || (idx - 3) * 2,
        y: coords[idx]?.y || 1,
        z: 0,
        left: 2 * (idx + 1) <= tree.length ? 2 * (idx + 1) : null,
        right: 2 * (idx + 1) + 1 <= tree.length ? 2 * (idx + 1) + 1 : null,
      }))
    } else if (state.edges && Array.isArray(state.edges)) {
      // Connect nodes via edges
      const edgeMap = {}
      state.edges.forEach((e) => {
        const from = e.from !== undefined ? e.from : e[0]
        const to = e.to !== undefined ? e.to : e[1]
        if (!edgeMap[from]) edgeMap[from] = []
        edgeMap[from].push(to)
      })
      tree = tree.map((n) => {
        const children = edgeMap[n.id] || []
        return {
          ...n,
          left: n.left !== undefined ? n.left : children[0] || null,
          right: n.right !== undefined ? n.right : children[1] || null,
        }
      })
    }

    const activeNodeId = state.activeNodeId
    const visitedNodeIds = state.visitedNodeIds || []

    // Node lookup map
    const nodeMap = new Map()
    tree.forEach((n) => nodeMap.set(n.id, n))

    tree.forEach((node) => {
      const isActive = node.id === activeNodeId
      const isVisited = visitedNodeIds.includes(node.id)

      // Node Sphere
      const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isActive ? 0xf59e0b : isVisited ? 0x10b981 : 0x6366f1,
        roughness: 0.2,
        metalness: 0.7,
        emissive: isActive ? 0xf59e0b : isVisited ? 0x059669 : 0x312e81,
        emissiveIntensity: isActive ? 0.6 : 0.2,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(node.x, node.y, node.z)
      sphere.castShadow = true
      group.add(sphere)

      // Value label
      const label = createTextSprite(String(node.val), '#ffffff', 32)
      label.position.set(node.x, node.y, node.z + 0.9)
      group.add(label)

      // Connectors to left/right children
      ;[node.left, node.right].forEach((childId) => {
        if (!childId || !nodeMap.has(childId)) return
        const child = nodeMap.get(childId)

        const start = new THREE.Vector3(node.x, node.y, node.z)
        const end = new THREE.Vector3(child.x, child.y, child.z)
        const dist = start.distanceTo(end)
        const cylGeo = new THREE.CylinderGeometry(0.06, 0.06, dist, 16)
        const cylMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
        const cyl = new THREE.Mesh(cylGeo, cylMat)

        cyl.position.copy(start.clone().add(end).multiplyScalar(0.5))
        cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize())
        group.add(cyl)
      })
    })
  }

  // 6. Render Heap (3D complete binary tree)
  const renderHeap = (group, state) => {
    const heap = state.heapArray || state.heap || state.data || state.array || [10, 5, 3, 4, 1]
    const active = state.activeIndices || []

    const coords = [
      { x: 0, y: 5 },
      { x: -3, y: 3 },
      { x: 3, y: 3 },
      { x: -4.5, y: 1 },
      { x: -1.5, y: 1 },
      { x: 1.5, y: 1 },
      { x: 4.5, y: 1 },
    ]

    heap.forEach((val, idx) => {
      if (idx >= coords.length) return
      const { x, y } = coords[idx]
      const isAct = active.includes(idx)

      const sphereGeo = new THREE.SphereGeometry(0.75, 32, 32)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isAct ? 0xf59e0b : 0x8b5cf6,
        emissive: isAct ? 0xf59e0b : 0x6d28d9,
        emissiveIntensity: isAct ? 0.6 : 0.2,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(x, y, 0)
      group.add(sphere)

      const label = createTextSprite(String(val), '#ffffff', 32)
      label.position.set(x, y, 0.8)
      group.add(label)

      // Connect to parent
      if (idx > 0) {
        const pIdx = Math.floor((idx - 1) / 2)
        const pCoord = coords[pIdx]
        const start = new THREE.Vector3(pCoord.x, pCoord.y, 0)
        const end = new THREE.Vector3(x, y, 0)
        const dist = start.distanceTo(end)
        const rod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, dist, 12),
          new THREE.MeshStandardMaterial({ color: 0x64748b })
        )
        rod.position.copy(start.clone().add(end).multiplyScalar(0.5))
        rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize())
        group.add(rod)
      }
    })
  }

  // 7. Render Graph (3D Spatial Nodes & Edges)
  const renderGraph = (group, state) => {
    let rawNodes = state.nodes || [0, 1, 2, 3, 4, 5]
    const nodes = rawNodes.map((n) => (typeof n === 'object' && n !== null && n.id !== undefined ? n.id : n))
    let rawEdges = state.edges || []
    const edges = rawEdges.map((e) => {
      if (Array.isArray(e)) return e
      if (typeof e === 'object' && e !== null) return [e.from, e.to]
      return [0, 1]
    })
    const visited = state.visitedNodes || []
    const active = state.activeNode || state.activeNodeId

    const radius = 6
    const nodeCoords = {}

    nodes.forEach((nodeId, idx) => {
      const angle = (idx / nodes.length) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = idx % 2 === 0 ? 2 : 3
      nodeCoords[nodeId] = { x, y, z }

      const isVis = visited.includes(nodeId)
      const isAct = nodeId === active

      const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isAct ? 0xf59e0b : isVis ? 0x10b981 : 0x3b82f6,
        emissive: isAct ? 0xf59e0b : isVis ? 0x059669 : 0x1d4ed8,
        emissiveIntensity: isAct ? 0.7 : 0.3,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(x, y, z)
      group.add(sphere)

      const label = createTextSprite(String(nodeId), '#ffffff', 32)
      label.position.set(x, y + 1.2, z)
      group.add(label)
    })

    // Draw Edges
    edges.forEach(([u, v]) => {
      const p1 = nodeCoords[u]
      const p2 = nodeCoords[v]
      if (!p1 || !p2) return

      const start = new THREE.Vector3(p1.x, p1.y, p1.z)
      const end = new THREE.Vector3(p2.x, p2.y, p2.z)
      const dist = start.distanceTo(end)

      const isEdgeActive =
        state.activeEdges?.some(([a, b]) => (a === u && b === v) || (a === v && b === u))

      const cylGeo = new THREE.CylinderGeometry(0.06, 0.06, dist, 12)
      const cylMat = new THREE.MeshStandardMaterial({
        color: isEdgeActive ? 0x06b6d4 : 0x334155,
        emissive: isEdgeActive ? 0x06b6d4 : 0x000000,
        emissiveIntensity: isEdgeActive ? 0.8 : 0,
      })
      const cyl = new THREE.Mesh(cylGeo, cylMat)
      cyl.position.copy(start.clone().add(end).multiplyScalar(0.5))
      cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize())
      group.add(cyl)
    })
  }

  // 8. Render Dynamic Programming 3D Grid / 2D Matrix
  const renderDpGrid = (group, state) => {
    const table = state.table || state.matrix || [
      [10, 20, 30],
      [40, 50, 60],
      [70, 80, 90],
    ]
    let activeCell = state.activeCell || [0, 0]
    if (typeof activeCell === 'object' && !Array.isArray(activeCell)) {
      activeCell = [activeCell.r !== undefined ? activeCell.r : 0, activeCell.c !== undefined ? activeCell.c : 0]
    }
    const depCells = state.highlightDepCells || []

    const rows = table.length
    const cols = table[0]?.length || 1
    const spacing = 1.8
    const startX = -((cols - 1) * spacing) / 2
    const startZ = -((rows - 1) * spacing) / 2

    const flatVals = table.flat().map((v) => Math.abs(Number(v) || 1))
    const maxVal = Math.max(...flatVals, 1)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = table[r][c]
        const numVal = Math.abs(Number(val) || 0)
        const height = Math.max(0.6, (numVal / maxVal) * 3.5 + 0.6)
        const x = startX + c * spacing
        const z = startZ + r * spacing

        const isAct = activeCell[0] === r && activeCell[1] === c
        const isDep = depCells.some(([dr, dc]) => dr === r && dc === c)

        const pillarGeo = new THREE.BoxGeometry(1.3, height, 1.3)
        const pillarMat = new THREE.MeshStandardMaterial({
          color: isAct ? 0xf59e0b : isDep ? 0x06b6d4 : 0x6366f1,
          metalness: 0.6,
          roughness: 0.3,
          emissive: isAct ? 0xf59e0b : isDep ? 0x0891b2 : 0x312e81,
          emissiveIntensity: isAct ? 0.6 : isDep ? 0.4 : 0.15,
        })
        const mesh = new THREE.Mesh(pillarGeo, pillarMat)
        mesh.position.set(x, height / 2, z)
        mesh.castShadow = true
        mesh.receiveShadow = true
        group.add(mesh)

        const label = createTextSprite(String(val), '#ffffff', 28)
        label.position.set(x, height + 0.5, z)
        group.add(label)

        const coordLabel = createTextSprite(`[${r}][${c}]`, isAct ? '#fbbf24' : '#94a3b8', 20)
        coordLabel.position.set(x, 0.1, z + 0.8)
        group.add(coordLabel)
      }
    }
  }

  return (
    <div className="relative w-full h-full min-h-[420px] bg-base/80 rounded-2xl overflow-hidden border border-border-subtle shadow-2xl flex flex-col">
      {/* Top Floating View HUD Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border-subtle shadow-md pointer-events-auto">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            3D WebGL Scene
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-accent/15 text-accent-light text-[10px] font-mono font-bold">
            Hardware Accelerated
          </span>
        </div>

        {/* Camera Angle Presets & Controls */}
        <div className="flex items-center gap-1.5 bg-surface/80 backdrop-blur-md p-1 rounded-xl border border-border-subtle shadow-md pointer-events-auto">
          <button
            onClick={() => setCameraPreset('perspective')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              cameraPreset === 'perspective' ? 'bg-accent text-white shadow' : 'text-text-secondary hover:text-text-primary'
            }`}
            title="Perspective View"
          >
            Perspective
          </button>
          <button
            onClick={() => setCameraPreset('isometric')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              cameraPreset === 'isometric' ? 'bg-accent text-white shadow' : 'text-text-secondary hover:text-text-primary'
            }`}
            title="Isometric 3D View"
          >
            Isometric
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              cameraPreset === 'top' ? 'bg-accent text-white shadow' : 'text-text-secondary hover:text-text-primary'
            }`}
            title="Top-Down Plan View"
          >
            Top-Down
          </button>
          <button
            onClick={() => {
              setCameraPreset('perspective')
              controlsRef.current?.reset()
            }}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
            title="Reset Camera Orientation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Canvas Container */}
      <div ref={containerRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Bottom Floating Interaction Hint */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <div className="bg-surface/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-border-subtle text-[11px] text-text-muted flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-accent" />
          <span>Left-click + drag to rotate • Right-click to pan • Scroll to zoom</span>
        </div>
      </div>
    </div>
  )
}
