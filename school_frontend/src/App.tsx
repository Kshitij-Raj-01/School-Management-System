import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Make sure src/store/index.ts exists
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage"; // Make sure src/pages/auth/LoginPage.tsx exists
import DashboardLayout from "./layouts/DashboardLayout"; // Make sure src/layouts/DashboardLayout.tsx exists
import StudentRegisterPage from "./pages/dashboard/StudentRegisterPage";
import StudentsPage from "./pages/dashboard/StudentsPage";
import TeachersPage from "./pages/dashboard/TeachersPage";
import TeacherRegisterPage from "./pages/dashboard/TeacherRegisterPage";
import FeeManagement from "./pages/dashboard/FeeManagement";
import AdmitCardManagement from "./pages/dashboard/AdmitCardManagement";
import DashboardHome from "./pages/dashboard/DashboardHome";
import StaffPage from "./pages/dashboard/StaffPage";
import StaffRegisterPage from "./pages/dashboard/StaffRegisterPage";
import AttendancePage from "./pages/dashboard/AttendancePage";
import TimetablePage from "./pages/dashboard/TimetablePage";
import AttendanceReportPage from "./pages/dashboard/AttendanceReportPage";
import PayrollPage from "./pages/dashboard/PayrollPage";
import ExpensesReportPage from "./pages/dashboard/ExpensesReportPage";
import MySchedulePage from "./pages/dashboard/MySchedulePage";
import MyFees from "./pages/dashboard/MyFees";
import StudentProfilePage from "./pages/dashboard/student/StudentProfilePage";
import StudentAttendancePage from "./pages/dashboard/student/StudentAttendancePage";
import StudentTimetablePage from "./pages/dashboard/student/StudentTimetablePage";
import StudentAdmitCard from "./pages/dashboard/student/StudentAdmitCard";
import StudentResults from "./pages/dashboard/student/StudentResults";
import UserAccessPage from "./pages/dashboard/UserAccessPage";
import LandingPageEdit from "./pages/dashboard/LandingPageEdit";
import ResultsManagement from "./pages/dashboard/ResultsManagement";
import NoticeBoardPage from "./pages/dashboard/NoticeBoardPage";

const queryClient = new QueryClient();

// Protected Route Component: Redirects unauthenticated users to /login
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* --- Public Website Routes --- */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />

          {/* --- Protected School Management Routes --- */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome/>} />
            
            {/* Future Routes (To be implemented/ported) */}
            <Route path="students" element={<StudentsPage/>} />
            <Route path="student-register" element={<StudentRegisterPage/>} />
            <Route path="teachers" element={<TeachersPage/>} />
            <Route path="teacher-register" element={<TeacherRegisterPage/>} />
            <Route path="fees" element={<FeeManagement/>} />
            <Route path="fees-report" element={<FeeManagement/>} />
            <Route path="admit-cards" element={<AdmitCardManagement/>} />
            <Route path="staff" element={<StaffPage/>} />
            <Route path="staff-register" element={<StaffRegisterPage/>} />
            <Route path="attendance" element={<AttendancePage/>} />
            <Route path="timetable" element={<TimetablePage/>} />
            <Route path="attendance-report" element={<AttendanceReportPage/>} />
            <Route path="payroll" element={<PayrollPage/>} />
            <Route path="expenses-report" element={<ExpensesReportPage/>} />
            <Route path="my-schedule" element={<MySchedulePage/>} />
            <Route path="my-fees" element={<MyFees/>} />
            <Route path="student-profile" element={<StudentProfilePage/>} />
            <Route path="student-timetable" element={<StudentTimetablePage/>} />
            <Route path="student-attendance" element={<StudentAttendancePage/>} />
            <Route path="student-admit-card" element={<StudentAdmitCard/>} />
            <Route path="student-results" element={<StudentResults/>} />
            <Route path="user-access" element={<UserAccessPage />} />
            <Route path="landing-page-edit" element={<LandingPageEdit />} />
            <Route path="results-management" element={<ResultsManagement />} />
            <Route path="notice-board" element={<NoticeBoardPage/>} />
          </Route>

          {/* --- Catch-all Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;