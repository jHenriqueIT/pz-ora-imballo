import React from 'react';

interface GoalProgressCardProps {
    title: string;
    goal: number;
    current: number;
    unit?: string;
}

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('de-DE').format(num);
};

const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ title, goal, current, unit = 'Pezzi' }) => {
    const progress = goal > 0 ? (current / goal) * 100 : 0;
    const boundedProgress = Math.max(0, Math.min(100, progress));

    return (
        <div className="bg-[#313a4d] p-3 rounded-lg shadow-inner">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-slate-300 flex items-center">
                    <i className="far fa-dot-circle mr-2 text-slate-400"></i>
                    <span>{title}</span>
                </h4>
                <span className="font-bold text-lg text-red-500">{progress.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{formatNumber(current)} / {formatNumber(goal)} {unit}</p>
            <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
                <div
                    className="bg-slate-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${boundedProgress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default GoalProgressCard;