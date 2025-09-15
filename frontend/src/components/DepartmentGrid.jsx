import DepartmentCard from "./DepartmentCard";
import { 
  Wrench, 
  ShoppingCart, 
  Users, 
  Shield, 
  FileText, 
  DollarSign,
  Train,
  AlertTriangle
} from "lucide-react";

const departments = [
  {
    id: "engineering",
    name: "Engineering",
    description: "Technical drawings, maintenance records, and system specifications",
    documentCount: 1247,
    pendingCount: 23,
    icon: <Wrench className="h-6 w-6 text-primary" />
  },
  {
    id: "procurement",
    name: "Procurement",
    description: "Purchase orders, vendor contracts, and supply chain documentation",
    documentCount: 856,
    pendingCount: 15,
    icon: <ShoppingCart className="h-6 w-6 text-primary" />
  },
  {
    id: "hr",
    name: "Human Resources",
    description: "Staff policies, training materials, and personnel documentation",
    documentCount: 692,
    pendingCount: 8,
    icon: <Users className="h-6 w-6 text-primary" />
  },
  {
    id: "safety",
    name: "Safety & Security",
    description: "Safety protocols, incident reports, and compliance documentation",
    documentCount: 534,
    pendingCount: 31,
    icon: <Shield className="h-6 w-6 text-primary" />
  },
  {
    id: "operations",
    name: "Operations",
    description: "Daily reports, scheduling, and operational procedures",
    documentCount: 923,
    pendingCount: 12,
    icon: <Train className="h-6 w-6 text-primary" />
  },
  {
    id: "finance",
    name: "Finance",
    description: "Financial reports, invoices, and budget documentation",
    documentCount: 778,
    pendingCount: 19,
    icon: <DollarSign className="h-6 w-6 text-primary" />
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    description: "Legal opinions, regulatory updates, and compliance reports",
    documentCount: 445,
    pendingCount: 7,
    icon: <FileText className="h-6 w-6 text-primary" />
  },
  {
    id: "emergency",
    name: "Emergency Response",
    description: "Emergency procedures, crisis management, and response protocols",
    documentCount: 267,
    pendingCount: 5,
    icon: <AlertTriangle className="h-6 w-6 text-primary" />
  }
];

const DepartmentGrid = () => {
  const handleDepartmentSelect = (departmentId) => {
    // This will be connected to routing later
    console.log(`Selected department: ${departmentId}`);
    alert(`Department ${departmentId} selected. Authentication integration coming with Supabase!`);
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Department Access Portal
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your department to access relevant documents, reports, and automated workflows
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              name={dept.name}
              description={dept.description}
              documentCount={dept.documentCount}
              pendingCount={dept.pendingCount}
              icon={dept.icon}
              onSelect={() => handleDepartmentSelect(dept.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DepartmentGrid;