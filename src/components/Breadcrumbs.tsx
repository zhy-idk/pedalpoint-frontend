import { Link, useLocation } from "react-router-dom";

interface BreadcrumbsProps {
  items?: Array<{
    label: string;
    path?: string;
  }>;
  category?: {
    name: string;
    slug: string;
  };
  productName?: string;
}

function Breadcrumbs({ items, category, productName }: BreadcrumbsProps) {
  const location = useLocation();
  
  // If no custom items provided, generate from current path
  const breadcrumbItems = items || (() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const result = [
      { label: 'Home', path: '/' }
    ];
    
    // If category is provided, use it for better breadcrumbs
    if (category) {
      result.push({
        label: category.name,
        path: `/category/${category.slug}`
      });
      
      // If we're on a product page, add the product name (non-clickable)
      if (pathSegments.length === 2 && pathSegments[0] !== 'category') {
        result.push({
          label: productName || 'Product',
          path: ""
        });
      }
    } else {
      // Fallback to path-based generation
      if (pathSegments.length > 0) {
        if (pathSegments[0] === 'category' && pathSegments[1]) {
          const categoryName = pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1);
          result.push({
            label: categoryName,
            path: ""
          });
        } else {
          pathSegments.forEach((segment, index) => {
            const label = segment.charAt(0).toUpperCase() + segment.slice(1);
            const path = '/' + pathSegments.slice(0, index + 1).join('/');
            result.push({ label, path });
          });
        }
      }
    }
    
    return result;
  })();

  return (
    <div className="breadcrumbs text-xs overflow-auto mb-2 scrollbar-hide">
      <ul>
        {breadcrumbItems.map((item, index) => (
          <li key={index}>
            {item.path ? (
              <Link to={item.path} className="link link-hover">
                {item.label}
              </Link>
            ) : (
              <span className="text-base-content/70">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Breadcrumbs;