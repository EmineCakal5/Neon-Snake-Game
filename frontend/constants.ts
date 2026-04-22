export const GRID_SIZE = 20; // 20x20 grid
export const CANVAS_SIZE = 600; // Internal resolution
export const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

export const INITIAL_SPEED = 150; // ms per tick
export const MIN_SPEED = 50;
export const SPEED_DECREMENT = 5; // Decrease tick time by this amount every N foods
export const FOODS_PER_SPEED_UP = 5;

export const COLORS = {
  background: '#1a1a2e',
  grid: 'rgba(255, 255, 255, 0.03)',
  snakeHead: '#00ffcc',
  snakeBody: '#00b38f',
  snakeGlow: 'rgba(0, 255, 204, 0.6)',
  food: '#ff3366',
  foodGlow: 'rgba(255, 51, 102, 0.8)',
  particle: '#ff99cc',
  text: '#ffffff'
};

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export const DIRECTION_OFFSETS = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 }
};