import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { registerTeacher, resetTeacherState } from "@/store/slices/teacherSlice";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, UploadCloud, Download } from "lucide-react";
import jsPDF from "jspdf";
import schoolLogo from "@/assets/school-logo.png";

// Validation Schema
const formSchema = z.object({
  teacher_name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  aadhar_no: z.string(),
  pan_no: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  gender: z.string().min(1, "Select gender"),
  contact_no: z.string().min(10, "Valid phone number required"),
  qualification: z.string().min(2, "Qualification is required"),
  subjectsToTeach: z.array(z.string()).optional(),
  classTeacherOf: z.string().optional(),
  previous_school: z.string().optional(),
  dob: z.string().min(1, "Date of Birth is required"), // <--- NEW
  age: z.string().optional(), // Calculated
  estimated_salary: z.string().min(1, "Salary is required"),
  image: z.string().optional(),
});

const TeacherRegisterPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector((state: RootState) => state.teacher);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPdfDownload, setShowPdfDownload] = useState(false);
  const [registeredTeacher, setRegisteredTeacher] = useState<any>(null);
  const [customSubject, setCustomSubject] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Configuration for API and Server URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const SERVER_URL = "http://localhost:5000"; // Used to access static files

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacher_name: "", 
      email: "", 
      aadhar_no: "",
      pan_no: "",
      address: "", 
      gender: "", 
      contact_no: "",
      qualification: "", 
      subjectsToTeach: [], 
      previous_school: "", 
      dob: "",
      age: "", 
      estimated_salary: "", 
      image: "",
    },
  });

  // --- AUTO CALCULATE AGE ---
  const dob = form.watch("dob");
  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      form.setValue("age", age.toString());
    }
  }, [dob, form]);

  useEffect(() => {
    if (success) {
      toast.success("Teacher registered successfully!");
      setRegisteredTeacher(form.getValues());
      setShowPdfDownload(true);
      // Don't reset immediately so user can download PDF
      dispatch(resetTeacherState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetTeacherState());
    }
  }, [success, error, dispatch]);

  const addCustomSubject = () => {
    if (customSubject.trim() && !availableSubjects.includes(customSubject.trim())) {
      const newSubject = customSubject.trim();
      setAvailableSubjects([...availableSubjects, newSubject]);
      
      const currentSubjects = form.getValues("subjectsToTeach") || [];
      form.setValue("subjectsToTeach", [...currentSubjects, newSubject]);
      
      setCustomSubject("");
      toast.success(`Subject "${newSubject}" added and selected!`);
    } else if (availableSubjects.includes(customSubject.trim())) {
      toast.error("Subject already exists!");
    } else {
      toast.error("Please enter a subject name!");
    }
  };

  // --- LOCAL UPLOAD FUNCTION (Replaces Cloudinary) ---
  const uploadImage = async () => {
    if (!imageFile) return "";
    
    const formData = new FormData();
    // 'image' must match the backend field name
    formData.append("image", imageFile); 

    try {
      setUploading(true);
      
      // POST to your local backend
      const { data } = await axios.post(
        `${API_URL}/upload`, 
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      setUploading(false);
      // Backend returns relative path, prepend server URL
      return `${SERVER_URL}${data}`; 
    } catch (err) {
      setUploading(false);
      toast.error("Image upload failed");
      console.error(err);
      return "";
    }
  };

  const generateTeacherRegistrationPDF = async (teacherData: any) => {
    const pdf = new jsPDF();
    
    // --- Config & Styles ---
    const colors = {
      primary: [40, 40, 40],       
      secondary: [80, 80, 80],     
      border: [200, 200, 200],     
      fill: [248, 248, 248],       
      white: [255, 255, 255]
    };

    const margin = 15;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);
    const lineHeight = 7.5; 
    
    // --- Helper: Draw Grid Row ---
    const drawGridRow = (y: number, col1: {l: string, v: string}, col2?: {l: string, v: string}) => {
      const halfWidth = contentWidth / 2;
      const labelWidth = 35; 
      
      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.1);

      // --- Left Column ---
      pdf.setFillColor(...colors.fill);
      pdf.rect(margin, y, labelWidth, lineHeight, 'F'); 
      pdf.rect(margin, y, labelWidth, lineHeight, 'S'); 
      
      pdf.setFillColor(...colors.white);
      pdf.rect(margin + labelWidth, y, halfWidth - labelWidth, lineHeight, 'F'); 
      pdf.rect(margin + labelWidth, y, halfWidth - labelWidth, lineHeight, 'S'); 

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.secondary);
      pdf.text(col1.l, margin + 2, y + 5);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.primary);
      pdf.text(String(col1.v || "-"), margin + labelWidth + 2, y + 5);

      // --- Right Column (if exists) ---
      if (col2) {
        const x2 = margin + halfWidth;
        
        pdf.setFillColor(...colors.fill);
        pdf.rect(x2, y, labelWidth, lineHeight, 'F');
        pdf.rect(x2, y, labelWidth, lineHeight, 'S');

        pdf.setFillColor(...colors.white);
        pdf.rect(x2 + labelWidth, y, halfWidth - labelWidth, lineHeight, 'F');
        pdf.rect(x2 + labelWidth, y, halfWidth - labelWidth, lineHeight, 'S');

        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.secondary);
        pdf.text(col2.l, x2 + 2, y + 5);

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.primary);
        pdf.text(String(col2.v || "-"), x2 + labelWidth + 2, y + 5);
      } else {
        const x2 = margin + halfWidth;
        pdf.rect(x2, y, halfWidth, lineHeight, 'S');
      }
    };

    // --- Helper: Section Header ---
    const drawSectionHeader = (title: string, y: number) => {
      pdf.setFillColor(230, 230, 230);
      pdf.rect(margin, y, contentWidth, 7, 'F');
      pdf.rect(margin, y, contentWidth, 7, 'S');
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.text(title.toUpperCase(), margin + 3, y + 5);
      return y + 7;
    };

    // ==========================================
    // START PDF GENERATION
    // ==========================================

    // 1. Page Border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(5, 5, 200, 287);
    pdf.setLineWidth(0.2);
    pdf.rect(7, 7, 196, 283);

    // 2. Header
    let yPos = 20;
    
    // Logo
    try {
      const img = new Image();
      img.src = schoolLogo;
      await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
      if (img.complete && img.naturalHeight !== 0) {
        // Simple addImage
        pdf.addImage(img, 'PNG', margin, 10, 22, 22);
      }
    } catch (e) { /* ignore */ }

    // School Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text("R.N.T. PUBLIC SCHOOL", 105, 20, { align: "center" });

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("Nursery to 7th Grade Excellence | Modipuram, Meerut", 105, 26, { align: "center" });
    pdf.text("Affiliated to CBSE | Est. 1995", 105, 30, { align: "center" });

    pdf.setLineWidth(0.5);
    pdf.line(margin, 38, pageWidth - margin, 38);

    // 3. Form Title
    yPos = 46;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("TEACHER REGISTRATION FORM", 105, yPos, { align: "center" });
    
    // Date
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 5, yPos, { align: "right" });

    yPos += 8;

    // 4. Official Details
    yPos = drawSectionHeader("Official Details", yPos);
    drawGridRow(yPos, 
      { l: "Teacher ID", v: teacherData._id || "T-" + Math.floor(Math.random()*10000) }, 
      { l: "Department", v: "Academic" }
    );
    yPos += lineHeight;
    drawGridRow(yPos, 
      { l: "Designation", v: "Assistant Teacher" }, 
      { l: "Joining Date", v: new Date().toLocaleDateString() } 
    );
    yPos += lineHeight + 4;

    // 5. Personal Information
    yPos = drawSectionHeader("Personal Information", yPos);
    drawGridRow(yPos, 
      { l: "Full Name", v: teacherData.teacher_name }, 
      { l: "Gender", v: teacherData.gender }
    );
    yPos += lineHeight;
    drawGridRow(yPos, 
      { l: "DOB", v: `${teacherData.dob}` }, 
      { l: "Nationality", v: "Indian" } 
    );
    yPos += lineHeight;
    drawGridRow(yPos, 
      { l: "Email ID", v: teacherData.email }, 
      { l: "Mobile No", v: teacherData.contact_no } 
    );
    yPos += lineHeight;
    drawGridRow(yPos, 
      { l: "Aadhar No", v: "________________" }, 
      { l: "PAN Number", v: "________________" }
    );
    yPos += lineHeight;
    
    drawGridRow(yPos, 
        { l: "Current Address", v: teacherData.address },
        { l: "City", v: "Meerut" } 
    );
    yPos += lineHeight + 4;

    // 6. Professional Details
    yPos = drawSectionHeader("Professional Qualification & Experience", yPos);
    drawGridRow(yPos,
        { l: "Qualification", v: teacherData.qualification },
        { l: "Specialization", v: "________________" }
    );
    yPos += lineHeight;
    drawGridRow(yPos,
        { l: "Previous School", v: teacherData.previous_school || "N/A" },
        { l: "Experience", v: "____ Years" }
    );
    yPos += lineHeight + 4;

    // 7. Academic Allocation
    yPos = drawSectionHeader("Academic Allocation", yPos);
    
    const subjectsStr = teacherData.subjectsToTeach?.join(", ") || "All Subjects";
    drawGridRow(yPos, 
        { l: "Subjects Allotted", v: subjectsStr },
        { l: "Class Teacher", v: teacherData.classTeacherOf || "None" } // Use actual value
    );
    yPos += lineHeight + 8;

    // 8. Declaration
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("DECLARATION:", margin, yPos);
    yPos += 5;
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(60, 60, 60);
    const declaration = "I hereby declare that the information provided above is true to the best of my knowledge. I agree to abide by the service rules and regulations of R.N.T. Public School. I understand that my appointment is subject to verification of my original documents and police verification.";
    const splitText = pdf.splitTextToSize(declaration, contentWidth);
    pdf.text(splitText, margin, yPos);
    
    yPos += 15;

    // 9. Signatures
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.2);
    pdf.rect(margin, yPos, contentWidth, 30); 
    
    pdf.line(pageWidth / 2, yPos, pageWidth / 2, yPos + 30); 

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Signature of Teacher", margin + 5, yPos + 5);
    pdf.text("Principal / Manager Signature", (pageWidth / 2) + 5, yPos + 5);

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "italic");
    pdf.text("Date: _________________", margin + 5, yPos + 25);
    pdf.text("Seal & Date: _________________", (pageWidth / 2) + 5, yPos + 25);

    yPos += 35;

    // 10. Office Use
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPos, contentWidth, 18, 'F');
    pdf.rect(margin, yPos, contentWidth, 18, 'S');
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("FOR OFFICE USE ONLY", margin + 5, yPos + 5);
    
    pdf.setFont("helvetica", "normal");
    pdf.text("Docs Verified: [ ] Yes [ ] No", margin + 5, yPos + 12);
    pdf.text("Police Verif: [ ] Pending [ ] Done", margin + 60, yPos + 12);
    pdf.text("Emp Code Gen: [ ] Yes", margin + 120, yPos + 12);

    pdf.save(`Teacher_Registration_${teacherData.teacher_name.replace(/\s+/g, '_')}.pdf`);
    toast.success("Official Form Downloaded!");
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let imageUrl = values.image;
  
    if (imageFile) {
      // Local Upload
      imageUrl = await uploadImage();
      // Proceed even if imageUrl is empty string (failed upload)
    }
  
    dispatch(
      registerTeacher({
        ...values,
        image: imageUrl || "",
      } as any)
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader><CardTitle className="text-2xl text-primary">Register New Teacher</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="teacher_name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField
                    control={form.control}
                    name="aadhar_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher Aadhar Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 5678 9012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pan_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Number</FormLabel>
                        <FormControl>
                          <Input placeholder="PEN123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField control={form.control} name="qualification" render={({ field }) => (
                  <FormItem><FormLabel>Qualification</FormLabel><FormControl><Input placeholder="M.Sc, B.Ed" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="subjectsToTeach" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Subjects to Teach</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type custom subject name..."
                            value={customSubject}
                            onChange={(e) => setCustomSubject(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCustomSubject()}
                          />
                          <Button type="button" onClick={addCustomSubject} variant="outline">
                            Add Subject
                          </Button>
                        </div>
                        {field.value && field.value.length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-md">
                            <p className="text-sm font-medium text-blue-800">Selected Subjects:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {field.value.map((subject: string) => (
                                <span key={subject} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  {subject}
                                  <button
                                    type="button"
                                    onClick={() => field.onChange(field.value?.filter((s: string) => s !== subject))}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="classTeacherOf" render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Teacher Assigned For (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>     
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="None">Not a Class Teacher</SelectItem>
                      {["Nursery", "LKG", "UKG", "One", "Two", "Three", "Four", "Five", "Six", "Seven"].map((c) => (
                        <SelectItem key={c} value={c}>Class {c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
                <FormField control={form.control} name="previous_school" render={({ field }) => (
                  <FormItem><FormLabel>Previous School (Optional)</FormLabel><FormControl><Input placeholder="Previous school name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contact_no" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                {/* DOB & AGE */}
                <FormField control={form.control} name="dob" render={({ field }) => (
                  <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem><FormLabel>Age</FormLabel><FormControl><Input {...field} readOnly className="bg-gray-100" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="estimated_salary" render={({ field }) => (
                  <FormItem><FormLabel>Salary</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="cursor-pointer" 
                      />
                      {uploading && <Loader2 className="animate-spin" />}
                    </div>
                  </FormControl>
                </FormItem>
              </div>
              <Button type="submit" disabled={loading || uploading} className="w-full md:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} Register Teacher
              </Button>
            </form>
          </Form>

          {showPdfDownload && registeredTeacher && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Teacher Registered Successfully!</h3>
                  <p className="text-green-600">Download the registration form as PDF</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => generateTeacherRegistrationPDF(registeredTeacher)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button 
                    onClick={() => {
                        form.reset();
                        setImageFile(null);
                        setShowPdfDownload(false);
                        setRegisteredTeacher(null);
                        setCustomSubject("");
                        setAvailableSubjects([]);
                    }}
                    variant="outline"
                  >
                    Register Another
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherRegisterPage;