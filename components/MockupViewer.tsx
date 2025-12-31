import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MockupSettings } from '../types';
import { Move, ZoomIn, RotateCw, Palette, Maximize, ArrowRightLeft, ArrowUpDown, LayoutTemplate, Scan, Info, Hand } from 'lucide-react';

interface MockupViewerProps {
  artUrl: string;
  settings?: MockupSettings;
  isEditable?: boolean;
  onSettingsChange?: (newSettings: MockupSettings) => void;
}

const DEFAULT_SETTINGS: MockupSettings = {
  scale: 1,
  posX: 0,
  posY: 0,
  rotate: 0,
  mugColor: '#ffffff'
};

export const MockupViewer: React.FC<MockupViewerProps> = ({ 
  artUrl, 
  settings = DEFAULT_SETTINGS, 
  isEditable = false, 
  onSettingsChange 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction State
  const [interactionMode, setInteractionMode] = useState<'rotate' | 'move'>('rotate');
  const [isDragging, setIsDragging] = useState(false);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  
  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const mugMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null); // For mug color
  
  // Constants for Sublimation Area Ratio (Standard 11oz Mug Print Area: ~21cm x 9.5cm)
  const CANVAS_WIDTH = 2048; 
  const CANVAS_HEIGHT = 926; // Ratio approx 2.21:1
  
  // --- CANVAS DRAWING LOGIC (The 2D Engine) ---
  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    // Safety check
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Clear Canvas (Transparent background for the print layer)
    ctx.clearRect(0, 0, w, h);

    // 2. Math for "Fit to Area" Logic
    const imgAspect = img.width / img.height;
    const canvasAspect = w / h;
    
    let baseWidth, baseHeight;

    if (imgAspect > canvasAspect) {
        baseWidth = w;
        baseHeight = w / imgAspect;
    } else {
        baseHeight = h;
        baseWidth = h * imgAspect;
    }

    // 3. Draw
    ctx.save();
    
    // Move origin to center of canvas
    ctx.translate(w / 2, h / 2);

    // Apply User Transforms (Pos X/Y are percentage based -1 to 1)
    ctx.translate(settings.posX * w, settings.posY * h);
    
    // Rotation
    ctx.rotate((settings.rotate * Math.PI) / 180);
    
    // Scale
    ctx.scale(settings.scale, settings.scale);

    // Draw Image Centered at the new origin
    ctx.drawImage(img, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);

    ctx.restore();

    // 4. Update Texture
    if (textureRef.current) {
        textureRef.current.needsUpdate = true;
    }
  }, [settings, artUrl]);

  // Load Image
  useEffect(() => {
    if (!artUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = artUrl;
    img.onload = () => {
        imageRef.current = img;
        updateCanvas();
        setLoading(false);
    };
  }, [artUrl, updateCanvas]);

  // Update on Settings Change
  useEffect(() => {
      updateCanvas();
      if (mugMaterialRef.current) {
          mugMaterialRef.current.color.set(settings.mugColor);
      }
  }, [settings, updateCanvas]);


  // --- THREE.JS SCENE ---
  useEffect(() => {
    if (!mountRef.current) return;
    let isMounted = true;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f7);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 5.5); 
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(3, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xebebeb, 0.4);
    fillLight.position.set(-3, 0, 4);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // 3. MUG CONSTRUCTION
    const mugGroup = new THREE.Group();

    // --- A. Materials ---
    const ceramicMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(settings.mugColor),
        roughness: 0.15,
        metalness: 0.05,
    });
    mugMaterialRef.current = ceramicMaterial;

    // --- B. Geometry Constants ---
    const RADIUS = 0.8;
    const HEIGHT = 1.9;
    const SEGMENTS = 64;

    // --- C. The Body ---
    const baseGeo = new THREE.CylinderGeometry(RADIUS - 0.01, RADIUS - 0.01, HEIGHT, SEGMENTS, 1, false);
    const baseMesh = new THREE.Mesh(baseGeo, ceramicMaterial);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    mugGroup.add(baseMesh);

    const innerGeo = new THREE.CylinderGeometry(RADIUS - 0.08, RADIUS - 0.08, HEIGHT + 0.01, SEGMENTS, 1, true);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.BackSide, roughness: 0.2 });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mugGroup.add(innerMesh);

    const rimGeo = new THREE.TorusGeometry(RADIUS - 0.045, 0.035, 12, SEGMENTS);
    const rimMesh = new THREE.Mesh(rimGeo, ceramicMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = HEIGHT / 2;
    mugGroup.add(rimMesh);
    
    const bottomGeo = new THREE.CircleGeometry(RADIUS - 0.01, SEGMENTS);
    const bottomMesh = new THREE.Mesh(bottomGeo, ceramicMaterial);
    bottomMesh.rotation.x = Math.PI / 2;
    bottomMesh.position.y = -HEIGHT / 2;
    mugGroup.add(bottomMesh);


    // --- D. The Print Area ---
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH; 
    canvas.height = CANVAS_HEIGHT;
    canvasRef.current = canvas;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureRef.current = texture;

    const printMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.3,
        metalness: 0.0,
        polygonOffset: true, 
        polygonOffsetFactor: -2,
    });

    // GAP LOGIC: 
    // Gap Size 0.6 radians (~34 degrees). 
    // This creates a gap centered at angle 0.
    const gapSize = 0.6; 
    const arcLength = (Math.PI * 2) - gapSize;
    const startAngle = gapSize / 2; 

    const printGeo = new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, SEGMENTS, 1, true, startAngle, arcLength);
    const printMesh = new THREE.Mesh(printGeo, printMaterial);
    mugGroup.add(printMesh);


    // --- E. The Handle ---
    const handleGeo = new THREE.TorusGeometry(0.35, 0.1, 16, 32, Math.PI + 0.5); 
    const handleMesh = new THREE.Mesh(handleGeo, ceramicMaterial);
    handleMesh.rotation.z = -Math.PI / 2;
    // ALIGNMENT FIX: Removed rotation.y to ensure handle is perfectly straight and aligned with the gap at Angle 0.
    handleMesh.rotation.y = 0; 
    handleMesh.position.set(RADIUS - 0.15, 0, 0); 
    
    const handleGroup = new THREE.Group();
    handleGroup.add(handleMesh);
    // Move Handle INWARD to penetrate the body and join cleanly
    handleGroup.position.set(0, 0, 0); 
    handleGroup.translateX(RADIUS - 0.05); 
    
    mugGroup.add(handleGroup);

    scene.add(mugGroup);
    
    // Floor
    const planeGeo = new THREE.PlaneGeometry(10, 10);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.1 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -HEIGHT/2 - 0.01;
    plane.receiveShadow = true;
    scene.add(plane);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI - 0.2;
    controls.autoRotate = !isEditable; // Only auto-rotate if viewing
    controls.autoRotateSpeed = 1.5;
    orbitControlsRef.current = controls;

    // 5. Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    updateCanvas();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []); 

  // --- Interaction Handlers ---

  const handlePointerDown = () => {
    if (!isEditable) return;
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    if (!isEditable) return;
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditable || !isDragging) return;
    if (interactionMode !== 'move') return;

    // DRAG ART LOGIC
    if (onSettingsChange) {
        // Sensitivity factor to convert screen pixels to UV offset
        const sensitivity = 0.002;
        
        const newX = settings.posX + (e.movementX * sensitivity);
        const newY = settings.posY + (e.movementY * sensitivity);

        onSettingsChange({
            ...settings,
            posX: newX,
            posY: newY
        });
    }
  };

  // Toggle Controls based on mode
  useEffect(() => {
      if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = interactionMode === 'rotate';
      }
  }, [interactionMode]);


  // --- Helpers ---
  const handleSettingChange = (key: keyof MockupSettings, value: number | string) => {
      if (onSettingsChange) {
          onSettingsChange({
              ...settings,
              [key]: value
          });
      }
  };

  const handleCenter = () => {
      if (onSettingsChange) onSettingsChange({ ...settings, posX: 0, posY: 0 });
  };
  
  const handleFitCover = () => {
      if (onSettingsChange) onSettingsChange({ ...settings, scale: 1.25, posX: 0, posY: 0 });
  };

  const handleFitContain = () => {
       if (onSettingsChange) onSettingsChange({ ...settings, scale: 1, posX: 0, posY: 0 });
  };

  return (
    // LAYOUT FIX: Always use flex-col. This ensures controls are below the mug, 
    // preventing them from being squished or hidden in the Admin panel sidebar.
    <div className="flex flex-col gap-6 w-full items-start">
      {/* 3D Viewport */}
      <div className="flex-grow w-full">
          {/* Header Controls for Mode Switching */}
          {isEditable && (
              <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setInteractionMode('rotate')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition border ${interactionMode === 'rotate' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                  >
                      <RotateCw size={14} /> Girar Caneca
                  </button>
                  <button 
                    onClick={() => setInteractionMode('move')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition border ${interactionMode === 'move' ? 'bg-cherry text-white border-cherry' : 'bg-white text-gray-600 border-gray-200 hover:border-cherry'}`}
                  >
                      <Hand size={14} /> Mover Arte (Arrastar)
                  </button>
              </div>
          )}

          <div 
            className={`relative w-full h-[500px] lg:h-[600px] bg-gray-50 rounded-3xl overflow-hidden shadow-xl border-4 border-cream flex items-center justify-center touch-none ${interactionMode === 'move' && isEditable ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerUp}
          >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cherry"></div>
                </div>
            )}
            <div ref={mountRef} className="w-full h-full" />
            
            <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-xs text-gray-500 font-bold shadow-sm backdrop-blur-sm pointer-events-none select-none flex items-center gap-2">
              <Info size={14} /> 
              {isEditable && interactionMode === 'move' ? 'Arraste para posicionar a arte' : 'Arraste para girar a visualização'}
            </div>
            
            {!isEditable && (
                 <div className="absolute bottom-4 right-4 flex gap-2">
                     <div className="bg-white/80 p-2 rounded-full text-xs font-bold text-gray-400 shadow-sm">Visualização 360°</div>
                 </div>
            )}
          </div>
      </div>

      {/* Editor Controls (Only visible in Admin/Edit mode) */}
      {isEditable && (
          // Adjusted width to full so it fits naturally in the column below the canvas
          <div className="w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-6 flex flex-col gap-6 h-fit shrink-0">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                  <Palette className="text-cherry" />
                  <h3 className="font-bold text-gray-800">Editor de Mockup</h3>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
                  <button onClick={handleFitContain} className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:border-cherry hover:text-cherry hover:shadow-md transition group" title="Ajustar (Conter)">
                      <Scan size={20} className="text-gray-500 group-hover:text-cherry mb-1" />
                      <span className="text-[10px] font-bold text-gray-500 group-hover:text-cherry">Ajustar</span>
                  </button>
                  <button onClick={handleFitCover} className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:border-cherry hover:text-cherry hover:shadow-md transition group" title="Preencher (Cortar)">
                      <Maximize size={20} className="text-gray-500 group-hover:text-cherry mb-1" />
                      <span className="text-[10px] font-bold text-gray-500 group-hover:text-cherry">Preencher</span>
                  </button>
                  <button onClick={handleCenter} className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:border-cherry hover:text-cherry hover:shadow-md transition group" title="Centralizar">
                      <LayoutTemplate size={20} className="text-gray-500 group-hover:text-cherry mb-1" />
                      <span className="text-[10px] font-bold text-gray-500 group-hover:text-cherry">Centro</span>
                  </button>
              </div>

              {/* Scale Control */}
              <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center justify-between">
                      <span className="flex items-center gap-2"><ZoomIn size={14} /> Zoom</span>
                      <span className="text-cherry font-mono bg-cherry/10 px-2 rounded">{Math.round(settings.scale * 100)}%</span>
                  </label>
                  <input 
                      type="range" 
                      min="0.1" max="3" step="0.01"
                      value={settings.scale}
                      onChange={(e) => handleSettingChange('scale', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cherry"
                  />
              </div>

              {/* Position Controls */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                      <Move size={14} /> Posição Manual
                  </label>
                  
                  <div className="space-y-3">
                      <div className="flex items-center gap-3">
                          <ArrowRightLeft size={16} className="text-gray-400" />
                          <input 
                            type="range" 
                            min="-0.6" max="0.6" step="0.01"
                            value={settings.posX}
                            onChange={(e) => handleSettingChange('posX', parseFloat(e.target.value))}
                            className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cherry"
                          />
                      </div>
                      <div className="flex items-center gap-3">
                          <ArrowUpDown size={16} className="text-gray-400" />
                          <input 
                            type="range" 
                            min="-0.6" max="0.6" step="0.01"
                            value={settings.posY}
                            onChange={(e) => handleSettingChange('posY', parseFloat(e.target.value))}
                            className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cherry"
                          />
                      </div>
                  </div>
              </div>

              {/* Rotation Control */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center justify-between">
                      <span className="flex items-center gap-2"><RotateCw size={14} /> Rotação Arte</span>
                      <span className="text-gray-400 font-mono">{Math.round(settings.rotate)}°</span>
                  </label>
                  <input 
                      type="range" 
                      min="-180" max="180" step="1"
                      value={settings.rotate}
                      onChange={(e) => handleSettingChange('rotate', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cherry"
                  />
              </div>

               {/* Mug Color */}
               <div className="space-y-2 pt-4 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-500 uppercase">Cor Interna / Alça</label>
                  <div className="flex gap-2 flex-wrap">
                      {['#ffffff', '#000000', '#e36888', '#f2d88f', '#6698cc', '#2f4f4f'].map(color => (
                          <button
                            key={color}
                            onClick={() => handleSettingChange('mugColor', color)}
                            className={`w-8 h-8 rounded-full border-2 transition hover:scale-110 ${settings.mugColor === color ? 'border-gray-600 scale-110 shadow-md' : 'border-gray-100'}`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                      ))}
                      <input 
                        type="color" 
                        value={settings.mugColor}
                        onChange={(e) => handleSettingChange('mugColor', e.target.value)}
                        className="w-8 h-8 rounded-full border-0 p-0 overflow-hidden cursor-pointer"
                      />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};