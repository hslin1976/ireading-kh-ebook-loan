import React, { useState, useMemo } from 'react';
import { Book, ReadStatus, ZhuyinDisplayMode, TextSize } from '../types';
import { LEVEL_INFO } from '../data/booksData';
import { ZhuyinText } from './ZhuyinText';
import { GoogleRatingBar } from './GoogleRatingBar';
import { GoogleRatingSection } from './GoogleRatingSection';
import { IreadingDeepParseCard } from './IreadingDeepParseCard';
import { getLiveBookRatingStats } from '../data/bookRatings';
import { speakTaiwanMandarin, stopSpeaking } from '../utils/speechUtils';
import {
  getIreadingGoogleSearchUrl,
  getHyreadSearchUrl,
  getNlpiSearchUrl,
  getCloudSearchUrl,
  getKsmlWebpacUrl,
  getGeneralIreadingGoogleSearchUrl,
  getOfficialIreadingDirectBookUrl,
  getOfficialIreadingPortalUrl,
} from '../utils/bookLinks';
import { getOfficialIreadingDirectUrl } from '../data/ireadingOfficialLinks';
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
  Cloud,
  Search,
  School,
  Building2,
  Zap,
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

  const officialLinkObj = useMemo(() => {
    return getOfficialIreadingDirectUrl(book.title);
  }, [book.title]);

  const coverImageUrl = useMemo(() => {
    return officialLinkObj?.coverImgUrl || book.bookImgUrl;
  }, [officialLinkObj, book.bookImgUrl]);

  const [modalImgSrc, setModalImgSrc] = useState(coverImageUrl);
  const [modalImgError, setModalImgError] = useState(false);

  React.useEffect(() => {
    setModalImgSrc(coverImageUrl);
    setModalImgError(false);
  }, [coverImageUrl]);

  const handleOfficialDirectClick = () => {
    const directUrl = officialLinkObj?.directUrl || book.ireadingUrl || getOfficialIreadingDirectBookUrl(book.title);
    window.open(directUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOfficialPortalClick = () => {
    window.open(getOfficialIreadingPortalUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleOfficialCoverOriginalClick = () => {
    const originalUrl = officialLinkObj?.coverImgUrl || coverImageUrl;
    if (originalUrl) {
      window.open(originalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCoverClick = () => {
    const url = officialLinkObj?.coverImgUrl || officialLinkObj?.directUrl || book.hyreadUrl || book.nlpiUrl || book.cloudUrl || getOfficialIreadingDirectBookUrl(book.title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleIreadingGoogleClick = () => {
    const url = getIreadingGoogleSearchUrl(book.title, book.bookNo);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleGeneralIreadingSearchClick = () => {
    const url = getGeneralIreadingGoogleSearchUrl(book.title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWebpacClick = () => {
    const url = book.webpacUrl || getKsmlWebpacUrl(book.title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNlpiLoanClick = () => {
    const url = book.nlpiUrl || getNlpiSearchUrl(book.title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleHyreadLoanClick = () => {
    const url = book.hyreadUrl || getHyreadSearchUrl(book.title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCloudLoanClick = () => {
    const url = book.cloudUrl || getCloudSearchUrl(book.title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        id="book-detail-modal"
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-b border-amber-300">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-4 h-4 rounded-full ${levelInfo.dotColor}`} />
            <span className="font-extrabold text-slate-800 text-sm sm:text-base">
              分級圖書館・{levelInfo.name} ({book.colorDot})
            </span>
            {book.mediaType === 'audio' ? (
              <span className="text-xs font-black text-purple-900 bg-purple-100 border border-purple-300 px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                <span>🎧 有聲童書</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-blue-900 bg-blue-100/90 border border-blue-200 px-2 py-0.5 rounded-full">
                📖 電子童書
              </span>
            )}
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
                title="點擊前往喜閱網或電子書借閱頁面"
              >
                {!modalImgError ? (
                  <img
                    src={modalImgSrc}
                    alt={book.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    onError={() => {
                      if (modalImgSrc !== book.bookImgUrl && book.bookImgUrl) {
                        setModalImgSrc(book.bookImgUrl);
                      } else {
                        setModalImgError(true);
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-slate-400">
                    <BookOpen className="w-16 h-16 text-amber-300 stroke-1 mb-2" />
                    <span className="text-xs text-slate-500 font-bold">《{book.title}》</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-3 text-center">
                  <ExternalLink className="w-8 h-8 mb-2" />
                  <span className="font-bold text-sm">點擊開啟閱讀 / 官方專頁</span>
                </div>
              </div>

              {/* Official HD Cover Quick Button */}
              {officialLinkObj?.coverImgUrl && (
                <button
                  type="button"
                  id="modal-view-official-cover-hd-btn"
                  onClick={handleOfficialCoverOriginalClick}
                  className="mt-2.5 w-full max-w-[240px] py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-900 font-bold rounded-xl border border-emerald-300 shadow-2xs flex items-center justify-between text-xs transition-all"
                  title="點擊以新視窗開啟喜閱網官方高畫質原始封面圖片"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>查看官方高畫質封面原圖</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              )}

              {/* Vertically Aligned Big Tablet Loan Buttons */}
              {(book.nlpiUrl || book.hyreadUrl || book.cloudUrl) && (
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

                  {/* 3. Taiwan Cloud Library Button (Only if available) */}
                  {book.cloudUrl && (
                    <button
                      type="button"
                      id="modal-loan-cloud-btn"
                      onClick={handleCloudLoanClick}
                      className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white font-black rounded-2xl shadow-md flex items-center justify-between text-sm sm:text-base transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-indigo-200" />
                        <span>台灣雲端書庫@高雄</span>
                      </span>
                      <ExternalLink className="w-4 h-4 text-indigo-200" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-col items-center gap-0.5 mt-2 text-[11px] text-slate-500 text-center">
                {book.nlpiUrl && <span>🏛️ 國立公共資訊圖書館 (NLPI)</span>}
                {book.hyreadUrl && <span>📚 高雄市立圖書館 / 喜閱網 (HyRead)</span>}
                {book.cloudUrl && <span>☁️ 台灣雲端書庫@高雄市</span>}
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
                  {book.source && (
                    <span className={`px-2.5 py-1 rounded-lg font-bold border ${
                      book.source === 'kh_reading'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {book.source === 'kh_reading' ? '🏫 高雄喜閱網書單' : '📚 我的精選書單'}
                    </span>
                  )}
                  {book.bookNo && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-bold border border-emerald-300 text-emerald-800">
                      🔢 書號：{book.bookNo}
                    </span>
                  )}
                  {book.year && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      📅 推薦年度：{book.year} 年
                    </span>
                  )}
                  {book.author && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      ✍️ 作者：{book.author}
                    </span>
                  )}
                  {book.illustrator && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      🎨 繪者：{book.illustrator}
                    </span>
                  )}
                  {book.translator && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      🌐 譯者：{book.translator}
                    </span>
                  )}
                  {book.publisher && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      🏢 出版社：{book.publisher}
                    </span>
                  )}
                  {book.publishDate && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      📆 出版日期：{book.publishDate}
                    </span>
                  )}
                  {book.recommendAge && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      👶 適讀年齡：{book.recommendAge}
                    </span>
                  )}
                  {book.coins !== undefined && (
                    <span className="bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg font-bold border border-amber-300 flex items-center gap-1">
                      🪙 喜閱幣：+{book.coins} 幣
                    </span>
                  )}
                  {book.wordCount !== undefined && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      📝 總字數：{book.wordCount.toLocaleString()} 字
                    </span>
                  )}
                  {book.pageCount !== undefined && (
                    <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                      📄 頁數：{book.pageCount} 頁
                    </span>
                  )}
                  <span className="bg-white px-2.5 py-1 rounded-lg font-medium border border-amber-200 font-mono">
                    🏷️ ISBN：{book.isbn}
                  </span>
                </div>

                {/* Official Thinking Question if available */}
                {book.question && (
                  <div className="mt-3 p-3 bg-amber-100/60 rounded-xl border border-amber-300/80 text-xs text-amber-950">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>喜閱網官方引導提問 / 評量思考方向</span>
                    </div>
                    <p className="leading-relaxed font-medium">{book.question}</p>
                  </div>
                )}
              </div>

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

              {/* Official Kaohsiung iReading Deep Search & HTML DOM Parser Integration Card */}
              <IreadingDeepParseCard book={book} />

              {/* Physical Branch Library & Official Exact Links Bar */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <School className="w-4 h-4 text-emerald-600" />
                    <span>高雄市立圖書館分館實體藏書與喜閱網官方直達</span>
                  </span>
                  {book.bookNo && (
                    <span className="text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      書號 #{book.bookNo}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* 1. Official Exact Direct Page on ireadinggames.kh.edu.tw */}
                  <button
                    type="button"
                    id="modal-official-direct-book-btn"
                    onClick={handleOfficialDirectClick}
                    className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold rounded-xl shadow-sm flex items-center justify-between text-xs transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>喜閱網官方直達書頁 (ireading)</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/90" />
                  </button>

                  {/* 2. Kaohsiung Public Library WebPAC Physical Branch Locator */}
                  <button
                    type="button"
                    id="modal-ksml-webpac-btn"
                    onClick={handleWebpacClick}
                    className="p-2.5 bg-white hover:bg-sky-50 active:scale-95 text-sky-950 font-bold rounded-xl border border-sky-300 shadow-2xs flex items-center justify-between text-xs transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-sky-600" />
                      <span>高市圖實體館藏 (各分館)</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  </button>

                  {/* 3. Official iReading Booklist & Exam Portal */}
                  <button
                    type="button"
                    id="modal-official-portal-btn"
                    onClick={handleOfficialPortalClick}
                    className="p-2 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-emerald-600" />
                      <span>喜閱網官方題庫書單系統</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* 4. Google Fallback Search */}
                  <button
                    type="button"
                    id="modal-official-ireading-google-btn"
                    onClick={handleIreadingGoogleClick}
                    className="p-2 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                      <span>Google 喜閱網全網備用檢索</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

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

              {/* Google Maps Style Detailed Ratings & Real Breakdown (At the Bottom) */}
              <GoogleRatingSection
                stats={ratingStats}
                isbn={book.isbn}
                bookTitle={book.title}
                userRating={userRating}
                onUpdateRating={onUpdateRating}
                onRefreshStats={() => setRefreshKey((k) => k + 1)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
