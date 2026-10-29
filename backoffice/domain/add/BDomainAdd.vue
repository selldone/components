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
    :class="{ 'sd-modern-widget': modern, 'b-domain-add-modern': modern }"
  >
    <u-loading-progress v-if="busy_add"></u-loading-progress>
    <template v-if="modern">
      <header class="b-domain-add-modern__header">
        <div>
          <h2>{{ $t("domains_modern.connection.title") }}</h2>
          <p>
            {{
              $t(
                inDomainEditMode
                  ? "domains_modern.connection.editSubtitle"
                  : "domains_modern.connection.addSubtitle",
              )
            }}
          </p>
        </div>
        <v-tooltip
          location="top"
          content-class="sd-modern-tooltip text-start"
          open-on-focus
        >
          <template #activator="{ props }"
            ><v-btn
              v-bind="props"
              icon
              variant="text"
              class="sd-modern-icon-button"
              :aria-label="$t('global.actions.close')"
              @click="close()"
              ><v-icon>close</v-icon></v-btn
            ></template
          >
          {{ $t("global.actions.close") }}
        </v-tooltip>
      </header>

      <v-card-text class="b-domain-add-modern__body thin-scroll">
        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Address, visitor access and sign-in ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
        <section class="b-domain-add-modern__section">
          <div class="b-domain-add-modern__heading">
            <v-icon aria-hidden="true">language</v-icon>
            <div>
              <h3>{{ $t("domains_modern.connection.addressAccess") }}</h3>
              <p>{{ $t("domains_modern.connection.addressHint") }}</p>
            </div>
            <v-tooltip
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              open-on-click
            >
              <template #activator="{ props }"
                ><v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  class="sd-modern-icon-button sd-modern-info-button"
                  :aria-label="$t('domains_modern.connection.addressHelp')"
                  ><v-icon>info_outline</v-icon></v-btn
                ></template
              >
              {{ $t("domains_modern.connection.addressHelp") }}
            </v-tooltip>
          </div>
          <div
            class="b-domain-add-modern__identity-grid"
            :class="{ 'b-domain-add-modern__identity-grid--single': !inDomainEditMode }"
          >
            <div>
              <template v-if="inDomainEditMode">
                <span class="b-domain-add-modern__label">{{
                  $t("domains_modern.connection.domain")
                }}</span>
                <div class="b-domain-add-modern__address" dir="ltr">
                  <span>https://</span><bdi>{{ input_domain }}</bdi>
                  <v-tooltip
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    open-on-focus
                    open-on-click
                  >
                    <template #activator="{ props }"
                      ><v-btn
                        v-bind="props"
                        icon
                        variant="text"
                        class="sd-modern-icon-button"
                        :aria-label="$t('domains_modern.connection.domainLock')"
                        ><v-icon>lock_outline</v-icon></v-btn
                      ></template
                    >
                    {{ $t("domains_modern.connection.domainLock") }}
                  </v-tooltip>
                </div>
              </template>
              <v-locale-provider v-else :rtl="false">
                <v-text-field
                  v-model="input_domain"
                  :label="$t('domains_modern.connection.domain')"
                  :rules="[GlobalRules.required()]"
                  class="english-field sd-modern-underlined-field b-domain-add-modern__input"
                  variant="underlined"
                  persistent-placeholder
                  placeholder="store.example.com"
                  :disabled="busy_add"
                  :messages="' '"
                  @keydown.enter="is_valid_domain && setShopDomain()"
                >
                  <template #prepend-inner
                    ><span class="b-domain-add-modern__prefix" dir="ltr"
                      >https://</span
                    ></template
                  >
                  <template #message
                    ><span class="b-domain-add-modern__message"
                      ><v-icon
                        v-if="input_domain"
                        :color="is_valid_domain ? 'success' : 'warning'"
                        size="14"
                        aria-hidden="true"
                        >{{ is_valid_domain ? "check" : "error_outline" }}</v-icon
                      >{{
                        $t(
                          !input_domain
                            ? "domains_modern.add.example"
                            : !is_valid_domain
                              ? "domains_modern.add.invalid"
                              : is_wild_card
                                ? "domains_modern.add.wildcard"
                                : is_subdomain
                                  ? "domains_modern.add.subdomain"
                                  : "domains_modern.add.root_domain",
                        )
                      }}</span
                    ></template
                  >
                </v-text-field>
              </v-locale-provider>
              <div v-if="inDomainEditMode" class="b-domain-add-modern__meta">
                <v-icon size="12" aria-hidden="true">{{
                  is_wild_card ? "emergency" : "link"
                }}</v-icon
                >{{
                  $t(
                    is_wild_card
                      ? "domains_modern.connection.wildcard"
                      : "domains_modern.connection.fixedDomain",
                  )
                }}
              </div>
              <div
                v-if="inDomainEditMode && !busy_fetch_domain_data"
                class="b-domain-add-modern__callback"
              >
                <v-icon aria-hidden="true">login</v-icon>
                <div>
                  <span>{{ $t("domains_modern.connection.callback") }}</span
                  ><bdi v-if="domain_client" dir="ltr">{{ domain_client.redirect }}</bdi
                  ><v-btn
                    v-else
                    variant="text"
                    color="primary"
                    class="sd-modern-button sd-modern-button--small sd-modern-button--inline"
                    :loading="busy_add_client"
                    @click.stop="createClientSecret(domain.id)"
                    >{{ $t("domains_modern.connection.createClient") }}</v-btn
                  >
                </div>
                <v-tooltip
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                  open-on-click
                >
                  <template #activator="{ props }"
                    ><v-btn
                      v-bind="props"
                      icon
                      variant="text"
                      class="sd-modern-icon-button sd-modern-info-button"
                      :aria-label="
                        $t(
                          domain_client
                            ? 'domains_modern.connection.callbackHelp'
                            : 'domains_modern.connection.createHelp',
                        )
                      "
                      ><v-icon>info_outline</v-icon></v-btn
                    ></template
                  >
                  {{
                    $t(
                      domain_client
                        ? "domains_modern.connection.callbackHelp"
                        : "domains_modern.connection.createHelp",
                    )
                  }}
                </v-tooltip>
                <v-tooltip
                  v-if="domain_client"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                >
                  <template #activator="{ props }"
                    ><v-btn
                      v-bind="props"
                      icon
                      variant="text"
                      class="sd-modern-icon-button"
                      :aria-label="$t('domains_modern.connection.copy')"
                      @click="copyToClipboard(domain_client.redirect)"
                      ><v-icon>content_copy</v-icon></v-btn
                    ></template
                  >{{ $t("domains_modern.connection.copy") }}
                </v-tooltip>
              </div>
              <u-loading-ellipsis v-if="inDomainEditMode && busy_fetch_domain_data" />
              <p v-if="domain.approved" class="b-domain-add-modern__approved">
                <v-icon size="14" color="success" aria-hidden="true">check</v-icon
                >{{ $t("domains_modern.list.verified") }}
              </p>
            </div>
            <div v-if="inDomainEditMode">
              <span class="b-domain-add-modern__label">{{
                $t("domains_modern.connection.access")
              }}</span>
              <u-smart-switch
                v-model="domain_enable"
                :true-title="$t('domains_modern.connection.active')"
                :false-title="$t('domains_modern.connection.inactive')"
                true-icon="check"
                false-icon="close"
                :disabled="busy_update"
                accessible
                border
                class="sd-modern-smart-select"
              />
            </div>
          </div>
        </section>

        <template v-if="is_valid_domain">
          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Storefront hosting and connection method ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
          <section class="b-domain-add-modern__section">
            <div class="b-domain-add-modern__heading">
              <v-icon aria-hidden="true">storefront</v-icon>
              <div>
                <h3>{{ $t("domains_modern.connection.hosting") }}</h3>
                <p>{{ $t("domains_modern.connection.hostingHint") }}</p>
              </div>
              <v-tooltip
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
                open-on-click
              >
                <template #activator="{ props }"
                  ><v-btn
                    v-bind="props"
                    icon
                    variant="text"
                    class="sd-modern-icon-button sd-modern-info-button"
                    :aria-label="$t('domains_modern.connection.hostingHelp')"
                    ><v-icon>info_outline</v-icon></v-btn
                  ></template
                >{{ $t("domains_modern.connection.hostingHelp") }}
              </v-tooltip>
            </div>
            <u-smart-select
              v-model="hosting_mode"
              :items="modern_hosting_options"
              :readonly="inDomainEditMode"
              :disabled="busy_add"
              border
              accessible
              force-show-all
              class="sd-modern-smart-select"
              item-description="description"
              item-icon="icon"
              item-text="title"
              item-value="code"
            />
            <div v-if="inDomainEditMode" class="b-domain-add-modern__meta">
              <v-icon size="12" aria-hidden="true">lock_outline</v-icon
              >{{ $t("domains_modern.connection.fixedHosting") }}
            </div>
            <div v-if="inDomainEditMode" class="b-domain-add-modern__ssl">
              <v-icon aria-hidden="true">{{
                externally_hosted ? "open_in_new" : "verified_user"
              }}</v-icon>
              <div>
                {{
                  $t(
                    externally_hosted
                      ? "domains_modern.connection.sslExternal"
                      : domain.ssl_proxy
                        ? "domains_modern.connection.sslSecure"
                        : "domains_modern.connection.sslOwn",
                  )
                }}
                <p>
                  {{
                    $t(
                      externally_hosted
                        ? "domains_modern.connection.sslExternalHint"
                        : domain.ssl_proxy
                          ? "domains_modern.connection.sslSecureHint"
                          : "domains_modern.connection.sslOwnHint",
                    )
                  }}
                </p>
              </div>
            </div>
            <div
              v-if="externally_hosted"
              class="sd-modern-notice b-domain-add-modern__notice"
              role="status"
            >
              {{ $t("domains_modern.connection.externalNote") }}
            </div>
            <template v-if="!externally_hosted && (!inDomainEditMode || error_dns)">
              <div class="b-domain-add-modern__setup">
                <h3>{{ $t("domains_modern.connection.sslTitle") }}</h3>
                <p>{{ $t("domains_modern.connection.sslHint") }}</p>
                <u-smart-switch
                  v-if="has_ssl_proxy"
                  :model-value="!show_ssl_ips"
                  @update:model-value="show_ssl_ips = !$event"
                  :true-title="$t('domains_modern.connection.direct')"
                  :true-description="$t('domains_modern.connection.directDesc')"
                  true-icon="cloud_done"
                  :false-title="$t('domains_modern.connection.secure')"
                  :false-description="$t('domains_modern.connection.secureDesc')"
                  false-icon="cloud"
                  :disabled="busy_add"
                  border
                  accessible
                  class="sd-modern-smart-select"
                />
                <p v-if="inDomainEditMode">
                  {{ $t("domains_modern.connection.saveAccessHint") }}
                </p>
                <u-pods-panel class="b-domain-add-modern__pods">
                  <u-pod-node
                    :image="getShopImagePath(shop.icon, 64)"
                    :title="$t('domains_modern.connection.domain')"
                  /><u-pod-wire backward forward />
                  <template v-if="show_ssl_ips"
                    ><u-pod-node
                      dashed
                      icon="dns"
                      :title="$t('global.commons.optional') + ' CDN'" /><u-pod-wire
                      backward
                      forward /><u-pod-node
                      icon="cloud"
                      icon-color="primary"
                      title="SSL + CDN" /><u-pod-wire backward forward
                  /></template>
                  <template v-else
                    ><u-pod-node icon="dns" icon-color="primary" title="CDN" /><u-pod-wire
                      backward
                      forward
                  /></template>
                  <u-pod-node is-selldone-icon title="Selldone" />
                </u-pods-panel>
              </div>
              <h3>{{ $t("domains_modern.connection.requiredRecords") }}</h3>
              <p>{{ $t("domains_modern.connection.requiredRecordsHint") }}</p>
              <div
                v-for="item in SelldoneShopsHostIPs.filter((x) =>
                  show_ssl_ips
                    ? custom_ips_ssl_proxy?.includes(x)
                    : !custom_ips_ssl_proxy?.includes(x),
                )"
                :key="item"
                class="b-domain-add-modern__record-block"
              >
                <span class="b-domain-add-modern__label">A</span
                ><u-text-copy-box
                  :value="domain_verification_title"
                  :message="$t('domains_modern.connection.host')"
                  icon="content_copy"
                  color="surface"
                  :border="false"
                  :copy-label="$t('domains_modern.connection.copy')"
                  full-width
                  small
                  text-start
                /><u-text-copy-box
                  :value="item"
                  :message="$t('domains_modern.connection.recordValue')"
                  icon="content_copy"
                  color="surface"
                  :border="false"
                  :copy-label="$t('domains_modern.connection.copy')"
                  full-width
                  small
                  text-start
                />
              </div>
              <template v-if="is_subdomain && !show_ssl_ips">
                <p>{{ $t("domains_modern.connection.cnameAlternative") }}</p>
                <div
                  v-for="item in SelldoneShopsHostCNAMEs"
                  :key="item"
                  class="b-domain-add-modern__record-block"
                >
                  <span class="b-domain-add-modern__label">CNAME</span
                  ><u-text-copy-box
                    :value="domain_verification_title"
                    :message="$t('domains_modern.connection.host')"
                    icon="content_copy"
                    color="surface"
                    :border="false"
                    :copy-label="$t('domains_modern.connection.copy')"
                    full-width
                    small
                    text-start
                  /><u-text-copy-box
                    :value="item"
                    :message="$t('domains_modern.connection.recordValue')"
                    icon="content_copy"
                    color="surface"
                    :border="false"
                    :copy-label="$t('domains_modern.connection.copy')"
                    full-width
                    small
                    text-start
                  />
                </div>
              </template>
            </template>
          </section>

          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Ownership verification ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
          <section
            v-if="!inDomainEditMode || error_dns"
            class="b-domain-add-modern__section"
          >
            <div class="b-domain-add-modern__heading">
              <v-icon aria-hidden="true">verified_user</v-icon>
              <div>
                <h3>{{ $t("domains_modern.connection.verification") }}</h3>
                <p>{{ $t("domains_modern.connection.verificationHint") }}</p>
              </div>
              <v-tooltip
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
                open-on-click
              >
                <template #activator="{ props }"
                  ><v-btn
                    v-bind="props"
                    icon
                    variant="text"
                    class="sd-modern-icon-button sd-modern-info-button"
                    :aria-label="$t('domains_modern.connection.verifyHelp')"
                    ><v-icon>info_outline</v-icon></v-btn
                  ></template
                >{{ $t("domains_modern.connection.verifyHelp") }}
              </v-tooltip>
            </div>
            <u-smart-select
              v-if="externally_hosted"
              v-model="verification_method"
              :items="verification_options"
              :disabled="busy_add"
              border
              accessible
              force-show-all
              class="sd-modern-smart-select"
              item-description="description"
              item-icon="icon"
              item-text="title"
              item-value="code"
            />
            <div
              v-if="!externally_hosted || verification_method === 'txt'"
              class="b-domain-add-modern__record-block"
            >
              <span class="b-domain-add-modern__label">TXT</span
              ><u-text-copy-box
                :value="domain_verification_txt_title"
                :message="$t('domains_modern.connection.host')"
                icon="content_copy"
                color="surface"
                :border="false"
                :copy-label="$t('domains_modern.connection.copy')"
                full-width
                small
                text-start
              /><u-text-copy-box
                :value="domain_verification_code"
                :message="$t('domains_modern.connection.verificationValue')"
                icon="content_copy"
                color="surface"
                :border="false"
                :copy-label="$t('domains_modern.connection.copy')"
                full-width
                small
                text-start
              />
            </div>
            <div v-else class="b-domain-add-modern__record-block">
              <u-text-copy-box
                :value="domain_verification_meta_tag"
                :message="$t('admin_shop.dashboard.info.add_dialog.ownership.meta_code')"
                icon="content_copy"
                color="surface"
                :border="false"
                :copy-label="$t('domains_modern.connection.copy')"
                full-width
                small
                text-start
              /><u-text-copy-box
                :value="domain_verification_url"
                :message="$t('admin_shop.dashboard.info.add_dialog.ownership.meta_url')"
                icon="content_copy"
                color="surface"
                :border="false"
                :copy-label="$t('domains_modern.connection.copy')"
                full-width
                small
                text-start
              />
            </div>
            <div
              v-if="externally_hosted && domain_error_msg"
              class="sd-modern-notice b-domain-add-modern__notice"
              role="alert"
            >
              <v-icon color="warning" size="18" aria-hidden="true">error_outline</v-icon
              >{{ domain_error_msg }}
            </div>
          </section>

          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Detected DNS records ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
          <section
            v-if="inDomainEditMode && !externally_hosted"
            class="b-domain-add-modern__section"
          >
            <div class="b-domain-add-modern__dns-heading">
              <div class="b-domain-add-modern__heading">
                <v-icon aria-hidden="true">dns</v-icon>
                <div>
                  <h3>{{ $t("domains_modern.connection.dns") }}</h3>
                  <p>{{ $t("domains_modern.connection.dnsHint") }}</p>
                </div>
                <v-tooltip
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                  open-on-click
                  ><template #activator="{ props }"
                    ><v-btn
                      v-bind="props"
                      icon
                      variant="text"
                      class="sd-modern-icon-button sd-modern-info-button"
                      :aria-label="$t('domains_modern.connection.dnsHelp')"
                      ><v-icon>info_outline</v-icon></v-btn
                    ></template
                  >{{ $t("domains_modern.connection.dnsHelp") }}</v-tooltip
                >
              </div>
              <v-btn
                variant="text"
                class="sd-modern-button sd-modern-button--small"
                :loading="busy_fetch_domain_data"
                @click="fetchNameServers()"
                ><v-icon start aria-hidden="true">refresh</v-icon
                >{{ $t("domains_modern.connection.refresh") }}</v-btn
              >
            </div>
            <div
              v-if="error_dns"
              class="sd-modern-notice b-domain-add-modern__notice"
              role="alert"
            >
              <v-icon color="warning" size="18" aria-hidden="true">error_outline</v-icon>
              <div>
                {{ $t("domains_modern.connection.dnsError") }}
                <div v-html="domain_error_msg"></div>
              </div>
            </div>
            <v-table
              v-if="dns?.length"
              class="sd-modern-table b-domain-add-modern__dns-table"
            >
              <thead>
                <tr>
                  <th>{{ $t("domains_modern.connection.type") }}</th>
                  <th>{{ $t("domains_modern.connection.value") }}</th>
                  <th>{{ $t("domains_modern.connection.status") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in dns_a" :key="'a' + index">
                  <td>A</td>
                  <td>
                    <div class="b-domain-add-modern__dns-value">
                      <bdi dir="ltr">{{ item.ip }}</bdi
                      ><v-tooltip
                        location="top"
                        content-class="sd-modern-tooltip text-start"
                        open-on-focus
                        ><template #activator="{ props }"
                          ><v-btn
                            v-bind="props"
                            icon
                            variant="text"
                            class="sd-modern-icon-button"
                            :aria-label="$t('domains_modern.connection.copy')"
                            @click="copyToClipboard(item.ip)"
                            ><v-icon>content_copy</v-icon></v-btn
                          ></template
                        >{{ $t("domains_modern.connection.copy") }}</v-tooltip
                      >
                    </div>
                  </td>
                  <td>
                    <span class="b-domain-add-modern__dns-status"
                      ><v-icon
                        :color="
                          SelldoneShopsHostIPs.includes(item.ip)
                            ? 'success'
                            : cdn || domain.approved
                              ? 'primary'
                              : 'warning'
                        "
                        size="14"
                        aria-hidden="true"
                        >{{
                          SelldoneShopsHostIPs.includes(item.ip) || cdn || domain.approved
                            ? "check"
                            : "warning_amber"
                        }}</v-icon
                      ><span v-if="SelldoneShopsHostIPs.includes(item.ip)">{{
                        $t("admin_shop.dashboard.info.add_dialog.correct")
                      }}</span
                      ><span v-else-if="cdn || domain.approved">CDN</span
                      ><span
                        v-else
                        v-html="
                          $t('admin_shop.dashboard.info.add_dialog.set_ip_alert', {
                            ip: SelldoneShopsHostIPs[0],
                          })
                        "
                      ></span
                    ></span>
                  </td>
                </tr>
                <tr v-for="(item, index) in dns_cname" :key="'cname' + index">
                  <td>CNAME</td>
                  <td>
                    <bdi dir="ltr">{{ item.target }}</bdi>
                  </td>
                  <td>
                    <span class="b-domain-add-modern__dns-status"
                      ><v-icon
                        :color="
                          SelldoneShopsHostCNAMEs.includes(item.target)
                            ? 'success'
                            : 'warning'
                        "
                        size="14"
                        aria-hidden="true"
                        >{{
                          SelldoneShopsHostCNAMEs.includes(item.target)
                            ? "check"
                            : "warning_amber"
                        }}</v-icon
                      ><span v-if="SelldoneShopsHostCNAMEs.includes(item.target)">{{
                        $t("admin_shop.dashboard.info.add_dialog.correct")
                      }}</span
                      ><span
                        v-else
                        v-html="
                          $t('admin_shop.dashboard.info.add_dialog.set_message', {
                            cname: SelldoneShopsHostCNAMEs[0],
                          })
                        "
                      ></span
                    ></span>
                  </td>
                </tr>
                <tr v-for="(item, index) in dns_ns" :key="'ns' + index">
                  <td>NS</td>
                  <td>
                    <bdi dir="ltr">{{ item.target }}</bdi>
                  </td>
                  <td>
                    <v-icon
                      color="primary"
                      size="14"
                      :aria-label="$t('domains_modern.connection.dns')"
                      >check</v-icon
                    >
                  </td>
                </tr>
              </tbody>
            </v-table>
            <p
              v-else-if="!busy_fetch_domain_data"
              class="b-domain-add-modern__empty"
              role="status"
            >
              {{ $t("domains_modern.connection.dnsEmpty") }}
            </p>
            <u-loading-ellipsis v-if="busy_fetch_domain_data" />
            <div class="sd-modern-notice b-domain-add-modern__notice">
              {{
                $t(
                  domain.ssl_proxy
                    ? "domains_modern.connection.secureDnsNote"
                    : "domains_modern.connection.dnsNote",
                )
              }}
            </div>
          </section>
          <section
            v-if="show_dns && !externally_hosted"
            class="b-domain-add-modern__section"
          >
            <h3>{{ $t("domains_modern.connection.dns") }}</h3>
            <div
              v-if="domain_error_msg"
              class="sd-modern-notice b-domain-add-modern__notice"
              role="alert"
            >
              <v-icon color="warning" size="18" aria-hidden="true">error_outline</v-icon>
              <div v-html="domain_error_msg"></div>
            </div>
            <p>{{ $t("domains_modern.connection.propagation") }}</p>
            <v-table class="sd-modern-table b-domain-add-modern__dns-table"
              ><thead>
                <tr>
                  <th>{{ $t("domains_modern.connection.host") }}</th>
                  <th>{{ $t("domains_modern.connection.type") }}</th>
                  <th>{{ $t("domains_modern.connection.recordValue") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in last_dns" :key="item.name">
                  <td>
                    <bdi dir="ltr">{{ item.host }}</bdi>
                  </td>
                  <td>{{ item.type }}</td>
                  <td>
                    <bdi dir="ltr">{{ item.target || item.txt || item.ip }}</bdi
                    ><v-icon
                      v-if="anyMatch(item)"
                      color="success"
                      size="14"
                      aria-hidden="true"
                      >check</v-icon
                    >
                  </td>
                </tr>
              </tbody></v-table
            >
          </section>

          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Provider setup and migration guidance ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
          <details
            v-if="!externally_hosted && !show_ssl_ips"
            class="b-domain-add-modern__guidance"
          >
            <summary>{{ $t("domains_modern.connection.cloudflare") }}</summary>
            <p>{{ $t("domains_modern.connection.cloudflareHelp") }}</p>
            <v-select
              v-model="provider"
              :items="providers"
              item-value="code"
              :return-object="false"
              :label="$t('domains_modern.connection.provider')"
              variant="underlined"
              class="sd-modern-underlined-field b-domain-add-modern__provider"
              ><template #selection="{ item }"
                ><img :src="item.raw.icon" alt="" width="20" height="20" class="me-2" />{{
                  item.raw.title
                }}</template
              ><template #item="{ item, props }"
                ><v-list-item v-bind="props" :title="item.title" class="text-start"
                  ><template #prepend
                    ><img
                      :src="item.raw.icon"
                      alt=""
                      width="20"
                      height="20"
                      class="me-2" /></template></v-list-item></template
            ></v-select>
            <template v-if="provider === 'cloudflare'">
              <div class="b-domain-add-modern__guide-actions">
                <v-btn
                  v-for="(key, index) in ['dnsGuide', 'sslGuide', 'migration']"
                  :key="key"
                  variant="text"
                  class="sd-modern-button sd-modern-button--small"
                  :aria-pressed="sample_tab === index + 1"
                  @click="sample_tab = index + 1"
                  >{{ $t("domains_modern.connection." + key) }}</v-btn
                >
              </div>
              <div class="b-domain-add-modern__guide-content">
                <p>
                  {{
                    $t(
                      "domains_modern.connection." +
                        (sample_tab === 1
                          ? "dnsGuideBody"
                          : sample_tab === 2
                            ? "sslGuideBody"
                            : "migrationBody"),
                    )
                  }}
                </p>
                <v-img
                  v-if="sample_tab === 1"
                  :aspect-ratio="3.29"
                  :src="require('../assets/cloudflare-dns.png')"
                  :alt="$t('domains_modern.connection.dnsGuide')"
                />
                <v-img
                  v-if="sample_tab === 2"
                  :aspect-ratio="1.47"
                  :src="require('../assets/cloudflare-ssl.png')"
                  :alt="$t('domains_modern.connection.sslGuide')"
                />
                <div v-if="sample_tab === 3">
                  <h3>{{ $t("domains_modern.connection.migrationQuestion") }}</h3>
                  <p>{{ $t("domains_modern.connection.migrationReady") }}</p>
                  <p>{{ $t("domains_modern.connection.migrationOldHost") }}</p>
                  <p>{{ $t("domains_modern.connection.migration503") }}</p>
                </div>
              </div>
            </template>
          </details>
        </template>
      </v-card-text>
      <v-card-actions class="b-domain-add-modern__footer">
        <div class="b-domain-add-modern__actions">
          <v-btn
            v-if="!inline"
            variant="text"
            class="sd-modern-button sd-modern-button--small"
            @click="close()"
            >{{ $t("global.actions.close") }}</v-btn
          >
          <v-btn
            v-if="inDomainEditMode"
            class="sd-modern-button sd-modern-button--small sd-modern-button--primary"
            color="primary"
            variant="flat"
            :loading="busy_update"
            @click="updateShopDomain('enable', input_domain, domain_enable)"
            ><v-icon start aria-hidden="true">save</v-icon
            >{{ $t("global.actions.update") }}</v-btn
          >
          <v-btn
            v-else
            class="sd-modern-button sd-modern-button--small sd-modern-button--primary"
            color="primary"
            variant="flat"
            :disabled="!is_valid_domain"
            :loading="busy_add"
            @click="setShopDomain()"
            ><v-icon start aria-hidden="true">add</v-icon
            >{{ $t("domains_modern.connection.connect") }}</v-btn
          >
        </div>
      </v-card-actions>
    </template>
    <template v-else>
    <v-card-title v-if="!inline && !modern">
      <v-icon class="me-1" color="#333"
        >{{ inDomainEditMode ? "public" : "travel_explore" }}
      </v-icon>
      {{ $t("admin_shop.dashboard.info.add_dialog.title") }}
    </v-card-title>
    <v-card-title v-if="!inline && modern" class="b-domain-add-modern__title">
      <h2>{{ $t(inDomainEditMode ? 'domains_modern.add.edit_title' : 'domains_modern.add.title') }}</h2>
      <v-tooltip location="top" content-class="sd-modern-tooltip text-start" open-on-focus>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button"
                 :aria-label="$t('global.actions.close')" @click="close()"><v-icon>close</v-icon></v-btn>
        </template>
        {{ $t('global.actions.close') }}
      </v-tooltip>
    </v-card-title>
    <div v-if="modern" class="b-domain-add-modern__subtitle">
      <span>{{ $t('domains_modern.add.subtitle') }}</span>
      <v-tooltip location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button sd-modern-info-button"
                 :aria-label="$t('domains_modern.add.help_label')"><v-icon>info_outline</v-icon></v-btn>
        </template>
        {{ $t('domains_modern.add.help') }}
      </v-tooltip>
    </div>

    <v-card-text class="position-relative thin-scroll">
      <div :class="{ 'text-black': !modern }">
        <v-expand-transition>
          <div :class="modern ? 'b-domain-add-modern__section b-domain-add-modern__identity' : 'widget-box -large mb-5'">
            <u-widget-header v-if="!modern" icon="looks_one" title="Domain">
              <template v-if="is_valid_domain" v-slot:append-title>
                <v-icon class="ms-1" color="success">check_circle</v-icon>
              </template>
              <template v-slot:actions> </template>
            </u-widget-header>

            <v-locale-provider :rtl="false">
              <v-text-field
                v-model="input_domain"
                :disabled="inDomainEditMode"
                :hint="
                  $t(
                    'admin_shop.dashboard.info.add_dialog.input_domain_message',
                  )
                "
                :label="modern ? $t('domains_modern.add.domain_label') : $t('admin_shop.dashboard.info.add_dialog.input_domain')"
                :rules="[GlobalRules.required()]"
                :class="modern ? 'english-field sd-modern-underlined-field b-domain-add-modern__input' : 'english-field strong-field'"
                :color="modern ? 'primary' : 'green'"
                placeholder="your-shop-domain.com"
                :single-line="!modern"
                :persistent-placeholder="modern"
                variant="underlined"
                @keydown.enter="setShopDomain()"
                messages=" "
              >
                <template v-slot:prepend-inner>
                  <span v-if="modern" class="b-domain-add-modern__prefix" dir="ltr">https://</span>
                  <b
                    v-else
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
                  <span v-if="modern" class="b-domain-add-modern__message">
                    <v-icon v-if="input_domain" :color="is_valid_domain ? 'success' : 'warning'" size="14" aria-hidden="true">
                      {{ is_valid_domain ? 'check' : 'error_outline' }}
                    </v-icon>
                    {{ $t(!input_domain ? 'domains_modern.add.example' : !is_valid_domain ? 'domains_modern.add.invalid' : is_wild_card ? 'domains_modern.add.wildcard' : is_subdomain ? 'domains_modern.add.subdomain' : 'domains_modern.add.root_domain') }}
                  </span>
                  <v-slide-x-reverse-transition v-else group leave-absolute>
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
              v-if="!externally_hosted"
              :model-value="show_ssl_message"
              :class="modern ? 'sd-modern-notice' : 'small font-weight-bold'"
              density="compact"
              text
              :type="modern ? undefined : 'success'"
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
          <div v-if="is_valid_domain">
            <div :class="modern ? 'b-domain-add-modern__section' : 'widget-box -large mb-5'">
              <h2 class=" ">
                <v-icon class="me-1">looks_two</v-icon>
                {{ $t("admin_shop.dashboard.info.add_dialog.hosting.title") }}
              </h2>
              <v-list-subheader>
                {{
                  $t("admin_shop.dashboard.info.add_dialog.hosting.subtitle")
                }}
              </v-list-subheader>

              <u-smart-select
                v-model="hosting_mode"
                :items="hosting_options"
                :readonly="inDomainEditMode"
                border
                class="my-4"
                force-show-all
                item-description="description"
                item-icon="icon"
                item-text="title"
                item-value="code"
              ></u-smart-select>

              <v-alert
                v-if="externally_hosted"
                class="external-domain-alert external-domain-alert--info mb-4"
                density="comfortable"
                :icon="false"
                role="status"
                variant="flat"
              >
                <template #prepend>
                  <span class="external-domain-alert__icon" aria-hidden="true">
                    <v-icon size="18">verified_user</v-icon>
                  </span>
                </template>

                <span class="external-domain-alert__text">
                  {{
                    $t(
                      "admin_shop.dashboard.info.add_dialog.hosting.external_note",
                    )
                  }}
                </span>
              </v-alert>

              <template
                v-if="!externally_hosted && (!inDomainEditMode || error_dns)"
              >
                <v-list-subheader>
                  {{ $t("admin_shop.dashboard.info.add_dialog.step1") }}
                </v-list-subheader>

                <u-smart-switch
                  v-if="has_ssl_proxy"
                  :model-value="!show_ssl_ips"
                  @update:model-value="show_ssl_ips = !$event"
                  class="my-3"
                  true-description="You can directly link your domain to Selldone, which necessitates a CDN for SSL issuance. This is an advantageous option when using CDN providers such as Cloudflare for domain hosting."
                  true-icon="cloud_done"
                  true-title="Direct Connect [Recommended]"
                  false-description="This option allows you to link your domain to Selldone via our secure CDN layer, removing the necessity for any external CDN. Employing external CDNs such as Cloudflare in conjunction with this setup may lead to conflicts and errors in SSL issuance."
                  false-icon="cloud"
                  false-title="Secure CDN + Issue SSL"
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
                  <p class="font-weight-black mb-1">
                    DNS Record type: <b>A</b>
                  </p>

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
              </template>
            </div>

            <div
              v-if="!inDomainEditMode || error_dns"
              :class="modern ? 'b-domain-add-modern__section' : 'widget-box -large mb-5'"
            >
              <h2 class=" ">
                <v-icon class="me-1">looks_3</v-icon>
                {{
                  externally_hosted
                    ? $t("admin_shop.dashboard.info.add_dialog.ownership.title")
                    : "Verification"
                }}
              </h2>
              <v-list-subheader>
                {{
                  externally_hosted
                    ? $t(
                        "admin_shop.dashboard.info.add_dialog.ownership.subtitle",
                      )
                    : $t("admin_shop.dashboard.info.add_dialog.step2")
                }}
              </v-list-subheader>

              <u-smart-select
                v-if="externally_hosted"
                v-model="verification_method"
                :items="verification_options"
                border
                class="my-4"
                force-show-all
                item-description="description"
                item-icon="icon"
                item-text="title"
                item-value="code"
              ></u-smart-select>

              <div
                v-if="!externally_hosted || verification_method === 'txt'"
                class="border-seft-thick-blue"
                dir="ltr"
              >
                <p class="font-weight-black mb-1">
                  DNS Record type: <b>TXT</b>
                </p>

                <u-text-copy-box
                  :value="domain_verification_txt_title"
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

              <div
                v-if="externally_hosted && verification_method === 'meta'"
                class="border-seft-thick-blue"
                dir="ltr"
              >
                <p class="font-weight-black mb-1">
                  {{
                    $t(
                      "admin_shop.dashboard.info.add_dialog.ownership.meta_title",
                    )
                  }}
                </p>

                <u-text-copy-box
                  :message="
                    $t(
                      'admin_shop.dashboard.info.add_dialog.ownership.meta_code',
                    )
                  "
                  :value="domain_verification_meta_tag"
                  class="my-2"
                  full-width
                ></u-text-copy-box>

                <u-text-copy-box
                  :message="
                    $t(
                      'admin_shop.dashboard.info.add_dialog.ownership.meta_url',
                    )
                  "
                  :value="domain_verification_url"
                  class="my-2"
                  full-width
                ></u-text-copy-box>
              </div>

              <v-alert
                v-if="externally_hosted && domain_error_msg"
                class="external-domain-alert external-domain-alert--warning mt-4"
                density="comfortable"
                :icon="false"
                role="alert"
                variant="flat"
              >
                <template #prepend>
                  <span class="external-domain-alert__icon" aria-hidden="true">
                    <v-icon size="18">priority_high</v-icon>
                  </span>
                </template>

                <div class="external-domain-alert__text">
                  {{ domain_error_msg }}
                </div>
              </v-alert>

              <template v-if="!externally_hosted && !show_ssl_ips">
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
            v-if="inDomainEditMode && !externally_hosted"
            :class="modern ? 'b-domain-add-modern__section' : 'widget-box -large mb-5 min-height-20vh'"
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
          <div v-if="show_dns" :class="modern ? 'b-domain-add-modern__section' : 'widget-box -large mb-5'" dir="ltr">
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
      <div :class="modern ? 'b-domain-add-modern__actions' : 'widget-buttons'">
        <!-- Action > Delete -->

        <!-- Action > Close -->
        <v-btn v-if="!inline" :class="{ 'sd-modern-button': modern }" size="x-large" variant="text" @click="close()">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <!-- Action > Edit -->

        <v-btn
          v-if="inDomainEditMode"
          :class="{ 'sd-modern-button': modern }"
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
          :class="{ disabled: !is_valid_domain, 'sd-modern-button': modern }"
          :loading="busy_add"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="setShopDomain()"
        >
          <v-icon start> add_box</v-icon>
          {{ $t(modern ? 'domains_modern.list.add' : 'global.actions.add') }}
        </v-btn>
      </div>
    </v-card-actions>

    </template>
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
import USmartSelect from "../../../ui/smart/select/USmartSelect.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import UPodsPanel from "../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../ui/pod/wire/UPodWire.vue";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BDomainAdd",
  mixins: [],
  emits: ["add", "update", "click:close"],
  components: {
    ULoadingEllipsis,
    UPodWire,
    UPodNode,
    UPodsPanel,
    USmartSelect,
    USmartSwitch,
    UTextCopyBox,
    BShopLicenseBlockOverlay,
  },
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
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

    externally_hosted: false,
    verification_method: "meta",

    hosting_options: [
      {
        code: "selldone",
        title: "admin_shop.dashboard.info.add_dialog.hosting.selldone_title",
        description:
          "admin_shop.dashboard.info.add_dialog.hosting.selldone_description",
        icon: "storefront",
      },
      {
        code: "external",
        title: "admin_shop.dashboard.info.add_dialog.hosting.external_title",
        description:
          "admin_shop.dashboard.info.add_dialog.hosting.external_description",
        icon: "open_in_new",
      },
    ],
    verification_options: [
      {
        code: "meta",
        title: "admin_shop.dashboard.info.add_dialog.ownership.meta_title",
        description:
          "admin_shop.dashboard.info.add_dialog.ownership.meta_description",
        icon: "html",
      },
      {
        code: "txt",
        title: "admin_shop.dashboard.info.add_dialog.ownership.txt_title",
        description:
          "admin_shop.dashboard.info.add_dialog.ownership.txt_description",
        icon: "dns",
      },
    ],

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
    modern_hosting_options() {
      return this.hosting_options.map((option) => ({
        ...option,
        title: option.code === "external" ? "domains_modern.connection.external" : "domains_modern.connection.hosted",
        description: option.code === "external" ? "domains_modern.connection.externalDesc" : "domains_modern.connection.hostedDesc",
      }));
    },
    hosting_mode: {
      get() {
        return this.externally_hosted ? "external" : "selldone";
      },
      set(value) {
        this.externally_hosted = value === "external";
        if (this.externally_hosted) this.show_ssl_ips = false;

        this.domain_error_msg = null;
        this.last_dns = null;
        this.show_dns = false;
      },
    },

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
    domain_verification_txt_title() {
      if (this.externally_hosted) {
        const verificationHost = this.domain_verification_title;
        const relativeHost =
          verificationHost === "@" || verificationHost === "*"
            ? null
            : verificationHost.replace(/^\*\./, "");

        return relativeHost
          ? "_selldone-verification." + relativeHost
          : "_selldone-verification";
      }

      return (
        this.domain_verification_title + (this.is_subdomain ? "-challenge" : "")
      );
    },
    domain_verification_meta_tag() {
      return (
        '<meta name="selldone-domain-verification" content="' +
        this.shop.hash_id +
        '">'
      );
    },
    domain_verification_url() {
      const domain = this.is_wild_card
        ? this.input_domain?.substring(2)
        : this.input_domain;

      return domain ? "https://" + domain + "/" : null;
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

  watch: {
    verification_method() {
      this.domain_error_msg = null;
      this.last_dns = null;
      this.show_dns = false;
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

            this.externally_hosted = !!(
              data.domain?.externally_hosted ?? data.externally_hosted
            );
            if (this.externally_hosted) this.show_ssl_ips = false;

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
          ssl_proxy: !this.externally_hosted && this.show_ssl_ips,
          externally_hosted: this.externally_hosted,
          verification_method: this.externally_hosted
            ? this.verification_method
            : "txt",
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

            this.last_dns = this.externally_hosted ? null : data.dns;
            this.show_dns = !this.externally_hosted && !!data.dns;
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
    this.externally_hosted = this.inDomainEditMode
      ? !!this.domain?.externally_hosted
      : false;

    // Default add mode to Direct connect, keep current mode in edit.
    this.show_ssl_ips =
      this.inDomainEditMode && !this.externally_hosted
        ? !!this.domain?.ssl_proxy
        : false;

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

<style scoped>
.external-domain-alert {
  background: rgba(var(--v-theme-surface), 0.82) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 14px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(var(--v-theme-on-surface), 0.035);
  color: rgb(var(--v-theme-on-surface)) !important;
  backdrop-filter: blur(14px) saturate(130%);
}

.external-domain-alert :deep(.v-alert__prepend) {
  align-self: flex-start;
  margin-top: 1px;
}

.external-domain-alert :deep(.v-alert__content) {
  color: inherit;
  letter-spacing: 0.002em;
  line-height: 1.5;
}

.external-domain-alert__icon {
  align-items: center;
  border-radius: 50%;
  display: inline-flex;
  height: 30px;
  justify-content: center;
  width: 30px;
}

.external-domain-alert__text {
  color: inherit;
}

.external-domain-alert--info .external-domain-alert__icon {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.external-domain-alert--warning .external-domain-alert__icon {
  background: rgba(var(--v-theme-warning), 0.16);
  color: rgb(var(--v-theme-on-surface));
}

.b-domain-add-modern.v-card {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  padding: 24px;
  border: 1px solid var(--sd-modern-border, rgba(var(--v-theme-on-surface), 0.09));
  border-radius: 20px !important;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
}
.b-domain-add-modern__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--sd-modern-border);
}
.b-domain-add-modern__header > div {
  min-width: 0;
}
.b-domain-add-modern h2 {
  margin: 0;
  font-family: inherit;
  font-size: 18px;
  font-weight: 500;
  line-height: 26px;
}
.b-domain-add-modern h3 {
  margin: 0;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  line-height: 23px;
}
.b-domain-add-modern p {
  margin: 5px 0 0;
  color: var(--sd-modern-muted);
  font-size: 12px;
  font-weight: 400;
  line-height: 19px;
}
.b-domain-add-modern.v-card > .b-domain-add-modern__body.v-card-text {
  padding: 0;
  font: inherit;
  letter-spacing: 0;
}
.b-domain-add-modern__section {
  padding-top: 22px;
}
.b-domain-add-modern__section + .b-domain-add-modern__section {
  margin-top: 22px;
  border-top: 1px solid var(--sd-modern-border);
}
.b-domain-add-modern__heading {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 16px;
}
.b-domain-add-modern__heading > .v-icon {
  flex: none;
  margin-top: 4px;
  color: var(--sd-modern-muted);
  font-size: 16px;
}
.b-domain-add-modern__heading > div {
  flex: 1;
  min-width: 0;
}
.b-domain-add-modern__heading > .sd-modern-info-button {
  margin-top: 20px;
}
.b-domain-add-modern__identity-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.b-domain-add-modern__identity-grid--single {
  grid-template-columns: minmax(0, 1fr);
}
.b-domain-add-modern__label {
  display: block;
  margin-bottom: 7px;
  color: var(--sd-modern-muted);
  font-size: 11px;
  font-weight: 400;
  line-height: 17px;
}
.b-domain-add-modern__address {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 43px;
  border-bottom: 1px solid var(--sd-modern-border);
}
.b-domain-add-modern__address > span,
.b-domain-add-modern__prefix {
  color: var(--sd-modern-muted);
  font-size: 12px;
  font-weight: 400;
  line-height: 19px;
}
.b-domain-add-modern__address bdi {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}
.b-domain-add-modern__input :deep(.v-field__input) {
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}
.b-domain-add-modern__message {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: rgb(var(--v-theme-on-surface));
  font-size: 11px;
  line-height: 17px;
}
.b-domain-add-modern__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 7px;
  color: var(--sd-modern-muted);
  font-size: 11px;
  line-height: 17px;
}
.b-domain-add-modern__callback {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 18px;
  color: var(--sd-modern-muted);
  font-size: 11px;
  line-height: 17px;
}
.b-domain-add-modern__callback > .v-icon {
  margin-top: 2px;
  font-size: 14px;
}
.b-domain-add-modern__callback > div {
  flex: 1;
  min-width: 0;
}
.b-domain-add-modern__callback bdi {
  display: block;
  overflow-wrap: anywhere;
  color: rgb(var(--v-theme-on-surface));
  font-size: 12px;
  line-height: 19px;
}
.b-domain-add-modern__approved {
  display: flex;
  align-items: flex-start;
  gap: 5px;
}
.b-domain-add-modern__ssl {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding-top: 16px;
  font-size: 12px;
  line-height: 19px;
}
.b-domain-add-modern__ssl > .v-icon {
  margin-top: 2px;
  color: var(--sd-modern-muted);
  font-size: 16px;
}
.b-domain-add-modern__ssl p {
  margin-top: 2px;
  font-size: 11px;
  line-height: 17px;
}
.b-domain-add-modern__setup {
  padding-top: 18px;
}
.b-domain-add-modern__setup .sd-modern-smart-select {
  margin-top: 14px;
}
.b-domain-add-modern__pods {
  overflow-x: auto;
  margin-block: 16px;
}
.b-domain-add-modern__record-block {
  margin-top: 14px;
  padding: 12px;
  border: 1px solid var(--sd-modern-border);
  border-radius: 12px;
}
.b-domain-add-modern__record-block :deep(.s--value-copy-box) {
  margin-top: 8px;
}
.b-domain-add-modern__record-block :deep(.link-box) {
  min-height: 40px;
  background: transparent !important;
  border: 0;
  border-radius: 0;
}
.b-domain-add-modern__record-block :deep(.-link) {
  min-width: 0;
  padding: 0 8px;
  font-family: inherit;
  font-size: 12px;
  line-height: 19px;
  overflow-wrap: anywhere;
}
.b-domain-add-modern__record-block :deep(.-link .small) {
  font-size: 11px;
  line-height: 17px;
}
.b-domain-add-modern__record-block :deep(.-btn.v-btn) {
  flex: none;
  width: 32px;
  min-width: 32px;
  height: 32px !important;
  min-height: 32px !important;
  margin: 0;
  padding: 0;
  border: 1px solid var(--sd-modern-border);
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-shadow: none;
}
.b-domain-add-modern__record-block :deep(.-btn .v-icon) {
  font-size: 16px;
}
.b-domain-add-modern__dns-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.b-domain-add-modern__dns-heading .b-domain-add-modern__heading {
  flex: 1;
  margin: 0;
}
.b-domain-add-modern__dns-table {
  margin-top: 16px;
  background: transparent;
}
.b-domain-add-modern__dns-table :deep(table) {
  width: 100%;
  table-layout: fixed;
}
.b-domain-add-modern__dns-table :deep(th:first-child) {
  width: 12%;
}
.b-domain-add-modern__dns-table :deep(th:nth-child(2)) {
  width: 50%;
}
.b-domain-add-modern__dns-table :deep(th:last-child) {
  width: 38%;
}
.b-domain-add-modern__dns-table :deep(tbody td) {
  padding: 9px 8px;
  height: auto;
  overflow-wrap: anywhere;
  font-size: 12px;
  font-weight: 400;
  line-height: 19px;
}
.b-domain-add-modern__dns-table :deep(thead th) {
  padding: 0 8px 10px;
  height: auto;
}
.b-domain-add-modern__dns-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.b-domain-add-modern__dns-value bdi {
  min-width: 0;
  overflow-wrap: anywhere;
}
.b-domain-add-modern__dns-status {
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  line-height: 17px;
}
.b-domain-add-modern__dns-status > .v-icon {
  flex: none;
  margin-top: 1px;
}
.b-domain-add-modern__empty {
  padding-block: 18px;
}
.b-domain-add-modern__notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  padding: 12px;
  font-size: 12px;
  line-height: 19px;
}
.b-domain-add-modern__notice > .v-icon {
  flex: none;
  margin-top: 1px;
}
.b-domain-add-modern__guidance {
  margin-top: 16px;
  color: var(--sd-modern-muted);
  font-size: 12px;
  line-height: 19px;
}
.b-domain-add-modern__guidance summary {
  min-height: 28px;
}
.b-domain-add-modern__provider {
  max-width: 260px;
  margin-top: 12px;
}
.b-domain-add-modern__guide-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.b-domain-add-modern__guide-content {
  margin-top: 12px;
  color: rgb(var(--v-theme-on-surface));
}
.b-domain-add-modern__guide-content .v-img {
  margin-top: 14px;
}
.b-domain-add-modern__footer.v-card-actions {
  margin-top: 24px;
  padding: 20px 0 0;
  border-top: 1px solid var(--sd-modern-border);
}
.b-domain-add-modern__actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}
.b-domain-add-modern__actions .sd-modern-button {
  border-radius: 10px;
}
.b-domain-add-modern :deep(.sd-modern-button--small) {
  padding: 8px 13px;
  line-height: 18px;
}
.b-domain-add-modern :deep(.sd-modern-button--small .v-icon) {
  font-size: 16px;
}
@media (max-width: 600px) {
  .b-domain-add-modern.v-card {
    padding: 20px 15px;
    border-radius: 16px !important;
  }
  .b-domain-add-modern__identity-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
  .b-domain-add-modern__heading > .sd-modern-info-button {
    margin-top: 0;
  }
  .b-domain-add-modern__input :deep(.v-field__input) {
    font-size: 16px;
  }
  .b-domain-add-modern__dns-heading {
    flex-wrap: wrap;
  }
  .b-domain-add-modern__dns-table :deep(th:first-child) {
    width: 16%;
  }
  .b-domain-add-modern__dns-table :deep(th:nth-child(2)) {
    width: 50%;
  }
  .b-domain-add-modern__dns-table :deep(th:last-child) {
    width: 34%;
  }
  .b-domain-add-modern__dns-table :deep(td),
  .b-domain-add-modern__dns-table :deep(th) {
    padding-inline: 4px;
  }
  .b-domain-add-modern__dns-value {
    flex-wrap: wrap;
    gap: 4px;
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .b-domain-add-modern__record-block :deep(.-btn.v-btn) {
    width: 44px;
    min-width: 44px;
    height: 44px !important;
    min-height: 44px !important;
  }
}
</style>
