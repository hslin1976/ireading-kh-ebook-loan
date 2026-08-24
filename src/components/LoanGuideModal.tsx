import React from 'react';
import { X, BookOpen, Key, Tablet, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';

interface LoanGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoanGuideModal: React.FC<LoanGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        id="loan-guide-modal"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-400 border-b border-amber-300">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📖</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-950">
              國資圖電子書借閱小指南
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
            💡 本平台書籍均連結至<strong>「國立公共資訊圖書館（NLPI）電子書服務平台」</strong>，全國讀者與小朋友皆可免費借閱線上圖書！
          </p>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  點選喜歡的童書封面
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  在書庫中找到想讀的書，點擊<strong>書本封面</strong>或<strong>「國資圖線上借書」</strong>按鈕，就會自動打開專屬借閱頁面。
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-sky-600" />
                  登入圖書館借閱證帳號
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  可以使用<strong>各縣市公共圖書館借書證</strong>、<strong>學校數位學生證</strong>或<strong>身分證號碼</strong>登入（小朋友可請爸爸媽媽協助登入一次）。
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-emerald-600" />
                  在平板或手機上立即翻頁閱讀
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  按下<strong>「線上閱讀」</strong>或<strong>「借閱」</strong>即可立即翻閱全彩繪本！借期到了系統會自動歸還，完全不需擔心逾期。
                </p>
              </div>
            </div>
          </div>

          {/* Tips Box */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-emerald-900 space-y-1">
              <p className="font-bold">🌟 小朋友的閱讀小秘訣：</p>
              <p>
                讀完後記得在本書庫點擊<strong>「已讀完」</strong>按鈕，累積你的小星星獎章，看誰能讀完所有的好書喔！
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-xl shadow-md text-sm transition-all"
          >
            我知道了，開始借書！
          </button>
        </div>
      </div>
    </div>
  );
};
