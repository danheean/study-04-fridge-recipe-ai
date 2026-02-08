import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

/**
 * 로그인 모달
 * 레시피 저장 등 인증이 필요한 작업 시 표시
 */
export default function LoginModal({ onClose, onLoginSuccess }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [emailOrId, setEmailOrId] = useState('');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const emailInputRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!emailOrId.trim()) {
      toast.warning('이메일 주소를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      await login(emailOrId.trim());
      toast.success('로그인되었습니다!');
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.userMessage || '로그인에 실패했습니다. 이메일 주소를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 모달 열릴 때 포커스 설정
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // 포커스 트랩
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="login-modal-title" className="text-2xl font-bold text-gray-900">로그인</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
            aria-label="로그인 모달 닫기"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            레시피를 저장하려면 로그인이 필요합니다
          </p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  ref={emailInputRef}
                  id="email"
                  type="text"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="demo@fridgechef.com"
                  disabled={loading}
                  required
                  aria-describedby="email-hint"
                />
              </div>
              <p id="email-hint" className="mt-1 text-xs text-gray-500">
                등록된 이메일 주소를 입력하세요
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[48px] active:scale-[0.98]"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-white text-primary-500 border-2 border-primary-500 py-3 rounded-lg font-medium hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] active:scale-[0.98]"
          >
            새 계정 만들기
          </button>

          {/* Demo User Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-1">💡 테스트용 계정</p>
            <p className="text-xs text-blue-700">
              이메일: <code className="bg-blue-100 px-2 py-0.5 rounded">demo@fridgechef.com</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
