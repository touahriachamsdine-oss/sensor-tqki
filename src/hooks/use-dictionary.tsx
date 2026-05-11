'use client';

import type { Dictionary } from '@/lib/i18n/get-dictionary';
import React, { createContext, useContext } from 'react';

const DictionaryContext = createContext<{ dictionary: Dictionary } | undefined>(undefined);

export const DictionaryProvider = ({
  children,
  dictionary,
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
}) => {
  return (
    <DictionaryContext.Provider value={{ dictionary }}>
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (context === undefined) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
};
