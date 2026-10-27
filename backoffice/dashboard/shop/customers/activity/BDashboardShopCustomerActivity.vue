<template>
  <section
    v-if="active"
    class="sd-modern-widget b-dashboard-customer-activity text-start"
    :aria-label="$t('admin_shop.dashboard.customer_activity.title')"
    :aria-busy="loading"
  >
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain">
          <v-icon size="20" aria-hidden="true">people_outline</v-icon>
        </span>
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("admin_shop.dashboard.customer_activity.title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("admin_shop.dashboard.customer_activity.subtitle") }}
          </p>
        </div>
      </div>
      <v-btn
        class="sd-modern-icon-button"
        variant="text"
        icon
        :disabled="loading || !shopId"
        :aria-label="$t('admin_shop.dashboard.customer_activity.refresh')"
        v-tooltip="
          tooltip($t('admin_shop.dashboard.customer_activity.refresh'))
        "
        @click="load"
        ><v-icon size="20" aria-hidden="true">refresh</v-icon></v-btn
      >
    </header>

    <div
      v-if="error"
      class="sd-modern-notice b-dashboard-customer-activity__notice"
      role="status"
    >
      <v-icon size="20" aria-hidden="true">{{
        error === "denied" ? "lock_outline" : "error_outline"
      }}</v-icon>
      <p>
        {{
          $t(
            "admin_shop.dashboard.customer_activity." +
              (error === "denied" ? "denied" : "load_error"),
          )
        }}
      </p>
      <v-btn
        v-if="error !== 'denied'"
        class="sd-modern-button"
        variant="text"
        :disabled="loading"
        v-tooltip="tooltip($t('admin_shop.dashboard.customer_activity.retry'))"
        @click="load"
        >{{ $t("admin_shop.dashboard.customer_activity.retry") }}</v-btn
      >
    </div>
    <p
      v-if="!report && !error"
      class="b-dashboard-customer-activity__state"
      role="status"
    >
      {{
        $t(
          "admin_shop.dashboard.customer_activity." +
            (loading ? "loading" : "unavailable"),
        )
      }}
    </p>

    <div v-if="report" class="b-dashboard-customer-activity__columns">
      <section
        v-for="group in groups"
        :key="group.key"
        class="b-dashboard-customer-activity__column"
        :aria-label="$t('admin_shop.dashboard.customer_activity.' + group.key)"
      >
        <div class="b-dashboard-customer-activity__heading">
          <h3 class="sd-modern-eyebrow">
            {{ $t("admin_shop.dashboard.customer_activity." + group.key) }}
          </h3>
          <v-btn
            class="sd-modern-icon-button sd-modern-info-button"
            icon
            variant="text"
            :aria-label="
              $t('admin_shop.dashboard.customer_activity.' + group.key)
            "
            v-tooltip="{
              ...tooltip(
                $t(
                  'admin_shop.dashboard.customer_activity.' +
                    group.key +
                    '_help',
                ),
              ),
              openOnClick: true,
            }"
            ><v-icon size="16" aria-hidden="true">info_outline</v-icon></v-btn
          >
        </div>
        <p class="b-dashboard-customer-activity__scope">
          {{
            $t("admin_shop.dashboard.customer_activity." + group.key + "_scope")
          }}
        </p>
        <ul
          v-if="group.items?.length"
          class="b-dashboard-customer-activity__list"
        >
          <li v-for="customer in group.items" :key="customer.id">
            <router-link
              :to="{
                name: 'BPageCustomerDashboard',
                params: { shop_id: shopId, customer_id: customer.id },
              }"
              class="b-dashboard-customer-activity__row"
              v-tooltip="
                tooltip(
                  $t('admin_shop.dashboard.customer_activity.open_profile', {
                    name:
                      customer.name ||
                      $t('admin_shop.dashboard.customer_activity.unknown_name'),
                  }),
                )
              "
            >
              <v-avatar
                v-if="customer.user_id"
                size="32"
                class="avatar-gradient -thin -customer b-dashboard-customer-activity__avatar"
              >
                <v-img :src="getUserAvatar(customer.user_id)" alt="">
                  <template #placeholder>
                    <u-avatar-text
                      :name="customer.name || ''"
                      :size="32"
                      aria-hidden="true"
                    />
                  </template>
                  <template #error>
                    <u-avatar-text
                      :name="customer.name || ''"
                      :size="32"
                      aria-hidden="true"
                    />
                  </template>
                </v-img>
              </v-avatar>
              <u-avatar-text
                v-else
                :name="customer.name || ''"
                :size="32"
                class="avatar-gradient -thin -customer b-dashboard-customer-activity__avatar"
                aria-hidden="true"
              />
              <span class="b-dashboard-customer-activity__identity">
                <span class="b-dashboard-customer-activity__name">{{
                  customer.name ||
                  $t("admin_shop.dashboard.customer_activity.unknown_name")
                }}</span>
                <time
                  v-if="validTime(customer.at)"
                  :datetime="customer.at"
                  :aria-label="
                    $t(
                      'admin_shop.dashboard.customer_activity.' +
                        group.key +
                        '_at',
                    ) +
                    ': ' +
                    formatTime(customer.at)
                  "
                  >{{ formatTime(customer.at) }}</time
                >
                <span v-else class="b-dashboard-customer-activity__time">{{
                  $t("admin_shop.dashboard.customer_activity.unknown_time")
                }}</span>
              </span>
              <v-icon size="16" class="flip-rtl" aria-hidden="true"
                >chevron_right</v-icon
              >
            </router-link>
          </li>
        </ul>
        <p v-else class="b-dashboard-customer-activity__state">
          {{
            $t(
              "admin_shop.dashboard.customer_activity." +
                (group.items ? "empty_" + group.key : "unavailable"),
            )
          }}
        </p>
      </section>
    </div>
    <p
      v-if="report && validTime(report.as_of)"
      class="b-dashboard-customer-activity__updated"
    >
      {{
        $t("admin_shop.dashboard.customer_activity.updated", {
          time: formatTime(report.as_of),
        })
      }}
    </p>
  </section>
