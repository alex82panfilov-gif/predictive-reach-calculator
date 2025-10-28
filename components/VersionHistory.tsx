
import React from 'react';

const VersionHistory: React.FC = () => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
                История версий
            </h2>
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        <span className="text-cyan-600">v2.0</span> — Глубокая диагностика и Сценарии
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Дата выпуска: Июль 2024</p>
                    <p className="mb-3 text-gray-700">
                        Это крупное обновление превращает калькулятор из простого инструмента расчета в полноценную диагностическую платформу. Главная цель — дать пользователю не только итоговую цифру охвата, но и глубокое понимание структуры, сильных и слабых сторон его медиаплана.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold text-gray-800">Ключевые нововведения:</h4>
                        <ul className="list-disc list-inside space-y-3">
                            <li>
                                <strong className="text-gray-900">Функционал "Сценарии":</strong>
                                <p className="text-gray-600 ml-2 mt-1">
                                    Теперь вы можете сохранять неограниченное количество расчетов, давать им названия и сравнивать ключевые метрики (охват, уверенность модели) в удобной таблице. Это позволяет легко моделировать различные варианты медиамикса и выбирать наиболее эффективный.
                                </p>
                            </li>
                            <li>
                                <strong className="text-gray-900">Блок глубокой диагностики:</strong>
                                <ul className="list-['—'] list-inside ml-6 mt-2 space-y-2 text-gray-600">
                                    <li>
                                        <strong>Анализ эксклюзивного охвата:</strong> Показывает, какие каналы являются "золотым активом" и приводят "свежую" аудиторию, а какие работают на уже охваченную.
                                    </li>
                                    <li>
                                        <strong>Матрица дублирования:</strong> Наглядно демонстрирует "каннибализацию" каналов, помогая выявить избыточные пересечения в медиамиксе.
                                    </li>
                                    <li>
                                        <strong>Анализ потерь (Критичность):</strong> Определяет "несущие конструкции" вашего плана — каналы, удаление которых приведет к наибольшему падению общего охвата.
                                    </li>
                                </ul>
                            </li>
                             <li>
                                <strong className="text-gray-900">Улучшенный интерфейс:</strong>
                                <p className="text-gray-600 ml-2 mt-1">
                                    Переработан дизайн, добавлена система вкладок для удобной навигации, а также внедрены сворачиваемые секции в результатах для более чистого и структурированного отображения данных.
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                         <span className="text-gray-500">v1.0</span> — Базовый калькулятор
                    </h3>
                     <p className="text-sm text-gray-500 mb-4">Дата выпуска: Июнь 2024</p>
                     <p className="mb-3 text-gray-700">
                        Первая версия инструмента, реализующая основную функциональность предиктивного расчета совокупного охвата на основе 12 "опорных" аудиторий.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Расчет совокупного охвата (Net Reach %).</li>
                        <li>Отображение инкрементального прироста охвата от каждого канала.</li>
                        <li>Оценка уверенности модели на основе "близости" к обучающим данным.</li>
                        <li>Возможность загрузки собственного файла с данными.</li>
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default VersionHistory;
