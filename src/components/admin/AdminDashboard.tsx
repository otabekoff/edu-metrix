import React, { useState, useEffect } from 'react';
import { useGlobalState } from '../../context/StateContext';
import { 
  Shield, Check, X, Search, FileCode, Clock, Eye, 
  Settings, Award, AlertTriangle, UserCheck, Play, ArrowDown, Trash2,
  Sliders, Calendar, Sparkles, Terminal, Activity, Database, CheckCircle,
  HelpCircle, BarChart3, AlertCircle, Copy, CheckSquare
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import sampleJson from '../../../useful_assets/sample.json';
import { toast } from 'sonner';

interface AdminDashboardProps {
  activeSubTab?: 'matrix' | 'queue' | 'modifiers' | 'faceid';
  setActiveSubTab?: (tab: 'matrix' | 'queue' | 'modifiers' | 'faceid') => void;
}

export function AdminDashboard({ activeSubTab, setActiveSubTab }: AdminDashboardProps = {}) {
  const { state, dispatch } = useGlobalState();
  
  // Local fallback if tab state is not driven by the parent shell
  const [localSubTab, setLocalSubTab] = useState<'matrix' | 'queue' | 'modifiers' | 'faceid'>('matrix');
  const currentTab = activeSubTab || localSubTab;
  const setCurrentTab = setActiveSubTab || setLocalSubTab;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL_GROUPS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL_STATUS');
  const [inspectedStudentId, setInspectedStudentId] = useState<string | null>(null);
  
  // Custom API Console States
  const [apiPayloadStr, setApiPayloadStr] = useState(JSON.stringify(sampleJson, null, 2));
  const [apiConsoleResponse, setApiConsoleResponse] = useState<string>('');
  const [apiConsoleLogs, setApiConsoleLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [SYSTEM] FaceID API Core Initialized.`,
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Listening on :3000/api/attendance/upload...`
  ]);

  // Tutor & Modifier Customization states
  const [selectedStudentModifierId, setSelectedStudentModifierId] = useState<string | null>(null);
  const [penaltyVal, setPenaltyVal] = useState('0');
  const [recoveryVal, setRecoveryVal] = useState('0');
  const [employmentVal, setEmploymentVal] = useState('0');
  const [disciplineVal, setDisciplineVal] = useState('10');

  // Tutor Evaluation custom updates
  const [selectedStudentTutorId, setSelectedStudentTutorId] = useState<string | null>(null);
  const [ccVal, setCcVal] = useState(true);
  const [saVal, setSaVal] = useState(true);
  const [ssVal, setSsVal] = useState(true);
  const [diVal, setDiVal] = useState(true);
  const [dlVal, setDlVal] = useState(true);

  // Verification states
  const [achievementPointsAward, setAchievementPointsAward] = useState('3.0');
  const [achievementComment, setAchievementComment] = useState("Nizom bo'yicha ball qo'shildi.");

  // Groups and Students list
  const uniqueGroups = Array.from(new Set(state.students.map(s => s.group)));
  const pendingAchievements = state.students.flatMap(s => 
    s.achievements.filter(a => a.status === 'Kutilmoqda').map(a => ({ ...a, studentId: s.id, studentName: s.fullName }))
  );

  // Filtered Students
  const filteredStudents = state.students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroupFilter && selectedGroupFilter !== 'ALL_GROUPS' ? student.group === selectedGroupFilter : true;
    const matchesStatus = selectedStatusFilter && selectedStatusFilter !== 'ALL_STATUS' ? student.status === selectedStatusFilter : true;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  // KPI Calculations
  const averageAttendance = Number((state.students.reduce((sum, s) => sum + s.attendance_summary.attendance_percentage, 0) / state.students.length).toFixed(1));
  const averageGPA = Number((state.students.reduce((sum, s) => sum + s.gpa, 0) / state.students.length).toFixed(1));
  const activeGrants = state.students.filter(s => s.status === 'Grant' && !s.isGrantCancelled).length;
  const highRiskCount = state.students.filter(s => s.riskLevel === 'High').length;

  // Sync state selection details if modified student changes
  const handleOpenModifiers = (stId: string) => {
    const st = state.students.find(s => s.id === stId);
    if (!st) return;
    setSelectedStudentModifierId(stId);
    setPenaltyVal(st.penaltyScore.toString());
    setRecoveryVal(st.recoveryScore.toString());
    setEmploymentVal(st.employmentScore.toString());
    setDisciplineVal(st.disciplineScore.toString());
    
    // Auto-scroll to form or close other view
    setSelectedStudentTutorId(null);
  };

  const handleOpenTutor = (stId: string) => {
    const st = state.students.find(s => s.id === stId);
    if (!st) return;
    setSelectedStudentTutorId(stId);
    setCcVal(st.tutorEvaluation.corporateCulture === 1);
    setSaVal(st.tutorEvaluation.socialActivity === 1);
    setSsVal(st.tutorEvaluation.softSkills === 1);
    setDiVal(st.tutorEvaluation.discipline === 1);
    setDlVal(st.tutorEvaluation.dormitoryLife === 1);
    
    // Auto-close modifier view
    setSelectedStudentModifierId(null);
  };

  const handleSaveModifiers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentModifierId) return;

    dispatch({
      type: 'UPDATE_STUDENT_BONUSES',
      payload: {
        studentId: selectedStudentModifierId,
        penaltyScore: parseFloat(penaltyVal),
        recoveryScore: parseFloat(recoveryVal),
        employmentScore: parseFloat(employmentVal),
        disciplineScore: parseFloat(disciplineVal)
      }
    });

    setSelectedStudentModifierId(null);
    toast.success("Jarima va bonus ballar saqlandi va reyting qayta hisoblandi!");
  };

  const handleSaveTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentTutorId) return;

    dispatch({
      type: 'UPDATE_TUTOR_EVAL',
      payload: {
        studentId: selectedStudentTutorId,
        evaluation: {
          corporateCulture: ccVal ? 1 : 0,
          socialActivity: saVal ? 1 : 0,
          softSkills: ssVal ? 1 : 0,
          discipline: diVal ? 1 : 0,
          dormitoryLife: dlVal ? 1 : 0
        }
      }
    });

    setSelectedStudentTutorId(null);
    toast.success("Tyutor bahosi yangilandi va talaba reytingiga qo'shildi!");
  };

  const handleVerifyAchievement = (studentId: string, achId: string, status: 'Tasdiqlandi' | 'Rad etildi') => {
    dispatch({
      type: 'VERIFY_ACHIEVEMENT',
      payload: {
        studentId,
        achievementId: achId,
        status,
        adminComment: achievementComment,
        pointsAwarded: parseFloat(achievementPointsAward)
      }
    });
    if (status === 'Tasdiqlandi') {
      toast.success("Yutuq arizasi muvaffaqiyatli tasdiqlandi!");
    } else {
      toast.error("Yutuq arizasi rad etildi!");
    }
  };

  const handleRunApiImport = () => {
    const timestampStr = new Date().toLocaleTimeString();
    try {
      const parsed = JSON.parse(apiPayloadStr);
      dispatch({
        type: 'IMPORT_API_DATA',
        payload: parsed
      });
      
      const successLog = `[${timestampStr}] [SUCCESS] 200 OK - Student data parsed for ST-2026-8941. Attendance recalculated.`;
      setApiConsoleLogs(prev => [...prev, successLog]);
      setApiConsoleResponse(JSON.stringify({
        status: "success",
        code: 200,
        message: "FaceID Attendance & Grades API process executed successfully. Recalculated dynamic ratings.",
        timestamp: new Date().toISOString(),
        gateway: "PDP-FaceID-Router-Edge",
        client_ip: "192.168.12.45"
      }, null, 2));
      toast.success("Simulated API Gateway completed! New student data parsed and added to leaderboard.");
    } catch (err) {
      const errorLog = `[${timestampStr}] [ERROR] 400 Bad Request - JSON validation failed.`;
      setApiConsoleLogs(prev => [...prev, errorLog]);
      setApiConsoleResponse(JSON.stringify({
        status: "error",
        code: 400,
        message: `JSON parse exception: ${String(err)}`,
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  };

  // Helper to get relative category color
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'International IT':
      case 'Startup':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case 'National IT':
      case 'Volontyorlik':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Offline Kurs':
      case 'Online Kurs':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn text-left">
      
      {/* Top Banner Context Card */}
      <Card className="relative overflow-hidden border border-slate-800/80 bg-slate-950/40 p-6 backdrop-blur-2xl gap-0 py-0 flex-col justify-start">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 w-full">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                SISTEMA ADMIN
              </div>
              <span className="text-xs text-slate-500 font-bold">• SECURE CONNECT</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              <Shield className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse" size={22} />
              Admin Boshqaruv Markazi
            </h2>
            <p className="text-sm text-slate-400">PDP University • Administrator: <strong className="text-slate-100 font-extrabold">ADMIN-1</strong></p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { dispatch({ type: 'RESET_STATE' }); toast.success("Ma'lumotlar boshlang'ich holatga muvaffaqiyatli qaytarildi!"); }}
              className="border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-bold cursor-pointer text-xs transition-all"
            >
              Ma'lumotlarni Reset qilish
            </Button>
          </div>
        </div>
      </Card>

      {/* RENDER DYNAMIC SUB-TABS */}
      
      {/* 1. MATRIX TAB */}
      {currentTab === 'matrix' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Key University Stats counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "O'rtacha Davomat", value: `${averageAttendance}%`, desc: "Nizom o'tish chegarasi: 80%", color: "text-slate-100", highlight: "border-slate-800/80 bg-slate-950/20" },
              { label: "O'rtacha GPA", value: `${averageGPA}%`, desc: "Strategik filtr chegarasi: 80%", color: "text-indigo-400", highlight: "border-indigo-500/20 bg-indigo-500/5" },
              { label: "Faol Grantlar", value: `${activeGrants} talaba`, desc: "Grant oluvchilar (xavfsiz)", color: "text-emerald-400", highlight: "border-emerald-500/20 bg-emerald-500/5" },
              { label: "Xavf Guruhidagilar", value: `${highRiskCount} talaba`, desc: "Akademik bekor + qizil chiziq", color: "text-rose-400", highlight: "border-rose-500/20 bg-rose-500/5" }
            ].map((stat, idx) => (
              <Card key={idx} className={`border p-5 rounded-xl ${stat.highlight} flex flex-col justify-between h-28 hover:scale-[1.01] transition-transform duration-200`}>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{stat.label}</span>
                  <span className={`text-2xl font-black ${stat.color} tracking-tight block mt-1`}>{stat.value}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium">{stat.desc}</span>
              </Card>
            ))}
          </div>

          {/* Matrix Controls & Filters */}
          <Card className="border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm dark:shadow-none">
            <CardHeader className="border-b border-slate-200 dark:border-zinc-800/40 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="text-indigo-400" size={16} />
                    Talabalar Grant Saralash Reytingi (16 Kolonnali Nizom Jurnali)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    PDP strategik nizomi bo'yicha real-vaqtda hisoblanayotgan va dynamic filtrlarga mos keluvchi koeffitsientlar.
                  </CardDescription>
                </div>
                
                {/* Search & Select filters in a nice flex row */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 px-2.5 rounded-lg h-9 w-48 sm:w-64">
                    <Search size={14} className="text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="F.I.O yoki ID bo'yicha..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>

                  <Select value={selectedGroupFilter} onValueChange={setSelectedGroupFilter}>
                    <SelectTrigger className="h-9 w-44 bg-slate-50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800/80 text-xs font-bold text-slate-700 dark:text-slate-350">
                      <SelectValue placeholder="Barcha Guruhlar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                      <SelectItem value="ALL_GROUPS">Barcha Guruhlar</SelectItem>
                      {uniqueGroups.map(grp => (
                        <SelectItem key={grp} value={grp}>{grp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                    <SelectTrigger className="h-9 w-40 bg-slate-50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800/80 text-xs font-bold text-slate-700 dark:text-slate-355">
                      <SelectValue placeholder="Barcha Statuslar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                      <SelectItem value="ALL_STATUS">Barcha Statuslar</SelectItem>
                      <SelectItem value="Grant">Grant</SelectItem>
                      <SelectItem value="Kontrakt">Kontrakt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Premium Scrollable Table Container */}
              <div className="overflow-x-auto w-full select-none custom-scrollbar">
                <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      {/* Frozen/Sticky First Column Head */}
                      <th className="py-3 px-4 sticky left-0 bg-slate-50 dark:bg-zinc-900 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.4)] border-r border-slate-200 dark:border-zinc-800/60 text-slate-700 dark:text-slate-200">
                        F.I.O (Talaba)
                      </th>
                      <th className="py-3 px-3">Guruh</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-3 text-center text-indigo-400">Academic (40)</th>
                      <th className="py-3 px-3 text-center text-indigo-400">Attendance (20)</th>
                      <th className="py-3 px-3 text-center text-slate-300">Assignment (15)</th>
                      <th className="py-3 px-3 text-center text-slate-300">Activity (10)</th>
                      <th className="py-3 px-3 text-center text-slate-300">Tyutor (5)</th>
                      <th className="py-3 px-3 text-center text-slate-300">Discipline (10)</th>
                      <th className="py-3 px-3 text-center font-bold text-slate-200 bg-slate-900/40">Total Base</th>
                      <th className="py-3 px-3 text-center text-rose-400">Penalty</th>
                      <th className="py-3 px-3 text-center text-emerald-400">Recovery</th>
                      <th className="py-3 px-3 text-center text-indigo-300">Employment</th>
                      <th className="py-3 px-3 text-center font-black text-indigo-400 bg-indigo-500/10">Final Score</th>
                      <th className="py-3 px-3 text-center text-rose-400">Akad Bekor</th>
                      <th className="py-3 px-3 text-center">Xavf Darajasi</th>
                      <th className="py-3 px-4 text-center">Tafsilotlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={17} className="py-12 text-center text-slate-500 text-xs">
                          Filtrga mos keladigan talabalar topilmadi.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(st => (
                        <tr key={st.id} className="hover:bg-slate-900/30 transition-colors">
                          {/* Frozen/Sticky First Column Cell */}
                          <td className="py-3 px-4 sticky left-0 bg-white dark:bg-zinc-900 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.4)] border-r border-slate-200 dark:border-zinc-800/60">
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs">{st.fullName}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">{st.id}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-medium">{st.group}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider ${
                              st.status === 'Grant' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                            }`}>
                              {st.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-indigo-300 font-bold text-xs">{st.academicScore}</td>
                          <td className="py-3 px-3 text-center text-indigo-300 font-bold text-xs">{st.attendanceScore} <span className="text-[9px] text-slate-500 font-normal">({st.attendance_summary.attendance_percentage}%)</span></td>
                          <td className="py-3 px-3 text-center text-slate-300 font-medium">{st.assignmentScore}</td>
                          <td className="py-3 px-3 text-center text-emerald-400 font-bold">+{st.activityScore}</td>
                          <td className="py-3 px-3 text-center text-slate-300 font-medium">{st.tutorScore}</td>
                          <td className="py-3 px-3 text-center text-slate-300 font-medium">{st.disciplineScore}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-200 bg-slate-900/20">{st.totalBaseScore}</td>
                          <td className="py-3 px-3 text-center text-rose-400 font-bold">-{st.penaltyScore}</td>
                          <td className="py-3 px-3 text-center text-emerald-400 font-bold">+{st.recoveryScore}</td>
                          <td className="py-3 px-3 text-center text-indigo-300 font-bold">+{st.employmentScore}</td>
                          <td className="py-3 px-3 text-center font-black text-indigo-400 bg-indigo-500/10 text-xs tracking-wide">{st.finalScore}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              st.isGrantCancelled ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' : 'bg-slate-900/60 text-slate-500'
                            }`}>
                              {st.isGrantCancelled ? 'BEKOR QILINGAN' : 'YO\'Q'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                              st.riskLevel === 'High' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                              st.riskLevel === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                              'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            }`}>
                              {st.riskLevel === 'High' ? 'YUQORI XAVF' : st.riskLevel === 'Medium' ? 'O\'RTACA XAVF' : 'KAM XAVF'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectedStudentId(st.id)}
                              className="h-7 px-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1 mx-auto transition-all cursor-pointer"
                            >
                              <Eye size={12} />
                              Audit Log
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* 2. PENDING QUEUE TAB */}
      {currentTab === 'queue' && (
        <div className="space-y-6 animate-fadeIn">
          <Card className="border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm dark:shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Award size={16} />
                </div>
                <div>
                  <CardTitle className="text-base font-black text-slate-900 dark:text-white">Yutuq va Sertifikatlarni Tasdiqlash Navbati</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Talabalar tomonidan tizimga yuklangan yutuq, sertifikat, startup yoki jamoat faoliyati arizalarini tekshirish.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {pendingAchievements.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                  <Award className="mx-auto text-slate-600" size={32} />
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Kutilayotgan sertifikatlar yoki yutuqlar mavjud emas. Yangi arizalar topshirilganda shu oynada namoyon bo'ladi.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingAchievements.map(ach => (
                    <Card key={ach.id} className="border-slate-800 bg-slate-950/40 backdrop-blur-md overflow-hidden relative group hover:border-slate-700/60 transition-colors">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <CardHeader className="border-b border-slate-800/40 pb-4 bg-slate-950/20">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="font-extrabold text-xs text-indigo-400">{ach.studentName}</div>
                            <span className="text-[10px] text-slate-500">Topshirilgan sana: {ach.submittedAt}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getCategoryColor(ach.category)}`}>
                            {ach.category}
                          </span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="py-4 space-y-4 text-xs text-slate-300">
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">{ach.title}</h4>
                          <p className="text-slate-400 leading-relaxed">{ach.description}</p>
                          {ach.linkUrl && (
                            <a 
                              href={ach.linkUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline font-bold mt-2"
                            >
                              Sertifikat Hujjatini Ko'rish (Fayl) &rarr;
                            </a>
                          )}
                        </div>

                        {/* Interactive Grader Panel */}
                        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-[10px] text-slate-500 font-extrabold uppercase mb-1 block">Taqdim Etiladigan Ball (0-10)</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={achievementPointsAward}
                                onChange={e => setAchievementPointsAward(e.target.value)}
                                className="h-8 bg-slate-900 border-slate-800 text-white font-mono text-xs focus:ring-pink-500"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-slate-500 font-extrabold uppercase mb-1 block">Ariza Holati</Label>
                              <div className="h-8 rounded bg-slate-900 border border-slate-800 flex items-center px-2 text-[10px] font-bold text-amber-400 gap-1.5 select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                Kutilmoqda
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-[10px] text-slate-500 font-extrabold uppercase mb-1 block">Admin Izohi / Qaror Sharhi</Label>
                            <Input
                              type="text"
                              value={achievementComment}
                              onChange={e => setAchievementComment(e.target.value)}
                              placeholder="Nizom bandiga asosan reyting balli yozildi"
                              className="h-8 bg-slate-900 border-slate-800 text-xs text-white"
                            />
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="border-t border-slate-800/40 pt-4 bg-slate-950/20 grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleVerifyAchievement(ach.studentId, ach.id, 'Tasdiqlandi')}
                          className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/20"
                        >
                          <Check size={14} />
                          Tasdiqlash
                        </Button>
                        <Button
                          onClick={() => handleVerifyAchievement(ach.studentId, ach.id, 'Rad etildi')}
                          className="w-full h-9 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X size={14} />
                          Rad etish
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. MODIFIERS & TUTOR TAB */}
      {currentTab === 'modifiers' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side: Select Student List */}
            <Card className="lg:col-span-1 border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm dark:shadow-none h-fit">
              <CardHeader className="border-b border-slate-200 dark:border-zinc-800/40 pb-4">
                <CardTitle className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="text-amber-400" size={16} />
                  Talabani Tanlash
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400">
                  Reyting jarimalarini kiritish yoki tyutor madaniy ballarini tahrirlash uchun talabani tanlang:
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-3 max-h-[480px] overflow-y-auto custom-scrollbar space-y-2">
                {state.students.map(s => {
                  const isModifying = selectedStudentModifierId === s.id;
                  const isTutoring = selectedStudentTutorId === s.id;
                  const isAnySelected = isModifying || isTutoring;

                  return (
                    <div 
                      key={s.id} 
                      className={`p-3 rounded-xl border text-xs flex flex-col gap-2 transition-all ${
                        isAnySelected
                          ? 'bg-indigo-600/10 border-indigo-500/40 shadow-md shadow-indigo-600/5'
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-extrabold text-white">{s.fullName}</div>
                          <span className="text-[9px] text-slate-500">{s.group} • ID: {s.id}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold ${
                          s.status === 'Grant' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/40">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenModifiers(s.id)}
                          className={`h-7 text-[10px] font-bold ${
                            isModifying ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          } cursor-pointer`}
                        >
                          Jarimalar / Bonus
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenTutor(s.id)}
                          className={`h-7 text-[10px] font-bold ${
                            isTutoring ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          } cursor-pointer`}
                        >
                          Tyutor Bahosi
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Right Side: Render Form Panel */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* MODIFIERS PANEL */}
              {selectedStudentModifierId ? (
                <Card className="border-indigo-500/20 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm dark:shadow-none animate-scaleUp">
                  <CardHeader className="border-b border-slate-200 dark:border-zinc-800/40 pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-base font-black text-slate-900 dark:text-white">Jarima & Bonus Ballarini Kiritish</CardTitle>
                        <CardDescription className="text-xs text-slate-400">
                          Talaba: <strong className="text-indigo-400">{state.students.find(s => s.id === selectedStudentModifierId)?.fullName}</strong>
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedStudentModifierId(null)}
                        className="text-slate-500 hover:text-white h-8 cursor-pointer"
                      >
                        Yopish
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <form onSubmit={handleSaveModifiers}>
                    <CardContent className="py-6 space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Penalty Score */}
                        <div className="space-y-2 p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                              <AlertCircle size={14} />
                              Jarima (Penalty Score)
                            </Label>
                            <span className="font-mono font-bold text-rose-400 text-xs">-{penaltyVal} ball</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Nizom qoidalari buzilishi bo'yicha chegiriladigan ma'muriy ball (Limit: 0-20)</p>
                          <input 
                            type="range" 
                            min="0" 
                            max="20" 
                            step="0.5"
                            value={penaltyVal} 
                            onChange={e => setPenaltyVal(e.target.value)} 
                            className="w-full accent-rose-500 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                          />
                          <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                            <span>0.0</span>
                            <span>10.0</span>
                            <span>20.0</span>
                          </div>
                        </div>

                        {/* Recovery Score */}
                        <div className="space-y-2 p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle size={14} />
                              Qoplash (Recovery Score)
                            </Label>
                            <span className="font-mono font-bold text-emerald-400 text-xs">+{recoveryVal} ball</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Talaba tomonidan jarimalarni qoplash uchun olingan rag'bat (Limit: 0-10)</p>
                          <input 
                            type="range" 
                            min="0" 
                            max="10" 
                            step="0.5"
                            value={recoveryVal} 
                            onChange={e => setRecoveryVal(e.target.value)} 
                            className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                          />
                          <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                            <span>0.0</span>
                            <span>5.0</span>
                            <span>10.0</span>
                          </div>
                        </div>

                        {/* Employment Score */}
                        <div className="space-y-2 p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                              <Database size={14} />
                              Mutaxassislik bo'yicha Bandlik
                            </Label>
                            <span className="font-mono font-bold text-indigo-400 text-xs">+{employmentVal} ball</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Ixtisoslashuv yo'nalishida bandligi yoki ishga joylashgani (Limit: 0-10)</p>
                          <input 
                            type="range" 
                            min="0" 
                            max="10" 
                            step="1"
                            value={employmentVal} 
                            onChange={e => setEmploymentVal(e.target.value)} 
                            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                          />
                          <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                            <span>0.0</span>
                            <span>5.0</span>
                            <span>10.0</span>
                          </div>
                        </div>

                        {/* Discipline Score */}
                        <div className="space-y-2 p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <Shield size={14} />
                              Intizom (Discipline Score)
                            </Label>
                            <span className="font-mono font-bold text-white text-xs">{disciplineVal} ball</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Dars intizomi va jamoat qoidalariga rioya etish darajasi (Limit: 0-10)</p>
                          <input 
                            type="range" 
                            min="0" 
                            max="10" 
                            step="1"
                            value={disciplineVal} 
                            onChange={e => setDisciplineVal(e.target.value)} 
                            className="w-full accent-slate-400 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                          />
                          <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                            <span>0.0</span>
                            <span>5.0</span>
                            <span>10.0</span>
                          </div>
                        </div>

                      </div>

                    </CardContent>
                    
                    <CardFooter className="border-t border-slate-800/40 pt-4 bg-slate-950/20 flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setSelectedStudentModifierId(null)}
                        className="text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-white cursor-pointer text-xs"
                      >
                        Bekor qilish
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer text-xs"
                      >
                        Saqlash (Qayta hisoblash)
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              ) : selectedStudentTutorId ? (
                <Card className="border-purple-500/20 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm dark:shadow-none animate-scaleUp">
                  <CardHeader className="border-b border-slate-200 dark:border-zinc-800/40 pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-base font-black text-slate-900 dark:text-white">Tyutor Madaniy-Ijtimoiy Baholash</CardTitle>
                        <CardDescription className="text-xs text-slate-400">
                          Talaba: <strong className="text-purple-400">{state.students.find(s => s.id === selectedStudentTutorId)?.fullName}</strong>
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedStudentTutorId(null)}
                        className="text-slate-500 hover:text-white h-8 cursor-pointer"
                      >
                        Yopish
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <form onSubmit={handleSaveTutor}>
                    <CardContent className="py-6 space-y-4 text-xs text-slate-300">
                      <p className="text-slate-400 leading-relaxed mb-4">
                        Tyutor nizomiga muvofiq talabaning universitet hayotidagi, yotoqxonadagi va axloqiy muloqotdagi faolligi har bir toifa bo'yicha <strong>+1 ball</strong> koeffitsienti bilan baholanadi (Jami maksimal 5 ball).
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {[
                          { label: "Etika va Korporativ Madaniyat", desc: "Kiyinish, muomala odobi va universitet nufuzini saqlash", checked: ccVal, onChange: setCcVal },
                          { label: "Ijtimoiy va Jamoat Faolligi", desc: "Tadbirlar va ko'ngilli loyihalarda ishtiroki", checked: saVal, onChange: setSaVal },
                          { label: "Soft Skills (Yumshoq Ko'nikmalar)", desc: "Muloqot, taqdimot va jamoada ishlash ko'nikmalari", checked: ssVal, onChange: setSsVal },
                          { label: "Tyutor Bilan Doimiy Aloqa", desc: "Tyutor topshiriqlari va yo'riqnomalariga rioya etishi", checked: diVal, onChange: setDiVal },
                          { label: "Yotoqxona Tartib-Intizomi", desc: "Xonalarni toza saqlash va mulkka zarar yetkazmaslik", checked: dlVal, onChange: setDlVal },
                        ].map((item, idx) => (
                          <label 
                            key={idx}
                            className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                              item.checked 
                                ? 'bg-purple-500/10 border-purple-500/30' 
                                : 'bg-slate-950/40 border-slate-800 hover:bg-slate-900/20'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={item.checked} 
                              onChange={e => item.onChange(e.target.checked)} 
                              className="accent-purple-500 w-4 h-4 mt-0.5"
                            />
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-200 block text-xs">{item.label}</span>
                              <span className="text-[10px] text-slate-500 block leading-tight">{item.desc}</span>
                            </div>
                          </label>
                        ))}

                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t border-slate-800/40 pt-4 bg-slate-950/20 flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setSelectedStudentTutorId(null)}
                        className="text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-white cursor-pointer text-xs"
                      >
                        Bekor qilish
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer text-xs"
                      >
                        Tyutor Bahosini Saqlash
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              ) : (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                  <Sliders className="mx-auto text-slate-600" size={32} />
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Chap tomondagi ro'yxatdan talabani tanlang va "Jarimalar/Bonus" yoki "Tyutor Bahosi" tugmasini bosing.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* 4. FACEID & API PLAYGROUND TAB */}
      {currentTab === 'faceid' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cyber Terminal Body (Left: JSON and Response) */}
            <div className="lg:col-span-2 space-y-6">
              
              <Card className="border-slate-800 bg-slate-950 backdrop-blur-xl relative overflow-hidden font-mono text-xs">
                {/* Terminal Header */}
                <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-2 border-l border-slate-800">
                      FaceID API Developer Shell
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold">GATEWAY ONLINE</span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* JSON Body Request field */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] text-slate-500 font-bold uppercase font-sans tracking-wide">Request Payload (JSON Body)</Label>
                        <span className="text-[9px] text-slate-600">POST /api/attendance</span>
                      </div>
                      <div className="relative">
                        <textarea
                          rows={14}
                          value={apiPayloadStr}
                          onChange={e => setApiPayloadStr(e.target.value)}
                          className="w-full p-3 rounded-lg bg-black/80 border border-slate-800 text-[11px] font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    {/* HTTP Response output */}
                    <div className="space-y-2">
                      <Label className="text-[10px] text-slate-500 font-bold uppercase font-sans tracking-wide">HTTP Response Router Stack</Label>
                      <pre className="w-full p-3 rounded-lg bg-black/90 border border-slate-800 text-[11px] font-mono text-slate-400 h-[240px] overflow-auto custom-scrollbar leading-relaxed">
                        {apiConsoleResponse || "/* Response JSON stream will load here after execution. Click the simulated run key... */"}
                      </pre>
                    </div>

                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-slate-800/40">
                    <p className="text-[10px] text-slate-500 font-sans">
                      * Yuborish orqali haqiqiy skaner qurilmalaridan tushadigan davomat ma'lumotlarini taqlid qilasiz.
                    </p>
                    <Button
                      onClick={handleRunApiImport}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs h-9 cursor-pointer shadow-md shadow-emerald-950/20 flex items-center gap-1.5 transition-all"
                    >
                      <Play size={12} className="fill-white" />
                      API So'rovni Yuborish (Recalculate)
                    </Button>
                  </div>
                </div>
              </Card>

            </div>

            {/* Right Side: Gateway System Logs & Live Status Console */}
            <div className="lg:col-span-1 space-y-6">
              
              <Card className="border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm dark:shadow-none h-full flex flex-col justify-between">
                <div>
                  <CardHeader className="border-b border-slate-200 dark:border-zinc-800/40 pb-4">
                    <CardTitle className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="text-indigo-400 animate-pulse" size={16} />
                      Gateway Logs Xronologiyasi
                    </CardTitle>
                    <CardDescription className="text-[11px] text-slate-400">
                      Skaner routeridan kelayotgan ulanish so'rovlari va tizim tekshiruvlari jurnali.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="py-4">
                    <div className="bg-black/40 rounded-xl border border-slate-800 p-3 h-80 overflow-y-auto custom-scrollbar font-mono text-[9px] text-slate-400 space-y-2">
                      {apiConsoleLogs.map((log, idx) => {
                        let logColor = 'text-slate-400';
                        if (log.includes('[SUCCESS]')) logColor = 'text-emerald-400';
                        if (log.includes('[ERROR]')) logColor = 'text-rose-400 animate-pulse';
                        
                        return (
                          <div key={idx} className={`${logColor} leading-relaxed`}>
                            {log}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="border-t border-slate-800/40 pt-4 bg-slate-950/20 text-center text-[10px] text-slate-500 font-bold flex justify-between items-center">
                  <span>PDP CORE ENGINE v1.2</span>
                  <span>SSL SECURE PORT</span>
                </CardFooter>
              </Card>

            </div>
          </div>

          {/* Harakatlar Xronologiyasi (Audit Logs List) at bottom of faceid/system settings */}
          <Card className="border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm dark:shadow-none">
            <CardHeader className="border-b border-slate-200 dark:border-zinc-800/40 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="text-indigo-400" size={16} />
                Global Harakatlar Audit Xronologiyasi
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Platformadagi har bir administrator, mentor yoki talaba harakati 100% shaffoflik uchun to'liq yozib borilmoqda.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
              {state.auditLogs.map(log => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-300 flex flex-col md:flex-row justify-between md:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        log.userRole === 'Admin' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                        log.userRole === 'Mentor' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' :
                        'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                      }`}>
                        {log.userRole}
                      </span>
                      <strong className="text-white text-xs">{log.action}</strong>
                      <span className="text-[10px] text-slate-500">({log.userId})</span>
                    </div>
                    <p className="text-slate-400">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 whitespace-nowrap self-end md:self-center">
                    {new Date(log.timestamp).toLocaleString('uz-UZ')}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      )}

      {/* INSPECTED STUDENT AUDIT DRAWER MODAL SLIDER */}
      {inspectedStudentId && (() => {
        const student = state.students.find(s => s.id === inspectedStudentId);
        if (!student) return null;
        const studentLogs = state.auditLogs.filter(l => l.userId === inspectedStudentId || l.details.includes(student.fullName));

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
            {/* Dark background close listener */}
            <div className="absolute inset-0 z-0" onClick={() => setInspectedStudentId(null)} />
            
            <div className="relative z-10 w-full max-w-lg bg-slate-950 border-l border-slate-800 p-6 overflow-y-auto h-full flex flex-col justify-between animate-slideLeft text-xs text-slate-400">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                    <UserCheck className="text-indigo-400" size={18} />
                    Talaba Profil Analizi
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspectedStudentId(null)}
                    className="text-slate-500 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    Yopish
                  </Button>
                </div>

                {/* Profile card preview */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <img
                    src={student.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120"}
                    alt={student.fullName}
                    className="w-12 h-12 rounded-full object-cover border border-indigo-500/20"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-white leading-tight">{student.fullName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">ID: {student.id} | Guruh: {student.group}</p>
                    <p className="text-[10px] text-slate-500">{student.email}</p>
                  </div>
                </div>

                {/* Student specific charter scores */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/80 space-y-3">
                  <h4 className="text-white font-bold uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                    <Award size={12} className="text-pink-400" />
                    Grant Nizomi Koeffitsientlari
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-500">GPA</span>
                      <strong className="text-slate-100 font-mono">{student.gpa}% ({student.academicScore} ball)</strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-500">Davomat ko'rsatkichi</span>
                      <strong className={`font-mono ${student.attendance_summary.attendance_percentage < 80 ? 'text-rose-400 font-extrabold' : 'text-slate-100'}`}>
                        {student.attendance_summary.attendance_percentage}% ({student.attendanceScore} ball)
                      </strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-500">Mustaqil Topshiriqlar</span>
                      <strong className="text-slate-100 font-mono">{student.assignmentScore} / 15.0 ball</strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-500">Jamoat ishlari (Yutuqlar)</span>
                      <strong className="text-emerald-400 font-mono">+{student.activityScore} ball</strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-500">Qizil filtr jarimalar</span>
                      <strong className="text-rose-400 font-mono">-{student.penaltyScore} ball</strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-500">Yakuniy Reyting Ball</span>
                      <strong className="text-indigo-400 font-mono text-sm font-black">{student.finalScore} / 100.0</strong>
                    </div>
                  </div>
                </div>

                {/* Audit trail vertical timeline */}
                <div className="space-y-3">
                  <h4 className="text-white font-bold uppercase tracking-wider text-[10px]">Ushbu talabaning audit xronologiyasi</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {studentLogs.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-lg">
                        Ushbu talabaga tegishli logs topilmadi.
                      </div>
                    ) : (
                      studentLogs.map((log, index) => (
                        <div key={log.id} className="relative pl-4 border-l border-slate-800 pb-2">
                          <div className="absolute left-[-4.5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500/80 border-2 border-slate-950" />
                          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[10px] space-y-1">
                            <div className="flex justify-between items-center text-slate-500">
                              <span>Bajaruvchi: <strong>{log.userRole}</strong></span>
                              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-slate-100 font-bold">{log.action}</div>
                            <div className="text-slate-400 leading-normal">{log.details}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-6 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                PDP Edumetric Audit Engine • 100% Shaffof Tizim
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
