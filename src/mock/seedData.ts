import type { Student, AuditLog } from '../types';
import { recalculateStudentRating } from '../lib/rules';

const initialRawStudents: Omit<Student, 'academicScore' | 'attendanceScore' | 'assignmentScore' | 'activityScore' | 'tutorScore' | 'totalBaseScore' | 'finalScore' | 'isGrantCancelled' | 'riskLevel'>[] = [
  {
    id: "ST-2026-8941",
    first_name: "Asilbek",
    last_name: "Toshpulatov",
    fullName: "Asilbek Toshpulatov",
    group: "IF-22-04",
    status: "Grant",
    email: "a.toshpulatov@pdp.uz",
    telegramSync: true,
    telegramToken: "PDP-592-X9B",
    twoFactorEnabled: false,
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120",
    gpa: 88.5,
    attendance_summary: {
      total_lessons: 120,
      attended: 108,
      absent: 12,
      attendance_percentage: 90.0
    },
    subjects: [
      {
        subject_id: "SUB-101",
        subject_name: "Ma'lumotlar strukturasi va algoritmlar",
        teacher: "D. Eshmuradov",
        subject_summary: { total: 30, attended: 28, absent: 2, percentage: 93.3 },
        logs: [
          { date: "2026-05-12", time: "09:00", status: "attended", reason: null },
          { date: "2026-05-14", time: "09:00", status: "absent", reason: "Kasalligi sababli (Ma'lumotnoma bor)" }
        ]
      },
      {
        subject_id: "SUB-102",
        subject_name: "Ma'lumotlar bazasi tizimlari",
        teacher: "N. Aliyeva",
        subject_summary: { total: 24, attended: 20, absent: 4, percentage: 83.3 },
        logs: [
          { date: "2026-05-11", time: "11:00", status: "attended", reason: null },
          { date: "2026-05-13", time: "11:00", status: "absent", reason: "Sababsiz" }
        ]
      }
    ],
    assignments: [
      {
        id: "ASN-201",
        title: "BST (Binary Search Tree) Balanslash",
        description: "AVL yoki Qizil-Qora daraxt balanslash algoritmini implement qiling va unumdorligini taqqoslang.",
        deadline: "2026-05-25",
        status: "Tekshirilmoqda",
        materials: ["Ma'ruza_BST_AVL.pdf", "amaliyot_kodi_sample.cpp"]
      },
      {
        id: "ASN-202",
        title: "Database Normalizatsiyasi",
        description: "Kutubxona tizimi ma'lumotlar bazasini 3NF (Uchinchi Normal Forma) gacha keltiring.",
        deadline: "2026-05-18",
        status: "Topshirilgan",
        score: 14.5,
        feedback: "Zo'r bajarilgan! Alohida munosabatlar jadvali to'g'ri loyihalashtirilgan.",
        materials: ["Lecture_Normalization.pdf", "Normalization_Tasks.docx"]
      }
    ],
    achievements: [
      {
        id: "ACH-301",
        title: "Google Cloud Practitioner Certificate",
        category: "International IT",
        description: "GCP platformasida bulut xizmatlarini loyihalashtirish va boshqarish sertifikati.",
        fileUrl: "gcp_cert.pdf",
        pointsAwarded: 4.5,
        status: "Tasdiqlandi",
        submittedAt: "2026-05-10",
        adminComment: "Ajoyib yutuq! Ball qo'shildi."
      },
      {
        id: "ACH-302",
        title: "Edumetric LMS Startup Initiative",
        category: "Startup",
        description: "Universitet grant tizimini avtomatlashtirish bo'yicha startup loyihasi.",
        linkUrl: "https://github.com/dominant/edu-metrix",
        pointsAwarded: 5.0,
        status: "Kutilmoqda",
        submittedAt: "2026-05-20"
      }
    ],
    tutorEvaluation: {
      corporateCulture: 1,
      socialActivity: 1,
      softSkills: 1,
      discipline: 1,
      dormitoryLife: 1
    },
    disciplineScore: 10,
    penaltyScore: 3, // sababsiz dars qoldirgani uchun -3 jarima
    recoveryScore: 1.5, // 50% qoplanmoqda (shanbalikda ko'ngilli bo'lib ishtirok etgani uchun)
    employmentScore: 5, // Amaliyot o'tamoqda (Internship)
    feedback: [
      {
        id: "FDB-401",
        mentorName: "D. Eshmuradov",
        subjectName: "Ma'lumotlar strukturasi va algoritmlar",
        type: "Academic",
        content: "Darslarda juda faol, algoritmlarni chuqur tushunadi. Algoritmik fikrlashi yaxshi shakllangan.",
        date: "2026-05-15"
      },
      {
        id: "FDB-402",
        mentorName: "I. Matkosimov (Tyutor)",
        subjectName: "Korporativ madaniyat",
        type: "Leadership",
        content: "Jamoaviy tadbirlarni tashkil qilishda jonbozlik ko'rsatmoqda, juda samimiy va odobli talaba.",
        date: "2026-05-19"
      }
    ]
  },
  {
    id: "ST-2026-1042",
    first_name: "Sardor",
    last_name: "Ergashev",
    fullName: "Sardor Ergashev",
    group: "IF-22-04",
    status: "Grant",
    email: "s.ergashev@pdp.uz",
    telegramSync: true,
    telegramToken: "PDP-102-Y9Z",
    twoFactorEnabled: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120",
    gpa: 96.2,
    attendance_summary: {
      total_lessons: 120,
      attended: 118,
      absent: 2,
      attendance_percentage: 98.3
    },
    subjects: [
      {
        subject_id: "SUB-101",
        subject_name: "Ma'lumotlar strukturasi va algoritmlar",
        teacher: "D. Eshmuradov",
        subject_summary: { total: 30, attended: 30, absent: 0, percentage: 100 },
        logs: []
      },
      {
        subject_id: "SUB-102",
        subject_name: "Ma'lumotlar bazasi tizimlari",
        teacher: "N. Aliyeva",
        subject_summary: { total: 24, attended: 23, absent: 1, percentage: 95.8 },
        logs: []
      }
    ],
    assignments: [
      {
        id: "ASN-201",
        title: "BST (Binary Search Tree) Balanslash",
        description: "AVL yoki Qizil-Qora daraxt balanslash algoritmini implement qiling.",
        deadline: "2026-05-25",
        status: "Topshirilgan",
        score: 15.0,
        feedback: "Mukammal kod, performance testlari alohida yozilgan!",
        materials: ["Ma'ruza_BST_AVL.pdf"]
      }
    ],
    achievements: [
      {
        id: "ACH-303",
        title: "AWS Certified Solutions Architect",
        category: "International IT",
        description: "Amazon Web Services arxitektori xalqaro professional sertifikati.",
        pointsAwarded: 5.0,
        status: "Tasdiqlandi",
        submittedAt: "2026-05-02",
        adminComment: "Sertifikat haqiqiy va yuqori darajada!"
      }
    ],
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
    employmentScore: 10, // Full-time rasmiy dasturchi (EPAM kompaniyasida)
    feedback: [
      {
        id: "FDB-403",
        mentorName: "N. Aliyeva",
        subjectName: "Ma'lumotlar bazasi tizimlari",
        type: "Academic",
        content: "Guruhda peshqadam. Loyihalarini professional darajada topshiradi.",
        date: "2026-05-17"
      }
    ]
  },
  {
    id: "ST-2026-3021",
    first_name: "Laylo",
    last_name: "Karimova",
    fullName: "Laylo Karimova",
    group: "IF-22-04",
    status: "Kontrakt",
    email: "l.karimova@pdp.uz",
    telegramSync: false,
    twoFactorEnabled: false,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120",
    gpa: 82.4,
    attendance_summary: {
      total_lessons: 120,
      attended: 101,
      absent: 19,
      attendance_percentage: 84.1
    },
    subjects: [
      {
        subject_id: "SUB-101",
        subject_name: "Ma'lumotlar strukturasi va algoritmlar",
        teacher: "D. Eshmuradov",
        subject_summary: { total: 30, attended: 25, absent: 5, percentage: 83.3 },
        logs: []
      }
    ],
    assignments: [
      {
        id: "ASN-201",
        title: "BST (Binary Search Tree) Balanslash",
        description: "AVL daraxti algoritmini implement qiling.",
        deadline: "2026-05-25",
        status: "Bajarilmagan"
      }
    ],
    achievements: [
      {
        id: "ACH-304",
        title: "PDP Online Flutter Kursi",
        category: "Online Kurs",
        description: "Mobil ilovalarni ishlab chiqish Flutter kursi sertifikati.",
        pointsAwarded: 2.0,
        status: "Tasdiqlandi",
        submittedAt: "2026-05-14"
      }
    ],
    tutorEvaluation: {
      corporateCulture: 1,
      socialActivity: 0,
      softSkills: 1,
      discipline: 1,
      dormitoryLife: 1
    },
    disciplineScore: 9,
    penaltyScore: 6, // 2 ta o'rtacha qoidabuzarlik -6 ball
    recoveryScore: 2.0,
    employmentScore: 0,
    feedback: []
  },
  {
    id: "ST-2026-4402",
    first_name: "Bekzod",
    last_name: "Rustamov",
    fullName: "Bekzod Rustamov",
    group: "IF-22-04",
    status: "Grant",
    email: "b.rustamov@pdp.uz",
    telegramSync: false,
    twoFactorEnabled: false,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120",
    gpa: 76.5, // Academic failed (< 80%)! Grant will be cancelled!
    attendance_summary: {
      total_lessons: 120,
      attended: 106,
      absent: 14,
      attendance_percentage: 88.3
    },
    subjects: [
      {
        subject_id: "SUB-101",
        subject_name: "Ma'lumotlar strukturasi va algoritmlar",
        teacher: "D. Eshmuradov",
        subject_summary: { total: 30, attended: 26, absent: 4, percentage: 86.7 },
        logs: []
      }
    ],
    assignments: [
      {
        id: "ASN-201",
        title: "BST (Binary Search Tree) Balanslash",
        deadline: "2026-05-25",
        status: "Muddat o'tgan"
      }
    ],
    achievements: [],
    tutorEvaluation: {
      corporateCulture: 1,
      socialActivity: 0,
      softSkills: 0,
      discipline: 1,
      dormitoryLife: 1
    },
    disciplineScore: 8,
    penaltyScore: 10, // Ko'chirmachilik aniqlangan (Plagiat!) -10 ball jarima!
    recoveryScore: 0,
    employmentScore: 0,
    feedback: [
      {
        id: "FDB-404",
        mentorName: "D. Eshmuradov",
        subjectName: "Ma'lumotlar strukturasi va algoritmlar",
        type: "Corporate",
        content: "Topshiriqda boshqa talaba kodidan nusxa olinganligi ma'lum bo'ldi. Plagiat jarimasi tayinlandi.",
        date: "2026-05-10"
      }
    ]
  },
  {
    id: "ST-2026-5592",
    first_name: "Jasur",
    last_name: "Alimov",
    fullName: "Jasur Alimov",
    group: "IF-22-02",
    status: "Grant",
    email: "j.alimov@pdp.uz",
    telegramSync: true,
    telegramToken: "PDP-592-G3J",
    twoFactorEnabled: false,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120",
    gpa: 84.8,
    attendance_summary: {
      total_lessons: 120,
      attended: 91, // Attendance failed (< 80%)! Grant will be cancelled!
      absent: 29,
      attendance_percentage: 75.8
    },
    subjects: [
      {
        subject_id: "SUB-101",
        subject_name: "Ma'lumotlar strukturasi va algoritmlar",
        teacher: "D. Eshmuradov",
        subject_summary: { total: 30, attended: 21, absent: 9, percentage: 70.0 },
        logs: []
      }
    ],
    assignments: [],
    achievements: [],
    tutorEvaluation: {
      corporateCulture: 0,
      socialActivity: 0,
      softSkills: 1,
      discipline: 0,
      dormitoryLife: 1
    },
    disciplineScore: 7,
    penaltyScore: 12, // Ko'p dars qoldirgani uchun jarimalar
    recoveryScore: 0,
    employmentScore: 0,
    feedback: [
      {
        id: "FDB-405",
        mentorName: "K. Xaitbayev (Tyutor)",
        subjectName: "Intizom",
        type: "Corporate",
        content: "Dars qoldirish bo'yicha ogohlantirish berilgan bo'lsa-da, sababsiz kelmaslikda davom etmoqda.",
        date: "2026-05-18"
      }
    ]
  },
  {
    id: "ST-2026-9041",
    first_name: "Madina",
    last_name: "Usmonova",
    fullName: "Madina Usmonova",
    group: "CS-23-01",
    status: "Grant",
    email: "m.usmonova@pdp.uz",
    telegramSync: true,
    telegramToken: "PDP-904-F7A",
    twoFactorEnabled: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120",
    gpa: 91.5,
    attendance_summary: {
      total_lessons: 120,
      attended: 114,
      absent: 6,
      attendance_percentage: 95.0
    },
    subjects: [
      {
        subject_id: "SUB-101",
        subject_name: "Ma'lumotlar strukturasi va algoritmlar",
        teacher: "D. Eshmuradov",
        subject_summary: { total: 30, attended: 29, absent: 1, percentage: 96.7 },
        logs: []
      }
    ],
    assignments: [
      {
        id: "ASN-201",
        title: "BST (Binary Search Tree) Balanslash",
        deadline: "2026-05-25",
        status: "Topshirilgan",
        score: 14.0,
        feedback: "Ajoyib algoritm implementatsiyasi.",
        materials: ["Ma'ruza_BST_AVL.pdf"]
      }
    ],
    achievements: [
      {
        id: "ACH-305",
        title: "EcoSense Smart-City Startup",
        category: "Startup",
        description: "Ekologik resurslarni aqlli boshqarish bo'yicha startup loyihasi va himoyasi.",
        pointsAwarded: 7.0,
        status: "Tasdiqlandi",
        submittedAt: "2026-05-08",
        adminComment: "Startup komissiya tomonidan yuqori baholandi, eng yuqori +7 ball yozildi."
      }
    ],
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
    employmentScore: 7, // Part-time ishlamoqda (PDP Ecosystem loyihalarida)
    feedback: []
  }
];

export const initialStudents: Student[] = initialRawStudents.map(student => recalculateStudentRating(student));

export const initialAuditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    timestamp: "2026-05-21T08:30:12+05:00",
    userId: "ADMIN-1",
    userRole: "Admin",
    action: "Tizimga kirish",
    details: "Admin boshqaruv paneli orqali tizimga muvaffaqiyatli kirdi."
  },
  {
    id: "LOG-002",
    timestamp: "2026-05-21T08:45:33+05:00",
    userId: "MENTOR-1",
    userRole: "Mentor",
    action: "Davomat o'zgartirildi",
    details: "D. Eshmuradov talaba Asilbek Toshpulatov (IF-22-04) uchun Ma'lumotlar strukturasi fanidan davomatni tahrirladi."
  },
  {
    id: "LOG-003",
    timestamp: "2026-05-21T08:58:10+05:00",
    userId: "ST-2026-8941",
    userRole: "Student",
    action: "Yutuq arizasi yuborildi",
    details: "Asilbek Toshpulatov 'Edumetric LMS Startup Initiative' startapi uchun +5.0 ballik ariza topshirdi (Status: Kutilmoqda)."
  }
];
