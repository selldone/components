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

<template>
  <!-- The shop's email delivery log: what was sent, failed or skipped, and why. Values arrive redacted from the server. -->
  <section class="b-email-logs text-start" :aria-busy="busy">
    <header class="b-email-logs__head">
      <div>
        <h2>{{ $t("shop_emails.logs.title") }}</h2>
        <p>{{ $t("shop_emails.logs.subtitle", { period }) }}</p>
      </div>
      <v-btn class="sd-modern-button" variant="text" :loading="busy" @click="reload">
        <v-icon start aria-hidden="true">refresh</v-icon>{{ $t("shop_emails.logs.refresh") }}
      </v-btn>
    </header>

    <!-- Counts by status; each one filters the list. -->
    <div class="b-email-logs__tiles" role="group" :aria-label="$t('shop_emails.logs.filter_status')">
      <button v-for="tile in tiles" :key="tile.key" type="button" class="b-email-logs__tile"
              :class="{ 'b-email-logs__tile--active': status === tile.key }" :data-status="tile.key"
              :aria-pressed="status === tile.key" @click="setStatus(tile.key)">
        <span class="b-email-logs__dot" :data-status="tile.key" aria-hidden="true"></span>
        <strong>{{ tile.count }}</strong>
        <span>{{ tile.title }}</span>
      </button>
    </div>

    <div class="b-email-logs__filters">
      <v-select v-model="code" :items="code_items" item-title="title" item-value="value"
                :placeholder="$t('shop_emails.logs.all_emails')" :aria-label="$t('shop_emails.logs.filter_email')"
                prepend-inner-icon="filter_list" clearable hide-details density="compact" variant="solo-filled" flat rounded="lg"
                class="b-email-logs__code" @update:model-value="reload"></v-select>
    </div>

    <u-loading-progress v-if="busy && logs.length"></u-loading-progress>
    <div v-if="fetchFailed" class="sd-modern-notice b-email-logs__notice" role="alert">
      <v-icon aria-hidden="true">error_outline</v-icon>
      <p class="sd-modern-notice__content">{{ $t("shop_emails.logs.read_error") }}</p>
      <v-btn class="sd-modern-button" variant="text" :disabled="busy" @click="reload">{{ $t("shop_emails.studio.retry") }}</v-btn>
    </div>
    <div v-else-if="loaded && !logs.length && !busy" class="b-email-logs__empty">
      <v-icon aria-hidden="true">forward_to_inbox</v-icon>
      <strong>{{ $t(status || code ? "shop_emails.logs.empty_filtered" : "shop_emails.logs.empty") }}</strong>
      <p>{{ $t("shop_emails.logs.empty_help", { period }) }}</p>
    </div>
    <div v-else-if="!loaded && busy" class="b-email-logs__skeleton" aria-hidden="true">
      <span v-for="i in 4" :key="i"></span>
    </div>

    <ul v-if="logs.length" class="b-email-logs__list">
      <li v-for="log in logs" :key="log.id" class="b-email-logs__item" :class="{ 'b-email-logs__item--open': isOpen(log) }">
        <button type="button" class="b-email-logs__row" :data-log="log.id" :aria-expanded="isOpen(log)" @click="toggle(log)">
          <span class="b-email-logs__status" :data-status="log.status">
            <span class="b-email-logs__dot" :data-status="log.status" aria-hidden="true"></span>{{ $t(`shop_emails.logs.status.${log.status}`) }}
          </span>
          <span class="b-email-logs__logo" aria-hidden="true">
            <img v-if="provider(log.driver)?.logo" :src="provider(log.driver).logo" alt="" />
            <v-icon v-else-if="!log.driver" size="16">unsubscribe</v-icon>
            <span v-else>{{ initials(providerTitle(log.driver)) }}</span>
          </span>
          <span class="b-email-logs__main">
            <strong>{{ emailTitle(log) }}</strong>
            <small>
              <bdi dir="ltr">{{ log.recipient || "—" }}</bdi><span v-if="log.recipients > 1" class="b-email-logs__more-to">{{ $t("shop_emails.logs.more_recipients", { count: log.recipients - 1 }) }}</span>
              · {{ log.driver ? providerTitle(log.driver) : $t("shop_emails.logs.no_provider") }}
            </small>
          </span>
          <span class="b-email-logs__why">{{ shortReason(log) }}</span>
          <time class="b-email-logs__time" :datetime="log.created_at" :title="fullDate(log.created_at)">{{ timeAgo(log.created_at) }}</time>
          <v-icon class="b-email-logs__chevron" aria-hidden="true">expand_more</v-icon>
        </button>

        <!-- Structured details: what happened in plain words, the facts, then the provider's own answers. -->
        <div v-if="isOpen(log)" class="b-email-logs__details">
          <div class="b-email-logs__explain" :data-status="log.status">
            <v-icon aria-hidden="true">{{ log.status === "sent" ? "check_circle" : log.status === "failed" ? "error_outline" : "do_not_disturb_on" }}</v-icon>
            <div>
              <strong>{{ explainTitle(log) }}</strong>
              <p>{{ explainHelp(log) }}</p>
            </div>
            <!-- The fix for a setup problem lives in Email provider. -->
            <v-btn v-if="needsProvider(log)" class="sd-modern-button b-email-logs__fix" variant="text" size="small" @click="$emit('open-provider')">
              {{ $t("shop_emails.logs.open_provider") }}
            </v-btn>
          </div>

          <dl class="b-email-logs__facts">
            <template v-if="log.error_message">
              <dt>{{ $t("shop_emails.logs.fields.answer") }}</dt>
              <dd class="b-email-logs__answer" dir="auto">{{ log.error_message }}</dd>
            </template>
            <dt>{{ $t("shop_emails.logs.fields.email") }}</dt>
            <dd>{{ emailTitle(log) }} <bdi v-if="log.code" dir="ltr" class="b-email-logs__mono">{{ log.code }}</bdi></dd>
            <dt>{{ $t("shop_emails.logs.fields.recipients") }}</dt>
            <dd><bdi dir="ltr">{{ log.recipient || "—" }}</bdi><span v-if="log.recipients > 1" class="b-email-logs__more-to">{{ $t("shop_emails.logs.more_recipients", { count: log.recipients - 1 }) }}</span></dd>
            <dt>{{ $t("shop_emails.logs.fields.provider") }}</dt>
            <dd>{{ log.driver ? providerTitle(log.driver) : $t("shop_emails.logs.no_provider") }}</dd>
            <template v-if="log.duration_ms !== null && log.duration_ms !== undefined">
              <dt>{{ $t("shop_emails.logs.fields.duration") }}</dt>
              <dd>{{ log.duration_ms }} ms</dd>
            </template>
            <dt>{{ $t("shop_emails.logs.fields.time") }}</dt>
            <dd>{{ fullDate(log.created_at) }}</dd>
          </dl>

          <div v-if="log.exchanges?.length" class="b-email-logs__exchanges">
            <h4>{{ $t("shop_emails.logs.provider_calls") }}</h4>
            <div v-for="(exchange, index) in log.exchanges" :key="index" class="b-email-logs__exchange">
              <div class="b-email-logs__exchange-head">
                <span class="b-email-logs__method">{{ exchange.method }}</span>
                <bdi dir="ltr" class="b-email-logs__url">{{ exchange.url }}</bdi>
                <span class="b-email-logs__code-badge" :data-tone="tone(exchange.status)">{{ exchange.status ?? $t("shop_emails.logs.no_answer") }}</span>
                <span v-if="exchange.duration_ms !== null && exchange.duration_ms !== undefined" class="b-email-logs__ms">{{ exchange.duration_ms }} ms</span>
              </div>
              <pre v-if="exchange.response" dir="ltr" class="b-email-logs__response">{{ pretty(exchange.response) }}</pre>
              <p v-if="exchange.error" class="b-email-logs__exchange-error" dir="auto">{{ exchange.error }}</p>
            </div>
          </div>

          <div class="b-email-logs__actions">
            <v-btn class="sd-modern-button" variant="text" size="small" @click="copyToClipboard(details(log))">
              <v-icon start aria-hidden="true">content_copy</v-icon>{{ $t("shop_emails.logs.copy") }}
            </v-btn>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="logs.length < total" class="b-email-logs__more">
      <v-btn class="sd-modern-button" variant="outlined" :loading="busy" @click="loadMore">
        {{ $t("shop_emails.logs.load_more", { count: total - logs.length }) }}
      </v-btn>
    </div>
  </section>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

