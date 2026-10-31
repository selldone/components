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
  <div :class="modern ? 'b-boxes-list--modern text-start' : 'py-10'">
    <header v-if="modern" class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"><v-icon>inventory_2</v-icon></span>
        <div>
          <h1 class="sd-modern-title-text b-boxes-list__title">{{ $t('transportation_boxes.title') }}</h1>
          <p class="sd-modern-subtitle">{{ $t('transportation_boxes.subtitle') }}</p>
        </div>
      </div>
      <v-btn v-if="canManageBoxes" class="sd-modern-button sd-modern-button--small" color="primary" variant="flat" prepend-icon="add" @click="openCreateDialog()">
        {{ $t('transportation_boxes.add_action') }}
      </v-btn>
    </header>
    <div class="s-table-loading" :class="modern ? 'sd-modern-widget b-boxes-list__widget' : 'widget-box -large mb-5 min-height-50vh'" :aria-busy="busy_fetch">
      <u-widget-header
        v-if="!modern"
        :title="$t('transportation_boxes.title')"
        icon="inventory_2"
        :add-caption="canManageBoxes ? $t('transportation_boxes.add_action') : undefined"
        @click:add="openCreateDialog()"
      />

      <v-list-subheader v-if="!modern">
        {{ $t("transportation_boxes.subtitle") }}
      </v-list-subheader>

      <u-loading-progress v-if="busy_fetch" />

      <!-- Top tools (search) -->
      <v-row :class="{ 'sd-modern-list-toolbar b-boxes-list__toolbar': modern }" align="center" no-gutters>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          :placeholder="$t('global.commons.search')"
          :aria-label="$t('global.commons.search')"
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
        :mobile="modern ? $vuetify.display.smAndDown : $vuetify.display.xs"
        v-model:options="options"
        :page="page"
        v-model:sort-by="sortBy"
        :header-props="{ sortByText: $t('global.commons.sort_by') }"
        :headers="headers"
        :items="boxes"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :loading-text="$t('global.commons.waiting_load_data')"
        :row-props="() => ({ class: canManageBoxes ? (modern ? 'sd-modern-clickable-item' : 'row-hover') : 'excluded' })"
        class="bg-transparent"
        :class="modern ? 'sd-modern-data-table sd-modern-data-table--compact' : 'min-height-60vh'"
        density="compact"
        hide-default-footer
        item-key="id"
        v-on="canManageBoxes ? { 'click:row': (_, r) => openEditDialog(r.item) } : {}"
      >



        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <u-cube  v-if="item?.width && item?.length && item?.height"     :size="24"
                     :x="item?.width"
                     :y="item?.length"
                     :z="item?.height" class="me-1 d-inline"
                     noAnimation
            ></u-cube>
            <span :class="modern ? 'font-weight-medium' : 'font-weight-bold'">{{ item.name }}</span>
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
          <div :class="{ 'b-boxes-list__actions': modern }" @click.stop>
          <v-btn
            v-if="modern && canManageBoxes"
            class="sd-modern-icon-button"
            icon
            variant="text"
            :aria-label="$t('global.actions.edit')"
            @click.stop="openEditDialog(item)"
          >
            <v-icon aria-hidden="true">edit</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              :open-on-focus="true"
              content-class="sd-modern-tooltip text-start"
            >{{ $t('global.actions.edit') }}</v-tooltip>
          </v-btn>
          <u-smart-menu
            v-if="canManageBoxes"
            :modern="modern"
            :class="{ 'b-boxes-list__menu': modern }"
            :title="$t('global.commons.actions')"
            :items="[
              {
                title: $t('global.actions.delete'),
                icon: 'clear',
                click: () => removeBox(item),
              },
            ]"
          >
          </u-smart-menu>
          </div>
        </template>

        <template #no-data>
          <div :class="modern ? 'sd-modern-empty-state' : 'pa-6 text-medium-emphasis'">
            {{ $t("transportation_boxes.empty") }}
          </div>
        </template>

        <!-- Footer pagination -->
        <template #bottom>
          <div :class="{ 'sd-modern-table-footer b-boxes-list__footer': modern }">
            <span v-if="modern" class="sd-modern-page-summary">{{ $t("global.commons.page") }} <bdi>{{ $n(pageCount ? page : 0) }} / {{ $n(pageCount) }}</bdi></span>
            <v-pagination v-model="page" :length="pageCount" :class="{ 'sd-modern-pagination': modern }" :rounded="modern ? undefined : true" />
          </div>
        </template>
      </v-data-table-server>


      <!-- Dialog: Create / Edit Box -->
      <v-bottom-sheet
        v-if="canManageBoxes"
        v-model="dialog"
        max-width="720"
        width="98vw"
        content-class="rounded-t-xl"
        scrollable
        attach
      >
        <v-card rounded="t-xl" :class="{ 'b-boxes-list-form--modern text-start': modern }">
          <v-card-title class="d-flex align-center" :class="{ 'b-boxes-list-form__title': modern }">
            <v-icon class="me-2">inventory_2</v-icon>
            <span>
              {{
                editMode
                  ? $t("transportation_boxes.edit")
                  : $t("transportation_boxes.new")
              }}
            </span>
            <v-spacer></v-spacer>
            <v-btn icon variant="text" :aria-label="$t('global.actions.close')" :class="{ 'sd-modern-icon-button': modern }" @click="dialog = false">
              <v-icon>close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text :class="{ 'b-boxes-list-form__body': modern }">


            <u-cube  v-if="!modern && form?.width && form?.length && form?.height"     :size="100"
                          :x="form?.width"
                          :y="form?.length"
                          :z="form?.height"
                         ></u-cube>



            <div :class="modern ? 'b-boxes-list-form__identity' : 'py-3'">
              <div>
                <v-text-field
                  v-model="form.name"
                  :label="$t('global.commons.name')"
                  :class="{ 'sd-modern-underlined-field': modern }"
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
              </div>
              <u-cube
                v-if="modern"
                modern
                :unit="size_unit"
                :x="form.width"
                :y="form.length"
                :z="form.height"
                class="b-boxes-list-form__preview"
              />
            </div>

            <v-row>
              <v-col cols="12" :sm="modern ? 6 : 4" :md="modern ? 3 : 4">
                <u-number-input
                  v-model="form.length"
                  :class="{ 'sd-modern-underlined-field': modern }"
                  :min="0"
                  :step="1"
                  :decimal="3"
                  :label="$t('global.commons.length')"
                  variant="underlined"
                  :rules="[GlobalRules.required()]"
                  :prefix="size_unit"
                />
              </v-col>
              <v-col cols="12" :sm="modern ? 6 : 4" :md="modern ? 3 : 4">
                <u-number-input
                  v-model="form.width"
                  :class="{ 'sd-modern-underlined-field': modern }"
                  :min="0"
                  :step="1"
                  :decimal="3"
                  :label="$t('global.commons.width')"
                  variant="underlined"
                  :rules="[GlobalRules.required()]"
                  :prefix="size_unit"
                />
              </v-col>
              <v-col cols="12" :sm="modern ? 6 : 4" :md="modern ? 3 : 4">
                <u-number-input
                  v-model="form.height"
                  :class="{ 'sd-modern-underlined-field': modern }"
                  :min="0"
                  :step="1"
                  :decimal="3"
                  :label="$t('global.commons.height')"
                  variant="underlined"
                  :rules="[GlobalRules.required()]"
                  :prefix="size_unit"
                />
              </v-col>
              <v-col cols="12" sm="6" :md="modern ? 3 : 6">
                <u-number-input
                  v-model="form.weight"
                  :class="{ 'sd-modern-underlined-field': modern }"
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

          <v-card-actions class="justify-end" :class="{ 'sd-modern-form-actions b-boxes-list-form__actions': modern }">
            <div class="widget-buttons">
              <v-btn
                @click="dialog = false"
                :class="{ 'sd-modern-button': modern }"
                size="x-large"
                prepend-icon="close"
                variant="text"
              >
                {{ $t("global.actions.cancel") }}
              </v-btn>
              <v-btn
                :loading="busy"
                :class="{ 'sd-modern-button': modern }"
                color="primary"
                @click="submit"
                variant="elevated"
                :prepend-icon="editMode ? 'save' : 'add'"
                size="x-large"
                :disabled="!canManageBoxes || busy || !(form?.width && form?.length && form?.height && form.name) "
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
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import { VendorMemberTypes } from "@selldone/core-js/models/shop/vendor/vendor_member.model";

