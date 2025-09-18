import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@shared/api";

const roles: UserRole[] = ["SUPER_ADMIN", "DEPT_ADMIN", "WARD_OFFICER", "FIELD_STAFF"];

export default function Login() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const navigate = useNavigate();
  const { login } = useAuth();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !role) return;
    login(name, role);
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary/5 via-background to-accent/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">City Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm">Name</label>
              <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Enter your name" />
            </div>
            <div>
              <label className="text-sm">Role</label>
              <Select value={role} onValueChange={(v)=>setRole(v as UserRole)}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r)=>(<SelectItem key={r} value={r}>{r.replace("_"," ")}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" type="submit">Sign in</Button>
            <div className="text-xs text-muted-foreground text-center">
              SSO, forgot password, and MFA can be integrated.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
