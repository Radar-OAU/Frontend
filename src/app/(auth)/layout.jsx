'use client'
import { useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from 'lucide-react'
import { GoogleAuthProvider } from "../../components/GoogleAuthProvider";


const authLayout = ({children}) => {
    const user = useAuthStore(state => state.role === 'student' || state.role ==='organizer' ? state.user : null)
    const router = useRouter()
    useEffect(() => {
         if(user) {
         router.push('/dashboard')
    }

    },[user, router])

     if (user) return (
        <>
         <div className="animate-spin">
            <Loader2 />
         </div>
        </>
     )
    return (
        <GoogleAuthProvider>
            {children}
        </GoogleAuthProvider>
    )

}

export default authLayout;
