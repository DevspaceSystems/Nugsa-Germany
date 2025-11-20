
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, MessageSquare, Send, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [orgSettings, setOrgSettings] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchOrgSettings();
  }, []);

  const fetchOrgSettings = async () => {
    const { data, error } = await supabase
      .from("organization_settings")
      .select("*");

    if (data && !error) {
      const settings: Record<string, any> = {};
      data.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });
      setOrgSettings(settings);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("contact_inquiries")
      .insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 mr-4 text-primary" />
            Contact NUGSA - Germany
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions, suggestions, or need assistance? We're here to help! 
            Reach out to the NUGSA - Germany community and our dedicated team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+49 1512 3456789"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="membership">Membership Question</SelectItem>
                      <SelectItem value="events">Events & Activities</SelectItem>
                      <SelectItem value="support">Student Support</SelectItem>
                      <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                      <SelectItem value="emergency">Emergency Assistance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={6}
                    placeholder="Please describe your inquiry in detail..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* NUGSA Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <img 
                    src="/icon.png" 
                    alt="NUGSA Logo" 
                    className="w-8 h-8 mr-3"
                  />
                  NUGSA - Germany Executive Team
                </CardTitle>
                <CardDescription>
                  NATIONAL UNION OF GHANAIAN STUDENT ASSOCIATIONS (NUGSA) - GERMANY
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">
                      {orgSettings.contact_info?.email || "contact@nugsa.de"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">
                      {orgSettings.contact_info?.phone || "+49 1512 3456789"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">WhatsApp Group</p>
                    <p className="text-gray-600">Join our community group for updates</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Social Media</p>
                    <p className="text-gray-600">Follow us for the latest news</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact Options */}
            <Card>
              <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>
                  Need immediate assistance? Try these options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.open(orgSettings.contact_info?.whatsapp_link || "#", "_blank")}
                >
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Join WhatsApp Group
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.open(`tel:${orgSettings.contact_info?.phone || "+919876543210"}`, "_self")}
                >
                  <Phone className="w-4 h-4 mr-3" />
                  Emergency Hotline
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.open(`mailto:${orgSettings.contact_info?.email || "info@nugsa.de"}`, "_self")}
                >
                  <Mail className="w-4 h-4 mr-3" />
                  Student Support Email
                </Button>
              </CardContent>
            </Card>

            {/* Jiriba Soft Credits */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
            <CardTitle className="text-xl text-primary">Platform Support</CardTitle>
            <CardDescription className="text-muted-foreground">
                  Technical support and development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">JS</span>
              </div>
              <div>
                <p className="font-semibold text-primary">Jiriba Soft</p>
                <p className="text-sm text-emerald-700">contact@jiribasoft.com</p>
                <p className="text-xs text-muted-foreground">Platform development & technical support</p>
              </div>
            </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common questions about NUGSA - Germany and our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">How do I join NUGSA - Germany?</h4>
                <p className="text-gray-600 text-sm">
                  Simply register on our platform and complete your profile. Verification is done by our admin team.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Is there a membership fee?</h4>
                <p className="text-gray-600 text-sm">
                  NUGSA membership is free for all Ghanaian students studying in Germany.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">How can I get emergency support?</h4>
                <p className="text-gray-600 text-sm">
                  Contact us immediately through the emergency hotline or WhatsApp group for urgent assistance.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Can alumni join the platform?</h4>
                <p className="text-gray-600 text-sm">
                  Yes! Alumni can join as mentors and continue supporting current students.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
