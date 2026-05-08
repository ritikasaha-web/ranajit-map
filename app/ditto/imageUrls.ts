export const isDataUrl = (url: string) => url.startsWith("data:");

export const withCacheBust = (url: string, cb: number) => {
  if (!url || isDataUrl(url)) return url;

  return url.includes("?") ? `${url}&cb=${cb}` : `${url}?cb=${cb}`;
};
