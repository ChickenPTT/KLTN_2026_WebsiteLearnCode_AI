import { useState } from 'react';
import { X, LogIn, Sparkles, Code2, BookOpen } from 'lucide-react';
import type { AuthMode } from '@/types';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (mode: AuthMode) => void;
  onClose?: () => void;
  /** Tiêu đề hành động bị chặn — ví dụ: "Chạy code", "Nộp bài", "Học flashcard" */
  actionLabel?: string;
}

export function LoginModal({ isOpen, onLogin, onClose, actionLabel }: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>('signup');

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={() => onClose?.()}>
      <div
        className="submit-result-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', textAlign: 'center' }}
      >
        <button className="dialog-close" onClick={() => onClose?.()}>
          <X size={18} />
        </button>

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <LogIn size={28} color="#fff" />
        </div>

        <h2 className="submit-result-title" style={{ fontSize: '20px', marginBottom: 8 }}>
          Cần đăng nhập để tiếp tục
        </h2>

        {actionLabel && (
          <p className="submit-result-sub" style={{ marginBottom: 16 }}>
            Bạn cần có tài khoản để <strong>{actionLabel}</strong>.
          </p>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', textAlign: 'left' }}>
            <Sparkles size={14} color="#3b82f6" />
            <span>Theo dõi tiến độ học tập và điểm XP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', textAlign: 'left' }}>
            <Code2 size={14} color="#8b5cf6" />
            <span>Lưu lịch sử nộp bài và nhận xét AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', textAlign: 'left' }}>
            <BookOpen size={14} color="#10b981" />
            <span>Tạo và quản lý bộ flashcard cá nhân</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            className="assessment-ghost"
            onClick={() => {
              setMode('login');
              onLogin('login');
            }}
            style={{ padding: '10px 20px' }}
          >
            Đăng nhập
          </button>
          <button
            className="assessment-primary"
            onClick={() => {
              setMode('signup');
              onLogin('signup');
            }}
            style={{ padding: '10px 20px' }}
          >
            Đăng ký miễn phí
          </button>
        </div>
      </div>
    </div>
  );
}
