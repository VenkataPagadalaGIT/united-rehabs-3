import { TwoFactorManage } from "@/components/auth/TwoFactorManage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key, Lock } from "lucide-react";

const SecurityAdmin = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-muted-foreground">
          Manage your account security and authentication options
        </p>
      </div>

      <div className="grid gap-6">
        <TwoFactorManage />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password
            </CardTitle>
            <CardDescription>
              Change your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              To change your password, please use the "Forgot Password" option on the login page. A reset link will be sent to your email.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Recommendations
            </CardTitle>
            <CardDescription>
              Best practices for account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Enable two-factor authentication for maximum security</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Use a strong, unique password with at least 8 characters</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Never share your login credentials with others</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Sign out when using shared devices</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityAdmin;
