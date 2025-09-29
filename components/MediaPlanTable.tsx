import React from 'react';
import type { MediaPlanItem } from '../types';

interface MediaPlanTableProps {
    mediaPlan: MediaPlanItem[];
    setMediaPlan: React.Dispatch<React.SetStateAction<MediaPlanItem[]>>;
}

const MediaPlanTable: React.FC<MediaPlanTableProps> = ({ mediaPlan, setMediaPlan }) => {
    
    const handleReachChange = (index: number, value: string) => {
        let newReach = Number(value);
        if (isNaN(newReach)) newReach = 0;
        if (newReach < 0) newReach = 0;
        if (newReach > 100) newReach = 100;
        
        const updatedPlan = [...mediaPlan];
        updatedPlan[index].reach = newReach;
        setMediaPlan(updatedPlan);
    };

    return (
        <div className="overflow-x-auto max-h-[28rem] pr-2">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-500 uppercase sticky top-0 bg-white z-10">
                    <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">
                            Медиаканал
                        </th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">
                            Охват, %
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {mediaPlan.map((item, index) => (
                        <tr key={item.name} className="border-b border-gray-200 last:border-b-0">
                            <th scope="row" className="px-4 py-3 font-medium whitespace-nowrap">
                                {item.name}
                            </th>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        value={item.reach}
                                        onChange={(e) => handleReachChange(index, e.target.value)}
                                        min="0"
                                        max="100"
                                        step="1"
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                    />
                                    <input
                                        type="number"
                                        value={item.reach === 0 ? '' : item.reach}
                                        onChange={(e) => handleReachChange(index, e.target.value)}
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                        className="w-20 bg-gray-50 border-gray-300 border rounded-md shadow-sm py-1 px-2 text-right focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MediaPlanTable;
