<template>
  <div class="b-dashboard-online-staffs text-start">
    <div v-if="staffs.length" class="b-dashboard-online-staffs__group">
      <v-tooltip
        v-for="staff in visible_staffs"
        :key="staff.id"
        :open-on-focus="true"
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
            :aria-label="`${staff.name}, ${staff.email}, ${$t('global.commons.online')}`"
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
        <span class="sd-modern-status">
          <span class="sd-modern-status__dot text-success" />{{
            $t("global.commons.online")
          }}
        </span>
      </v-tooltip>
      <v-dialog
        v-if="staffs.length > 10"
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
    </div>
    <span class="b-dashboard-online-staffs__label">
      {{ $t("admin_shop.dashboard.online_staff") }}
      <span class="b-dashboard-online-staffs__count">{{ staffs.length }}</span>
    </span>
  </div>
</template>

<script lang="ts">
export default {
  name: "BDashboardShopOnlineStaffs",
  props: {
    staffs: { type: Array, default: () => [] },
  },
  computed: {
    visible_staffs() {
      return this.staffs.slice(0, 10);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-dashboard-online-staffs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 14px;
  width: 100%;
  min-width: 0;

  &__label {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 7px;
    margin-inline-start: auto;
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
    border: 2px solid rgb(var(--v-theme-surface));
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
    outline-offset: 2px;

    & + & {
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
    &__avatar + &__avatar {
      margin-inline-start: -16px;
    }
    &__status {
      align-self: start;
      margin-block-start: 4px;
    }
  }
}
</style>
