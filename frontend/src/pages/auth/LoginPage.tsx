import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { showSuccess, showError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginUser } from "@/services/auth.service";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError("");

      const response = await loginUser(data);

      localStorage.setItem("accessToken", response.accessToken);

      showSuccess("Welcome back 👋 Login successful!");

      navigate("/dashboard");
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";

      setServerError(message);
      showError(message);

    }
  };

  return (
    <div className="min-h-screen flex bg-[#031633]">

      {/* Left Section */}
      <div className="hidden lg:flex w-[40%] flex-col justify-center px-20 text-white">
        <h1 className="text-5xl font-bold tracking-tight">
          PayFlow
        </h1>

        <h2 className="mt-8 text-4xl font-semibold leading-tight">
          Welcome back 👋
        </h2>

        <p className="mt-6 max-w-md text-slate-400 text-lg">
          Manage invoices, payments and customers from one dashboard.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex w-[60%] items-center justify-center p-10">

        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0B1F45] p-10 shadow-2xl">

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">
              Welcome Back
            </h1>

            <p className="mt-2 text-slate-400">
              Login to your PayFlow account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <Input
                type="email"
                placeholder="Email"
                className="h-11 bg-[#102852] border-white/10 text-white"
                {...register("email", {
                  required: "Email is required",
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                className="h-11 bg-[#102852] border-white/10 text-white"
                {...register("password", {
                  required: "Password is required",
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-slate-400">
              Don't have an account?
              <Link
                to="/register"
                className="ml-1 font-medium text-white hover:text-blue-400"
              >
                Register
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}