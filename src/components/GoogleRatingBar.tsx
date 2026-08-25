import React from 'react';
import { Star, ThumbsUp, ShieldCheck } from 'lucide-react';
import { BookRatingStats } from '../data/bookRatings';

interface GoogleRatingBarProps {
  stats: BookRatingStats;
  compact?: boolean;
  showBadge?: boolean;
  onReviewsClick?: (e: React.MouseEvent) => void;
}

export const GoogleRatingBar: React.FC<GoogleRatingBarProps> = ({
  stats,
  compact = false,
  showBadge = true,
  onReviewsClick,
}) => {
  const { score, reviewCount, libraryCategory, recommendRate } = stats;

  // Render 5 Google Maps styled stars with precise fractional fill
  const renderGoogleStars = () => {
    return (
      <div className="inline-flex items-center gap-0.5 text-amber-500 select-none">
        {[1, 2, 3, 4, 5].map((starIdx) => {
          const fillLevel = Math.max(0, Math.min(1, score - (starIdx - 1)));
          return (
            <span key={starIdx} className="relative inline-block w-3.5 h-3.5 sm:w-4 sm:h-4">
              {/* Background empty star */}
              <Star className="w-full h-full text-slate-200 fill-slate-200" strokeWidth={1} />
              {/* Foreground filled star with clip width */}
              {fillLevel > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillLevel * 100}%` }}
                >
                  <Star className="w-full h-full text-amber-500 fill-amber-400" strokeWidth={1} />
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  if (compact) {
    return (
      <div
        onClick={onReviewsClick}
        className={`inline-flex items-center gap-1.5 flex-wrap text-xs text-slate-700 py-1 ${
          onReviewsClick ? 'cursor-pointer hover:opacity-90 group' : ''
        }`}
        title={`Google 地圖評價統計：${score} 星 (${reviewCount.toLocaleString()} 則借閱評分)`}
      >
        {/* Numerical rating in Google bold style */}
        <span className="font-black text-slate-900 text-sm tracking-tight">{score.toFixed(1)}</span>

        {/* 5 Stars */}
        {renderGoogleStars()}

        {/* Total review count in parenthesis */}
        <span className="text-slate-500 text-xs font-normal underline-offset-2 group-hover:underline">
          ({reviewCount.toLocaleString()})
        </span>

        {showBadge && (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-600 truncate max-w-[150px]">
              {libraryCategory}
            </span>
          </>
        )}
      </div>
    );
  }

  // Expanded Google Maps Place Header Rating Bar
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-1.5 text-xs sm:text-sm text-slate-700">
      {/* Numerical score badge */}
      <div className="flex items-center gap-1.5">
        <span className="font-black text-slate-950 text-base sm:text-lg">{score.toFixed(1)}</span>
        {renderGoogleStars()}
      </div>

      {/* Review Count Link */}
      <button
        type="button"
        onClick={onReviewsClick}
        className="text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2 flex items-center gap-1"
      >
        <span>{reviewCount.toLocaleString()} 則評價</span>
      </button>

      <span className="text-slate-300">•</span>

      {/* Recommendation Rate Chip */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
        <ThumbsUp className="w-3 h-3 text-emerald-600" />
        <span>{recommendRate}% 推薦</span>
      </span>

      {/* Category / Collection Tag */}
      <span className="text-slate-500 text-xs hidden sm:inline-flex items-center gap-1">
        <span>•</span>
        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
        <span>{libraryCategory}</span>
      </span>
    </div>
  );
};
