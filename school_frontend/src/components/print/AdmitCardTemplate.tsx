import { forwardRef } from "react";
import { Student } from "@/store/slices/studentSlice";
import schoolLogo from "@/assets/school-logo.png";
import { ExamSchedule } from "@/lib/examManagement";

interface AdmitCardProps {
  student: Student;
  examName?: string;
  examSchedule?: ExamSchedule | null;
}

export const AdmitCardTemplate = forwardRef<HTMLDivElement, AdmitCardProps>(
  ({ student, examName = "Annual Examination", examSchedule }, ref) => {
    return (
      // Added print:w-[210mm] to ensure A4 sizing during print
      <div ref={ref} className="bg-white w-[210mm] min-h-[297mm] mx-auto p-8 text-black print:w-[210mm] print:h-[297mm]">
        {/* Double Border Container */}
        <div className="border-2 border-black p-1 h-full">
          <div className="border border-black p-6 h-full relative flex flex-col">
            
            {/* Header */}
            <div className="flex items-center gap-4 border-b-2 border-black pb-4 mb-6">
              <img 
                src={schoolLogo} 
                alt="Logo" 
                className="w-24 h-24 object-contain"
              />
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold uppercase tracking-wider">R.N.T. Public School</h1>
                <p className="text-sm font-medium uppercase tracking-widest mt-1">Modipuram, Meerut (U.P.)</p>
                <p className="text-xs mt-1">Affiliated to CBSE, New Delhi</p>
                <div className="mt-2 inline-block bg-black text-white px-6 py-1 font-bold text-lg uppercase tracking-widest">
                  ADMIT CARD
                </div>
              </div>
              {/* Invisible spacer to balance the logo width */}
              <div className="w-24"></div> 
            </div>

            {/* Exam Session Info */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold uppercase underline decoration-2 underline-offset-4">{examName}</h2>
              <p className="text-sm font-medium mt-1">Session: {new Date().getFullYear()}-{new Date().getFullYear()+1}</p>
            </div>

            {/* Student Details Grid */}
            <div className="flex gap-6 mb-6">
              {/* Photo Box */}
              <div className="w-32 h-40 border border-black flex flex-col flex-shrink-0">
                <div className="flex-1 overflow-hidden relative bg-gray-50">
                   {student.image ? (
                     <img 
                       src={student.image} 
                       alt="Student" 
                       className="w-full h-full object-cover" 
                       // Helps with some CORS contexts if using URLs, harmless for Base64
                       crossOrigin="anonymous" 
                     />
                   ) : (
                     <div className="flex items-center justify-center h-full text-xs text-gray-400">PHOTO</div>
                   )}
                </div>
                <div className="h-8 border-t border-black flex items-center justify-center text-[10px] font-bold bg-white">
                  STUDENT SIGN
                </div>
              </div>

              {/* Info Grid */}
              <div className="flex-1 border border-black text-sm">
                <div className="grid grid-cols-[120px_1fr] border-b border-black">
                  <div className="bg-gray-100 font-bold p-2 border-r border-black flex items-center">Student Name</div>
                  <div className="p-2 font-bold uppercase flex items-center">{student.student_name}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] border-b border-black">
                  <div className="bg-gray-100 font-bold p-2 border-r border-black flex items-center">Roll Number</div>
                  <div className="p-2 font-bold flex items-center">{student.roll_no || "N/A"}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr_100px_1fr] border-b border-black">
                  <div className="bg-gray-100 font-bold p-2 border-r border-black flex items-center">Class</div>
                  <div className="p-2 border-r border-black flex items-center">{student.classname}</div>
                  <div className="bg-gray-100 font-bold p-2 border-r border-black flex items-center">Gender</div>
                  <div className="p-2 flex items-center">{student.gender}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] border-b border-black">
                  <div className="bg-gray-100 font-bold p-2 border-r border-black flex items-center">Guardian</div>
                  <div className="p-2 flex items-center">{student.father_name || student.parents_name || "________________"}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr]">
                  <div className="bg-gray-100 font-bold p-2 border-r border-black flex items-center">Admission No</div>
                  <div className="p-2 flex items-center">{student.admission_no}</div>
                </div>
              </div>
            </div>

            {/* Exam Schedule */}
            <div className="mb-8 flex-1">
              <h3 className="font-bold text-sm uppercase mb-2 border-b border-black inline-block">Examination Schedule</h3>
              <table className="w-full text-sm border-collapse border border-black">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-left w-1/3">Subject</th>
                    <th className="border border-black p-2 text-left">Date</th>
                    <th className="border border-black p-2 text-left">Time</th>
                    <th className="border border-black p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {examSchedule && examSchedule.subjects.length > 0 ? (
                    examSchedule.subjects.map((subj, i) => (
                      <tr key={i}>
                        <td className="border border-black p-2 font-bold">{subj.subject}</td>
                        <td className="border border-black p-2">{new Date(subj.date).toLocaleDateString()}</td>
                        <td className="border border-black p-2">{subj.time}</td>
                        <td className="border border-black p-2">{subj.duration}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="border border-black p-4 text-center text-gray-500">No schedule available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Instructions */}
            <div className="mb-12">
              <h3 className="font-bold text-xs uppercase mb-1">Important Instructions:</h3>
              <ul className="text-[10px] list-disc pl-4 space-y-1 text-gray-700 leading-tight">
                <li>Candidate must carry this Admit Card to the examination hall.</li>
                <li>Report to the examination center at least 30 minutes before the scheduled time.</li>
                <li>Use of electronic gadgets (Mobile, Calculator, Smartwatch) is strictly prohibited.</li>
                <li>Candidate will not be allowed to leave the hall before half of the time is over.</li>
                <li>Maintain silence and discipline inside the examination hall.</li>
              </ul>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end mt-auto pt-4">
              <div className="text-center">
                <div className="w-40 border-b border-black mb-1"></div>
                <p className="text-xs font-bold">Class Teacher</p>
              </div>
              
              <div className="text-center">
                <div className="w-40 h-12 mb-1 flex items-end justify-center">
                   <div className="text-[9px] text-gray-400 border border-gray-300 px-2 rounded">SCHOOL SEAL</div>
                </div>
                <p className="text-xs font-bold">Principal / Controller of Exams</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
);

AdmitCardTemplate.displayName = "AdmitCardTemplate";