import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText } from "lucide-react";

const DepartmentCard = ({ 
  name, 
  description, 
  documentCount, 
  pendingCount, 
  icon, 
  onSelect 
}) => {
  return (
    <Card className="h-full gradient-card shadow-card hover:shadow-hover transition-all duration-500 group animate-scale-hover border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-primary/10 rounded-xl w-fit group-hover:bg-primary/20 transition-colors duration-300">
            {icon}
          </div>
          <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20 font-medium">
            {pendingCount} pending
          </Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300 font-bold">
          {name}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">{documentCount} documents</span>
          </div>
        </div>
        
        <Button 
          variant="department" 
          className="w-full group-hover:shadow-md transition-all duration-300 font-medium"
          onClick={onSelect}
        >
          Access Department
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default DepartmentCard;