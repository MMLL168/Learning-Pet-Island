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
  { 
    id: 'screen_time', 
    name: '20 Mins Screen Time', 
    desc: '看電視/玩手機 20 分鐘', 
    cost: 20, 
    icon: '📺', 
    color: 'bg-blue-500' 
  },
  { 
    id: 'fav_snack', 
    name: 'Favorite Snack', 
    desc: '喜歡的零食', 
    cost: 8, 
    icon: '🍪', 
    color: 'bg-orange-500' 
  },
  { 
    id: 'fast_food', 
    name: 'Fast Food Trip', 
    desc: '吃速食/麥當勞', 
    cost: 20, 
    icon: '🍔', 
    color: 'bg-red-500' 
  },
  { 
    id: 'skip_chores', 
    name: 'Skip Chores', 
    desc: '免做家事一次', 
    cost: 15, 
    icon: '🧹', 
    color: 'bg-purple-500' 
  },
  { 
    id: 'pocket_money', 
    name: 'Pocket Money Bonus', 
    desc: '增加零用錢', 
    cost: 50, 
    icon: '💰', 
    color: 'bg-green-500' 
  },
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
