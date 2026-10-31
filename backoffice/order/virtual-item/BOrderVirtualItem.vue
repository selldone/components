<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <section v-if="modern" class="b-order-virtual-item-modern text-start" :aria-label="`VIT-${virtualItem.id}`">
    <header class="b-order-virtual-item-modern__header">
      <h4><bdi>VIT-{{ virtualItem.id }}</bdi></h4>
      <v-progress-linear
        v-if="has_progress"
        :model-value="fill_percent"
        :aria-label="$t('process_center.forms.progress_help')"
        :aria-valuetext="$t('process_center.forms.record_progress', { recorded: recorded_count, total: output_fields.length })"
        class="b-order-virtual-item-modern__progress no-inv"
        color="primary"
        height="3"
        rounded
      />
      <span class="b-order-virtual-item-modern__count">{{ $t('process_center.forms.record_progress', { recorded: recorded_count, total: output_fields.length }) }}</span>
    </header>

    <!-- Output values remain independent records; editing does not advance the order. -->
    <v-table v-if="output_fields.length" class="sd-modern-table b-order-virtual-item-modern__table">
      <thead>
        <tr>
          <th scope="col">{{ $t('process_center.forms.field_label') }}</th>
          <th scope="col">{{ $t('virtual_process_center.outputs_widget.table.value') }}</th>
          <th scope="col" :aria-label="$t('process_center.forms.copy_value')"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in output_fields" :key="item.name || index">
          <td class="b-order-virtual-item-modern__field-label">
            <label :for="edit_mode ? `vit-${virtualItem.id}-field-${index}` : undefined">{{ item.title || item.name || '—' }}</label>
          </td>
          <td>
            <template v-if="edit_mode && item.name">
              <v-text-field
                v-if="!item.type || item.type === 'text'"
                :id="`vit-${virtualItem.id}-field-${index}`"
                v-model="new_virtual_product_data[item.name]"
                :aria-label="item.title || item.name"
                :disabled="busy"
                class="sd-modern-underlined-field b-order-virtual-item-modern__editor"
                variant="underlined"
                density="compact"
                hide-details
              />
              <v-select
                v-else-if="item.type === 'select'"
                :id="`vit-${virtualItem.id}-field-${index}`"
                v-model="new_virtual_product_data[item.name]"
                :items="Array.isArray(item.selects) ? item.selects : []"
                :aria-label="item.title || item.name"
                :disabled="busy"
                class="sd-modern-underlined-field b-order-virtual-item-modern__editor"
                variant="underlined"
                density="compact"
                hide-details
              />
              <v-checkbox
                v-else-if="item.type === 'switch'"
                :id="`vit-${virtualItem.id}-field-${index}`"
                v-model="new_virtual_product_data[item.name]"
                :label="item.title || item.name"
                :disabled="busy"
                class="b-order-virtual-item-modern__switch sd-modern-control-colors"
                color="primary"
                density="compact"
                hide-details
              />
              <template v-else>
                <bdi>{{ new_virtual_product_data[item.name] }}</bdi>
                <p class="b-order-virtual-item-modern__hint">{{ $t('process_center.forms.unsupported_field') }}</p>
              </template>
            </template>
            <bdi v-else-if="hasRecordedValue(new_virtual_product_data[item.name])" class="b-order-virtual-item-modern__value">{{ new_virtual_product_data[item.name] }}</bdi>
            <span v-else class="b-order-virtual-item-modern__hint">{{ $t('process_center.forms.empty_value') }}</span>
          </td>
          <td class="b-order-virtual-item-modern__copy-cell">
            <v-btn
              icon
              variant="text"
              class="sd-modern-icon-button b-order-virtual-item-modern__copy"
              :disabled="!hasRecordedValue(new_virtual_product_data[item.name])"
              :aria-label="$t('process_center.forms.copy_value') + ': ' + (item.title || item.name || '—')"
              @click="copyToClipboard(new_virtual_product_data[item.name])"
            >
              <v-icon size="16" aria-hidden="true">content_copy</v-icon>
              <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.forms.copy_value') }}</v-tooltip>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
    <p v-else class="sd-modern-empty-state b-order-virtual-item-modern__empty">{{ $t('process_center.forms.empty_fields') }}</p>

    <footer v-if="output_fields.length" class="b-order-virtual-item-modern__footer">
      <span class="b-order-virtual-item-modern__hint">{{ $t('process_center.forms.record_hint') }}</span>
      <div class="b-order-virtual-item-modern__actions">
        <v-btn class="sd-modern-button" variant="outlined" :disabled="busy" :aria-expanded="edit_mode" @click="edit_mode = !edit_mode">
          <v-icon size="17" start aria-hidden="true">{{ edit_mode ? 'close' : 'edit' }}</v-icon>
          {{ edit_mode ? $t('global.actions.close') : $t('process_center.forms.edit_values') }}
        </v-btn>
        <v-btn v-if="edit_mode" class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :loading="busy" @click="editVirtualProduct()">
          <v-icon size="17" start aria-hidden="true">save</v-icon>
          {{ $t('global.actions.save') }}
        </v-btn>
      </div>
    </footer>
  </section>
  <div v-else style="min-height: 150px">
    <u-widget-header
      :add-caption="$t('add_virtual_item.edit_outputs')"
      :title="`VIT-${virtualItem.id}`"
      :to="{
        name: 'BPageProductEdit',
        params: { product_id: product.id },
        hash: '#outputs',
      }"
      add-icon="settings_suggest"
      add-text
      icon="output"
    >
    </u-widget-header>

    <v-list-subheader
      >This section is designated for displaying output information. When a
      customer purchases 3 units of a product, the system automatically assigns
      3 virtual records to the user. You can view and edit the values for those
      records here.
    </v-list-subheader>

    <div class="d-flex text-muted">
      <div class="me-3">
        <v-icon class="me-1" color="#512DA8" size="small"> shield</v-icon>
        {{ $t("virtual_process_center.outputs_widget.title") }}
        <br />
        <v-progress-linear
          v-if="has_progress"
          :model-value="fill_percent"
          class="mt-2"
          color="#512DA8"
          rounded
          striped
          style="width: 166px"
        ></v-progress-linear>
      </div>
    </div>

    <div class="text-start">
      <!-- show user input data to admin -->

      <v-table class="bg-transparent">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-start">
                {{ $t("virtual_process_center.outputs_widget.table.title") }}
              </th>
              <th class="text-start">
                {{ $t("virtual_process_center.outputs_widget.table.value") }}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in product.outputs"
              :key="item.name"
              class="text-start"
            >
              <td class="w-50">
                {{ item.title }}
              </td>
              <td class="w-50 min-width-200">
                <b v-if="!edit_mode">
                  {{ new_virtual_product_data[item.name] }}
                </b>

                <!-- Normal -->
                <v-text-field
                  v-if="edit_mode && (!item.type || item.type === 'text')"
                  v-model="new_virtual_product_data[item.name]"
                  :label="item.name"
                  class="m-1 max-width-field"
                  density="compact"
                  flat
                  hide-details
                  single-line
                  variant="solo-filled"
                />

                <!-- Select -->
                <v-select
                  v-else-if="edit_mode && item.type === 'select'"
                  v-model="new_virtual_product_data[item.name]"
                  :items="item.selects"
                  :label="item.title"
                  class="m-1 max-width-field"
                  hide-details
                  single-line
                  variant="filled"
                />
                <!-- Boolean -->
                <v-checkbox
                  v-else-if="edit_mode && item.type === 'switch'"
                  v-model="new_virtual_product_data[item.name]"
                  :label="item.title"
                  class="m-1 max-width-field"
                  hide-details
                />
                <small v-else-if="edit_mode"
                  >{{ item.type }} | Not supported yet</small
                >
              </td>

              <td>
                <v-btn
                  icon
                  variant="text"
                  @click="copyToClipboard(new_virtual_product_data[item.name])"
                >
                  <v-icon size="small">fa:fas fa-copy</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-table>

      <div class="widget-buttons">
        <v-slide-x-transition class="widget-buttons" group hide-on-leave>
          <v-btn
            key="1"
            color="primary"
            size="x-large"
            variant="text"
            @click="edit_mode = !edit_mode"
          >
            <v-icon class="me-1">{{ edit_mode ? "close" : "edit" }}</v-icon>
            {{ edit_mode ? $t("global.actions.close") : "Edit values" }}
          </v-btn>

          <v-btn
            v-if="edit_mode"
            key="2"
            :loading="busy"
            color="primary"
            size="x-large"
            title="Save"
            @click="editVirtualProduct()"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </v-slide-x-transition>
      </div>

      <!-- Step 2 : Verify Order -->

      <div v-if="virtualItem.status === 'Payed'">
        <ul class="tips mt-4">
          <li
            v-for="item in $tm('virtual_process_center.outputs_widget.tips')"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">


