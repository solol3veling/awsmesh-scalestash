import React, { useState, useMemo } from 'react';
import { useDiagram } from '../../context/DiagramContext';
import { useIconsManifest } from '../../hooks/useIconsManifest';

const ServicePalette: React.FC = () => {
  const { addNode } = useDiagram();
  const { services, categories, loading, error, getServicesByCategory, searchServices } = useIconsManifest();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    if (searchQuery.trim()) {
      return searchServices(searchQuery);
    }
    return getServicesByCategory(selectedCategory);
  }, [selectedCategory, searchQuery, services]);

  const handleDragStart = (event: React.DragEvent, service: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      service: service.name,
      category: service.category,
      iconPath: service.iconPath,
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddService = (service: any) => {
    const newNode = {
      id: `${service.id}-${Date.now()}`,
      type: 'awsNode',
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: {
        service: service.name,
        category: service.category,
        label: service.name,
        iconUrl: service.iconPath,
      },
    };
    addNode(newNode);
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-3">AWS Services</h2>
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex overflow-x-auto border-b border-gray-200 p-2 gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading icons...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <div className="text-red-500 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-medium mb-2">No Icons Found</p>
              <p className="text-xs text-gray-500 mb-3">{error}</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">npm run icons:generate</code>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <p className="text-sm text-gray-600">No services found</p>
              <p className="text-xs text-gray-500 mt-1">Try a different search</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                draggable
                onDragStart={(e) => handleDragStart(e, service)}
                onClick={() => handleAddService(service)}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-move transition-all"
              >
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={service.iconPath}
                    alt={service.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      // Fallback to placeholder if icon fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-12 h-12 bg-orange-500 rounded hidden items-center justify-center text-white font-bold text-sm">
                    {service.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs text-center font-medium text-gray-700">
                    {service.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {service.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
        {loading ? 'Loading...' : `${filteredServices.length} services • Drag or click to add`}
      </div>
    </div>
  );
};

export default ServicePalette;
