import type { CartState, CartAction, CartItem } from '../types/cart';

export const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING': {
      return { ...state, loading: action.payload };
    }

    case 'SET_ERROR': {
      return { ...state, error: action.payload };
    }

    case 'SET_CART': {
      return calculateTotals({ ...state, items: action.payload, loading: false, error: null });
    }

    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product.id === action.payload.product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.product.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        
        return calculateTotals({ ...state, items: updatedItems });
      } else {
        // Add new item
        const newItems = [...state.items, action.payload];
        return calculateTotals({ ...state, items: newItems });
      }
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.product.id !== action.payload);
      return calculateTotals({ ...state, items: filteredItems });
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.product.id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      return calculateTotals({ ...state, items: updatedItems });
    }

    case 'CLEAR_CART': {
      return initialState;
    }

    default:
      return state;
  }
};

// Helper function to calculate totals
const calculateTotals = (state: CartState): CartState => {
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
  
  return {
    ...state,
    totalItems,
    totalPrice,
  };
};
