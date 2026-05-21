import React, { useState } from 'react';
import { StateProvider, useGlobalState, type UserRole } from './context/StateContext';
import { LandingPage } from './components/landing/LandingPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { MentorDashboard } from './components/mentor/MentorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Toaster } from 'sonner';
import { 
  Award, BookOpen, Shield, GraduationCap, Users, LayoutDashboard, 
  Sparkles, RefreshCw, LogOut, ChevronLeft, ChevronRight, Menu, 
  Activity, Bell, Lock, UserCheck, Code, Sliders, Calendar, Terminal,
  Sun, Moon
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import "./index.css";

function AppContent() {
  const { state, dispatch } = useGlobalState();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Stored Theme State: light or dark (default is dark)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('edumetric_theme');
      return (savedTheme as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('edumetric_theme', nextTheme);
    }
  };

  // Sub-tabs states managed at shell level to sync with sidebar clicks
  const [studentTab, setStudentTab] = useState<'overview' | 'courses' | 'achievements' | 'scholarship' | 'feedback' | 'settings'>('overview');
  const [mentorTab, setMentorTab] = useState<'journal' | 'feedback'>('journal');
  const [adminTab, setAdminTab] = useState<'matrix' | 'queue' | 'modifiers' | 'faceid'>('matrix');

  const student = state.students.find(s => s.id === state.activeStudentId);

  const handleRoleChange = (role: UserRole) => {
    dispatch({ type: 'SWITCH_ROLE', payload: role });
    setMobileSidebarOpen(false);
  };

  const getBreadcrumbTitle = () => {
    if (state.activeRole === 'Guest') return 'Bosh Sahifa';
    if (state.activeRole === 'Student') {
      const titles = {
        overview: 'Talaba Boshqaruv Paneli',
        courses: 'Fanlar va Topshiriqlar',
        achievements: 'Yutuqlar va Sertifikatlar Portfolioli',
        scholarship: 'Guruhlararo Grant Reytingi',
        feedback: 'Mentor va Tyutor Fikr-Mulohazalari',
        settings: 'Hisob Sozlamalari (2FA / Telegram)'
      };
      return titles[studentTab] || 'Talaba Kabineti';
    }
    if (state.activeRole === 'Mentor') {
      const titles = {
        journal: 'Baholar va Davomat Jurnali',
        feedback: 'Feedback Broadcast & Xabarnomalar'
      };
      return titles[mentorTab] || 'Mentor Ish Stoli';
    }
    if (state.activeRole === 'Admin') {
      const titles = {
        matrix: '16-Kolonnali Grant Reyting Matrixi',
        queue: 'Yutuq Arizalarini Tasdiqlash Navbati',
        modifiers: 'Jarima va Bonus Ballar Kiritish',
        faceid: 'FaceID Attendance simulated API Playground'
      };
      return titles[adminTab] || 'Admin Boshqaruv Markazi';
    }
    return 'Panel';
  };

  // Render correct panel
  const renderActiveDashboard = () => {
    switch (state.activeRole) {
      case 'Student':
        return <StudentDashboard activeSubTab={studentTab} setActiveSubTab={setStudentTab} />;
      case 'Mentor':
        return <MentorDashboard activeSubTab={mentorTab} setActiveSubTab={setMentorTab} />;
      case 'Admin':
        return <AdminDashboard activeSubTab={adminTab} setActiveSubTab={setAdminTab} />;
      case 'Guest':
      default:
        return <LandingPage onSelectRole={handleRoleChange} />;
    }
  };

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed} open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
      <div className={`
        ${theme === 'dark' ? 'dark bg-zinc-950 text-slate-100' : 'bg-slate-50 text-slate-800'}
        min-h-screen w-full flex font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative transition-colors duration-200
      `}>
        {/* Dynamic Grid Mesh Background overlay */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[14px_24px] pointer-events-none z-0" />
        <div className="fixed top-0 left-1/4 size-125 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-0 right-1/4 size-125 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Sidebar Navigation */}
        {state.activeRole !== 'Guest' && (
          <Sidebar collapsible="icon" className="border-r border-slate-200/80 dark:border-zinc-800/60 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-2xl">
            {/* Sidebar Header / Logo */}
            <SidebarHeader className="h-16 border-b border-slate-200/80 dark:border-zinc-800/50 flex items-center justify-between px-4">
              <div 
                onClick={() => handleRoleChange('Guest')}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full rounded-[6px] bg-white dark:bg-zinc-950 flex items-center justify-center">
                    <Sparkles size={14} className="text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
                <div className="group-data-[collapsible=icon]:hidden">
                  <span className="font-black text-sm tracking-tight text-slate-800 dark:text-white uppercase bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">Edumetric</span>
                  <span className="text-[9px] block font-extrabold text-indigo-500 dark:text-indigo-400 tracking-wider">DOMINANT TEAM</span>
                </div>
              </div>
            </SidebarHeader>

            {/* Active User Context / Profile Badge */}
            <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800/40 bg-slate-50/50 dark:bg-zinc-950/20 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                <div className="relative shrink-0">
                  <img
                    src={
                      state.activeRole === 'Student' && student ? student.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" :
                      state.activeRole === 'Mentor' ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100" : 
                      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100"
                    }
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border border-indigo-500/30 object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                </div>
                <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {state.activeRole === 'Student' && student ? student.fullName :
                     state.activeRole === 'Mentor' ? "D. Eshmuradov" : "Admin-1"}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {state.activeRole === 'Student' && student ? `${student.group} • Talaba` :
                     state.activeRole === 'Mentor' ? "IF Kurs Mentori" : "PDP Bosh Admini"}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Lists */}
            <SidebarContent className="px-3 py-4 space-y-6 custom-scrollbar">
              <SidebarGroup>
                <SidebarGroupLabel className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 block mb-2 group-data-[collapsible=icon]:hidden">
                  MENU NAVIGATSIYA
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {/* STUDENT NAVIGATION LINKS */}
                    {state.activeRole === 'Student' && [
                      { id: 'overview', label: 'Boshqaruv Paneli', icon: LayoutDashboard, color: 'text-indigo-500 dark:text-indigo-400' },
                      { id: 'courses', label: 'Fanlar & Vazifalar', icon: BookOpen, color: 'text-purple-500 dark:text-purple-400' },
                      { id: 'achievements', label: 'Yutuqlar Portfolioli', icon: Award, color: 'text-pink-500 dark:text-pink-400' },
                      { id: 'scholarship', label: 'Grant Monitoring', icon: Activity, color: 'text-sky-500 dark:text-sky-400' },
                      { id: 'feedback', label: 'Mentor Fikrlari', icon: UserCheck, color: 'text-emerald-500 dark:text-emerald-400' },
                      { id: 'settings', label: 'Sozlamalar', icon: Sliders, color: 'text-amber-500 dark:text-amber-400' },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = studentTab === tab.id;
                      return (
                        <SidebarMenuItem key={tab.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={tab.label}
                            onClick={() => setStudentTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                              isActive 
                                ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-200 border border-indigo-500/20 shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-transparent'
                            }`}
                          >
                            <Icon size={16} className={tab.color} />
                            <span>{tab.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}

                    {/* MENTOR NAVIGATION LINKS */}
                    {state.activeRole === 'Mentor' && [
                      { id: 'journal', label: 'Jurnal & Davomat', icon: Calendar, color: 'text-purple-500 dark:text-purple-400' },
                      { id: 'feedback', label: 'Feedback yuborish', icon: UserCheck, color: 'text-indigo-500 dark:text-indigo-400' },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = mentorTab === tab.id;
                      return (
                        <SidebarMenuItem key={tab.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={tab.label}
                            onClick={() => setMentorTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                              isActive 
                                ? 'bg-purple-600/10 text-purple-600 dark:text-purple-200 border border-purple-500/20 shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-transparent'
                            }`}
                          >
                            <Icon size={16} className={tab.color} />
                            <span>{tab.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}

                    {/* ADMIN NAVIGATION LINKS */}
                    {state.activeRole === 'Admin' && [
                      { id: 'matrix', label: '16-Kolonnali Jurnal', icon: LayoutDashboard, color: 'text-emerald-500 dark:text-emerald-400' },
                      { id: 'queue', label: 'Yutuqlar Navbati', icon: Award, color: 'text-pink-500 dark:text-pink-400' },
                      { id: 'modifiers', label: 'Jarima & Bonuslar', icon: Sliders, color: 'text-amber-500 dark:text-amber-400' },
                      { id: 'faceid', label: 'FaceID Playground', icon: Terminal, color: 'text-indigo-500 dark:text-indigo-400' },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = adminTab === tab.id;
                      return (
                        <SidebarMenuItem key={tab.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={tab.label}
                            onClick={() => setAdminTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-200 border border-emerald-500/20 shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-transparent'
                            }`}
                          >
                            <Icon size={16} className={tab.color} />
                            <span>{tab.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* QUICK IMPERSONATE ZONE */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 block mb-2 group-data-[collapsible=icon]:hidden">
                  IMPERSONATION (TEZKOR)
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {[
                      { id: 'Student', label: 'Talaba oynasi', icon: GraduationCap, color: 'text-indigo-500 dark:text-indigo-400' },
                      { id: 'Mentor', label: 'Mentor oynasi', icon: BookOpen, color: 'text-purple-500 dark:text-purple-400' },
                      { id: 'Admin', label: 'Admin oynasi', icon: Shield, color: 'text-emerald-500 dark:text-emerald-400' }
                    ].map(role => {
                      const Icon = role.icon;
                      const isActive = state.activeRole === role.id;
                      return (
                        <SidebarMenuItem key={role.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={role.label}
                            onClick={() => handleRoleChange(role.id as UserRole)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              isActive 
                                ? 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700' 
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-900/40 border border-transparent'
                            }`}
                          >
                            <Icon size={14} className={role.color} />
                            <span>{role.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            {/* Sidebar Bottom Utilities */}
            <SidebarFooter className="p-4 border-t border-slate-200/80 dark:border-zinc-800/50">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Bosh sahifaga qaytish"
                    onClick={() => handleRoleChange('Guest')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Tizimdan chiqish</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        )}

        {/* Main Content Area (Layout padding managed by SidebarInset) */}
        <SidebarInset className="flex-1 min-h-screen flex flex-col min-w-0 relative z-10 transition-all duration-300 bg-transparent">
          
          {/* Modern sticky breadcrumbs header */}
          {state.activeRole !== 'Guest' && (
            <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl h-16">
              <div className="h-full px-4 md:px-8 flex items-center justify-between">
                
                {/* Left Side: Breadcrumb details with toggle trigger */}
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="h-9 w-9 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Edumetric</span>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wide bg-indigo-500/5 px-2.5 py-1 rounded border border-indigo-500/10">
                      {getBreadcrumbTitle()}
                    </span>
                  </div>
                </div>

                {/* Right Side: Global mock indicators, Theme Toggle, and Avatar */}
                <div className="flex items-center gap-4">
                  
                  {/* Live API Connection status */}
                  <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>FaceID API Gateway: Connected</span>
                  </div>

                  {/* Theme Mode Toggle Button */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-zinc-900 cursor-pointer transition-all"
                    title={theme === 'dark' ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
                  >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                  </button>

                  {/* Profile switch trigger badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                      state.activeRole === 'Admin' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                      state.activeRole === 'Mentor' ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' :
                      state.activeRole === 'Student' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' :
                      'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500'
                    }`}>
                      {state.activeRole}
                    </span>
                  </div>
                </div>

              </div>
            </header>
          )}

          {/* Dynamic workspace context */}
          <main className={`flex-1 relative z-10 ${state.activeRole === 'Guest' ? '' : 'p-4 md:p-8 max-w-7xl mx-auto w-full'}`}>
            {renderActiveDashboard()}
          </main>

          {/* Modern footer with Hackathon branding */}
          <footer className="relative z-10 w-full py-8 border-t border-slate-200/80 dark:border-zinc-800/40 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md mt-auto">
            <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
              <div>
                &copy; {new Date().getFullYear()} Edumetric LMS. Barcha huquqlar himoyalangan.
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400">
                Loyihani yaratdi: 
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent uppercase tracking-wider font-extrabold animate-pulse">
                  Dominant
                </span> 
                jamoasi
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-600">
                PDP Hackathon Portal • Premium Overhaul & Aesthetics
              </div>
            </div>
          </footer>

        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export function App() {
  return (
    <StateProvider>
      <Toaster richColors position="top-right" />
      <AppContent />
    </StateProvider>
  );
}

export default App;
