/**
 * API 클라이언트
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 이미지 분석 API
 */
export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

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
  const response = await apiClient.post('/api/recipes/generate', {
    ingredients,
    preferences,
  });

  return response.data;
};

/**
 * 레시피 저장 API
 */
export const saveRecipe = async (recipeId, userId) => {
  const response = await apiClient.post('/api/recipes/save', {
    recipe_id: recipeId,
    user_id: userId,
  });

  return response.data;
};

/**
 * 사용자 레시피 조회 API
 */
export const getUserRecipes = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}/recipes`);
  return response.data;
};

export default apiClient;
