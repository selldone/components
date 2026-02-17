<template>
  <div class="text-start sld-cats">
    <u-loading-progress v-if="busy" />

    <v-slide-group
      ref="group"
      v-model="internal"
      show-arrows
      class="sld-cat-slider"
      :center-active="false"
      :scrollToActive="false"
      mandatory
    >
      <!-- All -->
      <v-slide-group-item :value="null" v-slot="{ isSelected, toggle }">
        <button
          type="button"
          class="sld-cat-card"
          :class="{ '-active': isSelected }"
          @click="onSelect(null, toggle)"
        >
          <div class="sld-thumb -all">
            <v-icon size="22">all_inbox</v-icon>
          </div>

          <div class="sld-meta">
            <div class="sld-title">All</div>
          </div>
        </button>
      </v-slide-group-item>

      <!-- Categories -->
      <v-slide-group-item
        v-for="c in categories"
        :key="c.id"
        :value="c.id"
        v-slot="{ isSelected, toggle }"
      >
        <button
          type="button"
          class="sld-cat-card"
          :class="{ '-active': isSelected }"
          :title="c.title"
          @click="onSelect(c.id, toggle)"
        >
          <div class="sld-thumb">
            <img
              v-if="c.icon"
              :src="getShopImagePath(c.icon)"
              alt="icon"
              class="sld-img"
            />
            <v-icon v-else size="22">folder</v-icon>
          </div>

          <div class="sld-meta">
            <div class="sld-title">
              {{ c.title }}
            </div>
          </div>
        </button>
      </v-slide-group-item>
    </v-slide-group>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "SStorefrontListingCategories",

  inject: ["$shop"],

  props: {
    modelValue: { default: null },
  },

  emits: ["update:modelValue"],

  data: () => ({
    categories: [] as any[],
    busy: false,
    internal: null as number | null,

    // ✅ only once: allow initial "scroll to selected" behavior
    _did_initial_focus: false,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(v: any) {
        const id =
          v === null || v === undefined ? null : parseInt(String(v), 10);

        const next = Number.isFinite(id as any) ? (id as any) : null;

        // keep in sync but DO NOT trigger re-centering after first paint
        this.internal = next;
      },
    },
  },

  mounted() {
    // ✅ Let Vuetify do its initial alignment once, then stop fighting user scroll.
    // After the first frame, disable "scroll to active" behavior by ensuring centerActive=false
    // and never toggling it again.
    requestAnimationFrame(() => {
      this._did_initial_focus = true;
    });
  },

  created() {
    this.fetchCategories();
  },

  methods: {
    onSelect(id: number | null, toggle: Function) {
      // ✅ keep default Vuetify behavior only on the very first interaction after mount,
      // then prevent jumpy "keep selected in view" by not using center-active and not forcing scroll.
      toggle();
      this.$emit("update:modelValue", id);
    },

    fetchCategories() {
      const shopName = this.shop?.name;
      if (!shopName) return;

      this.busy = true;

      axios
        .get(window.XAPI.GET_SHOP_LISTING_CATEGORIES(shopName), {
          params: { offset: 0, limit: 100 },
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          const list = Array.isArray(data.categories) ? data.categories : [];

          this.categories = list.sort((a: any, b: any) => {
            const ao = Number(a?.sort_order ?? 0);
            const bo = Number(b?.sort_order ?? 0);
            if (ao !== bo) return ao - bo;

            return String(a?.title || "").localeCompare(String(b?.title || ""), undefined, {
              sensitivity: "base",
            });
          });
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy = false));
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-cats {
  .sld-cat-slider {
    padding: 2px 0;
  }

  :deep(.v-slide-group__prev),
  :deep(.v-slide-group__next) {
    min-width: 32px;
    width: 32px;
    opacity: 0.85;
  }

  :deep(.v-slide-group__content) {
    gap: 10px;
    padding: 6px 2px;
  }
}

.sld-cat-card {
  appearance: none;
  border: 1px solid rgba(20, 20, 20, 0.10);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 16px;

  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 10px;

  width: 210px;
  max-width: 74vw;
  flex: 0 0 auto;

  cursor: pointer;
  text-align: left;

  transition: border-color 0.12s ease, background 0.12s ease;

  &:hover {
    border-color: rgba(20, 20, 20, 0.18);
    background: rgba(255, 255, 255, 0.96);
  }

  &.-active {
    border: 3px solid rgba(0, 0, 0, 0.70);
    background: rgba(0, 0, 0, 0.03);
  }
}

.sld-thumb {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  overflow: hidden;

  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(20, 20, 20, 0.08);

  display: grid;
  place-items: center;
  flex: 0 0 auto;

  .sld-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &.-all {
    background: rgba(0, 0, 0, 0.06);
  }
}

.sld-meta {
  min-width: 0;
}

.sld-title {
  font-weight: 900;
  font-size: 14px;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 520px) {
  .sld-cat-card {
    width: 190px;
    padding: 8px 9px;
    gap: 9px;
  }

  .sld-thumb {
    width: 44px;
    height: 44px;
    border-radius: 13px;
  }
}
</style>
