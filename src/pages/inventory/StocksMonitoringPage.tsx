import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Warehouse, Maximize2 } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoLED } from '../../components/skeuomorphic/SkeuoLED';
import { useInventoryStore } from '../../store/useInventoryStore';
import { formatCurrency } from '../../utils';
import type { Product } from '../../types';

// 3D Pallet Box Component
const PalletBox: React.FC<{ product: Product; position: [number, number, number] }> = ({ product, position }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const isCritical = product.status === 'CRITICAL';
  const isOOS = product.status === 'OUT_OF_STOCK';
  const isExpired = product.status === 'EXPIRED';

  const boxColor = isOOS || isExpired ? '#7f1d1d' : isCritical ? '#78350f' : '#1e3a5f';
  const glowColor = isOOS || isExpired ? '#ef4444' : isCritical ? '#f59e0b' : '#3b82f6';
  const height = isOOS ? 0.1 : Math.max(0.15, (product.stockAvailable / Math.max(product.criticalLevel * 3, 10)) * 1.2);

  useFrame(state => {
    if (isCritical && meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2.5) * 0.04;
    }
  });

  return (
    <group position={position}>
      {/* Pallet base */}
      <RoundedBox args={[1.3, 0.08, 1.3]} radius={0.02} position={[0, -0.55, 0]}>
        <meshStandardMaterial color="#5c3d1a" roughness={0.9} />
      </RoundedBox>
      {/* Rack metal bars */}
      <mesh position={[0, -0.4, 0]}><boxGeometry args={[1.4, 0.03, 0.03]} /><meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} /></mesh>

      {/* Stock box */}
      <RoundedBox ref={meshRef} args={[1.1, Math.max(0.1, height), 1.1]} radius={0.04} position={[0, height / 2 - 0.4, 0]}>
        <meshStandardMaterial color={boxColor} roughness={0.35} metalness={0.1}
          emissive={glowColor} emissiveIntensity={isCritical || isOOS ? 0.15 : 0.03} />
      </RoundedBox>

      {/* Label */}
      <Float speed={1.2} floatIntensity={0.1} rotationIntensity={0.05}>
        <Text position={[0, height + 0.2, 0]} fontSize={0.12} color={glowColor} anchorX="center" anchorY="middle"
          font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.woff">
          {`${product.sku.substring(0, 8)}\n${product.stockAvailable}${product.unit}`}
        </Text>
      </Float>
    </group>
  );
};

// Metal rack frame
const RackFrame: React.FC<{ position: [number, number, number]; width: number }> = ({ position, width }) => (
  <group position={position}>
    {[-width / 2, width / 2].map((x, i) => (
      <mesh key={i} position={[x, 0, 0]}><cylinderGeometry args={[0.04, 0.04, 3.2, 8]} /><meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} /></mesh>
    ))}
    <mesh position={[0, 1.5, 0]}><boxGeometry args={[width, 0.04, 0.04]} /><meshStandardMaterial color="#374151" metalness={0.8} /></mesh>
    <mesh position={[0, -0.2, 0]}><boxGeometry args={[width, 0.04, 0.04]} /><meshStandardMaterial color="#374151" metalness={0.8} /></mesh>
  </group>
);

// Main 3D Scene
const Warehouse3DScene: React.FC<{ products: Product[] }> = ({ products }) => {
  const displayProducts = products.slice(0, 12);
  const perRow = 4;

  return (
    <Canvas camera={{ position: [5, 4, 8], fov: 42 }} gl={{ antialias: true }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 8]} intensity={1.4} castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.6} color="#60a5fa" />
      <pointLight position={[5, 1, 5]} intensity={0.3} color="#fbbf24" />

      {/* Floor */}
      <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0d0f14" roughness={0.8} />
      </mesh>

      {/* Rack frames */}
      {[0, 1, 2].map(row => (
        <RackFrame key={row} position={[0, -0.1, row * -3.5]} width={(Math.min(displayProducts.length, perRow) - 1) * 1.8 + 2} />
      ))}

      {/* Products */}
      {displayProducts.map((prod, i) => {
        const col = i % perRow;
        const row = Math.floor(i / perRow);
        return (
          <PalletBox key={prod.id} product={prod}
            position={[(col - (perRow / 2 - 0.5)) * 1.8, 0, row * -3.5]} />
        );
      })}

      <OrbitControls enablePan maxPolarAngle={Math.PI / 2.05} minDistance={4} maxDistance={18} autoRotate autoRotateSpeed={0.4} />
      <Environment preset="warehouse" />
    </Canvas>
  );
};

