import React, { useState, useEffect, useMemo } from 'react';
import {
  Book,
  ReadLevel,
  ReadStatus,
  UserBookState,
  ZhuyinDisplayMode,
  TextSize,
  LibraryFilter,
  MediaTypeFilter,
  BookListSource,
} from './types';
import {
  BOOKS_DATA,
  MY_BOOKS_DATA,
  KH_READING_BOOKS,
  ALL_BOOKS_DATA,
  LEVEL_INFO,
} from './data/booksData';
import { KidsHeader } from './components/KidsHeader';
import { LevelFilterBar } from './components/LevelFilterBar';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { LoanGuideModal } from './components/LoanGuideModal';
import { KidsReadingStats } from './components/KidsReadingStats';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
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
const SOURCE_KEY = 'taiwan_kids_ebook_sources_v1';

export default function App() {
  // Booklist Source Selection (Multiple selection, default to ['kh_reading'])
  const [selectedSources, setSelectedSources] = useState<BookListSource[]>(() => {
    try {
      const saved = localStorage.getItem(SOURCE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return ['kh_reading']; // Default enabled: 高雄喜閱網
  });

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
    const initial: Record<string, UserBookState> = {};
    ALL_BOOKS_DATA.forEach((b) => {
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
  const [selectedMediaType, setSelectedMediaType] = useState<MediaTypeFilter>('all');
  const [selectedLevel, setSelectedLevel] = useState<ReadLevel | 'all'>('all');
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<ReadStatus | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeBookModal, setActiveBookModal] = useState<Book | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [globalRefreshKey, setGlobalRefreshKey] = useState(0);

  // Save selected sources
  useEffect(() => {
    try {
      localStorage.setItem(SOURCE_KEY, JSON.stringify(selectedSources));
    } catch (e) {}
  }, [selectedSources]);

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

  // Toggle Source handler (Multi-selection)
  const handleToggleSource = (source: BookListSource) => {
    setSelectedSources((prev) => {
      if (prev.includes(source)) {
        if (prev.length === 1) {
          // If only 1 selected and clicked, switch to the other source
          const other: BookListSource = source === 'kh_reading' ? 'my_books' : 'kh_reading';
          return [other];
        }
        return prev.filter((s) => s !== source);
      } else {
        return [...prev, source];
      }
    });
  };

  // Base Books matching the active booklist sources
  const activePoolBooks = useMemo(() => {
    const list: Book[] = [];
    if (selectedSources.includes('kh_reading')) {
      list.push(...KH_READING_BOOKS);
    }
    if (selectedSources.includes('my_books')) {
      list.push(...MY_BOOKS_DATA);
    }
    return list;
  }, [selectedSources]);

  // Source Counts for the top menu
  const sourceCounts = useMemo(() => {
    return {
      kh_reading: KH_READING_BOOKS.length,
      my_books: MY_BOOKS_DATA.length,
      total: ALL_BOOKS_DATA.length,
    };
  }, []);

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

  // Calculate Media Type, Level, Library and Status Counts based on active pool
  const mediaCounts = useMemo(() => {
    const counts: Record<MediaTypeFilter, number> = {
      all: activePoolBooks.length,
      text: 0,
      audio: 0,
    };
    activePoolBooks.forEach((b) => {
      const mType = b.mediaType || 'text';
      counts[mType] = (counts[mType] || 0) + 1;
    });
    return counts;
  }, [activePoolBooks]);

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: activePoolBooks.length,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      '7': 0,
      '8': 0,
      '9': 0,
      '10': 0,
      '11': 0,
      '12': 0,
    };
    activePoolBooks.forEach((b) => {
      const k = String(b.readLevel);
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [activePoolBooks]);

  const libraryCounts = useMemo(() => {
    const counts: Record<LibraryFilter, number> = {
      all: activePoolBooks.length,
      nlpi: 0,
      hyread: 0,
      cloud: 0,
    };
    activePoolBooks.forEach((b) => {
      if (b.nlpiUrl) counts.nlpi += 1;
      if (b.hyreadUrl) counts.hyread += 1;
      if (b.cloudUrl) counts.cloud += 1;
    });
    return counts;
  }, [activePoolBooks]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: activePoolBooks.length,
      unread: 0,
      reading: 0,
      completed: 0,
      favorites: 0,
    };
    activePoolBooks.forEach((b) => {
      const st = userBooks[b.isbn]?.status || 'unread';
      counts[st] = (counts[st] || 0) + 1;
      if (userBooks[b.isbn]?.favorite) {
        counts.favorites = (counts.favorites || 0) + 1;
      }
    });
    return counts;
  }, [activePoolBooks, userBooks]);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return activePoolBooks.filter((book) => {
      const rawQ = searchQuery.trim().toLowerCase();
      const cleanQ = rawQ.replace(/[-\s]/g, '');
      const isIsbnSearch =
        cleanQ.length >= 6 && (/^\d+X?$/i.test(cleanQ) || cleanQ.startsWith('978'));

      // If user is searching specifically by ISBN or Barcode number, prioritize matching
      if (isIsbnSearch) {
        const rawIsbn = (book.isbn || '').toLowerCase();
        const cleanIsbn = rawIsbn.replace(/[-\s]/g, '');
        return rawIsbn.includes(rawQ) || cleanIsbn.includes(cleanQ);
      }

      // 0. Media Type Filter (All / Text / Audio)
      if (selectedMediaType !== 'all') {
        const bookType = book.mediaType || 'text';
        if (bookType !== selectedMediaType) {
          return false;
        }
      }

      // 1. Level Filter (1 to 12)
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
        const rawQ = searchQuery.trim().toLowerCase();
        const cleanQ = rawQ.replace(/[-\s]/g, '');

        const titleMatch = book.title.toLowerCase().includes(rawQ);
        const introMatch = book.introduce.toLowerCase().includes(rawQ);
        const authorMatch = book.author?.toLowerCase().includes(rawQ) || false;
        const publisherMatch = book.publisher?.toLowerCase().includes(rawQ) || false;
        const bookNoMatch = book.bookNo?.toLowerCase().includes(rawQ) || false;
        const yearMatch = book.year?.toLowerCase().includes(rawQ) || false;
        const colorMatch = book.colorDot.toLowerCase().includes(rawQ);
        const tagsMatch = book.tags?.some((t) => t.toLowerCase().includes(rawQ)) || false;

        // ISBN match (supporting exact or partial ISBN with/without hyphens)
        const rawIsbn = (book.isbn || '').toLowerCase();
        const cleanIsbn = rawIsbn.replace(/[-\s]/g, '');
        const isbnMatch =
          rawIsbn.includes(rawQ) ||
          cleanIsbn.includes(cleanQ) ||
          (cleanQ.length >= 3 && cleanIsbn.includes(cleanQ));

        // Zhuyin match
        const zhuyinMatch = book.titleZhuyin.some((z) => z.zhuyin?.includes(rawQ));

        if (
          !titleMatch &&
          !introMatch &&
          !authorMatch &&
          !publisherMatch &&
          !bookNoMatch &&
          !yearMatch &&
          !colorMatch &&
          !tagsMatch &&
          !zhuyinMatch &&
          !isbnMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    activePoolBooks,
    selectedMediaType,
    selectedLevel,
    selectedLibrary,
    selectedStatus,
    searchQuery,
    userBooks,
  ]);

  const completedTotal = statusCounts.completed || 0;

  return (
    <div className="min-h-screen bg-amber-50/50 text-slate-800 pb-16 font-sans">
      {/* Top Banner Notice */}
      <div className="bg-amber-400 px-4 py-2 text-center text-xs sm:text-sm font-black text-slate-950 flex items-center justify-center gap-2 border-b border-amber-500/40">
        <span>🎒 台灣小學一年級・7歲注音電子書庫</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline font-bold text-amber-950">
          結合高雄喜閱網分級推薦書單 (第1~12級) 📖 線上即時借閱
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
          totalBooksCount={activePoolBooks.length}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
        />

        {/* Level, Booklist Source, Library and Read Status Filter Bar */}
        <LevelFilterBar
          selectedSources={selectedSources}
          selectedMediaType={selectedMediaType}
          selectedLevel={selectedLevel}
          selectedLibrary={selectedLibrary}
          selectedStatus={selectedStatus}
          sourceCounts={sourceCounts}
          mediaCounts={mediaCounts}
          levelCounts={levelCounts}
          libraryCounts={libraryCounts}
          statusCounts={statusCounts}
          onToggleSource={handleToggleSource}
          onSelectMediaType={setSelectedMediaType}
          onSelectLevel={setSelectedLevel}
          onSelectLibrary={setSelectedLibrary}
          onSelectStatus={setSelectedStatus}
        />

        {/* Active Level Description Banner if specific level selected */}
        {selectedLevel !== 'all' && LEVEL_INFO[selectedLevel] && (
          <div
            className={`p-4 rounded-2xl mb-6 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${LEVEL_INFO[selectedLevel].bgColor} ${LEVEL_INFO[selectedLevel].borderColor} ${LEVEL_INFO[selectedLevel].textColor}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full ${
                  LEVEL_INFO[selectedLevel].dotColor
                } inline-block flex-shrink-0`}
              />
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  {LEVEL_INFO[selectedLevel].name}：{LEVEL_INFO[selectedLevel].description}
                </h3>
                <p className="text-xs opacity-90 mt-0.5 font-medium">
                  🎯 適讀年齡：{LEVEL_INFO[selectedLevel].ageRange}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white text-slate-900 self-start sm:self-auto shadow-sm hover:bg-slate-100 transition-colors"
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

            {/* Booklist Source Indicator Pill */}
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full text-xs font-bold">
              {selectedSources.length === 2
                ? '🏫 高雄喜閱網 + 📚 我的書單'
                : selectedSources.includes('kh_reading')
                ? '🏫 高雄喜閱網'
                : '📚 我的書單'}
            </span>

            {selectedMediaType !== 'all' && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedMediaType === 'audio'
                    ? 'bg-purple-200 text-purple-950 border border-purple-300'
                    : 'bg-blue-200 text-blue-950 border border-blue-300'
                }`}
              >
                {selectedMediaType === 'audio' ? '🎧 有聲童書' : '📖 電子童書'}
              </span>
            )}
            {selectedLevel !== 'all' && LEVEL_INFO[selectedLevel] && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${LEVEL_INFO[selectedLevel].dotColor}`} />
                <span>{LEVEL_INFO[selectedLevel].name}</span>
              </span>
            )}
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
          <div
            key={globalRefreshKey}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredBooks.map((book) => {
              const bookState = userBooks[book.isbn] || {
                status: 'unread',
                favorite: false,
                rating: 0,
              };

              return (
                <BookCard
                  key={book.id || `${book.isbn}-${book.mediaType || 'text'}`}
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
              可以嘗試更換搜尋關鍵字，或是勾選喜閱網/我的書單來源。
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSources(['kh_reading']);
                setSelectedMediaType('all');
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
                高雄喜閱網與電子書借閱小撇步
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                點擊書本封面或借閱按鈕，可直接前往高雄市立圖書館、HyRead 與國資圖借閱全彩繪本！
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
        books={activePoolBooks}
        userBooks={userBooks}
        onResetAllRatings={() => {
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

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={(scannedBarcode) => {
          // Set search query to scanned barcode or ISBN
          setSearchQuery(scannedBarcode);
          // Reset other filters so the book is not filtered out
          setSelectedMediaType('all');
          setSelectedLevel('all');
          setSelectedLibrary('all');
          setSelectedStatus('all');
          // Find matching book across all books
          const found = ALL_BOOKS_DATA.find(
            (b) =>
              b.isbn === scannedBarcode ||
              b.isbn.replace(/[-\s]/g, '') === scannedBarcode.replace(/[-\s]/g, '')
          );
          if (found) {
            // Auto-enable its source if not enabled
            if (found.source && !selectedSources.includes(found.source)) {
              setSelectedSources((prev) => [...prev, found.source as BookListSource]);
            }
            setActiveBookModal(found);
          }
        }}
      />
    </div>
  );
}
