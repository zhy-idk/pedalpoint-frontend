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

  return (
    <>
      <li><Link to="/">Home</Link></li>
      <li>
        <details>
          <summary>Categories</summary>
          <ul className="z-10">
            {topLevelCategories.length > 0 ? (
              topLevelCategories.map((category) => (
                <li key={category.id}>
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <details>
                      <summary>
                        <Link to={`/${category.slug}`} onClick={(e) => e.stopPropagation()}>
                          {category.name}
                        </Link>
                      </summary>
                      {renderSubcategories(category)}
                    </details>
                  ) : (
                    <Link to={`/${category.slug}`}>{category.name}</Link>
                  )}
                </li>
              ))
            ) : (
              <>
                <li><Link to="/bikes">Bikes</Link></li>
                <li>
                  <details>
                    <summary>Components</summary>
                    <ul className="z-20 bg-base-200">
                      <li><Link to="/frames">Frames</Link></li>
                      <li><Link to="/wheels">Wheels</Link></li>
                      <li><Link to="/drivetrain">Drivetrain</Link></li>
                      <li><Link to="/brakes">Brakes</Link></li>
                      <li><Link to="/handlebars">Handlebars</Link></li>
                      <li><Link to="/saddles">Saddles</Link></li>
                      <li><Link to="/pedals">Pedals</Link></li>
                      <li><Link to="/accessories">Accessories</Link></li>
                    </ul>
                  </details>
                </li>
                <li><Link to="/miscellaneous">Miscellaneous</Link></li>
              </>
            )}
          </ul>
        </details>
      </li>
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