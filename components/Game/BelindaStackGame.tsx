
import React, { useState, useRef, useEffect, forwardRef, memo, useMemo } from 'react';
// Added ThreeElements import to help with JSX intrinsic elements types and OrthographicCamera from drei
import { Canvas, useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GAME_CONFIG } from '../../constants';
import { sounds as gameSounds } from '../../services/SoundService';
import { createTopTexture, createSideTexture } from './TextureGen';

// Define three elements as capitalized components to avoid JSX intrinsic elements type errors
// This is a workaround when the environment's type-checker fails to recognize R3F's JSX namespace extensions.
const Mesh = 'mesh' as any;
const Group = 'group' as any;
const AmbientLight = 'ambientLight' as any;
const DirectionalLight = 'directionalLight' as any;
const PointLight = 'pointLight' as any;
const RingGeometry = 'ringGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;

// --- Types ---

interface BlockData {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  index: number;
  isPerfect?: boolean;
}

interface DebrisData {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
  rotation: [number, number, number];
  mass: number;
  createdAt: number;
}

interface WaveData {
  id: number;
  position: [number, number, number];
  color: string;
}

interface GameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number, prize: string | null) => void;
  gameState: 'idle' | 'playing' | 'ended';
  onGameStart: () => void;
}

// --- Background Color Logic ---

const BG_STAGES = [
    { score: 0, top: [214, 232, 245], bottom: [174, 217, 224] },
    { score: 5, top: [137, 247, 254], bottom: [102, 166, 255] },
    { score: 10, top: [250, 112, 154], bottom: [254, 225, 64] },
    { score: 20, top: [48, 207, 208], bottom: [51, 8, 103] },
    { score: 40, top: [15, 12, 41], bottom: [36, 36, 62] }
];

const interpolateColor = (color1: number[], color2: number[], factor: number) => {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
};

const getGradientForScore = (score: number) => {
    let startStage = BG_STAGES[0];
    let endStage = BG_STAGES[BG_STAGES.length - 1];

    for (let i = 0; i < BG_STAGES.length - 1; i++) {
        if (score >= BG_STAGES[i].score && score < BG_STAGES[i+1].score) {
            startStage = BG_STAGES[i];
            endStage = BG_STAGES[i+1];
            break;
        } else if (score >= BG_STAGES[BG_STAGES.length - 1].score) {
            startStage = BG_STAGES[BG_STAGES.length - 1];
            endStage = BG_STAGES[BG_STAGES.length - 1];
            break;
        }
    }

    let range = endStage.score - startStage.score;
    let progress = 0;
    if (range > 0) {
        progress = (score - startStage.score) / range;
    }
    
    progress = Math.max(0, Math.min(1, progress));

    const topColor = interpolateColor(startStage.top, endStage.top, progress);
    const bottomColor = interpolateColor(startStage.bottom, endStage.bottom, progress);

    return `linear-gradient(to bottom, ${topColor} 0%, ${bottomColor} 100%)`;
};

// --- Materials & Geometry ---

const boxGeo = new THREE.BoxGeometry(1, 1, 1);

const getBlockColor = (i: number) => {
  const palette = [
    '#48cfae', '#37bc9b', '#4fc1e9', '#3bafda',
    '#967adc', '#ac92ec', '#e9573f', '#f6bb42',
  ];
  return palette[i % palette.length];
};

// --- Physics Helpers ---

const checkAABBCollision = (pos1: number[], size1: number[], pos2: number[], size2: number[]) => {
  const half1 = [size1[0]/2, size1[1]/2, size1[2]/2];
  const half2 = [size2[0]/2, size2[1]/2, size2[2]/2];

  return (
    Math.abs(pos1[0] - pos2[0]) < (half1[0] + half2[0]) &&
    Math.abs(pos1[1] - pos2[1]) < (half1[1] + half2[1]) &&
    Math.abs(pos1[2] - pos2[2]) < (half1[2] + half2[2])
  );
};

// --- Components ---

// OPTIMIZATION: Using MeshLambertMaterial instead of Standard for performance
const BlockMesh = memo(({ data }: { data: BlockData }) => {
  const topTexture = useMemo(() => createTopTexture(data.size[0], data.size[2], data.color), [data.size, data.color]);
  const sideTexture = useMemo(() => createSideTexture(data.size[0], GAME_CONFIG.BOX_HEIGHT, data.color, "ЛАМБРОТИН"), [data.size, data.color]);
  
  const materials = useMemo(() => [
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
    new THREE.MeshLambertMaterial({ map: topTexture }),  
    new THREE.MeshLambertMaterial({ color: data.color }), 
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
  ], [sideTexture, topTexture, data.color]);

  return (
    // Explicitly using Three.js elements through React Three Fiber via capitalized components to avoid JSX intrinsic elements type errors
    <Mesh 
      position={data.position} 
      geometry={boxGeo} 
      material={materials}
      scale={[data.size[0], GAME_CONFIG.BOX_HEIGHT, data.size[2]]}
      // castShadow // Disabled for performance
      // receiveShadow // Disabled for performance
    />
  );
});

