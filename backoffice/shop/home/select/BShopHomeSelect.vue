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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div :class="{ 'b-shop-home-select-modern': modern }">
    <div :class="{ 'b-shop-home-select-modern__layout': modern }">
      <div :class="{ 'b-shop-home-select-modern__controls': modern }">
        <template v-if="modern">
          <div v-if="domain" class="b-shop-home-select-modern__domain-help">
            {{ $t('domains_modern.home.domain_help') }}
          </div>
          <div class="b-shop-home-select-modern__label">
            {{ $t('domains_modern.home.type_label') }}
          </div>
          <div class="b-shop-home-select-modern__options">
            <div
              v-for="option in modernOptions"
              :key="option.value"
              :class="{ 'is-selected': selectedModernType === option.value }"
              class="b-shop-home-select-modern__option"
            >
              <v-tooltip
                :disabled="!option.disabled"
                content-class="sd-modern-tooltip text-start"
                location="top"
                :open-on-click="true"
              >
                <template #activator="{ props: tooltipProps }">
                  <span class="b-shop-home-select-modern__choice-wrap" v-bind="tooltipProps">
                    <button
                      type="button"
                      :aria-pressed="selectedModernType === option.value"
                      :aria-label="option.disabled ? option.title + ': ' + option.disabledHelp : undefined"
                      :disabled="option.disabled || busy_set || readOnly"
                      class="b-shop-home-select-modern__choice"
                      @click="selectModernHome(option)"
                    >
                      <img :src="option.src" alt="" height="16" width="16" />
                      <span>{{ option.title }}</span>
                      <span class="b-shop-home-select-modern__choice-dot" aria-hidden="true"></span>
                    </button>
                  </span>
                </template>
                {{ option.disabledHelp }}
              </v-tooltip>
              <v-tooltip
                v-if="option.route"
                content-class="sd-modern-tooltip text-start"
                location="top"
                :open-on-click="true"
              >
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    v-bind="tooltipProps"
                    :to="{ name: option.route }"
                    :aria-label="$t('domains_modern.home.manage_type', { type: option.title })"
                    class="sd-modern-icon-button b-shop-home-select-modern__settings"
                    icon
                    variant="text"
                  >
                    <v-icon size="16">settings</v-icon>
                  </v-btn>
                </template>
                {{ $t('domains_modern.home.manage_type', { type: option.title }) }}
              </v-tooltip>
            </div>
          </div>
        </template>
    <v-row v-else align="start" class="m-0 py-16" justify="center">
      <u-button-feature
        :name="$t('global.commons.store')"
        :selected="
          home_page === 'shop' ||
          (!clearable && !home_page) /*Default home page mode!*/
        "
        :src="require('../../../../assets/icons/store.svg')"
        auto-scale-down
        class="zoomIn delay_300"
        @select="
          home_page = 'shop';
          setHomePage();
        "
      >
      </u-button-feature>

      <u-button-feature
        :disabled="!(shop.avocado && shop.avocado.enable)"
        :name="$t('global.commons.avocado')"
        :selected="home_page === 'avocado'"
        :src="require('../../../../assets/icons/avocado.svg')"
        :to-setting="{ name: 'BPageShopChannelAvocado' }"
        auto-scale-down
        class="zoomIn delay_400"
        @select="
          home_page = 'avocado';
          setHomePage();
        "
      >
        <v-tooltip
          v-if="!shop.avocado?.enable"
          activator="parent"
          location="bottom"
        >
          <v-icon class="me-1">warning</v-icon>
          Avocado sales channel not enable!!
        </v-tooltip>
      </u-button-feature>

      <u-button-feature
        :disabled="!(shop.hyper && shop.hyper.enable)"
        :name="$t('global.commons.hyper')"
        :selected="home_page === 'hyper'"
        :src="require('../../../../assets/icons/hyper.svg')"
        :to-setting="{ name: 'BPageShopChannelHyper' }"
        auto-scale-down
        class="zoomIn delay_500"
        @select="
          home_page = 'hyper';
          setHomePage();
        "
      >
        <v-tooltip
          v-if="!shop.hyper?.enable"
          activator="parent"
          location="bottom"
        >
          <v-icon class="me-1">warning</v-icon>
          Hyper sales chanel not enable!!
        </v-tooltip>
      </u-button-feature>

      <u-button-feature
        :disabled="!(shop.community && shop.community.enable)"
        :name="$t('global.commons.community')"
        :selected="home_page === 'community'"
        :src="require('../../../../assets/icons/community.png')"
        :to-setting="{ name: 'BPageShopCommunityTopics' }"
        auto-scale-down
        class="zoomIn delay_600"
        @select="
          home_page = 'community';
          setHomePage();
        "
      >
        <v-tooltip
          v-if="!shop.community?.enable"
          activator="parent"
          location="bottom"
        >
          <v-icon class="me-1">warning</v-icon>
          Community not enable!!
        </v-tooltip>
      </u-button-feature>

      <u-button-feature
        :name="$t('global.commons.blog')"
        :selected="home_page === 'blog'"
        :src="require('../../../../assets/icons/blog.svg')"
        :to-setting="{ name: 'BPageShopBlogsList' }"
        auto-scale-down
        class="zoomIn delay_700"
        @select="
          home_page = 'blog';
          setHomePage();
        "
      >
      </u-button-feature>

      <u-button-feature
        :name="$t('global.commons.map')"
        :selected="home_page === 'map'"
        :src="require('../../../../assets/icons/map-tag.svg')"
        :to-setting="{ name: 'BPageShopChannelMap' }"
        auto-scale-down
        class="zoomIn delay_700"
        @select="
          home_page = 'map';
          setHomePage();
        "
      >
      </u-button-feature>

      <u-button-feature
        :disabled="!pages.length"
        :name="$t('global.commons.landing_page')"
        :selected="landing_page_mode"
        :src="require('../../../../assets/icons/landing-page.svg')"
        :to-setting="{ name: 'BPageShopPagesLandings' }"
        auto-scale-down
        class="zoomIn delay_800"
        @select="
          home_page = pages[0].id;
          setHomePage();
        "
      >
        <v-tooltip v-if="!pages.length" activator="parent" location="bottom">
          <v-icon class="me-1">warning</v-icon>
          No landing page created!
        </v-tooltip>
      </u-button-feature>

      <u-button-feature
        :selected="static_page_mode"
        :src="require('../../../../assets/icons/static-pages.svg')"
        :to-setting="{ name: 'BPageShopPagesStatic' }"
        auto-scale-down
        class="zoomIn delay_900"
        name="Static page"
        @select="
          home_page = '/';
          setHomePage();
        "
      >
      </u-button-feature>
    </v-row>

    <template v-if="static_page_mode">
      <v-text-field
        v-model="home_page"
        :disabled="busy_set || readOnly"
        :class="modern ? 'sd-modern-underlined-field b-shop-home-select-modern__field b-shop-home-select-modern__path' : 'max-width-field-large mx-auto mt-8 mb-4 fadeIn'"
        flat
        :label="modern ? $t('domains_modern.home.path_label') : 'Page path'"
        :messages="modern ? $t('domains_modern.home.path_help') : &quot;Paths should begin with a forward slash '/'. For example, to access a specific folder, you can use the path '/Folder1'.&quot;"
        :variant="modern ? 'underlined' : 'solo'"
        @keydown.enter="setHomePage"
      >
        <template v-slot:append-inner>
          <v-tooltip v-if="modern" content-class="sd-modern-tooltip text-start" location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                :disabled="old_page === home_page || readOnly"
                :loading="busy_set"
                :aria-label="$t('global.actions.save')"
                class="sd-modern-icon-button sd-modern-input-action"
                icon
                variant="text"
                @click="setHomePage"
              >
                <v-icon size="16">save</v-icon>
              </v-btn>
            </template>
            {{ $t('global.actions.save') }}
          </v-tooltip>
          <v-btn
            v-else
            :disabled="old_page === home_page || readOnly"
            :loading="busy_set"
            class="ma-1"
            color="primary"
            size="small"
            @click="setHomePage"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </template>
      </v-text-field>

      <div :class="modern ? 'b-shop-home-select-modern__manage' : 'max-width-field-large mx-auto my-4'">
        <v-btn
          :to="{ name: 'BPageShopPagesStatic' }"
          :class="modern ? 'sd-modern-button sd-modern-button--small b-shop-home-select-modern__manage-button' : 'tnt'"
          color="primary"
          variant="text"
          >{{ modern ? $t('domains_modern.home.manage_static') : 'Manage static pages' }}
          <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
        </v-btn>
      </div>
    </template>

    <v-select
      v-if="landing_page_mode"
      v-model="home_page"
      :disabled="busy_set || readOnly"
      :items="pages"
      :label="$t('shop_home_edit.default_home')"
      :placeholder="$t('shop_home_edit.default_home_placeholder')"
      :return-object="false"
      :class="modern ? 'sd-modern-underlined-field b-shop-home-select-modern__field' : 'max-width-field-large mx-auto mt-8 mb-4 fadeIn'"
      :menu-props="modern ? { contentClass: 'sd-modern-select-menu' } : undefined"
      clearable
      item-title="title"
      item-value="id"
      searchable
      variant="underlined"
      @update:model-value="setHomePage"
    >
      <template v-slot:append-inner>
        <v-progress-circular
          v-if="busy_set || busy_fetch"
            :color="modern ? 'primary' : busy_set ? 'green' : 'blue'"
          :class="{ 'margin-n7px': !modern }" :size="modern ? 16 : undefined" :width="modern ? 2 : undefined"
          indeterminate
        >
        </v-progress-circular>
      </template>

      <template v-slot:item="{ item, props }">
        <v-list-item class="text-start" v-bind="props">
          <template v-slot:prepend>
            <v-avatar
              :image="getShopImagePath(item.raw.image, IMAGE_SIZE_SMALL)"
              rounded="lg"
              size="24"
            />
          </template>

          <template v-slot:title>
            {{ item.raw.title }}
            <v-icon
              v-if="!item.raw.published"
              color="amber"
              title="Not published!"
              >warning
            </v-icon>
          </template>

          <template v-slot:append>
            <v-icon :color="item.raw.color">fiber_manual_record</v-icon>
          </template>
        </v-list-item>
      </template>

      <template v-slot:selection="{ item }">
        <img
          :src="getShopImagePath(item.raw.image, IMAGE_SIZE_SMALL)"
          class="rounded"
          height="24"
        />

        <span class="mx-2">{{ item.raw.title }}</span>

        <v-icon v-if="!item.raw.published" color="amber" title="Not published!"
          >warning
        </v-icon>

        <v-icon :color="item.raw.color">fiber_manual_record</v-icon>
      </template>
    </v-select>

    <div v-if="modern && landing_page_mode" class="b-shop-home-select-modern__manage">
      <v-btn
        :to="{ name: 'BPageShopPagesLandings' }"
        class="sd-modern-button sd-modern-button--small b-shop-home-select-modern__manage-button"
        variant="text"
      >
        <v-icon size="16" start>settings</v-icon>
        {{ $t('domains_modern.home.manage_pages') }}
        <v-icon size="16" end>{{ $t('icons.chevron_next') }}</v-icon>
      </v-btn>
    </div>

    <p v-if="modern" class="b-shop-home-select-modern__inherit-help">
      {{ $t(domain ? 'domains_modern.home.domain_scope' : 'domains_modern.home.default_scope') }}
    </p>

    <div v-if="clearable" :class="modern ? 'b-shop-home-select-modern__reset' : 'widget-buttons mt-5'">
      <v-btn
        :loading="busy_set && !home_page"
        :disabled="readOnly"
        :class="modern ? 'sd-modern-button sd-modern-button--small' : undefined"
        size="x-large"
        variant="outlined"
        @click="
          home_page = null;
          setHomePage();
        "
      >
        <v-icon start>restart_alt</v-icon>
        <template v-if="modern">{{ $t('domains_modern.home.use_default') }}</template>
        <template v-else>Clear <small>(Set shop default)</small></template>
      </v-btn>
      <p v-if="modern" class="b-shop-home-select-modern__inherit-help">
        {{ $t('domains_modern.home.default_help') }}
      </p>
    </div>
      </div>

      <aside v-if="modern" class="b-shop-home-select-modern__preview">
        <b-domain-storefront-preview
          :shop="shop"
          :address="domain?.domain || shop.domain || shop.name"
          :home="modernPreviewHome"
          :external="!!domain?.externally_hosted"
        />
      </aside>
    </div>
    <div v-if="modern" class="b-shop-home-select-modern__status" role="status" aria-live="polite">
      <v-progress-circular v-if="busy_set" indeterminate size="12" width="1.5" color="primary" />
      <span v-else class="sd-modern-status__dot"></span>
      {{ $t(readOnly ? 'domains_modern.home.read_only' : busy_set ? 'domains_modern.home.saving' : static_page_mode ? 'domains_modern.home.static_save_help' : 'domains_modern.home.auto_save') }}
    </div>
  </div>
