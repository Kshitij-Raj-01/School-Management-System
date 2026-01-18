import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getAttendanceHistory } from "@/store/slices/attendanceSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BarChart3, AlertCircle } from "lucide-react";

const AttendanceReportPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { history, loading } = useSelector((state: RootState) => state.attendance);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    dispatch(getAttendanceHistory());
  }, [dispatch]);

  // Filter history by date
  const dailyRecords = history.filter(h => h.date === selectedDate);

  // Calculate Stats
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalStudents = 0;

  dailyRecords.forEach(record => {
    record.records.forEach(student => {
      totalStudents++;
      if (student.status === "Present") totalPresent++;
      else totalAbsent++;
    });
  });

  const attendancePercentage = totalStudents === 0 ? 0 : Math.round((totalPresent / totalStudents) * 100);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Attendance Report</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Date:</span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-600 font-medium">Total Students</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-700">{totalStudents}</div></CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-green-600 font-medium">Present Today</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-700">{totalPresent}</div></CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-red-600 font-medium">Absent Today</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-red-700">{totalAbsent}</div></CardContent>
        </Card>
      </div>

      {/* Class-wise Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5"/> Class Performance</CardTitle></CardHeader>
          <CardContent>
            {dailyRecords.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No attendance records found for this date.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Class</TableHead><TableHead>Present</TableHead><TableHead>Absent</TableHead><TableHead>Percentage</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {dailyRecords.map((record) => {
                    const present = record.records.filter(r => r.status === "Present").length;
                    const total = record.records.length;
                    const percent = Math.round((present / total) * 100);
                    return (
                      <TableRow key={record._id}>
                        <TableCell className="font-bold">{record.classname}</TableCell>
                        <TableCell className="text-green-600">{present}</TableCell>
                        <TableCell className="text-red-600">{total - present}</TableCell>
                        <TableCell>
                          <Badge variant={percent > 75 ? "default" : "destructive"}>{percent}%</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Absentees List */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><AlertCircle className="w-5 h-5"/> Absent Students</CardTitle></CardHeader>
          <CardContent>
            {totalAbsent === 0 ? (
              <div className="text-center py-8 text-green-600 font-medium">No students are absent today! 🎉</div>
            ) : (
              <div className="max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Roll No</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyRecords.flatMap(record => 
                      record.records.filter(r => r.status === "Absent").map(student => (
                        <TableRow key={student.studentId}>
                          <TableCell className="font-medium">{student.studentName}</TableCell>
                          <TableCell>{record.classname}</TableCell>
                          <TableCell>{student.roll_no}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceReportPage;