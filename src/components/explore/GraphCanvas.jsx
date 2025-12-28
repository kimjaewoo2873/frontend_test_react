import { useEffect, useCallback, useState, useRef } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchJobGraph } from '../../lib/supabase/jobsApi';

const EDGE_TYPES = {
  similar: { label: '유사 직무', color: '#3b82f6', icon: '🔗' },
  transition: { label: '전환 가능', color: '#8b5cf6', icon: '🔄' },
  prerequisite: { label: '선행 경로', color: '#10b981', icon: '⬆️' },
  expansion: { label: '확장 경로', color: '#f59e0b', icon: '📈' }
};

// Force-directed 레이아웃
const calculateForceLayout = (nodes, edges) => {
  const nodeMap = new Map(nodes.map(n => [n.id, { 
    ...n, 
    x: Math.random() * 800, 
    y: Math.random() * 600, 
    vx: 0, 
    vy: 0 
  }]));
  
  for (let i = 0; i < 100; i++) {
    nodeMap.forEach((node1, id1) => {
      nodeMap.forEach((node2, id2) => {
        if (id1 !== id2) {
          const dx = node2.x - node1.x;
          const dy = node2.y - node1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 5000 / (dist * dist);
          node1.vx -= (dx / dist) * force;
          node1.vy -= (dy / dist) * force;
        }
      });
    });

    edges.forEach(edge => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (source && target) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * 0.01;
        source.vx += (dx / dist) * force;
        source.vy += (dy / dist) * force;
        target.vx -= (dx / dist) * force;
        target.vy -= (dy / dist) * force;
      }
    });

    nodeMap.forEach(node => {
      node.x += node.vx * 0.5;
      node.y += node.vy * 0.5;
      node.vx *= 0.85;
      node.vy *= 0.85;
    });
  }

  return nodes.map(n => ({
    ...n,
    position: {
      x: nodeMap.get(n.id).x,
      y: nodeMap.get(n.id).y
    }
  }));
};

