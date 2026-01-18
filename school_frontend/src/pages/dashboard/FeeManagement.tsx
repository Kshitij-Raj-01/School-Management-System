import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { RootState, AppDispatch } from "@/store";
import { listStudents } from "@/store/slices/studentSlice";
import { getFeeHistory, payFees, FeeRecord } from "@/store/slices/feeSlice";
import { fetchFeeStructure, saveFeeStructureDB, FeeStructure } from "@/store/slices/feeStructureSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  DollarSign, 
  Users, 
  FileText, 
  Search,
  Download,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  FileWarning
} from "lucide-react";
import jsPDF from 'jspdf';
import schoolLogo from "@/assets/school-logo.png";
import {
  getAllStudentsFeeStatus,
  getTotalCollection,
  getAcademicYear,
  type StudentFeeStatus,
  type FeeType,
} from "@/lib/feeManagement";
import * as XLSX from 'xlsx';

// --- CONSTANTS ---
const SCHOOL_NAME = "R.N.T. PUBLIC SCHOOL";
const SCHOOL_TAGLINE = "Nursery to 7th Grade Excellence";

// --- HELPER: Generate Unique Receipt ID ---
const generateReceiptNo = () => {
  const datePart = new Date().toISOString().slice(0,10).replace(/-/g, ""); // 20231025
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REC-${datePart}-${randomPart}`;
};

const FeeManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { students } = useSelector((state: RootState) => state.student);
  const { history: allPayments, loading } = useSelector((state: RootState) => state.fees);
  const { structure: reduxFeeStructure, loading: structLoading, error: structError } = useSelector((state: RootState) => state.feeStructure);

  const role = userInfo?.role;

  const [activeTab, setActiveTab] = useState(location.pathname.includes("fees-report") ? "history" : "collect");
  const [localFeeStructure, setLocalFeeStructure] = useState<FeeStructure[]>([]);
  const [studentsFeeStatus, setStudentsFeeStatus] = useState<StudentFeeStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
    
  // Student History Search
  const [admissionNoSearch, setAdmissionNoSearch] = useState("");
  const [searchedStudentPayments, setSearchedStudentPayments] = useState<FeeRecord[]>([]);
  const [searchedStudentInfo, setSearchedStudentInfo] = useState<any>(null);

  // Payment Form State
  const [selectedStudent, setSelectedStudent] = useState("");
  const [paymentMonths, setPaymentMonths] = useState<string[]>([]);
  const [paymentYear, setPaymentYear] = useState(new Date().getFullYear().toString());
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Online" | "Cheque" | "Bank Transfer">("Cash");
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<FeeType[]>([]);
  const [usesBus, setUsesBus] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");

  // Student pending fees info
  const [studentPendingInfo, setStudentPendingInfo] = useState<StudentFeeStatus | null>(null);

  const isAdmin = role === "admin" || role === "finance";

  useEffect(() => {
    if (isAdmin) {
      dispatch(listStudents());
      dispatch(getFeeHistory()); 
      dispatch(fetchFeeStructure());
    }
  }, [dispatch, isAdmin]);

  // 2. Sync Redux Structure to Local State (for editing)
  useEffect(() => {
    if (reduxFeeStructure && reduxFeeStructure.length > 0) {
      setLocalFeeStructure(reduxFeeStructure.map(item => ({ ...item })));
    }
  }, [reduxFeeStructure]);

  useEffect(() => {
      if (structError) {
          toast.error(`Error loading fee structure: ${structError}`);
      }
  }, [structError]);

// --- CALCULATION HELPER ---
const calculateStudentStatus = (student: any, payments: FeeRecord[], feeStructure: FeeStructure[]): StudentFeeStatus => {
  const feeStruct = feeStructure.find(f => f.classname === student.classname);
  
  let monthlyRate = 0;
  if (feeStruct) {
      monthlyRate = feeStruct.monthlyFee + (student.usesBus ? feeStruct.busFee : 0);
  }

  // 1. Generate list of all academic months until now
  const academicYear = getAcademicYear();
  const allMonths = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
  const currentMonthIndex = new Date().getMonth(); // 0=Jan, 3=Apr
  
  // Determine how many months have passed in the academic cycle (Apr -> Mar)
  let monthsPassedCount = 0;
  if (currentMonthIndex >= 3) {
      monthsPassedCount = currentMonthIndex - 3 + 1;
  } else {
      monthsPassedCount = 9 + currentMonthIndex + 1;
  }

  const monthsDueList: string[] = [];
  for(let i=0; i<monthsPassedCount; i++) {
      const mName = allMonths[i];
      // Year logic: Apr-Dec is startYear, Jan-Mar is startYear+1
      const mYear = i < 9 ? academicYear : academicYear + 1;
      monthsDueList.push(`${mName} ${mYear}`);
  }

  // 2. Filter out Paid Months
  const studentPayments = payments.filter(p => String(p.studentId) === String(student._id));
  const paidMonthSet = new Set(studentPayments.map(p => `${p.month} ${p.year}`));

  const pendingMonthsList = monthsDueList.filter(m => !paidMonthSet.has(m));

  // 3. Financials
  const totalDue = monthsDueList.length * monthlyRate;
  // Only count monthly fees towards dues (ignoring exam/fine)
  const totalPaidMonthly = studentPayments.reduce((sum, p) => sum + (p.monthly_fees || 0), 0);
  
  // We calculate pending amount based on specific missing months to be accurate
  const pendingAmount = pendingMonthsList.length * monthlyRate;

  return {
      studentId: student._id,
      studentName: student.student_name,
      admissionNo: student.admission_no,
      classname: student.classname,
      rollNo: student.roll_no, 
      monthlyFee: monthlyRate,
      totalDue: totalDue,
      totalPaid: totalPaidMonthly, 
      pendingAmount: pendingAmount,
      pendingMonths: pendingMonthsList,
  };
};

// --- UPDATE LIST WHEN DATA CHANGES ---
useEffect(() => {
  if (students.length > 0 && localFeeStructure.length > 0) {
    const statusList = students.map(student => 
      calculateStudentStatus(student, allPayments, localFeeStructure)
    );
    setStudentsFeeStatus(statusList);
  }
}, [students, allPayments, localFeeStructure]);

// --- UPDATE SELECTED STUDENT INFO ---
useEffect(() => {
  if (selectedStudent && localFeeStructure.length > 0) {
    const student = students.find(s => s._id === selectedStudent);
    if (student) {
      const status = calculateStudentStatus(student, allPayments, localFeeStructure);
      setStudentPendingInfo(status);
      setUsesBus(student.usesBus || false);
    }
  } else {
    setStudentPendingInfo(null);
    setUsesBus(false);
  }
}, [selectedStudent, students, allPayments, localFeeStructure]);

// --- AUTO-UPDATE YEAR ---
useEffect(() => {
  if (paymentMonths.length > 0) {
    const lastSelectedMonth = paymentMonths[paymentMonths.length - 1];
    const startYear = getAcademicYear(); 
    const nextYearMonths = ["January", "February", "March"];
    
    if (nextYearMonths.includes(lastSelectedMonth)) {
      setPaymentYear((startYear + 1).toString());
    } else {
      setPaymentYear(startYear.toString());
    }
  }
}, [paymentMonths]);

// --- AUTO-CALCULATE AMOUNT ---
useEffect(() => {
  if (selectedStudent && (paymentMonths.length > 0 || selectedFeeTypes.length > 0)) {
    const student = students.find(s => s._id === selectedStudent);
    if (student) {
      const feeStruct = localFeeStructure.find(f => f.classname === student.classname);
      if (feeStruct) {
        let totalAmount = 0;
        const monthlyFeeTypes = selectedFeeTypes.filter(feeType => feeType === "Monthly Fee");
        const oneTimeFeeTypes = selectedFeeTypes.filter(feeType => feeType !== "Monthly Fee");
        
        for (const month of paymentMonths) {
           if (monthlyFeeTypes.includes("Monthly Fee")) {
              let monthlyTotal = feeStruct.monthlyFee;
              if (usesBus) monthlyTotal += feeStruct.busFee;
              totalAmount += monthlyTotal;
           }
        }

        for (const feeType of oneTimeFeeTypes) {
          if (feeType === "Exam Fee") totalAmount += feeStruct.examFee;
          else if (feeType === "Admission Fee") totalAmount += feeStruct.annualFee;
          else if (feeType === "Other Fee") totalAmount += feeStruct.otherFee; 
          else if (feeType === "Fine") totalAmount += feeStruct.fine;
        }

        setPaymentAmount(Math.round(totalAmount).toString());
      }
    }
  } else {
    setPaymentAmount("");
  }
}, [selectedStudent, paymentMonths, selectedFeeTypes, usesBus, students, localFeeStructure]);
  

  // Export Payment History to Excel
  const exportPaymentHistoryToExcel = () => {
    const data = allPayments.map(payment => ({
      'Receipt ID': payment._id,
      'Student Name': payment.studentName,
      'Class': payment.classname,
      'Month': payment.month,
      'Year': payment.year,
      'Total Amount': payment.totalAmount,
      'Monthly Fees': payment.monthly_fees,
      'Exam Fees': payment.exam_fees,
      'Other Fees': payment.other_fee,
      'Date': payment.date
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payment History');
    XLSX.writeFile(wb, 'payment_history.xlsx');
    toast.success("Payment history exported to Excel!");
  };

  // Export Dues List
  const exportDuesListToExcel = () => {
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : studentsFeeStatus;

    const data = dataToExport.map(student => ({
      'Admission No': student.admissionNo,
      'Student Name': student.studentName,
      'Class': student.classname,
      'Monthly Fee': student.monthlyFee,
      'Total Due': student.totalDue,
      'Total Paid': student.totalPaid,
      'Balance (Pending)': student.pendingAmount,
      'Pending Months': student.pendingMonths.join(", "),
      'Status': student.pendingAmount <= 0 ? 'Paid' : student.totalPaid === 0 ? 'Pending' : 'Partial'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dues List');
    XLSX.writeFile(wb, `student_dues_list_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Student dues list exported to Excel!");
  };

  // --- Generate Due List PDF ---
