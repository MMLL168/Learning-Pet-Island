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
  
  // Initialize API Key from localStorage only
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
      const questions = await generateQuizQuestions(apiKey, type, 3);
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
    const foodEarned = score;
    const pointsEarned = score;

    setUser(prev => ({
      ...prev,
      food: prev.food + foodEarned,
      points: prev.points + pointsEarned
    }));

    // Simple custom alert for now
    alert(`🎉 測驗完成！\n\n獲得 🍖 ${foodEarned} 份飼料\n獲得 ⭐ ${pointsEarned} 顆星星`);
    setView('HOME');
  };

  const handleFeedPet = () => {
    if (user.food <= 0) return;
    if (pet.stage === PetStage.GRADUATE) return;

    const expGain = 10;
    let newExp = pet.exp + expGain;
    let newStage: PetStage = pet.stage; 
    let newMaxExp = pet.maxExp;

    const currentConfig = PET_CONFIG[pet.stage];

    // Check Level Up
    if (newExp >= pet.maxExp) {
      if (currentConfig.nextStage !== pet.stage) {
        newStage = currentConfig.nextStage;
        newExp = 0; 
        newMaxExp = PET_CONFIG[newStage].maxExp;
        alert(`✨ 奇蹟發生了！\n\n${pet.name} 進化成 ${PET_CONFIG[newStage].label} 了！🎉`);
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
    alert(`🎁 成功兌換：${item.name}！`);
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
    <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-md mx-auto">
      {/* HUD - Heads Up Display */}
      <div className="w-full flex justify-between items-center bg-slate-800/80 backdrop-blur-md p-3 rounded-3xl shadow-lg border-2 border-slate-600">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 px-3 py-1 rounded-full border border-orange-500/50 flex items-center shadow-inner">
            <span className="text-xl mr-2">🍖</span>
            <span className="font-black text-orange-400 text-lg">{user.food}</span>
          </div>
          <div className="bg-slate-900 px-3 py-1 rounded-full border border-yellow-500/50 flex items-center shadow-inner">
            <span className="text-xl mr-2">⭐</span>
            <span className="font-black text-yellow-400 text-lg">{user.points}</span>
          </div>
        </div>
        <button 
          onClick={() => setView('SHOP')}
          className="btn-game px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-2xl border-purple-700 shadow-lg font-bold flex items-center gap-2 text-sm"
        >
          🎁 商店
        </button>
      </div>

      <PetDisplay 
        pet={pet} 
        feedPet={handleFeedPet} 
        canFeed={user.food > 0} 
      />

      <button
        onClick={() => setView('QUIZ_SELECT')}
        className="btn-game w-full py-5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 border-blue-700 text-white text-2xl font-black rounded-3xl shadow-xl transform transition flex items-center justify-center gap-3"
      >
        <span>🚀</span> 開始練習
      </button>

      {/* Inventory Preview - simplified */}
      <div className="w-full bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
        <h3 className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Inventory</h3>
        <div className="flex gap-3 flex-wrap min-h-[40px] items-center">
          {user.inventory.length === 0 && <span className="text-slate-600 text-sm italic">背包空空的...</span>}
          {user.inventory.map((id, index) => {
             const item = REWARDS.find(r => r.id === id);
             return item ? (
               <div key={`${id}-${index}`} className="bg-slate-700 p-2 rounded-xl border border-slate-600 shadow-sm" title={item.name}>
                 <span className="text-2xl">{item.icon}</span>
               </div>
             ) : null;
          })}
        </div>
      </div>
    </div>
  );

  const renderQuizSelect = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center mb-8">
        <button onClick={() => setView('HOME')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl mr-4 transition shadow-md border border-slate-600">
          ⬅️ 返回
        </button>
        <h2 className="text-3xl font-black text-white drop-shadow-md">選擇任務</h2>
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-3xl flex flex-col items-center border-4 border-blue-500/50 shadow-2xl">
            <div className="animate-spin text-6xl mb-4">🔮</div>
            <p className="font-bold text-xl text-blue-200">AI 老師正在準備題目...</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-900/80 text-red-100 border-2 border-red-500 rounded-2xl text-center font-bold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(QuestionType).map((type, idx) => {
          // Assign random-ish colors based on index for variety
          const colors = [
            'from-pink-500 to-rose-500 border-rose-700',
            'from-orange-500 to-amber-500 border-amber-700',
            'from-green-500 to-emerald-500 border-emerald-700',
            'from-cyan-500 to-blue-500 border-blue-700',
            'from-purple-500 to-violet-500 border-violet-700'
          ];
          const colorClass = colors[idx % colors.length];

          return (
            <button
              key={type}
              onClick={() => handleStartQuiz(type)}
              className={`btn-game p-6 bg-gradient-to-br ${colorClass} rounded-3xl shadow-lg hover:brightness-110 text-left group relative overflow-hidden`}
            >
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4 text-8xl rotate-12">
                📝
              </div>
              <div className="relative z-10">
                <div className="text-2xl font-black text-white mb-2 shadow-sm">
                  {type}
                </div>
                <p className="text-white/90 text-sm font-medium">
                  挑戰 {type}，賺取飼料與星星！
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans relative text-slate-100 overflow-x-hidden selection:bg-pink-500 selection:text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header Logo */}
        <header className="mb-10 flex justify-center items-center relative py-4">
          <div className="text-center transform transition hover:scale-105 cursor-default">
            <h1 className="text-4xl md:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '1px #1e40af' }}>
              樂學寵物島
            </h1>
            <div className="text-sm md:text-base font-bold text-blue-300 bg-blue-900/30 px-4 py-1 rounded-full inline-block mt-2 border border-blue-800/50">
               快樂學習．培育神獸 🏝️
            </div>
          </div>
          
          <button 
            onClick={() => setShowKeyInput(true)} 
            className="absolute right-0 top-0 p-3 text-slate-500 hover:text-white transition hover:rotate-90"
            title="設定"
          >
            ⚙️
          </button>
        </header>

        <main className="mb-20">
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

        <footer className="fixed bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur border-t border-slate-800 py-2 flex justify-center items-center gap-4 text-xs z-40">
            <button 
              onClick={handleCheckApi}
              disabled={apiCheckStatus === 'checking'}
              className="flex items-center gap-1 opacity-60 hover:opacity-100 transition"
            >
              {apiCheckStatus === 'checking' ? '🔄 連線中...' : 
               apiCheckStatus === 'ok' ? '✅ 連線正常' : 
               apiCheckStatus === 'fail' ? '❌ 連線失敗' : '📡 API 狀態'}
            </button>
            <span className="text-slate-600">|</span>
            <div className="text-slate-500">
              Powered by Google Gemini
            </div>
        </footer>

        {/* API Key Modal */}
        {(showKeyInput || !apiKey) && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-slate-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg border-2 border-slate-700">
                <h3 className="text-2xl font-black mb-4 text-white">🔑 啟動學習引擎</h3>
                <p className="text-slate-300 text-base mb-6 leading-relaxed">
                  請輸入 Google Gemini API Key 來喚醒 AI 老師。<br/>
                  <span className="text-sm text-slate-500">金鑰僅會保存在您的電腦中，請安心使用。</span>
                </p>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="在此貼上 API Key..."
                  className="w-full p-4 bg-slate-950 border-2 border-slate-700 rounded-2xl mb-6 focus:border-blue-500 focus:outline-none text-white text-lg placeholder-slate-600 transition"
                />
                <div className="flex justify-end gap-3">
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-blue-400 hover:bg-slate-700 rounded-xl font-bold transition flex items-center"
                  >
                    取得 Key ↗
                  </a>
                  {apiKey && (
                    <button 
                      onClick={() => setShowKeyInput(false)}
                      className="btn-game px-8 py-3 bg-green-500 text-white rounded-xl border-green-700 font-bold hover:bg-green-400 shadow-lg"
                    >
                      確認啟動
                    </button>
                  )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
