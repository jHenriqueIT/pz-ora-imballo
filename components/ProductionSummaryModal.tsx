import React from 'react';
import { ShiftData } from '../types';
import GoalProgressCard from './GoalProgressCard';
import { useTranslations } from '../LanguageContext';

interface SummaryData {
    pezzi: number;
    fte: number;
    pzOra: number;
    efficienza: string;
}

const extractSummary = (data: ShiftData): SummaryData => {
    const totalRow = data.find(row => row.id === 'total_imballo');
    if (!totalRow) return { pezzi: 0, fte: 0, pzOra: 0, efficienza: '0.0%' };

    // Assuming efficiency is a fixed value for now as per the original logic
    const efficienza = totalRow.pzOra > 0 ? '100.0%' : '0.0%';

    return {
        pezzi: totalRow.pzTot,
        fte: totalRow.fte,
        pzOra: totalRow.pzOra,
        efficienza: efficienza,
    };
};

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('de-DE').format(num);
};

const formatDecimal = (num: number): string => {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(num);
};

interface ProductionSummaryModalProps {
    morningData: ShiftData;
    afternoonData: ShiftData;
    dailyData: ShiftData;
    date: Date;
    onClose: () => void;
    morningGoal: number;
    afternoonGoal: number;
    morningFteGoal: number;
    afternoonFteGoal: number;
    saturdayGoal: number;
    saturdayFteGoal: number;
    sundayGoal: number;
    sundayFteGoal: number;
}

