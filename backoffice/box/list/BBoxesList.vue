<!--
  - Copyright (c) 2025. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  - BPageShopLogisticBoxes — Manage seller-defined shipping boxes (shop-level)
  - UI pattern follows BPageTransportationPickups:
  -  • <u-widget-header> with add action
  -  • widget-box container, bottom action bar style
  -  • API calls strictly via window.API.* / window.VAPI.* (no manual path building)
  -  • Material Icons via <v-icon> with official names
  -  • DB auto-increment id is used (no client uid)
-->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ━━━━━━━━━━━━━━━━━━ BPageShopLogisticBoxes ━━━━━━━━━━━━━━━━━━ -->
  <div class="py-10">




    <div class="widget-box -large mb-5 min-height-50vh">
      <u-widget-header
        :title="$t('transportation_boxes.title')"
        icon="inventory_2"
        :add-caption="$t('transportation_boxes.add_action')"
        @click:add="openCreateDialog()"
      />

      <v-list-subheader>
        {{ $t("transportation_boxes.subtitle") }}
      </v-list-subheader>

      <u-loading-progress v-if="busy_fetch" />

      <!-- Top tools (search) -->
      <v-row align="center" no-gutters>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          :placeholder="$t('global.commons.search')"
          class="max-width-field"
          clearable
          hide-details
          prepend-inner-icon="search"
          single-line
          variant="plain"
        />
      </v-row>

      <!-- Server-side data table -->
      <v-data-table-server
        :mobile="$vuetify.display.xs"
        v-model:options="options"
        :page="page"
        v-model:sort-by="sortBy"
        :header-props="{ sortByText: $t('global.commons.sort_by') }"
        :headers="headers"
        :items="boxes"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :loading-text="$t('global.commons.waiting_load_data')"
        :row-props="() => ({ class: 'row-hover' })"
        class="bg-transparent min-height-60vh"
        density="compact"
        hide-default-footer
        item-key="id"
        @click:row="(_, r) => openEditDialog(r.item)"
      >



        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <u-cube  v-if="item?.width && item?.length && item?.height"     :size="24"
                     :x="item?.width"
                     :y="item?.length"
                     :z="item?.height" class="me-1 d-inline"
                     noAnimation
            ></u-cube>
            <b>{{ item.name }}</b>
          </div>
        </template>


        <template #item.length="{ item }">
          <span>{{ item.length }}</span> <small>{{size_unit}}</small>
        </template>
        <template #item.width="{ item }">
          <span>{{ item.width }}</span> <small>{{size_unit}}</small>
        </template>
        <template #item.height="{ item }">
          <span>{{ item.height }}</span> <small>{{size_unit}}</small>
        </template>
        <template #item.weight="{ item }">
          <span>{{ item.weight }}</span> <small>{{mass_unit}}</small>
        </template>

        <template #item.actions="{ item }">
          <u-smart-menu
            :items="[
              {
                title: $t('global.actions.delete'),
                icon: 'clear',
                click: () => removeBox(item),
              },
            ]"
          >
          </u-smart-menu>
        </template>

        <template #no-data>
          <div class="pa-6 text-medium-emphasis">
            {{ $t("transportation_boxes.empty") }}
          </div>
        </template>

        <!-- Footer pagination -->
        <template #bottom>
          <v-pagination v-model="page" :length="pageCount" rounded />
        </template>
      </v-data-table-server>


      <!-- Dialog: Create / Edit Box -->
      <v-bottom-sheet
        v-model="dialog"
        max-width="720"
        width="98vw"
        content-class="rounded-t-xl"
        scrollable
        attach
      >
        <v-card rounded="t-xl">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">inventory_2</v-icon>
            <span>
              {{
                editMode
                  ? $t("transportation_boxes.edit")
                  : $t("transportation_boxes.new")
              }}
            </span>
            <v-spacer></v-spacer>
            <v-btn icon variant="text" @click="dialog = false">
              <v-icon>close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>


            <u-cube  v-if="form?.width && form?.length && form?.height"     :size="100"
                          :x="form?.width"
                          :y="form?.length"
                          :z="form?.height"
                         ></u-cube>



            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.name"
                  :label="$t('global.commons.name')"
                  variant="underlined"
                  clearable
                  :rules="[GlobalRules.required()]"
                  :counter="255"
                  hide-details
                />
                <u-smart-suggestion
                  :samples="$tm('suggestions.boxes.name')"
                  class="mb-4"
                  @select="(v) => (form.name = v)"
                ></u-smart-suggestion>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="4">
                <u-number-input
                  v-model="form.length"
                  :min="0"
                  :step="1"
                  :decimal="3"
                  :label="$t('global.commons.length')"
                  variant="underlined"
                  :rules="[GlobalRules.required()]"
                  :prefix="size_unit"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <u-number-input
                  v-model="form.width"
                  :min="0"
                  :step="1"
                  :decimal="3"
                  :label="$t('global.commons.width')"
                  variant="underlined"
                  :rules="[GlobalRules.required()]"
                  :prefix="size_unit"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <u-number-input
                  v-model="form.height"
                  :min="0"
                  :step="1"
                  :decimal="3"
                  :label="$t('global.commons.height')"
                  variant="underlined"
                  :rules="[GlobalRules.required()]"
                  :prefix="size_unit"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <u-number-input
                  v-model="form.weight"
                  :min="0"
                  :step="1"
                  :decimal="3"
                  :label="$t('transportation_boxes.default_weight')"
                  variant="underlined"
                  :prefix="mass_unit"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="justify-end">
            <div class="widget-buttons">
              <v-btn
                @click="dialog = false"
                size="x-large"
                prepend-icon="close"
                variant="text"
              >
                {{ $t("global.actions.cancel") }}
              </v-btn>
              <v-btn
                :loading="busy"
                color="primary"
                @click="submit"
                variant="elevated"
                :prepend-icon="editMode ? 'save' : 'add'"
                size="x-large"
                :disabled="!(form?.width && form?.length && form?.height && form.name) "
              >
                {{
                  editMode
                    ? $t("global.actions.save_changes")
                    : $t("global.actions.create")
                }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-bottom-sheet>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import GlobalRules from "@selldone/core-js/helper/rules/GlobalRules.ts";
import UNumberInput from "@selldone/components-vue/ui/number/input/UNumberInput.vue";
import { throttle } from "lodash-es";
import USmartMenu from "@selldone/components-vue/ui/smart/menu/USmartMenu.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper";
import UCube from "@selldone/components-vue/ui/cube/UCube.vue";
import USmartSuggestion from "@selldone/components-vue/ui/smart/suggestion/USmartSuggestion.vue";

export default {
  name: "BBoxesList",
  components: { USmartSuggestion, UCube, USmartMenu, UNumberInput, UWidgetHeader },

  // shared for Shop & Vendor hosts
  inject: ["$shop", "$vendor"],

  data: () => ({
    // list
    boxes: [] as any[],

    // fetching flags
    busy: false,
    busy_fetch: false,

    // pagination & sorting (server)
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {} as any,
    sortBy: [{ key: "id", order: "desc" }] as any[],

    // search
    search: null as string | null,

    // dialog
    dialog: false,
    editMode: false,
    form: {
      id: null as number | null,
      name: "",
      length: null as number | null,
      width: null as number | null,
      height: null as number | null,
      weight: null as number | null,
    },

    // table headers
    headers: [
      { title: "Name", key: "name", sortable: true, align: "start" },
      { title: "L", key: "length", sortable: true, align: "end" },
      { title: "W", key: "width", sortable: true, align: "end" },
      { title: "H", key: "height", sortable: true, align: "end" },
      { title: "Weight", key: "weight", sortable: true, align: "end" },
      { title: "Actions", key: "actions", sortable: false, align: "end" },
    ],
  }),

  computed: {
    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.$shop);
    },
    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.$shop);
    },

    GlobalRules() {
      return GlobalRules;
    },

    isVendor(): boolean {
      return !!(this as any).$vendor && !!(this as any).$vendor.id;
    },

    API(): any {
      return this.isVendor ? (window as any).VAPI : (window as any).API;
    },

    ownerId(): string | number {
      return this.isVendor ? (this as any).$vendor.id : (this as any).$shop.id;
    },

    pageCount(): number {
      return Math.ceil(this.totalItems / this.itemsPerPage) || 1;
    },
  },

  watch: {
    // server table driver
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchBoxes(
          page || this.page,
          sortBy?.[0]?.key || this.sortBy?.[0]?.key || "id",
          (sortBy?.[0]?.order || this.sortBy?.[0]?.order || "desc") === "desc",
          itemsPerPage || this.itemsPerPage,
        );
      },
      deep: true,
    },

    // throttled search
    search: throttle(
      function () {
        const { sortBy, itemsPerPage } = this.options;
        this.page = 1;
        this.fetchBoxes(
          1,
          sortBy?.[0]?.key || this.sortBy?.[0]?.key || "id",
          (sortBy?.[0]?.order || this.sortBy?.[0]?.order || "desc") === "desc",
          itemsPerPage || this.itemsPerPage,
        );
      },
      (window as any).SERACH_THROTTLE || 500,
    ),
  },

  created() {
    // initialize options for first fetch
    this.options = {
      page: this.page,
      itemsPerPage: this.itemsPerPage,
      sortBy: this.sortBy,
    };
  },

  methods: {
    // -------------------- Fetch (Server) --------------------
    fetchBoxes(
      page = 1,
      sortKey: string | null = "id",
      sortDesc = true,
      ipp?: number,
    ) {
      this.busy_fetch = true;
      this.page = page;
      if (ipp) this.itemsPerPage = ipp;

      // vendor: VAPI.GET_MY_VENDOR_BOXES(vendor_id)
      // shop  : API.GET_SHOP_BOXES(shop_id)
      const url = this.isVendor
        ? this.API.GET_MY_VENDOR_BOXES(this.ownerId)
        : this.API.GET_SHOP_BOXES(this.ownerId);

      axios
        .get(url, {
          params: {
            offset: (this.page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortKey,
            sortDesc: !!sortDesc,
            search: this.search,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            // Accept flexible payloads
            this.boxes = data.boxes || data.items || data.data || [];
            this.totalItems =
              data.total ?? data.totalItems ?? this.boxes.length;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    // -------------------- UI / Dialog --------------------
    openCreateDialog() {
      this.editMode = false;
      this.form = {
        id: null,
        name: "",
        length: 20,
        width: 20,
        height: 10,
        weight: 1,
      } as any;
      this.dialog = true;
    },

    openEditDialog(box: any) {
      this.editMode = true;
      this.form = {
        id: box.id,
        name: box.name,
        length: box.length,
        width: box.width,
        height: box.height,
        weight: box.weight,
      } as any;
      this.dialog = true;
    },

    // -------------------- Create / Update --------------------
    submit() {
      if (
        !this.form.name ||
        this.form.length == null ||
        this.form.width == null ||
        this.form.height == null
      ) {
        NotificationService.showErrorAlert(
          null,
          this.$t("global.messages.fill_required"),
        );
        return;
      }

      this.busy = true;

      const payload = {
        name: this.form.name,
        length: this.form.length,
        width: this.form.width,
        height: this.form.height,
        weight: this.form.weight,
      };

      if (this.editMode && this.form.id) {
        const url = this.isVendor
          ? this.API.PUT_MY_VENDOR_BOXES_EDIT(
              this.ownerId,
              String(this.form.id),
            )
          : this.API.PUT_SHOP_BOXES_EDIT(this.ownerId, String(this.form.id));

        axios
          .put(url, payload)
          .then(({ data }) => {
            if (!data.error) {
              NotificationService.showSuccessAlert(
                null,
                this.$t("transportation_boxes.updated"),
              );
              this.dialog = false;
              this.fetchBoxes(
                this.page,
                this.sortBy?.[0]?.key,
                this.sortBy?.[0]?.order === "desc",
                this.itemsPerPage,
              );
            } else {
              NotificationService.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => NotificationService.showLaravelError(error))
          .finally(() => (this.busy = false));
      } else {
        const url = this.isVendor
          ? this.API.POST_MY_VENDOR_BOXES_ADD(this.ownerId)
          : this.API.POST_SHOP_BOXES_ADD(this.ownerId);

        axios
          .post(url, payload)
          .then(({ data }) => {
            if (!data.error) {
              NotificationService.showSuccessAlert(
                null,
                this.$t("transportation_boxes.created"),
              );
              this.dialog = false;
              this.fetchBoxes(
                this.page,
                this.sortBy?.[0]?.key,
                this.sortBy?.[0]?.order === "desc",
                this.itemsPerPage,
              );
            } else {
              NotificationService.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => NotificationService.showLaravelError(error))
          .finally(() => (this.busy = false));
      }
    },

    // -------------------- Delete --------------------
    removeBox(box: any) {
      if (!box?.id) return;
      this.busy = true;

      const url = this.isVendor
        ? this.API.DELETE_MY_VENDOR_BOX(this.ownerId, String(box.id))
        : this.API.DELETE_SHOP_BOX(this.ownerId, String(box.id));

      axios
        .delete(url)
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t("transportation_boxes.deleted"),
            );
            this.fetchBoxes(
              this.page,
              this.sortBy?.[0]?.key,
              this.sortBy?.[0]?.order === "desc",
              this.itemsPerPage,
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy = false));
    },
  },
};
</script>

<style lang="scss" scoped></style>
