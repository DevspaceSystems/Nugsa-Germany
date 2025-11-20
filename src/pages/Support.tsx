import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, CreditCard, Smartphone, Star, ExternalLink, Copy, CheckCircle, Mail, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Sponsor = Tables<"sponsors">;

export default function Support() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [orgSettings, setOrgSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSponsors();
    fetchOrgSettings();
  }, []);

  const fetchSponsors = async () => {
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .eq("active", true)
      .order("featured", { ascending: false });

    if (data && !error) {
      setSponsors(data);
    }
    setLoading(false);
  };

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support information...</p>
        </div>
      </div>
    );
  }

  // Extract treasurer details from contact_details
  const contactDetails = orgSettings.contact_details || {};
  const treasurerDetails = {
    name: contactDetails.treasurer_name || 'Not specified',
    email: contactDetails.treasurer_email || 'Not specified',
    phone: contactDetails.treasurer_phone || 'Not specified',
    financeEmail: contactDetails.finance_email || 'Not specified'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold text-primary">Support Our Students</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your generous contributions help Ghanaian students in Germany with educational expenses, 
            emergency support, and community building activities. Every donation makes a difference! 🇬🇭🇩🇪
          </p>
        </div>

        

        {/* NUGSA Official Support */}
        {(orgSettings.bank_transfer_details || orgSettings.mobile_money_details) && (
          <Card className="border-2 border-primary shadow-lg mb-8">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/icon.png" 
                  alt="NUGSA Logo" 
                  className="w-16 h-16 rounded-full"
                />
              </div>
              <CardTitle className="text-2xl flex items-center justify-center">
                NUGSA Official Support
                <Badge className="ml-2 bg-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Official
                </Badge>
              </CardTitle>
              <CardDescription className="text-base">
                Direct support to the NATIONAL UNION OF GHANAIAN STUDENT ASSOCIATIONS (NUGSA) - GERMANY
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bank Details */}
              {orgSettings.bank_transfer_details && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-primary mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-primary" />
                    Bank Transfer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(orgSettings.bank_transfer_details as Record<string, string>).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono bg-white px-2 py-1 rounded">{value}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(value, key.replace('_', ' '))}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Money Details */}
              {orgSettings.mobile_money_details && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-700 mb-3 flex items-center">
                    <Smartphone className="w-5 h-5 mr-2 text-amber-600" />
                    Mobile Money Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(orgSettings.mobile_money_details as Record<string, string>).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="font-medium capitalize">{key}:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono bg-white px-2 py-1 rounded">{value}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(value, key)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* How Your Support Helps */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">How Your Support Helps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-primary mb-2">Emergency Support</h3>
                <p className="text-emerald-700 text-sm">
                  Immediate financial assistance for students facing unexpected challenges or emergencies.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-semibold text-amber-700 mb-2">Educational Resources</h3>
                <p className="text-amber-700 text-sm">
                  Books, study materials, and educational tools to support academic excellence.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="font-semibold text-rose-600 mb-2">Community Events</h3>
                <p className="text-rose-600 text-sm">
                  Cultural celebrations, networking events, and activities that strengthen our community bonds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treasurer Contact Details */}
        {(treasurerDetails.name !== 'Not specified' || treasurerDetails.email !== 'Not specified') && (
          <Card className="border-2 border-amber-500 shadow-lg mb-8">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-2xl flex items-center justify-center">
                Treasurer Contact Information
                <Badge className="ml-2 bg-amber-500">
                  <Star className="w-3 h-3 mr-1" />
                  Contact
                </Badge>
              </CardTitle>
              <CardDescription className="text-base">
                Get in touch with our treasurer for donation-related inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Treasurer Name */}
              {treasurerDetails.name !== 'Not specified' && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-primary mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Treasurer Name
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Name:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-white px-3 py-2 rounded">{treasurerDetails.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(treasurerDetails.name, "Treasurer Name")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Treasurer Email */}
              {treasurerDetails.email !== 'Not specified' && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-700 mb-3 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-amber-600" />
                    Treasurer Email
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Email:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-white px-3 py-2 rounded">{treasurerDetails.email}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(treasurerDetails.email, "Treasurer Email")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`mailto:${treasurerDetails.email}`, '_blank')}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Treasurer Phone */}
              {treasurerDetails.phone !== 'Not specified' && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-primary mb-3 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-primary" />
                    Treasurer Phone
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Phone:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-white px-3 py-2 rounded">{treasurerDetails.phone}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(treasurerDetails.phone, "Treasurer Phone")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Finance Email */}
              {treasurerDetails.financeEmail !== 'Not specified' && (
                <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                  <h4 className="font-semibold text-rose-600 mb-3 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-rose-500" />
                    Finance Department Email
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Finance Email:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-white px-3 py-2 rounded">{treasurerDetails.financeEmail}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(treasurerDetails.financeEmail, "Finance Email")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`mailto:${treasurerDetails.financeEmail}`, '_blank')}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
      </div>
    </div>
  );
}