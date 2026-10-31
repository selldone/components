<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div v-bind="$attrs" class="s-table-loading" :class="{ 'b-domains-list--modern text-start': modern, 'b-domains-list--refined sd-modern-widget': refinedView }" :aria-busy="busy_fetch">
    <template v-if="refinedView">
      <header v-if="showHeader" class="sd-modern-header b-domains-list__heading">
        <div class="sd-modern-title">
          <v-icon class="sd-modern-icon sd-modern-icon--plain" size="16">language</v-icon>
          <div>
            <h2 class="sd-modern-title-text">{{ $t('domains_modern.list.title') }}</h2>
            <div class="sd-modern-subtitle">
              {{ $t('domains_modern.list.subtitle') }}
              <v-btn icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('domains_modern.list.connection_help_label')">
                <v-icon size="14">info_outline</v-icon>
                <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ $t('domains_modern.list.connection_help') }}</v-tooltip>
              </v-btn>
            </div>
          </div>
        </div>
        <v-btn v-if="writeShopAccess(ShopPermissionRegions.SETTINGS.code)" class="sd-modern-button b-domains-list__add" color="primary" variant="flat" prepend-icon="add" @click="showAddDomainDialog">{{ $t('domains_modern.list.add') }}</v-btn>
      </header>

      <div class="sd-modern-list-toolbar b-domains-list__refined-toolbar">
        <div class="b-domains-list__main-address">
          <v-icon size="16">link</v-icon><span>{{ $t('domains_modern.list.main_address') }}</span><bdi dir="ltr">{{ shop.domain }}</bdi>
        </div>
        <v-text-field v-model="search" class="b-domains-list__search" :placeholder="$t('domains_modern.list.search')" :aria-label="$t('domains_modern.list.search')" clearable hide-details prepend-inner-icon="search" single-line variant="plain" />
      </div>
      <u-loading-progress v-if="busy_fetch" />

      <v-data-table-server
        v-model:expanded="expanded" v-model:options="options" v-model:page="page" v-model:sort-by="sortBy"
        :headers="refinedHeaders" :items="shop_domains" :items-length="totalItems" :items-per-page="itemsPerPage"
        :header-props="{ sortByText: $t('global.commons.sort_by') }" :mobile="$vuetify.display.width < 700"
        :hide-default-header="$vuetify.display.width < 700"
        :row-props="({ item }) => ({ class: ['sd-modern-clickable-item', { 'b-domains-list__returned': domainKey(item) === String(HIGHLIGHT_ID) }] })" :loading="busy_fetch"
        class="sd-modern-data-table b-domains-list__refined-table bg-transparent" density="compact" hide-default-footer item-value="url"
        @click:row="openDomainRow"
      >
        <template #item.url="{ item }">
          <div class="b-domains-list__address"><router-link :to="domainRoute(item)" class="b-domains-list__domain-link" @click.stop="cacheRouteState(domainKey(item))"><bdi dir="ltr">{{ item.url.replace(/^https?:\/\//, '') }}</bdi></router-link><BShopLicenseBlockIcon v-if="item.domain && !can_edit_domain(item.domain)" /></div>
          <div class="b-domains-list__meta"><v-icon v-if="item.primary" size="13">star_border</v-icon>{{ item.primary ? $t('domains_modern.list.primary') : item.official === 'local' ? $t('domains_modern.list.store_address') : item.domain?.externally_hosted ? $t('admin_shop.dashboard.info.table.externally_hosted') : 'HTTPS' }}</div>
        </template>
        <template #item.home="{ item }">
          <v-btn v-if="!item.official && !item.domain?.externally_hosted" class="b-domains-list__destination" variant="text" @click.stop="openDomain(item, 'BPageDomainStorefront')">
            <v-icon size="16">{{ item.primary || !item.domain.home ? 'home' : 'web' }}</v-icon>
            <span><span>{{ item.primary || !item.domain.home ? $t('domains_modern.list.store_default') : GetDomainHomeName(getCorrespondingHomePageValue(item)) }}</span><span class="b-domains-list__meta">{{ item.primary || !item.domain.home ? GetDomainHomeName(shop.home) : ('' + item.domain.home).startsWith('/') ? item.domain.home : $t('domains_modern.list.custom_home') }}</span></span>
          </v-btn>
          <div v-else class="b-domains-list__destination-static"><v-icon size="16">{{ item.domain?.externally_hosted ? 'open_in_new' : 'home' }}</v-icon><span>{{ item.domain?.externally_hosted ? $t('admin_shop.dashboard.info.table.externally_hosted') : $t('domains_modern.list.store_default') }}<span v-if="!item.domain?.externally_hosted" class="b-domains-list__meta">{{ GetDomainHomeName(shop.home) }}</span></span></div>
        </template>
        <template #item.connection="{ item }">
          <span class="sd-modern-status sd-modern-status--plain b-domains-list__connection"><span class="sd-modern-status__dot" :class="{ 'bg-warning': item.error || (!item.ssl && !item.domain?.externally_hosted), 'bg-success': item.ssl && !item.error && !item.domain?.externally_hosted && item.official !== 'local' }" />{{ item.domain?.externally_hosted ? $t('domains_modern.list.external') : item.error || !item.ssl ? $t('domains_modern.list.attention') : item.official === 'local' ? $t('domains_modern.list.store_address') : 'HTTPS' }}</span>
          <div v-if="item.approved !== undefined && !item.domain?.externally_hosted" class="b-domains-list__meta">{{ $t(item.error ? 'domains_modern.list.connection_error' : item.approved ? 'domains_modern.list.verified' : 'domains_modern.list.pending') }}</div>
        </template>
        <template #item.visibility="{ item }">
          <span class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot" :class="{ 'bg-success': item.enable }" />{{ $t(item.enable ? 'domains_modern.list.enabled' : 'domains_modern.list.disabled') }}</span>
          <div v-if="item.official !== 'local'" class="b-domains-list__meta">{{ $t(item.indexed ? 'domains_modern.list.index_allowed' : 'domains_modern.list.index_off') }}</div>
        </template>
        <template #item.actions="{ item, internalItem, isExpanded, toggleExpand }">
          <div class="b-domains-list__row-actions">
            <v-btn v-if="item.official !== 'local' && !item.url.includes('*')" :href="item.url" :disabled="!item.enable" target="_blank" rel="noopener noreferrer" icon variant="text" class="sd-modern-icon-button" :aria-label="$t('user_dashboard.shops.modern.open_in_new_tab')" @click.stop><v-icon size="16">north_east</v-icon><v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('user_dashboard.shops.modern.open_in_new_tab') }}</v-tooltip></v-btn>
            <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t('domains_modern.workspace.openSettings')" @click.stop="openDomain(item)"><v-icon size="16">settings</v-icon><v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('domains_modern.workspace.openSettings') }}</v-tooltip></v-btn>
            <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t(isExpanded(internalItem) ? 'domains_modern.workspace.hideDetails' : 'domains_modern.workspace.details')" :aria-expanded="isExpanded(internalItem)" @click.stop="toggleExpand(internalItem)"><v-icon size="16">{{ isExpanded(internalItem) ? 'expand_less' : 'expand_more' }}</v-icon><v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t(isExpanded(internalItem) ? 'domains_modern.workspace.hideDetails' : 'domains_modern.workspace.details') }}</v-tooltip></v-btn>
          </div>
        </template>
        <template #expanded-row="{ columns, item }">
          <tr class="b-domains-list__expanded"><td :colspan="columns.length">
            <section class="b-domains-list__details text-start">
              <div class="sd-modern-list-header">{{ $t('domains_modern.workspace.quickDetails') }}</div>
              <h3 class="b-domains-list__detail-title"><bdi dir="ltr">{{ item.domain?.domain || item.url }}</bdi></h3>
              <b-domain-flow-map
                :item="item" :shop="shop"
                :read-only="true"
                :busy-update="busy_update"
                :busy-repair="busy_add_client && add_client_code === (item.domain ? item.domain.id : item.official)"
                @edit-domain="openDomain(item, 'BPageDomainConnection')"
                @settings="openDomain(item, $event === 'ssl' ? 'BPageDomainConnection' : 'BPageDomainSettings', $event)"
                @home="openDomain(item, 'BPageDomainStorefront')"
                @default-home="openDomain(item, 'BPageDomainStorefront')"
                @sitemap="openDomain(item, 'BPageDomainSearch')"
                @repair="openDomain(item, 'BPageDomainSettings', 'oauth')"
              />
              <div class="b-domains-list__scopes">
                <v-tooltip v-for="scope in ['currencies', 'languages']" :key="scope"
                           location="top" open-on-focus :open-on-click="!item.domain || !writeShopAccess(ShopPermissionRegions.SETTINGS.code)" content-class="sd-modern-tooltip text-start">
                  <template #activator="{ props }">
                    <button v-bind="props" type="button" class="b-domains-list__scope-action"
                            :aria-label="$t(scope === 'currencies' ? 'domains_modern.map.currenciesLabel' : 'domains_modern.map.languagesLabel')"
                            @click.stop="openDomain(item, 'BPageDomainSettings', 'scope')">
                      <template v-if="scope === 'currencies'">
                        <span v-if="!item.domain?.currencies?.length">{{ $t('domains_modern.list.all_currencies') }}</span>
                        <span v-for="currency in item.domain?.currencies" :key="currency"><flag :iso="GetCurrency(currency)?.flag" :squared="false" /> {{ currency }}</span>
                      </template>
                      <template v-else>
                        <span v-if="!item.domain?.languages?.length">{{ $t('domains_modern.list.all_languages') }}</span>
                        <span v-for="language in item.domain?.languages" :key="language">{{ getLanguageName(language) }}</span>
                      </template>
                    </button>
                  </template>
                  {{ domainScopeHelp(item, scope) }}
                </v-tooltip>
                <span v-if="item.affiliate_id">{{ $t('global.commons.affiliate') }}</span>
              </div>
              <div v-if="item.error" class="sd-modern-notice b-domains-list__error" role="alert"><v-icon color="error" size="16">error_outline</v-icon><span>{{ item.error }}</span></div>
              <details v-if="item.domain || item.certificate" class="b-domains-list__advanced">
                <summary>{{ $t(item.domain?.externally_hosted ? 'domains_modern.map.externalAdvanced' : 'domains_modern.map.advanced') }}</summary>
                <div v-if="!item.domain?.externally_hosted && item.certificate" class="b-domains-list__certificate"><v-icon size="15">verified_user</v-icon><span>{{ item.certificate.Name }}</span><span>{{ getLocalDateString(item.certificate['Issue Date']) }} ~ {{ getLocalDateString(item.certificate['Expiry Date']) }}</span><span v-if="item.certificate['Expiry Date']?.convertToLocalDate(item.certificate['Expiry Date'])?.isBeforeToday()">{{ $t('domains_modern.list.expired') }}</span></div>
                <div v-if="!item.domain?.externally_hosted && item.domain" class="b-domains-list__meta">{{ $t(item.domain.ssl_proxy ? 'domains_modern.list.selldone_ssl' : 'domains_modern.list.external_ssl') }}</div>
              </details>
              <v-btn class="sd-modern-button sd-modern-button--inline mt-3" variant="text" @click.stop="openDomain(item)">{{ $t('domains_modern.workspace.openSettings') }}<v-icon size="16" end>{{ $t('icons.chevron_next') }}</v-icon></v-btn>
            </section>
          </td></tr>
        </template>
        <template #no-data><div class="sd-modern-empty-state"><v-icon size="22">language</v-icon><span>{{ $t('domains_modern.list.empty') }}</span></div></template>
        <template #bottom><div class="sd-modern-table-footer"><span class="sd-modern-page-summary">{{ $n(totalItems) }} {{ $t('commons.domains') }}</span><v-pagination v-model="page" :length="refinedPageCount" class="sd-modern-pagination" rounded /></div></template>
      </v-data-table-server>
    </template>
    <template v-else>
    <u-widget-header
      v-if="showHeader && !modern"
      :add-caption="$t('admin_shop.dashboard.info.add_domain')"
      :title="$t('admin_shop.dashboard.info.shop_domains')"
      icon="dns"
      @click:add="showAddDomainDialog"
      :disabled-access="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
    >
      <template v-slot:append-title> </template>
    </u-widget-header>
    <component
      :is="modern ? 'div' : 'v-list-subheader'"
      :class="{ 'b-domains-list__description sd-modern-subtitle': modern }"
      >{{ $t("domains.message") }}

    </component>
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <!-- █████████████████████████████ Search █████████████████████████████ -->

    <v-row
      align="center"
      no-gutters
      :class="{ 'b-domains-list__toolbar': modern }"
    >
      <v-spacer v-if="!modern"></v-spacer>
      <v-text-field
        v-model="search"
        :placeholder="$t('global.commons.search')"
        class="max-width-field"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      ></v-text-field>
      <v-btn
        v-if="modern && writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
        class="sd-modern-button"
        color="primary"
        variant="flat"
        prepend-icon="add"
        @click="showAddDomainDialog"
      >
        {{ $t("admin_shop.dashboard.info.add_domain") }}
        <v-tooltip
          activator="parent"
          location="top"
          open-on-focus
          content-class="sd-modern-tooltip text-start"
          >{{ $t("admin_shop.dashboard.info.add_domain") }}</v-tooltip
        >
      </v-btn>
    </v-row>

    <!-- █████████████████████████████ Domains █████████████████████████████ -->
    <div
      v-if="!modern && $vuetify.display.xs && !showHeader && !search"
      class="widget-buttons"
    >
      <v-btn
        color="primary"
        size="large"
        variant="text"
        @click="show_domains = !show_domains"
      >
        <v-icon :class="{ 'rotate-180': show_domains }" class="me-1"
          >expand_more
        </v-icon>
        {{
          show_domains
            ? $t("admin_shop.dashboard.info.hide_domains")
            : $t("admin_shop.dashboard.info.show_domains")
        }}
      </v-btn>
    </div>

    <v-data-table-server
      v-if="
        modern ||
        $vuetify.display.smAndUp ||
        show_domains ||
        showHeader ||
        search
      "
      v-model:expanded="expanded"
      expand-on-click
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :class="{
        'min-height-40vh': showHeader && !modern,
        'sd-modern-data-table b-domains-list__table': modern,
      }"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="shop_domains"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="$vuetify.display.xs"
      class="bg-transparent"
      density="compact"
      hide-default-footer
      item-value="url"
      show-expand
      :row-props="
        (_data) => {
          //  return { class: 'row-hover' };
        }
      "
    >
      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Headers ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:header.indexed="{}">
        <img
          class="me-1"
          src="../../../assets/trademark/google.svg"
          title="Google"
          width="12"
        />
        <img
          class="me-1"
          src="../../../assets/trademark/bing.svg"
          title="Bing"
          width="12"
        />
        <img
          class="me-1"
          src="../../../assets/trademark/yahoo.svg"
          title="Yahoo"
          width="12"
        />
        <img
          class="me-1"
          src="../../../assets/trademark/baidu.svg"
          title="Baidu"
          width="12"
        />
        <small class="d-block"
          >{{ $t("admin_shop.dashboard.info.table.and_more") }}
        </small>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Primary ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.primary="{ item }">
        <v-btn
          v-if="item.official !== 'local'"
          :color="modern ? 'on-surface' : item.primary ? 'amber' : '#999'"
          :class="{ 'sd-modern-icon-button': modern }"
          :aria-label="$t('admin_shop.dashboard.info.table.primary')"
          :aria-pressed="item.primary"
          :loading="busy_primary"
          icon
          title="Make this as main domain."
          variant="text"
          @click.stop="
            item.primary
              ? undefined
              : updateShopDomain(
                  'primary',
                  item.domain ? item.domain.domain : item.official,
                  !item.primary,
                )
          "
        >
          <v-icon v-if="item.primary">star</v-icon>
          <v-icon v-else>star_border</v-icon>
        </v-btn>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Home Page ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.home="{ item }">
        <div class="py-1">
          <v-btn
            v-if="
              !item.official && item.domain && !item.domain.externally_hosted
            "
            :title="`Set custom home page for ${item.domain.domain}`"
            :block="!modern"
            :size="modern ? undefined : 'large'"
            :variant="modern ? 'text' : 'elevated'"
            :color="modern ? undefined : '#000'"
            :class="{
              'sd-modern-button sd-modern-button--inline b-domains-list__home':
                modern,
            }"
            @click.stop="showSetHomeDialog(item.domain)"
          >
            <img
              :src="
                GetDomainHomeIcon(
                  item.primary || !item.domain.home
                    ? shop.home
                    : item.domain.home,
                )
              "
              class="me-2"
              :class="{ 'ms-n2': !modern }"
              height="24"
              width="24"
            />

            <div class="text-start" :class="{ 'min-width-100': !modern }">
              <span class="text-uppercase small d-block">{{
                GetDomainHomeName(getCorrespondingHomePageValue(item))
              }}</span>
              <div
                v-if="
                  getCorrespondingHomePageValue(item) &&
                  ('' + getCorrespondingHomePageValue(item)).startsWith('/')
                "
                class="small text-no-transform"
                title="Files location"
              >
                <v-icon class="me-1" size="small">storage</v-icon>
                {{ getCorrespondingHomePageValue(item) }}
              </div>

              <v-chip
                v-if="item.primary || !item.domain.home"
                class="tnt"
                label
                prepend-icon="home"
                style="margin-top: 2px"
                size="x-small"
                variant="text"
                >Default Home
              </v-chip>
            </div>
          </v-btn>
        </div>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Url ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.url="{ item }">
        <div class="py-2" dir="ltr">
          <u-text-copy-box
            :value="item.url"
            small
            small-width-mode
            text-start
            :color="modern ? 'on-surface' : '#000'"
            :background-color="modern ? 'transparent' : undefined"
            single-line
          >
            <template v-slot:prepend-value>
              <v-icon
                v-if="item.domain?.externally_hosted"
                :title="$t('admin_shop.dashboard.info.table.externally_hosted')"
                class="me-2"
                color="#673AB7"
                size="small"
              >
                open_in_new
              </v-icon>
              <v-icon
                v-else-if="item.ssl"
                class="me-2"
                color="success"
                size="small"
                title="Secure"
              >
                https
              </v-icon>
              <v-icon
                v-else
                class="me-2"
                size="small"
                title="Not secure! Issue SSL for this domain."
              >
                no_encryption_gmailerrorred
              </v-icon>
            </template>

            <template v-slot:append-value>
              <div class="mx-2 d-flex align-center justify-center">
                <v-chip
                  v-if="item.domain?.externally_hosted"
                  class="me-1 tnt"
                  :color="modern ? undefined : '#673AB7'"
                  label
                  prepend-icon="public"
                  size="x-small"
                  :variant="modern ? 'text' : 'flat'"
                >
                  {{ $t("admin_shop.dashboard.info.table.externally_hosted") }}
                </v-chip>

                <BShopLicenseBlockIcon
                  v-if="item.domain && !can_edit_domain(item.domain)"
                ></BShopLicenseBlockIcon>

                <div
                  v-if="item.error"
                  class="text-start"
                  :tabindex="modern ? 0 : undefined"
                >
                  <v-icon class="hover-scale-small" color="red"> error</v-icon>
                  <v-tooltip
                    activator="parent"
                    :color="modern ? undefined : '#111'"
                    :content-class="
                      modern ? 'sd-modern-tooltip text-start' : 'text-start'
                    "
                    :location="modern ? 'top' : 'bottom'"
                    :open-on-focus="modern"
                    :open-on-click="modern"
                    max-width="360"
                  >
                    <b class="d-block">Error</b>
                    <div v-html="item.error"></div>
                  </v-tooltip>
                </div>

                <v-icon
                  v-else-if="item.approved"
                  class="ms-2 float-end hover-scale-small"
                  color="success"
                  title="Domain are working fine."
                >
                  check_circle
                </v-icon>

                <span
                  v-else-if="item.approved !== undefined"
                  :tabindex="modern ? 0 : undefined"
                >
                  <v-icon class="hover-scale-small" color="amber">
                    hourglass_full
                  </v-icon>

                  <v-tooltip
                    activator="parent"
                    :color="modern ? undefined : '#111'"
                    :content-class="
                      modern ? 'sd-modern-tooltip text-start' : 'text-start'
                    "
                    :location="modern ? 'top' : 'bottom'"
                    :open-on-focus="modern"
                    :open-on-click="modern"
                  >
                    <div>Waiting...</div>
                  </v-tooltip>
                </span>
              </div>
            </template>
          </u-text-copy-box>
          <span
            v-if="modern && (item.error || item.approved !== undefined)"
            class="sd-modern-status sd-modern-status--plain b-domains-list__domain-status"
          >
            <v-icon
              :icon="
                item.error
                  ? 'error_outline'
                  : item.approved
                    ? 'check_circle_outline'
                    : 'schedule'
              "
              :color="item.error ? 'error' : undefined"
              size="14"
              aria-hidden="true"
            />
            {{
              $t(
                item.error
                  ? "admin_shop.dashboard.modern.domain_connection_error"
                  : item.approved
                    ? "admin_shop.dashboard.modern.domain_verified"
                    : "admin_shop.dashboard.modern.domain_verification_pending",
              )
            }}
          </span>
        </div>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Open ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.url_action="{ item }">
        <v-btn
          :disabled="!item.enable"
          :href="item.url"
          class="tnt"
          :class="{ 'sd-modern-button sd-modern-button--inline': modern }"
          color="primary"
          target="_blank"
          title="Open link"
          variant="text"
        >
          <v-icon size="small" start> open_in_new</v-icon>
          {{ $t("global.actions.view_live") }}
        </v-btn>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Site map ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.site_map="{ item }">
        <v-btn
          v-if="!item.domain?.externally_hosted"
          class="tnt"
          :class="{ 'sd-modern-button sd-modern-button--inline': modern }"
          color="primary"
          title="View site map url"
          variant="text"
          @click.stop="
            () => {
              sitemap_base_url = item.url;
              show_sitemap = true;
            }
          "
        >
          <v-icon class="rotate-180" size="small" start>alt_route</v-icon>
          {{ $t("admin_shop.dashboard.info.table.site_map") }}
        </v-btn>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Enable ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.enable="{ item }">
        <v-btn
          :loading="
            busy_update_param ===
            `enable-${item.domain ? item.domain.domain : item.official}`
          "
          icon
          variant="text"
          :class="{ 'sd-modern-icon-button': modern }"
          :aria-label="$t('admin_shop.dashboard.info.table.enable')"
          :aria-pressed="item.enable"
          @click.stop="
            updateShopDomain(
              'enable',
              item.domain ? item.domain.domain : item.official,
              !item.enable,
            )
          "
        >
          <v-icon v-if="item.enable" color="green">check</v-icon>
          <v-icon v-else color="red">block</v-icon>
        </v-btn>
      </template>
      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Indexed ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.indexed="{ item }">
        <div
          :title="
            item.official === 'local'
              ? 'Can not index local url!'
              : `Index by search engines : ${item.indexed}`
          "
          class="text-center"
        >
          <v-btn
            :class="{
              'disabled op-0-6': item.official === 'local',
              'sd-modern-icon-button': modern,
            }"
            :color="modern ? 'on-surface' : item.indexed ? 'green' : '#444'"
            :aria-label="$t('admin_shop.dashboard.info.table.indexed')"
            :aria-pressed="item.indexed"
            :loading="
              busy_update_param ===
              `indexed-${item.domain ? item.domain.domain : item.official}`
            "
            icon
            variant="text"
            @click.stop="
              updateShopDomain(
                'indexed',
                item.domain ? item.domain.domain : item.official,
                !item.indexed,
              )
            "
          >
            <v-icon v-if="item.indexed && item.official !== 'local'"
              >check
            </v-icon>
            <v-icon v-else>close</v-icon>
          </v-btn>
        </div>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Expanded Row ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            <div class="d-flex align-center py-1">
              <div
                class="flex-grow-1"
                :class="{ 'b-domains-list__metadata': modern }"
              >
                <v-chip
                  v-if="!item.domain?.home"
                  class=""
                  pill
                  size="x-small"
                  title="Same as main home!"
                  :variant="modern ? 'text' : 'flat'"
                  :color="modern ? undefined : '#fff'"
                  style="margin: 2px"
                  prepend-icon="home"
                >
                  {{ $t("global.commons.default") }}
                </v-chip>

                <v-chip
                  v-if="item.affiliate_id"
                  :title="'🛒 + 💲 ' + $t('global.commons.affiliate')"
                  class=""
                  pill
                  size="x-small"
                  :variant="modern ? 'text' : 'flat'"
                  :color="modern ? undefined : '#fff'"
                  style="margin: 2px"
                  prepend-icon="assignment_ind"
                >
                  Affiliate
                </v-chip>

                <!-- Currencies -->
                <v-chip
                  v-if="!item.domain?.currencies?.length"
                  size="x-small"
                  :color="modern ? undefined : '#fff'"
                  :variant="modern ? 'text' : 'flat'"
                  prepend-icon="all_inclusive"
                  style="margin: 2px"
                >
                  *.* All Currencies
                </v-chip>

                <v-chip
                  v-for="it in item.domain?.currencies"
                  :key="it"
                  size="x-small"
                  :color="modern ? undefined : '#fff'"
                  :variant="modern ? 'text' : 'flat'"
                  style="margin: 2px"
                >
                  <flag
                    :iso="GetCurrency(it)?.flag"
                    class="ms-n1 me-1"
                    :squared="false"
                  ></flag>

                  {{ it }}
                </v-chip>

                <!-- Languages -->
                <v-chip
                  v-if="!item.domain?.languages?.length"
                  size="x-small"
                  :color="modern ? undefined : '#fff'"
                  :variant="modern ? 'text' : 'flat'"
                  prepend-icon="translate"
                  style="margin: 2px"
                >
                  *.* All Languages
                </v-chip>
                <v-chip
                  v-for="it in item.domain?.languages"
                  :key="it"
                  size="x-small"
                  :color="modern ? undefined : '#fff'"
                  :variant="modern ? 'text' : 'flat'"
                  prepend-icon="translate"
                  style="margin: 2px"
                >
                  {{ getLanguageName(it) }}
                </v-chip>

                <v-chip
                  v-if="!item.domain?.externally_hosted && item.certificate"
                  class=""
                  pill
                  size="x-small"
                  title="Last SSL certificate issued by Selldone."
                  :variant="modern ? 'text' : 'flat'"
                  :color="modern ? undefined : '#fff'"
                  style="margin: 2px"
                  prepend-icon="verified_user"
                >
                  <b>{{ item.certificate.Name }}</b>
                  <span class="mx-2">|</span>
                  {{ getLocalDateString(item.certificate["Issue Date"]) }} ~
                  {{ getLocalDateString(item.certificate["Expiry Date"]) }}

                  <v-chip
                    v-if="
                      item.certificate['Expiry Date']
                        ?.convertToLocalDate(item.certificate['Expiry Date'])
                        ?.isBeforeToday()
                    "
                    class="ms-2 me-n2"
                    color="red"
                    prepend-icon="error"
                    size="x-small"
                    variant="text"
                    style="margin: 2px"
                  >
                    Expired
                  </v-chip>
                </v-chip>

                <v-chip
                  v-if="item.domain?.externally_hosted"
                  class=""
                  :color="modern ? undefined : '#673AB7'"
                  pill
                  prepend-icon="public"
                  size="x-small"
                  style="margin: 2px"
                  :variant="modern ? 'text' : 'flat'"
                >
                  {{ $t("admin_shop.dashboard.info.table.externally_hosted") }}
                </v-chip>
                <v-chip
                  v-else-if="item.domain?.ssl_proxy"
                  class=""
                  pill
                  size="x-small"
                  title="SSL certificate issued by Selldone with CDN protection."
                  :variant="modern ? 'text' : 'flat'"
                  :color="modern ? undefined : '#E64A19'"
                  style="margin: 2px"
                  prepend-icon="verified_user"
                >
                  🔒 Secure SSL (Selldone)
                </v-chip>
                <v-chip
                  v-else-if="item.domain"
                  class=""
                  pill
                  size="x-small"
                  title="SSL certificate issued by external CDN provider."
                  :variant="modern ? 'text' : 'flat'"
                  :color="modern ? undefined : '#673AB7'"
                  style="margin: 2px"
                  prepend-icon="verified_user"
                >
                  🔒️ External CDN / SSL
                </v-chip>
              </div>

              <v-spacer></v-spacer>
            </div>

            <div v-if="writeShopAccess(ShopPermissionRegions.SETTINGS.code)">
              <u-loading-progress
                v-if="
                  (busy_add_client &&
                    add_client_code ===
                      (item.domain ? item.domain?.id : item.official)) ||
                  busy_delete === item.domain?.id
                "
                class="py-2"
              >
              </u-loading-progress>

              <v-btn
                v-if="item.domain"
                @click="deleteShopDomain(item.domain)"
                prepend-icon="close"
                :loading="busy_delete === item.domain.id"
                :class="
                  modern
                    ? 'ma-1 sd-modern-button sd-modern-button--inline'
                    : 'ma-1 tnt border'
                "
                :variant="modern ? 'text' : 'elevated'"
                size="small"
              >
                {{ $t("global.actions.delete") }}
              </v-btn>

              <v-btn
                v-if="!item.domain?.externally_hosted"
                :loading="
                  busy_add_client &&
                  add_client_code ===
                    (item.domain ? item.domain.id : item.official)
                "
                :class="
                  modern
                    ? 'ma-1 sd-modern-button sd-modern-button--inline'
                    : 'ma-1 tnt border'
                "
                size="small"
                @click="
                  createClientSecret(
                    item.domain ? item.domain.id : item.official,
                  )
                "
                :variant="modern ? 'text' : 'elevated'"
                prepend-icon="build"
              >
                {{ $t("admin_shop.dashboard.info.table.auto_repair") }}
              </v-btn>

              <template v-if="item.domain">
                <v-btn
                  @click="showEditDomainDialog(item.domain)"
                  prepend-icon="edit"
                  :class="
                    modern
                      ? 'ma-1 sd-modern-button sd-modern-button--inline'
                      : 'ma-1 tnt border'
                  "
                  :variant="modern ? 'text' : 'elevated'"
                  size="small"
                >
                  Edit Domain
                </v-btn>

                <v-btn
                  :class="
                    modern
                      ? 'ma-1 sd-modern-button sd-modern-button--inline'
                      : 'ma-1 tnt'
                  "
                  size="small"
                  :variant="modern ? 'text' : 'elevated'"
                  @click="showSetting(item.domain)"
                  prepend-icon="settings"
                >
                  {{ $t("global.commons.setting") }}
                </v-btn>
              </template>
            </div>
          </td>
        </tr>
        <tr v-if="item.error">
          <td :colspan="columns.length">
            <v-icon class="me-1" color="red">error</v-icon>
            {{ item.error }}
          </td>
        </tr>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Pagination ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:bottom>
        <div v-if="modern" class="sd-modern-table-footer">
          <span class="sd-modern-page-summary">{{ $t("global.commons.page") }} <bdi>{{ $n(pageCount ? page : 0) }} / {{ $n(pageCount) }}</bdi></span>
          <v-pagination v-model="page" :length="pageCount" class="sd-modern-pagination" rounded />
        </div>
        <v-pagination
          v-else
          v-model="page"
          :length="pageCount"
          rounded
        />
      </template>
    </v-data-table-server>

    <div v-if="!showHeader && !modern" class="widget-buttons">
      <v-btn block color="primary" size="x-large" @click="showAddDomainDialog">
        <v-icon start>add</v-icon>
        <div>
          {{ $t("admin_shop.dashboard.info.add_domain") }}
          <div class="small">https://mybusinessname.com</div>
        </div>
      </v-btn>
    </div>

    <component
      :is="modern ? 'div' : 'v-list-subheader'"
      :class="{ 'b-domains-list__footer': modern }"
    >
      <span v-if="modern">{{ totalItems }} {{ $t("commons.domains") }} · </span>
      <v-icon>domain</v-icon>
      {{ $t("commons.main_domain") }}: {{ shop.domain }}
    </component>
    </template>
  </div>

  <!-- ██████████████████████ Sitemap Dialog ██████████████████████ -->

  <v-dialog
    v-if="shop"
    v-model="show_sitemap"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-text>
        <shop-site-map
          :base-url="sitemap_base_url"
          :shop="shop"
        ></shop-site-map>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="show_sitemap = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ██████████████████████ Set Domain Dialog ██████████████████████ -->

  <v-dialog
    v-if="shop"
    v-model="dialog_set_domain"
    :fullscreen="!refinedView || !selected_shop_domain?.id"
    :max-width="refinedView && selected_shop_domain?.id ? 760 : undefined"
    scrollable
    transition="dialog-bottom-transition"
  >
    <b-domain-add
      v-if="dialog_pre"
      :domain="selected_shop_domain"
      :shop="shop"
      :modern="refinedView"
      @add="(val) => AddOrUpdateItemByID(domains, val)"
      @update="(val) => AddOrUpdateItemByID(domains, val)"
      @click:close="dialog_set_domain = false"
    ></b-domain-add>
  </v-dialog>

  <!-- ██████████████████████ Set custom home page for domains ██████████████████████ -->

  <v-dialog
    v-if="selected_domain"
    v-model="dialog_set_home"
    :fullscreen="!refinedView"
    :max-width="refinedView ? 1040 : undefined"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start" :class="{ 'b-domains-list__home-dialog sd-modern-widget': refinedView }">
      <v-card-title class="d-flex align-center">
        <img
          :height="24"
          class="me-2"
          src="../../../assets/icons/home.svg"
          width="auto"
        />
        {{ refinedView ? $t('domains_modern.list.home_for_domain') : 'Page' }}
        <v-icon class="mx-1">{{ $t("icons.chevron_next") }}</v-icon>
        {{ selected_domain ? selected_domain.domain : "" }}
      </v-card-title>
      <v-card-subtitle class="text-start mt-0">
        {{ $t(refinedView ? 'domains_modern.list.home_help' : "admin_shop.dashboard.info.set_home_dialog.title") }}
      </v-card-subtitle>

      <v-card-text>
        <div :class="refinedView ? 'b-domains-list__home-picker' : 'widget-box -large mb-5'">
          <b-shop-home-select
            v-if="dialog_set_home"
            :domain="selected_domain"
            :shop="shop"
            :modern="refinedView"
            :read-only="refinedView && !writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
            clearable
          ></b-shop-home-select>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn :size="refinedView ? undefined : 'x-large'" :class="{ 'sd-modern-button': refinedView }" variant="text" @click="dialog_set_home = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ██████████████████████ Dialog > Setting ██████████████████████ -->

  <v-dialog
    v-model="show_setting"
    :fullscreen="!refinedView"
    :max-width="refinedView ? 1040 : undefined"
    scrollable
    transition="dialog-bottom-transition"
    @after-enter="focusFlowSetting"
    @after-leave="setting_section = null"
  >
    <b-domain-setting
      v-if="selected_domain"
      ref="domainSetting"
      :domain="selected_domain"
      :shop="shop"
      :modern="refinedView"
      @click:close="show_setting = false"
    >
    </b-domain-setting>
  </v-dialog>
