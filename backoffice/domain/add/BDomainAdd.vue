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

<template>
  <v-card
    :variant="inline ? 'text' : 'flat'"
    class="position-relative text-start"
  >
    <u-loading-progress v-if="busy_add"></u-loading-progress>
    <v-card-title v-if="!inline">
      <v-icon class="me-1" color="#333"
        >{{ inDomainEditMode ? "public" : "travel_explore" }}
      </v-icon>
      {{ $t("admin_shop.dashboard.info.add_dialog.title") }}
    </v-card-title>

    <v-card-text class="position-relative thin-scroll">
      <div class="text-black">
        <v-expand-transition>
          <div class="widget-box -large mb-5">
            <u-widget-header icon="looks_one" title="Domain">
              <template v-if="is_valid_domain" v-slot:append-title>
                <v-icon class="ms-1" color="success">check_circle</v-icon>
              </template>
              <template v-slot:actions>
                <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ In App Help (Help Center) ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
                <inline-help
                  :code="HelpCenterCode.SHOP_DOMAINS_ADD"
                ></inline-help>
                <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
              </template>
            </u-widget-header>

            <v-locale-provider :rtl="false">
              <v-text-field
                  v-model="input_domain"
                  :disabled="inDomainEditMode"
                  :hint="
                $t('admin_shop.dashboard.info.add_dialog.input_domain_message')
              "
                  :label="$t('admin_shop.dashboard.info.add_dialog.input_domain')"
                  :rules="[GlobalRules.required()]"
                  class="english-field strong-field"
                  color="green"
                  placeholder="your-shop-domain.com"
                  single-line
                  variant="underlined"
                  @keydown.enter="setShopDomain()"
                  messages=" "
              >
                <template v-slot:prepend-inner>
                  <b
                      class="me-2 pt-2 text-success small text-no-wrap"
                      dir="ltr"
                      @click="show_ssl_message = !show_ssl_message"
                  >
                    <v-icon class="me-1 mb-1" color="success" size="small">
                      lock
                    </v-icon>
                    https://
                  </b>
                </template>

                <template v-slot:message>
                  <v-slide-x-reverse-transition group leave-absolute>
                    <v-chip
                        v-if="is_wild_card"
                        key="1"
                        class="skew-n20 mx-1"
                        color="#C2185B"
                        label
                        size="x-small"
                        variant="flat"
                    >Wildcard
                    </v-chip>

                    <v-chip
                        v-if="!is_valid_domain"
                        key="2"
                        class="skew-n20 mx-1"
                        color="#eee"
                        label
                        size="x-small"
                        variant="flat"
                    >
                      <v-icon class="me-1" color="red" size="small"
                      >warning
                      </v-icon>
                      Invalid domain
                    </v-chip>
                    <v-chip
                        v-else-if="is_subdomain"
                        key="3"
                        class="skew-n20 mx-1"
                        color="#673AB7"
                        label
                        size="x-small"
                        variant="flat"
                    >Sub domain
                    </v-chip>
                    <v-chip
                        v-else
                        key="4"
                        class="skew-n20 mx-1"
                        color="#009688"
                        label
                        size="x-small"
                        variant="flat"
                    >Root domain
                    </v-chip>
                  </v-slide-x-reverse-transition>
                </template>
              </v-text-field>
            </v-locale-provider>


            <v-alert
              :model-value="show_ssl_message"
              class="small font-weight-bold"
              density="compact"
              text
              type="success"
            >
              {{ $t("admin_shop.dashboard.info.add_dialog.ssl_message") }}
            </v-alert>

            <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ OAuth2 Client Check ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
            <div class="max-widget-width">
              <u-smart-switch
                v-if="inDomainEditMode"
                v-model="domain_enable"
                :false-title="
                  $t('admin_shop.dashboard.info.add_dialog.inactive')
                "
                :true-title="$t('admin_shop.dashboard.info.add_dialog.active')"
                class="my-3"
                false-gray
                false-icon="close"
                true-icon="check"
              />

              <div
                v-if="inDomainEditMode && !busy_fetch_domain_data"
                class="my-3"
              >
                <v-btn
                  v-if="!domain_client"
                  :loading="busy_add_client"
                  class="rounded-18px"
                  color="#fff"
                  size="x-large"
                  variant="flat"
                  width="100%"
                  @click.stop="createClientSecret(domain.id)"
                >
                  <v-icon class="mx-1 blink-me-linear" color="red"
                    >warning
                  </v-icon>
                  <div class="text-wrap" style="max-width: 60%">
                    Create client secret to enable login
                  </div>
                </v-btn>

                <v-chip
                  v-else
                  class="rounded-18px w-100"
                  color="primary"
                  size="large"
                >
                  <v-icon start>check</v-icon>
                  <span dir="ltr">
                    <b class="mx-1">OAuth2 Callback</b>
                    <span class="d-block small">{{
                      domain_client.redirect
                    }}</span>
                  </span>
                </v-chip>
              </div>
            </div>

            <div v-if="domain.approved">
              <p class="font-weight-medium text-start text-muted">
                <v-icon class="mx-1"> all_inclusive</v-icon>
                {{
                  $t("admin_shop.dashboard.info.add_dialog.success_message", {
                    domain: input_domain,
                  })
                }}
              </p>
            </div>
          </div>
        </v-expand-transition>

        <v-expand-transition>
          <div v-if="is_valid_domain && (!inDomainEditMode || error_dns)">
            <div class="widget-box -large mb-5">
              <h2 class=" ">
                <v-icon class="me-1">looks_two</v-icon>
                Connect
              </h2>
              <v-list-subheader>
                {{ $t("admin_shop.dashboard.info.add_dialog.step1") }}
              </v-list-subheader>

              <u-smart-switch
                v-if="has_ssl_proxy"
                v-model="show_ssl_ips"
                class="my-3"
                false-description="You can directly link your domain to Selldone, which necessitates a CDN for SSL issuance. This is an advantageous option when using CDN providers such as Cloudflare for domain hosting."
                false-gray
                false-icon="cloud_off"
                false-title="Direct connect"
                true-description="This option allows you to link your domain to Selldone via our secure CDN layer, removing the necessity for any external CDN. Employing external CDNs such as Cloudflare in conjunction with this setup may lead to conflicts and errors in SSL issuance."
                true-icon="cloud"
                true-title="Secure CDN + Issue SSL"
              />

              <u-pods-panel>
                <u-pod-node
                  :image="getShopImagePath(shop.icon, 64)"
                  title="Your Domain"
                ></u-pod-node>
                <u-pod-wire backward forward></u-pod-wire>

                <template v-if="show_ssl_ips">
                  <u-pod-node
                    color="#eee"
                    dashed
                    icon="dns"
                    icon-color="#eee"
                    title="Optional CDN"
                  ></u-pod-node>
                  <u-pod-wire backward forward></u-pod-wire>
                  <u-pod-node
                    icon="cloud"
                    icon-color="primary"
                    title="SSL + CDN"
                  ></u-pod-node>
                  <u-pod-wire backward forward></u-pod-wire>
                </template>

                <template v-else>
                  <u-pod-node
                    color="#009688"
                    icon="dns"
                    icon-color="#009688"
                    title="CDN (Required)"
                  ></u-pod-node>
                  <u-pod-wire backward forward></u-pod-wire>
                </template>

                <u-pod-node is-selldone-icon title="Selldone"></u-pod-node>
              </u-pods-panel>

              <div
                v-for="item in SelldoneShopsHostIPs.filter((x) =>
                  show_ssl_ips
                    ? custom_ips_ssl_proxy?.includes(x)
                    : !custom_ips_ssl_proxy?.includes(x),
                )"
                :key="item"
                class="border-seft-thick-blue"
                dir="ltr"
              >
                <p class="font-weight-black mb-1">DNS Record type: <b>A</b></p>

                <u-text-copy-box
                  :value="domain_verification_title"
                  full-width
                  message="DNS A key"
                  class="my-2"
                >
                </u-text-copy-box>

                <u-text-copy-box
                  :value="item"
                  full-width
                  message="DNS A record value"
                  class="my-2"
                >
                </u-text-copy-box>
              </div>

              <v-expand-transition>
                <div
                  v-if="
                    is_subdomain &&
                    !show_ssl_ips /*CNAME point directly to the main load balancer*/
                  "
                >
                  <div class="text-center">
                    OR <small>(Only for sub domains)</small>
                  </div>

                  <div
                    v-for="item in SelldoneShopsHostCNAMEs"
                    :key="item"
                    class="border-seft-thick-blue"
                    dir="ltr"
                  >
                    <p class="font-weight-black mb-1">
                      DNS Record type: <b>CNAME</b>
                    </p>

                    <u-text-copy-box
                      :value="domain_verification_title"
                      full-width
                      message="DNS CNAME key"
                      class="my-2"
                    >
                    </u-text-copy-box>

                    <u-text-copy-box
                      :value="item"
                      full-width
                      message="DNS CNAME record value"
                      class="my-2"
                    >
                    </u-text-copy-box>
                  </div>
                </div>
              </v-expand-transition>
            </div>

            <div class="widget-box -large mb-5">
              <h2 class=" ">
                <v-icon class="me-1">looks_3</v-icon>
                Verification
              </h2>
              <v-list-subheader>
                {{ $t("admin_shop.dashboard.info.add_dialog.step2") }}
              </v-list-subheader>
              <div class="border-seft-thick-blue" dir="ltr">
                <p class="font-weight-black mb-1">
                  DNS Record type: <b>TXT</b>
                </p>

                <u-text-copy-box
                  :value="
                    domain_verification_title +
                    (is_subdomain ? '-challenge' : '')
                  "
                  full-width
                  message="DNS TXT key"
                  class="my-2"
                >
                </u-text-copy-box>

                <u-text-copy-box
                  :value="domain_verification_code"
                  full-width
                  message="DNS TXT record value"
                  class="my-2"
                >
                </u-text-copy-box>
              </div>

              <template v-if="!show_ssl_ips">
                <v-row no-gutters>
                  <v-spacer></v-spacer>
                  <v-select
                    v-model="provider"
                    :items="providers"
                    :return-object="false"
                    class="max-w-250"
                    item-value="code"
                    messages="DNS / CDN providers configuration guide"
                    variant="plain"
                  >
                    <template v-slot:item="{ item, props }">
                      <v-list-item
                        :title="item.title"
                        class="text-start"
                        v-bind="props"
                      >
                        <template v-slot:prepend>
                          <img
                            :src="item.raw.icon"
                            class="me-2"
                            height="24"
                            width="24"
                          />
                        </template>
                      </v-list-item>
                    </template>
                    <template v-slot:selection="{ item }">
                      <img
                        :src="item.raw.icon"
                        class="me-2"
                        height="24"
                        width="24"
                      />
                      {{ item.raw.title }}
                    </template>
                  </v-select>
                </v-row>

                <v-expand-transition>
                  <div v-if="provider === 'cloudflare'">
                    <div class="text-muted small">Sample configuration</div>
                    <v-btn
                      :disabled="sample_tab === 1"
                      class="ma-1 tnt"
                      color="primary"
                      variant="text"
                      @click="sample_tab = 1"
                      >DNS setting
                    </v-btn>
                    <v-btn
                      :disabled="sample_tab === 2"
                      class="ma-1 tnt"
                      color="primary"
                      variant="text"
                      @click="sample_tab = 2"
                      >SSL setting
                    </v-btn>

                    <v-btn
                      :disabled="sample_tab === 3"
                      class="ma-1 tnt"
                      color="primary"
                      variant="text"
                      @click="sample_tab = 3"
                      >Common errors in migration
                    </v-btn>

                    <div class="max-w-640 mx-auto typo-body">
                      <v-expand-transition>
                        <v-img
                          v-if="sample_tab === 1"
                          :aspect-ratio="3.29"
                          :src="require('../assets/cloudflare-dns.png')"
                        ></v-img>
                      </v-expand-transition>
                      <v-expand-transition>
                        <v-img
                          v-if="sample_tab === 2"
                          :aspect-ratio="1.47"
                          :src="require('../assets/cloudflare-ssl.png')"
                        ></v-img>
                      </v-expand-transition>

                      <v-expand-transition>
                        <div v-if="sample_tab === 3" class="px-2">
                          <div class="py-2">
                            You can validate your DNS configuration:<br />
                            Open your domain (<b>{{ input_domain }}</b
                            >) in the browser; what do you see?
                          </div>

                          <div class="py-2">
                            <b>
                              <v-icon class="me-1" color="#111"
                                >looks_one
                              </v-icon>
                              I see a page with the name of my shop and
                              selldone!</b
                            ><br />
                            So, Everything is alright! You can add your domain
                            to your business OS now.
                          </div>

                          <div class="py-2">
                            <b>
                              <v-icon class="me-1" color="#111"
                                >looks_two
                              </v-icon>
                              I see a blank page from previous hosting services,
                              like Shopify, Wix, etc.</b
                            ><br />
                            There is a problem; your previous ecommerce platform
                            has a contract with Cloudflare and has applied some
                            configuration that needs to release. They should
                            remove your domain configs first to make your new
                            DNS records live on your Cloudflare. So, please get
                            in touch with their support to help you or contact
                            our support team.
                          </div>
                        </div>
                      </v-expand-transition>

                      <div class="pa-2">
                        <b>Do you migrate from Shopify, Wix, ...?</b><br />
                        If you receive the 503 error when opening
                        <b>{{ input_domain }}</b
                        >, please contact Your previous service provider (or
                        Cloudflare) and ask them to remove the DNS configuration
                        for this domain.
                      </div>
                    </div>
                  </div>
                </v-expand-transition>
              </template>
            </div>
          </div>
        </v-expand-transition>

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Auto > DNS Records ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <v-expand-transition>
          <div
            v-if="inDomainEditMode"
            class="widget-box -large mb-5 min-height-20vh"
          >
            <u-widget-header icon="dns" title="DNS records"></u-widget-header>
            <v-list-subheader v-if="domain"
              >{{
                domain.ssl_proxy
                  ? "If you added this domain via Selldone SSL service, Selldone will issue an SSL certificate if your DNS configuration is correct."
                  : "When you add a domain in direct mode, it implies that you are responsible for adding SSL to your domain via CDNs like Cloudflare. Please note that Selldone will not issue SSL for your domain in this case."
              }}
            </v-list-subheader>

            <div v-if="error_dns" class="mt-4 typo-body">
              <v-icon class="me-1" color="amber">warning</v-icon>
              Your domain config invalid or need time to be visible.
              <div class="text-red my-3" v-html="domain_error_msg"></div>
            </div>

            <v-table v-if="dns && dns.length" class="rounded-28px mb-3 mt-6">
              <thead>
                <tr>
                  <th class="text-center">Type</th>
                  <th class="text-center">DNS Record</th>
                  <th class="text-start">
                    {{ $t("admin_shop.dashboard.info.status") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in dns_a" :key="item.type + index">
                  <td class="text-center">
                    <b>{{ item.type }}</b>
                  </td>
                  <td class="text-center">{{ item.ip }}</td>
                  <td>
                    <div v-if="SelldoneShopsHostIPs.includes(item.ip)">
                      <v-icon color="success" end> check_circle</v-icon>
                      {{ $t("admin_shop.dashboard.info.add_dialog.correct") }}
                    </div>
                    <div
                      v-else-if="
                        cdn ||
                        domain?.approved /*Or selldone approved it as connected through CDN*/
                      "
                    >
                      <v-icon class="mx-1" color="primary"> cloud_done</v-icon>
                      CDN
                    </div>
                    <div v-else-if="!cdn">
                      <v-icon class="mx-1" color="warning"> warning</v-icon>
                      <span
                        v-html="
                          $t(
                            'admin_shop.dashboard.info.add_dialog.set_ip_alert',
                            {
                              ip: SelldoneShopsHostIPs[0],
                            },
                          )
                        "
                      >
                      </span>
                    </div>
                  </td>
                </tr>

                <tr v-for="(item, index) in dns_cname" :key="item.type + index">
                  <td>{{ item.type }}</td>
                  <td>{{ item.target }}</td>
                  <td>
                    <div v-if="SelldoneShopsHostCNAMEs.includes(item.target)">
                      <v-icon color="success" end> check_circle</v-icon>
                      {{ $t("admin_shop.dashboard.info.add_dialog.correct") }}
                    </div>
                    <div v-else>
                      <v-icon class="mx-1" color="warning"> warning</v-icon>
                      <span
                        v-html="
                          $t(
                            'admin_shop.dashboard.info.add_dialog.set_message',
                            {
                              cname: SelldoneShopsHostCNAMEs[0],
                            },
                          )
                        "
                      ></span>
                    </div>
                  </td>
                </tr>

                <tr v-for="(item, index) in dns_ns" :key="item.type + index">
                  <td>{{ item.type }}</td>
                  <td>{{ item.target }}</td>
                  <td>
                    <div>
                      <v-icon color="primary" end> check_circle</v-icon>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <div
              v-else-if="!busy_fetch_domain_data"
              class="text-h4 text-center my-5 text-muted text-uppercase font-weight-light"
            >
              <v-icon class="me-1" size="large">warning_amber</v-icon>
              DNS records not found!
            </div>
            <u-loading-ellipsis v-if="busy_fetch_domain_data" />
          </div>
        </v-expand-transition>

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Click Add > DNS Records ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
        <v-expand-transition>
          <div v-if="show_dns" class="widget-box -large mb-5" dir="ltr">
            <u-widget-header icon="dns" title="DNS records"></u-widget-header>

            <div v-if="domain_error_msg" class="mt-4 typo-body">
              <v-icon class="me-1" color="amber">warning</v-icon>
              Your domain config invalid or need time to be visible.<br />
              <div class="text-red" v-html="domain_error_msg"></div>
            </div>

            <div class="text-start mt-4" dir="ltr">
              <p class="mb-2 font-weight-bold">Make sure:</p>
              <p class="mb-1">
                1. Nameservers updated (take 8 ~ 48 hours if you changed it,
                like set ny.cloudflare.com)
              </p>
              <p>
                2. Turn on CDN and enable SSL certification. Just turn off CDN
                to add the domain and then enable CDN and SSL.
              </p>
            </div>

            <v-table class="rounded-28px my-3">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">Host</th>
                    <th>Type</th>
                    <th class="text-left">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in last_dns" :key="item.name">
                    <td class="text-left">{{ item.host }}</td>
                    <td>{{ item.type }}</td>
                    <td class="text-left">
                      {{ item.target || item.txt || item.ip }}
                      <v-icon v-if="anyMatch(item)" class="ms-1" color="green"
                        >check
                      </v-icon>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-table>
          </div>
        </v-expand-transition>
      </div>
    </v-card-text>

    <v-card-actions>
      <div class="widget-buttons">
        <!-- Action > Delete -->

        <!-- Action > Close -->
        <v-btn v-if="!inline" size="x-large" variant="text" @click="close()">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <!-- Action > Edit -->

        <v-btn
          v-if="inDomainEditMode"
          :loading="busy_update"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="updateShopDomain('enable', input_domain, domain_enable)"
        >
          <v-icon start> save</v-icon>
          {{ $t("global.actions.update") }}
        </v-btn>

        <!-- Action > Add -->

        <v-btn
          v-else
          :class="{ disabled: !is_valid_domain }"
          :loading="busy_add"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="setShopDomain()"
        >
          <v-icon start> add_box</v-icon>
          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </v-card-actions>

    <BShopLicenseBlockOverlay
      v-if="
        (inDomainEditMode && !can_edit_domain(domain)) ||
        (!inDomainEditMode && !can_add_new_domain)
      "
    ></BShopLicenseBlockOverlay>
  </v-card>
</template>

<script lang="ts">
import BShopLicenseBlockOverlay from "../../shop/license/block/overlay/BShopLicenseBlockOverlay.vue";
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";
import GlobalRules from "@selldone/core-js/helper/rules/GlobalRules";
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";
import InlineHelp from "../../help/InlineHelp.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import UPodsPanel from "../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../ui/pod/wire/UPodWire.vue";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";
import { HelpCenterCode } from "@selldone/components-vue/backoffice/help/HelpCenterCode.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BDomainAdd",
  mixins: [],
  emits: ["close", "update", "update-shop-domain"],
  components: {
    ULoadingEllipsis,
    UPodWire,
    UPodNode,
    UPodsPanel,
    USmartSwitch,
    InlineHelp,
    UTextCopyBox,
    BShopLicenseBlockOverlay,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    domain: {
      required: false,
      type: Object,
    },
    inline: {
      required: false,
      type: Boolean,
    },
  },

  data: () => ({
    HelpCenterCode: HelpCenterCode,

    show_ssl_message: false,

    busy_fetch_domain_data: false,
    error_dns: false,
    domain_client: null,

    dns: null,
    cdn: false,

    busy_update: false,
    busy_add: false,
    busy_add_client: false,
    add_client_code: null,

    domain_enable: false,

    input_domain: null,

    //---------------------------------
    last_dns: null,
    show_dns: false,
    domain_error_msg: null,

    providers: [
      {
        code: "cloudflare",
        title: "Cloudflare",
        icon: require("../../../assets/trademark/cloudflare.svg"),
      },
      {
        code: "google",
        title: "Google",
        icon: require("../../../assets/trademark/google-cloud.svg"),
      },
      {
        code: "other",
        title: "Other...",
        icon: require("../../../assets/icons/cloud-b.svg"),
      },
    ],
    provider: "cloudflare",
    sample_tab: 1,

    show_ssl_ips: false,
  }),

  computed: {
    is_subdomain() {
      return (
        this.domain_verification_title &&
        this.domain_verification_title !== "@" &&
        this.domain_verification_title !== "*"
      );
    },

    is_valid_domain() {
      if (this.is_wild_card) {
        return GlobalRules.ValidateDomain(this.input_domain.substring(2));
      }

      return this.input_domain && GlobalRules.ValidateDomain(this.input_domain);
    },

    inDomainEditMode() {
      return this.domain.id > 0;
    },

    dns_a() {
      return this.dns.filter((item) => item.type === "A");
    },
    dns_cname() {
      return this.dns.filter((item) => item.type === "CNAME");
    },
    dns_ns() {
      return this.dns.filter((item) => item.type === "NS");
    },

    can_add_new_domain() {
      return Eligible.CanAddNewDomain(this.shop);
    },

    SelldoneShopsHostIPs() {
      return this.shop.custom_ips;
    },
    custom_ips_ssl_proxy() {
      // Auto assign SSL
      return this.shop.custom_ips_ssl_proxy;
    },
    has_ssl_proxy() {
      return this.custom_ips_ssl_proxy?.length > 0;
    },

    SelldoneShopsHostCNAMEs() {
      return this.shop.custom_cnames;
    },

    is_wild_card() {
      return (
        this.input_domain?.startsWith("*.") &&
        this.input_domain.split(".").length >= 3
      );
    },

    domain_verification_code() {
      return "selldone-domain-verification=" + this.shop.hash_id;
    },
    domain_verification_title() {
      let domain = this.input_domain;
      if (this.is_wild_card) {
        domain = domain.substring(2); // Remove *.
      }

      if (!this.domain || !domain) return "@";
      let arrDomain = domain.split(".");
      let domainLength = arrDomain.length;

      const is_2LD =
        domainLength > 2 &&
        arrDomain[domainLength - 2].length <=
          3 /*Check domain 3 characters or less. ex: .com.uk */ &&
        arrDomain[domainLength - 1].length <= 2; /*two country code!*/

      if (domainLength > (is_2LD ? 3 : 2)) {
        return (
          (this.is_wild_card ? "*." : "") +
          arrDomain.slice(0, domainLength - (is_2LD ? 3 : 2)).join(".")
        );
      } else {
        return this.is_wild_card ? "*" : "@";
      }
    },

    corrected_domain_verification_title() {
      /* if (this.provider === "cloudflare") {
        return this.input_domain;
      }*/

      return this.domain_verification_title;
    },
  },

  methods: {
    anyMatch(record) {
      return (
        (record.type === "TXT" &&
          record.txt === this.domain_verification_code) ||
        (record.type === "A" &&
          this.SelldoneShopsHostIPs.includes(record.ip)) ||
        (record.type === "CNAME" &&
          this.SelldoneShopsHostCNAMEs.includes(record.target))
      );
    },

    can_edit_domain(domain) {
      return Eligible.CanEditDomain(this.shop, domain.id);
    },

    fetchNameServers() {
      this.busy_fetch_domain_data = true;
      this.error_dns = false;
      axios
        .get(window.API.GET_DOMAIN_INFO(this.shop.id, this.input_domain))
        .then(({ data }) => {
          if (!data.error) {
            this.dns = data.dns;
            this.cdn = data.cdn;
            this.domain_client = data.client;

            this.AddOrUpdateItemByID(this.shop.domains, data.domain);
          } else {
            NotificationService.showErrorAlert(
              this.$t("global.notification.error"),
              data.error_msg,
            );
            this.dns = data.dns ? data.dns : [];
            this.cdn = data.cdn;
            this.domain_client = data.client;

            this.error_dns = true;
            this.domain_error_msg = data.error_msg;
          }
        })
        .finally(() => {
          this.busy_fetch_domain_data = false;
        });
    },

    setShopDomain() {
      if (this.busy_add) return;
      this.busy_add = true;

      axios
        .post(window.API.POST_ADD_DOMAIN(this.shop.id), {
          domain: this.input_domain,
          ssl_proxy: this.show_ssl_ips, // Indicate that this domain added via SSL proxy IPs
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              this.$t("global.notification.confirm"),
              this.$t("admin_shop.dashboard.info.notification.add_message"),
            );
            this.AddOrUpdateItemByID(this.shop.domains, data.domain);
            this.$emit("add", data.domain);
            this.close();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);

            this.last_dns = data.dns;
            this.show_dns = !!data.dns;
            this.domain_error_msg = data.error_msg;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = false;
        });
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
              this.domain_client = data.client;

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
              this.$emit("update", data.domain);
            } else if (data.local) this.shop.local = data.local;
            else if (data.sub) this.shop.sub = data.sub;

            this.close();
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
    close() {
      this.$emit("click:close");
    },
  },
  created() {
    this.show_ssl_ips = this.has_ssl_proxy;

    this.domain_enable = this.domain.enable;

    if (this.inDomainEditMode) {
      // Edit mode (Update info from server)

      this.input_domain = this.domain.domain;
      // console.log('this.input_domain',this.input_domain)

      this.fetchNameServers();
    }

    this.dns = null;
    this.domain_client = null;
    this.last_dns = null;
    this.show_dns = false;
  },
};
</script>

<style scoped></style>
