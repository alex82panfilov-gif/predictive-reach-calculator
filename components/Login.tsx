
import React, { useState } from 'react';

interface LoginProps {
    onLoginSuccess: () => void;
}

// A simple hardcoded password for demonstration purposes.
// In a real application, this should be handled securely on a server.
const CORRECT_PASSWORD = 'reach_pro';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRequestingPassword, setIsRequestingPassword] = useState(false);
    const [requesterName, setRequesterName] = useState('');
    const [requesterEmail, setRequesterEmail] = useState('');
    const [requestSentMessage, setRequestSentMessage] = useState('');


    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password === CORRECT_PASSWORD) {
            onLoginSuccess();
        } else {
            setError('Неверный пароль. Попробуйте снова.');
        }
    };

    const handleRequestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRequestSentMessage('');
        setError('');

        const subject = 'Запрос пароля для "Прогнозного калькулятора совокупного охвата"';
        const body = `Здравствуйте!\n\nПрошу предоставить пароль для доступа к калькулятору.\n\nМои данные:\nИмя: ${requesterName}\nEmail: ${requesterEmail}\n\nСпасибо!`;
        const mailtoLink = `mailto:a.panfilov@inbox.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        try {
            // Using location.href is a reliable way to open the mail client
            window.location.href = mailtoLink;
            setRequestSentMessage('Ваш почтовый клиент должен открыться для отправки запроса. После отправки письма, ожидайте пароль на указанную почту.');
        } catch (err) {
            console.error('Failed to open mailto link:', err);
            setError('Не удалось открыть почтовый клиент. Вы можете отправить запрос вручную на a.panfilov@inbox.ru');
        }
    };
    
    if (isRequestingPassword) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Запрос пароля
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Заполните форму, и мы отправим вам пароль.
                        </p>
                    </div>
                    <form onSubmit={handleRequestSubmit} className="space-y-4">
                         <div>
                            <label htmlFor="name-input" className="sr-only">Ваше имя</label>
                            <input
                                id="name-input"
                                type="text"
                                value={requesterName}
                                onChange={(e) => setRequesterName(e.target.value)}
                                placeholder="Ваше имя"
                                required
                                className="w-full bg-white border-gray-300 border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="email-input" className="sr-only">Ваш Email</label>
                            <input
                                id="email-input"
                                type="email"
                                value={requesterEmail}
                                onChange={(e) => setRequesterEmail(e.target.value)}
                                placeholder="Ваш Email"
                                required
                                className="w-full bg-white border-gray-300 border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {requestSentMessage && (
                            <div className="text-center text-green-700 text-sm bg-green-50 p-3 rounded-lg border border-green-200" role="status">
                                {requestSentMessage}
                            </div>
                        )}
                        {error && (
                             <div className="text-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200" role="alert">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors duration-300"
                            >
                                Отправить запрос
                            </button>
                        </div>
                    </form>
                    <div className="text-center">
                         <button onClick={() => setIsRequestingPassword(false)} className="font-medium text-sm text-cyan-600 hover:text-cyan-500">
                            Назад ко входу
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Вход в систему
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Пожалуйста, введите пароль для доступа к калькулятору.
                    </p>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password-input" className="sr-only">Пароль</label>
                        <input
                            id="password-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            required
                            className="w-full bg-white border-gray-300 border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center"
                            aria-describedby="password-error"
                        />
                    </div>
                    
                    {error && (
                        <div id="password-error" className="text-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200" role="alert">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors duration-300"
                        >
                            Войти
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <p className="text-gray-500">
                        Нет пароля?{' '}
                        <button onClick={() => { setIsRequestingPassword(true); setError(''); setPassword(''); }} className="font-medium text-cyan-600 hover:text-cyan-500">
                            Запросить доступ
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;