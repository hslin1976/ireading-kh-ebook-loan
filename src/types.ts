export type ReadLevel = 1 | 2 | 3 | 4;

export type ColorDot = '白標' | '黑標' | '紅標' | '橙標';

export type ReadStatus = 'unread' | 'reading' | 'completed' | 'wishlist';

export interface ZhuyinChar {
  char: string;
  zhuyin?: string; // e.g. "ㄏㄨㄟˋ"
  initial?: string; // ㄏ
  medial?: string; // ㄨ
  final?: string; // ㄟ
  tone?: string; // ˋ or ˊ or ˇ or ˙ or ''
}

export interface Book {
  isbn: string;
  title: string;
  titleZhuyin: ZhuyinChar[];
  colorDot: ColorDot;
  readLevel: ReadLevel;
  bookMainUrl: string;
  bookImgUrl: string;
  introduce: string;
  author?: string;
  tags?: string[];
  recommendAge?: string;
  pageCount?: number;
}

export interface UserBookState {
  status: ReadStatus;
  rating?: number; // 1 to 5 stars
  favorite?: boolean;
  notes?: string;
  lastReadDate?: string;
  readCount?: number;
}

export type ZhuyinDisplayMode = 'side' | 'top' | 'hidden';

export type TextSize = 'normal' | 'large' | 'xlarge';
