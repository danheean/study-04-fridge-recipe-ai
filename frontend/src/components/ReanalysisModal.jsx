import { useState, useEffect, useRef } from 'react';
import { X, Search, Eye, RefreshCw, Edit3 } from 'lucide-react';

/**
 * 재분석 옵션 선택 모달
 */
export default function ReanalysisModal({ isOpen, onClose, onReanalyze }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 포커스 트랩
      modalRef.current?.focus();
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const options = [
    {
      id: 'accuracy',
      icon: <Search className="w-6 h-6" />,
      title: '정확도 높이기',
      description: '더 세밀하게 분석하여 재료를 정확히 식별합니다',
      prompt: '이전 분석보다 더 정확하게 재료를 식별해주세요. 재료의 이름, 수량, 신선도를 더 자세히 분석해주세요.',
      color: 'primary',
    },
    {
      id: 'find-hidden',
      icon: <Eye className="w-6 h-6" />,
      title: '놓친 재료 찾기',
      description: '작은 재료나 뒤에 있는 재료도 꼼꼼히 찾습니다',
      prompt: '작은 재료, 뒤에 가려진 재료, 용기 안에 있는 재료까지 모두 찾아주세요. 놓친 재료가 없도록 꼼꼼하게 분석해주세요.',
      color: 'green',
    },
    {
      id: 'reanalyze',
      icon: <RefreshCw className="w-6 h-6" />,
      title: '다시 분석',
      description: '같은 조건으로 다시 분석합니다',
      prompt: null, // 원본 프롬프트 사용
      color: 'blue',
    },
    {
      id: 'custom',
      icon: <Edit3 className="w-6 h-6" />,
      title: '커스텀 요청',
      description: '원하는 분석 방식을 직접 입력합니다',
      prompt: 'custom', // 사용자 입력
      color: 'purple',
    },
  ];

  const handleConfirm = () => {
    const option = options.find((opt) => opt.id === selectedOption);
    if (!option) return;

    let prompt = option.prompt;
    if (option.id === 'custom') {
      prompt = customPrompt.trim();
      if (!prompt) return;
    }

    onReanalyze(prompt);
    onClose();
  };

  const getColorClasses = (color, isSelected) => {
    const colors = {
      primary: isSelected
        ? 'border-primary-500 bg-primary-50'
        : 'border-gray-200 hover:border-primary-300',
      green: isSelected
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 hover:border-green-300',
      blue: isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-blue-300',
      purple: isSelected
        ? 'border-purple-500 bg-purple-50'
        : 'border-gray-200 hover:border-purple-300',
    };
    return colors[color] || colors.primary;
  };

  const getIconColor = (color) => {
    const colors = {
      primary: 'text-primary-500',
      green: 'text-green-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
    };
    return colors[color] || colors.primary;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reanalysis-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 id="reanalysis-modal-title" className="text-xl font-bold text-gray-900">
            이미지 다시 분석하기
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="모달 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            분석 방식을 선택하면 업로드한 이미지를 다시 분석합니다.
          </p>

          <div className="space-y-4">
            {options.map((option) => (
              <div key={option.id}>
                <button
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full text-left border-2 rounded-xl p-4 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${getColorClasses(
                    option.color,
                    selectedOption === option.id
                  )}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${getIconColor(option.color)}`}>{option.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </button>

                {/* 커스텀 프롬프트 입력 */}
                {option.id === 'custom' && selectedOption === 'custom' && (
                  <div className="mt-3 pl-14">
                    <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 mb-2">
                      분석 요청 사항을 입력하세요
                    </label>
                    <textarea
                      id="custom-prompt"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="예: 냉동실에 있는 재료만 찾아주세요"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              !selectedOption ||
              (selectedOption === 'custom' && !customPrompt.trim())
            }
            className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed"
          >
            다시 분석하기
          </button>
        </div>
      </div>
    </div>
  );
}
