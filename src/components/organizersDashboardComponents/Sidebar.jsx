// "use client";

// import {
//   Group,
//   GroupIcon,
//   Home,
//   LogOut,
//   PlusIcon,
//   QrCodeIcon,
//   Settings,
//   User,
//   User2,
// } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// const OrganizationDashboardNavLinks = [
//   { name: "Overview", link: "/dashboard/org", icon: <Home size={30} /> },
//   {
//     name: "Create Event",
//     link: "/dashboard/org/create-event",
//     icon: <PlusIcon size={30} />,
//   },
//   {
//     name: "My Event",
//     link: "/dashboard/org/my-event",
//     icon: <GroupIcon size={30} />,
//   },
//   {
//     name: "QR Scanner",
//     link: "/dashboard/org/qr-scanner",
//     icon: <QrCodeIcon size={30} />,
//   },
//   { name: "Profile", link: "/dashboard/org/profile", icon: <User size={30} /> },
// ];

// const Sidebar = () => {
//   const location = usePathname();
//   console.log(location);
//   const active = OrganizationDashboardNavLinks.find(
//     (link) => location === `${link.link}`
//   );
//   console.log(active);
//   return (
//     <>
//       <div className="flex flex-row justify-around max-sm:items-center md:flex-col md:gap-8">
//         {OrganizationDashboardNavLinks.map((link) => (
//           <Link
//             href={link.link}
//             key={link.name}
//             className={`${active ? (active.link === link.link ? "bg-gray-200 p-2 md:p-2 rounded-xl text-gray-800 font-bold" : "") : null}`}
//           >
//             <div className="flex flex-col md:flex-row items-center md:gap-3 gap-1">
//               <span className="">{link.icon}</span>
//               <p
//                 className={`${active ? (active.link === link.link ? "text-xs md:text-base" : "hidden md:block") : "hidden md:block"}`}
//               >
//                 {link.name}
//               </p>
//             </div>
//           </Link>
//         ))}
//       </div>

//       <hr className="mt-8 text-gray-800 hidden md:block" />

//       <div className="mt-8 space-y-7 hidden md:block">
//         <Link
//           href={`/dashboard/org/settings`}
//           className={`${location === "/dashboard/org/settings" ? "bg-gray-200 flex gap-3 text-gray-800 p-2 rounded-xl font-bold" : "md:flex md:flex-row hidden md:gap-3 items-center"}`}
//         >
//           <span>
//             <Settings />
//           </span>
//           <p>Settings</p>
//         </Link>
//         <button className="hover:bg-gray-200 p-2 md:p-2 hover:rounded-xl font-bold md:flex md:flex-row hidden md:gap-3 items-center text-red-500 cursor-pointer">
//           <span>
//             <LogOut />
//           </span>
//           <p>Logout</p>
//         </button>
//       </div>
//     </>
//   );
// };

// export default Sidebar;



"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  ScanLine,
  Settings,
  User,
  LogOut,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const links = [
  { name: "Overview", link: "/dashboard/org", icon: LayoutDashboard },
  { name: "My Events", link: "/dashboard/org/my-event", icon: Calendar },
  { name: "Create Event", link: "/dashboard/org/create-event", icon: PlusCircle },
  { name: "Payouts", link: "/dashboard/org/payouts", icon: Wallet },
  { name: "QR Scanner", link: "/dashboard/org/qr-scanner", icon: ScanLine },
  { name: "Profile", link: "/dashboard/org/profile", icon: User },
];

const SidebarItem = ({ icon: Icon, name, href, active, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
      active
        ? "text-white bg-white/5"
        : "text-gray-400 hover:text-white hover:bg-white/3"
    )}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
    )}
    <Icon
      size={20}
      className={cn(
        "transition-colors",
        active ? "text-primary" : "text-gray-500 group-hover:text-white"
      )}
    />
    <span className="text-sm font-medium tracking-wide">{name}</span>
  </Link>
);

const SidebarContent = ({ onClose }) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Logo */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">
              Radar
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
              Organizer Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((l) => (
          <SidebarItem
            key={l.link}
            icon={l.icon}
            name={l.name}
            href={l.link}
            active={pathname === l.link}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/dashboard/org/settings"
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all",
            pathname === "/dashboard/org/settings"
              ? "text-white bg-white/5"
              : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
          )}
        >
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <button className="mt-2 flex items-center gap-3 w-full px-4 py-3.5 rounded-xl hover:bg-red-500/10 text-red-400 transition">
          <LogOut size={20} />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-50">
        <span className="font-bold text-white">Radar</span>
        <button onClick={() => setOpen(true)} className="text-white">
          <Menu />
        </button>
      </div>

      {/* Desktop */}
      <aside className="hidden lg:flex w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-background z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed inset-y-0 left-0 w-72 bg-background border-r border-white/10 z-50"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              <SidebarContent onClose={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
