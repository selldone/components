<template>
  <figure class="b-product-file-storage text-start">
    <figcaption class="b-product-file-storage__caption">
      {{ $t("product_file.modern.product_storage") }}.
      {{ $t("product_file.modern.product_storage_help") }}
    </figcaption>
    <u-chart-donut-leader
      v-if="slices.length"
      class="b-product-file-storage__chart"
      :slices="slices"
      :labels="slices.length"
      :min-label-share="0"
      :format="formatBytes"
      :aria-label="`${$t('product_file.modern.product_storage')}: ${formatBytes(total)}. ${$t('product_file.modern.product_storage_help')}`"
    >
      <template #tooltip="{ slice }">
        <div class="b-product-file-storage-tooltip text-start">
          <div class="b-product-file-storage-tooltip__title">
            <strong
              ><bdi>{{ slice.label }}</bdi></strong
            >
            <span dir="ltr">{{ formatBytes(slice.value) }}</span>
          </div>
          <ul>
            <li v-for="member in slice.members.slice(0, 5)" :key="member.key">
              <bdi>{{ member.label }}</bdi>
              <span dir="ltr">{{ formatBytes(member.value) }}</span>
            </li>
          </ul>
          <p v-if="slice.members.length > 5">
            {{
              $t("product_file.modern.more_files", {
                count: slice.members.length - 5,
              })
            }}
          </p>
        </div>
      </template>
    </u-chart-donut-leader>
    <p v-else class="b-product-file-storage__empty">
      {{ $t("product_file.modern.no_stored_files") }}
    </p>
  </figure>
</template>

<script lang="ts">
import numeral from "numeral";
import UChartDonutLeader from "../../../../../ui/chart/donut-leader/UChartDonutLeader.vue";
import {
  PALETTE,
  REST_COLOR,
} from "../../../../../ui/chart/donut-leader/donutSlices";

export default {
  name: "BProductFileStorageChart",
  components: { UChartDonutLeader },
  props: {
    files: { type: Array, required: true },
  },
  computed: {
    storedFiles() {
      return this.files
        .filter(
          (file) =>
            file &&
            !file.uploading &&
            Number.isFinite(file.size) &&
            file.size > 0 &&
            Number.isFinite(file.size * 1000),
        )
        .map((file, index) => ({
          key: `file-${file.id ?? index}`,
          label: String(file.name ?? ""),
          value: file.size * 1000,
        }))
        .sort((a, b) => b.value - a.value);
    },
    total() {
      return this.storedFiles.reduce((sum, file) => sum + file.value, 0);
    },
    formatGroups() {
      const groups = new Map();
      this.storedFiles.forEach((file) => {
        const dot = file.label.lastIndexOf(".");
        const format =
          dot > 0 && dot < file.label.length - 1
            ? file.label.slice(dot + 1).toUpperCase()
            : "";
        const key = format ? `format-${format}` : "format-none";
        if (!groups.has(key))
          groups.set(key, {
            key,
            label: format || this.$t("product_file.modern.unknown_format"),
            value: 0,
            members: [],
          });
        const group = groups.get(key);
        group.value += file.value;
        group.members.push(file);
      });
      return [...groups.values()].sort((a, b) => b.value - a.value);
    },
    slices() {
      const individual =
        this.formatGroups.length > 6
          ? this.formatGroups.slice(0, 5)
          : this.formatGroups;
      const rest = this.formatGroups.slice(individual.length);
      const slices = individual.map((group, index) => ({
        ...group,
        color: PALETTE[index],
      }));
      if (rest.length)
        slices.push({
          key: "other-formats",
          label: this.$t("product_file.modern.other_formats", {
            count: rest.length,
          }),
          value: rest.reduce((sum, group) => sum + group.value, 0),
          color: REST_COLOR,
          members: rest
            .flatMap((group) => group.members)
            .sort((a, b) => b.value - a.value),
        });
      return slices;
    },
  },
  methods: {
    formatBytes(value) {
      return numeral(value).format("0.[0] b");
    },
  },
};
</script>

<style scoped lang="scss">
.b-product-file-storage {
  container: product-file-storage / inline-size;
  position: relative;
  min-width: 0;
  margin: 0;

  &__caption {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  &__empty {
    margin: 4px 0 0;
    padding-block: 16px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__chart {
    width: 100%;
    height: 140px;
    max-width: 100%;
  }
  // Keep callouts at least 11px when the compact SVG scales to 250px wide.
  &__chart :deep(.b-donut__label) {
    font-size: 16px;
  }
  &__chart :deep(.b-donut__value) {
    font-size: 15px;
  }
  &__chart :deep(.b-donut__total) {
    font-size: 17px;
    font-weight: 500;
  }
}
.b-product-file-storage-tooltip {
  max-block-size: 220px;
  overflow: auto;
  font-size: 12px;
  line-height: 19px;

  &__title {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    align-items: baseline;
  }
  &__title strong {
    min-width: 0;
    font-weight: 500;
  }
  &__title > span,
  li > span {
    flex-shrink: 0;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  ul {
    display: grid;
    gap: 7px;
    padding: 0;
    margin: 10px 0 0;
    list-style: none;
  }
  li {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    align-items: baseline;
  }
  li bdi {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  p {
    margin: 9px 0 0;
    color: var(--sd-modern-muted);
  }
}
@container product-file-storage (max-width: 279px) {
  .b-product-file-storage__chart :deep(.b-donut__value) {
    font-size: 16px;
  }
}
</style>
