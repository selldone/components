<template>
  <section class="b-official-layout-showcase text-start" :aria-busy="loading">
    <header>
      <div>
        <h3>{{ $t("domain_layouts.showcase_title") }}</h3>
        <p>{{ $t("domain_layouts.showcase_help") }}</p>
      </div>
      <v-btn
        href="/custom-layouts"
        target="_blank"
        rel="noopener noreferrer"
        class="sd-modern-button sd-modern-button--inline"
        color="primary"
        variant="text"
        >{{ $t("domain_layouts.explore")
        }}<v-icon size="16" end>north_east</v-icon></v-btn
      >
    </header>
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="b-official-layout-showcase__progress"
    />
    <div v-if="error" class="sd-modern-notice" role="alert">
      <v-icon size="17">error_outline</v-icon
      ><span class="sd-modern-notice__content">{{
        $t("domain_layouts.load_failed")
      }}</span
      ><v-btn
        variant="text"
        class="sd-modern-button sd-modern-button--inline"
        @click="load"
        >{{ $t("domain_layouts.retry") }}</v-btn
      >
    </div>
    <div v-else-if="layouts.length" class="b-official-layout-showcase__grid">
      <article v-for="layout in layouts" :key="layout.id">
        <div class="b-official-layout-showcase__image">
          <v-img
            v-if="layout.image_url || layout.image"
            :src="layout.image_url || getShopImagePath(layout.image)"
            alt=""
            cover
          /><v-icon v-else size="36" aria-hidden="true">layers</v-icon>
        </div>
        <div class="b-official-layout-showcase__copy">
          <h4>{{ layout.title }}</h4>
          <p>{{ layout.summary }}</p>
          <v-btn
            :href="preview(layout.id)"
            target="_blank"
            rel="noopener noreferrer"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            :disabled="!previewUrl"
            >{{ $t("domain_layouts.try_now")
            }}<v-icon size="16" end>north_east</v-icon></v-btn
          >
        </div>
      </article>
    </div>
    <p v-else-if="!loading">{{ $t("domain_layouts.empty_official") }}</p>
  </section>
</template>

<script lang="ts">
export default {
  name: "BOfficialLayoutShowcase",
  props: { shop: { type: Object, required: true } },
  data: () => ({
    loading: false,
    error: false,
    layouts: [],
    previewUrl: "",
    requestId: 0,
  }),
  watch: {
    "shop.id": {
      immediate: true,
      handler() {
        this.layouts = [];
        this.previewUrl = "";
        this.load();
      },
    },
  },
  beforeUnmount() {
    this.requestId++;
  },
  methods: {
    async load() {
      const requestId = ++this.requestId;
      this.loading = true;
      this.error = false;
      try {
        const { data } = await axios.get(
          window.API.GET_SHOP_LAYOUT_OPTIONS(this.shop.id),
          { params: { count: 3 } },
        );
        if (requestId !== this.requestId) return;
        if (data.error || !Array.isArray(data.official_layouts))
          throw new Error("Unavailable official layouts");
        this.layouts = data.official_layouts.slice(0, 3);
        this.previewUrl = data.preview_url || "";
      } catch (error) {
        if (requestId === this.requestId) {
          this.error = true;
          this.layouts = [];
          this.previewUrl = "";
        }
      } finally {
        if (requestId === this.requestId) this.loading = false;
      }
    },
    preview(id) {
      if (!this.previewUrl) return null;
      const url = new URL(this.previewUrl, window.location.origin);
      url.searchParams.set("mode", "official");
      url.searchParams.set("official_layout_id", String(id));
      return url.href;
    },
  },
};
</script>

<style scoped lang="scss">
.b-official-layout-showcase {
  position: relative;
  min-width: 0;
  > header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-block-end: 16px;
  }
  h3 {
    margin: 0;
    font: inherit;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }
  h4 {
    margin: 0;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  p {
    margin: 4px 0 0;
    font-size: 13px;
    line-height: 21px;
    color: var(--sd-modern-muted);
  }
  &__progress {
    position: absolute;
    inset-inline: 0;
    inset-block-start: 0;
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    > article {
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: rgb(var(--v-theme-surface));
      border: 1px solid var(--sd-modern-border);
      border-radius: 13px;
      overflow: hidden;
    }
  }
  &__image {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    color: var(--sd-modern-muted);
    background: var(--sd-modern-inset);
    .v-img {
      height: 100%;
      width: 100%;
    }
  }
  &__copy {
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: flex-start;
    padding: 14px;
    p {
      min-height: 42px;
      margin-block-end: 10px;
    }
    .v-btn {
      margin-block-start: auto;
    }
  }
  .sd-modern-button {
    font-size: 13px;
    line-height: 20px;
  }
  @media (max-width: 600px) {
    &__grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
