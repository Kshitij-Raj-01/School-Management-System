import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { registerStaff, resetStaffState } from "@/store/slices/staffSlice";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

const formSchema = z.object({
  staff_name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  aadhar_no: z.string(),
  pan_no: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  work: z.string().min(2, "Role/Work is required"),
  gender: z.string().min(1, "Select gender"),
  contact_no: z.string().min(10, "Valid phone required"),
  qualification: z.string().min(2, "Qualification is required"),
  previous_school: z.string().optional(),
  dob: z.string().min(1, "Date of Birth is required"), // <--- NEW
  age: z.string().optional(), // Calculated
  salary: z.string().min(1, "Salary is required"),
  image: z.string().optional(),
});

const StaffRegisterPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector((state: RootState) => state.staff);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Configuration for API and Server URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const SERVER_URL = "http://localhost:5000"; 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staff_name: "", email: "", address: "", work: "", gender: "", contact_no: "",
      qualification: "", previous_school: "", dob: "", age: "", salary: "", image: "",
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
      toast.success("Staff member registered!");
      form.reset();
      setImageFile(null);
      dispatch(resetStaffState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetStaffState());
    }
  }, [success, error, dispatch, form]);

  // --- LOCAL UPLOAD FUNCTION ---
  const uploadImage = async () => {
    if (!imageFile) return "";
    const formData = new FormData();
    formData.append("image", imageFile); 

    try {
      setUploading(true);
      const { data } = await axios.post(`${API_URL}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
      });
      setUploading(false);
      return `${SERVER_URL}${data}`; 
    } catch (err) {
      setUploading(false);
      return "";
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let imageUrl = values.image;
    if (imageFile) {
      imageUrl = await uploadImage();
    }
    dispatch(registerStaff({ ...values, image: imageUrl || "" } as any ));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader><CardTitle className="text-2xl text-primary">Register Support Staff</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="staff_name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="work" render={({ field }) => (
                  <FormItem><FormLabel>Role / Designation</FormLabel><FormControl><Input placeholder="e.g. Librarian, Driver" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contact_no" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                
                {/* DOB & AGE */}
                <FormField control={form.control} name="dob" render={({ field }) => (
                  <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem><FormLabel>Age</FormLabel><FormControl><Input {...field} readOnly className="bg-gray-100" /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="qualification" render={({ field }) => (
                  <FormItem><FormLabel>Qualification</FormLabel><FormControl><Input placeholder="High School, BA" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="salary" render={({ field }) => (
                  <FormItem><FormLabel>Salary</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4"><Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />{uploading && <Loader2 className="animate-spin" />}</div>
                  </FormControl>
                </FormItem>
              </div>
              <Button type="submit" disabled={loading || uploading} className="w-full md:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />} Register Staff
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffRegisterPage;