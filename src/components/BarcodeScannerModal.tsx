import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  ScanBarcode,
  X,
  Camera,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Volume2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { BOOKS_DATA } from '../data/booksData';
import { speakTaiwanMandarin } from '../utils/speechUtils';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (barcode: string, matchedBookTitle?: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [matchedBook, setMatchedBook] = useState<(typeof BOOKS_DATA)[0] | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [camerasList, setCamerasList] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'barcode-scanner-viewfinder';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Play crisp success sound
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12); // A6 note
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  // Handle successful scan
  const handleSuccess = (decodedText: string) => {
    const cleanText = decodedText.trim();
    setScannedCode(cleanText);
    playBeep();

    // Check if matching catalog ISBN or title
    const foundBook = BOOKS_DATA.find(
      (b) => b.isbn === cleanText || b.isbn.replace(/-/g, '') === cleanText.replace(/-/g, '')
    );

    if (foundBook) {
      setMatchedBook(foundBook);
      speakTaiwanMandarin(`找到了！${foundBook.title}`);
    } else {
      speakTaiwanMandarin(`掃描條碼成功：${cleanText}`);
    }

    // Stop scanning
    stopCamera();

    // Wait a brief moment to show success UI then forward result
    setTimeout(() => {
      onScanResult(cleanText, foundBook?.title);
      onClose();
    }, 1200);
  };

  // Start Camera
  const startCamera = async (cameraId?: string) => {
    setCameraError(null);
    setIsStartingCamera(true);

    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // ignore
        }
      }

      // Initialize scanner instance
      const scanner = new Html5Qrcode(readerElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        verbose: false,
      });
      scannerRef.current = scanner;

      // Get available cameras
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCamerasList(devices);
          if (!cameraId && !selectedCameraId) {
            // prefer back / environment camera
            const backCam = devices.find((d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
            );
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          }
        }
      } catch (err) {
        console.warn('Could not enumerate cameras', err);
      }

      const cameraConfig = cameraId || selectedCameraId
        ? { deviceId: { exact: cameraId || selectedCameraId } }
        : { facingMode: 'environment' };

      await scanner.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Rectangular wide box for book ISBN barcodes
            const width = Math.floor(Math.min(viewfinderWidth * 0.85, 320));
            const height = Math.floor(Math.min(viewfinderHeight * 0.5, 160));
            return { width, height };
          },
          aspectRatio: 1.333,
        },
        (decodedText) => {
          handleSuccess(decodedText);
        },
        () => {
          // scanning frame loop (quiet)
        }
      );

      setIsCameraActive(true);
      setIsStartingCamera(false);

      // Check torch capabilities
      try {
        const capabilities = scanner.getRunningTrackCapabilities();
        if (capabilities && 'torch' in capabilities) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: unknown) {
      console.error('Camera start error:', err);
      setIsStartingCamera(false);
      setIsCameraActive(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
        setCameraError('請允許瀏覽器存取相機權限，以使用條碼掃描功能。');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setCameraError('未偵測到可用的鏡頭裝置。您可以使用「上傳條碼照片」功能。');
      } else {
        setCameraError('無法啟動相機鏡頭，請確認權限或嘗試點選下方「上傳條碼照片」。');
      }
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
    setIsTorchOn(false);
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (scannerRef.current && isCameraActive) {
      try {
        const nextState = !isTorchOn;
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: nextState } as unknown as MediaTrackConstraintSet],
        });
        setIsTorchOn(nextState);
      } catch (e) {
        console.warn('Torch toggle failed', e);
      }
    }
  };

  // Handle Image File Upload Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    try {
      await stopCamera();

      const html5QrCode = new Html5Qrcode('barcode-file-temp', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        verbose: false,
      });

      const decodedText = await html5QrCode.scanFile(file, true);
      handleSuccess(decodedText);
    } catch (err) {
      console.error('File scan error:', err);
      setCameraError('無法辨識照片中的條碼，請確認照片清晰、光線充足且包含完整的 ISBN 條碼。');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Auto start on modal open, clean up on close
  useEffect(() => {
    if (isOpen) {
      setScannedCode(null);
      setMatchedBook(null);
      setCameraError(null);
      // Small timeout to allow DOM node to render
      const timer = setTimeout(() => {
        startCamera();
      }, 200);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Sample ISBNs for fast kid demonstration
  const sampleBooks = [
    { isbn: '9789864793648', title: '會生氣的山' },
    { isbn: '9789579095808', title: '陶樂蒂的開學日' },
    { isbn: '9789863712190', title: '我和同學吵架了' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Hidden file input element */}
      <div id="barcode-file-temp" className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div
        id="barcode-scanner-modal"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-4 sm:p-5 flex items-center justify-between text-slate-950 border-b-2 border-amber-300">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/90 shadow-md flex items-center justify-center border border-amber-200">
              <ScanBarcode className="w-6 h-6 text-amber-700 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <span>童書條碼掃描機</span>
                <span className="text-[11px] font-bold bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  ISBN / 條碼
                </span>
              </h2>
              <p className="text-xs font-bold text-amber-950/80">
                對準實體童書封底的 978 條碼，一秒找好書！
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-scanner-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow transition-transform active:scale-90"
            title="關閉掃描機"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Camera Area */}
        <div className="relative bg-slate-950 p-2 sm:p-4 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
          {/* HTML5 QR Code Mount Node */}
          <div
            id={readerElementId}
            className="w-full max-w-[360px] rounded-2xl overflow-hidden shadow-inner bg-black"
          />

          {/* Scanning Laser Overlay when Camera is active */}
          {isCameraActive && !scannedCode && (
            <div className="absolute inset-x-8 sm:inset-x-16 top-1/3 bottom-1/3 pointer-events-none flex flex-col justify-between border-2 border-dashed border-amber-400/80 rounded-2xl p-2 bg-amber-400/5">
              {/* Corner Targets */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

              {/* Laser Line */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-bounce my-auto" />
              
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-amber-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-400/40 whitespace-nowrap">
                將書本條碼置於框線內
              </span>
            </div>
          )}

          {/* Starting State Spinner */}
          {isStartingCamera && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-white gap-3 p-4">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm font-bold">正在啟動相機鏡頭...</p>
              <p className="text-xs text-slate-400">請允許瀏覽器相機存取權限</p>
            </div>
          )}

          {/* Scan Success Overlay */}
          {scannedCode && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-white gap-3 p-6 text-center animate-fadeIn z-20">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-emerald-300">掃描成功！</h3>
                <p className="text-sm font-mono font-bold bg-emerald-900/60 px-3 py-1 rounded-full mt-1 border border-emerald-500/40 inline-block">
                  條碼：{scannedCode}
                </p>
              </div>
              {matchedBook && (
                <div className="bg-white/10 p-3 rounded-2xl border border-emerald-400/50 flex items-center gap-3 text-left max-w-xs">
                  <img
                    src={matchedBook.bookImgUrl}
                    alt={matchedBook.title}
                    className="w-12 h-16 object-cover rounded-lg shadow flex-shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-black text-amber-200 line-clamp-1">
                      {matchedBook.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">{matchedBook.author}</p>
                    <span className="text-[10px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded font-black mt-1 inline-block">
                      館藏可借閱
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && !scannedCode && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-slate-200 p-6 text-center gap-3">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-sm font-bold text-rose-300 max-w-sm">{cameraError}</p>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>重新嘗試相機</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>改用照片辨識</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Camera Controls & Quick Tools */}
        <div className="p-4 bg-slate-50 space-y-3 border-t border-slate-200">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Upload image button */}
              <button
                type="button"
                id="upload-barcode-btn"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-300 shadow-sm text-xs flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>上傳條碼照片</span>
              </button>

              {/* Torch Flashlight (if supported) */}
              {hasTorch && isCameraActive && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`px-3 py-1.5 rounded-xl font-bold border text-xs flex items-center gap-1.5 transition-all ${
                    isTorchOn
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isTorchOn ? '關閉手電筒' : '開啟補光燈'}</span>
                </button>
              )}
            </div>

            {/* Switch Camera selector (if multiple cameras exist) */}
            {camerasList.length > 1 && (
              <div className="flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    startCamera(e.target.value);
                  }}
                  className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                >
                  {camerasList.map((cam, idx) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `鏡頭 ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Demo Barcodes for Fast Testing */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>沒有實體書？點選範例條碼快速體驗：</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sampleBooks.map((b) => (
                <button
                  key={b.isbn}
                  type="button"
                  onClick={() => handleSuccess(b.isbn)}
                  className="text-[11px] font-bold bg-white hover:bg-amber-100 hover:text-amber-950 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                >
                  <BookOpen className="w-3 h-3 text-amber-600" />
                  <span>{b.title}</span>
                  <span className="font-mono text-[10px] text-slate-400">({b.isbn.slice(-4)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
