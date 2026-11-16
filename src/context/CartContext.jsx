import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'orbit-gear-cart';

function readStoredCart() {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredCart(items) {
  try {
    if (!items.length) {
      sessionStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota / private-mode failures
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart());
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    writeStoredCart(items);
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: qty,
        },
      ];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    writeStoredCart([]);
  };

  const placeOrder = (customer) => {
    const order = {
      id: `OG-${Date.now().toString(36).toUpperCase()}`,
      placedAt: new Date().toISOString(),
      customer,
      items: items.map((item) => ({ ...item })),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
    setLastOrder(order);
    clearCart();
    return order;
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = {
    items,
    lastOrder,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    placeOrder,
    itemCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
