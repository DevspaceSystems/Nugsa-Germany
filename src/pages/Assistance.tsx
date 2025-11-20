
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Calendar, AlertCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type AssistanceRequest = Tables<"assistance_requests">;

export default function Assistance() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    requestType: "",
    title: "",
    description: "",
    urgencyLevel: "medium",
  });

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("assistance_requests")
      .select("*")
      .eq("student_id", user?.id)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setRequests(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("assistance_requests")
        .insert({
          student_id: user.id,
          request_type: formData.requestType,
          title: formData.title,
          description: formData.description,
          urgency_level: formData.urgencyLevel,
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit assistance request.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request Submitted",
          description: "Your assistance request has been submitted successfully.",
        });
        setFormData({
          requestType: "",
          title: "",
          description: "",
          urgencyLevel: "medium",
        });
        fetchRequests();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      resolved: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[urgency as keyof typeof colors] || colors.medium;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access assistance services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="mb-12 text-center">
          <div className="glass-effect rounded-2xl p-10 mb-8 floating-animation">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold gradient-text mb-4">Student Assistance</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're here to support you through every challenge. Get financial and mental health assistance 
              from NUGSA - Germany's caring community. Your success is our priority.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center text-blue-600">
                <MessageCircle className="w-6 h-6 mr-2" />
                <span className="font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center text-purple-600">
                <Heart className="w-6 h-6 mr-2" />
                <span className="font-medium">Caring Community</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Request Form */}
          <div className="neon-card p-8 pulse-glow">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold gradient-text mb-2">Submit Assistance Request</h3>
              <p className="text-muted-foreground">
                Tell us how we can help you with your studies and wellbeing
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="requestType" className="text-sm font-medium text-foreground">Type of Support</Label>
                <Select value={formData.requestType} onValueChange={(value) => setFormData({...formData, requestType: value})}>
                  <SelectTrigger className="neon-input">
                    <SelectValue placeholder="Select support type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mental">✨ General Support</SelectItem>
                    <SelectItem value="financial">🎓 Courses Support</SelectItem>
                    <SelectItem value="financial">💰 Financial Support</SelectItem>
                    <SelectItem value="mental">🏥 Health Support</SelectItem>
                    <SelectItem value="mental">❤️‍🩹 Mental Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="urgencyLevel" className="text-sm font-medium text-foreground">Urgency Level</Label>
                <Select value={formData.urgencyLevel} onValueChange={(value) => setFormData({...formData, urgencyLevel: value})}>
                  <SelectTrigger className="neon-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low Priority</SelectItem>
                    <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                    <SelectItem value="high">🟠 High Priority</SelectItem>
                    <SelectItem value="critical">🔴 Critical/Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-medium text-foreground">Request Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of your request"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="neon-input"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your situation and how we can help..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="neon-input"
                  rows={6}
                  required
                />
              </div>

              <button type="submit" className="neon-button w-full py-4 text-lg font-semibold" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Previous Requests */}
          <div className="neon-card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold gradient-text mb-2">Your Requests</h3>
              <p className="text-muted-foreground">
                Track the status of your assistance requests
              </p>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-muted-foreground mt-4 text-lg">Loading your requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">No requests yet</h3>
                <p className="text-muted-foreground text-lg">Submit your first assistance request to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {requests.map((request) => (
                  <div key={request.id} className="glass-effect rounded-xl p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-foreground text-lg">{request.title}</h4>
                      <div className="flex space-x-2">
                        <Badge className={`${getStatusColor(request.status)} px-3 py-1 text-xs font-medium`}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getUrgencyColor(request.urgency_level)} px-3 py-1 text-xs font-medium`}>
                          {request.urgency_level}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                      {request.description}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      <span className="mx-3">•</span>
                      <span className="capitalize font-medium">{request.request_type} support</span>
                    </div>
                    {request.admin_notes && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <p className="font-semibold text-blue-800 mb-2 flex items-center">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Admin Response:
                        </p>
                        <p className="text-blue-700">{request.admin_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