</template>

<script lang="ts">
import ShopSiteMap from "../../sitemap/ShopSiteMap.vue";

import { DomainsHelper } from "@selldone/core-js/helper/domain/DomainsHelper";
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";
import BShopLicenseBlockIcon from "../../shop/license/block/icon/BShopLicenseBlockIcon.vue";
import BShopHomeSelect from "../../shop/home/select/BShopHomeSelect.vue";
import BDomainAdd from "../add/BDomainAdd.vue";
import BDomainSetting from "../../domain/setting/BDomainSetting.vue";
import { throttle } from "lodash-es";
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import DomainMixin from "@selldone/components-vue/mixin/domain/DomainMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import UMenuExpandable from "@selldone/components-vue/ui/menu/expandable/UMenuExpandable.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";
import BDomainFlowMap from "./BDomainFlowMap.vue";
import { RouteMixin } from "@selldone/components-vue/mixin/route/RouteMixin.ts";

export default {
  name: "BDomainsList",
  emits: ['show-default-home'],
  mixins: [DateMixin, DomainMixin, CurrencyMixin, RouteMixin],

  components: {
    BDomainFlowMap,
    ULoadingProgress,
    UMenuExpandable,
    UTextCopyBox,
    BDomainSetting,
    BDomainAdd,
    BShopHomeSelect,
    BShopLicenseBlockIcon,
    ShopSiteMap,
  },
  props: {
    modern: { type: Boolean, default: false },
    refined: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    showHeader: {
      // true: Shop setting tab mode!     false: Dashboard domains widget mode!
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    expanded: [],
    domains: [],
    page: 1,
    pageCount: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    search: null,
    sortBy: [{ key: null, order: "desc" }],

    busy_fetch: false,

    //----------------------------------

    dialog_set_domain: false,
    dialog_pre: false,

    selected_shop_domain: {},
    busy_update: false,

    busy_add_client: false,
    add_client_code: null,

    // ------------ Site map ------------
    show_sitemap: false,
    sitemap_base_url: null,

    busy_primary: false,
    busy_update_param: null,

    show_domains: false,

    //---------------------------------
    dialog_set_home: false,
    selected_domain: null,

    //---------------------------------
    busy_delete: null,

    //---------------------------------
    show_setting: false,
    setting_section: null,
  }),

  computed: {
    refinedView() { return this.modern && this.refined; },
    refinedPageCount() {
      // Hosted addresses are added only to the first unfiltered page, outside the server's custom-domain limit.
      const customDomains = this.totalItems - (this.show_subdomains ? 2 : 0);
      return Math.max(1, Math.ceil(customDomains / this.itemsPerPage));
    },
    refinedHeaders() {
      return [
        { title: this.$t('domains_modern.list.domain'), key: 'url', value: 'url', sortable: false },
        { title: this.$t('domains_modern.list.home'), key: 'home', value: 'home', sortable: false, width: '23%' },
        { title: this.$t('domains_modern.list.connection'), key: 'connection', value: 'connection', sortable: false, width: '18%' },
        { title: this.$t('domains_modern.list.visibility'), key: 'visibility', value: 'visibility', sortable: false, width: '15%' },
        { title: '', key: 'actions', value: 'actions', sortable: false, width: '168px', align: 'end' },
      ];
    },
    ShopPermissionRegions() {
      return ShopPermissionRegions;
    },
    headers() {
      return [
        {
          title: this.$t("admin_shop.dashboard.info.table.primary"),
          align: "center",
          value: "primary",
          sortable: false,
          width: 40,
        },
        {
          title: this.$t("global.commons.page"),
          align: "center",
          value: "home",
          sortable: false,
        },
        {
          title: this.$t("admin_shop.dashboard.info.table.url"),
          align: "start",
          value: "url",
          sortable: false,
        },
        {
          align: "center",
          value: "url_action",
          sortable: false,
        },

        {
          title: "",
          align: "start",
          value: "site_map",
          sortable: false,
        },
        {
          title: this.$t("admin_shop.dashboard.info.table.enable"),
          align: "center",
          value: "enable",
          sortable: false,
        },
        {
          title: this.$t("admin_shop.dashboard.info.table.indexed"),
          align: "center",
          value: "indexed",
          sortable: false,
          class: "pa-0",
        },
      ];
    },
    show_subdomains() {
      return this.page === 1 && !this.search;
    },

    shop_domains() {
      return DomainsHelper.GetShopDomains(
        this.shop,
        this.domains,
        this.show_subdomains,
      );
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchDomains(page, sortBy[0]?.key, sortBy[0]?.order);
      },
      deep: true,
    },

    search: throttle(function (newVal, oldVal) {
      // console.log("this.options", this.options);
      const { sortBy, page, itemsPerPage } = this.options;
      this.page = 1;
      this.fetchDomains(
        1,
        sortBy ? sortBy[0]?.key : null,
        (sortBy ? sortBy[0]?.order : null) === "desc",
      );
    }, window.SERACH_THROTTLE),
  },
  mounted() {},
  methods: {
    domainKey(item) {
      return String(item.domain?.id || item.official);
    },
    domainRoute(item, name = 'BPageDomainOverview', section = null) {
      return { name, params: { shop_id: this.shop.id, domain_key: this.domainKey(item) }, query: section ? { section } : {} };
    },
    openDomain(item, name = 'BPageDomainOverview', section = null) {
      this.cacheRouteState(this.domainKey(item));
      return this.$router.push(this.domainRoute(item, name, section));
    },
    openDomainRow(event, { item }) {
      if (event.target?.closest('a,button,input,select,textarea,summary')) return;
      this.openDomain(item);
    },
    updateFlowDomain(item, change) {
      if (!this.writeShopAccess(ShopPermissionRegions.SETTINGS.code) || this.busy_update) return;
      if (!['enable', 'indexed', 'primary'].includes(change?.param) || typeof change.value !== 'boolean') return;
      if (item.official === 'local' && change.param !== 'enable') return;
      if (change.param === 'primary' && (!change.value || item.primary)) return;
      this.updateShopDomain(change.param, item.domain ? item.domain.domain : item.official, change.value);
    },
    handleFlowAction(item, action, section = null) {
      if (action === 'sitemap') {
        if (!item.domain?.externally_hosted) {
          this.sitemap_base_url = item.url;
          this.show_sitemap = true;
        }
        return;
      }
      if (action === 'default-home') {
        if (!item.domain) this.$emit('show-default-home');
        return;
      }
      if (!this.writeShopAccess(ShopPermissionRegions.SETTINGS.code)) return;
      if (action === 'home' && item.domain && !item.domain.externally_hosted) this.showSetHomeDialog(item.domain);
      else if (action === 'edit-domain' && item.domain) this.showEditDomainDialog(item.domain);
      else if (action === 'settings' && item.domain) this.showFlowSetting(item.domain, section);
      else if (action === 'repair' && !item.domain?.externally_hosted && !this.busy_add_client) {
        this.createClientSecret(item.domain ? item.domain.id : item.official);
      }
    },
    showFlowSetting(domain, section = null) {
      this.setting_section = ['languages', 'currencies', 'ssl'].includes(section) ? section : null;
      this.showSetting(domain);
    },
    focusFlowSetting() {
      if (this.refinedView && this.setting_section) this.$refs.domainSetting?.focusSection(this.setting_section);
    },
    domainScopeHelp(item, scope) {
      const currency = scope === 'currencies';
      if (!item.domain) return this.$t(currency ? 'domains_modern.map.officialCurrencyHelp' : 'domains_modern.map.officialLanguageHelp');
      if (!this.writeShopAccess(ShopPermissionRegions.SETTINGS.code)) return this.$t(currency ? 'domains_modern.map.currencyScopeReadOnlyHelp' : 'domains_modern.map.languageScopeReadOnlyHelp');
      return this.$t(currency ? 'domains_modern.map.currencyScopeHelp' : 'domains_modern.map.languageScopeHelp');
    },
    fetchDomains(page, sortBy, sortDesc = true) {
      this.busy_fetch = true;
      const search = this.search;

      axios
        .get(window.API.GET_SHOP_DOMAINS(this.$route.params.shop_id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,

            search,
          },
        })
        .then(({ data }) => {
          this.totalItems = data.total + (this.show_subdomains ? 2 : 0);
          this.domains = data.domains;
          // Refresh the shared primary-first snapshot only from a complete, unfiltered list.
          if (page === 1 && !search && data.total === data.domains.length) {
            this.shop.domains = [...data.domains].sort(
              (a, b) =>
                Number(b.primary) - Number(a.primary) ||
                Number(b.enable) - Number(a.enable) ||
                Number(b.approved) - Number(a.approved),
            );
          }
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    can_edit_domain(domain) {
      return Eligible.CanEditDomain(this.shop, domain.id);
    },

    createClientSecret(domain_id) {
      this.busy_add_client = true;
      this.add_client_code = domain_id;

      axios
        .post(window.API.POST_CREATE_CLIENT_FOR_DOMAIN(this.shop.id, domain_id))
        .then(({ data }) => {
          if (!data.error) {
            if (domain_id !== "local" && domain_id !== "sub")
              // Custom domain repair client!

              NotificationService.showSuccessAlert(null, data.message);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add_client = false;
          this.add_client_code = null;
        });
    },

    showAddDomainDialog() {
      this.selected_shop_domain = {};

      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => {
          this.dialog_set_domain = true;
        });
      });
    },

    showEditDomainDialog(domain) {
      this.selected_shop_domain = domain;

      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => {
          this.dialog_set_domain = true;
        });
      });
    },

    updateShopDomain(param, domain, value) {
      this.busy_update = true;

      if (param === "primary") this.busy_primary = true;
      else this.busy_update_param = param + "-" + domain;

      axios
        .put(window.API.PUT_EDIT_DOMAIN(this.shop.id, domain, param), {
          value: value,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              this.$t("global.notification.confirm"),
              this.$t("admin_shop.dashboard.info.notification.update_message"),
            );
            //Reset all other primary domains:
            if (param === "primary") {
              this.shop.domains.forEach((item) => {
                item.primary = false;
              });
              if (this.shop.local) this.shop.local.primary = false;
              if (this.shop.sub) this.shop.sub.primary = false;
            }

            if (data.domain) {
              this.AddOrUpdateItemByID(this.shop.domains, data.domain);
              this.UpdateItemByID(this.domains, data.domain);
            } else if (data.local) this.shop.local = data.local;
            else if (data.sub) this.shop.sub = data.sub;

            this.dialog_set_domain = false;
          } else {
            NotificationService.showErrorAlert(
              this.$t("global.notification.error"),
              data.error_msg,
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update = false;
          if (param === "primary") this.busy_primary = false;
          else this.busy_update_param = null;
        });
    },

    //------------------------------------------------------------
    showSetHomeDialog(domain) {
      this.dialog_set_home = true;
      this.selected_domain = domain;
    },

    //▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Delete Domain ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅

    deleteShopDomain(domain) {
      NotificationService.openDangerAlert(
        this.$t("admin_shop.dashboard.info.alert.title"),
        this.$t("admin_shop.dashboard.info.alert.message"),
        this.$t("global.actions.delete"),
        () => {
          this.busy_delete = domain.id;

          axios
            .delete(window.API.DELETE_EDIT_DOMAIN(this.shop.id, domain.domain))
            .then(({ data }) => {
              if (!data.error) {
                NotificationService.showSuccessAlert(
                  this.$t("admin_shop.dashboard.info.alert.title"),
                  this.$t(
                    "admin_shop.dashboard.info.notification.delete_domain_message",
                  ),
                );
                this.DeleteItemByID(this.shop.domains, data.id);
                this.DeleteItemByID(this.domains, data.id);
              } else {
                NotificationService.showErrorAlert(
                  this.$t("global.notification.error"),
                  data.error_msg,
                );
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = null;
            });
        },
      );
    },

    //▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Domain Setting ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅

    showSetting(domain) {
      this.selected_domain = null;
      this.$nextTick(() => {
        this.selected_domain = domain;
        this.show_setting = true;
      });
    },

    getCorrespondingHomePageValue(item) {
      return item.primary || !item.domain.home
        ? this.shop.home
        : item.domain.home;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-domains-list__home-dialog {
  &.sd-modern-widget { padding: 0; }
  border-radius: 18px;
  > .v-card-title { padding: 22px 25px 8px; font-size: 18px; font-weight: 500; line-height: 26px; white-space: normal; }
  > .v-card-subtitle { padding-inline: 25px; font-size: 13px; line-height: 21px; white-space: normal; }
  > .v-card-text { padding: 22px 25px; }
  > .v-card-actions { padding: 0 25px 20px; }
  .widget-buttons { display: flex; justify-content: flex-end; }
  .widget-buttons .v-btn { flex: 0 1 auto; min-height: 38px; font-size: 12px; }
  @media (max-width: 600px) {
    > .v-card-title { padding-inline: 16px; }
    > .v-card-subtitle { padding-inline: 16px; }
    > .v-card-text { padding: 18px 16px; }
    .widget-buttons .v-btn { min-height: 44px; }
  }
}
.b-domains-list--refined {
  padding: 25px;
  border-radius: 18px;
  .b-domains-list__heading { margin-block-end: 22px; gap: 18px; }
  .sd-modern-title { align-items: flex-start; gap: 10px; }
  .sd-modern-title > .v-icon { margin-block-start: 5px; }
  .sd-modern-title-text { font-size: 18px; font-weight: 500; line-height: 26px; letter-spacing: -.1px; }
  .sd-modern-subtitle { margin-block-start: 3px; font-size: 13px; font-weight: 400; line-height: 21px; }
  .b-domains-list__add { height: 38px; min-height: 38px; font-size: 12px; line-height: 18px; padding-inline: 16px; border-radius: 10px; }
  .b-domains-list__refined-toolbar { padding-block: 0 14px; margin-block-end: 0; }
  .b-domains-list__main-address { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; min-width: 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  .b-domains-list__main-address bdi { color: rgb(var(--v-theme-on-surface)); overflow-wrap: anywhere; }
  .b-domains-list__search { max-width: 210px; min-width: 140px; margin-inline-start: auto; }
  .b-domains-list__search :deep(.v-field__input) { font-size: 13px; line-height: 20px; }
  .b-domains-list__refined-table { --v-table-header-height: 39px; width: 100%; }
  .b-domains-list__refined-table :deep(.v-table__wrapper) { overflow: visible; }
  .b-domains-list__refined-table :deep(table) { width: 100%; table-layout: fixed; }
  .b-domains-list__refined-table :deep(thead th) { padding: 15px 12px 9px !important; }
  .b-domains-list__refined-table :deep(tbody > tr:not(.b-domains-list__expanded) > td) { padding: 15px 12px !important; font-size: 12px; font-weight: 400; line-height: 19px; }
  .b-domains-list__address { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; line-height: 20px; min-width: 0; overflow-wrap: anywhere; }
  .b-domains-list__meta { display: flex; align-items: center; gap: 5px; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 17px; overflow-wrap: anywhere; }
  .b-domains-list__destination, .b-domains-list__destination-static { display: flex; align-items: flex-start; gap: 7px; font-size: 12px; font-weight: 400; line-height: 19px; text-align: start; min-width: 0; }
  .b-domains-list__destination { height: auto; min-height: 38px; border-radius: 8px; padding: 0; text-transform: none; letter-spacing: 0; white-space: normal; }
  .b-domains-list__destination :deep(.v-btn__content) { white-space: normal; justify-content: flex-start; gap: 7px; text-align: start; min-width: 0; }
  .b-domains-list__destination .v-icon, .b-domains-list__destination-static > .v-icon { margin-block-start: 2px; color: var(--sd-modern-muted); }
  .b-domains-list__connection { white-space: normal; }
  .b-domains-list__row-actions { --sd-modern-icon-button-size: 32px; display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
  .b-domains-list__domain-link { color: inherit; text-decoration: none; }
  .b-domains-list__domain-link:hover { text-decoration: underline; }
  .b-domains-list__returned { background: rgba(var(--v-theme-primary), .04); }
  .b-domains-list__expanded > td { padding: 0 !important; }
  .b-domains-list__details { max-width: 760px; margin: 8px auto; padding: 24px; background: rgb(var(--v-theme-surface)); border: 1px solid var(--sd-modern-border); border-radius: 20px; }
  .b-domains-list__detail-title { margin-block: 5px 0; font-size: 16px; font-weight: 500; line-height: 24px; overflow-wrap: anywhere; }
  .b-domains-list__scopes { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 16px; margin-block-start: 18px; padding-block-start: 17px; border-block-start: 1px solid var(--sd-modern-border); font-size: 11px; font-weight: 400; line-height: 17px; color: var(--sd-modern-muted); }
  .b-domains-list__scope-action { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 8px; min-height: 28px; padding: 0; border: 0; border-radius: 4px; background: transparent; color: inherit; font: inherit; text-align: start; }
  .b-domains-list__scope-action > span { display: inline-flex; align-items: center; gap: 4px; }
  .b-domains-list__scope-action[aria-disabled="true"] { cursor: default; }
  .b-domains-list__scope-action:not([aria-disabled="true"]):hover { color: rgb(var(--v-theme-primary)); text-decoration: underline; }
  .b-domains-list__scope-action:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; }
  .b-domains-list__advanced { margin-block-start: 17px; padding-block-start: 16px; border-block-start: 1px solid var(--sd-modern-border); font-size: 12px; font-weight: 400; line-height: 19px; }
  .b-domains-list__advanced > summary { min-height: 28px; color: var(--sd-modern-muted); }
  .b-domains-list__certificate { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-block-start: 15px; font-size: 11px; line-height: 18px; }
  .b-domains-list__error { display: flex; align-items: flex-start; gap: 8px; margin-block-start: 15px; font-size: 12px; line-height: 19px; }
  .b-domains-list__critical { margin-block-start: 16px; font-size: 12px; line-height: 19px; }
  .b-domains-list__critical p { margin-block: 10px; color: var(--sd-modern-muted); }
  .sd-modern-empty-state { padding-block: 40px; }
  .sd-modern-table-footer { padding-block: 16px 0; }
  @media (max-width: 699px) {
    padding: 20px 15px;
    .b-domains-list__heading { flex-direction: column; align-items: stretch; gap: 14px; }
    .b-domains-list__refined-toolbar { flex-direction: column; align-items: stretch; }
    .b-domains-list__search { width: 100%; max-width: none; margin-inline-start: 0; }
    .b-domains-list__refined-table :deep(table) { table-layout: auto; }
    .b-domains-list__refined-table :deep(.v-data-table__tr--mobile) { display: grid; grid-template-columns: minmax(0, 1fr); padding-inline: 12px; }
    .b-domains-list__refined-table :deep(tbody > tr:not(.b-domains-list__expanded) > td) { padding: 10px 0 !important; }
    .b-domains-list__refined-table :deep(.v-data-table__td-value) { min-width: 0; max-width: 100%; }
    .b-domains-list__details { padding: 18px 13px; border-radius: 16px; }
    .b-domains-list__scope-action, .b-domains-list__advanced > summary { min-height: 44px; }
    .b-domains-list__add { min-height: 44px; align-self: flex-start; }
    .b-domains-list__search :deep(.v-field__input) { font-size: 16px; }
  }
  @media (pointer: coarse) {
    .b-domains-list__scope-action, .b-domains-list__advanced > summary { min-height: 44px; }
  }
}
.b-domains-list--modern {
  min-width: 0;
  font-weight: 400;

  .b-domains-list__description {
    margin-block: 0 16px;
  }

  .b-domains-list__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px 20px;
    margin-block-end: 16px;
  }

  .b-domains-list__toolbar .max-width-field {
    width: min(100%, 280px);
    flex: 1 1 180px;
  }

  .b-domains-list__home {
    height: auto;
    min-height: 36px;
    padding-block: 6px;
    line-height: 1.45;
    white-space: normal;
  }

  .b-domains-list__home :deep(.v-btn__content) {
    min-width: 0;
    white-space: normal;
  }

  .b-domains-list__home .small {
    font-size: 11px;
    font-weight: 400;
  }

  .b-domains-list__table :deep(.v-table__wrapper) {
    max-width: 100%;
  }

  .b-domains-list__table :deep(th),
  .b-domains-list__table :deep(td) {
    padding-inline: 10px;
  }

  .b-domains-list__table :deep(td) {
    font-size: 12px;
    font-weight: 400;
    line-height: 1.55;
  }

  .b-domains-list__table :deep(th) {
    height: 44px;
  }

  .b-domains-list__domain-status {
    display: flex;
    gap: 5px;
    margin-block-start: 5px;
    font-size: 11px;
    font-weight: 400;
  }

  .b-domains-list__metadata {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 10px;
    padding-block: 12px;
  }

  .b-domains-list__metadata :deep(.v-chip) {
    height: auto;
    min-height: 28px;
    padding: 4px 6px;
    font-size: 11px;
    font-weight: 400;
    white-space: normal;
  }

  .b-domains-list__metadata b {
    font-weight: 400;
  }

  .b-domains-list__footer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-start: 16px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    overflow-wrap: anywhere;
  }

  @media (max-width: 600px) {
    .b-domains-list__home {
      min-height: 44px;
    }

    .b-domains-list__table :deep(.v-data-table__td-value) {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .b-domains-list__metadata {
      gap: 4px;
    }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>
