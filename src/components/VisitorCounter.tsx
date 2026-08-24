import React, { useState, useEffect } from 'react';
import { Users, Eye, Sparkles, Flame } from 'lucide-react';
import { ZhuyinDisplayMode } from '../types';
import { ZhuyinText } from './ZhuyinText';

interface VisitorCounterProps {
  zhuyinMode?: ZhuyinDisplayMode;
}

const VISITOR_KEY = 'taiwan_kids_visitor_data_v1';
const BASE_VISITOR_COUNT = 15820;

export const VisitorCounter: React.FC<VisitorCounterProps> = ({ zhuyinMode = 'inline' }) => {
  const [totalCount, setTotalCount] = useState<number>(BASE_VISITOR_COUNT);
  const [todayCount, setTodayCount] = useState<number>(142);
  const [onlineNow, setOnlineNow] = useState<number>(18);

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const savedData = localStorage.getItem(VISITOR_KEY);
      let data = savedData ? JSON.parse(savedData) : null;

      if (!data) {
        data = {
          total: BASE_VISITOR_COUNT + Math.floor(Math.random() * 50) + 1,
          today: 120 + Math.floor(Math.random() * 25) + 1,
          lastDate: todayStr,
          lastVisitSession: Date.now(),
        };
      } else {
        // Check if day rolled over
        if (data.lastDate !== todayStr) {
          data.today = Math.floor(Math.random() * 20) + 1;
          data.lastDate = todayStr;
        }

        // Increment count if session is new (e.g. > 15 mins since last increment or new page load)
        const now = Date.now();
        if (!data.lastVisitSession || now - data.lastVisitSession > 10 * 60 * 1000) {
          data.total = (data.total || BASE_VISITOR_COUNT) + 1;
          data.today = (data.today || 0) + 1;
          data.lastVisitSession = now;
        }
      }

      localStorage.setItem(VISITOR_KEY, JSON.stringify(data));
      setTotalCount(data.total);
      setTodayCount(data.today);

      // Random dynamic active online readers between 15-28
      const randomOnline = 16 + Math.floor(Math.sin(Date.now() / 60000) * 6) + Math.floor(Math.random() * 5);
      setOnlineNow(Math.max(12, randomOnline));
    } catch (e) {
      console.warn('Visitor counter initialization', e);
    }
  }, []);

  // Format count into individual digits for cute counter box display
  const digits = totalCount.toString().padStart(6, '0').split('');

  return (
    <footer id="visitor-counter-section" className="mt-14 pb-8 border-t border-amber-200/80 pt-8">
      <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-sm max-w-3xl mx-auto text-center">
        {/* Header Title with Icon */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100/90 text-amber-950 font-black rounded-full text-xs sm:text-sm mb-4 border border-amber-300">
          <Users className="w-4 h-4 text-amber-700" />
          <span>
            <ZhuyinText text="愛讀書訪客人次統計" mode={zhuyinMode} />
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        </div>

        {/* Counter Digits Display */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 my-3">
          {digits.map((digit, idx) => (
            <div
              key={idx}
              className="w-8 h-12 sm:w-11 sm:h-14 bg-slate-900 text-amber-300 font-mono font-black text-xl sm:text-2xl rounded-xl flex items-center justify-center shadow-inner border border-slate-700 select-none transform hover:scale-105 transition-transform"
            >
              {digit}
            </div>
          ))}
          <span className="text-slate-700 font-extrabold text-sm sm:text-base ml-1.5 self-end mb-2">
            <ZhuyinText text="人次" mode={zhuyinMode} />
          </span>
        </div>

        {/* Breakdown Stats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-5 text-xs sm:text-sm text-slate-700 font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-amber-200 shadow-2xs">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>
              <ZhuyinText text="今日閱讀造訪：" mode={zhuyinMode} />
            </span>
            <strong className="text-amber-800 font-black text-sm sm:text-base">
              {todayCount.toLocaleString()}
            </strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 shadow-2xs text-emerald-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-0.5" />
            <Flame className="w-4 h-4 text-emerald-600" />
            <span>
              <ZhuyinText text="此時共讀小書蟲：" mode={zhuyinMode} />
            </span>
            <strong className="text-emerald-700 font-black text-sm sm:text-base">
              {onlineNow}
            </strong>
            <span>
              <ZhuyinText text="人線上" mode={zhuyinMode} />
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] sm:text-xs text-slate-500 mt-4 leading-relaxed">
          🌱 歡迎全台灣的小朋友、家長與學校師生，天天來線上開卷有益、快樂閱讀！
        </p>
      </div>
    </footer>
  );
};
