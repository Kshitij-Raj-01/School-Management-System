import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchResults, ExamResult } from "@/store/slices/resultSlice"; // Import Type
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar } from "lucide-react";

const StudentResults = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { results, loading } = useSelector((state: RootState) => state.results);

  // Group results by Unique Exam Instance (Year + ExamName)
  // Key format: "2023-2024|Mid Term"
  const [examGroups, setExamGroups] = useState<{ [key: string]: ExamResult[] }>({});

  useEffect(() => {
    if (userInfo?._id) {
      dispatch(fetchResults({ studentId: userInfo._id }));
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (results.length > 0) {
        const groups: { [key: string]: ExamResult[] } = {};
        
        results.forEach(r => {
            // COMPOSITE KEY: To separate same exams from different years
            const uniqueKey = `${r.academicYear || 'Unknown'}|${r.examName}`;
            
            if (!groups[uniqueKey]) groups[uniqueKey] = [];
            groups[uniqueKey].push(r);
        });
        setExamGroups(groups);
    }
  }, [results]);

  const getGradeColor = (grade: string) => {
    if (["A1", "A2", "A", "A+"].includes(grade)) return "bg-green-100 text-green-800";
    if (["B1", "B2", "B"].includes(grade)) return "bg-blue-100 text-blue-800";
    if (["C1", "C2", "C"].includes(grade)) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Results</h1>
      
      {loading && <p>Loading results...</p>}

      {!loading && Object.keys(examGroups).length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No results found for your profile yet.</AlertDescription>
        </Alert>
      )}

      {/* Render Groups */}
      {Object.entries(examGroups).map(([groupKey, examResults]) => {
          // Split key back into Year and Exam Name
          const [academicYear, examName] = groupKey.split('|');

          const totalObtained = examResults.reduce((sum, r) => sum + Number(r.marksObtained), 0);
    const totalMax = examResults.reduce((sum, r) => sum + Number(r.totalMarks), 0);
    
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

          // Determine Pass/Fail (e.g., 33% threshold)
          const isPass = percentage >= 33;

          return (
            <div key={groupKey} className="space-y-4">
               {/* Exam Header Card */}
               <Card className={`bg-slate-50 border-l-4 ${isPass ? 'border-green-600' : 'border-red-600'}`}>
                  <CardContent className="pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-white flex gap-1 items-center">
                                <Calendar className="w-3 h-3" /> {academicYear}
                            </Badge>
                          </div>
                          <h2 className="text-2xl font-bold text-slate-800">{examName}</h2>
                          <p className="text-sm text-gray-500">
                              Total Marks: <span className="font-medium text-gray-900">{totalObtained} / {totalMax}</span>
                          </p>
                      </div>
                      
                      <div className="text-right flex items-center gap-4">
                          <div>
                              <div className="text-3xl font-bold text-slate-900">{percentage.toFixed(1)}%</div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Percentage</div>
                          </div>
                          <Badge className={`text-lg px-4 py-1 ${isPass ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                              {isPass ? "PASSED" : "FAILED"}
                          </Badge>
                      </div>
                  </CardContent>
               </Card>

               {/* Detailed Table */}
               <Card>
                  <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="w-[40%]">Subject</TableHead>
                                <TableHead className="text-center">Marks Obtained</TableHead>
                                <TableHead className="text-center">Max Marks</TableHead>
                                <TableHead className="text-right">Grade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {examResults.map((res) => (
                                <TableRow key={res.subject}>
                                    <TableCell className="font-medium">{res.subject}</TableCell>
                                    <TableCell className="text-center font-bold text-slate-700">{res.marksObtained}</TableCell>
                                    <TableCell className="text-center text-muted-foreground">{res.totalMarks}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary" className={getGradeColor(res.grade)}>
                                            {res.grade}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </CardContent>
               </Card>
            </div>
          );
      })}
    </div>
  );
};

export default StudentResults;