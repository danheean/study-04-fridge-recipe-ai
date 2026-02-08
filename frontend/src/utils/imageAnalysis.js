/**
 * 이미지 분석 공통 유틸리티
 */
import { analyzeImage } from '../services/api';

/**
 * 이미지 파일 검증 및 분석
 * @param {File} file - 업로드할 이미지 파일
 * @param {Function} onProgress - 진행 상태 콜백 (optional)
 * @param {string} customPrompt - 커스텀 프롬프트 (optional)
 * @returns {Promise<Object>} 분석 결과 (imagePreview, fileName, fileSize, analysisDuration, model 포함)
 * @throws {Error} 검증 실패 또는 분석 오류 시
 */
export const processAndAnalyzeImage = async (file, onProgress = null, customPrompt = null) => {
  // 1. 파일 타입 검증
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다.');
  }

  // 2. 파일 크기 검증 (20MB)
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('파일 크기는 20MB 이하여야 합니다.');
  }

  // 3. 이미지 프리뷰 생성 (Promise로 변환)
  const imageDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    reader.readAsDataURL(file);
  });

  // 4. API 호출
  if (onProgress) onProgress('analyzing');
  const startTime = Date.now();

  try {
    const result = await analyzeImage(file, customPrompt);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    // 5. 분석 결과 반환
    return {
      ...result,
      imagePreview: imageDataUrl,
      fileName: file.name,
      fileSize: file.size,
      analysisDuration: duration,
      model: result.model || 'Unknown Model',
    };
  } catch (error) {
    // userMessage 우선, 없으면 error.message 사용
    const errorMessage = error.userMessage || error.message || '이미지 분석 중 오류가 발생했습니다.';
    const enhancedError = new Error(errorMessage);
    enhancedError.userMessage = errorMessage;
    enhancedError.originalError = error;
    throw enhancedError;
  }
};
