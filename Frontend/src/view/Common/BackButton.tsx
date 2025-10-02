import { useState } from 'react';
import '../../css/StartScreen.css';
import '../../css/Common.css';

interface Props {
    onBack: () => void;
}

export default function BackButton({ onBack }: Props) {

    return (
        <button className="back-btn" onClick={onBack} aria-label="Назад">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>

    );
}
