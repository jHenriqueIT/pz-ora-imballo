import React from 'react';
import { ShiftData } from '../types';
import EditableField from './EditableField';
import { useTranslations } from '../LanguageContext';

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('de-DE').format(Math.round(num));
};

const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className = 'bg-cyan-400' }) => {
    const boundedProgress = Math.max(0, Math.min(100, progress));
    return (
        <div className="bg-black/30 rounded-full h-2.5 w-full overflow-hidden">
            <div
                className={`h-2.5 rounded-full transition-all duration-500 ${className}`}
                style={{ width: `${boundedProgress}%` }}
            ></div>
        </div>
    );
};

interface RiepilogoCardProps {
    title: string;
    shiftGoal: number;
    dayGoal: number;
    currentShiftValue: number;
    currentDayValue: number;
    onShiftGoalChange: (newValue: number) => void;
}

const RiepilogoCard: React.FC<RiepilogoCardProps> = ({ title, shiftGoal, dayGoal, currentShiftValue, currentDayValue, onShiftGoalChange }) => {
    const { t } = useTranslations();
    const shiftProgress = shiftGoal > 0 ? (currentShiftValue / shiftGoal) * 100 : 0;
    const dayProgress = dayGoal > 0 ? (currentDayValue / dayGoal) * 100 : 0;

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 border border-slate-700">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-center py-2 rounded-t-lg -mt-5 -mx-5 mb-4 shadow-lg">
                <h3 className="font-bold text-white text-lg tracking-wide uppercase">{title}</h3>
            </div>
            <div className="space-y-4 text-slate-300">
                <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-slate-400">{t('dashboard_shift_goal')}</span>
                        <EditableField
                            initialValue={shiftGoal}
                            onSave={onShiftGoalChange}
                            spanClassName="font-semibold text-white px-2 py-1 rounded-md hover:bg-slate-700/80"
                            inputClassName="w-24 p-1 rounded-md bg-slate-700 text-white text-right border border-slate-600 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <ProgressBar progress={shiftProgress} className="bg-gradient-to-r from-purple-500 to-indigo-500" />
                </div>
                <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-slate-400">{t('dashboard_day_goal')}</span>
                        <span className="font-semibold text-white">{formatNumber(dayGoal)}</span>
                    </div>
                    <ProgressBar progress={dayProgress} className="bg-gradient-to-r from-purple-500 to-indigo-500" />
                </div>
                <hr className="border-slate-700" />
                <div className="text-center">
                    <span className="text-xs text-cyan-400 font-semibold tracking-wider">{t('dashboard_running_total')}</span>
                    <p className="text-4xl font-bold text-white tracking-tighter">{formatNumber(currentDayValue)}</p>
                </div>
            </div>
        </div>
    );
};

interface PeakPerformanceCardProps {
    peak: number;
    hour: string;
}

const PeakPerformanceCard: React.FC<PeakPerformanceCardProps> = ({ peak, hour }) => {
    const { t } = useTranslations();
    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col border border-slate-700 transition-transform duration-300 hover:scale-[1.03] hover:shadow-yellow-400/10">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-center py-2.5">
                <h3 className="font-bold text-slate-900 text-lg tracking-wide uppercase">{t('dashboard_peak_performance')}</h3>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center p-4">
                <p className="text-7xl font-bold text-yellow-400">{formatNumber(peak)}</p>
                <p className="text-slate-500 text-sm tracking-wider mt-1">{hour}</p>
            </div>
        </div>
    );
};