import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BOrderVirtualItem",
  mixins: [],
  components: {},
  emits: ["edit"],
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      require: true,
      type: Object,
    },

    basket: {
      require: true,
      type: Object,
    },
    buyItem: {
      require: true,
    },

    product: {
      require: true,
      type: Object,
    },

    virtualItem: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      edit_mode: false,
      new_virtual_product_data: {},
      busy: false,

      confirm_by_admin: false,
    };
  },

  computed: {
    output_fields() {
      return Array.isArray(this.product.outputs)
        ? this.product.outputs.filter((item) => item && typeof item === "object")
        : [];
    },
    recorded_count() {
      return this.output_fields.filter((item) => this.hasRecordedValue(this.new_virtual_product_data[item.name])).length;
    },
    has_progress() {
      if (this.modern) return this.output_fields.length > 0;
      return this.product.outputs.length > 0;
    },
    fill_percent() {
      if (this.modern) return this.output_fields.length ? this.recorded_count / this.output_fields.length * 100 : 0;
      let out = 0;
      const x = 100 / this.product.outputs.length;
      this.product.outputs.forEach((item) => {
        out +=
          this.virtualItem.data &&
          ![null, undefined, ""].includes(this.virtualItem.data[item.name])
            ? x
            : 0;
      });

      return out;
    },
  },
  watch: {
    virtualItem(next, previous) {
      if (!this.modern) return;
      if (next.id !== previous?.id) this.edit_mode = false;
      else if (this.edit_mode || this.busy) return;
      this.syncRecordData();
    },
  },
  created() {
    if (this.modern) {
      this.syncRecordData();
      return;
    }
    if (Array.isArray(this.virtualItem.data)) this.virtualItem.data = {};
    this.new_virtual_product_data = this.virtualItem.data;
  },

  methods: {
    hasRecordedValue(value) {
      return ![null, undefined, ""].includes(value);
    },
    syncRecordData() {
      this.new_virtual_product_data = this.virtualItem.data && typeof this.virtualItem.data === "object" && !Array.isArray(this.virtualItem.data)
        ? this.virtualItem.data
        : {};
    },
    editVirtualProduct() {
      if (this.modern && this.busy) return;
      const record_id = this.virtualItem.id;
      let t = this;
      this.busy = true;
      axios
        .put(
          window.API.EDIT_VIRTUAL_ITEM(
            this.shop.id,
            this.product.id,
            this.virtualItem.id,
          ),
          {
            data: this.new_virtual_product_data,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("add_virtual_item.notifications.edit_success"),
            );
            t.$emit("edit", data.virtual_item);
            if (this.modern && this.virtualItem.id !== record_id) return;
            this.virtualItem.data = data.virtual_item.data;
            if (this.modern) this.syncRecordData();
            this.edit_mode = false;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          t.busy = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.b-order-virtual-item-modern {
  min-width: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;

  & + & {
    margin-block-start: 20px;
    padding-block-start: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-block: 8px 10px;
  }

  &__header > h4 {
    margin: 0;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
  }

  &__progress {
    flex: 0 1 100px;
    min-width: 55px;
  }

  &__count {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }

  &__table {
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    line-height: 20px;

    :deep(.v-table__wrapper > table) {
      width: 100%;
      table-layout: fixed;
    }

    :deep(thead th:first-child) {
      width: 32%;
    }

    :deep(thead th:last-child) {
      width: 52px;
    }

    :deep(thead th),
    :deep(tbody td) {
      padding: 12px 10px;
      text-align: start;
    }

    :deep(tbody td) {
      height: auto;
      font-size: 13px;
      line-height: 20px;
      vertical-align: middle;
      overflow-wrap: anywhere;
    }

    :deep(tbody tr:last-child td) {
      border-block-end: 0;
    }
  }

  &__value {
    display: inline-block;
    min-height: 32px;
    align-content: center;
    white-space: pre-wrap;
  }

  &__editor {
    --sd-modern-field-height: 40px;
    min-width: 0;
    margin: 0;

    :deep(.v-field--variant-underlined .v-field__input) {
      padding-block: 8px;
      font-size: 13px;
      line-height: 20px;
    }

    :deep(.v-select__selection-text) {
      white-space: normal;
      overflow-wrap: anywhere;
    }
  }

  &__switch :deep(.v-label) {
    font-family: inherit;
    font-size: 13px;
    line-height: 20px;
    opacity: 1;
  }

  &__copy-cell {
    text-align: end !important;
  }

  &__copy {
    --sd-modern-icon-button-size: 32px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-block-start: 14px;
  }

  &__hint {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }

  &__empty {
    padding-block: 14px;
    text-align: start;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-inline-start: auto;
  }

  &__actions > .sd-modern-button {
    padding: 8px 14px;
    font-family: inherit;
    font-size: 12px;
    line-height: 18px;
  }

  @media (max-width: 640px) {
    &__table {
      :deep(.v-table__wrapper > table),
      :deep(tbody) {
        display: block;
      }

      :deep(thead) {
        display: none;
      }

      :deep(tbody tr) {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 44px;
        gap: 5px 10px;
        padding-block: 13px;
        border-block-end: 1px solid var(--sd-modern-border);
      }

      :deep(tbody tr:last-child) {
        border-block-end: 0;
      }

      :deep(tbody td) {
        display: block;
        min-width: 0;
        // The shared table intentionally forces desktop insets; stacked cells share a row divider.
        padding: 0 !important;
        border-block-end: 0 !important;
      }

      :deep(tbody td:first-child),
      :deep(tbody td:nth-child(2)) {
        grid-column: 1;
      }

      :deep(tbody td:first-child) {
        color: var(--sd-modern-muted);
        font-size: 12px;
        line-height: 18px;
      }

      :deep(tbody td:last-child) {
        grid-column: 2;
        grid-row: 1 / 3;
        align-self: center;
      }
    }
  }

  @media (max-width: 640px), (pointer: coarse) {
    &__copy {
      --sd-modern-icon-button-size: 44px;
    }

    &__editor :deep(.v-field--variant-underlined .v-field__input) {
      font-size: 16px;
    }
  }
}
</style>
