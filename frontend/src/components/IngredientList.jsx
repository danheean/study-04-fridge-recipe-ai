import { useState, memo, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Leaf, Trash2, Plus, X, Edit2 } from 'lucide-react';
import { InlineTip } from './Tooltip';

/**
 * 재료 목록 컴포넌트
 * React.memo 적용: ingredients 배열이나 콜백이 변경되지 않으면 리렌더링 방지
 */
const IngredientList = memo(function IngredientList({ ingredients, onGenerateRecipes, onIngredientsChange }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '', freshness: 'moderate' });
  const [editIngredient, setEditIngredient] = useState({ name: '', quantity: '', freshness: 'moderate' });

  // 빈 상태는 더 이상 null을 반환하지 않음 (항상 렌더링)
  const isEmpty = !Array.isArray(ingredients) || ingredients.length === 0;

  // 재료 삭제 (useCallback: 참조 안정성)
  const handleDelete = useCallback((ingredientId) => {
    if (onIngredientsChange) {
      const updated = ingredients.filter(ing => ing.id !== ingredientId);
      onIngredientsChange(updated);
    }
  }, [ingredients, onIngredientsChange]);

  // 재료 추가
  const handleAdd = useCallback(() => {
    if (!newIngredient.name.trim()) return;

    if (onIngredientsChange) {
      const newItem = {
        id: `manual-${Date.now()}`,
        name: newIngredient.name.trim(),
        quantity: newIngredient.quantity.trim() || '1개',
        freshness: newIngredient.freshness,
        confidence: null,
        manual: true, // 수동 추가 플래그
      };
      onIngredientsChange([...ingredients, newItem]);
    }

    // 폼 초기화
    setNewIngredient({ name: '', quantity: '', freshness: 'moderate' });
    setShowAddForm(false);
  }, [newIngredient, ingredients, onIngredientsChange]);

  // 재료 수정 시작
  const handleEditStart = (ingredient) => {
    setEditingId(ingredient.id);
    setEditIngredient({
      name: ingredient.name,
      quantity: ingredient.quantity || '',
      freshness: ingredient.freshness,
    });
  };

  // 재료 수정 저장
  const handleEditSave = (ingredientId) => {
    if (!editIngredient.name.trim()) return;

    if (onIngredientsChange) {
      const updated = ingredients.map(ing =>
        ing.id === ingredientId
          ? {
              ...ing,
              name: editIngredient.name.trim(),
              quantity: editIngredient.quantity.trim() || ing.quantity,
              freshness: editIngredient.freshness,
            }
          : ing
      );
      onIngredientsChange(updated);
    }

    setEditingId(null);
  };

  // 수정 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setEditIngredient({ name: '', quantity: '', freshness: 'moderate' });
  };

  // 추가 취소
  const handleCancel = () => {
    setNewIngredient({ name: '', quantity: '', freshness: 'moderate' });
    setShowAddForm(false);
  };

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
    <section aria-labelledby="ingredients-heading">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 id="ingredients-heading" className="text-2xl font-bold text-gray-900">
            인식된 재료
          </h3>
          <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold" role="status">
            {ingredients.length}개 발견
          </span>
        </div>

        {/* 첫 사용자를 위한 팁 */}
        {ingredients.length > 0 && ingredients.length <= 3 && (
          <InlineTip variant="tip">
            <strong>팁:</strong> 재료 카드 위에 마우스를 올리면 수정/삭제 버튼이 나타납니다.
            AI가 잘못 인식한 재료는 수정하거나 삭제할 수 있고, 추가 버튼으로 빠진 재료를 직접 입력할 수 있어요!
          </InlineTip>
        )}

        {ingredients.length === 0 && (
          <InlineTip variant="info">
            이미지 분석이 완료되면 여기에 인식된 재료가 표시됩니다.
            재료를 확인하고 수정한 후 '레시피 찾기' 버튼을 눌러주세요.
          </InlineTip>
        )}

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors relative group"
            >
              {editingId === ingredient.id ? (
                // 수정 모드
                <div className="space-y-3">
                  <div>
                    <label htmlFor={`edit-name-${ingredient.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      재료명 *
                    </label>
                    <input
                      id={`edit-name-${ingredient.id}`}
                      type="text"
                      value={editIngredient.name}
                      onChange={(e) => setEditIngredient({ ...editIngredient, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-quantity-${ingredient.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      수량
                    </label>
                    <input
                      id={`edit-quantity-${ingredient.id}`}
                      type="text"
                      value={editIngredient.quantity}
                      onChange={(e) => setEditIngredient({ ...editIngredient, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-freshness-${ingredient.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      신선도
                    </label>
                    <select
                      id={`edit-freshness-${ingredient.id}`}
                      value={editIngredient.freshness}
                      onChange={(e) => setEditIngredient({ ...editIngredient, freshness: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="fresh">신선</option>
                      <option value="moderate">보통</option>
                      <option value="expiring">빨리 사용</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(ingredient.id)}
                      disabled={!editIngredient.name.trim()}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 active:scale-95 disabled:cursor-not-allowed"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-95"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 표시 모드
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {ingredient.name}
                      </h4>
                      {ingredient.manual && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          수동
                        </span>
                      )}
                    </div>
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
                  <div className="ml-2 flex gap-1 opacity-60 md:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditStart(ingredient)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 active:scale-95 min-w-[40px] min-h-[40px]"
                      aria-label={`${ingredient.name} 수정`}
                      title="재료 수정"
                    >
                      <Edit2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(ingredient.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-95 min-w-[40px] min-h-[40px]"
                      aria-label={`${ingredient.name} 삭제`}
                      title="재료 삭제"
                    >
                      <Trash2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}

          {/* 재료 추가 폼 */}
          {showAddForm && (
            <li className="border-2 border-dashed border-primary-300 rounded-lg p-4 bg-primary-50">
              <div className="space-y-3">
                <div>
                  <label htmlFor="ingredient-name" className="block text-sm font-medium text-gray-700 mb-1">
                    재료명 *
                  </label>
                  <input
                    id="ingredient-name"
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    placeholder="예: 당근"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="ingredient-quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    수량
                  </label>
                  <input
                    id="ingredient-quantity"
                    type="text"
                    value={newIngredient.quantity}
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                    placeholder="예: 2개"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="ingredient-freshness" className="block text-sm font-medium text-gray-700 mb-1">
                    신선도
                  </label>
                  <select
                    id="ingredient-freshness"
                    value={newIngredient.freshness}
                    onChange={(e) => setNewIngredient({ ...newIngredient, freshness: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="fresh">신선</option>
                    <option value="moderate">보통</option>
                    <option value="expiring">빨리 사용</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={!newIngredient.name.trim()}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 active:scale-95 disabled:cursor-not-allowed"
                  >
                    추가
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-95"
                  >
                    취소
                  </button>
                </div>
              </div>
            </li>
          )}

          {/* 재료 추가 버튼 */}
          {!showAddForm && (
            <li>
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full h-full min-h-[120px] border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 hover:bg-primary-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 active:scale-95"
                aria-label="재료 추가하기"
              >
                <Plus className="w-8 h-8" aria-hidden="true" />
                <span className="font-medium">재료 추가</span>
              </button>
            </li>
          )}
        </ul>

        <button
          onClick={onGenerateRecipes}
          disabled={isEmpty}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg py-5 px-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 min-h-[60px] group"
          aria-label="재료로 레시피 찾기"
        >
          <span className="flex items-center justify-center gap-3">
            <span>이 재료로 레시피 찾기</span>
            <span className="text-2xl group-hover:animate-bounce">🍳</span>
          </span>
        </button>
      </div>
    </section>
  );
});

export default IngredientList;
