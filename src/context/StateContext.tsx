import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Student, AuditLog, StudentAchievement, StudentIdea, MentorFeedback, TutorEvaluation, Subject, AttendanceLog } from '../types';
import { initialStudents, initialAuditLogs } from '../mock/seedData';
import { recalculateStudentRating } from '../lib/rules';

export type UserRole = 'Guest' | 'Student' | 'Mentor' | 'Admin';

export interface State {
  activeRole: UserRole;
  activeStudentId: string;
  students: Student[];
  auditLogs: AuditLog[];
}

export type Action =
  | { type: 'SWITCH_ROLE'; payload: UserRole }
  | { type: 'SWITCH_STUDENT'; payload: string }
  | { type: 'MARK_ATTENDANCE'; payload: { studentId: string; subjectId: string; date: string; status: 'attended' | 'absent'; reason?: string | null } }
  | { type: 'GRADE_ASSIGNMENT'; payload: { studentId: string; assignmentId: string; score: number; feedback: string } }
  | { type: 'UPLOAD_ACHIEVEMENT'; payload: { studentId: string; achievement: Omit<StudentAchievement, 'id' | 'status' | 'pointsAwarded' | 'submittedAt'> } }
  | { type: 'VERIFY_ACHIEVEMENT'; payload: { studentId: string; achievementId: string; status: 'Tasdiqlandi' | 'Rad etildi'; adminComment: string; pointsAwarded: number } }
  | { type: 'SUBMIT_IDEA'; payload: { studentId: string; idea: Omit<StudentIdea, 'id' | 'status' | 'pointsAwarded' | 'submittedAt' | 'reviewedAt' | 'adminMessage'> } }
  | { type: 'REVIEW_IDEA'; payload: { studentId: string; ideaId: string; status: 'Tasdiqlandi' | 'Joriy qilindi' | 'Rad etildi'; adminMessage: string } }
  | { type: 'ADD_FEEDBACK'; payload: { studentId: string; feedback: Omit<MentorFeedback, 'id' | 'date'> } }
  | { type: 'UPDATE_TUTOR_EVAL'; payload: { studentId: string; evaluation: TutorEvaluation } }
  | { type: 'UPDATE_STUDENT_BONUSES'; payload: { studentId: string; penaltyScore: number; recoveryScore: number; employmentScore: number; disciplineScore?: number } }
  | { type: 'IMPORT_API_DATA'; payload: any }
  | { type: 'TOGGLE_2FA'; payload: { studentId: string } }
  | { type: 'TOGGLE_TELEGRAM'; payload: { studentId: string; sync: boolean; token?: string } }
  | { type: 'RESET_STATE' };

const LOCAL_STORAGE_KEY = 'edumetric_lms_state_v1';

const initialState: State = {
  activeRole: 'Guest',
  activeStudentId: 'ST-2026-8941', // Asilbek Toshpulatov
  students: initialStudents,
  auditLogs: initialAuditLogs,
};

function normalizeStudent(student: Student): Student {
  return {
    ...student,
    achievements: student.achievements ?? [],
    ideas: student.ideas ?? [],
    feedback: student.feedback ?? []
  };
}

function addLog(logs: AuditLog[], role: 'Admin' | 'Mentor' | 'Student' | 'System', action: string, details: string, userId: string = 'System'): AuditLog[] {
  const newLog: AuditLog = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId,
    userRole: role,
    action,
    details
  };
  return [newLog, ...logs];
}

function stateReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SWITCH_ROLE': {
      const logs = addLog(state.auditLogs, 'System', 'Rol o\'zgartirildi', `Tizim foydalanuvchisi rolni ${action.payload} holatiga o'tkazdi.`);
      return { ...state, activeRole: action.payload, auditLogs: logs };
    }
    case 'SWITCH_STUDENT': {
      const student = state.students.find(s => s.id === action.payload);
      const studentName = student ? student.fullName : action.payload;
      const logs = addLog(state.auditLogs, 'System', 'Tizim foydalanuvchisi tanlandi', `Student konteksti ${studentName} ga o'zgartirildi.`);
      return { ...state, activeStudentId: action.payload, auditLogs: logs };
    }
    case 'MARK_ATTENDANCE': {
      const { studentId, subjectId, date, status, reason } = action.payload;
      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;

        const updatedSubjects = student.subjects.map(sub => {
          if (sub.subject_id !== subjectId) return sub;

          // Check if log for this date exists, if yes modify it, else add it
          const existingLogIndex = sub.logs.findIndex(l => l.date === date);
          let newLogs = [...sub.logs];

          if (existingLogIndex >= 0) {
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex]!,
              status,
              reason: reason || null
            };
          } else {
            newLogs.push({
              date,
              time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
              status,
              reason: reason || null
            });
          }

          // Recalculate subject summary
          const total = newLogs.length;
          const attended = newLogs.filter(l => l.status === 'attended').length;
          const absent = total - attended;
          const percentage = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 100.0;

          return {
            ...sub,
            subject_summary: { total, attended, absent, percentage },
            logs: newLogs
          };
        });

        // Recalculate global student attendance summaries
        let total_lessons = 0;
        let attended = 0;
        student.subjects.forEach(s => {
          // If the subject was updated, use the new summary
          const updatedSub = updatedSubjects.find(us => us.subject_id === s.subject_id);
          const sum = updatedSub ? updatedSub.subject_summary : s.subject_summary;
          total_lessons += sum.total;
          attended += sum.attended;
        });

        // Add dummy baseline fallback if subjects logs are empty
        if (total_lessons === 0) {
          total_lessons = student.attendance_summary.total_lessons;
          attended = student.attendance_summary.attended;
        }

        const attendance_percentage = total_lessons > 0 ? Number(((attended / total_lessons) * 100).toFixed(1)) : 100.0;

        return recalculateStudentRating({
          ...student,
          subjects: updatedSubjects,
          attendance_summary: {
            total_lessons,
            attended,
            absent: total_lessons - attended,
            attendance_percentage
          }
        });
      });

      const st = state.students.find(s => s.id === studentId);
      const actionName = (status === 'attended' || status === 'absent') ? (status === 'attended' ? 'KELDIdan keldi deb belgilandi' : 'KELMADIdan kelmadi deb belgilandi') : 'davomat tahrirlandi';
      const logs = addLog(
        state.auditLogs,
        'Mentor',
        'Davomat belgilanishi',
        `${st?.fullName} (guruh: ${st?.group}) talabasi davomati tahrirlandi: ${date} sanasida '${status === 'attended' ? 'Keldi' : 'Kelmadi'}'.`,
        'MENTOR-1'
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'GRADE_ASSIGNMENT': {
      const { studentId, assignmentId, score, feedback } = action.payload;
      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;

        const updatedAssignments = student.assignments.map(asn => {
          if (asn.id !== assignmentId) return asn;
          return {
            ...asn,
            status: 'Topshirilgan' as const,
            score,
            feedback
          };
        });

        return recalculateStudentRating({
          ...student,
          assignments: updatedAssignments
        });
      });

      const st = state.students.find(s => s.id === studentId);
      const asn = st?.assignments.find(a => a.id === assignmentId);
      const logs = addLog(
        state.auditLogs,
        'Mentor',
        'Vazifa baholandi',
        `Mentor ${st?.fullName} talabasining '${asn?.title}' vazifasini baholadi: ${score} ball, izoh: ${feedback.substring(0, 30)}...`,
        'MENTOR-1'
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'UPLOAD_ACHIEVEMENT': {
      const { studentId, achievement } = action.payload;
      const newAchievement: StudentAchievement = {
        ...achievement,
        id: `ACH-${Date.now()}`,
        status: 'Kutilmoqda',
        pointsAwarded: 0,
        submittedAt: new Date().toISOString().split('T')[0]!
      };

      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;
        return recalculateStudentRating({
          ...student,
          achievements: [newAchievement, ...student.achievements]
        });
      });

      const st = state.students.find(s => s.id === studentId);
      const logs = addLog(
        state.auditLogs,
        'Student',
        'Yutuq yuklandi',
        `Talaba ${st?.fullName} o'zining yutug'ini kirtdi: '${achievement.title}' (Toifa: ${achievement.category}). Tasdiqlash uchun kutilmoqda.`,
        studentId
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'VERIFY_ACHIEVEMENT': {
      const { studentId, achievementId, status, adminComment, pointsAwarded } = action.payload;
      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;

        const updatedAchievements = student.achievements.map(ach => {
          if (ach.id !== achievementId) return ach;
          return {
            ...ach,
            status,
            adminComment,
            pointsAwarded: status === 'Tasdiqlandi' ? pointsAwarded : 0
          };
        });

        return recalculateStudentRating({
          ...student,
          achievements: updatedAchievements
        });
      });

      const st = state.students.find(s => s.id === studentId);
      const ach = st?.achievements.find(a => a.id === achievementId);
      const logs = addLog(
        state.auditLogs,
        'Admin',
        `Yutuq ${status === 'Tasdiqlandi' ? 'Tasdiqlandi' : 'Rad etildi'}`,
        `Administrator ${st?.fullName} talabasining '${ach?.title}' yutug'ini ko'rib chiqdi. Qaror: ${status === 'Tasdiqlandi' ? 'Tasdiqlandi (+' + pointsAwarded + ' ball)' : 'Rad etildi'}. Izoh: ${adminComment}`,
        'ADMIN-1'
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'SUBMIT_IDEA': {
      const { studentId, idea } = action.payload;
      const newIdea: StudentIdea = {
        ...idea,
        id: `IDEA-${Date.now()}`,
        status: 'Kutilmoqda',
        pointsAwarded: 0,
        submittedAt: new Date().toISOString().split('T')[0]!
      };

      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;
        return recalculateStudentRating({
          ...student,
          ideas: [newIdea, ...(student.ideas ?? [])]
        });
      });

      const st = state.students.find(s => s.id === studentId);
      const logs = addLog(
        state.auditLogs,
        'Student',
        "Yangi g'oya yuborildi",
        `Talaba ${st?.fullName} universitet uchun yangi yechim taklif qildi: '${idea.title}'. Admin ko'rib chiqishi kutilmoqda.`,
        studentId
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'REVIEW_IDEA': {
      const { studentId, ideaId, status, adminMessage } = action.payload;
      const pointsAwarded = status === 'Joriy qilindi' ? 2 : status === 'Tasdiqlandi' ? 1 : 0;

      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;
        const updatedIdeas = (student.ideas ?? []).map(idea => {
          if (idea.id !== ideaId) return idea;
          return {
            ...idea,
            status,
            adminMessage,
            pointsAwarded,
            reviewedAt: new Date().toISOString().split('T')[0]!
          };
        });

        return recalculateStudentRating({
          ...student,
          ideas: updatedIdeas
        });
      });

      const st = state.students.find(s => s.id === studentId);
      const idea = st?.ideas?.find(item => item.id === ideaId);
      const logs = addLog(
        state.auditLogs,
        'Admin',
        `G'oya ${status}`,
        `Administrator ${st?.fullName} talabasining '${idea?.title}' g'oyasini ko'rib chiqdi. Qaror: ${status} (+${pointsAwarded} ball). Izoh: ${adminMessage}`,
        'ADMIN-1'
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'ADD_FEEDBACK': {
      const { studentId, feedback } = action.payload;
      const newFeedback: MentorFeedback = {
        ...feedback,
        id: `FDB-${Date.now()}`,
        date: new Date().toISOString().split('T')[0]!
      };

      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;
        return {
          ...student,
          feedback: [newFeedback, ...student.feedback]
        };
      });

      const st = state.students.find(s => s.id === studentId);
      const logs = addLog(
        state.auditLogs,
        'Mentor',
        'Shaxsiy feedback yuborildi',
        `Mentor ${st?.fullName} talabasiga yangi feedback yubordi (Toifa: ${feedback.type}).`,
        'MENTOR-1'
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'UPDATE_TUTOR_EVAL': {
      const { studentId, evaluation } = action.payload;
      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;
        return recalculateStudentRating({
          ...student,
          tutorEvaluation: evaluation
        });
      });

      const st = state.students.find(s => s.id === studentId);
      const logs = addLog(
        state.auditLogs,
        'Mentor',
        'Tyutor baholashlari tahrirlandi',
        `Tyutor ${st?.fullName} talabasining ijtimoiy-madaniy ko'rsatkichlarini baholadi.`,
        'TYUTOR-1'
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'UPDATE_STUDENT_BONUSES': {
      const { studentId, penaltyScore, recoveryScore, employmentScore, disciplineScore } = action.payload;
      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;
        return recalculateStudentRating({
          ...student,
          penaltyScore,
          recoveryScore,
          employmentScore,
          disciplineScore: disciplineScore !== undefined ? disciplineScore : student.disciplineScore
        });
      });

      const st = state.students.find(s => s.id === studentId);
      const logs = addLog(
        state.auditLogs,
        'Admin',
        'Jarima/Bonuslar yangilandi',
        `Administrator ${st?.fullName} uchun: Jarima: ${penaltyScore} ball, Qoplash: ${recoveryScore} ball, Bandlik: ${employmentScore} ball.`,
        'ADMIN-1'
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'IMPORT_API_DATA': {
      const payload = action.payload;
      if (!payload || !payload.data) {
        return state;
      }

      const { student, attendance_summary, subjects } = payload.data;
      if (!student || !student.id) {
        return state;
      }

      // Check if student exists in our list. If yes, merge, if no, insert
      const exists = state.students.some(s => s.id === student.id);
      let updatedStudents: Student[];

      if (exists) {
        updatedStudents = state.students.map(s => {
          if (s.id !== student.id) return s;

          // Merge subjects and attendance summaries
          const mergedSubjects = subjects.map((sub: any) => {
            const existingSub = s.subjects.find(es => es.subject_id === sub.subject_id);
            return {
              subject_id: sub.subject_id,
              subject_name: sub.subject_name,
              teacher: sub.teacher,
              subject_summary: sub.subject_summary,
              logs: sub.logs || (existingSub ? existingSub.logs : [])
            };
          });

          return recalculateStudentRating({
            ...s,
            first_name: student.first_name,
            last_name: student.last_name,
            fullName: `${student.first_name} ${student.last_name}`,
            group: student.group,
            attendance_summary: {
              total_lessons: attendance_summary.total_lessons,
              attended: attendance_summary.attended,
              absent: attendance_summary.absent,
              attendance_percentage: attendance_summary.attendance_percentage
            },
            subjects: mergedSubjects
          });
        });
      } else {
        // Create new student
        const newStudent: Omit<Student, 'academicScore' | 'attendanceScore' | 'assignmentScore' | 'activityScore' | 'tutorScore' | 'totalBaseScore' | 'finalScore' | 'isGrantCancelled' | 'riskLevel'> = {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          fullName: `${student.first_name} ${student.last_name}`,
          group: student.group,
          status: 'Grant', // default
          email: `${student.first_name.toLowerCase()}.${student.last_name.toLowerCase()}@pdp.uz`,
          telegramSync: false,
          twoFactorEnabled: false,
          gpa: 85.0, // Default baseline GPA
          attendance_summary: {
            total_lessons: attendance_summary.total_lessons,
            attended: attendance_summary.attended,
            absent: attendance_summary.absent,
            attendance_percentage: attendance_summary.attendance_percentage
          },
          subjects: subjects.map((sub: any) => ({
            subject_id: sub.subject_id,
            subject_name: sub.subject_name,
            teacher: sub.teacher,
            subject_summary: sub.subject_summary,
            logs: sub.logs || []
          })),
          assignments: [
            {
              id: `ASN-${Date.now()}-1`,
              title: "Tizimga moslashish",
              description: "API integratsiyasi orqali birinchi topshiriq",
              deadline: "2026-06-01",
              status: "Topshirilgan",
              score: 14.0
            }
          ],
          achievements: [],
          ideas: [],
          tutorEvaluation: {
            corporateCulture: 1,
            socialActivity: 1,
            softSkills: 1,
            discipline: 1,
            dormitoryLife: 1
          },
          disciplineScore: 10,
          penaltyScore: 0,
          recoveryScore: 0,
          employmentScore: 0,
          feedback: []
        };

        updatedStudents = [...state.students, recalculateStudentRating(newStudent)];
      }

      const logs = addLog(
        state.auditLogs,
        'Admin',
        'API Ma\'lumotlar Yuklanishi',
        `Tashqi FaceID/Skaner API orqali talaba davomati muvaffaqiyatli import qilindi: ${student.first_name} ${student.last_name} (${student.group}).`,
        'API-GATEWAY'
      );

      return {
        ...state,
        students: updatedStudents,
        activeStudentId: student.id, // focus on imported student
        auditLogs: logs
      };
    }
    case 'TOGGLE_2FA': {
      const { studentId } = action.payload;
      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;
        return {
          ...student,
          twoFactorEnabled: !student.twoFactorEnabled
        };
      });

      const st = state.students.find(s => s.id === studentId);
      const statusStr = st?.twoFactorEnabled ? 'o\'chirildi' : 'yoqildi';
      const logs = addLog(
        state.auditLogs,
        'Student',
        'Havfsizlik sozlamasi',
        `Talaba ${st?.fullName} ikki bosqichli himoya (2FA) funksiyasini ${statusStr}.`,
        studentId
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'TOGGLE_TELEGRAM': {
      const { studentId, sync, token } = action.payload;
      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;
        return {
          ...student,
          telegramSync: sync,
          telegramToken: token || student.telegramToken
        };
      });

      const st = state.students.find(s => s.id === studentId);
      const actionName = sync ? 'Telegram bot ulandi' : 'Telegram bot uzildi';
      const logs = addLog(
        state.auditLogs,
        'Student',
        'Bildirishnomalar sozlamasi',
        `Talaba ${st?.fullName} Telegram bildirishnomalarini ${sync ? 'faollashtirdi' : 'to\'xtatdi'}.`,
        studentId
      );

      return { ...state, students: updatedStudents, auditLogs: logs };
    }
    case 'RESET_STATE': {
      const logs = addLog([], 'System', 'Tizim tozalash amali', 'LMS ma\'lumotlar ombori boshlang\'ich holatiga qaytarildi.');
      return {
        ...initialState,
        auditLogs: logs
      };
    }
    default:
      return state;
  }
}

const StateContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(stateReducer, initialState, () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            students: (parsed.students ?? initialState.students).map((student: Student) => recalculateStudentRating(normalizeStudent(student)))
          } as State;
        } catch (e) {
          console.error("Error loading localStorage state:", e);
        }
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a StateProvider');
  }
  return context;
};
