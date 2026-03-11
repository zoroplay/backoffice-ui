"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

type SearchContextValue = {
  query: string;
  setQuery: (value: string) => void;
  resetQuery: () => void;
  placeholder: string;
  setPlaceholder: (value: string) => void;
  resetPlaceholder: () => void;
};

const DEFAULT_PLACEHOLDER = "Search or type command...";

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [query, setQueryState] = useState("");
  const [placeholder, setPlaceholderState] = useState(DEFAULT_PLACEHOLDER);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
  }, []);

  const resetQuery = useCallback(() => {
    setQueryState("");
  }, []);

  const setPlaceholder = useCallback((value: string) => {
    setPlaceholderState(value?.trim() ? value : DEFAULT_PLACEHOLDER);
  }, []);

  const resetPlaceholder = useCallback(() => {
    setPlaceholderState(DEFAULT_PLACEHOLDER);
  }, []);

  React.useEffect(() => {
    setQueryState("");
    setPlaceholderState(DEFAULT_PLACEHOLDER);
  }, [pathname]);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      resetQuery,
      placeholder,
      setPlaceholder,
      resetPlaceholder,
    }),
    [placeholder, query, resetPlaceholder, resetQuery, setPlaceholder, setQuery]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    // Return default values during SSR instead of throwing
    if (typeof window === 'undefined') {
      return {
        query: '',
        setQuery: () => {},
        resetQuery: () => {},
        placeholder: DEFAULT_PLACEHOLDER,
        setPlaceholder: () => {},
        resetPlaceholder: () => {},
      };
    }
    throw new Error("useSearch must be used within a SearchProvider");
  }

  return context;
}

export { DEFAULT_PLACEHOLDER };


