import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { listStudents } from "@/store/slices/studentSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, BookOpen } from "lucide-react";

const StudentProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { students } = useSelector((state: RootState) => state.student);

  useEffect(() => {
    dispatch(listStudents());
  }, [dispatch]);

  // Find full student details using the logged-in email
  const myProfile = students.find(s => s.email === userInfo?.email);

  if (!myProfile) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Profile Image */}
            <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
  <Avatar className="w-48 h-48 border-4 border-white shadow-lg">
    {/* Fixed line below */}
    <AvatarImage src={myProfile.image} className="object-cover" />
    <AvatarFallback className="text-4xl">{myProfile.student_name[0]}</AvatarFallback>
  </Avatar>
  <Badge variant="outline" className="px-4 py-1 text-sm border-primary text-primary">
    {myProfile.admission_no ? `ID: ${myProfile.admission_no}` : "Student"}
  </Badge>
</div>

            {/* Details Grid */}
            <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <p className="text-lg font-medium">{myProfile.student_name}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Class
                </label>
                <p className="text-lg font-medium">{myProfile.classname} (Roll: {myProfile.roll_no})</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <p className="text-lg font-medium">{myProfile.email}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Contact
                </label>
                <p className="text-lg font-medium">{myProfile.contact_no}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <User className="w-3 h-3" /> Gender
                </label>
                <p className="text-lg font-medium">{myProfile.gender}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Age
                </label>
                <p className="text-lg font-medium">{myProfile.age} Years</p>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Address
                </label>
                <p className="text-lg font-medium">{myProfile.address}</p>
              </div>
              
              <div className=" space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <User className="w-3 h-3" /> Father Name
                </label>
                <p className="text-lg font-medium">{myProfile.father_name ? myProfile.father_name : "N/A"}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <User className="w-3 h-3" /> Mother Number
                </label>
                <p className="text-lg font-medium">{myProfile.mother_name ? myProfile.mother_name : "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfilePage;