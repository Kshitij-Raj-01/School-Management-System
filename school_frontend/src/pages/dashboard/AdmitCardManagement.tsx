import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listStudents, Student } from "@/store/slices/studentSlice";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Settings, 
  Users, 
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { AdmitCardTemplate } from "@/components/print/AdmitCardTemplate";
import jsPDF from "jspdf";
import schoolLogo from "@/assets/school-logo.png";
import {
  getExamSchedule,
  saveExamSchedule,
  allowAllStudents,
  getAllAdmitCardAccess,
  setAdmitCardAccess,
  type ExamSchedule,
  type ExamSubject,
} from "@/lib/examManagement";

const AdmitCardManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students } = useSelector((state: RootState) => state.student);
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const role = userInfo?.role;

  const [activeTab, setActiveTab] = useState("schedule");
  const [examSchedule, setExamSchedule] = useState<ExamSchedule | null>(null);
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedRollNo, setSelectedRollNo] = useState("");
  const [admissionNoSearch, setAdmissionNoSearch] = useState("");

  // Exam Schedule Form
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examClassname, setExamClassname] = useState("");
  const [subjects, setSubjects] = useState<ExamSubject[]>([
    { subject: "", date: "", time: "", duration: "2 hours" },
  ]);
  const [allowStudentDownload, setAllowStudentDownload] = useState(false);
  
  // Refs for preview (optional if using jsPDF direct generation)
  const printRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    dispatch(listStudents());
    const schedule = getExamSchedule();
    if (schedule) {
      setExamSchedule(schedule);
      setExamName(schedule.examName);
      setExamDate(schedule.examDate);
      setExamClassname(schedule.classname || "");
      setSubjects(schedule.subjects);
      setAllowStudentDownload(schedule.allowStudentDownload);
    }
  }, [dispatch]);

  const isAdmin = role === "admin";
  const classes = Array.from(new Set(students.map(s => s.classname))).sort();

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader><CardTitle>Access Restricted</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Only admin can manage admit cards.</p></CardContent>
        </Card>
      </div>
    );
  }

  // --- PDF GENERATION LOGIC (BULK) ---
  const generateAdmitCardPDF = async (studentsToPrint: Student[]) => {
    if(!examSchedule) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Pre-load logo
    let logoData: string | null = null;
    try {
      const img = new Image();
      img.src = schoolLogo;
      await new Promise<void>((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      logoData = canvas.toDataURL('image/png');
    } catch (e) { console.error("Logo load error", e); }

    for (let i = 0; i < studentsToPrint.length; i++) {
        const student = studentsToPrint[i];
        if (i > 0) pdf.addPage(); // New page for each student

        // --- DRAW ADMIT CARD ---
        const margin = 15;
        const width = 180; // Content width
        const startY = 15;
        let y = startY;

        // Double Border
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.5);
        pdf.rect(10, 10, 190, 277); // Outer
        pdf.setLineWidth(0.2);
        pdf.rect(12, 12, 186, 273); // Inner

        // Header
        if(logoData) pdf.addImage(logoData, 'PNG', margin, y, 20, 20);
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.text("R.N.T. PUBLIC SCHOOL", 105, y + 8, { align: "center" });
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text("Modipuram, Meerut (U.P.) | Affiliated to CBSE", 105, y + 14, { align: "center" });
        
        // ADMIT CARD Badge
        pdf.setFillColor(0, 0, 0);
        pdf.rect(85, y + 18, 40, 7, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("ADMIT CARD", 105, y + 23, { align: "center" });
        
        pdf.setTextColor(0, 0, 0); // Reset text color
        y += 35;

        // Exam Name
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(String(examSchedule.examName || "Examination").toUpperCase(), 105, y, { align: "center" });
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Session: ${new Date().getFullYear()}-${new Date().getFullYear()+1}`, 105, y + 5, { align: "center" });
        
        y += 15;

        // Photo & Details Container
        const photoWidth = 35;
        const detailsX = margin + photoWidth + 5;
        const detailsWidth = width - photoWidth - 5;

        // Photo Box
        pdf.rect(margin, y, photoWidth, 45);
        pdf.setFontSize(8);
        pdf.text("PHOTO", margin + photoWidth/2, y + 22, { align: "center" });
        
        pdf.rect(margin, y + 45, photoWidth, 8); // Sign box
        pdf.text("STUDENT SIGN", margin + photoWidth/2, y + 50, { align: "center" });

        // Details Grid
        const rowHeight = 9;
        const labelWidth = 35;
        
        // --- SAFE DRAW FUNCTION (FIXES THE ERROR) ---
        const drawDetailRow = (lbl: string, val: any, yPos: number) => {
            pdf.rect(detailsX, yPos, labelWidth, rowHeight); // Label Box
            pdf.rect(detailsX + labelWidth, yPos, detailsWidth - labelWidth, rowHeight); // Value Box
            pdf.setFont("helvetica", "bold");
            pdf.text(String(lbl), detailsX + 2, yPos + 6);
            pdf.setFont("helvetica", "normal");
            // Ensure val is always a string to prevent jsPDF errors
            pdf.text(String(val || "-"), detailsX + labelWidth + 2, yPos + 6);
        };

        drawDetailRow("Student Name", (student.student_name || "").toUpperCase(), y);
        drawDetailRow("Roll Number", student.roll_no || "N/A", y + rowHeight);
        drawDetailRow("Class", student.classname || "", y + rowHeight*2);
        drawDetailRow("Father's Name", student.father_name|| "-", y + rowHeight*3);
        drawDetailRow("Admission No", student.admission_no || "", y + rowHeight*4);

        y += 65;

        // Schedule Table
        pdf.setFont("helvetica", "bold");
        pdf.text("EXAMINATION SCHEDULE", margin, y);
        y += 3;
        
        // Table Header
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, y, width, 8, 'F');
        pdf.rect(margin, y, width, 8, 'S');
        pdf.text("Subject", margin + 2, y + 5.5);
        pdf.text("Date", margin + 60, y + 5.5);
        pdf.text("Time", margin + 100, y + 5.5);
        pdf.text("Duration", margin + 140, y + 5.5);
        
        y += 8;
        
        // Table Body
        pdf.setFont("helvetica", "normal");
        if(examSchedule.subjects && examSchedule.subjects.length > 0) {
            examSchedule.subjects.forEach(sub => {
                pdf.rect(margin, y, width, 8, 'S');
                pdf.text(String(sub.subject || "-"), margin + 2, y + 5.5);
                pdf.text(sub.date ? new Date(sub.date).toLocaleDateString() : "-", margin + 60, y + 5.5);
                pdf.text(String(sub.time || "-"), margin + 100, y + 5.5);
                pdf.text(String(sub.duration || "-"), margin + 140, y + 5.5);
                y += 8;
            });
        } else {
            pdf.rect(margin, y, width, 8, 'S');
            pdf.text("Refer to Date Sheet", margin + 2, y + 5.5);
            y += 8;
        }

        y += 10;

        // Instructions
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("IMPORTANT INSTRUCTIONS:", margin, y);
        y += 5;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        const instructions = [
            "1. Candidate must carry this Admit Card to the examination hall.",
            "2. Report to the examination center at least 30 minutes before scheduled time.",
            "3. Electronic gadgets (Mobile, Calculator) are strictly prohibited.",
            "4. Maintain silence and discipline inside the examination hall."
        ];
        instructions.forEach(inst => {
            pdf.text(inst, margin, y);
            y += 4;
        });

        // Signatures
        const sigY = 270;
        pdf.setLineWidth(0.2);
        pdf.line(margin, sigY, margin + 40, sigY);
        pdf.text("Class Teacher", margin + 5, sigY + 4);

        pdf.line(150, sigY, 190, sigY);
        pdf.text("Controller of Exams", 155, sigY + 4);
    }

    pdf.save(`Admit_Cards_${selectedClass}.pdf`);
    toast.success(`Generated admit cards for ${studentsToPrint.length} students!`);
  };

  const handleBulkDownload = () => {
    let studentsToPrint: Student[] = [];
    if (selectedClass !== "All") {
      studentsToPrint = students.filter(s => s.classname === selectedClass);
    } else if (selectedRollNo.trim()) {
      const student = students.find(s => s.roll_no === selectedRollNo.trim());
      if (student) studentsToPrint = [student];
    } else {
      studentsToPrint = students;
    }

    if (studentsToPrint.length === 0) {
      toast.error("No students found to download");
      return;
    }
    if (!examSchedule) {
      toast.error("Please set exam schedule first");
      return;
    }

    generateAdmitCardPDF(studentsToPrint);
  };

  const handleSaveSchedule = () => {
    if (!examName.trim() || !examDate.trim() || !examClassname.trim() || subjects.some(s => !s.subject || !s.date || !s.time)) {
      toast.error("Please fill all required fields");
      return;
    }
    const schedule: ExamSchedule = {
      examName: examName.trim(),
      examDate: examDate.trim(),
      classname: examClassname.trim(),
      subjects: subjects.filter(s => s.subject && s.date && s.time),
      allowStudentDownload,
    };
    saveExamSchedule(schedule);
    setExamSchedule(schedule);
    toast.success("Exam schedule saved successfully!");
  };

  const handleAddSubject = () => { setSubjects([...subjects, { subject: "", date: "", time: "", duration: "2 hours" }]); };
  const handleRemoveSubject = (index: number) => { setSubjects(subjects.filter((_, i) => i !== index)); };
  const handleSubjectChange = (index: number, field: keyof ExamSubject, value: string) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };
  const handleAllowAllStudents = () => {
    const studentIds = students.map(s => s._id || "").filter(id => id);
    allowAllStudents(studentIds);
    toast.success("Admit card access enabled for all students!");
  };

  // Student filtering for preview
  const filteredStudents = students.filter(s => {
    if (selectedClass !== "All" && s.classname !== selectedClass) return false;
    if (selectedRollNo.trim() && s.roll_no !== selectedRollNo.trim()) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admit Card Management</h1>
        <p className="text-muted-foreground mt-1">Manage exam schedule and generate admit cards</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule"><Settings className="w-4 h-4 mr-2" /> Exam Schedule</TabsTrigger>
          <TabsTrigger value="download"><Download className="w-4 h-4 mr-2" /> Download Admit Cards</TabsTrigger>
          <TabsTrigger value="access"><Users className="w-4 h-4 mr-2" /> Student Access</TabsTrigger>
        </TabsList>

        {/* EXAM SCHEDULE TAB */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Exam Schedule Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Examination Name *</Label>
                  <Input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g. Final Term Examination 2024" />
                </div>
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select value={examClassname} onValueChange={setExamClassname}>
                    <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Exam Date *</Label>
                  <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-bold">Subjects & Schedule</Label>
                  <Button variant="outline" size="sm" onClick={handleAddSubject}>+ Add Subject</Button>
                </div>
                {subjects.map((subject, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2"><Label>Subject</Label><Input value={subject.subject} onChange={(e) => handleSubjectChange(index, "subject", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Date</Label><Input type="date" value={subject.date} onChange={(e) => handleSubjectChange(index, "date", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Time</Label><Input type="time" value={subject.time} onChange={(e) => handleSubjectChange(index, "time", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Duration</Label><Input value={subject.duration} onChange={(e) => handleSubjectChange(index, "duration", e.target.value)} /></div>
                    </div>
                    {subjects.length > 1 && <Button variant="destructive" size="sm" className="mt-2" onClick={() => handleRemoveSubject(index)}>Remove</Button>}
                  </Card>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="allow-download" checked={allowStudentDownload} onCheckedChange={setAllowStudentDownload} />
                <Label htmlFor="allow-download" className="cursor-pointer">Allow students to download their own admit cards</Label>
              </div>
              <Button onClick={handleSaveSchedule} className="w-full"><Settings className="w-4 h-4 mr-2" /> Save Exam Schedule</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOWNLOAD TAB */}
        <TabsContent value="download" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Bulk Download</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Filter by Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Classes</SelectItem>
                      {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Filter by Roll No</Label>
                  <Input placeholder="Enter Roll No" value={selectedRollNo} onChange={(e) => setSelectedRollNo(e.target.value)} />
                </div>
                <div className="flex items-end">
                   <Button onClick={handleBulkDownload} disabled={!examSchedule} className="w-full">
                     <Download className="w-4 h-4 mr-2" /> Download Admit Cards
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview using the Template Component */}
          {examSchedule && filteredStudents.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Preview ({filteredStudents.length} Students)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {filteredStudents.slice(0, 1).map((student) => (
                    <div key={student._id} className="border p-4 bg-gray-100 rounded-lg overflow-auto">
                        <p className="mb-2 text-sm text-center text-gray-500">Preview for {student.student_name} (Only 1 shown)</p>
                        <div className="transform scale-90 origin-top">
                            <AdmitCardTemplate student={student} examSchedule={examSchedule} examName={examSchedule.examName} />
                        </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ACCESS TAB */}
        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Student Access Control</CardTitle>
                <Button onClick={handleAllowAllStudents} variant="outline"><CheckCircle2 className="w-4 h-4 mr-2" /> Allow All Students</Button>
              </div>
            </CardHeader>
            <CardContent>
               {/* Simplified Access Table */}
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b"><th className="text-left p-2">Name</th><th className="text-left p-2">Class</th><th className="text-left p-2">Access</th></tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const access = getAllAdmitCardAccess().find(a => a.studentId === student._id);
                        const isAllowed = access?.allowed || false;
                        return (
                          <tr key={student._id} className="border-b">
                            <td className="p-2">{student.student_name}</td>
                            <td className="p-2">{student.classname}</td>
                            <td className="p-2">
                              <Switch checked={isAllowed} onCheckedChange={(c) => { setAdmitCardAccess(student._id || "", c); toast.success("Updated!"); }} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdmitCardManagement;