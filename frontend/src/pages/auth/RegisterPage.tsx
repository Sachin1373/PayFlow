import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { showSuccess, showError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { registerUser } from "@/services/auth.service";

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError("");

      await registerUser(data);
      showSuccess("Registration successful!");
      navigate("/login");
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
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 text-white">

        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight">
            PayFlow
          </h1>
        </div>

        <h2 className="max-w-xl text-4xl font-semibold leading-tight">
          Manage invoices, payments and customers from one dashboard.
        </h2>

        <p className="mt-6 max-w-md text-slate-400 text-lg">
          Connect Cashfree, create invoices,
          track payments, manage customers
          and grow your business.
        </p>

      </div>

      {/* Right Section */}
      <div className="flex flex-1 items-center justify-center p-6">

        <div className="w-full max-w-xl min-h-[500px] rounded-2xl border border-white/10 bg-[#0B1F45] p-8 shadow-2xl">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Create Account
            </h1>

            <p className="mt-2 text-slate-400">
              Start managing invoices and payments.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">

              <div>
                <Input
                  placeholder="First Name"
                  className="h-11 bg-[#102852] border-white/10 text-white"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />

                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  placeholder="Last Name"
                  className="h-11 bg-[#102852] border-white/10 text-white"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />

                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

            </div>

            <div>
              <Input
                type="email"
                placeholder="Business Email"
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
                placeholder="Mobile Number"
                className="h-11 bg-[#102852] border-white/10 text-white"
                {...register("mobile", {
                  required: "Mobile number is required",
                })}
              />

              {errors.mobile && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.mobile.message}
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
                  minLength: {
                    value: 8,
                    message: "Minimum 8 characters",
                  },
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
              {isSubmitting
                ? "Creating Account..."
                : "Create Account"}
            </Button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?

              <Link
                to="/login"
                className="ml-1 font-medium text-white hover:text-blue-400"
              >
                Login
              </Link>
            </p>

          </form>

        </div>

      </div>

    </div>
  );
}