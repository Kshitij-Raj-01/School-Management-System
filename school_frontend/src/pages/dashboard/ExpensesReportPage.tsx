import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getSalaryHistory } from "@/store/slices/salarySlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingDown, Download } from "lucide-react";

const ExpensesReportPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { history, loading } = useSelector((state: RootState) => state.salary);
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const role = userInfo?.role;

  const [filterRole, setFilterRole] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getSalaryHistory());
  }, [dispatch]);

  // Only admin or finance user can see expenses report
  if (role !== "admin" && role !== "finance") {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Salary / expenses report dekhne ka adhikaar sirf Admin ya Payment
          section ke user ke paas hai.
        </p>
      </div>
    );
  }

  // Filter Data
  const filteredData = history.filter((record) => {
    const matchesRole = filterRole === "All" || record.role === filterRole;
    const matchesMonth = filterMonth === "All" || record.month === filterMonth;
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesMonth && matchesSearch;
  });

  // Calculate Total
  const totalExpenses = filteredData.reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Expenses (Payroll) Report</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-600">Total Salary Paid (Filtered)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-700">Rs. {totalExpenses.toLocaleString()}</div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search employee name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            <SelectItem value="Teacher">Teachers</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Months</SelectItem>
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500"/> Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No salary records found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {record.date ? new Date(record.date).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">{record.employeeName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${record.role === 'Teacher' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {record.role}
                        </span>
                      </TableCell>
                      <TableCell>{record.month} {record.year}</TableCell>
                      <TableCell className="text-right font-bold text-gray-700">
                        Rs. {record.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesReportPage;