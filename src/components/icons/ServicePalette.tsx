import React, { useState, useMemo } from 'react';
import { useDiagram } from '../../context/DiagramContext';
import { useIconsManifest } from '../../hooks/useIconsManifest';

const ServicePalette: React.FC = () => {
  const { addNode } = useDiagram();
  const { services, categories, loading, error, getServicesByCategory, searchServices, getSmallIcon, getLargeIcon } = useIconsManifest();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    let results;
    // When searching, ONLY show search results (ignore category filter)
    if (searchQuery.trim()) {
      results = searchServices(searchQuery);
    } else {
      // When not searching, show category filtered results
      results = getServicesByCategory(selectedCategory);
    }

    // Filter to only show services that have 64px icons
    // Remove duplicate services (e.g., exclude @5x, @4x variants)
    const uniqueServices = new Map();
    results.forEach(service => {
      // Skip services that don't have 64px icons
      if (!service.sizes[64]) return;

      // Normalize the name to detect duplicates
      // Remove common suffixes like "64@5x", "@5x", "@4x", etc.
      const normalizedName = service.name
        .replace(/\s+\d+@\d+x$/i, '') // Remove " 64@5x" style suffixes
        .replace(/\s+@\d+x$/i, '')    // Remove " @5x" style suffixes
        .trim();

      // Use normalized name + category as the unique key
      const uniqueKey = `${normalizedName}-${service.category}`;

      // Keep the service with more size variants (prefer the complete one)
      const existing = uniqueServices.get(uniqueKey);
      if (!existing) {
        uniqueServices.set(uniqueKey, service);
      } else {
        // If this service has more sizes, use it instead
        const existingSizeCount = Object.keys(existing.sizes).length;
        const currentSizeCount = Object.keys(service.sizes).length;
        if (currentSizeCount > existingSizeCount) {
          uniqueServices.set(uniqueKey, service);
        }
      }
    });

    return Array.from(uniqueServices.values());
  }, [selectedCategory, searchQuery, services]);

  const getCategoryCount = (category: string) => {
    // Count only services with 64px icons, excluding duplicates
    const uniqueServices = new Map();
    const servicesToCount = category === 'All' ? services : services.filter(s => s.category === category);

    servicesToCount.forEach(service => {
      if (!service.sizes[64]) return;

      // Use same normalization as filteredServices
      const normalizedName = service.name
        .replace(/\s+\d+@\d+x$/i, '')
        .replace(/\s+@\d+x$/i, '')
        .trim();

      const uniqueKey = `${normalizedName}-${service.category}`;

      const existing = uniqueServices.get(uniqueKey);
      if (!existing) {
        uniqueServices.set(uniqueKey, service);
      } else {
        const existingSizeCount = Object.keys(existing.sizes).length;
        const currentSizeCount = Object.keys(service.sizes).length;
        if (currentSizeCount > existingSizeCount) {
          uniqueServices.set(uniqueKey, service);
        }
      }
    });

    return uniqueServices.size;
  };

  const handleDragStart = (event: React.DragEvent, service: any) => {
    const largeIcon = getLargeIcon(service);
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      service: service.name,
      category: service.category,
      iconPath: largeIcon, // Use 32px+ for canvas
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddService = (service: any) => {
    const largeIcon = getLargeIcon(service);
    // Clean the service name for display
    const cleanServiceName = service.name
      .replace(/^(Arch|Res)\s+/i, '')
      .replace(/\s+(Other)$/i, '')
      .trim();

    const newNode = {
      id: `${service.id}-${Date.now()}`,
      type: 'awsNode',
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: {
        service: cleanServiceName,
        category: service.category,
        label: cleanServiceName, // Default to service name
        iconUrl: largeIcon, // Use 32px+ for canvas
      },
    };
    addNode(newNode);
  };

  return (
    <div className="w-80 min-w-80 max-w-80 h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-800 mb-3 truncate">AWS Services</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search (e.g., EC2, S3, Lambda)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-xs text-gray-500">
            {filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''} for "{searchQuery}"
          </div>
        )}
      </div>

      <div className="flex overflow-x-auto border-b border-gray-200 p-2 gap-1 flex-shrink-0 scrollbar-thin">
        {categories.map((cat) => {
          const count = getCategoryCount(cat);
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery(''); // Clear search when changing category
              }}
              className={`px-3 py-1 text-xs rounded whitespace-nowrap flex-shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat} <span className="ml-1 opacity-70">({count})</span>
            </button>
          );
        })}
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
            {filteredServices.map((service) => {
              const smallIcon = getSmallIcon(service); // Use 16px for sidebar
              return (
                <div
                  key={`${service.id}-${service.category}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, service)}
                  onClick={() => handleAddService(service)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-move transition-all"
                >
                  <div className="flex flex-col items-center gap-2">
                    {smallIcon ? (
                      <>
                        <img
                          src={smallIcon}
                          alt={service.name}
                          className="w-14 h-14 object-contain"
                          onError={(e) => {
                            // Fallback to placeholder if icon fails to load
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="w-14 h-14 bg-orange-500 rounded hidden items-center justify-center text-white font-bold text-sm">
                          {service.name.substring(0, 2).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="w-14 h-14 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-sm">
                        {service.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="text-xs text-center font-medium text-gray-700 line-clamp-2 w-full px-1">
                      {(() => {
                        const cleaned = service.name
                          .replace(/^(Arch|Res)\s+/i, '') // Remove "Arch " or "Res " prefix
                          .replace(/\s+(Other)$/i, '')    // Remove " Other" suffix
                          .trim();
                        return cleaned || service.name; // Fallback to original if empty
                      })()}
                    </div>
                    <div className="text-xs text-gray-500 truncate w-full text-center">
                      {service.category}
                    </div>
                  </div>
                </div>
              );
            })}
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
