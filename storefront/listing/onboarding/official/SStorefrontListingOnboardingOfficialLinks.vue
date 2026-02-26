<template>
  <div class="sld-onb-field">
    <div class="d-flex align-center mb-2">
      <div class="font-weight-bold">Links</div>
      <v-spacer />
      <v-btn size="small" variant="outlined" @click="addLink">
        <v-icon start>add</v-icon>
        Add
      </v-btn>
    </div>

    <div v-if="!links.length" class="text-muted">
      No links yet.
    </div>

    <div v-for="(l, i) in links" :key="i" class="sld-onb-link">
      <v-row dense>
        <v-col cols="12" md="4">
          <v-text-field
            :model-value="l.title"
            label="Title"
            placeholder="Instagram"
            variant="outlined"
            density="comfortable"
            @update:modelValue="(v) => patchLink(i, { title: String(v || '') })"
          />
        </v-col>

        <v-col cols="12" md="7">
          <v-text-field
            :model-value="l.url"
            label="URL"
            placeholder="https://"
            variant="outlined"
            density="comfortable"
            @update:modelValue="(v) => patchLink(i, { url: String(v || '') })"
          />
        </v-col>

        <v-col cols="12" md="1" class="d-flex align-center justify-end">
          <v-btn icon variant="text" color="red" @click="removeLink(i)">
            <v-icon>close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
type LinkItem = { title: string; url: string };

export default {
  name: "SStorefrontListingOnboardingOfficialLinks",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    links(): LinkItem[] {
      const v = this.modelValue;
      if (!Array.isArray(v)) return [];
      return v.map((x: any) => ({
        title: x?.title ? String(x.title) : "",
        url: x?.url ? String(x.url) : "",
      }));
    },
  },

  methods: {
    emitLinks(next: LinkItem[]) {
      this.$emit("update:modelValue", next);
    },

    addLink() {
      const next = [...this.links, { title: "", url: "" }];
      this.emitLinks(next);
    },

    removeLink(index: number) {
      const next = this.links.filter((_, i) => i !== index);
      this.emitLinks(next);
    },

    patchLink(index: number, patch: Partial<LinkItem>) {
      const next = this.links.map((l, i) => (i === index ? { ...l, ...patch } : l));
      this.emitLinks(next);
    },
  },
};
</script>

<style scoped>
.sld-onb-link {
  margin-top: 10px;
}
</style>