export default {
  name: "BBoxesList",
  components: { USmartSuggestion, UCube, USmartMenu, UNumberInput, UWidgetHeader },

  // shared for Shop & Vendor hosts
  inject: ["$shop", "$vendor"],

  props: {
    modern: Boolean,
  },

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
    formOwner: null as string | null,
    form: {
      id: null as number | null,
      name: "",
      length: null as number | null,
      width: null as number | null,
      height: null as number | null,
      weight: null as number | null,
    },

  }),

  computed: {
    headers() {
      return [
        { title: this.$t("global.commons.name"), key: "name", sortable: true, align: "start" },
        { title: this.$t("global.commons.length"), key: "length", sortable: true, align: "end" },
        { title: this.$t("global.commons.width"), key: "width", sortable: true, align: "end" },
        { title: this.$t("global.commons.height"), key: "height", sortable: true, align: "end" },
        { title: this.$t("global.commons.weight"), key: "weight", sortable: true, align: "end" },
        { title: this.$t("global.commons.actions"), key: "actions", sortable: false, align: "end" },
      ];
    },
    canManageBoxes(): boolean {
      if (!this.$shop?.id) return false;
      return this.isVendor
        ? this.writeVendorAccess(
            this.$vendor,
            VendorMemberTypes.VendorMemberRegionCode.SHIPPING,
          )
        : this.writeShopAccess(ShopPermissionRegions.LOGISTIC.code);
    },
    ownerKey(): string {
      const ownerId = this.isVendor ? this.$vendor.id : this.$shop?.id;
      return `${this.isVendor ? "vendor" : "shop"}:${this.$shop?.id}:${ownerId}`;
    },
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
    ownerKey() {
      this.dialog = false;
      this.formOwner = null;
    },
    canManageBoxes(value) {
      if (!value) {
        this.dialog = false;
        this.formOwner = null;
      }
    },
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
      if (!this.canManageBoxes || this.busy) return;
      this.editMode = false;
      this.formOwner = this.ownerKey;
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
      if (!this.canManageBoxes || this.busy || !box?.id) return;
      this.editMode = true;
      this.formOwner = this.ownerKey;
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
      // The shared editor must use the current Shop or Vendor write permission.
      if (
        !this.canManageBoxes || this.busy || !this.dialog ||
        this.formOwner !== this.ownerKey
      ) return;
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
      const ownerKey = this.ownerKey;

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
            if (this.ownerKey !== ownerKey) return;
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
            if (this.ownerKey !== ownerKey) return;
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
      if (!this.canManageBoxes || this.busy || !box?.id) return;
      const ownerKey = this.ownerKey;
      const boxId = String(box.id);
      let confirmed = false;
      const remove = () => {
        // Confirmation can outlive its owner context or the user's write access.
        if (
          confirmed || !this.canManageBoxes || this.busy ||
          this.ownerKey !== ownerKey
        ) return;
        confirmed = true;
        this.busy = true;

        const url = this.isVendor
          ? this.API.DELETE_MY_VENDOR_BOX(this.ownerId, boxId)
          : this.API.DELETE_SHOP_BOX(this.ownerId, boxId);

        return axios
          .delete(url)
          .then(({ data }) => {
            if (this.ownerKey !== ownerKey) return;
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
      };
      if (!this.modern) return remove();
      NotificationService.openDangerAlert(
        this.$t("transportation_boxes.delete_title"),
        this.$t("transportation_boxes.delete_message", { name: box.name }),
        this.$t("global.actions.delete"),
        remove,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.b-boxes-list--modern {
  .b-boxes-list__title { font-size: 21px; font-weight: 600; line-height: 1.35; letter-spacing: -0.25px; }
  .sd-modern-subtitle { margin: 4px 0 0; font-size: 13px; line-height: 1.45; }
  .b-boxes-list__widget { padding: 0; overflow: visible; }
  :deep(.sd-modern-data-table > .v-table__wrapper) { overflow: visible; }
  .b-boxes-list__actions { display: flex !important; align-items: center; justify-content: flex-end; flex-wrap: nowrap; gap: 8px; white-space: nowrap; }
  .b-boxes-list__toolbar { margin: 0; padding: 12px 18px; border-block-end: 1px solid var(--sd-modern-border); }
  .b-boxes-list__footer { justify-content: flex-end; padding: 14px 18px; }
  :deep(.b-boxes-list__toolbar .v-field__input) { font-size: 12px; }
}
.b-boxes-list-form--modern {
  .b-boxes-list-form__title { padding: 20px 24px; font-size: 19px; font-weight: 600; line-height: 1.4; white-space: normal; }
  .b-boxes-list-form__body { padding: 0 24px 12px; font-size: var(--sd-modern-font-body, 14px); }
  .b-boxes-list-form__identity { display: grid; grid-template-columns: minmax(0, 1fr) 180px; align-items: center; gap: 24px; margin-block-end: 12px; }
  .b-boxes-list-form__identity > div { min-width: 0; }
  .b-boxes-list-form__actions { padding: 12px 16px; border-block-start: 1px solid var(--sd-modern-border); }
}
@media (max-width: 599px) {
  .b-boxes-list--modern {
    .b-boxes-list__title { font-size: 19px; }
    .b-boxes-list__toolbar { padding-inline: 14px; }
    :deep(.b-boxes-list__toolbar .v-field__input) { font-size: 16px; }
  }
  .b-boxes-list-form--modern {
    .b-boxes-list-form__title { padding-inline: 16px; }
    .b-boxes-list-form__body { padding-inline: 16px; }
    .b-boxes-list-form__identity { grid-template-columns: minmax(0, 1fr) 120px; gap: 12px; }
    .b-boxes-list-form__actions { padding-inline: 8px; }
  }
}
</style>
