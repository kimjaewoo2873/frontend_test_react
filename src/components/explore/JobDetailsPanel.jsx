import { useState, useEffect } from 'react';
import { Bookmark, ChevronRight, ExternalLink, Clock, Target, CheckCircle2 } from 'lucide-react';

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
          <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            직업을 선택하세요
          </div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            왼쪽 목록이나 그래프에서<br/>직업을 클릭해보세요
          </div>
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            상세 정보를 불러오는 중...
          </div>
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
        color: '#9ca3af',
        padding: 40
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            데이터를 불러올 수 없습니다
          </div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            잠시 후 다시 시도해주세요
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: '기본 정보', icon: '📋' },
    { id: 'skills', label: '스킬', icon: '💡' },
    { id: 'roadmap', label: '로드맵', icon: '🗺️' },
    { id: 'edges', label: '연결 직업', icon: '🔗' },
    { id: 'evidence', label: '근거', icon: '📄' }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      {/* Header */}
      <div style={{
        padding: 24,
        borderBottom: '1px solid #e5e7eb',
        background: 'white'
      }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: 28, fontWeight: 800, color: '#1f2937' }}>
          {job.name}
        </h2>
        <div style={{ 
          fontSize: 13, 
          color: '#6b7280',
          fontFamily: 'monospace',
          background: '#f3f4f6',
          padding: '4px 8px',
          borderRadius: 4,
          display: 'inline-block'
        }}>
          {job.job_slug}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        background: 'white',
        padding: '0 20px',
        overflowX: 'auto',
        gap: 4
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '14px 18px',
              border: 'none',
              background: activeTab === tab.id ? '#eff6ff' : 'transparent',
              borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer',
              fontSize: 14,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: '8px 8px 0 0'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#fafafa' }}>
        {activeTab === 'basic' && (
          <div>
            {job.one_liner?.text ? (
              <div style={{
                padding: 20,
                background: 'white',
                borderRadius: 12,
                marginBottom: 20,
                lineHeight: 1.7,
                fontSize: 15,
                color: '#374151',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                  💬 직업 설명
                </div>
                {job.one_liner.text}
              </div>
            ) : (
              <div style={{
                padding: 20,
                background: 'white',
                borderRadius: 12,
                marginBottom: 20,
                color: '#9ca3af',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                직업 설명이 없습니다
              </div>
            )}

            <button style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
            >
              <Bookmark size={18} />
              내 로드맵에 추가
            </button>
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            {job.skills ? (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ 
                    fontSize: 16, 
                    fontWeight: 700, 
                    marginBottom: 14,
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{ color: '#ef4444' }}>★</span>
                    필수 스킬
                  </h3>
                  {job.skills.required && job.skills.required.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {job.skills.required.map((skill, idx) => (
                        <span key={idx} style={{
                          padding: '10px 16px',
                          background: 'white',
                          color: '#1e40af',
                          border: '2px solid #3b82f6',
                          borderRadius: 10,
                          fontSize: 14,
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
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
                  <h3 style={{ 
                    fontSize: 16, 
                    fontWeight: 700, 
                    marginBottom: 14,
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{ color: '#10b981' }}>+</span>
                    우대 스킬
                  </h3>
                  {job.skills.preferred && job.skills.preferred.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {job.skills.preferred.map((skill, idx) => (
                        <span key={idx} style={{
                          padding: '10px 16px',
                          background: 'white',
                          color: '#065f46',
                          border: '2px solid #10b981',
                          borderRadius: 10,
                          fontSize: 14,
                          fontWeight: 500,
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
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
                padding: 60, 
                color: '#9ca3af',
                background: 'white',
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💡</div>
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
                    padding: 20,
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: 12,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                  >
                    <summary style={{
                      fontWeight: 700,
                      fontSize: 17,
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      color: '#1f2937'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#3b82f6',
                        color: 'white',
                        fontSize: 15,
                        fontWeight: 700
                      }}>
                        {idx + 1}
                      </span>
                      <span>{stage.stage_name}</span>
                      {stage.duration && (
                        <span style={{
                          marginLeft: 'auto',
                          fontSize: 13,
                          color: '#6b7280',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <Clock size={14} />
                          {stage.duration}
                        </span>
                      )}
                    </summary>
                    
                    {stage.goals && stage.goals.length > 0 && (
                      <div style={{ 
                        marginBottom: 16,
                        padding: 14,
                        background: '#fef3c7',
                        borderRadius: 8,
                        border: '1px solid #fbbf24'
                      }}>
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 600, 
                          marginBottom: 10, 
                          color: '#92400e',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <Target size={16} />
                          목표
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 24, color: '#78350f' }}>
                          {stage.goals.map((goal, i) => (
                            <li key={i} style={{ fontSize: 14, marginBottom: 6, lineHeight: 1.6 }}>
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {stage.items && stage.items.length > 0 && (
                      <div>
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 600, 
                          marginBottom: 12, 
                          color: '#1f2937',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <CheckCircle2 size={16} />
                          체크리스트
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {stage.items.map((item, i) => (
                            <label key={i} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 10, 
                              cursor: 'pointer',
                              padding: '10px 12px',
                              background: '#f9fafb',
                              borderRadius: 8,
                              border: '1px solid #e5e7eb',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f3f4f6';
                              e.currentTarget.style.borderColor = '#d1d5db';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f9fafb';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                            >
                              <input 
                                type="checkbox" 
                                style={{ 
                                  width: 18, 
                                  height: 18,
                                  cursor: 'pointer',
                                  accentColor: '#3b82f6'
                                }} 
                              />
                              <span style={{ fontSize: 14, color: '#374151' }}>{item}</span>
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
                padding: 60, 
                color: '#9ca3af',
                background: 'white',
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
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
                      padding: 18,
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#1f2937' }}>
                        {edge.to_job_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6, fontFamily: 'monospace' }}>
                        {edge.to_job_slug}
                      </div>
                      <div style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: edge.relation_type === 'similar' ? '#dbeafe' : 
                                   edge.relation_type === 'transition' ? '#ede9fe' : 
                                   edge.relation_type === 'prerequisite' ? '#d1fae5' : '#fed7aa',
                        color: edge.relation_type === 'similar' ? '#1e40af' : 
                               edge.relation_type === 'transition' ? '#5b21b6' : 
                               edge.relation_type === 'prerequisite' ? '#065f46' : '#9a3412'
                      }}>
                        <span>{edge.relation_type === 'similar' ? '🔗' :
                               edge.relation_type === 'transition' ? '🔄' :
                               edge.relation_type === 'prerequisite' ? '⬆️' : '📈'}</span>
                        <span>{edge.relation_type}</span>
                        <span>·</span>
                        <span>{Math.round(edge.weight * 100)}%</span>
                      </div>
                    </div>
                    <ChevronRight size={24} color="#9ca3af" />
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: 60, 
                color: '#9ca3af',
                background: 'white',
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
                연결된 직업이 없습니다
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div>
            {job.one_liner?.evidences && job.one_liner.evidences.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {job.one_liner.evidences.map((ev, idx) => (
                  <div key={idx} style={{
                    padding: 18,
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: 12,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>
                        📌 {ev.evidence_key}
                      </div>
                      {ev.source_url && (
                        <a
                          href={ev.source_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 13,
                            color: '#3b82f6',
                            textDecoration: 'none',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: '#eff6ff',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dbeafe';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#eff6ff';
                          }}
                        >
                          <span>출처</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    {ev.quote && (
                      <div style={{
                        fontSize: 14,
                        color: '#4b5563',
                        fontStyle: 'italic',
                        borderLeft: '4px solid #3b82f6',
                        paddingLeft: 16,
                        lineHeight: 1.7,
                        background: '#f9fafb',
                        padding: '12px 16px',
                        borderRadius: '0 8px 8px 0'
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
                padding: 60, 
                color: '#9ca3af',
                background: 'white',
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                근거 정보가 없습니다
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}