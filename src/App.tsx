import React, { useState, useEffect, useMemo } from 'react';
import {
  Book,
  ReadLevel,
  ReadStatus,
  UserBookState,
  ZhuyinDisplayMode,
  TextSize,
  LibraryFilter,
} from './types';
import { BOOKS_DATA, LEVEL_INFO } from './data/booksData';
import { KidsHeader } from './components/KidsHeader';
import { LevelFilterBar } from './components/LevelFilterBar';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { LoanGuideModal } from './components/LoanGuideModal';
import { KidsReadingStats } from './components/KidsReadingStats';
import { VisitorCounter } from './components/VisitorCounter';
import { ZhuyinText } from './components/ZhuyinText';
import {
  BookOpen,
  Sparkles,
  Info,
  Layers,
  SearchX,
  Volume2,
  RefreshCw,
  ExternalLink,
  Award,
} from 'lucide-react';
import { speakTaiwanMandarin } from './utils/speechUtils';

const STORAGE_KEY = 'taiwan_kids_ebook_state_v1';
const PREFS_KEY = 'taiwan_kids_ebook_prefs_v1';

export default function App() {
  // User Reading States mapped by ISBN
  const [userBooks, setUserBooks] = useState<Record<string, UserBookState>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to read local storage', e);
    }
    // Default initial states: first 2 books as unread
    const initial: Record<string, UserBookState> = {};
    BOOKS_DATA.forEach((b) => {
      initial[b.isbn] = {
        status: 'unread',
        favorite: false,
        rating: 0,
      };
    });
    return initial;
  });

  // UI Preferences
  const [zhuyinMode, setZhuyinMode] = useState<ZhuyinDisplayMode>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.zhuyinMode) return parsed.zhuyinMode;
      }
    } catch {}
    return 'side'; // Default to Taiwan textbook standard side Zhuyin
  });

  const [textSize, setTextSize] = useState<TextSize>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.textSize) return parsed.textSize;
      }
    } catch {}
    return 'large'; // Default to large for 7-year-olds on tablets
  });

  // Filter & Search states
  const [selectedLevel, setSelectedLevel] = useState<ReadLevel | 'all'>('all');
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<ReadStatus | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeBookModal, setActiveBookModal] = useState<Book | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [globalRefreshKey, setGlobalRefreshKey] = useState(0);

  // Save user reading state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userBooks));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [userBooks]);

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ zhuyinMode, textSize }));
    } catch (e) {}
  }, [zhuyinMode, textSize]);

  // Update book status
  const handleUpdateStatus = (isbn: string, status: ReadStatus) => {
    setUserBooks((prev) => ({
      ...prev,
      [isbn]: {
        ...(prev[isbn] || {}),
        status,
        lastReadDate: new Date().toISOString(),
      },
    }));
  };

  // Toggle Favorite
  const handleToggleFavorite = (isbn: string) => {
    setUserBooks((prev) => {
      const currentFav = prev[isbn]?.favorite || false;
      return {
        ...prev,
        [isbn]: {
          ...(prev[isbn] || { status: 'unread' }),
          favorite: !currentFav,
        },
      };
    });
  };

  // Update Rating
  const handleUpdateRating = (isbn: string, rating: number) => {
    setUserBooks((prev) => ({
      ...prev,
      [isbn]: {
        ...(prev[isbn] || { status: 'unread' }),
        rating,
      },
    }));
  };

  // Update Notes
  const handleUpdateNotes = (isbn: string, notes: string) => {
    setUserBooks((prev) => ({
      ...prev,
      [isbn]: {
        ...(prev[isbn] || { status: 'unread' }),
        notes,
      },
    }));
  };

  // Calculate Level, Library and Status Counts
  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = { all: BOOKS_DATA.length, '1': 0, '2': 0, '3': 0, '4': 0 };
    BOOKS_DATA.forEach((b) => {
      counts[String(b.readLevel)] = (counts[String(b.readLevel)] || 0) + 1;
    });
    return counts;
  }, []);

  const libraryCounts = useMemo(() => {
    const counts: Record<LibraryFilter, number> = {
      all: BOOKS_DATA.length,
      nlpi: 0,
      hyread: 0,
      cloud: 0,
    };
    BOOKS_DATA.forEach((b) => {
      if (b.nlpiUrl) counts.nlpi += 1;
      if (b.hyreadUrl) counts.hyread += 1;
      if (b.cloudUrl) counts.cloud += 1;
    });
    return counts;
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: BOOKS_DATA.length,
      unread: 0,
      reading: 0,
      completed: 0,
      favorites: 0,
    };
    BOOKS_DATA.forEach((b) => {
      const st = userBooks[b.isbn]?.status || 'unread';
      counts[st] = (counts[st] || 0) + 1;
      if (userBooks[b.isbn]?.favorite) {
        counts.favorites = (counts.favorites || 0) + 1;
      }
    });
    return counts;
  }, [userBooks]);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return BOOKS_DATA.filter((book) => {
      // 1. Level Filter
      if (selectedLevel !== 'all' && book.readLevel !== selectedLevel) {
        return false;
      }

      // 2. Library Filter
      if (selectedLibrary === 'nlpi' && !book.nlpiUrl) {
        return false;
      }
      if (selectedLibrary === 'hyread' && !book.hyreadUrl) {
        return false;
      }
      if (selectedLibrary === 'cloud' && !book.cloudUrl) {
        return false;
      }

      // 3. Status Filter
      if (selectedStatus === 'favorites') {
        if (!userBooks[book.isbn]?.favorite) return false;
      } else if (selectedStatus !== 'all') {
        const currentStatus = userBooks[book.isbn]?.status || 'unread';
        if (currentStatus !== selectedStatus) return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const titleMatch = book.title.toLowerCase().includes(q);
        const introMatch = book.introduce.toLowerCase().includes(q);
        const authorMatch = book.author?.toLowerCase().includes(q) || false;
        const colorMatch = book.colorDot.toLowerCase().includes(q);
        const tagsMatch = book.tags?.some((t) => t.toLowerCase().includes(q)) || false;

        // Zhuyin match
        const zhuyinMatch = book.titleZhuyin.some((z) => z.zhuyin?.includes(q));

        if (!titleMatch && !introMatch && !authorMatch && !colorMatch && !tagsMatch && !zhuyinMatch) {
          return false;
        }
      }

      return true;
    });
  }, [selectedLevel, selectedLibrary, selectedStatus, searchQuery, userBooks]);

  const completedTotal = statusCounts.completed || 0;

  return (
    <div className="min-h-screen bg-amber-50/50 text-slate-800 pb-16 font-sans">
      {/* Top Banner Notice */}
      <div className="bg-amber-400 px-4 py-2 text-center text-xs sm:text-sm font-black text-slate-950 flex items-center justify-center gap-2 border-b border-amber-500/40">
        <span>🎒 台灣小學一年級・7歲注音電子書庫</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline font-bold text-amber-950">
          點擊封面直接借書 📖 國立公共資訊圖書館（NLPI）線上閱讀
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* Kid Cheerful Header */}
        <KidsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          zhuyinMode={zhuyinMode}
          onZhuyinModeChange={setZhuyinMode}
          textSize={textSize}
          onTextSizeChange={setTextSize}
          completedCount={completedTotal}
          totalBooksCount={BOOKS_DATA.length}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        {/* Level, Library and Read Status Filter Bar */}
        <LevelFilterBar
          selectedLevel={selectedLevel}
          selectedLibrary={selectedLibrary}
          selectedStatus={selectedStatus}
          levelCounts={levelCounts}
          libraryCounts={libraryCounts}
          statusCounts={statusCounts}
          onSelectLevel={setSelectedLevel}
          onSelectLibrary={setSelectedLibrary}
          onSelectStatus={setSelectedStatus}
        />

        {/* Active Level Description Banner if specific level selected */}
        {selectedLevel !== 'all' && (
          <div
            className={`p-4 rounded-2xl mb-6 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              selectedLevel === 1
                ? 'bg-slate-100 border-slate-300'
                : selectedLevel === 2
                ? 'bg-slate-900 text-white border-slate-800'
                : selectedLevel === 3
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full ${
                  LEVEL_INFO[selectedLevel].dotColor
                } inline-block flex-shrink-0`}
              />
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  {LEVEL_INFO[selectedLevel].name}：{LEVEL_INFO[selectedLevel].desc}
                </h3>
                <p className="text-xs opacity-80 mt-0.5">
                  推薦對象：{LEVEL_INFO[selectedLevel].suitable}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-800 self-start sm:self-auto shadow-sm"
            >
              顯示全部級別
            </button>
          </div>
        )}

        {/* Results Counter & Current Filter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 px-1">
          <div className="text-xs sm:text-sm font-extrabold text-slate-700 flex flex-wrap items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              共有 <strong className="text-amber-600 text-base">{filteredBooks.length}</strong> 本好書
            </span>
            {selectedLibrary !== 'all' && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedLibrary === 'nlpi'
                    ? 'bg-amber-200 text-amber-950'
                    : selectedLibrary === 'hyread'
                    ? 'bg-emerald-200 text-emerald-950'
                    : 'bg-purple-200 text-purple-950'
                }`}
              >
                {selectedLibrary === 'nlpi'
                  ? '🏛️ 國資圖 (NLPI)'
                  : selectedLibrary === 'hyread'
                  ? '📚 HyRead (高市圖)'
                  : '☁️ 台灣雲端書庫 (高市圖)'}
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full text-xs font-bold">
                {selectedStatus === 'unread'
                  ? '未讀清單'
                  : selectedStatus === 'reading'
                  ? '正在閱讀中'
                  : selectedStatus === 'completed'
                  ? '已讀完清單'
                  : '我的想讀清單'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              speakTaiwanMandarin(
                `目前找到 ${filteredBooks.length} 本童書。點擊封面可以聽發音和借閱喔！`
              )
            }
            className="text-xs font-bold text-slate-600 hover:text-amber-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-amber-200 shadow-sm"
            title="語音播報結果"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">語音播報</span>
          </button>
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div key={globalRefreshKey} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredBooks.map((book) => {
              const bookState = userBooks[book.isbn] || {
                status: 'unread',
                favorite: false,
                rating: 0,
              };

              return (
                <BookCard
                  key={book.isbn}
                  book={book}
                  userStatus={bookState.status}
                  isFavorite={Boolean(bookState.favorite)}
                  userRating={bookState.rating || 0}
                  zhuyinMode={zhuyinMode}
                  textSize={textSize}
                  onUpdateStatus={handleUpdateStatus}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenDetail={setActiveBookModal}
                />
              );
            })}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-amber-300 max-w-lg mx-auto my-8 shadow-sm">
            <SearchX className="w-16 h-16 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-800 mb-1">找不到相關的童書呢！</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-4">
              可以嘗試更換搜尋關鍵字，或是切換篩選條件看看其他精彩好書。
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedLevel('all');
                setSelectedLibrary('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-2xl shadow-md text-xs sm:text-sm inline-flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重設所有篩選條件</span>
            </button>
          </div>
        )}

        {/* Bottom Helper Bar for Tablet Users */}
        <div className="mt-12 bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                平板借書閱讀小撇步
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                點擊書本封面或「國資圖線上借書」按鈕，立即在瀏覽器中借閱全彩繪本！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm transition-all"
            >
              借書教學
            </button>
            <button
              type="button"
              onClick={() => setIsStatsOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm"
            >
              我的閱讀獎章
            </button>
          </div>
        </div>

        {/* Visitor Counter Section */}
        <VisitorCounter zhuyinMode={zhuyinMode} />
      </div>

      {/* Book Detail Modal */}
      {activeBookModal && (
        <BookDetailModal
          book={activeBookModal}
          userStatus={userBooks[activeBookModal.isbn]?.status || 'unread'}
          isFavorite={Boolean(userBooks[activeBookModal.isbn]?.favorite)}
          userRating={userBooks[activeBookModal.isbn]?.rating || 0}
          userNotes={userBooks[activeBookModal.isbn]?.notes || ''}
          zhuyinMode={zhuyinMode}
          textSize={textSize}
          onClose={() => setActiveBookModal(null)}
          onUpdateStatus={handleUpdateStatus}
          onToggleFavorite={handleToggleFavorite}
          onUpdateRating={handleUpdateRating}
          onUpdateNotes={handleUpdateNotes}
        />
      )}

      {/* Loan Guide Modal */}
      <LoanGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Kids Reading Stats & Badges Modal */}
      <KidsReadingStats
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        books={BOOKS_DATA}
        userBooks={userBooks}
        onResetAllRatings={() => {
          // Clear user rating stars on all books in state
          setUserBooks((prev) => {
            const next = { ...prev };
            for (const isbn of Object.keys(next)) {
              if (next[isbn]) {
                next[isbn] = { ...next[isbn], rating: 0 };
              }
            }
            return next;
          });
          setGlobalRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}
