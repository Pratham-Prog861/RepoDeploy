'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebsitePreviewProps {
  url: string;
  alt: string;
  fallbackTitle: string;
}

export function WebsitePreview({ url, alt, fallbackTitle }: WebsitePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use our custom screenshot API first, with fallbacks
  const screenshotServices = [
    {
      name: 'Custom API',
      url: `/api/screenshot?url=${encodeURIComponent(url)}`
    },
    {
      name: 'ScreenshotAPI Direct',
      url: `https://shot.screenshotapi.net/screenshot?url=${encodeURIComponent(url)}&width=1280&height=720&output=image&file_type=png&wait_for_event=load&delay=2000`
    },
    {
      name: 'Screenshot.rocks Direct',
      url: `https://api.screenshot.rocks/screenshot?url=${encodeURIComponent(url)}&width=1280&height=720&format=png&delay=2000`
    }
  ];

  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const currentService = screenshotServices[currentServiceIndex];

  const handleImageError = () => {
    if (currentServiceIndex < screenshotServices.length - 1) {
      // Try next service
      setCurrentServiceIndex(prev => prev + 1);
      setIsLoading(true);
      setImageError(false);
    } else {
      // All services failed, show fallback
      setImageError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  if (imageError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-600">
        <div className="text-center p-8">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Live Website Ready!</h3>
          <p className="text-sm text-gray-500 mb-4">
            Screenshot preview unavailable, but your site is live and accessible.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              Visit Live Site <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-500">Capturing website screenshot...</p>
          </div>
        </div>
      )}
      
      <Image
        src={currentService.url}
        alt={alt}
        width={1280}
        height={720}
        className={`object-cover w-full h-full transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        unoptimized // Important for external screenshot APIs
      />
      
      {/* Overlay with visit link */}
      <div className="absolute top-2 right-2">
        <Button 
          variant="secondary" 
          size="sm"
          className="bg-black/70 text-white hover:bg-black/80"
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