const ProductionSummaryModal: React.FC<ProductionSummaryModalProps> = ({ morningData, afternoonData, dailyData, date, onClose, morningGoal, afternoonGoal, morningFteGoal, afternoonFteGoal, saturdayGoal, saturdayFteGoal, sundayGoal, sundayFteGoal }) => {
    const { t } = useTranslations();
    const morningSummary = extractSummary(morningData);
    const afternoonSummary = extractSummary(afternoonData);
    const dailySummary = extractSummary(dailyData);
    
    const dailyGoal = morningGoal + afternoonGoal;
    const dailyFteGoal = morningFteGoal + afternoonFteGoal;

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const weekendPezziGoal = dayOfWeek === 6 ? saturdayGoal : sundayGoal;
    const weekendFteGoal = dayOfWeek === 6 ? saturdayFteGoal : sundayFteGoal;

    const renderWeekdayView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
                {/* Morning Shift Card */}
                <div className="bg-[#2c3344] p-5 rounded-lg shadow-lg border-l-4 border-orange-400">
                    <h3 className="font-bold text-lg mb-4 flex items-center text-slate-200">
                        <i className="fas fa-sun text-orange-400 mr-3"></i>{t('modal_shift_1')}
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                        <div>
                            <p className="text-slate-400">{t('modal_pieces')}</p>
                            <p className="font-bold text-2xl text-slate-100">{formatNumber(morningSummary.pezzi)}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">{t('modal_fte')}</p>
                            <p className="font-bold text-2xl text-slate-100">{morningSummary.fte}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">{t('modal_pz_ora')}</p>
                            <p className="font-bold text-2xl text-red-500">{formatDecimal(morningSummary.pzOra)}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">{t('modal_efficiency')}</p>
                            <p className="font-bold text-2xl text-green-500">{morningSummary.efficienza}</p>
                        </div>
                    </div>
                </div>
                {/* Afternoon Shift Card */}
                <div className="bg-[#2c3344] p-5 rounded-lg shadow-lg border-l-4 border-blue-500">
                    <h3 className="font-bold text-lg mb-4 flex items-center text-slate-200">
                        <i className="fas fa-cog text-blue-500 mr-3"></i>{t('modal_shift_2')}
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                         <div>
                            <p className="text-slate-400">{t('modal_pieces')}</p>
                            <p className="font-bold text-2xl text-slate-100">{formatNumber(afternoonSummary.pezzi)}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">{t('modal_fte')}</p>
                            <p className="font-bold text-2xl text-slate-100">{afternoonSummary.fte}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">{t('modal_pz_ora')}</p>
                            <p className="font-bold text-2xl text-red-500">{formatDecimal(afternoonSummary.pzOra)}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">{t('modal_efficiency')}</p>
                            <p className="font-bold text-2xl text-green-500">{afternoonSummary.efficienza}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="bg-[#2c3344] p-5 rounded-lg shadow-lg flex flex-col h-full">
                <h3 className="font-bold text-lg mb-4 flex items-center text-slate-200 shrink-0">
                   <i className="fas fa-calendar-alt text-purple-400 mr-3"></i>{t('modal_total_day')}
                </h3>
                <div className="space-y-4 flex flex-col justify-center grow">
                    <GoalProgressCard title={t('modal_goal_progress_pieces')} goal={dailyGoal} current={dailySummary.pezzi} unit={t('modal_pieces')} />
                    <GoalProgressCard title={t('modal_goal_progress_fte')} goal={dailyFteGoal} current={dailySummary.fte} unit={t('modal_fte')} />
                    <div className="grid grid-cols-2 gap-y-6 text-center pt-4">
                        <div>
                            <p className="text-4xl font-bold text-slate-100">{formatNumber(dailySummary.pezzi)}</p>
                            <p className="text-xs text-slate-400 font-semibold tracking-wider">{t('modal_total_pieces')}</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-slate-100">{dailySummary.fte}</p>
                            <p className="text-xs text-slate-400 font-semibold tracking-wider">{t('modal_total_fte')}</p>
                        </div>
                         <div>
                            <p className="text-4xl font-bold text-red-500">{formatDecimal(dailySummary.pzOra)}</p>
                            <p className="text-xs text-slate-400 font-semibold tracking-wider">{t('modal_avg_pz_ora')}</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-green-500">{dailySummary.efficienza}</p>
                            <p className="text-xs text-slate-400 font-semibold tracking-wider">{t('modal_efficiency')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

     const renderWeekendView = () => (
        <div className="max-w-md mx-auto w-full">
            <div className="bg-[#2c3344] p-5 rounded-lg shadow-lg flex flex-col h-full">
                <h3 className="font-bold text-lg mb-4 flex items-center text-slate-200 shrink-0">
                   <i className="fas fa-calendar-alt text-purple-400 mr-3"></i>{t('modal_total_day')}
                </h3>
                <div className="space-y-4 flex flex-col justify-center grow">
                    <GoalProgressCard title={t('modal_goal_progress_pieces')} goal={weekendPezziGoal} current={dailySummary.pezzi} unit={t('modal_pieces')} />
                    <GoalProgressCard title={t('modal_goal_progress_fte')} goal={weekendFteGoal} current={dailySummary.fte} unit={t('modal_fte')} />
                    <div className="grid grid-cols-2 gap-y-6 text-center pt-4">
                        <div>
                            <p className="text-4xl font-bold text-slate-100">{formatNumber(dailySummary.pezzi)}</p>
                            <p className="text-xs text-slate-400 font-semibold tracking-wider">{t('modal_total_pieces')}</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-slate-100">{dailySummary.fte}</p>
                            <p className="text-xs text-slate-400 font-semibold tracking-wider">{t('modal_total_fte')}</p>
                        </div>
                         <div>
                            <p className="text-4xl font-bold text-red-500">{formatDecimal(dailySummary.pzOra)}</p>
                            <p className="text-xs text-slate-400 font-semibold tracking-wider">{t('modal_avg_pz_ora')}</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-green-500">{dailySummary.efficienza}</p>
                            <p className="text-xs text-slate-400 font-semibold tracking-wider">{t('modal_efficiency')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );


    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#212634] border border-slate-700 rounded-lg shadow-2xl w-full max-w-5xl text-slate-300 transform transition-all">
                <div className="p-5 border-b border-slate-700">
                    <h2 className="text-xl font-bold flex items-center text-slate-200">
                        <i className="fas fa-list-alt text-blue-500 mr-3"></i>
                        {t('modal_title')}
                    </h2>
                </div>
                
                <div className="p-6 bg-transparent">
                    {isWeekend ? renderWeekendView() : renderWeekdayView()}
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="px-5 py-2 rounded-md text-sm font-semibold bg-slate-600 hover:bg-slate-500 text-white transition-transform transform hover:-translate-y-0.5">{t('modal_close')}</button>
                    <button className="px-5 py-2 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center transition-transform transform hover:-translate-y-0.5">
                        <i className="fas fa-print mr-2"></i>{t('modal_print')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductionSummaryModal;