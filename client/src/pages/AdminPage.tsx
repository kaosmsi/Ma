import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TerminalCard } from "@/components/TerminalCard";
import { MatrixButton } from "@/components/MatrixButton";
import { Product, InsertProduct } from "@shared/schema";
import { Trash2, Edit2, Plus, LogOut, RefreshCw, Download, RotateCcw } from "lucide-react";
import { Link } from "wouter";

const ADMIN_USERNAME = "Mamory";
const ADMIN_PASSWORD = "jsjIiwkwmOO88(8)-ieieik'#isb7uU828";
const SESSION_TOKEN_KEY = "admin_session_token";
const SESSION_EXPIRY_KEY = "admin_session_expiry";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function generateSessionToken(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function isSessionValid(): boolean {
  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
  
  if (!token || !expiry) return false;
  
  const expiryTime = parseInt(expiry, 10);
  if (isNaN(expiryTime)) return false;
  
  if (Date.now() > expiryTime) {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    localStorage.removeItem("admin_auth");
    return false;
  }
  
  return true;
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const MAX_ATTEMPTS = 5;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attemptCount >= MAX_ATTEMPTS) {
      setError("TOO_MANY_ATTEMPTS_WAIT_BEFORE_RETRYING");
      return;
    }

    setIsLoading(true);
    
    // Simulate a small delay for security (prevent brute force)
    await new Promise(resolve => setTimeout(resolve, 300));

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = generateSessionToken();
      const expiry = Date.now() + SESSION_DURATION;
      
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      sessionStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
      localStorage.setItem("admin_auth", "true");
      
      setIsLoading(false);
      onLogin();
    } else {
      setError("INVALID_CREDENTIALS");
      setUsername("");
      setPassword("");
      setAttemptCount(prev => prev + 1);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-primary font-mono p-8 flex items-center justify-center overflow-hidden relative selection:bg-primary selection:text-black">
      <div className="scanlines" />
      <div className="relative z-10 w-full max-w-sm">
        <TerminalCard title="SECURE_ACCESS">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-xs opacity-60 mb-4 p-2 border border-primary/30 bg-primary/5 rounded">
              SESSION_TIMEOUT: 24_HOURS<br/>
              ATTEMPTS_LEFT: {Math.max(0, MAX_ATTEMPTS - attemptCount)}
            </div>

            <div>
              <label className="text-xs opacity-60 block mb-2">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || attemptCount >= MAX_ATTEMPTS}
                className="w-full bg-black border border-primary/50 text-primary p-3 text-sm font-mono focus:outline-none focus:border-primary disabled:opacity-50"
                placeholder="Enter username"
                data-testid="input-username"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs opacity-60 block mb-2">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || attemptCount >= MAX_ATTEMPTS}
                className="w-full bg-black border border-primary/50 text-primary p-3 text-sm font-mono focus:outline-none focus:border-primary disabled:opacity-50"
                placeholder="Enter password"
                data-testid="input-password"
              />
            </div>

            {error && (
              <div className={`border p-3 text-xs font-mono ${
                attemptCount >= MAX_ATTEMPTS 
                  ? 'border-red-600/80 bg-red-600/20 text-red-400' 
                  : 'border-red-500/50 bg-red-500/10 text-red-500'
              }`}>
                {error}
              </div>
            )}

            <MatrixButton 
              type="submit" 
              className="w-full" 
              data-testid="button-login"
              disabled={isLoading || attemptCount >= MAX_ATTEMPTS}
            >
              {isLoading ? "VERIFYING..." : "ACCESS_SYSTEM"}
            </MatrixButton>
          </form>
        </TerminalCard>

        <p className="text-center text-xs opacity-40 mt-8 space-y-1">
          <div>&gt; AUTHENTICATION_REQUIRED</div>
          <div>&gt; SESSION_SECURED_WITH_TOKEN</div>
        </p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<InsertProduct>({
    name: "",
    description: "",
    priceBtc: 0.001,
    quantity: 1,
    inStock: true,
    image: "",
  });

  // Color customization state
  const [bgColor, setBgColor] = useState(() => 
    localStorage.getItem("admin_bg_color") || "#000000"
  );
  const [textColor, setTextColor] = useState(() =>
    localStorage.getItem("admin_text_color") || "#00FF00"
  );
  const [accentColor, setAccentColor] = useState(() =>
    localStorage.getItem("admin_accent_color") || "#00FF00"
  );
  const [borderColor, setBorderColor] = useState(() =>
    localStorage.getItem("admin_border_color") || "#00FF00"
  );
  const [fontSize, setFontSize] = useState(() =>
    parseInt(localStorage.getItem("admin_font_size") || "14")
  );
  const { data: configData } = useQuery({
    queryKey: ["/api/config/telegram_link"],
    queryFn: () => fetch("/api/config/telegram_link").then(r => r.json()),
  });

  const [telegramLink, setTelegramLink] = useState("");

  useEffect(() => {
    if (configData?.value) {
      setTelegramLink(configData.value);
    }
  }, [configData]);

  const updateConfigMutation = useMutation({
    mutationFn: (value: string) =>
      apiRequest("POST", "/api/config/telegram_link", { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config/telegram_link"] });
    },
  });

  useEffect(() => {
    localStorage.setItem("admin_bg_color", bgColor);
    localStorage.setItem("admin_text_color", textColor);
    localStorage.setItem("admin_accent_color", accentColor);
    localStorage.setItem("admin_border_color", borderColor);
    localStorage.setItem("admin_font_size", fontSize.toString());
    
    if (telegramLink && telegramLink !== configData?.value) {
      updateConfigMutation.mutate(telegramLink);
    }
  }, [bgColor, textColor, accentColor, borderColor, fontSize, telegramLink]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => fetch("/api/products").then(r => r.json()),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => fetch("/api/orders").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProduct) =>
      apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setFormData({
        name: "",
        description: "",
        priceBtc: 0.001,
        quantity: 1,
        inStock: true,
        image: "",
      });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<InsertProduct> }) =>
      apiRequest("PATCH", `/api/products/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        priceBtc: 0.001,
        quantity: 1,
        inStock: true,
        image: "",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`CRITICAL_ACTION_REQUIRED: Are you absolutely sure you want to PERMANENTLY DELETE product "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      priceBtc: product.priceBtc,
      quantity: product.quantity,
      inStock: product.inStock,
      image: product.image || "",
    });
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      name: "",
      description: "",
      priceBtc: 0.001,
      quantity: 1,
      inStock: true,
      image: "",
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    localStorage.removeItem("admin_auth");
    window.location.href = "/nsiJUj886Nmssoe829Nnmxk2872jz826n";
  };

  // Check session validity on component mount
  useEffect(() => {
    if (!isSessionValid()) {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_EXPIRY_KEY);
      localStorage.removeItem("admin_auth");
    }
  }, []);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `products_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleResetColors = () => {
    setBgColor("#000000");
    setTextColor("#00FF00");
    setAccentColor("#00FF00");
    setBorderColor("#00FF00");
    setFontSize(14);
  };

  const dynamicStyle = {
    backgroundColor: bgColor,
    color: textColor,
    fontSize: `${fontSize}px`,
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen font-mono p-8 flex flex-col items-center justify-center gap-4"
        style={dynamicStyle}
      >
        <div>LOADING_DATABASE...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-mono p-8 overflow-hidden relative selection:text-black"
      style={{
        ...dynamicStyle,
        backgroundColor: bgColor,
      }}
    >
      <div className="scanlines" />
      <div className="max-w-7xl mx-auto relative z-10">
        <header
          className="mb-8 pb-6 flex justify-between items-start gap-6"
          style={{ borderBottomColor: borderColor, borderBottomWidth: "1px" }}
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tighter">ADMIN_CONSOLE</h1>
            <p className="text-sm opacity-70">&gt; FULL_SYSTEM_CONTROL</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handleRefresh}
              className="p-2 border hover:opacity-80 transition"
              style={{
                borderColor: accentColor,
                color: textColor,
              }}
              title="Refresh product list"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleExportData}
              className="p-2 border hover:opacity-80 transition"
              style={{
                borderColor: accentColor,
                color: textColor,
              }}
              title="Export products as JSON"
              data-testid="button-export"
            >
              <Download className="w-5 h-5" />
            </button>
            <Link href="/">
              <MatrixButton
                variant="outline"
                style={{
                  borderColor: accentColor,
                  color: textColor,
                }}
              >
                BACK_TO_STORE
              </MatrixButton>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 border hover:opacity-80 transition"
              style={{
                borderColor: accentColor,
                color: textColor,
              }}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Customization Panel & Orders Summary */}
          <div>
            <div
              className="border p-4 mb-6"
              style={{
                borderColor: borderColor,
                backgroundColor: `${bgColor}20`,
              }}
            >
              <h3 className="font-bold text-sm mb-4 tracking-widest">UI_CUSTOMIZATION</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs opacity-60 block mb-2">BACKGROUND_COLOR</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-10 cursor-pointer"
                      data-testid="input-bg-color"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 bg-black border p-2 text-xs"
                      style={{ borderColor: borderColor }}
                      data-testid="input-bg-hex"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs opacity-60 block mb-2">TEXT_COLOR</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 cursor-pointer"
                      data-testid="input-text-color"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 bg-black border p-2 text-xs"
                      style={{ borderColor: borderColor }}
                      data-testid="input-text-hex"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs opacity-60 block mb-2">ACCENT_COLOR</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-10 cursor-pointer"
                      data-testid="input-accent-color"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 bg-black border p-2 text-xs"
                      style={{ borderColor: borderColor }}
                      data-testid="input-accent-hex"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs opacity-60 block mb-2">BORDER_COLOR</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-12 h-10 cursor-pointer"
                      data-testid="input-border-color"
                    />
                    <input
                      type="text"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="flex-1 bg-black border p-2 text-xs"
                      style={{ borderColor: borderColor }}
                      data-testid="input-border-hex"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs opacity-60 block mb-2">FONT_SIZE: {fontSize}px</label>
                  <input
                    type="range"
                    min="10"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                    data-testid="input-font-size"
                  />
                </div>

                <button
                  onClick={handleResetColors}
                  className="w-full py-2 border text-xs font-mono transition mt-4"
                  style={{
                    backgroundColor: accentColor,
                    color: bgColor,
                    borderColor: accentColor,
                  }}
                  data-testid="button-reset-colors"
                >
                  <RotateCcw className="w-3 h-3 inline mr-1" /> RESET_DEFAULTS
                </button>

                <div className="border-t border-gray-600 mt-4 pt-4">
                  <label className="text-xs opacity-60 block mb-2">TELEGRAM_LINK</label>
                  <input
                    type="text"
                    value={telegramLink}
                    onChange={(e) => setTelegramLink(e.target.value)}
                    className="w-full bg-black border p-2 text-xs"
                    style={{ borderColor: borderColor }}
                    placeholder="https://t.me/..."
                    data-testid="input-telegram-link"
                  />
                </div>
              </div>
            </div>

            {/* Product Form */}
            <div
              className="border p-4"
              style={{
                borderColor: borderColor,
                backgroundColor: `${bgColor}20`,
              }}
            >
              <h3 className="font-bold text-sm mb-4 tracking-widest">
                {editingId ? "EDIT_PRODUCT" : "CREATE_PRODUCT"}
              </h3>

              {!showForm && !editingId && (
                <MatrixButton
                  onClick={() => setShowForm(true)}
                  className="w-full text-sm"
                  style={{
                    backgroundColor: accentColor,
                    color: bgColor,
                    borderColor: accentColor,
                  }}
                  data-testid="button-add-product"
                >
                  <Plus className="w-4 h-4" /> NEW_PRODUCT
                </MatrixButton>
              )}

              {(showForm || editingId) && (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs opacity-60 block mb-1">PRODUCT_NAME</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border p-2 text-sm font-mono focus:outline-none"
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        borderColor: borderColor,
                      }}
                      placeholder="Enter product name"
                      required
                      data-testid="input-product-name"
                    />
                  </div>

                  <div>
                    <label className="text-xs opacity-60 block mb-1">DESCRIPTION</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full border p-2 text-sm font-mono focus:outline-none h-20 resize-none"
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        borderColor: borderColor,
                      }}
                      placeholder="Enter description"
                      required
                      data-testid="input-product-description"
                    />
                  </div>

                  <div>
                    <label className="text-xs opacity-60 block mb-1">PRICE_BTC (up to 8 decimals)</label>
                    <input
                      type="number"
                      step="0.00000001"
                      min="0"
                      value={formData.priceBtc}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priceBtc: parseFloat(e.target.value),
                        })
                      }
                      className="w-full border p-2 text-sm font-mono focus:outline-none"
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        borderColor: borderColor,
                      }}
                      required
                      data-testid="input-product-price"
                    />
                  </div>

                  <div>
                    <label className="text-xs opacity-60 block mb-1">QUANTITY</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value),
                        })
                      }
                      className="w-full border p-2 text-sm font-mono focus:outline-none"
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        borderColor: borderColor,
                      }}
                      required
                      data-testid="input-product-quantity"
                    />
                  </div>

                  <div>
                    <label className="text-xs opacity-60 block mb-1">IMAGE_URL</label>
                    <input
                      type="text"
                      value={formData.image || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full border p-2 text-sm font-mono focus:outline-none"
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        borderColor: borderColor,
                      }}
                      placeholder="https://..."
                      data-testid="input-product-image"
                    />
                  </div>

                  <div>
                    <label className="text-xs opacity-60 block mb-2">STATUS</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, inStock: true })
                        }
                        className="flex-1 py-2 border text-xs font-mono transition"
                        style={{
                          backgroundColor: formData.inStock ? accentColor : "transparent",
                          color: formData.inStock ? bgColor : textColor,
                          borderColor: accentColor,
                        }}
                        data-testid="button-stock-in"
                      >
                        IN_STOCK
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, inStock: false })
                        }
                        className="flex-1 py-2 border text-xs font-mono transition"
                        style={{
                          backgroundColor: !formData.inStock ? accentColor : "transparent",
                          color: !formData.inStock ? bgColor : textColor,
                          borderColor: accentColor,
                        }}
                        data-testid="button-stock-out"
                      >
                        OUT_OF_STOCK
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 border text-sm font-mono transition"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      style={{
                        backgroundColor: accentColor,
                        color: bgColor,
                        borderColor: accentColor,
                      }}
                      data-testid="button-save-product"
                    >
                      {editingId ? "UPDATE" : "CREATE"}
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2 border text-sm font-mono transition"
                      onClick={cancelForm}
                      style={{
                        borderColor: borderColor,
                        color: textColor,
                      }}
                      data-testid="button-cancel-form"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Products & Orders List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Orders Section */}
            <div
              className="border p-4"
              style={{
                borderColor: borderColor,
                backgroundColor: `${bgColor}20`,
              }}
            >
              <h3 className="font-bold text-sm mb-4 tracking-widest">CUSTOMER_ORDERS_{orders?.length || 0}</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto text-xs">
                {orders && orders.length > 0 ? (
                  orders.map((order: any) => {
                    const product = products?.find((p: Product) => p.id === order.productId);
                    return (
                      <div
                        key={order.id}
                        className="border p-3 transition"
                        style={{
                          borderColor: borderColor,
                          backgroundColor: `${bgColor}50`,
                        }}
                        data-testid={`card-order-${order.id}`}
                      >
                        <div className="flex justify-between items-start gap-4 mb-3 border-b border-primary/20 pb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm uppercase tracking-tighter">ORDER #{order.id}</p>
                            <p className="text-primary opacity-90 break-all text-xs mb-1">{order.email}</p>
                            <p className="text-[10px] opacity-60 uppercase">ITEM: {product?.name || "DELETED_PRODUCT"}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-sm" style={{ color: order.status === 'pending' ? '#FFD700' : accentColor }}>
                              {order.status.toUpperCase()}
                            </p>
                            <p className="text-[10px] opacity-40">{new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center bg-black/40 p-1.5 px-2">
                            <span className="opacity-50 text-[10px]">PRICE:</span>
                            <span className="font-bold text-sm" style={{ color: accentColor }}>{order.priceBtc.toFixed(8)} BTC</span>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="opacity-50 text-[10px] block uppercase">Transaction Hash:</span>
                            <div className="bg-black/60 p-2 border border-primary/10 break-all font-mono text-[10px] leading-relaxed select-all">
                              {order.txHash || "NO_HASH_PROVIDED"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 opacity-50 uppercase">NO_ORDERS_DETECTED</div>
                )}
              </div>
            </div>

            {/* Products List */}
            <div
              className="border p-4"
              style={{
                borderColor: borderColor,
                backgroundColor: `${bgColor}20`,
              }}
            >
              <h3 className="font-bold text-sm mb-4 tracking-widest">PRODUCTS_{products?.length || 0}</h3>
              <div className="space-y-2 max-h-[800px] overflow-y-auto">
                {products && products.length > 0 ? (
                  products.map((product: Product) => (
                    <div
                      key={product.id}
                      className="border p-3 transition"
                      style={{
                        borderColor: borderColor,
                        backgroundColor: `${bgColor}50`,
                      }}
                      data-testid={`card-product-${product.id}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm break-words">{product.name}</p>
                          <p className="text-xs opacity-60 text-ellipsis overflow-hidden">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => startEdit(product)}
                            className="p-1 border transition"
                            style={{
                              borderColor: accentColor,
                              color: accentColor,
                            }}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1 border transition"
                            style={{
                              borderColor: "#FF0000",
                              color: "#FF0000",
                            }}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs opacity-70">
                        <div>
                          Price: <span style={{ color: accentColor }}>{product.priceBtc.toFixed(8).replace(/\.?0+$/, "")} BTC</span>
                        </div>
                        <div>
                          Qty: <span style={{ color: accentColor }}>{product.quantity}</span>
                        </div>
                        <div className="col-span-2">
                          Status:{" "}
                          <span
                            style={{
                              color: product.inStock ? accentColor : "#FF0000",
                            }}
                          >
                            {product.inStock ? "IN_STOCK" : "OUT_OF_STOCK"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 opacity-50">NO_PRODUCTS_FOUND</div>
                )}
              </div>
            </div>
            </div>
        </div>

        <footer
          className="mt-12 py-6 text-center text-xs opacity-40 space-y-2"
          style={{ borderTopColor: borderColor, borderTopWidth: "1px" }}
        >
          <p>&gt; FULL_ADMIN_CONTROL_v1.0 // CUSTOM_UI_ENABLED</p>
          <p className="text-xs opacity-30">
            Total Products: {products?.length || 0} | 
            In Stock: {products?.filter((p: Product) => p.inStock).length || 0} | 
            Out of Stock: {products?.filter((p: Product) => !p.inStock).length || 0}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return isSessionValid() && localStorage.getItem("admin_auth") === "true";
  });

  // Validate session on component mount and set up interval checks
  useEffect(() => {
    const validateSession = () => {
      const sessionValid = isSessionValid();
      setIsAuthenticated(sessionValid);
    };

    // Check on mount
    validateSession();

    // Check every minute to catch session expiry
    const interval = setInterval(validateSession, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}
