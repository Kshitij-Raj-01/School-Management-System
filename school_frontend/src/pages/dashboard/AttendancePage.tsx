import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { listStudents } from "@/store/slices/studentSlice";
import { markAttendance, resetAttendance } from "@/store/slices/attendanceSlice";
import { listTeachers } from "@/store/slices/teacherSlice"; // Import listTeachers
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CalendarCheck, Lock, AlertCircle } from "lucide-react";

const AttendancePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux State
  const { students } = useSelector((state: RootState) => state.student);
  const { teachers } = useSelector((state: RootState) => state.teacher); // Get Teachers
  const { loading, success, error } = useSelector((state: RootState) => state.attendance);
  const { userInfo } = useSelector((state: RootState) => state.auth);

  // Local State
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});

  // Initial Data Fetch
  useEffect(() => {
    dispatch(listStudents());
    dispatch(listTeachers()); // Fetch teachers to verify current user's role
  }, [dispatch]);

  // Handle Success/Error
  useEffect(() => {
    if (success) {
      toast.success("Attendance marked successfully!");
      setAttendanceData({});
      dispatch(resetAttendance());
    }
    if (error) {
      toast.error(error);
      dispatch(resetAttendance());
    }
  }, [success, error, dispatch]);

  // --- NEW LOGIC: Class Teacher Verification ---
  // 1. Find the full teacher object for the currently logged-in user
  const currentTeacherProfile = teachers.find(t => t.email === userInfo?.email);

  // 2. Determine allowed classes
  const myClasses = userInfo?.role === 'admin' 
    ? ["Nursery", "LKG", "UKG", "One", "Two", "Three", "Four", "Five", "Six", "Seven"]
    : (currentTeacherProfile?.classTeacherOf && currentTeacherProfile.classTeacherOf !== "None")
      ? [currentTeacherProfile.classTeacherOf]
      : [];

  // Filter students based on selection
  const classStudents = students.filter((s) => s.classname === selectedClass);

  // Initialize attendance (Default: Present)
  useEffect(() => {
    const initialData: Record<string, boolean> = {};
    classStudents.forEach((s) => {
      if (s._id) initialData[s._id] = true;
    });
    setAttendanceData(initialData);
  }, [selectedClass, students]);

  const handleToggle = (id: string) => {
    setAttendanceData((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    if (!selectedClass) return toast.error("Please select a class");

    const records = classStudents.map((s) => ({
      studentId: s._id!,
      studentName: s.student_name,
      roll_no: s.roll_no || "N/A",
      status: attendanceData[s._id!] ? "Present" : "Absent" as "Present" | "Absent",
    }));

    dispatch(markAttendance({
      date: new Date().toISOString().split('T')[0],
      classname: selectedClass,
      subject: "Daily Register", // Fixed subject for class teacher attendance
      records,
    }));
  };

  // Guard Clause: No Class Teacher Assignment
  if (userInfo?.role === 'teacher' && myClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed">
        <Lock className="w-16 h-16 mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-700">Access Restricted</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          You are not assigned as a <strong>Class Teacher</strong> for any class. 
          Daily attendance can only be marked by the designated Class Teacher.
        </p>
        <p className="text-sm text-gray-500 mt-4">Please contact the Administrator if this is an error.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Daily Attendance</h1>
          <p className="text-muted-foreground">
            {userInfo?.role === 'teacher' ? `Class Teacher: Class ${selectedClass || "..."}` : 'Administrator Mode'}
          </p>
        </div>
        <div className="text-sm font-medium bg-white px-4 py-2 rounded-md border shadow-sm">
          Date: <span className="font-bold text-primary">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            Mark Daily Register
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="w-full md:w-1/3">
            <Label>Select Class</Label>
            <Select onValueChange={setSelectedClass} value={selectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Class" />
              </SelectTrigger>
              <SelectContent>
                {myClasses.map((c) => (
                  <SelectItem key={c} value={c}>Class {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClass && (
            <>
              {classStudents.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">No students found in Class {selectedClass}</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[100px]">Roll No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Current Status</TableHead>
                        <TableHead className="text-right">Mark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classStudents.map((student) => {
                        const isPresent = attendanceData[student._id!] ?? true;
                        return (
                          <TableRow key={student._id} className={!isPresent ? "bg-red-50" : ""}>
                            <TableCell className="font-medium">{student.roll_no || "-"}</TableCell>
                            <TableCell>{student.student_name}</TableCell>
                            <TableCell>
                              <Badge variant={isPresent ? "default" : "destructive"} className="w-20 justify-center">
                                {isPresent ? "Present" : "Absent"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Switch 
                                checked={isPresent}
                                onCheckedChange={() => handleToggle(student._id!)}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  className="w-full md:w-auto" 
                  disabled={loading || classStudents.length === 0}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarCheck className="mr-2 h-4 w-4" />}
                  Submit Register
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;