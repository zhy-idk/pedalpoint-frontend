import { useState } from 'react';
import { 
  Bike, 
  Settings, 
  Palette, 
  DollarSign, 
  ShoppingCart,
  RotateCcw,
  CheckCircle,
  Star,
  Search,
  Filter
} from 'lucide-react';
import { useBikeBuilder } from '../hooks/useBikeBuilder';
import { useNavigate } from 'react-router-dom';

interface BikeComponent {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  brand: string;
  description: string;
  variants: ProductVariant[];
}

interface ProductVariant {
  id: number;
  name: string;
  variant_attribute: string;
  brand: number;
  sku: string;
  price: string;
  stock: number;
  product_images: {
    image: string;
    alt_text: string;
  }[];
  available: boolean;
}

interface BikeConfiguration {
  frame: BikeComponent | null;
  wheels: BikeComponent | null;
  drivetrain: BikeComponent | null;
  brakes: BikeComponent | null;
  handlebars: BikeComponent | null;
  saddle: BikeComponent | null;
  selectedVariants: {
    [key: string]: ProductVariant | null;
  };
}

const mockComponents: BikeComponent[] = [
  // Frames
  { 
    id: 'frame-1', 
    name: 'Aluminum Road Frame', 
    price: 299.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'frame', 
    rating: 4.5,
    brand: 'Brand A',
    description: 'Lightweight aluminum frame for road cycling',
    variants: [
      { id: 1, name: 'Aluminum Road Frame', variant_attribute: 'Black', brand: 1, sku: 'ALUM-BLK', price: '299.99', stock: 5, product_images: [], available: true },
      { id: 2, name: 'Aluminum Road Frame', variant_attribute: 'Red', brand: 1, sku: 'ALUM-RED', price: '299.99', stock: 3, product_images: [], available: true }
    ]
  },
  { 
    id: 'frame-2', 
    name: 'Carbon Fiber Frame', 
    price: 899.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'frame', 
    rating: 4.8,
    brand: 'Brand A',
    description: 'High-performance carbon fiber frame',
    variants: [
      { id: 3, name: 'Carbon Fiber Frame', variant_attribute: 'Black', brand: 1, sku: 'CARB-BLK', price: '899.99', stock: 2, product_images: [], available: true },
      { id: 4, name: 'Carbon Fiber Frame', variant_attribute: 'Blue', brand: 1, sku: 'CARB-BLU', price: '899.99', stock: 1, product_images: [], available: true }
    ]
  },
  { 
    id: 'frame-3', 
    name: 'Steel Touring Frame', 
    price: 199.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'frame', 
    rating: 4.2,
    brand: 'Brand A',
    description: 'Durable steel frame for touring',
    variants: [
      { id: 5, name: 'Steel Touring Frame', variant_attribute: 'Silver', brand: 1, sku: 'STEEL-SLV', price: '199.99', stock: 4, product_images: [], available: true }
    ]
  },
  
  // Wheels
  { 
    id: 'wheels-1', 
    name: 'Alloy Road Wheels', 
    price: 199.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'wheels', 
    rating: 4.3,
    brand: 'Brand A',
    description: 'Lightweight alloy wheels for road bikes',
    variants: [
      { id: 6, name: 'Alloy Road Wheels', variant_attribute: 'Black', brand: 1, sku: 'WHEEL-BLK', price: '199.99', stock: 6, product_images: [], available: true }
    ]
  },
  { 
    id: 'wheels-2', 
    name: 'Carbon Aero Wheels', 
    price: 599.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'wheels', 
    rating: 4.7,
    brand: 'Brand A',
    description: 'Aerodynamic carbon wheels for racing',
    variants: [
      { id: 7, name: 'Carbon Aero Wheels', variant_attribute: 'Black', brand: 1, sku: 'AERO-BLK', price: '599.99', stock: 2, product_images: [], available: true },
      { id: 8, name: 'Carbon Aero Wheels', variant_attribute: 'Red', brand: 1, sku: 'AERO-RED', price: '599.99', stock: 1, product_images: [], available: true }
    ]
  },
  { 
    id: 'wheels-3', 
    name: 'Gravel Wheels', 
    price: 299.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'wheels', 
    rating: 4.4,
    brand: 'Brand A',
    description: 'Versatile wheels for gravel riding',
    variants: [
      { id: 9, name: 'Gravel Wheels', variant_attribute: 'Gray', brand: 1, sku: 'GRAVEL-GRY', price: '299.99', stock: 4, product_images: [], available: true }
    ]
  },
  
  // Drivetrain
  { 
    id: 'drivetrain-1', 
    name: 'Shimano 105 Groupset', 
    price: 399.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'drivetrain', 
    rating: 4.6,
    brand: 'Shimano',
    description: 'Reliable 11-speed groupset',
    variants: [
      { id: 10, name: 'Shimano 105 Groupset', variant_attribute: 'Black', brand: 1, sku: 'SHIM-105', price: '399.99', stock: 3, product_images: [], available: true }
    ]
  },
  { 
    id: 'drivetrain-2', 
    name: 'SRAM Rival Groupset', 
    price: 449.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'drivetrain', 
    rating: 4.5,
    brand: 'SRAM',
    description: 'Smooth shifting electronic groupset',
    variants: [
      { id: 11, name: 'SRAM Rival Groupset', variant_attribute: 'Black', brand: 1, sku: 'SRAM-RIV', price: '449.99', stock: 2, product_images: [], available: true }
    ]
  },
  { 
    id: 'drivetrain-3', 
    name: 'Campagnolo Chorus', 
    price: 899.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'drivetrain', 
    rating: 4.8,
    brand: 'Campagnolo',
    description: 'Premium Italian groupset',
    variants: [
      { id: 12, name: 'Campagnolo Chorus', variant_attribute: 'Silver', brand: 1, sku: 'CAMP-CHO', price: '899.99', stock: 1, product_images: [], available: true }
    ]
  },
  
  // Brakes
  { 
    id: 'brakes-1', 
    name: 'Rim Brakes', 
    price: 89.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'brakes', 
    rating: 4.1,
    brand: 'Brand A',
    description: 'Traditional rim brake system',
    variants: [
      { id: 13, name: 'Rim Brakes', variant_attribute: 'Black', brand: 1, sku: 'RIM-BLK', price: '89.99', stock: 8, product_images: [], available: true }
    ]
  },
  { 
    id: 'brakes-2', 
    name: 'Disc Brakes', 
    price: 199.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'brakes', 
    rating: 4.6,
    brand: 'Brand A',
    description: 'Powerful disc brake system',
    variants: [
      { id: 14, name: 'Disc Brakes', variant_attribute: 'Black', brand: 1, sku: 'DISC-BLK', price: '199.99', stock: 4, product_images: [], available: true },
      { id: 15, name: 'Disc Brakes', variant_attribute: 'Red', brand: 1, sku: 'DISC-RED', price: '199.99', stock: 2, product_images: [], available: true }
    ]
  },
  { 
    id: 'brakes-3', 
    name: 'Hydraulic Disc', 
    price: 299.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'brakes', 
    rating: 4.7,
    brand: 'Brand A',
    description: 'Advanced hydraulic disc brakes',
    variants: [
      { id: 16, name: 'Hydraulic Disc', variant_attribute: 'Black', brand: 1, sku: 'HYD-BLK', price: '299.99', stock: 3, product_images: [], available: true }
    ]
  },
  
  // Handlebars
  { 
    id: 'handlebars-1', 
    name: 'Drop Bars', 
    price: 49.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'handlebars', 
    rating: 4.3,
    brand: 'Brand A',
    description: 'Classic drop handlebars for road bikes',
    variants: [
      { id: 17, name: 'Drop Bars', variant_attribute: 'Black', brand: 1, sku: 'DROP-BLK', price: '49.99', stock: 10, product_images: [], available: true }
    ]
  },
  { 
    id: 'handlebars-2', 
    name: 'Flat Bars', 
    price: 39.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'handlebars', 
    rating: 4.2,
    brand: 'Brand A',
    description: 'Comfortable flat handlebars',
    variants: [
      { id: 18, name: 'Flat Bars', variant_attribute: 'Black', brand: 1, sku: 'FLAT-BLK', price: '39.99', stock: 12, product_images: [], available: true }
    ]
  },
  { 
    id: 'handlebars-3', 
    name: 'Aero Bars', 
    price: 129.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'handlebars', 
    rating: 4.4,
    brand: 'Brand A',
    description: 'Aerodynamic time trial bars',
    variants: [
      { id: 19, name: 'Aero Bars', variant_attribute: 'Black', brand: 1, sku: 'AERO-BLK', price: '129.99', stock: 2, product_images: [], available: true }
    ]
  },
  
  // Saddles
  { 
    id: 'saddle-1', 
    name: 'Comfort Saddle', 
    price: 79.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'saddle', 
    rating: 4.4,
    brand: 'Brand A',
    description: 'Comfortable saddle for long rides',
    variants: [
      { id: 20, name: 'Comfort Saddle', variant_attribute: 'Black', brand: 1, sku: 'COMF-BLK', price: '79.99', stock: 6, product_images: [], available: true },
      { id: 21, name: 'Comfort Saddle', variant_attribute: 'Brown', brand: 1, sku: 'COMF-BRN', price: '79.99', stock: 3, product_images: [], available: true }
    ]
  },
  { 
    id: 'saddle-2', 
    name: 'Racing Saddle', 
    price: 149.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'saddle', 
    rating: 4.6,
    brand: 'Brand A',
    description: 'Lightweight racing saddle',
    variants: [
      { id: 22, name: 'Racing Saddle', variant_attribute: 'Black', brand: 1, sku: 'RACE-BLK', price: '149.99', stock: 4, product_images: [], available: true }
    ]
  },
  { 
    id: 'saddle-3', 
    name: 'Gel Saddle', 
    price: 99.99, 
    image: '/src/assets/placeholder_img.jpg', 
    category: 'saddle', 
    rating: 4.3,
    brand: 'Brand A',
    description: 'Gel-filled comfort saddle',
    variants: [
      { id: 23, name: 'Gel Saddle', variant_attribute: 'Black', brand: 1, sku: 'GEL-BLK', price: '99.99', stock: 5, product_images: [], available: true }
    ]
  },
];

