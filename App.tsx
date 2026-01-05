import React, { useState, useEffect } from 'react';
import { 
  Pet, UserState, PetStage, QuestionType, Question 
} from './types';
import { 
  INITIAL_PET_STATE, INITIAL_USER_STATE, PET_CONFIG, REWARDS 
} from './constants';
import { generateQuizQuestions, testApiConnection } from './services/geminiService';
import { PetDisplay } from './components/PetDisplay';
import { QuizArea } from './components/QuizArea';
import { Shop } from './components/Shop';

function App() {
  // --- State ---
  const [pet, setPet] = useState<Pet>(INITIAL_PET_STATE);
  const [user, setUser] = useState<UserState>(INITIAL_USER_STATE);
  
  // Initialize API Key from localStorage only (safest for static deployment)
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [view, setView] = useState<'HOME' | 'QUIZ_SELECT' | 'QUIZ' | 'SHOP'>('HOME');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [apiCheckStatus, setApiCheckStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');

  // --- Effects ---
  useEffect(() => {
    // Save API key to local storage whenever it changes (if it's not empty)
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }, [apiKey]);

  // --- Actions ---

  const handleStartQuiz = async (type: QuestionType) => {
    if (!apiKey) {
      alert("請先設定 API Key 才能開始練習喔！");
      setShowKeyInput(true);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const questions = await generateQuizQuestions(apiKey, type, 3); // Generate 3 questions per session
      setActiveQuestions(questions);
      setView('QUIZ');
    } catch (e) {
      setErrorMsg("題目生成失敗，請檢查 API Key 是否正確。");
      console.error(e);
      setApiCheckStatus('fail');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    // Reward Logic
    const foodEarned = score; // 1 correct = 1 food
    const pointsEarned = score; // 1 correct = 1 Star

    setUser(prev => ({
      ...prev,
      food: prev.food + foodEarned,
      points: prev.points + pointsEarned
    }));

    // Show completion alert (can be a modal in future)
    alert(`測驗完成！\n答對 ${score}/${total} 題\n獲得 🍖 ${foodEarned} 份飼料\n獲得 ⭐ ${pointsEarned} 顆星星`);
    setView('HOME');
  };

  const handleFeedPet = () => {
    if (user.food <= 0) return;
    if (pet.stage === PetStage.GRADUATE) return;

    const expGain = 10;
    let newExp = pet.exp + expGain;
    // Fix: Explicitly type newStage as PetStage so it can accept GRADUATE later
    let newStage: PetStage = pet.stage; 
    let newMaxExp = pet.maxExp;

    const currentConfig = PET_CONFIG[pet.stage];

    // Check Level Up
    if (newExp >= pet.maxExp) {
      if (currentConfig.nextStage !== pet.stage) {
        newStage = currentConfig.nextStage;
        newExp = 0; // Reset exp for next stage
        newMaxExp = PET_CONFIG[newStage].maxExp;
        alert(`恭喜！${pet.name} 進化成 ${PET_CONFIG[newStage].label} 了！🎉`);
      }
    }

    setPet(prev => ({
      ...prev,
      exp: newExp,
      stage: newStage,
      maxExp: newMaxExp
    }));

    setUser(prev => ({
      ...prev,
      food: prev.food - 1
    }));
  };

  const handlePurchase = (item: any) => {
    if (user.points < item.cost) return;

    setUser(prev => {
      let newInventory = [...prev.inventory];
      newInventory.push(item.id);

      return {
        ...prev,
        points: prev.points - item.cost,
        inventory: newInventory
      };
    });
    alert(`成功兌換：${item.name}！`);
  };
  
  const handleCheckApi = async () => {
    if (!apiKey) {
      alert("請輸入 API Key");
      setShowKeyInput(true);
      return;
    }
    setApiCheckStatus('checking');
    const result = await testApiConnection(apiKey);
    setApiCheckStatus(result ? 'ok' : 'fail');
  };

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      <div className="w-full flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-2 rounded-lg">
            <span className="text-2xl">🍖</span>
            <span className="font-bold text-orange-800 ml-2">{user.food}</span>
          </div>
          <div className="bg-indigo-100 p-2 rounded-lg">
            <span className="text-2xl">⭐</span>
            <span className="font-bold text-indigo-800 ml-2">{user.points}</span>
          </div>
        </div>
        <button 
          onClick={() => setView('SHOP')}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition shadow-purple-200 shadow-md font-bold"
        >
          🎁 兌換獎品
        </button>
      </div>

      <PetDisplay 
        pet={pet} 
        feedPet={handleFeedPet} 
        canFeed={user.food > 0} 
      />

      <button
        onClick={() => setView('QUIZ_SELECT')}
        className="w-full max-w-sm py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold rounded-2xl shadow-lg shadow-blue-200 transform transition hover:-translate-y-1 active:translate-y-0"
      >
        📝 開始練習賺飼料
      </button>

      {/* Inventory Preview */}
      <div className="w-full max-w-md">
        <h3 className="text-gray-500 text-sm font-bold mb-2 ml-1">我的獎勵券</h3>
        <div className="flex gap-2 flex-wrap">
          {user.inventory.length === 0 && <span className="text-gray-400 text-xs">暫無獎勵，快去商店看看！</span>}
          {user.inventory.map((id, index) => {
             const item = REWARDS.find(r => r.id === id);
             return item ? (
               <span key={`${id}-${index}`} className="text-2xl" title={item.name}>{item.icon}</span>
             ) : null;
          })}
        </div>
      </div>
    </div>
  );

  const renderQuizSelect = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => setView('HOME')} className="p-2 hover:bg-gray-200 rounded-full mr-4">
          ⬅️
        </button>
        <h2 className="text-2xl font-bold text-gray-800">選擇練習項目</h2>
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center">
            <div className="animate-spin text-4xl mb-2">🔄</div>
            <p className="font-bold text-gray-600">AI 老師正在出題中...</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(QuestionType).map((type) => (
          <button
            key={type}
            onClick={() => handleStartQuiz(type)}
            className="p-6 bg-white rounded-xl shadow-md border-2 border-transparent hover:border-blue-400 hover:shadow-lg transition text-left group"
          >
            <div className="text-xl font-bold text-gray-800 group-hover:text-blue-600 mb-2">
              {type}
            </div>
            <p className="text-gray-500 text-sm">
              針對 {type} 進行強化練習，答對可獲得獎勵。
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sky-50 p-4 md:p-8 font-sans relative">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center relative">
          <div className="text-center w-full">
            <h1 className="text-3xl md:text-4xl font-black text-blue-600 tracking-tight">
              樂學寵物島 🏝️
            </h1>
            <p className="text-blue-400 font-medium">每天練習一點點，寵物長大變神獸</p>
          </div>
          <button 
            onClick={() => setShowKeyInput(true)} 
            className="absolute right-0 top-0 p-2 text-gray-400 hover:text-blue-500 transition"
            title="設定 API Key"
          >
            ⚙️ 設定
          </button>
        </header>

        <main>
          {view === 'HOME' && renderHome()}
          {view === 'QUIZ_SELECT' && renderQuizSelect()}
          {view === 'QUIZ' && (
            <QuizArea 
              apiKey={apiKey}
              questions={activeQuestions} 
              onComplete={handleQuizComplete}
              onCancel={() => setView('HOME')}
            />
          )}
          {view === 'SHOP' && (
            <Shop 
              userPoints={user.points} 
              userInventory={user.inventory} 
              onPurchase={handlePurchase} 
              onClose={() => setView('HOME')} 
            />
          )}
        </main>

        <footer className="mt-12 py-6 border-t border-sky-100 flex flex-col items-center justify-center gap-3">
            <button 
              onClick={handleCheckApi}
              disabled={apiCheckStatus === 'checking'}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                apiCheckStatus === 'ok' ? 'bg-green-100 text-green-700' :
                apiCheckStatus === 'fail' ? 'bg-red-100 text-red-700' :
                'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {apiCheckStatus === 'checking' ? (
                <>
                  <span className="animate-spin">🔄</span> 連線測試中...
                </>
              ) : apiCheckStatus === 'ok' ? (
                <>
                  <span>✅</span> API 連線正常
                </>
              ) : apiCheckStatus === 'fail' ? (
                <>
                  <span>❌</span> API 連線失敗 (點擊重試)
                </>
              ) : (
                <>
                  <span>📡</span> 測試 API 連線
                </>
              )}
            </button>
            <div className="text-sky-300 text-xs">
              Powered by Google Gemini
            </div>
        </footer>

        {/* API Key Modal */}
        {(showKeyInput || !apiKey) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-800">設定 API Key</h3>
                <p className="text-gray-500 text-sm mb-4">
                  為了讓 AI 老師出題，請輸入您的 Google Gemini API Key。<br/>
                  <span className="text-xs text-gray-400">您的 Key 只會儲存在您的瀏覽器中。</span>
                </p>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="請貼上 API Key (例: AIza...)"
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                />
                <div className="flex justify-end gap-2">
                  {apiKey && (
                    <button 
                      onClick={() => setShowKeyInput(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                    >
                      儲存並關閉
                    </button>
                  )}
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg text-sm flex items-center"
                  >
                    取得 Key ↗
                  </a>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
