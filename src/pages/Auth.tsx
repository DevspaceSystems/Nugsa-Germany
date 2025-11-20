
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AuthForm } from "@/components/auth/AuthForm";

export default function Auth() {
  const { user } = useAuth();
  const { profile, isLoading } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading && profile) {
      // Redirect based on role
      if (profile.role === "admin" && profile.is_verified) {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, profile, isLoading, navigate]);

  // Show loading while checking profile
  if (user && isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return <AuthForm />;
}
