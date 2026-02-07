import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { analyzeImage } from '../services/api';

export default function ImageUpload({ onAnalysisComplete }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setError(null);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // API 호출
    setLoading(true);
    try {
      const result = await analyzeImage(file);
      onAnalysisComplete(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || '이미지 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setPreview(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          <label
            htmlFor="file-upload"
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-200
              ${dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-primary-300 bg-primary-50/30 hover:border-primary-500'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                {!loading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      resetUpload();
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    다른 이미지 선택
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-16 h-16 mx-auto text-primary-500" />
                <div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    냉장고 사진 업로드
                  </p>
                  <p className="text-sm text-gray-500">
                    클릭하거나 드래그 앤 드롭으로 이미지를 업로드하세요
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG 파일 (최대 10MB)
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                <p className="text-primary-600 font-medium">
                  AI가 재료를 분석하고 있습니다...
                </p>
              </div>
            )}
          </label>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
