/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
export const getErrorMessage = (error) => {
  // 기술적인 에러 정보는 콘솔에만 로깅
  console.error('Error details:', error);

  // 네트워크 에러
  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return '인터넷 연결을 확인해주세요.';
    }
    return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
  }

  // HTTP 상태 코드별 메시지
  const status = error.response?.status;

  switch (status) {
    case 400:
      // 검증 실패 - 서버에서 제공한 메시지 사용
      return error.response?.data?.detail || '입력 정보를 확인해주세요.';

    case 401:
      return '로그인이 필요합니다.';

    case 403:
      return '접근 권한이 없습니다.';

    case 404:
      return '요청한 정보를 찾을 수 없습니다.';

    case 409:
      return '이미 존재하는 정보입니다.';

    case 422:
      // Pydantic 검증 오류
      const validationErrors = error.response?.data?.detail;
      if (Array.isArray(validationErrors)) {
        // 첫 번째 검증 오류 메시지 반환
        const firstError = validationErrors[0];
        return firstError?.msg || '입력 정보가 올바르지 않습니다.';
      }
      return error.response?.data?.detail || '입력 정보가 올바르지 않습니다.';

    case 429:
      return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';

    case 500:
    case 502:
    case 503:
    case 504:
      return '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';

    default:
      return '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
};

/**
 * 작업별 사용자 친화적 에러 메시지
 */
export const getActionErrorMessage = (action, error) => {
  const baseMessage = getErrorMessage(error);

  const actionMessages = {
    'analyze-image': '이미지 분석 중 오류가 발생했습니다. ',
    'generate-recipes': '레시피 생성 중 오류가 발생했습니다. ',
    'save-recipe': '레시피 저장에 실패했습니다. ',
    'delete-recipe': '레시피 삭제에 실패했습니다. ',
    'update-preferences': '선호도 저장에 실패했습니다. ',
    'get-user': '사용자 정보를 불러오지 못했습니다. ',
    'get-stats': '통계 정보를 불러오지 못했습니다. ',
  };

  const prefix = actionMessages[action] || '';
  return prefix + baseMessage;
};
