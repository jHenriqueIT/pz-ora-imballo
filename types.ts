
export interface ProductionData {
    id: string;
    label: string;
    pzTot: number;
    totOra: number;
    fte: number;
    pzOra: number;
    isInput: boolean;
    isSubtotal?: boolean;
    isTotal?: boolean;
    afternoonDisabled?: boolean;
}

export type ShiftData = ProductionData[];
