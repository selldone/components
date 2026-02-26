<!--
  Dynamic renderer for storefront onboarding fields.
  Keeps the mapping between schema field.type and the actual component.
-->

<template>
  <component
    :is="componentName"
    v-if="componentName"
    :field="field"
    :model-value="modelValue"
    :preview="preview"
    @update:modelValue="$emit('update:modelValue', $event)"
  />

  <v-alert v-else type="warning" variant="tonal" border="start">
    Unsupported field type: <b>{{ field?.type }}</b>
  </v-alert>
</template>

<script lang="ts">
import SStorefrontListingOnboardingFieldText from "./fields/SStorefrontListingOnboardingFieldText.vue";
import SStorefrontListingOnboardingFieldTextarea from "./fields/SStorefrontListingOnboardingFieldTextarea.vue";
import SStorefrontListingOnboardingFieldNumber from "./fields/SStorefrontListingOnboardingFieldNumber.vue";
import SStorefrontListingOnboardingFieldSwitch from "./fields/SStorefrontListingOnboardingFieldSwitch.vue";
import SStorefrontListingOnboardingFieldSelect from "./fields/SStorefrontListingOnboardingFieldSelect.vue";
import SStorefrontListingOnboardingFieldMap from "./fields/SStorefrontListingOnboardingFieldMap.vue";
import SStorefrontListingOnboardingFieldMedia from "./fields/SStorefrontListingOnboardingFieldMedia.vue";

// Official
import SStorefrontListingOnboardingOfficialTitle from "./official/SStorefrontListingOnboardingOfficialTitle.vue";
import SStorefrontListingOnboardingOfficialSubtitle from "./official/SStorefrontListingOnboardingOfficialSubtitle.vue";
import SStorefrontListingOnboardingOfficialDescription from "./official/SStorefrontListingOnboardingOfficialDescription.vue";
import SStorefrontListingOnboardingOfficialPrice from "./official/SStorefrontListingOnboardingOfficialPrice.vue";
import SStorefrontListingOnboardingOfficialLocation from "./official/SStorefrontListingOnboardingOfficialLocation.vue";
import SStorefrontListingOnboardingOfficialContact from "./official/SStorefrontListingOnboardingOfficialContact.vue";
import SStorefrontListingOnboardingOfficialOpeningHours from "./official/SStorefrontListingOnboardingOfficialOpeningHours.vue";
import SStorefrontListingOnboardingOfficialLinks from "./official/SStorefrontListingOnboardingOfficialLinks.vue";
import SStorefrontListingOnboardingOfficialMedia from "./official/SStorefrontListingOnboardingOfficialMedia.vue";

export default {
  name: "SStorefrontListingOnboardingFieldRenderer",

  components: {
    // Custom
    SStorefrontListingOnboardingFieldText,
    SStorefrontListingOnboardingFieldTextarea,
    SStorefrontListingOnboardingFieldNumber,
    SStorefrontListingOnboardingFieldSwitch,
    SStorefrontListingOnboardingFieldSelect,
    SStorefrontListingOnboardingFieldMap,
    SStorefrontListingOnboardingFieldMedia,

    // Official
    SStorefrontListingOnboardingOfficialTitle,
    SStorefrontListingOnboardingOfficialSubtitle,
    SStorefrontListingOnboardingOfficialDescription,
    SStorefrontListingOnboardingOfficialPrice,
    SStorefrontListingOnboardingOfficialLocation,
    SStorefrontListingOnboardingOfficialContact,
    SStorefrontListingOnboardingOfficialOpeningHours,
    SStorefrontListingOnboardingOfficialLinks,
    SStorefrontListingOnboardingOfficialMedia,
  },

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    componentName(): string | null {
      const t = String(this.field?.type || "");

      // Official
      if (t.startsWith("official:")) {
        const map: Record<string, string> = {
          "official:title": "SStorefrontListingOnboardingOfficialTitle",
          "official:subtitle": "SStorefrontListingOnboardingOfficialSubtitle",
          "official:description": "SStorefrontListingOnboardingOfficialDescription",
          "official:price": "SStorefrontListingOnboardingOfficialPrice",
          "official:location": "SStorefrontListingOnboardingOfficialLocation",
          "official:contact": "SStorefrontListingOnboardingOfficialContact",
          "official:opening_hours": "SStorefrontListingOnboardingOfficialOpeningHours",
          "official:links": "SStorefrontListingOnboardingOfficialLinks",
          "official:media": "SStorefrontListingOnboardingOfficialMedia",
        };
        return map[t] || null;
      }

      // Custom
      const map: Record<string, string> = {
        text: "SStorefrontListingOnboardingFieldText",
        textarea: "SStorefrontListingOnboardingFieldTextarea",
        number: "SStorefrontListingOnboardingFieldNumber",
        switch: "SStorefrontListingOnboardingFieldSwitch",
        select: "SStorefrontListingOnboardingFieldSelect",
        map: "SStorefrontListingOnboardingFieldMap",
        media: "SStorefrontListingOnboardingFieldMedia",
      };

      return map[t] || null;
    },
  },
};
</script>
