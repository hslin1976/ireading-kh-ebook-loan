import fs from 'fs';
import path from 'path';

export interface ReviewItem {
  id: string;
  author: string;
  role: '一年級小讀者' | '二年級小讀者' | '國小教師' | '親子伴讀家長' | '圖書館志工媽媽';
  rating: number;
  date: string;
  content: string;
  likes: number;
  createdAt: number;
}

export interface BookRatingRecord {
  isbn: string;
  title?: string;
  level?: number;
  score: number;
  reviewCount: number;
  totalStars: number;
  recommendRate: number;
  libraryCategory: string;
  badge: string;
  distribution: {
    5: number; // percentage
    4: number;
    3: number;
    2: number;
    1: number;
  };
  distributionCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  highlights: string[];
  reviews: ReviewItem[];
  updatedAt: number;
}

interface DatabaseSchema {
  version: number;
  stats: {
    totalVisits: number;
    todayVisits: number;
    lastDateStr: string;
  };
  ratings: Record<string, BookRatingRecord>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'embedded_db.json');

// In-Memory storage for < 1ms sub-millisecond query performance (Option C)
let memoryDb: DatabaseSchema = {
  version: 1,
  stats: {
    totalVisits: 1,
    todayVisits: 1,
    lastDateStr: new Date().toISOString().slice(0, 10),
  },
  ratings: {},
};

let isFlushing = false;
let needsFlush = false;

// Ensure database file & directory exist and load initial state
export function initDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        memoryDb = {
          ...memoryDb,
          ...parsed,
          stats: { ...memoryDb.stats, ...(parsed.stats || {}) },
          ratings: { ...(parsed.ratings || {}) },
        };
      }
    } else {
      flushDatabaseSync();
    }
  } catch (err) {
    console.warn('⚠️ Warning initializing embedded database, using fresh memory state:', err);
  }
  return memoryDb;
}

