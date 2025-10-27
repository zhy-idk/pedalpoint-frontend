import { useState, useEffect, useMemo } from 'react';
import { 
  Bike, 
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  CheckCircle,
  Info,
  RotateCcw,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCompatibility } from '../hooks/useCompatibility';
import { useBikeBuilderProducts } from '../hooks/useBikeBuilderProducts';
import { useCart } from '../providers/CartProvider';
import type { Product, CompatibilityAttributeValue } from '../types/product';

// Step configuration for the wizard
const BUILDER_STEPS = [
  {
    id: 'intro',
    title: 'Welcome',
    description: 'Let\'s build your perfect bike!',
  },
  {
    id: 'usage',
    title: 'How will you use your bike?',
    description: 'This helps us recommend the right components',
  },
  {
    id: 'budget',
    title: 'What\'s your budget?',
    description: 'We\'ll recommend components in your price range',
  },
  {
    id: 'recommendations',
    title: 'Your Recommended Build',
    description: 'Based on your preferences, here\'s what we suggest',
  },
  {
    id: 'frame',
    title: 'Choose Your Frame',
    description: 'The foundation of your bike',
    category: 'frame',
  },
  {
    id: 'wheels',
    title: 'Choose Your Wheels',
    description: 'Keep rolling smoothly',
    category: 'wheels', 
  },
  {
    id: 'drivetrain',
    title: 'Choose Your Drivetrain',
    description: 'Gears and shifting system',
    category: 'drivetrain', 
  },
  {
    id: 'brakes',
    title: 'Choose Your Brakes',
    description: 'Stop safely and reliably',
    category: 'brakes',
  },
  {
    id: 'handlebars',
    title: 'Choose Your Handlebars',
    description: 'Control and comfort',
    category: 'handlebars',
  },
  {
    id: 'saddle',
    title: 'Choose Your Saddle',
    description: 'Ride in comfort',
    category: 'saddle',
  },
  {
    id: 'review',
    title: 'Review Your Build',
    description: 'Check everything before adding to cart',
  },
];

// Bike usage types with simple explanations
const BIKE_USAGE_OPTIONS = [
  {
    id: 'city',
    title: 'City Commuting',
    description: 'Daily rides to work or school, mostly on roads',
    icon: '🏙️',
  },
  {
    id: 'trail',
    title: 'Trail Riding',
    description: 'Off-road adventures on dirt trails',
    icon: '🏔️',
  },
  {
    id: 'casual',
    title: 'Casual Recreation',
    description: 'Easy rides around the neighborhood',
    icon: '🚴',
  },
];

// Budget options
const BUDGET_OPTIONS = [
  {
    id: 'budget',
    title: 'Budget',
    description: '₱15,000 - ₱24,000 - Great starter options',
    icon: '💵',
    range: '₱15,000 - ₱24,000',
  },
  {
    id: 'mid',
    title: 'Mid-Range',
    description: '₱25,000 - ₱75,000 - Best value for quality',
    icon: '💰',
    range: '₱25,000 - ₱75,000',
  },
  {
    id: 'premium',
    title: 'Premium',
    description: '₱75,000+ - Top performance gear',
    icon: '💎',
    range: '₱75,000+',
  },
];

interface BikeConfiguration {
  usage: string | null;
  budget: string | null;
  frame: Product | null;
  wheels: Product | null;
  drivetrain: Product | null;
  brakes: Product | null;
  handlebars: Product | null;
  saddle: Product | null;
  selectedVariants: {
    [key: string]: Product['products'][0] | null;
  };
}

