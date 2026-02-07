import { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ChefHat, User as UserIcon } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ImageUpload from './components/ImageUpload';
import IngredientList from './components/IngredientList';
import RecipeList from './components/RecipeList';
import AnalysisInfo from './components/AnalysisInfo';
import Profile from './pages/Profile';
import RegisterPage from './pages/RegisterPage';
import { generateRecipes } from './services/api';
import { DEFAULT_USER_ID } from './utils/constants';

function Home() {
  const toast = useToast();
  const { user } = useAuth();
  const imageUploadRef = useRef(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFeatures, setShowFeatures] = useState(true);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);
  const userId = user?.id || DEFAULT_USER_ID;

  const handleAnalysisComplete = (result) => {
    console.log('Analysis result:', result);
    setIngredients(result.ingredients || []);
    setRecipes([]);
    setShowFeatures(false);

    // 분석 메타데이터 저장
    setAnalysisMetadata({
      model: result.model,
      duration: result.analysisDuration,
      fileName: result.fileName,
      fileSize: result.fileSize,
    });
  };

  const handleGenerateRecipes = async () => {
    setLoading(true);
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
    }
  };

  const handleReset = () => {
    setIngredients([]);
    setRecipes([]);
    setShowFeatures(true);
    setAnalysisMetadata(null);
    // ImageUpload 컴포넌트도 초기화
    if (imageUploadRef.current) {
      imageUploadRef.current.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ChefHat className="w-8 h-8 text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900">FridgeChef</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                프로필
              </Link>
              {ingredients.length > 0 && (
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  새로 시작하기
                </button>
              )}
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 좌측: 분석 정보 */}
            <div className="space-y-6">
              <AnalysisInfo metadata={analysisMetadata} />

              {/* 작은 이미지 업로드 (재업로드용) */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  다른 이미지 분석하기
                </h3>
                <ImageUpload ref={imageUploadRef} onAnalysisComplete={handleAnalysisComplete} />
              </div>
            </div>

            {/* 우측: 재료 목록 */}
            <div>
              <IngredientList
                ingredients={ingredients}
                onGenerateRecipes={handleGenerateRecipes}
              />
            </div>
          </div>
        )}

        {/* Recipe List */}
        <RecipeList recipes={recipes} loading={loading} userId={userId} />

        {/* Features - 처음에만 표시 */}
        {showFeatures && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI 재료 인식
              </h3>
              <p className="text-gray-600">
                사진만 찍으면 AI가 냉장고 속 재료를 자동으로 인식합니다
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🍳</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                맞춤 레시피 추천
              </h3>
              <p className="text-gray-600">
                보유한 재료로 만들 수 있는 다양한 레시피를 추천받으세요
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                레시피 저장
              </h3>
              <p className="text-gray-600">
                마음에 드는 레시피를 저장하고 언제든 다시 확인하세요
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>© 2026 FridgeChef. Powered by OpenRouter AI.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
