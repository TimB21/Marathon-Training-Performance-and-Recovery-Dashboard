import React, { useState } from 'react';
import { ChevronDown, MoreHorizontal, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const OptiMileHeader = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();
  
  const navigationItems = [
    {
      name: "Dashboard",
      hasDropdown: true,
      options: [
        "Activity Feed",
        "Analytics Dashboard",
      ],
    },
    {
      name: "Training",
      hasDropdown: true,
      options: [
        "Training Planner",
        "Training Calendar",
        "Training Log",
        "Activity Log",
      ],
    },
    {
      name: "Coaching",
      hasDropdown: true,
      options: [
        "Chat Interface",
        "Pre-Run Strategy",
        "AI Insights",
        "Goals & Tracking",
      ],
    },
    {
      name: "Analysis",
      hasDropdown: true,
      options: [
        "Analytics Dashboard",
        "Performance Trends",
        "Machine Learning Analysis",
      ],
    },
  ];
  
const toggleDropdown = (name) => {
  setActiveDropdown((current) => (current === name ? null : name));
};

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3">
     <div className="w-full flex items-center justify-between">
    {/* Left side - Logo and Nav combined */}
    <div className="flex items-center space-x-6">
      {/* Logo */}
      <h1 className="text-xl font-semibold text-gray-900">OptiMile</h1>

      {/* Navigation */}
      <nav className="flex items-center space-x-6">
        {navigationItems.map((item) => (
          <div key={item.name} className="relative">
            <button
              onClick={() => toggleDropdown(item.name)}
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium"
            >
              <span>{item.name}</span>
              {item.hasDropdown && <ChevronDown size={16} className="text-gray-500" />}
            </button>

            {activeDropdown === item.name && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-2">
                {item.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      console.log("Clicked option:", option);
                      // Example: navigate to training log if option is exactly "Training Log"
                      if (option === "Training Log") {
                        navigate('/training-log');
                      }
                      // Add navigation logic here if you want (e.g. react-router navigation)
                      // For example: navigate(`/${item.name.toLowerCase()}/${option.toLowerCase().replace(/\s+/g, '-')}`)
                      console.log(`Clicked on ${option}`);
                      toggleDropdown(null); // close dropdown on click
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        ))}
      </nav>
    </div>

  {/* Right side - User profile and menu */}
  <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <MoreHorizontal size={20} />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="/api/placeholder/32/32" 
                alt="User avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <User size={16} className="text-gray-600" style={{display: 'none'}} />
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default OptiMileHeader;