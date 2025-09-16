"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function SSOCallback() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const convexUser = useQuery(
    api.users.getCurrentUser,
    userId ? undefined : "skip"
  );

  useEffect(() => {
    if (!isLoaded || !userId || !convexUser) return;

    if (convexUser.role === "admin" || convexUser.role === "instructor") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  }, [isLoaded, userId, convexUser, router]);

  return <div className="grid h-screen place-items-center">Redirecting…</div>;
}