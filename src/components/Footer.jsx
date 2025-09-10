import { FileText, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-foreground">KMRL DMS</h3>
                <p className="text-sm text-muted-foreground">Document Management System</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Streamlining document management for Kochi Metro Rail Limited. 
              Empowering departments with intelligent automation, seamless routing, 
              and AI-powered document processing.
            </p>
            <div className="text-sm text-muted-foreground">
              © 2024 Kochi Metro Rail Limited. All rights reserved.
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Departments</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Reports</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Analytics</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help & Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Info</h4>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">KMRL, Kochi, Kerala</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">+91-484-XXXXXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">support@kmrl.gov.in</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Built with modern technology for efficient government operations
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;