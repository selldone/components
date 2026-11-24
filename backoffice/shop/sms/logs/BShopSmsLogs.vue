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
  <!-- The shop's SMS log: what was sent, failed or skipped, and why. Values arrive redacted from the server. -->
  <section class="b-sms-logs text-start" :aria-busy="busy">
    <header class="b-sms-logs__head">
      <div>
        <h2>{{ $t("shop_sms.logs.title") }}</h2>
        <p>{{ $t("shop_sms.logs.subtitle", { period }) }}</p>
      </div>
      <v-btn class="sd-modern-button" variant="text" :loading="busy" @click="refresh">
        <v-icon start aria-hidden="true">refresh</v-icon>{{ $t("shop_sms.logs.refresh") }}
      </v-btn>
    </header>

    <!-- Counts by status; each one filters the list. -->
    <div class="b-sms-logs__tiles" role="group" :aria-label="$t('shop_sms.logs.filter_status')">
      <button v-for="tile in tiles" :key="tile.key" type="button" class="b-sms-logs__tile"
              :class="{ 'b-sms-logs__tile--active': status === tile.key }" :data-status="tile.key"
              :aria-pressed="status === tile.key" @click="setStatus(tile.key)">
        <span class="b-sms-logs__dot" :data-status="tile.key" aria-hidden="true"></span>
        <strong>{{ tile.count }}</strong>
        <span>{{ tile.title }}</span>
      </button>
    </div>

    <div class="b-sms-logs__filters">
      <v-select v-model="code" :items="code_items" item-title="title" item-value="value"
                :placeholder="$t('shop_sms.logs.all_messages')" :aria-label="$t('shop_sms.logs.filter_message')"
                prepend-inner-icon="filter_list" clearable hide-details density="compact" variant="solo-filled" flat rounded="lg"
                class="b-sms-logs__code" @update:model-value="reload"></v-select>
    </div>

    <u-loading-progress v-if="busy && logs.length"></u-loading-progress>
    <div v-if="fetchFailed" class="sd-modern-notice b-sms-logs__notice" role="alert">
      <v-icon aria-hidden="true">error_outline</v-icon>
      <p class="sd-modern-notice__content">{{ $t("shop_sms.logs.read_error") }}</p>
      <v-btn class="sd-modern-button" variant="text" :disabled="busy" @click="reload">{{ $t("shop_sms.modern.retry") }}</v-btn>
    </div>
    <div v-else-if="loaded && !logs.length && !busy" class="b-sms-logs__empty">
      <v-icon aria-hidden="true">sms</v-icon>
      <strong>{{ $t(status || code ? "shop_sms.logs.empty_filtered" : "shop_sms.logs.empty") }}</strong>
      <p>{{ $t("shop_sms.logs.empty_help", { period }) }}</p>
    </div>
    <div v-else-if="!loaded && busy" class="b-sms-logs__skeleton" aria-hidden="true">
      <span v-for="i in 4" :key="i"></span>
    </div>

    <ul v-if="logs.length" class="b-sms-logs__list">
      <li v-for="log in logs" :key="log.id" class="b-sms-logs__item" :class="{ 'b-sms-logs__item--open': isOpen(log) }">
        <button type="button" class="b-sms-logs__row" :data-log="log.id" :aria-expanded="isOpen(log)" @click="toggle(log)">
          <span class="b-sms-logs__status" :data-status="log.status">
            <span class="b-sms-logs__dot" :data-status="log.status" aria-hidden="true"></span>{{ $t(`shop_sms.logs.status.${log.status}`) }}
          </span>
          <span class="b-sms-logs__logo" aria-hidden="true">
            <img v-if="provider(log.driver)?.logo" :src="provider(log.driver).logo" alt="" />
            <span v-else>{{ initials(provider(log.driver)?.title || log.driver) }}</span>
          </span>
          <span class="b-sms-logs__main">
            <strong>{{ messageTitle(log.code) }}</strong>
            <small>
              <bdi dir="ltr">{{ log.recipient || "—" }}</bdi>
              · {{ provider(log.driver)?.title || log.driver || "—" }}<template v-if="log.account === 'selldone'"> · Selldone</template>
            </small>
          </span>
          <span class="b-sms-logs__why">{{ shortReason(log) }}</span>
          <time class="b-sms-logs__time" :datetime="log.created_at" :title="fullDate(log.created_at)">{{ timeAgo(log.created_at) }}</time>
          <v-icon class="b-sms-logs__chevron" aria-hidden="true">expand_more</v-icon>
        </button>

        <!-- Structured details: what happened in plain words, the facts, then the provider's own answers. -->
        <div v-if="isOpen(log)" class="b-sms-logs__details">
          <div class="b-sms-logs__explain" :data-status="log.status">
            <v-icon aria-hidden="true">{{ log.status === "sent" ? "check_circle" : log.status === "failed" ? "error_outline" : "do_not_disturb_on" }}</v-icon>
            <div>
              <strong>{{ explainTitle(log) }}</strong>
              <p>{{ explainHelp(log) }}</p>
            </div>
          </div>

          <dl class="b-sms-logs__facts">
            <template v-if="log.error_message">
              <dt>{{ $t("shop_sms.logs.fields.answer") }}</dt>
              <dd class="b-sms-logs__answer" dir="auto">{{ log.error_message }}</dd>
            </template>
            <dt>{{ $t("shop_sms.logs.fields.message") }}</dt>
            <dd>{{ messageTitle(log.code) }} <bdi v-if="log.code" dir="ltr" class="b-sms-logs__mono">{{ log.code }}</bdi></dd>
            <template v-if="log.mode">
              <dt>{{ $t("shop_sms.logs.fields.mode") }}</dt>
              <dd>{{ $t(`shop_sms.logs.mode.${log.mode}`) }}<bdi v-if="log.template" dir="ltr" class="b-sms-logs__mono"> {{ log.template }}</bdi></dd>
            </template>
            <template v-if="log.language">
              <dt>{{ $t("shop_sms.logs.fields.language") }}</dt>
              <dd>{{ getLanguageName(log.language) }}</dd>
            </template>
            <dt>{{ $t("shop_sms.logs.fields.account") }}</dt>
            <dd>{{ $t(`shop_sms.logs.account.${log.account}`) }}</dd>
            <template v-if="log.duration_ms !== null && log.duration_ms !== undefined">
              <dt>{{ $t("shop_sms.logs.fields.duration") }}</dt>
              <dd>{{ log.duration_ms }} ms</dd>
            </template>
            <dt>{{ $t("shop_sms.logs.fields.time") }}</dt>
            <dd>{{ fullDate(log.created_at) }}</dd>
          </dl>

          <div v-if="log.exchanges?.length" class="b-sms-logs__exchanges">
            <h4>{{ $t("shop_sms.logs.provider_calls") }}</h4>
            <div v-for="(exchange, index) in log.exchanges" :key="index" class="b-sms-logs__exchange">
              <div class="b-sms-logs__exchange-head">
                <span class="b-sms-logs__method">{{ exchange.method }}</span>
                <bdi dir="ltr" class="b-sms-logs__url">{{ exchange.url }}</bdi>
                <span class="b-sms-logs__code-badge" :data-tone="tone(exchange.status)">{{ exchange.status ?? $t("shop_sms.logs.no_answer") }}</span>
                <span v-if="exchange.duration_ms !== null && exchange.duration_ms !== undefined" class="b-sms-logs__ms">{{ exchange.duration_ms }} ms</span>
              </div>
              <pre v-if="exchange.response" dir="ltr" class="b-sms-logs__response">{{ pretty(exchange.response) }}</pre>
              <p v-if="exchange.error" class="b-sms-logs__exchange-error" dir="auto">{{ exchange.error }}</p>
            </div>
          </div>

          <div class="b-sms-logs__actions">
            <v-btn class="sd-modern-button" variant="text" size="small" @click="copyToClipboard(details(log))">
              <v-icon start aria-hidden="true">content_copy</v-icon>{{ $t("shop_sms.logs.copy") }}
            </v-btn>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="logs.length < total" class="b-sms-logs__more">
      <v-btn class="sd-modern-button" variant="outlined" :loading="busy" @click="loadMore">
        {{ $t("shop_sms.logs.load_more", { count: total - logs.length }) }}
      </v-btn>
    </div>
  </section>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

