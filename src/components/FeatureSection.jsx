import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileSearch, 
  Languages, 
  Zap
} from "lucide-react";

const features = [
  {
    icon: <FileSearch className="h-8 w-8 text-primary" />,
    title: "Intelligent OCR Processing",
    description: "Extract text from scanned documents, handwritten notes, and complex engineering drawings with high accuracy."
  },
  {
    icon: <Languages className="h-8 w-8 text-accent" />,
    title: "Bilingual Translation",
    description: "Seamlessly translate between English and Malayalam, preserving technical terminology and context."
  },
  {
    icon: <Zap className="h-8 w-8 text-secondary" />,
    title: "AI-Powered Summarization",
    description: "Generate concise summaries of lengthy documents, highlighting key points and actionable items."
  }
];

const FeatureSection = () => {
  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Powerful Features for Modern Document Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built specifically for KMRL's complex operational needs with cutting-edge AI and automation
          </p>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="h-full w-72 shrink-0 snap-start gradient-card shadow-card hover:shadow-hover transition-all duration-500 group animate-scale-hover border-0"
              style={{animationDelay: `${index * 0.05}s`}}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors font-bold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;