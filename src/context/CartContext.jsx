import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getProductById } from '../data/products';
import { trackAddToCart } from '../utils/smartech';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'orbit-gear-cart';

function readStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
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
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota / private-mode failures
  }
}

function productForTracking(product) {
  const catalog = getProductById(product?.id);
  return {
    id: product?.id ?? catalog?.id ?? '',
    name: product?.name || catalog?.name || '',
    category: product?.category || catalog?.category || '',
    price: product?.price ?? catalog?.price ?? 0,
    image: product?.image || product?.imageUrl || catalog?.image || '',
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart());
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    writeStoredCart(items);
  }, [items]);

  const addItem = (product, qty = 1) => {
    const added = Number(qty);
    if (product && Number.isFinite(added) && added > 0) {
      trackAddToCart(productForTracking(product), added);
    }

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

    const current = items.find((item) => item.id === id);
    if (current && quantity > current.quantity) {
      trackAddToCart(productForTracking(current), quantity - current.quantity);
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
