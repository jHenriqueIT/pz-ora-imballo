import React from 'react';
import { ShiftData } from '../types';
import { useTranslations } from '../LanguageContext';

interface HourlyTableProps {
    hour: string;
    data: ShiftData;
    onDataChange: (hour: string, id: string, field: 'pzTot' | 'fte', value: number) => void;
    selectedShift: 'manha' | 'tarde' | 'sabado' | 'domingo';
}

const getRowClass = (isSubtotal?: boolean, isTotal?: boolean): string => {
    if (isTotal) {
        return 'bg-green-600/80 text-white font-bold';
    }
    if (isSubtotal) {
        return 'bg-blue-600/80 text-white font-semibold';
    }
    return 'hover:bg-slate-700/50';
};

const HourlyTable: React.FC<HourlyTableProps> = ({ hour, data, onDataChange, selectedShift }) => {
    const { t } = useTranslations();
    
    const handleInputChange = (id: string, field: 'pzTot' | 'fte', value: string) => {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue) && numericValue >= 0) {
            onDataChange(hour, id, field, numericValue);
        } else if (value === '') {
            onDataChange(hour, id, field, 0);
        }
    };
    
    return (
        <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg w-full border border-slate-700 transition-transform duration-300 hover:scale-[1.03] hover:shadow-cyan-500/10">
            <h3 className="text-base font-bold mb-3 text-center text-cyan-300"><i className="fa-regular fa-clock mr-2"></i>{t('hourly_table_title')} {hour}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                    <thead className="border-b-2 border-slate-700">
                        <tr>
                            <th scope="col" className="pb-2 text-left font-medium text-slate-400"></th>
                            <th scope="col" className="pb-2 px-1 text-center font-medium text-slate-400">{t('header_pz_tot')}</th>
                            <th scope="col" className="pb-2 px-1 text-center font-medium text-slate-400">{t('header_tot_ora')}</th>
                            <th scope="col" className="pb-2 px-1 text-center font-medium text-slate-400">{t('header_ore')}</th>
                            <th scope="col" className="pb-2 px-1 text-center font-medium text-slate-400">{t('header_pz_ora')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => {
                            const isAfternoonDisabled = selectedShift === 'tarde' && row.afternoonDisabled;
                            return (
                                <tr key={row.id} className={`border-b border-slate-700/50 last:border-b-0 transition-colors duration-200 ${getRowClass(row.isSubtotal, row.isTotal)}`}>
                                    <td className="py-2 pr-1 whitespace-nowrap font-medium text-slate-300">{row.label.toUpperCase()}</td>
                                    <td className="py-1 px-1 whitespace-nowrap">
                                        {row.isInput ? (
                                            <input
                                                type="number"
                                                value={row.pzTot === 0 ? '' : row.pzTot}
                                                onChange={(e) => handleInputChange(row.id, 'pzTot', e.target.value)}
                                                className="w-full p-1 rounded-md bg-slate-700 text-cyan-300 text-center border border-slate-600 focus:bg-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-600 disabled:text-slate-400"
                                                min="0"
                                                disabled={isAfternoonDisabled}
                                            />
                                        ) : (
                                            <span className="flex items-center justify-center h-full text-center w-full font-semibold">{row.pzTot}</span>
                                        )}
                                    </td>
                                    <td className="py-1 px-1 whitespace-nowrap text-center text-slate-400">
                                        <span className="w-full block text-center">{isAfternoonDisabled ? '-' : row.totOra}</span>
                                    </td>
                                    <td className="py-1 px-1 whitespace-nowrap text-center">
                                         {row.isInput ? (
                                            <input
                                                type="number"
                                                value={row.fte === 0 ? '' : row.fte}
                                                onChange={(e) => handleInputChange(row.id, 'fte', e.target.value)}
                                                className="w-full p-1 rounded-md bg-slate-700 text-cyan-300 text-center border border-slate-600 focus:bg-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-600 disabled:text-slate-400"
                                                min="0"
                                                disabled={isAfternoonDisabled}
                                            />
                                        ) : (
                                            <span className="w-full block text-center font-semibold">{row.fte}</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-1 whitespace-nowrap text-center font-bold text-slate-200">{isAfternoonDisabled ? '-' : row.pzOra}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HourlyTable;