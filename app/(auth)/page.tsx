import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SPORTBOOK ENGINE | Login",
  description: "Sign in to access sportbook engine",
};

export default function SignIn() {
  return <SignInForm />;
}
