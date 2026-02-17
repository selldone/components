// @selldone/components-vue/storefront/listing/compare/ListingCompareStore.ts

export type ListingCompareMini = {
  id: number;
  title?: string | null;
  slug?: string | null;

  category?: {
    id?: number;
    title?: string | null;
    slug?: string | null;
    icon?: string | null;
  } | null;

  // minimal media for the bottom bar
  image?: string | null; // url|path

  reviews_average_rating?: number | null;
  reviews_count?: number | null;

  price?: any;
  currency?: string | null;
  price_unit?: string | null;

  tel?: string | null;
  email?: string | null;
  website?: string | null;

  // timestamp (for stable ordering)
  ts: number;
};

const STORAGE_PREFIX = "sld:list-compare:";
const EVENT_NAME = "sld:listing-compare:changed";
const MAX_DEFAULT = 4;

function key(shopName: string) {
  return `${STORAGE_PREFIX}${String(shopName || "").trim()}`;
}

function safeJsonParse(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function toInt(v: any): number {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function pickImage(item: any): string | null {
  const media = Array.isArray(item?.media) ? item.media : [];
  const img =
    media.find((m: any) => String(m?.type || "") === "image" && (m?.url || m?.path)) ||
    media.find((m: any) => String(m?.type || "") === "image");

  const path = img?.url || img?.path || item?.image || null;
  return path ? String(path) : null;
}

export const ListingCompareBus = {
  EVENT_NAME,

  emit(shopName: string) {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { shop: String(shopName || "").trim() } }),
    );
  },

  on(handler: (e: any) => void) {
    window.addEventListener(EVENT_NAME, handler as any);
  },

  off(handler: (e: any) => void) {
    window.removeEventListener(EVENT_NAME, handler as any);
  },
};

export const ListingCompareStore = {
  read(shopName: string): ListingCompareMini[] {
    const raw = localStorage.getItem(key(shopName));
    if (!raw) return [];

    const parsed = safeJsonParse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((x: any) => {
        const id = toInt(x?.id);
        if (!id) return null;

        return {
          id,
          title: x?.title ?? null,
          slug: x?.slug ?? null,

          category: x?.category ?? null,

          image: x?.image ?? null,

          reviews_average_rating:
            x?.reviews_average_rating !== undefined && x?.reviews_average_rating !== null
              ? Number(x.reviews_average_rating)
              : null,

          reviews_count:
            x?.reviews_count !== undefined && x?.reviews_count !== null
              ? Number(x.reviews_count)
              : null,

          price: x?.price ?? null,
          currency: x?.currency ?? null,
          price_unit: x?.price_unit ?? null,

          tel: x?.tel ?? null,
          email: x?.email ?? null,
          website: x?.website ?? null,

          ts: Number(x?.ts || 0) || Date.now(),
        } as ListingCompareMini;
      })
      .filter(Boolean)
      .sort((a: ListingCompareMini, b: ListingCompareMini) => (a.ts || 0) - (b.ts || 0));
  },

  write(shopName: string, list: ListingCompareMini[]) {
    const normalized = Array.isArray(list) ? list : [];
    localStorage.setItem(key(shopName), JSON.stringify(normalized));
    ListingCompareBus.emit(shopName);
  },

  clear(shopName: string) {
    localStorage.removeItem(key(shopName));
    ListingCompareBus.emit(shopName);
  },

  has(shopName: string, id: number): boolean {
    const list = this.read(shopName);
    return list.some((x) => x.id === id);
  },

  add(shopName: string, item: any, max: number = MAX_DEFAULT) {
    const s = String(shopName || "").trim();
    if (!s) return;

    const id = toInt(item?.id);
    if (!id) return;

    const list = this.read(s);

    // remove if exists (we will re-add at end to keep "latest")
    const filtered = list.filter((x) => x.id !== id);

    const mini: ListingCompareMini = {
      id,
      title: item?.title ?? null,
      slug: item?.slug ?? null,
      category: item?.category
        ? {
          id: item.category?.id,
          title: item.category?.title ?? null,
          slug: item.category?.slug ?? null,
          icon: item.category?.icon ?? null,
        }
        : null,

      image: pickImage(item),

      reviews_average_rating:
        item?.reviews_average_rating !== undefined && item?.reviews_average_rating !== null
          ? Number(item.reviews_average_rating)
          : null,

      reviews_count:
        item?.reviews_count !== undefined && item?.reviews_count !== null
          ? Number(item.reviews_count)
          : null,

      price: item?.price ?? null,
      currency: item?.currency ?? null,
      price_unit: item?.price_unit ?? null,

      tel: item?.tel ?? null,
      email: item?.email ?? null,
      website: item?.website ?? null,

      ts: Date.now(),
    };

    filtered.push(mini);

    // cap
    const capped = filtered.slice(Math.max(0, filtered.length - Math.max(1, max)));
    this.write(s, capped);
  },

  remove(shopName: string, id: number) {
    const s = String(shopName || "").trim();
    if (!s) return;

    const list = this.read(s).filter((x) => x.id !== id);
    this.write(s, list);
  },

  toggle(shopName: string, item: any, max: number = MAX_DEFAULT) {
    const id = toInt(item?.id);
    if (!id) return;

    if (this.has(shopName, id)) this.remove(shopName, id);
    else this.add(shopName, item, max);
  },
};
