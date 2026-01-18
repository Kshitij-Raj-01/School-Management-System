import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { addNotice, deleteNotice, Notice } from "@/store/slices/noticeSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Megaphone, 
  Calendar, 
  Trash2, 
  Plus, 
  Users, 
  AlertCircle 
} from "lucide-react";

const NoticeBoardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notices } = useSelector((state: RootState) => state.notice);
  const { userInfo } = useSelector((state: RootState) => state.auth);
  
  // Current User Details
  const role = userInfo?.role || "student";
  // Assuming userInfo has a 'classname' property if they are a student
  // You might need to adjust this based on your actual auth structure
  const userClass = (userInfo as any)?.classname || ""; 

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [isImportant, setIsImportant] = useState(false);

  // Available Classes for dropdown
  const classes = ["Nursery", "LKG", "UKG", "One", "Two", "Three", "Four", "Five", "Six", "Seven"];

  const handleAddNotice = () => {
    if (!title || !content) {
      toast.error("Please fill in title and content");
      return;
    }

    const newNotice: Notice = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString(),
      targetAudience,
      postedBy: userInfo?.name || "Admin",
      isImportant,
    };

    dispatch(addNotice(newNotice));
    toast.success("Notice published successfully!");
    
    // Reset and close
    setTitle("");
    setContent("");
    setTargetAudience("all");
    setIsImportant(false);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      dispatch(deleteNotice(id));
      toast.success("Notice deleted.");
    }
  };

  // --- FILTER LOGIC ---
  const filteredNotices = notices.filter((notice) => {
    // 1. Admin sees everything
    if (role === "admin") return true;

    // 2. Everyone sees 'all'
    if (notice.targetAudience === "all") return true;

    // 3. Teachers see 'teachers'
    if (role === "teacher" && notice.targetAudience === "teachers") return true;

    // 4. Students see 'students' OR their specific class
    if (role === "student") {
      if (notice.targetAudience === "students") return true;
      if (notice.targetAudience === userClass) return true;
    }

    return false;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-blue-600" />
            Notice Board
          </h1>
          <p className="text-muted-foreground">
            Announcements and updates for {role === 'admin' ? 'the school' : 'you'}
          </p>
        </div>

        {/* Create Button (Admin Only) */}
        {role === "admin" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Post New Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    placeholder="e.g. Annual Sports Day" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea 
                    placeholder="Write the details here..." 
                    className="min-h-[100px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone (Public)</SelectItem>
                        <SelectItem value="teachers">Teachers Only</SelectItem>
                        <SelectItem value="students">All Students</SelectItem>
                        {classes.map((c) => (
                          <SelectItem key={c} value={c}>Class {c} Only</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col justify-end pb-2">
                    <div className="flex items-center space-x-2 border p-2 rounded-md">
                      <Switch 
                        id="important" 
                        checked={isImportant} 
                        onCheckedChange={setIsImportant} 
                      />
                      <Label htmlFor="important" className="cursor-pointer text-red-600 font-medium">
                        Mark as Urgent
                      </Label>
                    </div>
                  </div>
                </div>
                <Button onClick={handleAddNotice} className="w-full">Publish Notice</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <Card key={notice.id} className={`relative transition-all hover:shadow-md ${notice.isImportant ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-tight text-gray-800">
                      {notice.title}
                    </CardTitle>
                    <CardDescription className="flex items-center text-xs mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(notice.date).toLocaleDateString()}
                      <span className="mx-1">•</span>
                      <span className="text-gray-500">By {notice.postedBy}</span>
                    </CardDescription>
                  </div>
                  {notice.isImportant && (
                    <Badge variant="destructive" className="text-[10px]">URGENT</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {notice.content}
                </p>
                
                <div className="mt-6 flex justify-between items-center border-t pt-3">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs bg-white">
                      <Users className="w-3 h-3 mr-1" />
                      {notice.targetAudience === 'all' ? 'Everyone' : 
                       notice.targetAudience === 'teachers' ? 'Staff' : 
                       notice.targetAudience}
                    </Badge>
                  </div>

                  {role === "admin" && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      onClick={() => handleDelete(notice.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg border border-dashed">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notices found</h3>
            <p className="text-sm text-gray-500">There are no announcements for you at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoardPage;