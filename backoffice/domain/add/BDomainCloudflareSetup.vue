<template>
  <details class="b-domain-cloudflare-setup text-start">
    <summary>{{ $t('domains_modern.connection.cloudflareSetup.title') }}</summary>
    <p>{{ $t('domains_modern.connection.cloudflareSetup.summary') }}</p>
    <div class="b-domain-cloudflare-setup__actions">
      <v-btn
        type="button" variant="outlined" prepend-icon="download"
        class="sd-modern-button" :disabled="disabled || !dnsFile" @click="downloadRecords"
      >{{ $t('domains_modern.connection.cloudflareSetup.download') }}</v-btn>
      <v-tooltip location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">
        <template #activator="{ props }">
          <v-btn
            v-bind="props" :href="cloudflareUrl" target="_blank" rel="noopener noreferrer"
            variant="text" color="primary" class="sd-modern-button sd-modern-button--inline"
            :disabled="disabled" append-icon="north_east"
          >{{ $t('domains_modern.connection.cloudflareSetup.open') }}</v-btn>
        </template>
        {{ $t('domains_modern.connection.cloudflareSetup.openHelp') }}
      </v-tooltip>
    </div>
    <p v-if="!dnsFile" class="b-domain-cloudflare-setup__notice" role="status">
      <v-icon size="16" color="warning" aria-hidden="true">error_outline</v-icon>
      <span>{{ $t('domains_modern.connection.cloudflareSetup.invalid') }}</span>
    </p>
    <p class="b-domain-cloudflare-setup__note">{{ $t('domains_modern.connection.cloudflareSetup.dnsOnly') }}</p>
    <p class="b-domain-cloudflare-setup__note">{{ $t('domains_modern.connection.cloudflareSetup.noAutomatic') }}</p>
    <p v-if="feedback" :role="downloadFailed ? 'alert' : 'status'">{{ feedback }}</p>
  </details>
</template>

<script lang="ts">
const controlCharacters = /[\u0000-\u001f\u007f]/;

function validDnsName(value, owner = false) {
  if (typeof value !== 'string' || !value || value.length > 253 || controlCharacters.test(value)) return false;
  const labels = value.split('.');
  return labels.length > 1 && labels.every((label, index) =>
    owner && index === 0 && label === '*' ||
    label.length <= 63 && (owner ? /^[a-z0-9_](?:[a-z0-9_-]*[a-z0-9_])?$/i : /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i).test(label),
  ) && /^[a-z]{2,63}$/i.test(labels.at(-1));
}

function absoluteOwner(host, zone) {
  if (typeof host !== 'string' || !host || host.length > 253 || controlCharacters.test(host)) return null;
  const normalized = host.toLowerCase().replace(/\.$/, '');
  const owner = host === '@' ? zone : host.endsWith('.') || normalized === zone || normalized.endsWith('.' + zone) ? normalized : normalized + '.' + zone;
  return validDnsName(owner, true) && (owner === zone || owner.endsWith('.' + zone)) ? owner + '.' : null;
}

function quotedTxt(value) {
  if (typeof value !== 'string' || !value || value.length > 8192 || controlCharacters.test(value)) return null;
  const bytes = new TextEncoder().encode(value);
  if (bytes.length > 4096) return null;
  const chunks = [];
  for (let index = 0; index < bytes.length; index += 255) {
    const chunk = Array.from(bytes.subarray(index, index + 255), byte => {
      if (byte === 34 || byte === 92) return '\\' + String.fromCharCode(byte);
      return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '\\' + String(byte).padStart(3, '0');
    }).join('');
    chunks.push('"' + chunk + '"');
  }
  return chunks.join(' ');
}

