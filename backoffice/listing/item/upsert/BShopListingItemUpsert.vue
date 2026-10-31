<!--
  - Copyright (c) 2026. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card
    class="text-start h-100"
    :theme="modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined"
    :class="{ 'sd-modern-canvas b-listing-item-editor': modern }"
    flat
  >
    <header
      v-if="modern"
      class="sd-modern-header b-listing-item-editor__header"
    >
      <div class="sd-modern-title">
        <v-icon
          class="sd-modern-icon sd-modern-icon--plain"
          size="24"
          aria-hidden="true"
          >{{ isEdit ? "edit_note" : "post_add" }}</v-icon
        >
        <div>
          <h1 class="sd-modern-title-text">
            {{
              $t(
                isEdit
                  ? "shop_listing.items.edit_title"
                  : "shop_listing.items.add_title",
              )
            }}
          </h1>
          <p class="sd-modern-subtitle">
            {{ $t("shop_listing.item_editor.subtitle") }}
          </p>
        </div>
      </div>
      <div class="b-listing-item-editor__header-actions">
        <v-btn
          v-if="hasClose"
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="$t('global.actions.close')"
          :disabled="isSaving"
          @click="requestClose"
        >
          <v-icon size="18" aria-hidden="true">close</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>
      </div>
    </header>
    <v-card-title v-else class="d-flex align-center">
      <v-icon class="me-2">edit_attributes</v-icon>
      <div class="font-weight-black">
        {{
          isEdit
            ? $t("shop_listing.items.edit_title")
            : $t("shop_listing.items.add_title")
        }}
      </div>
      <v-spacer />
      <v-chip size="x-small" label variant="tonal">
        Step {{ activeStep }}/{{ tabs.length }}
      </v-chip>
    </v-card-title>

    <v-card-text
      class="text-start position-relative"
      :class="modern ? 'b-listing-item-editor__body' : 'pt-6'"
    >
      <v-expand-transition>
        <div
          v-if="modern && form_error"
          class="sd-modern-notice b-listing-item-editor__error"
          role="alert"
        >
          <v-icon color="error" size="20" aria-hidden="true"
            >error_outline</v-icon
          ><span>{{ form_error }}</span>
        </div>
        <v-alert
          v-else-if="form_error"
          type="error"
          variant="tonal"
          border="start"
        >
          {{ form_error }}
        </v-alert>
      </v-expand-transition>

      <v-form
        ref="form"
        lazy-validation
        :class="{ 'b-listing-item-editor__layout': modern }"
      >
        <v-tabs
          v-model="tab"
          show-arrows
          density="comfortable"
          :align-tabs="modern ? 'start' : 'center'"
          :direction="
            modern && $vuetify.display.mdAndUp ? 'vertical' : 'horizontal'
          "
          :aria-orientation="
            modern
              ? $vuetify.display.mdAndUp
                ? 'vertical'
                : 'horizontal'
              : undefined
          "
          :hide-slider="modern"
          :class="
            modern ? 'sd-modern-section-nav b-listing-item-editor__nav' : 'mt-2'
          "
          :aria-label="
            modern ? $t('shop_listing.item_editor.sections') : undefined
          "
        >
          <v-tab
            v-for="(t, i) in tabs"
            :key="t.value"
            :value="t.value"
            class="text-none"
            :class="{ 'sd-modern-section-nav__item': modern }"
            :id="modern ? `listing-item-tab-${t.value}` : undefined"
            :aria-controls="
              modern ? `listing-item-section-${t.value}` : undefined
            "
            :aria-current="modern && tab === t.value ? 'location' : undefined"
          >
            <v-icon size="18" :class="{ 'me-1': !modern }" aria-hidden="true">{{
              t.icon
            }}</v-icon>
            <span>{{ modern ? t.title : `${i + 1}. ${t.title}` }}</span>
          </v-tab>
        </v-tabs>

        <v-list-subheader v-if="!modern" class="max-widget-width mx-auto">
          Step <b>{{ activeStep }}</b> of <b>{{ tabs.length }}</b> —
          {{ activeTabTitle }}
        </v-list-subheader>

        <v-window
          v-model="tab"
          :class="{ 'sd-modern-form b-listing-item-editor__window': modern }"
        >
          <!-- General -->
          <v-window-item
            :role="modern ? 'tabpanel' : undefined"
            :transition="modern ? false : undefined"
            :reverse-transition="modern ? false : undefined"
            value="general"
            :id="modern ? 'listing-item-section-general' : undefined"
            :aria-labelledby="modern ? 'listing-item-tab-general' : undefined"
          >
            <b-shop-listing-item-tab-general
              :modern="modern"
              :disabled="busy_save"
              v-model:category="form.category"
              v-model:company-id="form.company_id"
              v-model:badge-ids="form.badge_ids"
              v-model:title="form.title"
              v-model:slug="form.slug"
              v-model:status="form.status"
              v-model:is-featured="form.is_featured"
              :status-options="statusOptions"
            />
          </v-window-item>

          <!-- Description -->
          <v-window-item
            :role="modern ? 'tabpanel' : undefined"
            :transition="modern ? false : undefined"
            :reverse-transition="modern ? false : undefined"
            value="description"
            :id="modern ? 'listing-item-section-description' : undefined"
            :aria-labelledby="
              modern ? 'listing-item-tab-description' : undefined
            "
          >
            <b-shop-listing-item-tab-description
              :modern="modern"
              v-model:subtitle="form.subtitle"
              v-model:description="form.description"
            />
          </v-window-item>

          <!-- Pricing -->
          <v-window-item
            :role="modern ? 'tabpanel' : undefined"
            :transition="modern ? false : undefined"
            :reverse-transition="modern ? false : undefined"
            value="pricing"
            :id="modern ? 'listing-item-section-pricing' : undefined"
            :aria-labelledby="modern ? 'listing-item-tab-pricing' : undefined"
          >
            <b-shop-listing-item-tab-pricing
              :modern="modern"
              v-model:currency="form.currency"
              v-model:price="form.price"
              v-model:price-to="form.price_to"
              v-model:price-unit="form.price_unit"
              :currency-object="currencyObject"
              :active-currencies="shop?.currencies"
            />
          </v-window-item>

          <!-- Contact -->
          <v-window-item
            :role="modern ? 'tabpanel' : undefined"
            :transition="modern ? false : undefined"
            :reverse-transition="modern ? false : undefined"
            value="contact"
            :id="modern ? 'listing-item-section-contact' : undefined"
            :aria-labelledby="modern ? 'listing-item-tab-contact' : undefined"
          >
            <b-shop-listing-item-tab-contact
              :modern="modern"
              v-model:tel="form.tel"
              v-model:email="form.email"
              v-model:website="form.website"
              v-model:links="form.links"
            />
          </v-window-item>

          <!-- Location -->
          <v-window-item
            :role="modern ? 'tabpanel' : undefined"
            :transition="modern ? false : undefined"
            :reverse-transition="modern ? false : undefined"
            value="location"
            :id="modern ? 'listing-item-section-location' : undefined"
            :aria-labelledby="modern ? 'listing-item-tab-location' : undefined"
          >
            <b-shop-listing-item-tab-location
              :modern="modern"
              v-model:country-code="form.country_code"
              v-model:city="form.city"
              v-model:address="form.address"
              v-model:lat="form.lat"
              v-model:lng="form.lng"
            />
          </v-window-item>

          <!-- Hours -->
          <v-window-item
            :role="modern ? 'tabpanel' : undefined"
            :transition="modern ? false : undefined"
            :reverse-transition="modern ? false : undefined"
            value="hours"
            :id="modern ? 'listing-item-section-hours' : undefined"
            :aria-labelledby="modern ? 'listing-item-tab-hours' : undefined"
          >
            <b-shop-listing-item-tab-hours
              :modern="modern"
              v-model:opening-hours="form.opening_hours"
            />
          </v-window-item>

          <!-- Listing Form (shared) -->
          <v-window-item
            :role="modern ? 'tabpanel' : undefined"
            :transition="modern ? false : undefined"
            :reverse-transition="modern ? false : undefined"
            v-if="hasListingFormTab"
            value="form_listing"
            :id="modern ? 'listing-item-section-form_listing' : undefined"
            :aria-labelledby="
              modern ? 'listing-item-tab-form_listing' : undefined
            "
          >
            <b-shop-listing-item-tab-form
              :modern="modern"
              :title="$t('shop_listing.items.form_fields')"
              :subtitle="
                modern
                  ? $t('shop_listing.item_editor.listing_fields_subtitle')
                  : 'Shared fields for all items in this listing.'
              "
              icon="data_object"
              :schema="listingSchemaEffective"
              v-model:meta-fields="form.listing_fields"
              :disabled="busy_save"
            />
          </v-window-item>

          <!-- Category Form (specific) -->
          <v-window-item
            :role="modern ? 'tabpanel' : undefined"
            :transition="modern ? false : undefined"
            :reverse-transition="modern ? false : undefined"
            v-if="hasCategoryFormTab"
            value="form_category"
            :id="modern ? 'listing-item-section-form_category' : undefined"
            :aria-labelledby="
              modern ? 'listing-item-tab-form_category' : undefined
            "
          >
            <b-shop-listing-item-tab-form
              :modern="modern"
              :title="categoryFormTitle"
              :subtitle="categoryFormSubtitle"
              icon="data_object"
              :schema="categorySchema"
              v-model:meta-fields="form.category_fields"
              :disabled="busy_save"
            />
          </v-window-item>

          <!-- ✅ Media tab ALWAYS exists (last tab) -->
          <v-window-item
            :role="modern ? 'tabpanel' : undefined"
            :transition="modern ? false : undefined"
            :reverse-transition="modern ? false : undefined"
            value="media"
            :id="modern ? 'listing-item-section-media' : undefined"
            :aria-labelledby="modern ? 'listing-item-tab-media' : undefined"
          >
            <!-- When item exists -->
            <div v-if="effectiveItemId" class="mt-1">
              <b-shop-listing-item-tab-media
                :modern="modern"
                :item-id="effectiveItemId"
                @dirty-change="media_dirty = $event"
                @saving-change="media_saving = $event"
              />
            </div>

            <!-- When creating (no item yet) -->
            <div
              v-else
              :class="
                modern
                  ? 'sd-modern-widget b-listing-item-editor__media-start'
                  : 'widget-box -large mt-2'
              "
            >
              <u-widget-header
                :class="{ 'sd-modern-form-header': modern }"
                :title="$t('global.commons.media')"
                icon="photo_library"
              />

              <p v-if="modern" class="sd-modern-subtitle">
                {{ $t("shop_listing.item_editor.media_requires_save") }}
              </p>
              <v-list-subheader v-else>
                Media uploads require an item ID. First, save the item (create
                it), then you can upload images here — without closing this
                editor.
              </v-list-subheader>

              <s-widget-buttons v-if="!modern">
                <v-btn
                  color="primary"
                  size="x-large"
                  variant="elevated"
                  :loading="busy_save"
                  @click="
                    save({
                      goMediaAfterCreate: true,
                      silentEmit: true,
                      quiet: false,
                    })
                  "
                >
                  <v-icon start aria-hidden="true">save</v-icon>
                  Save item to enable media
                </v-btn>
              </s-widget-buttons>
            </div>
          </v-window-item>
        </v-window>
      </v-form>
    </v-card-text>

    <v-card-actions
      :class="{
        'sd-modern-form-actions b-listing-item-editor__footer': modern,
      }"
    >
      <s-widget-buttons :auto-fixed-position="!hasClose">
        <v-btn
          v-if="!modern && hasClose"
          class="mx-1"
          size="x-large"
          variant="text"
          :disabled="busy_save"
          @click="requestClose"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="!modern"
          class="mx-1"
          size="x-large"
          :disabled="isFirstTab || busy_save"
          variant="text"
          @click="prevTab"
        >
          <v-icon start>chevron_left</v-icon>
          {{ $t("global.actions.back") }}
        </v-btn>

        <!-- ✅ Next autosaves (Create first, then Edit) -->
        <v-btn
          v-if="!modern"
          class="mx-1"
          size="x-large"
          :disabled="isLastTab || busy_save"
          variant="text"
          @click="nextTab"
        >
          {{ $t("global.actions.next") }}
          <v-icon end>chevron_right</v-icon>
        </v-btn>

        <!-- Media creation keeps this editor open; ordinary saves finish it. -->
        <v-btn
          :loading="busy_save"
          :class="
            modern
              ? 'sd-modern-button sd-modern-button--primary b-listing-item-editor__submit'
              : 'mx-1'
          "
          color="primary"
          :size="modern ? 'default' : 'x-large'"
          variant="elevated"
          @click="
            save({
              goMediaAfterCreate: needsMediaCreation,
              silentEmit: needsMediaCreation,
              quiet: false,
            })
          "
        >
          <v-icon start aria-hidden="true">{{
            modern && !isEdit ? "add" : "save"
          }}</v-icon>
          {{
            $t(
              modern
                ? needsMediaCreation
                  ? "shop_listing.item_editor.create_for_media"
                  : isEdit
                    ? "shop_listing.item_editor.save_changes"
                    : "shop_listing.items.add_title"
                : "global.actions.save",
            )
          }}
        </v-btn>
      </s-widget-buttons>
    </v-card-actions>
    <v-dialog
      v-if="modern"
      v-model="discard_dialog"
      max-width="440"
      :persistent="isSaving"
      :theme="USER()?.preferences?.dark ? 'dark' : 'light'"
      aria-labelledby="listing-item-discard-title"
      aria-describedby="listing-item-discard-message"
    >
      <v-card
        class="sd-modern-widget b-listing-item-editor__confirmation text-start"
      >
        <h2 id="listing-item-discard-title" class="sd-modern-title-text">
          {{ $t("shop_listing.item_editor.discard_title") }}
        </h2>
        <p id="listing-item-discard-message" class="sd-modern-subtitle">
          {{ $t("shop_listing.item_editor.discard_message") }}
        </p>
        <div class="sd-modern-actions">
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            autofocus
            :disabled="isSaving"
            @click="discard_dialog = false"
            >{{ $t("shop_listing.item_editor.keep_editing") }}</v-btn
          >
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="flat"
            :disabled="isSaving"
            @click="discardChanges"
            >{{ $t("shop_listing.item_editor.discard") }}</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

