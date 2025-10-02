import { useState } from 'react';
import '../css/StartScreen.css';

interface Props {
    goNext: () => void;
}

export default function StartScreen({ goNext }: Props) {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="screen">
            {!showInfo && (
                <div className="glass-card">
                    <h1>Выдача и приём<br />инструментов</h1>
                    <div className="buttons">
                        <button className="primary-btn" onClick={goNext}>Начать</button>
                        <button className="secondary-btn" onClick={() => setShowInfo(true)}>Информация</button>
                    </div>
                </div>
            )}

            {showInfo && (
                <div className="glass-card info-card">
                    <button className="close-btn" onClick={() => setShowInfo(false)}>×</button>
                    <h2>Информация</h2>
                    <p>
                        Здесь можно разместить любую полезную информацию для пользователя:
                        правила работы, инструкции, контактные данные и т.д.
                    </p>
                </div>
            )}
        </div>
    );
}
