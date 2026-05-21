export interface AttendanceLog {
  date: string;
  time: string;
  status: 'attended' | 'absent';
  reason: string | null;
}

export interface SubjectSummary {
  total: number;
  attended: number;
  absent: number;
  percentage: number;
}

export interface Subject {
  subject_id: string;
  subject_name: string;
  teacher: string;
  subject_summary: SubjectSummary;
  logs: AttendanceLog[];
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  status: 'Topshirilgan' | 'Tekshirilmoqda' | 'Muddat o\'tgan' | 'Bajarilmagan';
  score?: number; // score up to 15
  feedback?: string;
  materials?: string[]; // downloadable files list
}

export interface StudentAchievement {
  id: string;
  title: string;
  category: 'Startup' | 'International IT' | 'National IT' | 'Mentorlik' | 'Online Kurs' | 'Offline Kurs' | 'Volontyorlik' | 'Soft Skills' | 'Networking' | 'Boshqa';
  description: string;
  fileUrl?: string;
  linkUrl?: string;
  pointsAwarded: number;
  status: 'Kutilmoqda' | 'Tasdiqlandi' | 'Rad etildi';
  submittedAt: string;
  adminComment?: string;
}

export interface TutorEvaluation {
  corporateCulture: number; // 0-1
  socialActivity: number;   // 0-1
  softSkills: number;       // 0-1
  discipline: number;       // 0-1
  dormitoryLife: number;    // 0-1
}

export interface MentorFeedback {
  id: string;
  mentorName: string;
  subjectName: string;
  type: 'Academic' | 'Leadership' | 'Soft Skills' | 'Corporate';
  content: string;
  date: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: 'Admin' | 'Mentor' | 'Student' | 'System';
  action: string;
  details: string;
}

export interface Student {
  // Personal Details
  id: string;
  first_name: string;
  last_name: string;
  fullName: string;
  group: string;
  status: 'Grant' | 'Kontrakt';
  avatarUrl?: string;
  email: string;
  telegramSync: boolean;
  telegramToken?: string;
  twoFactorEnabled: boolean;

  // Grade/Attendance detail states
  gpa: number; // GPA percentage (e.g. 85.4)
  attendance_summary: {
    total_lessons: number;
    attended: number;
    absent: number;
    attendance_percentage: number;
  };
  subjects: Subject[];
  assignments: Assignment[];
  achievements: StudentAchievement[];
  tutorEvaluation: TutorEvaluation;
  feedback: MentorFeedback[];

  // Scores calculated based on GRANT_RULES
  academicScore: number;       // calculated GPA points (0 to 40)
  attendanceScore: number;     // calculated Attendance points (0 to 20)
  assignmentScore: number;     // assignment points (0 to 15)
  activityScore: number;       // certificate points (0 to 10)
  tutorScore: number;          // tutor evaluation points (0 to 5)
  disciplineScore: number;     // corporate behavior points (0 to 10)
  totalBaseScore: number;      // sum of above 6 fields (0 to 100)

  penaltyScore: number;        // demerit points (0 to 20)
  recoveryScore: number;       // restored points (0 to 10)
  employmentScore: number;     // IT job bonus (0 to 10)

  finalScore: number;          // totalBaseScore - penaltyScore + recoveryScore + employmentScore (up to 110)
  isGrantCancelled: boolean;   // calculated if gpa < 80% or attendance_percentage < 80% or debt exceeds 30 days
  riskLevel: 'High' | 'Medium' | 'Low';
}
