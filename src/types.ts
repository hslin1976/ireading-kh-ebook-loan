export type ReadLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ColorDot =
  | '白標'
  | '黑標'
  | '紅標'
  | '橙標'
  | '黃標'
  | '綠標'
  | '藍標'
  | '靛標'
  | '紫標'
  | '銅標'
  | '銀標'
  | '金標';

export type BookListSource = 'kh_reading' | 'my_books';

export type ReadStatus = 'unread' | 'reading' | 'completed' | 'wishlist';

export type MediaType = 'text' | 'audio';

export type MediaTypeFilter = 'all' | 'text' | 'audio';

export interface ZhuyinChar {
  char: string;
  zhuyin?: string; // e.g. "ㄏㄨㄟˋ"
  initial?: string; // ㄏ
  medial?: string; // ㄨ
  final?: string; // ㄟ
  tone?: string; // ˋ or ˊ or ˇ or ˙ or ''
}

export interface Book {
  id?: string;
  source?: BookListSource; // 'kh_reading' (高雄喜閱網) | 'my_books' (我的書單)
  year?: string; // e.g. "114", "113"
  bookNo?: string; // e.g. "114005"
  isbn: string;
  title: string;
  titleZhuyin: ZhuyinChar[];
  colorDot: ColorDot;
  readLevel: ReadLevel;
  mediaType: MediaType; // 'text' (電子童書) | 'audio' (有聲童書)
  bookMainUrl: string; // Default loan URL (NLPI or primary)
  ireadingUrl?: string; // Official 喜閱網 Google Search (site:ireading.kh.edu.tw)
  nlpiUrl?: string; // 國立公共資訊圖書館 (NLPI) direct loan URL
  hyreadUrl?: string; // 高市圖 / 喜閱網 HyRead direct loan URL
  cloudUrl?: string; // 台灣雲端書庫@高雄市 (ebookservice.tw) direct loan URL
  webpacUrl?: string; // 高雄市立圖書館 (KSML WebPAC) 實體館藏查詢 URL
  bookImgUrl: string;
  introduce: string;
  author?: string;
  illustrator?: string;
  translator?: string;
  publisher?: string;
  publishDate?: string;
  tags?: string[];
  recommendAge?: string;
  pageCount?: number;
  wordCount?: number;
  coins?: number;
  question?: string;
  directHash?: string;
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

export type LibraryFilter = 'all' | 'nlpi' | 'hyread' | 'cloud';

export interface ParsedIreadingBook {
  found: boolean;
  officialDetailUrl?: string;
  sourceUrl?: string;
  parsedAt: string;
  title: string;
  bookNo?: string;
  author?: string;
  illustrator?: string;
  translator?: string;
  publisher?: string;
  publishDate?: string;
  isbn?: string;
  pageCount?: string;
  wordCount?: string;
  genre?: string;
  colorDot?: string;
  coins?: number;
  coverImgUrl?: string;
  synopsis?: string;
  question?: string;
  keywords: string[];
  domains: string[];
  topics?: string[];
  message?: string;
  parserEngine: string;
}
