"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5570F1]/10">
              <svg
                width="20"
                height="20"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.9976 12.037C22.108 12.2616 22.1809 12.5021 22.2135 12.7494L22.8168 21.7192L23.1162 26.2277C23.1193 26.6913 23.1921 27.1519 23.3321 27.5947C23.6938 28.4539 24.5639 28.9999 25.5104 28.9618L39.9346 28.0184C40.5592 28.0081 41.1623 28.2417 41.6114 28.6678C41.9855 29.0229 42.2271 29.4874 42.3032 29.987L42.3288 30.2904C41.7319 38.5556 35.6615 45.4494 27.4134 47.229C19.1654 49.0086 10.7074 45.2493 6.63154 37.9923C5.45651 35.8839 4.72257 33.5665 4.47283 31.1761C4.36849 30.4685 4.32257 29.7537 4.33545 29.0388C4.32257 20.1776 10.6329 12.5167 19.4661 10.6699C20.5292 10.5044 21.5714 11.0672 21.9976 12.037Z"
                  fill="#97A5EB"
                />
                <path
                  opacity="0.4"
                  d="M27.885 4.33511C37.7648 4.58646 46.0683 11.6909 47.6667 21.26L47.6514 21.3306L47.6078 21.4333L47.6139 21.7151C47.5912 22.0885 47.4471 22.4478 47.1986 22.7381C46.9398 23.0404 46.5862 23.2462 46.1968 23.3261L45.9593 23.3587L29.3176 24.437C28.7641 24.4916 28.2129 24.3131 27.8013 23.9459C27.4582 23.6399 27.2389 23.2269 27.1769 22.7818L26.0599 6.1643C26.0405 6.10811 26.0405 6.0472 26.0599 5.99101C26.0752 5.53296 26.2768 5.09999 26.6198 4.78883C26.9627 4.47768 27.4184 4.31427 27.885 4.33511Z"
                  fill="#FFCC91"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-[#45464E]">
                Welcome back
              </CardTitle>
              <CardDescription className="text-sm text-gray-400">
                Sign in to your Nova account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-[#45464E]"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-gray-200 focus-visible:border-[#5570F1] focus-visible:ring-[#5570F1]"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-[#45464E]"
                  >
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-xs text-[#5570F1] underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border-gray-200 focus-visible:border-[#5570F1] focus-visible:ring-[#5570F1]"
                />
              </div>
              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-500">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full rounded-xl bg-[#5570F1] text-white hover:bg-[#4560e0]"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-[#5570F1] underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