export const StocksMonitoringPage: React.FC = () => {
  const products = useInventoryStore(s => s.products);
  const getAlerts = useInventoryStore(s => s.getAlertCounts);
  const alerts = getAlerts();

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Stocks Monitoring" subtitle="Real-time 3D spatial warehouse visualization" />
      <div className="flex-1 p-8 space-y-5">
        {/* 3D Warehouse Canvas */}
        <div className="skeuo-panel border border-white/08 rounded-2xl overflow-hidden relative" style={{ height: 420 }}>
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-gray-400 flex items-center gap-2">
              <Warehouse size={12} className="text-skeuo-gold" />
              3D Spatial Warehouse · Drag to orbit · Scroll to zoom
            </div>
            <div className="flex gap-2">
              {[{ color: '#3b82f6', label: 'In Stock' }, { color: '#f59e0b', label: 'Critical' }, { color: '#ef4444', label: 'OOS/Expired' }].map(l => (
                <div key={l.label} className="bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg border border-white/08 flex items-center gap-1.5 text-[10px] text-gray-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-600 text-sm">Loading 3D Scene...</div>}>
            <Warehouse3DScene products={products} />
          </Suspense>
        </div>

        {/* Alert strip */}
        <div className="flex items-center gap-4 flex-wrap">
          <SkeuoLED status={alerts.outOfStock > 0 ? 'red' : 'green'} size="lg" label={`Out of Stock: ${alerts.outOfStock}`} />
          <SkeuoLED status={alerts.critical > 0 ? 'amber' : 'green'} size="lg" label={`Critical: ${alerts.critical}`} />
          <SkeuoLED status={alerts.expired > 0 ? 'red' : 'green'} size="lg" label={`Expired: ${alerts.expired}`} />
          <SkeuoLED status={alerts.expiringSoon > 0 ? 'amber' : 'green'} size="lg" label={`Expiring Soon: ${alerts.expiringSoon}`} />
        </div>

        {/* Product cards grid */}
        {products.length === 0 ? (
          <div className="skeuo-panel border border-white/08 rounded-2xl p-10 text-center text-gray-500">
            <Warehouse size={40} className="mx-auto mb-3 text-gray-600 opacity-60" />
            <p className="text-sm font-semibold text-gray-300">Warehouse Racks Empty</p>
            <p className="text-xs text-gray-500 mt-1">No items currently stored. Add products to view 3D warehouse telemetry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="skeuo-panel border border-white/08 rounded-xl p-3 hover:border-skeuo-gold/20 transition-all">
                {/* Stock bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-600 font-mono">{p.sku}</span>
                    <span className={`font-bold font-mono ${p.stockAvailable === 0 ? 'text-red-400' : p.stockAvailable <= p.criticalLevel ? 'text-amber-400' : 'text-emerald-400'}`}>{p.stockAvailable}</span>
                  </div>
                  <div className="h-1.5 bg-black/50 rounded-full overflow-hidden shadow-skeuo-inset">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (p.stockAvailable / Math.max(p.criticalLevel * 3, 1)) * 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.03 + 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: p.stockAvailable === 0 || p.status === 'EXPIRED' ? '#ef4444' : p.stockAvailable <= p.criticalLevel ? '#f59e0b' : '#10b981' }} />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-200 truncate">{p.name}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-gray-600">{p.storageRackId}</span>
                  <SkeuoBadge label={p.status.split('_')[0]} status={p.status} dot />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
