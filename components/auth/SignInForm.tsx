"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/app/icons";
import { POSTREQUEST } from "@/utils/base_request";
import { toast } from "sonner";

// Define the validation schema using Zod
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Infer the form data type from the schema
type LoginFormInputs = z.infer<typeof loginSchema>;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Set up react-hook-form with the Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormInputs) => {
    await handleLogin(data);
  };

  const handleLogin = async (data: LoginFormInputs) => {
    console.log("Form submitted");
    console.log("Login Form data:", data);
    setLoading(true);

    try {
      const response = await POSTREQUEST("/auth/login?source=admin", data);
      console.log("Login data:", response);
      // if (response?.data?.status === 200) {
      toast.success("Login successful");
      router.push("/dashboard"); // Navigate to the dashboard
      localStorage.setItem(
        "token",
        JSON.stringify(response?.data?.data?.token)
      );
      localStorage.setItem("authData", JSON.stringify(response?.data));
      // }
      if (response?.data?.status === 404) {
        toast.error(response?.data?.error || "Invalid Email or Password");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="username"
                    type="text"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-error-500 text-xs mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="text-error-500 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
