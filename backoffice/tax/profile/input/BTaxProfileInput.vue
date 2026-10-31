<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    shop: any;
    modern?: boolean;
    modelValue?: any;
    returnObject?: boolean;
    solo?: boolean;
    flat?: boolean;
    backgroundColor?: string;
    variant?: string;
  }>(),
  {
    modern: false,
    returnObject: false,
    solo: false,
    flat: false,
    backgroundColor: undefined,
    variant: "underlined",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: any];
}>();

const taxProfiles = computed(() => props.shop?.tax_profiles || []);

function externalTaxMeta(profile: any) {
  return profile?.meta?.external_tax || null;
}

function isExternalTaxProfile(profile: any) {
  const meta = externalTaxMeta(profile);
  return Boolean(meta?.enabled && meta?.provider);
}

function externalTaxProviderTitle(profile: any) {
  const provider = externalTaxMeta(profile)?.provider;

  if (provider === "stripe_tax") return "Stripe";

  return "External";
}

function externalTaxProviderColor(profile: any) {
  const provider = externalTaxMeta(profile)?.provider;

  if (provider === "stripe_tax") return "#635bff";

  return "#0b6e69";
}
</script>

<template>
  <v-select
    v-if="modern"
    class="b-tax-profile-input--modern sd-modern-underlined-field text-start"
    :bg-color="backgroundColor"
    :flat="flat"
    :items="taxProfiles"
    :model-value="modelValue"
    :return-object="returnObject"
    :solo="solo"
    :variant="variant"
    :label="$t('product_tax_profile.refined.label_selected')"
    :placeholder="$t('product_tax_profile.refined.store_default')"
    :menu-props="{ contentClass: 'b-tax-profile-input__menu text-start' }"
    clearable
    hide-details
    persistent-placeholder
    item-title="name"
    item-value="id"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <template #selection="{ item }">
      <span class="b-tax-profile-input__selection">{{ item.raw.name }}</span>
    </template>
    <template #item="{ item, props: itemProps }">
      <v-list-item
        v-bind="itemProps"
        class="b-tax-profile-input__option text-start"
        :dir="$attrs.dir"
      >
        <template #prepend>
          <v-icon class="me-3" size="18">{{ item.raw.icon || 'receipt_long' }}</v-icon>
        </template>
        <template #title>
          <span class="b-tax-profile-input__name">{{ item.raw.name }}</span>
        </template>
        <template #subtitle>
          <div class="b-tax-profile-input__metadata">
            <span v-if="!item.raw.enable" class="b-tax-profile-input__disabled">
              <span class="sd-modern-status__dot sd-modern-status__dot--error no-inv" aria-hidden="true"></span>
              {{ $t('product_tax_profile.refined.disabled') }}
            </span>
            <template v-else>
              <span v-if="isExternalTaxProfile(item.raw)">{{ $t(externalTaxMeta(item.raw)?.provider === 'stripe_tax' ? 'product_tax_profile.refined.provider_stripe' : 'product_tax_profile.refined.external') }}</span>
              <span v-else-if="item.raw.fix">
                {{ $t('product_tax_profile.refined.goods') }}: <bdi>{{ item.raw.fix_vat || 0 }}%</bdi>
                <template v-if="item.raw.shipping"> · {{ $t('product_tax_profile.refined.shipping') }}: <bdi>{{ item.raw.fix_shipping || 0 }}%</bdi></template>
              </span>
              <span v-else>{{ $t('product_tax_profile.refined.by_location') }}</span>
              <span> · {{ $t(item.raw.included ? 'product_tax_profile.refined.tax_included' : 'product_tax_profile.refined.tax_excluded') }}</span>
              <span v-if="!item.raw.shipping"> · {{ $t('product_tax_profile.refined.shipping') }}: {{ $t('product_tax_profile.refined.not_applied') }}</span>
            </template>
          </div>
        </template>
      </v-list-item>
    </template>
  </v-select>
  <v-select
    v-else
    :bg-color="backgroundColor"
    :class="{ 'tax-profile-default-mode': !modelValue }"
    :flat="flat"
    :items="taxProfiles"
    :messages="
      !modelValue
        ? 'The default tax rules will be applied to all products without a dedicated tax profile.'
        : undefined
    "
    :model-value="modelValue"
    :return-object="returnObject"
    :solo="solo"
    :variant="variant"
    clearable
    item-title="name"
    item-value="id"
    label="Tax profile"
    persistent-placeholder
    placeholder=""
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <template v-slot:prepend-inner>
      <v-chip
        v-if="!modelValue"
        class="tax-profile-default-chip"
        color="#0b6e69"
        label
        size="small"
        variant="flat"
      >
        <v-icon start size="16">tune</v-icon>
        Default
      </v-chip>
    </template>

    <template v-slot:selection="{ item }">
      <div class="tax-profile-selection d-flex align-center min-width-0 w-100">
        <v-icon v-if="item.raw.icon" class="me-2" color="#333">
          {{ item.raw.icon }}
        </v-icon>

        <b class="tax-profile-selection-name text-truncate">{{ item.raw.name }}</b>

        <span
          v-if="!isExternalTaxProfile(item.raw) && item.raw.fix"
          class="ms-2 tax-profile-detail text-truncate"
        >
          | <small>Goods:</small> <b>{{ item.raw.fix_vat }}%</b>
          <template v-if="item.raw.fix_shipping">
            | <small>Shipping:</small>
            <b>{{ item.raw.fix_shipping }}%</b>
          </template>
        </span>

        <span
          v-else-if="!isExternalTaxProfile(item.raw)"
          class="ms-2 tax-profile-detail text-truncate"
        >
          | <v-icon class="me-1" size="small">share_location</v-icon>
          <small>Location-Based Tax</small>
        </span>

        <span class="tax-profile-selection-badges ms-auto d-flex align-center">
          <v-chip
            v-if="isExternalTaxProfile(item.raw)"
            :color="externalTaxProviderColor(item.raw)"
            class="ms-1"
            label
            size="x-small"
            variant="flat"
          >
            {{ externalTaxProviderTitle(item.raw) }}
          </v-chip>

          <v-chip
            :color="item.raw.included ? '#FFC107' : '#8BC34A'"
            class="ms-1"
            label
            size="x-small"
            variant="flat"
          >
            {{ item.raw.included ? "inclusive" : "exclusive" }}
          </v-chip>
        </span>
      </div>
    </template>

    <template v-slot:item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps">
        <template v-slot:prepend>
          <v-icon v-if="item.raw.icon" class="me-2" color="#333">
            {{ item.raw.icon }}
          </v-icon>
        </template>

        <template v-slot:title>
          <v-list-item-title class="text-start tax-profile-item-title">
            <b>{{ item.raw.name }}</b>

            <span v-if="!isExternalTaxProfile(item.raw) && item.raw.fix" class="ms-2">
              | <small>Goods:</small> <b>{{ item.raw.fix_vat }}%</b>
              <template v-if="item.raw.fix_shipping">
                | <small>Shipping:</small>
                <b>{{ item.raw.fix_shipping }}%</b>
              </template>
            </span>

            <span v-else-if="!isExternalTaxProfile(item.raw)" class="ms-2">
              | <v-icon class="me-1" size="small">share_location</v-icon>
              <small>Location-Based Tax</small>
            </span>
          </v-list-item-title>
        </template>

        <template v-slot:append>
          <div class="d-flex align-center">
            <v-chip
              v-if="isExternalTaxProfile(item.raw)"
              :color="externalTaxProviderColor(item.raw)"
              class="me-2"
              label
              size="x-small"
              variant="flat"
            >
              {{ externalTaxProviderTitle(item.raw) }}
            </v-chip>

            <v-chip
              :color="item.raw.included ? '#FFC107' : '#8BC34A'"
              label
              size="x-small"
              variant="flat"
            >
              {{ item.raw.included ? "inclusive" : "exclusive" }}
            </v-chip>
          </div>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<style scoped>
