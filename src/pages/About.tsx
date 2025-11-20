
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Download, Users, Award, FileText, Clock, Target, Heart, Globe, Lightbulb, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";

type BoardMember = Tables<"board_members">;
type ConstitutionDocument = Tables<"constitution_documents">;
type OrganizationMilestone = Tables<"organization_milestones">;

interface ConstitutionDoc {
  id: string;
  title: string;
  file_url: string;
  version: string;
  is_current: boolean;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export default function About() {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [allBoardMembers, setAllBoardMembers] = useState<BoardMember[]>([]);
  const [currentConstitution, setCurrentConstitution] = useState<ConstitutionDocument | null>(null);
  const [constitutionDocs, setConstitutionDocs] = useState<ConstitutionDoc[]>([]);
  const [milestones, setMilestones] = useState<OrganizationMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPastMembers, setShowPastMembers] = useState(false);
  const [yearFilter, setYearFilter] = useState("2024-2025");
  const [positionFilter, setPositionFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    fetchData();
    fetchConstitutionDocs();
  }, []);

  const fetchConstitutionDocs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('constitution_documents')
          .select('*')
          .order('created_at', { ascending: false });
  
        if (error) throw error;
        setConstitutionDocs(data || []);
      } catch (error) {
        console.error('Error fetching constitution documents:', error);
        
      } finally {
        setLoading(false);
      }
    };

  const fetchData = async () => {
    try {
      console.log("Fetching data for About page...");
      
      const [currentBoardResponse, allBoardResponse, constitutionResponse, milestonesResponse] = await Promise.all([
        supabase
          .from("board_members")
          .select("*")
          .eq("is_active", true)
          .order("order_priority", { ascending: true }),
        supabase
          .from("board_members")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("constitution_documents")
          .select("*")
          .eq("is_current", true)
          .single(),
        supabase
          .from("organization_milestones")
          .select("*")
          .order("date_achieved", { ascending: false })
          .limit(5)
      ]);

      console.log("Current board members:", currentBoardResponse.data?.length || 0);
      console.log("All board members:", allBoardResponse.data?.length || 0);
      console.log("Constitution document:", constitutionResponse.data);
      console.log("Milestones:", milestonesResponse.data?.length || 0);

      setBoardMembers(currentBoardResponse.data || []);
      setAllBoardMembers(allBoardResponse.data || []);
      setCurrentConstitution(constitutionResponse.data);
      setMilestones(milestonesResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadConstitution = () => {
    if (currentConstitution?.file_url) {
      console.log("Downloading constitution from:", currentConstitution.file_url);
      window.open(currentConstitution.file_url, '_blank');
    }
  };

  function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff} second${diff !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

  // Filter past board members (inactive ones)
  const pastBoardMembers = allBoardMembers.filter(member => !member.is_active);
  
  const filteredPastMembers = pastBoardMembers.filter(member => {
    const yearMatch = !yearFilter || (member.year && member.year.includes(yearFilter));
    const positionMatch = !positionFilter || member.position.toLowerCase().includes(positionFilter.toLowerCase());
    const nameMatch = !nameFilter || member.name.toLowerCase().includes(nameFilter.toLowerCase());
    return yearMatch && positionMatch && nameMatch;
  });


  const displayBoardMembers = showPastMembers ? filteredPastMembers : boardMembers;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading about information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/icon.png" 
              alt="NUGSA Logo" 
              className="w-24 h-24 rounded-full shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            About NUGSA - Germany
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            The NATIONAL UNION OF GHANAIAN STUDENT ASSOCIATIONS (NUGSA) - GERMANY is a vibrant community connecting 
            Ghanaian scholars across Germany, fostering academic excellence, cultural preservation, 
            and professional networking. We are united by our shared heritage and commitment to success.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  Empowering Ghanaian students in Germany through community support, academic excellence, and cultural preservation.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Our Values</h3>
                <p className="text-sm text-muted-foreground">
                  Unity, integrity, academic excellence, cultural pride, and mutual support among all members.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Lightbulb className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Our Vision</h3>
                <p className="text-sm text-muted-foreground">
                  A thriving community of Ghanaian scholars making meaningful contributions to Ghana and Germany.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-primary mb-4">Our Leadership</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the dedicated leaders driving our mission forward with passion, integrity, and vision
            </p>
          </div>


         <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center text-lg sm:text-xl">
                  <Users className="w-5 h-5 mr-2" />
                  Board Members
                </div>
                
                <div className="flex flex-col gap-3 sm:flex-row sm:space-x-3 w-full sm:w-auto">
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Filter by year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: ((new Date()).getFullYear() - 2019 + 1)}, (_, i) => {
                        const startYear = 2019 + i;
                        const endYear = startYear + 1;
                        const yearRange = `${startYear}-${endYear}`;
                        return (
                          <SelectItem key={yearRange} value={yearRange}>
                            {yearRange}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Filter by position..."
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="w-full sm:w-48"
                  />

                  <Input
                    placeholder="Filter by name e.g: Mark Febiri..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="w-full sm:w-48"
                  />
                </div>
              </CardTitle>
            </CardHeader>
          <CardContent>
            {boardMembers
                  .filter(member => {
                    const yearMatch = !yearFilter || member.year === yearFilter;
                    const positionMatch = !positionFilter || member.position.toLowerCase().includes(positionFilter.toLowerCase());
                    const nameMatch = !nameFilter || member.name.toLowerCase().includes(nameFilter.toLowerCase());
                    return yearMatch && positionMatch && nameMatch;
                  }).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {boardMembers
                  .filter(member => {
                    const yearMatch = !yearFilter || member.year === yearFilter;
                    const positionMatch = !positionFilter || member.position.toLowerCase().includes(positionFilter.toLowerCase());
                    const nameMatch = !nameFilter || member.name.toLowerCase().includes(nameFilter.toLowerCase());
                    return yearMatch && positionMatch && nameMatch;
                  })
                  .map((member) => (
                    <Card key={member.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur">
                  <CardHeader className="text-center pb-4">
                    <div className="relative">
                      <Avatar className="w-37 h-37 mx-auto mb-4 ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        <AvatarImage 
                          src={member.image_url || "/lovable-uploads/6ed84001-cf9d-40a3-b68d-d2fcd378d51b.png"} 
                          alt={member.name} 
                          className="object-cover"
                        />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-100 to-amber-100">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-2xl mb-2">{member.name}</CardTitle>
                    <Badge variant="secondary" className="text-lg mx-auto bg-gradient-to-r from-emerald-100 to-amber-100 text-primary border-primary/20">
                      {member.position}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {member.academic_background && (
                      <div className="bg-emerald-50/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm text-primary mb-1">Academic Background</h4>
                        <p className="text-sm text-emerald-700">{member.academic_background}</p>
                      </div>
                    )}
                    {member.leadership_experience && (
                      <div className="bg-amber-50/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm text-amber-700 mb-1">Leadership Experience</h4>
                        <p className="text-sm text-amber-700">{member.leadership_experience}</p>
                      </div>
                    )}
                    {member.quote && (
                      <div className="bg-rose-50/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm text-rose-600 mb-1">Vision</h4>
                        <p className="text-sm italic text-rose-500">"{member.quote}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              </div>

              ) : (
                <div className="text-center text-muted-foreground">
                  No active board members found for this year.
                </div>
            )}
            
          </CardContent>
        </Card>


        
        </section>

        {/* Election Process Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-primary mb-4">Democratic Election Process</h2>
            <p className="text-lg text-muted-foreground">
              Transparent and fair elections supervised by the Ghanaian Embassy
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-primary" />
                  Electoral Framework
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Electoral Body</h3>
                      <p className="text-sm text-muted-foreground">Independent electoral committee</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Embassy Supervision</h3>
                      <p className="text-sm text-muted-foreground">Ghanaian Embassy oversight</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Voting Eligibility</h3>
                      <p className="text-sm text-muted-foreground">Registered NUGSA members</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Term Duration</h3>
                      <p className="text-sm text-muted-foreground">1-year presidential mandate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Election Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { phase: "Nomination Period", duration: "2 weeks for candidate registration", colorClass: "bg-emerald-500" },
                    { phase: "Campaign Period", duration: "3 weeks for candidate campaigns", colorClass: "bg-amber-500" },
                    { phase: "Voting Day", duration: "Digital voting platform", colorClass: "bg-rose-500" },
                    { phase: "Results & Inauguration", duration: "Public announcement and ceremony", colorClass: "bg-slate-500" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${item.colorClass} flex-shrink-0`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.phase}</p>
                        <p className="text-xs text-muted-foreground">{item.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Constitution Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-primary mb-4">NUGSA Constitution</h2>
            <p className="text-lg text-muted-foreground">
              Our governing document that guides our operations and principles
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Constitution Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {constitutionDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {constitutionDocs.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground">Version: {doc.version}</p>
                      <div className="flex items-center justify-between mt-4">
                        <Badge variant={new Date(doc.created_at).getFullYear() >= (new Date).getFullYear() ? "default" : "secondary"}>
                          {timeAgo(doc.created_at)}
                        </Badge>
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              ) : (
                <div className="py-8">
                  <p className="text-sm text-muted-foreground">No constitution documents found.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
        </section>


        

        
      </div>
    </div>
  );
}
