// Speech Synthesis helper tailored for 7-year-old Taiwanese learners

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakTaiwanMandarin(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  rate: number = 0.85 // Slower speed is better for 7yo kids
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  // Clean text from punctuation if needed or speak smoothly
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.1; // Friendly warm pitch for kids
  utterance.lang = 'zh-TW';

  // Try to find a Taiwanese Mandarin voice
  const voices = window.speechSynthesis.getVoices();
  const twVoice = voices.find(
    (v) =>
      v.lang === 'zh-TW' ||
      v.lang === 'zh_TW' ||
      v.name.includes('Taiwan') ||
      v.name.includes('Mei-Jia') ||
      v.name.includes('Hsiao-Chen') ||
      v.name.includes('Yating') ||
      v.name.includes('Hanhan')
  ) || voices.find((v) => v.lang.startsWith('zh'));

  if (twVoice) {
    utterance.voice = twVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}
