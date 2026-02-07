import { useState, useEffect } from 'react';
import { User, Settings, BookMarked, TrendingUp, Trash2, Clock, ChefHat, Flame } from 'lucide-react';
import { getSavedRecipes, deleteSavedRecipe, getUserStats, updatePreferences, getUser } from '../services/api';
import { getDifficultyColor, DEFAULT_USER_ID } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import RecipeDetailModal from '../components/RecipeDetailModal';

function Profile() {
  const toast = useToast();
  const { user } = useAuth();
  const userId = user?.id || DEFAULT_USER_ID;
  const [activeTab, setActiveTab] = useState('recipes');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [preferences, setPreferences] = useState({
    dietary_restrictions: [],
    excluded_ingredients: [],
    favorite_cuisines: [],
    allergies: [],
  });
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 병렬로 데이터 로드
      const [recipes, stats, user] = await Promise.all([
        getSavedRecipes(userId).catch(() => []),
        getUserStats(userId).catch(() => null),
        getUser(userId).catch(() => null),
      ]);

      setSavedRecipes(recipes);
      setUserStats(stats);
      setUserInfo(user);

      if (user && user.preferences) {
        setPreferences(user.preferences);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 레시피 삭제
  const handleDeleteRecipe = async (recipeId) => {
    if (!confirm('정말로 이 레시피를 삭제하시겠습니까?')) return;

    try {
      await deleteSavedRecipe(userId, recipeId);
      setSavedRecipes(savedRecipes.filter((r) => r.id !== recipeId));
      toast.success('레시피가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      toast.error(error.userMessage || '레시피 삭제에 실패했습니다.');
    }
  };

  // 선호도 입력 검증
  const validatePreferences = () => {
    const maxLength = 100;
    const maxItems = 50;

    // 각 필드 검증
    for (const [key, values] of Object.entries(preferences)) {
      if (!Array.isArray(values)) continue;

      // 항목 개수 제한
      if (values.length > maxItems) {
        toast.warning(`각 항목은 최대 ${maxItems}개까지 입력할 수 있습니다.`);
        return false;
      }

      // 각 값의 길이 제한
      for (const value of values) {
        if (value.length > maxLength) {
          toast.warning(`각 항목은 ${maxLength}자를 초과할 수 없습니다.`);
          return false;
        }
      }

      // 중복 제거 및 빈 값 제거
      const cleaned = [...new Set(values.filter((v) => v && v.trim()))];
      if (cleaned.length !== values.length) {
        // 중복이나 빈 값이 있으면 자동으로 정리
        setPreferences((prev) => ({
          ...prev,
          [key]: cleaned,
        }));
      }
    }

    return true;
  };

  // 선호도 업데이트
  const handleSavePreferences = async () => {
    // 입력 검증
    if (!validatePreferences()) {
      return;
    }

    try {
      await updatePreferences(userId, preferences);
      toast.success('선호도가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error(error.userMessage || '선호도 저장에 실패했습니다.');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">프로필 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userInfo?.name || '사용자'}
                </h1>
                <p className="text-gray-500 text-sm">{userInfo?.email || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">저장된 레시피</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userStats?.total_saved_recipes || 0}
                </p>
              </div>
              <BookMarked className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">이미지 업로드</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userStats?.total_uploads || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-secondary-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">가입일</p>
                <p className="text-lg font-semibold text-gray-900">
                  {userStats?.member_since
                    ? new Date(userStats.member_since).toLocaleDateString('ko-KR')
                    : '-'}
                </p>
              </div>
              <User className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('recipes')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'recipes'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BookMarked className="w-5 h-5 inline-block mr-2" />
                저장된 레시피
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'preferences'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5 inline-block mr-2" />
                선호도 설정
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'recipes' && (
              <div>
                {savedRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <BookMarked className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">저장된 레시피가 없습니다</p>
                    <p className="text-gray-400 text-sm mt-2">
                      레시피를 저장하면 여기에 표시됩니다
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900 flex-1">
                              {recipe.title}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRecipe(recipe.id);
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors ml-2"
                              title="삭제"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {recipe.description}
                          </p>

                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{recipe.cooking_time}분</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4" />
                              <span>{recipe.calories || 0}kcal</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}
                            >
                              {recipe.difficulty}
                            </span>

                            <div className="text-xs text-gray-500">
                              {new Date(recipe.created_at).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            재료 {recipe.ingredients?.length || 0}개
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="max-w-2xl">
                <div className="space-y-6">
                  {/* 식단 제한 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      식단 제한 (채식, 할랄 등)
                    </label>
                    <input
                      type="text"
                      value={preferences.dietary_restrictions.join(', ')}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          dietary_restrictions: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="예: 채식, 할랄"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      aria-describedby="dietary-hint"
                    />
                    <p id="dietary-hint" className="mt-1 text-xs text-gray-500">
                      쉼표(,)로 구분하여 입력하세요. 각 항목은 100자 이내, 최대 50개까지 가능합니다.
                    </p>
                  </div>

                  {/* 알레르기 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      알레르기
                    </label>
                    <input
                      type="text"
                      value={preferences.allergies.join(', ')}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          allergies: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="예: 땅콩, 해산물"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      aria-describedby="allergies-hint"
                    />
                    <p id="allergies-hint" className="mt-1 text-xs text-gray-500">
                      쉼표(,)로 구분하여 입력하세요. 각 항목은 100자 이내, 최대 50개까지 가능합니다.
                    </p>
                  </div>

                  {/* 제외할 재료 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제외할 재료
                    </label>
                    <input
                      type="text"
                      value={preferences.excluded_ingredients.join(', ')}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          excluded_ingredients: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="예: 고수, 셀러리"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      aria-describedby="excluded-hint"
                    />
                    <p id="excluded-hint" className="mt-1 text-xs text-gray-500">
                      쉼표(,)로 구분하여 입력하세요. 각 항목은 100자 이내, 최대 50개까지 가능합니다.
                    </p>
                  </div>

                  {/* 선호 요리 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      선호하는 요리 종류
                    </label>
                    <input
                      type="text"
                      value={preferences.favorite_cuisines.join(', ')}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          favorite_cuisines: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="예: 한식, 이탈리아, 일식"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      aria-describedby="cuisines-hint"
                    />
                    <p id="cuisines-hint" className="mt-1 text-xs text-gray-500">
                      쉼표(,)로 구분하여 입력하세요. 각 항목은 100자 이내, 최대 50개까지 가능합니다.
                    </p>
                  </div>

                  {/* 저장 버튼 */}
                  <button
                    onClick={handleSavePreferences}
                    className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                  >
                    선호도 저장
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 레시피 상세 모달 */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}

export default Profile;
