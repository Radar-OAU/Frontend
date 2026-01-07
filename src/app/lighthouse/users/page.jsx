
"use client";

import { useEffect, useState } from "react";
import { Loader2, User } from "lucide-react";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    fetchUsers(filterRole);
  }, [filterRole]);

  const fetchUsers = async (role) => {
    setLoading(true);
    try {
      const params = {};
      if (role !== "all") {
        params.role = role;
      }
      
      const usersData = await adminService.getAllUsers(params);
      
      // API returns { users: [...], pagination: ..., message: ... }
      let combinedUsers = [];
      if (usersData?.users) {
        combinedUsers = usersData.users;
      } else if (Array.isArray(usersData)) {
         // Fallback in case backend returns array directly
        combinedUsers = usersData;
      }

      setUsers(combinedUsers);
    } catch (error) {
       console.error(error);
       toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "all", label: "All Users" },
    { id: "student", label: "Students" },
    { id: "organizer", label: "Organizers" },
  ];

  return (
    <div className="space-y-4">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-sm text-muted-foreground">
          View and manage registered users.
        </p>
      </div>

       {/* Role Filters */}
       <div className="flex p-1 bg-muted/40 rounded-lg w-fit border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`
                px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
                ${filterRole === tab.id 
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
       </div>

       <Card className="shadow-sm border-border">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              {filterRole === 'all' ? 'All Users' : filterRole === 'student' ? 'Students' : 'Organizers'} 
              <span className="ml-2 text-xs font-normal text-muted-foreground">({users.length})</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
             <div className="border border-t-0">
             <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <tr>
                   <th className="p-3 font-medium">User</th>
                   <th className="p-3 font-medium">Email</th>
                   <th className="p-3 font-medium">Role</th>
                   <th className="p-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-xs text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors text-xs">
                      <td className="p-3 flex items-center gap-2.5">
                         <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-gray-500" />
                         </div>
                         <div>
                            <div className="font-medium">
                              {user.name || "Unknown User"}
                            </div>
                         </div>
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border
                          ${user.role === 'organizer'
                            ? "bg-purple-50 text-purple-700 border-purple-100" 
                            : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}>
                          {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "Student"}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                         {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