// Generate a bounded download only; importing and approving DNS changes happens in Cloudflare.
export function buildDomainDnsFile(domain, records) {
  if (typeof domain !== 'string' || controlCharacters.test(domain) || !Array.isArray(records) || !records.length || records.length > 64) return null;
  const address = domain.toLowerCase().replace(/^\*\./, '');
  if (!validDnsName(address)) return null;
  const labels = address.split('.');
  // Keep the setup form's existing country-suffix convention for relative record names.
  const countrySuffix = labels.length > 2 && labels.at(-2).length <= 3 && labels.at(-1).length <= 2;
  const zone = labels.slice(countrySuffix ? -3 : -2).join('.');
  const owners = new Map();
  const lines = [];
  for (const record of records) {
    if (!record || typeof record.type !== 'string' || !['A', 'CNAME', 'TXT'].includes(record.type) || typeof record.value !== 'string') return null;
    const owner = absoluteOwner(record.host, zone);
    if (!owner || !record.value || record.value.length > 8192 || controlCharacters.test(record.value)) return null;
    let value;
    if (record.type === 'A') {
      const octets = record.value.split('.');
      if (octets.length !== 4 || !octets.every(octet => /^(0|[1-9]\d{0,2})$/.test(octet) && Number(octet) <= 255)) return null;
      value = record.value;
    } else if (record.type === 'CNAME') {
      const target = record.value.toLowerCase().replace(/\.$/, '');
      if (!validDnsName(target) || target === owner.slice(0, -1)) return null;
      value = target + '.';
    } else {
      value = quotedTxt(record.value);
      if (!value) return null;
    }
    const previous = owners.get(owner) || [];
    if (record.type === 'CNAME' && previous.some(item => item.type !== 'CNAME' || item.value !== value) ||
        record.type !== 'CNAME' && previous.some(item => item.type === 'CNAME')) return null;
    previous.push({ type: record.type, value });
    owners.set(owner, previous);
    const proxy = record.type === 'TXT' ? '' : ' ; cf_tags=cf-proxied:false';
    lines.push(`${owner} 300 IN ${record.type} ${value}${proxy}`);
  }
  const text = ['; Selldone domain connection records', '; Import manually in Cloudflare DNS. Review conflicting existing records.', `$ORIGIN ${zone}.`, '$TTL 300', ...lines, ''].join('\n');
  if (new TextEncoder().encode(text).length > 262144) return null;
  return { text, filename: 'selldone-dns-' + address.replace(/[^a-z0-9.-]/g, '-').slice(0, 200) + '.txt' };
}

export default {
  name: 'BDomainCloudflareSetup',
  props: {
    domain: { type: String, required: true },
    records: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
  },
  data: () => ({
    cloudflareUrl: 'https://dash.cloudflare.com/?to=/:account/:zone/dns/records',
    feedback: '',
    downloadFailed: false,
  }),
  computed: {
    dnsFile() { return buildDomainDnsFile(this.domain, this.records); },
  },
  watch: {
    domain() { this.feedback = ''; },
    records() { this.feedback = ''; },
  },
  methods: {
    downloadRecords() {
      if (this.disabled || !this.dnsFile) return;
      let url, link;
      try {
        const file = this.dnsFile;
        url = URL.createObjectURL(new Blob([file.text], { type: 'text/plain;charset=utf-8' }));
        link = document.createElement('a');
        link.href = url;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        this.downloadFailed = false;
        this.feedback = this.$t('domains_modern.connection.cloudflareSetup.downloaded');
      } catch (_) {
        this.downloadFailed = true;
        this.feedback = this.$t('domains_modern.connection.cloudflareSetup.downloadFailed');
      } finally {
        link?.remove();
        if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-cloudflare-setup {
  margin-block: 22px 4px;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 13px;
  line-height: 21px;

  > summary { padding-block: 10px; font-size: 14px; font-weight: 500; cursor: pointer; }
  > summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  > p { margin: 8px 0 0; font-size: 13px; line-height: 21px; }
  &__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 14px; }
  &__actions .sd-modern-button { min-height: 42px; padding: 9px 17px; font-family: inherit; font-size: 13px; font-weight: 500; line-height: 22px; letter-spacing: 0; }
  &__actions .sd-modern-button--inline { padding-inline: 10px; }
  &__actions :deep(.v-btn__content) { font: inherit; letter-spacing: 0; }
  &__notice { display: flex; align-items: flex-start; gap: 8px; }
  &__notice > .v-icon { flex: none; margin-top: 2px; }
  &__notice > span { min-width: 0; }
  &__note { color: var(--sd-modern-muted); }
  @media (max-width: 600px), (pointer: coarse) {
    &__actions .sd-modern-button { min-height: 44px; white-space: normal; height: auto; }
    &__actions :deep(.v-btn__content) { white-space: normal; }
  }
}
</style>
