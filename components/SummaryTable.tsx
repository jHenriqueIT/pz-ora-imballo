import React from 'react';
import { ShiftData, ProductionData } from '../types';
import { useTranslations } from '../LanguageContext';

interface ShiftSummaryProps {
    data: ShiftData;
    selectedShift: 'manha' | 'tarde' | 'sabado' | 'domingo';
}

export const ShiftSummary: React.FC<ShiftSummaryProps> = ({ data, selectedShift }) => {
    const { t } = useTranslations();

    const getShiftDisplayData = (shift: 'manha' | 'tarde' | 'sabado' | 'domingo') => {
        switch (shift) {
            case 'manha':
                return { title: t('summary_title_morning'), icon: 'fa-sun', color: 'text-orange-400' };
            case 'tarde':
                return { title: t('summary_title_afternoon'), icon: 'fa-cog', color: 'text-blue-400' };
            case 'sabado':
                return { title: t('summary_title_saturday'), icon: 'fa-calendar-week', color: 'text-purple-400' };
            case 'domingo':
                return { title: t('summary_title_sunday'), icon: 'fa-calendar-week', color: 'text-red-400' };
            default:
                return { title: '', icon: 'fa-clipboard-list', color: 'text-slate-300' };
        }
    };

    const { title, icon, color } = getShiftDisplayData(selectedShift);
    
    const getRowClass = (row: ProductionData): string => {
        if (row.isTotal) return 'bg-green-600/80 text-white font-bold';
        if (row.isSubtotal) return 'bg-slate-600/80 text-white font-semibold';
        if (row.isInput) return 'bg-blue-600/80 text-white font-semibold';
        return 'hover:bg-slate-700/50';
    };

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg w-full border border-slate-700 transition-transform duration-300 hover:scale-[1.03] hover:shadow-blue-500/10">
            <h3 className={`text-lg font-bold mb-3 text-center ${color} uppercase`}><i className={`fas ${icon} mr-2`}></i>{title}</h3>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-slate-700">
                        <th className="pb-2 px-2 text-left font-medium text-slate-400 uppercase">{t('header_shift_total')}</th>
                        <th className="pb-2 px-2 text-center font-medium text-slate-400 uppercase">{t('header_pz_tot')}</th>
                        <th className="pb-2 px-2 text-center font-medium text-slate-400 uppercase">{t('header_ore')}</th>
                        <th className="pb-2 px-2 text-center font-medium text-slate-400 uppercase">{t('header_pz_ora')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr key={row.id} className={`border-t border-slate-700/50 transition-colors duration-200 ${getRowClass(row)}`}>
                            <td className="py-2.5 px-2 font-medium">{row.label.toUpperCase()}</td>
                            <td className="py-2.5 px-2 text-center font-semibold">{new Intl.NumberFormat('de-DE').format(row.pzTot)}</td>
                            <td className="py-2.5 px-2 text-center font-semibold">{row.fte}</td>
                            <td className="py-2.5 px-2 text-center font-bold">{row.pzOra}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


interface DailySummaryProps {
    data: ShiftData;
}

export const DailySummary: React.FC<DailySummaryProps> = ({ data }) => {
    const { t } = useTranslations();
    const getRowClass = (row: ProductionData): string => {
        if (row.isTotal) return 'bg-green-600/80 text-white font-bold';
        if (row.isSubtotal) return 'bg-slate-600/80 text-white font-semibold';
        if (row.isInput) return 'bg-blue-600/80 text-white font-semibold';
        return 'hover:bg-slate-700/50';
    };

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg w-full border border-slate-700 transition-transform duration-300 hover:scale-[1.03] hover:shadow-purple-500/10">
            <h3 className="text-lg font-bold mb-3 text-center text-purple-400 uppercase"><i className="far fa-calendar-check mr-2"></i>{t('summary_title_general')}</h3>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-slate-700">
                        <th className="pb-2 px-2 text-left font-medium text-slate-400 uppercase">{t('header_day_total')}</th>
                        <th className="pb-2 px-2 text-center font-medium text-slate-400 uppercase">{t('header_pz_tot')}</th>
                        <th className="pb-2 px-2 text-center font-medium text-slate-400 uppercase">{t('header_ore')}</th>
                        <th className="pb-2 px-2 text-center font-medium text-slate-400 uppercase">{t('header_pz_ora')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr key={row.id} className={`border-t border-slate-700/50 transition-colors duration-200 ${getRowClass(row)}`}>
                            <td className="py-2.5 px-2 font-medium">{row.label.toUpperCase()}</td>
                            <td className="py-2.5 px-2 text-center font-semibold">{new Intl.NumberFormat('de-DE').format(row.pzTot)}</td>
                            <td className="py-2.5 px-2 text-center font-semibold">{row.fte}</td>
                            <td className="py-2.5 px-2 text-center font-bold">{row.pzOra}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};