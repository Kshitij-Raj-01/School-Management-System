import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getFeeHistory } from "@/store/slices/feeSlice"; // Fetch fees from API
import { listStudents } from "@/store/slices/studentSlice"; // Fetch student profile
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, CheckCircle2, AlertCircle, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getStudentFeeStatus,
  type FeeStructure,
  type StudentFeeStatus
} from "@/lib/feeManagement";

const MyFees = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get Data from Redux Store
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { students } = useSelector((state: RootState) => state.student);
  const { history: allPayments, loading } = useSelector((state: RootState) => state.fees);

  const [feeStatus, setFeeStatus] = useState<StudentFeeStatus | null>(null);
  const [myPayments, setMyPayments] = useState<any[]>([]);

  // 1. Fetch Data on Mount
  useEffect(() => {
    dispatch(listStudents());
    dispatch(getFeeHistory());
  }, [dispatch]);

  // 2. Calculate Status when Data Available
  useEffect(() => {
    if (userInfo && students.length > 0) {
      // Find the logged-in student's profile details using email or ID
      // Note: userInfo._id from auth might match student._id if linked, 
      // but checking email is often safer if IDs differ between Auth/Student tables
      const currentStudent = students.find(s => s.email === userInfo.email) || 
                             students.find(s => s._id === userInfo._id);

      if (currentStudent) {
        // Calculate status using the helper and REAL backend payments
        const status = getStudentFeeStatus(
          currentStudent._id || "",
          currentStudent.student_name,
          currentStudent.admission_no,
          currentStudent.classname,
          currentStudent.roll_no || "N/A",
          allPayments, // Pass the full history, helper filters it
          currentStudent.usesBus
        );
        setFeeStatus(status);

        // Filter payments for just this student for the table
        const studentPayments = allPayments.filter(p => p.studentId === currentStudent._id);
        
        // Sort by date (newest first)
        setMyPayments(studentPayments.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
    }
  }, [userInfo, students, allPayments]);

  if (!feeStatus || loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading fee information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const balance = feeStatus.pendingAmount;
  const status = balance <= 0 ? "Paid" : feeStatus.totalPaid === 0 ? "Pending" : "Partial";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Fee Status</h1>
        <p className="text-muted-foreground mt-1">View your fee payment history and status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monthly Fee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">₹{feeStatus.monthlyFee}</div>
            <p className="text-xs text-blue-700 mt-1">Per Month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">₹{feeStatus.totalPaid}</div>
            <p className="text-xs text-green-700 mt-1">Out of ₹{feeStatus.totalDue}</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${balance > 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-purple-50 to-purple-100 border-purple-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${balance > 0 ? 'text-red-700' : 'text-purple-700'}`}>
              {balance > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance > 0 ? 'text-red-900' : 'text-purple-900'}`}>
              ₹{balance}
            </div>
            <p className={`text-xs mt-1 ${balance > 0 ? 'text-red-700' : 'text-purple-700'}`}>
              {balance > 0 ? "Pending" : "All Paid"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={status === "Paid" ? "default" : status === "Partial" ? "secondary" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {status}
            </Badge>
            <p className="text-xs text-orange-700 mt-2">
              {feeStatus.pendingMonths.length} months pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Months */}
      {feeStatus.pendingMonths.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {feeStatus.pendingMonths.map((month: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-white text-orange-800 border-orange-300">
                  {month}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Payment History
            </CardTitle>
            {/* Download Logic can be added later if needed */}
            <Button variant="outline" size="sm" disabled>
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {myPayments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payment records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* Note: Backend doesn't send receiptNo yet, relying on _id or date */}
                    <TableHead>Date</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Month/Year</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bus Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        {new Date(payment.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.feeType || "Monthly Fee"}</Badge>
                      </TableCell>
                      <TableCell>{payment.month} {payment.year}</TableCell>
                      <TableCell className="font-bold text-green-600">₹{payment.totalAmount}</TableCell>
                      <TableCell>
                        {/* Note: Check if backend sends usesBus/busFee in payment record, 
                            if not available, show '-' */}
                        {payment.busFee ? (
                          <span className="text-blue-600 font-medium">₹{payment.busFee}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Paid</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyFees;