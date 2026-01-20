import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TranslationCache {
  [key: string]: string;
}

const CACHE_STORAGE_KEY = "cropcare_translations";
const MAX_CACHE_SIZE = 500;

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<TranslationCache>(loadCacheFromStorage());

  function loadCacheFromStorage(): TranslationCache {
    try {
      const stored = localStorage.getItem(CACHE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  function saveCacheToStorage(cache: TranslationCache) {
    try {
      // Limit cache size
      const entries = Object.entries(cache);
      if (entries.length > MAX_CACHE_SIZE) {
        const trimmed = Object.fromEntries(entries.slice(-MAX_CACHE_SIZE));
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(trimmed));
      } else {
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
      }
    } catch {
      console.warn("Could not save translation cache");
    }
  }

  function getCacheKey(text: string, targetLang: string, sourceLang?: string): string {
    return `${sourceLang || "auto"}:${targetLang}:${text.slice(0, 100)}`;
  }

  const translate = useCallback(async (
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string> => {
    if (!text.trim()) return text;

    // Check cache first
    const cacheKey = getCacheKey(text, targetLanguage, sourceLanguage);
    if (cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    setIsTranslating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("translate", {
        body: {
          text,
          targetLanguage,
          sourceLanguage,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const translatedText = data.translatedText || text;

      // Cache the result
      cacheRef.current[cacheKey] = translatedText;
      saveCacheToStorage(cacheRef.current);

      return translatedText;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Translation failed";
      setError(message);
      console.error("Translation error:", err);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const translateBatch = useCallback(async (
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]> => {
    const results: string[] = [];
    const toTranslate: { index: number; text: string }[] = [];

    // Check cache for each text
    texts.forEach((text, index) => {
      const cacheKey = getCacheKey(text, targetLanguage, sourceLanguage);
      if (cacheRef.current[cacheKey]) {
        results[index] = cacheRef.current[cacheKey];
      } else {
        toTranslate.push({ index, text });
      }
    });

    // If all texts were cached, return immediately
    if (toTranslate.length === 0) {
      return results;
    }

    setIsTranslating(true);
    setError(null);

    try {
      // Translate texts that weren't in cache
      await Promise.all(
        toTranslate.map(async ({ index, text }) => {
          const translated = await translate(text, targetLanguage, sourceLanguage);
          results[index] = translated;
        })
      );

      return results;
    } finally {
      setIsTranslating(false);
    }
  }, [translate]);

  // Detect language of text
  const detectLanguage = useCallback((text: string): string => {
    // Simple detection based on character ranges
    const hindiRegex = /[\u0900-\u097F]/;
    const englishRegex = /[a-zA-Z]/;

    if (hindiRegex.test(text)) {
      return "hi";
    }
    if (englishRegex.test(text)) {
      return "en";
    }
    return "unknown";
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
    try {
      localStorage.removeItem(CACHE_STORAGE_KEY);
    } catch {
      // Ignore errors
    }
  }, []);

  return {
    translate,
    translateBatch,
    detectLanguage,
    clearCache,
    isTranslating,
    error,
  };
}
