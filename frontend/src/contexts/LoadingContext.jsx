import { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext(null);

/**
 * 전역 로딩 상태 관리 Context
 *
 * 여러 작업의 로딩 상태를 동시에 추적하고 관리합니다.
 * 각 작업은 고유한 key로 식별됩니다.
 */
export function LoadingProvider({ children }) {
  // { [key: string]: boolean } 형태로 여러 로딩 상태 관리
  const [loadingStates, setLoadingStates] = useState({});

  /**
   * 로딩 시작
   * @param {string} key - 작업을 식별하는 고유 키
   */
  const startLoading = useCallback((key) => {
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
  }, []);

  /**
   * 로딩 종료
   * @param {string} key - 작업을 식별하는 고유 키
   */
  const stopLoading = useCallback((key) => {
    setLoadingStates((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  /**
   * 특정 작업의 로딩 상태 확인
   * @param {string} key - 작업을 식별하는 고유 키
   * @returns {boolean}
   */
  const isLoading = useCallback(
    (key) => {
      return !!loadingStates[key];
    },
    [loadingStates]
  );

  /**
   * 전체 로딩 상태 확인 (하나라도 로딩 중이면 true)
   * @returns {boolean}
   */
  const isAnyLoading = useCallback(() => {
    return Object.keys(loadingStates).length > 0;
  }, [loadingStates]);

  const value = {
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
    loadingStates,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * 로딩 상태 Hook
 * @returns {Object} { startLoading, stopLoading, isLoading, isAnyLoading }
 */
export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}

/**
 * 특정 작업에 대한 로딩 상태 Hook
 * @param {string} key - 작업을 식별하는 고유 키
 * @returns {Object} { isLoading, startLoading, stopLoading }
 */
export function useLoadingState(key) {
  const { isLoading, startLoading, stopLoading } = useLoading();

  return {
    isLoading: isLoading(key),
    startLoading: () => startLoading(key),
    stopLoading: () => stopLoading(key),
  };
}
