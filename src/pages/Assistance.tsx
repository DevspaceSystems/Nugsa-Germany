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
import {
  Heart,
  MessageCircle,
  Calendar,
  AlertCircle,
  ClipboardList,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  LifeBuoy
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type AssistanceRequest = Tables<"assistance_requests">;

export default function Assistance() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
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
          title: "Submission Failed",
          description: "We couldn't submit your request. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request Received",
          description: "Your assistance request has been submitted successfully.",
        });
        setFormData({
          requestType: "",
          title: "",
          description: "",
          urgencyLevel: "medium",
        });
        fetchRequests();
        setActiveTab("history");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Our team is looking into it.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' };
      case 'under_review': return { icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
      case 'approved': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
      case 'rejected': return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
      case 'resolved': return { icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
      default: return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const getUrgencyInfo = (urgency: string) => {
    switch (urgency) {
      case 'low': return { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100', label: 'Low Priority' };
      case 'medium': return { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100', label: 'Medium Priority' };
      case 'high': return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', label: 'High Priority' };
      case 'critical': return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', label: 'Critical' };
      default: return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-100', label: urgency };
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-12 text-center max-w-lg border border-gray-100 shadow-2xl rounded-3xl animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Please sign in to access NUGSA-Germany's student assistance services and track your requests.
          </p>
          <Button onClick={() => window.location.href = '/auth'} className="modern-button px-8 py-6 text-lg rounded-xl">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 overflow-hidden relative">
      {/* Background Orbs - Softer for light mode */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wider uppercase">
                  Support Portal
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center gap-4">
                Student <span className="gradient-text">Assistance</span>
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
                Connect with the NUGSA-Germany support team. Whether it's financial, academic, or personal wellbeing, we're here to help you thrive.
              </p>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-sm">
              <button
                onClick={() => setActiveTab("new")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                  activeTab === "new"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <PlusCircle className="w-4 h-4" />
                New Request
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                  activeTab === "history"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <ClipboardList className="w-4 h-4" />
                Your History
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 min-h-[600px]">
          {activeTab === "new" ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-12 shadow-xl shadow-blue-900/5 overflow-hidden relative group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700" />

                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                      <LifeBuoy className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900">Create New Request</h2>
                      <p className="text-gray-500 text-sm">Provide details about the assistance you need.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="requestType" className="text-gray-700 text-sm font-bold ml-1">Support Type</Label>
                        <Select value={formData.requestType} onValueChange={(value) => setFormData({ ...formData, requestType: value })}>
                          <SelectTrigger className="h-14 bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all">
                            <SelectValue placeholder="Select support category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-100 text-gray-900">
                            <SelectItem value="financial">💰 Financial Support</SelectItem>
                            <SelectItem value="health">🏥 Health Support</SelectItem>
                            <SelectItem value="academic">🎓 Academic Assistance</SelectItem>
                            <SelectItem value="mental">❤️‍🩹 Mental Wellbeing</SelectItem>
                            <SelectItem value="general">✨ Other/General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="urgencyLevel" className="text-gray-700 text-sm font-bold ml-1">Urgency Preference</Label>
                        <Select value={formData.urgencyLevel} onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value })}>
                          <SelectTrigger className="h-14 bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-100 text-gray-900">
                            <SelectItem value="low" className="text-green-600">🟢 Low Priority</SelectItem>
                            <SelectItem value="medium" className="text-yellow-600">🟡 Medium Priority</SelectItem>
                            <SelectItem value="high" className="text-orange-600">🟠 High Priority</SelectItem>
                            <SelectItem value="critical" className="text-red-600">🔴 Critical / Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-gray-700 text-sm font-bold ml-1">Request Headline</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Assistance with semester ticket fees"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="h-14 bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-gray-700 text-sm font-bold ml-1">Full Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Please describe your situation in detail so our team can best assist you. Include any specific challenges or deadlines..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all resize-none min-h-[180px]"
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-16 text-lg font-bold rounded-2xl group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                        disabled={submitting}
                      >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Heart className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                              Submit Assistance Request
                            </>
                          )}
                        </div>
                      </Button>
                      <p className="text-center text-gray-400 text-xs mt-6 px-4">
                        By submitting, you agree to NUGSA-Germany's terms for student support.
                        Your information will be kept confidential and reviewed only by the administration.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Stats Summary */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/50">
                    <h3 className="text-gray-900 font-extrabold text-xl mb-6 tracking-tight">Summary</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50/50 border border-green-100/50">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700 font-medium">Resolved</span>
                        </div>
                        <span className="text-green-700 font-bold">{requests.filter(r => r.status === 'resolved').length}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-yellow-50/50 border border-yellow-100/50">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="text-gray-700 font-medium">Pending</span>
                        </div>
                        <span className="text-yellow-700 font-bold">{requests.filter(r => r.status === 'pending').length}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                        <div className="flex items-center gap-3">
                          <PlusCircle className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700 font-medium">Total</span>
                        </div>
                        <span className="text-blue-700 font-bold">{requests.length}</span>
                      </div>
                    </div>

                    <div className="mt-10 p-4 rounded-2xl bg-slate-50 border border-gray-100">
                      <p className="text-gray-500 text-xs leading-relaxed">
                        <AlertCircle className="w-4 h-4 inline-block mr-2 text-slate-400" />
                        Requests are reviewed within 3-5 business days. Check back regularly for status updates.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requests List */}
                <div className="lg:col-span-3 space-y-6">
                  {loading ? (
                    <div className="bg-white p-20 text-center rounded-3xl border border-gray-100">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
                      <p className="text-gray-500 text-lg">Retrieving your history...</p>
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="bg-white p-20 text-center rounded-3xl border border-gray-100 shadow-sm">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardList className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No history yet</h3>
                      <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        You haven't submitted any assistance requests. We're here to support you when you need it.
                      </p>
                      <Button onClick={() => setActiveTab("new")} variant="outline" className="border-gray-200 text-gray-700 hover:bg-slate-50 h-12 px-8 rounded-xl font-semibold">
                        Submit First Request
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {requests.map((request, idx) => {
                        const statusInfo = getStatusInfo(request.status);
                        const urgencyInfo = getUrgencyInfo(request.urgency_level);
                        const StatusIcon = statusInfo.icon;

                        return (
                          <div
                            key={request.id}
                            className="bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group animate-in fade-in slide-in-from-right-8"
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge className={cn("px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border", urgencyInfo.bg, urgencyInfo.color, urgencyInfo.border)}>
                                    {urgencyInfo.label}
                                  </Badge>
                                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{request.request_type} Support</span>
                                </div>
                                <h4 className="text-2xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">{request.title}</h4>
                              </div>

                              <div className={cn("flex items-center gap-2 self-start px-4 py-2 rounded-xl text-xs font-bold border shadow-sm", statusInfo.bg, statusInfo.color, statusInfo.border)}>
                                <StatusIcon className="w-4 h-4" />
                                <span className="uppercase tracking-widest">{request.status.replace('_', ' ')}</span>
                              </div>
                            </div>

                            <p className="text-gray-600 mb-8 text-sm leading-relaxed whitespace-pre-wrap">
                              {request.description}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
                              <div className="flex items-center text-xs font-semibold text-gray-400 bg-slate-50 px-4 py-2 rounded-full border border-gray-100">
                                <Calendar className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                Submitted on {new Date(request.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>

                              {request.resolved_at && (
                                <div className="flex items-center text-xs text-green-600 font-bold uppercase tracking-wider bg-green-50 px-4 py-2 rounded-full border border-green-100">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Resolved on {new Date(request.resolved_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {request.admin_notes && (
                              <div className="mt-8 p-6 rounded-2xl bg-blue-50 border border-blue-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 rounded-full -mr-8 -mt-8" />
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 rounded-lg bg-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-extrabold text-xs text-blue-700 uppercase tracking-widest">Administrator's Response</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed italic border-l-4 border-blue-200 pl-4 py-1">
                                  {request.admin_notes}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Gradient Background Blur */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
