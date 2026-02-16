import React, { useState, useEffect, useRef } from 'react';
import { ShiftData } from '../types';
import EditableField from './EditableField';
import Confetti from './Confetti';
import ShootingStars from './ShootingStars';
import { useTranslations } from '../LanguageContext';

type ShiftGoals = {
    morning: number;
    afternoon: number;
    sabado: number;
    domingo: number;
};

interface GoalsCardProps {
    shiftData: ShiftData;
    dailyData: ShiftData;
    selectedShift: 'manha' | 'tarde' | 'sabado' | 'domingo';
    goals: {
        dmw: ShiftGoals;
        dlb: ShiftGoals;
        appeso: ShiftGoals;
        imb_appeso: ShiftGoals;
    };
    setDashboardGoals: React.Dispatch<React.SetStateAction<{
        dmw: ShiftGoals;
        dlb: ShiftGoals;
        appeso: ShiftGoals;
        imb_appeso: ShiftGoals;
    }>>;
    date: Date;
    hoursWorked: number;
}

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('de-DE').format(Math.round(num));
};

const ProgressBar: React.FC<{ progress: number; label: string; isGoalMet: boolean }> = ({ progress, label, isGoalMet }) => {
    const [displayProgress, setDisplayProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const boundedProgress = Math.max(0, Math.min(100, progress));
            setDisplayProgress(boundedProgress);
        }, 0); 
        return () => clearTimeout(timer);
    }, [progress]);

    const barClasses = `
        h-full rounded-full absolute left-0 top-0 transition-all duration-1000 ease-out
        ${isGoalMet
            ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse-glow'
            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
        }
    `;

    return (
        <div className="bg-slate-900/50 rounded-full h-8 relative overflow-hidden shadow-inner text-center border border-slate-700">
             <div
                className={barClasses}
                style={{ width: `${displayProgress}%` }}
            ></div>
            <span className="relative z-10 font-bold text-white text-sm leading-8 tracking-wider">
                {progress.toFixed(1)}% ({label})
            </span>
        </div>
    );
};