const DebrisBox = memo(({ data, stack }: { data: DebrisData, stack: BlockData[] }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const pos = useRef(new THREE.Vector3(...data.position));
  const rot = useRef(new THREE.Euler(...data.rotation));
  const vel = useRef(new THREE.Vector3(...data.velocity));
  const angVel = useRef(new THREE.Vector3(...data.angularVelocity));
  const active = useRef(true);
  
  const topTexture = useMemo(() => createTopTexture(data.size[0], data.size[2], data.color), [data.size, data.color]);
  const sideTexture = useMemo(() => createSideTexture(data.size[0], GAME_CONFIG.BOX_HEIGHT, data.color, "ЛАМБРОТИН"), [data.size, data.color]);
  
  const materials = useMemo(() => [
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
    new THREE.MeshLambertMaterial({ map: topTexture }), 
    new THREE.MeshLambertMaterial({ color: data.color }), 
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
  ], [sideTexture, topTexture, data.color]);

  useFrame((_, delta) => {
    if (!meshRef.current || !active.current) return;
    
    // Optimization: Stop simulating if far below
    if (pos.current.y < -20) {
        active.current = false;
        meshRef.current.visible = false;
        return;
    }

    const gravity = -25;
    vel.current.y += gravity * delta;
    pos.current.add(vel.current.clone().multiplyScalar(delta));
    rot.current.x += angVel.current.x * delta;
    rot.current.y += angVel.current.y * delta;
    rot.current.z += angVel.current.z * delta;

    for (let i = stack.length - 1; i >= Math.max(0, stack.length - 6); i--) {
        const block = stack[i];
        if (checkAABBCollision(
            [pos.current.x, pos.current.y, pos.current.z], data.size,
            block.position, block.size
        )) {
            const overlapY = (block.position[1] + GAME_CONFIG.BOX_HEIGHT/2) - (pos.current.y - GAME_CONFIG.BOX_HEIGHT/2);
            if (overlapY > 0 && vel.current.y < 0) {
                pos.current.y += overlapY * 0.5;
                vel.current.y *= -0.4;
                vel.current.x += (pos.current.x - block.position[0]) * 5;
                vel.current.z += (pos.current.z - block.position[2]) * 5;
                angVel.current.x += (Math.random() - 0.5) * 10;
                angVel.current.z += (Math.random() - 0.5) * 10;
            }
        }
    }

    meshRef.current.position.copy(pos.current);
    meshRef.current.rotation.copy(rot.current);
  });

  return (
    // Explicitly using Three.js elements through React Three Fiber via capitalized components to avoid JSX intrinsic elements type errors
    <Mesh 
      ref={meshRef} 
      geometry={boxGeo} 
      material={materials}
      scale={[data.size[0], GAME_CONFIG.BOX_HEIGHT, data.size[2]]}
      // castShadow // Disabled for performance
    />
  );
});

const Wave = memo(({ data }: { data: WaveData }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const speed = 4.0;
    meshRef.current.scale.x += delta * speed;
    meshRef.current.scale.y += delta * speed;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity -= delta * 1.2;
    if (mat.opacity < 0) mat.opacity = 0;
  });

  return (
    // Explicitly using Three.js elements through React Three Fiber via capitalized components to avoid JSX intrinsic elements type errors
    <Mesh ref={meshRef} position={data.position} rotation={[-Math.PI / 2, 0, 0]}>
      <RingGeometry args={[1.0, 1.2, 32]} />
      <MeshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
    </Mesh>
  );
});

