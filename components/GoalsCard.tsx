import React, { useState, useEffect } from 'react';
import { ShiftData } from '../types';
import EditableField from './EditableField';
import { useTranslations } from '../LanguageContext';

interface GoalsCardProps {
    shiftData: ShiftData;
    dailyData: ShiftData;
    selectedShift: 'manha' | 'tarde' | 'sabado' | 'domingo';
    goals: {
        dmw: { morning: number; afternoon: number; sabado: number; domingo: number; };
        dlb: { morning: number; afternoon: number; sabado: number; domingo: number; };
    };
    setDashboardGoals: React.Dispatch<React.SetStateAction<{
        dmw: { morning: number; afternoon: number; sabado: number; domingo: number; };
        dlb: { morning: number; afternoon: number; sabado: number; domingo: number; };
    }>>;
    date: Date;
}

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('de-DE').format(Math.round(num));
};

const ProgressBar: React.FC<{ progress: number; label: string }> = ({ progress, label }) => {
    const [displayProgress, setDisplayProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const boundedProgress = Math.max(0, Math.min(100, progress));
            setDisplayProgress(boundedProgress);
        }, 100);

        return () => clearTimeout(timer);
    }, [progress]);


    return (
        <div className="bg-slate-900/50 rounded-full h-8 relative overflow-hidden shadow-inner text-center border border-slate-700">
             <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full absolute left-0 top-0 transition-all duration-1000 ease-out"
                style={{ width: `${displayProgress}%` }}
            ></div>
            <span className="relative z-10 font-bold text-white text-sm leading-8 tracking-wider">
                {progress.toFixed(1)}% ({label})
            </span>
        </div>
    );
};

