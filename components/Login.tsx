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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password === CORRECT_PASSWORD) {
            onLoginSuccess();
        } else {
            setError('Неверный пароль. Попробуйте снова.');
        }
    };

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
                <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>
        </div>
    );
};

export default Login;
