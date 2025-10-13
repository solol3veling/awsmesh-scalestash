import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useDiagram } from '../../context/DiagramContext';
import { useIconsManifest } from '../../hooks/useIconsManifest';
import { useTheme } from '../../context/ThemeContext';

interface ServicePaletteProps {
  showCodeEditor: boolean;
  setShowCodeEditor: (show: boolean) => void;
}

const ServicePalette: React.FC<ServicePaletteProps> = ({ showCodeEditor, setShowCodeEditor }) => {
  const { addNode } = useDiagram();
  const { services, categories, loading, error, getServicesByCategory, searchServices, getSmallIcon, getLargeIcon } = useIconsManifest();
  const { theme, toggleTheme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Convert service name to uniform format: arch::category::service-name
  const getUniformServiceId = (service: any): string => {
    const prefix = service.name.match(/^(Arch|Res)\s+/i)?.[1].toLowerCase() || 'arch';
    const category = service.category.toLowerCase().replace(/\s+/g, '-');
    const serviceName = service.name
      .replace(/^(Arch|Res)\s+/i, '')
      .replace(/\s+(Other)$/i, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .trim();
    return `${prefix}::${category}::${serviceName}`;
  };

  const handleSaveAsPNG = () => {
    // TODO: Implement PNG export
    alert('Save as PNG - Feature coming soon!');
    setShowShareDropdown(false);
  };

  const handleSaveAsJSON = () => {
    // Minimal JSON format - only essential user-provided data
    const sampleServices = filteredServices.slice(0, 3).map((service, index) => ({
      service: getUniformServiceId(service),
      position: { x: 100 + (index * 200), y: 100 },
      label: service.name.replace(/^(Arch|Res)\s+/i, '').replace(/\s+(Other)$/i, '').trim()
    }));

    const diagramData = {
      nodes: sampleServices,
      edges: [
        // Minimal edge structure - indices reference nodes array
        {
          source: 0,
          target: 1,
          label: "connects to"
        }
      ]
    };

    const dataStr = JSON.stringify(diagramData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `aws-diagram-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowShareDropdown(false);
  };

  const handleLoadJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);

          // Validate JSON structure
          if (!jsonData.nodes || !Array.isArray(jsonData.nodes)) {
            alert('Invalid JSON: missing or invalid "nodes" array');
            return;
          }

          // Process each node and auto-map icons
          jsonData.nodes.forEach((node: any, index: number) => {
            if (!node.service) {
              console.warn(`Node at index ${index} is missing "service" field`);
              return;
            }

            // Find matching service by searching for the service ID
            const matchingService = services.find(s => {
              const uniformId = getUniformServiceId(s);
              return uniformId === node.service;
            });

            if (matchingService) {
              const largeIcon = getLargeIcon(matchingService);
              const newNode = {
                id: `node-${Date.now()}-${index}`,
                type: 'awsNode',
                position: node.position || { x: Math.random() * 300, y: Math.random() * 300 },
                data: {
                  service: node.service,
                  category: matchingService.category,
                  label: node.label || matchingService.name.replace(/^(Arch|Res)\s+/i, '').replace(/\s+(Other)$/i, '').trim(),
                  iconUrl: largeIcon,
                },
              };
              addNode(newNode);
            } else {
              console.warn(`Could not find service for: ${node.service}`);
              alert(`Service not found: ${node.service}\nPlease check the service ID format.`);
            }
          });

          alert(`Successfully imported ${jsonData.nodes.length} node(s)!`);
          setShowShareDropdown(false);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Error parsing JSON file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
    });
    setShowShareDropdown(false);
  };

  const handleToggleCodeEditor = () => {
    setShowCodeEditor(!showCodeEditor);
  };

  // Focus search input when sidebar opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure transition has started
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowShareDropdown(false);
    if (showShareDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showShareDropdown]);

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

    // If not searching and category is 'All', limit to 21 services unless showAll is true
    if (!searchQuery.trim() && selectedCategory === 'All') {
      const popularFiltered = allServices.filter(service => {
        const cleanName = service.name
          .replace(/^(Arch|Res)\s+/i, '')
          .replace(/\s+(Other)$/i, '')
          .trim();

        // Check if service name contains any of the popular service keywords
        return popularServices.some(popular =>
          cleanName.toLowerCase().includes(popular.toLowerCase()) ||
          popular.toLowerCase().includes(cleanName.toLowerCase())
        );
      });

      return showAll ? popularFiltered : popularFiltered.slice(0, 21);
    }

    return allServices;
  }, [selectedCategory, searchQuery, services, showAll]);

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
      {/* AWS Logo - top left */}
      <div className="fixed top-6 left-6 z-20 w-12 h-12 bg-[#ff9900] rounded-lg flex items-center justify-center shadow-lg">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      </div>

      {/* Options Container - top right */}
      <div className={`fixed top-6 right-6 z-20 rounded-full shadow-lg border flex items-center gap-1 p-1 ${
        theme === 'dark'
          ? 'bg-[#232f3e] border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        {/* Share button with dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShareDropdown(!showShareDropdown);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative group ${
              showShareDropdown
                ? theme === 'dark'
                  ? 'bg-[#ff9900]/20 text-[#ff9900]'
                  : 'bg-blue-100 text-blue-600'
                : theme === 'dark'
                  ? 'hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900]'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            }`}
            title="Share"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {!showShareDropdown && (
              <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
                theme === 'dark'
                  ? 'bg-[#1a252f] text-gray-300'
                  : 'bg-gray-800 text-white'
              }`}>
                Share
              </span>
            )}
          </button>

          {/* Share Dropdown */}
          {showShareDropdown && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute top-full mt-2 right-0 rounded-lg shadow-lg border min-w-[160px] overflow-hidden z-50 ${
                theme === 'dark'
                  ? 'bg-[#232f3e] border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <button
                onClick={handleSaveAsPNG}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-[#ff9900]/20 text-gray-300 hover:text-[#ff9900]'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Save as PNG
              </button>
              <button
                onClick={handleSaveAsJSON}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-[#ff9900]/20 text-gray-300 hover:text-[#ff9900]'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Save as JSON
              </button>
              <button
                onClick={handleLoadJSON}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-[#ff9900]/20 text-gray-300 hover:text-[#ff9900]'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Load JSON
              </button>
              <div className={`h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <button
                onClick={handleCopyLink}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-[#ff9900]/20 text-gray-300 hover:text-[#ff9900]'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Copy Link
              </button>
            </div>
          )}
        </div>

        {/* Code Editor button */}
        <button
          onClick={handleToggleCodeEditor}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative group ${
            showCodeEditor
              ? theme === 'dark'
                ? 'bg-[#ff9900]/20 text-[#ff9900]'
                : 'bg-blue-100 text-blue-600'
              : theme === 'dark'
                ? 'hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900]'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
          }`}
          title="Code Editor"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
            theme === 'dark'
              ? 'bg-[#1a252f] text-gray-300'
              : 'bg-gray-800 text-white'
          }`}>
            {showCodeEditor ? 'Hide' : 'Show'} Code Editor
          </span>
        </button>

        {/* Info/Documentation button */}
        <button
          onClick={() => setShowInfoModal(true)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative group ${
            theme === 'dark'
              ? 'hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900]'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
          }`}
          title="Documentation"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
            theme === 'dark'
              ? 'bg-[#1a252f] text-gray-300'
              : 'bg-gray-800 text-white'
          }`}>
            How to Use
          </span>
        </button>

        {/* Divider */}
        <div className={`w-px h-5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />

        {/* Theme Toggle - smaller */}
        <button
          onClick={toggleTheme}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative group ${
            theme === 'dark'
              ? 'hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900]'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
          }`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
          <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
            theme === 'dark'
              ? 'bg-[#1a252f] text-gray-300'
              : 'bg-gray-800 text-white'
          }`}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>
      </div>

      {/* Minimized Icon Bar - visible when closed */}
      <div className={`fixed left-6 top-1/2 -translate-y-1/2 w-16 max-h-[80vh] rounded-2xl flex flex-col gap-2 p-3 shadow-lg border z-10 transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#232f3e] border-gray-700'
          : 'bg-white border-gray-200'
      } ${!isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
        {/* Toggle button in minimized bar */}
        <button
          onClick={() => setIsOpen(true)}
          className={`w-full aspect-square rounded-lg transition-all flex items-center justify-center ${
            theme === 'dark'
              ? 'bg-[#1a252f] hover:bg-[#2d3f52] text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title="Open Panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Show first few services as icons */}
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {filteredServices.slice(0, 8).map((service) => {
            const smallIcon = getSmallIcon(service);
            const cleanName = service.name
              .replace(/^(Arch|Res)\s+/i, '')
              .replace(/\s+(Other)$/i, '')
              .trim();
            return (
              <button
                key={`mini-${service.id}`}
                onClick={() => handleAddService(service)}
                draggable
                onDragStart={(e) => handleDragStart(e, service)}
                className={`w-full aspect-square rounded-lg transition-all flex items-center justify-center cursor-move border ${
                  theme === 'dark'
                    ? 'bg-[#1a252f] hover:bg-[#2d3f52] border-transparent hover:border-[#ff9900]/50'
                    : 'bg-gray-50 hover:bg-blue-50 border-transparent hover:border-blue-300'
                }`}
                title={cleanName || service.name}
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
      <div className={`fixed left-6 top-1/2 -translate-y-1/2 w-[380px] max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 z-10 ${
        theme === 'dark' ? 'bg-[#232f3e]' : 'bg-white'
      } ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
        {/* Search header with AWS dark color */}
        <div className="bg-[#232f3e] rounded-t-2xl px-5 py-7 flex-shrink-0 relative">
          <div className="relative flex items-center gap-3 pr-10">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search AWS services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-base text-white placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-white transition-all flex-shrink-0"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-3 text-xs text-gray-400">
              {filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''} found
            </div>
          )}
          {/* Floating minimize button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-4 w-9 h-9 hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900] rounded-lg flex items-center justify-center transition-all"
            title="Minimize Panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

      <div className={`flex overflow-x-auto border-b px-5 py-3 gap-2 flex-shrink-0 scrollbar-thin ${
        theme === 'dark'
          ? 'bg-[#1a252f] border-gray-700'
          : 'bg-gray-50 border-gray-200'
      }`}>
        {categories
          .filter(cat => cat !== 'All' && cat !== 'Other')
          .map((cat) => {
            const count = getCategoryCount(cat);
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery(''); // Clear search when changing category
                  setShowAll(false); // Reset showAll when changing category
                }}
                className={`px-3 py-1.5 text-[11px] rounded-lg whitespace-nowrap flex-shrink-0 transition-all ${
                  selectedCategory === cat
                    ? theme === 'dark'
                      ? 'bg-[#ff9900] text-white font-semibold shadow-md'
                      : 'bg-blue-500 text-white font-semibold shadow-md'
                    : theme === 'dark'
                      ? 'bg-[#2d3f52] text-gray-300 hover:bg-[#374557]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat} <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
      </div>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 ${
        theme === 'dark' ? 'bg-[#1a252f]' : 'bg-white'
      }`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff9900] mx-auto mb-3"></div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading icons...</p>
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
              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>No Icons Found</p>
              <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
              <code className={`text-xs px-2 py-1 rounded border ${
                theme === 'dark'
                  ? 'bg-[#2d3f52] text-gray-300 border-gray-700'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>npm run icons:generate</code>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>No services found</p>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Try a different search</p>
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
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl hover:scale-105 cursor-move transition-all flex-shrink-0 group border ${
                      theme === 'dark'
                        ? 'hover:bg-[#ff9900]/20 border-transparent hover:border-[#ff9900]/50'
                        : 'hover:bg-blue-500/20 border-transparent hover:border-blue-400/50'
                    }`}
                    style={{ width: 'calc(33.333% - 8px)' }}
                  >
                  <div className="flex flex-col items-center gap-1">
                    {smallIcon ? (
                      <>
                        <img
                          src={smallIcon}
                          alt={service.name}
                          className="w-20 h-20 object-contain"
                          onError={(e) => {
                            // Fallback to placeholder if icon fails to load
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="w-20 h-20 bg-[#ff9900] rounded hidden items-center justify-center text-white font-bold text-base">
                          {service.name.substring(0, 2).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="w-20 h-20 bg-[#ff9900] rounded flex items-center justify-center text-white font-bold text-base">
                        {service.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`text-xs text-center font-medium line-clamp-2 w-full leading-tight break-words transition-colors ${
                        theme === 'dark'
                          ? 'text-gray-300 group-hover:text-[#ff9900]'
                          : 'text-gray-700 group-hover:text-blue-600'
                      }`}
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
                      <div className={`text-[10px] truncate w-full text-center ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
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

      <div className={`p-4 border-t flex items-center justify-between ${
        theme === 'dark'
          ? 'border-gray-700 bg-[#232f3e]'
          : 'border-gray-200 bg-gray-50'
      }`}>
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {loading ? 'Loading...' : `${filteredServices.length} services`}
        </span>
        {!loading && !searchQuery && selectedCategory === 'All' && (
          <button
            onClick={() => setShowAll(!showAll)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              theme === 'dark'
                ? 'text-[#ff9900] hover:text-white bg-[#ff9900]/20 hover:bg-[#ff9900]/30'
                : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            {showAll ? 'View Less' : 'View All'}
          </button>
        )}
      </div>
    </div>

      {/* Info/Documentation Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`max-w-4xl w-full max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-[#232f3e]' : 'bg-white'
            }`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                JSON Format Documentation
              </h2>
              <button
                onClick={() => setShowInfoModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900]'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className={`p-6 overflow-y-auto max-h-[calc(90vh-120px)] ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="space-y-6">
                {/* Introduction */}
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    About This Format
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Use this minimal JSON format to programmatically generate AWS architecture diagrams. The format only
                    requires essential data - IDs, timestamps, and icons are automatically generated by the app. You can feed
                    this structure to an AI or use it directly to create complex diagrams automatically.
                  </p>
                </div>

                {/* Service ID Format */}
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Service Format
                  </h3>
                  <p className="text-sm mb-3">
                    Each node requires a <code className={theme === 'dark' ? 'text-[#ff9900]' : 'text-blue-600'}>service</code> field with this format:
                  </p>
                  <code className={`block px-4 py-2 rounded-lg text-sm ${
                    theme === 'dark'
                      ? 'bg-[#1a252f] text-[#ff9900]'
                      : 'bg-gray-100 text-blue-600'
                  }`}>
                    prefix::category::service-name
                  </code>
                  <p className="text-sm mt-2">
                    Example: <code className={theme === 'dark' ? 'text-[#ff9900]' : 'text-blue-600'}>
                      arch::compute::amazon-ec2
                    </code>
                  </p>
                  <p className="text-xs mt-2 opacity-75">
                    Icons are automatically mapped from the service ID - no need to specify them!
                  </p>
                </div>

                {/* Available Services */}
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Available Services ({filteredServices.length} total)
                  </h3>
                  <div className={`max-h-48 overflow-y-auto rounded-lg border ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="grid grid-cols-2 gap-2 p-4">
                      {filteredServices.slice(0, 50).map((service) => (
                        <code
                          key={service.id}
                          className={`text-xs p-2 rounded ${
                            theme === 'dark'
                              ? 'bg-[#1a252f] text-gray-300'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {getUniformServiceId(service)}
                        </code>
                      ))}
                      {filteredServices.length > 50 && (
                        <p className="text-xs text-gray-500 col-span-2 text-center mt-2">
                          ... and {filteredServices.length - 50} more services
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* JSON Example */}
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Minimal JSON Structure
                  </h3>
                  <pre className={`p-4 rounded-lg overflow-x-auto text-xs ${
                    theme === 'dark'
                      ? 'bg-[#1a252f] text-gray-300'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
{`{
  "nodes": [
    {
      "service": "arch::compute::amazon-ec2",
      "position": { "x": 100, "y": 100 },
      "label": "Web Server"
    },
    {
      "service": "arch::database::amazon-rds",
      "position": { "x": 400, "y": 100 },
      "label": "Database"
    },
    {
      "service": "arch::storage::amazon-s3",
      "position": { "x": 250, "y": 300 },
      "label": "File Storage"
    }
  ],
  "edges": [
    {
      "source": 0,
      "target": 1,
      "label": "connects to"
    },
    {
      "source": 0,
      "target": 2,
      "label": "stores files"
    }
  ]
}`}
                  </pre>
                </div>

                {/* Usage Tips */}
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Usage Tips
                  </h3>
                  <ul className="text-sm space-y-2 list-disc list-inside">
                    <li>Use the <code className={theme === 'dark' ? 'text-[#ff9900]' : 'text-blue-600'}>service</code> field with IDs from the "Available Services" list</li>
                    <li>Position coordinates (x, y) determine where nodes appear on the canvas</li>
                    <li>Node IDs, timestamps, and icons are auto-generated - no need to include them</li>
                    <li>Edge source and target use array indices (0, 1, 2...) to reference nodes</li>
                    <li>Labels are optional but recommended for clarity (e.g., "Web Server", "Database")</li>
                    <li>Feed this minimal JSON to an AI (like Claude or ChatGPT) to generate complex architectures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServicePalette;
