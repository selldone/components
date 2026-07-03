<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    shop: any;
    modelValue?: any;
    returnObject?: boolean;
    solo?: boolean;
    flat?: boolean;
    backgroundColor?: string;
    variant?: string;
  }>(),
  {
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
