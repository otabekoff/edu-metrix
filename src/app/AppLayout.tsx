import React, { useState, useEffect } from 'react';
import { useGlobalState, type UserRole } from '../context/StateContext';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router';
import {
  Award, BookOpen, Shield, GraduationCap, LayoutDashboard,
  LogOut, Activity, Calendar, Terminal, Sliders, UserCheck,
  Sun, Moon, Bell, AlertTriangle, Clock
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import "../index.css";
// @ts-ignore
import logoUrl from '../../public/logo.png';

export function AppLayout() {
  const { state, dispatch } = useGlobalState();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { tab } = useParams();

  // Stored Theme State: light or dark (default is dark)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('edumetric_theme');
      return (savedTheme as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  const disableThemeChangeTransitions = () => {
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.appendChild(document.createTextNode(`
      *, *::before, *::after {
        transition: none !important;
      }
    `));
    document.head.appendChild(style);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove();
      });
    });
  };

  const toggleTheme = () => {
    disableThemeChangeTransitions();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('edumetric_theme', nextTheme);
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Sync activeRole in Global State with the URL path
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on navigation

    const path = location.pathname;
    let detectedRole: UserRole = 'Guest';
    if (path.startsWith('/student')) {
      detectedRole = 'Student';
    } else if (path.startsWith('/mentor')) {
      detectedRole = 'Mentor';
    } else if (path.startsWith('/admin')) {
      detectedRole = 'Admin';
    }

    if (state.activeRole !== detectedRole) {
      dispatch({ type: 'SWITCH_ROLE', payload: detectedRole });
    }
  }, [location.pathname, state.activeRole, dispatch]);

  const student = state.students.find(s => s.id === state.activeStudentId);
  const selectionDeadline = new Date('2026-06-30T23:59:59+05:00');
  const selectionMsLeft = Math.max(selectionDeadline.getTime() - Date.now(), 0);
  const selectionDaysLeft = Math.ceil(selectionMsLeft / (1000 * 60 * 60 * 24));
  const selectionTimeLabel = selectionDaysLeft > 0
    ? `${selectionDaysLeft} kun qoldi`
    : 'Saralash yakunlandi';
  const pendingAchievementsCount = state.students.flatMap(s => s.achievements).filter(a => a.status === 'Kutilmoqda').length;
  const pendingIdeasCount = state.students.flatMap(s => s.ideas ?? []).filter(idea => idea.status === 'Kutilmoqda').length;
  const notifications = [
    {
      title: 'Grant saralash muddati',
      description: `Saralash yakunigacha ${selectionTimeLabel}. Deadline: 30-iyun, 2026.`,
    },
    {
      title: 'Davomat ogohlantirishi',
      description: student
        ? `${student.fullName}: davomat ${student.attendance_summary.attendance_percentage}%. Minimal talab 80%.`
        : 'Minimal davomat talabi 80%.',
    },
    {
      title: 'Faollik navbati',
      description: `${pendingAchievementsCount} ta sertifikat va ${pendingIdeasCount} ta g'oya admin tasdig'ini kutmoqda.`,
    },
  ];

  const getBreadcrumbTitle = () => {
    if (state.activeRole === 'Guest') return 'Bosh Sahifa';
    if (state.activeRole === 'Student') {
      const titles: Record<string, string> = {
        overview: 'Talaba Boshqaruv Paneli',
        courses: 'Fanlar va Topshiriqlar',
        achievements: "Yutuqlar, G'oyalar va Yechimlar",
        scholarship: 'Guruhlararo Grant Reytingi',
        feedback: 'Mentor va Tyutor Fikr-Mulohazalari',
        settings: 'Hisob Sozlamalari (2FA / Telegram)'
      };
      return titles[tab || ''] || 'Talaba Kabineti';
    }
    if (state.activeRole === 'Mentor') {
      const titles: Record<string, string> = {
        journal: 'Baholar va Davomat Jurnali',
        feedback: 'Feedback Broadcast & Xabarnomalar'
      };
      return titles[tab || ''] || 'Mentor Ish Stoli';
    }
    if (state.activeRole === 'Admin') {
      const titles: Record<string, string> = {
        matrix: '16-Kolonnali Grant Reyting Matrixi',
        queue: "Yutuq va G'oya Arizalari Navbati",
        modifiers: 'Jarima va Bonus Ballar Kiritish',
        faceid: 'FaceID Attendance simulated API Playground'
      };
      return titles[tab || ''] || 'Admin Boshqaruv Markazi';
    }
    return 'Panel';
  };

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed} open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
      <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen w-full flex bg-background text-foreground`}>
        {/* Sidebar Navigation */}
        {state.activeRole !== 'Guest' && (
          <Sidebar collapsible="icon">
            {/* Sidebar Header / Logo */}
            <SidebarHeader>
              <SidebarMenuButton
                size="lg"
                // onClick={() => navigate('/')}
                tooltip="Edumetric"
              >
                <img
                  src={logoUrl}
                  alt="Edumetric"
                  className="size-8 rounded-md object-contain"
                />
                <div>
                  <span className="font-medium">Edumetric</span>
                  <span className="block text-xs text-muted-foreground">Dominant Team</span>
                </div>
              </SidebarMenuButton>
            </SidebarHeader>

            {/* Active User Context / Profile Badge */}
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" tooltip={state.activeRole}>
                    <Avatar className="size-8">
                      <AvatarImage
                        src={
                          state.activeRole === 'Student' && student ? student.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" :
                            state.activeRole === 'Mentor' ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100" :
                              "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100"
                        }
                        alt="Avatar"
                      />
                      <AvatarFallback>{state.activeRole.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">
                        {state.activeRole === 'Student' && student ? student.fullName :
                          state.activeRole === 'Mentor' ? "D. Eshmuradov" : "Admin-1"}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {state.activeRole === 'Student' && student ? `${student.group} • Talaba` :
                          state.activeRole === 'Mentor' ? "IF Kurs Mentori" : "PDP Bosh Admini"}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <SidebarGroupContent className="mt-2 px-2 group-data-[collapsible=icon]:hidden">
                <Badge variant="outline">FaceID API Gateway: Connected</Badge>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Navigation Lists */}
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Menu navigatsiya</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {/* STUDENT NAVIGATION LINKS */}
                    {state.activeRole === 'Student' && [
                      { id: 'overview', label: 'Boshqaruv Paneli', icon: LayoutDashboard },
                      { id: 'courses', label: 'Fanlar & Vazifalar', icon: BookOpen },
                      { id: 'achievements', label: "Yutuqlar & G'oyalar", icon: Award },
                      { id: 'scholarship', label: 'Grant Monitoring', icon: Activity },
                      { id: 'feedback', label: 'Mentor Fikrlari', icon: UserCheck },
                      { id: 'settings', label: 'Sozlamalar', icon: Sliders },
                    ].map(item => {
                      const Icon = item.icon;
                      const isActive = tab === item.id;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.label}
                            onClick={() => navigate(`/student/${item.id}`)}
                          >
                            <Icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}

                    {/* MENTOR NAVIGATION LINKS */}
                    {state.activeRole === 'Mentor' && [
                      { id: 'journal', label: 'Jurnal & Davomat', icon: Calendar },
                      { id: 'feedback', label: 'Feedback yuborish', icon: UserCheck },
                    ].map(item => {
                      const Icon = item.icon;
                      const isActive = tab === item.id;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.label}
                            onClick={() => navigate(`/mentor/${item.id}`)}
                          >
                            <Icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}

                    {/* ADMIN NAVIGATION LINKS */}
                    {state.activeRole === 'Admin' && [
                      { id: 'matrix', label: '16-Kolonnali Jurnal', icon: LayoutDashboard },
                      { id: 'queue', label: "Yutuqlar & G'oyalar", icon: Award },
                      { id: 'modifiers', label: 'Jarima & Bonuslar', icon: Sliders },
                      { id: 'faceid', label: 'FaceID Playground', icon: Terminal },
                    ].map(item => {
                      const Icon = item.icon;
                      const isActive = tab === item.id;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.label}
                            onClick={() => navigate(`/admin/${item.id}`)}
                          >
                            <Icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            {/* Sidebar Bottom Utilities */}
            <SidebarFooter>
              <SidebarGroup>
                <SidebarGroupLabel>Impersonation (tezkor)</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {[
                      { id: 'Student', label: 'Talaba oynasi', icon: GraduationCap, path: '/student/overview' },
                      { id: 'Mentor', label: 'Mentor oynasi', icon: BookOpen, path: '/mentor/journal' },
                      { id: 'Admin', label: 'Admin oynasi', icon: Shield, path: '/admin/matrix' }
                    ].map(role => {
                      const Icon = role.icon;
                      const isActive = state.activeRole === role.id;
                      return (
                        <SidebarMenuItem key={role.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={role.label}
                            onClick={() => navigate(role.path)}
                          >
                            <Icon />
                            <span>{role.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Bosh sahifaga qaytish"
                    onClick={() => navigate('/')}
                  >
                    <LogOut />
                    <span>Tizimdan chiqish</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        )}

        {/* Main Content Area (Layout padding managed by SidebarInset) */}
        <SidebarInset>

          {/* Modern sticky breadcrumbs header */}
          {state.activeRole !== 'Guest' && (
            <header className="fixed top-0 z-40 w-full border-b bg-background">
              <div className="min-h-16 px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">

                {/* Left Side: Breadcrumb details with toggle trigger */}
                <div className="flex items-center gap-3">
                  <SidebarTrigger />
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-sm text-muted-foreground">Edumetric</span>
                    <span className="text-muted-foreground">/</span>
                    <Badge variant="outline">{getBreadcrumbTitle()}</Badge>
                  </div>
                </div>

                {/* Right Side: Global mock indicators, Theme Toggle, and Avatar */}
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    <Clock className="size-3" />
                    {selectionTimeLabel}
                  </Badge>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Bildirishnomalar"
                      >
                        <Bell size={14} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80">
                      <PopoverHeader>
                        <PopoverTitle>Bildirishnomalar</PopoverTitle>
                      </PopoverHeader>
                      <div className="mt-4 space-y-3">
                        {notifications.map(notification => (
                          <div key={notification.title} className="flex gap-3 rounded-md border p-3">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{notification.title}</div>
                              <p className="text-sm text-muted-foreground">{notification.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
                  >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                  </Button>
                </div>

              </div>
            </header>
          )}

          {/* Dynamic workspace context */}
          <main className={`flex-1 ${state.activeRole === 'Guest' ? '' : 'mt-[72px] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full'}`}>
            <Outlet />
          </main>

          {/* Modern footer with Hackathon branding */}
          <footer className="w-full py-6 border-t mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-between gap-4 text-center text-sm text-muted-foreground">
              <div>
                &copy; {new Date().getFullYear()} Edumetric LMS. Barcha huquqlar himoyalangan.
              </div>
              <div>
                Loyihani yaratdi: Dominant jamoasi
              </div>
              <div>
                PDP Hackathon Portal • Premium Overhaul & Aesthetics
              </div>
            </div>
          </footer>

        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
