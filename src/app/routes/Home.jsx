import { useState, useCallback, useEffect } from 'react';

import Header from '../../components/layout/Header';
import ExplorePanel from '../../components/explore/ExplorePanel';
import GraphCanvas from '../../components/explore/GraphCanvas';

import JobDetailPanel from '../../components/explore/JobDetailsPanel';

import { fetchJobs, fetchJobDetail } from '../../lib/supabase/jobsApi';


export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [jobDetail, setJobDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 직업 목록 로드
  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      setError(null);
      
      const { data, error } = await fetchJobs();
      console.log("jobs data:", data);

      if (error) {
        console.error('Failed to fetch jobs:', error);
        setError(error.message);
      } else {
        setJobs(data || []);
      }
      
      setLoading(false);
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
      
      const { data, error } = await fetchJobDetail(selectedSlug);
      
      if (error) {
        console.error('Failed to fetch job detail:', error);
        setError(error.message);
        setJobDetail(null);
      } else {
        setJobDetail(data);
      }
      
      setLoading(false);
    }
    
    loadJobDetail();
  }, [selectedSlug]);

  const handleNodeClick = useCallback((slug) => {
    setSelectedSlug(slug);
  }, []);

  const handleNavigate = useCallback((slug) => {
    setSelectedSlug(slug);
  }, []);

  if (error) {
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
        <div style={{ fontSize: 14, color: '#6b7280' }}>
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
            fontSize: 14
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
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
          onSelect={setSelectedSlug}
          loading={loading}
        />
        
        <GraphCanvas 
          selectedSlug={selectedSlug} 
          onNodeClick={handleNodeClick}
          jobs={jobs}
        />
        
        <div style={{ borderLeft: '1px solid #e5e7eb', background: 'white' }}>
          <JobDetailPanel 
            jobSlug={selectedSlug}
            onNavigate={handleNavigate}
            jobData={jobDetail}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}