import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProducts } from "@/hooks/use-store";
import { TerminalCard } from "@/components/TerminalCard";
import { MatrixButton } from "@/components/MatrixButton";
import { PaymentModal } from "@/components/PaymentModal";
import { GlitchText } from "@/components/GlitchText";
import { Product } from "@shared/schema";
import {
  ShoppingCart,
  Server,
  Code,
  Wifi,
  Bitcoin,
  Terminal,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { data: products, isLoading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data: configData } = useQuery({
    queryKey: ["/api/config/telegram_link"],
    queryFn: () => fetch("/api/config/telegram_link").then(r => r.json()),
  });

  const telegramLink = configData?.value || "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-primary font-mono gap-4">
        <Server className="w-12 h-12 animate-pulse" />
        <p className="text-xl tracking-[0.2em] animate-pulse">
          ESTABLISHING UPLINK...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono p-4 text-center">
        <Code className="w-16 h-16 mb-6 opacity-80" />
        <h1 className="text-4xl mb-4 font-bold border-b border-red-500 pb-2">
          SYSTEM FAILURE
        </h1>
        <p className="max-w-md">{error.message}</p>
        <MatrixButton
          variant="danger"
          className="mt-8"
          onClick={() => window.location.reload()}
        >
          REBOOT SYSTEM
        </MatrixButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-primary font-mono p-4 md:p-8 overflow-hidden relative selection:bg-primary selection:text-black">
      {/* Background Decor */}
      <div className="scanlines" />
      <div className="fixed top-4 right-4 flex items-center gap-2 text-xs opacity-50 z-10">
        <Wifi className="w-3 h-3 animate-pulse" />
        <span>NET: SECURE</span>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Telegram Link */}
        {telegramLink && telegramLink !== "https://t.me/" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2"
          >
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1 border border-primary/30 px-3 py-2 hover:border-primary"
              data-testid="link-telegram"
            >
              <MessageCircle className="w-3 h-3" />
              JOIN_TELEGRAM
            </a>
          </motion.div>
        )}

        {/* Header */}
        <header className="mb-12 border-b border-primary/30 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              <GlitchText text="SILK_ROAD_V0.1" />
            </h1>
            <p className="text-sm md:text-base text-primary/70 max-w-lg leading-relaxed">
              &gt; ACCESSING ENCRYPTED MARKETPLACE
              <br />
              &gt; CURRENCY: BTC ONLY
              <br />
              &gt; STATUS: ONLINE
            </p>
          </div>
          <div className="text-right hidden md:block opacity-60 text-xs">
            <pre>{`
   ___     
  / _ \\    
 | (_) |   
  \\___/    
             `}</pre>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-2">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> AVAILABLE_INVENTORY
              </h2>
              <span className="text-xs px-2 py-1 bg-primary/10 border border-primary/20">
                COUNT: {products?.length || 0}
              </span>
            </div>

            <div className="space-y-4">
              {products?.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <TerminalCard className="hover:bg-primary/5 transition-colors group">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-bold group-hover:text-white transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-primary/60 leading-relaxed border-l-2 border-primary/20 pl-3">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 min-w-[160px]">
                        <div className="text-right">
                          <div className="text-xs text-primary/50 uppercase tracking-widest">
                            Price
                          </div>
                          <div className="text-xl font-bold flex items-center gap-1">
                            <Bitcoin className="w-4 h-4" />
                            {product.priceBtc.toFixed(8).replace(/\.?0+$/, "")}
                          </div>
                          <div
                            className={`text-xs font-bold uppercase tracking-widest mt-1 ${product.inStock ? "text-primary" : "text-red-500"}`}
                          >
                            {product.inStock ? "✓ IN_STOCK" : "✗ OUT_OF_STOCK"}
                          </div>
                        </div>

                        <MatrixButton
                          onClick={() => setSelectedProduct(product)}
                          className="w-full md:w-auto"
                          disabled={!product.inStock}
                        >
                          {product.inStock ? "ACQUIRE" : "UNAVAILABLE"}
                        </MatrixButton>
                      </div>
                    </div>
                  </TerminalCard>
                </motion.div>
              ))}

              {products?.length === 0 && (
                <div className="border border-dashed border-primary/30 p-12 text-center text-primary/50">
                  NO_INVENTORY_DETECTED
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Info */}
          <aside className="space-y-6"></aside>
        </div>

        <footer className="mt-20 border-t border-primary/20 py-8 text-center text-xs opacity-40">
          <p>
            EST. 2026 // ANONYMOUS COMMERCE PROTOCOL // DISCONNECT WHEN FINISHED
          </p>
        </footer>
      </div>

      <PaymentModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