function Builder() {
  const navigate = useNavigate();
  const { actions } = useCart();
  const { values: compatibilityValues, loading: compatibilityLoading } = useCompatibility();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [configuration, setConfiguration] = useState<BikeConfiguration>({
    usage: null,
    budget: null,
    frame: null,
    wheels: null,
    drivetrain: null,
    brakes: null,
    handlebars: null,
    saddle: null,
    selectedVariants: {},
  });
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const currentStep = BUILDER_STEPS[currentStepIndex];

  // Get currently selected compatibility attributes from all selected products
  const selectedCompatibilityIds = useMemo(() => {
    const ids: number[] = [];
    
    // Collect all compatibility_attributes from selected products
    Object.values(configuration).forEach((value) => {
      if (value && typeof value === 'object' && 'compatibility_attributes' in value) {
        const product = value as Product;
        product.compatibility_attributes?.forEach(attr => {
          if (!ids.includes(attr.id)) {
            ids.push(attr.id);
          }
        });
      }
    });
    
    return ids;
  }, [configuration]);

  // Fetch products for current category with compatibility filtering
  const { 
    products: availableProducts, 
    loading: productsLoading,
    refresh: refreshProducts 
  } = useBikeBuilderProducts({
    builderCategory: currentStep.category,
    compatibilityIds: selectedCompatibilityIds.length > 0 ? selectedCompatibilityIds : undefined,
    autoFetch: !!currentStep.category,
  });

  const getTotalPrice = () => {
    let total = 0;
    Object.entries(configuration).forEach(([key, value]) => {
      if (key !== 'usage' && key !== 'selectedVariants' && value) {
        total += Number((value as Product).price) || 0;
      }
    });
    return total;
  };

  const handleNext = async () => {
    // If moving from budget step to recommendations, apply recommendations
    if (currentStep.id === 'budget' && configuration.usage && configuration.budget) {
      setCurrentStepIndex(currentStepIndex + 1);
      // Apply recommendations after moving to the next step
      setTimeout(() => applyRecommendations(), 100);
    } else if (currentStepIndex < BUILDER_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleUsageSelect = (usageId: string) => {
    setConfiguration(prev => ({ ...prev, usage: usageId }));
  };

  const handleBudgetSelect = (budgetId: string) => {
    setConfiguration(prev => ({ ...prev, budget: budgetId }));
  };

  // Auto-select recommended products based on usage and budget
  const applyRecommendations = async () => {
    if (!configuration.usage || !configuration.budget) return;

    setIsLoadingRecommendations(true);
    
    try {
      // Build components sequentially to ensure compatibility
      const categories = ['frame', 'wheels', 'drivetrain', 'brakes', 'handlebars', 'saddle'];
      const newConfig = { ...configuration };
      
      for (const category of categories) {
        // Collect compatibility IDs from already selected components
        const selectedCompatibilityIds: number[] = [];
        Object.values(newConfig).forEach((value) => {
          if (value && typeof value === 'object' && 'compatibility_attributes' in value) {
            const product = value as Product;
            product.compatibility_attributes?.forEach(attr => {
              if (!selectedCompatibilityIds.includes(attr.id)) {
                selectedCompatibilityIds.push(attr.id);
              }
            });
          }
        });

        // Build query with compatibility filtering
        const params = new URLSearchParams();
        params.append('builder_category', category);
        if (selectedCompatibilityIds.length > 0) {
          params.append('compatibility_ids', selectedCompatibilityIds.join(','));
        }

        const response = await api.get<Product[]>(`/api/bike-builder/products/?${params.toString()}`);
        const products = response.data;
        
        console.log(`Category: ${category}, Total products fetched: ${products.length}`);
        console.log(`Looking for usage: ${configuration.usage}, budget: ${configuration.budget}`);
        
        // Filter by usage and budget from compatibility attributes
        const matchingProducts = products.filter(product => {
          const hasUsageMatch = product.compatibility_attributes?.some(
            attr => attr.value === configuration.usage
          );
          const hasBudgetMatch = product.compatibility_attributes?.some(
            attr => attr.value === configuration.budget
          );
          
          console.log(`Product: ${product.name}`);
          console.log(`  Compatibility values:`, product.compatibility_attributes?.map(a => a.value));
          console.log(`  Usage match: ${hasUsageMatch}, Budget match: ${hasBudgetMatch}`);
          
          // Prefer products that match both, but fallback to budget match only
          return (hasUsageMatch && hasBudgetMatch) || (!hasUsageMatch && hasBudgetMatch);
        });
        
        console.log(`Matching products for ${category}: ${matchingProducts.length}`);

        // Select the highest priority product
        if (matchingProducts.length > 0) {
          const sortedProducts = matchingProducts.sort((a, b) => 
            (b.builder_priority || 0) - (a.builder_priority || 0)
          );
          const selectedProduct = sortedProducts[0];
          
          newConfig[category as keyof BikeConfiguration] = selectedProduct as any;
          newConfig.selectedVariants[category] = selectedProduct.products?.[0] || null;
        }
      }
      
      setConfiguration(newConfig);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    if (!currentStep.category) return;

    setConfiguration(prev => ({
      ...prev,
      [currentStep.category!]: product,
      selectedVariants: {
        ...prev.selectedVariants,
        [currentStep.category!]: product.products?.[0] || null,
      },
    }));
  };

  const handleVariantSelect = (category: string, variant: Product['products'][0]) => {
    setConfiguration(prev => ({
      ...prev,
      selectedVariants: {
        ...prev.selectedVariants,
        [category]: variant,
      },
    }));
  };

  const resetConfiguration = () => {
    setConfiguration({
      usage: null,
      budget: null,
      frame: null,
      wheels: null,
      drivetrain: null,
      brakes: null,
      handlebars: null,
      saddle: null,
      selectedVariants: {},
    });
    setCurrentStepIndex(0);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      // Add each selected component to cart
      const components = [
        configuration.frame,
        configuration.wheels,
        configuration.drivetrain,
        configuration.brakes,
        configuration.handlebars,
        configuration.saddle,
      ].filter(Boolean) as Product[];

      let addedCount = 0;
      for (const component of components) {
        const variant = configuration.selectedVariants[component.builder_category!];
        if (variant) {
          await actions.addItem(variant.id, 1);
          addedCount += 1;
        }
      }

      if (addedCount > 0) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/cart');
        }, 1500);
      }
    } catch (error) {
      console.error('Error adding bike to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const canProceed = () => {
    if (currentStep.id === 'intro') return true;
    if (currentStep.id === 'usage') return configuration.usage !== null;
    if (currentStep.id === 'budget') return configuration.budget !== null;
    if (currentStep.id === 'recommendations') return true;
    if (currentStep.id === 'review') return true;
    if (currentStep.category) {
      return configuration[currentStep.category as keyof BikeConfiguration] !== null;
    }
    return false;
  };

  const isConfigurationComplete = () => {
    return (
      configuration.frame &&
      configuration.wheels &&
      configuration.drivetrain &&
      configuration.brakes &&
      configuration.handlebars &&
      configuration.saddle
    );
  };

  // Render different content based on current step
  const renderStepContent = () => {
    // Intro step
    if (currentStep.id === 'intro') {
  return (
        <div className="text-center py-12">
          <div className="text-8xl mb-6">🚴</div>
          <h2 className="text-4xl font-bold mb-4">Build Your Dream Bike</h2>
          <p className="text-xl text-base-content/70 mb-8 max-w-2xl mx-auto">
            Our wizard will guide you through selecting compatible components to build the perfect bike for your needs.
            Don't worry if you're not familiar with bike parts - we'll explain everything!
          </p>
          <div className="bg-info/10 p-6 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-start gap-3 text-left">
              <Info className="w-6 h-6 text-info flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-info mb-2">How it works:</h3>
                <ul className="space-y-2 text-sm text-info/80">
                  <li>• We'll ask you a few simple questions</li>
                  <li>• Choose components one at a time</li>
                  <li>• We automatically filter compatible parts</li>
                  <li>• Review and add everything to your cart</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Usage selection step
    if (currentStep.id === 'usage') {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">How will you use your bike?</h2>
            <p className="text-base-content/70">
              This helps us recommend the right type of components for your riding style
            </p>
      </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BIKE_USAGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleUsageSelect(option.id)}
                className={`card bg-base-200 hover:shadow-lg transition-all cursor-pointer ${
                  configuration.usage === option.id ? 'ring-2 ring-primary' : ''
                }`}
              >
              <div className="card-body">
                  <div className="text-6xl mb-4">{option.icon}</div>
                  <h3 className="card-title">{option.title}</h3>
                  <p className="text-base-content/70">{option.description}</p>
                  {configuration.usage === option.id && (
                    <div className="flex items-center gap-2 text-success mt-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Selected</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Budget selection step
    if (currentStep.id === 'budget') {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">What's your budget?</h2>
            <p className="text-base-content/70">
              We'll recommend components that match your budget range
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BUDGET_OPTIONS.map((option) => (
                    <button
                key={option.id}
                onClick={() => handleBudgetSelect(option.id)}
                className={`card bg-base-200 hover:shadow-lg transition-all cursor-pointer ${
                  configuration.budget === option.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="card-body">
                  <div className="text-6xl mb-4">{option.icon}</div>
                  <h3 className="card-title">{option.title}</h3>
                  <p className="text-sm font-semibold text-primary mb-2">{option.range}</p>
                  <p className="text-base-content/70">{option.description}</p>
                  {configuration.budget === option.id && (
                    <div className="flex items-center gap-2 text-success mt-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Selected</span>
                    </div>
                  )}
                </div>
                    </button>
                  ))}
                </div>
        </div>
      );
    }

    // Recommendations step
    if (currentStep.id === 'recommendations') {
      const selectedUsage = BIKE_USAGE_OPTIONS.find(o => o.id === configuration.usage);
      const selectedBudget = BUDGET_OPTIONS.find(o => o.id === configuration.budget);
      
      return (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Your Recommended Build</h2>
            <p className="text-base-content/70 mb-4">
              Based on your {selectedUsage?.title} needs and {selectedBudget?.title} budget, 
              we've pre-selected these components. You can customize them in the next steps!
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <div className="badge badge-lg badge-primary">{selectedUsage?.icon} {selectedUsage?.title}</div>
              <div className="badge badge-lg badge-secondary">{selectedBudget?.icon} {selectedBudget?.title}</div>
            </div>
          </div>

          {isLoadingRecommendations ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="loading loading-spinner loading-lg mb-4"></div>
              <p className="text-lg">Finding the perfect components for you...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show preview of recommended items */}
              {['frame', 'wheels', 'drivetrain', 'brakes', 'handlebars', 'saddle'].map((category) => {
                const product = configuration[category as keyof BikeConfiguration] as Product | null;
                const variant = product ? configuration.selectedVariants[category] : null;

                return (
                  <div key={category} className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-base-300 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product?.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">{category === 'frame' ? '🚲' : category === 'wheels' ? '⚫' : category === 'drivetrain' ? '⚙️' : category === 'brakes' ? '🛑' : category === 'handlebars' ? '🔄' : '🪑'}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-base-content/70 uppercase font-semibold mb-1">{category}</div>
                          {product ? (
                            <>
                              <h4 className="font-semibold text-lg">{product.name}</h4>
                              <p className="text-sm text-base-content/70">{product.brand?.name}</p>
                              {variant && (
                                <p className="text-xs text-info mt-1">Variant: {variant.variant_attribute}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-base-content/50">No recommendation found</p>
                          )}
                        </div>
                        <div className="text-right">
                          {product && (
                            <p className="text-xl font-bold text-primary">
                              ₱{Number(product.price).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="card bg-primary text-primary-content mt-6">
                <div className="card-body">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">Estimated Total</h3>
                      <p className="opacity-90">You can customize any component in the next steps</p>
                    </div>
                    <div className="text-3xl font-bold">
                      ₱{getTotalPrice().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <Info className="w-5 h-5" />
                <div>
                  <p className="font-semibold">These are just recommendations!</p>
                  <p className="text-sm">In the next steps, you can change any component to customize your perfect bike.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Component selection step
    if (currentStep.category) {
      const selectedProduct = configuration[currentStep.category as keyof BikeConfiguration] as Product | null;
      const selectedVariant = selectedProduct ? configuration.selectedVariants[currentStep.category] : null;

      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{currentStep.title}</h2>
              <p className="text-base-content/70">{currentStep.description}</p>
                </div>

            {productsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">No compatible products found</h3>
                <p className="text-base-content/70">
                  There are no products in this category that are compatible with your current selections.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`card bg-base-200 cursor-pointer transition-all hover:shadow-lg ${
                      selectedProduct?.id === product.id ? 'ring-2 ring-primary' : ''
                    }`}
                    >
                      <div className="card-body p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-base-300 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-base-content/50 text-xs">No Image</span>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                              <p className="text-sm text-base-content/70 mb-2">
                                {product.brand?.name || 'Unknown Brand'}
                              </p>
                            </div>
                            {selectedProduct?.id === product.id && (
                              <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                            )}
                          </div>

                          {/* Price and Stock */}
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-2xl font-bold text-primary">
                              ₱{Number(product.price).toFixed(2)}
                            </span>
                            {product.products && product.products.length > 1 && (
                              <span className="text-sm text-info">
                                {product.products.length} variants available
                              </span>
                            )}
                          </div>

                          {/* Description preview */}
                          {product.description && (
                            <p className="text-sm text-base-content/60 line-clamp-2">
                              {product.description.replace(/<[^>]*>/g, '')}
                            </p>
                          )}

                          {/* Compatibility badges */}
                          {product.compatibility_attributes && product.compatibility_attributes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.compatibility_attributes.slice(0, 3).map((attr) => (
                                <span key={attr.id} className="badge badge-sm badge-outline">
                                  {attr.display_name}
                                </span>
                              ))}
                              {product.compatibility_attributes.length > 3 && (
                                <span className="badge badge-sm badge-outline">
                                  +{product.compatibility_attributes.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
                  )}
                </div>

          {/* Variant Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 sticky top-6">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Selected Component</h3>

                {selectedProduct ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">{selectedProduct.name}</p>
                      <p className="text-sm text-base-content/70">{selectedProduct.brand?.name}</p>
            </div>

            {/* Variant Selection */}
                    {selectedProduct.products && selectedProduct.products.length > 0 && (
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Select Variant</span>
                        </label>
                  <div className="space-y-2">
                          {selectedProduct.products.map((variant) => (
                      <button
                        key={variant.id}
                              onClick={() => handleVariantSelect(currentStep.category!, variant)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                selectedVariant?.id === variant.id
                            ? 'border-primary bg-primary/10'
                            : 'border-base-300 hover:border-primary/50'
                        }`}
                      >
                              <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{variant.variant_attribute}</span>
                                {!variant.available && (
                                  <span className="badge badge-error badge-sm">Out of Stock</span>
                                )}
                        </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-base-content/60">Stock: {variant.stock}</span>
                                <span className="text-primary font-semibold">₱{Number(variant.price).toFixed(2)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                    )}

                    {/* Product Details */}
                    {selectedProduct.description && (
                      <div>
                        <p className="label-text font-medium mb-2">Description</p>
                        <div 
                          className="text-sm text-base-content/70 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-base-content/50">
                    <p>Select a {currentStep.category} from the list</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Review step
    if (currentStep.id === 'review') {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Review Your Build</h2>
            <p className="text-base-content/70">
              Make sure everything looks good before adding to your cart
            </p>
          </div>

          {/* Configuration Summary */}
          <div className="card bg-base-200 mb-6">
              <div className="card-body">
              <h3 className="card-title mb-4">Your Bike Components</h3>
              <div className="space-y-4">
                {[
                  { key: 'frame', label: 'Frame' },
                  { key: 'wheels', label: 'Wheels' },
                  { key: 'drivetrain', label: 'Drivetrain' },
                  { key: 'brakes', label: 'Brakes' },
                  { key: 'handlebars', label: 'Handlebars' },
                  { key: 'saddle', label: 'Saddle' },
                ].map(({ key, label }) => {
                  const product = configuration[key as keyof BikeConfiguration] as Product | null;
                  const variant = product ? configuration.selectedVariants[key] : null;
                    
                    return (
                    <div key={key} className="flex items-start gap-4 p-4 bg-base-100 rounded-lg">
                      <div className="w-16 h-16 bg-base-300 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product?.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-base-content/50">No Image</span>
                        )}
                        </div>
                      <div className="flex-1">
                        <p className="text-sm text-base-content/70 mb-1">{label}</p>
                        <p className="font-semibold">{product?.name || 'Not selected'}</p>
                        {variant && (
                          <p className="text-sm text-base-content/70">Variant: {variant.variant_attribute}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          ₱{product ? Number(product.price).toFixed(2) : '0.00'}
                        </p>
                      </div>
                      </div>
                    );
                  })}
                </div>

              {/* Total Price */}
              <div className="divider"></div>
              <div className="flex justify-between items-center text-2xl font-bold">
                <span>Total:</span>
                <span className="text-primary">₱{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card bg-base-200">
              <div className="card-body">
                  <button
                onClick={handleAddToCart}
                    disabled={!isConfigurationComplete() || isAddingToCart}
                className={`btn btn-primary btn-lg w-full ${showSuccess ? 'btn-success' : ''}`}
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="loading loading-spinner loading-sm"></div>
                        Adding to Cart...
                      </>
                    ) : showSuccess ? (
                      <>
                    <CheckCircle className="w-5 h-5" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                    <ShoppingCart className="w-5 h-5" />
                    Add All Components to Cart
                      </>
                    )}
                  </button>
                  
              {!isConfigurationComplete() && (
                <div className="alert alert-warning mt-4">
                  <Info className="w-5 h-5" />
                  <span>Please complete all component selections before adding to cart</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bike className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Bike Builder Wizard</h1>
            </div>
                  <button
                    onClick={resetConfiguration}
              className="btn btn-ghost btn-sm"
                    disabled={isAddingToCart}
                  >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
                  </button>
                </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-2">
            {BUILDER_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`h-2 rounded-full flex-1 transition-all ${
                    index <= currentStepIndex ? 'bg-primary-content' : 'bg-primary-content/30'
                  }`}
                  />
                </div>
            ))}
          </div>
          <p className="text-sm opacity-90">
            Step {currentStepIndex + 1} of {BUILDER_STEPS.length}
          </p>
                </div>
              </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="min-h-[60vh]">
          {renderStepContent()}
            </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isAddingToCart}
            className="btn btn-outline"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="text-center">
            <p className="text-sm text-base-content/70">
              {currentStepIndex + 1} / {BUILDER_STEPS.length}
            </p>
          </div>

          {currentStepIndex < BUILDER_STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed() || isAddingToCart}
              className="btn btn-primary"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <div className="w-24" /> // Spacer for layout balance
          )}
        </div>
      </div>
    </div>
  );
}

export default Builder;