const ActiveBox = forwardRef<THREE.Vector3, { data: BlockData, direction: 'x' | 'z', moveSpeed: number, limit: number }>((props, ref) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const time = useRef(Math.PI / 2);
  
  const topTexture = useMemo(() => createTopTexture(props.data.size[0], props.data.size[2], props.data.color), [props.data.size, props.data.color]);
  const sideTexture = useMemo(() => createSideTexture(props.data.size[0], GAME_CONFIG.BOX_HEIGHT, props.data.color, "ЛАМБРОТИН"), [props.data.size, props.data.color]);
  
  const materials = useMemo(() => [
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
    new THREE.MeshLambertMaterial({ map: topTexture }), 
    new THREE.MeshLambertMaterial({ color: props.data.color }), 
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
    new THREE.MeshLambertMaterial({ map: sideTexture }), 
  ], [sideTexture, topTexture, props.data.color]); // Fixed: use props.data.color instead of data.color

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta * props.moveSpeed;
    const offset = Math.sin(time.current) * props.limit;
    
    const x = props.direction === 'x' ? props.data.position[0] + offset : props.data.position[0];
    const z = props.direction === 'z' ? props.data.position[2] + offset : props.data.position[2];
    
    meshRef.current.position.set(x, props.data.position[1], z);
    
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.set(x, props.data.position[1], z);
    }
  });

  return (
    // Explicitly using Three.js elements through React Three Fiber via capitalized components to avoid JSX intrinsic elements type errors
    <Mesh 
      ref={meshRef} 
      position={props.data.position} 
      geometry={boxGeo} 
      material={materials}
      scale={[props.data.size[0], GAME_CONFIG.BOX_HEIGHT, props.data.size[2]]}
      // castShadow // Disabled
    />
  );
});

