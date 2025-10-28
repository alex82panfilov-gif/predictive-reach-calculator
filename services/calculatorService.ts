
import type { MediaPlanItem, Audience, TrainingDataRow, CalculationResult, IncrementalStep, KFactor, DuplicationMatrix, ExclusionResult } from '../types';
import { DEFAULT_DATA_CSV } from '../constants';

// --- HELPER FUNCTIONS ---

const getPairKey = (name1: string, name2: string): string => {
    return [name1, name2].sort().join(' + ');
};

const parseAudienceString = (audStr: string): Audience => {
    const aud: Partial<Audience> = { gender: 'All', income_group: 'All' };
    const audStrLower = audStr.toLowerCase().trim();

    const parts = audStrLower.split(/\s+/);
    const genderPart = parts[0];
    
    if (genderPart === 'm' || genderPart === 'м') {
        aud.gender = 'M';
    } else if (genderPart === 'w' || genderPart === 'ж') {
        aud.gender = 'W';
    } else {
        aud.gender = 'All';
    }

    if (audStrLower.includes('bc')) {
        aud.income_group = 'BC';
    } else if (audStrLower.includes(' a') || audStrLower.includes('cde')) {
        aud.income_group = 'A';
    }

    const agePart = parts.find(p => p.includes('-'));
    if (agePart) {
        const ageValues = agePart.split('-');
        if (ageValues.length === 2) {
            aud.age_min = parseInt(ageValues[0], 10);
            aud.age_max = parseInt(ageValues[1], 10);
        }
    }
    
    if (isNaN(aud.age_min ?? NaN) || isNaN(aud.age_max ?? NaN)) {
        throw new Error("Неверный формат возраста в строке целевой аудитории. Ожидаемый формат: 'Все 18-44'.");
    }

    return aud as Audience;
};

const calculateAudienceDistance = (userAud: Audience, trainAudRow: TrainingDataRow): number => {
    const userAvgAge = (userAud.age_min + userAud.age_max) / 2;
    const trainAvgAge = (trainAudRow.Age_min + trainAudRow.Age_max) / 2;
    const ageRange = 64 - 18;

    const genderMap: Record<string, number> = { 'All': 0, 'M': 1, 'W': 2 };
    const incomeMap: Record<string, number> = { 'All': 0, 'BC': 1, 'A': 2 };

    const distAge = Math.pow((userAvgAge - trainAvgAge) / ageRange, 2);
    const distGender = Math.pow((genderMap[userAud.gender] ?? 0) - (genderMap[trainAudRow.Gender] ?? 0), 2);
    
    const distIncome = userAud.income_group === 'All'
        ? 0
        : Math.pow((incomeMap[userAud.income_group] ?? 0) - (incomeMap[trainAudRow.Income_Group] ?? 0), 2);

    return Math.sqrt(distAge + distGender + distIncome);
};

const parseCsv = (csvText: string): TrainingDataRow[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: TrainingDataRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row: any = {};
        headers.forEach((header, index) => {
            let key = header;
            if (header.includes(' + ')) {
                const parts = header.split(' + ').map(p => p.trim());
                if (parts.length === 2) {
                    key = getPairKey(parts[0], parts[1]);
                }
            }
            
            let value = '';
            if (index < values.length) {
                value = (values[index] || '').trim();
            }
            
            if (['AudienceName', 'Gender', 'Income_Group'].includes(header)) {
                row[key] = value;
            } else {
                row[key] = parseFloat(value.replace(',', '.')) || 0;
            }
        });
        rows.push(row as TrainingDataRow);
    }
    return rows;
};

