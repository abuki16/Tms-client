import { Temporal } from "@js-temporal/polyfill" ;
export interface Course {
    readonly id: string;
    title:string;
    capacity: number;
    startDate?: Temporal.PlainDate;

}
export type CourseStatus =
| { status: "DRAFT"; createdBy: string; createdAt: Temporal.Instant }
| { status: "PUBLISHED"; publishedAt: Temporal.Instant; syllabus: string }
| {status: "ACTIVE";enrolledCount: number;startDate: Temporal.PlainDate;}
| {status: "ARCHIVED";archivedAt: Temporal.Instant;finalEnrollmentCount: number;}
| { status: "CANCELLED"; reason: string; cancelledAt: Temporal.Instant };


export function describeCourse(status: CourseStatus): string {
switch (status.status) {
case "DRAFT":
return` Draft created by ${status.createdBy}`;

case "PUBLISHED":
return `Published with syllabus: ${status.syllabus}`;

case "ACTIVE":
return `Active with ${status.enrolledCount} students since ${status.startDate}  ` ;

case "ARCHIVED":
return` Archived with ${status.finalEnrollmentCount} students `;

case "CANCELLED":
return` Cancelled: ${status.reason} `;

default: {
const _check: never = status;
throw new Error(`Unhandled status: ${JSON.stringify(_check)}`);
}
}
}