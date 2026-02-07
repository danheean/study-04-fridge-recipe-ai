/**
 * API 클라이언트
 */
import axios from 'axios';
import { mockIngredients, mockRecipes, delay } from './mockData';
import { getErrorMessage } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true' || true; // 기본값: true (목 데이터 사용)
const USE_MOCK_FOR_USER_API = false; // 사용자/레시피 저장 API는 실제 백엔드 사용

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터: 에러를 사용자 친화적 메시지로 변환
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 에러 객체에 사용자 친화적 메시지 추가
    error.userMessage = getErrorMessage(error);
    return Promise.reject(error);
  }
);

/**
 * 이미지 분석 API
 */
export const analyzeImage = async (file, userId = 'demo-user-123') => {
  // 목 데이터 사용
  if (USE_MOCK_DATA) {
    console.log('📸 [MOCK] 이미지 분석 중...', file.name);
    await delay(2000); // 2초 대기 (API 호출 시뮬레이션)
    console.log('✅ [MOCK] 이미지 분석 완료:', mockIngredients);
    return mockIngredients;
  }

  // 실제 API 호출
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);

  const response = await apiClient.post('/api/images/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 레시피 생성 API
 */
export const generateRecipes = async (ingredients, preferences = {}) => {
  // 목 데이터 사용
  if (USE_MOCK_DATA) {
    console.log('🍳 [MOCK] 레시피 생성 중...', { ingredients, preferences });
    await delay(2500); // 2.5초 대기 (API 호출 시뮬레이션)
    console.log('✅ [MOCK] 레시피 생성 완료:', mockRecipes);
    return mockRecipes;
  }

  // 실제 API 호출
  const response = await apiClient.post('/api/recipes/generate', {
    ingredients,
    preferences,
  });

  return response.data;
};

// ===== 사용자 관련 API =====

/**
 * 사용자 생성
 */
export const createUser = async (userData) => {
  const response = await apiClient.post('/api/users/', userData);
  return response.data;
};

/**
 * 사용자 정보 조회
 */
export const getUser = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}`);
  return response.data;
};

/**
 * 사용자 정보 수정
 */
export const updateUser = async (userId, userData) => {
  const response = await apiClient.put(`/api/users/${userId}`, userData);
  return response.data;
};

/**
 * 사용자 선호도 업데이트
 */
export const updatePreferences = async (userId, preferences) => {
  const response = await apiClient.put(`/api/users/${userId}/preferences`, preferences);
  return response.data;
};

/**
 * 사용자 통계 조회
 */
export const getUserStats = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}/stats`);
  return response.data;
};

// ===== 레시피 저장 관련 API =====

/**
 * 레시피 저장
 */
export const saveRecipe = async (userId, recipeData) => {
  const response = await apiClient.post(`/api/users/${userId}/recipes`, recipeData);
  return response.data;
};

/**
 * 저장된 레시피 목록 조회 (페이지네이션)
 */
export const getSavedRecipes = async (userId, skip = 0, limit = 10) => {
  const response = await apiClient.get(`/api/users/${userId}/recipes`, {
    params: { skip, limit }
  });
  return response.data;
};

/**
 * 저장된 레시피 상세 조회
 */
export const getSavedRecipe = async (userId, recipeId) => {
  const response = await apiClient.get(`/api/users/${userId}/recipes/${recipeId}`);
  return response.data;
};

/**
 * 저장된 레시피 삭제
 */
export const deleteSavedRecipe = async (userId, recipeId) => {
  const response = await apiClient.delete(`/api/users/${userId}/recipes/${recipeId}`);
  return response.data;
};

export default apiClient;
