import './App.css'
import Dashboard from './components/Dashboard';
import ActivityLog from './components/ActivityLog/ActivityLog';
import SetupBot from './components/Future/SetupBot';
import Analytics from './components/Future/Analytics';

import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard/>}></Route>
      <Route path='/log' element={<ActivityLog/>}></Route>
      <Route path='/setup' element={<SetupBot/>}></Route>
      <Route path='/analytics' element={<Analytics/>}></Route>
    </Routes>
  );
}

export default App;
