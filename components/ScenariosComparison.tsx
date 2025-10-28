
import React from 'react';
import type { SavedScenario } from '../types';

interface ScenariosComparisonProps {
    scenarios: SavedScenario[];
    setScenarios: React.Dispatch<React.SetStateAction<SavedScenario[]>>;
    onLoadScenario: (scenario: SavedScenario) => void;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


const ScenariosComparison: React.FC<ScenariosComparisonProps> = ({ scenarios, setScenarios, onLoadScenario }) => {
    
    const handleDelete = (id: number) => {
        if (confirm("Вы уверены, что хотите удалить этот сценарий?")) {
            setScenarios(scenarios.filter(s => s.id !== id));
        }
    };

    const confidenceColor = {
        High: 'text-green-600',
        Medium: 'text-yellow-600',
        Low: 'text-red-600',
    };
     const confidenceText = {
        High: 'Высокая',
        Medium: 'Средняя',
        Low: 'Низкая',
    };

    if (scenarios.length === 0) {
        return (
             <div className="bg-white p-8 rounded-2xl border border-gray-200 animate-fade-in text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Сохраненных сценариев пока нет</h2>
                <p className="text-gray-600">
                    Рассчитайте медиаплан на вкладке "Калькулятор" и нажмите "Сохранить сценарий", чтобы добавить его сюда для сравнения.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 animate-fade-in">
             <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
                Сравнение сохраненных сценариев
            </h2>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-semibold">Название</th>
                            <th scope="col" className="px-4 py-3 font-semibold text-center">Совокупный охват</th>
                            <th scope="col" className="px-4 py-3 font-semibold text-center">Уверенность</th>
                            <th scope="col" className="px-4 py-3 font-semibold">ЦА</th>
                            <th scope="col" className="px-4 py-3 font-semibold text-center">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scenarios.map(scenario => (
                            <tr key={scenario.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-4 font-medium">{scenario.name}</td>
                                <td className="px-4 py-4 text-center font-bold text-lg text-cyan-700">{(scenario.results.finalReach * 100).toFixed(1)}%</td>
                                <td className={`px-4 py-4 text-center font-bold ${confidenceColor[scenario.results.confidence]}`}>{confidenceText[scenario.results.confidence]}</td>
                                <td className="px-4 py-4">{scenario.targetAudience} ({scenario.city})</td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => onLoadScenario(scenario)}
                                            className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200 font-semibold py-2 px-3 rounded-lg text-xs transition"
                                            title="Загрузить этот сценарий в калькулятор"
                                        >
                                            Загрузить
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(scenario.id)}
                                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg transition"
                                            title="Удалить сценарий"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScenariosComparison;