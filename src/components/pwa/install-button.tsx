
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDictionary } from '@/hooks/use-dictionary';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  // This is a simple check, more robust checks might be needed for edge cases
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// Check if the app is running in standalone mode (installed)
const isStandalone = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}


export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const { dictionary } = useDictionary();

  useEffect(() => {
    setIsClient(true);
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS()) {
      toast({
        title: dictionary.pwa.iosInstallTitle,
        description: (
          <div className="flex flex-col items-center gap-2 text-center">
            <p>{dictionary.pwa.iosInstallLine1}</p>
            <Share className="h-5 w-5" />
            <p>{dictionary.pwa.iosInstallLine2}</p>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
       toast({
        title: dictionary.pwa.notAvailableTitle,
        description: dictionary.pwa.notAvailableDescription,
        variant: 'destructive',
      });
    }
  };

  if (!isClient || isStandalone()) {
    return null;
  }

  // Show the button if the prompt is available or if it's an iOS device.
  if (deferredPrompt || isIOS()) {
    return (
        <Button
        size="lg"
        variant="outline"
        onClick={handleInstallClick}
        className="shadow-lg transition-all duration-300 hover:shadow-xl"
        >
        <Download className="mr-2 h-5 w-5" />
        {dictionary.pwa.installButton}
        </Button>
    );
  }

  return null;
}
