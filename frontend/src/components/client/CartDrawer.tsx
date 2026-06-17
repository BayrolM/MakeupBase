import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "../../lib/store";
import {
  ShoppingCart,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { productService } from "../../services/productService";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (route: string) => void;
}

export function CartDrawer({ isOpen, onOpenChange, onNavigate }: CartDrawerProps) {
  const {
    currentUser,
    carrito,
    productos,
    removeFromCarrito,
    updateCarritoQuantity,
  } = useStore();

  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const [stockIssues, setStockIssues] = useState<Record<string, { available: number; requested: number }>>({});
  const [isValidating, setIsValidating] = useState(false);

  const cartItemCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const getLiveQuantity = (item: (typeof carrito)[number]) => {
    const draft = quantityInputs[item.productoId];
    if (draft && /^\d+$/.test(draft)) {
      return Math.min(
        productos.find((p) => p.id === item.productoId)?.stock ?? item.cantidad,
        parseInt(draft, 10),
      );
    }
    return item.cantidad;
  };

  const cartTotal = carrito.reduce((sum, item) => {
    const producto = productos.find((p) => p.id === item.productoId);
    const cantidad = getLiveQuantity(item);
    return sum + (producto ? producto.precioVenta * cantidad : 0);
  }, 0);

  const total = cartTotal;

  const carritoRef = useRef(carrito);
  carritoRef.current = carrito;

  const validateStock = useCallback(async () => {
    const currentCarrito = carritoRef.current;
    if (currentCarrito.length === 0) return;
    setIsValidating(true);
    const issues: Record<string, { available: number; requested: number }> = {};
    try {
      for (const item of currentCarrito) {
        try {
          const freshProduct = await productService.getById(
            parseInt(item.productoId, 10),
          );
          const availableStock = freshProduct.stock_actual;
          if (availableStock <= 0) {
            issues[item.productoId] = {
              available: 0,
              requested: item.cantidad,
            };
          } else if (item.cantidad > availableStock) {
            issues[item.productoId] = {
              available: availableStock,
              requested: item.cantidad,
            };
            updateCarritoQuantity(item.productoId, availableStock);
          }
        } catch {
          /* skip if fetch fails */
        }
      }
      setStockIssues(issues);
      if (Object.keys(issues).length > 0) {
        const outOfStock = Object.values(issues).filter(
          (i) => i.available === 0,
        ).length;
        if (outOfStock > 0)
          toast.warning(`${outOfStock} producto(s) sin stock disponible`);
      }
    } finally {
      setIsValidating(false);
    }
  }, [updateCarritoQuantity]);

  useEffect(() => {
    if (isOpen && carritoRef.current.length > 0) validateStock();
    if (!isOpen) setStockIssues({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const hasBlockingIssues = Object.values(stockIssues).some(
    (i) => i.available === 0,
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="p-0"
        style={{
          maxWidth: "440px",
          background: "var(--luxury-bg-soft)",
          borderLeft: "1px solid var(--luxury-accent-soft)",
        }}
      >
        <SheetDescription className="sr-only">
          Resumen de productos agregados a tu carrito de compras
        </SheetDescription>
        <div className="flex flex-col h-full">
          <SheetHeader
            className="p-6"
            style={{
              borderBottom: "1px solid var(--luxury-accent-soft)",
              background: "var(--luxury-bg-header)",
            }}
          >
            <div
              style={{
                height: "3px",
                background:
                  "linear-gradient(90deg, var(--luxury-pink-soft), var(--luxury-pink))",
                borderRadius: "4px",
                marginBottom: "16px",
              }}
            />
            <SheetTitle
              className="flex items-center gap-3 font-serif text-xl font-bold"
              style={{ color: "var(--luxury-text-dark)" }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, var(--luxury-pink-soft), var(--luxury-pink))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px var(--luxury-shadow)",
                }}
              >
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              Mi Carrito
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--luxury-text-muted)",
                  textTransform: "none",
                }}
              >
                ({cartItemCount} {cartItemCount === 1 ? "producto" : "productos"})
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "var(--luxury-accent-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <ShoppingCart
                    className="w-10 h-10"
                    style={{ color: "var(--luxury-pink-soft)" }}
                  />
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--luxury-text-dark)",
                  }}
                >
                  Tu carrito está vacío
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--luxury-text-muted)",
                    marginTop: "6px",
                  }}
                >
                  Descubre nuestros productos en el catálogo
                </p>
                <button
                  onClick={() => {
                    onNavigate("catalogo");
                    onOpenChange(false);
                  }}
                  style={{
                    marginTop: "24px",
                    padding: "10px 32px",
                    borderRadius: "14px",
                    border: "1.5px solid var(--luxury-pink-soft)",
                    background: "transparent",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--luxury-pink)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--luxury-accent-soft)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Ir al catálogo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {carrito.map((item) => {
                  const producto = productos.find(
                    (p) => p.id === item.productoId,
                  );
                  if (!producto) return null;

                  const inputValue =
                    quantityInputs[item.productoId] ?? String(item.cantidad);

                  const hasStockIssue =
                    stockIssues[item.productoId]?.available === 0;

                  return (
                    <div
                      key={item.productoId}
                      className={`flex gap-4 p-4 rounded-xl transition-all ${
                        hasStockIssue ? "bg-red-50/50 border-red-200" : ""
                      }`}
                      style={{
                        border: hasStockIssue
                          ? undefined
                          : "1.5px solid var(--luxury-accent-soft)",
                        background: hasStockIssue ? undefined : "white",
                        boxShadow: hasStockIssue
                          ? undefined
                          : "0 2px 12px var(--luxury-shadow-xs)",
                      }}
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-border shrink-0 bg-white">
                        <img
                          src={
                            producto.imagenUrl ||
                            "https://via.placeholder.com/80"
                          }
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-bold text-foreground truncate">
                            {producto.nombre}
                          </h4>
                          <button
                            onClick={() => {
                              removeFromCarrito(item.productoId);
                              setStockIssues((prev) => {
                                const next = { ...prev };
                                delete next[item.productoId];
                                return next;
                              });
                            }}
                            className="text-foreground-secondary hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p
                          className="text-sm font-bold mt-1"
                          style={{ color: "var(--luxury-pink)" }}
                        >
                          {formatCurrency(producto.precioVenta)}
                        </p>

                        {stockIssues[item.productoId] && (
                          <div className="flex items-center gap-1.5 mt-2 text-amber-600">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[11px] font-medium leading-tight">
                              {stockIssues[item.productoId].available === 0
                                ? "Agotado — por favor retíralo"
                                : `Quedan ${stockIssues[item.productoId].available} unidades`}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center mt-3">
                          <div className="flex items-center gap-3 bg-background border border-border rounded-lg p-1">
                            <button
                              onClick={() => {
                                const next = item.cantidad - 1;
                                if (next >= 1) {
                                  updateCarritoQuantity(
                                    item.productoId,
                                    next,
                                  );
                                  setQuantityInputs((prev) => ({
                                    ...prev,
                                    [item.productoId]: String(next),
                                  }));
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface text-foreground transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={producto.stock}
                              step={1}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="quantity-input text-xs font-bold w-20 text-center rounded-lg border border-border bg-white"
                              value={inputValue}
                              onChange={(e) => {
                                const raw = e.target.value;
                                
                                // No permitir ceros a la izquierda ni el valor 0
                                if (raw.startsWith("0")) return;
                                
                                if (/^\d*$/.test(raw)) {
                                  let finalValue = raw;
                                  
                                  if (raw !== "") {
                                    const parsed = parseInt(raw, 10);
                                    if (parsed > producto.stock) {
                                      toast.error(
                                        `Sólo hay ${producto.stock} unidades disponibles de ${producto.nombre}`,
                                        { id: `stock-limit-${producto.id}` }
                                      );
                                      finalValue = String(producto.stock);
                                      updateCarritoQuantity(item.productoId, producto.stock);
                                    } else {
                                      updateCarritoQuantity(item.productoId, parsed);
                                    }
                                  }
                                  
                                  setQuantityInputs((prev) => ({
                                    ...prev,
                                    [item.productoId]: finalValue,
                                  }));
                                }
                              }}
                              onBlur={(e) => {
                                const raw = e.target.value;
                                const parsed = parseInt(raw, 10);

                                if (Number.isNaN(parsed) || parsed < 1) {
                                  updateCarritoQuantity(item.productoId, 1);
                                  setQuantityInputs((prev) => ({
                                    ...prev,
                                    [item.productoId]: "1",
                                  }));
                                  return;
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                const next = item.cantidad + 1;
                                if (next <= producto.stock) {
                                  updateCarritoQuantity(
                                    item.productoId,
                                    next,
                                  );
                                  setQuantityInputs((prev) => ({
                                    ...prev,
                                    [item.productoId]: String(next),
                                  }));
                                }
                              }}
                              disabled={
                                item.cantidad >= producto.stock ||
                                hasStockIssue
                              }
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface text-foreground transition-colors disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {carrito.length > 0 && (
            <div
              className="p-6"
              style={{
                borderTop: "1px solid var(--luxury-accent-soft)",
                background: "var(--luxury-bg-header)",
              }}
            >
              <div className="space-y-3 mb-6">
                <div
                  className="flex justify-between text-sm"
                  style={{ color: "var(--luxury-text-secondary)" }}
                >
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div
                  className="flex justify-between text-lg font-bold pt-4"
                  style={{
                    borderTop: "1.5px dashed var(--luxury-accent-soft)",
                  }}
                >
                  <span style={{ color: "var(--luxury-text-dark)" }}>
                    Total
                  </span>
                  <span style={{ color: "var(--luxury-pink)" }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {isValidating && (
                <div className="flex items-center justify-center gap-2 mb-4 text-xs text-foreground-secondary">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Validando stock disponible...
                </div>
              )}
              {/* ====MANEJO DE PAGO DE USUARIO NO AUTENTICADO DESDE EL CARRITO==== */}
              <button
                onClick={() => {
                  onOpenChange(false);
                  if (currentUser) {
                    onNavigate("checkout");
                  } else {
                    onNavigate("login");
                  }
                }}
                disabled={
                  carrito.length === 0 || hasBlockingIssues || isValidating
                }
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                style={{
                  background: hasBlockingIssues
                    ? "#cbd5e1"
                    : "linear-gradient(135deg, var(--luxury-pink-soft) 0%, var(--luxury-pink) 100%)",
                  boxShadow: hasBlockingIssues
                    ? "none"
                    : "0 10px 20px var(--luxury-shadow)",
                }}
              >
                {hasBlockingIssues ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    PROBLEMAS DE STOCK
                  </>
                ) : (
                  "IR A PAGAR 🎀"
                )}
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
