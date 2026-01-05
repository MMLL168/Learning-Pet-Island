import React, { useState } from 'react';
import { Question, QuestionType } from '../types';
import { evaluateSentence } from '../services/geminiService';

interface QuizAreaProps {
  apiKey: string;
  questions: Question[];
  onComplete: (score: number, totalQuestions: number) => void;
  onCancel: () => void;
}

export const QuizArea: React.FC<QuizAreaProps> = ({ apiKey, questions, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sentenceInput, setSentenceInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleChoiceSubmit = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    const isCorrect = option === currentQ.correctAnswer;
    
    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback("答對了！太棒了！ 🎉");
    } else {
      setFeedback(`答錯了。正確答案是：${currentQ.correctAnswer}。 ${currentQ.explanation || ''}`);
    }
    setShowResult(true);
  };

  const handleSentenceSubmit = async () => {
    if (!sentenceInput.trim()) return;
    setIsEvaluating(true);
    const result = await evaluateSentence(apiKey, currentQ.keyword || currentQ.prompt, sentenceInput);
    setIsEvaluating(false);
    
    // Simple logic: score > 60 counts as "Pass"
    if (result.score >= 60) {
      setScore(s => s + 1);
      setFeedback(`評分：${result.score}分。 ${result.feedback}`);
    } else {
      setFeedback(`評分：${result.score}分。 ${result.feedback} 加油，再試一次！`);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(score, questions.length);
    } else {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setSentenceInput("");
      setShowResult(false);
      setFeedback("");
    }
  };

  if (!currentQ) return <div className="p-8 text-center">載入錯誤...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-2xl mx-auto border-t-8 border-blue-400">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-bold text-gray-400">
          題目 {currentIndex + 1} / {questions.length}
        </span>
        <button onClick={onCancel} className="text-gray-400 hover:text-red-500">
          退出
        </button>
      </div>

      {/* Question */}
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold mb-2">
          {currentQ.type}
        </span>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
          {currentQ.prompt}
        </h3>
      </div>

      {/* Interaction Area */}
      <div className="space-y-4">
        {currentQ.type === QuestionType.SENTENCE ? (
          <div className="space-y-4">
            <textarea
              value={sentenceInput}
              onChange={(e) => setSentenceInput(e.target.value)}
              placeholder="請在這裡輸入你的造句..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none min-h-[120px] text-gray-800"
              disabled={showResult}
            />
            {!showResult && (
              <button
                onClick={handleSentenceSubmit}
                disabled={isEvaluating || !sentenceInput.trim()}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isEvaluating ? "AI 老師批改中..." : "送出答案"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {currentQ.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleChoiceSubmit(opt)}
                disabled={showResult}
                className={`p-4 rounded-xl border-2 text-left font-medium transition-all
                  ${showResult 
                    ? opt === currentQ.correctAnswer 
                      ? 'bg-green-100 border-green-500 text-green-800' 
                      : opt === selectedOption 
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800'
                  }
                `}
              >
                <span className="mr-2 opacity-50">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feedback & Next */}
      {showResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
          <p className="text-gray-800 font-medium mb-4">{feedback}</p>
          <button
            onClick={handleNext}
            className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-md"
          >
            {isLast ? "完成測驗，領取獎勵！" : "下一題"}
          </button>
        </div>
      )}
    </div>
  );
};