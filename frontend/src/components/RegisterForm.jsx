import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

/**
 * 회원가입 폼
 */
export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null);

  // 입력 필드 포커스 설정
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 검증
    if (!formData.name.trim()) {
      toast.warning('이름을 입력해주세요.');
      return;
    }

    if (!formData.email.trim()) {
      toast.warning('이메일 주소를 입력해주세요.');
      return;
    }

    if (formData.password.length < 8) {
      toast.warning('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.warning('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email.trim(), formData.password, formData.name.trim());
      toast.success('회원가입이 완료되었습니다! 환영합니다.');
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.userMessage || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
            aria-label="홈으로 돌아가기"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>홈으로</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
          <p className="text-gray-600 mt-2">FridgeChef에 오신 것을 환영합니다</p>
        </header>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                ref={nameInputRef}
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="홍길동"
                disabled={loading}
                required
                maxLength={50}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일 주소 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="example@email.com"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="8자 이상"
                disabled={loading}
                required
                minLength={8}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">최소 8자 이상 입력해주세요</p>
          </div>

          {/* Password Confirm */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="비밀번호 재입력"
                disabled={loading}
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[48px] active:scale-[0.98] mt-6"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                회원가입 중...
              </>
            ) : (
              '회원가입'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-primary-500 font-medium hover:text-primary-600 focus:outline-none focus:underline"
              disabled={loading}
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
