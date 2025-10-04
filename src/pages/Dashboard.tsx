import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Clock, User } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import heroDashboard from "@/assets/hero-dashboard.jpg";

type HelpRequest = Database["public"]["Tables"]["help_requests"]["Row"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      setLoading(true);
      let query = supabase
        .from("help_requests")
        .select("*")
        .eq("status", "pending")
        .order("urgency", { ascending: false })
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("category", filter as any);
      }

      const { data } = await query;
      if (data) {
        setRequests(data);
      }
      setLoading(false);
    };

    fetchRequests();

    const channel = supabase
      .channel("dashboard_requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "help_requests",
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, filter]);

  const handleRespond = async (requestId: string) => {
    try {
      const { error: responseError } = await supabase.from("responses").insert([{
        request_id: requestId,
        responder_id: user.id,
        message: "I can help with this request",
      }]);

      if (responseError) throw responseError;

      const { error: updateError } = await supabase
        .from("help_requests")
        .update({ status: "in_progress", responder_id: user.id })
        .eq("id", requestId);

      if (updateError) throw updateError;

      toast.success("Response sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to respond");
    }
  };

  const urgencyColors = {
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="pt-16">
        {/* Hero */}
        <div
          className="relative h-64 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroDashboard})` }}
        >
          <div className="absolute inset-0 gradient-hero opacity-90"></div>
          <div className="container mx-auto px-4 h-full flex items-center relative z-10">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">Volunteer Dashboard</h1>
              <p className="text-xl text-white/90">Help those in need by responding to requests</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-border bg-white sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-2 overflow-x-auto">
              {["all", "medical", "food", "water", "shelter", "transport", "supplies", "other"].map((category) => (
                <Button
                  key={category}
                  variant={filter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(category)}
                  className="capitalize whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending requests found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="shadow-card hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <Badge className={urgencyColors[request.urgency as keyof typeof urgencyColors]}>
                        {request.urgency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {request.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{request.location_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(request.created_at!).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {request.category}
                      </Badge>
                    </div>

                    <Button
                      onClick={() => handleRespond(request.id)}
                      className="w-full"
                      size="sm"
                    >
                      Respond to Request
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
