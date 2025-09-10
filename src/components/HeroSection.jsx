import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, Scan, Languages, Brain, FileText, Zap } from "lucide-react";
import metroHero from "@/assets/metro-hero.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section
      className="relative min-h-screen flex items-center bg-gradient-subtle overflow-hidden"
      style={{
        backgroundImage: `url(${metroHero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/30" />
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm">
                  Advanced Document Management
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="gradient-hero bg-clip-text text-transparent">
                  Streamline Document
                </span>
                <br />
                <span className="text-foreground">Management at</span>
                <br />
                <span className="gradient-hero bg-clip-text text-transparent">KMRL</span>
              </h1>

            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="shadow-metro hover:shadow-hover animate-scale-hover text-lg px-8 py-6"
                onClick={() => navigate("/get-started")}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="glass-effect hover:bg-primary/5 animate-scale-hover text-lg px-8 py-6"
              >
                Watch Demo
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-rows-3 gap-4 pt-8">
              <div className="text-center p-4 rounded-xl glass-effect animate-scale-hover">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Scan className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Smart OCR</h3>
                <p className="text-xs text-muted-foreground">Extract text from any document format</p>
              </div>
              
              <div className="text-center p-4 rounded-xl glass-effect animate-scale-hover" style={{animationDelay: '0.1s'}}>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Languages className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Auto Translate</h3>
                <p className="text-xs text-muted-foreground">English & Malayalam support</p>
              </div>
              
              <div className="text-center p-4 rounded-xl glass-effect animate-scale-hover" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-sm mb-1">AI Summary</h3>
                <p className="text-xs text-muted-foreground">Instant intelligent insights</p>
              </div>
            </div>
          </div>

          {/* Right column removed; background image used instead */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;