const GameScene = ({ onGameOver, onScoreUpdate, gameState, triggerClick }: GameProps & { triggerClick: React.MutableRefObject<() => void> }) => {
  const [stack, setStack] = useState<BlockData[]>([]);
  const [debris, setDebris] = useState<DebrisData[]>([]);
  const [waves, setWaves] = useState<WaveData[]>([]);
  const [activeConfig, setActiveConfig] = useState<{ data: BlockData; direction: 'x' | 'z'; limit: number; moveSpeed: number; } | null>(null);
  
  const activePosRef = useRef(new THREE.Vector3()); 
  const scoreRef = useRef(0);
  const camLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  const initGame = () => {
    scoreRef.current = 0;
    setDebris([]);
    setWaves([]);
    const base: BlockData = { 
      position: [0, 0, 0], 
      size: [GAME_CONFIG.INITIAL_SIZE, GAME_CONFIG.BOX_HEIGHT, GAME_CONFIG.INITIAL_SIZE], 
      color: getBlockColor(0), 
      index: 0 
    };
    setStack([base]);
    spawnNext(base);
    updateBG(0);
  };

  const updateBG = (score: number) => {
    const bgEl = document.getElementById('game-background');
    if (!bgEl) return;
    bgEl.style.background = getGradientForScore(score);
  };

  useEffect(() => { 
      if (gameState === 'idle') initGame(); 
      if (gameState === 'playing') updateBG(scoreRef.current);
  }, [gameState]);

  const spawnNext = (prev: BlockData) => {
    const idx = prev.index + 1;
    const dir = idx % 2 === 0 ? 'x' : 'z';
    
    // Changed speed increment to every 4 blocks (idx / 4)
    const speedStep = Math.floor(idx / 4);
    let currentSpeed = GAME_CONFIG.BASE_SPEED + (speedStep * GAME_CONFIG.BASE_SPEED_INCREMENT);
    
    if (currentSpeed > GAME_CONFIG.MAX_SPEED) {
        currentSpeed = GAME_CONFIG.MAX_SPEED;
    }
    
    setActiveConfig({ 
      data: { position: [prev.position[0], prev.position[1] + GAME_CONFIG.BOX_HEIGHT, prev.position[2]], size: [...prev.size], color: getBlockColor(idx), index: idx },
      direction: dir, 
      limit: 5.2, 
      moveSpeed: currentSpeed * 65 
    });
  };

  const handleClick = () => {
    if (gameState !== 'playing' || !activeConfig) return;
    
    const current = activePosRef.current.clone();
    const prev = stack[stack.length - 1];
    const axis = activeConfig.direction === 'x' ? 0 : 2;
    const delta = current.getComponent(axis) - prev.position[axis];
    const overhang = Math.abs(delta);
    const size = prev.size[axis];

    if (overhang >= size) {
      gameSounds.playGameOver();
      onGameOver(scoreRef.current);
      return;
    }

    const isPerfect = overhang < 0.15;
    let finalDelta = isPerfect ? 0 : delta;
    let overlap = size - Math.abs(finalDelta);
    let newSize = [...prev.size] as [number, number, number];
    
    const newPos = [prev.position[0], prev.position[1] + GAME_CONFIG.BOX_HEIGHT, prev.position[2]] as [number, number, number];
    newPos[axis] = prev.position[axis] + (finalDelta / 2);

    if (isPerfect) {
      gameSounds.playPerfect();
      setWaves(w => [...w.slice(-5), {
        id: Math.random(),
        position: [newPos[0], newPos[1] - GAME_CONFIG.BOX_HEIGHT / 2, newPos[2]],
        color: activeConfig.data.color
      }]);
    } else {
      gameSounds.playLanding(scoreRef.current);
      setDebris(d => {
        const dSize = [...prev.size] as [number, number, number];
        dSize[axis] = overhang;
        const dPos = [current.x, current.y, current.z] as [number, number, number];
        const sign = Math.sign(delta);
        const centerOffset = (size / 2) + (overhang / 2); 
        dPos[axis] = prev.position[axis] + (sign * centerOffset);
        
        // OPTIMIZATION: Reduce Debris count from 15 to 8
        return [...d.slice(-8), { 
          id: Math.random(), 
          position: dPos, 
          size: dSize, 
          color: activeConfig.data.color, 
          velocity: [
              axis === 0 ? sign * 3 : (Math.random()-0.5), 
              5, 
              axis === 2 ? sign * 3 : (Math.random()-0.5)
          ], 
          angularVelocity: [Math.random()*5, Math.random()*5, Math.random()*5],
          rotation: [0, 0, 0],
          mass: 1,
          createdAt: Date.now()
        }];
      });
    }

    newSize[axis] = overlap;
    
    if (newSize[axis] < 0.1) {
      gameSounds.playGameOver();
      onGameOver(scoreRef.current);
      return;
    }

    const landed: BlockData = { 
      position: newPos, 
      size: newSize, 
      color: activeConfig.data.color, 
      index: activeConfig.data.index,
      isPerfect: isPerfect
    };
    
    setStack(s => [...s, landed]);
    scoreRef.current++;
    updateBG(scoreRef.current);
    onScoreUpdate(scoreRef.current, null);
    spawnNext(landed);
  };

  triggerClick.current = handleClick;

  useFrame((state) => {
    const totalHeight = stack.length * GAME_CONFIG.BOX_HEIGHT;
    
    if (gameState === 'ended') {
      const radius = 30;
      const angle = state.clock.getElapsedTime() * 0.2;
      state.camera.position.x = Math.sin(angle) * radius;
      state.camera.position.z = Math.cos(angle) * radius;
      state.camera.position.y = totalHeight / 2 + 10;
      state.camera.lookAt(0, totalHeight / 2, 0);
      return;
    }

    const targetY = totalHeight;
    state.camera.position.lerp(new THREE.Vector3(18, targetY + 10, 18), 0.05);
    // Adjusted lookAt to be lower (totalHeight - 1.5), which pushes the rendered stack higher on screen
    camLookAt.current.lerp(new THREE.Vector3(0, totalHeight - 1.5, 0), 0.05);
    state.camera.lookAt(camLookAt.current);
  });

  return (
    // Explicitly using Three.js elements through React Three Fiber via capitalized components to avoid JSX intrinsic elements type errors
    <Group>
      <AmbientLight intensity={0.9} />
      <DirectionalLight 
        position={[20, 30, 10]} 
        intensity={1.2} 
        // Disabled Shadows for optimization
        // castShadow 
        // shadow-mapSize={[1024, 1024]} 
      />
      <PointLight position={[-10, 10, -10]} intensity={0.4} color="#ffffff" />
      <Group>
          {stack.map(b => <BlockMesh key={b.index} data={b} />)}
      </Group>
      {debris.map(d => <DebrisBox key={d.id} data={d} stack={stack} />)}
      {waves.map(w => <Wave key={w.id} data={w} />)}
      {activeConfig && gameState === 'playing' && (
        <ActiveBox ref={activePosRef} data={activeConfig.data} direction={activeConfig.direction} moveSpeed={activeConfig.moveSpeed} limit={5.2} />
      )}
    </Group>
  );
};

export const BelindaStackGame = ({ onGameOver, onScoreUpdate, gameState, onGameStart }: GameProps) => {
  const triggerClickRef = useRef(() => {});
  
  return (
    <div className="w-full h-full touch-none" onPointerDown={(e) => { 
      if (gameState === 'idle') { 
        gameSounds.playStart(); 
        onGameStart(); 
      }
      triggerClickRef.current();
    }}>
      <Canvas 
        // shadows // Disabled shadows globally
        // OPTIMIZATION: Cap DPR at 1.5 to save battery/performance on high-res mobile
        dpr={[1, 1.5]}
        // OPTIMIZATION: Disable antialias (expensive on mobile)
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }} 
      >
        <OrthographicCamera makeDefault position={[18, 18, 18]} zoom={45} near={-50} far={200} />
        <GameScene onGameOver={onGameOver} onScoreUpdate={onScoreUpdate} onGameStart={onGameStart} triggerClick={triggerClickRef} gameState={gameState} />
      </Canvas>
    </div>
  );
};
