import { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';

import LandingPage from '../../components/LandingPage';
import Header from '../../components/layout/Header';
import ExplorePanel from '../../components/explore/ExplorePanel';
import GraphCanvas from '../../components/explore/GraphCanvas';
import JobDetailPanel from '../../components/explore/JobDetailsPanel';

import { fetchJobs, fetchJobDetail } from '../../lib/supabase/jobsApi';

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]); // 선택된 직업들의 배열
  const [jobDetail, setJobDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllNodes, setShowAllNodes] = useState(true); // 로드맵 전체 보기/숨김

  // 직업 목록 로드
  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await fetchJobs();
        console.log("jobs data:", data);

        if (error) {
          console.error('Failed to fetch jobs:', error);
          setError(error.message || '직업 목록을 불러오는데 실패했습니다.');
        } else {
          setJobs(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('예상치 못한 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    
    loadJobs();
  }, []);

  // 선택된 직업 상세 정보 로드
  useEffect(() => {
    if (!selectedSlug) {
      setJobDetail(null);
      return;
    }
    
    async function loadJobDetail() {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await fetchJobDetail(selectedSlug);
        
        if (error) {
          console.error('Failed to fetch job detail:', error);
          setError(error.message || '상세 정보를 불러오는데 실패했습니다.');
          setJobDetail(null);
        } else {
          setJobDetail(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('예상치 못한 오류가 발생했습니다.');
        setJobDetail(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadJobDetail();
  }, [selectedSlug]);

  const handleStart = useCallback(() => {
    setShowLanding(false);
  }, []);

  const handleSearch = useCallback((query) => {
    // TODO: 검색 기능 구현
    console.log('Search query:', query);
    setShowLanding(false);
    // 검색 결과에 맞는 직업 필터링 로직 추가 예정
  }, []);

  // GraphCanvas에서 노드 클릭 시 호출 (선택만 변경)
  const handleNodeClick = useCallback((slug) => {
    // slug가 null이면 무시 (GraphCanvas 내부에서 줌만 처리)
    if (slug === null) return;
    
    setSelectedSlug(slug);
    
    // 숨김 모드일 때만 selectedJobs에 추가
    if (!showAllNodes) {
      setSelectedJobs(prev => {
        if (!prev.includes(slug)) {
          return [...prev, slug];
        }
        return prev;
      });
    }
  }, [showAllNodes]);

  // ExplorePanel에서 직업 클릭 시 호출
  const handleSelectJob = useCallback((slug) => {
    setSelectedSlug(slug);
    
    // 숨김 모드일 때만 selectedJobs에 추가
    if (!showAllNodes) {
      setSelectedJobs(prev => {
        if (!prev.includes(slug)) {
          return [...prev, slug];
        }
        return prev;
      });
    }
  }, [showAllNodes]);

  const handleNavigate = useCallback((slug) => {
    setSelectedSlug(slug);
    
    // 숨김 모드일 때만 selectedJobs에 추가
    if (!showAllNodes) {
      setSelectedJobs(prev => {
        if (!prev.includes(slug)) {
          return [...prev, slug];
        }
        return prev;
      });
    }
  }, [showAllNodes]);

  const handleToggleAllNodes = useCallback(() => {
    setShowAllNodes(prev => !prev);
    // 전체 보기로 전환 시 선택 목록 초기화
    if (!showAllNodes) {
      setSelectedJobs([]);
    }
  }, [showAllNodes]);

  if (showLanding) {
    return <LandingPage onStart={handleStart} onSearch={handleSearch} />;
  }

  if (error && jobs.length === 0) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#ef4444' }}>
          데이터 로드 실패
        </div>
        <div style={{ fontSize: 14, color: '#6b7280', maxWidth: 400, textAlign: 'center' }}>
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <div style={{
          marginTop: 60,
          display: 'grid',
          gridTemplateColumns: '300px 1fr 420px',
          height: 'calc(100vh - 60px)'
        }}>
          <ExplorePanel
            jobs={jobs}
            selectedSlug={selectedSlug}
            onSelect={handleSelectJob}
            loading={loading && jobs.length === 0}
            showAllNodes={showAllNodes}
            onToggleAllNodes={handleToggleAllNodes}
          />
          
          <GraphCanvas 
            selectedSlug={selectedSlug} 
            onNodeClick={handleNodeClick}
            showAllNodes={showAllNodes}
            selectedJobs={selectedJobs}
          />
          
          <div style={{ borderLeft: '1px solid #e5e7eb', background: 'white' }}>
            <JobDetailPanel 
              jobSlug={selectedSlug}
              onNavigate={handleNavigate}
              jobData={jobDetail}
              loading={loading && selectedSlug !== null}
            />
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}