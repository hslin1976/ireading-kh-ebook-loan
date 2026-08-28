import React from 'react';
import { ReadLevel, ReadStatus, LibraryFilter, MediaTypeFilter, BookListSource } from '../types';
import { LEVEL_INFO } from '../data/booksData';
import {
  Bookmark,
  Clock,
  CheckCircle2,
  Heart,
  Sparkles,
  BookOpen,
  Building2,
  Cloud,
  Library,
  Headphones,
  FileText,
  Layers,
  GraduationCap,
  ListFilter,
} from 'lucide-react';

interface LevelFilterBarProps {
  selectedSources: BookListSource[];
  selectedMediaType: MediaTypeFilter;
  selectedLevel: ReadLevel | 'all';
  selectedLibrary: LibraryFilter;
  selectedStatus: ReadStatus | 'all' | 'favorites';
  sourceCounts: {
    kh_reading: number;
    my_books: number;
    total: number;
  };
  mediaCounts: Record<MediaTypeFilter, number>;
  levelCounts: Record<string, number>;
  libraryCounts: Record<LibraryFilter, number>;
  statusCounts: Record<string, number>;
  onToggleSource: (source: BookListSource) => void;
  onSelectMediaType: (media: MediaTypeFilter) => void;
  onSelectLevel: (level: ReadLevel | 'all') => void;
  onSelectLibrary: (library: LibraryFilter) => void;
  onSelectStatus: (status: ReadStatus | 'all' | 'favorites') => void;
}

