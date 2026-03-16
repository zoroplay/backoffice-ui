"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function withAuth(Component: React.FC) {
  return function AuthenticatedComponent(props: Record<string, unknown>) {
    const router = useRouter();

    useEffect(() => {
      const tokenValue = localStorage?.getItem("token");
      const token = (() => {
        if (!tokenValue) return null;
        try {
          const parsed = JSON.parse(tokenValue);
          return typeof parsed === "string" ? parsed : tokenValue;
        } catch {
          return tokenValue;
        }
      })();

      if (!token) {
        router.push("/");
        toast("You're required to sign in to continue", {
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        });
      }
    }, [router]);

    return <Component {...props} />;
  };
}
