import React from 'react';
import type { UserRole } from '../../context/StateContext';
import { Shield, BookOpen, GraduationCap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router';

export function LandingPage() {
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole) => {
    if (role === 'Student') navigate('/student/overview');
    else if (role === 'Mentor') navigate('/mentor/journal');
    else if (role === 'Admin') navigate('/admin/matrix');
    else navigate('/');
  };

  const stats = [
    ['1,240+', 'Jami talabalar'],
    ['94.8%', "O'rtacha davomat"],
    ['45+', 'Aktiv mentorlar'],
    ['87.5%', 'Bitiruvchilar bandligi'],
  ];

  const roles = [
    {
      role: 'Student' as const,
      title: 'Talaba Oynasi',
      icon: GraduationCap,
      description: "Shaxsiy akademik reyting, sertifikatlar, feedback va hisob sozlamalari.",
    },
    {
      role: 'Mentor' as const,
      title: 'Mentor Oynasi',
      icon: BookOpen,
      description: "Davomat, topshiriqlarni baholash va shaxsiy feedback yuborish.",
    },
    {
      role: 'Admin' as const,
      title: 'Admin Oynasi',
      icon: Shield,
      description: "Grant reyting jurnali, sertifikatlarni tasdiqlash va FaceID API importi.",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-12">
      <section className="space-y-6">
        <Badge variant="outline">Edumetric LMS v1.0 • PDP University</Badge>
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Ta'lim grantlarini shaffof baholash tizimi
          </h1>
          <p className="text-lg text-muted-foreground">
            Talabalarning o'qish samaradorligi, davomati va akademik yutuqlarini Grant Nizomi asosida yagona reytingda kuzating.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleSelectRole('Guest')}>Mehmon Rejimida Kirish</Button>
          <Button variant="outline" onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}>
            Rollar bo'yicha kirish
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(([value, label]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{value}</CardTitle>
              <CardDescription>{label}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity />
              Grant Monitor Namunasi
            </CardTitle>
            <CardDescription>Reyting, xavf darajasi va integratsiyalarni kuzatish uchun qisqa ko'rinish.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {['Asilbek Toshpulatov', 'Sardor Ergashev', 'Bekzod Rustamov'].map((name, index) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="text-base">{name}</CardTitle>
                  <CardDescription>IF-22-04 • {index === 2 ? 'Kontrakt' : 'Grant'}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span>{index === 1 ? '107.3' : index === 2 ? '72.8' : '93.5'} ball</span>
                  <Badge variant={index === 2 ? 'destructive' : 'outline'}>{index === 2 ? 'High' : 'Low'}</Badge>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="roles" className="space-y-6 scroll-mt-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Tizimga kirish darvozalari</h2>
          <p className="text-muted-foreground">Foydalanuvchi turini tanlang va kerakli ish oynasiga o'ting.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map(item => {
            const Icon = item.icon;
            return (
              <Card key={item.role} className="cursor-pointer" onClick={() => handleSelectRole(item.role)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Kirish</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
