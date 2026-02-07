import { CheckCircle2, AlertCircle, Leaf } from 'lucide-react';

export default function IngredientList({ ingredients, onGenerateRecipes }) {
  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  const getFreshnessColor = (freshness) => {
    switch (freshness) {
      case 'fresh':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'expiring':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getFreshnessIcon = (freshness) => {
    switch (freshness) {
      case 'fresh':
        return <CheckCircle2 className="w-4 h-4" aria-hidden="true" />;
      case 'expiring':
        return <AlertCircle className="w-4 h-4" aria-hidden="true" />;
      default:
        return <Leaf className="w-4 h-4" aria-hidden="true" />;
    }
  };

  const getFreshnessText = (freshness) => {
    switch (freshness) {
      case 'fresh':
        return '신선';
      case 'moderate':
        return '보통';
      case 'expiring':
        return '빨리 사용';
      default:
        return '미확인';
    }
  };

  return (
    <section className="max-w-3xl mx-auto mt-8" aria-labelledby="ingredients-heading">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 id="ingredients-heading" className="text-2xl font-bold text-gray-900">
            인식된 재료
          </h3>
          <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold" role="status">
            {ingredients.length}개 발견
          </span>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {ingredient.name}
                  </h4>
                  {ingredient.quantity && (
                    <p className="text-sm text-gray-600 mb-2">
                      수량: {ingredient.quantity}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
                        ${getFreshnessColor(ingredient.freshness)}
                      `}
                      role="status"
                      aria-label={`신선도: ${getFreshnessText(ingredient.freshness)}`}
                    >
                      {getFreshnessIcon(ingredient.freshness)}
                      <span>{getFreshnessText(ingredient.freshness)}</span>
                    </span>
                    {ingredient.confidence && (
                      <span className="text-xs text-gray-500" aria-label={`AI 확신도: ${Math.round(ingredient.confidence * 100)}%`}>
                        {Math.round(ingredient.confidence * 100)}% 확신
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={onGenerateRecipes}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98] min-h-[56px]"
        >
          이 재료로 레시피 찾기 🍳
        </button>
      </div>
    </section>
  );
}
