import React from 'react';
import { REWARDS } from '../constants';

interface ShopProps {
  userPoints: number;
  userInventory: string[];
  onPurchase: (item: typeof REWARDS[0]) => void;
  onClose: () => void;
}

export const Shop: React.FC<ShopProps> = ({ userPoints, userInventory, onPurchase, onClose }) => {
  return (
    <div className="bg-slate-800/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-5xl mx-auto overflow-hidden flex flex-col h-[85vh] border border-slate-700 relative">
      
      {/* Header */}
      <div className="bg-slate-900 p-6 flex justify-between items-center text-white border-b border-slate-800 shadow-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="bg-slate-800 p-2 rounded-xl hover:bg-slate-700 transition">⬅️</button>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                獎勵兌換中心
            </h2>
          </div>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-2xl border border-yellow-500/30 flex items-center gap-2">
            <span className="text-sm text-slate-400">持有星星</span>
            <span className="text-2xl font-black text-yellow-400">⭐ {userPoints}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900/50 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REWARDS.map((item) => {
            const ownedCount = userInventory.filter(id => id === item.id).length;
            const canAfford = userPoints >= item.cost;

            return (
              <div 
                key={item.id} 
                className="bg-slate-800 rounded-3xl p-1 flex flex-col shadow-xl group hover:transform hover:-translate-y-2 transition-all duration-300 h-full border border-slate-700 hover:border-slate-500 hover:shadow-2xl"
              >
                {/* Card Inner */}
                <div className="bg-slate-800 rounded-[1.3rem] p-5 flex flex-col h-full relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${item.color.replace('bg-', 'bg-')}/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}></div>

                    {/* Icon */}
                    <div className={`w-20 h-20 ${item.color} rounded-2xl flex items-center justify-center text-4xl shadow-lg mb-4 self-center group-hover:scale-110 transition-transform duration-500`}>
                        {item.icon}
                    </div>

                    {/* Info */}
                    <div className="text-center mb-4 flex-1">
                        <h3 className="text-white font-black text-xl mb-1">{item.name}</h3>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex justify-between items-end bg-slate-900/50 p-3 rounded-xl mb-4 border border-slate-700/50">
                        <div className="text-xs text-slate-500 font-bold uppercase">Price</div>
                        <div className="text-yellow-400 font-black text-lg">⭐ {item.cost}</div>
                    </div>

                    {/* Owned Badge */}
                    {ownedCount > 0 && (
                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg border border-slate-600 z-10">
                            x{ownedCount}
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={() => onPurchase(item)}
                        disabled={!canAfford}
                        className={`btn-game w-full py-3 rounded-xl font-bold text-sm transition-all border-b-4 flex items-center justify-center gap-2
                        ${canAfford
                            ? 'bg-white text-slate-900 border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                            : 'bg-slate-700 text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
                        }
                        `}
                    >
                        {canAfford ? '🛒 兌換' : '🔒 星星不足'}
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
