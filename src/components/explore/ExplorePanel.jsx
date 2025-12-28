import { useState } from 'react';

export default function ExplorePanel({ jobs, selectedSlug, onSelect, loading }) {
  const [category, setCategory] = useState('전체');
  
  // category가 객체이므로 major 필드를 사용
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
      background: '#f9fafb'
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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