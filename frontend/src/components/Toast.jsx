import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * 토스트 알림 컴포넌트
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'success' | 'error' | 'info' | 'warning'
 * @param {function} onClose - 닫기 콜백
 */
const Toast = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 마운트 시 애니메이션
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // 애니메이션 후 제거
  };

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type] || config.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        ${bgColor} ${borderColor} ${textColor}
        border rounded-lg shadow-lg p-4 pr-10 relative
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
        max-w-md
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        <p className="text-sm font-medium flex-1 break-words">{message}</p>
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={handleClose}
        className={`
          absolute top-3 right-3 ${iconColor} hover:opacity-70
          transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1
          rounded
        `}
        aria-label="알림 닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
