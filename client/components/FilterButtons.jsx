let FilterButtons = (props) => {
  return(
    <div>
      <p> Select Filters</p>
      <button className='btn btn-sm' id="nightlife" onClick={props.toggleFilter}>Nightlife</button> 
      <button className='btn btn-sm' id="arts" onClick={props.toggleFilter}>Arts & Entertainment</button>
      <button className='btn btn-sm' id="restaurants" onClick={props.toggleFilter}>Food</button> 
      <button className='btn btn-sm' id="shopping" onClick={props.toggleFilter}>Shopping</button>
      <button className='btn btn-sm' id="landmarks" onClick={props.toggleFilter}>Sights & Landmarks</button>
      <button className='btn btn-sm' id="tours" onClick={props.toggleFilter}>Tours</button>
      <button className='btn btn-sm' id="parks" onClick={props.toggleFilter}>Parks</button>
    </div>
  )
}