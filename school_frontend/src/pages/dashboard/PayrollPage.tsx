import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { listTeachers } from "@/store/slices/teacherSlice";
import { listStaff } from "@/store/slices/staffSlice";
import { paySalary, resetSalaryState } from "@/store/slices/salarySlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Banknote } from "lucide-react";

const PayrollPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { teachers } = useSelector((state: RootState) => state.teacher);
  const { staffList } = useSelector((state: RootState) => state.staff);
  const { loading, success, error } = useSelector((state: RootState) => state.salary);
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const role = userInfo?.role;

  const [employeeType, setEmployeeType] = useState<"Teacher" | "Staff">("Teacher");
  const [selectedId, setSelectedId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState("");

  useEffect(() => {
    dispatch(listTeachers());
    dispatch(listStaff());
  }, [dispatch]);

  // Only admin or finance user can access payroll
  if (role !== "admin" && role !== "finance") {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Payroll manage karne ka adhikaar sirf Admin ya Payment section ke
          user ke paas hai.
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (success) {
      toast.success("Salary Paid Successfully!");
      setAmount("");
      setSelectedId("");
      dispatch(resetSalaryState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetSalaryState());
    }
  }, [success, error, dispatch]);

  // Get the selected person object to autofill salary
  const selectedPerson = employeeType === "Teacher" 
    ? teachers.find(t => t._id === selectedId)
    : staffList.find(s => s._id === selectedId);

  // Autofill amount when person is selected
  useEffect(() => {
    if (selectedPerson) {
      // Use 'estimated_salary' for teachers or 'salary' for staff
      const salary = (selectedPerson as any).estimated_salary || (selectedPerson as any).salary;
      setAmount(salary || "");
    }
  }, [selectedPerson]);

  const handleSubmit = () => {
    if (!selectedId || !month || !year || !amount) return toast.error("Please fill all fields");

    dispatch(paySalary({
      employeeId: selectedId,
      employeeName: (selectedPerson as any).teacher_name || (selectedPerson as any).staff_name,
      role: employeeType,
      month,
      year,
      amount: Number(amount),
      date: "" // Filled by action
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Payroll Management</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-600"/> Pay Salary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Employee Type Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={employeeType === "Teacher" ? "default" : "outline"} 
              onClick={() => { setEmployeeType("Teacher"); setSelectedId(""); }}
            >
              Pay Teacher
            </Button>
            <Button 
              variant={employeeType === "Staff" ? "default" : "outline"} 
              onClick={() => { setEmployeeType("Staff"); setSelectedId(""); }}
            >
              Pay Staff
            </Button>
          </div>

          {/* Select Person */}
          <div className="space-y-2">
            <Label>Select {employeeType}</Label>
            <Select onValueChange={setSelectedId} value={selectedId}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${employeeType}...`} />
              </SelectTrigger>
              <SelectContent>
                {employeeType === "Teacher" 
                  ? teachers.map(t => <SelectItem key={t._id} value={t._id!}>{t.teacher_name}</SelectItem>)
                  : staffList.map(s => <SelectItem key={s._id} value={s._id!}>{s.staff_name} ({s.work})</SelectItem>)
                }
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select onValueChange={setMonth} value={month}>
                <SelectTrigger><SelectValue placeholder="Select Month" /></SelectTrigger>
                <SelectContent>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input value={year} onChange={e => setYear(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount (Rs.)</Label>
            <Input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="Enter Amount"
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading || !selectedId}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Banknote className="mr-2 h-4 w-4" />}
            Confirm Payment
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollPage;