
export interface MediaPlanItem {
    name: string;
    reach: number;
}

export interface Audience {
    gender: 'All' | 'M' | 'W';
    income_group: 'All' | 'BC' | 'A';
    age_min: number;
    age_max: number;
}

export interface TrainingDataRow {
    AudienceName: string;
    Gender: 'All' | 'M' | 'W';
    Age_min: number;
    Age_max: number;
    Income_Group: 'All' | 'BC' | 'A';
    distance?: number;
    [key: string]: string | number | undefined;
}

export interface IncrementalStep {
    name: string;
    reach: number;
    cumulative_reach: number;
    increment: number;
}

export interface KFactor {
    pair: string;
    value: number;
}

export interface CalculationResult {
    header: string;
    finalReach: number;
    grossReach: number;
    confidence: 'High' | 'Medium' | 'Low';
    dataSourceMsg: string;
    sourceAudiences: string[];
    incrementalData: IncrementalStep[];
    kFactors: KFactor[];
}

// FIX: Define and export the SavedScenario type to resolve the import error. This type encapsulates all the data needed to save and restore a scenario, including inputs and results.
export interface SavedScenario {
    id: number;
    name: string;
    results: CalculationResult;
    mediaPlan: MediaPlanItem[];
    targetAudience: string;
    city: string;
}