interface SincroniaCardProps {
    dlbMorning: number;
    dmwMorning: number;
    dlbAfternoon: number;
    dmwAfternoon: number;
}
const SincroniaCard: React.FC<SincroniaCardProps> = ({ dlbMorning, dmwMorning, dlbAfternoon, dmwAfternoon }) => {
    const { t } = useTranslations();
    const totalDlb = dlbMorning + dlbAfternoon;
    const totalDmw = dmwMorning + dmwAfternoon;
    const total = totalDlb + totalDmw;
    const syncPercentage = total > 0 && Math.max(totalDlb, totalDmw) > 0 ? (Math.min(totalDlb, totalDmw) / Math.max(totalDlb, totalDmw)) * 100 : 0;

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10 border border-slate-700">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-center py-2 rounded-t-lg -mt-5 -mx-5 mb-4 shadow-lg">
                <h3 className="font-bold text-white text-lg tracking-wide uppercase">{t('dashboard_sync')}</h3>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center text-white">
                    <span className="text-sm font-medium text-slate-300">{t('dashboard_sync_general')}</span>
                    <span className="text-lg font-bold">{syncPercentage.toFixed(1)}%</span>
                </div>
                <ProgressBar progress={syncPercentage} className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3" />
                <div className="grid grid-cols-2 gap-4 pt-2 text-center">
                    <div>
                        <h4 className="font-semibold text-cyan-300 text-md mb-2"><i className="fas fa-sun mr-2"></i>{t('shift_morning')}</h4>
                        <div className="text-sm space-y-1 text-slate-300">
                            <p>DMW: <span className="font-bold text-white">{formatNumber(dmwMorning)}</span></p>
                            <p>DLB: <span className="font-bold text-white">{formatNumber(dlbMorning)}</span></p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-cyan-300 text-md mb-2"><i className="fas fa-cog mr-2"></i>{t('shift_afternoon')}</h4>
                        <div className="text-sm space-y-1 text-slate-300">
                           <p>DMW: <span className="font-bold text-white">{formatNumber(dmwAfternoon)}</span></p>
                           <p>DLB: <span className="font-bold text-white">{formatNumber(dlbAfternoon)}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ConquisteCardProps {
    dailyGoalMet: boolean;
    peakPerformanceAchieved: boolean;
    syncAchieved: boolean;
}

const ConquisteCard: React.FC<ConquisteCardProps> = ({ dailyGoalMet, peakPerformanceAchieved, syncAchieved }) => {
    const { t } = useTranslations();
    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col border border-slate-700 transition-transform duration-300 hover:scale-[1.03] hover:shadow-teal-400/10">
            <div className="bg-gradient-to-r from-teal-400 to-cyan-600 text-center py-2.5">
                <h3 className="font-bold text-white text-lg tracking-wide uppercase">{t('dashboard_achievements')}</h3>
            </div>
            <div className="flex-grow flex justify-around items-center p-4 text-5xl">
                <i 
                    className={`fas fa-star transition-colors duration-300 ${dailyGoalMet ? 'text-yellow-400' : 'text-slate-600'}`}
                    title={t('achievement_star_desc')}
                ></i>
                <i 
                    className={`fas fa-fire-alt transition-colors duration-300 ${peakPerformanceAchieved ? 'text-orange-500' : 'text-slate-600'}`}
                    title={t('achievement_fire_desc')}
                ></i>
                <i 
                    className={`fas fa-crown transition-colors duration-300 ${syncAchieved ? 'text-amber-500' : 'text-slate-600'}`}
                    title={t('achievement_crown_desc')}
                ></i>
            </div>
        </div>
    );
};


interface DashboardProps {
    morningSummaryData: ShiftData;
    afternoonSummaryData: ShiftData;
    dailyData: ShiftData;
    goals: {
        dmw: { morning: number; afternoon: number; sabado: number; domingo: number; };
        dlb: { morning: number; afternoon: number; sabado: number; domingo: number; };
    };
    setDashboardGoals: React.Dispatch<React.SetStateAction<{
        dmw: { morning: number; afternoon: number; sabado: number; domingo: number; };
        dlb: { morning: number; afternoon: number; sabado: number; domingo: number; };
    }>>;
    selectedShift: 'manha' | 'tarde' | 'sabado' | 'domingo';
    date: Date;
    peakPerformance: {
        peak: number;
        hour: string;
    };
}


