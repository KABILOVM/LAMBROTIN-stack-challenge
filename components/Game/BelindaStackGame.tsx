
import React, { useState, useRef, useEffect, forwardRef, memo, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GAME_CONFIG } from '../../constants';
import { sounds as gameSounds } from '../../services/SoundService';
import { createTopTexture, createSideTexture } from './TextureGen';

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
        }
    }

    let range = endStage.score - startStage.score;
    let progress = range > 0 ? (score - startStage.score) / range : 0;
    progress = Math.max(0, Math.min(1, progress));

    const topColor = interpolateColor(startStage.top, endStage.top, progress);
    const bottomColor = interpolateColor(startStage.bottom, endStage.bottom, progress);

    return `linear-gradient(to bottom, ${topColor} 0%, ${bottomColor} 100%)`;
};

const boxGeo = new THREE.BoxGeometry(1, 1, 1);

const getBlockColor = (i: number) => {
  const palette = [
    '#48cfae', '#37bc9b', '#4fc1e9', '#3bafda',
    '#967adc', '#ac92ec', '#e9573f', '#f6bb42',
  ];
  return palette[i % palette.length];
};

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
    <mesh 
      position={data.position} 
      geometry={boxGeo} 
      material={materials}
      scale={[data.size[0], GAME_CONFIG.BOX_HEIGHT, data.size[2]]}
    />
  );
});

const DebrisBox = memo(({ data }: { data: DebrisData }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const pos = useRef(new THREE.Vector3(...data.position));
  const rot = useRef(new THREE.Euler(...data.rotation));
  const vel = useRef(new THREE.Vector3(...data.velocity));
  const angVel = useRef(new THREE.Vector3(...data.angularVelocity));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const gravity = -20;
    vel.current.y += gravity * delta;
    pos.current.add(vel.current.clone().multiplyScalar(delta));
    rot.current.x += angVel.current.x * delta;
    rot.current.y += angVel.current.y * delta;
    rot.current.z += angVel.current.z * delta;
    
    meshRef.current.position.copy(pos.current);
    meshRef.current.rotation.copy(rot.current);
    
    if (pos.current.y < -15) {
        meshRef.current.visible = false;
    }
  });

  const sideTexture = useMemo(() => createSideTexture(data.size[0], GAME_CONFIG.BOX_HEIGHT, data.color, ""), [data.size, data.color]);

  return (
    <mesh 
      ref={meshRef} 
      geometry={boxGeo} 
      scale={[data.size[0], GAME_CONFIG.BOX_HEIGHT, data.size[2]]}
    >
      <meshLambertMaterial color={data.color} map={sideTexture} />
    </mesh>
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
    mat.opacity -= delta * 1.5;
    if (mat.opacity < 0) mat.opacity = 0;
  });

  return (
    <mesh position={data.position} rotation={[-Math.PI / 2, 0, 0]} ref={meshRef}>
      <ringGeometry args={[1, 1.1, 32]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
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
  ], [sideTexture, topTexture, props.data.color]); 

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
    <mesh 
      ref={meshRef} 
      position={props.data.position} 
      geometry={boxGeo} 
      material={materials}
      scale={[props.data.size[0], GAME_CONFIG.BOX_HEIGHT, props.data.size[2]]}
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
    const speedStep = Math.floor(idx / 5);
    const currentSpeed = Math.min(GAME_CONFIG.MAX_SPEED, GAME_CONFIG.BASE_SPEED + (speedStep * GAME_CONFIG.BASE_SPEED_INCREMENT));
    
    setActiveConfig({ 
      data: { position: [prev.position[0], prev.position[1] + GAME_CONFIG.BOX_HEIGHT, prev.position[2]], size: [...prev.size], color: getBlockColor(idx), index: idx },
      direction: dir, 
      limit: 5.5, 
      moveSpeed: currentSpeed * 70 
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
    const finalDelta = isPerfect ? 0 : delta;
    const overlap = size - Math.abs(finalDelta);
    
    const newSize = [...prev.size] as [number, number, number];
    const newPos = [prev.position[0], prev.position[1] + GAME_CONFIG.BOX_HEIGHT, prev.position[2]] as [number, number, number];
    newPos[axis] = prev.position[axis] + (finalDelta / 2);
    newSize[axis] = overlap;

    if (isPerfect) {
      gameSounds.playPerfect();
      setWaves(w => [...w.slice(-5), {
        id: Math.random(),
        position: [newPos[0], newPos[1] - GAME_CONFIG.BOX_HEIGHT / 2, newPos[2]],
        color: activeConfig.data.color
      }]);
    } else {
      gameSounds.playLanding(scoreRef.current);
      // Spawn Debris
      setDebris(d => {
        const dSize = [...prev.size] as [number, number, number];
        dSize[axis] = overhang;
        const dPos = [current.x, current.y, current.z] as [number, number, number];
        const sign = Math.sign(delta);
        const centerOffset = (size / 2) + (overhang / 2); 
        dPos[axis] = prev.position[axis] + (sign * centerOffset);
        
        return [...d.slice(-10), { 
          id: Math.random(), 
          position: dPos, 
          size: dSize, 
          color: activeConfig.data.color, 
          velocity: [axis === 0 ? sign * 2 : (Math.random()-0.5), 2, axis === 2 ? sign * 2 : (Math.random()-0.5)], 
          angularVelocity: [Math.random()*5, Math.random()*5, Math.random()*5],
          rotation: [0, 0, 0]
        }];
      });
    }

    const landed: BlockData = { position: newPos, size: newSize, color: activeConfig.data.color, index: activeConfig.data.index, isPerfect };
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
      const radius = 25;
      const angle = state.clock.getElapsedTime() * 0.3;
      state.camera.position.x = Math.sin(angle) * radius;
      state.camera.position.z = Math.cos(angle) * radius;
      state.camera.position.y = totalHeight / 2 + 10;
      state.camera.lookAt(0, totalHeight / 2, 0);
      return;
    }
    const targetY = totalHeight;
    state.camera.position.lerp(new THREE.Vector3(15, targetY + 12, 15), 0.05);
    camLookAt.current.lerp(new THREE.Vector3(0, totalHeight - 2, 0), 0.05);
    state.camera.lookAt(camLookAt.current);
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      <group>
          {stack.map(b => <BlockMesh key={b.index} data={b} />)}
      </group>
      {debris.map(d => <DebrisBox key={d.id} data={d} />)}
      {waves.map(w => <Wave key={w.id} data={w} />)}
      {activeConfig && gameState === 'playing' && (
        <ActiveBox ref={activePosRef} data={activeConfig.data} direction={activeConfig.direction} moveSpeed={activeConfig.moveSpeed} limit={5.5} />
      )}
    </>
  );
};

export const BelindaStackGame = ({ onGameOver, onScoreUpdate, gameState, onGameStart }: GameProps) => {
  const triggerClickRef = useRef(() => {});
  return (
    <div className="w-full h-full" onClick={() => triggerClickRef.current()}>
      <Canvas 
        orthographic 
        camera={{ zoom: 45, position: [15, 15, 15], far: 1000, near: 0.1 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <GameScene 
            onGameOver={onGameOver} 
            onScoreUpdate={onScoreUpdate} 
            gameState={gameState} 
            onGameStart={onGameStart}
            triggerClick={triggerClickRef}
        />
      </Canvas>
    </div>
  );
};
