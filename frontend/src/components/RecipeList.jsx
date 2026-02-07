import { useState } from 'react';
import { Clock, ChefHat, Flame, BookMarked, Check } from 'lucide-react';
import { saveRecipe } from '../services/api';
import { getDifficultyColor, getDifficultyText, DEFAULT_USER_ID } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import { SkeletonGrid, SkeletonRecipeCard } from './Skeleton';

export default function RecipeList({ recipes, loading, userId = DEFAULT_USER_ID }) {
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const [savedRecipeIds, setSavedRecipeIds] = useState(new Set());
  const [savingIds, setSavingIds] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState(null);
  if (loading) {
    return (
      <section className="mt-12" aria-labelledby="recipes-loading">
        <div className="flex items-center justify-between mb-6">
          <h2 id="recipes-loading" className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary-500" aria-hidden="true" />
            레시피 생성 중...
          </h2>
        </div>
        <SkeletonGrid count={3} SkeletonComponent={SkeletonRecipeCard} columns={3} />
      </section>
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
    <section className="mt-12" aria-labelledby="recipes-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="recipes-heading" className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-primary-500" aria-hidden="true" />
          추천 레시피
        </h2>
        <p className="text-sm text-gray-600" role="status">{recipes.length}개의 레시피</p>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <li
            key={index}
          >
            <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full">
              {/* Recipe Header */}
              <header className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
                <p className="text-sm opacity-90">{recipe.description}</p>
              </header>

            {/* Recipe Info */}
            <div className="p-6">
              {/* Metadata */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>조리 시간: {recipe.cooking_time}분</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4" aria-hidden="true" />
                  <span>칼로리: {recipe.calories}kcal</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    recipe.difficulty
                  )}`}
                  role="status"
                >
                  난이도: {getDifficultyText(recipe.difficulty)}
                </span>
              </div>

              {/* Ingredients */}
              <section className="mb-4" aria-labelledby={`ingredients-${index}`}>
                <h4 id={`ingredients-${index}`} className="text-sm font-semibold text-gray-900 mb-2">재료</h4>
                <ul className="space-y-1">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <li
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
                        {!ingredient.available && <span className="sr-only"> (보유하지 않음)</span>}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {ingredient.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Instructions */}
              <section className="mb-4" aria-labelledby={`instructions-${index}`}>
                <h4 id={`instructions-${index}`} className="text-sm font-semibold text-gray-900 mb-2">조리 방법</h4>
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
              </section>

              {/* Action Button */}
              <button
                onClick={() => handleSaveRecipe(recipe, index)}
                disabled={savedRecipeIds.has(`${recipe.title}-${index}`) || savingIds.has(`${recipe.title}-${index}`)}
                className={`w-full mt-4 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  savedRecipeIds.has(`${recipe.title}-${index}`)
                    ? 'bg-emerald-500 text-white cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
                aria-busy={savingIds.has(`${recipe.title}-${index}`)}
                aria-label={
                  savedRecipeIds.has(`${recipe.title}-${index}`)
                    ? `${recipe.title} 저장 완료`
                    : `${recipe.title} 레시피 저장하기`
                }
              >
                {savingIds.has(`${recipe.title}-${index}`) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true"></div>
                    저장 중...
                  </>
                ) : savedRecipeIds.has(`${recipe.title}-${index}`) ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    저장 완료
                  </>
                ) : (
                  <>
                    <BookMarked className="w-4 h-4" aria-hidden="true" />
                    이 레시피 저장하기
                  </>
                )}
              </button>
            </div>
            </article>
          </li>
        ))}
      </ul>

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
    </section>
  );
}
