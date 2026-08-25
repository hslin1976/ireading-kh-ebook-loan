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

// Generate deterministic baseline rating from ISBN
export function generateBaselineRating(isbn: string, title: string = '', level: number = 1): BookRatingStats {
  let hash = 0;
  for (let i = 0; i < isbn.length; i++) {
    hash = (hash * 31 + isbn.charCodeAt(i)) % 100000;
  }

  // Base score between 4.7 and 5.0
  const scoreRaw = 4.7 + ((hash % 30) / 100);
  const score = Math.min(5.0, Math.round(scoreRaw * 10) / 10);

  // Review counts from 260 to 1,850
  const reviewCount = 260 + (hash % 1590);

  // Distribution weights
  const dist5 = 82 + (hash % 14); // 82% - 95%
  const dist4 = Math.min(100 - dist5, 3 + ((hash >> 2) % 10));
  const dist3 = Math.min(100 - dist5 - dist4, 1 + ((hash >> 3) % 4));
  const dist2 = Math.min(100 - dist5 - dist4 - dist3, (hash % 2));
  const dist1 = Math.max(0, 100 - dist5 - dist4 - dist3 - dist2);

  const categories = [
    '高市圖熱門借閱 TOP 5',
    '喜閱網年度精選',
    '國資圖熱門借閱',
    '國小低年級推薦',
    '親子共讀五星推薦',
    '高雄市閱讀起步走推薦',
  ];
  const libraryCategory = categories[hash % categories.length];

  const badges = ['喜閱網指定書', '繪本大獎推薦', '暢銷童書', '教育部推薦好書', '圖書館借閱冠軍'];
  const badge = badges[(hash >> 1) % badges.length];

  const highlightsPool = [
    '注音清晰好讀 (98%)',
    '插圖生動溫馨 (96%)',
    '故事富有想像力 (95%)',
    '適合初學閱讀 (99%)',
    '親子共讀首選 (94%)',
    '文字淺顯易懂 (97%)',
  ];
  const highlights = [
    highlightsPool[hash % highlightsPool.length],
    highlightsPool[(hash + 2) % highlightsPool.length],
    highlightsPool[(hash + 4) % highlightsPool.length],
  ];

  const sampleReviews = [
    {
      id: `rev-1-${isbn}`,
      author: '林小宇',
      role: '一年級小讀者' as const,
      rating: 5,
      date: '2 天前',
      content: '我自己看著注音全部讀完了！圖畫很可愛，故事很好笑又好玩。',
      likes: 18,
    },
    {
      id: `rev-2-${isbn}`,
      author: '陳老師',
      role: '國小教師' as const,
      rating: 5,
      date: '1 週前',
      content: '非常推薦作為班級晨讀與喜閱網認證共讀書，小朋友閱讀理解反響非常好。',
      likes: 34,
    },
    {
      id: `rev-3-${isbn}`,
      author: '雅婷媽媽',
      role: '親子伴讀家長' as const,
      rating: 5,
      date: '2 週前',
      content: '線上電子書隨借隨看很方便，孩子每晚睡前都會自己拿平板聽語音一起跟讀！',
      likes: 22,
    },
  ];

  return {
    isbn,
    score,
    reviewCount,
    recommendRate: 95 + (hash % 5),
    libraryCategory,
    badge,
    distribution: {
      5: dist5,
      4: dist4,
      3: dist3,
      2: dist2,
      1: dist1,
    },
    highlights,
    recentReviews: sampleReviews,
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
    if (userRating > 0 && userRating !== cached.score) {
      return {
        ...cached,
        recentReviews: cached.recentReviews,
      };
    }
    return cached;
  }

  const base = generateBaselineRating(isbn, title, level);

  try {
    const raw = localStorage.getItem(USER_RATINGS_STORAGE_KEY);
    const customData = raw ? JSON.parse(raw) : {};
    const bookCustom = customData[isbn];

    if (userRating > 0 || bookCustom) {
      const addedRating = userRating || (bookCustom?.rating || 0);
      const customReviews = bookCustom?.reviews || [];

      // Calculate blended score
      const totalRatingsCount = base.reviewCount + (addedRating > 0 ? 1 : 0) + customReviews.length;
      const totalPoints =
        base.score * base.reviewCount +
        addedRating +
        customReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      const newScore = Math.min(5.0, Math.round((totalPoints / totalRatingsCount) * 10) / 10);

      const allReviews = [...(bookCustom?.reviews || []), ...base.recentReviews];

      const blended: BookRatingStats = {
        ...base,
        score: newScore,
        reviewCount: totalRatingsCount,
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