function Builder() {
  const [configuration, setConfiguration] = useState<BikeConfiguration>({
    frame: null,
    wheels: null,
    drivetrain: null,
    brakes: null,
    handlebars: null,
    saddle: null,
    selectedVariants: {}
  });

  const [selectedCategory, setSelectedCategory] = useState('frame');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { addBikeToCart } = useBikeBuilder();
  const navigate = useNavigate();

  const getTotalPrice = () => {
    let total = 0;
    
    // Add component prices
    Object.values(configuration).forEach(component => {
      if (component && typeof component === 'object' && 'price' in component) {
        total += (component as BikeComponent).price;
      }
    });

    return total;
  };

  const isConfigurationComplete = () => {
    return configuration.frame && configuration.wheels && configuration.drivetrain && 
           configuration.brakes && configuration.handlebars && configuration.saddle;
  };

  const handleComponentSelect = (component: BikeComponent) => {
    setConfiguration(prev => ({
      ...prev,
      [component.category]: component,
      selectedVariants: {
        ...prev.selectedVariants,
        [component.category]: component.variants[0] // Select first variant by default
      }
    }));
  };

  const handleVariantSelect = (category: string, variant: ProductVariant) => {
    setConfiguration(prev => ({
      ...prev,
      selectedVariants: {
        ...prev.selectedVariants,
        [category]: variant
      }
    }));
  };

  const resetConfiguration = () => {
    setConfiguration({
      frame: null,
      wheels: null,
      drivetrain: null,
      brakes: null,
      handlebars: null,
      saddle: null,
      selectedVariants: {}
    });
  };

  const getComponentsByCategory = (category: string) => {
    return mockComponents.filter(component => component.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frame': return '🚲';
      case 'wheels': return '⚫';
      case 'drivetrain': return '⚙️';
      case 'brakes': return '🛑';
      case 'handlebars': return '🔄';
      case 'saddle': return '🪑';
      default: return '🔧';
    }
  };

  const filteredComponents = getComponentsByCategory(selectedCategory).filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = component.price >= priceRange[0] && component.price <= priceRange[1];
    return matchesSearch && matchesPrice;
  });

  const handleAddToCart = async () => {
    if (!isConfigurationComplete()) return;

    setIsAddingToCart(true);
    
    try {
      const success = addBikeToCart(configuration);
      
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/cart');
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding bike to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-primary text-primary-content p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Bike className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Bike Builder</h1>
          </div>
          <p className="text-lg opacity-90">Customize your perfect ride with our interactive builder</p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Component Selection */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <Settings className="w-5 h-5" />
                  Components
                </h2>
                
                {/* Category Tabs */}
                <div className="tabs tabs-boxed mb-4">
                  {['frame', 'wheels', 'drivetrain', 'brakes', 'handlebars', 'saddle'].map((category) => (
                    <button
                      key={category}
                      className={`tab ${selectedCategory === category ? 'tab-active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <span className="mr-2">{getCategoryIcon(category)}</span>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Search and Filters */}
                <div className="space-y-3 mb-4">
                  <div className="join w-full">
                    <input
                      type="text"
                      placeholder="Search components..."
                      className="input input-bordered join-item flex-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn join-item">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Price Range:</span>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="range range-xs range-primary flex-1"
                    />
                    <span className="text-sm">${priceRange[1]}</span>
                  </div>
                </div>

                {/* Component List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredComponents.map((component) => (
                    <div
                      key={component.id}
                      className={`card bg-base-100 cursor-pointer transition-all hover:shadow-md ${
                        (configuration[component.category as keyof BikeConfiguration] as BikeComponent | null)?.id === component.id
                          ? 'ring-2 ring-primary'
                          : ''
                      }`}
                      onClick={() => handleComponentSelect(component)}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={component.image}
                            alt={component.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{component.name}</h3>
                            <p className="text-xs text-base-content/70 mb-1">{component.brand}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current text-yellow-400" />
                                <span className="text-xs">{component.rating}</span>
                              </div>
                              <span className="text-primary font-bold">${component.price}</span>
                            </div>
                            {component.variants.length > 1 && (
                              <p className="text-xs text-info mt-1">
                                {component.variants.length} variants available
                              </p>
                            )}
                          </div>
                          {(configuration[component.category as keyof BikeConfiguration] as BikeComponent | null)?.id === component.id && (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredComponents.length === 0 && (
                    <div className="text-center py-8 text-base-content/50">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No components found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Variant Selection */}
            {configuration[selectedCategory as keyof BikeConfiguration] && (
              <div className="card bg-base-200 shadow-xl mt-6">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">
                    <Palette className="w-5 h-5" />
                    Variants
                  </h3>
                  <div className="space-y-2">
                    {(configuration[selectedCategory as keyof BikeConfiguration] as BikeComponent)?.variants.map((variant) => (
                      <button
                        key={variant.id}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          configuration.selectedVariants[selectedCategory]?.id === variant.id
                            ? 'border-primary bg-primary/10'
                            : 'border-base-300 hover:border-primary/50'
                        }`}
                        onClick={() => handleVariantSelect(selectedCategory, variant)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{variant.variant_attribute}</span>
                          <span className="text-sm text-base-content/70">SKU: {variant.sku}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-base-content/60">Stock: {variant.stock}</span>
                          <span className="text-xs text-success">${variant.price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Panel - Configuration Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 shadow-xl h-fit">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <Bike className="w-5 h-5" />
                  Configuration
                </h2>
                
                {/* Configuration Summary */}
                <div className="space-y-2 mt-4">
                  {Object.entries(configuration).map(([key, value]) => {
                    if (key === 'selectedVariants') return null;
                    const component = value as BikeComponent | null;
                    const selectedVariant = component ? configuration.selectedVariants[component.category] : null;
                    
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize font-medium">{key}:</span>
                          <span className={component ? 'text-success' : 'text-error'}>
                            {component ? component.name : 'Not selected'}
                          </span>
                        </div>
                        {component && selectedVariant && (
                          <div className="flex justify-between text-xs text-base-content/70 ml-4">
                            <span>Variant:</span>
                            <span>{selectedVariant.variant_attribute}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Pricing & Actions */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 shadow-xl h-fit">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <DollarSign className="w-5 h-5" />
                  Summary
                </h2>
                
                {/* Total Price */}
                <div className="bg-primary text-primary-content p-4 rounded-lg mb-4">
                  <div className="text-center">
                    <p className="text-sm opacity-90">Total Price</p>
                    <p className="text-3xl font-bold">${getTotalPrice().toFixed(2)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    className={`btn btn-primary btn-block ${showSuccess ? 'btn-success' : ''}`}
                    disabled={!isConfigurationComplete() || isAddingToCart}
                    onClick={handleAddToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="loading loading-spinner loading-sm"></div>
                        Adding to Cart...
                      </>
                    ) : showSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  
                  <button
                    className="btn btn-outline btn-block"
                    onClick={resetConfiguration}
                    disabled={isAddingToCart}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Builder
                  </button>
                </div>

                {/* Success Message */}
                {showSuccess && (
                  <div className="alert alert-success mt-4">
                    <CheckCircle className="w-4 h-4" />
                    <span>Your custom bike has been added to cart! Redirecting...</span>
                  </div>
                )}

                {/* Progress Indicator */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Configuration Progress</span>
                    <span>{Object.values(configuration).filter(v => v && typeof v === 'object' && 'price' in v).length}/6</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={Object.values(configuration).filter(v => v && typeof v === 'object' && 'price' in v).length * 16.67} 
                    max="100"
                  />
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-info/10 rounded-lg">
                  <h4 className="font-semibold text-info mb-2">💡 Pro Tips</h4>
                  <ul className="text-sm space-y-1 text-info/80">
                    <li>• Start with the frame - it's the foundation</li>
                    <li>• Match wheel type to your riding style</li>
                    <li>• Consider brake type for your terrain</li>
                    <li>• Choose variants that match your style</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Builder;
