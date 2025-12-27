import { useEffect, useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

// 초기 노드 생성 함수
const createInitialNodes = (jobs) => {
  return jobs.slice(0, 6).map((job, idx) => ({
    id: job.job_slug,
    type: 'default',
    data: { label: job.name },
    position: { 
      x: (idx % 3) * 250 + 100, 
      y: Math.floor(idx / 3) * 200 + 100 
    },
    style: {
      background: '#fff',
      border: '2px solid #3b82f6',
      borderRadius: 8,
      padding: 12,
      fontSize: 13,
      fontWeight: 500,
    }
  }));
};

// 초기 엣지 생성 함수
const createInitialEdges = () => {
  return [
    {
      id: 'e1-2',
      source: 'backend-spring',
      target: 'backend-node',
      label: 'similar',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#3b82f6' }
    },
    {
      id: 'e1-6',
      source: 'backend-spring',
      target: 'devops-engineer',
      label: 'transition',
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#8b5cf6' }
    },
    {
      id: 'e1-5',
      source: 'backend-spring',
      target: 'data-engineer',
      label: 'expand',
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#10b981' }
    },
    {
      id: 'e3-4',
      source: 'frontend-react',
      target: 'data-analyst',
      label: 'similar',
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#3b82f6' }
    }
  ];
};

export default function GraphCanvas({ selectedSlug, onNodeClick, jobs }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    jobs ? createInitialNodes(jobs) : []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(createInitialEdges());

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)), 
    [setEdges]
  );

  // 선택된 노드 강조
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          border: node.id === selectedSlug ? '3px solid #3b82f6' : '2px solid #3b82f6',
          background: node.id === selectedSlug ? '#eff6ff' : '#fff',
        }
      }))
    );
  }, [selectedSlug, setNodes]);

  const handleNodeClick = useCallback((event, node) => {
    onNodeClick(node.id);
  }, [onNodeClick]);

  return (
    <div style={{ height: '100%', background: '#fafafa', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => node.id === selectedSlug ? '#3b82f6' : '#9ca3af'}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}