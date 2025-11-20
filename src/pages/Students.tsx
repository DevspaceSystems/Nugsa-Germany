import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, GraduationCap, MessageSquare, Linkedin, Users, BookOpen, User, School } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";


type Profile = Tables<"profiles">;

export default function Students() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUniversity, setFilterUniversity] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, filterUniversity, filterState, filterRegion]);

  const fetchStudents = async () => {
    try {
      // Fetch verified student profiles directly from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('is_verified', true)
        .order('first_name', { ascending: true });

      if (error) throw error;

      if (data) {
        setStudents(data as Profile[]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "There was an error fetching the student directory. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.major?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.current_city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // University filter
    if (filterUniversity !== "all") {
      filtered = filtered.filter(student => student.university.toLowerCase() === filterUniversity.toLowerCase());
    }

    // State filter
    if (filterState !== "all") {
      filtered = filtered.filter(student => student.india_state.toLowerCase() == filterState.toLowerCase());
    }

    // Ghana Region filter
    if (filterRegion !== "all") {
      filtered = filtered.filter(student => student.ghana_region.toLowerCase() === filterRegion.toLowerCase());
    }

    setFilteredStudents(filtered);
  };

  const getUniqueValues = (field: keyof Profile): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  
  students.forEach(student => {
    const value = student[field];
    if (typeof value === 'string' && value.trim() !== '') {
      const normalizedValue = value.toLowerCase().trim();
      
      // If we haven't seen this value before (case-insensitive)
      if (!seen.has(normalizedValue)) {
        seen.add(normalizedValue);
        result.push(value); // Add the original value with original case
      }
    }
  });
  
  return result.sort(); // Optional: sort alphabetically
};

  const handleSendMessage = async (recipientId: string, recipientName: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to send messages to other students.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (recipientId === user.id) {
      toast({
        title: "Cannot Message Yourself",
        description: "You cannot send a message to yourself.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to messages page with the recipient pre-selected
    navigate("/messages", { state: { recipientId, recipientName } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading student directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="section-container py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="heading-1">Student Directory</h1>
            <p className="body-large text-muted-foreground">
              Connect with NUGSA-Germany members across universities and German states. Build professional networks
              and support each other throughout your academic journey.
          </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="professional-card-elevated">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-primary mt-2">{students.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="professional-card-elevated">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Universities</p>
                <p className="text-3xl font-bold text-secondary mt-2">{getUniqueValues("university").length}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className="professional-card-elevated">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-muted-foreground">German States</p>
                <p className="text-3xl font-bold text-accent mt-2">{getUniqueValues("india_state").length}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="professional-card-elevated">
          <CardHeader>
            <CardDescription className="text-center">
              Search and filter students by name, university, or German state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, university, or major"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-professional"
                />
              </div>
              <Select value={filterUniversity} onValueChange={setFilterUniversity}>
                <SelectTrigger className="input-professional">
                  <SelectValue placeholder="Filter by University" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {getUniqueValues("university").map((university) => (
                    <SelectItem key={university} value={university}>
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger className="input-professional">
                  <SelectValue placeholder="Filter by State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All German States</SelectItem>
                  {getUniqueValues("india_state").map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="btn-outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterUniversity("all");
                  setFilterState("all");
                  setFilterRegion("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredStudents.length}</span> of{" "}
            <span className="font-semibold text-foreground">{students.length}</span> students
          </p>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="professional-card-elevated overflow-hidden">
              <CardContent className="p-0">
                {/* Profile Header */}
                <div className="hero-background p-8 text-white text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white/20">
                    <AvatarImage 
                      src={student.profile_image_url || ""} 
                      alt={`${student.first_name} ${student.last_name}`}
                      className="object-cover" // This prevents distortion
                    />
                    <AvatarFallback className="text-lg bg-white/20 text-white">
                      {student.first_name[0]}{student.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold mb-1">
                    {student.first_name} {student.last_name}
                  </h3>

                  <br />

                  <div className="flex justify-center">
                    {/* <Badge variant="secondary" className="backdrop-blur-sm bg-white/10 text-white border-white/20 flex items-center gap-3 shadow-lg justify-center">
                      {student.gender && (
                        <span className="flex items-center gap-1 text-sm">
                          <User className="w-5 h-5" />
                          {student.gender}
                        </span>
                      )}
                      
                    </Badge> */}

                    {student.gender && (
                      <Badge variant="secondary" className="backdrop-blur-sm bg-white/10 text-white border-white/20 flex items-center gap-3 shadow-lg justify-center">
                        <span className="flex items-center gap-1 text-sm">
                          <User className="w-5 h-5" />
                          {student.gender}
                        </span>
                      </Badge>
                    )}
                  </div>

                  
                </div>

                {/* Profile Content */}
                <div className="p-6 space-y-4">
                  {/* University & Location */}
                  <div className="space-y-3">
                    {student.major && (
                      <div className="flex items-start text-sm text-muted-foreground">
                        <GraduationCap className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                        <span className="break-words whitespace-normal">{student.major}</span>
                      </div>
                    )}
                    {student.university && (
                      <div className="flex items-start text-sm text-muted-foreground">
                        <School className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-secondary" />
                        <span className="break-words whitespace-normal">
                          {student.university} {student.level_of_study ? `(${student.level_of_study})` : ""}
                        </span>
                      </div>
                    )}
                    {student.india_city && (
                      <div className="flex items-start text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-accent" />
                        <span className="break-words whitespace-normal">
                          {student.india_city}, {student.india_state}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Bio */}
                  {student.bio && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {student.bio} 
                      </p>
                    </div>
                  )}

                  {/* Academic Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                    <span>
                      {student.level_of_study && `${student.level_of_study}`}
                      {student.year_of_study && ` • Year ${student.year_of_study}`}
                    </span>
                    {student.expected_completion_year && (
                      <span>Graduating {student.expected_completion_year}</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="btn-primary flex-1"
                      onClick={() => handleSendMessage(student.id, `${student.first_name} ${student.last_name}`)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                    {student.linkedin_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-6">
              <Search className="w-16 h-16 mx-auto opacity-40" />
            </div>
            <h3 className="heading-3 mb-3">No students found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your search terms or filter criteria to find the students you're looking for.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 btn-outline"
              onClick={() => {
                setSearchTerm("");
                setFilterUniversity("all");
                setFilterState("all");
                setFilterRegion("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        {!user && filteredStudents.length > 0 && (
          <Card className="professional-card-elevated bg-white">
            <CardContent className="p-10 text-center space-y-4">
              <h3 className="heading-3">Join the NUGSA-Germany Network</h3>
              <p className="body-large text-muted-foreground max-w-2xl mx-auto">
                Create an account to connect directly with members, send messages, and access exclusive resources.
              </p>
              <Button 
                size="lg" 
                className="btn-primary px-8"
                onClick={() => navigate("/auth")}
              >
                Create Your Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}