const PAGE = 20;

export default {
  name: "BShopSmsLogs",
  props: {
    shop: { type: Object, required: true },
    // SMS message types of the shop (code, title) to name each entry.
    messages: { type: Array, default: () => [] },
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
    providers: {},
    request: 0,
  }),

  computed: {
    // The shop's plan sets how long the log keeps entries (24 hours on Free).
    period() {
      return this.retention_days === 1 ? this.$t("shop_sms.logs.period_24h") : this.$t("shop_sms.logs.period_days", { days: this.retention_days });
    },
    tiles() {
      return ["sent", "failed", "skipped"].map((key) => ({ key, count: this.summary[key] || 0, title: this.$t(`shop_sms.logs.status.${key}`) }));
    },
    code_items() {
      return [
        ...this.messages.filter((m) => m.code).map((m) => ({ value: m.code, title: m.title })),
        { value: "test", title: this.$t("shop_sms.logs.test_send") },
      ];
    },
  },

  created() {
    this.reload();
    this.fetchProviders();
  },

  beforeUnmount() {
    this.request++;
  },

  methods: {
    setStatus(key) {
      this.status = this.status === key ? null : key;
      this.reload();
    },
    refresh() {
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
        .get(window.API.GET_SHOP_SMS_LOGS(this.shop.id), {
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
    // Provider names and logos for the entries; the log stores only the key.
    fetchProviders() {
      axios
        .get(window.API.GET_SHOP_SMS_PROVIDERS(this.shop.id))
        .then(({ data }) => {
          if (data.error) return;
          this.providers = Object.fromEntries((data.providers || []).map((p) => [p.key, { title: p.title, logo: p.logo }]));
        })
        .catch(() => {});
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
    initials(title) {
      const words = String(title || "").replace(/[^\p{L}\p{N} ]/gu, " ").split(" ").filter(Boolean);
      return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "–";
    },
    messageTitle(code) {
      if (!code) return "—";
      if (code === "test") return this.$t("shop_sms.logs.test_send");
      return this.messages.find((m) => m.code === code)?.title || code;
    },
    shortReason(log) {
      if (log.status === "failed") return this.$t(`shop_sms.logs.error.${log.error_type || "internal"}.title`);
      if (log.status === "skipped") return this.$t(`shop_sms.logs.reason.${log.reason || "no_provider"}.title`);
      return "";
    },
    explainTitle(log) {
      if (log.status === "sent") return this.$t("shop_sms.logs.sent_title", { provider: this.provider(log.driver)?.title || log.driver || "" });
      return this.shortReason(log);
    },
    explainHelp(log) {
      if (log.status === "sent") return this.$t("shop_sms.logs.sent_help");
      if (log.status === "failed") return this.$t(`shop_sms.logs.error.${log.error_type || "internal"}.help`);
      return this.$t(`shop_sms.logs.reason.${log.reason || "no_provider"}.help`);
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
.b-sms-logs {
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
    grid-template-columns: 88px 30px minmax(0, 1fr) fit-content(200px) max-content 18px;
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

    .v-icon { color: var(--sd-modern-muted); }
    strong { font-weight: 600; }
    p { margin: 2px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  }
  &__explain[data-status='sent'] .v-icon { color: rgb(var(--v-theme-success)); }
  &__explain[data-status='failed'] .v-icon { color: rgb(var(--v-theme-error)); }

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

  @media (max-width: 760px) {
    &__row { grid-template-columns: 30px minmax(0, 1fr) 18px; gap: 4px 10px; }
    &__status { grid-column: 2; grid-row: 2; }
    &__logo { grid-column: 1; grid-row: 1 / span 2; }
    &__main { grid-column: 2; grid-row: 1; }
    &__why { grid-column: 2; grid-row: 3; }
    &__time { grid-column: 2; grid-row: 4; text-align: start; }
    &__chevron { grid-column: 3; grid-row: 1; }
    &__facts { grid-template-columns: minmax(0, 1fr); dt { margin-block-start: 4px; } }
  }
  @media (max-width: 480px) {
    &__tiles { gap: 6px; }
    &__tile { padding: 10px; strong { font-size: 17px; } }
  }
}
</style>
