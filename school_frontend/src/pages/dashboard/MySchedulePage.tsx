import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getTimetable } from "@/store/slices/timetableSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

const MySchedulePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { schedule, loading } = useSelector((state: RootState) => state.timetable);

  useEffect(() => {
    dispatch(getTimetable());
  }, [dispatch]);

  const mySchedule = schedule.filter(s => s.teacherId === userInfo?._id);

  // Sort logic could go here (Monday first, etc.)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Weekly Schedule</h1>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5"/> Timetable</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Day</TableHead><TableHead>Time</TableHead><TableHead>Class</TableHead><TableHead>Subject</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {mySchedule.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No classes assigned.</TableCell></TableRow> :
                mySchedule.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{entry.day}</TableCell>
                    <TableCell>{entry.startTime}</TableCell>
                    <TableCell>{entry.classname}</TableCell>
                    <TableCell>{entry.subject}</TableCell>
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

export default MySchedulePage;