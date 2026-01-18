import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getTimetable } from "@/store/slices/timetableSlice";
import { listStudents } from "@/store/slices/studentSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarClock } from "lucide-react";

const StudentTimetablePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { schedule } = useSelector((state: RootState) => state.timetable);
  const { students } = useSelector((state: RootState) => state.student);

  useEffect(() => {
    dispatch(getTimetable());
    if (students.length === 0) dispatch(listStudents());
  }, [dispatch]);

  // Find my class
  const myProfile = students.find(s => s.email === userInfo?.email);
  const myClass = myProfile?.classname;

  // Filter schedule
  const mySchedule = schedule.filter(s => s.classname === myClass);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Class Schedule</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5"/> Class {myClass} Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Day</TableHead><TableHead>Time</TableHead><TableHead>Subject</TableHead><TableHead>Teacher</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {mySchedule.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No classes scheduled yet.</TableCell></TableRow> :
                mySchedule.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{entry.day}</TableCell>
                    <TableCell>{entry.startTime}</TableCell>
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
  );
};

export default StudentTimetablePage;