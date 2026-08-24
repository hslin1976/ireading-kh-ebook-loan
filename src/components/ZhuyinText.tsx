import React from 'react';
import { ZhuyinChar, ZhuyinDisplayMode, TextSize } from '../types';
import { stringToZhuyinChars } from '../utils/zhuyinDictionary';
import { speakTaiwanMandarin } from '../utils/speechUtils';

interface ZhuyinTextProps {
  text?: string;
  zhuyinChars?: ZhuyinChar[];
  mode?: ZhuyinDisplayMode;
  size?: TextSize;
  className?: string;
  enableClickToSpeak?: boolean;
  highlightWords?: boolean;
}

export const ZhuyinText: React.FC<ZhuyinTextProps> = ({
  text,
  zhuyinChars,
  mode = 'side',
  size = 'normal',
  className = '',
  enableClickToSpeak = true,
}) => {
  const chars = zhuyinChars || (text ? stringToZhuyinChars(text) : []);

  // Size configurations
  const sizeStyles = {
    normal: {
      char: 'text-xl md:text-2xl font-bold',
      zhuyinText: 'text-[9px] md:text-[10px] leading-[9px] md:leading-[10px]',
      rubyRt: 'text-[10px] text-amber-900',
      toneMark: 'text-[8px] -mr-1',
      charGap: 'mx-0.5',
    },
    large: {
      char: 'text-2xl md:text-3xl font-extrabold',
      zhuyinText: 'text-[11px] md:text-[12px] leading-[11px] md:leading-[12px]',
      rubyRt: 'text-[12px] text-amber-900',
      toneMark: 'text-[10px] -mr-1',
      charGap: 'mx-1',
    },
    xlarge: {
      char: 'text-3xl md:text-4xl font-black',
      zhuyinText: 'text-[13px] md:text-[15px] leading-[13px] md:leading-[15px]',
      rubyRt: 'text-[14px] text-amber-950',
      toneMark: 'text-[12px] -mr-1.5',
      charGap: 'mx-1.5',
    },
  }[size];

  const handleCharClick = (e: React.MouseEvent, char: string) => {
    if (!enableClickToSpeak) return;
    e.stopPropagation();
    speakTaiwanMandarin(char);
  };

  if (mode === 'hidden') {
    return (
      <span className={`inline-flex flex-wrap items-baseline ${className}`}>
        {chars.map((item, idx) => (
          <span
            key={idx}
            onClick={(e) => handleCharClick(e, item.char)}
            className={`${sizeStyles.char} hover:text-amber-600 transition-colors cursor-pointer select-none`}
            title={`點擊朗讀「${item.char}」`}
          >
            {item.char}
          </span>
        ))}
      </span>
    );
  }

  if (mode === 'top') {
    return (
      <span className={`inline-flex flex-wrap items-end ${className}`}>
        {chars.map((item, idx) => {
          if (!item.zhuyin || item.char === item.zhuyin || item.char.trim() === '') {
            return (
              <span key={idx} className={`${sizeStyles.char} ${sizeStyles.charGap}`}>
                {item.char}
              </span>
            );
          }
          return (
            <ruby
              key={idx}
              onClick={(e) => handleCharClick(e, item.char)}
              className={`${sizeStyles.char} ${sizeStyles.charGap} cursor-pointer hover:text-amber-700 transition-colors inline-block text-center`}
              title={`點擊朗讀「${item.char}」(${item.zhuyin})`}
            >
              {item.char}
              <rt className={`${sizeStyles.rubyRt} font-normal select-none tracking-tighter text-amber-800`}>
                {item.zhuyin}
              </rt>
            </ruby>
          );
        })}
      </span>
    );
  }

  // Traditional Taiwanese Side-by-side Zhuyin (Taiwan elementary school textbook standard)
  return (
    <span className={`inline-flex flex-wrap items-center ${className}`}>
      {chars.map((item, idx) => {
        // Punctuation, numbers, or symbols without Zhuyin
        if (!item.zhuyin || item.char === item.zhuyin || item.char.trim() === '') {
          return (
            <span
              key={idx}
              className={`${sizeStyles.char} inline-flex items-center justify-center min-w-[0.6em] text-slate-700`}
            >
              {item.char}
            </span>
          );
        }

        // Zhuyin decomposition parts
        const hasTone = Boolean(item.tone && item.tone !== '˙');
        const isNeutralTone = item.tone === '˙';

        return (
          <span
            key={idx}
            onClick={(e) => handleCharClick(e, item.char)}
            className={`inline-flex items-center ${sizeStyles.charGap} py-0.5 px-0.5 rounded-lg hover:bg-amber-100/70 cursor-pointer transition-colors group select-none relative`}
            title={`點擊聽發音：「${item.char}」(${item.zhuyin})`}
          >
            {/* Main Hanzi Character */}
            <span className={`${sizeStyles.char} text-slate-900 group-hover:text-amber-900 leading-none`}>
              {item.char}
            </span>

            {/* Vertical Zhuyin Stack on the right */}
            <span className="inline-flex flex-col items-center justify-center ml-0.5 font-mono text-amber-900 select-none">
              {/* Neutral tone dot placed on top */}
              {isNeutralTone && (
                <span className="text-[10px] leading-none text-amber-800 font-bold -mb-0.5">˙</span>
              )}

              <span className="inline-flex items-center">
                <span className={`inline-flex flex-col items-center justify-center font-bold tracking-tighter ${sizeStyles.zhuyinText}`}>
                  {item.initial && <span>{item.initial}</span>}
                  {item.medial && <span>{item.medial}</span>}
                  {item.final && <span>{item.final}</span>}
                  {/* Fallback if parts not separated */}
                  {!item.initial && !item.medial && !item.final && (
                    <span>{item.zhuyin.replace(/[ˊˇˋ˙]/g, '')}</span>
                  )}
                </span>

                {/* Tone mark on the right side */}
                {hasTone && (
                  <span className={`font-bold text-amber-800 leading-none ${sizeStyles.toneMark}`}>
                    {item.tone}
                  </span>
                )}
              </span>
            </span>
          </span>
        );
      })}
    </span>
  );
};
