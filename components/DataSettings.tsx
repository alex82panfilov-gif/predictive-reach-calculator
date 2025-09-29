import React from 'react';
import FileUploader from './FileUploader';
import InputSection from './InputSection';

interface DataSettingsProps {
    dataFile: File | null;
    setDataFile: (file: File | null) => void;
}

const DataSettings: React.FC<DataSettingsProps> = ({ dataFile, setDataFile }) => {
    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in">
            <InputSection title="Обучающие данные (опционально)">
                <FileUploader dataFile={dataFile} setDataFile={setDataFile} />
                <p className="text-xs text-gray-500 mt-3">* Если файл не загружен, расчеты будут использовать стандартную внутреннюю базу данных.</p>
                <p className="text-xs text-gray-500 mt-1">* Файл должен быть в формате .csv и иметь ту же структуру, что и стандартная база.</p>
            </InputSection>
        </div>
    );
};

export default DataSettings;
