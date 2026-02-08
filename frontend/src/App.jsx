import { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ChefHat, User as UserIcon, ChevronDown, ChevronUp, Shield, CookingPot } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import ConfirmDialog from './components/ConfirmDialog';
import ImageUpload from './components/ImageUpload';
import IngredientList from './components/IngredientList';
import RecipeList from './components/RecipeList';
import AnalysisInfo from './components/AnalysisInfo';
import LoginModal from './components/LoginModal';
import Profile from './pages/Profile';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import { generateRecipes } from './services/api';
import { DEFAULT_USER_ID } from './utils/constants';
import { processAndAnalyzeImage } from './utils/imageAnalysis';
import LoadingSpinner from './components/LoadingSpinner';
import ReanalysisModal from './components/ReanalysisModal';

function Home() {
  const toast = useToast();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { startLoading, stopLoading, isAnyLoading } = useLoading();
  const imageUploadRef = useRef(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFeatures, setShowFeatures] = useState(true);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null); // 재분석용 원본 파일
  const [rawAnalysisData, setRawAnalysisData] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const [showReanalysisModal, setShowReanalysisModal] = useState(false);
  const newImageInputRef = useRef(null);
  const userId = user?.id || DEFAULT_USER_ID;

  const handleAnalysisComplete = (result, file = null) => {
    console.log('Analysis result:', result);
    setIngredients(result.ingredients || []);
    setRecipes([]);
    setShowFeatures(false);

    // 업로드된 이미지 저장
    setUploadedImage(result.imagePreview);

    // 재분석용 원본 파일 저장
    if (file) {
      setUploadedFile(file);
    }

    // 분석 원본 데이터 저장
    setRawAnalysisData(result);

    // 분석 메타데이터 저장
    setAnalysisMetadata({
      model: result.model,
      duration: result.analysisDuration,
      fileName: result.fileName,
      fileSize: result.fileSize,
    });
  };

  const handleGenerateRecipes = async () => {
    const loadingKey = 'generate-recipes';
    setLoading(true);
    startLoading(loadingKey);
    try {
      // 재료 이름 목록 추출
      const ingredientNames = ingredients.map((ing) => ing.name);

      // API 호출
      const result = await generateRecipes(ingredientNames);
      console.log('Recipe generation result:', result);

      setRecipes(result.recipes || []);
    } catch (error) {
      console.error('레시피 생성 실패:', error);
      toast.error(error.userMessage || '레시피 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
      stopLoading(loadingKey);
    }
  };

  const handleReset = () => {
    setIngredients([]);
    setRecipes([]);
    setShowFeatures(true);
    setAnalysisMetadata(null);
    setUploadedImage(null);
    setRawAnalysisData(null);
    setShowRawData(false);
    // ImageUpload 컴포넌트도 초기화
    if (imageUploadRef.current) {
      imageUploadRef.current.reset();
    }
  };

  // 재료 목록 변경 핸들러
  const handleIngredientsChange = (updatedIngredients) => {
    setIngredients(updatedIngredients);
    // 재료 변경 시 레시피 초기화
    setRecipes([]);
  };

  const handleNewImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingKey = 'analyze-new-image';
    startLoading(loadingKey);

    try {
      // 공통 유틸리티 함수 사용 (검증, 프리뷰 생성, API 호출 모두 포함)
      const result = await processAndAnalyzeImage(file);

      // 분석 완료 핸들러 호출 (파일 객체도 함께 전달)
      handleAnalysisComplete(result, file);

      toast.success('이미지 분석이 완료되었습니다!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.userMessage || error.message || '이미지 분석 중 오류가 발생했습니다.');
    } finally {
      stopLoading(loadingKey);
    }

    // 파일 input 초기화 (같은 파일 재선택 가능하도록)
    e.target.value = '';
  };

  // 이미지 재분석
  const handleReanalyze = async (customPrompt) => {
    if (!uploadedFile) {
      toast.error('재분석할 이미지가 없습니다.');
      return;
    }

    const loadingKey = 'reanalyze-image';
    startLoading(loadingKey);

    try {
      // 커스텀 프롬프트와 함께 재분석
      const result = await processAndAnalyzeImage(uploadedFile, null, customPrompt);

      // 분석 완료 핸들러 호출
      handleAnalysisComplete(result, uploadedFile);

      toast.success('이미지 재분석이 완료되었습니다!');
    } catch (error) {
      console.error('Reanalysis error:', error);
      toast.error(error.userMessage || error.message || '이미지 재분석 중 오류가 발생했습니다.');
    } finally {
      stopLoading(loadingKey);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* 전역 로딩 스피너 */}
      {isAnyLoading() && (
        <LoadingSpinner
          fullScreen
          size="lg"
          message="AI가 이미지를 분석하고 있습니다..."
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg">
              <ChefHat className="w-8 h-8 text-primary-500" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-gray-900">FridgeChef</h1>
            </Link>
            <nav aria-label="주요 네비게이션">
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg px-3 py-2.5 min-h-[44px] active:bg-red-50 active:scale-95"
                    aria-label="관리자 페이지로 이동"
                  >
                    <Shield className="w-5 h-5" aria-hidden="true" />
                    관리자
                  </Link>
                )}
                {isAuthenticated ? (
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg px-3 py-2.5 min-h-[44px] active:bg-gray-100 active:scale-95"
                    aria-label={`${user.name || '사용자'} 프로필로 이동`}
                  >
                    <UserIcon className="w-5 h-5" aria-hidden="true" />
                    {user.name || user.username || '사용자'}
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg px-3 py-2.5 min-h-[44px] active:bg-gray-100 active:scale-95"
                    aria-label="로그인하기"
                  >
                    <UserIcon className="w-5 h-5" aria-hidden="true" />
                    로그인
                  </button>
                )}
                {ingredients.length > 0 && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg px-3 py-2.5 min-h-[44px] active:bg-emerald-50 active:scale-95"
                    aria-label="새 레시피 찾기"
                  >
                    <CookingPot className="w-5 h-5" aria-hidden="true" />
                    새 레시피
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            냉장고 재료로 <span className="text-primary-500">레시피</span> 찾기
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            냉장고 사진을 업로드하면 AI가 재료를 인식하고 맞춤 레시피를 추천해드립니다
          </p>
        </div>

        {/* Image Upload - 분석 전에만 중앙 배치 */}
        {ingredients.length === 0 && (
          <ImageUpload ref={imageUploadRef} onAnalysisComplete={handleAnalysisComplete} />
        )}

        {/* 분석 완료 후: 2컬럼 레이아웃 */}
        {ingredients.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-start">
            {/* 좌측: 분석 정보 */}
            <div className="space-y-6">
              <AnalysisInfo metadata={analysisMetadata} />

              {/* 업로드된 이미지 표시 */}
              {uploadedImage && (
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    업로드된 이미지
                  </h3>
                  <img
                    src={uploadedImage}
                    alt="분석된 냉장고 이미지"
                    className="w-full rounded-lg shadow-sm"
                  />

                  {/* 분석 결과 보기 */}
                  {rawAnalysisData && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowRawData(!showRawData)}
                        className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1.5 transition-colors"
                        aria-expanded={showRawData}
                      >
                        {showRawData ? (
                          <>
                            <ChevronUp className="w-4 h-4" aria-hidden="true" />
                            분석 결과 숨기기
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" aria-hidden="true" />
                            분석 결과 보기
                          </>
                        )}
                      </button>

                      {/* 분석 결과 표시 */}
                      {showRawData && (
                        <div className="mt-3 bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words">
                            {JSON.stringify(rawAnalysisData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 버튼 그룹 */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setShowReanalysisModal(true)}
                      className="flex-1 text-sm text-white bg-green-500 hover:bg-green-600 font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 active:scale-95"
                    >
                      다시 분석하기
                    </button>
                    <button
                      onClick={() => newImageInputRef.current?.click()}
                      className="flex-1 text-sm text-white bg-primary-500 hover:bg-primary-600 font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 active:scale-95"
                    >
                      새 이미지로 분석하기
                    </button>
                  </div>

                  {/* 숨겨진 파일 input */}
                  <input
                    ref={newImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleNewImageUpload}
                    className="hidden"
                    aria-label="새 냉장고 이미지 선택"
                  />
                </div>
              )}
            </div>

            {/* 우측: 재료 목록 */}
            <div>
              <IngredientList
                ingredients={ingredients}
                onGenerateRecipes={handleGenerateRecipes}
                onIngredientsChange={handleIngredientsChange}
              />
            </div>
          </div>
        )}

        {/* Recipe List */}
        <RecipeList recipes={recipes} loading={loading} userId={userId} />

        {/* Features - 처음에만 표시 */}
        {showFeatures && (
          <section className="mt-16" aria-label="서비스 기능 소개">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <article className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl" aria-hidden="true">📸</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI 재료 인식
                </h3>
                <p className="text-gray-600">
                  사진만 찍으면 AI가 냉장고 속 재료를 자동으로 인식합니다
                </p>
              </article>

              <article className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl" aria-hidden="true">🍳</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  맞춤 레시피 추천
                </h3>
                <p className="text-gray-600">
                  보유한 재료로 만들 수 있는 다양한 레시피를 추천받으세요
                </p>
              </article>

              <article className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl" aria-hidden="true">💾</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  레시피 저장
                </h3>
                <p className="text-gray-600">
                  마음에 드는 레시피를 저장하고 언제든 다시 확인하세요
                </p>
              </article>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>© 2026 FridgeChef. Powered by OpenRouter AI.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            toast.success('로그인되었습니다!');
          }}
        />
      )}

      {/* Reanalysis Modal */}
      <ReanalysisModal
        isOpen={showReanalysisModal}
        onClose={() => setShowReanalysisModal(false)}
        onReanalyze={handleReanalyze}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </Router>
              <ConfirmDialog />
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
