/**
 * Payment Callback Page
 * 
 * Handles Paystack payment redirects after checkout
 * 
 * Expected URL patterns:
 * - Success: /payment?reference=xxx&status=success
 * - Failed: /payment?status=failed
 * - Cancelled: /payment?status=cancelled
 * 
 * Backend callback URL should be configured as:
 * https://radar.samkiel.dev/payment?status=success
 * 
 * The page will:
 * 1. Extract payment reference from URL query params
 * 2. Verify payment with backend API (POST /tickets/verify-payment/)
 * 3. Display success/failure message with ticket details
 * 4. Redirect user to appropriate page (my tickets or events)
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  
  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [message, setMessage] = useState("Verifying your payment...");
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Get payment reference from URL
      const reference = searchParams.get("reference") || searchParams.get("trxref");
      
      // Check if payment was cancelled or failed based on query params
      const queryStatus = searchParams.get("status") || searchParams.get("");
      
      // Handle explicit failure/cancellation
      if (queryStatus === "failed" || queryStatus === "cancelled") {
        setStatus("failed");
        setMessage("Payment was cancelled or failed. No charges were made.");
        return;
      }

      // If no reference, payment wasn't completed
      if (!reference) {
        setStatus("failed");
        setMessage("No payment reference found. Please try again.");
        return;
      }

      // Verify payment with backend using POST request
      try {
        const response = await api.post(`/tickets/verify-payment/`, {
          reference: reference
        });

        // Check if verification was successful
        if (response.data.message && response.data.message.includes("verified successfully")) {
          setStatus("success");
          setMessage(response.data.message);
          
          // Extract ticket data
          const tickets = response.data.tickets || [];
          if (tickets.length > 0) {
            setTicketData({
              event_name: tickets[0].event_name,
              quantity: tickets.length,
              amount: tickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_price || 0), 0),
              tickets: tickets
            });
          }
        } else {
          setStatus("failed");
          setMessage(response.data.message || "Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        
        const errorData = error.response?.data;
        const errorMessage = errorData?.error || errorData?.message || "";
        
        // Handle specific case where payment was verified but tickets already processed (webhook already handled it)
        if (errorMessage.includes("no pending tickets") || errorMessage.includes("already confirmed")) {
          setStatus("success");
          setMessage("Payment successful! Your tickets have been confirmed. Check your email or dashboard for details.");
        } else {
          setStatus("failed");
          
          // Provide friendly error messages
          let friendlyMessage = "We couldn't verify your payment at this time.";
          
          if (error.response?.status === 404) {
            friendlyMessage = "Payment record not found. If you were charged, please contact support with your payment reference.";
          } else if (error.response?.status === 500) {
            friendlyMessage = "Our payment system is experiencing issues. Please try again in a few minutes or contact support.";
          } else if (errorMessage) {
            friendlyMessage = errorMessage;
          } else if (!error.response) {
            friendlyMessage = "Network error. Please check your connection and try again.";
          }
          
          setMessage(friendlyMessage);
        }
      }
    };

    verifyPayment();
  }, [searchParams, token, router]);

  const handleContinue = () => {
    if (status === "success") {
      if (token) {
        router.push("/dashboard/student/my-tickets");
      } else {
        router.push(`/login?callbackUrl=${encodeURIComponent("/dashboard/student/my-tickets")}`);
      }
    } else {
      router.push("/events");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === "verifying" && (
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center animate-in zoom-in-95 duration-300">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            )}
            {status === "failed" && (
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center animate-in zoom-in-95 duration-300">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              {status === "verifying" && "Verifying Payment"}
              {status === "success" && "Payment Successful!"}
              {status === "failed" && "Payment Failed"}
            </h1>
            
            <p className="text-muted-foreground">
              {message}
            </p>

            {/* Payment Reference */}
            {searchParams.get("reference") && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Payment Reference</p>
                <p className="text-sm font-mono text-foreground break-all bg-muted px-3 py-2 rounded-lg">
                  {searchParams.get("reference") || searchParams.get("trxref")}
                </p>
              </div>
            )}

            {/* Ticket Details */}
            {ticketData && status === "success" && (
              <div className="pt-4 border-t border-border space-y-2 text-left">
                <p className="text-xs text-muted-foreground mb-2">Ticket Details</p>
                {ticketData.event_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Event:</span>
                    <span className="text-foreground font-medium">{ticketData.event_name}</span>
                  </div>
                )}
                {ticketData.quantity && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tickets:</span>
                    <span className="text-foreground font-medium">{ticketData.quantity} ticket{ticketData.quantity > 1 ? 's' : ''}</span>
                  </div>
                )}
                {ticketData.amount !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="text-foreground font-medium">₦{Number(ticketData.amount).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {status !== "verifying" && (
            <div className="mt-8 space-y-3">
              <Button
                onClick={handleContinue}
                className="w-full h-12"
                size="lg"
              >
                {status === "success" ? (
                  <>
                    View My Tickets
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Browse Events"
                )}
              </Button>
              
              {status === "failed" && (
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full h-12"
                  size="lg"
                >
                  Go Back
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Help Text */}
        {status === "failed" && (
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact support with your payment reference.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function PaymentFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading payment details...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentCallback() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
