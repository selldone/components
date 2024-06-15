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
  <div v-bind="$attrs">
    <s-widget-header
      v-if="showHeader"
      :add-caption="$t('admin_shop.dashboard.info.add_domain')"
      :title="$t('admin_shop.dashboard.info.shop_domains')"
      icon="dns"
      @click:add="showAddDomainDialog"
      :disabled-access="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
    >
      <template v-slot:append-title>
        <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ In App Help (Help Center) ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
        <inline-help
          :code="HelpCenterCode.SHOP_DOMAINS_ADD"
          class="mx-2"
        ></inline-help>
        <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
      </template>
    </s-widget-header>
    <v-list-subheader>{{ $t("domains.message") }}</v-list-subheader>
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <!-- █████████████████████████████ Search █████████████████████████████ -->

    <v-row align="center" no-gutters>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        :label="$t('global.commons.search')"
        class="max-width-field"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      ></v-text-field>
    </v-row>

    <!-- █████████████████████████████ Domains █████████████████████████████ -->
    <div
      v-if="$vuetify.display.xs && !showHeader && !search"
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
      v-if="$vuetify.display.smAndUp || show_domains || showHeader || search"
      v-model:expanded="expanded"
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :class="{ 'min-height-40vh': showHeader }"
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
    >
      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Primary ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.primary="{ item }">
        <v-btn
          v-if="item.official !== 'local'"
          :color="item.primary ? 'amber' : '#999'"
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

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Url ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.url="{ item }">
        <div class="py-2" dir="ltr">
          <u-text-copy-box :value="item.url" small small-width-mode text-start>
            <template v-slot:prepend-value>
              <v-icon
                v-if="item.ssl"
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
                <BShopLicenseBlockIcon
                  v-if="item.domain && !can_edit_domain(item.domain)"
                ></BShopLicenseBlockIcon>

                <div v-if="item.error" class="text-start">
                  <v-icon class="hover-scale-small" color="red"> error</v-icon>
                  <v-tooltip
                    activator="parent"
                    color="#111"
                    content-class="text-start"
                    location="bottom"
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

                <span v-else-if="item.approved !== undefined">
                  <v-icon class="hover-scale-small" color="amber">
                    hourglass_full
                  </v-icon>

                  <v-tooltip
                    activator="parent"
                    color="#111"
                    content-class="text-start"
                    location="bottom"
                  >
                    <div>Waiting...</div>
                  </v-tooltip>
                </span>
              </div>
            </template>
          </u-text-copy-box>
        </div>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Expanded Row ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="3">
            <v-chip
              v-if="!item.domain?.home"
              class="ma-1"
              pill
              size="small"
              title="Same as main home!"
              variant="flat"
              color="#000"
            >
              <v-icon start>home</v-icon>
              {{ $t("global.commons.default") }}
            </v-chip>

            <v-chip
              v-if="item.affiliate_id"
              :title="'🛒 + 💲 ' + $t('global.commons.affiliate')"
              class="ma-1"
              pill
              size="small"
              variant="flat"
              color="#000"
            >
              <v-icon start> assignment_ind</v-icon>
              Affiliate
            </v-chip>
            <br />

            <v-chip
              v-if="item.certificate"
              class="ma-1"
              pill
              size="small"
              title="Last SSL certificate issued by Selldone."
              variant="flat"
              color="#000"
            >
              <v-icon start> verified_user</v-icon>
              {{ item.certificate.Name }} <span class="mx-2">|</span>
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
              >
                Expire
              </v-chip>
            </v-chip>
          </td>

          <td
            v-if="writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
            :colspan="columns.length - 3"
          >
            <span class="float-end">
              <v-btn
                v-if="item.domain"
                class="ma-1 tnt"
                size="small"
                @click="showSetting(item.domain)"
              >
                <v-icon start>settings</v-icon>
                {{ $t("global.commons.setting") }}
              </v-btn>

              <v-btn
                :loading="
                  busy_add_client &&
                  add_client_code ===
                    (item.domain ? item.domain.id : item.official)
                "
                class="ma-1 tnt"
                variant="elevated"
                size="small"
                @click="
                  createClientSecret(
                    item.domain ? item.domain.id : item.official,
                  )
                "
              >
                <v-icon start>build</v-icon>
                {{ $t("admin_shop.dashboard.info.table.auto_repair") }}
              </v-btn>

              <u-smart-menu
                v-if="item.domain"
                class="ms-2"
                :items="[
                  {
                    title: 'Edit Domain',
                    click: () => showEditDomainDialog(item.domain),
                    icon: 'edit',
                  },
                  {
                    title: $t('global.actions.delete'),
                    click: () => deleteShopDomain(item.domain),
                    icon: 'close',
                  },
                ]"
                :loading="busy_delete === item.domain.id"
              >
              </u-smart-menu>
            </span>
          </td>
        </tr>
        <tr v-if="item.error">
          <td :colspan="columns.length">
            <v-icon class="me-1" color="red">error</v-icon>
            {{ item.error }}
          </td>
        </tr>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Home Page ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.home="{ item }">
        <div class="py-1">
          <v-btn
            v-if="!item.official && item.domain"
            :title="`Set custom home page for ${item.domain.domain}`"
            block
            border="2px"
            size="large"
            variant="text"
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
              class="me-2 ms-n2"
              height="24"
              width="24"
            />

            <div class="text-start min-width-100">
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
                size="x-small"
                variant="tonal"
                >Default Home
              </v-chip>
            </div>
          </v-btn>
        </div>
      </template>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Open ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:item.url_action="{ item }">
        <v-btn
          :disabled="!item.enable"
          :href="item.url"
          class="tnt"
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
          class="tnt"
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
            :class="{ 'disabled op-0-6': item.official === 'local' }"
            :color="item.indexed ? 'green' : '#444'"
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

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Pagination ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>

    <div v-if="!$vuetify.display.xs || !showHeader" class="widget-buttons">
      <v-btn block color="primary" size="x-large" @click="showAddDomainDialog">
        <v-icon start>add</v-icon>
        <div>
          {{ $t("admin_shop.dashboard.info.add_domain") }}
          <div class="small">https://mybusinessname.com</div>
        </div>
      </v-btn>
    </div>
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
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <b-domain-add
      v-if="dialog_pre"
      :domain="selected_shop_domain"
      :shop="shop"
      @add="(val) => AddOrUpdateItemByID(domains, val)"
      @update="(val) => AddOrUpdateItemByID(domains, val)"
      @click:close="dialog_set_domain = false"
    ></b-domain-add>
  </v-dialog>

  <!-- ██████████████████████ Set custom home page for domains ██████████████████████ -->

  <v-dialog
    v-if="selected_domain"
    v-model="dialog_set_home"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title class="d-flex align-center">
        <img
          :height="24"
          class="me-2"
          src="../../../assets/icons/home.svg"
          width="auto"
        />
        Page
        <v-icon class="mx-1">{{ $t("icons.chevron_next") }}</v-icon>
        {{ selected_domain ? selected_domain.domain : "" }}
      </v-card-title>
      <v-card-subtitle class="text-start mt-0">
        {{ $t("admin_shop.dashboard.info.set_home_dialog.title") }}
      </v-card-subtitle>

      <v-card-text>
        <div class="widget-box -large mb-5">
          <b-shop-home-select
            v-if="dialog_set_home"
            :domain="selected_domain"
            :shop="shop"
            clearable
          ></b-shop-home-select>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_set_home = false">
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
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <b-domain-setting
      v-if="selected_domain"
      :domain="selected_domain"
      :shop="shop"
      @click:close="show_setting = false"
    >
    </b-domain-setting>
  </v-dialog>
