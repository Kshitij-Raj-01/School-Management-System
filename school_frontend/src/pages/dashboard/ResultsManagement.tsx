import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { listStudents } from "@/store/slices/studentSlice"; 
import { addResult, fetchResults, resetResultState } from "@/store/slices/resultSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// IMPORT GENERIC LABEL (Correct Import)
import { Label } from "@/components/ui/label"; 
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Plus, Trash2, Save, Printer, Settings2 } from "lucide-react";
import jsPDF from "jspdf";
import schoolLogo from "@/assets/school-logo.png";

// --- CONFIGURATION ---
const SCHOOL_NAME = "R.N.T. PUBLIC SCHOOL";
const SCHOOL_ADDRESS = "Modipuram, Meerut, Uttar Pradesh - 250110";
const AFFILIATION = "Affiliated to CBSE, New Delhi";

// Schema
const resultFormSchema = z.object({
  classname: z.string().min(1, "Please select a class"),
  academicYear: z.string().min(1, "Please enter academic year"),
  examType: z.string().min(1, "Please select exam type"),
});

// Types
interface Subject { name: string; code: string; maxMarks: number; }
interface GradingConfig {
    first: { min: number; max: number };
    second: { min: number; max: number };
    third: { min: number; max: number };
    fail: { min: number; max: number };
}

const ResultsManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students } = useSelector((state: RootState) => state.student);
  const { results, success } = useSelector((state: RootState) => state.results);
  
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState<string>("");
  const [newSubjectMax, setNewSubjectMax] = useState<number>(100);
  const [marksInput, setMarksInput] = useState<{ [key: string]: number }>({}); 
  
  // Grading State
  const [showGradingConfig, setShowGradingConfig] = useState(false);
  const [gradingConfig, setGradingConfig] = useState<GradingConfig>({
    first: { min: 90, max: 100 },
    second: { min: 75, max: 89 },
    third: { min: 50, max: 74 },
    fail: { min: 0, max: 49 }
  });

  const form = useForm<z.infer<typeof resultFormSchema>>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      classname: "",
      academicYear: new Date().getFullYear().toString() + "-" + (new Date().getFullYear() + 1).toString(),
      examType: "Final Term",
    },
  });

  // --- FIX 2: Watch inputs to trigger Re-Fetch ---
  const watchedExamType = form.watch("examType");
  const watchedYear = form.watch("academicYear");

  const classes = ["Nursery", "LKG", "UKG", "One", "Two", "Three", "Four", "Five", "Six", "Seven"];
  const examTypes = ["Mid Term", "Final Term", "Unit Test 1", "Unit Test 2"];

  // --- DATA LOADING EFFECT ---
  useEffect(() => {
    if (selectedClass) {
      // 1. Load Students
      dispatch(listStudents()); 
      
      // 2. Load Subjects
      loadSubjectsForClass(selectedClass);

      // 3. Fetch Previous Results (Using watched variables ensures update on change)
      if(watchedExamType) {
          dispatch(fetchResults({ 
            classname: selectedClass, 
            examName: watchedExamType,
            academicYear: watchedYear
          }));
      }
    }
  }, [selectedClass, watchedExamType, watchedYear, dispatch]);

  useEffect(() => {
    if (success) {
        toast.success("Result Saved Successfully!");
        dispatch(resetResultState());
    }
  }, [success, dispatch]);

  const filteredStudents = students.filter(s => s.classname === selectedClass);

  // --- DYNAMIC SUBJECT MANAGEMENT ---
  const loadSubjectsForClass = (classname: string) => {
    try {
        const stored = localStorage.getItem(`subjects_${classname}`);
        if (stored) {
            setSubjects(JSON.parse(stored));
            return;
        }
    } catch(e) {}

    let subList: Subject[] = [];
    if (["Nursery", "LKG", "UKG"].includes(classname)) {
        subList = [
            { name: "English", code: "ENG", maxMarks: 50 },
            { name: "Hindi", code: "HIN", maxMarks: 50 },
            { name: "Mathematics", code: "MAT", maxMarks: 50 },
        ];
    } else {
        subList = [
            { name: "English", code: "ENG", maxMarks: 100 },
            { name: "Mathematics", code: "MAT", maxMarks: 100 },
            { name: "Science", code: "SCI", maxMarks: 100 },
        ];
    }
    setSubjects(subList);
    localStorage.setItem(`subjects_${classname}`, JSON.stringify(subList));
  };

  const addSubject = () => {
      if (!newSubject.trim()) return toast.error("Enter subject name");
      if (!selectedClass) return toast.error("Select class first");

      const newSubObj: Subject = {
          name: newSubject,
          code: newSubject.substring(0, 3).toUpperCase(),
          maxMarks: newSubjectMax || 100
      };

      const updated = [...subjects, newSubObj];
      setSubjects(updated);
      localStorage.setItem(`subjects_${selectedClass}`, JSON.stringify(updated));
      setNewSubject("");
      toast.success("Subject Added");
  };

  const removeSubject = (subName: string) => {
      const updated = subjects.filter(s => s.name !== subName);
      setSubjects(updated);
      localStorage.setItem(`subjects_${selectedClass}`, JSON.stringify(updated));
      toast.success("Subject Removed");
  };

  // --- DYNAMIC GRADING ---
  const calculateGrade = (percentage: number) => {
      if (percentage >= gradingConfig.first.min) return "A";
      if (percentage >= gradingConfig.second.min) return "B";
      if (percentage >= gradingConfig.third.min) return "C";
      return "F";
  };

  const handleSaveResult = async (studentId: string, studentName: string, admNo: string) => {
    const examType = form.getValues("examType");
    const academicYear = form.getValues("academicYear");
    let savedCount = 0;
    
    for (const sub of subjects) {
        const key = `${studentId}-${sub.name}`;
        const marks = marksInput[key];
        
        // Save if marks are entered OR if marks exist in backend (preserve update)
        if (marks !== undefined) {
             const resultData = {
                studentId,
                studentName,
                admissionNo: admNo,
                classname: selectedClass,
                examName: examType,
                academicYear: academicYear,
                subject: sub.name,
                marksObtained: marks,
                totalMarks: sub.maxMarks, 
                grade: calculateGrade((marks/sub.maxMarks)*100),
                remarks: "Generated"
             };
             await dispatch(addResult(resultData));
             savedCount++;
        }
    }
    if(savedCount > 0) toast.success(`Saved results for ${studentName}`);
  };

  // ==========================================
  //  PROFESSIONAL MARKSHEET GENERATOR (BULK)
  // ==========================================
  const generateBulkMarksheet = async () => {
    if (filteredStudents.length === 0) {
        toast.error("No students found in this class.");
        return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);

    let logoData: string | null = null;
    try {
        const img = new Image();
        img.src = schoolLogo;
        await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
        if(img.complete && img.naturalHeight !== 0) {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);
            logoData = canvas.toDataURL("image/png");
        }
    } catch (e) {}

    // --- FIX 1: Helper to format DOB ---
    const formatDOB = (dobString: any) => {
        if (!dobString) return "-";
        const date = new Date(dobString);
        if (isNaN(date.getTime())) return dobString; // Return original if invalid
        // Returns DD/MM/YYYY
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    filteredStudents.forEach((student, index) => {
        if (index > 0) pdf.addPage(); 

        pdf.setLineWidth(0.5);
        pdf.setDrawColor(0);
        pdf.rect(5, 5, 200, 287); 
        pdf.setLineWidth(0.2);
        pdf.rect(7, 7, 196, 283); 

        let yPos = 20;

        if (logoData) pdf.addImage(logoData, 'PNG', margin + 5, 12, 22, 22);
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.setTextColor(220, 53, 69); 
        pdf.text(SCHOOL_NAME, pageWidth / 2, yPos, { align: "center" });
        
        yPos += 6;
        pdf.setFontSize(10);
        pdf.setTextColor(0);
        pdf.setFont("helvetica", "normal");
        pdf.text(SCHOOL_ADDRESS, pageWidth / 2, yPos, { align: "center" });
        
        yPos += 5;
        pdf.setFontSize(9);
        pdf.text(AFFILIATION, pageWidth / 2, yPos, { align: "center" });

        yPos += 8;
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);

        yPos += 10;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin + 30, yPos - 6, contentWidth - 60, 9, 'F');
        pdf.text("REPORT CARD", pageWidth / 2, yPos, { align: "center" });
        
        yPos += 6;
        pdf.setFontSize(10);
        pdf.text(`Academic Session: ${form.getValues("academicYear")}`, pageWidth / 2, yPos, { align: "center" });

        yPos += 15;
        const leftX = margin + 5;
        const rightX = pageWidth / 2 + 10;
        const rowH = 7;

        pdf.setFontSize(10);
        pdf.setTextColor(0);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Admission No:", leftX, yPos);
        pdf.setFont("helvetica", "normal"); pdf.text(student.admission_no, leftX + 30, yPos);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Class & Sec:", rightX, yPos);
        pdf.setFont("helvetica", "normal"); pdf.text(`${student.classname} - A`, rightX + 30, yPos);
        
        yPos += rowH;

        pdf.setFont("helvetica", "bold"); pdf.text("Student Name:", leftX, yPos);
        pdf.setFont("helvetica", "normal"); pdf.text(student.student_name, leftX + 30, yPos);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Roll No:", rightX, yPos);
        pdf.setFont("helvetica", "normal"); pdf.text(student.roll_no || "-", rightX + 30, yPos);

        yPos += rowH;
        pdf.setFont("helvetica", "bold"); pdf.text("Father's Name:", leftX, yPos);
        pdf.setFont("helvetica", "normal"); pdf.text(student.father_name || "-", leftX + 30, yPos);
        
        pdf.setFont("helvetica", "bold"); pdf.text("DOB:", rightX, yPos);
        
        // --- USE FORMATTER HERE ---
        pdf.setFont("helvetica", "normal"); pdf.text(formatDOB(student.dob), rightX + 30, yPos);

        yPos += 15;
        pdf.setFont("helvetica", "bold");
        pdf.text(`Exam: ${form.getValues("examType")}`, margin, yPos);
        
        yPos += 4;
        const col1 = margin;        
        const col2 = margin + 70;   
        const col3 = margin + 110;  
        const col4 = margin + 150;  

        pdf.setFillColor(50, 50, 50); 
        pdf.rect(margin, yPos, contentWidth, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.text("SUBJECT", col1 + 5, yPos + 5.5);
        pdf.text("MAX MARKS", col2 + 5, yPos + 5.5);
        pdf.text("OBT MARKS", col3 + 5, yPos + 5.5);
        pdf.text("GRADE", col4 + 5, yPos + 5.5);

        yPos += 8;
        pdf.setTextColor(0);
        pdf.setFont("helvetica", "normal");

        let totalMax = 0;
        let totalObt = 0;

        subjects.forEach((sub, i) => {
             const res = results.find(r => 
                r.studentId === student._id && 
                r.examName === form.getValues("examType") && 
                r.subject === sub.name
             );

             // Use fallback 0 if not found, but display "-" if truly missing
             const marks = res ? res.marksObtained : 0;
             const displayMarks = res ? String(res.marksObtained) : "-";
             const grade = res ? res.grade : "-";
             
             if (res) {
                 totalMax += sub.maxMarks;
                 totalObt += marks;
             }

             if(i % 2 !== 0) { pdf.setFillColor(245, 245, 245); pdf.rect(margin, yPos, contentWidth, 8, 'F'); }
             pdf.setDrawColor(200);
             pdf.rect(margin, yPos, contentWidth, 8, 'S');

             pdf.text(sub.name, col1 + 5, yPos + 5.5);
             pdf.text(String(sub.maxMarks), col2 + 5, yPos + 5.5);
             pdf.text(displayMarks, col3 + 5, yPos + 5.5);
             pdf.text(grade, col4 + 5, yPos + 5.5);
             
             yPos += 8;
        });

        yPos += 5;
        const percentage = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
        let resultStatus = percentage >= gradingConfig.fail.min && percentage <= gradingConfig.fail.max ? "FAILED" : "PASSED";
        if (percentage < 33) resultStatus = "FAILED";
        
        pdf.setFont("helvetica", "bold");
        pdf.text("Grand Total:", col1 + 5, yPos + 5);
        pdf.text(`${totalObt} / ${totalMax}`, col2 + 5, yPos + 5);
        
        pdf.text("Percentage:", col3 + 5, yPos + 5);
        pdf.text(`${percentage.toFixed(2)} %`, col4 + 5, yPos + 5);

        yPos += 15;
        pdf.setDrawColor(0);
        pdf.rect(margin, yPos, contentWidth, 12);
        pdf.text("FINAL RESULT:", margin + 5, yPos + 8);
        
        pdf.setFontSize(12);
        if (resultStatus === "PASSED") pdf.setTextColor(0, 128, 0); 
        else pdf.setTextColor(200, 0, 0); 
        pdf.text(resultStatus, margin + 40, yPos + 8);
        pdf.setTextColor(0);

        const footerY = pageHeight - 40;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        
        pdf.text("Class Teacher", margin + 10, footerY);
        pdf.text("Parent / Guardian", pageWidth / 2 - 15, footerY);
        pdf.text("Principal", pageWidth - margin - 20, footerY);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text("Date: " + new Date().toLocaleDateString(), margin + 10, footerY + 15);
    });

    pdf.save(`ReportCards_Class_${selectedClass}.pdf`);
    toast.success("Marksheets Generated Successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader><CardTitle>Results Management</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <FormField control={form.control} name="classname" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Class</FormLabel>
                    <Select onValueChange={(val) => { field.onChange(val); setSelectedClass(val); }} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>
               )} />
               <FormField control={form.control} name="examType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>{examTypes.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>
               )} />
               <FormField control={form.control} name="academicYear" render={({ field }) => (
                  <FormItem><FormLabel>Academic Year</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
               )} />
            </div>
          </Form>
        </CardContent>
      </Card>

      {selectedClass && (
        <>
            {/* --- CONFIGURATION SECTION --- */}
            <Card>
                <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Subjects & Grading</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setShowGradingConfig(!showGradingConfig)}>
                        <Settings2 className="w-4 h-4 mr-2"/> {showGradingConfig ? "Hide Config" : "Grading Rules"}
                    </Button>
                </div>
                </CardHeader>
                <CardContent>
                    {/* Add Subject */}
                    <div className="flex gap-4 mb-6 items-end">
                        <div className="flex-1">
                            <Label className="mb-2 block">Subject Name</Label>
                            <Input placeholder="e.g. Science" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
                        </div>
                        <div className="w-32">
                            <Label className="mb-2 block">Max Marks</Label>
                            <Input type="number" value={newSubjectMax} onChange={(e) => setNewSubjectMax(Number(e.target.value))} />
                        </div>
                        <Button onClick={addSubject}><Plus className="w-4 h-4 mr-2" /> Add</Button>
                    </div>

                    {/* Subject List */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {subjects.map((subject) => (
                        <div key={subject.name} className="flex items-center justify-between p-3 bg-slate-50 border rounded-md shadow-sm">
                            <div>
                                <span className="font-semibold block">{subject.name}</span>
                                <span className="text-xs text-gray-500">Max: {subject.maxMarks}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeSubject(subject.name)} className="text-red-500 hover:text-red-700 h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                        ))}
                    </div>

                    {/* Grading Config */}
                    {showGradingConfig && (
                        <div className="mt-6 p-4 border rounded-md bg-gray-50">
                            <h4 className="font-semibold mb-3">Grade Thresholds (%)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1"><Label className="text-xs font-bold text-green-700">A (High)</Label><div className="flex items-center gap-2"><Input type="number" value={gradingConfig.first.min} onChange={e => setGradingConfig(p => ({...p, first: {...p.first, min: +e.target.value}}))} className="h-8 text-xs"/></div></div>
                                <div className="space-y-1"><Label className="text-xs font-bold text-blue-700">B (Mid)</Label><div className="flex items-center gap-2"><Input type="number" value={gradingConfig.second.min} onChange={e => setGradingConfig(p => ({...p, second: {...p.second, min: +e.target.value}}))} className="h-8 text-xs"/></div></div>
                                <div className="space-y-1"><Label className="text-xs font-bold text-yellow-700">C (Pass)</Label><div className="flex items-center gap-2"><Input type="number" value={gradingConfig.third.min} onChange={e => setGradingConfig(p => ({...p, third: {...p.third, min: +e.target.value}}))} className="h-8 text-xs"/></div></div>
                                <div className="space-y-1"><Label className="text-xs font-bold text-red-700">F (Fail)</Label><div className="flex items-center gap-2"><Input type="number" value={gradingConfig.fail.max} onChange={e => setGradingConfig(p => ({...p, fail: {...p.fail, max: +e.target.value}}))} className="h-8 text-xs"/></div></div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* --- MARKS ENTRY --- */}
            <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Enter Marks: {selectedClass}</CardTitle>
                    <Button onClick={generateBulkMarksheet} variant="default" className="bg-blue-600 hover:bg-blue-700">
                        <Printer className="w-4 h-4 mr-2"/> Print All Marksheets
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 w-10">Roll</th>
                            <th className="border p-2 text-left">Name</th>
                            {subjects.map(s => <th key={s.code} className="border p-2 w-24 text-center">{s.name}<br/><span className="text-xs text-gray-500">/{s.maxMarks}</span></th>)}
                            <th className="border p-2 w-24">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 ? <tr><td colSpan={10} className="p-4 text-center">No students found.</td></tr> : 
                            filteredStudents.map(student => (
                            <tr key={student._id}>
                                <td className="border p-2 text-center">{student.roll_no || "-"}</td>
                                <td className="border p-2 font-medium">{student.student_name}</td>
                                {subjects.map(sub => {
                                    // RE-FETCHED RESULTS USED HERE AUTOMATICALLY
                                    const existing = results.find(r => r.studentId === student._id && r.subject === sub.name && r.examName === form.getValues("examType"));
                                    const val = marksInput[`${student._id}-${sub.name}`] ?? existing?.marksObtained ?? "";
                                    
                                    return (
                                        <td key={sub.name} className="border p-2">
                                            <Input 
                                            type="number" 
                                            className="h-8 text-center" 
                                            value={val}
                                            placeholder="-"
                                            max={sub.maxMarks}
                                            onChange={(e) => setMarksInput(prev => ({...prev, [`${student._id}-${sub.name}`]: Number(e.target.value)}))}
                                            />
                                        </td>
                                    );
                                })}
                                <td className="border p-2 text-center">
                                    <Button size="sm" onClick={() => handleSaveResult(student._id!, student.student_name, student.admission_no)}>
                                        <Save className="w-4 h-4"/>
                                    </Button>
                                </td>
                            </tr>
                            ))
                        }
                    </tbody>
                    </table>
                </div>
            </CardContent>
            </Card>
        </>
      )}
    </div>
  );
};

export default ResultsManagement;