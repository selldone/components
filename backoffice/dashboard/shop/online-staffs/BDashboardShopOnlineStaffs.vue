<template>
  <div class="b-dashboard-online-staffs text-start">
    <div
      v-if="staffs.length || connected_agents.length"
      class="b-dashboard-online-staffs__group"
    >
      <v-tooltip
        v-for="staff in visible_staffs"
        :key="staff.id"
        :open-on-focus="true"
        :persistent="false"
        open-on-click
        location="top"
        content-class="sd-modern-tooltip text-start"
      >
        <template #activator="{ props }">
          <span
            v-bind="props"
            class="b-dashboard-online-staffs__avatar"
            tabindex="0"
            role="img"
            :aria-label="`${staff.name}, ${staff.email}, ${$t('admin_shop.dashboard.ai_agents.staff')}, ${$t('global.commons.online')}`"
            @keydown.enter.prevent="$event.currentTarget.click()"
            @keydown.space.prevent="$event.currentTarget.click()"
          >
            <v-avatar size="30" class="b-dashboard-online-staffs__image">
              <v-img :src="getUserAvatar(staff.id)" alt="">
                <template #error><v-icon size="20">person</v-icon></template>
              </v-img>
            </v-avatar>
          </span>
        </template>
        <div class="b-dashboard-online-staffs__tooltip-name">
          {{ staff.name }}
        </div>
        <div>{{ staff.email }}</div>
        <div>{{ $t("admin_shop.dashboard.ai_agents.staff") }}</div>
        <span class="sd-modern-status">
          <span class="sd-modern-status__dot text-success" />{{
            $t("global.commons.online")
          }}
        </span>
      </v-tooltip>
      <v-dialog
        v-if="staffs.length > visible_staffs.length"
        max-width="520"
        scrollable
        :aria-label="$t('admin_shop.dashboard.online_staff')"
      >
        <template #activator="{ props }">
          <button
            v-bind="props"
            type="button"
            class="sd-modern-icon-button b-dashboard-online-staffs__more"
            aria-haspopup="dialog"
            :aria-label="`${$t('global.actions.view_all')} · ${$t('admin_shop.dashboard.online_staff')} (${staffs.length})`"
          >
            <v-icon size="20" aria-hidden="true">more_horiz</v-icon>
            <v-tooltip
              activator="parent"
              :open-on-focus="true"
              :persistent="false"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.actions.view_all") }} ·
              {{ $t("admin_shop.dashboard.online_staff") }}</v-tooltip
            >
          </button>
        </template>
        <template #default="{ isActive }">
          <v-card
            class="sd-modern-widget b-dashboard-online-staffs__dialog text-start"
          >
            <header class="sd-modern-header">
              <div class="sd-modern-title">
                <span class="sd-modern-icon sd-modern-icon--plain">
                  <v-icon size="20" aria-hidden="true">group</v-icon>
                </span>
                <h2 class="sd-modern-title-text">
                  {{ $t("admin_shop.dashboard.online_staff") }}
                  <span class="b-dashboard-online-staffs__count">{{
                    staffs.length
                  }}</span>
                </h2>
              </div>
              <v-btn
                icon
                variant="text"
                class="sd-modern-icon-button"
                :aria-label="$t('global.actions.close')"
                v-tooltip="$t('global.actions.close')"
                @click="isActive.value = false"
                ><v-icon>close</v-icon></v-btn
              >
            </header>
            <ul class="b-dashboard-online-staffs__list">
              <li v-for="staff in staffs" :key="staff.id">
                <v-avatar size="36" class="b-dashboard-online-staffs__image">
                  <v-img :src="getUserAvatar(staff.id)" alt="">
                    <template #error
                      ><v-icon size="22">person</v-icon></template
                    >
                  </v-img>
                </v-avatar>
                <div class="b-dashboard-online-staffs__identity">
                  <div class="b-dashboard-online-staffs__name">
                    {{ staff.name }}
                  </div>
                  <div class="b-dashboard-online-staffs__email">
                    {{ staff.email }}
                  </div>
                </div>
                <span
                  class="sd-modern-status b-dashboard-online-staffs__status"
                >
                  <span class="sd-modern-status__dot text-success" />{{
                    $t("global.commons.online")
                  }}
                </span>
              </li>
            </ul>
          </v-card>
        </template>
      </v-dialog>
      <v-tooltip
        v-for="agent in visible_agents"
        :key="agent.id"
        :open-on-focus="true"
        :persistent="false"
        open-on-click
        location="top"
        content-class="sd-modern-tooltip text-start"
      >
        <template #activator="{ props }">
          <button
            v-bind="props"
            type="button"
            class="b-dashboard-online-staffs__avatar b-dashboard-online-staffs__avatar--agent"
            :class="{
              'b-dashboard-online-staffs__avatar--recent':
                recentlyActive(agent),
            }"
            :aria-label="`${agent.name}, ${agent.provider}, ${$t('admin_shop.dashboard.ai_agents.agent')}, ${$t('admin_shop.dashboard.ai_agents.connected')}${recentlyActive(agent) ? ', ' + $t('admin_shop.dashboard.ai_agents.recently_active') : ''}`"
          >
            <v-avatar
              size="30"
              class="b-dashboard-online-staffs__image bg-white"
            >
              <v-img :src="agentAvatar(agent)" alt="">
                <template #error>
                  <v-icon size="20" aria-hidden="true">smart_toy</v-icon>
                </template>
              </v-img>
            </v-avatar>
          </button>
        </template>
        <div class="b-dashboard-online-staffs__tooltip-name">
          {{ agent.name }}
        </div>
        <div>
          {{ agent.provider }} ·
          {{ $t("admin_shop.dashboard.ai_agents.agent") }}
        </div>
        <span class="sd-modern-status sd-modern-status--plain">
          <span class="sd-modern-status__dot text-info" />{{
            $t("admin_shop.dashboard.ai_agents.connected")
          }}
        </span>
        <div v-if="recentlyActive(agent)">
          {{ $t("admin_shop.dashboard.ai_agents.recently_active") }}
          <div>
            {{ $t("admin_shop.dashboard.ai_agents.recent_activity_help") }}
          </div>
        </div>
        <div>
          {{ $t("admin_shop.dashboard.ai_agents.last_activity") }}:
          {{
            agent.last_used_at
              ? getFromNowString(agent.last_used_at)
              : $t("admin_shop.dashboard.ai_agents.no_activity")
          }}
        </div>
        <div>
          {{ $t("admin_shop.dashboard.ai_agents.requests_today") }}:
          {{ agent.request_count }}
        </div>
      </v-tooltip>
      <button
        v-if="connected_agents.length > visible_agents.length"
        type="button"
        class="sd-modern-icon-button b-dashboard-online-staffs__more"
        :aria-label="$t('admin_shop.dashboard.ai_agents.view_agents')"
        @click="$emit('agents')"
      >
        +{{ connected_agents.length - visible_agents.length }}
        <v-tooltip
          activator="parent"
          :open-on-focus="true"
          :persistent="false"
          location="top"
          content-class="sd-modern-tooltip text-start"
          >{{ $t("admin_shop.dashboard.ai_agents.view_agents") }}</v-tooltip
        >
      </button>
    </div>
    <div class="b-dashboard-online-staffs__labels">
      <span class="b-dashboard-online-staffs__label">
        {{ $t("admin_shop.dashboard.online_staff") }}
        <span class="b-dashboard-online-staffs__count">{{
          staffs.length
        }}</span>
      </span>
      <button
        v-if="connected_agents.length"
        type="button"
        class="b-dashboard-online-staffs__label b-dashboard-online-staffs__agents-link"
        @click="$emit('agents')"
      >
        {{ $t("admin_shop.dashboard.ai_agents.connected_agents") }}
        <span class="b-dashboard-online-staffs__count">{{
          connected_agents.length
        }}</span>
        <v-tooltip
          activator="parent"
          :open-on-focus="true"
          :persistent="false"
          location="top"
          content-class="sd-modern-tooltip text-start"
          >{{ $t("admin_shop.dashboard.ai_agents.view_agents") }}</v-tooltip
        >
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "BDashboardShopOnlineStaffs",
  emits: ["agents"],
  props: {
    staffs: { type: Array, default: () => [] },
    agents: { type: Array, default: () => [] },
    serverTime: { type: String, default: null },
  },
  data: () => ({
    activity_now: Date.now(),
    activity_offset: 0,
    activity_timer: null,
  }),
  watch: {
    serverTime: {
      immediate: true,
      handler(value) {
        const localNow = Date.now();
        const serverNow = Date.parse(value);
        this.activity_offset = Number.isFinite(serverNow)
          ? serverNow - localNow
          : 0;
        this.activity_now = localNow + this.activity_offset;
      },
    },
  },
  mounted() {
    this.activity_timer = setInterval(() => {
      this.activity_now = Date.now() + this.activity_offset;
    }, 60_000);
  },
  beforeUnmount() {
    clearInterval(this.activity_timer);
  },
  computed: {
    preview_limit() {
      return this.$vuetify?.display?.xs ? 4 : 10;
    },
    visible_staffs() {
      const limit = Math.max(
        this.preview_limit - this.connected_agents.length,
        Math.ceil(this.preview_limit / 2),
      );
      return this.staffs.slice(0, limit);
    },
    connected_agents() {
      return this.agents?.filter((agent) => agent.is_active === true) || [];
    },
    visible_agents() {
      return this.connected_agents.slice(
        0,
        this.preview_limit - this.visible_staffs.length,
      );
    },
  },
  methods: {
    recentlyActive(agent) {
      const lastRequest = Date.parse(agent.last_used_at);
      const age = this.activity_now - lastRequest;
      return (
        agent.is_active === true &&
        !agent.is_sample &&
        !agent.display_only &&
        Number.isFinite(lastRequest) &&
        age >= 0 &&
        age <= 30 * 60_000
      );
    },
    agentAvatar(agent) {
      if (agent.avatar_url) return agent.avatar_url;

      // Provider icons always resolve locally, including absolute URLs from Laravel.
      const icon = agent.provider_icon?.match(
        /\/(chatgpt|claude|codex|cursor|copilot|custom|unknown)\.svg$/,
      )?.[1];
      const provider =
        `${agent.provider_code || ""} ${agent.provider || ""}`.toLowerCase();
      const code =
        icon ||
        provider.match(/codex|claude|chatgpt|cursor|copilot|custom/)?.[0] ||
        (provider.includes("anthropic")
          ? "claude"
          : provider.includes("openai")
            ? "chatgpt"
            : "unknown");
      return `/assets/img/mcp-agents/${code}.svg`;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-dashboard-online-staffs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 8px 14px;
  width: 100%;
  min-width: 0;

  &__labels {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 0 14px;
    margin-inline-start: auto;
  }
  &__label {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 7px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    text-align: end;
  }
  &__count {
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  &__group {
    display: flex;
    align-items: center;
    padding: 2px;
  }
  &__avatar {
    position: relative;
    display: inline-flex;
    flex: 0 0 34px;
    width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 2px solid rgb(var(--v-theme-primary));
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
    outline-offset: 2px;
    cursor: pointer;

    & ~ & {
      margin-inline-start: -10px;
    }
    &:hover,
    &:focus-visible {
      z-index: 1;
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
    }
  }
  &__avatar--agent {
    border-color: rgb(var(--v-theme-info));
    color: rgb(var(--v-theme-info));
  }
  &__avatar--recent::after {
    content: "";
    position: absolute;
    inset: -4px;
    border: 1px solid rgba(var(--v-theme-info), 0.35);
    border-radius: 50%;
    pointer-events: none;
    animation: agent-recent-request 3s ease-out infinite;
  }
  @keyframes agent-recent-request {
    0%,
    100% {
      opacity: 0.25;
      box-shadow: 0 0 0 0 rgba(var(--v-theme-info), 0.08);
    }
    50% {
      opacity: 0.65;
      box-shadow: 0 0 0 3px rgba(var(--v-theme-info), 0.06);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &__avatar--recent::after {
      animation: none;
    }
  }
  &__agents-link {
    min-height: 44px;
    padding-inline: 6px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      color: rgb(var(--v-theme-on-surface));
      background: var(--sd-modern-inset);
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }
  &__image {
    flex-shrink: 0;
    border-radius: 50% !important;
    background: var(--sd-modern-inset);
    color: var(--sd-modern-muted);
    overflow: hidden;

    :deep(.v-img),
    :deep(img) {
      border-radius: 50%;
    }
    :deep(.v-img__error) {
      display: grid;
      place-items: center;
    }
  }
  &__more {
    order: 1;
    margin-inline-start: 6px;
    border-radius: 50%;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }
  &__tooltip-name {
    font-weight: 500;
  }
  &__dialog {
    .sd-modern-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: 16px;
      margin-block-end: 16px;
    }
  }
  &__list {
    max-height: 60dvh;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;

    > li {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-block: 10px;
    }
    > li + li {
      border-block-start: 1px solid var(--sd-modern-border);
    }
  }
  &__identity {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  &__name {
    font-size: 14px;
    font-weight: 500;
  }
  &__email {
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__status {
    flex-shrink: 0;
    font-size: 12px;
  }
  @media (max-width: 600px) {
    &__avatar {
      flex-basis: 44px;
      width: 44px;
      height: 44px;
      border: none;
      background: transparent;

      .b-dashboard-online-staffs__image {
        box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
      }
    }
    &__avatar--agent .b-dashboard-online-staffs__image {
      box-shadow: 0 0 0 2px rgb(var(--v-theme-info));
    }
    &__avatar--recent::after {
      inset: 4px;
    }
    &__avatar ~ &__avatar {
      margin-inline-start: 0;
    }
    &__status {
      align-self: start;
      margin-block-start: 4px;
    }
  }
}
</style>
