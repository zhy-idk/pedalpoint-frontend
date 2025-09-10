import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface POSItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

interface POSState {
  cart: POSItem[];
  total: number;
  isLoading: boolean;
  searchQuery: string;
}

type POSAction =
  | { type: 'ADD_TO_CART'; payload: Omit<POSItem, 'quantity'> }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

interface POSContextType {
  state: POSState;
  actions: {
    addToCart: (item: Omit<POSItem, 'quantity'>) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    setSearchQuery: (query: string) => void;
  };
}

// Initial state
const initialState: POSState = {
  cart: [],
  total: 0,
  isLoading: false,
  searchQuery: '',
};

// Reducer
function posReducer(state: POSState, action: POSAction): POSState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedCart = state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        const total = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { ...state, cart: updatedCart, total };
      } else {
        // Add new item
        const newItem = { ...action.payload, quantity: 1 };
        const updatedCart = [...state.cart, newItem];
        const total = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { ...state, cart: updatedCart, total };
      }
    }
    
    case 'REMOVE_FROM_CART': {
      const updatedCart = state.cart.filter(item => item.id !== action.payload);
      const total = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, cart: updatedCart, total };
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedCart = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0); // Remove items with 0 quantity
      
      const total = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, cart: updatedCart, total };
    }
    
    case 'CLEAR_CART':
      return { ...state, cart: [], total: 0 };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

// Context
const POSContext = createContext<POSContextType | undefined>(undefined);

// Provider
interface POSProviderProps {
  children: ReactNode;
}

export const POSProvider: React.FC<POSProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(posReducer, initialState);

  const actions = {
    addToCart: (item: Omit<POSItem, 'quantity'>) => {
      dispatch({ type: 'ADD_TO_CART', payload: item });
    },
    removeFromCart: (id: number) => {
      dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    },
    updateQuantity: (id: number, quantity: number) => {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    },
    clearCart: () => {
      dispatch({ type: 'CLEAR_CART' });
    },
    setSearchQuery: (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    },
  };

  const value: POSContextType = {
    state,
    actions,
  };

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
};

// Hook
export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};

