import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { HeartHandshake, Zap, Globe, Shield } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: HeartHandshake,
      title: "Human-Centered",
      description: "Every feature is designed to save lives and reduce suffering in crisis situations.",
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description: "AI-powered matching connects help with those who need it in seconds, not hours.",
    },
    {
      icon: Globe,
      title: "Globally Connected",
      description: "Coordinate relief efforts across borders and bring together a worldwide community.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Built with enterprise-grade security to protect sensitive information during crises.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-primary">About AidAtlas</h1>
            <p className="text-xl text-muted-foreground">
              Transforming disaster response through AI-powered coordination
            </p>
          </div>

          <Card className="shadow-card mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">The Problem</h2>
              <p className="text-muted-foreground mb-6">
                In disaster situations, the biggest challenge isn't always the lack of resources—it's the chaos of coordination. 
                Victims don't know where to ask for help. Volunteers don't know who needs what. Relief organizations struggle 
                to see the full picture. Lives are lost in the confusion.
              </p>

              <h2 className="text-2xl font-bold mb-4">Our Solution</h2>
              <p className="text-muted-foreground mb-6">
                AidAtlas uses artificial intelligence to eliminate the chaos. Our platform connects victims, volunteers, 
                donors, and NGOs in real-time, using smart algorithms to match urgent needs with available resources. 
                When every second counts, AidAtlas makes every connection count.
              </p>

              <h2 className="text-2xl font-bold mb-4">How It Works</h2>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li>Victims post help requests with their location and urgent needs</li>
                <li>AI classifies requests by urgency, type, and location</li>
                <li>The system matches requests with nearby volunteers and resources</li>
                <li>Responders get instant notifications and can accept requests</li>
                <li>Real-time tracking ensures accountability and efficient relief delivery</li>
              </ol>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {values.map((value) => (
              <Card key={value.title} className="shadow-card">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-card bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Built for Impact</h2>
              <p className="text-lg opacity-90">
                AidAtlas was created during a hackathon with one goal: prove that technology can save lives. 
                This is more than a demo—it's a working platform ready to coordinate real disaster response.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
