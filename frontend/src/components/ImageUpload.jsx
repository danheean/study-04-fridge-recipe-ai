import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Upload, Loader2, CheckCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { processAndAnalyzeImage } from '../utils/imageAnalysis';

const ImageUpload = forwardRef(({ onAnalysisComplete }, ref) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setError(null);
    setLoading(true);

    try {
      // 공통 유틸리티 함수 사용
      const result = await processAndAnalyzeImage(file);

      // 프리뷰 설정
      setPreview(result.imagePreview);

      // 분석 완료 콜백 호출 (파일 객체도 함께 전달)
      onAnalysisComplete(result, file);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.userMessage || err.message || '이미지 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setPreview(null);
    setError(null);
    setLoading(false);
    // 파일 input 초기화 (같은 파일 재선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 부모 컴포넌트에서 reset 함수 호출 가능하도록 노출
  useImperativeHandle(ref, () => ({
    reset: resetUpload
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          aria-label="냉장고 이미지 파일 선택"
        />

        <label
          htmlFor="file-upload"
          className={`
            block bg-white border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-200 shadow-lg
            ${dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-primary-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          aria-busy={loading}
        >
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="업로드된 냉장고 사진 미리보기"
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
              {!loading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    resetUpload();
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg px-4 py-2 min-h-[44px] active:scale-95 transition-transform"
                >
                  다른 이미지 선택
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all ${
                  dragActive ? 'bg-primary-500 scale-110' : 'bg-primary-100'
                }`}>
                  <Upload className={`w-10 h-10 transition-colors ${
                    dragActive ? 'text-white' : 'text-primary-500'
                  }`} aria-hidden="true" />
                </div>
                {dragActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 border-4 border-primary-500 border-dashed rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 mb-2">
                  {dragActive ? '여기에 놓으세요!' : '냉장고 사진을 업로드하세요'}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  클릭하거나 드래그 앤 드롭으로 이미지를 업로드하세요
                </p>
                <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
                    <span>JPG, PNG 지원</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
                    <span>최대 20MB</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 flex items-start gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-gray-700">촬영 팁:</strong> 냉장고 문을 완전히 열고,
                    조명이 밝은 곳에서 촬영하면 AI가 재료를 더 정확하게 인식합니다.
                  </span>
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-6 flex items-center justify-center gap-3" role="status" aria-live="polite">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" aria-hidden="true" />
              <p className="text-primary-600 font-medium">
                AI가 재료를 분석하고 있습니다...
              </p>
            </div>
          )}
        </label>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg" role="alert" aria-live="assertive">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-red-900 font-semibold text-sm mb-1">이미지 분석 실패</p>
              <p className="text-red-700 text-sm">{error}</p>
              <p className="text-red-600 text-xs mt-2">
                다른 이미지를 시도하거나, 이미지 크기가 20MB를 초과하는지 확인해주세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;