export default function GraphCanvas({ selectedSlug, onNodeClick, showAllNodes = true, selectedJobs = [] }) {
  const [allNodesData, setAllNodesData] = useState([]); // 원본 노드 데이터 (불변)
  const [allEdgesData, setAllEdgesData] = useState([]); // 원본 엣지 데이터
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [edgeFilters, setEdgeFilters] = useState({
    similar: true,
    transition: true,
    prerequisite: true,
    expansion: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const { fitView, setCenter } = useReactFlow();
  
  // 각 노드의 현재 위치를 추적하는 ref
  const nodePositionsRef = useRef({});

  // 초기 데이터 로드
  useEffect(() => {
    async function loadGraph() {
      setLoading(true);
      setError(null);

      const { nodes: graphNodes, edges: graphEdges, error: graphError } = await fetchJobGraph();

      if (graphError) {
        console.error('Failed to load graph:', graphError);
        setError(graphError.message || '그래프 데이터를 불러오는데 실패했습니다.');
      } else {
        const layoutedNodes = calculateForceLayout(graphNodes, graphEdges);
        
        // 초기 위치 저장
        layoutedNodes.forEach(node => {
          nodePositionsRef.current[node.id] = { ...node.position };
        });
        
        setAllNodesData(layoutedNodes);
        setAllEdgesData(graphEdges);
      }

      setLoading(false);
    }

    if (!initialized) {
      loadGraph();
      setInitialized(true);
    }
  }, [initialized]);

  // showAllNodes와 selectedJobs에 따라 노드/엣지 필터링
  useEffect(() => {
    if (allNodesData.length === 0) return;

    if (showAllNodes) {
      // 전체 보기 모드 - ref의 위치 사용
      const nodesWithPosition = allNodesData.map(node => ({
        ...node,
        position: nodePositionsRef.current[node.id] || node.position
      }));
      setNodes(nodesWithPosition);
      
      // 엣지 필터 적용
      const filteredEdges = allEdgesData.filter(edge => {
        const relationType = edge.data?.relationType || edge.label;
        return edgeFilters[relationType];
      });
      setEdges(filteredEdges);
    } else {
      // 숨김 모드 - 선택된 직업만 표시
      if (selectedJobs.length === 0) {
        setNodes([]);
        setEdges([]);
      } else {
        const selectedNodeIds = new Set(selectedJobs);
        const filteredNodes = allNodesData
          .filter(n => selectedNodeIds.has(n.id))
          .map(node => ({
            ...node,
            position: nodePositionsRef.current[node.id] || node.position
          }));
        setNodes(filteredNodes);
        
        // 선택된 노드들 사이의 엣지만 표시
        const filteredEdges = allEdgesData.filter(edge => {
          const relationType = edge.data?.relationType || edge.label;
          const hasFilter = edgeFilters[relationType];
          const hasSource = selectedNodeIds.has(edge.source);
          const hasTarget = selectedNodeIds.has(edge.target);
          return hasFilter && hasSource && hasTarget;
        });
        setEdges(filteredEdges);
      }
    }
  }, [showAllNodes, selectedJobs, allNodesData, allEdgesData, edgeFilters, setNodes, setEdges]);

  // 초기 뷰 설정
  useEffect(() => {
    if (!loading && nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.15, duration: 800 });
      }, 100);
    }
  }, [loading, nodes.length, fitView]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: EDGE_TYPES.similar.color, strokeWidth: 2 },
        data: { relationType: 'similar', weight: 0.5 }
      };
      setAllEdgesData(eds => [...eds, newEdge]);
    },
    []
  );

  // 커스텀 onNodesChange - 드래그만 허용, 위치 업데이트는 ref에 저장
  const handleNodesChange = useCallback((changes) => {
    changes.forEach(change => {
      // 드래그로 인한 위치 변경은 ref에 저장
      if (change.type === 'position' && change.position && !change.dragging) {
        nodePositionsRef.current[change.id] = { ...change.position };
      }
    });
    
    // React Flow에 변경사항 전달 (드래그 가능하도록)
    onNodesChange(changes);
  }, [onNodesChange]);

  // 선택된 노드 강조 - 스타일만 변경, 위치는 유지
  useEffect(() => {
    if (nodes.length === 0) return;
    
    setNodes((nds) =>
      nds.map((node) => {
        const isSelected = node.id === selectedSlug;
        
        // 현재 위치 유지 (ref에서 가져옴)
        const currentPosition = nodePositionsRef.current[node.id] || node.position;
        
        return {
          ...node,
          position: currentPosition, // 항상 ref의 위치 사용
          style: {
            ...node.style,
            border: isSelected ? '4px solid #3b82f6' : '2px solid #3b82f6',
            background: isSelected ? '#eff6ff' : '#fff',
            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
            transition: 'all 0.3s ease',
            boxShadow: isSelected 
              ? '0 12px 24px rgba(59, 130, 246, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.1)' 
              : '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: isSelected ? 1000 : 1
          }
        };
      })
    );
  }, [selectedSlug, setNodes]);

  // 노드 클릭 핸들러 - 줌만 변경
  const handleNodeClick = useCallback((event, node) => {
    if (!onNodeClick) return;

    const isSameNode = selectedSlug === node.id;
    const currentPosition = nodePositionsRef.current[node.id] || node.position;

    if (isSameNode && isZoomedIn) {
      // 같은 노드 재클릭 (줌인 상태) -> 줌 아웃
      fitView({ padding: 0.15, duration: 600 });
      setIsZoomedIn(false);
    } else if (isSameNode && !isZoomedIn) {
      // 같은 노드 재클릭 (줌 아웃 상태) -> 줌인
      setCenter(currentPosition.x, currentPosition.y, { zoom: 1.5, duration: 600 });
      setIsZoomedIn(true);
    } else {
      // 다른 노드 클릭 -> 선택 변경 + 줌인
      onNodeClick(node.id);
      setIsZoomedIn(false);
      setTimeout(() => {
        setCenter(currentPosition.x, currentPosition.y, { zoom: 1.5, duration: 600 });
        setIsZoomedIn(true);
      }, 50);
    }
  }, [onNodeClick, selectedSlug, isZoomedIn, setCenter, fitView]);

  const toggleFilter = (filterType) => {
    setEdgeFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const handleResetView = () => {
    fitView({ padding: 0.15, duration: 800 });
    setIsZoomedIn(false);
  };

  const handleFocusNode = () => {
    if (selectedSlug && nodes.length > 0) {
      const currentPosition = nodePositionsRef.current[selectedSlug];
      if (currentPosition) {
        setCenter(currentPosition.x, currentPosition.y, { 
          zoom: 1.5, 
          duration: 600 
        });
        setIsZoomedIn(true);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100%', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <div>그래프 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100%', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>그래프 로드 실패</div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{error}</div>
        </div>
      </div>
    );
  }

  if (!showAllNodes && nodes.length === 0) {
    return (
      <div style={{ height: '100%', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>👈</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#1f2937' }}>
            직업을 선택해주세요
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: '#6b7280' }}>
            왼쪽 목록에서 관심 있는 직업을 클릭하면<br />
            로드맵에 하나씩 추가됩니다
          </div>
        </div>
      </div>
    );
  }

  if (showAllNodes && nodes.length === 0) {
    return (
      <div style={{ height: '100%', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div>직업 데이터가 없습니다</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', background: '#fafafa', position: 'relative' }}>
      {/* 엣지 필터 패널 */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', minWidth: 220, maxWidth: 260 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔍</span><span>연결 관계 필터</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(EDGE_TYPES).map(([type, info]) => {
            const edgeCount = allEdgesData.filter(e => (e.data?.relationType || e.label) === type).length;
            return (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 10px', borderRadius: 8, background: edgeFilters[type] ? `${info.color}15` : 'transparent', border: `2px solid ${edgeFilters[type] ? info.color : '#e5e7eb'}`, transition: 'all 0.2s', userSelect: 'none' }}>
                <input type="checkbox" checked={edgeFilters[type]} onChange={() => toggleFilter(type)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: info.color }} />
                <span style={{ fontSize: 18 }}>{info.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: edgeFilters[type] ? '#1f2937' : '#9ca3af', marginBottom: 2 }}>{info.label}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{edgeCount}개 연결</div>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: info.color, opacity: edgeFilters[type] ? 1 : 0.3, transition: 'opacity 0.2s' }} />
              </label>
            );
          })}
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '2px solid #f3f4f6', fontSize: 12, color: '#6b7280' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>표시된 연결:</span><span style={{ fontWeight: 700, color: '#3b82f6' }}>{edges.length} / {allEdgesData.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>직업 수:</span><span style={{ fontWeight: 700, color: '#10b981' }}>{nodes.length}개</span>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={handleResetView} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', background: '#3b82f6', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }}>
            <span>🔄</span><span>전체 보기</span>
          </button>
          {selectedSlug && (
            <button onClick={handleFocusNode} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #3b82f6', background: 'white', color: '#3b82f6', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span>🔍</span><span>선택 직업 확대</span>
            </button>
          )}
        </div>
      </div>

      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange} 
        onConnect={onConnect} 
        onNodeClick={handleNodeClick}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView 
        minZoom={0.2} 
        maxZoom={2.5} 
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }} 
        attributionPosition="bottom-left"
      >
        <Background color="#e5e7eb" gap={20} size={1} style={{ background: '#fafafa' }} />
        <Controls showInteractive={false} />
        <MiniMap nodeColor={(node) => node.id === selectedSlug ? '#3b82f6' : '#94a3b8'} maskColor="rgba(0, 0, 0, 0.05)" />
      </ReactFlow>
    </div>
  );
}