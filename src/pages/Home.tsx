import ItemCard from "../components/ItemCard";
import Hero from "../components/Hero";

function Home() {

  return (
    <>
      <Hero />
      <div className="flex flex-col m-1 p-1 rounded-lg">

        <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <ItemCard />
          <ItemCard />
          <ItemCard />
          <ItemCard />
          <ItemCard />
          <ItemCard />
        </div>
      </div>
    </>
  );
}

export default Home;
