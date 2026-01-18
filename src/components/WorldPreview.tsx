'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './WorldPreview.module.css';

// ===================================
// Types
// ===================================

interface Block {
    x: number;
    y: number;
    z: number;
    type: string;
    color?: string;
}

interface WorldData {
    name?: string;
    blocks: Block[];
    spawnPoint?: { x: number; y: number; z: number };
}

interface WorldPreviewProps {
    shareCode?: string;
    worldData?: WorldData;
    height?: number;
    autoRotate?: boolean;
}

// ===================================
// Block Color Mapping
// ===================================

const BLOCK_COLORS: Record<string, string> = {
    // Terrain
    grass: '#4a9c4a',
    dirt: '#8b5a2b',
    stone: '#808080',
    sand: '#f4e4bc',
    water: '#3d9be9',
    snow: '#ffffff',
    ice: '#b3e5fc',

    // Woods
    oak_log: '#8b6914',
    oak_leaves: '#228b22',
    birch_log: '#d4c4a8',
    birch_leaves: '#7ccd7c',
    pine_log: '#654321',
    pine_leaves: '#2e5a2e',

    // Minerals
    coal: '#2a2a2a',
    iron: '#d4af7a',
    gold: '#ffd700',
    diamond: '#00ffff',
    emerald: '#50c878',

    // Building
    cobblestone: '#6e6e6e',
    brick: '#cb4154',
    planks: '#c19a6b',
    glass: '#b3e5fc',

    // Default
    default: '#888888',
};

function getBlockColor(type: string): string {
    return BLOCK_COLORS[type.toLowerCase()] || BLOCK_COLORS.default;
}

// ===================================
// Voxel Block Component
// ===================================

interface VoxelBlockProps {
    position: [number, number, number];
    color: string;
    size?: number;
}

function VoxelBlock({ position, color, size = 1 }: VoxelBlockProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    return (
        <mesh ref={meshRef} position={position}>
            <boxGeometry args={[size * 0.98, size * 0.98, size * 0.98]} />
            <meshStandardMaterial
                color={color}
                roughness={0.8}
                metalness={0.1}
            />
        </mesh>
    );
}

// ===================================
// World Scene Component
// ===================================

interface WorldSceneProps {
    blocks: Block[];
    autoRotate: boolean;
}

function WorldScene({ blocks, autoRotate }: WorldSceneProps) {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    // Calculate center and bounds
    const bounds = {
        minX: Infinity, maxX: -Infinity,
        minY: Infinity, maxY: -Infinity,
        minZ: Infinity, maxZ: -Infinity,
    };

    blocks.forEach(block => {
        bounds.minX = Math.min(bounds.minX, block.x);
        bounds.maxX = Math.max(bounds.maxX, block.x);
        bounds.minY = Math.min(bounds.minY, block.y);
        bounds.maxY = Math.max(bounds.maxY, block.y);
        bounds.minZ = Math.min(bounds.minZ, block.z);
        bounds.maxZ = Math.max(bounds.maxZ, block.z);
    });

    const center = {
        x: (bounds.minX + bounds.maxX) / 2,
        y: (bounds.minY + bounds.maxY) / 2,
        z: (bounds.minZ + bounds.maxZ) / 2,
    };

    const size = Math.max(
        bounds.maxX - bounds.minX,
        bounds.maxY - bounds.minY,
        bounds.maxZ - bounds.minZ
    );

    // Auto-rotate effect
    useFrame((state, delta) => {
        if (autoRotate && groupRef.current) {
            groupRef.current.rotation.y += delta * 0.1;
        }
    });

    // Adjust camera on mount
    useEffect(() => {
        const distance = size * 2;
        camera.position.set(distance, distance * 0.7, distance);
        camera.lookAt(center.x, center.y, center.z);
    }, [camera, center, size]);

    return (
        <group ref={groupRef} position={[-center.x, -center.y, -center.z]}>
            {blocks.map((block, index) => (
                <VoxelBlock
                    key={`${block.x}-${block.y}-${block.z}-${index}`}
                    position={[block.x, block.y, block.z]}
                    color={block.color || getBlockColor(block.type)}
                />
            ))}
        </group>
    );
}

// ===================================
// Loading Placeholder
// ===================================

function LoadingPlaceholder() {
    return (
        <Html center>
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Loading 3D Preview...</span>
            </div>
        </Html>
    );
}