export const Dashboard: React.FC<DashboardProps> = ({ morningSummaryData, afternoonSummaryData, dailyData, goals, setDashboardGoals, selectedShift, date, peakPerformance }) => {
    const { t } = useTranslations();
    const getPzTot = (data: ShiftData, id: string) => data.find(r => r.id === id)?.pzTot || 0;

    const dlbDayValue = getPzTot(dailyData, 'dlb');
    const dmwDayValue = getPzTot(dailyData, 'dmw');
    
    const goalShiftKeyMap = {
        manha: 'morning',
        tarde: 'afternoon',
        sabado: 'sabado',
        domingo: 'domingo',
    } as const;
    
    const goalShiftKey = goalShiftKeyMap[selectedShift];
    
    let dlbShiftGoal, dmwShiftGoal, dlbShiftValue, dmwShiftValue;
    
    if (selectedShift === 'manha' || selectedShift === 'tarde') {
        const currentShiftData = selectedShift === 'manha' ? morningSummaryData : afternoonSummaryData;
        dlbShiftGoal = goals.dlb[goalShiftKey];
        dmwShiftGoal = goals.dmw[goalShiftKey];
        dlbShiftValue = getPzTot(currentShiftData, 'dlb');
        dmwShiftValue = getPzTot(currentShiftData, 'dmw');
    } else { // sabado or domingo
        dlbShiftGoal = goals.dlb[goalShiftKey];
        dmwShiftGoal = goals.dmw[goalShiftKey];
        dlbShiftValue = dlbDayValue; // For weekends, shift value is the same as day value
        dmwShiftValue = dmwDayValue;
    }

    const dayOfWeek = date.getDay(); // 0 for Sunday, 6 for Saturday

    const dlbDayGoal = dayOfWeek === 6 
        ? goals.dlb.sabado 
        : dayOfWeek === 0 
        ? goals.dlb.domingo 
        : goals.dlb.morning + goals.dlb.afternoon;

    const dmwDayGoal = dayOfWeek === 6
        ? goals.dmw.sabado
        : dayOfWeek === 0
        ? goals.dmw.domingo
        : goals.dmw.morning + goals.dmw.afternoon;
    
    const dlbMorningValue = getPzTot(morningSummaryData, 'dlb');
    const dmwMorningValue = getPzTot(morningSummaryData, 'dmw');
    const dlbAfternoonValue = getPzTot(afternoonSummaryData, 'dlb');
    const dmwAfternoonValue = getPzTot(afternoonSummaryData, 'dmw');

    // Achievement logic
    const totalRealizadoDia = getPzTot(dailyData, 'total_imballo');
    const metaDia = dmwDayGoal + dlbDayGoal;
    const dailyGoalMet = totalRealizadoDia >= metaDia && metaDia > 0;
    
    const peakPerformanceAchieved = peakPerformance.peak >= 1500;

    const totalDlbSync = dlbMorningValue + dlbAfternoonValue;
    const totalDmwSync = dmwMorningValue + dmwAfternoonValue;
    const totalSync = totalDlbSync + totalDmwSync;
    const syncPercentage = totalSync > 0 && Math.max(totalDlbSync, totalDmwSync) > 0 ? (Math.min(totalDlbSync, totalDmwSync) / Math.max(totalDlbSync, totalDmwSync)) * 100 : 0;
    const syncAchieved = syncPercentage >= 90;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col gap-8">
                <RiepilogoCard 
                    title={t('dashboard_dmw_summary')}
                    shiftGoal={dmwShiftGoal}
                    dayGoal={dmwDayGoal}
                    currentShiftValue={dmwShiftValue}
                    currentDayValue={dmwDayValue}
                    onShiftGoalChange={(newValue) => {
                        setDashboardGoals(prev => ({
                            ...prev,
                            dmw: { ...prev.dmw, [goalShiftKey]: newValue }
                        }));
                    }}
                />
                <RiepilogoCard 
                    title={t('dashboard_dlb_summary')}
                    shiftGoal={dlbShiftGoal}
                    dayGoal={dlbDayGoal}
                    currentShiftValue={dlbShiftValue}
                    currentDayValue={dlbDayValue}
                    onShiftGoalChange={(newValue) => {
                        setDashboardGoals(prev => ({
                            ...prev,
                            dlb: { ...prev.dlb, [goalShiftKey]: newValue }
                        }));
                    }}
                />
            </div>
            <div className="flex flex-col gap-8">
                <PeakPerformanceCard peak={peakPerformance.peak} hour={peakPerformance.hour} />
                <SincroniaCard 
                    dlbMorning={dlbMorningValue}
                    dmwMorning={dmwMorningValue}
                    dlbAfternoon={dlbAfternoonValue}
                    dmwAfternoon={dmwAfternoonValue}
                />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
                 <ConquisteCard 
                    dailyGoalMet={dailyGoalMet}
                    peakPerformanceAchieved={peakPerformanceAchieved}
                    syncAchieved={syncAchieved}
                 />
            </div>
        </div>
    );
};