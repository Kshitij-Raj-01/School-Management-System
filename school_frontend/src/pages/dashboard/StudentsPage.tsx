import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteStudent, listStudents, updateStudent } from "@/store/slices/studentSlice";
import { AppDispatch, RootState } from "@/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Trash2, Pencil, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';

const StudentsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, loading, error } = useSelector(
    (state: RootState) => state.student
  );
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const role = userInfo?.role;

  const [filterClass, setFilterClass] = useState("All");
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(listStudents());
  }, [dispatch]);

  const filteredStudents = filterClass === "All" 
    ? students 
    : students.filter(student => student.classname === filterClass);

  const uniqueClasses = Array.from(new Set(students.map(s => s.classname)));

  const exportToExcel = () => {
    const data = filteredStudents.map(student => ({
      'Admission No': student.admission_no,
      'Name': student.student_name,
      'Class': student.classname,
      'Roll No': student.roll_no,
      'Contact': student.contact_no,
      'Father Name': student.father_name,
      'Mother Name': student.mother_name,
      'Registration Fees': student.registration_fees,
      'Uses Bus': student.usesBus ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_${filterClass === "All" ? "all" : filterClass}.xlsx`);
    toast.success("Excel file downloaded!");
  };

  const handleEdit = (student: any) => {
    setEditingStudent(JSON.parse(JSON.stringify(student)));
    setIsEditDialogOpen(true);
  };

  // --- UPDATED SAVE FUNCTION ---
  const saveEdit = async () => {
    if (editingStudent) {
      await dispatch(updateStudent(editingStudent));
      toast.success("Student updated successfully!");
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      // Force refresh to be safe
      dispatch(listStudents());
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      dispatch(deleteStudent(id))
        .unwrap() 
        .then(() => toast.success("Student deleted successfully"))
        .catch(() => toast.error("Failed to delete"));
    }
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return "";
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  if (role !== "admin" && role !== "studentManager") {
    return <div className="max-w-2xl mx-auto p-4">Access Restricted</div>;
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-md">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Students</h1>
        <div className="flex gap-2">
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Filter Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Classes</SelectItem>
              {uniqueClasses.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} variant="outline"><Download className="w-4 h-4 mr-2" />Export Excel</Button>
          <Link to="/dashboard/student-register"><Button><Plus className="w-4 h-4 mr-2" />Add Student</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>All Students</CardTitle></CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No students found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="w-[80px]">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Parent's Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Bus User</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-bold text-gray-600">{student.admission_no}</TableCell>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={student.image} alt={student.student_name} />
                        <AvatarFallback>{student.student_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{student.student_name}</TableCell>
                    <TableCell>{student.classname}</TableCell>
                    <TableCell>{student.roll_no || "N/A"}</TableCell>
                    <TableCell>{student.father_name}</TableCell>
                    <TableCell>{student.contact_no}</TableCell>
                    <TableCell>{student.age}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>
                    <Checkbox
                      checked={student.usesBus || false}
                      onCheckedChange={async (checked) => {
                        const updatedStudent = { ...student, usesBus: checked === true };
                        await dispatch(updateStudent(updatedStudent));
                        toast.success(`${student.student_name} bus status updated!`);
                      }}
                    />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(student._id!)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog key={editingStudent?._id} open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingStudent(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Student Details</DialogTitle></DialogHeader>
          {editingStudent && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Admission No</Label><Input value={editingStudent.admission_no} onChange={(e) => setEditingStudent({ ...editingStudent, admission_no: e.target.value })} /></div>
                  <div><Label>Name</Label><Input value={editingStudent.student_name} onChange={(e) => setEditingStudent({ ...editingStudent, student_name: e.target.value })} /></div>
                  <div><Label>Class</Label><Input value={editingStudent.classname} onChange={(e) => setEditingStudent({ ...editingStudent, classname: e.target.value })} /></div>
                  <div><Label>Roll No</Label><Input value={editingStudent.roll_no} onChange={(e) => setEditingStudent({ ...editingStudent, roll_no: e.target.value })} /></div>
                  <div><Label>Email</Label><Input value={editingStudent.email} onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })} /></div>
                  <div><Label>Contact</Label><Input value={editingStudent.contact_no} onChange={(e) => setEditingStudent({ ...editingStudent, contact_no: e.target.value })} /></div>
                  
                  {/* DOB & AGE */}
                  <div>
                    <Label>Date of Birth</Label>
                    <Input 
                      type="date"
                      value={editingStudent.dob ? new Date(editingStudent.dob).toISOString().split('T')[0] : ''} 
                      onChange={(e) => {
                         const newDob = e.target.value;
                         setEditingStudent({
                           ...editingStudent, 
                           dob: newDob, 
                           age: calculateAge(newDob) 
                         });
                      }} 
                    />
                  </div>
                  <div><Label>Age (Auto-calculated)</Label><Input value={editingStudent.age} readOnly className="bg-gray-100" /></div>

                  <div>
                    <Label>Gender</Label>
                    <Select value={editingStudent.gender} onValueChange={(value) => setEditingStudent({ ...editingStudent, gender: value })}>
                      <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Address</Label><Input value={editingStudent.address} onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })} /></div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Father Name</Label><Input value={editingStudent.father_name} onChange={(e) => setEditingStudent({ ...editingStudent, father_name: e.target.value })} /></div>
                  <div><Label>Mother Name</Label><Input value={editingStudent.mother_name} onChange={(e) => setEditingStudent({ ...editingStudent, mother_name: e.target.value })} /></div>
                  <div><Label>Alternate Mobile</Label><Input value={editingStudent.alternate_mobile_no} onChange={(e) => setEditingStudent({ ...editingStudent, alternate_mobile_no: e.target.value })} /></div>
                  <div><Label>Father Aadhar</Label><Input value={editingStudent.father_aadhar_no} onChange={(e) => setEditingStudent({ ...editingStudent, father_aadhar_no: e.target.value })} /></div>
                  <div><Label>Mother Aadhar</Label><Input value={editingStudent.mother_aadhar_no} onChange={(e) => setEditingStudent({ ...editingStudent, mother_aadhar_no: e.target.value })} /></div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Pan No</Label><Input value={editingStudent.pan_no} onChange={(e) => setEditingStudent({ ...editingStudent, pan_no: e.target.value })} /></div>
                  <div><Label>Weight</Label><Input value={editingStudent.weight} onChange={(e) => setEditingStudent({ ...editingStudent, weight: e.target.value })} /></div>
                  <div><Label>Height</Label><Input value={editingStudent.height} onChange={(e) => setEditingStudent({ ...editingStudent, height: e.target.value })} /></div>
                  <div><Label>Aadhar No</Label><Input value={editingStudent.aadhar_no} onChange={(e) => setEditingStudent({ ...editingStudent, aadhar_no: e.target.value })} /></div>
                  <div><Label>Previous School</Label><Input value={editingStudent.previous_school_name} onChange={(e) => setEditingStudent({ ...editingStudent, previous_school_name: e.target.value })} /></div>
                  <div><Label>Reg. Fees</Label><Input value={editingStudent.registration_fees} onChange={(e) => setEditingStudent({ ...editingStudent, registration_fees: e.target.value })} /></div>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="usesBus" checked={editingStudent.usesBus || false} onChange={(e) => setEditingStudent({ ...editingStudent, usesBus: e.target.checked })} />
                  <Label htmlFor="usesBus">Uses Bus</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveEdit}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsPage;