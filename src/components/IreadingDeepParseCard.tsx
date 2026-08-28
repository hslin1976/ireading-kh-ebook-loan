import React, { useState, useEffect } from 'react';
import { Book, ParsedIreadingBook } from '../types';
import { getPreparsedIreadingBook } from '../data/ireadingPreparsed';
import {
  Sparkles,
  RefreshCw,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Award,
  Layers,
  FileText,
  Coins,
  CheckCircle,
  AlertCircle,
  Tag,
  GraduationCap,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

interface IreadingDeepParseCardProps {
  book: Book;
}

export const IreadingDeepParseCard: React.FC<IreadingDeepParseCardProps> = ({ book }) => {
  // Check local preparsed database first for instant zero-latency loading
  const preparsedInitial = getPreparsedIreadingBook(book.title, book.bookNo, book.isbn);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedIreadingBook | null>(preparsedInitial);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(!!preparsedInitial);
  const [showRawDetails, setShowRawDetails] = useState(false);

  const fetchDeepParse = async (force: boolean = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ireading/deep-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          bookNo: book.bookNo,
          isbn: book.isbn,
          colorDot: book.colorDot,
          year: book.year,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ParsedIreadingBook = await response.json();
      setParsedData(data);
      setHasFetched(true);
    } catch (err: any) {
      console.error('Error in deep search:', err);
      setError(err?.message || '連線逾時，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  // If not found in preparsed database, trigger auto-fetch on mount
  useEffect(() => {
    const preparsed = getPreparsedIreadingBook(book.title, book.bookNo, book.isbn);
    if (preparsed) {
      setParsedData(preparsed);
      setHasFetched(true);
      return;
    }

    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/ireading/deep-parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: book.title,
            bookNo: book.bookNo,
            isbn: book.isbn,
            colorDot: book.colorDot,
            year: book.year,
          }),
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setParsedData(data);
          setHasFetched(true);
        }
      } catch (e) {
        // silent fail on initial auto-load
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();

    return () => {
      isMounted = false;
    };
  }, [book.isbn, book.title, book.bookNo]);

  return (
    <div
      id="ireading-deep-parse-section"
      className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 via-teal-50/70 to-sky-50 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-emerald-950 flex items-center flex-wrap gap-1.5">
              <span>喜閱網官方深度解析</span>
              {parsedData?.found && (
                <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-full flex items-center gap-1 shadow-2xs">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                  {parsedData.parserEngine?.includes('Pre-parsed') ? '官方預備資料庫 (Preparsed Instant)' : '官方 DOM 即時同步'}
                </span>
              )}
            </h4>
            <p className="text-xs text-emerald-700">
              高雄喜閱網 (ireadinggames.kh.edu.tw) 官方認證題庫・字數・思考題與課綱領域
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-refresh-deep-search"
          onClick={() => fetchDeepParse(true)}
          disabled={loading}
          className="px-3 py-1.5 bg-white hover:bg-emerald-50 active:scale-95 text-emerald-900 font-bold rounded-xl border border-emerald-300 shadow-2xs flex items-center gap-1.5 text-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? '正在解析 HTML...' : '重新深度抓取'}</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-4 bg-white/80 backdrop-blur-xs rounded-xl border border-emerald-200 flex flex-col items-center justify-center gap-2 py-6 text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-emerald-900">
            正在連線 ireadinggames.kh.edu.tw 擷取 HTML 原始碼並執行 DOM 欄位解析...
          </p>
          <span className="text-[11px] text-slate-500 font-mono">
            目標書目：{book.title} (喜閱書號: {book.bookNo || '搜尋中'})
          </span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>深度檢索提示：{error}</span>
        </div>
      )}

      {/* Parsed Result Display */}
      {parsedData && !loading && (
        <div className="space-y-3">
          {/* Key Metric Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Official Word Count */}
            <div className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>官方認證字數</span>
              </div>
              <div className="text-base font-black text-slate-900 mt-1">
                {parsedData.wordCount ? `${Number(parsedData.wordCount).toLocaleString()} 字` : '未載明'}
              </div>
            </div>

            {/* 2. Official Page Count */}
            <div className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>全書頁數</span>
              </div>
              <div className="text-base font-black text-slate-900 mt-1">
                {parsedData.pageCount ? `${parsedData.pageCount} 頁` : book.pageCount ? `${book.pageCount} 頁` : '約 40 頁'}
              </div>
            </div>

            {/* 3. Official Reward Coins */}
            <div className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>闖關喜閱幣</span>
              </div>
              <div className="text-base font-black text-amber-600 mt-1">
                {parsedData.coins ? `${parsedData.coins} 幣` : '100 ~ 300 幣'}
              </div>
            </div>

            {/* 4. Official Color Dot */}
            <div className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-teal-800 text-[11px] font-bold">
                <Award className="w-3.5 h-3.5 text-teal-600" />
                <span>色點認證</span>
              </div>
              <div className="text-base font-black text-slate-900 mt-1">
                {parsedData.colorDot || book.colorDot}
              </div>
            </div>
          </div>

          {/* Official Reading Comprehension Question (提問) */}
          {parsedData.question && (
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>喜閱網官方導讀思考題 (閱讀理解提問)</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-amber-200">
                💬 {parsedData.question}
              </p>
            </div>
          )}

          {/* Official Synopsis (內容簡介) if available */}
          {parsedData.synopsis && (
            <div className="p-3.5 bg-white rounded-xl border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  官方完整簡介 (HTML Parsed)
                </span>
                {parsedData.genre && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    {parsedData.genre}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto pr-1">
                {parsedData.synopsis}
              </p>
            </div>
          )}

          {/* Domains, Topics & Keywords */}
          {((parsedData.domains && parsedData.domains.length > 0) ||
            (parsedData.topics && parsedData.topics.length > 0) ||
            (parsedData.keywords && parsedData.keywords.length > 0)) && (
            <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2 text-xs">
              {parsedData.domains && parsedData.domains.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-slate-500 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    學習領域：
                  </span>
                  {parsedData.domains.map((dom, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-semibold text-[11px]"
                    >
                      {dom}
                    </span>
                  ))}
                </div>
              )}

              {parsedData.topics && parsedData.topics.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-slate-500 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-sky-600" />
                    探討議題：
                  </span>
                  {parsedData.topics.map((top, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-sky-100 text-sky-900 rounded font-semibold text-[11px]"
                    >
                      {top}
                    </span>
                  ))}
                </div>
              )}

              {parsedData.keywords && parsedData.keywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-slate-500 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    關鍵詞：
                  </span>
                  {parsedData.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold text-[11px]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Official Action Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {parsedData.officialDetailUrl && (
              <a
                href={parsedData.officialDetailUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-open-official-ireading-page"
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-2xs flex items-center justify-between text-xs transition-all text-center"
              >
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-emerald-200" />
                  <span>前往喜閱網官方闖關與詳細頁面</span>
                </span>
                <span className="text-[11px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100">GO</span>
              </a>
            )}

            {parsedData.coverImgUrl && (
              <a
                href={parsedData.coverImgUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-view-official-cover"
                className="p-2.5 bg-white hover:bg-emerald-50 active:scale-95 text-emerald-900 font-bold rounded-xl border border-emerald-300 shadow-2xs flex items-center justify-between text-xs transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>查看官方高畫質封面原圖</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              </a>
            )}
          </div>

          {/* Parser Engine & Source Footnote Toggle */}
          <div className="pt-1 border-t border-emerald-200/60">
            <button
              type="button"
              onClick={() => setShowRawDetails(!showRawDetails)}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-mono flex items-center gap-1"
            >
              {showRawDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>解析引擎資訊 (Parser Engine Logs)</span>
            </button>

            {showRawDetails && (
              <div className="mt-2 p-2.5 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono space-y-1">
                <div>引擎：{parsedData.parserEngine}</div>
                <div>解析時間：{parsedData.parsedAt}</div>
                {parsedData.sourceUrl && <div className="truncate">來源：{parsedData.sourceUrl}</div>}
                {parsedData.officialDetailUrl && <div className="truncate">官方網址：{parsedData.officialDetailUrl}</div>}
                {parsedData.coverImgUrl && <div className="truncate">封面圖網址：{parsedData.coverImgUrl}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
