import React, { useState } from 'react';
import { useParams } from 'react-router';
import { BookOpen, Calendar as CalendarIcon, MessageSquare, Save, Send } from 'lucide-react';
import { useGlobalState } from '../../context/StateContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

export function MentorDashboard() {
  const { state, dispatch } = useGlobalState();
  const params = useParams();
  const currentTab = params.tab || 'journal';

  const [selectedGroup, setSelectedGroup] = useState<string>('IF-22-04');
  const [selectedSubject, setSelectedSubject] = useState<string>('SUB-101');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]!);
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState<string>('14');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [broadcastStudentId, setBroadcastStudentId] = useState<string>('');
  const [broadcastType, setBroadcastType] = useState<'Academic' | 'Leadership' | 'Soft Skills' | 'Corporate'>('Academic');
  const [broadcastText, setBroadcastText] = useState<string>('');

  const uniqueGroups = Array.from(new Set(state.students.map(s => s.group)));
  const groupStudents = state.students.filter(s => s.group === selectedGroup);
  const selectedStudent = state.students.find(s => s.id === gradingStudentId);
  const activeAssignment = selectedStudent?.assignments[0];
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSubjectName = (subId: string) => {
    if (subId === 'SUB-101') return "Ma'lumotlar strukturasi va algoritmlar";
    return "Ma'lumotlar bazasi tizimlari";
  };

  const handleToggleAttendance = (studentId: string, currentStatus: 'attended' | 'absent') => {
    dispatch({
      type: 'MARK_ATTENDANCE',
      payload: {
        studentId,
        subjectId: selectedSubject,
        date: selectedDate,
        status: currentStatus === 'attended' ? 'absent' : 'attended',
        reason: currentStatus === 'attended' ? 'Sababsiz (Mentor tomonidan)' : null
      }
    });
  };

  const handleOpenGrader = (studentId: string) => {
    const student = state.students.find(s => s.id === studentId);
    const assignment = student?.assignments[0];
    setGradingStudentId(studentId);
    setGradeValue(assignment?.score?.toString() || '14');
    setFeedbackText(assignment?.feedback || '');
  };

  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingStudentId || !activeAssignment) return;

    dispatch({
      type: 'GRADE_ASSIGNMENT',
      payload: {
        studentId: gradingStudentId,
        assignmentId: activeAssignment.id,
        score: parseFloat(gradeValue),
        feedback: feedbackText
      }
    });
    setGradingStudentId(null);
    toast.success("Baho va fikr muvaffaqiyatli kiritildi!");
  };

  const handleBroadcastFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastStudentId || !broadcastText.trim()) return;

    dispatch({
      type: 'ADD_FEEDBACK',
      payload: {
        studentId: broadcastStudentId,
        feedback: {
          mentorName: "D. Eshmuradov",
          subjectName: getSubjectName(selectedSubject),
          type: broadcastType,
          content: broadcastText
        }
      }
    });
    setBroadcastText('');
    toast.success("Feedback talabaga yuborildi!");
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen />
                Mentor Ish Stoli
              </CardTitle>
              <CardDescription>O'qituvchi: D. Eshmuradov | Davomat va topshiriqlar boshqaruvi</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="space-y-2">
                <Label>Guruh</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {uniqueGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fan</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUB-101">Ma'lumotlar strukturasi & algoritmlar</SelectItem>
                    <SelectItem value="SUB-102">Ma'lumotlar bazasi tizimlari</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {currentTab === 'journal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon />
                    Davomat Jurnali
                  </CardTitle>
                  <CardDescription>Sanani tanlang va davomat holatini o'zgartiring.</CardDescription>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-48 justify-start">
                      <CalendarIcon />
                      {selectedDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined}
                      onSelect={(date) => {
                        if (date) setSelectedDate(formatLocalDate(date));
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talaba</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupStudents.map(student => {
                    const subject = student.subjects.find(s => s.subject_id === selectedSubject);
                    const log = subject?.logs.find(l => l.date === selectedDate);
                    const status = log?.status || 'absent';
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.fullName}</TableCell>
                        <TableCell><Badge variant={status === 'attended' ? 'default' : 'secondary'}>{status === 'attended' ? 'Keldi' : 'Kelmadi'}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleToggleAttendance(student.id, status)}>Davomat</Button>
                          <Button size="sm" onClick={() => handleOpenGrader(student.id)}>Baholash</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <form onSubmit={handleSubmitGrade} className="contents">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Save /> Topshiriq Baholash</CardTitle>
                <CardDescription>{selectedStudent ? selectedStudent.fullName : 'Baholash uchun talabani tanlang.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Ball</Label>
                  <Input type="number" step="0.5" value={gradeValue} onChange={e => setGradeValue(e.target.value)} disabled={!gradingStudentId} />
                </div>
                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <Textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} disabled={!gradingStudentId} />
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button type="submit" disabled={!gradingStudentId}>Saqlash</Button>
                <Button type="button" variant="outline" onClick={() => setGradingStudentId(null)}>Bekor qilish</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {currentTab === 'feedback' && (
        <Card>
          <form onSubmit={handleBroadcastFeedback} className="contents">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare /> Feedback Broadcast</CardTitle>
              <CardDescription>Talabaga shaxsiy feedback yuborish.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Talaba</Label>
                <Select value={broadcastStudentId} onValueChange={setBroadcastStudentId}>
                  <SelectTrigger><SelectValue placeholder="Talabani tanlang" /></SelectTrigger>
                  <SelectContent>
                    {state.students.map(student => <SelectItem key={student.id} value={student.id}>{student.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Toifa</Label>
                <Select value={broadcastType} onValueChange={(value: typeof broadcastType) => setBroadcastType(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Academic', 'Leadership', 'Soft Skills', 'Corporate'].map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Xabar</Label>
                <Textarea value={broadcastText} onChange={e => setBroadcastText(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit"><Send /> Yuborish</Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