// Asynchronous Atomic File Flushing with WAL pattern
async function flushDatabaseAsync() {
  if (isFlushing) {
    needsFlush = true;
    return;
  }
  isFlushing = true;
  needsFlush = false;

  try {
    const tempFile = `${DB_FILE}.tmp`;
    const jsonStr = JSON.stringify(memoryDb, null, 2);
    await fs.promises.writeFile(tempFile, jsonStr, 'utf-8');
    await fs.promises.rename(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing to embedded database file:', err);
  } finally {
    isFlushing = false;
    if (needsFlush) {
      setTimeout(flushDatabaseAsync, 50);
    }
  }
}

function flushDatabaseSync() {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    const jsonStr = JSON.stringify(memoryDb, null, 2);
    fs.writeFileSync(tempFile, jsonStr, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error synchronously saving database:', err);
  }
}

function triggerSave() {
  flushDatabaseAsync();
}

// Deterministic baseline calculation for books without user reviews yet
export function generateInitialBookStats(isbn: string, title?: string, level?: number): BookRatingRecord {
  let hash = 0;
  for (let i = 0; i < isbn.length; i++) {
    hash = (hash * 31 + isbn.charCodeAt(i)) % 100000;
  }

  const scoreRaw = 4.7 + ((hash % 30) / 100);
  const score = Math.min(5.0, Math.round(scoreRaw * 10) / 10);
  const reviewCount = 260 + (hash % 1590);

  const count5 = Math.round(reviewCount * (0.84 + (hash % 10) / 100));
  const count4 = Math.round(reviewCount * (0.08 + ((hash >> 2) % 6) / 100));
  const count3 = Math.round(reviewCount * (0.03 + ((hash >> 3) % 4) / 100));
  const count2 = Math.round(reviewCount * 0.01);
  const count1 = Math.max(0, reviewCount - count5 - count4 - count3 - count2);

  const total = count5 + count4 + count3 + count2 + count1 || 1;
  const dist5 = Math.round((count5 / total) * 100);
  const dist4 = Math.round((count4 / total) * 100);
  const dist3 = Math.round((count3 / total) * 100);
  const dist2 = Math.round((count2 / total) * 100);
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

  const sampleReviews: ReviewItem[] = [
    {
      id: `seed-1-${isbn}`,
      author: '林小宇',
      role: '一年級小讀者',
      rating: 5,
      date: '2 天前',
      content: '我自己看著注音全部讀完了！圖畫很可愛，故事很好笑又好玩。',
      likes: 18,
      createdAt: Date.now() - 2 * 86400000,
    },
    {
      id: `seed-2-${isbn}`,
      author: '陳老師',
      role: '國小教師',
      rating: 5,
      date: '1 週前',
      content: '非常推薦作為班級晨讀與喜閱網認證共讀書，小朋友閱讀理解反響非常好。',
      likes: 34,
      createdAt: Date.now() - 7 * 86400000,
    },
    {
      id: `seed-3-${isbn}`,
      author: '雅婷媽媽',
      role: '親子伴讀家長',
      rating: 5,
      date: '2 週前',
      content: '線上電子書隨借隨看很方便，孩子每晚睡前都會自己拿平板聽語音一起跟讀！',
      likes: 22,
      createdAt: Date.now() - 14 * 86400000,
    },
  ];

  return {
    isbn,
    title,
    level,
    score,
    reviewCount,
    totalStars: Math.round(score * reviewCount),
    recommendRate: 95 + (hash % 5),
    libraryCategory,
    badge,
    distribution: { 5: dist5, 4: dist4, 3: dist3, 2: dist2, 1: dist1 },
    distributionCounts: { 5: count5, 4: count4, 3: count3, 2: count2, 1: count1 },
    highlights,
    reviews: sampleReviews,
    updatedAt: Date.now(),
  };
}

// ----------------------------------------------------
// Public Database Accessors
// ----------------------------------------------------

export function getBookRating(isbn: string, title?: string, level?: number): BookRatingRecord {
  if (!memoryDb.ratings[isbn]) {
    memoryDb.ratings[isbn] = generateInitialBookStats(isbn, title, level);
    triggerSave();
  }
  return memoryDb.ratings[isbn];
}

export function getBatchBookRatings(isbns: string[]): Record<string, BookRatingRecord> {
  const result: Record<string, BookRatingRecord> = {};
  for (const isbn of isbns) {
    result[isbn] = getBookRating(isbn);
  }
  return result;
}

export function addBookReview(
  isbn: string,
  reviewData: { author: string; rating: number; content: string; role?: ReviewItem['role']; title?: string }
): BookRatingRecord {
  const current = getBookRating(isbn, reviewData.title);
  const ratingVal = Math.max(1, Math.min(5, Math.round(reviewData.rating)));

  const newReview: ReviewItem = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    author: reviewData.author.trim() || '愛讀小讀者',
    role: reviewData.role || '一年級小讀者',
    rating: ratingVal,
    date: '剛剛',
    content: reviewData.content.trim(),
    likes: 1,
    createdAt: Date.now(),
  };

  // Update distribution counts
  const rKey = ratingVal as 1 | 2 | 3 | 4 | 5;
  current.distributionCounts[rKey] = (current.distributionCounts[rKey] || 0) + 1;
  current.reviewCount += 1;
  current.totalStars += ratingVal;

  // Re-calculate percentages
  const total = current.reviewCount;
  current.distribution = {
    5: Math.round(((current.distributionCounts[5] || 0) / total) * 100),
    4: Math.round(((current.distributionCounts[4] || 0) / total) * 100),
    3: Math.round(((current.distributionCounts[3] || 0) / total) * 100),
    2: Math.round(((current.distributionCounts[2] || 0) / total) * 100),
    1: Math.round(((current.distributionCounts[1] || 0) / total) * 100),
  };

  // Re-calculate weighted average score
  const newScore = Math.min(5.0, Math.max(1.0, current.totalStars / current.reviewCount));
  current.score = Math.round(newScore * 10) / 10;
  current.reviews = [newReview, ...current.reviews];
  current.updatedAt = Date.now();

  memoryDb.ratings[isbn] = current;
  triggerSave();
  return current;
}

export function likeBookReview(isbn: string, reviewId: string): { success: boolean; likes: number } {
  const current = memoryDb.ratings[isbn];
  if (!current) return { success: false, likes: 0 };

  const review = current.reviews.find((r) => r.id === reviewId);
  if (!review) return { success: false, likes: 0 };

  review.likes += 1;
  current.updatedAt = Date.now();
  triggerSave();
  return { success: true, likes: review.likes };
}

export function resetBookRating(isbn: string, title?: string, level?: number): BookRatingRecord {
  const initial = generateInitialBookStats(isbn, title, level);
  memoryDb.ratings[isbn] = initial;
  triggerSave();
  return initial;
}

export function resetAllRatings(): { success: boolean; count: number } {
  const count = Object.keys(memoryDb.ratings).length;
  memoryDb.ratings = {};
  triggerSave();
  return { success: true, count };
}

// Visitor counter accessors
export function getVisitorStats() {
  return memoryDb.stats;
}

export function incrementVisitorHit(): { totalVisits: number; todayVisits: number } {
  const today = new Date().toISOString().slice(0, 10);
  if (memoryDb.stats.lastDateStr !== today) {
    memoryDb.stats.todayVisits = 0;
    memoryDb.stats.lastDateStr = today;
  }
  memoryDb.stats.totalVisits += 1;
  memoryDb.stats.todayVisits += 1;
  triggerSave();
  return {
    totalVisits: memoryDb.stats.totalVisits,
    todayVisits: memoryDb.stats.todayVisits,
  };
}
