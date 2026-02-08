/**
 * API 클라이언트
 */
import axios from 'axios';
import { mockIngredients, mockRecipes, delay } from './mockData';
import { getErrorMessage } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true'; // 환경변수로 목 데이터 사용 여부 제어

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: JWT 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 에러를 사용자 친화적 메시지로 변환 + 401 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized: 자동 로그아웃
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // 로그인 페이지로 리다이렉트 또는 이벤트 발생
      window.dispatchEvent(new Event('unauthorized'));
    }

    // 에러 객체에 사용자 친화적 메시지 추가
    error.userMessage = getErrorMessage(error);
    return Promise.reject(error);
  }
);

/**
 * 이미지 분석 API
 */
export const analyzeImage = async (file, customPrompt = null, userId = 'demo-user-123') => {
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
  if (customPrompt) {
    formData.append('custom_prompt', customPrompt);
  }

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

// ===== 인증 관련 API =====

/**
 * 로그인
 */
export const loginApi = async (email, password) => {
  const response = await apiClient.post('/api/auth/login', { email, password });
  return response.data;
};

/**
 * 회원가입
 */
export const registerApi = async (email, password, name) => {
  const response = await apiClient.post('/api/auth/register', { email, password, name });
  return response.data;
};

/**
 * 비밀번호 재설정 (기존 사용자용)
 */
export const resetPasswordApi = async (email, newPassword) => {
  const response = await apiClient.post('/api/auth/reset-password', {
    email,
    new_password: newPassword,
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
 * 사용자 정보 조회 (ID)
 */
export const getUser = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}`);
  return response.data;
};

/**
 * 사용자 정보 조회 (이메일)
 */
export const getUserByEmail = async (email) => {
  const response = await apiClient.get(`/api/users/by-email/${encodeURIComponent(email)}`);
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

// ===== 관리자 API =====

/**
 * 전체 사용자 목록 조회 (관리자 전용)
 */
export const getAllUsers = async (adminId, skip = 0, limit = 20) => {
  const response = await apiClient.get('/api/admin/users', {
    params: { admin_id: adminId, skip, limit }
  });
  return response.data;
};

/**
 * 전체 시스템 통계 조회 (관리자 전용)
 */
export const getAdminStats = async (adminId) => {
  const response = await apiClient.get('/api/admin/stats', {
    params: { admin_id: adminId }
  });
  return response.data;
};

/**
 * 사용자 삭제 (관리자 전용)
 */
export const deleteUser = async (adminId, userId) => {
  const response = await apiClient.delete(`/api/admin/users/${userId}`, {
    params: { admin_id: adminId }
  });
  return response.data;
};

/**
 * 사용자 관리자 권한 설정/해제 (관리자 전용)
 */
export const toggleAdminRole = async (adminId, userId, isAdmin) => {
  const response = await apiClient.put(`/api/admin/users/${userId}/admin`, null, {
    params: { admin_id: adminId, is_admin: isAdmin }
  });
  return response.data;
};

export default apiClient;
