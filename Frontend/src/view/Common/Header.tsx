import '../../css/StartScreen.css';
import '../../css/Common.css';
import BackButton from './BackButton';

interface Props {
    onBack?: () => void;   // теперь необязательный
    text: string;
    is_back: boolean;
}

export default function Header({ onBack, text, is_back }: Props) {
    return (
        <div className="header-wrapper">
            {is_back && onBack && <BackButton onBack={onBack} />}
            <div className="header-group">
                <h1>{text}</h1>
            </div>
        </div>
    );
}
