import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useGlobalState } from '../../context/StateContext';
import { Award, Bell, CheckCircle2, Lightbulb, Lock, MessageSquare, Send, Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface StudentDashboardProps {
  activeSubTab?: 'overview' | 'courses' | 'achievements' | 'scholarship' | 'feedback' | 'settings';
  setActiveSubTab?: (tab: 'overview' | 'courses' | 'achievements' | 'scholarship' | 'feedback' | 'settings') => void;
}

export function StudentDashboard({ activeSubTab }: StudentDashboardProps) {
  const { state, dispatch } = useGlobalState();
  const { tab } = useParams();
  const currentTab = tab || activeSubTab || 'overview';
  const student = state.students.find(s => s.id === state.activeStudentId);

  const [achTitle, setAchTitle] = useState('');
  const [achCategory, setAchCategory] = useState<'Startup' | 'International IT' | 'National IT' | 'Mentorlik' | 'Online Kurs' | 'Offline Kurs' | 'Volontyorlik' | 'Soft Skills' | 'Networking' | 'Boshqa'>('International IT');
  const [achDesc, setAchDesc] = useState('');
  const [achLink, setAchLink] = useState('');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaArea, setIdeaArea] = useState<'Campus' | 'Academic' | 'Technology' | 'Community' | 'Process' | 'Other'>('Campus');
  const [ideaProblem, setIdeaProblem] = useState('');
  const [ideaSolution, setIdeaSolution] = useState('');
  const [ideaImpact, setIdeaImpact] = useState('');

  if (!student) {
    return <p className="text-muted-foreground">Talaba topilmadi. Bosh sahifaga qaytib rolni qayta tanlang.</p>;
  }

  const sortedStudents = [...state.students].sort((a, b) => b.finalScore - a.finalScore);
  const ratingRank = sortedStudents.findIndex(s => s.id === student.id) + 1;
  const rankPercentile = sortedStudents.length > 1
    ? Math.round(((sortedStudents.length - ratingRank) / (sortedStudents.length - 1)) * 100)
    : 100;

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

  const handleSubmitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaProblem.trim() || !ideaSolution.trim()) return;

    dispatch({
      type: 'SUBMIT_IDEA',
      payload: {
        studentId: student.id,
        idea: {
          title: ideaTitle,
          area: ideaArea,
          problem: ideaProblem,
          solution: ideaSolution,
          impact: ideaImpact || undefined
        }
      }
    });

    setIdeaTitle('');
    setIdeaProblem('');
    setIdeaSolution('');
    setIdeaImpact('');
    toast.success("G'oya yuborildi! Tasdiqlansa +1, joriy qilinsa +2 ball qo'shiladi.");
  };

  const handleGenerateToken = () => {
    const randomToken = `PDP-${Math.floor(100 + Math.random() * 900)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    dispatch({ type: 'TOGGLE_TELEGRAM', payload: { studentId: student.id, sync: true, token: randomToken } });
  };

  const totalAchievements = student.achievements.length;
  const approvedAchievementsPoints = student.achievements
    .filter(a => a.status === 'Tasdiqlandi')
    .reduce((sum, a) => sum + (a.pointsAwarded || 0), 0);

  const totalIdeas = (student.ideas ?? []).length;
  const approvedIdeasPoints = (student.ideas ?? [])
    .filter(i => i.status === 'Tasdiqlandi' || i.status === 'Joriy qilindi')
    .reduce((sum, i) => sum + (i.pointsAwarded || 0), 0);

  const totalPoints = approvedAchievementsPoints + approvedIdeasPoints;

  const pendingCount = student.achievements.filter(a => a.status === 'Kutilmoqda').length +
    (student.ideas ?? []).filter(i => i.status === 'Kutilmoqda').length;

  const scoreRows = [
    ['Akademik Natija (GPA)', student.academicScore, 40],
    ['Davomat Bahosi', student.attendanceScore, 20],
    ['Amaliy Vazifalar', student.assignmentScore, 15],
    ['Faollik & Sertifikatlar', student.activityScore, 10],
    ['Tyutor Bahosi', student.tutorScore, 5],
    ['Intizom Bahosi', student.disciplineScore, 10],
  ];

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={student.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120"} />
                <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  {student.fullName}
                  <Badge variant={student.status === 'Grant' ? 'default' : 'secondary'}>{student.status}</Badge>
                </CardTitle>
                <CardDescription>Guruh: {student.group} | ID: {student.id}</CardDescription>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Trophy className="size-3.5" />
                      Leaderboard
                    </div>
                    <div className="text-lg font-semibold">#{ratingRank}-o'rin</div>
                  </div>
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <div className="text-xs text-muted-foreground">Yakuniy reyting</div>
                    <div className="text-lg font-semibold">{student.finalScore} / 110</div>
                  </div>
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <div className="text-xs text-muted-foreground">Top ko'rsatkich</div>
                    <div className="text-lg font-semibold">{rankPercentile}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">GPA</div>
                <div className="text-2xl font-semibold">{student.gpa}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Davomat</div>
                <div className="text-2xl font-semibold">{student.attendance_summary.attendance_percentage}%</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {currentTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardDescription>O'rtacha GPA ko'rsatkichi</CardDescription>
                  <CardTitle>{student.gpa}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={student.gpa} />
                  <p className="mt-2 text-sm text-muted-foreground">Nazorat ishlari baholari: {student.academicScore} / 40.0 ball</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Semestr davomati</CardDescription>
                  <CardTitle>{student.attendance_summary.attendance_percentage}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={student.attendance_summary.attendance_percentage} />
                  <p className="mt-2 text-sm text-muted-foreground">Dars intizom balli: {student.attendanceScore} / 20.0 ball</p>
                </CardContent>
              </Card>
            </div>

            <Alert variant={student.isGrantCancelled ? 'destructive' : 'default'}>
              <CheckCircle2 />
              <AlertTitle>Grant Saqlab Qolish Monitoringi</AlertTitle>
              <AlertDescription>
                {student.isGrantCancelled
                  ? "GPA yoki davomat minimal talabdan past. Grant nizomi bo'yicha xavf mavjud."
                  : "Ko'rsatkichlaringiz grantni saqlab qolish uchun yetarli darajada."}
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Aktiv Fanlaringiz Ro'yxati</CardTitle>
                <CardDescription>Joriy semestrdagi fanlar va davomat mezonlari.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fan</TableHead>
                      <TableHead>Mentor</TableHead>
                      <TableHead className="text-right">Davomat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.subjects.map(subject => (
                      <TableRow key={subject.subject_id}>
                        <TableCell className="font-medium">{subject.subject_name}</TableCell>
                        <TableCell>{subject.teacher}</TableCell>
                        <TableCell className="text-right">{subject.subject_summary.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reyting Ballari Detallari</CardTitle>
              <CardDescription>Yakuniy hisoblash koeffitsientlari.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scoreRows.map(([label, value, max]) => (
                <div key={label as string} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span>{value} / {max} ball</span>
                  </div>
                  <Progress value={Number(value) / Number(max) * 100} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {currentTab === 'courses' && (
        <Card>
          <CardHeader>
            <CardTitle>Fanlar va Amaliy Topshiriqlar</CardTitle>
            <CardDescription>Davomat va topshiriqlar monitoringi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {student.subjects.map(subject => (
              <Card key={subject.subject_id}>
                <CardHeader>
                  <CardTitle>{subject.subject_name}</CardTitle>
                  <CardDescription>Mentor: {subject.teacher} | Davomat: {subject.subject_summary.percentage}%</CardDescription>
                </CardHeader>
              </Card>
            ))}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topshiriq</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Ball</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.assignments.map(assignment => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell><Badge variant="outline">{assignment.status}</Badge></TableCell>
                    <TableCell>{assignment.deadline}</TableCell>
                    <TableCell className="text-right">{assignment.score ?? 0} / 15</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {currentTab === 'achievements' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Yutuqlar</CardTitle>
                <Award className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAchievements} ta</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">G'oyalar</CardTitle>
                <Lightbulb className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalIdeas} ta</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Qo'shimcha Ballar</CardTitle>
                <Trophy className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{totalPoints} ball</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Kutilmoqda</CardTitle>
                <Bell className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount} ta</div>
              </CardContent>
            </Card>
          </div>

          {/* Sub Tabs Container */}
          <Tabs defaultValue="achievements" className="w-full space-y-6">
            <TabsList className="grid w-full max-w-100 grid-cols-2">
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="size-4" />
                Sertifikatlar va Yutuqlar
              </TabsTrigger>
              <TabsTrigger value="ideas" className="flex items-center gap-2">
                <Lightbulb className="size-4" />
                G'oyalar va Takliflar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="space-y-6 focus-visible:outline-none animate-in fade-in duration-300">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <Card>
                    <form onSubmit={handleUploadAchievement} className="contents">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award /> Yangi Yutuq Arizasi</CardTitle>
                        <CardDescription>Sertifikat yoki yutuq ma'lumotlarini yuboring.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nomi</Label>
                          <Input value={achTitle} onChange={e => setAchTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Toifa</Label>
                          <Select value={achCategory} onValueChange={(value: typeof achCategory) => setAchCategory(value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['Startup', 'International IT', 'National IT', 'Mentorlik', 'Online Kurs', 'Offline Kurs', 'Volontyorlik', 'Soft Skills', 'Networking', 'Boshqa'].map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Tavsif</Label>
                          <Textarea value={achDesc} onChange={e => setAchDesc(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Havola</Label>
                          <Input value={achLink} onChange={e => setAchLink(e.target.value)} />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" className="w-full"><Send /> Yuborish</Button>
                      </CardFooter>
                    </form>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Yutuqlar va Sertifikatlar</CardTitle>
                      <CardDescription>Yuborilgan arizalar va ularning holati.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nomi</TableHead>
                            <TableHead>Toifa</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ball</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {student.achievements.map(achievement => (
                            <TableRow key={achievement.id}>
                              <TableCell className="font-medium">{achievement.title}</TableCell>
                              <TableCell>{achievement.category}</TableCell>
                              <TableCell>
                                <Badge variant={achievement.status === 'Tasdiqlandi' ? 'default' : achievement.status === 'Rad etildi' ? 'destructive' : 'secondary'}>
                                  {achievement.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">{achievement.pointsAwarded}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ideas" className="space-y-6 focus-visible:outline-none animate-in fade-in duration-300">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <Card>
                    <form onSubmit={handleSubmitIdea} className="contents">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lightbulb /> G'oya yoki Yechim Taklifi</CardTitle>
                        <CardDescription>Tasdiqlangan g'oya +1 ball, joriy qilingan yechim +2 ball.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nomi</Label>
                          <Input value={ideaTitle} onChange={e => setIdeaTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Yo'nalish</Label>
                          <Select value={ideaArea} onValueChange={(value: typeof ideaArea) => setIdeaArea(value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['Campus', 'Academic', 'Technology', 'Community', 'Process', 'Other'].map(area => (
                                <SelectItem key={area} value={area}>{area}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Muammo</Label>
                          <Textarea value={ideaProblem} onChange={e => setIdeaProblem(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Yechim</Label>
                          <Textarea value={ideaSolution} onChange={e => setIdeaSolution(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Kutilayotgan ta'sir</Label>
                          <Textarea value={ideaImpact} onChange={e => setIdeaImpact(e.target.value)} />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" className="w-full"><Send /> G'oyani yuborish</Button>
                      </CardFooter>
                    </form>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>G'oyalar va Yechimlar</CardTitle>
                      <CardDescription>Universitet hayotini yaxshilash bo'yicha takliflaringiz.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(student.ideas ?? []).length === 0 ? (
                        <p className="text-muted-foreground">Hali g'oya yuborilmagan.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nomi</TableHead>
                              <TableHead>Yo'nalish</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Admin xabari</TableHead>
                              <TableHead className="text-right">Ball</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(student.ideas ?? []).map(idea => (
                              <TableRow key={idea.id}>
                                <TableCell className="font-medium">{idea.title}</TableCell>
                                <TableCell>{idea.area}</TableCell>
                                <TableCell>
                                  <Badge variant={idea.status === 'Tasdiqlandi' || idea.status === 'Joriy qilindi' ? 'default' : idea.status === 'Rad etildi' ? 'destructive' : 'secondary'}>
                                    {idea.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-64 text-muted-foreground">{idea.adminMessage || '-'}</TableCell>
                                <TableCell className="text-right">{idea.pointsAwarded}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {currentTab === 'scholarship' && (
        <Card>
          <CardHeader>
            <CardTitle>Guruhlararo Grant Reytingi Jurnali</CardTitle>
            <CardDescription>Global grant saralash reytingi.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Talaba</TableHead>
                  <TableHead>Guruh</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Final Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.fullName}</TableCell>
                    <TableCell>{item.group}</TableCell>
                    <TableCell><Badge variant={item.riskLevel === 'High' ? 'destructive' : 'outline'}>{item.riskLevel}</Badge></TableCell>
                    <TableCell className="text-right">{item.finalScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {currentTab === 'feedback' && (
        <Card>
          <CardHeader>
            <CardTitle>Mentor va Tyutor Feedbacklari</CardTitle>
            <CardDescription>Shaxsiy xarakteristikalar va maslahatlar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.feedback.length === 0 ? (
              <p className="text-muted-foreground">Feedback mavjud emas.</p>
            ) : student.feedback.map(feedback => (
              <Card key={feedback.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare />
                    {feedback.type}
                  </CardTitle>
                  <CardDescription>{feedback.mentorName} • {feedback.subjectName} • {feedback.date}</CardDescription>
                </CardHeader>
                <CardContent>{feedback.content}</CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {currentTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock /> Ikki bosqichli himoya</CardTitle>
              <CardDescription>Profilingizni ruxsatsiz kirishdan saqlang.</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={student.twoFactorEnabled ? 'default' : 'secondary'}>{student.twoFactorEnabled ? 'Yoqilgan' : "O'chirilgan"}</Badge>
            </CardContent>
            <CardFooter>
              <Button onClick={() => dispatch({ type: 'TOGGLE_2FA', payload: { studentId: student.id } })}>
                {student.twoFactorEnabled ? "O'chirish" : 'Yoqish'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell /> Telegram Bildirishnomalari</CardTitle>
              <CardDescription>Reyting va baholar o'zgarganda bot orqali bildirishnoma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={student.telegramSync ? 'default' : 'secondary'}>{student.telegramSync ? 'Ulangan' : 'Ulanmagan'}</Badge>
              {student.telegramToken && <Input readOnly value={student.telegramToken} />}
            </CardContent>
            <CardFooter className="gap-2">
              <Button onClick={handleGenerateToken}>Token yaratish</Button>
              <Button variant="outline" onClick={() => dispatch({ type: 'TOGGLE_TELEGRAM', payload: { studentId: student.id, sync: false } })}>
                Uzish
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
