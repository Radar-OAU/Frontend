"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import useAuthStore from "../../store/authStore";
import { Mail, Lock, User, Briefcase, Hash, Eye, EyeOff, UsersIcon } from "lucide-react";
import { Input } from "../../components/ui/input";

const SignUp = () => {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);

  const [role, setRole] = useState("Student");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);


  const [organisationName, setOrganisationName] = useState("");
const [organisationType, setOrganisationType] = useState("");
 const [organiserEmail, setOrganiserEmail] = useState("");
  const [organiserPassword, setOrganiserPassword] = useState("");
  const [organiserConfirm, setOrganiserConfirm] = useState("");

  const [errors, setErrors] = useState({}); 

  const shortPassword = password.length > 0 && password.length < 6;
  const passwordMismatch =
    confirmPassword.length > 0 && confirmPassword !== password;

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);





    try {
      const res = await api.post("/auth/signup", {
        name,
        role,
        department,
        matric: role === "Student" ? matric : undefined,
        email,
        password,
      });

      loginUser(res.data.user, res.data.token);
      router.push("/dashboard");
    } catch (err) {
      showToast(err.response?.data?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0A0A14]">
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1568289523939-61125d216fe5?q=80&w=436&auto=format&fit=crop')`,
            filter: "grayscale(30%)",
          }}
        />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-[#FF3A66] text-3xl font-bold mb-8 text-center">
            Logo
          </div>

          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Create Account
          </h1>

          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setRole("Student")}
              className={`flex-1 py-2 px-4 rounded-full ${
                role === "Student"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-gray-600 border text-gray-300"
              }`}
            >
              Student
            </button>

            <button
              onClick={() => setRole("Organizer")}
              className={`flex-1 py-2 px-4 rounded-full ${
                role === "Organizer"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-gray-600 border text-gray-300"
              }`}
            >
              Organiser
            </button>
          </div>

          <form onSubmit={submitForm} className="space-y-4">
            <div className="space-y-5">

              {/* NAME */}
              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="e.g. John Christopher"
                    value={name}
                    onChange={(e) => setName(e.target.value)}  
                    className="w-full bg-transparent border border-white/20 rounded-xl py-3.5 pl-12 pr-4 text-white"
                  />
                </div>
              </div>

              {/* DEPARTMENT */}
              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                  Department
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)} 
                    className="w-full bg-transparent border border-white/20 rounded-xl py-3.5 pl-12 pr-4 text-white"
                  />
                </div>
              </div>

              {/* MATRIC — student only */}
              {role === "Student" && (
                <div>
                  <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                    Matric Number
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="e.g. CSC/2024/057"
                      value={matric}
                      onChange={(e) => setMatric(e.target.value)} 
                      className="w-full bg-transparent border border-white/20 rounded-xl py-3.5 pl-12 pr-4 text-white"
                    />
                  </div>
                </div>
              )}

              {/* EMAIL */}
              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full bg-transparent border border-white/20 rounded-xl py-3.5 pl-12 pr-12 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                  >
                    {showPass ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Confirm PASSWORD */}
              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                 Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full bg-transparent border border-white/20 rounded-xl py-3.5 pl-12 pr-12 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                  >
                    {showPass ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* --- ORGANIZER FORM --- */}
            {role === "Organizer" && (
              <>
                {/* Organisation Name */}
                <div>
                  <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                    Organisation Name
                  </label>
                  <div className="relative">
                    <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="e.g. Campus Tech Club"
                      value={organisationName}
                      onChange={(e) => setOrganisationName(e.target.value)}
                      className="w-full bg-transparent border border-white/20 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/30"
                    />
                  </div>
                </div>

                {/* Organisation Type */}
                <div>
                  <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                    Organisation Type
                  </label>
                  <div className="relative">
                    <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="e.g. Non-profit / Student Society"
                      value={organisationType}
                      onChange={(e) => setOrganisationType(e.target.value)}
                      className="w-full bg-transparent border border-white/20 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/30"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      placeholder="Enter organisation email"
                      value={organiserEmail}
                      onChange={(e) => setOrganiserEmail(e.target.value)}
                      className="w-full bg-transparent border border-white/20 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/30"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={organiserPassword}
                      onChange={(e) => setOrganiserPassword(e.target.value)}
                      className="w-full bg-transparent border border-white/20 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                    >
                      {showPass ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={organiserConfirm}
                      onChange={(e) => setOrganiserConfirm(e.target.value)}
                      className="w-full bg-transparent border border-white/20 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                    >
                      {showConfirm ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
              </>
            )}

              
            {/* --- Remember Me --- */}
            <div className="flex items-center gap-3 pt-1">
                <button 
                    type="button" 
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${rememberMe ? 'bg-[#FF2E63] border-[#FF2E63]' : 'bg-transparent border-gray-500'}`}
                >
                    {rememberMe && <Check size={14} className="text-white" />}
                </button>
                <label className="text-sm text-gray-300 cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>Remember me</label>
            </div>
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF2E63] hover:bg-[#FF2E63]/90 text-white font-medium py-3 px-6 rounded-full"
            >
                
                {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </button>


           {/* --- OR Separator --- */}
        <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
            </div>
            <span className="relative px-4 text-sm text-gray-500 bg-[#050B14]">or</span>
        </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
