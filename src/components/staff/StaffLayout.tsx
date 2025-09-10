import { Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';

function StaffLayout() {
  return (
    <div className="bg-base-300 flex flex-row h-screen overflow-hidden">
      <StaffSidebar />
      <main className="flex-1 overflow-auto p-4 min-w-0">
        <div className="h-full w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default StaffLayout;