</template>

<script>
import ShopSiteMap from "../../sitemap/ShopSiteMap.vue";

import { DomainsHelper } from "@selldone/core-js/helper/domain/DomainsHelper";
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";
import BShopLicenseBlockIcon from "../../shop/license/block/icon/BShopLicenseBlockIcon.vue";
import BShopHomeSelect from "../../shop/home/select/BShopHomeSelect.vue";
import BDomainAdd from "../add/BDomainAdd.vue";
import InlineHelp from "../../help/InlineHelp.vue";
import USmartMenu from "../../../ui/smart/menu/USmartMenu.vue";
import BDomainSetting from "../../domain/setting/BDomainSetting.vue";
import _ from "lodash-es";
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "BDomainsList",
  components: {
    UTextCopyBox,
    BDomainSetting,
    USmartMenu,
    InlineHelp,
    BDomainAdd,
    BShopHomeSelect,
    BShopLicenseBlockIcon,
    ShopSiteMap,
  },
  props: {
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
  }),

  computed: {
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

    search: _.throttle(function (newVal, oldVal) {
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
    fetchDomains(page, sortBy, sortDesc = true) {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_SHOP_DOMAINS(this.$route.params.shop_id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,

            search: this.search,
          },
        })
        .then(({ data }) => {
          this.totalItems = data.total + (this.show_subdomains ? 2 : 0);
          this.domains = data.domains;
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

              this.showSuccessAlert(null, data.message);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
            this.showSuccessAlert(
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
            this.showErrorAlert(
              this.$t("global.notification.error"),
              data.error_msg,
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
      this.openDangerAlert(
        this.$t("admin_shop.dashboard.info.alert.title"),
        this.$t("admin_shop.dashboard.info.alert.message"),
        this.$t("global.actions.delete"),
        () => {
          this.busy_delete = domain.id;

          axios
            .delete(window.API.DELETE_EDIT_DOMAIN(this.shop.id, domain.domain))
            .then(({ data }) => {
              if (!data.error) {
                this.showSuccessAlert(
                  this.$t("admin_shop.dashboard.info.alert.title"),
                  this.$t(
                    "admin_shop.dashboard.info.notification.delete_domain_message",
                  ),
                );
                this.DeleteItemByID(this.shop.domains, data.id);
                this.DeleteItemByID(this.domains, data.id);
              } else {
                this.showErrorAlert(
                  this.$t("global.notification.error"),
                  data.error_msg,
                );
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
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
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>
