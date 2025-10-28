
import React, { useRef } from 'react';

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


interface FileUploaderProps {
    dataFile: File | null;
    setDataFile: (file: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ dataFile, setDataFile }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setDataFile(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleClearFile = () => {
        setDataFile(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
            />
            <button
                onClick={handleButtonClick}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
                Загрузить data.csv
            </button>
            {dataFile && (
                <div className="mt-3 flex justify-between items-center bg-cyan-50 border border-cyan-200 p-2 rounded-lg">
                    <p className="text-sm text-cyan-700 truncate pr-2">
                        {dataFile.name}
                    </p>
                    <button onClick={handleClearFile} className="text-gray-500 hover:text-gray-800 p-1 rounded-full transition-colors">
                       <XIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUploader;