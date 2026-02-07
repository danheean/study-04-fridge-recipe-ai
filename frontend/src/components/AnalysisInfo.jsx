import { Clock, Cpu, FileText, HardDrive } from 'lucide-react';

/**
 * AI 분석 메타데이터 표시 컴포넌트
 */
export default function AnalysisInfo({ metadata }) {
  if (!metadata) return null;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-md border border-blue-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Cpu className="w-5 h-5 text-indigo-600" />
        분석 정보
      </h3>

      <div className="space-y-3">
        {/* AI 모델 */}
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-gray-500 text-xs">AI 모델</p>
            <p className="text-gray-900 font-medium">{metadata.model}</p>
          </div>
        </div>

        {/* 분석 시간 */}
        {metadata.duration && (
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">분석 시간</p>
              <p className="text-gray-900 font-medium">{metadata.duration}초</p>
            </div>
          </div>
        )}

        {/* 파일명 */}
        {metadata.fileName && (
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 text-xs">파일명</p>
              <p className="text-gray-900 font-medium truncate" title={metadata.fileName}>
                {metadata.fileName}
              </p>
            </div>
          </div>
        )}

        {/* 파일 크기 */}
        {metadata.fileSize && (
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">파일 크기</p>
              <p className="text-gray-900 font-medium">{formatFileSize(metadata.fileSize)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-indigo-200">
        <p className="text-xs text-gray-600 leading-relaxed">
          AI가 이미지를 분석하여 냉장고 속 재료를 자동으로 인식했습니다.
          필요시 재료를 수정하거나 추가할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
