import { memo } from 'react';
import { Clock, Cpu, FileText, HardDrive } from 'lucide-react';

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * AI 분석 메타데이터 표시 컴포넌트
 * React.memo 적용: props(metadata)가 변경되지 않으면 리렌더링 방지
 */
const AnalysisInfo = memo(function AnalysisInfo({ metadata }) {
  if (!metadata) return null;

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-md border border-blue-100" aria-labelledby="analysis-info-heading">
      <h3 id="analysis-info-heading" className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Cpu className="w-5 h-5 text-indigo-600" aria-hidden="true" />
        분석 정보
      </h3>

      <dl className="space-y-3">
        {/* AI 모델 */}
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <dt className="text-gray-500 text-xs">AI 모델</dt>
            <dd className="text-gray-900 font-medium">{metadata.model}</dd>
          </div>
        </div>

        {/* 분석 시간 */}
        {metadata.duration && (
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <dt className="text-gray-500 text-xs">분석 시간</dt>
              <dd className="text-gray-900 font-medium">{metadata.duration}초</dd>
            </div>
          </div>
        )}

        {/* 파일명 */}
        {metadata.fileName && (
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <dt className="text-gray-500 text-xs">파일명</dt>
              <dd className="text-gray-900 font-medium truncate" title={metadata.fileName}>
                {metadata.fileName}
              </dd>
            </div>
          </div>
        )}

        {/* 파일 크기 */}
        {metadata.fileSize && (
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <HardDrive className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <dt className="text-gray-500 text-xs">파일 크기</dt>
              <dd className="text-gray-900 font-medium">{formatFileSize(metadata.fileSize)}</dd>
            </div>
          </div>
        )}
      </dl>

      <footer className="mt-4 pt-4 border-t border-indigo-200">
        <p className="text-xs text-gray-600 leading-relaxed">
          AI가 이미지를 분석하여 냉장고 속 재료를 자동으로 인식했습니다.
          필요시 재료를 수정하거나 추가할 수 있습니다.
        </p>
      </footer>
    </section>
  );
});

export default AnalysisInfo;
