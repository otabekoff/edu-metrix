import React from 'react';
import type { UserRole } from '../../context/StateContext';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Shield,
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
    ['1,240+', 'Talabalar'],
    ['94.8%', "O'rtacha davomat"],
    ['45+', 'Mentorlar'],
    ['87.5%', 'Bandlik'],
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
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:py-16">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="PDP University" className="size-10 rounded-md object-contain" />
            <div>
              <div className="font-semibold">Edumetric</div>
              <div className="text-sm text-muted-foreground">PDP University grant monitoring</div>
            </div>
          </div>

          <div className="space-y-5">
            <Badge variant="outline">Grant Nizomi • FaceID • Mentor feedback</Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                Grant reytingini bir joyda boshqaring.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Edumetric talaba reytingi, davomat, baholash, sertifikat tasdiqlash va audit jarayonlarini shadcn uslubidagi yagona ish paneliga jamlaydi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => handleSelectRole('Student')}>
              Demo kabinetga kirish
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}>
              Rollarni ko'rish
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map(([value, label]) => (
              <Card key={label}>
                <CardHeader className="p-4">
                  <CardTitle className="text-xl">{value}</CardTitle>
                  <CardDescription>{label}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity />
              Jonli grant matrixi
            </CardTitle>
            <CardDescription>Admin ko'radigan qisqa reyting namunasi.</CardDescription>
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
                    <TableCell className="text-right">{score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
            <Button variant="outline" onClick={() => handleSelectRole('Mentor')}>Mentor oqimi</Button>
            <Button variant="outline" onClick={() => handleSelectRole('Admin')}>Admin oqimi</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
