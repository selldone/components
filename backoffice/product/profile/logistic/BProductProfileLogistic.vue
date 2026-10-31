<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-list-item
    v-for="profile_type in LogisticProfileType"
    :key="profile_type.value"
    :prepend-icon="modern ? undefined : profile_type.icon"
    :class="modern ? 'b-product-profile-logistic--modern sd-modern-clickable-item text-start' : 'row-hover'"
    v-bind="$attrs"
    @click="showSetProfile(profile_type, product[profile_type.product_column])"
    slim
    :lines="modern ? undefined : 'one'"
  >
    <template v-if="modern" #prepend>
      <b-product-edit-info-icon class="me-3" :name="profileIcon(profile_type.value)" />
    </template>
    <v-list-item-title>
      <b>{{ $t(profile_type.title) }}</b>
    </v-list-item-title>
    <v-list-item-subtitle>
      {{ modern ? assignedProfileName(profile_type) : $t(profile_type.desc) }}
    </v-list-item-subtitle>

    <v-tooltip
      activator="parent"
      :content-class="modern ? 'sd-modern-tooltip text-start' : 'text-start bg-black'"
      :location="modern ? 'top' : 'end'"
      :max-width="modern ? undefined : 360"
      :open-on-focus="true"
    >
      <div v-if="modern" class="b-product-profile-logistic__tooltip">
        <div class="b-product-profile-logistic__tooltip-heading">
          <b-product-edit-info-icon :name="profileIcon(profile_type.value)" :size="18" />
          <strong>{{ $t(profile_type.title) }}</strong>
        </div>
        <p>{{ t(profilePurposeKey(profile_type)) }}</p>
        <div
          class="b-product-profile-logistic__tooltip-value"
          :class="{ 'b-product-profile-logistic__tooltip-value--assigned': product[profile_type.product_column] }"
        >
          <b-product-edit-info-icon v-if="product[profile_type.product_column]" class="b-product-profile-logistic__tooltip-check no-inv" name="CircleCheck" :size="16" />
          <div>
            <span v-if="product[profile_type.product_column]" class="b-product-profile-logistic__tooltip-label">{{ t('selected') }}</span>
            <strong>{{ assignedProfileName(profile_type) }}</strong>
          </div>
        </div>
        <b-product-profile-location-preview
          modern
          :label="t('tooltip_location')"
          :title="$t(profile_type.title)"
          :order-key="getOrderKey(profile_type.value)"
        />
      </div>
      <template v-else>
        {{ $t(profile_type.desc) }}
        <b-product-profile-location-preview
          class="py-2 px-6"
          :title="$t(profile_type.title)"
          :order-key="getOrderKey(profile_type.value)"
        />
      </template>
    </v-tooltip>

    <template v-slot:append>
      <v-list-item-action end :class="{ 'b-product-profile-logistic__row-actions': modern }">
        <span v-if="modern && product[profile_type.product_column]" class="b-product-profile-logistic__assigned no-inv" role="img" :aria-label="t('assigned')">
          <b-product-edit-info-icon name="CircleCheck" :size="16" />
        </span>
        <v-btn
          v-if="modern"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
          @click.stop="showSetProfile(profile_type, product[profile_type.product_column])"
        >{{ $t(product[profile_type.product_column] ? 'global.actions.change' : 'add_product.edit_info.modern.assign') }}</v-btn>
        <v-btn
          v-else
          :color="product[profile_type.product_column] ? 'success' : 'primary'"
          icon
          variant="text"
        >
          <v-icon
            >{{
              product[profile_type.product_column] ? "check_box" : "add_box"
            }}
          </v-icon>
        </v-btn>
      </v-list-item-action>
    </template>
  </v-list-item>

  <!-- ██████████████████████ Dialog > Select Logistic profile ██████████████████████ -->

  <v-dialog
    v-model="profile_dialog"
    :fullscreen="!modern || $vuetify.display.xs"
    :max-width="modern ? 820 : undefined"
    :persistent="modern && dialogBlocked"
    scrollable
    :transition="modern ? 'dialog-transition' : 'dialog-bottom-transition'"
  >
    <v-card v-if="selected_profile_type" :class="{ 'sd-modern-widget b-product-profile-logistic__dialog text-start': modern }">
      <template v-if="modern">
        <header class="b-product-profile-logistic__header">
          <div class="b-product-profile-logistic__heading">
            <b-product-edit-info-icon :name="profileIcon(selected_profile_type.value)" :size="22" />
            <div><h1>{{ $t('product_logistic_profile.refined.title', { type: $t(selected_profile_type.title) }) }}</h1><p>{{ t('subtitle') }}</p></div>
          </div>
          <v-btn class="sd-modern-icon-button" icon variant="text" :disabled="dialogBlocked" :aria-label="$t('global.actions.close')" @click="closeProfileDialog">
            <b-product-edit-info-icon name="X" :size="16" />
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">{{ $t('global.actions.close') }}</v-tooltip>
          </v-btn>
        </header>
        <v-card-text class="b-product-profile-logistic__workspace sd-modern-canvas">
          <section class="sd-modern-widget b-product-profile-logistic__selection">
            <div class="b-product-profile-logistic__selection-heading">
              <h2>{{ $t(selected_profile_type.title) }}</h2>
              <v-btn class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :to="IS_VENDOR_PANEL ? undefined : { name: 'BPageShopLogisticProfiles' }" :disabled="IS_VENDOR_PANEL || dialogBlocked">
                <template #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>{{ t('create') }}
              </v-btn>
            </div>
            <p class="b-product-profile-logistic__description">{{ t(purposeKey) }}</p>
            <v-locale-provider :rtl="false">
              <!-- Preserve the native autocomplete's RTL overlay workaround. -->
              <b-logistic-profile-input
                :key="`${shop.id}-${selected_profile_type.value}`"
                :model-value="profile_input"
                :shop="shop"
                :type="selected_profile_type"
                :disabled="dialogBlocked"
                :label="t('selected')"
                :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'"
                modern
                class="b-product-profile-logistic__input sd-modern-underlined-field"
                @update:model-value="setProfileInput"
              />
            </v-locale-provider>
            <div class="b-product-profile-logistic__shared">
              <b-product-edit-info-icon name="Copy" :size="14" /><span>{{ t('reusable') }}</span>
              <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="t('reusable')">
                <b-product-edit-info-icon name="Info" :size="15" />
                <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true" :open-on-click="true">{{ t('shared_help') }}</v-tooltip>
              </v-btn>
            </div>
            <p v-if="IS_VENDOR_PANEL" class="b-product-profile-logistic__description b-product-profile-logistic__vendor-note">{{ t('vendor_note') }}</p>
          </section>
          <section v-if="busy || load_error || !profile_input" class="sd-modern-widget b-product-profile-logistic__state" :aria-busy="busy">
            <template v-if="busy"><v-progress-circular indeterminate :size="24" :width="2" color="primary" /><p role="status">{{ t('loading') }}</p></template>
            <template v-else-if="load_error"><b-product-edit-info-icon name="CircleAlert" :size="26" /><p role="alert">{{ t('load_error') }}</p><v-btn class="sd-modern-button" variant="outlined" prepend-icon="refresh" @click="fetchProfile">{{ t('retry') }}</v-btn></template>
            <template v-else><b-product-edit-info-icon name="FileText" :size="28" /><h2>{{ t('empty_title') }}</h2><p>{{ t('empty_body') }}</p></template>
          </section>
          <b-logistic-profile-editor
            v-else-if="profile && articles"
            :key="`${shop.id}-${profile.id}`"
            :articles="articles"
            :profile="profile"
            :shop="shop"
            :editable="!IS_VENDOR_PANEL"
            modern
            @draft-state="setEditorState"
          />
        </v-card-text>
        <v-card-actions class="b-product-profile-logistic__footer">
          <p role="status"><b-product-edit-info-icon name="Info" :size="15" /><span>{{ t(dialogBlocked ? 'pending' : 'selection_scope') }}</span></p>
          <div class="b-product-profile-logistic__footer-actions">
            <v-btn class="sd-modern-button" variant="outlined" :disabled="dialogBlocked" @click="closeProfileDialog">{{ $t('global.actions.cancel') }}</v-btn>
            <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :disabled="confirmBlocked" @click="selectProfile(profile_input)"><template #prepend><b-product-edit-info-icon name="Check" :size="16" /></template>{{ t('confirm') }}</v-btn>
          </div>
        </v-card-actions>
      </template>
      <template v-else>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1" color="#111">sticky_note_2</v-icon>
        {{ $t("product_logistic_profile.dialog.title") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large mb-5">
          <u-widget-header
            :add-caption="$t('product_logistic_profile.dialog.add_new_action')"
            :disabled="IS_VENDOR_PANEL"
            :disabled-reason="
              $t('product_logistic_profile.dialog.add_new_disable_msg')
            "
            :icon="selected_profile_type.icon"
            :title="$t(selected_profile_type.title)"
            :to="{ name: 'BPageShopLogisticProfiles' }"
            add-text
          >
          </u-widget-header>
          <v-list-subheader
            >{{ $t(selected_profile_type.desc) }}
          </v-list-subheader>
          <v-locale-provider :rtl="false"
            ><!-- Fix Open menu bug in RTL Vuetify 3 -->
            <b-logistic-profile-input
              v-model="profile_input"
              :shop="shop"
              :type="selected_profile_type"
            ></b-logistic-profile-input>
          </v-locale-provider>
        </div>

        <div v-if="articles && profile">
          <b-logistic-profile-editor
            :key="profile.id"
            :articles="articles"
            :profile="profile"
            :shop="shop"
            :editable="!IS_VENDOR_PANEL"
          ></b-logistic-profile-editor>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="profile_dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            @click="selectProfile(profile_input)"
          >
            <v-icon class="me-1">check</v-icon>
            {{ $t("global.actions.confirm") }}
          </v-btn>
        </div>
      </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { defineComponent } from "vue";
import { LogisticProfileType } from "@selldone/core-js/enums/logistic/LogisticProfileType";
import BLogisticProfileInput from "../../../logistic/profile/input/BLogisticProfileInput.vue";
import BLogisticProfileEditor from "../../../product/profile/logistic/BLogisticProfileEditor.vue";
import BProductProfileLocationPreview from "@selldone/components-vue/backoffice/product/profile/location-preview/BProductProfileLocationPreview.vue";
import ProductSection from "@selldone/core-js/enums/product/ProductSection.ts";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

const profileRelations = {
  WARRANTY: 'warranty_profile',
  RETURN_POLICY: 'return_policy_profile',
  GUIDE: 'guide_profile',
  SHIPPING: 'shipping_profile',
};

export default defineComponent({
  name: "BProductProfileLogistic",
  components: {
    BProductEditInfoIcon,
    BProductProfileLocationPreview,
    BLogisticProfileEditor,
    BLogisticProfileInput,
  },

  props: {
    modern: { type: Boolean, default: false },
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },
  data: function () {
    return {
      LogisticProfileType: LogisticProfileType,

      selected_profile_type: null,
      profile_dialog: false,
      profile_input: null,

      articles: null,
      profile: null,
      busy: false,
      load_error: false,
      editor_state: { dirty: false, busy: false },
      profile_request: 0,
      disposed: false,
    };
  },

  computed: {
    dialogBlocked() {
      return this.editor_state.dirty || this.editor_state.busy;
    },
    confirmBlocked() {
      return this.dialogBlocked || this.busy || this.load_error;
    },
    purposeKey() {
      return this.profilePurposeKey(this.selected_profile_type);
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },
  watch: {
    profile_input(val) {
      if (this.modern) return;
      if (val) {
        this.fetchProfile();
      } else {
        this.articles = null;
        this.profile = null;
      }
    },
    profile_dialog(open) {
      if (!open) {
        this.profile_request++;
        this.busy = false;
        this.editor_state = { dirty: false, busy: false };
      }
    },
    product() { this.resetProfileDialog(); },
    'product.id'() { this.resetProfileDialog(); },
    'shop.id'() { this.resetProfileDialog(); },
    IS_VENDOR_PANEL() { this.resetProfileDialog(); },
    '$route.params.vendor_id'() { this.resetProfileDialog(); },
  },
  beforeUnmount() {
    this.disposed = true;
    this.profile_request++;
  },

  methods: {
    t(key) { return this.$t(`product_logistic_profile.refined.${key}`); },
    setEditorState(state) {
      if (this.disposed) return;
      // A late profile refresh must not replace a shared-content edit or save.
      if (!this.dialogBlocked && (state.dirty || state.busy)) this.profile_request++;
      this.editor_state = state;
    },
    resetProfileDialog() {
      this.profile_request++;
      this.profile_dialog = false;
      this.busy = false;
      this.load_error = false;
      this.profile = null;
      this.articles = null;
      this.editor_state = { dirty: false, busy: false };
    },
    closeProfileDialog() {
      if (this.modern && this.dialogBlocked) return;
      this.profile_dialog = false;
    },
    setProfileInput(value) {
      if (this.dialogBlocked) return;
      this.profile_request++;
      this.profile_input = value ?? null;
      this.profile = null;
      this.articles = null;
      this.busy = false;
      this.load_error = false;
      this.editor_state = { dirty: false, busy: false };
      if (this.profile_input) this.fetchProfile();
    },
    profileIcon(type) {
      return { WARRANTY: 'ShieldCheck', RETURN_POLICY: 'Undo2', GUIDE: 'BookOpen', SHIPPING: 'Truck' }[type];
    },
    profilePurposeKey(type) {
      return { WARRANTY: 'purpose_warranty', RETURN_POLICY: 'purpose_returns', GUIDE: 'purpose_guide', SHIPPING: 'purpose_shipping' }[type?.value];
    },
    matchesProfile(profile, id, type) {
      return !!profile && String(profile.id) === String(id) &&
        (!profile.type || profile.type === type.value) &&
        (!profile.shop_id || String(profile.shop_id) === String(this.shop.id));
    },
    assignedProfileName(type) {
      const id = this.product[type.product_column];
      if (!id) return this.$t('add_product.edit_info.modern.not_assigned');
      const profile = [this.product[profileRelations[type.value]], this.profile]
        .find(item => this.matchesProfile(item, id, type) && typeof item.name === 'string' && item.name.trim());
      return profile?.name || this.t('assigned');
    },
    // ████████████████████ Logistic Profiles ████████████████████

    showSetProfile(type, id) {
      if (this.modern && this.dialogBlocked) return;
      const sameProfile = this.profile_input === id;
      this.profile_request++;
      this.profile_input = id;
      this.selected_profile_type = type;
      this.profile_dialog = true;
      if (this.modern) this.setProfileInput(id);
      else if (id && sameProfile) this.fetchProfile();
    },
    selectProfile(profile_id) {
      if (!this.selected_profile_type || (this.modern && (this.confirmBlocked || profile_id !== this.profile_input))) return;
      if (
        this.selected_profile_type.value === LogisticProfileType.WARRANTY.value
      ) {
        this.product.warranty_id = profile_id;
      } else if (
        this.selected_profile_type.value ===
        LogisticProfileType.RETURN_POLICY.value
      ) {
        this.product.return_policy_id = profile_id;
      } else if (
        this.selected_profile_type.value === LogisticProfileType.GUIDE.value
      ) {
        this.product.guide_id = profile_id;
      } else if (
        this.selected_profile_type.value === LogisticProfileType.SHIPPING.value
      ) {
        this.product.shipping_id = profile_id;
      }

      if (this.modern) {
        const profile = this.matchesProfile(this.profile, profile_id, this.selected_profile_type) ? this.profile : null;
        this.product[profileRelations[this.selected_profile_type.value]] = profile_id && profile
          ? { id: profile.id, type: profile.type || this.selected_profile_type.value, name: profile.name, info: profile.info ? JSON.parse(JSON.stringify(profile.info)) : null }
          : null;
      }

      this.profile_dialog = false;
    },

    async fetchProfile() {
      if (this.disposed || !this.profile_input || (this.modern && this.dialogBlocked)) return;
      const request = ++this.profile_request;
      const shopId = this.shop.id, product = this.product, profileId = this.profile_input, type = this.selected_profile_type?.value, vendorId = this.$route.params.vendor_id, vendorPanel = this.IS_VENDOR_PANEL;
      const current = () => !this.disposed && request === this.profile_request && this.shop.id === shopId && this.product === product && this.profile_input === profileId && this.selected_profile_type?.value === type && this.$route.params.vendor_id === vendorId && this.IS_VENDOR_PANEL === vendorPanel && (!this.modern || this.profile_dialog);
      this.busy = true;
      this.load_error = false;

      const handleSuccessResponse = ({ profile, articles }) => {
        if (!current() || (this.modern && this.dialogBlocked)) return;
        if (!profile || profile.id != profileId || !Array.isArray(articles)) {
          this.load_error = true;
          return;
        }
        this.profile = profile;
        this.articles = articles;
        this.busy = false;
        this.load_error = false;
      };

      try {
        await window.$backoffice.logistic.profile
        .cancellation()
        .optimize(120)
        .get(this.shop.id, this.profile_input)
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse);
      } catch (error) {
        if (current()) {
          if (!this.dialogBlocked) this.load_error = true;
          NotificationService.showLaravelError(error);
        }
      } finally {
        if (current()) this.busy = false;
      }
    },

    getOrderKey(code) {
      if (code === LogisticProfileType.GUIDE.value) return ProductSection.guide.code;
      else if (code === LogisticProfileType.RETURN_POLICY.value)
        return ProductSection.return_policy.code;
      else if (code === LogisticProfileType.SHIPPING.value) return ProductSection.shipping.code;
      else if (code === LogisticProfileType.WARRANTY.value) return ProductSection.warranty.code;
    },
  },
});
</script>

<style lang="scss" scoped>
.b-product-profile-logistic__tooltip {
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
  line-height: 21px;

  strong { font-size: 13px; font-weight: 500; }
  p { margin: 8px 0 12px; color: rgba(var(--v-theme-on-surface), .72); }

  .b-product-profile-logistic__tooltip-heading { display: flex; align-items: center; gap: 8px; }
  .b-product-profile-logistic__tooltip-heading .b-product-edit-info-icon { color: rgba(var(--v-theme-on-surface), .65); }
  .b-product-profile-logistic__tooltip-value { margin-bottom: 16px; }
  .b-product-profile-logistic__tooltip-value--assigned {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(var(--v-theme-on-surface), .035);
  }
  .b-product-profile-logistic__tooltip-value--assigned > div { min-width: 0; }
  .b-product-profile-logistic__tooltip-value strong { display: block; overflow-wrap: anywhere; }
  .b-product-profile-logistic__tooltip-label { display: block; margin-bottom: 2px; color: rgba(var(--v-theme-on-surface), .65); font-size: 12px; line-height: 18px; }
  .b-product-profile-logistic__tooltip-check { flex-shrink: 0; margin-top: 3px; color: rgb(var(--v-theme-success)); }
}

.b-product-profile-logistic__dialog.v-card {
  --sd-modern-icon-button-size: 32px;
  padding: 0;
  border-radius: 18px;
  color: rgb(var(--v-theme-on-surface));

  .b-product-profile-logistic__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding: 24px 24px 22px;
    flex: 0 0 auto;
  }
  .b-product-profile-logistic__heading {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    min-width: 0;
    > .b-product-edit-info-icon { margin-block-start: 3px; color: var(--sd-modern-muted); flex-shrink: 0; }
    h1 { margin: 0; font-family: inherit; font-size: 20px; font-weight: 500; line-height: 28px; letter-spacing: -.2px; }
    p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  }
  .b-product-profile-logistic__workspace {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    min-width: 0;
  }
  .b-product-profile-logistic__selection {
    flex-shrink: 0;
    padding: 21px;
    border-radius: 14px;
  }
  .b-product-profile-logistic__selection-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    h2 { margin: 0; font-size: 16px; font-weight: 500; line-height: 24px; }
  }
  .b-product-profile-logistic__description { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  .b-product-profile-logistic__input { margin-block-start: 18px; }
  .b-product-profile-logistic__shared {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-block-start: 10px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    > .b-product-edit-info-icon { flex-shrink: 0; }
  }
  .b-product-profile-logistic__vendor-note { margin-block-start: 12px; }
  .b-product-profile-logistic__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 34px 21px;
    text-align: center;
    > .b-product-edit-info-icon { color: var(--sd-modern-muted); }
    h2 { max-width: 340px; margin: 0; font-size: 15px; font-weight: 500; line-height: 24px; }
    p { max-width: 360px; margin: 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 22px; }
  }
  .b-product-profile-logistic__footer {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 24px;
    > p {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      max-width: 365px;
      margin: 0;
      color: var(--sd-modern-muted);
      font-size: 13px;
      line-height: 21px;
      > .b-product-edit-info-icon { margin-block-start: 3px; flex-shrink: 0; }
    }
  }
  .b-product-profile-logistic__footer-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .b-product-profile-logistic__footer-actions > .sd-modern-button { font-size: 13px; line-height: 20px; }
  @media (max-width: 600px) {
    border-radius: 18px 18px 0 0;
    .b-product-profile-logistic__header { padding: 21px 18px; gap: 10px; }
    .b-product-profile-logistic__heading { gap: 9px; h1 { font-size: 18px; line-height: 27px; } }
    .b-product-profile-logistic__workspace { padding: 14px; gap: 14px; }
    .b-product-profile-logistic__selection { padding: 18px; }
    .b-product-profile-logistic__footer { flex-direction: column; align-items: stretch; gap: 16px; padding: 19px 18px 22px; > p { max-width: none; } }
    .b-product-profile-logistic__footer-actions { justify-content: flex-end; flex-wrap: wrap; }
  }
}
.b-product-profile-logistic--modern {
  min-height: 62px;
  padding: 10px 12px;
  border-radius: 9px;
  :deep(.v-list-item-title), :deep(.v-list-item-title b) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; white-space: normal; }
  :deep(.v-list-item-subtitle) { margin-top: 2px; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 19px; opacity: 1; white-space: normal; overflow-wrap: anywhere; }
  :deep(.v-list-item__append) { padding-inline-start: 12px; }
  .b-product-profile-logistic__row-actions { display: flex; flex-direction: row; align-items: center; gap: 6px; margin-inline-end: 0; }
  .b-product-profile-logistic__assigned { display: inline-flex; color: rgb(var(--v-theme-success)); }
  .b-product-profile-logistic__assigned .b-product-edit-info-icon { color: inherit; }
  .b-product-edit-info-icon { color: var(--sd-modern-muted); }
}
</style>
