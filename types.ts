import * as THREE from 'three';

export interface ParticleData {
  initialPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  scale: number;
  rotationSpeed: number;
  rotationAxis: THREE.Vector3;
  color: THREE.Color;
}

export enum TreeState {
  ASSEMBLED = 'ASSEMBLED',
  SCATTERED = 'SCATTERED'
}

export interface TreeConfig {
    count: number;
    radius: number;
    height: number;
    spin: number;
}