const generateDueSlipPDF = async (targetStudents: StudentFeeStatus[], isBulk = false) => {
    const pdf = new jsPDF();
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Only process students with actual dues
    const pendingStudents = targetStudents.filter(s => s.pendingAmount > 0);

    if (pendingStudents.length === 0) {
      toast.info("No pending dues found for the selected students.");
      return;
    }

    // Pre-load logo
    let logoData: string | null = null;
    try {
      const img = new Image();
      img.src = schoolLogo;
      await new Promise<void>((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); });
      if (img.complete && img.naturalHeight !== 0) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        logoData = canvas.toDataURL("image/png");
      }
    } catch (e) { }

    // Loop through each student and create a page/slip
    pendingStudents.forEach((s, index) => {
      if (index > 0) pdf.addPage(); // New page for each student

      let yPos = 20;

      // --- Header ---
      if (logoData) pdf.addImage(logoData, 'PNG', margin, 15, 20, 20);
      
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(41, 58, 128); 
    pdf.text(SCHOOL_NAME, pageWidth / 2, 20, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(SCHOOL_TAGLINE, pageWidth / 2, 26, { align: "center" });
    pdf.text("Phone: +91-XXXXXXXXXX | Email: info@rntschool.com", pageWidth / 2, 31, { align: "center" });

      // --- Title ---
      yPos += 20;
      pdf.setFillColor(255, 230, 230); // Light Red background
      pdf.rect(margin, yPos, contentWidth, 10, 'F');
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(200, 0, 0); // Red Text
      pdf.text("FEE DUE SLIP", pageWidth / 2, yPos + 6.5, { align: "center" });

      // --- Student Details ---
      yPos += 20;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      
      const leftX = margin + 10;
      const rightX = pageWidth / 2 + 10;

      pdf.text(`Student Name:`, leftX, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(s.studentName, leftX + 35, yPos);

      pdf.setFont("helvetica", "bold");
      pdf.text(`Class:`, rightX, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(s.classname, rightX + 20, yPos);

      yPos += 8;
      pdf.setFont("helvetica", "bold");
      pdf.text(`Admission No:`, leftX, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(s.admissionNo, leftX + 35, yPos);

      pdf.setFont("helvetica", "bold");
      pdf.text(`Roll No:`, rightX, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(s.rollNo || "-", rightX + 20, yPos);

      yPos += 8;
      pdf.setFont("helvetica", "bold");
      pdf.text(`Date of Issue:`, leftX, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(new Date().toLocaleDateString(), leftX + 35, yPos);

      // --- Financial Table ---
      yPos += 15;
      
      // Header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, contentWidth, 8, 'F');
      pdf.setFont("helvetica", "bold");
      pdf.text("Description", margin + 5, yPos + 5.5);
      pdf.text("Amount (Rs)", pageWidth - margin - 5, yPos + 5.5, { align: "right" });

      yPos += 8;
      pdf.rect(margin, yPos, contentWidth, 24); // Box for content

      // Rows
      pdf.setFont("helvetica", "normal");
      
      yPos += 6;
      pdf.text("Total Fees Applicable (Till Date)", margin + 5, yPos);
      pdf.text(s.totalDue.toLocaleString(), pageWidth - margin - 5, yPos, { align: "right" });

      yPos += 7;
      pdf.text("Total Fees Paid", margin + 5, yPos);
      pdf.text(`(-) ${s.totalPaid.toLocaleString()}`, pageWidth - margin - 5, yPos, { align: "right" });

      yPos += 7;
      pdf.setDrawColor(200);
      pdf.line(margin, yPos - 4.5, pageWidth - margin, yPos - 4.5); // Separator
      
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(200, 0, 0); // Red for Due
      pdf.text("NET PENDING DUES", margin + 5, yPos);
      pdf.text(s.pendingAmount.toLocaleString(), pageWidth - margin - 5, yPos, { align: "right" });

      // --- Footer Message ---
      yPos += 20;
      pdf.setFontSize(10);
      pdf.setTextColor(0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Dear Parent,", margin, yPos);
      
      yPos += 5;
      pdf.setFont("helvetica", "normal");
      const msg = `This is to inform you that an amount of Rs. ${s.pendingAmount} is outstanding against the school fees of your ward. You are requested to clear the dues within 7 days to avoid any late fines.`;
      const splitMsg = pdf.splitTextToSize(msg, contentWidth);
      pdf.text(splitMsg, margin, yPos);

      yPos += 25;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      pdf.text("This is a computer generated slip.", margin, yPos);
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Authorized Signatory", pageWidth - margin, yPos, { align: "right" });
    });

    const fileName = isBulk ? `Bulk_Due_Slips_${new Date().toISOString().split('T')[0]}.pdf` : `Due_Slip_${pendingStudents[0].studentName}.pdf`;
    pdf.save(fileName);
    toast.success(isBulk ? "Bulk Slips Generated!" : "Due Slip Generated!");
  };

  // --- SAVE FEE STRUCTURE TO DB ---
  const handleSaveFeeStructure = async () => {
    await dispatch(saveFeeStructureDB(localFeeStructure));
    toast.success("Fee structure updated in Database! ✅");
    dispatch(fetchFeeStructure()); // Refresh from DB
  };

  const handleCollectFee = async () => {
    if (!selectedStudent || paymentMonths.length === 0 || selectedFeeTypes.length === 0 || !paymentAmount) {
      toast.error("Please fill all required fields");
      return;
    }

    const student = students.find(s => s._id === selectedStudent);
    if (!student) { toast.error("Student not found"); return; }

    const feeStruct = localFeeStructure.find(f => f.classname === student.classname);
    if (!feeStruct) { toast.error("Fee structure not found"); return; }

    // Duplicate Check
    const duplicates: string[] = [];
    for (const month of paymentMonths) {
       const isDuplicate = allPayments.some(p => 
          String(p.studentId) === String(student._id) && p.month === month && String(p.year) === String(paymentYear)
       );
       if(isDuplicate) duplicates.push(`${month} ${paymentYear}`);
    }

    if (duplicates.length > 0) {
      toast.error(`Fees already collected for: ${duplicates.join(", ")}`);
      return;
    }

    const paymentsToProcess: FeeRecord[] = [];
    const generatedReceipts: FeeRecord[] = [];
    
    const monthlyTotal = feeStruct.monthlyFee + (usesBus ? feeStruct.busFee : 0);
    const examFeeVal = selectedFeeTypes.includes("Exam Fee") ? feeStruct.examFee : 0;
    const admissionFeeVal = selectedFeeTypes.includes("Admission Fee") ? feeStruct.annualFee : 0;
    const otherFeeVal = selectedFeeTypes.includes("Other Fee") ? feeStruct.otherFee : 0;
    const fineVal = selectedFeeTypes.includes("Fine") ? feeStruct.fine : 0;
    
    let oneTimeFeesApplied = false;

    // Generate Unique Receipt ID
    const receiptId = generateReceiptNo();

    for (const month of paymentMonths) {
      const record: FeeRecord = {
        studentId: student._id!,
        studentName: student.student_name,
        classname: student.classname,
        roll_no: student.roll_no || "N/A",
        month: month,
        year: paymentYear,
        usesBus: usesBus,
        date: new Date().toISOString(),
        paymentMode: paymentMode,
        receiptNo: receiptId, // Use generated ID
        notes: paymentNotes,

        monthly_fees: selectedFeeTypes.includes("Monthly Fee") ? Math.round(monthlyTotal) : 0,
        exam_fees: !oneTimeFeesApplied ? examFeeVal : 0,
        other_fee: !oneTimeFeesApplied ? (admissionFeeVal + otherFeeVal) : 0,
        fine: !oneTimeFeesApplied ? fineVal : 0,
        totalAmount: 0 
      };

      record.totalAmount = record.monthly_fees + record.exam_fees + record.other_fee + record.fine;
      paymentsToProcess.push(record);
      oneTimeFeesApplied = true;
    }

    let successCount = 0;
    for (const payment of paymentsToProcess) {
       const resultAction = await dispatch(payFees(payment));
       if (payFees.fulfilled.match(resultAction)) {
         successCount++;
         generatedReceipts.push({ ...payment, _id: resultAction.payload._id });
       } else {
         toast.error(`Failed to save for ${payment.month}`);
       }
    }

    if (successCount > 0) {
      toast.success(`Fees collected successfully!`);
      generateCombinedFeeReceiptPDF(generatedReceipts, student, studentPendingInfo || undefined);
      setSelectedStudent("");
      setPaymentMonths([]);
      setPaymentAmount("");
      setSelectedFeeTypes([]);
      setUsesBus(false);
      setPaymentNotes("");
      setStudentPendingInfo(null);
    }
  };

  // --- PDF GENERATOR (RETAINED FROM PREVIOUS STEPS) ---
  const generateCombinedFeeReceiptPDF = async (payments: any[], student: any, pendingInfo?: StudentFeeStatus) => {
    const pdf = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    const drawLine = (y: number) => {
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.1);
      pdf.line(margin, y, pageWidth - margin, y);
    };

    let yPos = 20;

    try {
      const img = new Image();
      img.src = schoolLogo;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); 
      });
      if (img.complete && img.naturalHeight !== 0) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const logoData = canvas.toDataURL("image/png");
        pdf.addImage(logoData, 'PNG', margin, 10, 25, 25);
      }
    } catch (e) { }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(41, 58, 128); 
    pdf.text(SCHOOL_NAME, pageWidth / 2, 20, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(SCHOOL_TAGLINE, pageWidth / 2, 26, { align: "center" });
    pdf.text("Phone: +91-XXXXXXXXXX | Email: info@rntschool.com", pageWidth / 2, 31, { align: "center" });

    yPos = 40;
    pdf.setFillColor(41, 58, 128); 
    pdf.rect(0, yPos, pageWidth, 12, 'F');
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text("OFFICIAL FEE RECEIPT", pageWidth / 2, yPos + 8, { align: "center" });

    yPos += 20;

    pdf.setFillColor(245, 245, 245);
    pdf.setDrawColor(220, 220, 220);
    pdf.rect(margin, yPos, contentWidth, 10, 'FD');
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const receiptNo = payments[0].receiptNo || "N/A";
    pdf.text(`Receipt No: ${receiptNo}`, margin + 5, yPos + 6.5);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 5, yPos + 6.5, { align: "right" });

    yPos += 18;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 58, 128);
    pdf.text("STUDENT DETAILS", margin, yPos);
    drawLine(yPos + 2);
    yPos += 8;

    const col1X = margin;
    const col2X = pageWidth / 2 + 10;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text("Name:", col1X, yPos);
    pdf.text("Admission No:", col2X, yPos);
    
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(String(student.student_name || student.studentName || ""), col1X + 25, yPos);
    pdf.text(String(student.admission_no || student.studentId || "N/A"), col2X + 30, yPos);

    yPos += 8;

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Class:", col1X, yPos);
    pdf.text("Roll No:", col2X, yPos);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(String(student.classname || ""), col1X + 25, yPos);
    pdf.text(String(student.roll_no || student.rollNo || "N/A"), col2X + 30, yPos);

    yPos += 15;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 58, 128);
    pdf.text("PAYMENT DESCRIPTION", margin, yPos);
    yPos += 4;

    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, yPos, contentWidth, 8, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    
    const colParams = [
      { name: "Description", x: margin + 5 },
      { name: "Month/Year", x: margin + 65 },
      { name: "Mode", x: margin + 105 },
      { name: "Bus Fee", x: margin + 135 },
      { name: "Total", x: pageWidth - margin - 5, align: "right" }
    ];

    colParams.forEach(col => {
      pdf.text(col.name, col.x, yPos + 5.5, col.align ? { align: col.align } : undefined);
    });

    yPos += 9;

    let grandTotalPaid = 0;

    payments.forEach((payment, index) => {
      const amt = Number(payment.totalAmount || payment.total_amount || 0);
      grandTotalPaid += amt;

      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPos - 1, contentWidth, 7, 'F');
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);

      let typeLabel = "Monthly Fee";
      if ((payment.exam_fees || 0) > 0) typeLabel = "Exam Fee";
      else if ((payment.miscellaneous || 0) > 0) typeLabel = "Misc/Adm Fee";
      if (payment.feeType) typeLabel = String(payment.feeType);

      pdf.text(String(typeLabel), margin + 5, yPos + 4);
      pdf.text(`${payment.month} ${payment.year}`, margin + 65, yPos + 4);
      pdf.text(String(payment.paymentMode || "Cash"), margin + 105, yPos + 4);
      
      pdf.text("-", margin + 135, yPos + 4);
      
      pdf.setFont("helvetica", "bold");
      pdf.text(`Rs. ${amt}`, pageWidth - margin - 5, yPos + 4, { align: "right" });

      yPos += 7;
    });

    yPos += 5;
    pdf.setDrawColor(41, 58, 128);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 8;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("GRAND TOTAL PAID:", margin + 90, yPos); 
    
    pdf.setFontSize(14);
    pdf.setTextColor(41, 58, 128);
    pdf.text(`Rs. ${grandTotalPaid.toLocaleString()}`, pageWidth - margin - 5, yPos, { align: "right" });

    if (pendingInfo) {
      yPos += 15;
      const newBalance = Math.max(0, pendingInfo.pendingAmount - grandTotalPaid);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(80, 80, 80);
      
      if (newBalance <= 0) {
        pdf.setTextColor(0, 100, 0);
        pdf.text("Status: ALL DUES CLEARED", margin, yPos);
      } else {
        pdf.text(`Remaining Balance: Rs. ${newBalance.toLocaleString()}`, margin, yPos);
      }
    }

    const footerY = pageHeight - 40;
    
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.1);
    pdf.line(margin, footerY, pageWidth - margin, footerY);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    
    pdf.text("Accountant Signature", margin, footerY + 15);
    pdf.text("Parent/Guardian Signature", pageWidth - margin, footerY + 15, { align: "right" });

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 100, 100);
    pdf.text("Thank you for the timely payment. This is a computer-generated receipt.", pageWidth / 2, pageHeight - 10, { align: "center" });

    pdf.save(`Fee_Receipt_${receiptNo}.pdf`);
    toast.success("Receipt Downloaded Successfully!");
  };

  const generateSingleFeeReceipt = async (payment: FeeRecord) => {
    const studentMock = {
        student_name: String(payment.studentName || ""),
        admission_no: String(payment.studentId || ""), 
        classname: String(payment.classname || ""),
        roll_no: String(payment.roll_no || "N/A")
    };
    
    await generateCombinedFeeReceiptPDF([payment], studentMock, undefined);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader><CardTitle>Access Restricted</CardTitle></CardHeader>
          <CardContent><p>Only admin/finance users can access this.</p></CardContent>
        </Card>
      </div>
    );
  }

  const collection = getTotalCollection(allPayments);
  const filteredStudents = studentsFeeStatus.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "All" || s.classname === filterClass;
    const matchesStatus = filterStatus === "All" || 
      (filterStatus === "Paid" && s.totalPaid >= s.totalDue) ||
      (filterStatus === "Pending" && s.totalPaid < s.totalDue) ||
      (filterStatus === "Partial" && s.totalPaid > 0 && s.totalPaid < s.totalDue);
    return matchesSearch && matchesClass && matchesStatus;
  });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // --- FIXED SEARCH FUNCTION ---
  const handleStudentHistorySearch = () => {
    if (!admissionNoSearch.trim()) return;
    const student = students.find(s => s.admission_no === admissionNoSearch.trim());
    if (!student) {
      toast.error("Student not found");
      setSearchedStudentPayments([]);
      return;
    }
    // FIX: String conversion for robust comparison
    const payments = allPayments.filter(p => String(p.studentId) === String(student._id));
    
    // Sort
    payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setSearchedStudentPayments(payments);
    setSearchedStudentInfo({
      name: student.student_name,
      admissionNo: student.admission_no,
      classname: student.classname,
      rollNo: student.roll_no || "N/A",
    });
    
    if (payments.length > 0) {
        toast.success(`Found ${payments.length} payment records.`);
    } else {
        toast.info("Student found, but no payment history.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-700">Total Collection</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-900">₹{collection.total.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-green-700">This Month</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-900">₹{collection.thisMonth.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-purple-700">This Year</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-900">₹{collection.thisYear.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-orange-700">Students</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-900">{students.length}</div></CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="collect">Collect Fee</TabsTrigger>
          <TabsTrigger value="students">Status</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="student-history">Student Search</TabsTrigger>
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
        </TabsList>

        {/* COLLECT TAB */}
        <TabsContent value="collect" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Collect Fee Payment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label>Student</Label>
                   <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                      <SelectContent>
                        {students.map(s => <SelectItem key={s._id} value={s._id!}>[{s.admission_no}] {s.student_name}</SelectItem>)}
                      </SelectContent>
                   </Select>
                 </div>
                 <div><Label>Year</Label><Input value={paymentYear} onChange={e => setPaymentYear(e.target.value)} /></div>
              </div>

              {/* RESTORED PENDING INFO CARD */}
              {studentPendingInfo && (
                <Card className={`${studentPendingInfo.pendingAmount <= 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm ${studentPendingInfo.pendingAmount <= 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                      {studentPendingInfo.pendingAmount <= 0 ? '✓ All Fees Paid' : 'Pending Fee Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {studentPendingInfo.pendingAmount <= 0 ? (
                      <div className="text-center py-4">
                        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">All fees are paid up to date!</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div><span className="font-medium text-yellow-700">Monthly:</span><p className="text-yellow-900">₹{studentPendingInfo.monthlyFee}</p></div>
                          <div><span className="font-medium text-yellow-700">Total Due:</span><p className="text-yellow-900">₹{studentPendingInfo.totalDue}</p></div>
                          <div><span className="font-medium text-yellow-700">Paid:</span><p className="text-yellow-900">₹{studentPendingInfo.totalPaid}</p></div>
                          <div>
                            <span className="font-medium text-yellow-700">Balance:</span>
                            <p className="font-bold text-red-600">₹{studentPendingInfo.pendingAmount}</p>
                          </div>
                        </div>
                        {studentPendingInfo.pendingMonths.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium text-yellow-700">Pending Months:</span>
                            <p className="text-yellow-900 text-sm">{studentPendingInfo.pendingMonths.join(", ")}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Fee Types */}
              <div>
                 <Label>Fee Types</Label>
                 <div className="flex gap-4 flex-wrap mt-2">
                    {["Monthly Fee", "Exam Fee", "Admission Fee", "Other Fee", "Fine"].map(t => (
                       <label key={t} className="flex items-center gap-2 border p-2 rounded cursor-pointer">
                          <input type="checkbox" 
                            checked={selectedFeeTypes.includes(t as FeeType)} 
                            onChange={e => {
                               if(e.target.checked) setSelectedFeeTypes([...selectedFeeTypes, t as FeeType]);
                               else setSelectedFeeTypes(selectedFeeTypes.filter(x => x !== t));
                            }} 
                          />
                          {t}
                       </label>
                    ))}
                 </div>
              </div>

              {/* Month Selection */}
              <div>
                 <Label>Months</Label>
                 <div className="grid grid-cols-4 gap-2 mt-2">
                    {months.map(m => (
                       <label key={m} className="flex items-center gap-2">
                          <input type="checkbox" checked={paymentMonths.includes(m)}
                             onChange={e => {
                                if(e.target.checked) setPaymentMonths([...paymentMonths, m]);
                                else setPaymentMonths(paymentMonths.filter(x => x !== m));
                             }}
                          />
                          {m}
                       </label>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                 <Label>Amount</Label>
                 <Input value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /></div>
                 <div>
                    <Label>Payment Note (Optional)</Label>
                    <Input 
                        placeholder="e.g. Paid by Cheque, Late fee waived..." 
                        value={paymentNotes} 
                        onChange={e => setPaymentNotes(e.target.value)} 
                    />
                  </div>
              </div>

              <Button onClick={handleCollectFee} className="w-full">Submit Payment</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STUDENTS STATUS TAB */}
        <TabsContent value="students">
           <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-4">
                    <CardTitle>Student Fee Status</CardTitle>
                    {/* Class Filter */}
                    <Select value={filterClass} onValueChange={setFilterClass}>
                        <SelectTrigger className="w-[120px] h-8"><SelectValue placeholder="Class" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Classes</SelectItem>
                            {["Nursery", "LKG", "UKG", "One", "Two", "Three", "Four", "Five", "Six", "Seven"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {/* Search */}
                    <Input 
                        placeholder="Search Name/Adm No" 
                        className="h-8 w-[180px]" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                <div className="flex gap-2">
                    {/* BULK PRINT BUTTON */}
                    <Button variant="outline" size="sm" onClick={() => generateDueSlipPDF(filteredStudents, true)}>
                        <Printer className="mr-2 h-4 w-4 text-red-600"/> Print All Slips
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportDuesListToExcel}>
                        <Download className="mr-2 h-4 w-4 text-green-600"/> Excel
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                       <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filteredStudents.length === 0 ? (
                           <TableRow><TableCell colSpan={7} className="text-center">No students found.</TableCell></TableRow>
                       ) : (
                           filteredStudents.map(s => (
                              <TableRow key={s.studentId}>
                                 <TableCell>
                                     <div className="font-medium">{s.studentName}</div>
                                     <div className="text-xs text-gray-500">{s.admissionNo}</div>
                                 </TableCell>
                                 <TableCell>{s.classname}</TableCell>
                                 <TableCell>₹{s.totalDue}</TableCell>
                                 <TableCell>₹{s.totalPaid}</TableCell>
                                 <TableCell className={s.pendingAmount > 0 ? "text-red-600 font-bold" : "text-green-600"}>₹{s.pendingAmount}</TableCell>
                                 <TableCell>
                                     <Badge variant={s.pendingAmount > 0 ? "destructive" : "default"} className={s.pendingAmount <= 0 ? "bg-green-600" : ""}>
                                         {s.pendingAmount > 0 ? "Pending" : "Paid"}
                                     </Badge>
                                 </TableCell>
                                 <TableCell>
                                    {/* INDIVIDUAL SLIP BUTTON */}
                                    {s.pendingAmount > 0 && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => generateDueSlipPDF([s], false)}
                                            title="Print Due Slip"
                                        >
                                            <FileWarning className="h-4 w-4 text-orange-500" />
                                        </Button>
                                    )}
                                 </TableCell>
                              </TableRow>
                           ))
                       )}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history">
           <Card>
              <CardHeader className="flex flex-row justify-between">
                 <CardTitle>Global Payment History</CardTitle>
                 <Button variant="outline" onClick={exportPaymentHistoryToExcel}><Download className="mr-2 h-4 w-4"/> Export Excel</Button>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                       <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Adm No</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Action</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                    {allPayments.map(p => {
                          const student = students.find(s => s.id === p.studentId);
                          return (
                            <TableRow key={p._id}>
                               <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                               <TableCell>{student?.admission_no || "N/A"}</TableCell>
                               <TableCell>{p.studentName}</TableCell>
                               <TableCell>{p.classname}</TableCell>
                               <TableCell>{p.month} {p.year}</TableCell>
                               <TableCell>₹{p.totalAmount}</TableCell>
                               <TableCell>
                                  <Button size="sm" variant="ghost" onClick={() => generateSingleFeeReceipt(p)}>Receipt</Button>
                               </TableCell>
                            </TableRow>
                          );
                       })}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>

        {/* FEE STRUCTURE TAB */}
        <TabsContent value="structure">
           <Card>
              <CardHeader className="flex flex-row justify-between">
                 <CardTitle>Fee Structure (Database)</CardTitle>
                 {structLoading ? <Loader2 className="animate-spin" /> : <Button onClick={handleSaveFeeStructure}>Save Changes</Button>}
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Monthly Fee</TableHead><TableHead>Annual Fee</TableHead><TableHead>Exam Fee</TableHead><TableHead>Bus Fee</TableHead><TableHead>Other Fee</TableHead><TableHead>Fine</TableHead></TableRow></TableHeader>
                    <TableBody>
                       {localFeeStructure.map((f, i) => (
                          <TableRow key={f.classname}>
                             <TableCell>{f.classname}</TableCell>
                             <TableCell>
                                <Input type="number" value={f.monthlyFee} 
                                   onChange={e => {
                                      // IMMUTABLE UPDATE
                                      const newStructure = [...localFeeStructure];
                                      // Create a NEW object for this specific index
                                      newStructure[i] = { ...newStructure[i], monthlyFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.annualFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], annualFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.examFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], examFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.busFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], busFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.otherFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], otherFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.fine} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], fine: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>

        {/* STUDENT HISTORY SEARCH TAB */}
        <TabsContent value="student-history">
           <Card>
              <CardHeader><CardTitle>Search Student</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex gap-2">
                    <Input placeholder="Enter Admission No" value={admissionNoSearch} onChange={e => setAdmissionNoSearch(e.target.value)} />
                    <Button onClick={handleStudentHistorySearch}>Search</Button>
                 </div>
                 {searchedStudentInfo && (
                    <div className="mt-4">
                       <h3 className="font-bold text-lg">{searchedStudentInfo.name}</h3>
                       <p className="text-gray-500">Class: {searchedStudentInfo.classname} | Roll: {searchedStudentInfo.rollNo}</p>
                       
                       <Table className="mt-4">
                          <TableHeader>
                             <TableRow><TableHead>Month</TableHead><TableHead>Amount</TableHead></TableRow>
                          </TableHeader>
                          <TableBody>
                             {searchedStudentPayments.map(p => (
                                <TableRow key={p._id}>
                                   <TableCell>{p.month} {p.year}</TableCell>
                                   <TableCell>₹{p.totalAmount}</TableCell>
                                </TableRow>
                             ))}
                          </TableBody>
                       </Table>
                    </div>
                 )}
              </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default FeeManagement;