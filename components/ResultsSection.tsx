import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CalculationResult, MediaPlanItem } from '../types';
import DataTable from './DataTable';
import CollapsibleSection from './CollapsibleSection';

const COLORS = ['#00A9FF', '#33B9FF', '#66C9FF', '#99D9FF', '#CCE9FF', '#008ECC', '#0073B2', '#005999', '#003F7F', '#002566'];

interface ResultsSectionProps {
    results: CalculationResult;
    mediaPlan: MediaPlanItem[];
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ results, mediaPlan }) => {
    
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
            ["Медиаканал", "Индивид. охват", "Накопл. охват", "Прирост охвата"],
            ...incrementalData.map(s => [
                s.name,
                { v: s.reach, t: 'n', z: '0.0%' },
                { v: s.cumulative_reach, t: 'n', z: '0.0%' },
                { v: s.increment, t: 'n', z: '0.0%' }
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

        // Устанавливаем ширину колонок
        ws['!cols'] = [
            { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
        ];
        
        // Объединяем ячейку заголовка
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });

        XLSX.utils.book_append_sheet(wb, ws, "Отчет по охвату");
        XLSX.writeFile(wb, "reach_report.xlsx");
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

            <button
                onClick={handleExport}
                className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-colors duration-300"
            >
                📄 Скачать отчет (.xlsx)
            </button>

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

                <CollapsibleSection title="Таблица: Накопленный охват по шагам" defaultOpen={false}>
                    <DataTable headers={["Медиаканал", "Индивид. охват", "Накопл. охват", "Прирост"]} rows={incrementalTableRows} />
                </CollapsibleSection>
                
                 {kFactorsTableRows.length > 0 && (
                    <CollapsibleSection title="Спрогнозированные K-коэффициенты" defaultOpen={false}>
                         <p className="text-sm text-gray-600 mb-4">Эти коэффициенты были рассчитаны для вашей целевой аудитории и использовались для определения пересечения каналов.</p>
                         <DataTable headers={["Пара каналов", "K-фактор"]} rows={kFactorsTableRows} />
                    </CollapsibleSection>
                 )}
            </div>
        </div>
    );
};

export default ResultsSection;