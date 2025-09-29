import React, { useState, useCallback, useEffect } from 'react';
import type { MediaPlanItem, CalculationResult } from './types';
import { INITIAL_MEDIA_PLAN } from './constants';
import { mainReachCalculator } from './services/calculatorService';
import Header from './components/Header';
import InputSection from './components/InputSection';
import MediaPlanTable from './components/MediaPlanTable';
import ResultsSection from './components/ResultsSection';
import LoadingSpinner from './components/LoadingSpinner';
import Methodology from './components/Methodology';
import DataSettings from './components/DataSettings';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState('calculator');
    const [targetAudience, setTargetAudience] = useState<string>('All 18-44');
    const [city, setCity] = useState<string>('РФ');
    const [mediaPlan, setMediaPlan] = useState<MediaPlanItem[]>(INITIAL_MEDIA_PLAN);
    const [dataFile, setDataFile] = useState<File | null>(null);

    const [results, setResults] = useState<CalculationResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        try {
            const result = await mainReachCalculator(mediaPlan, targetAudience, city, dataFile);
            if ('error' in result) {
                setError(result.error);
            } else {
                setResults(result);
            }
        } catch (e) {
            setError(e instanceof Error ? `Произошла непредвиденная ошибка: ${e.message}` : 'Произошла неизвестная ошибка.');
        } finally {
            setIsLoading(false);
        }
    }, [mediaPlan, targetAudience, city, dataFile]);

    const TabButton: React.FC<{ tabName: string; label: string }> = ({ tabName, label }) => {
        const isActive = activeTab === tabName;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`w-full text-center px-4 py-3 text-sm sm:text-base font-bold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 ${
                    isActive
                        ? 'bg-white text-cyan-700 shadow-md'
                        : 'bg-transparent text-gray-600 hover:bg-white/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="min-h-screen text-gray-800 p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <Header />

                <div className="mt-8 mb-8">
                    <nav className="p-1.5 grid grid-cols-3 sm:flex sm:space-x-2 bg-gray-200/80 rounded-xl" aria-label="Tabs">
                        <TabButton tabName="calculator" label="Калькулятор" />
                        <TabButton tabName="data" label="Данные" />
                        <TabButton tabName="methodology" label="Методика" />
                    </nav>
                </div>

                <main>
                    {activeTab === 'calculator' && (
                         <div className="animate-fade-in">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* INPUTS COLUMN */}
                                <div className="flex flex-col gap-8">
                                    <InputSection title="1. Задайте таргет и регион">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="target_audience_input" className="block text-sm font-medium text-gray-600 mb-2">Целевая аудитория</label>
                                                <input
                                                    id="target_audience_input"
                                                    type="text"
                                                    value={targetAudience}
                                                    onChange={(e) => setTargetAudience(e.target.value)}
                                                    placeholder="Пример: Все 18-44 BC"
                                                    className="w-full bg-white border-gray-300 border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Задавайте аудиторию в английской раскладке, например: All 18-44 BC</p>
                                            </div>
                                            <div>
                                                <label htmlFor="city_input" className="block text-sm font-medium text-gray-600 mb-2">Город / Регион</label>
                                                <select
                                                    id="city_input"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    className="w-full bg-white border-gray-300 border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                >
                                                    <option>РФ</option>
                                                    <option>Москва</option>
                                                    <option>Санкт-Петербург</option>
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">Доступен только расчет для РФ. Другие регионы в разработке.</p>
                                            </div>
                                        </div>
                                    </InputSection>
                                    
                                    <InputSection title="2. Укажите охват медиаканалов (%)">
                                        <MediaPlanTable mediaPlan={mediaPlan} setMediaPlan={setMediaPlan} />
                                    </InputSection>
                                    
                                    <button
                                        onClick={handleCalculate}
                                        disabled={isLoading}
                                        className="w-full flex justify-center items-center gap-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors duration-300"
                                    >
                                        {isLoading ? (
                                            <>
                                                <LoadingSpinner />
                                                Расчет...
                                            </>
                                        ) : (
                                            'Рассчитать совокупный охват'
                                        )}
                                    </button>
                                </div>

                                {/* RESULTS COLUMN */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 min-h-[500px] flex flex-col">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-4">3. Результат</h2>
                                    <div className="flex-grow flex items-center justify-center">
                                        {isLoading && <LoadingSpinner large />}
                                        {error && <div className="text-center text-red-700 bg-red-100 p-4 rounded-lg border border-red-200">{error}</div>}
                                        {!isLoading && !error && !results && (
                                            <div className="text-center text-gray-500">
                                                <p className="text-lg">Ваши результаты появятся здесь.</p>
                                                <p>Заполните данные и нажмите 'Рассчитать'.</p>
                                            </div>
                                        )}
                                        {results && <ResultsSection results={results} mediaPlan={mediaPlan} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <DataSettings 
                            dataFile={dataFile} 
                            setDataFile={setDataFile}
                        />
                    )}

                    {activeTab === 'methodology' && (
                        <Methodology />
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;