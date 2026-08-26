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

// Deterministic baseline calculation for books without user reviews yet (Starts at zero rating history)
export function generateInitialBookStats(isbn: string, title?: string, level?: number): BookRatingRecord {
  const libraryCategory = '喜閱網推薦童書';
  const badge = '喜閱網指定書';

  const highlights = [
    '全彩大字版',
    '注音清晰好讀',
    '適合自主閱讀',
  ];

  return {
    isbn,
    title,
    level,
    score: 0,
    reviewCount: 0,
    totalStars: 0,
    recommendRate: 0,
    libraryCategory,
    badge,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    distributionCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    highlights,
    reviews: [],
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
