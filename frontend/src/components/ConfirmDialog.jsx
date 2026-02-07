/**
 * 확인 다이얼로그 컴포넌트
 * 네이티브 confirm() 대체용 커스텀 다이얼로그
 */
import { useEffect, useRef } from 'react';
import { useConfirmState } from '../contexts/ConfirmContext';
import { X } from 'lucide-react';

export default function ConfirmDialog() {
  const state = useConfirmState();
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const dialogRef = useRef(null);

  // ESC 키 처리
  useEffect(() => {
    if (!state.isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape' && state.onCancel) {
        state.onCancel();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [state.isOpen, state.onCancel]);

  // 포커스 트랩
  useEffect(() => {
    if (!state.isOpen) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [state.isOpen]);

  // 초기 포커스 설정 (취소 버튼에 포커스)
  useEffect(() => {
    if (state.isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [state.isOpen]);

  if (!state.isOpen) return null;

  const confirmButtonClass =
    state.confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-green-600 hover:bg-green-700 text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={state.onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2
            id="confirm-dialog-title"
            className="text-xl font-semibold text-gray-900"
          >
            {state.title}
          </h2>
          <button
            onClick={state.onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="다이얼로그 닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 메시지 */}
        <p
          id="confirm-dialog-message"
          className="text-gray-700 mb-6 whitespace-pre-wrap"
        >
          {state.message}
        </p>

        {/* 액션 버튼 */}
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelButtonRef}
            onClick={state.onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label={state.cancelLabel}
          >
            {state.cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={state.onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonClass}`}
            aria-label={state.confirmLabel}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
