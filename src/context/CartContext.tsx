import type React from 'react';
import { createContext, useContext, useReducer, useEffect } from 'react';
import type { Cart, CartItem, Product } from '../types';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, size: string | number, quantity?: number) => void;
  removeFromCart: (productId: string, size: string | number) => void;
  updateQuantity: (productId: string, size: string | number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; size: string | number; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; size: string | number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; size: string | number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart };

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, size, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          count: calculateCount(updatedItems),
        };
      }

      const newItems = [...state.items, { product, size, quantity }];
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        count: calculateCount(newItems),
      };
    }

    case 'REMOVE_FROM_CART': {
      const { productId, size } = action.payload;
      const filteredItems = state.items.filter(
        item => !(item.product.id === productId && item.size === size)
      );
      return {
        ...state,
        items: filteredItems,
        total: calculateTotal(filteredItems),
        count: calculateCount(filteredItems),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, size, quantity } = action.payload;
      const updatedItems = state.items.map(item =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        count: calculateCount(updatedItems),
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        count: 0,
      };

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
};

const calculateCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

const initialCart: Cart = {
  items: [],
  total: 0,
  count: 0,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, size: string | number, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, size, quantity } });
  };

  const removeFromCart = (productId: string, size: string | number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, size } });
  };

  const updateQuantity = (productId: string, size: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => cart.total;
  const getCartCount = () => cart.count;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
