import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { listStudents } from "@/store/slices/studentSlice";
import { listTeachers } from "@/store/slices/teacherSlice";
import { getFeeHistory } from "@/store/slices/feeSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, DollarSign, UserCog, TrendingUp } from "lucide-react";

const AdminDashboardHome = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Select data from Redux
  const { students } = useSelector((state: RootState) => state.student);
  const { teachers } = useSelector((state: RootState) => state.teacher);
  const { history: feeHistory } = useSelector((state: RootState) => state.fees);

  // Load data on mount so stats are accurate
  useEffect(() => {
    dispatch(listStudents());
    dispatch(listTeachers());
    dispatch(getFeeHistory());
  }, [dispatch]);

  // Calculate Stats
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalRevenue = feeHistory.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const recentTransactions = feeHistory.slice(-5).reverse(); // Get last 5

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>

        {/* Total Teachers */}
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Active Faculty</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fees Collected
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current Academic Year</p>
          </CardContent>
        </Card>

        {/* Staff (Placeholder until implemented) */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Support Staff
            </CardTitle>
            <UserCog className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Non-Teaching Staff</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Fee Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent transactions.</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{tx.studentName}</p>
                      <p className="text-xs text-muted-foreground">Class: {tx.classname} | Roll: {tx.roll_no}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+ Rs. {tx.totalAmount}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.date || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="h-full bg-primary/5 border-primary/10">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             {/* You can link these buttons using Link from react-router-dom */}
             <div className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition-all">
                <GraduationCap className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <span className="text-sm font-semibold">Add Student</span>
             </div>
             <div className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition-all">
                <DollarSign className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <span className="text-sm font-semibold">Collect Fees</span>
             </div>
             <div className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition-all">
                <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <span className="text-sm font-semibold">Add Teacher</span>
             </div>
             <div className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition-all">
                <UserCog className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <span className="text-sm font-semibold">Manage Staff</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardHome;