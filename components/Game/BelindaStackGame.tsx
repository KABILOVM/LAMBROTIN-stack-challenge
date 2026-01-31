
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
    const r = Math.round(color1[0] + factor * (color2[0] - color1[0]));
    const g = Math.round(color1[1] + factor * (color2[1] - color1[1]));
    const b = Math.round(color1[2] + factor * (color2[2] - color1[2]));
    return `rgb(${r},${g},${b})`;
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

    const range = endStage.score - startStage.score;
    const progress = range > 0 ? (score - startStage.score) / range : 0;
    const clampedProgress = Math.max(0, Math.min(1, progress));

    const topColor = interpolateColor(startStage.top, endStage.top, clampedProgress);
    const bottomColor = interpolateColor(startStage.bottom, endStage.bottom, clampedProgress);

    return `linear-gradient(to bottom, ${topColor} 0%, ${bottomColor} 100%)`;
};

const boxGeo = new THREE.BoxGeometry(1, 1, 1);

const getBlockColor = (i: number) => {
  const palette = ['#48cfae', '#37bc9b', '#4fc1e9', '#3bafda', '#967adc', '#ac92ec', '#e9573f', '#f6bb42'];
  return palette[i % palette.length];
};

const BlockMesh = memo(({ data }: { data: BlockData }) => {
  const textures = useMemo(() => ({
    top: createTopTexture(data.size[0], data.size[2], data.color),
    side: createSideTexture(data.size[0], GAME_CONFIG.BOX_HEIGHT, data.color, "ЛАМБРОТИН")
  }), [data.size[0], data.size[2], data.color]);
  
  const materials = useMemo(() => [
    new THREE.MeshLambertMaterial({ map: textures.side }), 
    new THREE.MeshLambertMaterial({ map: textures.side }), 
    new THREE.MeshLambertMaterial({ map: textures.top }),  
    new THREE.MeshLambertMaterial({ color: data.color }), 
    new THREE.MeshLambertMaterial({ map: textures.side }), 
    new THREE.MeshLambertMaterial({ map: textures.side }), 
  ], [textures, data.color]);

  return (
    <mesh 
      position={data.position} 
      geometry={boxGeo} 
      material={materials}
      scale={[data.size[0], GAME_CONFIG.BOX_HEIGHT, data.size[2]]}
    />
  );
});

const DebrisBox = memo(({ data, onComplete }: { data: DebrisData, onComplete: (id: number) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const pos = useRef(new THREE.Vector3(...data.position));
  const vel = useRef(new THREE.Vector3(...data.velocity));
  const angVel = useRef(new THREE.Vector3(...data.angularVelocity));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    vel.current.y -= 25 * delta;
    pos.current.add(vel.current.clone().multiplyScalar(delta));
    meshRef.current.position.copy(pos.current);
    meshRef.current.rotation.x += angVel.current.x * delta;
    meshRef.current.rotation.y += angVel.current.y * delta;
    
    if (pos.current.y < -10) {
        onComplete(data.id);
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={boxGeo} 
      scale={[data.size[0], GAME_CONFIG.BOX_HEIGHT, data.size[2]]}
    >
      <meshStandardMaterial color={data.color} roughness={0.6} metalness={0.1} />
    </mesh>
  );
});

const Wave = memo(({ data }: { data: WaveData }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.scale.x += delta * 5;
    meshRef.current.scale.y += delta * 5;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity -= delta * 2;
  });

  return (
    <mesh position={data.position} rotation={[-Math.PI / 2, 0, 0]} ref={meshRef}>
      <ringGeometry args={[1, 1.1, 16]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </mesh>
  );
});

const ActiveBox = forwardRef<THREE.Vector3, { data: BlockData, direction: 'x' | 'z', moveSpeed: number, limit: number }>((props, ref) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const time = useRef(Math.PI / 2);
  
  const textures = useMemo(() => ({
    top: createTopTexture(props.data.size[0], props.data.size[2], props.data.color),
    side: createSideTexture(props.data.size[0], GAME_CONFIG.BOX_HEIGHT, props.data.color, "ЛАМБРОТИН")
  }), [props.data.size[0], props.data.size[2], props.data.color]);
  
  const materials = useMemo(() => [
    new THREE.MeshLambertMaterial({ map: textures.side }), 
    new THREE.MeshLambertMaterial({ map: textures.side }), 
    new THREE.MeshLambertMaterial({ map: textures.top }), 
    new THREE.MeshLambertMaterial({ color: props.data.color }), 
    new THREE.MeshLambertMaterial({ map: textures.side }), 
    new THREE.MeshLambertMaterial({ map: textures.side }), 
  ], [textures, props.data.color]); 

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta * props.moveSpeed;
    const offset = Math.sin(time.current) * props.limit;
    const x = props.direction === 'x' ? props.data.position[0] + offset : props.data.position[0];
    const z = props.direction === 'z' ? props.data.position[2] + offset : props.data.position[2];
    meshRef.current.position.set(x, props.data.position[1], z);
    if (ref && 'current' in ref && ref.current) {
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
  const lastBGUpdateScore = useRef(-1);
  
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
    updateBG(0, true);
  };

  const updateBG = (score: number, force = false) => {
    if (!force && score === lastBGUpdateScore.current) return;
    lastBGUpdateScore.current = score;
    const bgEl = document.getElementById('game-background');
    if (bgEl) bgEl.style.background = getGradientForScore(score);
  };

  useEffect(() => { 
      if (gameState === 'idle') initGame(); 
  }, [gameState]);

  const spawnNext = (prev: BlockData) => {
    const idx = prev.index + 1;
    const dir = idx % 2 === 0 ? 'x' : 'z';
    const speedStep = Math.floor(idx / 8);
    const currentSpeed = Math.min(GAME_CONFIG.MAX_SPEED, GAME_CONFIG.BASE_SPEED + (speedStep * GAME_CONFIG.BASE_SPEED_INCREMENT));
    
    setActiveConfig({ 
      data: { position: [prev.position[0], prev.position[1] + GAME_CONFIG.BOX_HEIGHT, prev.position[2]], size: [...prev.size], color: getBlockColor(idx), index: idx },
      direction: dir, 
      limit: 5.0, 
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

    const isPerfect = overhang < 0.12;
    const finalDelta = isPerfect ? 0 : delta;
    const overlap = size - Math.abs(finalDelta);
    
    const newSize = [...prev.size] as [number, number, number];
    const newPos = [prev.position[0], prev.position[1] + GAME_CONFIG.BOX_HEIGHT, prev.position[2]] as [number, number, number];
    newPos[axis] = prev.position[axis] + (finalDelta / 2);
    newSize[axis] = overlap;

    if (isPerfect) {
      gameSounds.playPerfect();
      setWaves(w => [...w.slice(-2), {
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
        dPos[axis] = prev.position[axis] + (sign * ((size / 2) + (overhang / 2)));
        
        return [...d.slice(-4), { 
          id: Math.random(), 
          position: dPos, 
          size: dSize, 
          color: activeConfig.data.color, 
          velocity: [axis === 0 ? sign * 3 : 0, 2, axis === 2 ? sign * 3 : 0], 
          angularVelocity: [Math.random()*4, Math.random()*4, 0],
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

  const removeDebris = (id: number) => {
      setDebris(prev => prev.filter(d => d.id !== id));
  };

  useFrame((state) => {
    const totalHeight = stack.length * GAME_CONFIG.BOX_HEIGHT;
    if (gameState === 'ended') {
      const angle = state.clock.getElapsedTime() * 0.2;
      state.camera.position.x = Math.sin(angle) * 22;
      state.camera.position.z = Math.cos(angle) * 22;
      state.camera.position.y = totalHeight / 2 + 8;
      state.camera.lookAt(0, totalHeight / 2, 0);
      return;
    }
    const targetCamY = totalHeight + 12;
    state.camera.position.lerp(new THREE.Vector3(14, targetCamY, 14), 0.08);
    camLookAt.current.lerp(new THREE.Vector3(0, totalHeight - 3, 0), 0.08);
    state.camera.lookAt(camLookAt.current);
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 15, 5]} intensity={1.2} />
      <group>
          {stack.map(b => <BlockMesh key={b.index} data={b} />)}
      </group>
      {debris.map(d => <DebrisBox key={d.id} data={d} onComplete={removeDebris} />)}
      {waves.map(w => <Wave key={w.id} data={w} />)}
      {activeConfig && gameState === 'playing' && (
        <ActiveBox ref={activePosRef} data={activeConfig.data} direction={activeConfig.direction} moveSpeed={activeConfig.moveSpeed} limit={5.0} />
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
        dpr={[1, 2]}
        camera={{ zoom: 40, position: [14, 14, 14], far: 1000, near: 0.1 }}
        gl={{ 
            antialias: true, 
            powerPreference: "high-performance",
            alpha: false
        }}
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
