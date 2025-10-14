import React, { useState } from 'react';
import { Search, PanelLeftOpen } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import ServicePalette from '../icons/ServicePalette';

const FloatingSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed left-6 top-24 z-20">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col items-center gap-2 p-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-gray-100"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[400px] p-0">
              <ServicePalette showCodeEditor={showCodeEditor} setShowCodeEditor={setShowCodeEditor} />
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg hover:bg-gray-100"
            onClick={() => setIsOpen(true)}
          >
            <PanelLeftOpen className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default FloatingSidebar;
