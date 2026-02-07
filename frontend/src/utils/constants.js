/**
 * 애플리케이션 전역 상수
 */

// 난이도 색상 매핑
export const DIFFICULTY_COLORS = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

// 난이도 텍스트 매핑
export const DIFFICULTY_TEXT = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

// 신선도 색상 매핑
export const FRESHNESS_COLORS = {
  fresh: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  moderate: 'bg-amber-100 text-amber-700 border-amber-200',
  expiring: 'bg-red-100 text-red-700 border-red-200',
};

// 신선도 텍스트 매핑
export const FRESHNESS_TEXT = {
  fresh: '신선',
  moderate: '보통',
  expiring: '빨리 사용',
};

/**
 * 난이도에 따른 색상 클래스를 반환
 * @param {string} difficulty - 난이도 (easy, medium, hard)
 * @returns {string} Tailwind CSS 클래스 문자열
 */
export const getDifficultyColor = (difficulty) => {
  return DIFFICULTY_COLORS[difficulty] || 'bg-gray-100 text-gray-700';
};

/**
 * 난이도 텍스트를 반환
 * @param {string} difficulty - 난이도 (easy, medium, hard)
 * @returns {string} 한글 난이도 텍스트
 */
export const getDifficultyText = (difficulty) => {
  return DIFFICULTY_TEXT[difficulty] || difficulty;
};

/**
 * 신선도에 따른 색상 클래스를 반환
 * @param {string} freshness - 신선도 (fresh, moderate, expiring)
 * @returns {string} Tailwind CSS 클래스 문자열
 */
export const getFreshnessColor = (freshness) => {
  return FRESHNESS_COLORS[freshness] || 'bg-gray-100 text-gray-700 border-gray-200';
};

/**
 * 신선도 텍스트를 반환
 * @param {string} freshness - 신선도 (fresh, moderate, expiring)
 * @returns {string} 한글 신선도 텍스트
 */
export const getFreshnessText = (freshness) => {
  return FRESHNESS_TEXT[freshness] || freshness;
};

// 파일 크기 제한 (바이트)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// API 지연 시간 (목 데이터용, 밀리초)
export const MOCK_DELAY = {
  IMAGE_ANALYSIS: 2000,
  RECIPE_GENERATION: 2500,
};

// 기본 사용자 ID
export const DEFAULT_USER_ID = 'demo-user-123';
