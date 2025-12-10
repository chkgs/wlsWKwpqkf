import React, { useState, useCallback } from 'react';
import { getJobMarketPrediction } from './services/geminiService';
import { FileUploadIcon, PredictionIcon, LoadingSpinnerIcon, ErrorIcon, TrashIcon } from './components/icons';

// Helper function to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ data: base64Data, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });

// --- UI Components defined outside the main App component ---

interface InputPanelProps {
  files: File[];
  textInput: string;
  isLoading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileRemove: (index: number) => void;
  onSubmit: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ files, textInput, isLoading, onFileChange, onTextChange, onFileRemove, onSubmit }) => (
  <div className="bg-white/60 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-200 flex flex-col gap-6 h-full">
    <h2 className="text-2xl font-bold text-gray-900">1. 분석 데이터 입력</h2>
    
    <div>
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">파일 업로드 (필수)</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <FileUploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-500">
            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-purple-500">
              <span>파일 선택</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileChange} multiple />
            </label>
            <p className="pl-1">또는 파일들을 끌어다 놓으세요</p>
          </div>
          <p className="text-xs text-gray-500">전공, 학과, 기술 관련 데이터</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-700">업로드된 파일:</h3>
            <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {files.map((file, index) => (
                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate text-gray-800">{file.name}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <button onClick={() => onFileRemove(index)} className="font-medium text-red-600 hover:text-red-500" aria-label={`Remove ${file.name}`}>
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>

    <div>
      <label htmlFor="text-input" className="block text-sm font-medium text-gray-700">텍스트 입력 (선택 사항)</label>
      <textarea
        id="text-input"
        value={textInput}
        onChange={onTextChange}
        rows={6}
        className="mt-1 block w-full bg-gray-50/50 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 placeholder-gray-500"
        placeholder="분석하고 싶은 전공, 학과 또는 기술에 대해 구체적으로 설명해주세요..."
      />
    </div>

    <div className="mt-auto">
      <button
        onClick={onSubmit}
        disabled={isLoading || files.length === 0}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '분석 중...' : '예측 분석 시작'}
      </button>
    </div>
  </div>
);

interface OutputPanelProps {
  isLoading: boolean;
  error: string | null;
  prediction: string | null;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ isLoading, error, prediction }) => (
  <div className="bg-white/60 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-200 min-h-[400px] flex flex-col">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 10년 후 예측 결과</h2>
    <div className="flex-grow flex items-center justify-center text-center">
      {isLoading && (
        <div className="flex flex-col items-center gap-4 text-gray-600">
          <LoadingSpinnerIcon />
          <p>AI가 직업 시장의 미래를 분석하고 있습니다...</p>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center gap-4 text-red-600">
          <ErrorIcon />
          <p>오류가 발생했습니다:</p>
          <p className="text-sm bg-red-100 text-red-800 p-3 rounded-lg">{error}</p>
        </div>
      )}
      {!isLoading && !error && !prediction && (
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <PredictionIcon />
          <p>데이터를 입력하고 분석을 시작하면 예측 결과가 여기에 표시됩니다.</p>
        </div>
      )}
      {prediction && (
        <div className="text-left w-full h-full overflow-y-auto text-gray-800">
          <p className="whitespace-pre-wrap text-lg font-sans leading-relaxed">{prediction}</p>
        </div>
      )}
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  const handleSubmit = useCallback(async () => {
    if (files.length === 0) {
      setError('하나 이상의 파일을 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const fileDataPromises = files.map(file => fileToBase64(file));
      const fileDatas = await Promise.all(fileDataPromises);
      const result = await getJobMarketPrediction(textInput, fileDatas);
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [files, textInput]);

  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <main className="max-w-4xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">
            10년 후 전공 분야 직업 시장 예측
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            파일과 텍스트를 기반으로, 특정 전공 분야의 10년 후 취업률과 AI로 인한 직업 대체율을 예측합니다.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <InputPanel
            files={files}
            textInput={textInput}
            isLoading={isLoading}
            onFileChange={handleFileChange}
            onTextChange={handleTextChange}
            onFileRemove={handleRemoveFile}
            onSubmit={handleSubmit}
          />
          <OutputPanel
            isLoading={isLoading}
            error={error}
            prediction={prediction}
          />
        </div>
        
        <footer className="text-center text-gray-500 mt-12">
          <p>Powered by Google Gemini</p>
        </footer>
      </main>
    </div>
  );
};

export default App;