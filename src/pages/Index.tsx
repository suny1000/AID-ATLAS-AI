import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { MapPin, Sparkles, Users, TrendingUp, ArrowRight } from "lucide-react";
import heroMain from "@/assets/hero-main.jpg";
import { motion } from "framer-motion";

const Index = () => {
  const features = [
    {
      icon: MapPin,
      title: "Crisis Map",
      description: "Real-time visualization of help requests and available resources across affected areas.",
    },
    {
      icon: Sparkles,
      title: "AI Matching",
      description: "Smart classification of requests and automatic matching with nearby volunteers and resources.",
    },
    {
      icon: Users,
      title: "Unified Dashboard",
      description: "Connect victims, volunteers, donors, and NGOs in one streamlined coordination platform.",
    },
    {
      icon: TrendingUp,
      title: "Predictive Insights",
      description: "AI-powered analytics to predict resource shortages and optimize relief distribution.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroMain})` }}
        >
          <div className="absolute inset-0 gradient-hero opacity-90"></div>
        </div>
        
        <div className="container relative z-10 px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              When Every Second Counts
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto">
              AI-powered disaster relief coordination platform that connects victims, donors, and responders instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="lg" className="text-lg">
                <Link to="/map">
                  Post a Help Request
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="lg" className="text-lg">
                <Link to="/dashboard">
                  Offer Help
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-4 bg-gradient-subtle">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Making Every Connection Count
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              In disaster situations, coordination saves lives. AidAtlas uses AI to eliminate chaos and connect help with those who need it most.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="shadow-card hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center gradient-hero rounded-2xl p-12 shadow-hero text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of volunteers, donors, and relief workers coordinating disaster response through AidAtlas.
            </p>
            <Button asChild variant="hero-outline" size="lg" className="text-lg">
              <Link to="/auth">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 AidAtlas. Built for humanity, powered by AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
