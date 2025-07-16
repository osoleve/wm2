// src/components/TreeVisualizer.jsx
import React, { useState, useEffect, useRef } from 'react';
import './TreeVisualizer.css';

const TreeVisualizer = ({ 
  treeId, 
  currentMessageId,
  onNavigateToNode,
  conversationTreeService 
}) => {
  const [treeData, setTreeData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(currentMessageId);
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState('0 0 800 600');
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (treeId) {
      loadTreeData();
    }
  }, [treeId]);

  const loadTreeData = () => {
    const tree = conversationTreeService.getAllTrees()[treeId];
    if (tree) {
      // Convert tree structure to visualization format
      const nodes = Array.from(tree.nodes.values());
      const links = [];
      
      nodes.forEach(node => {
        if (node.children) {
          node.children.forEach(childId => {
            links.push({
              source: node.id,
              target: childId
            });
          });
        }
      });

      setTreeData({ nodes, links });
    }
  };

  const calculateNodePositions = (nodes, links) => {
    // Simple tree layout algorithm
    const nodeMap = new Map();
    const levels = new Map();
    
    // Initialize nodes
    nodes.forEach(node => {
      nodeMap.set(node.id, {
        ...node,
        x: 0,
        y: 0,
        level: 0
      });
    });

    // Calculate levels (depth)
    const calculateLevel = (nodeId, level = 0) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;
      
      node.level = Math.max(node.level, level);
      levels.set(level, (levels.get(level) || 0) + 1);
      
      if (node.children) {
        node.children.forEach(childId => {
          calculateLevel(childId, level + 1);
        });
      }
    };

    // Find root nodes and calculate levels
    nodes.forEach(node => {
      if (!node.parentId) {
        calculateLevel(node.id);
      }
    });

    // Position nodes
    const levelWidth = 150;
    const nodeHeight = 80;
    const levelCounts = new Map();

    nodeMap.forEach(node => {
      const level = node.level;
      const count = levelCounts.get(level) || 0;
      const totalAtLevel = levels.get(level) || 1;
      
      node.x = level * levelWidth + 50;
      node.y = (count - totalAtLevel / 2) * nodeHeight + 300;
      
      levelCounts.set(level, count + 1);
    });

    return nodeMap;
  };

  const handleNodeClick = (nodeId) => {
    setSelectedNodeId(nodeId);
    onNavigateToNode(nodeId);
  };

  const handlePanStart = (e) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handlePanMove = (e) => {
    if (!isPanning) return;
    
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    
    const [x, y, width, height] = viewBox.split(' ').map(Number);
    setViewBox(`${x - dx} ${y - dy} ${width} ${height}`);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const handleZoom = (delta) => {
    const [x, y, width, height] = viewBox.split(' ').map(Number);
    const factor = delta > 0 ? 0.9 : 1.1;
    const newWidth = width * factor;
    const newHeight = height * factor;
    const dx = (width - newWidth) / 2;
    const dy = (height - newHeight) / 2;
    
    setViewBox(`${x + dx} ${y + dy} ${newWidth} ${newHeight}`);
  };

  if (!treeData) return <div>Loading tree...</div>;

  const nodePositions = calculateNodePositions(treeData.nodes, treeData.links);

  return (
    <div className="tree-visualizer">
      <div className="tree-controls">
        <button onClick={() => handleZoom(1)}>➕ Zoom In</button>
        <button onClick={() => handleZoom(-1)}>➖ Zoom Out</button>
        <button onClick={() => setViewBox('0 0 800 600')}>🔄 Reset</button>
      </div>
      
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={viewBox}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        className={isPanning ? 'panning' : ''}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--text-muted)"
            />
          </marker>
        </defs>

        {/* Draw links */}
        <g className="links">
          {treeData.links.map((link, idx) => {
            const source = nodePositions.get(link.source);
            const target = nodePositions.get(link.target);
            if (!source || !target) return null;

            return (
              <line
                key={idx}
                x1={source.x + 60}
                y1={source.y}
                x2={target.x - 60}
                y2={target.y}
                stroke="var(--border-color)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </g>

        {/* Draw nodes */}
        <g className="nodes">
          {Array.from(nodePositions.values()).map(node => (
            <g
              key={node.id}
              transform={`translate(${node.x - 60}, ${node.y - 25})`}
              onClick={() => handleNodeClick(node.id)}
              className={`tree-node ${node.id === selectedNodeId ? 'selected' : ''} ${node.id === currentMessageId ? 'current' : ''}`}
            >
              <rect
                width="120"
                height="50"
                rx="8"
                fill={node.role === 'user' ? 'var(--gradient-sage)' : 'var(--bg-secondary)'}
                stroke={node.id === selectedNodeId ? 'var(--accent-color)' : 'var(--border-color)'}
                strokeWidth={node.id === selectedNodeId ? '3' : '1'}
              />
              <text
                x="60"
                y="20"
                textAnchor="middle"
                fill={node.role === 'user' ? 'white' : 'var(--text-primary)'}
                fontSize="12"
                fontWeight="500"
              >
                {node.role === 'user' ? 'User' : 'Assistant'}
              </text>
              <text
                x="60"
                y="35"
                textAnchor="middle"
                fill={node.role === 'user' ? 'white' : 'var(--text-secondary)'}
                fontSize="10"
              >
                {node.content.substring(0, 20)}...
              </text>
              {node.isPrism && (
                <text
                  x="60"
                  y="48"
                  textAnchor="middle"
                  fill="var(--tab-highlight)"
                  fontSize="10"
                  fontWeight="bold"
                >
                  💎
                </text>
              )}
              {node.children && node.children.length > 1 && (
                <circle
                  cx="110"
                  cy="10"
                  r="8"
                  fill="var(--tab-highlight)"
                  stroke="var(--bg-primary)"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default TreeVisualizer;