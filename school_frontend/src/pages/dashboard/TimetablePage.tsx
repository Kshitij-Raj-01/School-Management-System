import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { listTeachers } from "@/store/slices/teacherSlice";
import { createTimetableEntry, getTimetable, resetTimetable } from "@/store/slices/timetableSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarClock, Plus } from "lucide-react";

const TimetablePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { teachers } = useSelector((state: RootState) => state.teacher);
  const { schedule, success } = useSelector((state: RootState) => state.timetable);

  const [classname, setClassname] = useState("");
  const [subject, setSubject] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("09:00");

  // Get subjects for selected teacher
  const selectedTeacher = teachers.find(t => t._id === teacherId);
  const teacherSubjects = selectedTeacher?.subjectsToTeach || [];

  useEffect(() => {
    dispatch(listTeachers());
    dispatch(getTimetable());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Class Assigned Successfully!");
      dispatch(resetTimetable());
    }
  }, [success, dispatch]);

  const handleAssign = () => {
    if (!classname || !subject || !teacherId) return toast.error("Please fill all fields");
    
    const teacher = teachers.find(t => t._id === teacherId);
    
    dispatch(createTimetableEntry({
      classname,
      subject,
      teacherId,
      teacherName: teacher?.teacher_name || "Unknown",
      day,
      startTime,
      endTime: "10:00" // Default 1 hour duration for demo
    }));
  };

  const handleTeacherChange = (value: string) => {
    setTeacherId(value);
    setSubject(""); // Reset subject when teacher changes
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Timetable Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assignment Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader><CardTitle>Assign Class</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select onValueChange={setClassname}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>
                  {["One", "Two", "Three", "Four", "Five", "Six", "Seven"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select onValueChange={handleTeacherChange}>
                <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t => <SelectItem key={t._id} value={t._id!}>{t.teacher_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select onValueChange={setSubject} disabled={!teacherId}>
                <SelectTrigger><SelectValue placeholder={teacherId ? "Select Subject" : "Select Teacher First"} /></SelectTrigger>
                <SelectContent>
                  {teacherSubjects.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Day</Label>
              <Select onValueChange={setDay} defaultValue="Monday">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>

            <Button onClick={handleAssign} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Assign Class
            </Button>
          </CardContent>
        </Card>

        {/* Schedule View */}
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="w-5 h-5"/> Current Schedule</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Day</TableHead><TableHead>Time</TableHead><TableHead>Class</TableHead><TableHead>Subject</TableHead><TableHead>Teacher</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {schedule.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center">No classes scheduled.</TableCell></TableRow> :
                  schedule.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{entry.day}</TableCell>
                      <TableCell>{entry.startTime}</TableCell>
                      <TableCell>{entry.classname}</TableCell>
                      <TableCell>{entry.subject}</TableCell>
                      <TableCell>{entry.teacherName}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimetablePage;