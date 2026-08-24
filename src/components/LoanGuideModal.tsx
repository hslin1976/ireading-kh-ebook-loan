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
              雙平台電子書借閱小指南
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
            💡 本平台提供<strong>「國資圖 (NLPI)」</strong>與<strong>「HyRead (高市圖/喜閱網)」</strong>雙借閱管道，每本書皆提供垂直並列借閱按鈕，全台灣的小朋友與家長皆可免費線上借閱！
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300">
              <div className="font-extrabold text-xs text-amber-900 flex items-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>國資圖 (NLPI)</span>
              </div>
              <p className="text-xs text-slate-600">
                國立公共資訊圖書館電子書服務平台，全台讀者皆可免費註冊與登入借閱。
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300">
              <div className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>HyRead (高市圖/喜閱網)</span>
              </div>
              <p className="text-xs text-slate-600">
                高雄市立圖書館 HyRead 電子書平台，高雄喜閱網推薦好書隨點隨借！
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  選擇借閱平台（國資圖 或 HyRead）
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  每張童書卡片下方均有<strong>垂直排列的兩個借閱按鈕</strong>（黃色國資圖、綠色HyRead），點選任一按鈕即可直接開啟借閱頁面。
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
                  可以使用<strong>各縣市公共圖書館借書證</strong>、<strong>學校數位學生證</strong>或<strong>身分證號碼</strong>登入（首次可請家長或老師協助登入）。
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
                  按下<strong>「線上閱讀」</strong>或<strong>「借閱」</strong>即可立即翻閱全彩繪本！到期自動歸還，免除逾期煩惱。
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
