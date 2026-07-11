import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-primary font-mono p-4">
      <div className="border border-primary p-8 md:p-12 max-w-2xl w-full text-center relative shadow-[0_0_30px_rgba(0,255,0,0.1)]">
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>

        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-24 w-24 animate-pulse text-primary" />
        </div>

        <h1 className="text-6xl font-bold mb-4 tracking-tighter">404</h1>
        <h2 className="text-xl mb-8 uppercase tracking-widest border-b border-primary/30 pb-4 inline-block">
          Signal Lost / Path Not Found
        </h2>

        <p className="text-primary/70 mb-12 max-w-md mx-auto leading-relaxed">
          The requested data packet could not be located on this server node. 
          The resource may have been deleted, moved, or seized by authorities.
        </p>

        <Link href="/" className="inline-block group relative px-8 py-3 bg-transparent border border-primary text-primary font-bold uppercase tracking-wider hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(0,255,0,0.4)] transition-all">
          <span className="flex items-center gap-2">
            &lt; Return to Base
          </span>
        </Link>
      </div>
      
      <div className="scanlines" />
    </div>
  );
}
