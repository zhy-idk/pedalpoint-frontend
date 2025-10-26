import { useCart } from '../providers/CartProvider';
import type { BikeConfiguration, BikeComponent } from '../types/product';
import type { BikeBuilderItem } from '../types/cart';

export const useBikeBuilder = () => {
  const { actions } = useCart();

  const addBikeToCart = (configuration: BikeConfiguration) => {
    // Convert bike configuration to cart items
    const bikeItems: BikeBuilderItem[] = [];
    
    // Add each selected component
    Object.entries(configuration).forEach(([key, value]) => {
      if (key === 'selectedVariants') return;
      
      const component = value as BikeComponent | null;
      if (component) {
        const selectedVariant = configuration.selectedVariants[component.category];
        
        if (selectedVariant) {
          bikeItems.push({
            id: `${component.category}-${component.id}`,
            component_type: component.category,
            product_id: component.id,
            name: component.name,
            price: component.price,
            image: component.image,
            category: component.category,
            brand: component.brand,
            variant: {
              id: selectedVariant.id,
              variant_attribute: selectedVariant.variant_attribute,
              sku: selectedVariant.sku,
              price: selectedVariant.price,
              stock: selectedVariant.stock,
            },
          });
        }
      }
    });

    // Add all bike components to cart
    if (bikeItems.length > 0) {
      actions.addBikeBuilder(bikeItems);
      return true;
    }
    
    return false;
  };

  const removeBikeFromCart = () => {
    actions.removeBikeBuilder('bike-builder');
  };

  return {
    addBikeToCart,
    removeBikeFromCart,
  };
};