export const LevelFilterBar: React.FC<LevelFilterBarProps> = ({
  selectedSources,
  selectedMediaType,
  selectedLevel,
  selectedLibrary,
  selectedStatus,
  sourceCounts,
  mediaCounts,
  levelCounts,
  libraryCounts,
  statusCounts,
  onToggleSource,
  onSelectMediaType,
  onSelectLevel,
  onSelectLibrary,
  onSelectStatus,
}) => {
  const allLevels: ReadLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const isKhSelected = selectedSources.includes('kh_reading');
  const isMyBooksSelected = selectedSources.includes('my_books');

  return (
    <div className="space-y-4 mb-6">
      {/* 0. Top Layer: Booklist Source Multiple Selection Menu (圖書清單來源多選選單) */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-3xl p-3.5 sm:p-4 shadow-lg border-2 border-emerald-400">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs sm:text-sm font-black flex items-center gap-2 tracking-wide">
            <ListFilter className="w-4 h-4 text-emerald-200" />
            <span>圖書清單來源 (Booklist Source)：</span>
          </span>
          <span className="text-[11px] text-emerald-100/90 font-bold bg-emerald-800/60 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
            可多選切換喜閱網與精選書單
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Source 1: 高雄喜閱網 (Default Enabled) */}
          <button
            type="button"
            id="source-btn-kh-reading"
            onClick={() => onToggleSource('kh_reading')}
            className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between border-2 transition-all active:scale-[0.98] shadow-sm ${
              isKhSelected
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/80 shadow-md scale-[1.01]'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm opacity-75'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">🏫</span>
              <div className="text-left">
                <div className="font-black leading-tight flex items-center gap-1.5">
                  <span>高雄喜閱網</span>
                  {isKhSelected && (
                    <span className="text-[10px] bg-slate-950 text-amber-300 font-bold px-1.5 py-0.2 rounded-md">
                      已啟用
                    </span>
                  )}
                </div>
                <div className={`text-[10px] ${isKhSelected ? 'text-slate-800' : 'text-emerald-100'}`}>
                  官方閱讀能力分級檢定推薦書單 (第1~12級)
                </div>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-black ml-2 ${
                isKhSelected ? 'bg-slate-950 text-white' : 'bg-emerald-900/80 text-emerald-100'
              }`}
            >
              {sourceCounts.kh_reading} 本
            </span>
          </button>

          {/* Source 2: 我的書單 */}
          <button
            type="button"
            id="source-btn-my-books"
            onClick={() => onToggleSource('my_books')}
            className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between border-2 transition-all active:scale-[0.98] shadow-sm ${
              isMyBooksSelected
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/80 shadow-md scale-[1.01]'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm opacity-75'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">📚</span>
              <div className="text-left">
                <div className="font-black leading-tight flex items-center gap-1.5">
                  <span>我的書單</span>
                  {isMyBooksSelected && (
                    <span className="text-[10px] bg-slate-950 text-amber-300 font-bold px-1.5 py-0.2 rounded-md">
                      已啟用
                    </span>
                  )}
                </div>
                <div className={`text-[10px] ${isMyBooksSelected ? 'text-slate-800' : 'text-emerald-100'}`}>
                  精選得獎童書與有聲伴讀推薦書單
                </div>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-black ml-2 ${
                isMyBooksSelected ? 'bg-slate-950 text-white' : 'bg-emerald-900/80 text-emerald-100'
              }`}
            >
              {sourceCounts.my_books} 本
            </span>
          </button>
        </div>
      </div>

      {/* 1. All / Text / Audio Menu (圖書格式選單：全部 / 電子童書 / 有聲書) */}
      <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100/90 backdrop-blur rounded-2xl p-3 sm:p-3.5 border-2 border-amber-300 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-700" />
            <span>圖書格式選單 (Format Menu)：</span>
          </span>
          <span className="text-[11px] text-amber-800/80 font-bold hidden sm:inline">
            切換文字閱讀或語音伴讀
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* All Formats */}
          <button
            type="button"
            id="filter-media-all"
            onClick={() => onSelectMediaType('all')}
            className={`py-2 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-95 shadow-sm ${
              selectedMediaType === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400/50 scale-[1.02]'
                : 'bg-white/90 hover:bg-white text-slate-700 border-amber-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="truncate">全部格式 (All)</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                selectedMediaType === 'all'
                  ? 'bg-amber-950 text-white'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {mediaCounts.all || 0}
            </span>
          </button>

          {/* Text / E-Book Only */}
          <button
            type="button"
            id="filter-media-text"
            onClick={() => onSelectMediaType('text')}
            className={`py-2 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-95 shadow-sm ${
              selectedMediaType === 'text'
                ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400/50 scale-[1.02]'
                : 'bg-white/90 hover:bg-white text-slate-700 border-blue-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="truncate">📖 電子童書</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                selectedMediaType === 'text'
                  ? 'bg-blue-900 text-blue-100'
                  : 'bg-blue-100 text-blue-900'
              }`}
            >
              {mediaCounts.text || 0}
            </span>
          </button>

          {/* Audio / Audio Books */}
          <button
            type="button"
            id="filter-media-audio"
            onClick={() => onSelectMediaType('audio')}
            className={`py-2 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-95 shadow-sm ${
              selectedMediaType === 'audio'
                ? 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-400/50 scale-[1.02]'
                : 'bg-white/90 hover:bg-white text-purple-950 border-purple-200'
            }`}
          >
            <Headphones className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="truncate">🎧 有聲童書</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                selectedMediaType === 'audio'
                  ? 'bg-purple-900 text-purple-100'
                  : 'bg-purple-100 text-purple-900'
              }`}
            >
              {mediaCounts.audio || 0}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Read Level Color Dot Tabs (Expanded to Levels 1 - 12) */}
      <div className="bg-white/90 backdrop-blur rounded-2xl p-3 border-2 border-amber-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>閱讀分級・圖書色點選單 (Read Level 1~12)：</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            共 12 級標準色點・按難易度選書
          </span>
        </div>

        {/* All Levels Button & Levels 1-12 Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">
          {/* All Levels Tab */}
          <button
            type="button"
            id="filter-level-all"
            onClick={() => onSelectLevel('all')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs sm:text-xs flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${
              selectedLevel === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm scale-[1.02]'
                : 'bg-amber-50/70 hover:bg-amber-100 text-slate-700 border-amber-200'
            }`}
          >
            <span>全部等級</span>
            <span className="bg-white/90 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {levelCounts.all || 0}
            </span>
          </button>

          {/* Dynamic 1-12 Level Tabs */}
          {allLevels.map((lvl) => {
            const conf = LEVEL_INFO[lvl];
            const isSelected = selectedLevel === lvl;
            const count = levelCounts[String(lvl)] || 0;

            return (
              <button
                key={lvl}
                type="button"
                id={`filter-level-${lvl}`}
                onClick={() => onSelectLevel(lvl)}
                className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-between gap-1 border-2 transition-all active:scale-95 ${
                  isSelected
                    ? `${conf.bgColor} ${conf.textColor} ${conf.borderColor} shadow-md scale-[1.02] ring-2 ring-amber-400/40`
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title={`${conf.name}・${conf.ageRange}`}
              >
                <div className="flex items-center gap-1 min-w-0 truncate">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${conf.dotColor}`} />
                  <span className="truncate">{lvl}級・{conf.colorDot.replace('標', '')}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black flex-shrink-0 ${
                    isSelected ? 'bg-black/20 text-current' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Library Filter Menu */}
      <div className="bg-white/90 backdrop-blur rounded-2xl p-3 border-2 border-indigo-100 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Library className="w-4 h-4 text-indigo-600" />
            <span>借閱書庫平台 (Library)：</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            快速篩選指定借閱管道的電子館藏
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* All Libraries */}
          <button
            type="button"
            id="filter-lib-all"
            onClick={() => onSelectLibrary('all')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${
              selectedLibrary === 'all'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm scale-[1.02]'
                : 'bg-indigo-50/50 hover:bg-indigo-100 text-slate-700 border-indigo-100'
            }`}
          >
            <span>🌐 全部書庫</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedLibrary === 'all'
                  ? 'bg-indigo-800 text-indigo-100'
                  : 'bg-indigo-100 text-indigo-900'
              }`}
            >
              {libraryCounts.all || 0}
            </span>
          </button>

          {/* NLPI: 國立公共資訊圖書館 */}
          <button
            type="button"
            id="filter-lib-nlpi"
            onClick={() => onSelectLibrary('nlpi')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${
              selectedLibrary === 'nlpi'
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm scale-[1.02]'
                : 'bg-amber-50/50 hover:bg-amber-100 text-slate-700 border-amber-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
            <span className="truncate">國資圖 (NLPI)</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedLibrary === 'nlpi'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {libraryCounts.nlpi || 0}
            </span>
          </button>

          {/* HyRead: 高雄市立圖書館 */}
          <button
            type="button"
            id="filter-lib-hyread"
            onClick={() => onSelectLibrary('hyread')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${
              selectedLibrary === 'hyread'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-[1.02]'
                : 'bg-emerald-50/50 hover:bg-emerald-100 text-slate-700 border-emerald-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">HyRead (高市圖)</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedLibrary === 'hyread'
                  ? 'bg-emerald-800 text-emerald-100'
                  : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              {libraryCounts.hyread || 0}
            </span>
          </button>

          {/* Cloud: 台灣雲端書庫 (高市圖) */}
          <button
            type="button"
            id="filter-lib-cloud"
            onClick={() => onSelectLibrary('cloud')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${
              selectedLibrary === 'cloud'
                ? 'bg-purple-600 text-white border-purple-700 shadow-sm scale-[1.02]'
                : 'bg-purple-50/50 hover:bg-purple-100 text-slate-700 border-purple-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            <span className="truncate">台灣雲端書庫 (高市圖)</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedLibrary === 'cloud'
                  ? 'bg-purple-800 text-purple-100'
                  : 'bg-purple-100 text-purple-900'
              }`}
            >
              {libraryCounts.cloud || 0}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Reading Status Filter Tabs */}
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
