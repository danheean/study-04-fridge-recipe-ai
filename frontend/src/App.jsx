import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import IngredientList from './components/IngredientList';

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [showFeatures, setShowFeatures] = useState(true);

  const handleAnalysisComplete = (result) => {
    console.log('Analysis result:', result);
    setIngredients(result.ingredients || []);
    setShowFeatures(false);
  };

  const handleGenerateRecipes = () => {
    // TODO: Phase 3에서 구현
    alert('레시피 생성 기능은 Phase 3에서 구현됩니다!');
  };

  const handleReset = () => {
    setIngredients([]);
    setShowFeatures(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900">FridgeChef</h1>
            </div>
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

        {/* Image Upload */}
        <ImageUpload onAnalysisComplete={handleAnalysisComplete} />

        {/* Ingredient List */}
        {ingredients.length > 0 && (
          <IngredientList
            ingredients={ingredients}
            onGenerateRecipes={handleGenerateRecipes}
          />
        )}

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

export default App;
