import React from 'react';

interface DataTableProps {
    headers: string[];
    rows: (string | number)[][];
    title: string;
}

const DataTable: React.FC<DataTableProps> = ({ headers, rows, title }) => (
    <div>
        {title && <h4 className="text-lg font-bold text-gray-800 mt-6 mb-3">{title}</h4>}
        <div className="overflow-x-auto max-h-72 pr-2 border border-gray-200 rounded-lg bg-white">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                        {headers.map(header => <th key={header} scope="col" className="px-4 py-3 font-semibold">{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-gray-200">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className={`px-4 py-3 ${typeof cell === 'string' && cell.includes('%') ? 'font-mono' : ''}`}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default DataTable;
