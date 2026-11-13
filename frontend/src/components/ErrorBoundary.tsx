import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            maxWidth: '540px',
            margin: '40px auto',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            background: 'rgba(239, 68, 68, 0.05)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            {this.props.fallbackTitle || 'Đã có lỗi xảy ra'}
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
            Không thể tải nội dung phần này. Vui lòng thử tải lại hoặc quay lại trang trước.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={this.handleReset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
          >
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
