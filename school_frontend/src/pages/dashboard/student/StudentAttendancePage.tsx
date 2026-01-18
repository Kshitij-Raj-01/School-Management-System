import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getAttendanceHistory } from "@/store/slices/attendanceSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, CalendarDays, PieChart, ArrowLeft } from "lucide-react";

const StudentAttendancePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { history } = useSelector((state: RootState) => state.attendance);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAttendanceHistory());
  }, [dispatch]);

  // --- 1. Process Data ---
  const subjectStats: Record<string, { present: number, total: number }> = {};
  const detailedRecords: { date: string, subject: string, status: string }[] = [];

  history.forEach((record) => {
    const myRecord = record.records.find(r => r.studentId === userInfo?._id);
    
    if (myRecord) {
      const subject = record.subject || "General";
      
      // Update Subject Stats
      if (!subjectStats[subject]) subjectStats[subject] = { present: 0, total: 0 };
      subjectStats[subject].total++;
      if (myRecord.status === "Present") {
        subjectStats[subject].present++;
      }

      // Add to Detailed Log
      detailedRecords.push({
        date: record.date,
        subject: subject,
        status: myRecord.status
      });
    }
  });

  // Calculate Overall Stats
  const totalClasses = Object.values(subjectStats).reduce((acc, curr) => acc + curr.total, 0);
  const totalPresent = Object.values(subjectStats).reduce((acc, curr) => acc + curr.present, 0);
  const overallPercentage = totalClasses === 0 ? 100 : Math.round((totalPresent / totalClasses) * 100);

  // Filter Details based on selection
  const filteredRecords = selectedSubject 
    ? detailedRecords.filter(r => r.subject === selectedSubject)
    : detailedRecords;

  // Sort by date (newest first)
  filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {selectedSubject ? `${selectedSubject} Attendance` : "My Attendance Overview"}
        </h1>
        {selectedSubject && (
          <Button variant="outline" onClick={() => setSelectedSubject(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Overview
          </Button>
        )}
      </div>

      {/* --- Section 1: Overall Summary (Only show on main view) --- */}
      {!selectedSubject && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary">
              <PieChart className="w-5 h-5" /> Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold text-primary">{overallPercentage}%</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Present: {totalPresent} / {totalClasses}
                </p>
              </div>
              <div className="hidden md:block w-1/3">
                <Progress value={overallPercentage} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- Section 2: Subject Cards (Clickable) --- */}
      {!selectedSubject && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(subjectStats).map(([subject, stats]) => {
            const percentage = Math.round((stats.present / stats.total) * 100);
            return (
              <Card 
                key={subject} 
                className="shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                onClick={() => setSelectedSubject(subject)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center text-lg">
                    <span>{subject}</span>
                    <Badge variant={percentage >= 75 ? "default" : "destructive"}>
                      {percentage}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={percentage} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground flex justify-between">
                    <span>Present: {stats.present}</span>
                    <span>Total: {stats.total}</span>
                  </p>
                  <p className="text-xs text-primary font-semibold mt-3 text-right">View Details &rarr;</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* --- Section 3: Detailed History Table (Shows when a subject is clicked) --- */}
      {selectedSubject && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-gray-600"/> 
              {selectedSubject} History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No records found.</div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {new Date(record.date).toLocaleDateString(undefined, { 
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                        </TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {record.status === "Present" 
                              ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                              : <XCircle className="w-4 h-4 text-red-600" />
                            }
                            <span className={record.status === "Present" ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                              {record.status}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentAttendancePage;