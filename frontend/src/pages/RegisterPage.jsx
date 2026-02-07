import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, User, Mail, Loader2 } from 'lucide-react';
import { createUser } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * 프로필 등록 페이지
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dietary_restrictions: '',
    allergies: '',
    excluded_ingredients: '',
    favorite_cuisines: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // 이름 필수
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.length > 100) {
      newErrors.name = '이름은 100자 이내로 입력해주세요.';
    }

    // 이메일 선택 사항이지만, 입력 시 형식 검증
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning('입력 정보를 확인해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 선호도 데이터 파싱
      const preferences = {
        dietary_restrictions: formData.dietary_restrictions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        allergies: formData.allergies
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        excluded_ingredients: formData.excluded_ingredients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        favorite_cuisines: formData.favorite_cuisines
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        preferences,
      };

      const result = await createUser(userData);

      // AuthContext에 등록 (localStorage에도 저장됨)
      register(result);

      toast.success('프로필이 생성되었습니다!');

      // 프로필 페이지로 이동
      setTimeout(() => {
        navigate(`/profile`);
      }, 1000);
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(error.userMessage || '프로필 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ChefHat className="w-8 h-8 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900">FridgeChef</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">프로필 만들기</h2>
            <p className="text-gray-600">
              레시피를 저장하고 맞춤 추천을 받으려면 프로필을 만들어주세요
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 (필수) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="홍길동"
                  maxLength={100}
                  required
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
              </div>
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">{errors.name}</p>
              )}
            </div>

            {/* 이메일 (선택) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 <span className="text-gray-400 text-xs">(선택사항)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{errors.email}</p>
              )}
            </div>

            {/* 선호도 섹션 */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                선호도 설정 <span className="text-gray-400 text-sm font-normal">(선택사항)</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                더 정확한 레시피 추천을 위해 선호도를 설정해주세요
              </p>

              <div className="space-y-4">
                {/* 식단 제한 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    식단 제한 (채식, 할랄 등)
                  </label>
                  <input
                    type="text"
                    value={formData.dietary_restrictions}
                    onChange={(e) => handleChange('dietary_restrictions', e.target.value)}
                    placeholder="예: 채식, 할랄"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">쉼표(,)로 구분하여 입력하세요</p>
                </div>

                {/* 알레르기 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    알레르기
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => handleChange('allergies', e.target.value)}
                    placeholder="예: 땅콩, 해산물"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">쉼표(,)로 구분하여 입력하세요</p>
                </div>

                {/* 제외할 재료 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제외할 재료
                  </label>
                  <input
                    type="text"
                    value={formData.excluded_ingredients}
                    onChange={(e) => handleChange('excluded_ingredients', e.target.value)}
                    placeholder="예: 고수, 셀러리"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">쉼표(,)로 구분하여 입력하세요</p>
                </div>

                {/* 선호 요리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    선호하는 요리 종류
                  </label>
                  <input
                    type="text"
                    value={formData.favorite_cuisines}
                    onChange={(e) => handleChange('favorite_cuisines', e.target.value)}
                    placeholder="예: 한식, 이탈리아, 일식"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">쉼표(,)로 구분하여 입력하세요</p>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[48px] active:scale-[0.98]"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  생성 중...
                </>
              ) : (
                '프로필 만들기'
              )}
            </button>

            {/* 로그인 링크 */}
            <p className="text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                로그인
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
