import type { ProductState, ProductAction } from '../types/product';

export const initialState: ProductState = {
  product: null,
  loading: true,
  error: null,
  selectedVariant: null,
  quantity: 1,
  selectedStarFilter: null,
};

export function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PRODUCT':
      return { 
        ...state, 
        product: action.payload, 
        loading: false, 
        error: null,
        // Auto-select variant if there's only one, otherwise show "Select Variant"
        selectedVariant: action.payload.products && action.payload.products.length === 1 ? action.payload.products[0] : null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_VARIANT':
      return { ...state, selectedVariant: action.payload };
    case 'SET_QUANTITY':
      return { ...state, quantity: Math.max(1, action.payload) };
    case 'SET_STAR_FILTER':
      return { ...state, selectedStarFilter: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}