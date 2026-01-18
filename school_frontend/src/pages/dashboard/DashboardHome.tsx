import { useSelector } from "react-redux";
import { RootState } from "@/store";
import TeacherDashboardHome from "./TeacherDashboardHome"; // Import the new component
import AdminDashboardHome from "./AdminDashboardHome"; // Rename your OLD DashboardHome code to this
import StudentDashboardHome from "./StudentDashboardHome";

// NOTE: You need to rename your existing 'DashboardHome' component to 'AdminDashboardHome' 
// or create a new file for it, so we can switch here.

const DashboardHome = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  console.log("Current Logged In User:", userInfo);

  if (userInfo?.role === 'teacher') {
    return <TeacherDashboardHome />;
  }

  if (userInfo?.role === 'student') {
    return <StudentDashboardHome/>;
  }

  // Default to Admin
  return <AdminDashboardHome />;
};

export default DashboardHome;