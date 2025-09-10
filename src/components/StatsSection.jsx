import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Clock, TrendingUp } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      value: "8",
      label: "Departments",
      description: "Connected departments for streamlined workflow"
    },
    {
      icon: <FileText className="h-8 w-8 text-secondary" />,
      value: "5,742",
      label: "Documents Processed",
      description: "Successfully processed this month"
    },
    {
      icon: <Clock className="h-8 w-8 text-accent" />,
      value: "85%",
      label: "Time Saved",
      description: "Average reduction in processing time"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      value: "98.7%",
      label: "Accuracy Rate",
      description: "OCR and translation accuracy"
    }
  ];

  const displayedStats = stats.filter(s => s.label === "Documents Processed" || s.label === "Time Saved");

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Transforming KMRL Operations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how our intelligent document management system is revolutionizing workflow efficiency
          </p>
        </div>
        
        <div className="flex gap-8 justify-center">
          {displayedStats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-2xl gradient-card shadow-card hover:shadow-hover transition-all duration-500 animate-scale-hover border-0"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  {stat.icon}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-foreground gradient-hero bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-lg font-semibold text-foreground">{stat.label}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;