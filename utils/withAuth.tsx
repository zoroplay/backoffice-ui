"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { isReady, isAuthenticated } = useAuth();

    useEffect(() => {
      if (isReady && !isAuthenticated) {
        router.push("/");
        toast("You're required to sign in to continue", {
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        });
      }
    }, [isAuthenticated, isReady, router]);

    if (!isReady || !isAuthenticated) return null;

    return <Component {...props} />;
  };
}
