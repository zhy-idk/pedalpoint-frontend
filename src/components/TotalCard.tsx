function TotalCard(){
  return(
    <div className="card w-full bg-base-100 card-border border-base-300 shadow-sm">
      <div className="card-body">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold">Total</h2>
          <span className="text-xl">₱9,000,000.00</span>
        </div>
        <textarea className="textarea w-full" placeholder="Special instructions"></textarea>
        <div className="mt-6">
          <button className="btn btn-primary btn-block">Checkout</button>
        </div>
      </div>
    </div>
  )
}
export default TotalCard