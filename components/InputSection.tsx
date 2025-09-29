import React from 'react';

interface InputSectionProps {
    title: string;
    children: React.ReactNode;
}

const InputSection: React.FC<InputSectionProps> = ({ title, children }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-4">{title}</h2>
            {children}
        </div>
    );
};

export default InputSection;