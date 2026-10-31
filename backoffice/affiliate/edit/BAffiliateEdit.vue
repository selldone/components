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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card
    flat
    class="b-affiliate-edit"
    :class="{ 'b-affiliate-edit--modern': modern }"
  >
    <v-card-title v-if="!modern"></v-card-title>
    <v-card-text :class="modern ? 'b-affiliate-edit__body' : 'pt-5'">
      <div :class="{ 'b-affiliate-edit__workspace': modern }">
        <nav
          v-if="modern"
          class="sd-modern-section-nav b-affiliate-edit__nav"
          :aria-label="$t('affiliate_workspace.settings.all_groups_label')"
        >
          <v-btn
            v-for="group in settings_groups"
            :key="group.id"
            type="button"
            variant="text"
            class="sd-modern-section-nav__item"
            :aria-current="active_group === group.id ? 'location' : undefined"
            @click="active_group = group.id"
          >
            <v-icon aria-hidden="true" size="18">{{ group.icon }}</v-icon>
            {{ $t(group.label) }}
          </v-btn>
        </nav>
        <v-form
          v-show="!modern || active_group !== 'delete'"
          ref="form"
          lazy-validation
          :disabled="modern && !canWrite"
          :class="{ 'b-affiliate-edit__form': modern }"
        >
          <div
            :class="{
              'sd-modern-widget sd-modern-underlined-field b-affiliate-edit__widget':
                modern,
            }"
          >
            <div
              v-show="!modern || active_group === 'general'"
              data-setting-group="general"
              :class="modern ? 'b-affiliate-edit__group' : 'widget-box mb-5'"
            >
              <u-widget-header
                :title="
                  modern
                    ? $t('affiliate_workspace.settings.general')
                    : affiliate
                      ? $t('affiliate_edit.config.edit')
                      : $t('affiliate_edit.config.new')
                "
                :icon="modern ? undefined : 'tune'"
                :class="{ 'sd-modern-form-header': modern }"
              ></u-widget-header>

              <v-list-subheader>
                {{
                  $t(
                    modern
                      ? "affiliate_workspace.settings.general_subtitle"
                      : "affiliate_edit.config.subtitle",
                  )
                }}
              </v-list-subheader>

              <v-text-field
                v-model="name"
                :label="$t('affiliate_edit.inputs.name.label')"
                :rules="[GlobalRules.required()]"
                :messages="$t('affiliate_edit.inputs.name.message')"
                variant="underlined"
              ></v-text-field>

              <u-smart-toggle
                v-model="enable"
                :disabled="modern && !canWrite"
                :true-description="
                  $t('affiliate_edit.inputs.enable.true_description')
                "
                :true-title="$t('global.commons.enable')"
                class="my-3"
                false-gray
                inset
              ></u-smart-toggle>

              <u-text-copy-box
                v-if="affiliate && !modern"
                :message="$t('affiliates.affiliate_code')"
                :value="affiliate.code"
                color="primary"
              ></u-text-copy-box>
              <dl
                v-if="modern && affiliate"
                class="sd-modern-form-meta b-affiliate-edit__meta"
              >
                <div>
                  <dt>{{ $t("affiliate_workspace.settings.code_locked") }}</dt>
                  <dd>
                    <bdi>{{ affiliate.code }}</bdi>
                  </dd>
                </div>
                <v-tooltip
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                >
                  <template #activator="{ props }"
                    ><v-btn
                      v-bind="props"
                      type="button"
                      class="sd-modern-icon-button"
                      variant="text"
                      :aria-label="$t('global.actions.copy')"
                      @click="copyReferralCode"
                      ><v-icon aria-hidden="true">content_copy</v-icon></v-btn
                    ></template
                  >
                  {{ $t("global.actions.copy") }}
                </v-tooltip>
              </dl>
            </div>

            <div
              v-show="!modern || active_group === 'commission'"
              data-setting-group="commission"
              :class="modern ? 'b-affiliate-edit__group' : 'widget-box mb-5'"
            >
              <u-widget-header
                :title="
                  $t(
                    modern
                      ? 'affiliate_workspace.settings.commission'
                      : 'affiliate_edit.payment.title',
                  )
                "
                :icon="modern ? undefined : 'payment'"
                :class="{ 'sd-modern-form-header': modern }"
              ></u-widget-header>

              <v-list-subheader>
                {{
                  $t(
                    modern
                      ? "affiliate_workspace.settings.commission_subtitle"
                      : "affiliate_edit.payment.subtitle",
                  )
                }}
              </v-list-subheader>

              <u-currency-input
                v-if="!modern || !affiliate"
                v-model="currency"
                :disabled="!!affiliate"
                :label="$t('global.commons.currency')"
                :return-object="false"
                variant="underlined"
              ></u-currency-input>
              <dl v-else class="sd-modern-form-meta b-affiliate-edit__meta">
                <div>
                  <dt>
                    {{ $t("affiliate_workspace.settings.currency_locked") }}
                  </dt>
                  <dd>
                    <u-currency-icon
                      :currency="currency"
                      flag-only
                      small
                    ></u-currency-icon
                    >{{ currency
                    }}<v-icon aria-hidden="true" size="14">lock_outline</v-icon>
                  </dd>
                </div>
              </dl>

              <u-smart-switch
                v-model="commission"
                :disabled="modern && !canWrite"
                class="mb-5"
                :false-description="
                  $t('affiliate_edit.inputs.commission.false_description')
                "
                false-icon="calculate"
                :false-title="
                  $t('affiliate_edit.inputs.commission.false_title')
                "
                :label="$t('affiliate_edit.inputs.commission.label')"
                :true-description="
                  $t('affiliate_edit.inputs.commission.true_description')
                "
                true-icon="local_offer"
                :true-title="$t('affiliate_edit.inputs.commission.true_title')"
              >
              </u-smart-switch>

              <v-scroll-y-reverse-transition hide-on-leave>
                <div v-if="commission" key="1">
                  <div
                    v-if="modern"
                    class="b-affiliate-edit__commission-preview"
                  >
                    <p class="sd-modern-subtitle">
                      {{
                        $t(
                          "affiliate_workspace.settings.product_commission_help",
                        )
                      }}
                    </p>
                    <div class="b-affiliate-edit__commission-example">
                      <div>
                        <span>{{ $t("add_product.pricing.price_input") }}</span
                        ><u-price
                          :amount="69.99"
                          :currency="currency"
                        ></u-price>
                      </div>
                      <v-icon aria-hidden="true" size="18"
                        >arrow_forward</v-icon
                      >
                      <div>
                        <span>{{
                          $t("affiliate_edit.affiliate_commission")
                        }}</span
                        ><u-price :amount="8" :currency="currency"></u-price>
                      </div>
                    </div>
                  </div>
                  <v-sheet
                    v-else
                    class="widget-box mx-auto usn price-prev"
                    theme="dark"
                  >
                    <u-currency-input
                      v-model="currency"
                      :activeCurrencies="shop.currencies"
                      :label="$t('add_product.pricing.currency_input')"
                      :messages="
                        $t('add_product.pricing.currency_input_messages')
                      "
                      class="sm-suffix pen"
                      dark
                    />

                    <u-price-input
                      :currency="currency"
                      :label="$t('add_product.pricing.price_input')"
                      :model-value="69.99"
                      class="sm-suffix strong-field pen"
                      dark
                      required
                      variant="underlined"
                    />

                    <div
                      class="ma-n1 pa-1 position-relative"
                      style="border: solid #f3c50e medium; border-radius: 10px"
                    >
                      <u-price-input
                        :currency="currency"
                        :label="$t('add_product.pricing.commission_input')"
                        :model-value="8"
                        class="sm-suffix strong-field pen"
                        dark
                        hide-details
                        variant="underlined"
                      />
                      <div
                        class="absolute-top-center pa-2 rounded-xl"
                        style="background: #f3c50e; top: -20px; color: #000"
                      >
                        {{ $t("affiliate_edit.affiliate_commission") }}
                      </div>
                    </div>
                  </v-sheet>
                </div>

                <div v-else key="2" :class="{ 'sd-modern-form-grid': modern }">
                  <u-number-input
                    v-model="percent"
                    :label="$t('affiliates.percent_commission')"
                    :max="100"
                    :min="0"
                    class="strong-field"
                    suffix="%"
                    variant="underlined"
                  ></u-number-input>

                  <u-price-input
                    v-model="fix"
                    :currency="currency"
                    :label="$t('affiliates.fix_commission')"
                    class="strong-field"
                    variant="underlined"
                  ></u-price-input>
                </div>
              </v-scroll-y-reverse-transition>
            </div>

            <div
              v-show="!modern || active_group === 'contact'"
              data-setting-group="contact"
              :class="modern ? 'b-affiliate-edit__group' : 'widget-box mb-5'"
            >
              <u-widget-header
                :title="
                  $t(
                    modern
                      ? 'affiliate_workspace.settings.contact'
                      : 'affiliate_edit.contact.title',
                  )
                "
                :icon="modern ? undefined : 'person'"
                :class="{ 'sd-modern-form-header': modern }"
              ></u-widget-header>

              <v-list-subheader>
                {{
                  $t(
                    modern
                      ? "affiliate_workspace.settings.contact_subtitle"
                      : "affiliate_edit.contact.subtitle",
                  )
                }}
              </v-list-subheader>

              <v-expand-transition>
                <s-user-input
                  v-if="user_edit"
                  v-model:user-id="user_id"
                  :label="$t('affiliate_edit.inputs.user.label')"
                  :messages="$t('affiliate_edit.inputs.user.message')"
                  variant="underlined"
                  @update:model-value="
                    (val) => {
                      if (!email) email = val;
                    }
                  "
                ></s-user-input>

                <div v-else class="d-flex align-center">
                  <v-avatar
                    class="m-3 avatar-gradient -thin -affiliate"
                    size="38"
                  >
                    <v-img :src="getUserAvatar(user_id)" />
                  </v-avatar>

                  <div v-if="affiliate.user" class="flex-grow-1 text-start">
                    <b>{{ affiliate.user.name }}</b>
                    <small class="d-block">{{ affiliate.user.email }}</small>
                  </div>
                  <v-btn
                    v-if="!modern"
                    :title="$t('global.actions.edit')"
                    icon
                    variant="text"
                    @click="user_edit = true"
                  >
                    <v-icon>edit</v-icon>
                  </v-btn>
                  <v-tooltip
                    v-else
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                  >
                    <template #activator="{ props }"
                      ><v-btn
                        v-bind="props"
                        type="button"
                        class="sd-modern-icon-button"
                        variant="text"
                        :aria-label="$t('global.actions.edit')"
                        @click="user_edit = true"
                        ><v-icon aria-hidden="true">edit</v-icon></v-btn
                      ></template
                    >
                    {{ $t("global.actions.edit") }}
                  </v-tooltip>
                </div>
              </v-expand-transition>

              <div
                :class="{
                  'sd-modern-form-grid b-affiliate-edit__contact-fields':
                    modern,
                }"
              >
                <v-text-field
                  v-model="email"
                  :label="$t('global.commons.email')"
                  :rules="[GlobalRules.required()]"
                  :placeholder="
                    modern ? undefined : 'Optional, Ex: affiliate-email@...'
                  "
                  prepend-inner-icon="alternate_email"
                  variant="underlined"
                ></v-text-field>

                <v-text-field
                  v-model="web"
                  :label="$t('global.commons.website')"
                  :placeholder="$t('affiliate_edit.inputs.web.placeholder')"
                  prepend-inner-icon="public"
                  variant="underlined"
                ></v-text-field>

                <v-text-field
                  v-model="address"
                  :label="$t('global.commons.address')"
                  :placeholder="$t('affiliate_edit.inputs.address.placeholder')"
                  prepend-inner-icon="place"
                  variant="underlined"
                ></v-text-field>
                <v-text-field
                  v-model="tel"
                  :label="$t('global.commons.tel')"
                  :placeholder="$t('affiliate_edit.inputs.tel.placeholder')"
                  prepend-inner-icon="local_phone"
                  variant="underlined"
                ></v-text-field>
              </div>

              <v-textarea
                v-model="bank"
                :label="$t('global.commons.bank_info')"
                :rows="2"
                auto-grow
                :placeholder="$t('affiliate_edit.inputs.bank.placeholder')"
                prepend-inner-icon="account_balance"
                variant="underlined"
              ></v-textarea>
            </div>

            <div
              v-show="!modern || active_group === 'products'"
              data-setting-group="products"
              :class="modern ? 'b-affiliate-edit__group' : 'widget-box mb-5'"
            >
              <u-widget-header
                :title="
                  $t(
                    modern
                      ? 'affiliate_workspace.settings.products'
                      : 'affiliate_edit.restriction.title',
                  )
                "
                :icon="modern ? undefined : 'border_outer'"
                :class="{ 'sd-modern-form-header': modern }"
              ></u-widget-header>

              <v-list-subheader>
                {{
                  $t(
                    modern
                      ? "affiliate_workspace.settings.products_subtitle"
                      : "affiliate_edit.restriction.subtitle",
                  )
                }}
              </v-list-subheader>

              <b-products-select-box
                v-model="products"
                :label="$t('affiliate_edit.inputs.products.label')"
                :messages="
                  (modern ? '' : has_product_restrictions ? '❌ ' : '✅ ') +
                  $t('blank_is_all_products')
                "
                :shop="shop"
                border-less
                >{{ $t("affiliate_edit.inputs.products.select_product") }}
                <b v-if="!has_product_restrictions" class="ms-1"
                  >(
                  <v-icon class="me-1" size="small">all_inclusive</v-icon>
                  {{ $t("global.commons.all") }})</b
                ></b-products-select-box
              >
            </div>

            <div
              v-show="!modern || active_group === 'products'"
              data-setting-group="products"
              :class="
                modern
                  ? 'b-affiliate-edit__group b-affiliate-edit__domain'
                  : 'widget-box mb-5'
              "
            >
              <u-widget-header
                :title="$t('affiliate_edit.link_domain.title')"
                :icon="modern ? undefined : 'add_link'"
                :class="{ 'sd-modern-form-header': modern }"
              ></u-widget-header>

              <v-list-subheader>
                {{ $t("affiliate_edit.link_domain.subtitle") }}
              </v-list-subheader>

              <v-select
                v-model="selected_domain"
                :items="domains"
                class="english-field"
                clearable
                item-title="domain"
                item-value="id"
                messages=" "
                return-object
                variant="underlined"
                :placeholder="$t('affiliate_edit.inputs.domain.placeholder')"
              >
                <template v-if="selected_domain" v-slot:message>
                  <span
                    v-if="!selected_domain.approved"
                    :class="modern ? 'b-affiliate-edit__warning' : 'text-red'"
                    role="status"
                  >
                    {{
                      $t("affiliate_edit.link_domain.domain_not_approved_msg")
                    }}
                  </span>
                  <span
                    v-else-if="!selected_domain.enable"
                    :class="modern ? 'b-affiliate-edit__warning' : 'text-red'"
                    role="status"
                  >
                    {{
                      $t("affiliate_edit.link_domain.domain_is_not_enable_msg")
                    }}
                  </span>
                  <span
                    v-else-if="
                      selected_domain.affiliate_id &&
                      selected_domain.affiliate_id !== affiliate.id
                    "
                    :class="modern ? 'b-affiliate-edit__warning' : 'text-red'"
                    role="status"
                  >
                    {{
                      $t(
                        "affiliate_edit.link_domain.domain_is_linked_to_other_affiliate_msg",
                      )
                    }}
                  </span>
                  <div v-else class="text-end">
                    <v-btn
                      :href="'https://' + selected_domain.domain"
                      :class="
                        modern
                          ? 'sd-modern-button sd-modern-button--inline'
                          : 'mt-1'
                      "
                      color="primary"
                      size="small"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="text"
                    >
                      <v-icon v-if="!modern" class="mx-1" size="small"
                        >launch</v-icon
                      >
                      {{ $t("global.actions.view_website") }}
                      <v-icon v-if="modern" end aria-hidden="true" size="16"
                        >north_east</v-icon
                      >
                    </v-btn>
                  </div>
                </template>
              </v-select>
            </div>

            <div
              v-show="!modern || active_group === 'pos'"
              data-setting-group="pos"
              :class="
                modern ? 'b-affiliate-edit__group' : 'widget-box mb-5 pb-5'
              "
            >
              <u-widget-header
                :title="$t('affiliate_pos.title')"
                :icon="modern ? undefined : 'table_view'"
                :class="{ 'sd-modern-form-header': modern }"
              ></u-widget-header>

              <v-list-subheader>
                {{
                  $t(
                    modern
                      ? "affiliate_workspace.pos.subtitle"
                      : "affiliate_pos.description",
                  )
                }}
              </v-list-subheader>
              <u-smart-toggle
                v-model="pos"
                :disabled="modern && !canWrite"
                class="my-3"
                false-gray
                inset
                :true-description="
                  $t(
                    modern
                      ? 'affiliate_workspace.pos.toggle_help'
                      : 'affiliate_edit.inputs.pos.true_description',
                  )
                "
                true-icon="point_of_sale"
                :true-title="$t('affiliate_edit.inputs.pos.true_title')"
              ></u-smart-toggle>

              <v-expand-transition>
                <div v-if="user_id && pos">
                  <b-affiliate-pos-pods
                    :shop="shop"
                    :user-id="user_id"
                    :user-name="
                      modern
                        ? affiliate?.user?.id === user_id
                          ? affiliate.user.name
                          : undefined
                        : name
                    "
                    :modern="modern"
                  ></b-affiliate-pos-pods>
                </div>
                <div
                  v-else-if="pos"
                  :class="{ 'sd-modern-notice': modern }"
                  role="status"
                >
                  <v-icon
                    class="me-1"
                    :color="modern ? undefined : 'red'"
                    size="18"
                    >warning</v-icon
                  >
                  <span :class="{ 'sd-modern-notice__content': modern }">{{
                    $t("affiliate_edit.set_users_first_message")
                  }}</span>
                </div>
              </v-expand-transition>
            </div>

            <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ 🆑 Cluster ━━━━━━━━━━━━━━━━━━━━━━━━ -->
            <div
              v-show="!modern || active_group === 'organization'"
              data-setting-group="organization"
              :class="modern ? 'b-affiliate-edit__group' : 'widget-box mb-5'"
            >
              <u-widget-header
                :to="
                  modern
                    ? undefined
                    : { name: 'BPageShopClassificationClusters' }
                "
                :add-caption="
                  modern
                    ? undefined
                    : $t('affiliate_edit.cluster.manage_action')
                "
                add-icon="settings"
                add-text
                :icon="modern ? undefined : 'workspaces'"
                :title="
                  $t(
                    modern
                      ? 'affiliate_workspace.settings.organization'
                      : 'affiliate_edit.cluster.title',
                  )
                "
                :class="{ 'sd-modern-form-header': modern }"
              ></u-widget-header>

              <v-list-subheader>
                {{
                  $t(
                    modern
                      ? "affiliate_workspace.settings.organization_subtitle"
                      : "affiliate_edit.cluster.subtitle",
                  )
                }}
              </v-list-subheader>
              <b-cluster-input
                v-model="cluster_id"
                :return-object="false"
                clearable
                icon="workspaces_filled"
                no-home
              ></b-cluster-input>
              <v-btn
                v-if="modern"
                :to="{ name: 'BPageShopClassificationClusters' }"
                class="sd-modern-button sd-modern-button--inline"
                variant="text"
                color="primary"
                prepend-icon="settings"
              >
                {{ $t("affiliate_edit.cluster.manage_action") }}
              </v-btn>
            </div>
            <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
            <footer
              v-if="modern"
              class="b-affiliate-edit__actions sd-modern-form-actions"
            >
              <span class="b-affiliate-edit__save-scope">{{
                $t("affiliate_workspace.settings.save_scope")
              }}</span>
              <s-widget-buttons :auto-fixed-position="false">
                <v-btn
                  v-if="hasBack"
                  type="button"
                  class="sd-modern-button"
                  variant="text"
                  @click="$emit('close')"
                  >{{ $t("global.actions.close") }}</v-btn
                >
                <v-btn
                  type="button"
                  class="sd-modern-button sd-modern-button--primary"
                  color="primary"
                  variant="flat"
                  :disabled="!canWrite"
                  :prepend-icon="affiliate ? 'save' : 'add'"
                  :loading="affiliate ? busy_update : busy_create"
                  @click="affiliate ? updateAffiliate() : createAffiliate()"
                  >{{
                    $t(
                      affiliate
                        ? "global.actions.save_changes"
                        : "affiliate_edit.actions.add",
                    )
                  }}</v-btn
                >
              </s-widget-buttons>
            </footer>
          </div>
        </v-form>
        <div
          v-if="modern && active_group === 'delete' && $slots.delete"
          class="b-affiliate-edit__critical"
        >
          <slot name="delete"></slot>
        </div>
      </div>
    </v-card-text>
    <v-card-actions v-if="!modern">
      <s-widget-buttons :auto-fixed-position="!hasBack">
        <v-btn
          v-if="hasBack"
          size="x-large"
          variant="text"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>
        <v-btn
          v-if="affiliate"
          :loading="busy_update"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="updateAffiliate()"
        >
          <v-icon start>save</v-icon>
          {{ $t("affiliate_edit.actions.update") }}
        </v-btn>
        <v-btn
          v-else
          :loading="busy_create"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createAffiliate()"
        >
          <v-icon start>add</v-icon>
          {{ $t("affiliate_edit.actions.add") }}
        </v-btn>
      </s-widget-buttons>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import BProductsSelectBox from "../../../backoffice/product/select-box/BProductsSelectBox.vue";
