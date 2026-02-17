// VendorListingAccessMixin.ts
export default {
  computed: {
    shop(): any {
      // Vendor app already has window.shop
      return (window as any).shop || {};
    },

    IS_MARKETPLACE(): boolean {
      const s: any = (this as any).shop;
      return s?.model === "marketplace" && !!s?.marketplace?.enable;
    },

    /**
     * Vendor listing feature flag:
     * shop.marketplace.listing must be true
     */
    IS_LISTING_ENABLED_FOR_VENDORS(): boolean {
      const s: any = (this as any).shop;
      return (this as any).IS_MARKETPLACE && !!s?.marketplace?.listing;
    },

    /**
     * Listing module itself must be active + submission enabled.
     * (Matches backend checks you described.)
     */
    IS_LISTING_ACTIVE(): boolean {
      const s: any = (this as any).shop;
      return !!s?.listing?.is_active;
    },

    IS_LISTING_SUBMISSION_ENABLED(): boolean {
      const s: any = (this as any).shop;
      return !!s?.listing?.submission_enabled;
    },

    /**
     * Final gate:
     * show Vendor Listing UI only if allowed by marketplace + listing is active + submission enabled
     */
    IS_LISTING_AVAILABLE_FOR_VENDORS(): boolean {
      return (
        (this as any).IS_LISTING_ENABLED_FOR_VENDORS &&
        (this as any).IS_LISTING_ACTIVE &&
        (this as any).IS_LISTING_SUBMISSION_ENABLED
      );
    },
  },
};
