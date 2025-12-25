"use client";

import {
  Calendar,
  Home,
  LogOut,
  Settings,
  Ticket,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const StudentDashboardNavLinks = [
  { name: "Overview", link: "/dashboard/student", icon: <Home size={30} /> },
  {
    name: "Events",
    link: "/dashboard/student/events",
    icon: <Calendar size={30} />,
  },
  {
    name: "My Tickets",
    link: "/dashboard/student/my-tickets",
    icon: <Ticket size={30} />,
  },
  { name: "Profile", link: "/dashboard/student/profile", icon: <User size={30} /> },
];

const Sidebar = () => {
  const location = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const active = StudentDashboardNavLinks.find(
    (link) => location === `${link.link}`
  );

  return (
    <>
      <div className="hidden md:flex justify-center mb-6">
        <Logo />
      </div>
      <div className="flex flex-row justify-around max-sm:items-center md:flex-col md:gap-8">
        {StudentDashboardNavLinks.map((link) => (
          <Link
            href={link.link}
            key={link.name}
            className={`${active ? (active.link === link.link ? "bg-gray-200 p-2 md:p-2 rounded-xl text-gray-800 font-bold" : "") : null}`}
          >
            <div className="flex flex-col md:flex-row items-center md:gap-3 gap-1">
              <span className="">{link.icon}</span>
              <p
                className={`${active ? (active.link === link.link ? "text-xs md:text-base" : "hidden md:block") : "hidden md:block"}`}
              >
                {link.name}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <hr className="mt-8 text-gray-800 hidden md:block" />

      <div className="mt-8 space-y-7 hidden md:block">
        <Link
          href={`/dashboard/student/settings`}
          className={`${location === "/dashboard/student/settings" ? "bg-gray-200 flex gap-3 text-gray-800 p-2 rounded-xl font-bold" : "md:flex md:flex-row hidden md:gap-3 items-center"}`}
        >
          <span>
            <Settings />
          </span>
          <p>Settings</p>
        </Link>
        <button 
          onClick={handleLogout}
          className="hover:bg-gray-200 p-2 md:p-2 hover:rounded-xl font-bold md:flex md:flex-row hidden md:gap-3 items-center text-red-500 cursor-pointer w-full"
        >
          <span>
            <LogOut />
          </span>
          <p>Logout</p>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
