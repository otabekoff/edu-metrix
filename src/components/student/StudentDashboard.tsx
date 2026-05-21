import React, { useState } from 'react';
import { useGlobalState } from '../../context/StateContext';
import { 
  User, Award, Clock, FileText, CheckCircle2, AlertTriangle, 
  Send, Lock, Bell, MessageSquare, ChevronRight, HelpCircle, Key, RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface StudentDashboardProps {
  activeSubTab?: 'overview' | 'courses' | 'achievements' | 'scholarship' | 'feedback' | 'settings';
  setActiveSubTab?: (tab: 'overview' | 'courses' | 'achievements' | 'scholarship' | 'feedback' | 'settings') => void;
}

export function StudentDashboard({ activeSubTab, setActiveSubTab }: StudentDashboardProps) {
  const { state, dispatch } = useGlobalState();
  
  // Local fallback if tab state is not driven by the parent shell
  const [localSubTab, setLocalSubTab] = useState<'overview' | 'courses' | 'achievements' | 'scholarship' | 'feedback' | 'settings'>('overview');
  const currentTab = activeSubTab || localSubTab;
  const setCurrentTab = setActiveSubTab || setLocalSubTab;

  const student = state.students.find(s => s.id === state.activeStudentId);

  // Form states
  const [achTitle, setAchTitle] = useState('');
  const [achCategory, setAchCategory] = useState<'Startup' | 'International IT' | 'National IT' | 'Mentorlik' | 'Online Kurs' | 'Offline Kurs' | 'Volontyorlik' | 'Soft Skills' | 'Networking' | 'Boshqa'>('International IT');
  const [achDesc, setAchDesc] = useState('');
  const [achLink, setAchLink] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  if (!student) {
    return (
      <div className="p-12 text-center text-slate-400">
        Talaba topilmadi. Bosh sahifaga qaytib rolni qayta tanlang.
      </div>
    );
  }

  // Calculate leaderboard position
  const sortedStudents = [...state.students].sort((a, b) => b.finalScore - a.finalScore);
  const ratingRank = sortedStudents.findIndex(s => s.id === student.id) + 1;

  // Handle achievement upload
  const handleUploadAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle.trim() || !achDesc.trim()) return;

    dispatch({
      type: 'UPLOAD_ACHIEVEMENT',
      payload: {
        studentId: student.id,
        achievement: {
          title: achTitle,
          category: achCategory,
          description: achDesc,
          linkUrl: achLink || undefined
        }
      }
    });

    setAchTitle('');
    setAchDesc('');
    setAchLink('');
    toast.success("Yutuq topshirildi! Admin tasdiqlashi bilan reytingingiz yangilanadi.");
  };

  const handleGenerateToken = () => {
    const randomToken = `PDP-${Math.floor(100 + Math.random() * 900)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    dispatch({
      type: 'TOGGLE_TELEGRAM',
      payload: { studentId: student.id, sync: true, token: randomToken }
    });
  };

  const handleToggleTelegram = (sync: boolean) => {
    dispatch({
      type: 'TOGGLE_TELEGRAM',
      payload: { studentId: student.id, sync }
    });
  };

  const handleToggle2FA = () => {
    dispatch({
      type: 'TOGGLE_2FA',
      payload: { studentId: student.id }
    });
  };

  // Strategic Warning Calculations
  const getStrategicAdvice = () => {
    const adviceList: string[] = [];
    if (student.gpa < 80) {
      adviceList.push(`⚠️ Akademik ko'rsatkich (GPA): joriy ko'rsatkichingiz ${student.gpa}%. Grant nizomiga ko'ra o'tish balli kamida 80% bo'lishi shart! Nazorat ishlarini yaxshiroq topshiring.`);
    }
    if (student.attendance_summary.attendance_percentage < 80) {
      adviceList.push(`⚠️ Davomat foizi: joriy davomatingiz ${student.attendance_summary.attendance_percentage}%. O'tish mezonining minimal chegarasi 80%! Darslarni qoldirmang.`);
    }
    if (student.finalScore < 80) {
      const diff = Number((80 - student.finalScore).toFixed(1));
      adviceList.push(`📈 Reyting yetishmovchiligi: keyingi o'quv yilida grantni saqlab qolish uchun yana kamida ${diff} ball yig'ishingiz kerak (Minimal o'tish balli: 80 ball).`);
    } else if (student.finalScore >= 80 && student.status === 'Grant') {
      adviceList.push(`✅ Tabriklaymiz! Sizning ko'rsatkichlaringiz grantni saqlab qolish uchun etarli darajada. Shunday davom eting!`);
    } else if (student.finalScore >= 80 && student.status === 'Kontrakt') {
      adviceList.push(`🚀 Ajoyib natija! Sizning reyting ballingiz ${student.finalScore} (80 dan yuqori). Agar reytingda guruhdoshlar orasida eng yuqori natijani ko'rsatsangiz, kontraktdan grantga o'tish imkoniyatingiz bor!`);
    }

    return adviceList;
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn text-left">
      
      {/* Student Profile Overview Card (Horizontal Glass Banner) */}
      <Card className="relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/30 backdrop-blur-md p-6 overflow-hidden shadow-sm dark:shadow-none gap-0 py-0 flex-col justify-start">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={student.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120"}
                alt={student.fullName}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-indigo-500/30 object-cover shadow-lg shadow-indigo-500/10"
              />
              <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 text-xs font-black text-white ${student.status === 'Grant' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                {student.status[0]}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none">{student.fullName}</h2>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${student.status === 'Grant' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                  {student.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Guruh: <strong className="text-indigo-400 font-bold">{student.group}</strong> | ID: {student.id}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Leaderboard: <strong className="text-slate-800 dark:text-white font-black">#{ratingRank}-o'rin</strong></span>
                <span>•</span>
                <span>Yakuniy Reyting Balli: <strong className="text-indigo-400 font-extrabold">{student.finalScore} / 110.0</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid inside profile */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-800/40">
            <div className="text-center px-4">
              <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">GPA</span>
              <span className="text-base font-black text-slate-800 dark:text-white">{student.gpa}%</span>
            </div>
            <div className="text-center px-4 border-l border-slate-200 dark:border-zinc-850/50">
              <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">DAVOMAT</span>
              <span className="text-base font-black text-emerald-500 dark:text-emerald-400">{student.attendance_summary.attendance_percentage}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 1. Overview Tab */}
      {currentTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main overview metrics */}
          <div className="md:col-span-2 space-y-8 animate-fadeIn">
            
            {/* Radial Charts Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* GPA Circular Widget */}
              <Card className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border-slate-200 dark:border-zinc-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-colors shadow-lg shadow-indigo-500/2 dark:shadow-none">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">O'rtacha GPA ko'rsatkich</span>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{student.gpa}%</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">Nazorat ishlari baholari: <strong className="text-indigo-500 dark:text-indigo-400">{student.academicScore} / 40.0 ball</strong></p>
                  </div>
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="32" className="stroke-slate-100 dark:stroke-zinc-850 stroke-[5] fill-none" />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="32" 
                        className="stroke-indigo-500 stroke-[5] fill-none drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]"
                        strokeDasharray={201}
                        strokeDashoffset={201 - (201 * student.gpa) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-slate-900 dark:text-white">{student.gpa}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Circular Widget */}
              <Card className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border-slate-200 dark:border-zinc-800 hover:border-purple-500/40 dark:hover:border-purple-500/40 transition-colors shadow-lg shadow-purple-500/2 dark:shadow-none">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Semestr davomati</span>
                    <div className={`text-3xl font-black ${student.attendance_summary.attendance_percentage < 80 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {student.attendance_summary.attendance_percentage}%
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">Dars intizom balli: <strong className="text-purple-500 dark:text-purple-400">{student.attendanceScore} / 20.0 ball</strong></p>
                  </div>
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="32" className="stroke-slate-100 dark:stroke-zinc-850 stroke-[5] fill-none" />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="32" 
                        className={`stroke-[5] fill-none ${
                          student.attendance_summary.attendance_percentage < 80 
                            ? 'stroke-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]' 
                            : 'stroke-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                        }`}
                        strokeDasharray={201}
                        strokeDashoffset={201 - (201 * student.attendance_summary.attendance_percentage) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`absolute text-xs font-black ${student.attendance_summary.attendance_percentage < 80 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                      {student.attendance_summary.attendance_percentage}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strategic Warnings / PDP Rules Banner */}
            <Alert variant={student.gpa < 80 || student.attendance_summary.attendance_percentage < 80 || student.finalScore < 80 ? "warning" : "success"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Grant Saqlab Qolish Monitoringi (PDP Nizomi)</AlertTitle>
              <AlertDescription className="space-y-1.5 mt-2">
                {getStrategicAdvice().map((adv, idx) => (
                  <p key={idx} className="text-xs font-medium leading-relaxed">
                    {adv}
                  </p>
                ))}
              </AlertDescription>
            </Alert>

            {/* General Enrolled Courses Tracker */}
            <Card className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
              <CardHeader className="border-b border-slate-200 dark:border-zinc-800/40 pb-4">
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">Aktiv Fanlaringiz Ro'yxati</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Joriy semestrdagi faol fanlar va dars davomati mezonlari</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3.5">
                {student.subjects.map(sub => (
                  <div key={sub.subject_id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/30 border border-slate-200 dark:border-zinc-800/50 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{sub.subject_name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Mentor: {sub.teacher}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500">Davomat foizi</div>
                      <div className={`text-xs font-black mt-0.5 ${sub.subject_summary.percentage < 80 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-700 dark:text-slate-100'}`}>
                        {sub.subject_summary.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Metrics & Scorecards Right Column */}
          <div className="space-y-8 animate-fadeIn">
            
            {/* KPI Details Sheet with Glowing Track Bars */}
            <Card className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border-slate-200 dark:border-zinc-800 shadow-xl dark:shadow-none">
              <CardHeader className="border-b border-slate-200 dark:border-zinc-800/40 pb-4">
                <CardTitle className="text-base font-black text-slate-900 dark:text-white">Reyting Ballari Detallari</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Baho mezonlarining yakuniy hisoblash koeffitsientlari</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                
                {/* 1. Academic Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">1. Akademik Natija (GPA)</span>
                    <span className="text-slate-800 dark:text-white font-bold">{student.academicScore} / 40.0 ball</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" 
                      style={{ width: `${(student.academicScore / 40.0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 2. Attendance Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">2. Davomat Bahosi</span>
                    <span className="text-slate-800 dark:text-white font-bold">{student.attendanceScore} / 20.0 ball</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
                      style={{ width: `${(student.attendanceScore / 20.0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 3. Assignment Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">3. Amaliy Vazifalar</span>
                    <span className="text-slate-800 dark:text-white font-bold">{student.assignmentScore} / 15.0 ball</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]" 
                      style={{ width: `${(student.assignmentScore / 15.0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 4. Activity Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">4. Faollik & Sertifikatlar</span>
                    <span className="text-slate-800 dark:text-white font-bold">{student.activityScore} / 10.0 ball</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                      style={{ width: `${(student.activityScore / 10.0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 5. Tutor Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">5. Tyutor Bahosi (Ijtimoiy)</span>
                    <span className="text-slate-800 dark:text-white font-bold">{student.tutorScore} / 5.0 ball</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]" 
                      style={{ width: `${(student.tutorScore / 5.0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 6. Discipline Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">6. Intizom Bahosi</span>
                    <span className="text-slate-800 dark:text-white font-bold">{student.disciplineScore} / 10.0 ball</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]" 
                      style={{ width: `${(student.disciplineScore / 10.0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Totals modifiers */}
                <div className="pt-4 border-t border-slate-200 dark:border-zinc-850/60 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                    <span>Asosiy Reyting (KPI)</span>
                    <span>{student.totalBaseScore} / 100.0 ball</span>
                  </div>
                  <div className="flex justify-between text-rose-500 dark:text-rose-400">
                    <span>Jarimalar (Penalty)</span>
                    <span>-{student.penaltyScore} ball</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Reabilitatsiya (Recovery)</span>
                    <span>+{student.recoveryScore} ball</span>
                  </div>
                  <div className="flex justify-between text-indigo-500 dark:text-indigo-300">
                    <span>Bandlik Bonusi (Employment)</span>
                    <span>+{student.employmentScore} ball</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-zinc-850 flex justify-between items-center text-xs font-black">
                  <span className="text-slate-700 dark:text-slate-200 uppercase tracking-wider">YAKUNIY BALL</span>
                  <span className="text-base text-indigo-600 dark:text-indigo-400 font-black bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg shadow-sm">
                    {student.finalScore} / 110.0
                  </span>
                </div>

              </CardContent>
            </Card>

            {/* Grant Status Display Widget */}
            <Alert variant={student.isGrantCancelled ? "destructive" : "success"} className="flex flex-col items-center justify-center text-center p-5 [&>svg]:static [&>svg]:mb-2 [&>svg~*]:pl-0">
              <div className="flex flex-col items-center">
                {student.isGrantCancelled ? <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" /> : <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                <AlertTitle className="uppercase tracking-widest text-xs text-slate-500 mb-1">Grant Nizomi Statusi</AlertTitle>
                <div className={`text-base font-black ${student.isGrantCancelled ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {student.isGrantCancelled ? "Akademik bekor qilindi" : "Grant Faol"}
                </div>
                <AlertDescription className="text-xs text-slate-500 mt-2">
                  {student.isGrantCancelled ? "GPA yoki Davomat mezonidan o'ta olmadingiz!" : "Keyingi o'quv yili uchun barcha mezonlar normal."}
                </AlertDescription>
              </div>
            </Alert>

          </div>
        </div>
      )}

      {/* 2. Courses Tab */}
      {currentTab === 'courses' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Fanlar va Amaliy Topshiriqlar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Joriy davomat foizlari, o'quv resurslari hamda amaliy topshiriqlarni baholash monitoringi.</p>
          </div>
          
          {student.subjects.map(sub => {
            const relatedAssignments = student.assignments; // Simple related assignments list
            return (
              <Card key={sub.subject_id} className="p-6 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border-slate-200 dark:border-zinc-800/80 space-y-6 shadow-sm dark:shadow-none gap-0 py-0 flex-col justify-start">
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-zinc-850/40 pb-4 w-full">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">{sub.subject_name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Mentor: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{sub.teacher}</strong> | Davomatingiz: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{sub.subject_summary.percentage}%</strong></p>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-slate-400 font-mono">
                    Lectures: {sub.subject_summary.attended}/{sub.subject_summary.total}
                  </span>
                </div>

                {/* Materials List */}
                <div className="w-full">
                  <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Yuklab olingan resurslar</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a href="#" onClick={(e) => e.preventDefault()} className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/40 hover:border-indigo-500/30 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-all shadow-sm dark:shadow-none">
                      <FileText size={14} className="text-indigo-500 dark:text-indigo-400" />
                      1-ma'ruza_Slaydlar.pdf
                    </a>
                    <a href="#" onClick={(e) => e.preventDefault()} className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/40 hover:border-indigo-500/30 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-all shadow-sm dark:shadow-none">
                      <FileText size={14} className="text-indigo-500 dark:text-indigo-400" />
                      Amaliy_Ish_Kodi_Sample.zip
                    </a>
                  </div>
                </div>

                {/* Assignments Section */}
                <div className="w-full">
                  <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Topshirilishi kerak bo'lgan vazifalar</h5>
                  <div className="space-y-3.5">
                    {relatedAssignments.map(asn => (
                      <div key={asn.id} className="p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-950/30 border border-slate-200 dark:border-zinc-800/60 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm dark:shadow-none">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <h6 className="text-sm font-black text-slate-900 dark:text-white">{asn.title}</h6>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              asn.status === 'Topshirilgan' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                              asn.status === 'Tekshirilmoqda' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                              'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}>
                              {asn.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">{asn.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500">
                            <span>Muddati (Deadline): <strong className="text-slate-700 dark:text-slate-300 font-bold">{asn.deadline}</strong></span>
                            {asn.score !== undefined && (
                              <span>Baho: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{asn.score} / 15.0 ball</strong></span>
                            )}
                          </div>
                        </div>

                        {asn.feedback && (
                          <div className="sm:max-w-xs p-3 rounded bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed shadow-sm dark:shadow-none">
                            <strong className="block text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">Ustoz Fikri:</strong> 
                            "{asn.feedback}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </Card>
            );
          })}
        </div>
      )}

      {/* 3. Achievements Portfolio Tab */}
      {currentTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
          
          {/* Uploader Form using Shadcn */}
          <div className="md:col-span-1">
            <Card className="bg-white/80 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 backdrop-blur-md shadow-lg sticky top-20">
              <CardHeader className="border-b border-slate-200 dark:border-zinc-850/40 pb-4">
                <CardTitle className="text-base font-black text-slate-900 dark:text-white">Yangi Yutuq Arizasi</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  IT sertifikati, startup yoki mentorlik yutuqlarini ball qo'shilishi uchun yuklang.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleUploadAchievement}>
                <CardContent className="pt-6 space-y-4">
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400">Ariza sarlavhasi</Label>
                    <Input 
                      type="text" 
                      required 
                      placeholder="AWS Cloud Practitioner"
                      value={achTitle}
                      onChange={e => setAchTitle(e.target.value)}
                      className="bg-slate-50/50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400">Toifa mezonini tanlang</Label>
                    <Select 
                      value={achCategory} 
                      onValueChange={(val: any) => setAchCategory(val)}
                    >
                      <SelectTrigger className="bg-slate-50/50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-xs w-full text-slate-800 dark:text-slate-200">
                        <SelectValue placeholder="Toifani tanlang" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-850 text-xs text-slate-800 dark:text-slate-200">
                        <SelectItem value="Startup">Startup Tashabbuskorlari (Max +7 ball)</SelectItem>
                        <SelectItem value="International IT">Xalqaro Professional IT Sertifikat (Max +5 ball)</SelectItem>
                        <SelectItem value="National IT">Milliy IT Sertifikat (Max +2 ball)</SelectItem>
                        <SelectItem value="Online Kurs">PDP Online kurs yakunlash (+2 ball)</SelectItem>
                        <SelectItem value="Offline Kurs">PDP Offline kurs yakunlash (+3 ball)</SelectItem>
                        <SelectItem value="Mentorlik">Mentorlik (3+ talabaga yordam) (+3 ball)</SelectItem>
                        <SelectItem value="Volontyorlik">Ijtimoiy Volontyorlik (+1-2 ball)</SelectItem>
                        <SelectItem value="Soft Skills">Soft Skills Trening (+1 ball)</SelectItem>
                        <SelectItem value="Networking">Networking (ICT Week) (+1 ball)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400">Tavsif va asoslash</Label>
                    <Textarea
                      required
                      placeholder="Qilgan ishingiz va yutuq mazmuni bo'yicha qisqacha ma'lumot yozing..."
                      value={achDesc}
                      onChange={e => setAchDesc(e.target.value)}
                      className="bg-slate-50/50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400">Hujjat havolasi (Google Drive / GitHub)</Label>
                    <Input 
                      type="url" 
                      placeholder="https://drive.google.com/..."
                      value={achLink}
                      onChange={e => setAchLink(e.target.value)}
                      className="bg-slate-50/50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                </CardContent>
                
                <CardFooter className="border-t border-slate-200 dark:border-zinc-800/45 pt-4 pb-6">
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-md shadow-indigo-600/10 cursor-pointer">
                    <Send size={12} />
                    Arizani Baholashga Yuborish
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Chronological Tracker list */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white/80 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-lg">
              <CardHeader className="border-b border-slate-200 dark:border-zinc-850/40 pb-4">
                <CardTitle className="text-base font-black text-slate-900 dark:text-white">Yutuqlar va Sertifikatlar xronologiyasi</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Yuborilgan portfolio arizalaringiz va ularning tasdiqlanish natijalari.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {student.achievements.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-zinc-800/80 rounded-lg">
                    Hozircha yuborilgan arizalar mavjud emas.
                  </div>
                ) : (
                  student.achievements.map(ach => (
                    <div key={ach.id} className="p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-950/30 border border-slate-200 dark:border-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors space-y-3 shadow-sm dark:shadow-none">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">{ach.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                              ach.status === 'Tasdiqlandi' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                              ach.status === 'Rad etildi' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}>
                              {ach.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-mono">{ach.submittedAt}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-zinc-800/40">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Ariza toifasi: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{ach.category}</strong></span>
                        {ach.status === 'Tasdiqlandi' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">Ball qo'shildi: +{ach.pointsAwarded} ball</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 font-medium">Ko'rib chiqilmoqda</span>
                        )}
                      </div>

                      {ach.adminComment && (
                        <div className="p-2.5 rounded bg-slate-100/50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/40 text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm dark:shadow-none">
                          <strong>Admin sharhi:</strong> "{ach.adminComment}"
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* 4. Scholarship & Leaderboard Tab */}
      {currentTab === 'scholarship' && (
        <Card className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-none animate-fadeIn">
          <CardHeader className="border-b border-slate-200 dark:border-zinc-850/40 pb-3">
            <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Guruhlararo Grant Reytingi Jurnali</CardTitle>
            <CardDescription className="text-xs text-slate-555 dark:text-slate-400">PDP University global grant saralash reytingi va talabalar xavf darajalari.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">

          <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 text-xs text-indigo-700 dark:text-indigo-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="leading-relaxed">
              <strong>Strategik nizom eslatmasi:</strong> Grantni saqlash uchun o'quv semestri oxirida akademik ko'rsatkich kamida 80%, davomat 80% bo'lishi va yakuniy ball kamida 80.0 ball bo'lishi shart.
            </div>
            <span className="font-extrabold text-xs bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm dark:shadow-none">
              Joriy ballingiz: {student.finalScore} ball
            </span>
          </div>

          {/* Sticky rating spreadsheet */}
          <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800/80 rounded-lg shadow-sm dark:shadow-none">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">O'rin</th>
                  <th className="py-3 px-4">Talaba F.I.O</th>
                  <th className="py-3 px-3">Guruh</th>
                  <th className="py-3 px-2 text-center">Academic (40)</th>
                  <th className="py-3 px-2 text-center">Attendance (20)</th>
                  <th className="py-3 px-2 text-center">Assignment (15)</th>
                  <th className="py-3 px-2 text-center">Employment</th>
                  <th className="py-3 px-2 text-center font-extrabold text-slate-900 dark:text-white">Final Score</th>
                  <th className="py-3 px-4 text-center">Xavf Darajasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/40 bg-white/20 dark:bg-zinc-950/10">
                {sortedStudents.map((st, index) => {
                  const isSelf = st.id === student.id;
                  return (
                    <tr 
                      key={st.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors ${isSelf ? 'bg-indigo-50/40 dark:bg-indigo-500/5 border-y border-indigo-100 dark:border-indigo-500/20 font-medium' : ''}`}
                    >
                      <td className="py-3.5 px-3 font-bold text-slate-400 dark:text-slate-500">#{index + 1}</td>
                      <td className="py-3.5 px-4 font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {st.fullName}
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[8px] font-black uppercase tracking-wider">Siz</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-mono">{st.group}</td>
                      <td className="py-3.5 px-2 text-center text-slate-600 dark:text-slate-300">{st.academicScore}</td>
                      <td className="py-3.5 px-2 text-center text-slate-600 dark:text-slate-300">{st.attendanceScore}</td>
                      <td className="py-3.5 px-2 text-center text-slate-600 dark:text-slate-300">{st.assignmentScore}</td>
                      <td className="py-3.5 px-2 text-center text-emerald-600 dark:text-emerald-400 font-bold">+{st.employmentScore}</td>
                      <td className="py-3.5 px-2 text-center text-indigo-600 dark:text-indigo-400 font-extrabold">{st.finalScore}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                          st.riskLevel === 'High' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                          st.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {st.riskLevel === 'High' ? 'Yuqori Xavf' : st.riskLevel === 'Medium' ? 'O\'rtacha Xavf' : 'Kam Xavf'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}

      {/* 5. Mentor Feedback Inbox Tab */}
      {currentTab === 'feedback' && (
        <Card className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-none animate-fadeIn">
          <CardHeader className="border-b border-slate-200 dark:border-zinc-850/40 pb-3">
            <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Mentor va Tyutor Feedbacklari</CardTitle>
            <CardDescription className="text-xs text-slate-555 dark:text-slate-400">Kurs rahbari hamda ijtimoiy tyutorlaringiz tomonidan yozilgan shaxsiy xarakteristikalar.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">

          <div className="space-y-4">
            {student.feedback.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-zinc-800/80 rounded-lg">
                Hozircha ustozlardan kelgan feedbacklar mavjud emas.
              </div>
            ) : (
              student.feedback.map(fb => (
                <div key={fb.id} className="p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-950/30 border border-slate-200 dark:border-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors space-y-2.5 shadow-sm dark:shadow-none">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{fb.mentorName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{fb.subjectName} • <span className="font-mono">{fb.date}</span></p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      fb.type === 'Academic' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                      fb.type === 'Leadership' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}>
                      {fb.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-100/30 dark:bg-zinc-950/10 p-3 rounded border border-slate-200 dark:border-zinc-900 shadow-inner">
                    "{fb.content}"
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {/* 6. Settings Tab */}
      {currentTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* 2FA Card using Shadcn */}
          <Card className="bg-white/80 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-md">
            <CardHeader className="border-b border-slate-200 dark:border-zinc-850/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Lock size={18} />
                </div>
                <div>
                  <CardTitle className="text-sm font-black text-slate-900 dark:text-white">Ikki bosqichli himoya (2FA)</CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 dark:text-slate-400">Profilingizni ruxsatsiz kirishdan saqlang.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center p-3.5 rounded-lg bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/60 shadow-sm dark:shadow-none">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">2FA Xavfsizlik Himoyasi</span>
                <Button
                  onClick={handleToggle2FA}
                  variant={student.twoFactorEnabled ? 'destructive' : 'outline'}
                  size="sm"
                  className="font-bold text-xs cursor-pointer"
                >
                  {student.twoFactorEnabled ? "O'chirish" : "Yoqish"}
                </Button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                * Eslatma: Ushbu xizmat yoqilganda, tizimga har gal kirganda telegram yoki elektron pochta orqali yuboriladigan 6 xonali tasdiqlash kodi so'raladi.
              </p>
            </CardContent>
          </Card>

          {/* Telegram bot card using Shadcn */}
          <Card className="bg-white/80 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-md">
            <CardHeader className="border-b border-slate-200 dark:border-zinc-850/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Bell size={18} />
                </div>
                <div>
                  <CardTitle className="text-sm font-black text-slate-900 dark:text-white">Telegram Bildirishnomalari</CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 dark:text-slate-400">Reyting va baholar o'zgarganda bot orqali tezkor bildirishnomalar.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {student.telegramSync ? (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="font-semibold">Telegram bot muvaffaqiyatli ulangan!</span>
                    <button
                      onClick={() => handleToggleTelegram(false)}
                      className="text-[10px] uppercase font-black text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Ulanishni uzish
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50/50 dark:bg-zinc-950/60 text-xs text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-zinc-800/60 shadow-sm dark:shadow-none">
                    Ulanish tokeni: <code className="text-slate-950 dark:text-white font-mono font-bold select-all bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded ml-1.5">{student.telegramToken}</code>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tizimni Telegram botga ulash uchun token hosil qiling va uni botimizga (<strong>@edumetric_dominant_bot</strong>) yuboring.
                  </p>
                  <Button
                    onClick={handleGenerateToken}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/10 cursor-pointer"
                  >
                    <Key size={12} />
                    Telegram Ulanish Tokenini Generatsiya qilish
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}

    </div>
  );
}
