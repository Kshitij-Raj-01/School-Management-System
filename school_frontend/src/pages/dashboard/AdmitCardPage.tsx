import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listStudents, Student } from "@/store/slices/studentSlice";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download } from "lucide-react";
import { AdmitCardTemplate } from "@/components/print/AdmitCardTemplate";
import jsPDF from "jspdf";
import schoolLogo from "@/assets/school-logo.png";
import { getExamSchedule } from "@/lib/examManagement";

const AdmitCardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, loading } = useSelector((state: RootState) => state.student);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [examName, setExamName] = useState("Final Term Examination 2024");
  
  // Load students if missing
  useEffect(() => {
    if (students.length === 0) {
      dispatch(listStudents());
    }
  }, [dispatch, students.length]);

  const selectedStudent = students.find(s => s._id === selectedStudentId);
  const examSchedule = getExamSchedule(); // Get from local storage if available

  // --- PDF GENERATION LOGIC (SINGLE) ---
  const handlePrint = async () => {
    if (!selectedStudent) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    
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
    } catch (e) { /* ignore */ }

    // --- DRAW SINGLE ADMIT CARD ---
    const margin = 15;
    const width = 180;
    let y = 15;

    // Double Border
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, 190, 277);
    pdf.setLineWidth(0.2);
    pdf.rect(12, 12, 186, 273);

    // Header
    if(logoData) pdf.addImage(logoData, 'PNG', margin, y, 20, 20);
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("R.N.T. PUBLIC SCHOOL", 105, y + 8, { align: "center" });
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Modipuram, Meerut (U.P.) | Affiliated to CBSE", 105, y + 14, { align: "center" });
    
    // Badge
    pdf.setFillColor(0, 0, 0);
    pdf.rect(85, y + 18, 40, 7, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("ADMIT CARD", 105, y + 23, { align: "center" });
    
    pdf.setTextColor(0, 0, 0);
    y += 35;

    // Exam Name
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(examName.toUpperCase(), 105, y, { align: "center" });
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Session: ${new Date().getFullYear()}-${new Date().getFullYear()+1}`, 105, y + 5, { align: "center" });
    
    y += 15;

    // Photo & Details
    const photoWidth = 35;
    const detailsX = margin + photoWidth + 5;
    const detailsWidth = width - photoWidth - 5;

    pdf.rect(margin, y, photoWidth, 45); // Photo Box
    pdf.setFontSize(8);
    pdf.text("PHOTO", margin + photoWidth/2, y + 22, { align: "center" });
    
    pdf.rect(margin, y + 45, photoWidth, 8); // Sign Box
    pdf.text("STUDENT SIGN", margin + photoWidth/2, y + 50, { align: "center" });

    // Details Grid
    const rowHeight = 9;
    const labelWidth = 35;
    const drawDetailRow = (lbl: string, val: string, yPos: number) => {
        pdf.rect(detailsX, yPos, labelWidth, rowHeight);
        pdf.rect(detailsX + labelWidth, yPos, detailsWidth - labelWidth, rowHeight);
        pdf.setFont("helvetica", "bold");
        pdf.text(lbl, detailsX + 2, yPos + 6);
        pdf.setFont("helvetica", "normal");
        pdf.text(val, detailsX + labelWidth + 2, yPos + 6);
    };

    drawDetailRow("Student Name", selectedStudent.student_name.toUpperCase(), y);
    drawDetailRow("Roll Number", selectedStudent.roll_no || "N/A", y + rowHeight);
    drawDetailRow("Class", selectedStudent.classname, y + rowHeight*2);
    drawDetailRow("Father's Name", selectedStudent.father_name || "-", y + rowHeight*3);
    drawDetailRow("Admission No", selectedStudent.admission_no, y + rowHeight*4);

    y += 65;

    // Schedule (If available)
    pdf.setFont("helvetica", "bold");
    pdf.text("EXAMINATION SCHEDULE", margin, y);
    y += 3;
    
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, y, width, 8, 'F');
    pdf.rect(margin, y, width, 8, 'S');
    pdf.text("Subject", margin + 2, y + 5.5);
    pdf.text("Date", margin + 60, y + 5.5);
    pdf.text("Time", margin + 100, y + 5.5);
    pdf.text("Duration", margin + 140, y + 5.5);
    y += 8;
    
    if (examSchedule && examSchedule.subjects) {
        pdf.setFont("helvetica", "normal");
        examSchedule.subjects.forEach(sub => {
            pdf.rect(margin, y, width, 8, 'S');
            pdf.text(sub.subject, margin + 2, y + 5.5);
            pdf.text(new Date(sub.date).toLocaleDateString(), margin + 60, y + 5.5);
            pdf.text(sub.time, margin + 100, y + 5.5);
            pdf.text(sub.duration, margin + 140, y + 5.5);
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
        "3. Use of electronic gadgets is strictly prohibited."
    ];
    instructions.forEach(inst => { pdf.text(inst, margin, y); y += 4; });

    // Footer Signatures
    const sigY = 270;
    pdf.setLineWidth(0.2);
    pdf.line(margin, sigY, margin + 40, sigY);
    pdf.text("Class Teacher", margin + 5, sigY + 4);

    pdf.line(150, sigY, 190, sigY);
    pdf.text("Controller of Exams", 155, sigY + 4);

    pdf.save(`Admit_Card_${selectedStudent.student_name}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Generate Admit Card</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader><CardTitle className="text-lg">Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
                <SelectTrigger><SelectValue placeholder="Search student..." /></SelectTrigger>
                <SelectContent>
                  {loading ? <div className="p-2"><Loader2 className="animate-spin h-4 w-4" /></div> : 
                    students.map((s) => <SelectItem key={s._id} value={s._id || "unknown"}>{s.student_name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Examination Name</Label>
              <Input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g. Mid-Term 2024" />
            </div>
            <Button className="w-full" onClick={handlePrint} disabled={!selectedStudent}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <div className="lg:col-span-3 bg-gray-100 p-8 rounded-lg border flex justify-center items-start min-h-[500px] overflow-auto">
          {selectedStudent ? (
            <div className="shadow-2xl origin-top transform scale-90">
              <AdmitCardTemplate 
                student={selectedStudent} 
                examName={examName} 
                examSchedule={examSchedule}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-20">
              <p>Select a student to preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdmitCardPage;