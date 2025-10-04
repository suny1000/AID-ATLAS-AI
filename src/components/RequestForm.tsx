import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface RequestFormProps {
  onSuccess: () => void;
}

const RequestForm = ({ onSuccess }: RequestFormProps) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success("Location detected");
        },
        () => {
          toast.error("Could not get location. Please enable location services.");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!location) {
      toast.error("Please set your location");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const category = formData.get("category") as string;
      const urgency = formData.get("urgency") as string;
      const address = formData.get("address") as string;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Call AI classification edge function
      const { data: aiData } = await supabase.functions.invoke("classify-request", {
        body: { title, description, category },
      });

      const { error } = await supabase.from("help_requests").insert([{
        user_id: user.id,
        title,
        description,
        category: category as any,
        urgency: urgency as any,
        location_lat: location.lat,
        location_lng: location.lng,
        location_address: address,
        ai_classification: aiData || null,
      }]);

      if (error) throw error;

      toast.success("Help request posted successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to post request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Request Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g., Urgent: Need medical supplies"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Provide detailed information about what you need..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="medical">Medical</option>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="shelter">Shelter</option>
            <option value="transport">Transport</option>
            <option value="supplies">Supplies</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="urgency">Urgency</Label>
          <select
            id="urgency"
            name="urgency"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="Street address or landmark"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Location Coordinates</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            className="flex-1"
          >
            {location ? "✓ Location Set" : "Use My Location"}
          </Button>
          {location && (
            <div className="flex-1 text-sm text-muted-foreground flex items-center justify-center">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !location}>
        {loading ? "Posting..." : "Post Help Request"}
      </Button>
    </form>
  );
};

export default RequestForm;
