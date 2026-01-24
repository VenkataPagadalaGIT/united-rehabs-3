import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Mail, AlertCircle, Loader2, ShieldAlert } from "lucide-react";

// Simple rate limiter
const rateLimiter = {
  attempts: new Map<string, { count: number; lastAttempt: number }>(),
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  
  isRateLimited(key: string): boolean {
    const data = this.attempts.get(key);
    if (!data) return false;
    
    if (Date.now() - data.lastAttempt > this.windowMs) {
      this.attempts.delete(key);
      return false;
    }
    
    return data.count >= this.maxAttempts;
  },
  
  recordAttempt(key: string) {
    const data = this.attempts.get(key);
    if (!data || Date.now() - data.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: Date.now() });
    } else {
      data.count++;
      data.lastAttempt = Date.now();
    }
  },
  
  getRemainingTime(key: string): number {
    const data = this.attempts.get(key);
    if (!data) return 0;
    return Math.max(0, this.windowMs - (Date.now() - data.lastAttempt)) / 1000;
  },
  
  reset(key: string) {
    this.attempts.delete(key);
  }
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, loading, navigate]);

  // Rate limit countdown timer
  useEffect(() => {
    if (rateLimitSeconds > 0) {
      const timer = setInterval(() => {
        setRateLimitSeconds((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [rateLimitSeconds]);

  const checkRateLimit = (): boolean => {
    const rateLimitKey = email.toLowerCase().trim();
    if (rateLimiter.isRateLimited(rateLimitKey)) {
      const remaining = rateLimiter.getRemainingTime(rateLimitKey);
      setRateLimitSeconds(remaining);
      setIsRateLimited(true);
      setError(`Too many login attempts. Please try again in ${Math.ceil(remaining / 60)} minutes.`);
      return true;
    }
    return false;
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Check rate limiting first
    if (checkRateLimit()) return;

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      // Record failed attempt for rate limiting
      rateLimiter.recordAttempt(email.toLowerCase().trim());
      setError(error.message || "Invalid email or password. Please try again.");
    } else {
      // Reset rate limiter on successful login
      rateLimiter.reset(email.toLowerCase().trim());
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password);
    setIsSubmitting(false);

    if (error) {
      setError(error.message || "Registration failed. Please try again.");
    } else {
      setSuccess("Account created successfully! You are now logged in.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
          <CardDescription>
            Sign in to access the content management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {isRateLimited && (
              <Alert variant="destructive" className="mb-4">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                  Too many failed attempts. Try again in {Math.ceil(rateLimitSeconds / 60)} minute(s).
                </AlertDescription>
              </Alert>
            )}

            {error && !isRateLimited && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-500/50 bg-green-500/10">
                <AlertDescription className="text-green-700 dark:text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-signin"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password-signin"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || isRateLimited}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : isRateLimited ? (
                    `Locked (${Math.ceil(rateLimitSeconds / 60)}m)`
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password-signup"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary underline">
              ← Back to website
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
