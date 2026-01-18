import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteTeacher, listTeachers, updateTeacher } from "@/store/slices/teacherSlice"; 
import { AppDispatch, RootState } from "@/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react"; 
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TeachersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { teachers, loading } = useSelector((state: RootState) => state.teacher);

  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => { dispatch(listTeachers()); }, [dispatch]);

  // --- BULLETPROOF SUBJECT FORMATTER ---
  const formatSubjects = (val: any) => {
    if (!val) return "N/A";

    // 1. If it's already a real Array
    if (Array.isArray(val)) {
        return val.length > 0 ? val.join(", ") : "N/A";
    }

    // 2. If it's a string, try to clean it manually
    if (typeof val === "string") {
        // If it looks like JSON array "['Math']", parse it
        if (val.trim().startsWith("[")) {
            try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.join(", ");
                }
            } catch (e) {
                // Ignore parse error and fall through to manual cleaning
            }
        }
        
        // Manual cleaning: Remove [ ] " ' chars
        const cleaned = val.replace(/[\[\]"']/g, "").trim();
        return cleaned.length > 0 ? cleaned : "N/A";
    }

    return "N/A";
  };

  // --- HANDLE EDIT CLICK ---
  const handleEdit = (teacher: any) => {
    const processedTeacher = JSON.parse(JSON.stringify(teacher));

    // Handle Subjects for the Input field
    let subStr = "";
    if (Array.isArray(processedTeacher.subjectsToTeach)) {
        subStr = processedTeacher.subjectsToTeach.join(", ");
    } else if (typeof processedTeacher.subjectsToTeach === "string") {
        subStr = processedTeacher.subjectsToTeach.replace(/[\[\]"']/g, "");
    }

    // Store as temporary string for the Input (we convert back to array on save)
    // We add a temporary field '_subjectsString' to handle the input state
    setEditingTeacher({ 
        ...processedTeacher, 
        _subjectsString: subStr 
    });
    
    setIsEditDialogOpen(true);
  };

  // --- SAVE CHANGES ---
  const saveEdit = () => {
    if (editingTeacher) {
      // Convert the string back to array for the API
      const finalSubjects = editingTeacher._subjectsString
        ? editingTeacher._subjectsString.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "")
        : [];

      const payload = {
        ...editingTeacher,
        subjectsToTeach: finalSubjects
      };
      
      // Remove temporary field
      delete payload._subjectsString;

      dispatch(updateTeacher(payload));
      toast.success("Teacher updated successfully!");
      setIsEditDialogOpen(false);
      setEditingTeacher(null);
      setTimeout(() => dispatch(listTeachers()), 100); 
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      dispatch(deleteTeacher(id))
        .unwrap() 
        .then(() => toast.success("Teacher deleted successfully"))
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

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teachers</h1>
        <Link to="/dashboard/teacher-register"><Button><Plus className="mr-2 h-4 w-4" /> Add Teacher</Button></Link>
      </div>
      <Card>
        <CardHeader><CardTitle>All Teachers</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center">No teachers found</TableCell></TableRow>
              ) : (
                teachers.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={t.image} />
                        <AvatarFallback>{t.teacher_name[0]}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {t.teacher_name}<br/>
                      <span className="text-xs text-muted-foreground">{t.qualification}</span>
                    </TableCell>
                    <TableCell>{formatSubjects(t.subjectsToTeach)}</TableCell>
                    <TableCell>{t.contact_no}</TableCell>
                    <TableCell>{t.age} Years</TableCell>
                    <TableCell>${t.estimated_salary}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={()=>handleDelete(t._id!)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- EDIT TEACHER DIALOG --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Teacher Details</DialogTitle>
          </DialogHeader>
          {editingTeacher && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={editingTeacher.teacher_name} 
                    onChange={(e) => setEditingTeacher({...editingTeacher, teacher_name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={editingTeacher.email} 
                    onChange={(e) => setEditingTeacher({...editingTeacher, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aadhar No</Label>
                  <Input 
                    value={editingTeacher.aadhar_no} 
                    onChange={(e) => setEditingTeacher({...editingTeacher, aadhar_no: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pan No</Label>
                  <Input 
                    value={editingTeacher.pan_no} 
                    onChange={(e) => setEditingTeacher({...editingTeacher, pan_no: e.target.value})} 
                  />
                </div>
                {/* DOB & AGE */}
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input 
                    type="date"
                    value={editingTeacher.dob ? new Date(editingTeacher.dob).toISOString().split('T')[0] : ''} 
                    onChange={(e) => {
                       const newDob = e.target.value;
                       setEditingTeacher({
                         ...editingTeacher, 
                         dob: newDob, 
                         age: calculateAge(newDob) 
                       });
                    }} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age (Auto-calculated)</Label>
                  <Input 
                    value={editingTeacher.age} 
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input 
                    value={editingTeacher.qualification} 
                    onChange={(e) => setEditingTeacher({...editingTeacher, qualification: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact No</Label>
                  <Input 
                    value={editingTeacher.contact_no} 
                    onChange={(e) => setEditingTeacher({...editingTeacher, contact_no: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select 
                    value={editingTeacher.gender} 
                    onValueChange={(val) => setEditingTeacher({...editingTeacher, gender: val})}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Salary ($)</Label>
                  <Input 
                    type="number"
                    value={editingTeacher.estimated_salary} 
                    onChange={(e) => setEditingTeacher({...editingTeacher, estimated_salary: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input 
                    value={editingTeacher.address} 
                    onChange={(e) => setEditingTeacher({...editingTeacher, address: e.target.value})} 
                  />
                </div>
                
                {/* SUBJECTS INPUT (Using the temporary string state) */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Subjects (comma separated)</Label>
                  <Input 
                    value={editingTeacher._subjectsString || ""} 
                    onChange={(e) => setEditingTeacher({
                      ...editingTeacher, 
                      _subjectsString: e.target.value
                    })} 
                    placeholder="Maths, Science, English"
                  />
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

export default TeachersPage;