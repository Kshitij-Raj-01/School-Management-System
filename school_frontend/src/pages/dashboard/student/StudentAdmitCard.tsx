import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Printer, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AdmitCardTemplate } from "@/components/print/AdmitCardTemplate";
import { fetchExamSchedule, fetchAdmitCardAccess } from "@/store/slices/examSlice";
import { listStudents } from "@/store/slices/studentSlice";

const StudentAdmitCard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  
  const { students } = useSelector((state: RootState) => state.student);
  const { currentSchedule, accessList } = useSelector((state: RootState) => state.exam);

  const [student, setStudent] = useState<any>(null);
  const [printableStudent, setPrintableStudent] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Backend URL (handles both localhost and deployed versions)
  const BACKEND_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : "http://localhost:5000";

  useEffect(() => {
    dispatch(listStudents());
    dispatch(fetchAdmitCardAccess());
    dispatch(fetchExamSchedule(undefined)); 
  }, [dispatch]);

  useEffect(() => {
    if (userInfo?._id && students.length > 0) {
      const foundStudent = students.find(s => s._id === userInfo._id) || 
                           students.find(s => s.email === userInfo.email);

      if (foundStudent) {
        setStudent(foundStudent);

        // Check Access
        const accessRecord = accessList.find(a => a.studentId === foundStudent._id);
        if (accessRecord?.allowed) {
          setHasAccess(true);
        }

        // --- ROBUST IMAGE CONVERSION ---
        const convertImageToBase64 = async () => {
          if (!foundStudent.image) {
            setPrintableStudent(foundStudent);
            return;
          }

          // If already data URI, use it
          if (foundStudent.image.startsWith("data:")) {
            setPrintableStudent(foundStudent);
            return;
          }

          // Construct Full URL
          let imageUrl = foundStudent.image;
          if (imageUrl.startsWith("/")) {
            imageUrl = `${BACKEND_URL}${imageUrl}`;
          }

          setImgLoading(true);

          // Use Image Object + Canvas (Better than fetch for Images)
          const img = new Image();
          img.crossOrigin = "Anonymous"; // Crucial for CORS
          img.src = imageUrl;

          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0);
              const dataURL = canvas.toDataURL("image/png");
              
              setPrintableStudent({
                ...foundStudent,
                image: dataURL // Success: Base64
              });
            } catch (e) {
              console.error("Canvas conversion failed (CORS likely):", e);
              // Fallback: Use URL directly
              setPrintableStudent({ ...foundStudent, image: imageUrl });
            } finally {
              setImgLoading(false);
            }
          };

          img.onerror = (err) => {
            console.error("Image load failed:", err);
            // Fallback: Use URL directly
            setPrintableStudent({ ...foundStudent, image: imageUrl });
            setImgLoading(false);
          };
        };

        convertImageToBase64();
      }
    }
  }, [userInfo, students, accessList]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Admit_Card_${student?.student_name || "Student"}`,
  });

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Card><CardContent className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /><p>Loading...</p></CardContent></Card>
      </div>
    );
  }

  // Determine Schedule
  const mySchedule = Array.isArray(currentSchedule) 
    ? currentSchedule.find((s: any) => s.classname === student.classname) 
    : currentSchedule;

  // Access Controls
  if (!mySchedule) {
    return <div className="max-w-4xl mx-auto mt-8"><Alert className="bg-yellow-50"><AlertCircle className="h-4 w-4"/><AlertDescription>Exam schedule not found.</AlertDescription></Alert></div>;
  }
  if (!hasAccess) {
    return <div className="max-w-4xl mx-auto mt-8"><Alert className="bg-red-50"><XCircle className="h-4 w-4"/><AlertDescription>Admit Card download is blocked. Contact Admin.</AlertDescription></Alert></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Admit Card</h1>
        <p className="text-muted-foreground mt-1">Download your official examination admit card</p>
      </div>

      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Ready to print. Click the button below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Admit Card Preview</CardTitle>
            <Button onClick={() => handlePrint()} disabled={imgLoading}>
              {imgLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Printer className="w-4 h-4 mr-2" />}
              {imgLoading ? "Processing Image..." : "Download / Print PDF"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-8 rounded-lg border flex justify-center overflow-auto">
            {/* This container is what gets printed.
               It uses 'printableStudent' which ensures the image is Base64 if possible.
            */}
            <div className="shadow-2xl bg-white" ref={printRef}>
              {printableStudent && (
                <AdmitCardTemplate
                  student={printableStudent}
                  examName={mySchedule.examName}
                  examSchedule={mySchedule}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAdmitCard;