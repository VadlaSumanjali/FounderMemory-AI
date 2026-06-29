"use client";

import { useEffect, useState, useRef } from "react";
import { Network, Info, RefreshCw } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
}

export default function ExplorerPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragNodeRef = useRef<GraphNode | null>(null);

  // Fetch graph data
  const fetchData = async () => {
    try {
      const graphRes = await fetch("/api/graph");
      if (graphRes.ok) {
        const graphData = await graphRes.json();
        
        // Map nodes and links
        const initialNodes = graphData.nodes.map((n: { id: string; label: string; type: string }) => ({
          ...n,
          x: Math.random() * 500 + 100,
          y: Math.random() * 300 + 100,
          vx: 0,
          vy: 0,
        }));
        setNodes(initialNodes);
        setLinks(graphData.links);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Force-directed layout physics simulation in canvas
  useEffect(() => {
    if (nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const width = canvas.width;
    const height = canvas.height;

    // Simulation loop
    const step = () => {
      // 1. Apply forces (repulsion between all nodes)
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = (nodeB.x || 0) - (nodeA.x || 0);
          const dy = (nodeB.y || 0) - (nodeA.y || 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < 250) {
            const force = (250 - dist) * 0.04;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (nodeB !== dragNodeRef.current) {
              nodeB.vx = (nodeB.vx || 0) + fx;
              nodeB.vy = (nodeB.vy || 0) + fy;
            }
            if (nodeA !== dragNodeRef.current) {
              nodeA.vx = (nodeA.vx || 0) - fx;
              nodeA.vy = (nodeA.vy || 0) - fy;
            }
          }
        }
      }

      // 2. Apply link forces (attraction along edges)
      for (const link of links) {
        const sourceNode = nodes.find((n) => n.id === link.source);
        const targetNode = nodes.find((n) => n.id === link.target);

        if (sourceNode && targetNode) {
          const dx = (targetNode.x || 0) - (sourceNode.x || 0);
          const dy = (targetNode.y || 0) - (sourceNode.y || 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          const targetDist = 100; // Desired bond length
          const force = (dist - targetDist) * 0.03;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (targetNode !== dragNodeRef.current) {
            targetNode.vx = (targetNode.vx || 0) - fx;
            targetNode.vy = (targetNode.vy || 0) - fy;
          }
          if (sourceNode !== dragNodeRef.current) {
            sourceNode.vx = (sourceNode.vx || 0) + fx;
            sourceNode.vy = (sourceNode.vy || 0) + fy;
          }
        }
      }

      // 3. Center gravity attraction
      const centerX = width / 2;
      const centerY = height / 2;
      for (const node of nodes) {
        if (node === dragNodeRef.current) continue;
        const dx = centerX - (node.x || 0);
        const dy = centerY - (node.y || 0);
        node.vx = (node.vx || 0) + dx * 0.005;
        node.vy = (node.vy || 0) + dy * 0.005;
      }

      // 4. Update coordinates & apply damping friction
      for (const node of nodes) {
        if (node === dragNodeRef.current) continue;
        node.vx = (node.vx || 0) * 0.85;
        node.vy = (node.vy || 0) * 0.85;
        node.x = (node.x || 0) + (node.vx || 0);
        node.y = (node.y || 0) + (node.vy || 0);

        // Clamp to screen borders
        node.x = Math.max(20, Math.min(width - 20, node.x));
        node.y = Math.max(20, Math.min(height - 20, node.y));
      }

      // 5. Draw Canvas Frame
      ctx.clearRect(0, 0, width, height);

      // Draw Links
      ctx.lineWidth = 1;
      for (const link of links) {
        const sourceNode = nodes.find((n) => n.id === link.source);
        const targetNode = nodes.find((n) => n.id === link.target);

        if (sourceNode && targetNode) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.beginPath();
          ctx.moveTo(sourceNode.x || 0, sourceNode.y || 0);
          ctx.lineTo(targetNode.x || 0, targetNode.y || 0);
          ctx.stroke();

          // Link label on hover (midpoint)
          const midX = ((sourceNode.x || 0) + (targetNode.x || 0)) / 2;
          const midY = ((sourceNode.y || 0) + (targetNode.y || 0)) / 2;
          ctx.font = "8px monospace";
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          ctx.fillText(link.type, midX, midY);
        }
      }

      // Draw Nodes
      for (const node of nodes) {
        const isSelected = selectedNode?.id === node.id;
        const color =
          node.type === "Startup"
            ? "#6366f1"
            : node.type === "Founder"
            ? "#a855f7"
            : node.type === "Decision"
            ? "#f59e0b"
            : node.type === "Task"
            ? "#10b981"
            : "#06b6d4";

        ctx.beginPath();
        ctx.arc(node.x || 0, node.y || 0, isSelected ? 9 : 6, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        if (isSelected) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw Labels
        ctx.font = isSelected ? "bold 10px sans-serif" : "9px sans-serif";
        ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.7)";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x || 0, (node.y || 0) - 12);
      }

      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [nodes, links, selectedNode]);

  // Handle Drag & Selection events on Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    const clickedNode = nodes.find((n) => {
      const dx = (n.x || 0) - x;
      const dy = (n.y || 0) - y;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    if (clickedNode) {
      dragNodeRef.current = clickedNode;
      setSelectedNode(clickedNode);
    } else {
      setSelectedNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragNodeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragNodeRef.current.x = e.clientX - rect.left;
    dragNodeRef.current.y = e.clientY - rect.top;
  };

  const handleMouseUp = () => {
    dragNodeRef.current = null;
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Network className="w-8 h-8 text-indigo-400" /> Memory Graph Explorer
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Visualizing relationships and operational facts stored in Hindsight Cloud.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive canvas graph widget */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-4 flex flex-col items-center relative overflow-hidden h-[500px]">
          <span className="absolute top-4 left-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 z-10">
            <Info className="w-3.5 h-3.5" /> Drag nodes to explore connections
          </span>

          <canvas
            ref={canvasRef}
            width={750}
            height={460}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full bg-zinc-950/40 rounded-xl cursor-grab active:cursor-grabbing"
          />
        </div>

        {/* Selected Entity Inspector Panel */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-[500px]">
          {selectedNode ? (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full">
                  {selectedNode.type} Node
                </span>
                <h3 className="font-extrabold text-lg text-white mt-3 leading-tight">
                  {selectedNode.label}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="text-xs space-y-1">
                  <span className="text-zinc-500 font-bold uppercase block">Node ID</span>
                  <code className="text-zinc-300 font-mono select-all bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                    {selectedNode.id}
                  </code>
                </div>

                <div className="text-xs space-y-2">
                  <span className="text-zinc-500 font-bold uppercase block">Connected Entities</span>
                  <div className="space-y-1">
                    {links
                      .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                      .map((l, i) => {
                        const targetId = l.source === selectedNode.id ? l.target : l.source;
                        const targetNodeName = nodes.find((n) => n.id === targetId)?.label || targetId;
                        return (
                          <div key={i} className="flex items-center justify-between bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/40">
                            <span className="text-zinc-300 truncate">{targetNodeName}</span>
                            <span className="text-[8px] font-bold bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                              {l.type}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-zinc-500">
              <Network className="w-10 h-10 text-zinc-700 animate-pulse" />
              <p className="text-xs font-semibold max-w-[200px]">
                Click on any node in the graph to inspect its properties and linkages.
              </p>
            </div>
          )}

          <div className="text-[10px] text-zinc-600 font-semibold border-t border-white/5 pt-4 text-center">
            Entity relations generated dynamically via Postgres DB.
          </div>
        </div>
      </div>
    </div>
  );
}
