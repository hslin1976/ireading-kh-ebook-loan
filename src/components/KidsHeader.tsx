import React from 'react';
import { ZhuyinDisplayMode, TextSize } from '../types';
import {
  BookOpen,
  Search,
  Volume2,
  Sparkles,
  HelpCircle,
  Type,
  Eye,
  Star,
  Award,
} from 'lucide-react';
import { speakTaiwanMandarin } from '../utils/speechUtils';

interface KidsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  zhuyinMode: ZhuyinDisplayMode;
  onZhuyinModeChange: (mode: ZhuyinDisplayMode) => void;
  textSize: TextSize;
  onTextSizeChange: (size: TextSize) => void;
  completedCount: number;
  totalBooksCount: number;
  onOpenGuide: () => void;
  onOpenStats: () => void;
}

export const KidsHeader: React.FC<KidsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  zhuyinMode,
  onZhuyinModeChange,
  textSize,
  onTextSizeChange,
  completedCount,
  totalBooksCount,
  onOpenGuide,
  onOpenStats,
}) => {
  const handleWelcomeSpeech = () => {
    speakTaiwanMandarin(
      '歡迎來到童書借閱樂園！點選書本可以看注音拼讀，點擊圖片就可以借電子書來讀喔！'
    );
  };

  return (
    <header className="relative bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-4 sm:p-6 mb-6 text-slate-900 shadow-xl border-4 border-amber-300">
      {/* Top Row: Mascot, Title & Tablet Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and Mascot */}
        <div className="flex items-center gap-3.5">
          <div
            onClick={handleWelcomeSpeech}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 p-2 shadow-lg border-2 border-amber-200 flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            title="按我聽歡迎問候語！"
          >
            <span className="text-3xl sm:text-4xl select-none animate-bounce">
              🦉
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-950 flex items-center gap-2">
                <span>童書借閱樂園</span>
                <span className="text-sm sm:text-base font-bold bg-amber-100/90 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                  7歲小讀者專用
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-bold text-amber-950/80 flex items-center gap-1.5 mt-0.5">
              <span>注音符號伴讀</span>
              <span>•</span>
              <span>分級閱讀</span>
              <span>•</span>
              <span>國資圖電子書借閱</span>
            </p>
          </div>
        </div>

        {/* Right Stats & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Achievement Stars */}
          <button
            type="button"
            id="stats-btn"
            onClick={onOpenStats}
            className="bg-white/90 hover:bg-white text-slate-900 font-extrabold px-3 py-2 rounded-2xl shadow-sm border border-amber-200 flex items-center gap-2 text-xs sm:text-sm transition-all active:scale-95"
            title="查看我的閱讀成就與獎狀"
          >
            <Award className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>已讀 {completedCount} / {totalBooksCount} 本</span>
            <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {Math.round((completedCount / (totalBooksCount || 1)) * 100)}%
            </span>
          </button>

          {/* Loan Guide Helper */}
          <button
            type="button"
            id="guide-btn"
            onClick={onOpenGuide}
            className="bg-white/90 hover:bg-white text-slate-900 font-bold px-3 py-2 rounded-2xl shadow-sm border border-amber-200 flex items-center gap-1.5 text-xs sm:text-sm transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>怎麼借書？</span>
          </button>
        </div>
      </div>

      {/* Controls & Search Bar Row */}
      <div className="mt-4 pt-4 border-t border-amber-300/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            id="search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜尋書名、作者、關鍵字（例如：恐龍、賴馬、短耳兔）..."
            className="w-full bg-white/95 pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 border-2 border-white focus:border-amber-600 focus:outline-none shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded-full font-bold"
            >
              清除
            </button>
          )}
        </div>

        {/* Zhuyin & Font Control Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zhuyin Display Mode Switcher */}
          <div className="bg-white/90 p-1 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-1 text-xs">
            <span className="text-[11px] font-bold text-slate-600 pl-2 pr-1 flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-600" />
              <span>注音：</span>
            </span>
            <button
              type="button"
              id="zhuyin-mode-side"
              onClick={() => onZhuyinModeChange('side')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                zhuyinMode === 'side'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="台灣課本標準：側邊直排注音"
            >
              側邊標音
            </button>
            <button
              type="button"
              id="zhuyin-mode-top"
              onClick={() => onZhuyinModeChange('top')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                zhuyinMode === 'top'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="上方拼音"
            >
              上方標音
            </button>
            <button
              type="button"
              id="zhuyin-mode-hidden"
              onClick={() => onZhuyinModeChange('hidden')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                zhuyinMode === 'hidden'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="挑戰不看注音自主閱讀"
            >
              隱藏注音
            </button>
          </div>

          {/* Font Size Switcher for Tablet */}
          <div className="bg-white/90 p-1 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-1 text-xs">
            <span className="text-[11px] font-bold text-slate-600 pl-2 pr-1 flex items-center gap-1">
              <Type className="w-3 h-3 text-amber-600" />
              <span>字體：</span>
            </span>
            <button
              type="button"
              id="text-size-normal"
              onClick={() => onTextSizeChange('normal')}
              className={`px-2 py-1 rounded-xl font-bold ${
                textSize === 'normal'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              中
            </button>
            <button
              type="button"
              id="text-size-large"
              onClick={() => onTextSizeChange('large')}
              className={`px-2 py-1 rounded-xl font-bold ${
                textSize === 'large'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              大
            </button>
            <button
              type="button"
              id="text-size-xlarge"
              onClick={() => onTextSizeChange('xlarge')}
              className={`px-2 py-1 rounded-xl font-bold ${
                textSize === 'xlarge'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              特大
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
