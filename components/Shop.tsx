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
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-auto overflow-hidden flex flex-col h-[80vh]">
      <div className="bg-purple-600 p-6 flex justify-between items-center text-white">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🎁 獎勵兌換中心
          </h2>
          <p className="text-purple-200 text-sm mt-1">累積點數，兌換酷炫獎品！</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-80">你的點數</div>
          <div className="text-3xl font-bold text-yellow-300">{userPoints} P</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REWARDS.map((item) => {
            const isOwned = userInventory.includes(item.id) && !item.effect; // Consumables are never "owned" permanently in this simplified logic
            const canAfford = userPoints >= item.cost;

            return (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition hover:shadow-md">
                <div className="text-6xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <div className="mt-auto pt-4 w-full">
                  <button
                    onClick={() => onPurchase(item)}
                    disabled={!canAfford || isOwned}
                    className={`w-full py-2 rounded-lg font-bold text-sm transition-colors
                      ${isOwned 
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : canAfford
                          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200 shadow-lg'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {isOwned ? '已擁有' : `${item.cost} P 兌換`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-white border-t text-center">
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 font-medium"
        >
          返回主畫面
        </button>
      </div>
    </div>
  );
};
