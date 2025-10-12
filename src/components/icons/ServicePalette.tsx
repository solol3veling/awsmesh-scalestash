import React, { useState, useMemo } from 'react';
import { useDiagram } from '../../context/DiagramContext';
import { useIconsManifest } from '../../hooks/useIconsManifest';

const ServicePalette: React.FC = () => {
  const { addNode } = useDiagram();
  const { services, categories, loading, error, getServicesByCategory, searchServices, getSmallIcon, getLargeIcon } = useIconsManifest();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // Popular AWS services to show by default (20 most commonly used)
  const popularServices = [
    'EC2', 'S3', 'Lambda', 'RDS', 'DynamoDB', 'VPC',
    'CloudFront', 'Route 53', 'ECS', 'EKS',
    'API Gateway', 'SNS', 'SQS', 'CloudWatch', 'IAM',
    'Elastic Load Balancing', 'Auto Scaling', 'ElastiCache',
    'Redshift', 'Kinesis'
  ];

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

    const allServices = Array.from(uniqueServices.values());

    // If not searching and category is 'All', only show popular services
    if (!searchQuery.trim() && selectedCategory === 'All') {
      return allServices.filter(service => {
        const cleanName = service.name
          .replace(/^(Arch|Res)\s+/i, '')
          .replace(/\s+(Other)$/i, '')
          .trim();

        // Check if service name contains any of the popular service keywords
        return popularServices.some(popular =>
          cleanName.toLowerCase().includes(popular.toLowerCase()) ||
          popular.toLowerCase().includes(cleanName.toLowerCase())
        );
      }).slice(0, 20); // Limit to 20 services
    }

    return allServices;
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
    <>
      {/* Minimized Icon Bar - visible when closed */}
      <div className={`fixed left-6 top-1/2 -translate-y-1/2 w-16 max-h-[80vh] bg-white rounded-2xl flex flex-col gap-2 p-3 shadow-lg border border-gray-200 z-10 transition-all duration-300 ${!isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
        {/* Toggle button in minimized bar */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-full aspect-square bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all flex items-center justify-center"
          title="Open Panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Show first few services as icons */}
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {filteredServices.slice(0, 8).map((service) => {
            const smallIcon = getSmallIcon(service);
            return (
              <button
                key={`mini-${service.id}`}
                onClick={() => handleAddService(service)}
                draggable
                onDragStart={(e) => handleDragStart(e, service)}
                className="w-full aspect-square bg-gray-50 hover:bg-blue-50 rounded-lg transition-all flex items-center justify-center cursor-move border border-transparent hover:border-blue-300"
                title={service.name}
              >
                {smallIcon ? (
                  <img src={smallIcon} alt={service.name} className="w-8 h-8 object-contain" />
                ) : (
                  <div className="w-8 h-8 bg-[#ff9900] rounded flex items-center justify-center text-white text-xs font-bold">
                    {service.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Full Sidebar Panel - visible when open */}
      <div className={`fixed left-6 top-1/2 -translate-y-1/2 w-[380px] max-h-[85vh] bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 z-10 border border-gray-200 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
        <div className="p-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
              title="Minimize Panel"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-[#ff9900] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 truncate">AWS Services</h2>
          </div>
        <div className="relative overflow-hidden group/search">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400 group-focus-within/search:text-[#ff9900] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search AWS services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm text-gray-700 placeholder:text-gray-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-md">
            {filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      <div className="flex overflow-x-auto border-b border-gray-200 px-5 py-3 gap-2 flex-shrink-0 scrollbar-thin bg-gray-50">
        {categories.map((cat) => {
          const count = getCategoryCount(cat);
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery(''); // Clear search when changing category
              }}
              className={`px-3 py-1.5 text-[11px] rounded-lg whitespace-nowrap flex-shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white font-semibold shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat} <span className="ml-1 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff9900] mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading icons...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <div className="text-red-400 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-gray-800 font-medium mb-2">No Icons Found</p>
              <p className="text-xs text-gray-600 mb-3">{error}</p>
              <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">npm run icons:generate</code>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <p className="text-sm text-gray-800">No services found</p>
              <p className="text-xs text-gray-600 mt-1">Try a different search</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-between">
            {filteredServices.map((service) => {
              const smallIcon = getSmallIcon(service); // Use 16px for sidebar
              return (
                <div
                  key={`${service.id}-${service.category}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, service)}
                  onClick={() => handleAddService(service)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-blue-500/20 hover:scale-105 cursor-move transition-all flex-shrink-0 group border border-transparent hover:border-blue-400/50"
                  style={{ width: 'calc(33.333% - 8px)' }}
                >
                  <div className="flex flex-col items-center gap-1">
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
                        <div className="w-14 h-14 bg-[#ff9900] rounded hidden items-center justify-center text-white font-bold text-sm">
                          {service.name.substring(0, 2).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="w-14 h-14 bg-[#ff9900] rounded flex items-center justify-center text-white font-bold text-sm">
                        {service.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div
                      className="text-xs text-center font-medium line-clamp-2 w-full leading-tight break-words group-hover:text-blue-600 transition-colors"
                      style={{ color: '#374151' }}
                    >
                      {(() => {
                        const cleaned = service.name
                          .replace(/^(Arch|Res)\s+/i, '') // Remove "Arch " or "Res " prefix
                          .replace(/\s+(Other)$/i, '')    // Remove " Other" suffix
                          .trim();
                        return cleaned || service.name; // Fallback to original if empty
                      })()}
                    </div>
                    {service.category !== 'Other' && (
                      <div className="text-[10px] truncate w-full text-center" style={{ color: '#9ca3af' }}>
                        {service.category}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 text-sm text-gray-600 bg-gray-50">
        {loading ? 'Loading...' : `${filteredServices.length} services`}
      </div>
    </div>
    </>
  );
};

export default ServicePalette;
