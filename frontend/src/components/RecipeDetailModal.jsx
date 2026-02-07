import { useEffect, useRef } from 'react';
import { X, Clock, Flame, ChefHat } from 'lucide-react';
import { getDifficultyColor, getDifficultyText } from '../utils/constants';

/**
 * 레시피 상세 정보 모달
 */
export default function RecipeDetailModal({ recipe, onClose }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 모달 열릴 때 포커스 설정
  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, []);

  // 포커스 트랩
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, []);

  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ChefHat className="w-6 h-6" aria-hidden="true" />
                <h2 id="recipe-modal-title" className="text-2xl font-bold">{recipe.title}</h2>
              </div>
              {recipe.description && (
                <p className="text-white/90 text-sm">{recipe.description}</p>
              )}
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
              aria-label="레시피 상세 정보 닫기"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>조리 시간: {recipe.cooking_time}분</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" aria-hidden="true" />
              <span>칼로리: {recipe.calories || 0}kcal</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                recipe.difficulty
              )}`}
              role="status"
            >
              난이도: {getDifficultyText(recipe.difficulty)}
            </span>
          </div>
        </header>

        {/* Content */}
        <article className="p-6 space-y-6">
          {/* 재료 */}
          <section aria-labelledby="ingredients-heading">
            <h3 id="ingredients-heading" className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-primary-500" aria-hidden="true">📝</span>
              필요한 재료
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ingredient, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white px-4 py-2 rounded-lg"
                    >
                      <span className="text-gray-700 font-medium">
                        {typeof ingredient === 'string'
                          ? ingredient
                          : ingredient.name || ingredient}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {typeof ingredient === 'object' && ingredient.quantity
                          ? ingredient.quantity
                          : '적당량'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm col-span-2">재료 정보가 없습니다.</p>
                )}
              </div>
            </div>
          </section>

          {/* 조리 방법 */}
          <section aria-labelledby="instructions-heading">
            <h3 id="instructions-heading" className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-primary-500" aria-hidden="true">👨‍🍳</span>
              조리 방법
            </h3>
            <div className="space-y-3">
              {recipe.instructions && recipe.instructions.length > 0 ? (
                recipe.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 bg-gradient-to-r from-primary-50 to-white p-4 rounded-xl border border-primary-100"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed flex-1">{step}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">조리 방법 정보가 없습니다.</p>
              )}
            </div>
          </section>

          {/* 저장 정보 */}
          {recipe.created_at && (
            <footer className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                <time dateTime={recipe.created_at}>
                  {new Date(recipe.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
                에 저장됨
              </p>
            </footer>
          )}
        </article>

        {/* Footer */}
        <footer className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[48px] active:scale-[0.98]"
          >
            닫기
          </button>
        </footer>
      </div>
    </div>
  );
}
