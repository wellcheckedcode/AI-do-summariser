import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BackButton = ({ className = "mb-4" }) => {
  const navigate = useNavigate();
  return (
    <Button variant="outline" onClick={() => navigate(-1)} className={className}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  );
};

export default BackButton;


