import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import RequestForm from "@/components/RequestForm";
import CrisisMap from "@/components/CrisisMap";
import type { User } from "@supabase/supabase-js";

const Map = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePostRequest = () => {
    if (!user) {
      toast.error("Please sign in to post a request");
      navigate("/auth");
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16 h-screen flex flex-col">
        {showForm ? (
          <div className="flex-1 overflow-auto p-4">
            <div className="container mx-auto max-w-2xl">
              <Card className="p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Post Help Request</h2>
                  <Button variant="ghost" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
                <RequestForm onSuccess={() => setShowForm(false)} />
              </Card>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 bg-white border-b border-border">
              <div className="container mx-auto flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Crisis Map</h1>
                  <p className="text-muted-foreground">View and submit help requests in real-time</p>
                </div>
                <Button onClick={handlePostRequest} size="lg">
                  Post Request
                </Button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <CrisisMap />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Map;
