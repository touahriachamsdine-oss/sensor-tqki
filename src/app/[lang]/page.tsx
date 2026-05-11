
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import InstallButton from '@/components/pwa/install-button';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/i18n-config';
import { FsIcon } from '@/components/icons/fs-icon';

export default async function Home({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-24 -top-24 h-48 w-48 rounded-full bg-primary/20 blur-2xl"></div>
        <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl"></div>
        <svg
          className="absolute bottom-0 left-0 text-primary/10"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M50.5,-50.5C62,-35.1,65.4,-17.5,65.4,0C65.4,17.5,62,35.1,50.5,50.5C35.1,62,17.5,65.4,0,65.4C-17.5,65.4,-35.1,62,-50.5,50.5C-62,35.1,-65.4,17.5,-65.4,0C-65.4,-17.5,-62,-35.1,-50.5,-50.5C-35.1,-65.4,-17.5,-65.4,0,-65.4C17.5,-65.4,35.1,-62,50.5,-50.5Z"
            transform="translate(50 150)"
          />
        </svg>
        <svg
          className="absolute right-0 top-0 text-accent/10"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M40.4,-60.6C53.2,-55.8,65.1,-46.6,71.2,-34.2C77.4,-21.8,77.7,-6.2,73.5,8.1C69.3,22.4,60.5,35.4,49.2,46.2C37.9,57,24.1,65.6,8.6,68.9C-6.9,72.2,-24.1,70.2,-37.9,62.8C-51.7,55.4,-62.1,42.6,-68.8,28.2C-75.5,13.8,-78.4,-2.2,-74.6,-16.4C-70.8,-30.6,-60.1,-43,-48.1,-48.9C-36,-54.8,-22.6,-54.2,-10.8,-55.3C1,-56.4,11.2,-59.1,22.3,-62.1C33.4,-65.1,47.6,-68.4,40.4,-60.6Z"
            transform="translate(150 50) rotate(20)"
          />
        </svg>
      </div>

      <div className="z-10 flex flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-foreground bg-card shadow-lg">
          <FsIcon className="h-14 w-14" />
        </div>
        <h1 className="font-headline text-5xl font-bold tracking-tighter md:text-7xl">
          Fares <span className="text-primary">Sensor</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          {dictionary.home.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
          <Link href={`/${lang}/dashboard`}>
            <Button size="lg" className="group shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/50">
              {dictionary.home.goToDashboard}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <InstallButton />
        </div>
      </div>
      
      <div className="absolute bottom-4 z-10">
        <p className="text-xs text-muted-foreground/50">made by captainmfo.js</p>
      </div>
    </div>
  );
}
