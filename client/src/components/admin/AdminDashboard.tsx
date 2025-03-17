import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TourManagement from './TourManagement';
import VehicleManagement from './VehicleManagement';
import HotelManagement from './HotelManagement';
import GuideManagement from './GuideManagement';
import UserManagement from './UserManagement';
import CompanySettings from './CompanySettings';
import { Button } from '@/components/ui/button';
import { 
  Map, 
  Car, 
  Building, 
  Users, 
  UserCog, 
  Settings,
} from 'lucide-react';

type Tab = 'tours' | 'vehicles' | 'hotels' | 'guides' | 'users' | 'settings';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('tours');

  const tabs = [
    { id: 'tours', label: t('admin.tourManagement'), icon: <Map className="mr-2 h-5 w-5" /> },
    { id: 'vehicles', label: t('admin.vehicleManagement'), icon: <Car className="mr-2 h-5 w-5" /> },
    { id: 'hotels', label: t('admin.hotelManagement'), icon: <Building className="mr-2 h-5 w-5" /> },
    { id: 'guides', label: t('admin.guideManagement'), icon: <Users className="mr-2 h-5 w-5" /> },
    { id: 'users', label: t('admin.userManagement'), icon: <UserCog className="mr-2 h-5 w-5" /> },
    { id: 'settings', label: t('admin.companySettings'), icon: <Settings className="mr-2 h-5 w-5" /> }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'tours':
        return <TourManagement />;
      case 'vehicles':
        return <VehicleManagement />;
      case 'hotels':
        return <HotelManagement />;
      case 'guides':
        return <GuideManagement />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <CompanySettings />;
      default:
        return <TourManagement />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
        <h2 className="font-heading text-lg font-semibold text-neutral mb-4">
          {t('admin.dashboard')}
        </h2>
        <nav>
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <Button
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className={`w-full justify-start text-left ${
                    activeTab === tab.id ? 'bg-secondary text-white' : ''
                  }`}
                  onClick={() => setActiveTab(tab.id as Tab)}
                >
                  {tab.icon}
                  {tab.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Admin Content Panels */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
