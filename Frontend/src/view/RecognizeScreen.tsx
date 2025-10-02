import React, { useState, useRef, useMemo, useEffect } from 'react';
import '../css/Recognize.css';
import Header from './Common/Header';
import { BBox } from "./App";

interface Props {
    photoUrl: string;
    bboxes: BBox[];
    originalSet: string[];
    onFinish: () => void;
}

export default function RecognizeScreen({ photoUrl, bboxes, originalSet, onFinish }: Props) {
    const [imgSize, setImgSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const imgRef = useRef<HTMLImageElement>(null);

    const CONFIDENCE_THRESHOLD = 0.7;

    const getItemStyle = (name: string) => {
        const bbox = bboxes.find(b => b.class_name === name);
        if (!bbox) return 'item missing';
        if (bbox.confidence < CONFIDENCE_THRESHOLD) return 'item low-confidence';
        return 'item recognized';
    };

    const updateImgSize = () => {
        if (!imgRef.current) return;
        setImgSize({ width: imgRef.current.clientWidth, height: imgRef.current.clientHeight });
    };

    const handleImageLoad = () => {
        updateImgSize();
    };

    // обновляем размер при ресайзе окна
    useEffect(() => {
        window.addEventListener('resize', updateImgSize);
        return () => window.removeEventListener('resize', updateImgSize);
    }, []);

    const status = useMemo(() => {
        for (const name of originalSet) {
            const bbox = bboxes.find(b => b.class_name === name);
            if (!bbox) return 'Отклонено';
            if (bbox.confidence < CONFIDENCE_THRESHOLD) return 'Ручная проверка';
        }
        return 'OK';
    }, [bboxes, originalSet]);

    return (
        <div className="analysis-screen">
            <div className="glass-card">
                <div className="analysis-card">
                    <div className="photo-container">
                        <img
                            ref={imgRef}
                            src={photoUrl}
                            alt="Фото комплекта"
                            className="photo"
                            onLoad={handleImageLoad}
                        />

                        {imgSize.width > 0 && bboxes.map((box, idx) => {
                            // пересчет координат относительно текущего размера картинки
                            const left = (box.x1 / imgRef.current!.naturalWidth) * imgSize.width;
                            const top = (box.y1 / imgRef.current!.naturalHeight) * imgSize.height;
                            const width = ((box.x2 - box.x1) / imgRef.current!.naturalWidth) * imgSize.width;
                            const height = ((box.y2 - box.y1) / imgRef.current!.naturalHeight) * imgSize.height;

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        position: 'absolute',
                                        left: `${left}px`,
                                        top: `${top}px`,
                                        width: `${width}px`,
                                        height: `${height}px`,
                                        border: '2px solid red',
                                        pointerEvents: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <span style={{
                                        position:'absolute',
                                        top:'-20px',
                                        left:'0',
                                        background:'red',
                                        color:'white',
                                        fontSize:'12px',
                                        padding:'2px 4px',
                                        borderRadius:'4px'
                                    }}>
                                        {box.class_name} ({Math.round(box.confidence * 100)}%)
                                    </span>
                                </div>
                            );
                        })}

                        <button className="primary-btn" onClick={onFinish} style={{ marginTop: 10 }}>
                            Завершить сессию
                        </button>
                    </div>

                    <div className="result-container">
                        <Header text={`Статус: ${status}`} is_back={false} />
                        <div className="items-list">
                            {originalSet.map(name => {
                                const bbox = bboxes.find(b => b.class_name === name);
                                return (
                                    <div key={name} className={getItemStyle(name)}>
                                        <span className="item-name">{name}</span>
                                        <span className="item-confidence">
                                            {bbox ? `${Math.round(bbox.confidence * 100)}%` : 'не найдено'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {(status !== 'OK') && (
                            <p className="hint">
                                {status === 'Отклонено'
                                    ? 'Некоторые инструменты не найдены'
                                    : 'Уверенность некоторых инструментов ниже порога, требуется ручная проверка'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
