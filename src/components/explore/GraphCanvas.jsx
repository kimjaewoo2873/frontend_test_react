import { useEffect, useCallback, useState } from 'react';
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

// 엣지 타입 정의
const EDGE_TYPES = {
  similar: { label: '유사 직무', color: '#3b82f6', icon: '🔗' },
  transition: { label: '전환 가능', color: '#8b5cf6', icon: '🔄' },
  prerequisite: { label: '선행 경로', color: '#10b981', icon: '⬆️' },
  expansion: { label: '확장 경로', color: '#f59e0b', icon: '📈' }
};

// 원형 레이아웃 계산 (더 예쁜 배치)
const calculateCircularLayout = (nodes, centerX = 600, centerY = 400, radius = 300) => {
  const nodeCount = nodes.length;
  return nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodeCount - Math.PI / 2;
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    };
  });
};

export default function GraphCanvas({ selectedSlug, onNodeClick }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [allEdges, setAllEdges] = useState([]);
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
  const { fitView, setCenter } = useReactFlow();

  // 그래프 데이터 로드
  useEffect(() => {
    async function loadGraph() {
      setLoading(true);
      setError(null);

      const { nodes: graphNodes, edges: graphEdges, error: graphError } = await fetchJobGraph();

      if (graphError) {
        console.error('Failed to load graph:', graphError);
        setError(graphError.message || '그래프 데이터를 불러오는데 실패했습니다.');
      } else {
        // 원형 레이아웃 적용
        const layoutedNodes = calculateCircularLayout(graphNodes);
        setNodes(layoutedNodes);
        setAllEdges(graphEdges);
        setEdges(graphEdges);
      }

      setLoading(false);
    }

    if (!initialized) {
      loadGraph();
      setInitialized(true);
    }
  }, [initialized, setNodes, setEdges]);

  // 초기 뷰 설정 (데이터 로드 후 한 번만)
  useEffect(() => {
    if (!loading && nodes.length > 0 && !initialized) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 100);
    }
  }, [loading, nodes.length, fitView, initialized]);

  // 필터 변경 시 엣지 필터링
  useEffect(() => {
    const filteredEdges = allEdges.filter(edge => {
      const relationType = edge.data?.relationType || edge.label;
      return edgeFilters[relationType];
    });
    setEdges(filteredEdges);
  }, [edgeFilters, allEdges, setEdges]);

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
      setAllEdges(eds => [...eds, newEdge]);
      setEdges(eds => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // 선택된 노드 강조 (레이아웃 유지)
  useEffect(() => {
    if (nodes.length === 0) return;
    
    setNodes((nds) =>
      nds.map((node) => {
        const isSelected = node.id === selectedSlug;
        return {
          ...node,
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
  }, [selectedSlug, nodes.length, setNodes]);

  const handleNodeClick = useCallback((event, node) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  }, [onNodeClick]);

  const toggleFilter = (filterType) => {
    setEdgeFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const handleResetView = () => {
    fitView({ padding: 0.2, duration: 800 });
  };

  const handleFocusNode = () => {
    if (selectedSlug && nodes.length > 0) {
      const selectedNode = nodes.find(n => n.id === selectedSlug);
      if (selectedNode) {
        setCenter(selectedNode.position.x, selectedNode.position.y, { 
          zoom: 1.5, 
          duration: 600 
        });
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100%', 
        background: '#fafafa', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <div>그래프 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '100%', 
        background: '#fafafa', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ef4444'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>그래프 로드 실패</div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{error}</div>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        background: '#fafafa', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af'
      }}>
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
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        background: 'white',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: 220,
        maxWidth: 260
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 14,
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span>🔍</span>
          <span>연결 관계 필터</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(EDGE_TYPES).map(([type, info]) => {
            const edgeCount = allEdges.filter(e => 
              (e.data?.relationType || e.label) === type
            ).length;

            return (
              <label
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: edgeFilters[type] ? `${info.color}15` : 'transparent',
                  border: `2px solid ${edgeFilters[type] ? info.color : '#e5e7eb'}`,
                  transition: 'all 0.2s',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!edgeFilters[type]) {
                    e.currentTarget.style.borderColor = info.color;
                    e.currentTarget.style.background = `${info.color}08`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!edgeFilters[type]) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={edgeFilters[type]}
                  onChange={() => toggleFilter(type)}
                  style={{
                    width: 18,
                    height: 18,
                    cursor: 'pointer',
                    accentColor: info.color
                  }}
                />
                <span style={{ fontSize: 18 }}>{info.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: edgeFilters[type] ? '#1f2937' : '#9ca3af',
                    marginBottom: 2
                  }}>
                    {info.label}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: '#9ca3af'
                  }}>
                    {edgeCount}개 연결
                  </div>
                </div>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: info.color,
                    opacity: edgeFilters[type] ? 1 : 0.3,
                    transition: 'opacity 0.2s'
                  }}
                />
              </label>
            );
          })}
        </div>

        {/* 통계 정보 */}
        <div style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: '2px solid #f3f4f6',
          fontSize: 12,
          color: '#6b7280'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>표시된 연결:</span>
            <span style={{ fontWeight: 700, color: '#3b82f6' }}>
              {edges.length} / {allEdges.length}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>직업 수:</span>
            <span style={{ fontWeight: 700, color: '#10b981' }}>
              {nodes.length}개
            </span>
          </div>
        </div>

        {/* 뷰 컨트롤 버튼들 */}
        <div style={{
          marginTop: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
          <button
            onClick={handleResetView}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
            }}
          >
            <span>🔄</span>
            <span>전체 보기</span>
          </button>

          {selectedSlug && (
            <button
              onClick={handleFocusNode}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '2px solid #3b82f6',
                background: 'white',
                color: '#3b82f6',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>🔍</span>
              <span>선택 직업 확대</span>
            </button>
          )}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.3}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-left"
      >
        <Background 
          color="#e5e7eb" 
          gap={20} 
          size={1}
          style={{ background: '#fafafa' }}
        />
        <Controls 
          showInteractive={false}
          style={{
            button: {
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8
            }
          }}
        />
        <MiniMap 
          nodeColor={(node) => node.id === selectedSlug ? '#3b82f6' : '#94a3b8'}
          maskColor="rgba(0, 0, 0, 0.05)"
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 8
          }}
        />
      </ReactFlow>
    </div>
  );
}