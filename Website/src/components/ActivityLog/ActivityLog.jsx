import './ActivityLog.css';

import Sidebar2 from '../Sidebar2'
import Console from './Console/Console'

function ActivityLog() {
    return(
    <div className="App">
      <div className="AppGlass">
        <Sidebar2/>
        <div className="Log"><Console/></div>
      </div>
    </div>
    )
}

export default ActivityLog;