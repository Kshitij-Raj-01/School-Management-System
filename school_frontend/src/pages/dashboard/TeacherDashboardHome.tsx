import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getTimetable } from "@/store/slices/timetableSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, CheckSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TeacherDashboardHome = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { schedule } = useSelector((state: RootState) => state.timetable);

  useEffect(() => {
    dispatch(getTimetable());
  }, [dispatch]);

  // Filter schedule for this teacher
  const mySchedule = schedule.filter(s => s.teacherId === userInfo?._id);
  
  // Get Today's Classes (e.g., "Monday")
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysClasses = mySchedule.filter(s => s.day === today);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hello, {userInfo?.name} 👋</h1>
          <p className="text-muted-foreground">Here is your schedule for today ({today}).</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
          <User className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Stats / Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-600 font-medium">Total Classes</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-700">{mySchedule.length}</div></CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-green-600 font-medium">Classes Today</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-700">{todaysClasses.length}</div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate("/dashboard/attendance")}>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-primary font-medium flex items-center gap-2"><CheckSquare className="w-4 h-4"/> Action</CardTitle></CardHeader>
          <CardContent><div className="text-lg font-bold text-primary">Mark Attendance &rarr;</div></CardContent>
        </Card>
      </div>

      {/* Today's Schedule List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-gray-600"/> Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No classes scheduled for today. Enjoy your day!
            </div>
          ) : (
            <div className="space-y-4">
              {todaysClasses.map((cls, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded text-sm">
                      {cls.startTime}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{cls.subject}</h3>
                      <p className="text-sm text-muted-foreground">Class {cls.classname}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/attendance")}>
                    Mark Attendance
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboardHome;