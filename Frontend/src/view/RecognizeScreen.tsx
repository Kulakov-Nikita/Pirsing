import React, { useState, useRef, useMemo } from 'react';
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
    const [imgSize, setImgSize] = useState<{ width: number; height: number }>({ width: 1, height: 1 });
    const imgRef = useRef<HTMLImageElement>(null);

    const CONFIDENCE_THRESHOLD = 0.7;

    const getItemStyle = (name: string) => {
        const bbox = bboxes.find(b => b.class_name === name);
        if (!bbox) return 'item missing';
        if (bbox.confidence < CONFIDENCE_THRESHOLD) return 'item low-confidence';
        return 'item recognized';
    };

    const handleImageLoad = () => {
        if (!imgRef.current) return;
        setImgSize({ width: imgRef.current.naturalWidth, height: imgRef.current.naturalHeight });
    };

    // вычисляем статус динамически
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

                        {bboxes.map((box, idx) => {
                            const left = (box.x1 / imgSize.width) * 100;
                            const top = (box.y1 / imgSize.height) * 100;
                            const width = ((box.x2 - box.x1) / imgSize.width) * 100;
                            const height = ((box.y2 - box.y1) / imgSize.height) * 100;

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        position: 'absolute',
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        width: `${width}%`,
                                        height: `${height}%`,
                                        border: '2px solid red',
                                        pointerEvents: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '-20px',
                                            left: '0',
                                            background: 'red',
                                            color: 'white',
                                            fontSize: '12px',
                                            padding: '2px 4px',
                                            borderRadius: '4px'
                                        }}
                                    >
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
