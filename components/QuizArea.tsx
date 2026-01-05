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
      setFeedback("🎉 太棒了！答對了！");
    } else {
      setFeedback(`😅 哎呀！正確答案是：${currentQ.correctAnswer}。\n${currentQ.explanation || ''}`);
    }
    setShowResult(true);
  };

  const handleSentenceSubmit = async () => {
    if (!sentenceInput.trim()) return;
    setIsEvaluating(true);
    const result = await evaluateSentence(apiKey, currentQ.keyword || currentQ.prompt, sentenceInput);
    setIsEvaluating(false);
    
    if (result.score >= 60) {
      setScore(s => s + 1);
      setFeedback(`👍 評分：${result.score}分。\n${result.feedback}`);
    } else {
      setFeedback(`💪 評分：${result.score}分。\n${result.feedback} 加油！`);
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

  if (!currentQ) return <div className="p-8 text-center text-slate-300 animate-pulse">題目載入中...</div>;

  return (
    <div className="bg-slate-800/90 backdrop-blur rounded-3xl shadow-2xl p-6 md:p-10 w-full max-w-3xl mx-auto border border-slate-600 relative overflow-hidden">
      {/* Top Decoration */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
            <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-sm font-bold border border-slate-600">
                Q.{currentIndex + 1}
            </span>
            <span className="text-slate-400 text-sm">/ {questions.length}</span>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition font-medium px-3 py-1 hover:bg-red-500/20 rounded-lg">
          ❌ 放棄
        </button>
      </div>

      {/* Question Card */}
      <div className="mb-10 text-center">
        <span className="inline-block px-4 py-1 bg-blue-600 text-white rounded-full text-sm font-bold mb-4 shadow-lg shadow-blue-900/50">
          {currentQ.type}
        </span>
        <h3 className="text-2xl md:text-3xl font-black text-white leading-relaxed tracking-wide drop-shadow-md">
          {currentQ.prompt}
        </h3>
      </div>

      {/* Interaction Area */}
      <div className="space-y-6">
        {currentQ.type === QuestionType.SENTENCE ? (
          <div className="space-y-6">
            <textarea
              value={sentenceInput}
              onChange={(e) => setSentenceInput(e.target.value)}
              placeholder="請在這裡輸入你的造句..."
              className="w-full p-6 bg-slate-900/80 border-2 border-slate-600 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none min-h-[150px] text-xl text-white placeholder-slate-500 shadow-inner"
              disabled={showResult}
            />
            {!showResult && (
              <button
                onClick={handleSentenceSubmit}
                disabled={isEvaluating || !sentenceInput.trim()}
                className="btn-game w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-black text-xl hover:from-blue-500 hover:to-blue-400 border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              >
                {isEvaluating ? "🤖 AI 老師批改中..." : "🚀 送出答案"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {currentQ.options?.map((opt, idx) => {
              // Determine style based on state
              let btnClass = "bg-slate-700 border-slate-900 text-slate-200 hover:bg-slate-600 hover:border-blue-500"; // default
              
              if (showResult) {
                if (opt === currentQ.correctAnswer) {
                  btnClass = "bg-green-600 border-green-800 text-white ring-4 ring-green-500/30"; // Correct
                } else if (opt === selectedOption) {
                  btnClass = "bg-red-500 border-red-800 text-white opacity-60"; // Wrong selected
                } else {
                  btnClass = "bg-slate-800 border-slate-900 text-slate-500 opacity-50"; // Others
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleChoiceSubmit(opt)}
                  disabled={showResult}
                  className={`btn-game w-full p-5 rounded-2xl border-b-4 text-left font-bold text-lg transition-all flex items-center group ${btnClass}`}
                >
                  <span className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 text-lg font-black shrink-0 ${showResult && opt === currentQ.correctAnswer ? 'bg-white text-green-600' : 'bg-black/20 text-white/70'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback Overlay */}
      {showResult && (
        <div className="mt-8 animate-fade-in bg-slate-900/50 p-6 rounded-3xl border border-slate-600/50">
            <div className={`text-lg font-bold mb-6 whitespace-pre-wrap leading-relaxed ${feedback.includes('答對') || feedback.includes('👍') ? 'text-green-400' : 'text-orange-400'}`}>
                {feedback}
            </div>
          <button
            onClick={handleNext}
            className="btn-game w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-black text-xl hover:brightness-110 shadow-lg border-green-700 flex items-center justify-center gap-2"
          >
            {isLast ? "🎉 領取獎勵" : "下一題 ➡️"}
          </button>
        </div>
      )}
    </div>
  );
};
