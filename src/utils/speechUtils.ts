// Speech Synthesis helper tailored for 7-year-old Taiwanese learners

let currentUtterance: SpeechSynthesisUtterance | null = null;
let speechInterval: any = null;

export function speakTaiwanMandarin(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  rate: number = 0.88 // Comfortable pace for kids to follow along
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Stop any ongoing speech and timers
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.05; // Warm, friendly tone
  utterance.lang = 'zh-TW';

  // Try to find a Taiwanese Mandarin voice
  const voices = window.speechSynthesis.getVoices();
  const twVoice =
    voices.find(
      (v) =>
        v.lang === 'zh-TW' ||
        v.lang === 'zh_TW' ||
        v.name.includes('Taiwan') ||
        v.name.includes('Mei-Jia') ||
        v.name.includes('Hsiao-Chen') ||
        v.name.includes('Yating') ||
        v.name.includes('Hanhan')
    ) ||
    voices.find((v) => v.lang.startsWith('zh-HK')) ||
    voices.find((v) => v.lang.startsWith('zh'));

  if (twVoice) {
    utterance.voice = twVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (speechInterval) clearInterval(speechInterval);
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (speechInterval) clearInterval(speechInterval);
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;

  // Prevent browser speech synthesis timeout on longer story descriptions
  if (speechInterval) clearInterval(speechInterval);
  speechInterval = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      clearInterval(speechInterval);
    }
  }, 10000);

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (speechInterval) {
    clearInterval(speechInterval);
    speechInterval = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

