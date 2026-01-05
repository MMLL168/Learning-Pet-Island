import React from 'react';
import { Pet, PetStage } from '../types';
import { PET_CONFIG } from '../constants';

interface PetDisplayProps {
  pet: Pet;
  feedPet: () => void;
  canFeed: boolean;
}

export const PetDisplay: React.FC<PetDisplayProps> = ({ pet, feedPet, canFeed }) => {
  const config = PET_CONFIG[pet.stage];
  const progressPercent = Math.min(100, (pet.exp / pet.maxExp) * 100);

  return (
    <div className="bg-slate-800 rounded-3xl shadow-xl p-6 flex flex-col items-center justify-center relative border-4 border-slate-700 max-w-sm w-full mx-auto">
      {/* Pet Avatar */}
      <div className="text-9xl mb-4 pet-bounce cursor-pointer select-none transition-transform active:scale-90 drop-shadow-2xl" onClick={canFeed ? feedPet : undefined}>
        {config.emoji}
      </div>

      {/* Info */}
      <h2 className="text-2xl font-bold text-slate-100 mb-1">{pet.name}</h2>
      <span className="text-sm font-medium text-orange-300 bg-orange-900/30 px-3 py-1 rounded-full mb-4 border border-orange-900/50">
        {config.label}
      </span>

      {/* Stats Bars */}
      <div className="w-full space-y-3">
        {pet.stage !== PetStage.GRADUATE && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>成長值 (EXP)</span>
              <span>{pet.exp} / {pet.maxExp}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden border border-slate-600">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div>
           <p className="text-xs text-center text-slate-500 mt-2 min-h-[40px]">
             {config.description}
           </p>
        </div>
      </div>

      {/* Feed Action Overlay or Button */}
      {canFeed && (
        <button 
          onClick={feedPet}
          className="mt-6 w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2 border border-orange-400"
        >
          <span>🍖</span> 餵食 (消耗1飼料)
        </button>
      )}
      
      {!canFeed && pet.stage !== PetStage.GRADUATE && (
        <button 
          disabled
          className="mt-6 w-full py-3 bg-slate-700 text-slate-500 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-slate-600"
        >
          <span>🥣</span> 沒有飼料了
        </button>
      )}

      {pet.stage === PetStage.GRADUATE && (
        <div className="mt-6 p-3 bg-yellow-900/30 text-yellow-300 border border-yellow-700/50 rounded-lg text-center text-sm">
          恭喜畢業！你的寵物已經成為傳說。
        </div>
      )}
    </div>
  );
};
