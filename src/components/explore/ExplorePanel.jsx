import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function ExplorePanel({ jobs, selectedSlug, onSelect, loading, showAllNodes, onToggleAllNodes }) {
  const [category, setCategory] = useState('전체');
  
  const categories = ['전체', ...Array.from(new Set(
    (jobs ?? [])
      .map(j => j.category?.major || '기타')
      .filter(Boolean)
  ))];

  const filteredJobs = category === '전체' 
    ? jobs 
    : jobs.filter(j => (j.category?.major || '기타') === category);

  return (
    <div style={{
      height: '100%',
      padding: 20,
      overflowY: 'auto',
      background: '#f9fafb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>
        카테고리
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              background: category === cat ? '#eff6ff' : 'transparent',
              color: category === cat ? '#3b82f6' : '#6b7280',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: category === cat ? 500 : 400,
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 로드맵 표시 토글 */}
      <div style={{
        marginBottom: 16,
        padding: 14,
        background: 'white',
        borderRadius: 10,
        border: '2px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#4b5563',
          marginBottom: 10
        }}>
          🗺️ 로드맵 표시
        </div>
        <button
          onClick={onToggleAllNodes}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: 'none',
            background: showAllNodes 
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : '#f3f4f6',
            color: showAllNodes ? 'white' : '#4b5563',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
            boxShadow: showAllNodes ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!showAllNodes) {
              e.currentTarget.style.background = '#e5e7eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!showAllNodes) {
              e.currentTarget.style.background = '#f3f4f6';
            }
          }}
        >
          {showAllNodes ? (
            <>
              <Eye size={16} />
              <span>전체 보기</span>
            </>
          ) : (
            <>
              <EyeOff size={16} />
              <span>숨김 (선택만 표시)</span>
            </>
          )}
        </button>
        <div style={{
          marginTop: 8,
          fontSize: 11,
          color: '#9ca3af',
          lineHeight: 1.5
        }}>
          {showAllNodes 
            ? '모든 직업이 로드맵에 표시됩니다'
            : '선택한 직업만 로드맵에 표시됩니다'}
        </div>
      </div>

      <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>
        직업 목록 ({filteredJobs.length})
      </h3>

      {loading && jobs.length === 0 ? (
        <div style={{ 
          padding: 20, 
          textAlign: 'center', 
          color: '#9ca3af',
          fontSize: 14 
        }}>
          직업 목록을 불러오는 중...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ 
          padding: 20, 
          textAlign: 'center', 
          color: '#9ca3af',
          fontSize: 14 
        }}>
          해당 카테고리에 직업이 없습니다
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
          {filteredJobs.map(job => (
            <button
              key={job.job_slug}
              onClick={() => onSelect(job.job_slug)}
              style={{
                padding: 12,
                borderRadius: 8,
                border: selectedSlug === job.job_slug ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                background: selectedSlug === job.job_slug ? '#eff6ff' : 'white',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                {job.name}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                {job.job_slug}
              </div>
              {job.category && (
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                  {job.category.major} {job.category.middle && `> ${job.category.middle}`}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}