
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Download, Users, Award, FileText, Clock, Target, Heart, Globe, Lightbulb, Filter, Info, Quote, Scale, CheckCircle, BookOpen, Star, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
          <LoadingSpinner size="md" className="mb-4" />
          <p className="text-muted-foreground">Loading about information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                <img
                  src="/icon.png"
                  alt="NUGSA Logo"
                  className="w-24 h-24 rounded-full shadow-2xl relative z-10 border-4 border-white"
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
              NUGSA GERMANY
            </h1>
            <p className="text-xl text-muted-foreground font-light tracking-wide">
              National Union of Ghanaian Student Associations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50/50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg text-primary">
                  <Info className="w-5 h-5 mr-2" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The National Union of Ghanaian Student Associations (NUGSA) Foundation is a Student-Led
                  Autonomous and Non-Political, Non-Racial and Non-Religious umbrella organisation for
                  Ghanaian Student, Scholars and Academics in the Diaspora.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-red-50/50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg text-primary">
                  <Quote className="w-5 h-5 mr-2" />
                  Slogan & Emblem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "Education: a right not a privilege"
                  <br />
                  "Unity, Freedom, Justice & Development"
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-yellow-50/50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg text-primary">
                  <Scale className="w-5 h-5 mr-2" />
                  Character
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 shrink-0" />
                    <span>Democratic & Non-partisan</span>
                  </li>
                  <li className="flex items-start text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 shrink-0" />
                    <span>Progressive Ideals</span>
                  </li>
                  <li className="flex items-start text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 shrink-0" />
                    <span>Respect for Rights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="group border-none shadow-md hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Our Mission</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  To Mobilise and Organise all Ghanaian Students, Scholars & Academics in the diaspora to engineer the Rebirth of our national vision.
                </p>
              </CardContent>
            </Card>
            <Card className="group border-none shadow-md hover:shadow-xl transition-all duration-300 bg-secondary text-secondary-foreground">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Our Values</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  Unity, Freedom, Education, Inclusion, Respect and Development
                </p>
              </CardContent>
            </Card>
            <Card className="group border-none shadow-md hover:shadow-xl transition-all duration-300 bg-accent text-accent-foreground">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Our Vision</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  For Ghana to be the Central Hub of Development in Africa.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Objectives Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Objectives</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The core aims that drive our activities and initiatives across Germany
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="mb-4 text-blue-500">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Rights & Interests</h3>
                <p className="text-sm text-muted-foreground">
                  To champion and preserve the rights and interests of all Ghanaian students’ resident in Germany.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 md:col-span-2 lg:col-span-2">
              <CardContent className="p-6">
                <div className="mb-4 text-green-500">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Common Platform</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                    <p className="text-sm text-muted-foreground">Deliberation of pertinent issues</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                    <p className="text-sm text-muted-foreground">Co-ordination of affairs</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                    <p className="text-sm text-muted-foreground">Free expression of opinions</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                    <p className="text-sm text-muted-foreground">Inculcating virtues & patriotism</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="mb-4 text-purple-500">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">International Relations</h3>
                <p className="text-sm text-muted-foreground">
                  To promote co-operation, understanding and friendship between Ghanaian students and others from diverse orientations.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="mb-4 text-orange-500">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Cultural Heritage</h3>
                <p className="text-sm text-muted-foreground">
                  To inculcate discipline and revolutionary awareness of our cultural heritage and provide means to promote it.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="mb-4 text-red-500">
                  <Star className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Pan-Africanism</h3>
                <p className="text-sm text-muted-foreground">
                  To promote Pan-Africanism and foster unity among Ghanaian students and other students of African descent.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 7 Pillars Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">The 7 Pillars</h2>
            <p className="text-muted-foreground">Building a stronger community together</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              "Build National Community & Join GUGS",
              "Advocate & Promote Interests Globally",
              "Enhance Academic & Professional Skills",
              "Celebrate & Showcase Achievements",
              "Educate World on Our Culture",
              "Bridge for Development of Ghana",
              "Facilitate Best Practice Sharing"
            ].map((title, index) => {
              const fullTexts = [
                "To build the National Community of Ghanaian Students, Scholars & Academics and be part of the Global Union of Ghanaian Scholars (GUGS) Corporation.",
                "To advocate, defend, and promote the interest of Ghanaian Students, Scholars & Academics globally.",
                "To advance, develop, and enhance the academic and professional abilities, skills, and talents of Ghanaian Students, Scholars & Academics in the DIASPORA.",
                "To celebrate, honour, and showcase the achievements of Ghanaian Students, Scholars & Academics.",
                "To inform, introduce, and educate the world to our diverse, rich, and unique Culture.",
                "To be the bridge between Ghanaian Students, Scholars, Academics, Institutions, and Organisations, towards the Development of Ghana.",
                "To facilitate the sharing of best practice among Ghanaian Students, Scholars, Academics and Institutions globally."
              ];

              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-primary/10 hover:border-primary/30">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-5xl font-black text-primary/10 group-hover:text-primary/20 transition-colors">
                        {index + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <h4 className="font-bold text-sm mb-2 text-foreground/90">{title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
                      {fullTexts[index]}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Leadership Section */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">Our Executives</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Meet the dedicated executives driving our mission forward
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
                      {Array.from({ length: ((new Date()).getFullYear() - 2019 + 1) }, (_, i) => {
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
                    placeholder="Filter by name e.g: Paul Abrokwa..."
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {boardMembers
                    .filter(member => {
                      const yearMatch = !yearFilter || member.year === yearFilter;
                      const positionMatch = !positionFilter || member.position.toLowerCase().includes(positionFilter.toLowerCase());
                      const nameMatch = !nameFilter || member.name.toLowerCase().includes(nameFilter.toLowerCase());
                      return yearMatch && positionMatch && nameMatch;
                    })
                    .map((member) => (
                      <Card key={member.id} className="group overflow-hidden hover:shadow-lg transition-all border rounded-lg">
                        {/* Image on Top */}
                        <div className="relative aspect-square bg-muted overflow-hidden">
                          <img
                            src={member.image_url || "/lovable-uploads/6ed84001-cf9d-40a3-b68d-d2fcd378d51b.png"}
                            alt={member.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <CardContent className="p-4">
                          {/* Position Badge */}
                          <Badge variant="secondary" className="text-xs mb-2">
                            {member.position}
                          </Badge>

                          {/* Name */}
                          <h3 className="font-bold text-base mb-3">{member.name}</h3>

                          {/* Details */}
                          <div className="space-y-2 text-xs text-muted-foreground">
                            {member.academic_background && (
                              <p className="line-clamp-2">
                                <span className="font-semibold text-foreground">Academic:</span> {member.academic_background}
                              </p>
                            )}
                            {member.leadership_experience && (
                              <p className="line-clamp-2">
                                <span className="font-semibold text-foreground">Experience:</span> {member.leadership_experience}
                              </p>
                            )}
                            {member.quote && (
                              <p className="line-clamp-2 italic">
                                "{member.quote}"
                              </p>
                            )}
                          </div>
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

        {/* Closing Statement */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 md:p-12 text-center space-y-6 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.png')] opacity-10"></div>
          <div className="relative z-10 space-y-4">
            <Sparkles className="w-12 h-12 mx-auto text-yellow-300 animate-pulse" />
            <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-4xl mx-auto">
              "There is only one Ghana, Our Ghana, the gateway to Africa - Our Homeland, and together, we shall make Ghana the <span className="font-bold text-yellow-300">“Central Hub of Africa’s Development”</span>."
            </p>
            <div className="pt-4">
              <Badge variant="secondary" className="text-lg py-2 px-6 font-bold bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                #NUGSA - #Together4Ghana
              </Badge>
            </div>
          </div>
        </section>





      </div>
    </div>
  );
}
