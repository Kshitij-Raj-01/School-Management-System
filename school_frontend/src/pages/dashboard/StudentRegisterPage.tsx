import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { registerStudent, resetStudentState } from "@/store/slices/studentSlice";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, UploadCloud, Download } from "lucide-react";
import jsPDF from "jspdf";
import schoolLogo from "@/assets/school-logo.png";

// Form Validation Schema
const formSchema = z.object({
  admission_no: z.string().min(1, "Admission Number is required"),
  roll_no: z.string().optional(),
  student_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  gender: z.string().min(1, "Please select a gender"),
  classname: z.string().min(1, "Please select a class"),
  contact_no: z.string().min(10, "Phone number must be at least 10 digits"),
  dob: z.string().min(1, "Date of Birth is required"), // <--- NEW FIELD
  age: z.string().optional(), // Now optional as it is calculated
  pan_no: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  aadhar_no: z.string().optional(),
  previous_school_name: z.string().optional(),
  alternate_mobile_no: z.string().optional(),
  father_name: z.string().optional(),
  father_aadhar_no: z.string().optional(),
  mother_name: z.string().optional(),
  mother_aadhar_no: z.string().optional(),
  registration_fees: z.string().min(1, "Fees amount is required"),
  usesBus: z.boolean().optional(),
  image: z.string().optional(),
});

const StudentRegisterPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector(
    (state: RootState) => state.student
  );
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const role = userInfo?.role;
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPdfDownload, setShowPdfDownload] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState<any>(null);

  // Configuration for API and Server URL
  // VITE_API_URL should be "http://localhost:5000/api" in your .env
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const SERVER_URL = "http://localhost:5000"; // Used to access static files

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      admission_no: "",
      roll_no: "",
      student_name: "",
      email: "",
      address: "",
      gender: "",
      classname: "",
      contact_no: "",
      dob: "",
      age: "",
      pan_no: "",
      weight: "",
      height: "",
      aadhar_no: "",
      previous_school_name: "",
      alternate_mobile_no: "",
      father_name: "",
      father_aadhar_no: "",
      mother_name: "",
      mother_aadhar_no: "",
      registration_fees: "",
      usesBus: false,
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
      toast.success("Student registered successfully!");
      setRegisteredStudent(form.getValues());
      setShowPdfDownload(true);
      // We don't reset immediately so user can download PDF
      dispatch(resetStudentState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetStudentState());
    }
  }, [success, error, dispatch, form]);

  // Access Control
  if (role !== "admin" && role !== "studentManager") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Only Admin or Student Manager can register students.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- LOCAL UPLOAD FUNCTION ---
  const uploadImage = async () => {
    if (!imageFile) return "";
    
    const formData = new FormData();
    // 'image' must match the upload.single('image') in your backend route
    formData.append("image", imageFile); 

    try {
      setUploading(true);
      
      // POST to your local backend
      // We explicitly set Content-Type, though axios often handles this automatically with FormData
      const { data } = await axios.post(
        `${API_URL}/upload`, 
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      setUploading(false);
      // Backend returns a relative path like "/uploads/filename.jpg"
      // We prepend the SERVER_URL to make it a full link
      return `${SERVER_URL}${data}`; 
    } catch (err) {
      setUploading(false);
      toast.error("Image upload failed");
      console.error(err);
      return "";
    }
  };

  const generateStudentRegistrationPDF = async (studentData: any) => {
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
    // START PDF CONTENT
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
    pdf.text("STUDENT ADMISSION FORM", 105, yPos, { align: "center" });
    
    // Date
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 5, yPos, { align: "right" });

    yPos += 8;

    // 4. Official Details
    yPos = drawSectionHeader("Official Details", yPos);
    drawGridRow(yPos, 
      { l: "Admission No", v: studentData.admission_no }, 
      { l: "Roll Number", v: studentData.roll_no || "N/A" }
    );
    yPos += lineHeight;
    drawGridRow(yPos, 
      { l: "Class Admission", v: studentData.classname }, 
      { l: "Academic Session", v: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` } 
    );
    yPos += lineHeight + 4;

    // 5. Personal Information
    yPos = drawSectionHeader("Student Information", yPos);
    drawGridRow(yPos, 
      { l: "Full Name", v: studentData.student_name }, 
      { l: "Gender", v: studentData.gender }
    );
    yPos += lineHeight;
    drawGridRow(yPos, 
      { l: "Date of Birth", v: `${studentData.dob}` }, 
      { l: "Aadhar Number", v: studentData.aadhar_no || "N/A" } 
    );
    yPos += lineHeight;
    drawGridRow(yPos, 
      { l: "PEN Number", v: studentData.pan_no || "N/A" }, 
      { l: "Email ID", v: studentData.email || "N/A" } 
    );
    yPos += lineHeight;
    
    // Physical
    drawGridRow(yPos, 
        { l: "Height (cm)", v: studentData.height || "-" },
        { l: "Weight (kg)", v: studentData.weight || "-" } 
    );
    yPos += lineHeight;
    
    drawGridRow(yPos, 
        { l: "Current Address", v: studentData.address },
        { l: "City", v: "Meerut" } 
    );
    yPos += lineHeight + 4;

    // 6. Parent Details
    yPos = drawSectionHeader("Parent Information", yPos);
    drawGridRow(yPos,
        { l: "Father's Name", v: studentData.father_name },
        { l: "Father's Aadhar", v: studentData.father_aadhar_no || "N/A" }
    );
    yPos += lineHeight;
    drawGridRow(yPos,
        { l: "Mother's Name", v: studentData.mother_name },
        { l: "Mother's Aadhar", v: studentData.mother_aadhar_no || "N/A" }
    );
    yPos += lineHeight;
    drawGridRow(yPos,
        { l: "Primary Mobile", v: studentData.contact_no },
        { l: "Alternate Mobile", v: studentData.alternate_mobile_no || "N/A" }
    );
    yPos += lineHeight + 4;

    // 7. Academic & Fee
    yPos = drawSectionHeader("Academic & Fee Details", yPos);
    drawGridRow(yPos, 
        { l: "Previous School", v: studentData.previous_school_name || "N/A" },
        { l: "Reg. Fees Paid", v: `Rs. ${studentData.registration_fees}` }
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
    const declaration = "I/We hereby declare that the information provided in this admission form is true and correct to the best of my/our knowledge. I/We agree to abide by the rules and regulations of R.N.T. Public School as amended from time to time. I/We understand that admission is subject to verification of documents.";
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
    pdf.text("Signature of Parent/Guardian", margin + 5, yPos + 5);
    pdf.text("Principal Signature & Seal", (pageWidth / 2) + 5, yPos + 5);

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "italic");
    pdf.text("Date: _________________", margin + 5, yPos + 25);
    pdf.text("Date: _________________", (pageWidth / 2) + 5, yPos + 25);

    yPos += 35;

    // 10. Office Use
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPos, contentWidth, 18, 'F');
    pdf.rect(margin, yPos, contentWidth, 18, 'S');
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("FOR OFFICE USE ONLY", margin + 5, yPos + 5);
    
    pdf.setFont("helvetica", "normal");
    pdf.text("Documents Submitted: [ ] TC [ ] Marksheet [ ] Aadhar [ ] Photos", margin + 5, yPos + 12);
    pdf.text("Admission Status: [ ] Approved", margin + 120, yPos + 12);

    pdf.save(`Admission_Form_${studentData.admission_no}.pdf`);
    toast.success("Official Form Downloaded!");
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let imageUrl = values.image;

    if (imageFile) {
      // Upload using local backend instead of Cloudinary
      imageUrl = await uploadImage();
      // Even if upload fails, we can proceed or choose to return
      // For now, we proceed (image will be empty string if failed)
    }

    dispatch(
      registerStudent({
        ...values,
        image: imageUrl || "",
      } as any)
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Register New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* --- Admission Details --- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Admission Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="admission_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission No / Reg ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roll_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- Student Personal Details --- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Student Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="student_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* DOB Field */}
                  <FormField control={form.control} name="dob" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Age Field (Read Only) */}
                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (Auto-calculated)</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField
                    control={form.control}
                    name="aadhar_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Aadhar Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 5678 9012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="classname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["Nursery", "LKG", "UKG", "One", "Two", "Three", "Four", "Five", "Six", "Seven"].map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- Student Physical Details --- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Physical Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="120" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="25.5" {...field} />
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
                </div>
              </div>

              {/* --- Contact Details --- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contact_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alternate_mobile_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternate Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 St, City, State, PIN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- Parent Details --- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Parent Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="father_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Father's Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="father_aadhar_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Aadhar Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 5678 9012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mother_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Mother's Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mother_aadhar_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Aadhar Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 5678 9012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- Academic Details --- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Academic Details</h3>
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="previous_school_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous School Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Previous School Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- Registration Details --- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Registration Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="registration_fees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Fees</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Student Photo</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {uploading && <Loader2 className="animate-spin text-primary" />}
                      </div>
                    </FormControl>
                  </FormItem>
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto" disabled={loading || uploading}>
                {loading || uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                Register Student
              </Button>
            </form>
          </Form>

          {/* PDF Download Section */}
          {showPdfDownload && registeredStudent && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Student Registered Successfully!</h3>
              <p className="text-sm text-green-700 mb-4">
                Student {registeredStudent.student_name} has been registered with Admission No: {registeredStudent.admission_no}
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => generateStudentRegistrationPDF(registeredStudent)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Registration PDF
                </Button>
                <Button 
                  onClick={() => {
                    form.reset();
                    setImageFile(null);
                    setShowPdfDownload(false);
                    setRegisteredStudent(null);
                  }}
                  variant="outline"
                >
                  Register Another Student
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRegisterPage;