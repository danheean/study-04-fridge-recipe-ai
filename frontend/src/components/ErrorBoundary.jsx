import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리 내에서 발생하는 JavaScript 에러를 캐치하고
 * 폴백 UI를 표시합니다.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * 에러 발생 시 상태 업데이트
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * 에러 정보 로깅
   */
  componentDidCatch(error, errorInfo) {
    // 에러 정보를 state에 저장
    this.setState({
      error,
      errorInfo,
    });

    // 에러 로깅 (프로덕션에서는 에러 추적 서비스로 전송)
    console.error('❌ Error caught by ErrorBoundary:', error);
    console.error('Component Stack:', errorInfo.componentStack);

    // TODO: 프로덕션 환경에서는 Sentry 등으로 전송
    // Sentry.captureException(error, { extra: errorInfo });
  }

  /**
   * 에러 상태 초기화 및 페이지 새로고침
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  /**
   * 홈으로 이동
   */
  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
            {/* 에러 아이콘 */}
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* 에러 제목 */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              문제가 발생했습니다
            </h1>

            {/* 에러 설명 */}
            <p className="text-gray-600 text-center mb-6">
              죄송합니다. 예상치 못한 오류가 발생했습니다.
              <br />
              아래 버튼을 클릭하여 페이지를 새로고침하거나 홈으로 이동해주세요.
            </p>

            {/* 에러 메시지 (개발 모드에서만 표시) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <summary className="cursor-pointer font-medium text-red-900 mb-2">
                  개발자 정보 (클릭하여 펼치기)
                </summary>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">에러 메시지:</p>
                    <pre className="text-xs text-red-700 bg-white p-2 rounded overflow-x-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <p className="text-sm font-semibold text-red-800 mb-1">컴포넌트 스택:</p>
                      <pre className="text-xs text-red-700 bg-white p-2 rounded overflow-x-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                페이지 새로고침
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                홈으로 이동
              </button>
            </div>

            {/* 도움말 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                문제가 계속되면 페이지를 완전히 새로고침(Ctrl+Shift+R)하거나
                <br />
                브라우저 캐시를 삭제해보세요.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // 에러가 없으면 자식 컴포넌트 렌더링
    return this.props.children;
  }
}

export default ErrorBoundary;
