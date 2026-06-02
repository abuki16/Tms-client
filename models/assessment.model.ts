export interface Quiz {
    readonly id:string;
    kind:"quiz";
    title:string;
    correctAnswers: number;
    totalQuestions: number;
}
export interface LabAssignment {
    readonly id:string;
    kind:"lab";
    title:string;
    functionalityScore:number;
    codeQualityScore: number;
}

export type AssesmentItem = Quiz | LabAssignment ;

export function calculateGrade(item:AssesmentItem): number {
    switch(item.kind){
        case"quiz":
        return Math.round((item.correctAnswers/item.totalQuestions) *100);
        case"lab" :
        return Math.round(item.functionalityScore *0.5 +item.codeQualityScore *0.3,);

    }
}