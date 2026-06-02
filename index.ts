import { Temporal } from "@js-temporal/polyfill";
import {type Student ,isStudent } from "./models/student.model.js";

const student: Student = {
id: "STU-001",
name: "Hana Tadesse",

enrollmentDate: Temporal.Now.instant(),
 gpa: 3.70
};

//student.id = "STU-999";

console.log(student.gpa?.toFixed(2));

console.log(student.gpa?.toFixed(2) ?? "Not yet graded");



function  processStudent(raw:unknown){

    if(isStudent(raw)){
      const gpaDisplay =raw.gpa?.toFixed(2) ?? "Not yet graded";
      console.log(`student ${raw.name} GPA : ${gpaDisplay}`);
    }
else{
    console.error("Invalid student file received");
}
}

processStudent({ id:"STU-001", name : "Hana" ,gpa:3.7 });

//processStudent(42);


import { parseStudent } from "./models/student.model.js";

console.log(parseStudent({ id: "STU-001", name: "Hana" }));
// Prints a valid Student object

// parseStudent({ id: 42, name: "Test" });

//Lab Session 2 

import { calculateGrade, type AssesmentItem } from "./models/assessment.model.js";
import { type EnrollmentStatus ,describeEnrollment } from "./models/enrollment.model.js";
import { type CourseStatus, describeCourse } from "./models/course.model.js";
const quiz: AssesmentItem = {
id: "QUIZ-001",
kind: "quiz",
title: "SQL Basics",
correctAnswers: 8,
totalQuestions: 10,
};

const lab: AssesmentItem = {
id: "LAB-001",
kind: "lab",
title: "REST API Project",
functionalityScore: 85,
codeQualityScore: 90,
};
console.log(`Quiz grade: ${calculateGrade(quiz)}%`);
console.log(`Lab grade: ${calculateGrade(lab)}%`);
//quiz.id =" Quiz-999";

const pending : EnrollmentStatus={
    status:"PENDING",
    requestedAt:Temporal.Now.instant(),
    studentId:"STU-001",
    courseId:   "CRS-101"

};
console.log(describeEnrollment(pending));

const webDev:CourseStatus={
    status:"ACTIVE",
    enrolledCount:28,
    startDate:Temporal.PlainDate.from("2026-09-01"),
};
console.log(describeCourse(webDev));