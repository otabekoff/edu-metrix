import React, { useState } from 'react';
import { useParams } from 'react-router';
import { Activity, Award, Clock, Lightbulb, Play, Shield, Sliders } from 'lucide-react';
import { useGlobalState } from '../../context/StateContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import sampleJson from '../../../useful_assets/sample.json';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { state, dispatch } = useGlobalState();
  const params = useParams();
  const currentTab = params.tab || 'matrix';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL_GROUPS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL_STATUS');
  const [apiPayloadStr, setApiPayloadStr] = useState(JSON.stringify(sampleJson, null, 2));
  const [apiConsoleResponse, setApiConsoleResponse] = useState<string>('');
  const [apiConsoleLogs, setApiConsoleLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [SYSTEM] FaceID API Core Initialized.`,
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Listening on :3000/api/attendance/upload...`
  ]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(state.students[0]?.id || '');
  const [penaltyVal, setPenaltyVal] = useState('0');
  const [recoveryVal, setRecoveryVal] = useState('0');
  const [employmentVal, setEmploymentVal] = useState('0');
  const [disciplineVal, setDisciplineVal] = useState('10');
  const [achievementPointsAward, setAchievementPointsAward] = useState('3.0');
  const [achievementComment, setAchievementComment] = useState("Nizom bo'yicha ball qo'shildi.");
  const [ideaReviewMessage, setIdeaReviewMessage] = useState("Taklif ko'rib chiqildi. Keyingi bosqich uchun mas'ul jamoaga yuborildi.");

  const uniqueGroups = Array.from(new Set(state.students.map(s => s.group)));
  const pendingAchievements = state.students.flatMap(s =>
    s.achievements.filter(a => a.status === 'Kutilmoqda').map(a => ({ ...a, studentId: s.id, studentName: s.fullName }))
  );
  const pendingIdeas = state.students.flatMap(s =>
    (s.ideas ?? []).filter(idea => idea.status === 'Kutilmoqda').map(idea => ({ ...idea, studentId: s.id, studentName: s.fullName }))
  );
  const filteredStudents = state.students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroupFilter !== 'ALL_GROUPS' ? student.group === selectedGroupFilter : true;
    const matchesStatus = selectedStatusFilter !== 'ALL_STATUS' ? student.status === selectedStatusFilter : true;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const averageAttendance = Number((state.students.reduce((sum, s) => sum + s.attendance_summary.attendance_percentage, 0) / state.students.length).toFixed(1));
  const averageGPA = Number((state.students.reduce((sum, s) => sum + s.gpa, 0) / state.students.length).toFixed(1));
  const activeGrants = state.students.filter(s => s.status === 'Grant' && !s.isGrantCancelled).length;
  const highRiskCount = state.students.filter(s => s.riskLevel === 'High').length;

  const handleRunApiImport = () => {
    const timestampStr = new Date().toLocaleTimeString();
    try {
      const parsed = JSON.parse(apiPayloadStr);
      dispatch({ type: 'IMPORT_API_DATA', payload: parsed });
      setApiConsoleLogs(prev => [...prev, `[${timestampStr}] [SUCCESS] 200 OK - Student data parsed.`]);
      setApiConsoleResponse(JSON.stringify({ status: 'success', code: 200, timestamp: new Date().toISOString() }, null, 2));
      toast.success('Simulated API Gateway completed!');
    } catch (err) {
      setApiConsoleLogs(prev => [...prev, `[${timestampStr}] [ERROR] 400 Bad Request - JSON validation failed.`]);
      setApiConsoleResponse(JSON.stringify({ status: 'error', code: 400, message: String(err) }, null, 2));
    }
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
    toast.success(`Yutuq arizasi: ${status}`);
  };

  const handleReviewIdea = (studentId: string, ideaId: string, status: 'Tasdiqlandi' | 'Joriy qilindi' | 'Rad etildi') => {
    dispatch({
      type: 'REVIEW_IDEA',
      payload: {
        studentId,
        ideaId,
        status,
        adminMessage: ideaReviewMessage
      }
    });
    toast.success(`G'oya qarori: ${status}`);
  };

  const handleSaveBonuses = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    dispatch({
      type: 'UPDATE_STUDENT_BONUSES',
      payload: {
        studentId: selectedStudentId,
        penaltyScore: parseFloat(penaltyVal),
        recoveryScore: parseFloat(recoveryVal),
        employmentScore: parseFloat(employmentVal),
        disciplineScore: parseFloat(disciplineVal)
      }
    });
    toast.success('Jarima va bonus ballar saqlandi.');
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield />
                Admin Boshqaruv Markazi
              </CardTitle>
              <CardDescription>PDP University • Administrator: ADMIN-1</CardDescription>
            </div>
            <Button variant="destructive" onClick={() => { dispatch({ type: 'RESET_STATE' }); toast.success("Ma'lumotlar boshlang'ich holatga qaytarildi!"); }}>
              Ma'lumotlarni Reset qilish
            </Button>
          </div>
        </CardHeader>
      </Card>

      {currentTab === 'matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ["O'rtacha Davomat", `${averageAttendance}%`, "Nizom o'tish chegarasi: 80%"],
              ["O'rtacha GPA", `${averageGPA}%`, "Strategik filtr chegarasi: 80%"],
              ['Faol Grantlar', `${activeGrants} talaba`, 'Grant oluvchilar'],
              ['Xavf Guruhidagilar', `${highRiskCount} talaba`, 'Akademik xavf'],
            ].map(([label, value, desc]) => (
              <Card key={label}>
                <CardHeader>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle>{value}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><Activity /> Talabalar Grant Saralash Reytingi</CardTitle>
                  <CardDescription>Grant nizomi bo'yicha real-vaqtda hisoblangan koeffitsientlar.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input className="w-64" placeholder="F.I.O yoki ID bo'yicha..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  <Select value={selectedGroupFilter} onValueChange={setSelectedGroupFilter}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_GROUPS">Barcha Guruhlar</SelectItem>
                      {uniqueGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_STATUS">Barcha Statuslar</SelectItem>
                      <SelectItem value="Grant">Grant</SelectItem>
                      <SelectItem value="Kontrakt">Kontrakt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talaba</TableHead>
                    <TableHead>Guruh</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">GPA</TableHead>
                    <TableHead className="text-right">Davomat</TableHead>
                    <TableHead className="text-right">Final Score</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.fullName}<div className="text-xs text-muted-foreground">{student.id}</div></TableCell>
                      <TableCell>{student.group}</TableCell>
                      <TableCell><Badge variant={student.status === 'Grant' ? 'default' : 'secondary'}>{student.status}</Badge></TableCell>
                      <TableCell className="text-right">{student.gpa}%</TableCell>
                      <TableCell className="text-right">{student.attendance_summary.attendance_percentage}%</TableCell>
                      <TableCell className="text-right">{student.finalScore}</TableCell>
                      <TableCell><Badge variant={student.riskLevel === 'High' ? 'destructive' : 'outline'}>{student.riskLevel}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {currentTab === 'queue' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award /> Arizalarni Tasdiqlash Navbati</CardTitle>
            <CardDescription>Talabalar tomonidan yuborilgan yutuqlar, g'oyalar va yechimlar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Taqdim etiladigan ball</Label>
                <Input type="number" step="0.5" value={achievementPointsAward} onChange={e => setAchievementPointsAward(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Admin izohi</Label>
                <Input value={achievementComment} onChange={e => setAchievementComment(e.target.value)} />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Yutuq va sertifikatlar</h3>
                <p className="text-sm text-muted-foreground">Sertifikatlar uchun ball admin tomonidan belgilanadi.</p>
              </div>
            {pendingAchievements.length === 0 ? (
              <p className="text-muted-foreground">Kutilayotgan sertifikatlar yoki yutuqlar mavjud emas.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talaba</TableHead>
                    <TableHead>Yutuq</TableHead>
                    <TableHead>Toifa</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAchievements.map(achievement => (
                    <TableRow key={achievement.id}>
                      <TableCell>{achievement.studentName}</TableCell>
                      <TableCell className="font-medium">{achievement.title}</TableCell>
                      <TableCell><Badge variant="outline">{achievement.category}</Badge></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" onClick={() => handleVerifyAchievement(achievement.studentId, achievement.id, 'Tasdiqlandi')}>Tasdiqlash</Button>
                        <Button size="sm" variant="outline" onClick={() => handleVerifyAchievement(achievement.studentId, achievement.id, 'Rad etildi')}>Rad etish</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-4" />
                <div>
                  <h3 className="font-medium">G'oya va yechimlar</h3>
                  <p className="text-sm text-muted-foreground">Tasdiqlangan g'oya +1 ball, joriy qilingan yechim +2 ball.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Talabaga yuboriladigan xabar</Label>
                <Textarea value={ideaReviewMessage} onChange={e => setIdeaReviewMessage(e.target.value)} />
              </div>
              {pendingIdeas.length === 0 ? (
                <p className="text-muted-foreground">Kutilayotgan g'oya yoki yechimlar mavjud emas.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Talaba</TableHead>
                      <TableHead>G'oya</TableHead>
                      <TableHead>Yo'nalish</TableHead>
                      <TableHead>Muammo</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingIdeas.map(idea => (
                      <TableRow key={idea.id}>
                        <TableCell>{idea.studentName}</TableCell>
                        <TableCell className="font-medium">{idea.title}</TableCell>
                        <TableCell><Badge variant="outline">{idea.area}</Badge></TableCell>
                        <TableCell className="max-w-72 text-muted-foreground">{idea.problem}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button size="sm" onClick={() => handleReviewIdea(idea.studentId, idea.id, 'Tasdiqlandi')}>Tasdiqlash (+1)</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleReviewIdea(idea.studentId, idea.id, 'Joriy qilindi')}>Joriy qilindi (+2)</Button>
                            <Button size="sm" variant="outline" onClick={() => handleReviewIdea(idea.studentId, idea.id, 'Rad etildi')}>Rad etish</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {currentTab === 'modifiers' && (
        <Card>
          <form onSubmit={handleSaveBonuses} className="contents">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sliders /> Jarima va Bonus Ballarini Kiritish</CardTitle>
              <CardDescription>Talabani tanlang va reytingga ta'sir qiluvchi ballarni yangilang.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Talaba</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {state.students.map(student => <SelectItem key={student.id} value={student.id}>{student.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jarima balli</Label>
                <Input type="number" value={penaltyVal} onChange={e => setPenaltyVal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Qoplash balli</Label>
                <Input type="number" value={recoveryVal} onChange={e => setRecoveryVal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bandlik balli</Label>
                <Input type="number" value={employmentVal} onChange={e => setEmploymentVal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Intizom balli</Label>
                <Input type="number" value={disciplineVal} onChange={e => setDisciplineVal(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Saqlash</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {currentTab === 'faceid' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>FaceID API Developer Shell</CardTitle>
              <CardDescription>POST /api/attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Request Payload</Label>
                  <Textarea className="min-h-80 font-mono" value={apiPayloadStr} onChange={e => setApiPayloadStr(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>HTTP Response</Label>
                  <pre className="min-h-80 overflow-auto rounded-md border bg-muted p-3 text-sm">{apiConsoleResponse || 'Response JSON stream will load here after execution.'}</pre>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRunApiImport}><Play /> API So'rovni Yuborish</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock /> Gateway Logs</CardTitle>
              <CardDescription>Router ulanishlari va tizim tekshiruvlari.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {apiConsoleLogs.map((log, index) => (
                <pre key={index} className="rounded-md border bg-muted p-2 text-xs whitespace-pre-wrap">{log}</pre>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Global Harakatlar Audit Xronologiyasi</CardTitle>
              <CardDescription>Platformadagi har bir harakat yozib boriladi.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rol</TableHead>
                    <TableHead>Harakat</TableHead>
                    <TableHead>Izoh</TableHead>
                    <TableHead className="text-right">Vaqt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.auditLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell><Badge variant="outline">{log.userRole}</Badge></TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell className="text-right">{new Date(log.timestamp).toLocaleString('uz-UZ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
