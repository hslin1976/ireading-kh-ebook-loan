// Google Maps style rating & statistics data model and calculation utilities
export interface BookRatingStats {
  isbn: string;
  score: number; // e.g. 4.9
  reviewCount: number; // e.g. 1280
  recommendRate: number; // e.g. 98%
  libraryCategory: string; // e.g. "高市圖熱門借閱 #1"
  badge: string; // e.g. "喜閱網推薦"
  distribution: {
    5: number; // percentage e.g. 88
    4: number; // percentage e.g. 9
    3: number; // percentage e.g. 2
    2: number; // percentage e.g. 1
    1: number; // percentage e.g. 0
  };
  highlights: string[];
  recentReviews: {
    id: string;
    author: string;
    role: '一年級小讀者' | '二年級小讀者' | '國小教師' | '親子伴讀家長' | '圖書館志工媽媽';
    rating: number;
    date: string;
    content: string;
    likes: number;
  }[];
}

// Client-side in-memory cache
const memoryRatingCache: Record<string, BookRatingStats> = {};

// Generate baseline rating starting at zero rating history
export function generateBaselineRating(isbn: string, title: string = '', level: number = 1): BookRatingStats {
  const libraryCategory = '喜閱網推薦童書';
  const badge = '喜閱網指定書';

  const highlights = [
    '全彩大字版',
    '注音清晰好讀',
    '適合自主閱讀',
  ];

  return {
    isbn,
    score: 0,
    reviewCount: 0,
    recommendRate: 0,
    libraryCategory,
    badge,
    distribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
    highlights,
    recentReviews: [],
  };
}

// Compute live rating blended with embedded backend & local cache (< 1ms read speed)
const USER_RATINGS_STORAGE_KEY = 'taiwan_kids_book_custom_reviews_v1';

export function getLiveBookRatingStats(
  isbn: string,
  title: string = '',
  level: number = 1,
  userRating: number = 0
): BookRatingStats {
  if (memoryRatingCache[isbn]) {
    const cached = memoryRatingCache[isbn];
    if (userRating > 0 && userRating !== cached.score && cached.reviewCount === 0) {
      const singleRatingStats: BookRatingStats = {
        ...cached,
        score: userRating,
        reviewCount: 1,
        recommendRate: userRating >= 4 ? 100 : 0,
        distribution: {
          5: userRating === 5 ? 100 : 0,
          4: userRating === 4 ? 100 : 0,
          3: userRating === 3 ? 100 : 0,
          2: userRating === 2 ? 100 : 0,
          1: userRating === 1 ? 100 : 0,
        },
      };
      memoryRatingCache[isbn] = singleRatingStats;
      return singleRatingStats;
    }
    return cached;
  }

  const base = generateBaselineRating(isbn, title, level);

  try {
    const raw = localStorage.getItem(USER_RATINGS_STORAGE_KEY);
    const customData = raw ? JSON.parse(raw) : {};
    const bookCustom = customData[isbn];

    const customReviews = bookCustom?.reviews || [];
    const storedRating = bookCustom?.rating || 0;
    const effectiveRating = userRating > 0 ? userRating : storedRating;

    // Collect all ratings
    const allRatingValues: number[] = customReviews.map((r: any) => r.rating);
    if (effectiveRating > 0 && (customReviews.length === 0 || !customReviews.some((r: any) => r.rating === effectiveRating))) {
      allRatingValues.push(effectiveRating);
    }

    if (allRatingValues.length > 0) {
      const totalRatingsCount = allRatingValues.length;
      const totalPoints = allRatingValues.reduce((sum, r) => sum + r, 0);
      const newScore = Math.min(5.0, Math.round((totalPoints / totalRatingsCount) * 10) / 10);

      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allRatingValues.forEach((val) => {
        const key = Math.min(5, Math.max(1, Math.round(val))) as 1 | 2 | 3 | 4 | 5;
        counts[key] += 1;
      });

      const dist = {
        5: Math.round((counts[5] / totalRatingsCount) * 100),
        4: Math.round((counts[4] / totalRatingsCount) * 100),
        3: Math.round((counts[3] / totalRatingsCount) * 100),
        2: Math.round((counts[2] / totalRatingsCount) * 100),
        1: Math.round((counts[1] / totalRatingsCount) * 100),
      };

      const highRatings = counts[4] + counts[5];
      const recommendRate = Math.round((highRatings / totalRatingsCount) * 100);

      const allReviews = [...(bookCustom?.reviews || [])];

      const blended: BookRatingStats = {
        ...base,
        score: newScore,
        reviewCount: totalRatingsCount,
        recommendRate,
        distribution: dist,
        recentReviews: allReviews,
      };
      memoryRatingCache[isbn] = blended;
      return blended;
    }
  } catch (e) {
    console.warn('Rating stats calculation notice', e);
  }

  memoryRatingCache[isbn] = base;
  return base;
}

