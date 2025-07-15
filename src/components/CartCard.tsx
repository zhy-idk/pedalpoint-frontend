import QuantityInput from "./QuantityInput"

function CartCard(){
  return(
    <div className="card card-side card-xs flex-row bg-base-100 shadow-sm" >
      <div>
        <figure className="w-[clamp(5.625rem,20vw,8rem)]">
          <img
            src="https://contents.mediadecathlon.com/p1619234/k$a9d1d702aa04c055f076e193675f3615/rcr-900-af-road-bike-105-van-rysel-8560890.jpg?f=1920x0&format=auto"
            className="bg-white w-full h-full object-contain rounded-lg"
            alt="Movie"
          />
        </figure>
      </div>

      <div className="card-body flex-col">
        <div className="flex flex-col basis-4/5">
          <div className="grow">
            <h2 className="text-[clamp(0.688rem,2.5vw,1rem)] font-bold ">This bike has an incredibly long name because I need to see what it looks like if an item has an unusually long name</h2>
          </div>

            <span className="font-medium text-[10px] xs:text-xs md:text-sm">₱100.00</span>

        </div>
        <div className="flex flex-col basis-1/5 items-center justify-center">
          <QuantityInput/>
        </div>
      </div>
    </div>
  )
}
export default CartCard