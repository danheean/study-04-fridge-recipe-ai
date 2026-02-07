import { useLoading } from '../contexts/LoadingContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * 전역 로딩 오버레이
 * 특정 키들에 대한 로딩 상태일 때 전체 화면을 차단하는 오버레이 표시
 */
export default function GlobalLoadingOverlay({ watchKeys = [] }) {
  const { isLoading } = useLoading();

  // watchKeys 중 하나라도 로딩 중이면 오버레이 표시
  const shouldShow = watchKeys.some((key) => isLoading(key));

  if (!shouldShow) return null;

  return (
    <LoadingSpinner
      fullScreen
      size="xl"
      message="처리 중입니다..."
    />
  );
}
