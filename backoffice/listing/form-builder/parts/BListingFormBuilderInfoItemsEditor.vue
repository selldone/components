<!--
  - Selldone® Business OS™
  - Backoffice Listing Form Builder
  - Informative "items list" editor (Airbnb-style)
  -->

<template>
  <v-card rounded="lg" variant="outlined" class="sld-bfb-iie">
    <v-card-title class="d-flex align-center py-2">
      <div class="font-weight-black">{{ $t('shop_listing.form_builder.items') }}</div>
      <v-spacer />
      <v-btn size="small" variant="text" :class="{ 'sd-modern-button sd-modern-button--inline': listingFormBuilderModern }" @click="addItem">
        <v-icon start>add</v-icon>
        {{ $t('shop_listing.form_builder.add_item') }}
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-2">
      <div v-if="!itemsLocal.length" class="text-muted pa-3">
        {{ $t('shop_listing.form_builder.no_items') }}
      </div>

      <draggable
        v-else
        v-model="itemsLocal"
        item-key="id"
        handle=".sld-bfb-iie__drag"
        ghost-class="sld-bfb-iie__ghost"
        :animation="160"
        :delay="180"
        :delayOnTouchOnly="true"
        @end="emitNow"
      >
        <template #item="{ element, index }">
          <v-card rounded="lg" variant="flat" class="sld-bfb-iie__row">
            <div class="sld-bfb-iie__row-top">
              <div class="d-flex align-center">
                <span class="sld-bfb-iie__drag" :title="$t('shop_listing.form_builder.drag_reorder')">
                  <v-icon size="18">drag_indicator</v-icon>
                </span>

                <div class="ms-2 font-weight-black">
                  {{ $t('shop_listing.form_builder.item', { number: index + 1 }) }}
                </div>

                <v-spacer />

                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  :class="{ 'sd-modern-icon-button': listingFormBuilderModern }"
                  :aria-label="$t('shop_listing.form_builder.remove')"
                  :title="$t('shop_listing.form_builder.remove')"
                  @click="removeItem(String(element.id))"
                >
                  <v-icon size="18" aria-hidden="true">delete</v-icon>
                  <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip">{{ $t('shop_listing.form_builder.remove') }}</v-tooltip>
                </v-btn>
              </div>
            </div>

            <div class="sld-bfb-iie__grid">
              <!-- image -->
              <div class="sld-bfb-iie__col-image">
                <b-listing-form-builder-image-uploader
                  :model-value="String(element.image || '')"
                  :label="$t('shop_listing.form_builder.item_image')"
                  :hint="$t('shop_listing.form_builder.item_image_hint')"
                  @update:modelValue="(v) => updateItem(String(element.id), { image: String(v || '') })"
                />
              </div>

              <!-- texts -->
              <div class="sld-bfb-iie__col-text">
                <v-text-field
                  :model-value="String(element.title || '')"
                  :label="$t('shop_listing.form_builder.title')"
                  variant="underlined"
                  @update:modelValue="(v) => updateItem(String(element.id), { title: String(v || '') })"
                />

                <v-textarea
                  :model-value="String(element.description || '')"
                  :label="$t('shop_listing.form_builder.description')"
                  variant="underlined"
                  rows="2"
                  auto-grow
                  @update:modelValue="(v) => updateItem(String(element.id), { description: String(v || '') })"
                />
              </div>
            </div>
          </v-card>
        </template>
      </draggable>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import BListingFormBuilderImageUploader from "./BListingFormBuilderImageUploader.vue";

export default {
  name: "BListingFormBuilderInfoItemsEditor",
  inject: { listingFormBuilderModern: { default: false } },

  components: { draggable, BListingFormBuilderImageUploader },

  props: {
    modelValue: { type: Array, default: () => [] },
  },

  emits: ["update:modelValue"],

  data: () => ({
    itemsLocal: [] as any[],
    _syncing: false,
  }),

  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler(v: any) {
        this._syncing = true;
        this.itemsLocal = this.normalizeList(v);
        this._syncing = false;
      },
    },
  },

  methods: {
    clone(v: any) {
      try {
        return JSON.parse(JSON.stringify(v));
      } catch {
        return v;
      }
    },

    makeUid(prefix = "inf") {
      try {
        // @ts-ignore
        if (globalThis.crypto?.getRandomValues) {
          // @ts-ignore
          const a = globalThis.crypto.getRandomValues(new Uint32Array(2));
          return `${prefix}_${a[0].toString(16)}${a[1].toString(16)}`;
        }
      } catch {
        // ignore
      }
      return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
    },

    ensureItem(it: any) {
      const o: any = it && typeof it === "object" ? it : {};
      if (!o.id) o.id = this.makeUid("inf");
      if (o.title === undefined || o.title === null) o.title = "";
      if (o.description === undefined || o.description === null) o.description = "";
      if (o.image === undefined || o.image === null) o.image = "";
      return o;
    },

    normalizeList(v: any): any[] {
      const arr = Array.isArray(v) ? v : [];
      return arr.map((x) => this.ensureItem(this.clone(x))).filter((x) => !!x?.id);
    },

    emitNow() {
      if (this._syncing) return;
      const out = this.normalizeList(this.itemsLocal);
      this.$emit("update:modelValue", this.clone(out));
    },

    addItem() {
      const next = this.normalizeList(this.itemsLocal);
      next.push(this.ensureItem({}));
      this.itemsLocal = next;
      this.emitNow();
    },

    removeItem(id: string) {
      const next = this.normalizeList(this.itemsLocal).filter((x) => String(x.id) !== String(id));
      this.itemsLocal = next;
      this.emitNow();
    },

    updateItem(id: string, patch: any) {
      const next = this.normalizeList(this.itemsLocal).map((x) => {
        if (String(x.id) !== String(id)) return x;
        return this.ensureItem({ ...x, ...(patch || {}) });
      });

      this.itemsLocal = next;
      this.emitNow();
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-iie {
  background: #fff;

  &__row {
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: rgba(0, 0, 0, 0.012);
    padding: 10px;
    margin-bottom: 10px;
  }

  &__row-top {
    margin-bottom: 8px;
  }

  &__drag {
    width: 26px;
    height: 26px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.10);
    background: rgba(0, 0, 0, 0.03);
    display: grid;
    place-items: center;
    cursor: grab;
  }

  &__grid {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 12px;
    align-items: start;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  /* ✅ Fix uploader layout ONLY inside this editor:
     Desktop: meta + buttons UNDER the image
     Mobile: meta + buttons NEXT to the image
  */
  :deep(.sld-bfb-up__row) {
    grid-template-columns: 1fr !important;
    align-items: start !important;
  }

  @media (max-width: 720px) {
    :deep(.sld-bfb-up__row) {
      grid-template-columns: 140px 1fr !important;
      align-items: center !important;
    }
  }

  /* Prevent any internal overflow from pushing into the next column */
  :deep(.sld-bfb-up__meta) {
    min-width: 0;
  }

  :deep(.sld-bfb-iie__ghost) {
    opacity: 0.6;
  }
}
</style>