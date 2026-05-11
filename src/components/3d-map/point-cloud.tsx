
'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Point3D, ObjectPosition } from '@/types';

type PointCloudProps = {
  points: Point3D[];
  objectPosition: Point3D | null | undefined;
  pathHistory?: ObjectPosition[];
};

export default function PointCloud({ points, objectPosition, pathHistory = [] }: PointCloudProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pointCloudRef = useRef<THREE.Points | null>(null);
  const objectSphereRef = useRef<THREE.Mesh | null>(null);
  const pathLineRef = useRef<THREE.Line | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    if (!rendererRef.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('hsl(var(--card))');
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
      camera.position.set(0, 50, 200);
      cameraRef.current = camera;
      
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;
      currentMount.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controlsRef.current = controls;
      
      const axesHelper = new THREE.AxesHelper(50);
      scene.add(axesHelper);
      const gridHelper = new THREE.GridHelper(400, 20, 'hsl(var(--muted-foreground))', 'hsl(var(--muted))');
      scene.add(gridHelper);
      
      const pointMaterial = new THREE.PointsMaterial({ color: 'hsl(var(--primary))', size: 1.5, sizeAttenuation: true });
      const pointCloud = new THREE.Points(new THREE.BufferGeometry(), pointMaterial);
      scene.add(pointCloud);
      pointCloudRef.current = pointCloud;

      const sphereGeometry = new THREE.SphereGeometry(5, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 'hsl(var(--accent))' });
      const objectSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      objectSphere.visible = false;
      scene.add(objectSphere);
      objectSphereRef.current = objectSphere;

      const lineMaterial = new THREE.LineBasicMaterial({ color: 'hsl(var(--accent))', linewidth: 2, transparent: true, opacity: 0.7 });
      const lineGeometry = new THREE.BufferGeometry();
      const pathLine = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(pathLine);
      pathLineRef.current = pathLine;
      
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    }
    
    const handleResize = () => {
        if(cameraRef.current && rendererRef.current && currentMount) {
            cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (pointCloudRef.current) {
        const vertices = points.flatMap(p => [p.x, p.y, p.z]);
        pointCloudRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        pointCloudRef.current.geometry.attributes.position.needsUpdate = true;
        pointCloudRef.current.geometry.computeBoundingSphere();
    }
  }, [points]);

  useEffect(() => {
    if (objectSphereRef.current) {
        if (objectPosition) {
            objectSphereRef.current.position.set(objectPosition.x, objectPosition.y, objectPosition.z);
            objectSphereRef.current.visible = true;
        } else {
            objectSphereRef.current.visible = false;
        }
    }
  }, [objectPosition]);

  useEffect(() => {
    if (pathLineRef.current && pathHistory.length > 1) {
      const linePoints = pathHistory.map(p => new THREE.Vector3(p.position.x, p.position.y, p.position.z));
      pathLineRef.current.geometry.setFromPoints(linePoints.reverse()); // reverse to draw from oldest to newest
      pathLineRef.current.geometry.attributes.position.needsUpdate = true;
    } else if (pathLineRef.current) {
      // Clear the line if history is empty
      pathLineRef.current.geometry.setFromPoints([]);
      pathLineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  }, [pathHistory]);


  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}
