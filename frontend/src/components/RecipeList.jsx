import { Clock, ChefHat, Flame } from 'lucide-react';

export default function RecipeList({ recipes, loading }) {
  if (loading) {
    return (
      <div className="mt-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-gray-600">레시피를 생성하고 있습니다...</p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return null;
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return '쉬움';
      case 'medium':
        return '보통';
      case 'hard':
        return '어려움';
      default:
        return difficulty;
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
              <button className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                이 레시피 저장하기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
