import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SystemUserRole = "finance" | "studentManager";

interface SystemUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: SystemUserRole;
}

const STORAGE_KEY = "mockSystemUsers";

const UserAccessPage = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<SystemUser[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SystemUserRole>("finance");

  // Only admin can use this page
  const isAdmin = userInfo?.role === "admin";

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setUsers(stored);
  }, []);

  const saveUsers = (next: SystemUser[]) => {
    setUsers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Only admin can manage user access");
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Name, email and password are required");
      return;
    }

    if (users.some((u) => u.email === email.trim())) {
      toast.error("This email is already used for a user");
      return;
    }

    const newUser: SystemUser = {
      _id: `sys-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
    };

    const next = [...users, newUser];
    saveUsers(next);

    toast.success("User created. Share email & password with them.");
    setName("");
    setEmail("");
    setPassword("");
    setRole("finance");
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Only admin can manage who gets access to payment and student sections.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            User Access Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Yahan se aap naya user bana sakte hain jise sirf <b>Payment</b> ya
            sirf <b>Student</b> section ka access milega. Admin ka control aapke
            paas hi rahega.
          </p>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="User full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Login ID)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a simple password"
              />
            </div>
            <div className="space-y-2">
              <Label>Role / Access Type</Label>
              <Select value={role} onValueChange={(v) => setRole(v as SystemUserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select access type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Payment Section (Fees / Payroll / Expenses)</SelectItem>
                  <SelectItem value="studentManager">Student Section (Register & List Students)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full md:w-auto">
                Create User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Users (Created by Admin)</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{u.name}</td>
                      <td className="py-2 pr-4">{u.email}</td>
                      <td className="py-2 pr-4">
                        {u.role === "finance" ? "Payment Section" : "Student Section"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccessPage;

