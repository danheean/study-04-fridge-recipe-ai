import { useState, useEffect } from 'react';
import { Loader2, Lightbulb } from 'lucide-react';

/**
 * 일관된 로딩 스피너 컴포넌트
 */
export default function LoadingSpinner({
  size = 'md',
  message = '로딩 중...',
  fullScreen = false,
  className = '',
  showTips = false,
  tips = [],
}) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // 팁 로테이션 (5초마다)
  useEffect(() => {
    if (!showTips || tips.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [showTips, tips.length]);

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const spinnerSize = sizes[size] || sizes.md;

  const spinner = (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className={`${spinnerSize} animate-spin text-primary-500`}
        aria-hidden="true"
      />
      {message && (
        <p className="text-gray-700 font-medium text-center max-w-md">
          {message}
        </p>
      )}
      {showTips && tips.length > 0 && (
        <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md animate-fadeIn">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">알고 계셨나요?</p>
              <p className="text-sm text-blue-700">{tips[currentTipIndex]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-4">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

/**
 * 인라인 로딩 스피너 (버튼 등에서 사용)
 */
export function InlineSpinner({ className = '' }) {
  return (
    <Loader2
      className={`h-4 w-4 animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * 중앙 정렬 로딩 스피너
 */
export function CenteredSpinner({ message = '로딩 중...', size = 'lg' }) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <LoadingSpinner size={size} message={message} />
    </div>
  );
}
