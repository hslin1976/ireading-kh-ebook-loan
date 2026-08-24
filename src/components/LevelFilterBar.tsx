import React from 'react';
import { ReadLevel, ReadStatus } from '../types';
import { LEVEL_INFO } from '../data/booksData';
import { Bookmark, Clock, CheckCircle2, Heart, Sparkles, BookOpen } from 'lucide-react';

interface LevelFilterBarProps {
  selectedLevel: ReadLevel | 'all';
  selectedStatus: ReadStatus | 'all' | 'favorites';
  levelCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  onSelectLevel: (level: ReadLevel | 'all') => void;
  onSelectStatus: (status: ReadStatus | 'all' | 'favorites') => void;
}

export const LevelFilterBar: React.FC<LevelFilterBarProps> = ({
  selectedLevel,
  selectedStatus,
  levelCounts,
  statusCounts,
  onSelectLevel,
  onSelectStatus,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* 1. Read Level Color Dot Tabs */}
      <div className="bg-white/90 backdrop-blur rounded-2xl p-3 border-2 border-amber-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>閱讀分級・圖書色點 (Read Level)：</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            依難易度分級，選適合自己的書！
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* All Levels */}
          <button
            type="button"
            id="filter-level-all"
            onClick={() => onSelectLevel('all')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
              selectedLevel === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm scale-[1.02]'
                : 'bg-amber-50/70 hover:bg-amber-100 text-slate-700 border-amber-200'
            }`}
          >
            <span>全部書籍</span>
            <span className="bg-white/80 text-slate-800 text-[11px] px-1.5 py-0.2 rounded-full font-bold">
              {levelCounts.all || 0}
            </span>
          </button>

          {/* Level 1: 白標 */}
          <button
            type="button"
            id="filter-level-1"
            onClick={() => onSelectLevel(1)}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${
              selectedLevel === 1
                ? 'bg-slate-800 text-white border-slate-900 shadow-md scale-[1.02]'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-400" />
            <span>第1級・白標</span>
            <span className="bg-slate-200 text-slate-800 text-[11px] px-1.5 py-0.2 rounded-full font-bold">
              {levelCounts['1'] || 0}
            </span>
          </button>

          {/* Level 2: 黑標 */}
          <button
            type="button"
            id="filter-level-2"
            onClick={() => onSelectLevel(2)}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${
              selectedLevel === 2
                ? 'bg-slate-900 text-amber-300 border-black shadow-md scale-[1.02]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-black border border-slate-600" />
            <span>第2級・黑標</span>
            <span className="bg-slate-700 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
              {levelCounts['2'] || 0}
            </span>
          </button>

          {/* Level 3: 紅標 */}
          <button
            type="button"
            id="filter-level-3"
            onClick={() => onSelectLevel(3)}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${
              selectedLevel === 3
                ? 'bg-rose-600 text-white border-rose-700 shadow-md scale-[1.02]'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-rose-600" />
            <span>第3級・紅標</span>
            <span className="bg-rose-200 text-rose-900 text-[11px] px-1.5 py-0.2 rounded-full font-bold">
              {levelCounts['3'] || 0}
            </span>
          </button>

          {/* Level 4: 橙標 */}
          <button
            type="button"
            id="filter-level-4"
            onClick={() => onSelectLevel(4)}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${
              selectedLevel === 4
                ? 'bg-amber-600 text-white border-amber-700 shadow-md scale-[1.02]'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-600" />
            <span>第4級・橙標</span>
            <span className="bg-amber-200 text-amber-900 text-[11px] px-1.5 py-0.2 rounded-full font-bold">
              {levelCounts['4'] || 0}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Reading Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-extrabold text-slate-600 px-1">
          📌 閱讀狀態整理：
        </span>

        {/* All Status */}
        <button
          type="button"
          id="filter-status-all"
          onClick={() => onSelectStatus('all')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 ${
            selectedStatus === 'all'
              ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <span>全部進度</span>
          <span className="bg-white/20 text-current text-[10px] px-1.5 py-0.2 rounded-full">
            {statusCounts.all || 0}
          </span>
        </button>

        {/* Unread (未讀) */}
        <button
          type="button"
          id="filter-status-unread"
          onClick={() => onSelectStatus('unread')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 ${
            selectedStatus === 'unread'
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
              : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-700" />
          <span>未讀書籍</span>
          <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {statusCounts.unread || 0}
          </span>
        </button>

        {/* Reading (閱讀中) */}
        <button
          type="button"
          id="filter-status-reading"
          onClick={() => onSelectStatus('reading')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 ${
            selectedStatus === 'reading'
              ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
              : 'bg-white hover:bg-sky-50 text-sky-800 border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span>正在看</span>
          <span className="bg-sky-100 text-sky-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {statusCounts.reading || 0}
          </span>
        </button>

        {/* Completed (已讀完) */}
        <button
          type="button"
          id="filter-status-completed"
          onClick={() => onSelectStatus('completed')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 ${
            selectedStatus === 'completed'
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
              : 'bg-white hover:bg-emerald-50 text-emerald-800 border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>已讀完</span>
          <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {statusCounts.completed || 0}
          </span>
        </button>

        {/* Favorites / Wishlist (想讀清單) */}
        <button
          type="button"
          id="filter-status-favorites"
          onClick={() => onSelectStatus('favorites')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 ${
            selectedStatus === 'favorites'
              ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-rose-50 text-rose-700 border-slate-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>我的想讀清單</span>
          <span className="bg-rose-100 text-rose-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {statusCounts.favorites || 0}
          </span>
        </button>
      </div>
    </div>
  );
};
