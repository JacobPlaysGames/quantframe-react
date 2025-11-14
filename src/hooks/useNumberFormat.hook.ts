import { useMemo } from "react";
import i18next from "i18next";

export type NumberFormatConfig = {
  thousandSeparator: string;
  decimalSeparator: string;
};

/**
 * Hook that provides locale-aware number formatting configuration.
 * Automatically adapts to the current i18n language setting.
 * 
 * @returns Configuration object with thousandSeparator and decimalSeparator
 * 
 * @example
 * const { thousandSeparator, decimalSeparator } = useNumberFormat();
 * <NumberFormatter value={1234.56} thousandSeparator={thousandSeparator} decimalSeparator={decimalSeparator} />
 */
export const useNumberFormat = (): NumberFormatConfig => {
  return useMemo(() => {
    const currentLanguage = i18next.language;

    // Define locale-specific formatting rules
    switch (currentLanguage) {
      case "en":
        // English (US): 1,234.56
        return {
          thousandSeparator: ",",
          decimalSeparator: ".",
        };
      case "dk":
        // Danish: 1.234,56
        return {
          thousandSeparator: ".",
          decimalSeparator: ",",
        };
      default:
        // Default to English format
        return {
          thousandSeparator: ",",
          decimalSeparator: ".",
        };
    }
  }, [i18next.language]);
};
