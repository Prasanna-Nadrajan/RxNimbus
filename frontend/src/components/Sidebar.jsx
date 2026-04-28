import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Read role from auth context
  const userInfo = localStorage.getItem('userInfo');
  const userRole = userInfo ? JSON.parse(userInfo).role : 'Cashier'; 

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Pharmacist', 'Cashier'] },
    { name: 'Inventory', href: '/inventory', icon: Package, roles: ['Admin', 'Pharmacist'] },
    { name: 'POS & Billing', href: '/pos', icon: ShoppingCart, roles: ['Admin', 'Pharmacist', 'Cashier'] },
    { name: 'Suppliers', href: '/suppliers', icon: Users, roles: ['Admin'] },
  ];

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="flex flex-col w-64 bg-primary-navy min-h-screen text-white">
      <div className="flex items-center justify-center h-16 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wider text-white">Rx<span className="text-primary-blue">Nimbus</span></h1>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          if (!item.roles.includes(userRole)) return null;
          
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-blue text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-slate-300 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
