import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                📊 Прогнозный калькулятор совокупного охвата
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                Этот инструмент рассчитывает совокупный охват (Reach %) для медиаплана с учетом пересечения аудиторий. Модель прогнозирует пересечения на основе обучающих данных.
            </p>
        </header>
    );
};

export default Header;