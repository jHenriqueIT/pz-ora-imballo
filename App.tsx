
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ProductionData, ShiftData } from './types';
import HourlyTable from './components/ShiftTable';
import { DailySummary, ShiftSummary } from './components/SummaryTable';
import ProductionSummaryModal from './components/ProductionSummaryModal';
import { Dashboard } from './components/Dashboard';
import GoalsCard from './components/GoalsCard';
import { useTranslations } from './LanguageContext';

type Shift = 'manha' | 'tarde' | 'sabado' | 'domingo';
type View = 'hourly' | 'dailySummary';

// FIX: Added parentheses to correctly define the type as an array of objects.
// The previous definition was being parsed as an intersection of an object and an array type,
// which caused a cascade of type errors.
const initialRowData: (Omit<ProductionData, 'pzTot' | 'totOra' | 'pzOra' | 'fte' | 'label'> & { labelKey: string })[] = [
    { id: 'dlb', labelKey: 'label_dlb', isInput: true },
    { id: 'dmw', labelKey: 'label_dmw', isInput: true },
    { id: 'subtotal_steso', labelKey: 'label_subtotal_steso', isInput: false, isSubtotal: true },
    { id: 'appeso', labelKey: 'label_appeso', isInput: true },
    { id: 'imb_appeso', labelKey: 'label_imb_appeso', isInput: true },
    { id: 'total_imballo', labelKey: 'label_total_imballo', isInput: false, isTotal: true },
];

const initializeHourlyData = (): ShiftData => {
    return initialRowData.map(row => ({
        ...row,
        label: '', // Label will be populated by translation
        pzTot: 0, totOra: 0, fte: 0, pzOra: 0,
    }));
};

const morningHours = ['06:45', '07:45', '08:45', '09:45', '10:45', '11:45', '12:45', '13:45'];
const afternoonHours = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const weekendHours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00'];
const monthKeys = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const App: React.FC = () => {
    const { t, toggleLanguage } = useTranslations();
    const [date, setDate] = useState(new Date(2024, 0, 1)); // January 1st
    const [selectedShift, setSelectedShift] = useState<Shift>('manha');
    const [hourlyData, setHourlyData] = useState<{ [dateKey: string]: Partial<{ [shift in Shift]: { [hour: string]: ShiftData } }> }>({});
    const [view, setView] = useState<View>('hourly');
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    
    const [dashboardGoals, setDashboardGoals] = useState({
        dmw: { morning: 5000, afternoon: 4800, sabado: 8000, domingo: 6000 },
        dlb: { morning: 5000, afternoon: 4700, sabado: 8000, domingo: 6000 },
        fte: { morning: 40, afternoon: 38, sabado: 16, domingo: 12 },
    });

    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            const savedHourlyData = localStorage.getItem('productionApp_hourlyData');
            if (savedHourlyData) {
                setHourlyData(JSON.parse(savedHourlyData));
            }

            const savedGoalsRaw = localStorage.getItem('productionApp_dashboardGoals');
            if (savedGoalsRaw) {
                const savedGoals = JSON.parse(savedGoalsRaw);
                // Deep merge to ensure compatibility with old saved data that might not have FTE goals
                setDashboardGoals(prev => ({
                    dmw: { ...prev.dmw, ...(savedGoals.dmw || {}) },
                    dlb: { ...prev.dlb, ...(savedGoals.dlb || {}) },
                    fte: { ...prev.fte, ...(savedGoals.fte || {}) },
                }));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);
    
    const translatedInitialData = useMemo(() => initialRowData.map(row => ({...row, label: t(row.labelKey) })), [t]);

    const getInitializedHourlyData = useCallback(() => {
         return translatedInitialData.map(row => ({
            ...row,
            pzTot: 0, totOra: 0, fte: 0, pzOra: 0,
        }));
    }, [translatedInitialData]);

    const getDateKey = (d: Date) => d.toISOString().split('T')[0];

    const currentHours = selectedShift === 'manha' ? morningHours :
                         selectedShift === 'tarde' ? afternoonHours :
                         weekendHours;

    const calculateHourlyTotals = useCallback((data: ShiftData, previousData: ShiftData | null): ShiftData => {
        const dataWithDeltas = data.map((row, index) => {
            if (!row.isInput) return { ...row, totOra: 0 };
            const prevPzTot = previousData?.[index]?.pzTot || 0;
            const totOra = row.pzTot - prevPzTot;
            return { ...row, totOra };
        });

        const getProcessedRow = (d: ShiftData, id: string) => d.find(r => r.id === id) || { pzTot: 0, fte: 0, totOra: 0 };
        const dlb = getProcessedRow(dataWithDeltas, 'dlb');
        const dmw = getProcessedRow(dataWithDeltas, 'dmw');
        const appeso = getProcessedRow(dataWithDeltas, 'appeso');
        const imb_appeso = getProcessedRow(dataWithDeltas, 'imb_appeso');

        const subtotal_steso_pzTot = dlb.pzTot + dmw.pzTot;
        const subtotal_steso_totOra = dlb.totOra + dmw.totOra;
        const subtotal_steso_fte = dlb.fte + dmw.fte;
        
        const total_imballo_pzTot = subtotal_steso_pzTot + appeso.pzTot + imb_appeso.pzTot;
        const total_imballo_totOra = subtotal_steso_totOra + appeso.totOra + imb_appeso.totOra;
        const total_imballo_fte = subtotal_steso_fte + appeso.fte + imb_appeso.fte;
        
        return dataWithDeltas.map(row => {
            if (row.isInput) {
                const pzOra = row.fte > 0 ? Math.round(row.totOra / row.fte) : 0;
                return { ...row, pzOra };
            } else if (row.id === 'subtotal_steso') {
                const pzOra = subtotal_steso_fte > 0 ? Math.round(subtotal_steso_totOra / subtotal_steso_fte) : 0;
                return { ...row, pzTot: subtotal_steso_pzTot, totOra: subtotal_steso_totOra, fte: subtotal_steso_fte, pzOra };
            } else if (row.id === 'total_imballo') {
                const pzOra = total_imballo_fte > 0 ? Math.round(total_imballo_totOra / total_imballo_fte) : 0;
                return { ...row, pzTot: total_imballo_pzTot, totOra: total_imballo_totOra, fte: total_imballo_fte, pzOra };
            }
            return row;
        });
    }, []);

    const handleDataChange = useCallback((hour: string, id: string, field: 'pzTot' | 'fte', value: number) => {
        const dateKey = getDateKey(date);
        setHourlyData(prev => {
            const dayData = prev[dateKey] || {};
            const shiftDayData = dayData[selectedShift] || {};
            const currentHourData = shiftDayData[hour] || getInitializedHourlyData();
            const updatedHourData = currentHourData.map(row => row.id === id ? { ...row, [field]: value } : row);
            
            const updatedShiftData = { ...shiftDayData, [hour]: updatedHourData };
            const updatedDayData = { ...dayData, [selectedShift]: updatedShiftData };
            
            return { ...prev, [dateKey]: updatedDayData };
        });
    }, [date, selectedShift, getInitializedHourlyData]);

    const processedHourlyData = useMemo(() => {
        const dateKey = getDateKey(date);
        const currentDayDataByShift = hourlyData[dateKey] || {};
        const currentShiftData = currentDayDataByShift[selectedShift] || {};
        
        const processed: { [hour: string]: ShiftData } = {};
        const hours = currentHours;
        
        let previousHourRawData: ShiftData | null = null;
        
        for (const hour of hours) {
            const currentHourRawData = currentShiftData[hour];
            if (currentHourRawData) {
                 processed[hour] = calculateHourlyTotals(currentHourRawData, previousHourRawData);
                 previousHourRawData = currentHourRawData;
            }
        }
        return processed;
    }, [date, hourlyData, selectedShift, currentHours, calculateHourlyTotals]);

    const calculateSummaryData = useCallback((hours: string[], dayDataForShift: { [hour: string]: ShiftData }) => {
        const summaryProcessedData: { [hour: string]: ShiftData } = {};
        let previousHourRawData: ShiftData | null = null;

        for (const hour of hours) {
             const currentHourRawData = dayDataForShift[hour];
             if (currentHourRawData) {
                summaryProcessedData[hour] = calculateHourlyTotals(currentHourRawData, previousHourRawData);
                previousHourRawData = currentHourRawData;
             }
        }

        const activeHours = hours.filter(h => summaryProcessedData[h]);
        if (activeHours.length === 0) return getInitializedHourlyData();

        const lastHourWithData = activeHours[activeHours.length - 1];
        const lastHourPzTot = summaryProcessedData[lastHourWithData];

        const aggregated = translatedInitialData.map((row, index) => {
            const pzTot = lastHourPzTot?.[index]?.pzTot || 0;
            const fte = hours.reduce((sum, h) => sum + (summaryProcessedData[h]?.[index]?.fte || 0), 0);
            return { ...row, pzTot, fte, totOra: 0, pzOra: 0 };
        }) as ShiftData;

        const getRow = (d: ShiftData, id: string) => d.find(r => r.id === id) || { pzTot: 0, fte: 0 };
        const dlb = getRow(aggregated, 'dlb');
        const dmw = getRow(aggregated, 'dmw');
        const appeso = getRow(aggregated, 'appeso');
        const imb_appeso = getRow(aggregated, 'imb_appeso');

        const subtotal_steso_pzTot = dlb.pzTot + dmw.pzTot;
        const subtotal_steso_fte = dlb.fte + dmw.fte;
        
        const total_imballo_pzTot = subtotal_steso_pzTot + appeso.pzTot + imb_appeso.pzTot;
        const total_imballo_fte = subtotal_steso_fte + appeso.fte + imb_appeso.fte;

        return aggregated.map(row => {
            if (row.isInput) {
                const pzOra = row.fte > 0 ? Math.round(row.pzTot / row.fte) : 0;
                return { ...row, pzOra };
            } else if (row.id === 'subtotal_steso') {
                const pzOra = subtotal_steso_fte > 0 ? Math.round(subtotal_steso_pzTot / subtotal_steso_fte) : 0;
                return { ...row, pzTot: subtotal_steso_pzTot, fte: subtotal_steso_fte, pzOra };
            } else if (row.id === 'total_imballo') {
                const pzOra = total_imballo_fte > 0 ? Math.round(total_imballo_pzTot / total_imballo_fte) : 0;
                return { ...row, pzTot: total_imballo_pzTot, fte: total_imballo_fte, pzOra };
            }
            return row;
        });
    }, [calculateHourlyTotals, getInitializedHourlyData, translatedInitialData]);

    const shiftData = useMemo(() => {
        const dateKey = getDateKey(date);
        const dayData = hourlyData[dateKey] || {};
        const shiftDayData = dayData[selectedShift] || {};
        return calculateSummaryData(currentHours, shiftDayData);
    }, [currentHours, selectedShift, hourlyData, date, calculateSummaryData]);

    const morningSummaryData = useMemo(() => {
        const dateKey = getDateKey(date);
        const dayData = hourlyData[dateKey] || {};
        return calculateSummaryData(morningHours, dayData['manha'] || {});
    }, [date, hourlyData, calculateSummaryData]);

    const afternoonSummaryData = useMemo(() => {
        const dateKey = getDateKey(date);
        const dayData = hourlyData[dateKey] || {};
        return calculateSummaryData(afternoonHours, dayData['tarde'] || {});
    }, [date, hourlyData, calculateSummaryData]);

    const dailyData = useMemo(() => {
        const dateKey = getDateKey(date);
        const dayDataByShift = hourlyData[dateKey] || {};
        const dayOfWeek = date.getDay(); // 0 for Sunday, 6 for Saturday

        const allSummaries: ShiftData[] = [];

        if (dayOfWeek === 6) { // Saturday
            const saturdaySummary = calculateSummaryData(weekendHours, dayDataByShift['sabado'] || {});
            allSummaries.push(saturdaySummary);
        } else if (dayOfWeek === 0) { // Sunday
            const sundaySummary = calculateSummaryData(weekendHours, dayDataByShift['domingo'] || {});
            allSummaries.push(sundaySummary);
        } else { // Weekday
            const morningSummary = calculateSummaryData(morningHours, dayDataByShift['manha'] || {});
            const afternoonSummary = calculateSummaryData(afternoonHours, dayDataByShift['tarde'] || {});
            allSummaries.push(morningSummary, afternoonSummary);
        }
        
        const daily = translatedInitialData.map((row, index) => {
            const pzTot = allSummaries.reduce((sum, summary) => sum + (summary[index]?.pzTot || 0), 0);
            const fte = allSummaries.reduce((sum, summary) => sum + (summary[index]?.fte || 0), 0);
            
            return { ...row, pzTot, fte, totOra: 0, pzOra: 0 };
        }) as ShiftData;
        
        const getRow = (d: ShiftData, id: string) => d.find(r => r.id === id) || { pzTot: 0, fte: 0 };
        const dlb = getRow(daily, 'dlb');
        const dmw = getRow(daily, 'dmw');
        const appeso = getRow(daily, 'appeso');
        const imb_appeso = getRow(daily, 'imb_appeso');

        const subtotal_steso_pzTot = dlb.pzTot + dmw.pzTot;
        const subtotal_steso_fte = dlb.fte + dmw.fte;
        
        const total_imballo_pzTot = subtotal_steso_pzTot + appeso.pzTot + imb_appeso.pzTot;
        const total_imballo_fte = subtotal_steso_fte + appeso.fte + imb_appeso.fte;

        return daily.map(row => {
            let pzTot = row.pzTot, fte = row.fte;
            if (row.id === 'subtotal_steso') { pzTot = subtotal_steso_pzTot; fte = subtotal_steso_fte; }
            if (row.id === 'total_imballo') { pzTot = total_imballo_pzTot; fte = total_imballo_fte; }
            const pzOra = fte > 0 ? Math.round(pzTot / fte) : 0;
            return { ...row, pzTot, fte, pzOra };
        });
    }, [date, hourlyData, calculateSummaryData, translatedInitialData]);

    const peakPerformance = useMemo(() => {
        const dateKey = getDateKey(date);
        const dayData = hourlyData[dateKey];
        if (!dayData) return { peak: 0, hour: '--:--' };

        let peak = 0;
        let hourOfPeak = '--:--';

        const dayOfWeek = date.getDay();
        const shiftsToCheck: Shift[] = [];
        if (dayOfWeek === 6) shiftsToCheck.push('sabado');
        else if (dayOfWeek === 0) shiftsToCheck.push('domingo');
        else {
            shiftsToCheck.push('manha');
            shiftsToCheck.push('tarde');
        }
        
        for (const shiftName of shiftsToCheck) {
            const shiftHours = shiftName === 'manha' ? morningHours :
                               shiftName === 'tarde' ? afternoonHours :
                               weekendHours;

            const shiftDataForDay = dayData[shiftName] || {};
            
            let previousHourRawData: ShiftData | null = null;
            for (const hour of shiftHours) {
                const currentHourRawData = shiftDataForDay[hour];
                if (currentHourRawData) {
                    const processedHour = calculateHourlyTotals(currentHourRawData, previousHourRawData);
                    const totalImballoRow = processedHour.find(r => r.id === 'total_imballo');
                    if (totalImballoRow && totalImballoRow.totOra > peak) {
                        peak = totalImballoRow.totOra;
                        hourOfPeak = hour;
                    }
                    previousHourRawData = currentHourRawData;
                }
            }
        }

        return { peak, hour: hourOfPeak };

    }, [date, hourlyData, calculateHourlyTotals]);

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const handleShiftClick = (shift: Shift) => {
        setSelectedShift(shift);
        setView('hourly');
    };

    const handleSave = () => {
        try {
            localStorage.setItem('productionApp_hourlyData', JSON.stringify(hourlyData));
            localStorage.setItem('productionApp_dashboardGoals', JSON.stringify(dashboardGoals));
            setSaveMessage(t('save_success'));
            setTimeout(() => setSaveMessage(''), 2000);
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
            setSaveMessage(t('save_error'));
             setTimeout(() => setSaveMessage(''), 2000);
        }
    };

    const handleExportExcel = () => {
        const dateKey = getDateKey(date).replace(/-/g, '_');
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Categoria;Pz Tot;Ore;Pz Ora\n";

        dailyData.forEach(row => {
            const rowData = [
                `"${row.label.toUpperCase()}"`,
                row.pzTot,
                row.fte,
                row.pzOra
            ].join(';');
            csvContent += rowData + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `producao_${dateKey}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const morningPieceGoal = dashboardGoals.dmw.morning + dashboardGoals.dlb.morning;
    const afternoonPieceGoal = dashboardGoals.dmw.afternoon + dashboardGoals.dlb.afternoon;
    const morningFteGoal = dashboardGoals.fte.morning;
    const afternoonFteGoal = dashboardGoals.fte.afternoon;
    const saturdayPieceGoal = dashboardGoals.dmw.sabado + dashboardGoals.dlb.sabado;
    const saturdayFteGoal = dashboardGoals.fte.sabado;
    const sundayPieceGoal = dashboardGoals.dmw.domingo + dashboardGoals.dlb.domingo;
    const sundayFteGoal = dashboardGoals.fte.domingo;

    const commonButtonStyles = "px-4 py-2 rounded-md text-sm font-bold transition-all duration-200";
    const inactiveButtonStyles = "bg-[#212634] hover:bg-slate-700 text-slate-300";
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 content-wrapper">
             <div className="bg-[#161B22] rounded-xl shadow-2xl p-6 mb-8">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
                        {t('appTitle')}
                    </h1>
                     <div className="flex items-center gap-2 flex-wrap">
                        {saveMessage && <span className="text-green-400 text-xs mr-2 transition-opacity duration-300">{saveMessage}</span>}
                        <button onClick={() => setIsSummaryModalOpen(true)} className="bg-[#212634] hover:bg-slate-700 text-white px-3 py-1.5 text-xs rounded-md font-medium flex items-center gap-1.5 transition-transform transform hover:-translate-y-0.5">
                            <i className="far fa-calendar-alt"></i>{t('actions_summary')}
                        </button>
                        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs rounded-md font-medium flex items-center gap-1.5 transition-transform transform hover:-translate-y-0.5">
                            <i className="far fa-save"></i>{t('actions_save')}
                        </button>
                         <button onClick={toggleLanguage} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 text-xs rounded-md font-medium flex items-center gap-1.5 transition-transform transform hover:-translate-y-0.5">
                            <i className="fas fa-language"></i>{t('actions_translate')}
                        </button>
                        <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 text-xs rounded-md font-medium flex items-center gap-1.5 transition-transform transform hover:-translate-y-0.5">
                            <i className="far fa-file-excel"></i>{t('actions_excel')}
                        </button>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {/* Month Buttons */}
                    <div className="flex gap-2 flex-wrap">
                        {monthKeys.map((monthKey, index) => (
                            <button key={monthKey} onClick={() => setDate(new Date(date.getFullYear(), index, 1))} 
                                className={`px-4 py-1.5 rounded-md text-xs whitespace-nowrap font-semibold transition-all duration-200 transform hover:scale-105 ${date.getMonth() === index ? 'bg-blue-600 text-white' : 'bg-[#212634] hover:bg-slate-700 text-slate-300'}`}>
                                {t(`month_${monthKey}`)}
                            </button>
                        ))}
                    </div>
                     {/* Day Buttons */}
                    <div className="flex gap-2 flex-wrap">
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                            <button key={day} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth(), day))} 
                                className={`w-8 h-8 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold transition-all duration-200 transform hover:scale-105 ${date.getDate() === day ? 'bg-green-500 text-white' : 'bg-[#212634] hover:bg-slate-700 text-slate-300'}`}>
                                {day}
                            </button>
                        ))}
                    </div>
                     {/* Shift/View Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        <button onClick={() => handleShiftClick('manha')} className={`${commonButtonStyles} transform hover:scale-105 ${selectedShift === 'manha' && view === 'hourly' ? 'bg-blue-600 text-white' : inactiveButtonStyles}`}>{t('shift_morning')}</button>
                        <button onClick={() => handleShiftClick('tarde')} className={`${commonButtonStyles} transform hover:scale-105 ${selectedShift === 'tarde' && view === 'hourly' ? 'bg-blue-600 text-white' : inactiveButtonStyles}`}>{t('shift_afternoon')}</button>
                        <button onClick={() => handleShiftClick('sabado')} className={`${commonButtonStyles} transform hover:scale-105 ${selectedShift === 'sabado' && view === 'hourly' ? 'bg-blue-600 text-white' : inactiveButtonStyles}`}>{t('shift_saturday')}</button>
                        <button onClick={() => handleShiftClick('domingo')} className={`${commonButtonStyles} transform hover:scale-105 ${selectedShift === 'domingo' && view === 'hourly' ? 'bg-blue-600 text-white' : inactiveButtonStyles}`}>{t('shift_sunday')}</button>
                        <button onClick={() => setView('dailySummary')} className={`${commonButtonStyles} transform hover:scale-105 ${view === 'dailySummary' ? 'bg-blue-600 text-white' : inactiveButtonStyles}`}>{t('shift_end_of_shift')}</button>
                    </div>
                </div>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {view === 'hourly' ? (
                    <>
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <GoalsCard
                                shiftData={shiftData}
                                dailyData={dailyData}
                                selectedShift={selectedShift}
                                goals={dashboardGoals}
                                setDashboardGoals={setDashboardGoals}
                                date={date}
                            />
                            <ShiftSummary data={shiftData} selectedShift={selectedShift} />
                        </div>
                        <div className="lg:col-span-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {currentHours.map(hour => (
                                    <HourlyTable
                                        key={hour}
                                        hour={hour}
                                        data={processedHourlyData[hour] || getInitializedHourlyData()}
                                        onDataChange={handleDataChange}
                                        selectedShift={selectedShift}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="lg:col-span-1">
                            <DailySummary data={dailyData} />
                        </div>
                        <div className="lg:col-span-3">
                            <Dashboard 
                                morningSummaryData={morningSummaryData}
                                afternoonSummaryData={afternoonSummaryData}
                                dailyData={dailyData}
                                goals={dashboardGoals}
                                setDashboardGoals={setDashboardGoals}
                                selectedShift={selectedShift}
                                date={date}
                                peakPerformance={peakPerformance}
                            />
                        </div>
                    </>
                )}
            </main>
            {isSummaryModalOpen && (
                <ProductionSummaryModal
                    morningData={morningSummaryData}
                    afternoonData={afternoonSummaryData}
                    dailyData={dailyData}
                    date={date}
                    onClose={() => setIsSummaryModalOpen(false)}
                    morningGoal={morningPieceGoal}
                    afternoonGoal={afternoonPieceGoal}
                    morningFteGoal={morningFteGoal}
                    afternoonFteGoal={afternoonFteGoal}
                    saturdayGoal={saturdayPieceGoal}
                    saturdayFteGoal={saturdayFteGoal}
                    sundayGoal={sundayPieceGoal}
                    sundayFteGoal={sundayFteGoal}
                />
            )}
        </div>
    );
};

export default App;
