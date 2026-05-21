import React, { useState } from 'react';
import { useGlobalState } from '../../context/StateContext';
import { Users, Calendar, Award, MessageSquare, Save, Check, X, Send, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface MentorDashboardProps {
  activeSubTab?: 'journal' | 'feedback';
  setActiveSubTab?: (tab: 'journal' | 'feedback') => void;
}

export function MentorDashboard({ activeSubTab, setActiveSubTab }: MentorDashboardProps) {
  const { state, dispatch } = useGlobalState();
  
  // Local fallback if tab state is not driven by the parent shell
  const [localSubTab, setLocalSubTab] = useState<'journal' | 'feedback'>('journal');
  const currentTab = activeSubTab || localSubTab;
  const setCurrentTab = setActiveSubTab || setLocalSubTab;

  const [selectedGroup, setSelectedGroup] = useState<string>('IF-22-04');
  const [selectedSubject, setSelectedSubject] = useState<string>('SUB-101');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]!);
  
  // Grader & Feedback state
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState<string>('14');
  const [feedbackText, setFeedbackText] = useState<string>('');
  
  // Direct Feedback Broadcast state
  const [broadcastStudentId, setBroadcastStudentId] = useState<string>('');
  const [broadcastType, setBroadcastType] = useState<'Academic' | 'Leadership' | 'Soft Skills' | 'Corporate'>('Academic');
  const [broadcastText, setBroadcastText] = useState<string>('');

  // Groups list from global state
  const uniqueGroups = Array.from(new Set(state.students.map(s => s.group)));
  
  // Enrolled students in chosen group
  const groupStudents = state.students.filter(s => s.group === selectedGroup);

  // Subject details
  const getSubjectName = (subId: string) => {
    if (subId === 'SUB-101') return "Ma'lumotlar strukturasi va algoritmlar";
    return "Ma'lumotlar bazasi tizimlari";
  };

  // Toggle Attendance
  const handleToggleAttendance = (studentId: string, currentStatus: 'attended' | 'absent') => {
    const nextStatus = currentStatus === 'attended' ? 'absent' : 'attended';
    dispatch({
      type: 'MARK_ATTENDANCE',
      payload: {
        studentId,
        subjectId: selectedSubject,
        date: selectedDate,
        status: nextStatus,
        reason: nextStatus === 'absent' ? 'Sababsiz (Mentor tomonidan)' : null
      }
    });
  };

  const handleOpenGrader = (studentId: string) => {
    const student = state.students.find(s => s.id === studentId);
    const activeAsn = student?.assignments[0];
    setGradingStudentId(studentId);
    setGradeValue(activeAsn?.score?.toString() || '14');
    setFeedbackText(activeAsn?.feedback || '');
  };

  // Submit Grade
  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingStudentId) return;

    const student = state.students.find(s => s.id === gradingStudentId);
    const activeAsn = student?.assignments[0];

    if (activeAsn) {
      dispatch({
        type: 'GRADE_ASSIGNMENT',
        payload: {
          studentId: gradingStudentId,
          assignmentId: activeAsn.id,
          score: parseFloat(gradeValue),
          feedback: feedbackText
        }
      });
      alert("Baho va fikr muvaffaqiyatli kiritildi! Talaba reytingi avtomat yangilandi.");
    }
    setGradingStudentId(null);
  };

  // Direct feedback broadcast
  const handleBroadcastFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastStudentId || !broadcastText.trim()) return;

    dispatch({
      type: 'ADD_FEEDBACK',
      payload: {
        studentId: broadcastStudentId,
        feedback: {
          mentorName: "D. Eshmuradov", // Mock logged-in mentor
          subjectName: getSubjectName(selectedSubject),
          type: broadcastType,
          content: broadcastText
        }
      }
    });

    setBroadcastText('');
    alert("Feedback talabaga shaxsiy xat sifatida yuborildi!");
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn text-left">
      
      {/* Mentor Header Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md relative overflow-hidden shadow-sm dark:shadow-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
              <BookOpen className="text-purple-650 dark:text-purple-400" size={24} />
              Mentor Ish Stoli
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">O'qituvchi: <strong className="text-purple-660 dark:text-purple-400 font-bold">D. Eshmuradov</strong> | Darslar, davomat va amaliy topshiriqlar boshqaruvi</p>
          </div>

          {/* Group and Subject Selectors inside header */}
          <div className="flex flex-wrap gap-4 text-xs">
            
            {/* Group switch using Shadcn */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Guruhni Tanlang</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="bg-slate-50/50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-200">
                  <SelectValue placeholder="Guruh" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-202">
                  {uniqueGroups.map(grp => (
                    <SelectItem key={grp} value={grp}>{grp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject switch using Shadcn */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Fanni Tanlang</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-slate-50/50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-200">
                  <SelectValue placeholder="Fan" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-202">
                  <SelectItem value="SUB-101">Ma'lumotlar strukturasi & algoritmlar</SelectItem>
                  <SelectItem value="SUB-102">Ma'lumotlar bazasi tizimlari</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>
      </div>

      {/* 1. Journal & Attendance Tab */}
      {currentTab === 'journal' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Attendance spreadsheet */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white/80 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-xl">
              <CardHeader className="border-b border-slate-200 dark:border-zinc-850/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="text-purple-650 dark:text-purple-400" size={18} />
                    Tezkor Davomat Jurnali (2-Click)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-505 dark:text-slate-400">
                    Sanani tanlang va talaba davomat holatini o'zgartirish uchun tugmaga bosing.
                  </CardDescription>
                </div>

                {/* Date Picker using Shadcn styled Input */}
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-fit bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-202 font-bold focus-visible:ring-purple-500/20"
                />
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800/80 rounded-lg shadow-sm dark:shadow-none">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-55 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Talaba F.I.O</th>
                        <th className="py-3 px-2">GPA (Akad)</th>
                        <th className="py-3 px-2 text-center">Davomati</th>
                        <th className="py-3 px-4 text-center">{selectedDate} holati</th>
                        <th className="py-3 px-4 text-center">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/40 bg-white/20 dark:bg-zinc-950/10">
                      {groupStudents.map(student => {
                        const subject = student.subjects.find(s => s.subject_id === selectedSubject);
                        const log = subject?.logs.find(l => l.date === selectedDate);
                        const statusStr = log ? log.status : 'attended';

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-slate-900 dark:text-white text-xs">{student.fullName}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{student.id} • {student.status}</div>
                            </td>
                            <td className="py-3.5 px-2 text-slate-700 dark:text-slate-300 font-semibold font-mono">{student.gpa}%</td>
                            <td className="py-3.5 px-2 text-center text-slate-700 dark:text-slate-300 font-semibold font-mono">{student.attendance_summary.attendance_percentage}%</td>
                            
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleToggleAttendance(student.id, statusStr)}
                                className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 mx-auto cursor-pointer border ${
                                  statusStr === 'attended' 
                                    ? 'bg-emerald-50/60 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-205 dark:border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.08)]' 
                                    : 'bg-rose-50/60 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-205 dark:border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.08)]'
                                }`}
                              >
                                {statusStr === 'attended' ? <Check size={11} /> : <X size={11} />}
                                {statusStr === 'attended' ? 'Keldi' : 'Kelmadi'}
                              </button>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <Button
                                onClick={() => handleOpenGrader(student.id)}
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] font-bold border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 hover:text-white hover:bg-purple-660/10 cursor-pointer"
                              >
                                Baholash
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grader Panel Column */}
          <div className="space-y-6">
            {gradingStudentId ? (
              <Card className="bg-white/80 dark:bg-zinc-900/50 border-purple-200 dark:border-purple-500/30 shadow-lg shadow-purple-500/2 animate-scaleUp">
                <CardHeader className="border-b border-slate-200 dark:border-zinc-850/40 pb-4 flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Award size={16} className="text-purple-600 dark:text-purple-400" />
                      Amaliy Vazifalarni Baholash
                    </CardTitle>
                    <CardDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                      Talaba: {state.students.find(s => s.id === gradingStudentId)?.fullName}
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setGradingStudentId(null)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold cursor-pointer"
                  >
                    Yopish
                  </button>
                </CardHeader>
                
                <form onSubmit={handleSubmitGrade}>
                  <CardContent className="pt-6 space-y-4">
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <Label>Topshiriq Balli (0-15)</Label>
                        <span className="text-purple-600 dark:text-purple-400 font-black text-sm">{gradeValue} ball</span>
                      </div>
                      <Input
                        type="range"
                        min="0"
                        max="15"
                        step="0.5"
                        value={gradeValue}
                        onChange={e => setGradeValue(e.target.value)}
                        className="w-full accent-purple-600 dark:accent-purple-500 cursor-pointer h-2 rounded-lg bg-slate-100 dark:bg-zinc-950 border-none outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-500 dark:text-slate-400">Mentor fikri va sharhi</Label>
                      <Textarea
                        required
                        placeholder="Vazifa bo'yicha mustaqil fikr mulohazalaringizni yozing..."
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        className="bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white resize-none"
                        rows={4}
                      />
                    </div>

                  </CardContent>
                  <CardFooter className="border-t border-slate-200 dark:border-zinc-850/40 pt-4 pb-6">
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-md shadow-purple-600/10 cursor-pointer">
                      <Save size={12} />
                      Bahoni Saqlash
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            ) : (
              <div className="p-8 text-center text-xs text-slate-450 dark:text-slate-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/10 leading-relaxed shadow-sm dark:shadow-none">
                Baholash panelini ochish uchun chap tarafdagi davomat jadvalidan birorta talabaning ro'parasidagi <strong>Baholash</strong> tugmasiga bosing.
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. Feedback Broadcast Tab */}
      {currentTab === 'feedback' && (
        <div className="max-w-2xl mx-auto animate-fadeIn">
          <Card className="bg-white/80 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-xl">
            <CardHeader className="border-b border-slate-200 dark:border-zinc-850/40 pb-4">
              <CardTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="text-purple-650 dark:text-purple-400" size={18} />
                Mentor Feedback Broadcast (Shaxsiy xat)
              </CardTitle>
              <CardDescription className="text-xs text-slate-505 dark:text-slate-400">
                Talabaning korporativ madaniyati, faolligi yoki akademik yondashuvi bo'yicha fikr mulohaza broadcast yuboring.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleBroadcastFeedback}>
              <CardContent className="pt-6 space-y-4">
                
                {/* Student Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400">Talabani tanlang</Label>
                  <Select value={broadcastStudentId} onValueChange={setBroadcastStudentId}>
                    <SelectTrigger className="bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-200 w-full animate-fadeIn">
                      <SelectValue placeholder="Talabani tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-200">
                      {groupStudents.map(st => (
                        <SelectItem key={st.id} value={st.id}>{st.fullName} ({st.id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Feedback Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-555 dark:text-slate-400">Fikr yo'nalishi (Kategoriya)</Label>
                  <Select value={broadcastType} onValueChange={(val: any) => setBroadcastType(val)}>
                    <SelectTrigger className="bg-slate-55/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-200 w-full">
                      <SelectValue placeholder="Yo'nalish" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-200">
                      <SelectItem value="Academic">Akademik o'zlashtirish va GPA maslahatlari</SelectItem>
                      <SelectItem value="Leadership">Etika va Tashabbuskorlik (Leadership)</SelectItem>
                      <SelectItem value="Soft Skills">Jamoaviy muloqot va Soft Skills</SelectItem>
                      <SelectItem value="Corporate">Korporativ Madaniyat & PDP Qoidalari</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-505 dark:text-slate-400">Fikr mulohaza matni</Label>
                  <Textarea
                    required
                    placeholder="Talabaga yuboriladigan shaxsiy feedback matnini kiriting. Masalan: Darslarda faol, lekin amaliy ishlar topshirishga e'tiborli bo'lishi kerak..."
                    value={broadcastText}
                    onChange={e => setBroadcastText(e.target.value)}
                    className="bg-slate-55/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white resize-none animate-fadeIn"
                    rows={4}
                  />
                </div>

              </CardContent>
              <CardFooter className="border-t border-slate-200 dark:border-zinc-850/40 pt-4 pb-6">
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-md shadow-purple-600/10 cursor-pointer">
                  <Send size={12} />
                  Feedback xabarini yuborish
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