</template>

<script lang="ts">
import UButtonFeature from "../../../../ui/button/feature/UButtonFeature.vue";
import { throttle } from "lodash-es";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import DomainMixin from "@selldone/components-vue/mixin/domain/DomainMixin.ts";
import BDomainStorefrontPreview from "../../../domain/workspace/BDomainStorefrontPreview.vue";

export default {
  name: "BShopHomeSelect",
  mixins: [DomainMixin],
  components: { UButtonFeature, BDomainStorefrontPreview },
  props: {
    shop: {
      required: false,
      type: Object,
    },
    domain: {
      // null: main shop home page
      type: Object,
    },
    clearable: {
      default: false,
      type: Boolean,
    },
    modern: {
      default: false,
      type: Boolean,
    },
    readOnly: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    busy_fetch: false,
    search: "",
    pages: [],

    home_page: null,
    old_page: null,
    busy_set: false,
  }),

  computed: {
    modernOptions() {
      return [
        { value: 'shop', title: this.$t('global.commons.store'), src: this.GetDomainHomeIcon('shop') },
        { value: 'avocado', title: this.$t('global.commons.avocado'), src: this.GetDomainHomeIcon('avocado'), route: 'BPageShopChannelAvocado', disabled: !this.shop.avocado?.enable, disabledHelp: this.$t('domains_modern.home.avocado_disabled') },
        { value: 'hyper', title: this.$t('global.commons.hyper'), src: this.GetDomainHomeIcon('hyper'), route: 'BPageShopChannelHyper', disabled: !this.shop.hyper?.enable, disabledHelp: this.$t('domains_modern.home.hyper_disabled') },
        { value: 'community', title: this.$t('global.commons.community'), src: this.GetDomainHomeIcon('community'), route: 'BPageShopCommunityTopics', disabled: !this.shop.community?.enable, disabledHelp: this.$t('domains_modern.home.community_disabled') },
        { value: 'blog', title: this.$t('global.commons.blog'), src: this.GetDomainHomeIcon('blog'), route: 'BPageShopBlogsList' },
        { value: 'map', title: this.$t('global.commons.map'), src: this.GetDomainHomeIcon('map'), route: 'BPageShopChannelMap' },
        { value: 'landing', title: this.$t('global.commons.landing_page'), src: this.GetDomainHomeIcon('1'), route: 'BPageShopPagesLandings', disabled: !this.pages.length, disabledHelp: this.$t('domains_modern.home.landing_disabled') },
        { value: 'static', title: this.$t('global.commons.static_page'), src: this.GetDomainHomeIcon('/'), route: 'BPageShopPagesStatic' },
      ];
    },
    selectedModernType() {
      return this.static_page_mode ? 'static' : this.landing_page_mode ? 'landing' : this.home_page || (this.clearable ? null : 'shop');
    },
    modernPreviewHome() {
      return this.home_page || (this.domain ? this.shop.home : null) || 'shop';
    },
    landing_page_mode() {
      return (
        this.home_page &&
        !this.static_page_mode &&
        !["blog", "avocado", "hyper", "community", "shop", "map"].includes(
          this.home_page,
        )
      );
    },

    static_page_mode() {
      return ("" + this.home_page)?.startsWith("/");
    },
  },

  created() {
    function isNumeric(value) {
      return /^\d+$/.test(value);
    }

    if (this.domain) {
      this.home_page = this.modern && this.domain.primary ? this.shop.home : this.domain.home;
    } else {
      this.home_page = this.shop.home;
    }
    if (isNumeric(this.home_page)) this.home_page = parseInt(this.home_page); // Fix select page by id (string save in database 'home' )

    this.old_page = this.home_page;
    this.fetchPages();
  },
  methods: {
    selectModernHome(option) {
      if (option.disabled || this.busy_set || this.readOnly) return;
      this.home_page = option.value === 'landing' ? this.pages[0].id : option.value === 'static' ? '/' : option.value;
      this.setHomePage();
    },
    fetchPages() {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_SHOP_PAGES(this.shop.id), {
          params: {
            offset: 0,
            limit: 100,
            search: this.search,
            compact: true,
          },
        })
        .then(({ data }) => {
          this.pages = data.pages;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
    setHomePage: throttle(function () {
      if (this.readOnly || this.busy_set) return;
      if (this.old_page === this.home_page) return;

      this.setHomePageNow();
    }, 1000),

    setHomePageNow() {
      if (this.readOnly || this.busy_set) return;
      const submittedHome = this.home_page;
      this.busy_set = true;

      axios
        .put(
          this.domain
            ? window.API.PUT_SHOP_DOMAIN_HOME_PAGE(
                this.shop.id,
                this.domain.domain,
              ) /* Other domains custom home page */
            : window.API.PUT_SHOP_HOME_PAGE(
                this.shop.id,
              ) /* Default shop home page */,
          {
            page_id: submittedHome,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.old_page = submittedHome;
            if (this.domain) {
              this.domain.home = data.home;

              // Update main home page if primary domain has been edited:
              if (this.domain.primary) {
                this.shop.home = data.home;
              }
            } else {
              this.shop.home = data.home;
            }

            NotificationService.showSuccessAlert(null, this.modern ? this.$t('domains_modern.home.saved') : "Home page successfully set up.");
          } else NotificationService.showErrorAlert(null, data.error_msg);
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-shop-home-select-modern {
  font-family: inherit;
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
  line-height: 21px;

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, .85fr);
    gap: 32px;
    padding-bottom: 25px;
  }

  &__controls,
  &__preview {
    min-width: 0;
  }

  &__domain-help {
    margin-bottom: 16px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
  }

  &__options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
    margin: 12px 0 22px;
  }

  &__option {
    display: flex;
    align-items: center;
    min-width: 0;
    min-height: 46px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));

    &.is-selected {
      border-color: rgb(var(--v-theme-primary));
      box-shadow: inset 0 0 0 .3px rgb(var(--v-theme-primary));
      background: var(--sd-modern-inset);
    }
  }

  &__choice-wrap {
    display: flex;
    flex: 1;
    align-self: stretch;
    min-width: 0;
  }

  &__choice {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 9px;
    min-width: 0;
    width: 100%;
    min-height: 44px;
    padding: 9px 11px;
    border-radius: 9px;
    font: inherit;
    font-size: 12px;
    line-height: 18px;
    text-align: start;

    > img {
      flex-shrink: 0;
      object-fit: contain;
    }

    &:disabled {
      opacity: .45;
    }

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }

  &__choice-dot {
    display: inline-block;
    flex: 0 0 13px;
    width: 13px;
    height: 13px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 50%;
    margin-inline-start: auto;
  }

  &__choice[aria-pressed="true"] &__choice-dot {
    border: 4px solid rgb(var(--v-theme-primary));
  }

  &__settings.sd-modern-icon-button {
    --sd-modern-icon-button-size: 32px;
    margin-inline-end: 5px;

    :deep(.v-icon) {
      font-size: 16px;
    }
  }

  &__field {
    margin: 0 0 7px;

    :deep(.v-field__input),
    :deep(input),
    :deep(.v-select__selection) {
      font-family: inherit;
      font-size: 13px;
      font-weight: 400;
      line-height: 21px;
    }

    :deep(.v-label) {
      font-size: 12px;
      font-weight: 500;
    }

    :deep(.v-messages) {
      font-size: 11px;
      line-height: 18px;
    }

    :deep(.v-select__selection) {
      min-width: 0;
      max-width: 100%;
      overflow-wrap: anywhere;
      white-space: normal;
    }
  }

  &__manage {
    margin: 4px 0 0;
  }

  &__path :deep(input) {
    direction: ltr;
    text-align: start;
  }

  &__manage-button.sd-modern-button {
    padding-inline: 0;
    font-size: 12px;
    line-height: 18px;
  }

  &__inherit-help {
    margin: 7px 0 0;
    font-size: 13px;
    line-height: 21px;
    color: var(--sd-modern-muted);
  }

  &__reset {
    margin-top: 18px;
  }

  &__preview {
    padding-inline-start: 30px;
    border-inline-start: 1px solid var(--sd-modern-border);
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-top: 16px;
    border-top: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }

  @media (max-width: 850px) {
    &__layout { gap: 22px; }
    &__preview { padding-inline-start: 22px; }
  }

  @media (max-width: 650px) {
    &__layout { grid-template-columns: minmax(0, 1fr); }
    &__preview { border-inline-start: 0; border-top: 1px solid var(--sd-modern-border); padding: 22px 0 0; }
    &__choice { padding-inline: 9px; }
  }

  @media (max-width: 599px), (pointer: coarse) {
    &__settings.sd-modern-icon-button { --sd-modern-icon-button-size: 44px; margin-inline-end: 0; }
    &__field :deep(.v-field__input), &__field :deep(input), &__field :deep(.v-select__selection) { font-size: 16px; }
    &__options { grid-template-columns: minmax(0, 1fr); }
    &__choice { min-height: 44px; }
  }
}
</style>
