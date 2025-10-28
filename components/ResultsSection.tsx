
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CalculationResult, MediaPlanItem } from '../types';
import DataTable from './DataTable';
import CollapsibleSection from './CollapsibleSection';

const COLORS = ['#00A9FF', '#33B9FF', '#66C9FF', '#99D9FF', '#CCE9FF', '#008ECC', '#0073B2', '#005999', '#003F7F', '#002566'];

interface ResultsSectionProps {
    results: CalculationResult;
    mediaPlan: MediaPlanItem[];
    onSaveScenario: (name: string, resultsToSave: CalculationResult, mediaPlanToSave: MediaPlanItem[]) => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ results, mediaPlan, onSaveScenario }) => {
    
    const [isSaving, setIsSaving] = useState(false);
    const [scenarioName, setScenarioName] = useState(`Сценарий от ${new Date().toLocaleDateString()}`);

    const formattedIncrementalData = results.incrementalData.map(d => ({
        ...d,
        increment_pct: d.increment * 100,
        reach_pct: d.reach * 100,
        cumulative_reach_pct: d.cumulative_reach * 100
    }));
    
    const confidenceColor = {
        High: 'text-green-600 bg-green-50 border-green-200',
        Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        Low: 'text-red-600 bg-red-50 border-red-200',
    };

    const confidenceText = {
        High: 'Высокая',
        Medium: 'Средняя',
        Low: 'Низкая',
    };

    const incrementalTableRows = results.incrementalData.map(s => [
        s.name,
        `${(s.reach * 100).toFixed(1)}%`,
        `${(s.cumulative_reach * 100).toFixed(1)}%`,
        `+${(s.increment * 100).toFixed(1)}%`,
        `${(s.exclusivity * 100).toFixed(1)}%`,
    ]);

    const exclusionTableRows = [...results.exclusionAnalysis]
        .sort((a, b) => b.loss - a.loss)
        .map(item => [
            item.name,
            `-${(item.loss * 100).toFixed(1)}%`,
        ]);

     const kFactorsTableRows = results.kFactors.map(k => [k.pair, k.value.toFixed(2)]);

    const handleExport = () => {
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            alert("Не удалось загрузить библиотеку для экспорта в Excel. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.");
            return;
        }

        const { header, finalReach, confidence, incrementalData, kFactors, grossReach } = results;

        const dataToExport = [
            ["ОТЧЕТ ПО РАСЧЕТУ СОВОКУПНОГО ОХВАТА"],
            [],
            ["ПАРАМЕТРЫ"],
            ["Параметр", "Значение"],
            [header.split(':')[0], header.split(' (')[0].split(': ')[1]],
            ["Регион", header.split('(')[1].split(')')[0]],
            [],
            ["КЛЮЧЕВЫЕ МЕТРИКИ"],
            ["Метрика", "Значение"],
            ["Совокупный охват (Net Reach)", { v: finalReach, t: 'n', z: '0.0%' }],
            ["Суммарный охват (Gross Reach)", { v: grossReach, t: 'n', z: '0.0%' }],
            ["Уверенность модели", confidenceText[confidence]],
            [],
            ["МЕДИАПЛАН"],
            ["Медиаканал", "Охват, %"],
            ...mediaPlan.filter(item => item.reach > 0).map(item => [item.name, item.reach]),
            [],
            ["ИНКРЕМЕНТАЛЬНЫЙ ОХВАТ"],
            ["Медиаканал", "Индивид. охват", "Накопл. охват", "Прирост", "Эксклюзивность"],
            ...incrementalData.map(s => [
                s.name,
                { v: s.reach, t: 'n', z: '0.0%' },
                { v: s.cumulative_reach, t: 'n', z: '0.0%' },
                { v: s.increment, t: 'n', z: '0.0%' },
                { v: s.exclusivity, t: 'n', z: '0.0%' }
            ]),
            []
        ];

        if(kFactors && kFactors.length > 0) {
            dataToExport.push(["K-КОЭФФИЦИЕНТЫ"]);
            dataToExport.push(["Пара каналов", "K-фактор"]);
            dataToExport.push(...kFactors.map(k => [k.pair, { v: k.value, t: 'n', z: '0.00' }]));
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);

        ws['!cols'] = [
            { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
        ];
        
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } });

        XLSX.utils.book_append_sheet(wb, ws, "Отчет по охвату");
        XLSX.writeFile(wb, "reach_report.xlsx");
    };

    const handleSaveClick = () => {
        onSaveScenario(scenarioName, results, mediaPlan);
        setIsSaving(false);
    };
    
    return (
        <div className="w-full animate-fade-in space-y-6">
            <h3 className="text-xl font-bold text-cyan-600">{results.header}</h3>
            
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Совокупный охват (Reach %)</div>
                    <div className="text-5xl font-bold text-gray-900">{(results.finalReach * 100).toFixed(1)}%</div>
                </div>
                <div className={`p-4 rounded-xl border ${confidenceColor[results.confidence]}`}>
                    <div className="text-sm mb-1">Уверенность модели</div>
                    <div className="text-3xl font-bold pt-2">{confidenceText[results.confidence]}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!isSaving ? (
                    <button
                        onClick={() => setIsSaving(true)}
                        className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-colors duration-300"
                    >
                        💾 Сохранить сценарий
                    </button>
                ) : (
                    <div className="sm:col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-2">
                        <input
                            type="text"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                            placeholder="Название сценария"
                            className="w-full bg-white border-gray-300 border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button onClick={handleSaveClick} className="bg-blue-600 text-white hover:bg-blue-500 font-semibold py-2 px-3 rounded-lg text-sm transition">Сохранить</button>
                        <button onClick={() => setIsSaving(false)} className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold py-2 px-3 rounded-lg text-sm transition">Отмена</button>
                    </div>
                )}
                
                <button
                    onClick={handleExport}
                    className={`w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-colors duration-300 ${isSaving ? 'sm:col-span-2' : ''}`}
                >
                    📄 Скачать отчет (.xlsx)
                </button>
            </div>


            <div className="space-y-4 pt-2">
                <CollapsibleSection title="Источник данных для прогноза" defaultOpen={true}>
                     <p className="text-sm text-gray-600">
                        Прогноз построен на основе наиболее близких аудиторий из базы данных:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-800 font-medium my-2 ml-2">
                        {results.sourceAudiences.map(aud => <li key={aud}>{aud}</li>)}
                    </ul>
                    <p className="text-xs text-gray-500">{results.dataSourceMsg}</p>
                </CollapsibleSection>

                <CollapsibleSection title="📈 Анализ инкрементального охвата" defaultOpen={true}>
                    <div className="w-full h-72">
                        <ResponsiveContainer>
                            <BarChart data={formattedIncrementalData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" domain={[0, 'dataMax + 5']} tickFormatter={(tick) => `${tick}%`} stroke="#6b7280" tick={{ fill: '#4b5563' }} />
                                <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fill: '#4b5563' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        borderColor: '#e5e7eb',
                                        color: '#1f2937',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value: number, name: string, props) => {
                                        const { payload } = props;
                                        return [
                                            `${value.toFixed(1)}%`,
                                            `Прирост (Всего: ${payload.cumulative_reach_pct.toFixed(1)}%)`
                                        ];
                                    }}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Bar dataKey="increment_pct" stackId="a" background={{ fill: 'rgba(0,0,0,0.04)' }}>
                                     {formattedIncrementalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Таблица: Накопленный и эксклюзивный охват" defaultOpen={false}>
                     <p className="text-sm text-gray-600 mb-4">
                        <b>Эксклюзивность</b> показывает, какой процент от собственного охвата канала составил его уникальный вклад в общий охват.
                    </p>
                    <DataTable title="" headers={["Медиаканал", "Индивид. охват", "Накопл. охват", "Прирост", "Эксклюзивность"]} rows={incrementalTableRows} />
                </CollapsibleSection>
                
                 <CollapsibleSection title="🧬 Анализ дублирования (Матрица пересечений)" defaultOpen={false}>
                    <p className="text-sm text-gray-600 mb-4">
                        Таблица показывает, какая доля аудитории канала в <b>строке</b> уже охвачена каналом в <b>столбце</b>. Помогает выявить "каннибализацию" каналов.
                    </p>
                    <DataTable
                        title=""
                        headers={results.duplicationMatrix.headers}
                        rows={results.duplicationMatrix.rows}
                    />
                </CollapsibleSection>

                <CollapsibleSection title="⚠️ Анализ потерь при исключении (Критичность)" defaultOpen={false}>
                     <p className="text-sm text-gray-600 mb-4">
                        Таблица показывает, на сколько процентных пунктов упадет совокупный охват, если полностью убрать канал из медиаплана.
                    </p>
                    <DataTable
                        title=""
                        headers={["Исключенный канал", "Потеря охвата (п.п.)"]}
                        rows={exclusionTableRows}
                    />
                </CollapsibleSection>
                
                 {kFactorsTableRows.length > 0 && (
                    <CollapsibleSection title="Спрогнозированные K-коэффициенты" defaultOpen={false}>
                         <p className="text-sm text-gray-600 mb-4">Эти коэффициенты были рассчитаны для вашей целевой аудитории и использовались для определения пересечения каналов.</p>
                         <DataTable title="" headers={["Пара каналов", "K-фактор"]} rows={kFactorsTableRows} />
                    </CollapsibleSection>
                 )}
            </div>
        </div>
    );
};

export default ResultsSection;