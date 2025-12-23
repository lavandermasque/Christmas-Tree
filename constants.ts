import * as THREE from 'three';

export const COLORS = {
  GOLD: new THREE.Color('#FFD700'),       // Bright Festive Gold
  METALLIC_GOLD: new THREE.Color('#D4AF37'), // Rich Metallic Gold
  CHRISTMAS_RED: new THREE.Color('#E60023'), // Vibrant Santa Red
  CRIMSON: new THREE.Color('#8B0000'),      // Deep Dark Red
  FOREST_GREEN: new THREE.Color('#0f5132'), // Deep Classic Tree Green
  EMERALD: new THREE.Color('#023020'),      // Darker Emerald
  PINE: new THREE.Color('#014421'),         // Dark Pine
  SILVER: new THREE.Color('#E5E7EB'),       // Bright Silver
  SNOW_WHITE: new THREE.Color('#FFFFFF'),   // Pure White
  WARM_WHITE: new THREE.Color('#FFF5E1'),   // Warm light
};

// A palette heavily weighted towards Green, Red, and Gold for that classic Christmas look
export const PALETTE = [
  COLORS.METALLIC_GOLD,
  COLORS.GOLD,
  COLORS.CHRISTMAS_RED,
  COLORS.CHRISTMAS_RED, // Double weight for red to make it pop
  COLORS.CRIMSON,
  COLORS.FOREST_GREEN,
  COLORS.FOREST_GREEN, // Triple weight for green to define the tree form
  COLORS.FOREST_GREEN,
  COLORS.PINE,
  COLORS.PINE,
  COLORS.SILVER,
  COLORS.SNOW_WHITE,
  COLORS.WARM_WHITE
];

export const TREE_CONFIG = {
  count: 1800, // Increased count slightly for denser festive look
  radius: 3.5, // Base radius
  height: 9,   // Tree height
  spin: 15     // How many times it wraps around
};

// Animation speed for lerping (Adjusted to 1.1 for a responsive yet smooth flow)
export const ANIMATION_SPEED = 1.1;