import SUserInput from "../../user/input/SUserInput.vue";
import UPriceInput from "../../../ui/price/input/UPriceInput.vue";
import UPrice from "../../../ui/price/UPrice.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";

import BAffiliatePosPods from "../../affiliate/pos/pods/BAffiliatePosPods.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions.ts";

export default {
  name: "BAffiliateEdit",
  mixins: [],
  components: {
    UWidgetHeader,
    SWidgetButtons,
    BClusterInput,
    USmartToggle,
    USmartSwitch,
    BAffiliatePosPods,

    UTextCopyBox,
    BProductsSelectBox,
    SUserInput,
    UPriceInput,
    UPrice,
    UCurrencyIcon,
    UCurrencyInput,
    UNumberInput,
  },

  props: {
    shop: {
      require: true,
      type: Object,
    },
    affiliate: {},
    modern: {
      type: Boolean,
      default: false,
    },
    canWrite: {
      type: Boolean,
      default: false,
    },
    hasBack: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      active_group: "general",
      //-------------------

      enable: true,
      fix: 0,
      percent: 0,
      currency: Currency.USD.code,
      user_id: null,
      name: null,
      email: null,
      address: null,
      web: null,
      tel: null,
      bank: null,
      products: [],

      commission: false,

      user_edit: false,

      pos: false,

      cluster_id: null,

      //--------------
      busy_create: false,
      busy_update: false,

      //--------------
      selected_domain: null,
    };
  },
  computed: {
    settings_groups() {
      return [
        {
          id: "general",
          icon: "tune",
          label: "affiliate_workspace.settings.general",
        },
        {
          id: "commission",
          icon: "percent",
          label: "affiliate_workspace.settings.commission",
        },
        {
          id: "contact",
          icon: "contact_page",
          label: "affiliate_workspace.settings.contact",
        },
        {
          id: "products",
          icon: "inventory_2",
          label: "affiliate_workspace.settings.products",
        },
        { id: "pos", icon: "point_of_sale", label: "affiliate_pos.title" },
        {
          id: "organization",
          icon: "workspaces",
          label: "affiliate_workspace.settings.organization",
        },
        ...(this.modern && this.$slots.delete
          ? [
              {
                id: "delete",
                icon: "delete_outline",
                label: "affiliate_workspace.settings.delete_title",
              },
            ]
          : []),
      ];
    },
    currencyObject() {
      return Currency[this.currency];
    },
    has_product_restrictions() {
      return this.products && Object.keys(this.products).length;
    },
    domains() {
      return this.shop.domains;
    },
  },

  watch: {
    active_group(group) {
      this.$emit("update:active-group", group);
    },
  },

  mounted() {},
  created() {
    this.assign();
  },

  methods: {
    async copyReferralCode() {
      try {
        await navigator.clipboard.writeText(this.affiliate.code);
        NotificationService.showSuccessAlert(
          null,
          this.$t("affiliate_workspace.settings.code_copied"),
        );
      } catch {
        NotificationService.showErrorAlert(
          null,
          this.$t("affiliate_workspace.settings.copy_failed"),
        );
      }
    },
    async validateModernForm() {
      const { valid, errors } = await this.$refs.form.validate();
      if (valid) return true;
      // Keep every native field mounted; reveal the first invalid group before focusing it.
      const field = Array.from(this.$el.querySelectorAll("[id]")).find(
        (element: HTMLElement) => element.id === errors[0]?.id,
      ) as HTMLElement;
      const group = field?.closest<HTMLElement>("[data-setting-group]");
      if (group) this.active_group = group.dataset.settingGroup;
      await this.$nextTick();
      field?.focus();
      return false;
    },
    //――――――――――――――――――――――― Edit Affiliate ―――――――――――――――――――――――

    assign() {
      if (this.affiliate) {
        this.enable = this.affiliate.enable;
        this.pos = this.affiliate.pos;

        this.fix = this.affiliate.fix;
        this.percent = this.affiliate.percent;
        this.currency = this.affiliate.currency;
        this.user_id = this.affiliate.user_id;
        this.name = this.affiliate.name;
        this.email = this.affiliate.email;
        this.address = this.affiliate.address;
        this.web = this.affiliate.web;
        this.tel = this.affiliate.tel;
        this.bank = this.affiliate.bank;
        this.products = this.affiliate.products;
        this.commission = this.affiliate.commission;

        this.user_edit = !this.user_id;

        this.selected_domain =
          this.affiliate.domains && this.affiliate.domains.length
            ? this.affiliate.domains[0]
            : null;

        this.cluster_id = this.affiliate.cluster_id;
      } else {
        this.enable = true;
        this.pos = false;
        this.fix = 0;
        this.percent = 0;
        this.user_id = null;
        this.name = null;
        this.email = null;
        this.address = null;
        this.web = null;
        this.tel = null;
        this.bank = null;
        this.products = [];
        this.commission = false;

        this.user_edit = true;

        this.selected_domain = null;

        this.cluster_id = null;
      }
    },
    async updateAffiliate() {
      if (this.modern && (!this.canWrite || this.busy_update)) return;
      if (this.modern) {
        if (!(await this.validateModernForm())) return;
      } else {
        this.$refs.form.validate();
      }

      // 🔏 Recheck current Marketing write access immediately before the modern mutation.
      if (
        this.modern &&
        (!this.canWrite ||
          this.busy_update ||
          !this.writeShopAccess(ShopPermissionRegions.MARKETING.code))
      )
        return;
      this.busy_update = true;
      axios
        .put(window.API.PUT_UPDATE_AFFILIATE(this.shop.id, this.affiliate.id), {
          enable: this.enable,
          pos: this.pos,

          fix: this.fix,
          percent: this.percent,
          user_id: this.user_id,
          name: this.name,
          email: this.email,
          address: this.address,
          web: this.web,
          tel: this.tel,
          bank: this.bank,
          products: this.products,
          commission: this.commission,

          domain_id: this.selected_domain ? this.selected_domain.id : null, // Now just one domain attach to an affiliate!

          cluster_id: this.cluster_id,
        })
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            Object.assign(this.affiliate, data.affiliate);
            this.$emit("edit", data.affiliate);

            NotificationService.showSuccessAlert(
              null,
              this.$t("affiliate_edit.notifications.update_success"),
            );

            this.$emit("close");
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update = false;
        });
    },

    //――――――――――――――――――――――― Add Affiliate ―――――――――――――――――――――――

    async createAffiliate() {
      if (this.modern && (!this.canWrite || this.busy_create)) return;
      if (this.modern) {
        if (!(await this.validateModernForm())) return;
      } else {
        this.$refs.form.validate();
      }

      // 🔏 Legacy callers retain their existing form flow and backend permission checks.
      if (
        this.modern &&
        (!this.canWrite ||
          this.busy_create ||
          !this.writeShopAccess(ShopPermissionRegions.MARKETING.code))
      )
        return;
      this.busy_create = true;
      axios
        .post(window.API.POST_CREATE_AFFILIATE(this.shop.id), {
          enable: this.enable,
          pos: this.pos,

          currency: this.currency,

          fix: this.fix,
          percent: this.percent,
          user_id: this.user_id,
          name: this.name,
          email: this.email,
          address: this.address,
          web: this.web,
          tel: this.tel,
          bank: this.bank,
          products: this.products,
          commission: this.commission,

          domain_id: this.selected_domain ? this.selected_domain.id : null, // Now just one domain attach to an affiliate!

          cluster_id: this.cluster_id,
        })
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("add", data.affiliate);

            NotificationService.showSuccessAlert(
              null,
              this.$t("affiliate_edit.notifications.create_success"),
            );

            this.$emit("close");
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_create = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.price-prev {
  background-image: linear-gradient(-60deg, #00796b 0%, #009688 100%);
  color: white;
  border-radius: 24px;
  transform: scale(0.7);
}

.b-affiliate-edit--modern {
  overflow: visible;
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.55;

  .b-affiliate-edit__body {
    padding: 0;
  }
  .b-affiliate-edit__workspace {
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr);
    align-items: start;
    gap: 24px;
  }
  .b-affiliate-edit__widget {
    --sd-modern-font-body: 13px;
    margin: 0;
    min-width: 0;
  }
  .b-affiliate-edit__form,
  .b-affiliate-edit__critical {
    min-width: 0;
  }
  .b-affiliate-edit__group {
    min-width: 0;
  }
  .b-affiliate-edit__domain {
    margin-block-start: 28px;
    padding-block-start: 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .b-affiliate-edit__nav :deep(.v-btn__content) {
    gap: 10px;
    text-transform: none;
    letter-spacing: 0;
    font-weight: 400;
  }
  .b-affiliate-edit__nav > .sd-modern-section-nav__item {
    min-height: 43px;
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
  }
  .b-affiliate-edit__widget :deep(.v-field__input) {
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  .b-affiliate-edit__widget :deep(.v-field-label) {
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
  }
  :deep(.sd-modern-form-header h2) {
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
    letter-spacing: 0;
  }
  :deep(.v-list-subheader) {
    min-height: 0;
    padding: 0;
    margin-block: -8px 22px;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  :deep(.v-list-subheader__text) {
    white-space: normal;
    overflow: visible;
  }
  .b-affiliate-edit__contact-fields {
    margin-block-start: 18px;
    gap: 14px 24px;
  }
  .b-affiliate-edit__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 18px 0;
    margin: 18px 0 0;
    background: transparent;
    border-radius: 0;
    border-block-start: 1px solid var(--sd-modern-border);
    dt {
      color: var(--sd-modern-muted);
      font-size: 11px;
      font-weight: 400;
      line-height: 17px;
    }
    dd {
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
    }
  }
  .b-affiliate-edit__commission-preview {
    padding-block: 8px;
    .sd-modern-subtitle {
      font-size: 12px;
      line-height: 19px;
    }
  }
  .b-affiliate-edit__commission-example {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 18px;
    margin-block-start: 18px;
    padding: 18px;
    border-radius: 10px;
    background: var(--sd-modern-inset);
    > div {
      display: grid;
      gap: 5px;
    }
    > div > span {
      font-size: 12px;
      color: var(--sd-modern-muted);
    }
  }
  .b-affiliate-edit__warning {
    display: inline-block;
    margin-block: 6px;
    color: rgb(var(--v-theme-on-surface));
    font-size: 12px;
    line-height: 19px;
  }
  .b-affiliate-edit__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding-block-start: 22px;
    margin-block-start: 25px;
    border-block-start: 1px solid var(--sd-modern-border);
    :deep(.widget-buttons) {
      width: auto;
      max-width: 100%;
      margin: 0;
      padding: 0;
      flex: 0 1 auto;
    }
    :deep(.widget-buttons > .v-btn) {
      flex: 0 1 auto;
    }
  }
  .b-affiliate-edit__save-scope {
    font-size: 11px;
    color: var(--sd-modern-muted);
  }

  @media (max-width: 760px) {
    .b-affiliate-edit__widget {
      padding: 22px;
    }
    .b-affiliate-edit__workspace {
      grid-template-columns: minmax(0, 1fr);
      gap: 17px;
    }
    .b-affiliate-edit__nav {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .b-affiliate-edit__nav > .sd-modern-section-nav__item {
      flex: 0 1 auto;
    }
  }
  @media (max-width: 600px) {
    .b-affiliate-edit__widget {
      padding: 20px 16px;
    }
    .b-affiliate-edit__actions {
      align-items: stretch;
    }
    .b-affiliate-edit__actions :deep(.widget-buttons) {
      width: 100%;
    }
    .b-affiliate-edit__actions :deep(.widget-buttons > .v-btn) {
      flex: 1;
    }
    .b-affiliate-edit__meta {
      gap: 12px;
    }
    .b-affiliate-edit__widget :deep(.v-field__input) {
      font-size: 16px;
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    .b-affiliate-edit__nav > .sd-modern-section-nav__item {
      min-height: 44px;
    }
  }
}
</style>
