import React, { useState, useRef, useEffect } from 'react';
import '../css/ToolStation.css';

interface RecognitionResult {
    matchPercent: number;
    missingTools: string[];
}

const ToolStationComponent: React.FC = () => {
    const [tabNumber, setTabNumber] = useState('');
    const [step, setStep] = useState<'start' | 'action' | 'capture' | 'review' | 'processing' | 'result'>('start');
    const [photo, setPhoto] = useState<string | null>(null);
    const [result, setResult] = useState<RecognitionResult | null>(null);
    const [manualCheck, setManualCheck] = useState(false);

    const [streaming, setStreaming] = useState(false);
    const [cameraId, setCameraId] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);

    // Получаем список камер
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const videoInputs = devices.filter(d => d.kind === 'videoinput');
            setCameras(videoInputs);
            if (videoInputs.length > 0) setCameraId(videoInputs[0].deviceId);
        });
    }, []);

    const startCamera = async () => {
        if (!cameraId) return;
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: cameraId } });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStreaming(true);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(t => t.stop());
        }
        setStreaming(false);
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        setPhoto(canvas.toDataURL('image/png'));
        stopCamera();
        setStep('review');
    };

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) readFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) readFile(file);
    };

    const readFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => setPhoto(reader.result as string);
        reader.readAsDataURL(file);
        setStep('review');
    };

    const processPhoto = async () => {
        setStep('processing');
        // имитация запроса к ML-сервису
        setTimeout(() => {
            const success = Math.random() > 0.3;
            if (success) {
                setResult({ matchPercent: 100, missingTools: [] });
            } else {
                setResult({ matchPercent: 91, missingTools: ['Отвертка на смещенный крест'] });
            }
            setStep('result');
        }, 3000);
    };

    const resetAll = () => {
        setTabNumber('');
        setPhoto(null);
        setResult(null);
        setManualCheck(false);
        setStep('start');
    };

    return (
        <div className="tool-station">
            {step === 'start' && (
                <div className="card">
                    <h2>Введите табельный номер</h2>
                    <input
                        type="text"
                        value={tabNumber}
                        onChange={e => setTabNumber(e.target.value)}
                        placeholder="Напр. Т-18473"
                    />
                    <button onClick={() => tabNumber && setStep('action')}>Начать работу</button>
                </div>
            )}

            {step === 'action' && (
                <div className="card">
                    <h2>{tabNumber}</h2>
                    <p>Выберите действие:</p>
                    <button onClick={() => setStep('capture')}>Сдать инструменты</button>
                </div>
            )}

            {step === 'capture' && (
                <div className="card">
                    <h2>Сделайте фото инструментов</h2>
                    <div className="capture-section">
                        <div className="camera-controls">
                            <select value={cameraId} onChange={e => setCameraId(e.target.value)}>
                                {cameras.map(cam => (
                                    <option key={cam.deviceId} value={cam.deviceId}>{cam.label || 'Камера'}</option>
                                ))}
                            </select>
                            {!streaming
                                ? <button onClick={startCamera}>Включить камеру</button>
                                : <button onClick={takePhoto}>Сделать фото</button>}
                            {streaming && <button onClick={stopCamera}>Остановить</button>}
                        </div>
                        <video ref={videoRef} autoPlay playsInline className="preview"></video>
                        <div
                            className="drop-area"
                            onDrop={handleFileDrop}
                            onDragOver={e => e.preventDefault()}
                        >
                            Перетащите фото сюда или выберите файл
                            <input type="file" accept="image/*" onChange={handleFileSelect} />
                        </div>
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
            )}

            {step === 'review' && photo && (
                <div className="card">
                    <h2>Проверьте фото</h2>
                    <img src={photo} alt="preview" className="preview" />
                    <button onClick={processPhoto}>Отправить на проверку</button>
                    <button onClick={resetAll}>Заново</button>
                </div>
            )}

            {step === 'processing' && (
                <div className="card">
                    <h2>Идет распознавание...</h2>
                    <div className="loader"></div>
                </div>
            )}

            {step === 'result' && result && (
                <div className="card">
                    <h2
                        style={{ color: result.matchPercent === 100 || manualCheck ? 'green' : 'red' }}
                    >
                        {result.matchPercent === 100 || manualCheck
                            ? 'Комплект принят!'
                            : 'Обнаружено несоответствие!'}
                    </h2>
                    <p>Совпадение: {manualCheck ? 'Подтверждено вручную' : `${result.matchPercent}%`}</p>
                    {result.missingTools.length > 0 && !manualCheck && (
                        <p>Не найдено: {result.missingTools.join(', ')}</p>
                    )}
                    {!manualCheck && result.matchPercent < 100 && (
                        <button onClick={() => setManualCheck(true)}>Подтвердить вручную</button>
                    )}
                    <button onClick={resetAll}>Новая операция</button>
                </div>
            )}
        </div>
    );
};

export default ToolStationComponent;