const GoalsCard: React.FC<GoalsCardProps> = ({ shiftData, dailyData, selectedShift, goals, setDashboardGoals, date }) => {
    const { t } = useTranslations();
    const totalRealizadoTurno = shiftData.find(row => row.id === 'total_imballo')?.pzTot || 0;
    const totalRealizadoDia = dailyData.find(row => row.id === 'total_imballo')?.pzTot || 0;

    const goalShiftKeyMap = {
        manha: 'morning',
        tarde: 'afternoon',
        sabado: 'sabado',
        domingo: 'domingo',
    } as const;
    
    const goalShiftKey = goalShiftKeyMap[selectedShift];

    const dmwShiftGoal = goals.dmw[goalShiftKey] || 0;
    const dlbShiftGoal = goals.dlb[goalShiftKey] || 0;
    const metaTurno = dmwShiftGoal + dlbShiftGoal;

    const dayOfWeek = date.getDay(); // 0 Sunday, 6 Saturday

    let metaDia = 0;
    if (dayOfWeek === 6) { // Saturday
        metaDia = (goals.dmw.sabado || 0) + (goals.dlb.sabado || 0);
    } else if (dayOfWeek === 0) { // Sunday
        metaDia = (goals.dmw.domingo || 0) + (goals.dlb.domingo || 0);
    } else { // Weekday
        metaDia = (goals.dmw.morning || 0) + (goals.dlb.morning || 0) + (goals.dmw.afternoon || 0) + (goals.dlb.afternoon || 0);
    }

    const progressoTurno = metaTurno > 0 ? (totalRealizadoTurno / metaTurno) * 100 : 0;
    const progressoDia = metaDia > 0 ? (totalRealizadoDia / metaDia) * 100 : 0;

    const handleShiftGoalChange = (newTotal: number) => {
        const oldTotal = metaTurno;

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

    const handleDayGoalChange = (newTotal: number) => {
        const oldTotal = metaDia;
        
        setDashboardGoals(prev => {
            const newGoals = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid mutation issues
            
            if (oldTotal === 0) { // If old total is 0, distribute evenly
                if (dayOfWeek === 6) { // Saturday
                    newGoals.dmw.sabado = Math.round(newTotal / 2);
                    newGoals.dlb.sabado = newTotal - newGoals.dmw.sabado;
                } else if (dayOfWeek === 0) { // Sunday
                    newGoals.dmw.domingo = Math.round(newTotal / 2);
                    newGoals.dlb.domingo = newTotal - newGoals.dmw.domingo;
                } else { // Weekday
                    const quarter = Math.round(newTotal / 4);
                    newGoals.dmw.morning = quarter;
                    newGoals.dlb.morning = quarter;
                    newGoals.dmw.afternoon = quarter;
                    newGoals.dlb.afternoon = newTotal - (quarter * 3);
                }
            } else { // Distribute proportionally
                if (dayOfWeek === 6) { // Saturday
                    const dmwProp = prev.dmw.sabado / oldTotal;
                    newGoals.dmw.sabado = Math.round(newTotal * dmwProp);
                    newGoals.dlb.sabado = newTotal - newGoals.dmw.sabado;
                } else if (dayOfWeek === 0) { // Sunday
                    const dmwProp = prev.dmw.domingo / oldTotal;
                    newGoals.dmw.domingo = Math.round(newTotal * dmwProp);
                    newGoals.dlb.domingo = newTotal - newGoals.dmw.domingo;
                } else { // Weekday
                    const dmwMornProp = prev.dmw.morning / oldTotal;
                    const dlbMornProp = prev.dlb.morning / oldTotal;
                    const dmwAftProp = prev.dmw.afternoon / oldTotal;
                    
                    const newDmwMorn = Math.round(newTotal * dmwMornProp);
                    const newDlbMorn = Math.round(newTotal * dlbMornProp);
                    const newDmwAft = Math.round(newTotal * dmwAftProp);
                    const newDlbAft = newTotal - newDmwMorn - newDlbMorn - newDmwAft;

                    newGoals.dmw.morning = newDmwMorn;
                    newGoals.dlb.morning = newDlbMorn;
                    newGoals.dmw.afternoon = newDmwAft;
                    newGoals.dlb.afternoon = newDlbAft;
                }
            }
            return newGoals;
        });
    };

    const commonRowStyle = "grid grid-cols-2 items-center border-t border-slate-700/50";
    const labelStyle = "font-semibold p-3 text-slate-300";
    const valueContainerStyle = "h-full flex items-center justify-end p-0 border-l border-slate-700/50";

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg w-full text-slate-200 overflow-hidden border border-slate-700 transition-transform duration-300 hover:scale-[1.03] hover:shadow-red-500/10">
            <h3 className="text-lg font-bold p-3 text-center uppercase text-red-400 tracking-wider">
                <i className="fas fa-bullseye mr-2"></i>{t('goals_card_title')}
            </h3>
            <div className="text-sm">
                <div className={commonRowStyle}>
                    <span className={labelStyle}>{t('goals_card_shift_goal')}</span>
                    <div className={`${valueContainerStyle} bg-slate-700/30`}>
                        <EditableField
                            initialValue={metaTurno}
                            onSave={handleShiftGoalChange}
                            spanClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 block"
                            inputClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 bg-transparent border-none focus:ring-0"
                        />
                    </div>
                </div>
                <div className={commonRowStyle}>
                    <span className={labelStyle}>{t('goals_card_day_goal')}</span>
                    <div className={`${valueContainerStyle} bg-slate-700/30`}>
                         <EditableField
                            initialValue={metaDia}
                            onSave={handleDayGoalChange}
                            spanClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 block"
                            inputClassName="text-right font-bold text-lg text-red-400 w-full h-full p-3 bg-transparent border-none focus:ring-0"
                        />
                    </div>
                </div>
                <div className={`${commonRowStyle} border-b border-slate-700/50`}>
                    <span className={labelStyle}>{t('goals_card_total_achieved')}</span>
                    <div className="h-full flex items-center justify-end p-3 border-l border-slate-700/50">
                         <span className="text-right font-bold text-lg text-cyan-300 w-full">{formatNumber(totalRealizadoTurno)}</span>
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-3">
                 <ProgressBar progress={progressoTurno} label={t('goals_card_shift_progress')} />
                 <ProgressBar progress={progressoDia} label={t('goals_card_day_progress')} />
            </div>
        </div>
    );
};

export default GoalsCard;