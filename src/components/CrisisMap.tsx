import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type HelpRequest = Database["public"]["Tables"]["help_requests"]["Row"];

const CrisisMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);

  useEffect(() => {
    // Fetch Mapbox token from edge function
    const initMap = async () => {
      try {
        const { data } = await supabase.functions.invoke("get-mapbox-token");
        
        if (!mapContainer.current || !data?.token) return;

        mapboxgl.accessToken = data.token;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [0, 20],
          zoom: 2,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    // Fetch requests
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("help_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (data) {
        setRequests(data);
      }
    };

    fetchRequests();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("help_requests_changes")
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
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach((marker) => marker.remove());

    // Add markers for each request
    requests.forEach((request) => {
      const color = 
        request.urgency === "critical" ? "#dc2626" :
        request.urgency === "high" ? "#ea580c" :
        request.urgency === "medium" ? "#ca8a04" :
        "#16a34a";

      const el = document.createElement("div");
      el.className = "crisis-marker";
      el.style.backgroundColor = color;
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${request.title}</h3>
          <p style="margin: 4px 0; font-size: 14px;">${request.description}</p>
          <div style="margin-top: 8px; display: flex; gap: 8px; font-size: 12px;">
            <span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px;">${request.category}</span>
            <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 4px;">${request.urgency}</span>
          </div>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([request.location_lng, request.location_lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [requests]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-card p-4 max-w-xs">
        <h3 className="font-semibold mb-2">Active Requests: {requests.length}</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisMap;
