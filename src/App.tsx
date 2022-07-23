import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
  extend,
} from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

const whiteColor = new THREE.Color(0xffffff)
const lightColor = new THREE.Color(0x404040)

extend({ EffectComposer, RenderPass, UnrealBloomPass })

function Box(props: JSX.IntrinsicElements['mesh']) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<any>(null)
  const repeatX = 10
  const repeatY = 10

  const texture = useLoader(THREE.TextureLoader, '/8k_sun.jpg')

  useFrame(({ clock }) => {
    meshRef.current.rotation.y += 0.01
  })

  return (
    <mesh {...props} ref={meshRef}>
      <sphereGeometry args={[70]} attach="geometry" />
      <meshStandardMaterial
        ref={materialRef}
        roughness={0.2}
        metalness={0.5}
        map={texture}
      />
      <Controls />
    </mesh>
  )
}

function Controls() {
  const {
    camera,
    gl: { domElement },
  } = useThree()

  return (
    <OrbitControls
      args={[camera, domElement]}
      enableZoom={true}
      enablePan={false}
      enableRotate={true}
      zoomSpeed={0.6}
      rotateSpeed={0.4}
      minDistance={180}
      maxDistance={300}
    />
  )
}

function Main({ children }: { children: React.ReactNode }) {
  const scene = useRef<any>(null)
  const { gl, camera } = useThree()
  useFrame(() => {
    gl.autoClear = false
    gl.clearDepth()

    gl.render(scene.current, camera)
  }, 2)
  return <scene ref={scene}>{children}</scene>
}

function Bloom({ children }: { children: React.ReactNode }) {
  const { gl, camera, size } = useThree()
  const [scene, setScene] = useState<any>(undefined)
  const composer = useRef<any>(null)
  // const aspect = useMemo(
  //   () => new THREE.Vector2(size.width, size.height),
  //   [size]
  // )

  useEffect(
    () => void scene && composer.current.setSize(size.width, size.height),
    [size]
  )
  useFrame(() => scene && composer.current.render(), 1)

  return (
    <>
      <scene ref={setScene}>{children}</scene>
      <effectComposer ref={composer} args={[gl]}>
        <renderPass scene={scene} camera={camera} />
        <unrealBloomPass args={[undefined, 3, 1, 0]} />
      </effectComposer>
    </>
  )
}

function App() {
  return (
    <div className="App">
      <Canvas
        camera={{ position: [0, -300, 0], fov: 50 }}
        gl={{ toneMapping: THREE.ReinhardToneMapping }}
      >
        <Main>
          <ambientLight color={lightColor} intensity={3} />
          <pointLight />
          <Box position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <Stars
            radius={300}
            depth={60}
            count={9000}
            factor={9}
            saturation={0}
            fade={true}
          />
        </Main>

        <Bloom>
          <Suspense fallback="loading...">
            <ambientLight color={lightColor} intensity={3} />
            <pointLight />
            <Box position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />
            <Stars
              radius={300}
              depth={60}
              count={9000}
              factor={9}
              saturation={0}
              fade={true}
            />
          </Suspense>
        </Bloom>
      </Canvas>
    </div>
  )
}

export default App
