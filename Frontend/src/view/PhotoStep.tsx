import { useState, useRef } from 'react';
import '../css/Photo.css';
import Header from './Common/Header';
import {Order} from "./App";

interface Props {
    onNext: (photoData: any) => void; // теперь передаем весь объект
    onBack?: () => void;
    employeeId: string;
    order: Order;
}

export default function PhotoStep({ onNext, onBack, employeeId, order }: Props) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [isCam, setIsCam] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startSession = async () => {
        try {
            const response = await fetch('http://localhost:8000/sessions/', {
                method: 'POST',
                headers: { 'accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: employeeId,
                    order_id: order.order_id,
                    actual_tools: order.actual_tools
                })
            });
            if (!response.ok) throw new Error('Не удалось начать сессию');
            const data = await response.json();
            setSessionId(data.id);
            return data.id;
        } catch (err) {
            console.error(err);
            alert('Ошибка при начале сессии');
            return null;
        }
    };

    const uploadPhoto = async (file: File, session_id: string) => {
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('session_id', session_id);

            const response = await fetch(`http://localhost:8000/sessions/${session_id}/upload-photo`, {
                method: 'POST',
                headers: { 'accept': 'application/json' },
                body: formData
            });

            if (!response.ok) throw new Error('Не удалось загрузить фото');

            const data = await response.json(); // сохраняем весь ответ
            setPhotoUrl(data.photo ? `http://localhost:8000/${data.photo}` : null);
            return data;
        } catch (err) {
            console.error(err);
            alert('Ошибка при загрузке фото');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handlePhotoFile = async (file: File, dataUrl: string) => {
        setPhotoUrl(dataUrl); // локальное фото для отображения
        const sid = sessionId ?? await startSession();
        if (!sid) return;

        const uploadedData = await uploadPhoto(file, sid);
        if (uploadedData) {
            onNext({
                photo: dataUrl,
                bboxes: uploadedData.detected_tools,
                status: uploadedData.status
            });
        }
    };

    const startCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            videoRef.current?.play();
            setIsCam(true);
        } catch {
            alert('Не удалось получить доступ к камере');
        }
    };

    const takePhoto = async () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'photo.png', { type: 'image/png' });

        await handlePhotoFile(file, dataUrl);

        streamRef.current?.getTracks().forEach(track => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsCam(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async () => await handlePhotoFile(file, reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file?.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async () => await handlePhotoFile(file, reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="screen">
            <div className="glass-card">
                <Header text="Сделайте фото" is_back={!!onBack} onBack={onBack} />

                {!photoUrl ? (
                    <>
                        <video
                            ref={videoRef}
                            className={`video-preview ${!isCam ? 'hidden' : ''}`}
                            autoPlay
                            muted
                            playsInline
                        />
                        <div className="buttons">
                            {!isCam && <button className="primary-btn" onClick={startCamera}>Включить камеру</button>}
                            {isCam && <button className="primary-btn" onClick={takePhoto} disabled={isUploading}>Сделать фото</button>}
                        </div>
                        {!isCam && (
                            <>
                                <p>или</p>
                                <div
                                    className="drag-drop-area"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={triggerFileSelect}
                                >
                                    Перетащите изображение сюда или кликните, чтобы выбрать
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            </>
                        )}
                        {isUploading && <p>Загрузка...</p>}
                    </>
                ) : (
                    <>
                        <img src={photoUrl} alt="Фото" className="photo-preview" />
                        <div className="buttons">
                            <button className="primary-btn" onClick={() => onNext({ photo: photoUrl, sessionId })} disabled={isUploading}>
                                {isUploading ? 'Загрузка...' : 'Далее'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
