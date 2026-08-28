import { getOfficialIreadingDirectUrl, getOfficialBookCoverUrl } from '../data/ireadingOfficialLinks';

export { getOfficialBookCoverUrl };

/**
 * Helper utilities for generating reliable search and lending URLs
 * for Kaohsiung iReading (高雄喜閱網) and Taiwanese public library systems.
 */

/**
 * Strips bracketed metadata, edition suffixes, and punctuation
 * that cause library SQL and Elasticsearch tokenizers to return zero results.
 */
export function cleanBookTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/（[^）]*）/g, '') // Strips （二版）, （修訂版）, etc.
    .replace(/\([^)]*\)/g, '')   // Strips (2nd Edition), etc.
    .replace(/【[^】]*】/g, '') // Strips 【環境教育繪本】, etc.
    .replace(/\[[^\]]*\]/g, '') // Strips [注音版], etc.
    .replace(/[！!？?：:，,、。．·・—–-]/g, ' ') // Strips punctuation
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Direct exact URL for a book on official ireadinggames.kh.edu.tw
 * If the exact book hash is found in the official database, returns the exact ?a=HASH page.
 * Otherwise returns the official booklist page.
 */
export function getOfficialIreadingDirectBookUrl(title: string): string {
  const directObj = getOfficialIreadingDirectUrl(title);
  if (directObj && directObj.directUrl) {
    return directObj.directUrl;
  }
  return 'https://ireadinggames.kh.edu.tw/bookexam/booklist';
}

/**
 * Official iReading Booklist & Exam Portal URL
 */
export function getOfficialIreadingPortalUrl(): string {
  return 'https://ireadinggames.kh.edu.tw/bookexam/booklist';
}

/**
 * Official Kaohsiung iReading (喜閱網) Google site-search fallback URL
 */
export function getIreadingGoogleSearchUrl(title: string, bookNo?: string): string {
  const clean = cleanBookTitle(title);
  const query = bookNo 
    ? `site:ireadinggames.kh.edu.tw OR site:ireading.kh.edu.tw "${clean}" OR "${bookNo}"`
    : `site:ireadinggames.kh.edu.tw OR site:ireading.kh.edu.tw "${clean}"`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Comprehensive Google search for 喜閱網 book analysis and quizzes
 */
export function getGeneralIreadingGoogleSearchUrl(title: string): string {
  const clean = cleanBookTitle(title);
  return `https://www.google.com/search?q=${encodeURIComponent(`${clean} 高雄喜閱網`)}`;
}

/**
 * Kaohsiung Public Library HyRead E-book platform full-text search URL
 */
export function getHyreadSearchUrl(title: string): string {
  const clean = cleanBookTitle(title);
  return `https://ksml.ebook.hyread.com.tw/searchList.jsp?search_field=FullText&search_input=${encodeURIComponent(clean)}`;
}

/**
 * National Library of Public Information (NLPI / 國資圖) E-book lending search URL
 */
export function getNlpiSearchUrl(title: string): string {
  const clean = cleanBookTitle(title);
  return `https://ebook.nlpi.edu.tw/search?search_type=ALL&search_word=${encodeURIComponent(clean)}`;
}

/**
 * Taiwan Cloud Library @ Kaohsiung (台灣雲端書庫@高雄) points lending search URL
 */
export function getCloudSearchUrl(title: string): string {
  const clean = cleanBookTitle(title);
  return `https://lib.ebookservice.tw/ks/search?q=${encodeURIComponent(clean)}`;
}

/**
 * Kaohsiung Public Library WebPAC Physical Catalog search URL
 */
export function getKsmlWebpacUrl(title: string): string {
  const clean = cleanBookTitle(title);
  return `https://webpacx.ksml.edu.tw/search?searchfield=TITLE&searchinput=${encodeURIComponent(clean)}`;
}