.b-tax-profile-input--modern {
  min-width: 0;
}

.b-tax-profile-input--modern[dir="rtl"],
.b-tax-profile-input__option[dir="rtl"] {
  direction: rtl;
}

.b-tax-profile-input--modern :deep(.v-field__input) {
  min-width: 0;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}

.b-tax-profile-input--modern :deep(.v-field-label) {
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 19px;
}

.b-tax-profile-input__selection {
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.b-tax-profile-input__option {
  padding: 10px 12px;
  color: rgb(var(--v-theme-on-surface));
}

.b-tax-profile-input__option :deep(.v-list-item__content) {
  min-width: 0;
}

.b-tax-profile-input__option :deep(.v-list-item-title),
.b-tax-profile-input__name {
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  white-space: normal;
  overflow-wrap: anywhere;
}

.b-tax-profile-input__option :deep(.v-list-item-subtitle) {
  display: block;
  overflow: visible;
  opacity: 1;
  white-space: normal;
  overflow-wrap: anywhere;
  -webkit-line-clamp: unset;
}

.b-tax-profile-input__metadata {
  margin-top: 3px;
  color: rgba(var(--v-theme-on-surface), .65);
  font-size: 13px;
  font-weight: 400;
  line-height: 21px;
}

.b-tax-profile-input__disabled {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 600px), (pointer: coarse) {
  .b-tax-profile-input--modern :deep(.v-field__input) {
    font-size: 16px;
  }
  .b-tax-profile-input__option {
    min-height: 44px;
  }
}

.tax-profile-default-chip {
  margin-top: 2px;
}

.tax-profile-default-mode :deep(.v-field__input) {
  padding-inline-start: 8px;
}

.tax-profile-selection {
  overflow: hidden;
}

.tax-profile-selection-name {
  min-width: 32px;
  overflow: hidden;
}

.tax-profile-selection-badges {
  flex-shrink: 0;
}

.tax-profile-item-title {
  max-width: min(720px, 78vw);
}

.tax-profile-detail {
  min-width: 0;
  overflow: hidden;
  flex-shrink: 0;
}
</style>
