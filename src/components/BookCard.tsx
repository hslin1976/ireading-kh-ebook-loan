import React, { useState } from 'react';
import { Book, ReadStatus, ZhuyinDisplayMode, TextSize } from '../types';
import { LEVEL_INFO } from '../data/booksData';
import { ZhuyinText } from './ZhuyinText';
import { speakTaiwanMandarin } from '../utils/speechUtils';
import {
  BookOpen,
  Volume2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Bookmark,
  Heart,
  Star,
  Info,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookCardProps {
  book: Book;
  userStatus: ReadStatus;
  isFavorite: boolean;
  userRating: number;
  zhuyinMode: ZhuyinDisplayMode;
  textSize: TextSize;
  onUpdateStatus: (isbn: string, status: ReadStatus) => void;
  onToggleFavorite: (isbn: string) => void;
  onOpenDetail: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  userStatus,
  isFavorite,
  userRating,
  zhuyinMode,
  textSize,
  onUpdateStatus,
  onToggleFavorite,
  onOpenDetail,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const levelInfo = LEVEL_INFO[book.readLevel];

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(true);
    speakTaiwanMandarin(
      `${book.title}。適合${book.recommendAge || '小學一年級'}小朋友閱讀。`,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleStatusChange = (e: React.MouseEvent, status: ReadStatus) => {
    e.stopPropagation();
    onUpdateStatus(book.isbn, status);

    if (status === 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899'],
      });
      speakTaiwanMandarin('太棒了！恭喜你讀完這本書！');
    }
  };

  const handleNlpiLoanClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = book.nlpiUrl || book.bookMainUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleHyreadLoanClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = book.hyreadUrl || `https://ksml.hyread.com.tw/Template/RSH/search.jsp?search_field=ISBN&search_input=${book.isbn}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id={`book-card-${book.isbn}`}
      onClick={() => onOpenDetail(book)}
      className="group relative flex flex-col bg-white rounded-2xl border-2 border-amber-100/80 shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-300 overflow-hidden cursor-pointer touch-manipulation"
    >
      {/* Top Banner: Level Badge & Color Dot */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50/70 border-b border-amber-100">
        <div className="flex items-center gap-2">
          {/* Level Color Dot */}
          <span
            className={`w-4 h-4 rounded-full ${levelInfo.dotColor} inline-block`}
            title={`${levelInfo.name} (${book.colorDot})`}
          />
          <span className="text-xs font-bold text-slate-700 bg-white/90 px-2 py-0.5 rounded-full border border-amber-200">
            第 {book.readLevel} 級・{book.colorDot}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          id={`fav-btn-${book.isbn}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(book.isbn);
          }}
          className={`p-1.5 rounded-full transition-transform active:scale-90 ${
            isFavorite
              ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
              : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
          }`}
          title={isFavorite ? '已在想讀清單' : '加到想讀清單'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Book Cover Image Area */}
      <div className="relative aspect-[3/4] w-full bg-slate-100 flex items-center justify-center overflow-hidden group-hover:bg-slate-50 transition-colors">
        {!imgError ? (
          <img
            src={book.bookImgUrl}
            alt={book.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mb-2 text-amber-300 stroke-1" />
            <span className="text-xs text-slate-500 font-medium">《{book.title}》</span>
          </div>
        )}

        {/* Quick Loan Hover/Touch Overlay */}
        {(book.nlpiUrl || book.hyreadUrl) && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-1.5">
            {book.nlpiUrl && (
              <button
                type="button"
                onClick={handleNlpiLoanClick}
                className="w-full bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold py-1.5 px-2.5 rounded-lg shadow flex items-center justify-center gap-1.5 text-xs transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>國資圖借閱</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            {book.hyreadUrl && (
              <button
                type="button"
                onClick={handleHyreadLoanClick}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-1.5 px-2.5 rounded-lg shadow flex items-center justify-center gap-1.5 text-xs transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>HyRead 借閱</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Status Badge in Corner if read/reading */}
        {userStatus === 'completed' && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>已讀完</span>
          </div>
        )}
        {userStatus === 'reading' && (
          <div className="absolute top-2 left-2 bg-sky-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>閱讀中</span>
          </div>
        )}
      </div>

      {/* Book Content Info Area */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/20">
        <div>
          {/* Audio Pronounce Button + Title with Zhuyin */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-h-[3rem]">
              <ZhuyinText
                zhuyinChars={book.titleZhuyin}
                mode={zhuyinMode}
                size={textSize}
                className="leading-loose"
              />
            </div>
            <button
              type="button"
              id={`speak-btn-${book.isbn}`}
              onClick={handleSpeak}
              className={`p-2 rounded-xl border transition-all active:scale-90 flex-shrink-0 ${
                isSpeaking
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border-amber-200'
              }`}
              title="按我聽發音（語音朗讀）"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Author and Age Tag */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-2.5">
            {book.author && (
              <span className="font-medium text-slate-700 truncate max-w-[140px]">
                ✍️ {book.author}
              </span>
            )}
            {book.recommendAge && (
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-medium">
                🎯 {book.recommendAge}
              </span>
            )}
          </div>

          {/* Introduction snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {book.introduce}
          </p>
        </div>

        {/* Action Controls: Status Switcher & Vertically Aligned Loan Buttons */}
        <div className="pt-2 border-t border-amber-100/80 space-y-2">
          {/* Read Status Switcher Pills */}
          <div className="flex items-center justify-between bg-slate-100/90 p-1 rounded-xl gap-1">
            <button
              type="button"
              id={`status-unread-${book.isbn}`}
              onClick={(e) => handleStatusChange(e, 'unread')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                userStatus === 'unread'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>未讀</span>
            </button>

            <button
              type="button"
              id={`status-reading-${book.isbn}`}
              onClick={(e) => handleStatusChange(e, 'reading')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                userStatus === 'reading'
                  ? 'bg-sky-500 text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-sky-600'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>閱讀中</span>
            </button>

            <button
              type="button"
              id={`status-completed-${book.isbn}`}
              onClick={(e) => handleStatusChange(e, 'completed')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                userStatus === 'completed'
                  ? 'bg-emerald-500 text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>已讀完</span>
            </button>
          </div>

          {/* Vertically Aligned Loan Buttons */}
          {(book.nlpiUrl || book.hyreadUrl) && (
            <div className="flex flex-col gap-1.5 pt-1">
              {/* 1. NLPI Loan Button (Only if available) */}
              {book.nlpiUrl && (
                <button
                  type="button"
                  id={`loan-nlpi-btn-${book.isbn}`}
                  onClick={handleNlpiLoanClick}
                  className="w-full py-2 px-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-[0.98] text-slate-950 font-bold rounded-xl shadow-sm border border-amber-400/80 flex items-center justify-between text-xs transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-950" />
                    <span>國資圖 (NLPI) 借閱</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-amber-900" />
                </button>
              )}

              {/* 2. HyRead Loan Button (Only if available) */}
              {book.hyreadUrl && (
                <button
                  type="button"
                  id={`loan-hyread-btn-${book.isbn}`}
                  onClick={handleHyreadLoanClick}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-sm border border-emerald-600 flex items-center justify-between text-xs transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-100" />
                    <span>HyRead (高市圖) 借閱</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-emerald-100" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
