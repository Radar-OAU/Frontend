"use client";

import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

const DashboardPage = () => {
  const role = useAuthStore((state) => state.role);
  const hydrated = useAuthStore((state) => state.hydrated);
  const router = useRouter();



  useEffect(() => {
    if (!hydrated) return;

    if (!role) {
      router.push("/login");
      return;
    }

    // Normalize role string to handle case sensitivity
    const normalizedRole = role.toLowerCase().trim();

    if (normalizedRole === "organizer" || normalizedRole === "org") {
      router.push("/dashboard/org");
    } else {
      router.push("/dashboard/student");
    }
  }, [role, router, hydrated]);

  if (!hydrated) return <div>Loading...</div>;

  return <div>Redirecting to your dashboard...</div>;
};
export default DashboardPage;