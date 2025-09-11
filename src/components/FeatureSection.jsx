import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileSearch, 
  Languages, 
  Zap
} from "lucide-react";

const features = [
  {
    icon: <FileSearch className="h-6 w-6 text-blue-600" />,
    title: "Intelligent OCR",
    description: "Extract text from scanned documents, handwritten notes, and drawings with high accuracy.",
    accent: "from-blue-500 to-blue-700"
  },
  {
    icon: <Languages className="h-6 w-6 text-green-600" />,
    title: "Bilingual Translation",
    description: "Seamlessly translate between English and Malayalam, preserving technical terms.",
    accent: "from-green-500 to-green-700"
  },
  {
    icon: <Zap className="h-6 w-6 text-orange-600" />,
    title: "AI Summarization",
    description: "Generate concise summaries of lengthy documents with key points.",
    accent: "from-orange-500 to-orange-700"
  }
];

const FeatureSection = () => {
  return (
    <section className="py-16 relative bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Background railway track lines */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent transform -rotate-12"></div>
        <div className="absolute bottom-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-600 to-transparent transform rotate-12"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            🚆 Smart Features for KMRL
          </h2>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            AI-powered tools designed to simplify document management and translation.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-green-500 mx-auto mt-5 rounded-full"></div>
        </div>
        
        {/* Smaller grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="shadow-md hover:shadow-xl transition-all duration-300 border-0 rounded-lg bg-white"
            >
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto p-3 rounded-full w-fit mb-3 bg-gradient-to-br ${feature.accent} shadow-sm`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-sm text-gray-600 leading-relaxed">
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
