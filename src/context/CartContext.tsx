import type React from 'react';
import { createContext, useContext, useReducer, useEffect } from 'react';
import type { Cart, CartItem, Product } from '../types';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, size: string | number, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string, size: string | number) => void;
  updateQuantity: (productId: string, size: string | number, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getItemQuantityInCart: (productId: string, size: string | number) => number;
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
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Check if new quantity exceeds stock
        if (newQuantity > product.stock) {
          // Don't update, return current state
          return state;
        }
        
        updatedItems[existingItemIndex].quantity = newQuantity;
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          count: calculateCount(updatedItems),
        };
      }

      // Check if quantity exceeds stock for new item
      if (quantity > product.stock) {
        return state;
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
      const updatedItems = state.items.map(item => {
        if (item.product.id === productId && item.size === size) {
          // Check if new quantity exceeds stock
          const finalQuantity = Math.min(quantity, item.product.stock);
          return { ...item, quantity: finalQuantity };
        }
        return item;
      });
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

  const addToCart = (product: Product, size: string | number, quantity = 1): { success: boolean; message?: string } => {
    // Check if product is out of stock
    if (product.stock <= 0) {
      return {
        success: false,
        message: 'Товар отсутствует в наличии'
      };
    }

    // Get current quantity in cart
    const currentQuantity = getItemQuantityInCart(product.id, size);
    const totalQuantity = currentQuantity + quantity;

    // Check if total quantity exceeds stock
    if (totalQuantity > product.stock) {
      const availableToAdd = product.stock - currentQuantity;
      if (availableToAdd <= 0) {
        return {
          success: false,
          message: `Максимальное количество товара уже в корзине (${product.stock} шт.)`
        };
      }
      return {
        success: false,
        message: `Можно добавить еще только ${availableToAdd} шт. (всего в наличии: ${product.stock})`
      };
    }

    dispatch({ type: 'ADD_TO_CART', payload: { product, size, quantity } });
    return { success: true };
  };

  const removeFromCart = (productId: string, size: string | number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, size } });
  };

  const updateQuantity = (productId: string, size: string | number, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return { success: true };
    }

    // Find the item to check stock
    const item = cart.items.find(i => i.product.id === productId && i.size === size);
    if (!item) {
      return { success: false, message: 'Товар не найден в корзине' };
    }

    // Check if quantity exceeds stock
    if (quantity > item.product.stock) {
      return {
        success: false,
        message: `Максимальное количество: ${item.product.stock} шт.`
      };
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } });
    return { success: true };
  };

  const getItemQuantityInCart = (productId: string, size: string | number): number => {
    const item = cart.items.find(i => i.product.id === productId && i.size === size);
    return item ? item.quantity : 0;
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
        getItemQuantityInCart,
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
