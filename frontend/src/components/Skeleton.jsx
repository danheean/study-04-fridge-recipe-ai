/**
 * 스켈레톤 로딩 UI 컴포넌트
 * 콘텐츠 로딩 중 사용자에게 로딩 상태를 시각적으로 표시
 */

/**
 * 기본 스켈레톤 - 다양한 크기와 형태로 사용 가능
 */
export function Skeleton({ className = '', width, height }) {
  const style = {
    width: width || '100%',
    height: height || '1rem',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * 텍스트 라인 스켈레톤
 */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4"
          width={index === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * 레시피 카드 스켈레톤
 */
export function SkeletonRecipeCard() {
  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden"
      aria-hidden="true"
      role="status"
      aria-label="레시피 로딩 중"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-300 to-gray-200 p-6 animate-pulse">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Metadata */}
        <div className="flex gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Ingredients */}
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * 프로필 카드 스켈레톤
 */
export function SkeletonProfileCard() {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
      aria-hidden="true"
      role="status"
      aria-label="프로필 로딩 중"
    >
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

/**
 * 통계 카드 스켈레톤
 */
export function SkeletonStatsCard() {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-6"
      aria-hidden="true"
      role="status"
      aria-label="통계 로딩 중"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  );
}

/**
 * 재료 카드 스켈레톤
 */
export function SkeletonIngredientCard() {
  return (
    <div
      className="border border-gray-200 rounded-lg p-4"
      aria-hidden="true"
      role="status"
      aria-label="재료 로딩 중"
    >
      <div className="space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

/**
 * 스켈레톤 그리드 - 여러 개의 스켈레톤을 그리드로 표시
 */
export function SkeletonGrid({ count = 3, SkeletonComponent = SkeletonRecipeCard, columns = 3 }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div
      className={`grid ${gridCols[columns]} gap-6`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
      <span className="sr-only">콘텐츠 로딩 중...</span>
    </div>
  );
}
