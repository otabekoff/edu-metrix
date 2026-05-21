import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { BookOpen, GraduationCap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useGlobalState, type UserRole } from '@/context/StateContext';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup' | 'reset';

export function AuthPage() {
  const { dispatch } = useGlobalState();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mode: AuthMode = useMemo(() => {
    if (location.pathname.includes('signup')) return 'signup';
    if (location.pathname.includes('reset-password')) return 'reset';
    return 'login';
  }, [location.pathname]);

  const copy = {
    login: {
      title: 'Tizimga kirish',
      description: 'Hisobingiz bilan davom eting yoki demo rol orqali tez kiring.',
      submit: 'Kirish',
    },
    signup: {
      title: "Ro'yxatdan o'tish",
      description: 'Demo muhit uchun yangi hisob formasini koʼring.',
      submit: "Ro'yxatdan o'tish",
    },
    reset: {
      title: 'Parolni tiklash',
      description: 'Email manzilingizni kiriting, tiklash yoʼriqnomasi yuboriladi.',
      submit: 'Tiklash havolasini yuborish',
    },
  }[mode];

  const loginAs = (role: UserRole) => {
    dispatch({ type: 'SWITCH_ROLE', payload: role });
    if (role === 'Student') navigate('/student/overview');
    if (role === 'Mentor') navigate('/mentor/journal');
    if (role === 'Admin') navigate('/admin/matrix');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'reset') {
      toast.success('Parolni tiklash havolasi yuborildi.');
      return;
    }
    toast.success('Demo hisob uchun tezkor rol tugmalaridan foydalaning.');
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <Card className="w-full">
          <form onSubmit={handleSubmit} className="contents">
            <CardHeader>
              <CardTitle>{copy.title}</CardTitle>
              <CardDescription>{copy.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="name@pdp.uz"
                />
              </div>
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Parol</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              )}
              <Button type="submit" className="w-full">{copy.submit}</Button>

              {mode === 'login' && (
                <>
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-sm text-muted-foreground">Demo kirish</span>
                    <Separator className="flex-1" />
                  </div>
                  <div className="grid gap-2">
                    <Button type="button" variant="outline" onClick={() => loginAs('Admin')}>
                      <Shield />
                      Admin sifatida kirish
                    </Button>
                    <Button type="button" variant="outline" onClick={() => loginAs('Mentor')}>
                      <BookOpen />
                      Mentor sifatida kirish
                    </Button>
                    <Button type="button" variant="outline" onClick={() => loginAs('Student')}>
                      <GraduationCap />
                      Talaba sifatida kirish
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between gap-3 text-sm">
              {mode !== 'login' ? (
                <Link className="text-muted-foreground hover:text-foreground" to="/login">
                  Kirish sahifasiga qaytish
                </Link>
              ) : (
                <>
                  <Link className="text-muted-foreground hover:text-foreground" to="/signup">
                    Hisob yaratish
                  </Link>
                  <Link className="text-muted-foreground hover:text-foreground" to="/reset-password">
                    Parolni unutdingizmi?
                  </Link>
                </>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
