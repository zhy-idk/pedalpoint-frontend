import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCategories } from "../hooks/useCategories";

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  is_component: boolean;
  component_type: string | null;
  subcategories: Category[];
}

function Menu() {
  const { categories } = useCategories();
  const [topLevelCategories, setTopLevelCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (categories) {
      // Filter to get only top-level categories (no parent)
      const topLevel = (categories as Category[]).filter(cat => !cat.parent);
      setTopLevelCategories(topLevel);
    }
  }, [categories]);

  const renderSubcategories = (category: Category) => {
    if (!category.subcategories || category.subcategories.length === 0) {
      return null;
    }

    return (
      <ul className="z-20 bg-base-200">
        {category.subcategories.map((subcat) => (
          <li key={subcat.id}>
            <Link to={`/${subcat.slug}`}>{subcat.name}</Link>
            {subcat.subcategories && subcat.subcategories.length > 0 && renderSubcategories(subcat)}
          </li>
        ))}
      </ul>
    );
  };

  // Check if category is "Components" - it should only be a dropdown parent
  const isComponentsCategory = (category: Category) => {
    return category.slug === 'components' || category.name.toLowerCase() === 'components';
  };

  // Separate main categories
  const bikesCategory = topLevelCategories.find(cat => cat.slug === 'bikes' || cat.name.toLowerCase() === 'bikes');
  const componentsCategory = topLevelCategories.find(cat => isComponentsCategory(cat));
  const componentSubcategories = componentsCategory?.subcategories || [];
  
  // Other categories = everything except Bikes and Components
  const otherCategories = topLevelCategories.filter(cat => 
    cat.slug !== 'bikes' && 
    cat.name.toLowerCase() !== 'bikes' &&
    !isComponentsCategory(cat)
  );

  return (
    <>
      <li><Link to="/">Home</Link></li>
      
      {/* Bikes - direct link */}
      {bikesCategory ? (
        <li><Link to={`/${bikesCategory.slug}`}>Bikes</Link></li>
      ) : (
        <li><Link to="/bikes">Bikes</Link></li>
      )}
      
      {/* Components - dropdown with subcategories */}
      <li>
        <details>
          <summary>Components</summary>
          <ul className="z-10">
            {componentSubcategories.length > 0 ? (
              componentSubcategories.map((subcat) => (
                <li key={subcat.id}>
                  <Link to={`/${subcat.slug}`}>{subcat.name}</Link>
                </li>
              ))
            ) : (
              <>
                {/* Fallback when API hasn't loaded */}
                <li><Link to="/frames">Frames</Link></li>
                <li><Link to="/wheels">Wheels</Link></li>
                <li><Link to="/drivetrain">Drivetrain</Link></li>
                <li><Link to="/brakes">Brakes</Link></li>
                <li><Link to="/handlebars">Handlebars</Link></li>
                <li><Link to="/saddles">Saddles</Link></li>
              </>
            )}
          </ul>
        </details>
      </li>
      
      {/* Other Categories - Miscellaneous and any new categories */}
      {otherCategories.length > 0 && (
        <li>
          <details>
            <summary>Other Categories</summary>
            <ul className="z-10">
              {otherCategories.map((category) => (
                <li key={category.id}>
                  <Link to={`/${category.slug}`}>{category.name}</Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
      )}
      
      <li>
        <details>
          <summary>Services</summary>
          <ul className="z-10">
            <li><Link to="/repair">Schedule Repair</Link></li>
            <li><Link to="/builder">Build a Bike</Link></li>
          </ul>
        </details>
      </li>
      <li><Link to="/about">About</Link></li>
      <li><Link to="/contact">Contact</Link></li>
    </>
  );
}
export default Menu;