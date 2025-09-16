import { cn } from "@/lib/utils";

const PageShell = ({ title, subtitle, icon, children, className }) => {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50", className)}>
      <div className="px-4 sm:px-6 pt-6 pb-8 max-w-7xl mx-auto space-y-6">
        {(title || subtitle || icon) && (
          <div className="flex items-center gap-4">
            {icon && <div className="p-3 bg-primary/10 rounded-lg">{icon}</div>}
            <div>
              {title && <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-800">{title}</h1>}
              {subtitle && <p className="text-sm sm:text-base text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageShell;


