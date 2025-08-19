import ItemCard from "../components/ItemCard";
import Hero from "../components/Hero";
import { useProducts } from "../hooks/useProduct";
import ItemCardSkeleton from "../components/ItemCardSkeleton";

function Home() {
  const { data: products } = useProducts();
  return (
    <>
      <Hero />
      <div className="m-1 flex flex-col rounded-lg p-1">
        <div className="xs:grid-cols-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {products?.map((product, index) => (
            <ItemCard key={product.id || index} product={product} />
          ))}
          <ItemCardSkeleton />
        </div>
      </div>
    </>
  );
}

export default Home;
