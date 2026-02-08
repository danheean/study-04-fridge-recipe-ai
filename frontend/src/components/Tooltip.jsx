import { useState } from 'react';
import { Info, X } from 'lucide-react';

/**
 * 간단한 툴팁 컴포넌트
 * 호버 시 정보를 표시하거나, 닫을 수 있는 영구 툴팁으로 사용 가능
 */
export default function Tooltip({
  content,
  children,
  position = 'top',
  dismissible = false,
  onDismiss
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (dismissible && !isVisible) return children;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {(isHovered || dismissible) && (
        <div
          className={`absolute ${positions[position]} z-50 animate-fadeIn`}
          role="tooltip"
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-lg max-w-xs">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="flex-1">{content}</p>
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="shrink-0 hover:bg-gray-800 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="팁 닫기"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          {/* Arrow */}
          <div
            className={`absolute ${arrowPositions[position]} w-2 h-2 bg-gray-900 rotate-45`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

/**
 * 영구적으로 표시되는 인라인 팁 (배너 스타일)
 */
export function InlineTip({ children, variant = 'info', onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    tip: 'bg-purple-50 border-purple-200 text-purple-900',
  };

  const iconColors = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    tip: 'text-purple-500',
  };

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-lg ${variants[variant]} animate-fadeIn`}>
      <Info className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors[variant]}`} aria-hidden="true" />
      <p className="flex-1 text-sm">{children}</p>
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="shrink-0 hover:bg-white/50 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
          aria-label="팁 닫기"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
