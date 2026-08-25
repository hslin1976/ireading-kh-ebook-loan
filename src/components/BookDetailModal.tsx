import React, { useState, useMemo } from 'react';
import { Book, ReadStatus, ZhuyinDisplayMode, TextSize } from '../types';
import { LEVEL_INFO } from '../data/booksData';
import { ZhuyinText } from './ZhuyinText';
import { GoogleRatingBar } from './GoogleRatingBar';
import { GoogleRatingSection } from './GoogleRatingSection';
import { getLiveBookRatingStats } from '../data/bookRatings';
import { speakTaiwanMandarin, stopSpeaking } from '../utils/speechUtils';
import {
  X,
  BookOpen,
  Volume2,
  VolumeX,
  ExternalLink,
  CheckCircle2,
  Clock,
  Bookmark,
  Heart,
  Star,
  Sparkles,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookDetailModalProps {
  book: Book | null;
  userStatus: ReadStatus;
  isFavorite: boolean;
  userRating: number;
  userNotes: string;
  zhuyinMode: ZhuyinDisplayMode;
  textSize: TextSize;
  onClose: () => void;
  onUpdateStatus: (isbn: string, status: ReadStatus) => void;
  onToggleFavorite: (isbn: string) => void;
  onUpdateRating: (isbn: string, rating: number) => void;
  onUpdateNotes: (isbn: string, notes: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  userStatus,
  isFavorite,
  userRating,
  userNotes,
  zhuyinMode,
  textSize,
  onClose,
  onUpdateStatus,
  onToggleFavorite,
  onUpdateRating,
  onUpdateNotes,
}) => {
  const [isSpeakingIntro, setIsSpeakingIntro] = useState(false);
  const [localNotes, setLocalNotes] = useState(userNotes || '');
  const [refreshKey, setRefreshKey] = useState(0);

  if (!book) return null;

  const levelInfo = LEVEL_INFO[book.readLevel];

  const ratingStats = useMemo(() => {
    return getLiveBookRatingStats(book.isbn, book.title, book.readLevel, userRating);
  }, [book.isbn, book.title, book.readLevel, userRating, refreshKey]);

  const handleSpeakTitleAndIntro = () => {
    if (isSpeakingIntro) {
      stopSpeaking();
      setIsSpeakingIntro(false);
      return;
    }

    setIsSpeakingIntro(true);
    const speechText = `書名：${book.title}。${book.author ? `作者：${book.author}。` : ''}內容介紹：${book.introduce}`;
    speakTaiwanMandarin(
      speechText,
      () => setIsSpeakingIntro(true),
      () => setIsSpeakingIntro(false)
    );
  };

  const handleStatusChange = (status: ReadStatus) => {
    onUpdateStatus(book.isbn, status);
    if (status === 'completed') {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
      speakTaiwanMandarin('太棒了！你又讀完了一本書，獲得一顆小星星！');
    }
  };

  const handleCoverClick = () => {
    const url = book.nlpiUrl || book.hyreadUrl || book.bookMainUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNlpiLoanClick = () => {
    if (book.nlpiUrl) {
      window.open(book.nlpiUrl, '_blank', 'noopener,noreferrer');
    } else if (book.bookMainUrl) {
      window.open(book.bookMainUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleHyreadLoanClick = () => {
    if (book.hyreadUrl) {
      window.open(book.hyreadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        id="book-detail-modal"
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-b border-amber-300">
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full ${levelInfo.dotColor}`} />
            <span className="font-extrabold text-slate-800 text-sm sm:text-base">
              分級圖書館・{levelInfo.name} ({book.colorDot})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="modal-fav-btn"
              onClick={() => onToggleFavorite(book.isbn)}
              className={`p-2 rounded-full transition-transform active:scale-90 ${
                isFavorite
                  ? 'text-rose-500 bg-white shadow-sm'
                  : 'text-slate-500 hover:text-rose-500 bg-white/70'
              }`}
              title={isFavorite ? '已在想讀清單' : '加入想讀清單'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              type="button"
              id="modal-close-btn"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 shadow-sm transition-transform active:scale-90"
              title="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Main Book Presentation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Big Cover and Vertically Aligned Loan Buttons for Tablet */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div
                onClick={handleCoverClick}
                className="relative aspect-[3/4] w-full max-w-[240px] bg-slate-50 rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden flex items-center justify-center p-3 cursor-pointer group hover:scale-[1.02] transition-all"
                title="點擊前往電子書借閱頁面"
              >
                <img
                  src={book.bookImgUrl}
                  alt={book.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-3 text-center">
                  <ExternalLink className="w-8 h-8 mb-2" />
                  <span className="font-bold text-sm">點擊開啟借閱</span>
                </div>
              </div>

              {/* Vertically Aligned Big Tablet Loan Buttons */}
              {(book.nlpiUrl || book.hyreadUrl) && (
                <div className="mt-4 w-full max-w-[240px] flex flex-col gap-2.5">
                  {/* 1. NLPI Button (Only if available) */}
                  {book.nlpiUrl && (
                    <button
                      type="button"
                      id="modal-loan-nlpi-btn"
                      onClick={handleNlpiLoanClick}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 active:scale-95 text-slate-950 font-black rounded-2xl shadow-md flex items-center justify-between text-sm sm:text-base transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-950" />
                        <span>國資圖借閱</span>
                      </span>
                      <ExternalLink className="w-4 h-4 text-amber-900" />
                    </button>
                  )}

                  {/* 2. HyRead Button (Only if available) */}
                  {book.hyreadUrl && (
                    <button
                      type="button"
                      id="modal-loan-hyread-btn"
                      onClick={handleHyreadLoanClick}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-2xl shadow-md flex items-center justify-between text-sm sm:text-base transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-100" />
                        <span>HyRead (高市圖)</span>
                      </span>
                      <ExternalLink className="w-4 h-4 text-emerald-100" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-col items-center gap-0.5 mt-2 text-[11px] text-slate-500 text-center">
                {book.nlpiUrl && <span>🏛️ 國立公共資訊圖書館 (NLPI)</span>}
                {book.hyreadUrl && <span>📚 高雄市立圖書館 / 喜閱網 (HyRead)</span>}
              </div>
            </div>

            {/* Right: Book Details with Zhuyin & TTS */}
            <div className="md:col-span-7 space-y-4">
              {/* Title with full Zhuyin */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <ZhuyinText
                      zhuyinChars={book.titleZhuyin}
                      mode={zhuyinMode}
                      size="large"
                      className="leading-loose"
                    />
                  </div>
                  <button
                    type="button"
                    id="modal-speak-all-btn"
                    onClick={handleSpeakTitleAndIntro}
                    className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                      isSpeakingIntro
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-amber-400 hover:bg-amber-500 text-slate-900'
                    }`}
                  >
                    {isSpeakingIntro ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>停止朗讀</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>朗讀給我聽</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Google Maps Style Rating & Real Statistics Under Book Title */}
                <div className="mt-2 pt-2 border-t border-amber-200/60">
                  <GoogleRatingBar
                    stats={ratingStats}
                    compact={false}
                    showBadge={true}
                  />
                </div>

                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-2 text-xs text-slate-600 mt-2 pt-2 border-t border-amber-200/60">
                  {book.author && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      ✍️ 作者：{book.author}
                    </span>
                  )}
                  {book.recommendAge && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      👶 適讀年齡：{book.recommendAge}
                    </span>
                  )}
                  <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200 font-mono">
                    🏷️ ISBN：{book.isbn}
                  </span>
                </div>
              </div>

              {/* Google Maps Style Detailed Ratings & Real Breakdown */}
              <GoogleRatingSection
                stats={ratingStats}
                isbn={book.isbn}
                bookTitle={book.title}
                userRating={userRating}
                onUpdateRating={onUpdateRating}
                onRefreshStats={() => setRefreshKey((k) => k + 1)}
              />

              {/* Tags Cloud */}
              {book.tags && (
                <div className="flex flex-wrap gap-1.5">
                  {book.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-amber-100/70 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Introduction Text with Zhuyin Option */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>故事介紹與精彩內容</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleSpeakTitleAndIntro}
                    className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all shadow-sm ${
                      isSpeakingIntro
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {isSpeakingIntro ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>停止朗讀</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>朗讀故事介紹</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  <ZhuyinText
                    text={book.introduce}
                    mode={zhuyinMode}
                    size="normal"
                    className="leading-relaxed"
                  />
                </div>
              </div>

              {/* Reading Status Selector */}
              <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">📌 我的閱讀進度：</span>
                  {userStatus === 'completed' && (
                    <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      獲得閱讀徽章！
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('unread')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      userStatus === 'unread'
                        ? 'bg-slate-800 text-white border-slate-800 shadow'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>還沒看（未讀）</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('reading')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      userStatus === 'reading'
                        ? 'bg-sky-500 text-white border-sky-600 shadow'
                        : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>正在看（閱讀中）</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('completed')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      userStatus === 'completed'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>看完了（已讀完）</span>
                  </button>
                </div>

                {/* Kid Star Rating */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-600">🌟 我給這本書打分數：</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => onUpdateRating(book.isbn, star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= (userRating || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
