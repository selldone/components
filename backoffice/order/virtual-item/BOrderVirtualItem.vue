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
  <div style="min-height: 150px">
    <s-widget-header
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
    </s-widget-header>

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

<script>
export default {
  name: "BOrderVirtualItem",
  components: {},
  props: {
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
    has_progress() {
      return this.product.outputs.length > 0;
    },
    fill_percent() {
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
  created() {
    if (Array.isArray(this.virtualItem.data)) this.virtualItem.data = {};
    this.new_virtual_product_data = this.virtualItem.data;
  },

  methods: {
    editVirtualProduct() {
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
            t.showErrorAlert(null, data.error_msg);
          } else {
            t.showSuccessAlert(
              null,
              this.$t("add_virtual_item.notifications.edit_success"),
            );
            t.$emit("edit", data.virtual_item);
            this.virtualItem.data = data.virtual_item.data;
            this.edit_mode = false;
          }
        })
        .catch((error) => {
          t.showLaravelError(error);
        })
        .finally(() => {
          t.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
