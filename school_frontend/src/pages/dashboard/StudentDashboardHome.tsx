import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getAttendanceHistory } from "@/store/slices/attendanceSlice";
import { getFeeHistory } from "@/store/slices/feeSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, CheckCircle2, XCircle, Clock, Calendar, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentDashboardHome = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { history: attendanceHistory } = useSelector((state: RootState) => state.attendance);
  const { history: feeHistory } = useSelector((state: RootState) => state.fees);

  useEffect(() => {
    dispatch(getAttendanceHistory());
    dispatch(getFeeHistory());
  }, [dispatch]);

  // --- Calculate My Stats ---
  // 1. Attendance
  let presentClasses = 0;
  let totalClasses = 0;
  
  attendanceHistory.forEach(record => {
    const myRecord = record.records.find(r => r.studentId === userInfo?._id);
    if (myRecord) {
      totalClasses++;
      if (myRecord.status === "Present") presentClasses++;
    }
  });
  
  const attendancePercentage = totalClasses === 0 ? 100 : Math.round((presentClasses / totalClasses) * 100);

  // 2. Fees
  const myPayments = feeHistory.filter(f => f.studentId === userInfo?._id);
  const lastPayment = myPayments[myPayments.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {userInfo?.name} 👋</h1>
          <p className="text-muted-foreground">Student Portal</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
          <User className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance Card */}
        <Card className={`${attendancePercentage < 75 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"} relative overflow-hidden`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {attendancePercentage < 75 ? <XCircle className="w-4 h-4 text-red-600"/> : <CheckCircle2 className="w-4 h-4 text-green-600"/>}
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${attendancePercentage < 75 ? "text-red-700" : "text-green-700"}`}>
              {attendancePercentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {presentClasses} / {totalClasses} Classes Attended
            </p>
            <Button variant="ghost" size="sm" className="absolute top-4 right-4" onClick={() => navigate("/dashboard/student-attendance")}>
              View <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Timetable Shortcut */}
        <Card className="bg-blue-50 border-blue-200 relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <Calendar className="w-4 h-4"/> Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-700">View Timetable</div>
            <p className="text-xs text-blue-600/80 mt-1">Check your classes</p>
            <Button variant="ghost" size="sm" className="absolute top-4 right-4" onClick={() => navigate("/dashboard/student-timetable")}>
              Open <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Fees Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4"/> Fee Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastPayment ? (
              <>
                <div className="text-2xl font-bold text-gray-800">Rs. {lastPayment.totalAmount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Paid: {lastPayment.month} {lastPayment.year}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground text-sm py-2">No payment history found</div>
            )}
            <Button variant="link" size="sm" className="px-0 h-auto mt-2" onClick={() => navigate("/dashboard/my-fees")}>
              View History &rarr;
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default StudentDashboardHome;