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
    <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl mx-auto overflow-hidden flex flex-col h-[80vh] border border-slate-700">
      <div className="bg-slate-950 p-6 flex justify-between items-center text-white border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🎁 獎勵兌換中心
          </h2>
          <p className="text-slate-400 text-sm mt-1">累積星星，兌換超棒獎品！</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-80 text-slate-400">你的星星</div>
          <div className="text-3xl font-bold text-yellow-400">⭐ {userPoints}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
        <div className="space-y-4 max-w-3xl mx-auto">
          {REWARDS.map((item) => {
            const ownedCount = userInventory.filter(id => id === item.id).length;
            const canAfford = userPoints >= item.cost;

            return (
              <div 
                key={item.id} 
                className="bg-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-lg border border-slate-700 transition hover:border-slate-600"
              >
                {/* Icon Box */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 ${item.color} rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0`}>
                  {item.icon}
                </div>

                {/* Text Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-slate-100 font-bold text-lg leading-tight">{item.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                  {ownedCount > 0 && (
                    <span className="inline-block mt-2 bg-slate-950 text-slate-400 text-xs px-2 py-1 rounded-full border border-slate-700">
                      已持有: {ownedCount} 張
                    </span>
                  )}
                </div>

                {/* Cost & Button */}
                <div className="flex flex-col items-center sm:items-end gap-2 min-w-[120px]">
                  <div className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                    <span>⭐</span> Cost: {item.cost} Stars
                  </div>
                  <button
                    onClick={() => onPurchase(item)}
                    disabled={!canAfford}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-transform active:scale-95 w-full border
                      ${canAfford
                        ? 'bg-slate-100 text-slate-900 hover:bg-white shadow-md border-transparent'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed border-slate-600'
                      }
                    `}
                  >
                    兌換
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700 text-center">
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 font-medium transition"
        >
          返回主畫面
        </button>
      </div>
    </div>
  );
};