</template>

<script lang="ts">
import { markRaw } from "vue";
import UAvatarText from "../../../../../ui/avatar/text/UAvatarText.vue";

export default {
  name: "BDashboardShopCustomerActivity",
  inheritAttrs: false,
  components: { UAvatarText },
  props: {
    shop: { type: Object, required: true },
    active: { type: Boolean, default: true },
  },
  data: () => ({
    report: null,
    loading: false,
    error: null,
    runtime: markRaw({ mounted: false, generation: 0, controller: null }),
  }),
  computed: {
    shopId() {
      const id = Number(this.shop?.id);
      return Number.isSafeInteger(id) && id > 0 ? id : 0;
    },
    groups() {
      return ["joined", "active", "purchasers"].map((key) => ({
        key,
        items: Array.isArray(this.report?.[key])
          ? this.report[key].slice(0, 5)
          : null,
      }));
    },
  },
  watch: {
    shopId() {
      this.cancel();
      this.report = null;
      this.error = null;
      this.load();
    },
    active(value) {
      if (value) this.load();
      else this.cancel();
    },
  },
  mounted() {
    this.runtime.mounted = true;
    document.addEventListener("visibilitychange", this.onVisibility);
    this.load();
  },
  beforeUnmount() {
    this.runtime.mounted = false;
    this.cancel();
    document.removeEventListener("visibilitychange", this.onVisibility);
  },
  methods: {
    tooltip(text) {
      return {
        text,
        location: "top",
        contentClass: "sd-modern-tooltip text-start",
        openOnFocus: true,
      };
    },
    validTime(value) {
      return typeof value === "string" && Number.isFinite(Date.parse(value));
    },
    formatTime(value) {
      return this.validTime(value)
        ? new Intl.DateTimeFormat(this.$i18n?.locale || undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
          }).format(new Date(value))
        : this.$t("admin_shop.dashboard.customer_activity.unknown_time");
    },
    cancel() {
      this.runtime.generation++;
      this.runtime.controller?.abort();
      this.runtime.controller = null;
      this.loading = false;
    },
    onVisibility() {
      if (document.hidden) this.cancel();
      else if (!this.report && !this.error) this.load();
    },
    async load() {
      if (
        !this.runtime.mounted ||
        !this.active ||
        !this.shopId ||
        document.hidden ||
        this.runtime.controller
      )
        return;
      const generation = ++this.runtime.generation,
        shopId = this.shopId,
        controller = new AbortController();
      this.runtime.controller = controller;
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          window.API.GET_SHOP_CUSTOMERS(shopId) + "/activity-summary",
          { signal: controller.signal },
        );
        if (
          generation !== this.runtime.generation ||
          shopId !== this.shopId ||
          !this.runtime.mounted ||
          !this.active ||
          document.hidden
        )
          return;
        const report = response.data;
        if (report.error) {
          if ([1, 201].includes(report.code)) {
            this.report = null;
            this.error = "denied";
            return;
          }
          throw new Error("Customer activity unavailable");
        }
        if (report.shop_id !== shopId || !this.validTime(report.as_of))
          throw new Error("Invalid customer activity scope");
        this.report = report;
      } catch (error) {
        if (
          controller.signal.aborted ||
          generation !== this.runtime.generation ||
          shopId !== this.shopId
        )
          return;
        if ([401, 403, 404].includes(error.response?.status)) {
          // 🔒 Revoked customer access must clear every previously loaded identity.
          this.report = null;
          this.error = "denied";
        } else this.error = "load_error";
      } finally {
        if (generation === this.runtime.generation) {
          this.runtime.controller = null;
          this.loading = false;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.b-dashboard-customer-activity {
  min-width: 0;
  &__columns {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
  }
  &__column {
    min-width: 0;
  }
  &__column + &__column {
    border-inline-start: 1px solid var(--sd-modern-border);
    padding-inline-start: 24px;
  }
  &__heading {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  &__heading h3 {
    margin: 0;
  }
  &__scope {
    color: var(--sd-modern-muted);
    font-size: 12px;
    margin: 0 0 8px;
  }
  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  &__list li + li {
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__row {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) 16px;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 6px 8px;
    border-radius: 8px;
    color: rgb(var(--v-theme-on-surface));
    text-decoration: none;
  }
  &__row:hover {
    background: var(--sd-modern-inset);
  }
  &__row:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
  &__avatar {
    border-radius: 50%;
  }
  &__identity {
    display: grid;
    min-width: 0;
    gap: 2px;
  }
  &__name {
    overflow-wrap: anywhere;
    font-size: 13px;
    font-weight: 400;
  }
  &__identity time,
  &__time {
    color: var(--sd-modern-muted);
    font-size: 12px;
    overflow-wrap: anywhere;
  }
  &__state {
    color: var(--sd-modern-muted);
    font-size: 13px;
    margin: 12px 0;
  }
  &__notice {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-block-end: 16px;
  }
  &__notice p {
    flex: 1;
    margin: 0;
  }
  &__updated {
    color: var(--sd-modern-muted);
    font-size: 11px;
    margin: 16px 0 0;
  }
  @media (max-width: 800px) {
    &__columns {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }
    &__column + &__column {
      border-inline-start: 0;
      border-block-start: 1px solid var(--sd-modern-border);
      padding-inline-start: 0;
      padding-block-start: 16px;
    }
  }
  @media (max-width: 600px) {
    &__notice {
      flex-wrap: wrap;
    }
    &__notice p {
      flex-basis: calc(100% - 30px);
    }
  }
}
</style>
