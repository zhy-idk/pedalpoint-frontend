import { Link } from "react-router-dom";

function Breadcrumbs(){
  return(
    <div className="breadcrumbs text-xs overflow-auto mb-2">
        <ul>
          <li><Link to="#" className="link">Home</Link></li>
          <li><Link to="#" className="link">Documents</Link></li>
          <li><Link to="#">This bike has an incredibly long name because I need to see what it looks like if an item has an unusually long name</Link></li>
        </ul>
      </div>
  )
}
export default Breadcrumbs