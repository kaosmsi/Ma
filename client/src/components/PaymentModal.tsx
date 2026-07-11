import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MatrixButton } from "./MatrixButton";
import { useCreateOrder } from "@/hooks/use-store";
import { Product } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Terminal, Bitcoin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface PaymentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

// ==============================================================================
// HOW TO EDIT BTC WALLET:
// Replace the string below with your own Bitcoin wallet address.
// Customers will see this address when they click "Buy".
// ==============================================================================
const WALLET_ADDRESS = "bc1q92ms4zxhdap22w45gfkv2c83kgcl6eejj9rm2l";

export function PaymentModal({ product, isOpen, onClose }: PaymentModalProps) {
  const [email, setEmail] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      description: "Address copied to clipboard",
      className: "border-primary text-primary bg-black",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }
    
    if (txHash.length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid Transaction Hash",
        description: "Please enter a valid transaction hash.",
      });
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        productId: product.id,
        email: email,
        priceBtc: product.priceBtc,
        txHash: txHash,
        status: "pending",
      });
      
      toast({
        title: "PAYMENT VERIFICATION STARTED",
        description: `ORDER #${order.id} submitted. Waiting for blockchain confirmation.`,
        className: "border-primary text-primary bg-black font-mono",
      });
      onClose();
      setEmail("");
      setTxHash("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERROR",
        description: (error as Error).message,
      });
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-primary text-primary font-mono max-w-md shadow-[0_0_50px_rgba(0,255,0,0.1)]">
        <DialogHeader>
          <DialogTitle className="text-xl uppercase tracking-widest flex items-center gap-2">
            <Bitcoin className="w-6 h-6" />
            Initiate Transfer
          </DialogTitle>
          <DialogDescription className="text-primary/60 font-mono text-xs">
            SECURE CONNECTION ESTABLISHED
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="border border-primary/20 p-4 bg-primary/5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-primary/60">ITEM:</span>
              <span className="font-bold">{product.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-primary/60">AMOUNT:</span>
              <span className="font-bold text-xl">{product.priceBtc.toFixed(8)} BTC</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase text-primary/60">Send Payment To:</Label>
            <div className="flex gap-2">
              <code className="flex-1 bg-primary/10 p-3 rounded-none text-xs break-all border border-primary/30 text-[#12d400]">
                {WALLET_ADDRESS}
              </code>
              <button 
                onClick={handleCopy}
                className="bg-primary/10 p-3 hover:bg-primary/20 border border-primary/30 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-primary/20">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="bg-black border-primary text-primary placeholder:text-primary/30 font-mono focus-visible:ring-primary rounded-none"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="txHash" className="text-xs uppercase flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                Input Transaction Hash
              </Label>
              <Input
                id="txHash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                className="bg-black border-primary text-primary placeholder:text-primary/30 font-mono focus-visible:ring-primary rounded-none"
                autoComplete="off"
                required
              />
            </div>

            <div className="pt-2">
              <MatrixButton 
                type="submit" 
                className="w-full"
                isLoading={createOrder.isPending}
              >
                {createOrder.isPending ? "VERIFYING..." : "CONFIRM PAYMENT"}
              </MatrixButton>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
