<!-- Copyright (c) Selldone® Business OS™. Author: M.Pajuhaan. All rights reserved. -->
<template>
  <div class="b-product-ar-files text-start">
    <section v-for="file in files" :key="file.type" class="b-product-ar-files__row" :aria-label="file.format">
      <div class="b-product-ar-files__icon"><v-icon :icon="file.type === 'src' ? 'view_in_ar' : 'smartphone'" size="18" aria-hidden="true" /></div>
      <div class="b-product-ar-files__meta">
        <div class="b-product-ar-files__label"><h3><bdi>{{ file.format }}</bdi></h3><small>{{ $t(file.type === 'src' ? 'product_ar.web_android' : 'product_ar.ios') }}</small></div>
        <template v-if="file.available">
          <span class="b-product-ar-files__filename" tabindex="0" dir="auto">{{ file.name }}<v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ file.name }}</v-tooltip></span>
          <p><bdi>{{ numeralFormat(file.size, '0.[0] ib') }}</bdi></p>
        </template>
        <p v-else>{{ $t('product_ar.no_file') }}</p>
      </div>
      <div class="b-product-ar-files__actions">
        <template v-if="file.available">
          <v-btn v-if="file.type === 'src'" :disabled="!enabled" variant="text" icon class="sd-modern-icon-button" :aria-label="$t('product_ar.preview')" @click="$emit('preview')"><v-icon icon="view_in_ar" size="16" /><v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('product_ar.preview') }}</v-tooltip></v-btn>
          <v-btn :href="enabled ? file.url : undefined" :disabled="!enabled" target="_blank" rel="noopener noreferrer" variant="text" icon class="sd-modern-icon-button" :aria-label="$t('product_ar.download')"><v-icon icon="download" size="16" /><v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('product_ar.download') }}</v-tooltip></v-btn>
          <v-btn v-if="editable && enabled" :loading="file.type === 'src' ? busyDeleteSrc : busyDeleteIos" :disabled="file.uploadDisabled || file.uploadBusy" variant="text" icon class="sd-modern-icon-button" :aria-label="$t('product_ar.remove')" @click="$emit('remove', file.type)"><v-icon icon="delete_outline" size="16" /><v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('product_ar.remove') }}</v-tooltip></v-btn>
        </template>
      </div>
      <s-ar-model-uploader v-if="editable && enabled" :key="file.type" class="b-product-ar-files__uploader" :ar="ar" :server="file.server" :disabled="file.uploadDisabled" :has-file="file.available" :format="file.type === 'src' ? 'GLB' : 'USDZ'" :label="file.available ? $t('product_ar.replace_file', { format: file.format }) : $t(file.type === 'src' ? 'product_ar.select_glb' : 'product_ar.select_usdz')" modern max-file-size="20MB" @busy="$emit('upload-busy', file.type, $event)" @update:ar="$emit('update:ar', $event)" />
      <p v-if="file.uploadDisabled && editable && enabled" class="b-product-ar-files__waiting" role="status">{{ $t('product_ar.upload_wait') }}</p>
    </section>
  </div>
</template>
<script lang="ts">
import SArModelUploader from '../../../../../ui/uploader/SArModelUploader.vue';

export default {
  name: 'BProductArFiles',
  components: { SArModelUploader },
  props: {
    files: { type: Array, required: true },
    ar: { required: false },
    editable: Boolean,
    enabled: Boolean,
    busyDeleteSrc: Boolean,
    busyDeleteIos: Boolean,
  },
  emits: ['preview', 'remove', 'upload-busy', 'update:ar'],
};
</script>
<style scoped lang="scss">
.b-product-ar-files {
  min-width: 0;
  &__row { display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding-block: 11px; }
  &__row + &__row { border-block-start: 1px solid var(--sd-modern-border); }
  &__icon { display: grid; place-items: center; width: 32px; height: 38px; border-radius: 6px; background: var(--sd-modern-inset); color: var(--sd-modern-muted); }
  &__meta { min-width: 0; }
  &__label { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; }
  &__label h3 { margin: 0; font-size: 13px; font-weight: 500; line-height: 21px; }
  &__label small, &__meta p { font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  &__meta p { margin: 1px 0 0; }
  &__filename { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-block-start: 4px; font-size: 12px; line-height: 19px; }
  &__actions { display: flex; align-items: center; gap: 6px; }
  &__uploader, &__waiting { grid-column: 1 / -1; min-width: 0; }
  &__waiting { margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  @media (max-width: 680px), (pointer: coarse) {
    &__actions { gap: 4px; }
  }
  @media (max-width: 480px) {
    &__row { grid-template-columns: 32px minmax(0, 1fr); }
    &__actions { grid-column: 2; justify-content: flex-start; }
    &__actions:empty { display: none; }
  }
}
</style>