const PAGE = 20;
// Emails without a customizable template (ShopEmailLog::CODE_*), named by the log itself.
const LOG_CODES = ["test", "order-notification", "marketing", "subscription"];

export default {
  name: "BShopEmailLogs",
  emits: ["open-provider"],
  props: {
    shop: { type: Object, required: true },
    // The shop's emails (code, title) to name each entry.
    messages: { type: Array, default: () => [] },
    // Provider catalog { providers } of the page, for names and logos; the log stores only the key.
    catalog: { type: Object, default: null },
  },

  data: () => ({
    logs: [],
    total: 0,
    summary: { sent: 0, failed: 0, skipped: 0 },
    retention_days: 7,
    status: null,
    code: null,
    busy: false,
    loaded: false,
    fetchFailed: false,
    open: {},
    request: 0,
  }),

  computed: {
    // How long the shop's plan keeps the log (retention_days from the server).
    period() {
      return this.retention_days === 1 ? this.$t("shop_emails.logs.period_24h") : this.$t("shop_emails.logs.period_days", { days: this.retention_days });
    },
    tiles() {
      return ["sent", "failed", "skipped"].map((key) => ({ key, count: this.summary[key] || 0, title: this.$t(`shop_emails.logs.status.${key}`) }));
    },
    code_items() {
      return [
        ...this.messages.filter((m) => m.code).map((m) => ({ value: m.code, title: m.title })),
        ...LOG_CODES.map((value) => ({ value, title: this.logCodeTitle(value) })),
      ];
    },
    providers() {
      return Object.fromEntries((this.catalog?.providers || []).map((p) => [p.key, { title: p.title, logo: p.logo }]));
    },
  },

  created() {
    this.reload();
  },

  beforeUnmount() {
    this.request++;
  },

  methods: {
    setStatus(key) {
      this.status = this.status === key ? null : key;
      this.reload();
    },
    reload() {
      this.fetch(0);
    },
    loadMore() {
      this.fetch(this.logs.length);
    },
    fetch(offset) {
      const request = ++this.request;
      this.busy = true;
      this.fetchFailed = false;
      axios
        .get(window.API.GET_SHOP_EMAIL_LOGS(this.shop.id), {
          params: { offset, limit: PAGE, ...(this.status ? { status: this.status } : {}), ...(this.code ? { code: this.code } : {}) },
        })
        .then(({ data }) => {
          if (request !== this.request) return;
          if (data.error) {
            this.fetchFailed = true;
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.logs = offset ? [...this.logs, ...(data.logs || [])] : data.logs || [];
          if (!offset) this.open = {};
          this.total = data.total || 0;
          this.summary = data.summary || this.summary;
          this.retention_days = data.retention_days || this.retention_days;
          this.loaded = true;
        })
        .catch((error) => {
          if (request !== this.request) return;
          this.fetchFailed = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request === this.request) this.busy = false;
        });
    },

    isOpen(log) {
      return !!this.open[log.id];
    },
    toggle(log) {
      this.open = { ...this.open, [log.id]: !this.open[log.id] };
    },
    provider(driver) {
      return driver ? this.providers[driver] || null : null;
    },
    providerTitle(driver) {
      return this.provider(driver)?.title || driver;
    },
    initials(title) {
      const words = String(title || "").replace(/[^\p{L}\p{N} ]/gu, " ").split(" ").filter(Boolean);
      return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "–";
    },
    logCodeTitle(code) {
      return this.$t(`shop_emails.logs.codes.${code.replace("-", "_")}`);
    },
    emailTitle(log) {
      if (LOG_CODES.includes(log.code)) return this.logCodeTitle(log.code);
      return this.messages.find((m) => m.code === log.code)?.title || log.code || log.mailable || "—";
    },
    shortReason(log) {
      if (log.status === "failed") return this.$t(`shop_emails.logs.error.${log.error_type || "internal"}.title`);
      if (log.status === "skipped") return this.$t(`shop_emails.logs.reason.${log.reason || "no_provider"}.title`);
      return "";
    },
    explainTitle(log) {
      if (log.status === "sent") return this.$t("shop_emails.logs.sent_title", { provider: this.providerTitle(log.driver) || "" });
      return this.shortReason(log);
    },
    explainHelp(log) {
      if (log.status === "sent") return this.$t("shop_emails.logs.sent_help");
      if (log.status === "failed") return this.$t(`shop_emails.logs.error.${log.error_type || "internal"}.help`);
      return this.$t(`shop_emails.logs.reason.${log.reason || "no_provider"}.help`);
    },
    // Skipped emails and account errors are fixed in the provider settings.
    needsProvider(log) {
      return log.status === "skipped" || (log.status === "failed" && log.error_type === "account");
    },
    tone(status) {
      if (!status) return "error";
      if (status < 300) return "success";
      if (status < 500) return "warning";
      return "error";
    },
    pretty(text) {
      try {
        return JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        return text;
      }
    },
    timeAgo(date) {
      const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
      const units = [["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]];
      const [unit, size] = units.find(([, size]) => Math.abs(seconds) >= size) || units[3];
      try {
        return new Intl.RelativeTimeFormat(this.$i18n?.locale || "en", { numeric: "auto" }).format(Math.round(seconds / size), unit);
      } catch {
        return this.fullDate(date);
      }
    },
    fullDate(date) {
      try {
        return new Date(date).toLocaleString(this.$i18n?.locale || "en");
      } catch {
        return String(date);
      }
    },
    // Already redacted by the server: safe to paste into a support ticket.
    details(log) {
      return JSON.stringify(log, null, 2);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-email-logs {
  // The rail leaves the log a narrow column on mid-size screens: rows follow the log's own width.
  container-type: inline-size;
  font-size: 13px;
  line-height: 1.5;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-block-end: 14px;

    h2 { margin: 0; font-family: inherit; font-size: 17px; font-weight: 500; line-height: 24px; letter-spacing: -.3px; }
    p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  }

  &__tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-block-end: 10px; }
  &__tile {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    column-gap: 8px;
    padding: 12px 14px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: border-color .15s, background-color .15s;

    strong { font-size: 20px; font-weight: 600; line-height: 26px; }
    > span:last-child { grid-column: 1 / -1; color: var(--sd-modern-muted); font-size: 12px; }
    &:hover { background: var(--sd-modern-inset); }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  }
  &__tile--active { border-color: rgba(var(--v-theme-primary), .5); background: rgba(var(--v-theme-primary), .05); }

  &__dot { display: inline-block; flex: 0 0 8px; width: 8px; height: 8px; border-radius: 50%; background: var(--sd-modern-muted); }
  &__dot[data-status='sent'] { background: rgb(var(--v-theme-success)); }
  &__dot[data-status='failed'] { background: rgb(var(--v-theme-error)); }
  &__dot[data-status='skipped'] { background: rgba(var(--v-theme-on-surface), .35); }

  &__filters { display: flex; gap: 8px; margin-block-end: 12px; }
  &__code { flex: 0 1 320px; }
  &__code :deep(.v-field) { min-height: 40px; border-radius: 10px; }

  &__notice { margin-block: 8px; padding: 12px 14px; }
  &__empty {
    display: grid;
    justify-items: center;
    gap: 4px;
    padding: 36px 16px;
    border: 1px dashed var(--sd-modern-border);
    border-radius: 16px;
    color: var(--sd-modern-muted);
    text-align: center;

    .v-icon { font-size: 28px; }
    strong { color: rgb(var(--v-theme-on-surface)); font-weight: 500; }
    p { margin: 0; font-size: 12px; }
  }
  &__skeleton { display: grid; gap: 8px; span { height: 58px; border-radius: 12px; background: var(--sd-modern-inset); } }

  &__list { margin: 0; padding: 0; list-style: none; border: 1px solid var(--sd-modern-border); border-radius: 16px; background: rgb(var(--v-theme-surface)); overflow: hidden; }
  &__item + &__item { border-block-start: 1px solid var(--sd-modern-border); }
  &__row {
    display: grid;
    grid-template-columns: 88px 30px minmax(0, 1fr) fit-content(220px) max-content 18px;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 58px;
    padding: 10px 14px;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;

    &:hover { background: var(--sd-modern-inset); }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -2px; }
  }
  &__status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; }
  &__logo {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    overflow: hidden;
    border: 1px solid var(--sd-modern-border);
    border-radius: 9px;
    color: rgb(var(--v-theme-primary));
    font-size: 10px;
    font-weight: 700;

    img { width: 20px; height: 20px; object-fit: contain; }
    .v-icon { color: var(--sd-modern-muted); }
  }
  &__main { display: flex; flex-direction: column; min-width: 0; }
  &__main strong { overflow: hidden; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
  &__main small { overflow: hidden; color: var(--sd-modern-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
  &__why { overflow: hidden; color: rgb(var(--v-theme-error)); font-size: 12px; text-align: end; text-overflow: ellipsis; white-space: nowrap; }
  &__item:has([data-status='skipped']) &__why { color: var(--sd-modern-muted); }
  &__time { color: var(--sd-modern-muted); font-size: 12px; text-align: end; white-space: nowrap; }
  &__chevron { color: var(--sd-modern-muted); transition: transform .15s; }
  &__item--open &__chevron { transform: rotate(180deg); }

  &__details { display: grid; gap: 14px; padding: 4px 16px 16px 16px; background: var(--sd-modern-inset); }
  &__explain {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-block-start: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));

    > div { flex: 1 1 0; min-width: 0; }
    .v-icon { color: var(--sd-modern-muted); }
    strong { font-weight: 600; }
    p { margin: 2px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  }
  &__explain[data-status='sent'] .v-icon { color: rgb(var(--v-theme-success)); }
  &__explain[data-status='failed'] .v-icon { color: rgb(var(--v-theme-error)); }
  &__fix { flex: 0 0 auto; align-self: center; }

  &__facts {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 6px 18px;
    margin: 0;
    padding: 0 4px;

    dt { color: var(--sd-modern-muted); }
    dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
  }
  &__answer { padding: 6px 8px; border-radius: 8px; background: rgba(var(--v-theme-error), .06); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; }
  &__more-to { margin-inline-start: 4px; }
  &__mono { color: var(--sd-modern-muted); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; }

  &__exchanges h4 { margin: 0 0 8px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
  &__exchange { overflow: hidden; border: 1px solid var(--sd-modern-border); border-radius: 12px; background: rgb(var(--v-theme-surface)); }
  &__exchange + &__exchange { margin-block-start: 8px; }
  &__exchange-head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 8px 12px; font-size: 12px; }
  &__method { font-weight: 700; letter-spacing: .04em; }
  &__url { flex: 1 1 200px; min-width: 0; overflow-wrap: anywhere; color: var(--sd-modern-muted); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
  &__code-badge { padding: 0 7px; border-radius: 6px; font-weight: 600; line-height: 20px; }
  &__code-badge[data-tone='success'] { background: rgba(var(--v-theme-success), .12); color: rgb(var(--v-theme-success)); }
  &__code-badge[data-tone='warning'] { background: rgba(var(--v-theme-warning), .16); color: rgb(var(--v-theme-warning)); }
  &__code-badge[data-tone='error'] { background: rgba(var(--v-theme-error), .12); color: rgb(var(--v-theme-error)); }
  &__ms { color: var(--sd-modern-muted); }
  &__response {
    max-height: 220px;
    margin: 0;
    padding: 10px 12px;
    overflow: auto;
    border-block-start: 1px solid var(--sd-modern-border);
    background: rgba(var(--v-theme-on-surface), .03);
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 11.5px;
    line-height: 17px;
    text-align: left;
    white-space: pre-wrap;
    word-break: break-word;
  }
  &__exchange-error { margin: 0; padding: 8px 12px; border-block-start: 1px solid var(--sd-modern-border); color: rgb(var(--v-theme-error)); font-size: 12px; }
  &__actions { display: flex; justify-content: flex-end; }
  &__more { display: flex; justify-content: center; margin-block-start: 12px; }

  // Smart invert dark mode inverts the page: brand logos keep their own colors.
  .smart-invert &__logo img { filter: invert(1); }

  @container (max-width: 620px) {
    &__row { grid-template-columns: 30px minmax(0, 1fr) 18px; gap: 4px 10px; }
    &__status { grid-column: 2; grid-row: 2; }
    &__logo { grid-column: 1; grid-row: 1 / span 2; }
    &__main { grid-column: 2; grid-row: 1; }
    &__why { grid-column: 2; grid-row: 3; text-align: start; }
    &__time { grid-column: 2; grid-row: 4; text-align: start; }
    &__chevron { grid-column: 3; grid-row: 1; }
    &__explain { display: grid; grid-template-columns: auto minmax(0, 1fr); }
    &__fix { grid-column: 2; justify-self: start; }
    &__facts { grid-template-columns: minmax(0, 1fr); dt { margin-block-start: 4px; } }
  }
  @container (max-width: 420px) {
    &__tiles { gap: 6px; }
    &__tile { padding: 10px; strong { font-size: 17px; } }
  }
}
</style>