const calculateIncrementalSteps = (
    plan: {name: string, reach: number}[],
    overlaps: { [key: string]: number }
): IncrementalStep[] => {
    const steps: Omit<IncrementalStep, 'exclusivity'>[] = [];
    let currentReach = 0;
    const combinedMediaNames: string[] = [];

    const sortedPlan = [...plan].sort((a, b) => b.reach - a.reach);

    for (const mediaItem of sortedPlan) {
        const newChannelReach = mediaItem.reach;
        const lastReach = currentReach;

        if (combinedMediaNames.length === 0) {
            currentReach = newChannelReach;
        } else {
            let maxOverlap = 0;
            for (const existingMediaName of combinedMediaNames) {
                const pairKey = getPairKey(mediaItem.name, existingMediaName);
                if (overlaps[pairKey] !== undefined && overlaps[pairKey] > maxOverlap) {
                    maxOverlap = overlaps[pairKey];
                }
            }
            if (maxOverlap === 0 && combinedMediaNames.length > 0) {
                maxOverlap = lastReach * newChannelReach;
            }
            currentReach = lastReach + newChannelReach - maxOverlap;
        }

        combinedMediaNames.push(mediaItem.name);
        
        currentReach = Math.min(currentReach, 1.0);
        if (currentReach < lastReach) currentReach = lastReach;

        steps.push({
            name: mediaItem.name,
            reach: newChannelReach,
            cumulative_reach: currentReach,
            increment: currentReach - lastReach,
        });
    }

    return steps.map(step => ({
        ...step,
        exclusivity: step.reach > 0 ? step.increment / step.reach : 0,
    }));
};


