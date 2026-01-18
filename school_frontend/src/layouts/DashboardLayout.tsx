import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import { 
  Home, Users, GraduationCap, DollarSign, LogOut, Printer, 
  BookOpen, UserCog, CalendarClock, CheckSquare, FileText, TrendingDown, 
  Banknote, User, Globe, Megaphone 
} from "lucide-react";

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const role = userInfo?.role || 'student';

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b bg-primary/5">
            <h2 className="text-xl font-bold text-primary tracking-tight">
              {role === 'admin' ? 'Admin Portal' : role === 'teacher' ? 'Teacher Portal' : role === 'finance' ? 'Finance Portal' : role === 'studentManager' ? 'Student Manager Portal' : 'Student Portal'}
            </h2>
            <p className="text-xs text-muted-foreground capitalize">Welcome, {userInfo?.name}</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="p-2 space-y-1">
              
              {/* === COMMON LINKS === */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/dashboard")} tooltip="Dashboard">
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/dashboard/notice-board")} tooltip="Notice Board">
                  <Megaphone className="w-5 h-5" />
                  <span>Notice Board</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* === ADMIN ONLY (full control over everything) === */}
              {role === 'admin' && (
                <>
                  <div className="mt-6 mb-2 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Administration</div>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/student-register")} tooltip="Register Student">
                      <Users className="w-5 h-5" />
                      <span>Register Student</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/teacher-register")} tooltip="Register Teacher">
                      <BookOpen className="w-5 h-5" />
                      <span>Register Teacher</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/staff-register")} tooltip="Register Staff">
                      <UserCog className="w-5 h-5" />
                      <span>Register Staff</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/user-access")} tooltip="User Access Control">
                      <UserCog className="w-5 h-5" />
                      <span>User Access</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/timetable")} tooltip="Manage Timetable">
                      <CalendarClock className="w-5 h-5" />
                      <span>Manage Timetable</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/landing-page-edit")} tooltip="Edit Landing Page">
                      <Globe className="w-5 h-5" />
                      <span>Landing Page</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <div className="mt-6 mb-2 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Directory</div>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/students")} tooltip="All Students">
                      <GraduationCap className="w-5 h-5" />
                      <span>Student List</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/teachers")} tooltip="Teachers">
                      <Users className="w-5 h-5" />
                      <span>Teacher List</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/staff")} tooltip="Staff List">
                      <UserCog className="w-5 h-5" />
                      <span>Staff List</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <div className="mt-6 mb-2 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Finance</div>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/fees")} tooltip="Fee Management">
                      <DollarSign className="w-5 h-5" />
                      <span>Fee Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/payroll")} tooltip="Payroll">
                      <Banknote className="w-5 h-5" />
                      <span>Manage Payroll</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/expenses-report")} tooltip="Expenses Report">
                      <TrendingDown className="w-5 h-5" />
                      <span>Expenses Report</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/attendance-report")} tooltip="Attendance Report">
                      <CheckSquare className="w-5 h-5" />
                      <span>Attendance Report</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <div className="mt-6 mb-2 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Documents</div>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/admit-cards")} tooltip="Admit Card Management">
                      <Printer className="w-5 h-5" />
                      <span>Admit Card Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/results-management")} tooltip="Results Management">
                      <FileText className="w-5 h-5" />
                      <span>Results Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {/* === TEACHER ONLY === */}
              {role === 'teacher' && (
                <>
                  <div className="mt-6 mb-2 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">My Work</div>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/my-schedule")} tooltip="My Schedule">
                      <CalendarClock className="w-5 h-5" />
                      <span>My Schedule</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/attendance")} tooltip="Mark Attendance">
                      <CheckSquare className="w-5 h-5" />
                      <span>Mark Attendance</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {/* === FINANCE ROLE (Payment Section Access) === */}
              {role === 'finance' && (
                <>
                  <div className="mt-6 mb-2 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Management</div>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/fees")} tooltip="Fee Management">
                      <DollarSign className="w-5 h-5" />
                      <span>Fee Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/payroll")} tooltip="Payroll">
                      <Banknote className="w-5 h-5" />
                      <span>Manage Payroll</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/expenses-report")} tooltip="Expenses Report">
                      <TrendingDown className="w-5 h-5" />
                      <span>Expenses Report</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {/* === STUDENT MANAGER ROLE (Student Section Access) === */}
              {role === 'studentManager' && (
                <>
                  <div className="mt-6 mb-2 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Student Management</div>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/student-register")} tooltip="Register Student">
                      <Users className="w-5 h-5" />
                      <span>Register Student</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/students")} tooltip="All Students">
                      <GraduationCap className="w-5 h-5" />
                      <span>Student List</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {/* === STUDENT ONLY === */}
              {role === 'student' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/student-profile")} tooltip="My Profile">
                      <User className="w-5 h-5" /> <span>My Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/student-timetable")} tooltip="Timetable">
                      <CalendarClock className="w-5 h-5" /> <span>My Timetable</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/student-attendance")} tooltip="Attendance">
                      <CheckSquare className="w-5 h-5" /> <span>Attendance</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/my-fees")} tooltip="My Fees">
                      <DollarSign className="w-5 h-5" />
                      <span>My Fee History</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/student-admit-card")} tooltip="My Admit Card">
                      <Printer className="w-5 h-5" />
                      <span>My Admit Card</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/student-results")} tooltip="My Results">
                      <FileText className="w-5 h-5" />
                      <span>My Results</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

            </SidebarMenu>
          </SidebarContent>
          <div className="mt-auto p-4 border-t bg-gray-50">
            <SidebarMenuButton onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Logout</span>
            </SidebarMenuButton>
          </div>
        </Sidebar>
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-gray-100/50 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}