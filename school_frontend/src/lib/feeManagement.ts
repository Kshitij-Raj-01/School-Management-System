import { FeeRecord } from "../store/slices/feeSlice";

// --- INTERFACES ---

export interface FeeStructure {
  classname: string;
  monthlyFee: number;
  annualFee: number;
  examFee: number;
  otherFee: number;
  fine: number;
  busFee: number;
}

export type FeeType = "Monthly Fee" | "Exam Fee" | "Other Fee" | "Admission Fee" | "Readmission Fee" | "Fine" | "Bus Fee";

export interface StudentFeeStatus {
  studentId: string;
  studentName: string;
  admissionNo: string;
  classname: string;
  rollNo: string;
  monthlyFee: number;
  totalDue: number;
  totalPaid: number;
  pendingMonths: string[];
  pendingAmount: number;
  lastPaymentDate?: string;
}

// --- HELPER FUNCTIONS ---

// Logic to determine Academic Year (Starts in April)
export const getAcademicYear = () => {
  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0 = Jan
  const currentYear = now.getFullYear();
  // If Jan-Mar, session started previous year. If Apr-Dec, session started this year.
  return currentMonthIdx >= 3 ? currentYear : currentYear - 1;
};

/**
 * Calculates the fee status for a single student based on the provided Fee Structure list.
 */
export const getStudentFeeStatus = (
  studentId: string, 
  studentName: string, 
  admissionNo: string, 
  classname: string, 
  rollNo: string, 
  allPayments: FeeRecord[], 
  feeStructureList: FeeStructure[], // <--- Now accepts live data
  usesBus: boolean = false
): StudentFeeStatus => {
  
  // Find fee structure for this specific class
  const feeStructure = feeStructureList.find(s => s.classname === classname);
  
  // Filter payments for this student
  const studentPayments = allPayments.filter(p => String(p.studentId) === String(studentId));
  
  // Default values if structure missing
  if (!feeStructure) {
    return {
      studentId, studentName, admissionNo, classname, rollNo,
      monthlyFee: 0, totalDue: 0, totalPaid: 0, pendingMonths: [], pendingAmount: 0,
    };
  }

  // --- 1. Determine Months Passed ---
  const academicYearStart = getAcademicYear();
  const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
  
  const monthMap: { [key: string]: number } = {
    "April": 0, "May": 1, "June": 2, "July": 3, "August": 4, "September": 5, 
    "October": 6, "November": 7, "December": 8, "January": 9, "February": 10, "March": 11
  };

  const now = new Date();
  // Calculate how many months have passed in the academic year (0 to 12)
  let monthsPassed = 0;
  const currentMonthIndex = now.getMonth(); // 0=Jan, 3=April
  
  if (currentMonthIndex >= 3) {
     // April (3) to Dec (11)
     monthsPassed = currentMonthIndex - 3 + 1; 
  } else {
     // Jan (0) to March (2) -> represents months 10, 11, 12 of academic year
     monthsPassed = 9 + currentMonthIndex + 1;
  }

  // --- 2. Calculate Dues ---
  // Logic: Monthly Fee + Bus Fee (if applicable)
  let monthlyRate = feeStructure.monthlyFee;
  if (usesBus) monthlyRate += feeStructure.busFee;

  const totalDue = Math.round(monthsPassed * monthlyRate);

  // --- 3. Calculate Paid ---
  // We only count "monthly_fees" towards the monthly due. 
  // Exam fees etc are separate one-time payments.
  const totalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.monthly_fees) || 0), 0);

  const pendingAmount = Math.max(0, totalDue - totalPaid);

  // --- 4. Identify Pending Months (Estimate) ---
  const pendingMonths: string[] = [];
  if (pendingAmount > 0 && monthlyRate > 0) {
      const count = Math.ceil(pendingAmount / monthlyRate);
      pendingMonths.push(`${count} Months Pending`);
  }

  return {
    studentId, studentName, admissionNo, classname, rollNo,
    monthlyFee: Math.round(monthlyRate),
    totalDue, 
    totalPaid, 
    pendingMonths, 
    pendingAmount,
    lastPaymentDate: studentPayments.length > 0 ? studentPayments[0].date : undefined,
  };
};

/**
 * Calculates status for an array of students.
 */
export const getAllStudentsFeeStatus = (
  students: Array<any>, 
  allPayments: FeeRecord[],
  feeStructureList: FeeStructure[] // <--- Now required
): StudentFeeStatus[] => {
  return students.map(student => 
    getStudentFeeStatus(
      student._id,
      student.student_name,
      student.admission_no,
      student.classname,
      student.roll_no || "N/A",
      allPayments,
      feeStructureList,
      student.usesBus || false
    )
  );
};

// --- STATISTICS ---
export const getTotalCollection = (allPayments: FeeRecord[]): { total: number; thisMonth: number; thisYear: number } => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const total = allPayments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  
  const thisMonth = allPayments
    .filter(p => {
      const date = new Date(p.date);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
    
  const thisYear = allPayments
    .filter(p => {
      const date = new Date(p.date);
      return date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);

  return { total, thisMonth, thisYear };
};