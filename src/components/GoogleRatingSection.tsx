import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, Plus, Check, Sparkles, User, Award, RotateCcw } from 'lucide-react';
import { BookRatingStats, saveUserBookReview, likeUserReview, resetUserBookRating } from '../data/bookRatings';

interface GoogleRatingSectionProps {
  stats: BookRatingStats;
  isbn: string;
  bookTitle: string;
  userRating: number;
  onUpdateRating: (isbn: string, rating: number) => void;
  onRefreshStats?: () => void;
}

export const GoogleRatingSection: React.FC<GoogleRatingSectionProps> = ({
  stats,
  isbn,
  bookTitle,
  userRating,
  onUpdateRating,
  onRefreshStats,
}) => {
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [selectedStar, setSelectedStar] = useState<number>(userRating || 5);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  const [isResetting, setIsResetting] = useState(false);

  const handleResetRating = async () => {
    setIsResetting(true);
    await resetUserBookRating(isbn, bookTitle);
    onUpdateRating(isbn, 0);
    if (onRefreshStats) onRefreshStats();
    setTimeout(() => setIsResetting(false), 500);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    onUpdateRating(isbn, selectedStar);
    saveUserBookReview(isbn, {
      author: authorName.trim() || '愛讀小書蟲',
      rating: selectedStar,
      content: reviewText.trim(),
    });

    setSubmittedSuccess(true);
    if (onRefreshStats) onRefreshStats();
    setTimeout(() => {
      setShowReviewInput(false);
      setReviewText('');
      setSubmittedSuccess(false);
    }, 1500);
  };

  const toggleLike = (reviewId: string) => {
    setLikedReviews((prev) => {
      const isNowLiked = !prev[reviewId];
      if (isNowLiked) {
        likeUserReview(isbn, reviewId);
      }
      return {
        ...prev,
        [reviewId]: isNowLiked,
      };
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Google Maps Style Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            ★
          </div>
          <h4 className="text-sm font-black text-slate-800 tracking-tight">
            Google 地圖風格 · 讀者評分與借閱大數據
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline-block">
            全台讀者實名真實借閱統計
          </span>
          <button
            type="button"
            onClick={handleResetRating}
            disabled={isResetting}
            title="重設此書為出廠真實借閱基準評分"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 px-2 py-0.5 rounded-lg border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer active:scale-95"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin text-amber-600' : ''}`} />
            <span>{isResetting ? '重設中...' : '重設評分'}</span>
          </button>
        </div>
      </div>

      {/* Main Google Maps Rating Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
        {/* Left: Overall Big Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-amber-50/50 rounded-2xl border border-amber-100 text-center">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">
            {stats.score.toFixed(1)}
          </div>
          {/* 5 Big Stars */}
          <div className="flex items-center gap-1 my-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((starIdx) => {
              const fill = Math.max(0, Math.min(1, stats.score - (starIdx - 1)));
              return (
                <span key={starIdx} className="relative inline-block w-4 h-4 sm:w-5 sm:h-5">
                  <Star className="w-full h-full text-slate-200 fill-slate-200" strokeWidth={1} />
                  {fill > 0 && (
                    <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                      <Star className="w-full h-full text-amber-500 fill-amber-400" strokeWidth={1} />
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          <div className="text-xs font-semibold text-slate-600">
            共 {stats.reviewCount.toLocaleString()} 則借閱評分
          </div>
          <div className="text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md mt-2">
            🏆 {stats.libraryCategory}
          </div>
        </div>

        {/* Right: Google Maps 5-Star Breakdown Bars */}
        <div className="md:col-span-8 space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((stars) => {
            const pct = stats.distribution[stars];
            return (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right font-bold text-slate-700">{stars}</span>
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                {/* Horizontal Progress Bar */}
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono text-[11px] text-slate-500 font-semibold">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Maps "People often mention" attribute chips */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-500 mb-2">💡 讀者與家長最常提及的特色：</div>
        <div className="flex flex-wrap gap-1.5">
          {stats.highlights.map((highlight, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-full border border-slate-200/80 transition-colors"
            >
              <span>👍</span>
              <span>{highlight}</span>
            </span>
          ))}
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
            <Award className="w-3 h-3 text-emerald-600" />
            <span>喜閱網認證童書</span>
          </span>
        </div>
      </div>

      {/* Write a Review Button / Form */}
      <div className="pt-2 border-t border-slate-100">
        {!showReviewInput ? (
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">
                讀完這本書了嗎？我也要留下評分與心得！
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewInput(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>撰寫評論與評分</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleRatingSubmit} className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">🌟 給《{bookTitle}》打星評分：</span>
              {/* Star selector */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedStar(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= selectedStar ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="你的名字（例如：小翔、三年級陳同學）"
                className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-amber-500"
              />
              <input
                type="text"
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="寫下你的閱讀心得（例如：故事好有趣，注音很清楚！）"
                className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowReviewInput(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submittedSuccess}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all active:scale-95"
              >
                {submittedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-900" />
                    <span>已發表並即時計算！</span>
                  </>
                ) : (
                  <span>發布真實評分</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Google Maps Style Recent Community Reviews */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>精選真實讀者評論與借閱回饋</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {stats.recentReviews.length > 0 ? '依關聯性排序' : '尚無評論'}
          </span>
        </div>

        {stats.recentReviews.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-50/80 rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-1">
            <MessageSquare className="w-6 h-6 mx-auto text-slate-300 mb-1" />
            <div className="text-xs font-bold text-slate-600">目前尚無讀者評分與評論紀錄</div>
            <div className="text-[11px] text-slate-400">
              讀完這本書後，歡迎在上方點擊「撰寫評論與評分」留下第一則心得！
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {stats.recentReviews.map((rev) => {
              const isLiked = likedReviews[rev.id];
              return (
                <div
                  key={rev.id}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px]">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">{rev.author}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5 px-1.5 py-0.2 bg-white rounded border border-slate-200">
                          {rev.role}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>

                  {/* Review Content */}
                  <p className="text-slate-700 leading-relaxed">{rev.content}</p>

                  {/* Thumbs up count */}
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <button
                      type="button"
                      onClick={() => toggleLike(rev.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                        isLiked ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-200/60'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>有用 ({rev.likes + (isLiked ? 1 : 0)})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
