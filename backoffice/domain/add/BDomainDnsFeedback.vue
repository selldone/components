<template>
  <section class="b-domain-dns-feedback text-start">
    <header class="b-domain-dns-feedback__heading">
      <h3>{{ $t('domains_modern.connection.feedback.title') }}</h3>
      <p>{{ $t('domains_modern.connection.feedback.intro') }}</p>
    </header>
    <p v-if="observedRecords === null" class="b-domain-dns-feedback__empty" role="status">
      {{ $t('domains_modern.connection.feedback.unavailable') }}
    </p>
    <div v-else role="table" :aria-label="$t('domains_modern.connection.feedback.title')">
      <div class="b-domain-dns-feedback__header sd-modern-list-header" role="row">
        <span role="columnheader">{{ $t('domains_modern.connection.type') }}</span>
        <span role="columnheader">{{ $t('domains_modern.connection.host') }}</span>
        <span role="columnheader">{{ $t('domains_modern.connection.recordValue') }}</span>
        <span role="columnheader">{{ $t('domains_modern.connection.status') }}</span>
      </div>
      <div v-for="(record, index) in rows" :key="`${record.type}:${record.host}:${index}`"
           class="b-domain-dns-feedback__row" role="row">
        <div class="b-domain-dns-feedback__type" role="cell">
          <span class="b-domain-dns-feedback__label sd-modern-list-header" aria-hidden="true">{{ $t('domains_modern.connection.type') }}</span>
          <bdi dir="ltr">{{ record.type }}</bdi>
        </div>
        <div role="cell">
          <span class="b-domain-dns-feedback__label sd-modern-list-header" aria-hidden="true">{{ $t('domains_modern.connection.host') }}</span>
          <code dir="ltr">{{ record.host }}</code>
        </div>
        <div role="cell">
          <span v-if="record.expected" class="b-domain-dns-feedback__expected">{{ $t('domains_modern.connection.feedback.expected') }}</span>
          <span class="b-domain-dns-feedback__label sd-modern-list-header" aria-hidden="true">{{ $t('domains_modern.connection.recordValue') }}</span>
          <code dir="ltr">{{ record.value }}</code>
        </div>
        <div class="b-domain-dns-feedback__status" role="cell">
          <span class="b-domain-dns-feedback__label sd-modern-list-header" aria-hidden="true">{{ $t('domains_modern.connection.status') }}</span>
          <span v-if="record.status === 'correct'" class="b-domain-dns-feedback__status-label">
            <v-icon size="16" color="success" class="no-inv" aria-hidden="true">check</v-icon>
            {{ $t('domains_modern.connection.feedback.correct') }}
          </span>
          <v-tooltip v-else location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">
            <template #activator="{ props }">
              <button v-bind="props" type="button" class="b-domain-dns-feedback__help">
                <v-icon size="16" :color="record.status === 'notRequired' || record.status === 'notChecked' ? undefined : 'warning'"
                        :class="{ 'no-inv': record.status !== 'notRequired' && record.status !== 'notChecked' }" aria-hidden="true">
                  {{ record.status === 'notRequired' || record.status === 'notChecked' ? 'info_outline' : 'warning_amber' }}
                </v-icon>
                <span>{{ $t(`domains_modern.connection.feedback.${record.status}`) }}</span>
              </button>
            </template>
            {{ $t(`domains_modern.connection.feedback.${record.hint}`) }}
          </v-tooltip>
        </div>
      </div>
      <p v-if="!rows.length" class="b-domain-dns-feedback__empty" role="status">{{ $t('domains_modern.connection.feedback.noRecords') }}</p>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  name: 'BDomainDnsFeedback',
  props: {
    expected: { type: Array, required: true },
    detected: { type: Array, default: null },
    domain: { type: String, required: true },
    secure: { type: Boolean, default: false },
    verification: { type: Object, default: () => ({}) },
  },
  computed: {
    zoneName() {
      const parts = this.normalizeName(this.domain).replace(/^\*\./, '').split('.');
      // Keep the same relative-host convention as the domain setup form.
      const countrySuffix = parts.length > 2 && parts.at(-2).length <= 3 && parts.at(-1).length <= 2;
      return parts.slice(-(countrySuffix ? 3 : 2)).join('.');
    },
    expectedRecords() {
      return this.expected.map((record) => this.normalizeRecord(record, true));
    },
    observedRecords() {
      if (!Array.isArray(this.detected) && !Array.isArray(this.verification.dns_challenge)) return null;
      const records = [...(this.detected || []), ...(this.verification.dns_challenge || [])].map((record) => this.normalizeRecord(record));
      return records.filter((record, index) => records.findIndex((other) =>
        other.type === record.type && other.name === record.name && other.value === record.value,
      ) === index);
    },
    checkedHosts() {
      const names = [];
      if (Array.isArray(this.detected)) {
        names.push(this.normalizeName(this.domain));
        if (this.verification.verification_host) names.push(this.normalizeName(this.verification.verification_host));
      }
      if (Array.isArray(this.verification.dns_challenge) && this.verification.challenge_domain) names.push(this.normalizeName(this.verification.challenge_domain));
      return names;
    },
    rows() {
      if (this.observedRecords === null) return [];
      const rows = this.observedRecords.map((record) => ({ ...record, ...this.recordStatus(record) }));
      const requirements = new Map();
      this.expectedRecords.forEach((record) => {
        const kind = ['A', 'CNAME'].includes(record.type) ? 'routing' : record.type;
        const key = `${kind}:${record.name}`;
        if (!requirements.has(key)) requirements.set(key, []);
        requirements.get(key).push(record);
      });
      requirements.forEach((alternatives) => {
        const record = alternatives[0], routing = ['A', 'CNAME'].includes(record.type);
        if (!routing && (this.verification.valid_txt === true || this.verification.verified === true)) return;
        const candidates = this.observedRecords.filter((item) => this.sameHost(record.name, item.name, routing) &&
          (routing ? ['A', 'CNAME'].includes(item.type) : item.type === record.type && item.value.startsWith('selldone-domain-verification=')),
        );
        if (candidates.length) return;
        const checked = this.checkedHosts.some((host) => this.sameHost(record.name, host, routing));
        rows.push({ ...record, type: [...new Set(alternatives.map((item) => item.type))].join(' / '),
          value: [...new Set(alternatives.map((item) => item.value))].join(' · '), expected: true,
          status: checked ? 'missing' : 'notChecked', hint: checked ? (routing ? 'routingHint' : 'missingHint') : 'uncheckedHint' });
      });
      return rows;
    },
  },
  methods: {
    normalizeName(value) { return String(value || '').trim().toLowerCase().replace(/\.$/, ''); },
    absoluteHost(host) {
      const value = this.normalizeName(host);
      if (value === '@') return this.zoneName;
      if (!value || value === this.zoneName || value.endsWith(`.${this.zoneName}`)) return value;
      return `${value}.${this.zoneName}`;
    },
    normalizeRecord(record, relative = false) {
      const type = String(record.type || '').toUpperCase();
      const host = String(record.host || record.name || '');
      const value = String(record.value ?? record.txt ?? record.target ?? record.ip ?? record.ipv6 ?? '');
      const name = relative || !host.includes('.') ? this.absoluteHost(host) : this.normalizeName(host);
      return { type, host, name, value };
    },
    sameHost(expected, observed, wildcard = false) {
      if (expected === observed) return true;
      return wildcard && expected.startsWith('*.') && observed.endsWith(expected.slice(1)) && observed.length > expected.length - 1;
    },
    sameValue(a, b) {
      return a.type === 'CNAME' ? this.normalizeName(a.value) === this.normalizeName(b.value) : a.value === b.value;
    },
    recordStatus(record) {
      const sameType = this.expectedRecords.filter((expected) => expected.type === record.type);
      const matchingHost = sameType.filter((expected) => this.sameHost(expected.name, record.name, record.type !== 'TXT'));
      const matchingValue = matchingHost.some((expected) => this.sameValue(expected, record));
      if (record.type === 'TXT' && record.value.startsWith('selldone-domain-verification=')) {
        if (!matchingHost.length) return sameType.some((expected) => this.sameValue(expected, record))
          ? { status: 'wrongHost', hint: 'hostHint' } : { status: 'notChecked', hint: 'uncheckedHint' };
        if (this.verification.valid_txt === false || this.verification.verified === false) return { status: 'different', hint: 'ownershipHint' };
        if (matchingValue) return { status: 'correct' };
        // Ownership tokens are bcrypt hashes; inequality alone cannot prove an invalid token.
        return { status: 'notChecked', hint: 'uncheckedHint' };
      }
      if (['A', 'CNAME'].includes(record.type) && this.expectedRecords.some((expected) =>
        ['A', 'CNAME'].includes(expected.type) && this.sameHost(expected.name, record.name, true),
      )) {
        if (matchingValue || this.verification.approved === true) return { status: 'correct' };
        return this.secure && this.verification.approved === false ? { status: 'different', hint: 'differentHint' } : { status: 'checkOrigin', hint: 'originHint' };
      }
      return { status: 'notRequired', hint: 'extraHint' };
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-dns-feedback {
  min-width: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 21px;

  &__heading { margin-bottom: 12px; }
  &__heading h3 { margin: 0; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 22px; }
  &__heading p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__header, &__row { display: grid; grid-template-columns: 86px minmax(90px,.8fr) minmax(0,1.6fr) minmax(128px,.8fr); column-gap: 14px; align-items: start; }
  &__header { padding-block: 8px; }
  &__row { padding-block: 10px; border-top: 1px solid var(--sd-modern-border); }
  &__row > * { min-width: 0; }
  &__type, &__header > :first-child { padding-inline-end: 14px; }
  &__type { font-weight: 500; }
  &__label { display: none; }
  &__expected { display: block; margin-bottom: 2px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  code { display: block; max-width: 100%; padding: 0; background: transparent; color: inherit; font: 400 13px/21px 'SFMono-Regular', Consolas, monospace; text-align: start; overflow-wrap: anywhere; }
  &__status-label, &__help { display: inline-flex; gap: 6px; align-items: start; text-align: start; }
  &__status-label > .v-icon, &__help > .v-icon { flex: 0 0 auto; margin-top: 2px; }
  &__help { max-width: 100%; margin: -4px; padding: 4px; border: 0; color: inherit; background: transparent; font: inherit; cursor: help; }
  &__help:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  &__empty { margin: 12px 0; color: var(--sd-modern-muted); }

  @media (max-width: 700px) {
    &__header { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    &__row { grid-template-columns: minmax(0,1fr) minmax(110px,.7fr); row-gap: 8px; }
    &__type { grid-column: 1; grid-row: 1; }
    &__row > :nth-child(2) { grid-column: 1; grid-row: 2; }
    &__row > :nth-child(3) { grid-column: 1 / -1; grid-row: 3; }
    &__status { grid-column: 2; grid-row: 1 / 3; }
    &__label { display: block; margin-bottom: 2px; }
    &__help { min-height: 44px; }
  }
  @media (pointer: coarse) { &__help { min-height: 44px; } }
}
</style>
