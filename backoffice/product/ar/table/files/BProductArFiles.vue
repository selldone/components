<!-- Copyright (c) Selldone® Business OS™. Author: M.Pajuhaan. All rights reserved. -->
<template>
  <v-table class="sd-modern-table b-product-ar-files">
    <thead>
      <tr>
        <th>{{ $t("product_ar.format") }}</th>
        <th>{{ $t("product_ar.file") }}</th>
        <th>{{ $t("product_ar.size") }}</th>
        <th class="text-end">{{ $t("product_ar.actions") }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="file in files" :key="file.type">
        <td class="b-product-ar-files__type">
          <span class="b-product-ar-files__format"
            ><bdi>{{ file.format }}</bdi></span
          >
          <span
            ><strong>{{
              $t(
                file.type === "src"
                  ? "product_ar.web_android"
                  : "product_ar.ios",
              )
            }}</strong
            ><small>{{ file.type === "src" ? "3D / AR" : "AR" }}</small></span
          >
        </td>
        <td class="b-product-ar-files__name">
          <template v-if="file.available">
            <v-tooltip location="top" content-class="sd-modern-tooltip">
              <template #activator="{ props }"
                ><span
                  v-bind="props"
                  class="b-product-ar-files__filename"
                  tabindex="0"
                  ><bdi>{{ file.name }}</bdi></span
                ></template
              >
              {{ file.name }}
            </v-tooltip>
            <small
              ><bdi>{{ file.folder }}</bdi></small
            >
          </template>
          <span v-else class="b-product-ar-files__missing">{{
            $t(file.type === "src" ? "product_ar.no_glb" : "product_ar.no_usdz")
          }}</span>
        </td>
        <td class="b-product-ar-files__size">
          <bdi v-if="file.available">{{
            numeralFormat(file.size, "0.[0] ib")
          }}</bdi>
        </td>
        <td>
          <div class="b-product-ar-files__actions">
            <template v-if="file.available">
              <v-btn
                v-if="file.type === 'src'"
                :disabled="!enabled"
                variant="text"
                icon
                class="sd-modern-icon-button"
                :aria-label="$t('product_ar.preview')"
                @click="$emit('preview')"
              >
                <v-icon>view_in_ar</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip"
                  >{{ $t("product_ar.preview") }}</v-tooltip
                >
              </v-btn>
              <v-btn
                :href="enabled ? file.url : undefined"
                :disabled="!enabled"
                target="_blank"
                rel="noopener noreferrer"
                variant="text"
                icon
                class="sd-modern-icon-button"
                :aria-label="$t('product_ar.download')"
              >
                <v-icon>download</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip"
                  >{{ $t("product_ar.download") }}</v-tooltip
                >
              </v-btn>
              <v-btn
                v-if="editable && enabled"
                :loading="file.type === 'src' ? busyDeleteSrc : busyDeleteIos"
                variant="text"
                icon
                class="sd-modern-icon-button"
                :aria-label="$t('product_ar.remove')"
                @click="$emit('remove', file.type)"
              >
                <v-icon>delete_outline</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip"
                  >{{ $t("product_ar.remove") }}</v-tooltip
                >
              </v-btn>
            </template>
            <v-btn
              v-else-if="editable && enabled"
              variant="text"
              color="primary"
              class="sd-modern-button sd-modern-button--small"
              prepend-icon="add"
              @click="$emit('upload', file.type)"
              >{{
                $t(
                  file.type === "src"
                    ? "product_ar.add_glb"
                    : "product_ar.add_usdz",
                )
              }}</v-btn
            >
          </div>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>
<script lang="ts">
export default {
  name: "BProductArFiles",
  props: {
    files: { type: Array, required: true },
    editable: Boolean,
    enabled: Boolean,
    busyDeleteSrc: Boolean,
    busyDeleteIos: Boolean,
  },
  emits: ["preview", "upload", "remove"],
};
</script>
<style scoped lang="scss">
.b-product-ar-files {
  background: transparent;
  :deep(.v-table__wrapper) {
    overflow: visible;
  }
  :deep(table) {
    width: 100%;
    table-layout: fixed;
  }
  th:nth-child(1) {
    width: 175px;
  }
  th:nth-child(3) {
    width: 90px;
  }
  th:nth-child(4) {
    width: 140px;
  }
  th {
    height: 31px !important;
  }
  td {
    height: 67px !important;
    padding: 10px 12px !important;
    font-size: 13px;
    line-height: 20px;
    border-radius: 0;
  }
  &__type {
    display: table-cell;
  }
  &__type > span {
    vertical-align: middle;
    display: inline-flex;
  }
  &__type > span:last-child {
    flex-direction: column;
    padding-inline-start: 10px;
  }
  strong {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  small {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__format {
    min-width: 38px;
    padding: 7px 5px;
    justify-content: center;
    border: 1px solid var(--sd-modern-border);
    background: var(--sd-modern-inset);
    border-radius: 7px;
    font-size: 10px;
    line-height: 20px;
  }
  &__filename,
  &__name small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
  &__filename bdi {
    unicode-bidi: isolate;
  }
  &__size,
  &__missing {
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__size {
    white-space: nowrap;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
  @media (max-width: 680px) {
    thead {
      display: none;
    }
    :deep(table),
    tbody {
      display: block;
      width: 100%;
    }
    tr {
      display: grid;
      grid-template-columns: minmax(105px, 0.85fr) minmax(0, 1fr);
      gap: 8px;
      padding: 12px;
      border-bottom: 1px solid var(--sd-modern-border);
    }
    tr:last-child {
      border-bottom: 0;
    }
    td {
      display: block;
      height: auto !important;
      padding: 0 !important;
      border: 0 !important;
      min-width: 0;
    }
    td:nth-child(1) {
      grid-column: 1;
      grid-row: 1;
    }
    td:nth-child(2) {
      grid-column: 2;
      grid-row: 1;
      align-self: center;
    }
    td:nth-child(3) {
      grid-column: 1;
      grid-row: 2;
      padding-inline-start: 48px !important;
      align-self: center;
    }
    td:nth-child(4) {
      grid-column: 2;
      grid-row: 2;
    }
    td.b-product-ar-files__type {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    &__format {
      flex: 0 0 38px;
    }
    &__type > span:last-child {
      padding-inline-start: 0;
      min-width: 0;
      flex: 1;
    }
  }
  @media (pointer: coarse) {
    &__actions {
      gap: 5px;
    }
  }
  @media (max-width: 480px) {
    td:nth-child(4) {
      grid-column: 1 / -1;
      grid-row: 3;
    }
  }
}
</style>
