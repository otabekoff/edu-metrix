import React from 'react';
import type { UserRole } from '../../context/StateContext';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Shield,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router';
// @ts-ignore
import logoUrl from '../../../public/logo.png';

export function LandingPage() {
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole) => {
    if (role === 'Student') navigate('/student/overview');
    else if (role === 'Mentor') navigate('/mentor/journal');
    else if (role === 'Admin') navigate('/admin/matrix');
    else navigate('/');
  };

  const stats = [
    ['1,240+', 'Talaba profili'],
    ['94.8%', "O'rtacha davomat"],
    ['45+', 'Mentor va tyutor'],
    ['110', 'Yakuniy ball modeli'],
  ];

  const roles = [
    {
      role: 'Student' as const,
      title: 'Talaba',
      icon: GraduationCap,
      description: "Reyting, fanlar, yutuqlar, feedback va hisob sozlamalari.",
      action: 'Talaba kabineti',
    },
    {
      role: 'Mentor' as const,
      title: 'Mentor',
      icon: BookOpen,
      description: "Davomat, topshiriqlarni baholash va shaxsiy feedback yuborish.",
      action: 'Mentor paneli',
    },
    {
      role: 'Admin' as const,
      title: 'Admin',
      icon: Shield,
      description: "Grant matrixi, yutuqlar navbati, bonuslar va FaceID importi.",
      action: 'Admin markazi',
    },
  ];

  const previewRows = [
    ['Asilbek Toshpulatov', 'IF-22-04', 'Grant', '90.83', 'Low'],
    ['Sardor Ergashev', 'IF-22-04', 'Grant', '107.3', 'Low'],
    ['Bekzod Rustamov', 'IF-22-05', 'Kontrakt', '72.8', 'High'],
  ];

  const workflow = [
    ['01', 'Maʼlumot yigʼish', 'FaceID, mentor baholari va talaba portfoliolaridan maʼlumotlar olinadi.'],
    ['02', 'Reyting hisoblash', 'Grant nizomi boʼyicha GPA, davomat, vazifa va faollik koeffitsientlari hisoblanadi.'],
    ['03', 'Qaror va audit', 'Admin tasdiqlari, oʼzgarishlar va foydalanuvchi amallari audit jurnalida saqlanadi.'],
  ];

  return (
    <div className="w-full">
      <section className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="PDP University" className="size-10 rounded-md object-contain" />
            <div>
              <div className="font-semibold">Edumetric</div>
              <div className="text-sm text-muted-foreground">PDP University grant monitoring</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/login')}>Sign in</Button>
            <Button onClick={() => handleSelectRole('Student')}>Demo ochish</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-6">
            <Badge variant="outline">Grant nizomi • FaceID import • Mentor feedback • G'oyalar</Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                Grant qarorlarini ko'rinadigan, tushunarli va auditli qiling.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Edumetric talaba reytingi, davomat, baholash, sertifikat tasdiqlash, g'oya takliflari va admin qarorlarini bitta boshqaruv paneliga jamlaydi.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/login')}>
                Tizimga kirish
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}>
                Rollarni ko'rish
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity />
                      Jonli grant matrixi
                    </CardTitle>
                    <CardDescription>Admin ko'radigan qisqa reyting namunasi.</CardDescription>
                  </div>
                  <Badge variant="secondary">Real-time model</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Talaba</TableHead>
                      <TableHead>Guruh</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ball</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map(([name, group, status, score, risk]) => (
                      <TableRow key={name}>
                        <TableCell>
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground">Risk: {risk}</div>
                        </TableCell>
                        <TableCell>{group}</TableCell>
                        <TableCell>
                          <Badge variant={status === 'Grant' ? 'default' : 'secondary'}>{status}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-12 md:px-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Platforma nimalarni birlashtiradi?</h2>
          <p className="text-muted-foreground">Grant monitoringi uchun eng muhim uchta oqim.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy /> Reyting</CardTitle>
              <CardDescription>GPA, davomat va vazifalar.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award /> Portfolio</CardTitle>
              <CardDescription>Sertifikat va yutuq tasdiqlari.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb /> G'oyalar</CardTitle>
              <CardDescription>Takliflar uchun +1/+2 ball.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <Separator />

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-12 md:px-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tizim ko'rsatkichlari</h2>
          <p className="text-muted-foreground">Real vaqt asosida ishlovchi ko'rsatkichlar.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(([value, label]) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle>{value}</CardTitle>
                <CardDescription>{label}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-12 md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Jarayon qanday ishlaydi?</h2>
            <p className="text-muted-foreground">Grant monitoringi murakkab ko'rinsa ham, ish oqimi sodda.</p>
          </div>
          <Badge variant="outline">100% audit qilinadi</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {workflow.map(([step, title, description]) => (
            <Card key={step}>
              <CardHeader>
                <Badge variant="secondary">{step}</Badge>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-6xl space-y-6 px-4 py-12 md:px-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Rolingizni tanlang</h2>
          <p className="text-muted-foreground">Har bir rol o'ziga kerak bo'lgan ish oynasidan boshlaydi.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {roles.map(item => {
            const Icon = item.icon;
            return (
              <Card key={item.role}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4" />
                    Demo ma'lumotlar bilan ochiladi
                  </div>
                  <Button className="w-full" variant={item.role === 'Student' ? 'default' : 'outline'} onClick={() => handleSelectRole(item.role)}>
                    {item.action}
                    <ArrowRight />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award />
              Hackathon demo uchun tayyor
            </CardTitle>
            <CardDescription>
              Talaba, mentor va admin oqimlarini alohida sahifalarda sinab ko'ring. Barcha o'zgarishlar lokal holatda saqlanadi va auditga tushadi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/login')}>Kirish</Button>
            <Button variant="outline" onClick={() => navigate('/signup')}>Ro'yxatdan o'tish</Button>
            <Button variant="outline" onClick={() => handleSelectRole('Mentor')}>Mentor oynasi</Button>
            <Button variant="outline" onClick={() => handleSelectRole('Admin')}>Admin oynasi</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