// ===================================
// Demo World Generator
// ===================================

function generateDemoWorld(): Block[] {
    const blocks: Block[] = [];
    const size = 8;

    // Ground layer
    for (let x = -size; x <= size; x++) {
        for (let z = -size; z <= size; z++) {
            // Terrain height variation
            const height = Math.floor(Math.sin(x * 0.3) * 2 + Math.cos(z * 0.3) * 2);

            // Grass on top
            blocks.push({ x, y: height, z, type: 'grass' });

            // Dirt layers
            for (let y = height - 1; y >= height - 3; y--) {
                blocks.push({ x, y, z, type: 'dirt' });
            }

            // Stone layers
            for (let y = height - 4; y >= -5; y--) {
                blocks.push({ x, y, z, type: 'stone' });
            }
        }
    }

    // Add a tree
    const treeX = 3;
    const treeZ = 2;
    const treeBase = Math.floor(Math.sin(treeX * 0.3) * 2 + Math.cos(treeZ * 0.3) * 2) + 1;

    // Trunk
    for (let y = treeBase; y < treeBase + 5; y++) {
        blocks.push({ x: treeX, y, z: treeZ, type: 'oak_log' });
    }

    // Leaves
    for (let x = treeX - 2; x <= treeX + 2; x++) {
        for (let z = treeZ - 2; z <= treeZ + 2; z++) {
            for (let y = treeBase + 4; y <= treeBase + 6; y++) {
                const dist = Math.sqrt(Math.pow(x - treeX, 2) + Math.pow(z - treeZ, 2));
                if (dist <= 2.5 && Math.random() > 0.2) {
                    blocks.push({ x, y, z, type: 'oak_leaves' });
                }
            }
        }
    }

    // Water pond
    for (let x = -4; x <= -2; x++) {
        for (let z = -4; z <= -2; z++) {
            blocks.push({ x, y: -1, z, type: 'water' });
        }
    }

    return blocks;
}

// ===================================
// Share Code Parser (placeholder)
// ===================================

function parseShareCode(code: string): WorldData | null {
    try {
        // TODO: Implement actual Hytale share code parsing
        // For now, return demo data
        console.log('Parsing share code:', code);
        return {
            name: 'Shared World',
            blocks: generateDemoWorld(),
        };
    } catch (error) {
        console.error('Error parsing share code:', error);
        return null;
    }
}

// ===================================
// Main Component
// ===================================

export default function WorldPreview({
    shareCode,
    worldData,
    height = 400,
    autoRotate = true,
}: WorldPreviewProps) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        try {
            if (worldData) {
                setBlocks(worldData.blocks);
            } else if (shareCode) {
                const parsed = parseShareCode(shareCode);
                if (parsed) {
                    setBlocks(parsed.blocks);
                } else {
                    setError('Failed to parse share code');
                }
            } else {
                // Generate demo world
                setBlocks(generateDemoWorld());
            }
        } catch (err) {
            setError('Failed to load world data');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [shareCode, worldData]);

    if (error) {
        return (
            <div className={styles.container} style={{ height }}>
                <div className={styles.error}>
                    <span>⚠️</span>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ height }}>
            <Canvas shadows>
                <Suspense fallback={<LoadingPlaceholder />}>
                    <PerspectiveCamera makeDefault position={[20, 15, 20]} fov={50} />
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={5}
                        maxDistance={100}
                        autoRotate={autoRotate}
                        autoRotateSpeed={0.5}
                    />

                    {/* Lighting */}
                    <ambientLight intensity={0.4} />
                    <directionalLight
                        position={[10, 20, 10]}
                        intensity={1}
                        castShadow
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                    />
                    <directionalLight position={[-10, 10, -10]} intensity={0.3} />

                    {/* Environment */}
                    <fog attach="fog" args={['#1a1a2e', 30, 100]} />
                    <color attach="background" args={['#1a1a2e']} />

                    {/* World */}
                    {!isLoading && blocks.length > 0 && (
                        <WorldScene blocks={blocks} autoRotate={false} />
                    )}
                </Suspense>
            </Canvas>

            {/* Controls hint */}
            <div className={styles.controls}>
                <span>🖱️ Drag to rotate • Scroll to zoom</span>
            </div>
        </div>
    );
}
