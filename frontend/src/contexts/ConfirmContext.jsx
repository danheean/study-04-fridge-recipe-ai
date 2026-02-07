/**
 * 확인 다이얼로그 Context
 * 전역에서 확인 다이얼로그를 표시하기 위한 Context
 */
import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '확인',
    cancelLabel: '취소',
    confirmVariant: 'primary', // 'primary' | 'danger'
    onConfirm: null,
    onCancel: null,
  });

  /**
   * 확인 다이얼로그 표시
   * @param {Object} options - 다이얼로그 옵션
   * @returns {Promise<boolean>} - 확인: true, 취소: false
   */
  const confirm = useCallback(
    ({
      title = '확인',
      message,
      confirmLabel = '확인',
      cancelLabel = '취소',
      confirmVariant = 'primary',
    }) => {
      return new Promise((resolve) => {
        setConfirmState({
          isOpen: true,
          title,
          message,
          confirmLabel,
          cancelLabel,
          confirmVariant,
          onConfirm: () => {
            setConfirmState((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setConfirmState((prev) => ({ ...prev, isOpen: false }));
            resolve(false);
          },
        });
      });
    },
    []
  );

  return (
    <ConfirmContext.Provider value={{ confirm, confirmState }}>
      {children}
    </ConfirmContext.Provider>
  );
}

/**
 * 확인 다이얼로그 hook
 */
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context.confirm;
}

export function useConfirmState() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirmState must be used within ConfirmProvider');
  }
  return context.confirmState;
}
