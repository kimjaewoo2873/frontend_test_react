import { useState } from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';

export default function LandingPage({ onStart, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 40,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 애니메이션 */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.1,
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div style={{
        maxWidth: 800,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 로고 & 타이틀 */}
        <div style={{
          marginBottom: 48,
          animation: 'fadeInDown 0.8s ease-out'
        }}>
          <div style={{
            fontSize: 72,
            marginBottom: 16
          }}>
            🚀
          </div>
          <h1 style={{
            fontSize: 48,
            fontWeight: 900,
            color: 'white',
            margin: '0 0 16px 0',
            textShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            Career Explorer
          </h1>
          <p style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 500,
            lineHeight: 1.6
          }}>
            진로를 지도처럼 탐색하고,<br />
            실행 가능한 로드맵을 만나보세요
          </p>
        </div>

        {/* 검색 바 */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 8,
          marginBottom: 32,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          animation: 'fadeInUp 0.8s ease-out 0.2s backwards'
        }}>
          <Sparkles size={24} color="#667eea" style={{ marginLeft: 12, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="관심 있는 직업이나 분야를 검색해보세요 (예: 백엔드, 데이터 분석)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 16,
              padding: '12px 8px',
              background: 'transparent',
              color: '#1f2937'
            }}
          />
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            style={{
              padding: '12px 24px',
              background: searchQuery.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
              color: searchQuery.trim() ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (searchQuery.trim()) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Search size={20} />
            검색
          </button>
        </div>

        {/* 또는 구분선 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 32,
          animation: 'fadeIn 0.8s ease-out 0.4s backwards'
        }}>
          <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600 }}>
            또는
          </span>
          <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* 로드맵 보기 버튼 */}
        <button
          onClick={onStart}
          style={{
            padding: '20px 48px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: 16,
            fontSize: 20,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            transition: 'all 0.3s',
            animation: 'fadeInUp 0.8s ease-out 0.6s backwards'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
          }}
        >
          <MapPin size={28} />
          <span>전체 로드맵 보기</span>
        </button>

        {/* 통계 정보 */}
        <div style={{
          marginTop: 64,
          display: 'flex',
          justifyContent: 'center',
          gap: 48,
          animation: 'fadeIn 0.8s ease-out 0.8s backwards'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 4 }}>
              10+
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
              직업 카테고리
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 4 }}>
              100+
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
              직업 정보
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 4 }}>
              근거 기반
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
              팩트 체크
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}