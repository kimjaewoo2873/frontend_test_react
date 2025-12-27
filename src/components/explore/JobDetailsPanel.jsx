import { useState, useEffect } from 'react';
import { Bookmark, ChevronRight, ExternalLink } from 'lucide-react';

export default function JobDetailPanel({ jobSlug, onNavigate, jobData, loading }) {
  const [job, setJob] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (jobSlug && jobData) {
      setJob(jobData);
      setActiveTab('basic');
    }
  }, [jobSlug, jobData]);

  if (!jobSlug) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        <div>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
          <div style={{ fontSize: 16 }}>왼쪽 목록이나 그래프에서<br/>직업을 선택하세요</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <div>상세 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div>데이터를 불러올 수 없습니다</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: '기본 정보' },
    { id: 'skills', label: '스킬' },
    { id: 'roadmap', label: '로드맵' },
    { id: 'edges', label: '연결된 직업' },
    { id: 'evidence', label: '근거' }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: 20,
        borderBottom: '1px solid #e5e7eb',
        background: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 700 }}>
          {job.name}
        </h2>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          {job.job_slug}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        background: 'white',
        padding: '0 20px',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              fontSize: 14,
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {activeTab === 'basic' && (
          <div>
            {job.one_liner?.text ? (
              <div style={{
                padding: 16,
                background: '#f9fafb',
                borderRadius: 8,
                marginBottom: 20,
                lineHeight: 1.6
              }}>
                {job.one_liner.text}
              </div>
            ) : (
              <div style={{
                padding: 16,
                background: '#f9fafb',
                borderRadius: 8,
                marginBottom: 20,
                color: '#9ca3af',
                textAlign: 'center'
              }}>
                직업 설명이 없습니다
              </div>
            )}

            <button style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}>
              <Bookmark size={16} />
              내 로드맵에 추가
            </button>
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            {job.skills ? (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                    필수 스킬
                  </h3>
                  {job.skills.required && job.skills.required.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {job.skills.required.map((skill, idx) => (
                        <span key={idx} style={{
                          padding: '6px 12px',
                          background: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#9ca3af', fontSize: 14 }}>
                      필수 스킬 정보가 없습니다
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                    우대 스킬
                  </h3>
                  {job.skills.preferred && job.skills.preferred.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {job.skills.preferred.map((skill, idx) => (
                        <span key={idx} style={{
                          padding: '6px 12px',
                          background: '#f3f4f6',
                          color: '#4b5563',
                          borderRadius: 6,
                          fontSize: 13
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#9ca3af', fontSize: 14 }}>
                      우대 스킬 정보가 없습니다
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: 40, 
                color: '#9ca3af' 
              }}>
                스킬 정보가 없습니다
              </div>
            )}
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div>
            {job.roadmap && job.roadmap.stages && job.roadmap.stages.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {job.roadmap.stages.map((stage, idx) => (
                  <details key={idx} open={idx === 0} style={{
                    padding: 16,
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8
                  }}>
                    <summary style={{
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: 'pointer',
                      marginBottom: 12
                    }}>
                      {idx + 1}. {stage.stage_name}
                    </summary>
                    
                    {stage.goals && stage.goals.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#6b7280' }}>
                          📌 목표
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {stage.goals.map((goal, i) => (
                            <li key={i} style={{ fontSize: 14, marginBottom: 4 }}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {stage.items && stage.items.length > 0 && (
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#6b7280' }}>
                          ✅ 체크리스트
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {stage.items.map((item, i) => (
                            <label key={i} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 8, 
                              cursor: 'pointer',
                              padding: '6px 0'
                            }}>
                              <input type="checkbox" style={{ width: 16, height: 16 }} />
                              <span style={{ fontSize: 14 }}>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </details>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: 40, 
                color: '#9ca3af' 
              }}>
                로드맵 정보가 없습니다
              </div>
            )}
          </div>
        )}

        {activeTab === 'edges' && (
          <div>
            {job.edges && job.edges.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {job.edges.map((edge, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate(edge.to_job_slug)}
                    style={{
                      padding: 16,
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                        {edge.to_job_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
                        {edge.to_job_slug}
                      </div>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        background: edge.relation_type === 'similar' ? '#dbeafe' : 
                                   edge.relation_type === 'transition' ? '#ede9fe' : '#d1fae5',
                        color: edge.relation_type === 'similar' ? '#1e40af' : 
                               edge.relation_type === 'transition' ? '#5b21b6' : '#065f46'
                      }}>
                        {edge.relation_type} · {edge.weight}
                      </div>
                    </div>
                    <ChevronRight size={20} color="#9ca3af" />
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: 40, 
                color: '#9ca3af' 
              }}>
                연결된 직업이 없습니다
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div>
            {job.one_liner?.evidences && job.one_liner.evidences.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {job.one_liner.evidences.map((ev, idx) => (
                  <div key={idx} style={{
                    padding: 16,
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {ev.evidence_key}
                      </div>
                      {ev.source_url && (
                        <a
                          href={ev.source_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            color: '#3b82f6',
                            textDecoration: 'none'
                          }}
                        >
                          출처
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    {ev.quote && (
                      <div style={{
                        fontSize: 14,
                        color: '#4b5563',
                        fontStyle: 'italic',
                        borderLeft: '3px solid #3b82f6',
                        paddingLeft: 12
                      }}>
                        "{ev.quote}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: 40, 
                color: '#9ca3af' 
              }}>
                근거 정보가 없습니다
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}