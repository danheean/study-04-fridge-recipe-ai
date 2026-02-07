import { Loader2 } from 'lucide-react';

/**
 * 일관된 로딩 스피너 컴포넌트
 */
export default function LoadingSpinner({
  size = 'md',
  message = '로딩 중...',
  fullScreen = false,
  className = '',
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const spinnerSize = sizes[size] || sizes.md;

  const spinner = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className={`${spinnerSize} animate-spin text-primary-500`}
        aria-hidden="true"
      />
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8">
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
