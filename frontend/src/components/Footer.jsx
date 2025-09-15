import { FileText, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-blue-50 via-white to-blue-100 border-t border-gray-200">
      {/* Top gradient line for metro-theme accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-green-500 to-orange-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo + About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-9 w-9 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">KMRL DMS</h3>
                <p className="text-sm text-gray-500">Document Management System</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed max-w-md">
              Streamlining document management for Kochi Metro Rail Limited. 
              Empowering departments with intelligent automation, seamless routing, 
              and AI-powered processing.
            </p>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Kochi Metro Rail Limited. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Departments</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Reports</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Analytics</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Help & Support</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contact Info</h4>
            <div className="space-y-3 text-gray-600 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>KMRL, Kochi, Kerala</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span>+91-484-XXXXXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-600" />
                <span>support@kmrl.gov.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="border-t border-gray-200 mt-10 pt-6 text-center">
          <p className="text-sm text-gray-500">
            🚆 Built with modern technology for efficient government operations
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
