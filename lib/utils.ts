import dayjs from "dayjs";

/**
 * Formats a numeric value into a localized currency string.
 * Defaults to USD ($) and standard U.S. formatting.
 *
 * @param value - The numeric amount to format
 * @param currency - The ISO 4217 currency code (default: 'USD')
 * @returns A formatted currency string or a fallback on error
 */
export const formatCurrency = (
  value: number,
  currency: string = "USD",
): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error("Currency formatting error:", error);

    // Fallback: Manually format to ensure the UI doesn't break
    const symbol =
      currency.toUpperCase() === "USD" ? "$" : `${currency.toUpperCase()} `;
    return `${symbol}${value.toFixed(2)}`;
  }
};
export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not Provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not Provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
