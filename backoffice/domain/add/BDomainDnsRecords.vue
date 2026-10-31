<template>
  <div
    class="b-domain-dns-records text-start"
    role="table"
    :aria-label="$t('domains_modern.connection.dns')"
  >
    <div class="b-domain-dns-records__header sd-modern-list-header" role="row">
      <span role="columnheader">{{ $t('domains_modern.connection.type') }}</span>
      <span role="columnheader">{{ $t('domains_modern.connection.host') }}</span>
      <span role="columnheader">{{ $t('domains_modern.connection.recordValue') }}</span>
      <span role="columnheader" :aria-label="$t('domains_modern.connection.copy')" />
    </div>
    <div
      v-for="(record, index) in records"
      :key="`${record.type}:${record.host}:${index}`"
      class="b-domain-dns-records__row"
      role="row"
    >
      <div class="b-domain-dns-records__type" role="cell">
        <span class="b-domain-dns-records__label sd-modern-list-header" aria-hidden="true">
          {{ $t('domains_modern.connection.type') }}
        </span>
        <bdi dir="ltr">{{ record.type }}</bdi>
      </div>
      <div class="b-domain-dns-records__host" role="cell">
        <span class="b-domain-dns-records__label sd-modern-list-header" aria-hidden="true">
          {{ $t('domains_modern.connection.host') }}
        </span>
        <v-tooltip location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="b-domain-dns-records__host-copy"
              :aria-label="`${$t('global.actions.copy')} ${$t('domains_modern.connection.host')}: ${record.host}`"
              @click="copyToClipboard(record.host)"
            >
              <code dir="ltr">{{ record.host }}</code>
            </button>
          </template>
          {{ $t('global.actions.copy') }} · {{ $t('domains_modern.connection.host') }}
        </v-tooltip>
      </div>
      <div class="b-domain-dns-records__value" role="cell">
        <span class="b-domain-dns-records__label sd-modern-list-header" aria-hidden="true">
          {{ $t('domains_modern.connection.recordValue') }}
        </span>
        <code dir="ltr">{{ record.value }}</code>
      </div>
      <div class="b-domain-dns-records__action" role="cell">
        <v-tooltip location="top" open-on-focus content-class="sd-modern-tooltip text-start">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              type="button"
              icon
              variant="text"
              class="sd-modern-icon-button"
              :aria-label="`${$t('domains_modern.connection.copy')}: ${record.type} · ${record.host}`"
              @click="copyToClipboard(record.value)"
            >
              <v-icon size="16" aria-hidden="true">content_copy</v-icon>
            </v-btn>
          </template>
          {{ $t('domains_modern.connection.copy') }}
        </v-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'BDomainDnsRecords',
  props: {
    records: { type: Array, required: true },
  },
};
</script>

<style scoped lang="scss">
.b-domain-dns-records {
  --sd-modern-icon-button-size: 36px;
  min-width: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 21px;

  &__header,
  &__row {
    display: grid;
    grid-template-columns: 64px minmax(90px, .65fr) minmax(0, 1.5fr) var(--sd-modern-icon-button-size);
    align-items: center;
    column-gap: 14px;
  }

  &__header { padding-block: 8px; }
  &__row { padding-block: 10px; border-top: 1px solid var(--sd-modern-border); }
  &__row > * { min-width: 0; }
  &__type, &__header > :first-child { padding-inline-end: 12px; }
  &__type { font-weight: 500; }
  &__label { display: none; }

  code {
    display: block;
    max-width: 100%;
    padding: 0;
    background: transparent;
    color: inherit;
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
    text-align: start;
    overflow-wrap: anywhere;
  }

  &__host-copy {
    max-width: 100%;
    min-width: 0;
    padding-block: 6px;
    padding-inline: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;

    &:hover { text-decoration: underline; text-underline-offset: 4px; }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  }

  &__action { display: flex; justify-content: end; }

  @media (max-width: 600px) {
    --sd-modern-icon-button-size: 44px;

    &__header {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    &__row { grid-template-columns: minmax(0, 1fr) 44px; row-gap: 8px; align-items: start; }
    &__type { grid-column: 1; grid-row: 1; }
    &__host { grid-column: 1; grid-row: 2; }
    &__value { grid-column: 1; grid-row: 3; }
    &__label { display: block; margin-bottom: 2px; }
    &__action { grid-column: 2; grid-row: 1 / 4; align-self: center; }
    &__host-copy { min-height: 44px; }
  }

  @media (pointer: coarse) {
    --sd-modern-icon-button-size: 44px;
    &__host-copy { min-height: 44px; }
  }
}
</style>
