import type { Student } from '../types';

/**
 * Calculates academic score (0-40 points) based on GPA.
 * Formula: GPA percentage * 40 / 100
 */
export function calculateAcademicScore(gpa: number): number {
  return Number(((gpa * 40) / 100).toFixed(2));
}

/**
 * Calculates attendance score (0-20 points) based on attendance percentage.
 * Formula: Attendance % * 20 / 100
 */
export function calculateAttendanceScore(percentage: number): number {
  return Number(((percentage * 20) / 100).toFixed(2));
}

/**
 * Recalculates all grant-related rating scores for a single student.
 * This is the pure rules engine enforcing PDP University strategic rules.
 */
export function recalculateStudentRating(student: Omit<Student, 'academicScore' | 'attendanceScore' | 'assignmentScore' | 'activityScore' | 'tutorScore' | 'totalBaseScore' | 'finalScore' | 'isGrantCancelled' | 'riskLevel'>): Student {
  // 1. Academic Score (Max 40)
  const academicScore = calculateAcademicScore(student.gpa);

  // 2. Attendance Score (Max 20)
  const attendanceScore = calculateAttendanceScore(student.attendance_summary.attendance_percentage);

  // 3. Assignment Score (Max 15)
  // Average of assignments graded, or sum. In our design, we average the scored assignments and scale it to 15 points
  const gradedAssignments = student.assignments.filter(a => a.score !== undefined);
  let assignmentScore = 0;
  if (gradedAssignments.length > 0) {
    const totalGrades = gradedAssignments.reduce((sum, item) => sum + (item.score || 0), 0);
    assignmentScore = Number((totalGrades / gradedAssignments.length).toFixed(2));
  }
  // Cap at 15
  assignmentScore = Math.min(15, Math.max(0, assignmentScore));

  // 4. Activity Score (Max 10)
  // Sum points for all approved (Tasdiqlandi) achievements
  const approvedAchievements = student.achievements.filter(a => a.status === 'Tasdiqlandi');
  let activityScore = approvedAchievements.reduce((sum, a) => sum + a.pointsAwarded, 0);
  activityScore = Math.min(10, activityScore);

  // 5. Tutor Score (Max 5)
  // Sum of 5 items, each 0 or 1 point
  const te = student.tutorEvaluation;
  const tutorScore = Math.min(5, Math.max(0, 
    (te.corporateCulture ? 1 : 0) +
    (te.socialActivity ? 1 : 0) +
    (te.softSkills ? 1 : 0) +
    (te.discipline ? 1 : 0) +
    (te.dormitoryLife ? 1 : 0)
  ));

  // 6. Discipline Score (Max 10)
  // Baseline discipline score, default 10. Can be configured. We will store it in custom state or default to 10
  // Let's assume baseline is 10, reduced if student has major issues, or simply keep a customizable field
  const disciplineScore = Math.min(10, Math.max(0, student.disciplineScore ?? 10));

  // 7. Base Total Score (Max 100)
  const totalBaseScore = Number((academicScore + attendanceScore + assignmentScore + activityScore + tutorScore + disciplineScore).toFixed(2));

  // 8. Penalty Score (Capped at -20)
  const penaltyScore = Math.min(20, Math.max(0, student.penaltyScore || 0));

  // 9. Recovery Score (Max 10, and capped at 50% of the penalty score)
  const maxRecoveryAllowed = Number((penaltyScore * 0.5).toFixed(2));
  const recoveryScore = Math.min(10, Math.min(student.recoveryScore || 0, maxRecoveryAllowed));

  // 10. Employment Score (Max 10)
  const employmentScore = Math.min(10, Math.max(0, student.employmentScore || 0));

  // 11. Final Score
  // totalBaseScore - penaltyScore + recoveryScore + employmentScore
  const finalScore = Number((totalBaseScore - penaltyScore + recoveryScore + employmentScore).toFixed(2));

  // 12. Status (Akademik bekor qilindi)
  // GPA < 80% or Attendance < 80% results in direct grant loss
  const isAcademicFailed = student.gpa < 80 || student.attendance_summary.attendance_percentage < 80;
  // If penalty is too severe (like direct cheat in compliance) or debt > 30 days
  const isGrantCancelled = isAcademicFailed;

  // 13. Risk Assessment
  let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';
  if (isGrantCancelled || student.gpa < 80 || student.attendance_summary.attendance_percentage < 82 || finalScore < 75 || penaltyScore >= 12) {
    riskLevel = 'High';
  } else if ((student.gpa >= 80 && student.gpa < 83) || (student.attendance_summary.attendance_percentage >= 82 && student.attendance_summary.attendance_percentage < 86) || (finalScore >= 75 && finalScore < 83) || penaltyScore >= 6) {
    riskLevel = 'Medium';
  }

  return {
    ...student,
    academicScore,
    attendanceScore,
    assignmentScore,
    activityScore,
    tutorScore,
    disciplineScore,
    totalBaseScore,
    penaltyScore,
    recoveryScore,
    employmentScore,
    finalScore,
    isGrantCancelled,
    riskLevel
  };
}
