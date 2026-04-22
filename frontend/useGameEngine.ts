import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GRID_SIZE, CANVAS_SIZE, CELL_SIZE, INITIAL_SPEED, MIN_SPEED, 
  SPEED_DECREMENT, FOODS_PER_SPEED_UP, COLORS, Direction, GameState, 
  DIRECTION_OFFSETS 
} from './constants';
import { Point, Particle } from './types';
import { audio } from './audio';

export function useGameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Mutable refs for game loop to avoid dependency issues in requestAnimationFrame
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }] as Point[],
    direction: Direction.UP,
    nextDirection: Direction.UP,
    food: { x: 5, y: 5 } as Point,
    particles: [] as Particle[],
    lastTick: 0,
    speed: INITIAL_SPEED,
    foodsEaten: 0,
    status: GameState.START
  });

  // Input handling refs
  const touchStartRef = useRef<{x: number, y: number} | null>(null);

  // --- Helpers ---

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const spawnParticles = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      newParticles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 20 + 20,
        color: COLORS.particle,
        size: Math.random() * 3 + 1
      });
    }
    stateRef.current.particles.push(...newParticles);
  };

  // --- Game Actions ---

  const startGame = useCallback(() => {
    audio.init();
    stateRef.current = {
      snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
      direction: Direction.UP,
      nextDirection: Direction.UP,
      food: generateFood([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]),
      particles: [],
      lastTick: performance.now(),
      speed: INITIAL_SPEED,
      foodsEaten: 0,
      status: GameState.PLAYING
    };
    setScore(0);
    setGameState(GameState.PLAYING);
  }, [generateFood]);

  const pauseGame = useCallback(() => {
    if (stateRef.current.status === GameState.PLAYING) {
      stateRef.current.status = GameState.PAUSED;
      setGameState(GameState.PAUSED);
    }
  }, []);

  const resumeGame = useCallback(() => {
    if (stateRef.current.status === GameState.PAUSED) {
      stateRef.current.status = GameState.PLAYING;
      stateRef.current.lastTick = performance.now(); // Prevent huge jump
      setGameState(GameState.PLAYING);
    }
  }, []);

  const gameOver = useCallback(() => {
    stateRef.current.status = GameState.GAME_OVER;
    setGameState(GameState.GAME_OVER);
    audio.playDie();
    setScore(currentScore => {
      if (currentScore > highScore) {
        setHighScore(currentScore);
        localStorage.setItem('snakeHighScore', currentScore.toString());
      }
      return currentScore;
    });
  }, [highScore]);

  // --- Input Handling ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { status, direction } = stateRef.current;

      // Global controls
      if (e.code === 'Space') {
        e.preventDefault();
        if (status === GameState.START || status === GameState.GAME_OVER) {
          startGame();
        }
        return;
      }
      if (e.code === 'KeyP') {
        if (status === GameState.PLAYING) pauseGame();
        else if (status === GameState.PAUSED) resumeGame();
        return;
      }

      if (status !== GameState.PLAYING) return;

      // Movement controls
      let newDir = stateRef.current.nextDirection;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== Direction.DOWN) newDir = Direction.UP;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== Direction.UP) newDir = Direction.DOWN;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== Direction.RIGHT) newDir = Direction.LEFT;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== Direction.LEFT) newDir = Direction.RIGHT;
          break;
      }
      
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      stateRef.current.nextDirection = newDir;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, pauseGame, resumeGame]);

  // Touch handling for mobile swipe
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (stateRef.current.status !== GameState.PLAYING) return;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      e.preventDefault(); // Prevent scrolling
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (stateRef.current.status !== GameState.PLAYING) return;
      e.preventDefault(); // Prevent scrolling
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (stateRef.current.status !== GameState.PLAYING || !touchStartRef.current) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const dx = touchEndX - touchStartRef.current.x;
      const dy = touchEndY - touchStartRef.current.y;
      
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      
      // Minimum swipe distance
      if (Math.max(absDx, absDy) > 30) {
        const { direction } = stateRef.current;
        let newDir = stateRef.current.nextDirection;

        if (absDx > absDy) {
          // Horizontal swipe
          if (dx > 0 && direction !== Direction.LEFT) newDir = Direction.RIGHT;
          else if (dx < 0 && direction !== Direction.RIGHT) newDir = Direction.LEFT;
        } else {
          // Vertical swipe
          if (dy > 0 && direction !== Direction.UP) newDir = Direction.DOWN;
          else if (dy < 0 && direction !== Direction.DOWN) newDir = Direction.UP;
        }
        stateRef.current.nextDirection = newDir;
      }
      touchStartRef.current = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);


  // --- Game Loop & Rendering ---

  useEffect(() => {
    let animationFrameId: number;

    const render = (time: number) => {
      const state = stateRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) return;

      // 1. Logic Update
      if (state.status === GameState.PLAYING) {
        const deltaTime = time - state.lastTick;
        
        if (deltaTime >= state.speed) {
          state.lastTick = time;
          state.direction = state.nextDirection;
          
          const head = state.snake[0];
          const offset = DIRECTION_OFFSETS[state.direction];
          
          // Calculate new head with wrap-around
          let newX = head.x + offset.x;
          let newY = head.y + offset.y;
          
          if (newX < 0) newX = GRID_SIZE - 1;
          else if (newX >= GRID_SIZE) newX = 0;
          
          if (newY < 0) newY = GRID_SIZE - 1;
          else if (newY >= GRID_SIZE) newY = 0;

          const newHead = { x: newX, y: newY };

          // Check self collision (excluding the very last tail segment which will move)
          // Actually, to be safe, check all except last. If growing, check all.
          // Simplest robust way: check if newHead is in current snake (excluding last element)
          const isCollision = state.snake.some((segment, index) => {
            if (index === state.snake.length - 1) return false; // Tail moves out of way
            return segment.x === newHead.x && segment.y === newHead.y;
          });

          if (isCollision) {
            gameOver();
          } else {
            state.snake.unshift(newHead); // Add new head

            // Check food
            if (newHead.x === state.food.x && newHead.y === state.food.y) {
              // Ate food
              audio.playEat();
              spawnParticles(state.food.x, state.food.y);
              setScore(s => s + 10);
              state.foodsEaten++;
              
              // Speed up
              if (state.foodsEaten % FOODS_PER_SPEED_UP === 0) {
                state.speed = Math.max(MIN_SPEED, state.speed - SPEED_DECREMENT);
              }
              
              state.food = generateFood(state.snake);
              // Don't pop tail, so snake grows
            } else {
              state.snake.pop(); // Remove tail
            }
          }
        }
      }

      // 2. Render Update (runs every frame for smooth particles/glows)
      
      // Clear background
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw Grid
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
      }
      ctx.stroke();

      // Draw Food (Pulsating)
      const pulse = Math.sin(time / 150) * 0.15 + 0.85; // 0.7 to 1.0
      const foodRadius = (CELL_SIZE / 2) * 0.7 * pulse;
      const foodCx = state.food.x * CELL_SIZE + CELL_SIZE / 2;
      const foodCy = state.food.y * CELL_SIZE + CELL_SIZE / 2;

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = COLORS.foodGlow;
      ctx.fillStyle = COLORS.food;
      ctx.beginPath();
      ctx.arc(foodCx, foodCy, foodRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        
        if (p.life <= -p.maxLife) {
          state.particles.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, 1 - (Math.abs(p.life) / p.maxLife));
        ctx.fillStyle = `rgba(255, 153, 204, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Snake
      if (state.snake.length > 0) {
        // Draw body as a continuous thick line with rounded caps
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = CELL_SIZE * 0.75;
        ctx.strokeStyle = COLORS.snakeBody;
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.snakeGlow;

        ctx.beginPath();
        
        // Handle wrap-around drawing visually
        // If a segment is far from the previous one, it wrapped. Break the line.
        let isDrawing = false;
        
        for (let i = 0; i < state.snake.length; i++) {
          const segment = state.snake[i];
          const cx = segment.x * CELL_SIZE + CELL_SIZE / 2;
          const cy = segment.y * CELL_SIZE + CELL_SIZE / 2;

          if (i === 0) {
            ctx.moveTo(cx, cy);
            isDrawing = true;
          } else {
            const prev = state.snake[i - 1];
            // Check if wrapped
            if (Math.abs(segment.x - prev.x) > 1 || Math.abs(segment.y - prev.y) > 1) {
              // Wrapped, stroke current path and start a new one
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(cx, cy);
            } else {
              ctx.lineTo(cx, cy);
            }
          }
        }
        ctx.stroke();
        ctx.restore();

        // Draw Head (slightly larger, different color)
        const head = state.snake[0];
        const headCx = head.x * CELL_SIZE + CELL_SIZE / 2;
        const headCy = head.y * CELL_SIZE + CELL_SIZE / 2;
        
        ctx.save();
        ctx.fillStyle = COLORS.snakeHead;
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.snakeGlow;
        ctx.beginPath();
        // Draw a slightly larger rounded rect/circle for head
        ctx.arc(headCx, headCy, CELL_SIZE * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw Eyes based on direction
        ctx.fillStyle = '#0f0f1a'; // Dark eyes
        ctx.shadowBlur = 0;
        const eyeOffset = CELL_SIZE * 0.2;
        const eyeRadius = CELL_SIZE * 0.1;
        
        let eye1 = { x: 0, y: 0 };
        let eye2 = { x: 0, y: 0 };

        switch (state.direction) {
          case Direction.UP:
            eye1 = { x: headCx - eyeOffset, y: headCy - eyeOffset };
            eye2 = { x: headCx + eyeOffset, y: headCy - eyeOffset };
            break;
          case Direction.DOWN:
            eye1 = { x: headCx - eyeOffset, y: headCy + eyeOffset };
            eye2 = { x: headCx + eyeOffset, y: headCy + eyeOffset };
            break;
          case Direction.LEFT:
            eye1 = { x: headCx - eyeOffset, y: headCy - eyeOffset };
            eye2 = { x: headCx - eyeOffset, y: headCy + eyeOffset };
            break;
          case Direction.RIGHT:
            eye1 = { x: headCx + eyeOffset, y: headCy - eyeOffset };
            eye2 = { x: headCx + eyeOffset, y: headCy + eyeOffset };
            break;
        }

        ctx.beginPath();
        ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2);
        ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver, generateFood]);

  return {
    canvasRef,
    score,
    highScore,
    gameState,
    startGame,
    pauseGame,
    resumeGame
  };
}