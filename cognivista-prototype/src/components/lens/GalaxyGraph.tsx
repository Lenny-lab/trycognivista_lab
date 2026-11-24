"use client";

import React, { useEffect, useRef, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import type { DisciplinePerspective, LensRelation } from "@/lib/types";
import { useCognitive } from "@/components/providers/CognitiveProvider";

interface GalaxyGraphProps {
  topic: string;
  perspectives: DisciplinePerspective[];
  relations: LensRelation[];
  selectedDiscipline: string | null;
  onSelectDiscipline: (discipline: string) => void;
}

const APPLE_NODE_COLORS: Record<string, { dot: string; tintLight: string; tintDark: string }> = {
  indigo: { dot: "#5856D6", tintLight: "#EEEEFC", tintDark: "#242442" },
  cyan: { dot: "#008299", tintLight: "#E8F7FA", tintDark: "#1A333A" },
  emerald: { dot: "#34C759", tintLight: "#EAF9EE", tintDark: "#1A3523" },
  amber: { dot: "#FF9500", tintLight: "#FFF4E5", tintDark: "#382914" },
  rose: { dot: "#FF3B30", tintLight: "#FFEBE9", tintDark: "#3B1B1B" },
  violet: { dot: "#AF52DE", tintLight: "#F6ECFC", tintDark: "#2E1E3B" },
};

const WIDTH = 920;
const HEIGHT = 480;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;

function computeInitialPositions(perspectives: DisciplinePerspective[]) {
  const map: Record<string, { x: number; y: number }> = {};
  const rx = 310;
  const ry = 172;
  const count = Math.max(perspectives.length, 1);
  perspectives.forEach((p, idx) => {
    const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
    map[p.discipline] = {
      x: CX + Math.cos(angle) * rx,
      y: CY + Math.sin(angle) * ry,
    };
  });
  return map;
}

export function GalaxyGraph({
  topic,
  perspectives,
  relations,
  selectedDiscipline,
  onSelectDiscipline,
}: GalaxyGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() =>
    computeInitialPositions(perspectives)
  );
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [hoveredRelation, setHoveredRelation] = useState<LensRelation | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    setPositions(computeInitialPositions(perspectives));
  }, [perspectives]);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;
    const nx = CX + (rawX - CX) / zoom;
    const ny = CY + (rawY - CY) / zoom;
    setPositions((prev) => ({
      ...prev,
      [draggingNode]: {
        x: Math.max(88, Math.min(WIDTH - 88, nx)),
        y: Math.max(60, Math.min(HEIGHT - 60, ny)),
      },
    }));
  };

  const handleReset = () => {
    setPositions(computeInitialPositions(perspectives));
    setZoom(1);
  };

  const { theme } = useCognitive();
  const isDark = theme === "dark";
  const tensionColor = isDark ? "#FF6961" : "#D70015";
  const synergyColor = isDark ? "#64D2FF" : "#0071E3";
  const nodeFill = isDark ? "#111116" : "#FFFFFF";
  const nodeStroke = isDark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.09)";
  const textFill = isDark ? "#F5F5F7" : "#1D1D1F";
  const orbitStroke = isDark ? "rgba(150,180,255,0.13)" : "rgba(0,113,227,0.14)";
  const spokeStroke = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";

  return (
    <div className="graph-cinematic p-6 sm:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-tight">
            跨学科概念星系图谱
          </h2>
          <p className="text-[14px] text-[var(--text-tertiary)] mt-1">
            拖拽任意学科节点探索空间结构，点击节点切换下方深度解构，悬停连线查看张力与协同
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4 text-[13.5px]">
            <span className="inline-flex items-center gap-2 text-[#ff6961] font-medium">
              <span
                className="w-5 h-[2.5px] rounded-full inline-block"
                style={{ backgroundColor: tensionColor }}
              />
              认知张力
            </span>
            <span
              className="inline-flex items-center gap-2 font-medium text-[#64d2ff]"
            >
              <span
                className="w-5 h-[2.5px] rounded-full inline-block"
                style={{ backgroundColor: synergyColor }}
              />
              理论协同
            </span>
          </div>

          <div className="graph-control inline-flex items-center rounded-full p-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))}
              className="p-2 rounded-full transition apple-focus"
              title="放大"
              aria-label="放大图谱"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))))}
              className="p-2 rounded-full transition apple-focus"
              title="缩小"
              aria-label="缩小图谱"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-full transition apple-focus"
              title="重置布局"
              aria-label="重置布局"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 悬停关系摘要条 */}
      <div className="min-h-[36px] flex items-center">
        {hoveredRelation ? (
          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[14px] font-medium border"
            style={
              hoveredRelation.type === "tension"
                ? {
                    backgroundColor: "rgba(255,105,97,0.08)",
                    borderColor: "rgba(255,105,97,0.22)",
                    color: "#FF6961",
                  }
                : {
                    backgroundColor: "rgba(100,210,255,0.08)",
                    borderColor: "rgba(100,210,255,0.22)",
                    color: "#64D2FF",
                  }
            }
          >
            <span className="font-semibold">
              {hoveredRelation.from} ↔ {hoveredRelation.to}
            </span>
            <span className="opacity-45">·</span>
            <span>{hoveredRelation.label}</span>
          </div>
        ) : (
          <div className="text-[14px] text-[var(--text-tertiary)]">
            悬停任意连线即可洞察两大学科间的底层张力或方法论协同
          </div>
        )}
      </div>

      {/* Spacious Freeform Vector Canvas */}
      <div className="graph-canvas w-full select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-[380px] sm:h-[460px] touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDraggingNode(null)}
          onPointerLeave={() => setDraggingNode(null)}
        >
          <defs>
            <pattern
              id="appleDotGridLg"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1.15"
                fill={isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)"}
              />
            </pattern>
            <filter id="appleNodeShadowLg" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="6"
                floodColor="#000000"
                floodOpacity={isDark ? "0.55" : "0.08"}
              />
            </filter>
          </defs>

          <rect width={WIDTH} height={HEIGHT} fill="url(#appleDotGridLg)" />

          <g transform={`translate(${CX}, ${CY}) scale(${zoom}) translate(${-CX}, ${-CY})`}>
            <ellipse
              cx={CX}
              cy={CY}
              rx={310}
              ry={172}
              fill="none"
              stroke={orbitStroke}
              strokeDasharray="5 7"
            />

            {perspectives.map((p) => {
              const pos = positions[p.discipline];
              if (!pos) return null;
              const active = selectedDiscipline === p.discipline;
              return (
                <line
                  key={`spoke-${p.discipline}`}
                  x1={CX}
                  y1={CY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={active ? synergyColor : spokeStroke}
                  strokeWidth={active ? 2.2 : 1.2}
                  strokeDasharray="4 5"
                />
              );
            })}

            {relations.map((rel, idx) => {
              const p1 = positions[rel.from];
              const p2 = positions[rel.to];
              if (!p1 || !p2) return null;
              const isTension = rel.type === "tension";
              const isHovered =
                hoveredRelation?.from === rel.from && hoveredRelation?.to === rel.to;
              const mx = (p1.x + p2.x) / 2;
              const my = (p1.y + p2.y) / 2;
              const strokeCol = isTension ? tensionColor : synergyColor;

              return (
                <g
                  key={`rel-${idx}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredRelation(rel)}
                  onMouseLeave={() => setHoveredRelation(null)}
                >
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="transparent"
                    strokeWidth={18}
                  />
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={strokeCol}
                    strokeOpacity={isHovered ? 1 : 0.48}
                    strokeWidth={isHovered ? 3.2 : 2}
                    strokeDasharray={isTension ? "7 5" : undefined}
                  />
                  <circle
                    cx={mx}
                    cy={my}
                    r={isHovered ? 6 : 4}
                    fill={strokeCol}
                  />
                </g>
              );
            })}

            {/* Center Core Topic Node */}
            <g filter="url(#appleNodeShadowLg)">
              <circle
                cx={CX}
                cy={CY}
                r={76}
                fill={nodeFill}
                stroke={synergyColor}
                strokeWidth={2.2}
              />
              <foreignObject x={CX - 62} y={CY - 44} width={124} height={88}>
                <div className="w-full h-full flex flex-col items-center justify-center text-center px-1.5">
                  <span
                    className="text-[10px] font-mono font-semibold uppercase tracking-wider"
                    style={{ color: synergyColor }}
                  >
                    核心议题
                  </span>
                  <span
                    className="text-[12.5px] font-semibold leading-snug line-clamp-3 mt-1 break-words"
                    style={{ color: textFill }}
                  >
                    {topic}
                  </span>
                </div>
              </foreignObject>
            </g>

            {/* 6 Large Legible Discipline Pill Nodes */}
            {perspectives.map((p) => {
              const pos = positions[p.discipline];
              if (!pos) return null;
              const palette = APPLE_NODE_COLORS[p.colorToken] || APPLE_NODE_COLORS.indigo;
              const isSelected = selectedDiscipline === p.discipline;
              return (
                <g
                  key={p.discipline}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-grab active:cursor-grabbing"
                  filter="url(#appleNodeShadowLg)"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setDraggingNode(p.discipline);
                    onSelectDiscipline(p.discipline);
                  }}
                >
                  <rect
                    x={-68}
                    y={-27}
                    width={136}
                    height={54}
                    rx={27}
                    fill={isSelected ? (isDark ? palette.tintDark : palette.tintLight) : nodeFill}
                    stroke={isSelected ? palette.dot : nodeStroke}
                    strokeWidth={isSelected ? 2.4 : 1.2}
                  />
                  <circle cx={-44} cy={0} r={6} fill={palette.dot} />
                  <text
                    x={10}
                    y={0}
                    textAnchor="middle"
                    dy="0.35em"
                    fill={textFill}
                    fontSize={15}
                    fontWeight={600}
                  >
                    {p.discipline}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
