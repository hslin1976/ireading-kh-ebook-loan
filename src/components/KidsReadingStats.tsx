import React from 'react';
import { X, Award, Star, Trophy, Sparkles, BookOpen, CheckCircle2, Heart } from 'lucide-react';
import { Book, UserBookState } from '../types';

interface KidsReadingStatsProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  userBooks: Record<string, UserBookState>;
}

export const KidsReadingStats: React.FC<KidsReadingStatsProps> = ({
  isOpen,
  onClose,
  books,
  userBooks,
}) => {
  if (!isOpen) return null;

  const total = books.length;
  let completedCount = 0;
  let readingCount = 0;
  let favoritesCount = 0;

  books.forEach((b) => {
    const s = userBooks[b.isbn]?.status;
    if (s === 'completed') completedCount++;
    if (s === 'reading') readingCount++;
    if (userBooks[b.isbn]?.favorite) favoritesCount++;
  });

  // Calculate level completions
  const levelCompleted: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const levelTotal: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

  books.forEach((b) => {
    levelTotal[b.readLevel] = (levelTotal[b.readLevel] || 0) + 1;
    if (userBooks[b.isbn]?.status === 'completed') {
      levelCompleted[b.readLevel] = (levelCompleted[b.readLevel] || 0) + 1;
    }
  });

  // Badges
  const badges = [
    {
      id: 'first-book',
      name: '閱讀啟航星 🚀',
      desc: '讀完第一本童書',
      unlocked: completedCount >= 1,
      icon: '🌱',
    },
    {
      id: 'read-3',
      name: '故事小達人 🌟',
      desc: '累計讀完 3 本書',
      unlocked: completedCount >= 3,
      icon: '⭐',
    },
    {
      id: 'read-5',
      name: '閱讀冒險家 🦁',
      desc: '累計讀完 5 本書',
      unlocked: completedCount >= 5,
      icon: '🏆',
    },
    {
      id: 'level-1-master',
      name: '白標初級王 🎓',
      desc: '讀完所有第1級書籍',
      unlocked: levelTotal[1] > 0 && levelCompleted[1] === levelTotal[1],
      icon: '🤍',
    },
    {
      id: 'read-10',
      name: '圖書館小博士 🦉',
      desc: '累計讀完 10 本書',
      unlocked: completedCount >= 10,
      icon: '👑',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        id="reading-stats-modal"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-400 border-b border-amber-300">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-950">
              我的閱讀小天地・榮譽榜
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Main Progress Hero Card */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-5 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                閱讀總進度
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5">
                已閱讀 {completedCount} / {total} 本書
              </h3>
              <p className="text-xs text-amber-100 font-medium mt-1">
                {completedCount === 0
                  ? '點選一本書開始你的閱讀旅程吧！'
                  : completedCount >= 10
                  ? '太厲害了！你已經是閱讀小天才！'
                  : '太棒了！每天讀一點，進步看得見！'}
              </p>
            </div>
            <div className="text-4xl sm:text-5xl">
              {completedCount >= 10 ? '👑' : completedCount >= 5 ? '🦁' : '🌟'}
            </div>
          </div>

          {/* Counts Row */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-600 block">已讀完</span>
              <span className="text-xl font-black text-emerald-700">{completedCount}</span>
            </div>

            <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl">
              <BookOpen className="w-5 h-5 text-sky-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-600 block">閱讀中</span>
              <span className="text-xl font-black text-sky-700">{readingCount}</span>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-600 block">想讀清單</span>
              <span className="text-xl font-black text-rose-700">{favoritesCount}</span>
            </div>
          </div>

          {/* Level Breakdown Progress */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>各分級閱讀進度</span>
            </h4>

            {[1, 2, 3, 4].map((lvl) => {
              const comp = levelCompleted[lvl] || 0;
              const tot = levelTotal[lvl] || 0;
              const pct = tot > 0 ? Math.round((comp / tot) * 100) : 0;
              const label =
                lvl === 1
                  ? '第1級・白標'
                  : lvl === 2
                  ? '第2級・黑標'
                  : lvl === 3
                  ? '第3級・紅標'
                  : '第4級・橙標';

              return (
                <div key={lvl} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{label}</span>
                    <span>
                      {comp} / {tot} 本 ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        lvl === 1
                          ? 'bg-slate-700'
                          : lvl === 2
                          ? 'bg-slate-900'
                          : lvl === 3
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Achievements & Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>閱讀勳章牆</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                    badge.unlocked
                      ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <h5 className="text-xs font-extrabold">{badge.name}</h5>
                    <p className="text-[11px] text-slate-500">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-xl shadow-md text-sm transition-all"
          >
            繼續看書
          </button>
        </div>
      </div>
    </div>
  );
};
