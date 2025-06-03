"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function withAuth(Component: React.FC) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage?.getItem("token");
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
