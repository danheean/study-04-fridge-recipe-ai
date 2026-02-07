import { useState } from 'react';
import { Clock, ChefHat, Flame, BookMarked, Check } from 'lucide-react';
import { saveRecipe } from '../services/api';
import { getDifficultyColor, getDifficultyText, DEFAULT_USER_ID } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

export default function RecipeList({ recipes, loading, userId = DEFAULT_USER_ID }) {
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const [savedRecipeIds, setSavedRecipeIds] = useState(new Set());
  const [savingIds, setSavingIds] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState(null);
  if (loading) {
    return (
      <div className="mt-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-gray-600">레시피를 생성하고 있습니다...</p>
      </div>
    );
  }

  // 로그인 성공 후 대기 중인 레시피 저장
  const handleLoginSuccess = () => {
    if (pendingRecipe) {
      handleSaveRecipe(pendingRecipe.recipe, pendingRecipe.index);
      setPendingRecipe(null);
    }
  };

  if (!recipes || recipes.length === 0) {
    return null;
  }

  const handleSaveRecipe = async (recipe, index) => {
    const recipeKey = `${recipe.title}-${index}`;

    if (savedRecipeIds.has(recipeKey)) {
      toast.warning('이미 저장된 레시피입니다.');
      return;
    }

    // 인증 확인
    if (!isAuthenticated) {
      setPendingRecipe({ recipe, index });
      setShowLoginModal(true);
      return;
    }

    setSavingIds(prev => new Set(prev).add(recipeKey));

    try {
      await saveRecipe(userId, {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cooking_time: recipe.cooking_time,
        difficulty: recipe.difficulty,
        calories: recipe.calories || 0,
      });

      setSavedRecipeIds(prev => new Set(prev).add(recipeKey));
      toast.success('레시피가 저장되었습니다!');
    } catch (error) {
      console.error('Failed to save recipe:', error);
      toast.error(error.userMessage || '레시피 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeKey);
        return newSet;
      });
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-primary-500" />
          추천 레시피
        </h2>
        <p className="text-sm text-gray-600">{recipes.length}개의 레시피</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            {/* Recipe Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
              <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
              <p className="text-sm opacity-90">{recipe.description}</p>
            </div>

            {/* Recipe Info */}
            <div className="p-6">
              {/* Metadata */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.cooking_time}분</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  <span>{recipe.calories}kcal</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    recipe.difficulty
                  )}`}
                >
                  {getDifficultyText(recipe.difficulty)}
                </span>
              </div>

              {/* Ingredients */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">재료</h4>
                <div className="space-y-1">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span
                        className={
                          ingredient.available
                            ? 'text-gray-700'
                            : 'text-gray-400 line-through'
                        }
                      >
                        {ingredient.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {ingredient.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">조리 방법</h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="font-medium text-primary-500 shrink-0">
                        {idx + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSaveRecipe(recipe, index)}
                disabled={savedRecipeIds.has(`${recipe.title}-${index}`) || savingIds.has(`${recipe.title}-${index}`)}
                className={`w-full mt-4 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                  savedRecipeIds.has(`${recipe.title}-${index}`)
                    ? 'bg-emerald-500 text-white cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {savingIds.has(`${recipe.title}-${index}`) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    저장 중...
                  </>
                ) : savedRecipeIds.has(`${recipe.title}-${index}`) ? (
                  <>
                    <Check className="w-4 h-4" />
                    저장 완료
                  </>
                ) : (
                  <>
                    <BookMarked className="w-4 h-4" />
                    이 레시피 저장하기
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <LoginModal
          onClose={() => {
            setShowLoginModal(false);
            setPendingRecipe(null);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
