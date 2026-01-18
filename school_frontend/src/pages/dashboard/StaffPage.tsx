import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteStaff, listStaff, updateStaff } from "@/store/slices/staffSlice";
import { AppDispatch, RootState } from "@/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StaffPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { staffList, loading } = useSelector((state: RootState) => state.staff);

  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => { dispatch(listStaff()); }, [dispatch]);

  const handleEdit = (staff: any) => {
    setEditingStaff(JSON.parse(JSON.stringify(staff)));
    setIsEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (editingStaff) {
      dispatch(updateStaff(editingStaff));
      toast.success("Staff updated successfully!");
      setIsEditDialogOpen(false);
      setEditingStaff(null);
      setTimeout(() => dispatch(listStaff()), 100);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      dispatch(deleteStaff(id))
        .unwrap()
        .then(() => toast.success("Staff deleted successfully"))
        .catch(() => toast.error("Failed to delete"));
    }
  };

  // Helper to calc age on Edit
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
        <h1 className="text-3xl font-bold">Staff Directory</h1>
        <Link to="/dashboard/staff-register"><Button><Plus className="mr-2 h-4 w-4" /> Add Staff</Button></Link>
      </div>
      <Card>
        <CardHeader><CardTitle>Non-Teaching Staff</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Aadhar Number</TableHead>
                <TableHead>Pan Number</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center">No staff found</TableCell></TableRow> 
              ) : (
                staffList.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={s.image} />
                        <AvatarFallback>{s.staff_name[0]}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {s.staff_name}<br/>
                      <span className="text-xs text-muted-foreground">{s.qualification}</span>
                    </TableCell>
                    <TableCell>{s.work}</TableCell>
                    <TableCell>{s.contact_no}</TableCell>
                    <TableCell>{s.age} Years</TableCell>
                    <TableCell>${s.salary}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(s._id!)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
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

      {/* --- EDIT STAFF DIALOG --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Details</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={editingStaff.staff_name} 
                    onChange={(e) => setEditingStaff({...editingStaff, staff_name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role / Work</Label>
                  <Input 
                    value={editingStaff.work} 
                    onChange={(e) => setEditingStaff({...editingStaff, work: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={editingStaff.email} 
                    onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={editingStaff.contact_no} 
                    onChange={(e) => setEditingStaff({...editingStaff, contact_no: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aadhar No</Label>
                  <Input 
                    value={editingStaff.aadhar_no} 
                    onChange={(e) => setEditingStaff({...editingStaff, aadhar_no: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pan No</Label>
                  <Input 
                    value={editingStaff.pan_no} 
                    onChange={(e) => setEditingStaff({...editingStaff, pan_no: e.target.value})} 
                  />
                </div>
                
                {/* DOB & AGE */}
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input 
                    type="date"
                    // Handle ISO Date string stripping
                    value={editingStaff.dob ? new Date(editingStaff.dob).toISOString().split('T')[0] : ''} 
                    onChange={(e) => {
                       const newDob = e.target.value;
                       setEditingStaff({
                         ...editingStaff, 
                         dob: newDob, 
                         age: calculateAge(newDob) // Auto update age
                       });
                    }} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input 
                    value={editingStaff.age} 
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input 
                    value={editingStaff.qualification} 
                    onChange={(e) => setEditingStaff({...editingStaff, qualification: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select 
                    value={editingStaff.gender} 
                    onValueChange={(val) => setEditingStaff({...editingStaff, gender: val})}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <Input 
                    type="number"
                    value={editingStaff.salary} 
                    onChange={(e) => setEditingStaff({...editingStaff, salary: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input 
                    value={editingStaff.address} 
                    onChange={(e) => setEditingStaff({...editingStaff, address: e.target.value})} 
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

export default StaffPage;