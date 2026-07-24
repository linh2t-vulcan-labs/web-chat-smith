import { ECURRENCY, ESTATUS_WORKING } from "../commons/enums";

// Mapping Status from Common Object Status from BE

export const mappingStatusWorking = (status: string): ESTATUS_WORKING => {
  switch (status) {
    case "OBJECT_STATUS_ACTIVE": {
      return ESTATUS_WORKING.ACTIVE;
    }
    case "OBJECT_STATUS_INACTIVE": {
      return ESTATUS_WORKING.INACTIVE;
    }
    default: {
      return ESTATUS_WORKING.INACTIVE;
    }
  }
};

export const mappingCurrencySymbol = (currency: string): string =>
  currency === ECURRENCY.USD ? "$" : "";

/**
 * Converts currency format from backend to ISO format
 * @param currency - Currency string from backend (e.g., "CURRENCY_USD")
 * @returns ISO currency code (e.g., "USD")
 * @example mappingCurrencyISOFormat("CURRENCY_USD") // returns "USD"
 */
export const mappingCurrencyISOFormat = (currency: string): string =>
  currency.replace("CURRENCY_", "");
