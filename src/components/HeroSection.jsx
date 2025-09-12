import PropTypes from 'prop-types'; // Import prop-types
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Scan, Languages, Brain } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

// --- Data for features, making the main component cleaner ---
const features = [
  {
    Icon: Scan,
    title: "Smart OCR",
    description: "Extract text from any document format.",
    bgStyle: { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
    iconBgStyle: { backgroundColor: '#3b82f6' },
    iconColor: "text-white",
    textColor: "text-white",
    borderStyle: { borderColor: '#3b82f6' },
  },
  {
    Icon: Languages,
    title: "Auto Translate",
    description: "Seamless English & Malayalam support.",
    bgStyle: { background: 'linear-gradient(135deg, #ea580c, #c2410c)' },
    iconBgStyle: { backgroundColor: '#f97316' },
    iconColor: "text-white",
    textColor: "text-white",
    borderStyle: { borderColor: '#f97316' },
  },
  {
    Icon: Brain,
    title: "AI Summary",
    description: "Generate intelligent insights instantly.",
    bgStyle: { background: 'linear-gradient(135deg, #9333ea, #7c3aed)' },
    iconBgStyle: { backgroundColor: '#a855f7' },
    iconColor: "text-white",
    textColor: "text-white",
    borderStyle: { borderColor: '#a855f7' },
  },
];

// --- A reusable component for the feature cards ---
// Removed the TypeScript interface and will use prop-types below
const FeatureCard = ({ Icon, title, description, bgStyle, iconBgStyle, iconColor, textColor, borderStyle, animationDelay }) => (
  <div 
    className="border-2 rounded-2xl p-6 text-center shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:-translate-y-2 animate-fade-in-up w-full h-64 flex flex-col justify-center"
    style={{ 
      ...bgStyle, 
      ...borderStyle, 
      animationDelay 
    }}
  >
    <div 
      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-white/20"
      style={iconBgStyle}
    >
      <Icon className={`h-8 w-8 ${iconColor}`} />
    </div>
    <h3 className={`font-bold text-lg ${textColor} mb-2 drop-shadow-sm`}>{title}</h3>
    <p className={`text-sm ${textColor} leading-relaxed drop-shadow-sm`}>{description}</p>
  </div>
);

// This block provides runtime type checking for the FeatureCard props
FeatureCard.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  bgStyle: PropTypes.object.isRequired,
  iconBgStyle: PropTypes.object.isRequired,
  iconColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  borderStyle: PropTypes.object.isRequired,
  animationDelay: PropTypes.string,
};


// --- Main Hero Section Component ---
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Lighter overlay to show background PNG */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40" />

      {/* Floating background elements - reduced opacity */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center space-y-8">
          
          {/* Main Content - Enhanced Header */}
          <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto text-center">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-white/15 to-white/5 text-white text-sm font-semibold backdrop-blur-md border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full mr-3 animate-pulse"></div>
              Advanced Document Intelligence
            </div>
            
            {/* Enhanced Main Heading */}
            <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
              <span className="gradient-hero bg-clip-text text-transparent drop-shadow-2xl animate-text-glow">
                Streamline Document
              </span>
              <span className="block text-white drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                Management at KMRL
              </span>
            </h1>
              
              {/* Decorative Line */}
              <div className="flex items-center justify-center space-x-4">
                <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent w-16"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
                <div className="h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent w-16"></div>
              </div>
            </div>

            {/* Enhanced Description */}
            <p className="max-w-2xl mx-auto text-xl text-white leading-relaxed font-light" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              Unlock the power of your documents with 
              <span className="text-primary font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}> AI-driven OCR</span>, 
              <span className="text-secondary font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}> translation</span>, and 
              <span className="text-accent font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}> summarization</span>, 
              built for efficiency.
            </p>
          </div>

          {/* CTA Button */}
          <Button 
            size="lg" 
            className="shadow-metro hover:shadow-hover animate-scale-hover text-lg px-8 py-6"
            onClick={() => navigate("/get-started")}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Feature Highlights - Full Width Layout */}
          <div className="w-full flex flex-col sm:flex-row justify-center items-stretch gap-4 pt-16 px-4">
            {features.map((feature, index) => (
              <div key={feature.title} className="flex-1 w-full">
                <FeatureCard 
                  Icon={feature.Icon}
                  title={feature.title}
                  description={feature.description}
                  bgStyle={feature.bgStyle}
                  iconBgStyle={feature.iconBgStyle}
                  iconColor={feature.iconColor}
                  textColor={feature.textColor}
                  borderStyle={feature.borderStyle}
                  animationDelay={`${index * 0.2}s`}
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;