const GoalsCard: React.FC<GoalsCardProps> = ({ shiftData, dailyData, selectedShift, goals, setDashboardGoals, date, hoursWorked }) => {
    const { t } = useTranslations();
    const realizadoStesoTurno = shiftData.find(row => row.id === 'subtotal_steso')?.pzTot || 0;
    const realizadoStesoDia = dailyData.find(row => row.id === 'subtotal_steso')?.pzTot || 0;
    const totalRealizadoAppeso = shiftData.find(row => row.id === 'appeso')?.pzTot || 0;
    const totalRealizadoImbAppeso = shiftData.find(row => row.id === 'imb_appeso')?.pzTot || 0;

    const goalShiftKeyMap = {
        manha: 'morning',
        tarde: 'afternoon',
        sabado: 'sabado',
        domingo: 'domingo',
    } as const;
    
    const goalShiftKey = goalShiftKeyMap[selectedShift];

    // Steso Goals
    const dmwShiftGoal = goals.dmw[goalShiftKey] || 0;
    const dlbShiftGoal = goals.dlb[goalShiftKey] || 0;
    const metaStesoTurno = dmwShiftGoal + dlbShiftGoal;
    
    // Appeso Goals
    const appesoShiftGoal = goals.appeso[goalShiftKey] || 0;
    const imbAppesoShiftGoal = goals.imb_appeso[goalShiftKey] || 0;

    const dayOfWeek = date.getDay(); // 0 Sunday, 6 Saturday

    // Calculate Day Goals for all components
    const calculateDayGoal = (goalSet: ShiftGoals) => {
        if (dayOfWeek === 6) return goalSet.sabado || 0;
        if (dayOfWeek === 0) return goalSet.domingo || 0;
        return (goalSet.morning || 0) + (goalSet.afternoon || 0);
    };

    const metaStesoDia = calculateDayGoal(goals.dmw) + calculateDayGoal(goals.dlb);
   
    // Progress calculations
    const progressoTurno = metaStesoTurno > 0 ? (realizadoStesoTurno / metaStesoTurno) * 100 : 0;
    const progressoDia = metaStesoDia > 0 ? (realizadoStesoDia / metaStesoDia) * 100 : 0;
    const progressoAppeso = appesoShiftGoal > 0 ? (totalRealizadoAppeso / appesoShiftGoal) * 100 : 0;
    const progressoImbAppeso = imbAppesoShiftGoal > 0 ? (totalRealizadoImbAppeso / imbAppesoShiftGoal) * 100 : 0;

    // "Goal Met" logic
    const totalShiftHours = (selectedShift === 'sabado' || selectedShift === 'domingo') ? 6 : 8;
    const areHoursComplete = hoursWorked >= totalShiftHours;
    const isProductionGoalMetForShift = progressoTurno >= 100;
    const isShiftGoalTrulyMet = isProductionGoalMetForShift && areHoursComplete;
    const isDayGoalMet = progressoDia >= 100;

    const [showShiftConfetti, setShowShiftConfetti] = useState(false);
    const [showDayStars, setShowDayStars] = useState(false);
    const prevMetStateRef = useRef({ shift: isShiftGoalTrulyMet, day: isDayGoalMet });

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
    
        if (!prevMetStateRef.current.shift && isShiftGoalTrulyMet) {
            setShowShiftConfetti(true);
            timers.push(setTimeout(() => setShowShiftConfetti(false), 5000));
        }
    
        if (!prevMetStateRef.current.day && isDayGoalMet) {
            setShowDayStars(true);
            timers.push(setTimeout(() => setShowDayStars(false), 4000));
        }
    
        prevMetStateRef.current = { shift: isShiftGoalTrulyMet, day: isDayGoalMet };
    
        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [isShiftGoalTrulyMet, isDayGoalMet]);


    const handleStesoShiftGoalChange = (newTotal: number) => {
        const oldTotal = metaStesoTurno;

        let newDmwGoal: number;
        let newDlbGoal: number;

        if (oldTotal === 0) {
            newDmwGoal = Math.round(newTotal / 2);
            newDlbGoal = newTotal - newDmwGoal;
        } else {
            const dmwProportion = dmwShiftGoal / oldTotal;
            newDmwGoal = Math.round(newTotal * dmwProportion);
            newDlbGoal = newTotal - newDmwGoal;
        }

        setDashboardGoals(prev => ({
            ...prev,
            dmw: { ...prev.dmw, [goalShiftKey]: newDmwGoal },
            dlb: { ...prev.dlb, [goalShiftKey]: newDlbGoal }
        }));
    };

    const handleStesoDayGoalChange = (newTotal: number) => {
        setDashboardGoals(prev => {
            const newGoals = JSON.parse(JSON.stringify(prev));
            const dayOfWeek = date.getDay();
    
            // For weekends, day goal is the same as shift goal
            if (dayOfWeek === 6) { // Saturday
                const oldTotal = prev.dmw.sabado + prev.dlb.sabado;
                const dmwProp = oldTotal > 0 ? prev.dmw.sabado / oldTotal : 0.5;
                newGoals.dmw.sabado = Math.round(newTotal * dmwProp);
                newGoals.dlb.sabado = newTotal - newGoals.dmw.sabado;
                return newGoals;
            }
            if (dayOfWeek === 0) { // Sunday
                const oldTotal = prev.dmw.domingo + prev.dlb.domingo;
                const dmwProp = oldTotal > 0 ? prev.dmw.domingo / oldTotal : 0.5;
                newGoals.dmw.domingo = Math.round(newTotal * dmwProp);
                newGoals.dlb.domingo = newTotal - newGoals.dmw.domingo;
                return newGoals;
            }
    
            // For weekdays, keep the current shift's goal and adjust the other shift's goal.
            const currentShiftKey = goalShiftKeyMap[selectedShift];
            if (currentShiftKey !== 'morning' && currentShiftKey !== 'afternoon') {
                return prev; // Should not happen on a weekday
            }

            const otherShiftKey = currentShiftKey === 'morning' ? 'afternoon' : 'morning';
            
            const currentShiftGoal = (prev.dmw[currentShiftKey] || 0) + (prev.dlb[currentShiftKey] || 0);
            
            let newOtherShiftGoal = newTotal - currentShiftGoal;
            if (newOtherShiftGoal < 0) newOtherShiftGoal = 0;

            const oldOtherShiftGoal = (prev.dmw[otherShiftKey] || 0) + (prev.dlb[otherShiftKey] || 0);
            const dmwProportion = oldOtherShiftGoal > 0 ? (prev.dmw[otherShiftKey] || 0) / oldOtherShiftGoal : 0.5;
            
            newGoals.dmw[otherShiftKey] = Math.round(newOtherShiftGoal * dmwProportion);
            newGoals.dlb[otherShiftKey] = newOtherShiftGoal - newGoals.dmw[otherShiftKey];
    
            return newGoals;
        });
    };

    const handleAppesoGoalChange = (newTotal: number) => {
        setDashboardGoals(prev => ({
            ...prev,
            appeso: { ...prev.appeso, [goalShiftKey]: newTotal }
        }));
    };

    const handleImbAppesoGoalChange = (newTotal: number) => {
        setDashboardGoals(prev => ({
            ...prev,
            imb_appeso: { ...prev.imb_appeso, [goalShiftKey]: newTotal }
        }));
    };

    const commonRowStyle = "grid grid-cols-2 items-center border-t border-slate-700/50";
    const labelStyle = "font-semibold p-3 text-slate-300";
    const valueContainerStyle = "h-full flex items-center justify-end p-0 border-l border-slate-700/50";
    
    const isWeekday = selectedShift === 'manha' || selectedShift === 'tarde';

    return (
        <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg w-full text-slate-200 overflow-hidden border border-slate-700 transition-transform duration-300 hover:scale-[1.03] hover:shadow-red-500/10">
            {showShiftConfetti && <Confetti />}
            {showDayStars && <ShootingStars />}
            <h3 className="text-lg font-bold p-3 text-center uppercase text-red-400 tracking-wider">
                <i className="fas fa-bullseye mr-2"></i>{t('goals_card_title')}
            </h3>
            <div className="text-sm">
                <div className={commonRowStyle}>
                    <span className={labelStyle}>{t('goals_card_shift_goal')}</span>
                    <div className={`${valueContainerStyle} bg-slate-700/30`}>
                        <EditableField
                            initialValue={metaStesoTurno}
                            onSave={handleStesoShiftGoalChange}
                            spanClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 block"
                            inputClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 bg-transparent border-none focus:ring-0"
                        />
                    </div>
                </div>
                <div className={commonRowStyle}>
                    <span className={labelStyle}>{t('goals_card_day_goal')}</span>
                    <div className={`${valueContainerStyle} bg-slate-700/30`}>
                         <EditableField
                            initialValue={metaStesoDia}
                            onSave={handleStesoDayGoalChange}
                            spanClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 block"
                            inputClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 bg-transparent border-none focus:ring-0"
                        />
                    </div>
                </div>
                 <div className={commonRowStyle}>
                    <span className={labelStyle}>{t('goals_card_appeso_goal')}</span>
                    <div className={`${valueContainerStyle} bg-slate-700/30`}>
                         <EditableField
                            initialValue={appesoShiftGoal}
                            onSave={handleAppesoGoalChange}
                            spanClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 block"
                            inputClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 bg-transparent border-none focus:ring-0"
                        />
                    </div>
                </div>
                 <div className={commonRowStyle}>
                    <span className={labelStyle}>{t('goals_card_imb_appeso_goal')}</span>
                    <div className={`${valueContainerStyle} bg-slate-700/30`}>
                         <EditableField
                            initialValue={imbAppesoShiftGoal}
                            onSave={handleImbAppesoGoalChange}
                            spanClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 block"
                            inputClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 bg-transparent border-none focus:ring-0"
                        />
                    </div>
                </div>
                <div className={commonRowStyle}>
                    <span className={labelStyle}>{t('goals_card_total_achieved_shift')}</span>
                    <div className="h-full flex items-center justify-end p-3 border-l border-slate-700/50">
                         <span className="text-right font-bold text-lg text-cyan-300 w-full">{formatNumber(realizadoStesoTurno)}</span>
                    </div>
                </div>
                 <div className={`${commonRowStyle} border-b border-slate-700/50`}>
                    <span className={labelStyle}>{t('goals_card_total_achieved_day')}</span>
                    <div className="h-full flex items-center justify-end p-3 border-l border-slate-700/50">
                         <span className="text-right font-bold text-lg text-cyan-300 w-full">{formatNumber(realizadoStesoDia)}</span>
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-3">
                 {isWeekday && (
                    <>
                        <ProgressBar progress={progressoTurno} label={t('goals_card_shift_progress')} isGoalMet={isShiftGoalTrulyMet} />
                        <ProgressBar progress={progressoDia} label={t('goals_card_day_progress')} isGoalMet={isDayGoalMet} />
                    </>
                 )}
                 <ProgressBar progress={progressoAppeso} label={t('goals_card_appeso_progress')} isGoalMet={progressoAppeso >= 100} />
                 <ProgressBar progress={progressoImbAppeso} label={t('goals_card_imb_appeso_progress')} isGoalMet={progressoImbAppeso >= 100} />
            </div>
        </div>
    );
};

export default GoalsCard;