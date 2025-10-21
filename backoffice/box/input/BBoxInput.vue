<!-- BBoxInput.vue — minimal change: add a single virtual item when list is empty & search is empty -->
<template>
  <v-combobox
    v-model:search="search"
    :customFilter="() => true"
    :items="itemsUi"
    :label="$t('transportation_boxes_input.select_box') || 'Select a box'"
    :loading="busy"
    :messages="descMessage"
    :model-value="modelValue"
    :variant="variant"
    clearable
    item-title="name"
    item-value="id"
    :return-object="returnObject"
    @update:model-value="onUpdate"
    @click:clear="onClear"
  >
    <!-- Selected -->
    <template #selection="{ item }">
      <b class="small me-1 flex-grow-1 line-height-normal">{{ item.raw.name }}</b>
      <v-chip color="primary" size="x-small" variant="flat">
        {{ dimsShort(item.raw) }}
      </v-chip>
      <v-chip class="ms-1" v-if="item.raw.weight != null" size="x-small" variant="flat">
        {{ fmtNum(item.raw.weight) }}{{ weightUnit }}
      </v-chip>
    </template>

    <!-- Menu items -->
    <template #item="{ item, props }">
      <v-list-item class="text-start" v-bind="props" :title="item.raw.name">
        <template #prepend>
          <u-cube
            v-if="item.raw?.width && item.raw?.length && item.raw?.height"
            :size="24" :x="item.raw?.width" :y="item.raw?.length" :z="item.raw?.height"
            class="me-2" noAnimation
          />
          <v-icon v-else-if="item.raw.id === DEFINE_ID" class="me-2">open_in_new</v-icon>
        </template>
        <v-list-item-subtitle>
          <span v-if="hasDims(item.raw)">{{ dimsFull(item.raw) }}</span>
          <span v-if="item.raw.weight != null">
            · {{ $t('global.commons.weight') || 'Weight' }}
            {{ fmtNum(item.raw.weight) }}{{ weightUnit }}
          </span>
        </v-list-item-subtitle>
      </v-list-item>
    </template>

    <!-- Append action when there ARE items -->
    <template #append-item>
      <v-divider class="my-1" />
      <v-list-item class="text-start py-2"
                   :title="defineLabel"
                   role="button"
                   append-icon="open_in_new"
                   @click.stop.prevent="openDefinePage">
        <v-list-item-subtitle>
          {{ $t('transportation_boxes_input.define_package_hint') }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>

    <!-- When there are NO items, show the same action via no-data -->
    <template #no-data>
      <v-list-item class="text-start py-2"
                   :title="defineLabel"
                   role="button"
                   append-icon="open_in_new"
                   @click.stop.prevent="openDefinePage">
        <v-list-item-subtitle>
          {{ $t('transportation_boxes_input.define_package_hint_empty') }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import { throttle } from "lodash-es";
import { defineComponent } from "vue";
import UCube from "@selldone/components-vue/ui/cube/UCube.vue";

type BoxItem = {
  id: number | string;
  name: string;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  weight?: number | string | null;
  [k: string]: any;
};

export const DEFINE_ID = "__DEFINE_PACKAGE__";

export default defineComponent({
  name: "BBoxInput",
  components: { UCube },
  emits: ["update:modelValue", "click:clear"],
  inject: ["$shop", "$vendor"],

  props: {
    modelValue: { default: null },
    variant: { default: "underlined" },
    returnObject: { type: Boolean, default: true },
    limit: { type: Number, default: 20 },
    dimensionUnit: { type: String, default: "cm" },
    weightUnit: { type: String, default: "kg" },
  },

  data() {
    return {
      boxes: [] as BoxItem[],
      total: 0,
      busy: false,
      search: null as string | null,
    };
  },

  computed: {
    isVendor(): boolean {
      // Provided by host
      // @ts-ignore
      return !!(this.$vendor && this.$vendor.id);
    },
    API(): any {
      // Vendor host uses window.VAPI; shop host uses window.API
      // @ts-ignore
      return this.isVendor ? (window as any).VAPI : (window as any).API;
    },
    ownerId(): number | string {
      // @ts-ignore
      return this.isVendor ? this.$vendor.id : this.$shop.id;
    },
    defineLabel(): string {
      return (this.$t("transportation_boxes_input.define_package") as string);
    },
    descMessage(): string {
      const v = this.asObject(this.modelValue);
      if (!v) return "";
      const parts: string[] = [];
      const dims = this.dimsFull(v);
      if (dims) parts.push(dims);
      if (v.weight != null) {
        parts.push(`${(this.$t("global.commons.weight") as string) || "Weight"} ${this.fmtNum(v.weight)}${this.weightUnit}`);
      }
      return parts.join(" · ");
    },
    // Only logical change: if there are no boxes and search is empty, show a single virtual item
    itemsUi(): BoxItem[] {
      const empty = !this.boxes || this.boxes.length === 0;
      const noSearch = !this.search || String(this.search).trim() === "";
      if (empty && noSearch) {
        return [{ id: DEFINE_ID, name: this.$t("global.commons.empty") }] as BoxItem[];
      }
      return this.boxes;
    },
  },

  watch: {
    search: throttle(function () {
      this.getBoxes();
    }, (window as any).SERACH_THROTTLE || 400),
  },

  created() {
    this.getBoxes();
  },

  methods: {
    // Formatters
    toNum(x: any): number | undefined {
      if (x === null || x === undefined || x === "") return undefined;
      const n = typeof x === "number" ? x : parseFloat(String(x));
      return isNaN(n) ? undefined : n;
    },
    fmtNum(x: any): string {
      const n = this.toNum(x);
      return n === undefined ? "" : (Math.round(n * 1000) / 1000).toString();
    },

    // UI helpers
    hasDims(b: Partial<BoxItem>): boolean {
      return (
        this.toNum(b.length) !== undefined &&
        this.toNum(b.width) !== undefined &&
        this.toNum(b.height) !== undefined
      );
    },
    dimsShort(b: Partial<BoxItem>): string {
      if (!this.hasDims(b)) return this.dimensionUnit.toUpperCase();
      const L = this.fmtNum(b.length);
      const W = this.fmtNum(b.width);
      const H = this.fmtNum(b.height);
      return `${L}×${W}×${H}${this.dimensionUnit}`;
    },
    dimsFull(b: Partial<BoxItem>): string {
      if (!this.hasDims(b)) return "";
      const L = this.fmtNum(b.length);
      const W = this.fmtNum(b.width);
      const H = this.fmtNum(b.height);
      return `${L} × ${W} × ${H} ${this.dimensionUnit}`;
    },
    isObject(val: any): boolean {
      return val !== null && typeof val === "object" && !Array.isArray(val);
    },
    asObject(val: any): BoxItem | null {
      if (!val) return null;
      return this.isObject(val)
        ? (val as BoxItem)
        : this.boxes.find((b) => String(b.id) === String(val)) || null;
    },

    // Events
    onUpdate(val: any) {
      // If the virtual item is selected, open the define page and revert selection
      const id = this.isObject(val) ? (val as BoxItem).id : val;
      if (id === DEFINE_ID) {
        this.openDefinePage();
        this.$nextTick(() => this.$emit("update:modelValue", this.modelValue));
        return;
      }
      this.$emit("update:modelValue", val);
    },
    onClear() {
      this.$emit("click:clear");
      this.getBoxes();
    },

    // Navigation (target=_blank)
    openDefinePage() {
      const route = this.isVendor
        ? { name: "VPageVendorShippingBoxes", params: { vendor_id: this.ownerId } }
        : { name: "BPageShopLogisticBoxes",   params: { shop_id: this.ownerId } };

      // @ts-ignore
      if (this.$router?.resolve) {
        const { href } = this.$router.resolve(route);
        window.open(href, "_blank");
      } else {
        window.open(`#/${route.name}`, "_blank");
      }
    },

    // API
    listUrl(): string {
      return this.isVendor
        ? (this as any).API.GET_MY_VENDOR_BOXES(this.ownerId)
        : (this as any).API.GET_SHOP_BOXES(this.ownerId);
    },

    getBoxes() {
      this.busy = true;
      (window as any).axios
        .get(this.listUrl(), {
          params: {
            offset: 0,
            limit: this.limit,
            sortBy: "id",
            sortDesc: true,
            search: this.search,
          },
        })
        .then(({ data }: any) => {
          this.boxes = (data?.boxes ?? []) as BoxItem[];
          this.total = data?.total ?? this.boxes.length;
        })
        .catch((e: any) => console.error(e))
        .finally(() => (this.busy = false));
    },
  },
});
</script>

<style lang="scss" scoped></style>