// Save user review to both local storage and the Option C embedded Node.js backend
export async function saveUserBookReview(
  isbn: string,
  review: { author: string; rating: number; content: string; title?: string }
) {
  const newRev = {
    id: `custom-${Date.now()}`,
    author: review.author || '熱心愛讀小書蟲',
    role: '一年級小讀者' as const,
    rating: review.rating,
    date: '剛剛',
    content: review.content,
    likes: 1,
  };

  // 1. Instant local optimistic update
  try {
    const raw = localStorage.getItem(USER_RATINGS_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    if (!data[isbn]) {
      data[isbn] = { reviews: [] };
    }
    data[isbn].reviews = [newRev, ...(data[isbn].reviews || [])];
    data[isbn].rating = review.rating;
    localStorage.setItem(USER_RATINGS_STORAGE_KEY, JSON.stringify(data));

    if (memoryRatingCache[isbn]) {
      const current = memoryRatingCache[isbn];
      memoryRatingCache[isbn] = {
        ...current,
        reviewCount: current.reviewCount + 1,
        recentReviews: [newRev, ...current.recentReviews],
      };
    }
  } catch (e) {
    console.error('Failed to save local user review', e);
  }

  // 2. Persist to Option C embedded backend via REST API
  try {
    const res = await fetch(`/api/ratings/${isbn}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: review.author,
        rating: review.rating,
        content: review.content,
        title: review.title,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.record) {
        memoryRatingCache[isbn] = {
          isbn,
          score: data.record.score,
          reviewCount: data.record.reviewCount,
          recommendRate: data.record.recommendRate,
          libraryCategory: data.record.libraryCategory,
          badge: data.record.badge,
          distribution: data.record.distribution,
          highlights: data.record.highlights,
          recentReviews: data.record.reviews || [],
        };
      }
    }
  } catch (err) {
    console.warn('Backend sync notice (offline or background syncing):', err);
  }
}

// Like review in Option C backend
export async function likeUserReview(isbn: string, reviewId: string) {
  try {
    await fetch(`/api/ratings/${isbn}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId }),
    });
  } catch (err) {
    console.warn('Like review notice:', err);
  }
}

// Reset rating for a specific book or all books
export async function resetUserBookRating(isbn: string, title?: string, level?: number): Promise<BookRatingStats> {
  // 1. Clean localStorage custom reviews
  try {
    const raw = localStorage.getItem(USER_RATINGS_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      delete data[isbn];
      localStorage.setItem(USER_RATINGS_STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {}

  // 2. Clear memory cache
  delete memoryRatingCache[isbn];
  const fresh = generateBaselineRating(isbn, title || '', level || 1);
  memoryRatingCache[isbn] = fresh;

  // 3. Notify backend
  try {
    const res = await fetch(`/api/ratings/${isbn}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, level }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.record) {
        const backendFresh: BookRatingStats = {
          isbn,
          score: data.record.score,
          reviewCount: data.record.reviewCount,
          recommendRate: data.record.recommendRate,
          libraryCategory: data.record.libraryCategory,
          badge: data.record.badge,
          distribution: data.record.distribution,
          highlights: data.record.highlights,
          recentReviews: data.record.reviews || [],
        };
        memoryRatingCache[isbn] = backendFresh;
        return backendFresh;
      }
    }
  } catch (err) {
    console.warn('Reset backend notice:', err);
  }

  return fresh;
}

export async function resetAllBookRatings() {
  try {
    localStorage.removeItem(USER_RATINGS_STORAGE_KEY);
    for (const key of Object.keys(memoryRatingCache)) {
      delete memoryRatingCache[key];
    }
    await fetch('/api/ratings/reset-all', { method: 'POST' });
  } catch (e) {
    console.warn('Reset all ratings error', e);
  }
}

