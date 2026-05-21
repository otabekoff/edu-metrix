import React from 'react';
import type { UserRole } from '../../context/StateContext';
import { Shield, BookOpen, GraduationCap, Award, CheckCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useNavigate } from 'react-router';

export function LandingPage() {
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole) => {
    if (role === 'Student') navigate('/student/overview');
    else if (role === 'Mentor') navigate('/mentor/journal');
    else if (role === 'Admin') navigate('/admin/matrix');
    else navigate('/'); // Guest
  };
  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 text-left animate-fadeIn">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-125 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-3/4 left-1/3 size-75 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
        <div className="flex-1 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400" />
            Edumetric LMS v1.0 • PDP University
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
            Ta'lim Grantlarini <br />
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Shaffof Baholash
            </span> <br />
            Tizimi
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
            Biz talabalarning o'qish samaradorligini, davomatini, va akademik yutuqlarini Grant Nizomi asosida to'liq avtomatlashtirilgan reyting tizimida birlashtirdik. Loyiha <strong className="text-indigo-400">Dominant</strong> jamoasi tomonidan ishlab chiqilgan.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => handleSelectRole('Guest')}
              className="px-6 py-6 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              Mehmon Rejimida Kirish
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-6 rounded-xl font-bold bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              Rollar bo'yicha kirish
            </Button>
          </div>
        </div>

        {/* Visual Graphic Artifact Container */}
        <div className="flex-1 w-full max-w-md relative select-none">
          <Card className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden group p-0">
            <CardContent className="p-6">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl" />
              {/* Minimal rating display decoration */}
              <div className="flex justify-between items-center mb-6 relative z-10">
                <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                  Dominant Grant Monitor
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                      ST
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Asilbek Toshpulatov</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-500">IF-22-04 • Grant</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">93.5 ball</div>
                    <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">Kam Xavf (Low)</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                      SE
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Sardor Ergashev</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-500">IF-22-04 • Grant</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">107.3 ball</div>
                    <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">Kam Xavf (Low)</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-semibold text-rose-500 dark:text-rose-400">Bekzod Rustamov (GPA &lt; 80%)</h4>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400">Akademik bekor qilingan</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-[9px] font-bold uppercase">
                    CANCELLED
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex justify-between items-center text-[11px] text-slate-500 dark:text-gray-500 relative z-10">
                <span>Integratsiya: FaceID Skaner API</span>
                <span>100% Shaffof</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics Panel */}
      <Card className="relative z-10 p-0 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-lg mb-20 shadow-sm dark:shadow-none">
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
          <div className="text-center md:text-left md:border-r border-slate-200 dark:border-white/5 md:pr-6">
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">1,240+</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Jami Talabalar</div>
          </div>
          <div className="text-center md:text-left md:border-r border-slate-200 dark:border-white/5 md:px-6">
            <div className="text-3xl md:text-4xl font-extrabold text-indigo-500 dark:text-indigo-400 mb-1">94.8%</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold">O'rtacha Davomat</div>
          </div>
          <div className="text-center md:text-left md:border-r border-slate-200 dark:border-white/5 md:px-6">
            <div className="text-3xl md:text-4xl font-extrabold text-purple-500 dark:text-purple-400 mb-1">45+</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Aktiv Mentorlar</div>
          </div>
          <div className="text-center md:text-left md:pl-6">
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-500 dark:text-emerald-400 mb-1">87.5%</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Bitiruvchilar Bandligi</div>
          </div>
        </CardContent>
      </Card>

      {/* Role Selection Section */}
      <div id="roles" className="relative z-10 mb-20 scroll-mt-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 text-center">
          Tizimga kirish darvozalari
        </h2>
        <p className="text-slate-600 dark:text-gray-400 text-sm mb-10 text-center max-w-md mx-auto">
          Foydalanuvchi turini tanlang va tizimning interaktiv funktsiyalarini sinovdan o'tkazing
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Card */}
          <Card
            onClick={() => handleSelectRole('Student')}
            className="group relative rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-0 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm dark:shadow-none"
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Talaba Oynasi</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                Shaxsiy akademik reytingingiz, 2FA sozlamalari, sertifikatlar yuklash, feedback kelgan xatlari va dars materiallari.
              </p>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform">
                Kirish &rarr;
              </span>
            </CardContent>
          </Card>

          {/* Mentor Card */}
          <Card
            onClick={() => handleSelectRole('Mentor')}
            className="group relative rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-0 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm dark:shadow-none"
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Mentor Oynasi</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                Qog'ozbozliksiz 2-3 klikda davomat olish, spreadsheet jurnal boshqaruvi, topshiriqlarni baholash va feedback berish.
              </p>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-bold group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform">
                Kirish &rarr;
              </span>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card
            onClick={() => handleSelectRole('Admin')}
            className="group relative rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-0 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm dark:shadow-none"
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Admin Oynasi</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                16-kolonnali Grant reyting jurnali, kiritilgan sertifikatlarni tasdiqlash, FaceID API Gateway import moduli, to'liq audit xronologiyasi.
              </p>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform">
                Kirish &rarr;
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
