// Exam Schedule & Admit Card Management

export interface ExamSubject {
  subject: string;
  date: string;
  time: string;
  duration: string;
}

export interface ExamSchedule {
  examName: string;
  examDate: string;
  classname: string; // Class for which this exam schedule is configured
  subjects: ExamSubject[];
  allowStudentDownload: boolean; // Admin can enable/disable student access
}

export interface AdmitCardAccess {
  studentId: string;
  allowed: boolean;
  allowedDate?: string;
}

const EXAM_SCHEDULE_KEY = "examSchedule";
const ADMIT_CARD_ACCESS_KEY = "admitCardAccess";

// Get Exam Schedule
export const getExamSchedule = (): ExamSchedule | null => {
  try {
    const stored = localStorage.getItem(EXAM_SCHEDULE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading exam schedule:", error);
    return null;
  }
};

// Save Exam Schedule
export const saveExamSchedule = (schedule: ExamSchedule): void => {
  try {
    localStorage.setItem(EXAM_SCHEDULE_KEY, JSON.stringify(schedule));
  } catch (error) {
    console.error("Error saving exam schedule:", error);
  }
};

// Get Admit Card Access Status
export const getAdmitCardAccess = (studentId: string): boolean => {
  try {
    const stored = localStorage.getItem(ADMIT_CARD_ACCESS_KEY);
    if (!stored) return false;
    const access: AdmitCardAccess[] = JSON.parse(stored);
    const studentAccess = access.find(a => a.studentId === studentId);
    return studentAccess?.allowed || false;
  } catch (error) {
    console.error("Error loading admit card access:", error);
    return false;
  }
};

// Set Admit Card Access for Student
export const setAdmitCardAccess = (studentId: string, allowed: boolean): void => {
  try {
    const stored = localStorage.getItem(ADMIT_CARD_ACCESS_KEY);
    const access: AdmitCardAccess[] = stored ? JSON.parse(stored) : [];
    const existingIndex = access.findIndex(a => a.studentId === studentId);
    
    if (existingIndex >= 0) {
      access[existingIndex] = {
        studentId,
        allowed,
        allowedDate: allowed ? new Date().toISOString() : undefined,
      };
    } else {
      access.push({
        studentId,
        allowed,
        allowedDate: allowed ? new Date().toISOString() : undefined,
      });
    }
    
    localStorage.setItem(ADMIT_CARD_ACCESS_KEY, JSON.stringify(access));
  } catch (error) {
    console.error("Error saving admit card access:", error);
  }
};

// Allow All Students
export const allowAllStudents = (studentIds: string[]): void => {
  try {
    const access: AdmitCardAccess[] = studentIds.map(id => ({
      studentId: id,
      allowed: true,
      allowedDate: new Date().toISOString(),
    }));
    localStorage.setItem(ADMIT_CARD_ACCESS_KEY, JSON.stringify(access));
  } catch (error) {
    console.error("Error allowing all students:", error);
  }
};

// Get All Access Status
export const getAllAdmitCardAccess = (): AdmitCardAccess[] => {
  try {
    const stored = localStorage.getItem(ADMIT_CARD_ACCESS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading all admit card access:", error);
    return [];
  }
};














