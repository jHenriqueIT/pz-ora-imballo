import React, { useState, useEffect } from 'react';

interface EditableFieldProps {
    initialValue: number;
    onSave: (newValue: number) => void;
    spanClassName?: string;
    inputClassName?: string;
}

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('de-DE').format(Math.round(num));
};

const EditableField: React.FC<EditableFieldProps> = ({ initialValue, onSave, spanClassName, inputClassName }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue.toString());

    useEffect(() => {
        if (!isEditing) {
            setValue(initialValue.toString());
        }
    }, [initialValue, isEditing]);

    const handleSave = () => {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue) && numericValue >= 0) {
            onSave(numericValue);
        } else {
            setValue(initialValue.toString());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setValue(initialValue.toString());
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className={inputClassName || "w-full p-1 rounded-md bg-slate-700 text-white text-center border border-slate-600 focus:bg-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"}
            />
        );
    }

    return (
        <span onClick={() => setIsEditing(true)} className={`cursor-pointer transition-colors duration-200 ${spanClassName}`}>
            {formatNumber(initialValue)}
        </span>
    );
};

export default EditableField;