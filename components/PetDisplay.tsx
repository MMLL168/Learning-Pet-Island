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
    <div className="relative w-full max-w-sm mx-auto my-6">
      {/* Background Glow/Platform */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-[2rem] shadow-2xl p-6 flex flex-col items-center justify-center relative border-4 border-slate-700 overflow-hidden">
        
        {/* Stage Label */}
        <div className="absolute top-4 right-4 text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
           LVL {Object.keys(PET_CONFIG).indexOf(pet.stage) + 1}
        </div>

        {/* Pet Avatar with Glow and Float */}
        <div 
            className={`text-[9rem] mb-6 relative z-10 cursor-pointer select-none transition-transform active:scale-95 pet-float ${canFeed ? 'hover:scale-110' : 'opacity-90'}`}
            onClick={canFeed ? feedPet : undefined}
            style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }}
        >
            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-75 -z-10 glow-effect"></div>
            {config.emoji}
        </div>

        {/* Name & Title */}
        <div className="text-center mb-6 relative z-10">
            <h2 className="text-3xl font-black text-white tracking-wide drop-shadow-md">{pet.name}</h2>
            <span className="inline-block mt-1 text-sm font-bold text-orange-200 bg-gradient-to-r from-orange-600 to-red-600 px-4 py-1 rounded-full shadow-lg border border-orange-400">
                {config.label}
            </span>
        </div>

        {/* Stats Bars - Game Style */}
        <div className="w-full space-y-4 relative z-10 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
            {pet.stage !== PetStage.GRADUATE ? (
            <div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                <span>Experience</span>
                <span className="text-white">{pet.exp} <span className="text-slate-500">/</span> {pet.maxExp}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-6 p-1 border border-slate-600 shadow-inner relative overflow-hidden">
                   {/* Striped Background for empty part */}
                   <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)'}}></div>
                   
                   <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.6)] relative"
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 0%, transparent 100%)'}}></div>
                    </div>
                </div>
                <p className="text-xs text-center text-slate-400 mt-3 font-medium">
                {config.description}
                </p>
            </div>
            ) : (
                <div className="text-center text-yellow-300 font-bold py-2">
                    🏆 傳說達成！
                </div>
            )}
        </div>

        {/* Action Button */}
        {canFeed && (
            <button 
            onClick={feedPet}
            className="btn-game mt-6 w-full py-4 bg-gradient-to-b from-orange-500 to-orange-600 text-white font-black text-xl rounded-2xl shadow-lg border-orange-800 flex items-center justify-center gap-2 hover:from-orange-400 hover:to-orange-500 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span>🍖</span> 餵食 <span className="text-sm font-normal opacity-80">( -1 )</span>
            </button>
        )}
        
        {!canFeed && pet.stage !== PetStage.GRADUATE && (
            <button 
            disabled
            className="mt-6 w-full py-4 bg-slate-700 text-slate-500 font-bold rounded-2xl border-2 border-slate-600 flex items-center justify-center gap-2 cursor-not-allowed"
            >
            <span>🥣</span> 肚子餓了...去答題吧！
            </button>
        )}
      </div>
    </div>
  );
};