export const mainReachCalculator = async (
    mediaPlanInput: MediaPlanItem[],
    targetAudienceInput: string,
    cityInput: string,
    dataFileUploader: File | null
): Promise<CalculationResult | { error: string }> => {
    try {
        let dataSourceMsg = "(используются стандартные данные)";
        let csvText = DEFAULT_DATA_CSV;
        if (dataFileUploader) {
            csvText = await dataFileUploader.text();
            dataSourceMsg = `(используется загруженный файл: ${dataFileUploader.name})`;
        }
        
        let dfData = parseCsv(csvText);
        
        dfData = dfData.map(row => {
            const newRow = { ...row };
            Object.keys(newRow).forEach(key => {
                if (typeof newRow[key] === 'number' && !['Age_min', 'Age_max'].includes(key)) {
                    (newRow[key] as number) /= 100;
                }
            });
            return newRow;
        });

        const userAud = parseAudienceString(targetAudienceInput);
        const mediaPlan = mediaPlanInput
            .filter(item => typeof item.reach === 'number' && item.reach > 0)
            .map(item => ({ name: item.name, reach: item.reach / 100 }));

        if (mediaPlan.length === 0) {
            return { error: "Пожалуйста, введите значение охвата больше 0 хотя бы для одного медиаканала." };
        }

        dfData.forEach(row => {
            row.distance = calculateAudienceDistance(userAud, row);
        });

        dfData.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        const bestMatch = dfData[0];
        const secondMatch = dfData.length > 1 ? dfData[1] : null;

        if (!bestMatch) {
            return { error: "Не удалось найти подходящую аудиторию в обучающих данных." };
        }

        const min_dist = bestMatch.distance ?? 0;
        const confidence: 'High' | 'Medium' | 'Low' = min_dist < 0.25 ? 'High' : (min_dist < 0.75 ? 'Medium' : 'Low');
        
        const sourceAudiences = [bestMatch.AudienceName];
        if (secondMatch) {
             sourceAudiences.push(secondMatch.AudienceName);
        }

        const allMediaNames = ["ТВ", "Радио", "Интернет", "ООН", "Метро", "ТЦ", "БЦ", "Аэропорты", "Пресса", "Другое"];
        const kFactorsMap: { [key: string]: number } = {};

        for (let i = 0; i < allMediaNames.length; i++) {
            for (let j = i + 1; j < allMediaNames.length; j++) {
                const m1Name = allMediaNames[i];
                const m2Name = allMediaNames[j];
                const pairKey = getPairKey(m1Name, m2Name);

                const k1_num = (bestMatch[pairKey] as number) || 0;
                const k1_den = ((bestMatch[m1Name] as number) || 0) * ((bestMatch[m2Name] as number) || 0);
                const k1 = k1_den > 0 ? k1_num / k1_den : 1.0;

                let pred_k: number;
                if (secondMatch && secondMatch.distance !== undefined) {
                    const second_min_dist = secondMatch.distance;
                    const k2_num = (secondMatch[pairKey] as number) || 0;
                    const k2_den = ((secondMatch[m1Name] as number) || 0) * ((secondMatch[m2Name] as number) || 0);
                    const k2 = k2_den > 0 ? k2_num / k2_den : 1.0;
                    const totalDist = min_dist + second_min_dist;
                    const w1 = totalDist > 0 ? 1 - (min_dist / totalDist) : 0.5;
                    pred_k = k1 * w1 + k2 * (1 - w1);
                } else {
                    pred_k = k1;
                }
                kFactorsMap[pairKey] = pred_k;
            }
        }
        
        const allOverlaps: { [key: string]: number } = {};
        for (let i = 0; i < mediaPlan.length; i++) {
            for (let j = i + 1; j < mediaPlan.length; j++) {
                 const m1 = mediaPlan[i];
                 const m2 = mediaPlan[j];
                 const pairKey = getPairKey(m1.name, m2.name);
                 const kFactor = kFactorsMap[pairKey] ?? 1.0;
                 const overlap = m1.reach * m2.reach * kFactor;
                 allOverlaps[pairKey] = Math.min(overlap, m1.reach, m2.reach);
            }
        }

        const fullPlanSteps = calculateIncrementalSteps(mediaPlan, allOverlaps);
        const finalReach = fullPlanSteps.length > 0 ? fullPlanSteps[fullPlanSteps.length - 1].cumulative_reach : 0;
        const grossReach = mediaPlan.reduce((sum, item) => sum + item.reach, 0);

        const activeMediaNamesInPlan = mediaPlan.map(m => m.name);
        const dupMatrixHeaders = ['', ...activeMediaNamesInPlan];
        const dupMatrixRows = mediaPlan.map(m1 => {
            const rowData: (string | number)[] = [`**${m1.name}**`];
            mediaPlan.forEach(m2 => {
                if (m1.name === m2.name) {
                    rowData.push("100%");
                } else {
                    const pairKey = getPairKey(m1.name, m2.name);
                    const overlapVal = allOverlaps[pairKey] || 0;
                    const duplication = m1.reach > 0 ? overlapVal / m1.reach : 0;
                    rowData.push(`${(duplication * 100).toFixed(0)}%`);
                }
            });
            return rowData;
        });

        const duplicationMatrix: DuplicationMatrix = {
            headers: dupMatrixHeaders,
            rows: dupMatrixRows,
        };
        
        const exclusionAnalysis: ExclusionResult[] = [];
        for (const itemToExclude of mediaPlan) {
            const subPlan = mediaPlan.filter(m => m.name !== itemToExclude.name);
            let reachWithout = 0;
            if (subPlan.length > 0) {
                const subPlanSteps = calculateIncrementalSteps(subPlan, allOverlaps);
                reachWithout = subPlanSteps.length > 0 ? subPlanSteps[subPlanSteps.length - 1].cumulative_reach : 0;
            }
            const loss = finalReach - reachWithout;
            exclusionAnalysis.push({ name: itemToExclude.name, loss });
        }

        const relevantKFactors: KFactor[] = [];
        Object.keys(allOverlaps).forEach(pairKey => {
            if (kFactorsMap[pairKey] !== undefined) {
                 relevantKFactors.push({ pair: pairKey, value: kFactorsMap[pairKey] });
            }
        });
        relevantKFactors.sort((a,b) => a.pair.localeCompare(b.pair));

        return {
            header: `Результаты для ЦА: ${targetAudienceInput} (${cityInput})`,
            finalReach,
            grossReach,
            confidence,
            dataSourceMsg,
            sourceAudiences,
            incrementalData: fullPlanSteps,
            kFactors: relevantKFactors,
            duplicationMatrix,
            exclusionAnalysis,
        };

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Во время расчета произошла неизвестная ошибка.";
        return { error: `Ошибка при расчете: ${errorMessage}` };
    }
};