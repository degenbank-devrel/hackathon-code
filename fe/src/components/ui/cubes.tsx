import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import SolanaIcon from "@/components/svg/solana-icon-svg";
import { BattleWithMetrics } from "@/hooks/useBattles";

interface Gap {
  row: number;
  col: number;
}
interface Duration {
  enter: number;
  leave: number;
}

// Use BattleWithMetrics as ArenaData for consistency
type ArenaData = BattleWithMetrics;

export interface CubesProps {
  gridSize?: number;
  cubeSize?: number;
  maxAngle?: number;
  radius?: number;
  easing?: gsap.EaseString;
  duration?: Duration;
  cellGap?: number | Gap;
  borderStyle?: string;
  faceColor?: string;
  shadow?: boolean | string;
  autoAnimate?: boolean;
  rippleOnClick?: boolean;
  rippleColor?: string;
  rippleSpeed?: number;
  arenaData?: ArenaData[];
  onCubeClick?: (arena: ArenaData, row: number, col: number) => void;
  onCubeHover?: (arena: ArenaData | null, row: number, col: number) => void;
}

const Cubes: React.FC<CubesProps> = ({
  gridSize = 10,
  cubeSize,
  maxAngle = 45,
  radius = 3,
  easing = "power2.out",
  duration = { enter: 0.2, leave: 0.2 }, // Faster and consistent animation speeds
  cellGap,
  borderStyle = "2px solid #6fb7a5", // Use primary color
  faceColor = "transparent",
  shadow = false,
  autoAnimate = false, // Disable auto animation to prevent interference
  rippleOnClick = true,
  rippleColor = "#6fb7a5", // Use primary color
  rippleSpeed = 2,
  arenaData = [],
  onCubeClick,
  onCubeHover,
}) => {
  const [hoveredCube, setHoveredCube] = useState<string | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const simTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const simRAFRef = useRef<number | null>(null);

  // Improved spacing calculation
  const colGap =
    typeof cellGap === "number"
      ? `${cellGap}px`
      : (cellGap as Gap)?.col !== undefined
        ? `${(cellGap as Gap).col}px`
        : "60px"; // Increased default spacing

  const rowGap =
    typeof cellGap === "number"
      ? `${cellGap}px`
      : (cellGap as Gap)?.row !== undefined
        ? `${(cellGap as Gap).row}px`
        : "60px"; // Increased default spacing

  const enterDur = duration.enter;
  const leaveDur = duration.leave;

  const tiltAt = useCallback(
    (rowCenter: number, colCenter: number) => {
      if (!sceneRef.current) return;

      // Find the specific cube being hovered
      const targetRow = Math.floor(rowCenter);
      const targetCol = Math.floor(colCenter);

      sceneRef.current
        .querySelectorAll<HTMLDivElement>(".cube")
        .forEach((cube) => {
          const r = +cube.dataset.row!;
          const c = +cube.dataset.col!;

          // Only animate the specific cube being hovered
          if (r === targetRow && c === targetCol) {
            gsap.to(cube, {
              duration: enterDur,
              ease: "power2.out",
              overwrite: "auto",
              rotateX: -maxAngle,
              rotateY: maxAngle,
              immediateRender: false,
            });
          } else {
            // Reset all other cubes immediately
            gsap.to(cube, {
              duration: leaveDur,
              ease: "power2.out",
              overwrite: "auto",
              rotateX: 0,
              rotateY: 0,
              immediateRender: false,
            });
          }
        });
    },
    [maxAngle, enterDur, leaveDur]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      const rect = sceneRef.current!.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;
      const colCenter = (e.clientX - rect.left) / cellW;
      const rowCenter = (e.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() =>
        tiltAt(rowCenter, colCenter)
      );

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [gridSize, tiltAt]
  );

  const resetAll = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.querySelectorAll<HTMLDivElement>(".cube").forEach((cube) =>
      gsap.to(cube, {
        duration: leaveDur,
        rotateX: 0,
        rotateY: 0,
        ease: "power2.out",
        overwrite: "auto",
        immediateRender: false,
      })
    );
  }, [leaveDur]);

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      const rect = sceneRef.current!.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;

      const touch = e.touches[0];
      const colCenter = (touch.clientX - rect.left) / cellW;
      const rowCenter = (touch.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() =>
        tiltAt(rowCenter, colCenter)
      );

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [gridSize, tiltAt]
  );

  const onTouchStart = useCallback(() => {
    userActiveRef.current = true;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!sceneRef.current) return;
    resetAll();
  }, [resetAll]);

  const onClick = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!rippleOnClick || !sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;

      const clientX =
        (e as MouseEvent).clientX ||
        ((e as TouchEvent).touches && (e as TouchEvent).touches[0].clientX);
      const clientY =
        (e as MouseEvent).clientY ||
        ((e as TouchEvent).touches && (e as TouchEvent).touches[0].clientY);

      const colHit = Math.floor((clientX - rect.left) / cellW);
      const rowHit = Math.floor((clientY - rect.top) / cellH);

      const baseRingDelay = 0.15;
      const baseAnimDur = 0.3;
      const baseHold = 0.6;

      const spreadDelay = baseRingDelay / rippleSpeed;
      const animDuration = baseAnimDur / rippleSpeed;
      const holdTime = baseHold / rippleSpeed;

      const rings: Record<number, HTMLDivElement[]> = {};
      sceneRef.current
        .querySelectorAll<HTMLDivElement>(".cube")
        .forEach((cube) => {
          const r = +cube.dataset.row!;
          const c = +cube.dataset.col!;
          const dist = Math.hypot(r - rowHit, c - colHit);
          const ring = Math.round(dist);
          if (!rings[ring]) rings[ring] = [];
          rings[ring].push(cube);
        });

      Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((ring) => {
          const delay = ring * spreadDelay;
          const faces = rings[ring].flatMap((cube) =>
            Array.from(cube.querySelectorAll<HTMLElement>(".cube-face"))
          );

          gsap.to(faces, {
            backgroundColor: rippleColor,
            duration: animDuration,
            delay,
            ease: "power3.out",
          });
          gsap.to(faces, {
            backgroundColor: faceColor,
            duration: animDuration,
            delay: delay + animDuration + holdTime,
            ease: "power3.out",
          });
        });
    },
    [rippleOnClick, gridSize, faceColor, rippleColor, rippleSpeed]
  );

  // Remove auto animation effect since we want manual control
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", resetAll);
    el.addEventListener("click", onClick);

    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", resetAll);
      el.removeEventListener("click", onClick);

      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);

      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [onPointerMove, resetAll, onClick, onTouchMove, onTouchStart, onTouchEnd]);

  const cells = Array.from({ length: gridSize });

  // Helper function to get arena data for a specific position
  const getArenaForPosition = (row: number, col: number): ArenaData | null => {
    return (
      arenaData.find(
        (arena) =>
          arena.cubePosition.row === row && arena.cubePosition.col === col
      ) || null
    );
  };

  // Generate positions only for arenas that have data
  const getArenaPositions = (): Array<{
    row: number;
    col: number;
    arena: ArenaData;
  }> => {
    return arenaData.map((arena, index) => {
      // Calculate centered position based on index and gridSize
      const totalCubes = arenaData.length;
      const actualGridSize = Math.ceil(Math.sqrt(totalCubes));

      // For better centering, especially with fewer cubes
      let row: number, col: number;

      if (totalCubes === 1) {
        // Single cube in center
        row = Math.floor(gridSize / 2);
        col = Math.floor(gridSize / 2);
      } else if (totalCubes <= 4) {
        // 2x2 grid centered
        const positions = [
          {
            row: Math.floor(gridSize / 2) - 1,
            col: Math.floor(gridSize / 2) - 1,
          },
          { row: Math.floor(gridSize / 2) - 1, col: Math.floor(gridSize / 2) },
          { row: Math.floor(gridSize / 2), col: Math.floor(gridSize / 2) - 1 },
          { row: Math.floor(gridSize / 2), col: Math.floor(gridSize / 2) },
        ];
        const pos = positions[index] || positions[0];
        row = pos.row;
        col = pos.col;
      } else {
        // Use arena's cubePosition if available, otherwise calculate based on index
        if (
          arena.cubePosition?.row !== undefined &&
          arena.cubePosition?.col !== undefined
        ) {
          row = arena.cubePosition.row;
          col = arena.cubePosition.col;
        } else {
          // Calculate position with better centering
          const startRow = Math.floor((gridSize - actualGridSize) / 2);
          const startCol = Math.floor((gridSize - actualGridSize) / 2);
          row = startRow + Math.floor(index / actualGridSize);
          col = startCol + (index % actualGridSize);
        }
      }

      return { row, col, arena };
    });
  };

  const arenaPositions = getArenaPositions();

  const sceneStyle: React.CSSProperties = {
    gridTemplateColumns: cubeSize
      ? `repeat(${gridSize}, ${cubeSize}px)`
      : `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: cubeSize
      ? `repeat(${gridSize}, ${cubeSize}px)`
      : `repeat(${gridSize}, 1fr)`,
    columnGap: colGap,
    rowGap: rowGap,
    perspective: "99999999px",
    gridAutoRows: "1fr",
  };

  const wrapperStyle = {
    "--cube-face-border": borderStyle,
    "--cube-face-bg": faceColor,
    "--cube-face-shadow":
      shadow === true ? "0 0 6px rgba(0,0,0,.5)" : shadow || "none",
    ...(cubeSize
      ? {
          width: `${gridSize * cubeSize + (gridSize - 1) * 60}px`, // Account for gaps
          height: `${gridSize * cubeSize + (gridSize - 1) * 60}px`, // Account for gaps
        }
      : {}),
  } as React.CSSProperties;

  return (
    <div
      className="relative flex items-center justify-center"
      style={wrapperStyle}
    >
      <div ref={sceneRef} className="grid" style={sceneStyle}>
        {arenaPositions.map(({ row, col, arena }) => {
          const isClickable = !!arena;
          const cubeKey = `${row}-${col}`;
          const isHovered = hoveredCube === cubeKey;

          return (
            <div
              key={cubeKey}
              className="relative aspect-square h-full w-full"
              data-row={row}
              data-col={col}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
              }}
            >
              {/* Floating Enter Arena Text - Outside cube, positioned absolutely */}
              {arena && (
                <div
                  className={`pointer-events-none absolute inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
                    isHovered ? "scale-100 opacity-100" : "scale-75 opacity-0"
                  }`}
                  style={{
                    transformStyle: "flat", // Prevent 3D inheritance
                    transform: "none", // Remove any 3D transforms
                  }}
                >
                  <span className="drop-shadow-4xl rounded bg-black/50 px-3 py-1 text-lg font-bold text-white">
                    Enter Arena
                  </span>
                </div>
              )}

              {/* Cube with 3D transformation */}
              <div
                className={`cube relative aspect-square h-full w-full [transform-style:preserve-3d] ${
                  isClickable ? "cursor-pointer" : ""
                } transition-all duration-300`}
                data-row={row}
                data-col={col}
                onClick={() => {
                  if (arena && onCubeClick) {
                    onCubeClick(arena, row, col);
                  }
                }}
                onMouseEnter={() => {
                  if (arena) {
                    setHoveredCube(cubeKey);
                  }
                  if (onCubeHover) {
                    onCubeHover(arena, row, col);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredCube(null);
                  if (onCubeHover) {
                    onCubeHover(null, row, col);
                  }
                }}
              >
                <span className="pointer-events-none absolute -inset-9" />

                {/* Battle Image - Inside 3D cube space */}
                {arena && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                      isHovered
                        ? "scale-90 opacity-60"
                        : "scale-100 opacity-100"
                    }`}
                    style={{
                      transform: "translateZ(25px)", // Position icon inside the cube
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {arena.battle_image ? (
                      <img
                        src={arena.battle_image}
                        alt={arena.battle_name || "Battle"}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    ) : (
                      <SolanaIcon width={64} height={64} />
                    )}
                  </div>
                )}

                {/* Top face */}
                <div
                  className="cube-face absolute inset-0 flex items-center justify-center"
                  style={{
                    background: faceColor,
                    border: arena
                      ? `2px solid #6fb7a5`
                      : "var(--cube-face-border)", // Use primary color
                    boxShadow: "var(--cube-face-shadow)",
                    transform: "translateY(-50%) rotateX(90deg)",
                  }}
                />
                {/* Bottom face */}
                <div
                  className="cube-face absolute inset-0 flex items-center justify-center"
                  style={{
                    background: faceColor,
                    border: arena
                      ? `2px solid #6fb7a5`
                      : "var(--cube-face-border)", // Use primary color
                    boxShadow: "var(--cube-face-shadow)",
                    transform: "translateY(50%) rotateX(-90deg)",
                  }}
                />
                {/* Left face */}
                <div
                  className="cube-face absolute inset-0 flex items-center justify-center"
                  style={{
                    background: faceColor,
                    border: arena
                      ? `2px solid #6fb7a5`
                      : "var(--cube-face-border)", // Use primary color
                    boxShadow: "var(--cube-face-shadow)",
                    transform: "translateX(-50%) rotateY(-90deg)",
                  }}
                />
                {/* Right face */}
                <div
                  className="cube-face absolute inset-0 flex items-center justify-center"
                  style={{
                    background: faceColor,
                    border: arena
                      ? `2px solid #6fb7a5`
                      : "var(--cube-face-border)", // Use primary color
                    boxShadow: "var(--cube-face-shadow)",
                    transform: "translateX(50%) rotateY(90deg)",
                  }}
                />
                {/* Back face */}
                <div
                  className="cube-face absolute inset-0 flex items-center justify-center"
                  style={{
                    background: faceColor,
                    border: arena
                      ? `2px solid #6fb7a5`
                      : "var(--cube-face-border)", // Use primary color
                    boxShadow: "var(--cube-face-shadow)",
                    transform: "rotateY(-90deg) translateX(50%) rotateY(90deg)",
                  }}
                />
                {/* Front face */}
                <div
                  className="cube-face absolute inset-0 flex items-center justify-center"
                  style={{
                    background: arena ? "rgba(111, 183, 165, 0.1)" : faceColor,
                    border: arena
                      ? `2px solid #6fb7a5`
                      : "var(--cube-face-border)", // Use primary color
                    boxShadow: "var(--cube-face-shadow)",
                    transform:
                      "rotateY(90deg) translateX(-50%) rotateY(-90deg)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cubes;