import BShopListingItemTabGeneral from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabGeneral.vue";
import BShopListingItemTabDescription from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabDescription.vue";
import BShopListingItemTabPricing from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabPricing.vue";
import BShopListingItemTabContact from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabContact.vue";
import BShopListingItemTabLocation from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabLocation.vue";
import BShopListingItemTabHours from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabHours.vue";
import BShopListingItemTabMedia from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabMedia.vue";
import BShopListingItemTabForm from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabForm.vue";

type SaveOptions = {
  goMediaAfterCreate?: boolean;
  /**
   * When true, do NOT emit add/edit events (prevents parent dialog from closing).
   */
  silentEmit?: boolean;
  /**
   * When true, do not show success toasts (used for Next autosave).
   */
  quiet?: boolean;
};

export default {
  name: "BShopListingItemUpsert",
  mixins: [CurrencyMixin],

  inject: ["$shop"],

  components: {
    SWidgetButtons,
    BShopListingItemTabGeneral,
    BShopListingItemTabDescription,
    BShopListingItemTabPricing,
    BShopListingItemTabContact,
    BShopListingItemTabLocation,
    BShopListingItemTabHours,
    BShopListingItemTabForm,
    BShopListingItemTabMedia,
  },

  props: {
    modern: { type: Boolean, default: false },
    item: { type: Object, default: null },
    hasClose: { type: Boolean, default: false },
  },

  emits: ["add", "edit", "close", "saved"],

  data: () => ({
    tab: "general" as string,

    busy_save: false,
    form_error: "",
    initial_form: null as any | null,
    discard_dialog: false,
    media_dirty: false,
    media_saving: false,

    // Stored locally to enable media after first create (without closing editor)
    created_item: null as any | null,

    form: {
      category: null as any,

      company_id: null as number | null,
      badge_ids: [] as number[],

      title: "",
      slug: "",
      subtitle: "",
      description: "",

      status: null as string | null,

      price: null as any,
      price_to: null as any,
      currency: "",
      price_unit: "",

      country_code: "",
      city: "",
      address: "",
      lat: null as any,
      lng: null as any,

      tel: "",
      email: "",
      website: "",

      is_featured: false,

      links: [] as string[],
      opening_hours: [] as any[],

      listing_fields: {} as Record<string, any>,
      category_fields: {} as Record<string, any>,
      meta_extra: {} as Record<string, any>,
    },
  }),

  computed: {
    /*🟢 Vendor Panel 🟢*/
    IS_VENDOR_PANEL(): boolean {
      // @ts-ignore
      return (
        this.$route?.params?.vendor_id &&
        // @ts-ignore
        this.$route?.matched?.some((record: any) => record?.meta?.vendor)
      );
    },

    vendorId(): number | null {
      // @ts-ignore
      const raw = this.$route?.params?.vendor_id;
      const n =
        raw !== undefined && raw !== null ? parseInt(String(raw), 10) : 0;
      return n > 0 ? n : null;
    },

    shop(): any {
      return (this as any).$shop;
    },

    effectiveItem(): any | null {
      // When editing use prop `item`, when creating use `created_item`
      // @ts-ignore
      return (this as any).item?.id
        ? (this as any).item
        : (this as any).created_item;
    },

    effectiveItemId(): number | null {
      const id = this.effectiveItem?.id
        ? parseInt(String(this.effectiveItem.id), 10)
        : 0;
      return id > 0 ? id : null;
    },

    isEdit(): boolean {
      return !!this.effectiveItemId;
    },

    needsMediaCreation(): boolean {
      return this.modern && this.tab === "media" && !this.effectiveItemId;
    },

    hasUnsavedChanges(): boolean {
      return (
        this.modern &&
        ((this.initial_form !== null &&
          this.formSignature(this.form) !==
            this.formSignature(this.initial_form)) ||
          this.media_dirty)
      );
    },

    isSaving(): boolean {
      return this.busy_save || this.media_saving;
    },

    currencyObject(): any {
      // @ts-ignore
      return this.form.currency ? this.GetCurrency(this.form.currency) : null;
    },

    listingSchemaRaw(): any[] {
      const s: any = this.shop?.listing?.form_schema;
      return Array.isArray(s) ? s : [];
    },

    categorySchemaRaw(): any[] {
      const c: any = this.form.category;
      if (!c || typeof c !== "object") return [];
      if (Array.isArray(c.form_schema)) return c.form_schema;

      if (Array.isArray(c.meta)) return c.meta;
      if (
        c.meta &&
        typeof c.meta === "object" &&
        Array.isArray(c.meta.form_schema)
      ) {
        return c.meta.form_schema;
      }

      return [];
    },

    categorySchemaNames(): Set<string> {
      const set = new Set<string>();

      (this.categorySchemaRaw || []).forEach((f: any) => {
        const t = this.getFieldType(f);
        if (t === "note") return;
        const name = f?.name ? String(f.name) : "";
        if (name) set.add(name);
      });

      return set;
    },

    listingSchemaEffective(): any[] {
      const catNames = this.categorySchemaNames;

      return (this.listingSchemaRaw || []).filter((f: any) => {
        const t = this.getFieldType(f);
        if (t === "note") return true;

        const name = f?.name ? String(f.name) : "";
        if (!name) return false;

        return !catNames.has(name);
      });
    },

    categorySchema(): any[] {
      return Array.isArray(this.categorySchemaRaw)
        ? this.categorySchemaRaw
        : [];
    },

    hasListingFormTab(): boolean {
      return (this.listingSchemaEffective || []).length > 0;
    },

    hasCategoryFormTab(): boolean {
      return (this.categorySchema || []).length > 0;
    },

    categoryTitle(): string {
      const c: any = this.form.category;
      return c?.title
        ? String(c.title)
        : this.modern
          ? this.$t("global.commons.category")
          : "Category";
    },

    categoryFormTitle(): string {
      return `${this.$t("shop_listing.items.form_fields")} - ${this.categoryTitle}`;
    },

    categoryFormSubtitle(): string {
      if (this.modern)
        return this.$t("shop_listing.item_editor.category_fields_subtitle", {
          category: this.categoryTitle,
        });
      return `Extra fields specific to "${this.categoryTitle}". Values here override shared fields with the same key.`;
    },

    tabs(): any[] {
      const t = [
        {
          value: "general",
          title: this.$t("global.commons.general"),
          icon: "tune",
        },
        {
          value: "description",
          title: this.$t("global.commons.description"),
          icon: "notes",
        },
        {
          value: "pricing",
          title: this.$t("global.commons.finance"),
          icon: "price_change",
        },
        {
          value: "contact",
          title: this.$t("global.commons.contact"),
          icon: "contact_phone",
        },
        {
          value: "location",
          title: this.$t("global.commons.location"),
          icon: "location_on",
        },
        {
          value: "hours",
          title: this.$t("shop_listing.items.opening_hours"),
          icon: "schedule",
        },
      ];

      if (this.hasListingFormTab) {
        t.push({
          value: "form_listing",
          title: this.$t("shop_listing.items.form_fields"),
          icon: "data_object",
        });
      }

      if (this.hasCategoryFormTab) {
        t.push({
          value: "form_category",
          title: this.categoryFormTitle,
          icon: "data_object",
        });
      }

      // Always last
      t.push({
        value: "media",
        title: this.$t("global.commons.media"),
        icon: "photo_library",
      });

      return t;
    },

    activeStep(): number {
      const i = this.tabs.findIndex((x: any) => x.value === this.tab);
      return (i >= 0 ? i : 0) + 1;
    },

    activeTabTitle(): string {
      const t = this.tabs.find((x: any) => x.value === this.tab);
      return t ? t.title : "";
    },

    isFirstTab(): boolean {
      return this.activeStep <= 1;
    },

    isLastTab(): boolean {
      return this.activeStep >= this.tabs.length;
    },

    statusOptions(): any[] {
      return [
        { title: "draft", value: "draft" },
        { title: "pending", value: "pending" },
        { title: "approved", value: "approved" },
        { title: "published", value: "published" },
        { title: "rejected", value: "rejected" },
        { title: "archived", value: "archived" },
      ].map((option) => ({
        ...option,
        title: this.modern
          ? this.$t("shop_listing.modern.statuses." + option.value)
          : option.title,
      }));
    },

    categoryId(): number | null {
      return this.getCategoryId(this.form.category);
    },
  },

  watch: {
    item: {
      immediate: true,
      handler(newVal: any) {
        // if editing a real item, forget created_item
        if (newVal?.id) this.created_item = null;
        this.initForm(newVal);
        this.initial_form = JSON.parse(JSON.stringify(this.form));
        this.discard_dialog = false;
        this.media_dirty = false;
        this.media_saving = false;
      },
    },

    "form.category": {
      deep: false,
      handler() {
        this.rebuildMetaBuckets();
        this.ensureTabStillValid();
      },
    },
  },

  methods: {
    requestClose() {
      if (this.isSaving) return;
      if (this.hasUnsavedChanges) {
        this.discard_dialog = true;
        return;
      }
      this.$emit("close");
    },

    discardChanges() {
      if (this.isSaving) return;
      this.discard_dialog = false;
      this.$emit("close");
    },

    getCategoryId(category: any): number | null {
      if (!category) return null;
      if (typeof category === "number") return category;
      if (typeof category === "object" && category.id)
        return parseInt(String(category.id), 10) || null;
      return null;
    },

    formSignature(form: any): string {
      const payload = this.buildPayload(form);
      const values = {
        ...form.meta_extra,
        ...form.listing_fields,
        ...form.category_fields,
      };
      // Lazy form sections apply defaults on mount; they are not user edits.
      for (const field of [
        ...this.listingSchemaEffective,
        ...this.categorySchema,
      ]) {
        if (!field?.name || this.getFieldType(field) === "note") continue;
        payload.meta[field.name] = this.normalizeValueByField(
          field,
          values[field.name] === undefined ? field.default : values[field.name],
        );
      }
      // The Hours input expands partial data into seven days on first visit.
      const hours = Object.fromEntries(
        (form.opening_hours || [])
          .filter((row: any) => row?.day)
          .map((row: any) => [String(row.day).toLowerCase(), row]),
      );
      payload.opening_hours = [
        "mon",
        "tue",
        "wed",
        "thu",
        "fri",
        "sat",
        "sun",
      ].map((day) => {
        const row: any = hours[day];
        return row && !row.closed
          ? {
              day,
              closed: false,
              open: row.open || "09:00",
              close: row.close || "18:00",
            }
          : { day, closed: true };
      });
      return JSON.stringify(payload, (_key, value) =>
        value && typeof value === "object" && !Array.isArray(value)
          ? Object.fromEntries(
              Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
            )
          : value,
      );
    },

    // ✅ Type normalization only for decision making (schema stays untouched)
    getFieldType(field: any): string {
      const raw = field?.type;
      if (raw === null || raw === undefined || raw === "") return "text";

      const t = String(raw).trim().toLowerCase().replace(/-/g, "_");
      if (t === "note") return "note";
      if (t === "switch") return "switch";
      if (t === "select") return "select";
      if (t === "key_value" || t === "keyvalue") return "key_value";
      return "text";
    },

    ensureTabStillValid() {
      const exists = this.tabs.some((t: any) => t.value === this.tab);
      if (!exists) this.tab = "general";
    },

    async nextTab() {
      if (this.busy_save) return;
      if (!this.validateCurrentStep()) return;

      // ✅ Auto-save on Next:
      // - Create on first time (no id yet)
      // - Edit on subsequent steps
      // - No emits => parent won't close dialog
      // - Quiet => no toast spam
      const ok = await this.save({
        goMediaAfterCreate: false,
        silentEmit: true,
        quiet: true,
      });
      if (!ok) return;

      const i = this.tabs.findIndex((x: any) => x.value === this.tab);
      if (i >= 0 && i < this.tabs.length - 1) this.tab = this.tabs[i + 1].value;
    },

    prevTab() {
      const i = this.tabs.findIndex((x: any) => x.value === this.tab);
      if (i > 0) this.tab = this.tabs[i - 1].value;
    },

    validateCurrentStep(): boolean {
      if (this.tab !== "general") return true;

      try {
        const title = (this.form.title || "").trim();
        if (!title)
          throw new Error(
            this.modern
              ? this.$t("shop_listing.item_editor.title_required")
              : "Title is required.",
          );
        if (!this.categoryId)
          throw new Error(
            this.modern
              ? this.$t("shop_listing.item_editor.category_required")
              : "Category is required.",
          );
        return true;
      } catch (e: any) {
        this.form_error =
          e?.message ||
          (this.modern
            ? this.$t("shop_listing.item_editor.invalid_step")
            : "Invalid step.");
        return false;
      }
    },

    normalizeLinks(v: any): string[] {
      if (!v || !Array.isArray(v)) return [];
      return v
        .map((x: any) => {
          if (typeof x === "string") return x.trim();
          if (x && typeof x === "object" && x.url) return String(x.url).trim();
          return "";
        })
        .filter((x: string) => x.length);
    },

    normalizeBadgeIds(v: any): number[] {
      if (Array.isArray(v)) {
        return v
          .map((x: any) => parseInt(String(x), 10))
          .filter(
            (n: number) => Number.isFinite(n) && !Number.isNaN(n) && n > 0,
          );
      }
      if (Array.isArray(v?.badges)) {
        return v.badges
          .map((b: any) => parseInt(String(b?.id || ""), 10))
          .filter(
            (n: number) => Number.isFinite(n) && !Number.isNaN(n) && n > 0,
          );
      }
      return [];
    },

    initForm(item: any | null) {
      const defaultCurrency =
        this.shop?.listing?.default_currency || this.shop?.currency || "";

      this.form_error = "";
      this.tab = "general";

      if (!item) {
        this.form = {
          category: null,

          company_id: null,
          badge_ids: [],

          title: "",
          slug: "",
          subtitle: "",
          description: "",

          status: null,

          price: null,
          price_to: null,
          currency: defaultCurrency,
          price_unit: "",

          country_code: "",
          city: "",
          address: "",
          lat: null,
          lng: null,

          tel: "",
          email: "",
          website: "",

          is_featured: false,

          links: [],
          opening_hours: [],

          listing_fields: {},
          category_fields: {},
          meta_extra: {},
        };
        return;
      }

      const meta =
        item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
          ? { ...item.meta }
          : {};

      this.form = {
        category: item.category || item.category_id || null,

        company_id: item.company_id ?? item.company?.id ?? null,
        badge_ids: Array.isArray(item.badge_ids)
          ? this.normalizeBadgeIds(item.badge_ids)
          : this.normalizeBadgeIds(item),

        title: item.title || "",
        slug: item.slug || "",
        subtitle: item.subtitle || "",
        description: item.description || "",

        status: item.status ?? null,

        price: item.price ?? null,
        price_to: item.price_to ?? null,
        currency: item.currency || defaultCurrency,
        price_unit: item.price_unit || "",

        country_code: item.country_code || "",
        city: item.city || "",
        address: item.address || "",
        lat: item.lat ?? null,
        lng: item.lng ?? null,

        tel: item.tel || "",
        email: item.email || "",
        website: item.website || "",

        is_featured: !!item.is_featured,

        links: this.normalizeLinks(item.links),
        opening_hours: Array.isArray(item.opening_hours)
          ? item.opening_hours
          : [],

        listing_fields: {},
        category_fields: {},
        meta_extra: meta,
      };

      this.rebuildMetaBuckets();
    },

    collectNamedKeys(schema: any[]): string[] {
      const out: string[] = [];
      (Array.isArray(schema) ? schema : []).forEach((f: any) => {
        const t = this.getFieldType(f);
        if (t === "note") return;

        const name = f?.name ? String(f.name) : "";
        if (name) out.push(name);
      });
      return out;
    },

    rebuildMetaBuckets() {
      const combined: Record<string, any> = {
        ...(this.form.meta_extra || {}),
        ...(this.form.listing_fields || {}),
        ...(this.form.category_fields || {}),
      };

      const listingNames = this.collectNamedKeys(this.listingSchemaEffective);
      const categoryNames = this.collectNamedKeys(this.categorySchema);

      const nextCategory: Record<string, any> = {};
      categoryNames.forEach((k) => {
        if (combined[k] !== undefined) nextCategory[k] = combined[k];
      });

      const nextListing: Record<string, any> = {};
      listingNames.forEach((k) => {
        if (combined[k] !== undefined) nextListing[k] = combined[k];
      });

      const nextExtra: Record<string, any> = { ...combined };
      categoryNames.forEach((k) => delete nextExtra[k]);
      listingNames.forEach((k) => delete nextExtra[k]);

      this.form.category_fields = nextCategory;
      this.form.listing_fields = nextListing;
      this.form.meta_extra = nextExtra;
    },

    normalizeValueByField(field: any, value: any) {
      const type = this.getFieldType(field);

      if (type === "note") return undefined;
      if (type === "switch") return !!value;

      if (type === "select") {
        if (field?.multiple) {
          if (!Array.isArray(value)) return [];
          return value
            .map((x: any) =>
              x === null || x === undefined ? "" : String(x).trim(),
            )
            .filter((x: string) => x.length);
        }

        const v =
          value === null || value === undefined ? null : String(value).trim();
        return v ? v : null;
      }

      if (type === "key_value") {
        let rows: any[] = [];

        if (Array.isArray(value)) rows = value;
        else if (value && typeof value === "object") rows = [value];
        else if (typeof value === "string") rows = [{ key: "", value }];
        else rows = [];

        const normalized = rows
          .map((r: any) => ({
            key: String(r?.key ?? "").trim(),
            value: String(r?.value ?? "").trim(),
          }))
          .filter((r: any) => r.key.length || r.value.length);

        return normalized.length ? normalized : null;
      }

      if (value === null || value === undefined) return null;
      if (Array.isArray(value) || (value && typeof value === "object"))
        return value;

      const v = String(value).trim();
      return v ? v : null;
    },

    buildMetaFromSchema(schema: any[], values: Record<string, any>) {
      const out: Record<string, any> = {};
      const src = values && typeof values === "object" ? values : {};

      (Array.isArray(schema) ? schema : []).forEach((f: any) => {
        const t = this.getFieldType(f);
        if (t === "note") return;

        const name = f?.name ? String(f.name) : "";
        if (!name) return;

        const val = this.normalizeValueByField(f, src[name]);
        if (val === undefined) return;

        out[name] = val;
      });

      return out;
    },

    buildFinalMetaPayload(form: any = this.form) {
      const listingMeta = this.buildMetaFromSchema(
        this.listingSchemaEffective,
        form.listing_fields,
      );
      const categoryMeta = this.buildMetaFromSchema(
        this.categorySchema,
        form.category_fields,
      );

      return {
        ...(form.meta_extra || {}),
        ...listingMeta,
        ...categoryMeta,
      };
    },

    buildPayload(form: any = this.form) {
      return {
        title: (form.title || "").trim(),
        slug: (form.slug || "").trim() || null,

        company_id: form.company_id
          ? parseInt(String(form.company_id), 10)
          : null,
        badge_ids:
          Array.isArray(form.badge_ids) && form.badge_ids.length
            ? form.badge_ids
            : null,

        subtitle: (form.subtitle || "").trim() || null,
        description: (form.description || "").trim() || null,

        category_id: this.getCategoryId(form.category),
        status: form.status || null,

        price: form.price !== "" ? form.price : null,
        price_to: form.price_to !== "" ? form.price_to : null,
        currency: (form.currency || "").trim() || null,
        price_unit: (form.price_unit || "").trim() || null,

        country_code: (form.country_code || "").trim() || null,
        city: (form.city || "").trim() || null,
        address: (form.address || "").trim() || null,
        lat: form.lat !== "" ? form.lat : null,
        lng: form.lng !== "" ? form.lng : null,

        tel: (form.tel || "").trim() || null,
        email: (form.email || "").trim() || null,
        website: (form.website || "").trim() || null,

        is_featured: form.is_featured ? "1" : "0",

        links:
          Array.isArray(form.links) && form.links.length ? form.links : null,
        opening_hours:
          Array.isArray(form.opening_hours) && form.opening_hours.length
            ? form.opening_hours
            : null,

        meta: this.buildFinalMetaPayload(form),
      };
    },

    validateForm() {
      const title = (this.form.title || "").trim();
      if (!title)
        throw new Error(
          this.modern
            ? this.$t("shop_listing.item_editor.title_required")
            : "Title is required.",
        );
      if (!this.categoryId)
        throw new Error(
          this.modern
            ? this.$t("shop_listing.item_editor.category_required")
            : "Category is required.",
        );
    },

    /**
     * Save item:
     * - Create on first call (no item id yet)
     * - Edit on subsequent calls
     * - Can optionally jump to media after create
     * - Can be silent (no emits) to keep dialog open
     * - Can be quiet (no toast spam)
     */
    async save(opts: SaveOptions = {}): Promise<boolean> {
      const shopId = this.shop?.id;
      if (!shopId) return false;

      const goMediaAfterCreate = !!opts.goMediaAfterCreate;
      const silentEmit = !!opts.silentEmit;
      const quiet = !!opts.quiet;

      this.form_error = "";

      try {
        (this.$refs.form as any)?.validate?.();
        this.validateForm();
      } catch (e: any) {
        if (this.modern) this.tab = "general";
        this.form_error =
          e?.message ||
          (this.modern
            ? this.$t("shop_listing.item_editor.invalid_form")
            : "Invalid form.");
        return false;
      }

      const payload = this.buildPayload();
      const submittedForm = JSON.parse(JSON.stringify(this.form));

      if (this.busy_save) return false;
      this.busy_save = true;

      const currentId = this.effectiveItemId;

      const request =
        this.IS_VENDOR_PANEL && this.vendorId
          ? currentId
            ? axios.post(
                window.VAPI.POST_MY_VENDOR_LISTING_ITEM_EDIT(
                  this.vendorId,
                  currentId,
                ),
                payload,
              )
            : axios.post(
                window.VAPI.POST_MY_VENDOR_LISTING_ITEM_ADD(this.vendorId),
                payload,
              )
          : currentId
            ? axios.post(
                window.API.POST_SHOP_LISTING_ITEM_EDIT(shopId, currentId),
                payload,
              )
            : axios.post(
                window.API.POST_SHOP_LISTING_ITEM_ADD(shopId),
                payload,
              );

      try {
        const { data } = await request;

        if (data?.error) {
          const msg =
            data.error_msg ||
            (this.modern
              ? this.$t("shop_listing.item_editor.save_error")
              : "Failed to save item.");
          if (quiet) this.form_error = msg;
          else NotificationService.showErrorAlert(null, msg);
          return false;
        }

        const saved = data.item;
        if (!saved?.id) {
          const msg = this.modern
            ? this.$t("shop_listing.item_editor.invalid_response")
            : "Invalid server response.";
          if (quiet) this.form_error = msg;
          else NotificationService.showErrorAlert(null, msg);
          return false;
        }

        const wasCreate = !currentId;

        if (wasCreate) {
          // ✅ Keep item inside editor so Media becomes available without closing
          this.created_item = saved;

          // Optional: keep UI consistent with backend generated values
          if (
            !submittedForm.slug &&
            this.form.slug === submittedForm.slug &&
            saved.slug
          )
            this.form.slug = saved.slug;
          if (
            !submittedForm.status &&
            this.form.status === submittedForm.status &&
            saved.status
          )
            this.form.status = saved.status;

          if (!submittedForm.slug && saved.slug)
            submittedForm.slug = saved.slug;
          if (!submittedForm.status && saved.status)
            submittedForm.status = saved.status;
          if (!quiet)
            NotificationService.showSuccessAlert(
              null,
              this.modern
                ? this.$t("shop_listing.item_editor.created")
                : "Item created successfully.",
            );
        } else {
          if (!quiet)
            NotificationService.showSuccessAlert(
              null,
              this.modern
                ? this.$t("shop_listing.item_editor.updated")
                : "Item updated successfully.",
            );
        }

        if (goMediaAfterCreate) {
          this.tab = "media";
        }

        if (this.modern) this.initial_form = submittedForm;
        // Keep any newer edits or pending media drafts open after this save.
        const keepOpen = silentEmit || this.hasUnsavedChanges;
        if (!keepOpen) this.$emit(wasCreate ? "add" : "edit", saved);
        // Refresh the list even if the editor stays open for media.
        if (this.modern && keepOpen) this.$emit("saved", saved);

        return true;
      } catch (error: any) {
        if (quiet) {
          this.form_error = this.modern
            ? this.$t("shop_listing.item_editor.save_error")
            : "Failed to save item.";
        } else {
          NotificationService.showLaravelError(error);
        }
        return false;
      } finally {
        this.busy_save = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.b-listing-item-editor {
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;

  &__header {
    width: min(1040px, 100%);
    margin: 0 auto;
    padding: 28px 32px 20px;

    .sd-modern-title-text {
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
      letter-spacing: 0;
    }
    .sd-modern-subtitle {
      margin-block-start: 5px;
      font-size: 13px;
      line-height: 21px;
    }
    .sd-modern-icon {
      margin-block-start: 3px;
    }
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 12px;
  }
  &__body {
    width: min(1040px, 100%);
    margin-inline: auto;
    padding: 4px 32px 28px !important;
  }
  &__layout {
    display: grid;
    grid-template-columns: 164px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  &__nav {
    min-width: 0;
    align-self: start;
  }
  &__window {
    width: 100%;
    min-width: 0;
    margin: 0;
  }
  &__error {
    margin-block-end: 18px;
  }
  &__media-start {
    padding: 24px;
    border: 0;
    border-radius: 16px;
  }
  &__media-start .sd-modern-subtitle {
    margin-block-end: 0;
    font-size: 13px;
    line-height: 21px;
  }
  &__footer {
    display: block;
    flex: 0 0 auto;
    width: min(1040px, 100%);
    margin-inline: auto;
    padding: 16px 32px 24px;
  }
  &__footer :deep(.widget-buttons) {
    justify-content: flex-end;
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 8px 0;
  }
  &__submit {
    flex: 0 1 auto !important;
    min-width: 184px;
    padding-inline: 24px !important;
  }
  &__confirmation {
    padding: 24px;

    h2 {
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
    }
    p {
      margin-block: 12px 24px;
      font-size: 13px;
      line-height: 21px;
    }
    .sd-modern-actions {
      justify-content: flex-end;
    }
  }

  @media (max-width: 959px) {
    &__layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 18px;
    }
    &__window {
      max-width: 760px;
      margin-inline: auto;
    }
  }

  @media (max-width: 600px) {
    &__header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      padding: 22px 16px 16px;
      align-items: flex-start;
    }
    &__header-actions {
      margin-inline-start: auto;
    }
    &__body {
      padding: 0 16px 20px !important;
    }
    &__footer {
      padding: 14px 16px 20px;
    }
    &__footer :deep(.widget-buttons) {
      width: 100%;
      padding: 0;
    }
    &__submit {
      width: 100%;
    }
    &__media-start {
      padding: 20px 18px;
    }
  }
}
</style>
