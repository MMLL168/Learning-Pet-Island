import { PetStage } from './types';

export const PET_CONFIG = {
  [PetStage.EGG]: {
    emoji: '🥚',
    label: '神秘蛋',
    nextStage: PetStage.BABY,
    maxExp: 50,
    description: '一顆充滿潛力的蛋，需要知識的灌溉。'
  },
  [PetStage.BABY]: {
    emoji: '🐣',
    label: '幼幼雞',
    nextStage: PetStage.CHILD,
    maxExp: 150,
    description: '剛破殼而出，對世界充滿好奇。'
  },
  [PetStage.CHILD]: {
    emoji: '🐥',
    label: '學徒雞',
    nextStage: PetStage.TEEN,
    maxExp: 300,
    description: '正在努力學習基礎知識。'
  },
  [PetStage.TEEN]: {
    emoji: '🦅',
    label: '飛鷹俠',
    nextStage: PetStage.ADULT,
    maxExp: 600,
    description: '展翅高飛，探索更難的挑戰。'
  },
  [PetStage.ADULT]: {
    emoji: '🐉',
    label: '知識龍',
    nextStage: PetStage.GRADUATE,
    maxExp: 1000,
    description: '博學多聞，即將成為傳說。'
  },
  [PetStage.GRADUATE]: {
    emoji: '🎓',
    label: '傳說大師',
    nextStage: PetStage.GRADUATE,
    maxExp: Infinity,
    description: '已經達到頂峰！可以重新領養新寵物。'
  }
};

export const REWARDS = [
  { id: 'sticker_star', name: '星星貼紙', cost: 100, icon: '⭐' },
  { id: 'sticker_trophy', name: '冠軍獎盃', cost: 300, icon: '🏆' },
  { id: 'sticker_rocket', name: '火箭徽章', cost: 500, icon: '🚀' },
  { id: 'sticker_crown', name: '皇冠', cost: 1000, icon: '👑' },
  { id: 'snack_pack', name: '神秘零食包 (5個飼料)', cost: 50, icon: '🍱', effect: 'food' },
];

// Initial State
export const INITIAL_PET_STATE = {
  name: '小樂',
  stage: PetStage.EGG,
  exp: 0,
  maxExp: 50,
  mood: 100,
};

export const INITIAL_USER_STATE = {
  food: 0,
  points: 0,
  inventory: [],
};
