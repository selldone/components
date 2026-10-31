<template>
  <div
    class="b-domain-workspace sd-modern-content text-start"
    :aria-busy="isBusy"
  >
    <header class="b-domain-workspace__heading">
      <div class="b-domain-workspace__heading-copy">
        <v-icon size="23" aria-hidden="true">{{ sectionIcon }}</v-icon>
        <div>
          <h1>{{ $t(`domains_modern.workspace.${section}Title`) }}</h1>
          <p>{{ $t(`domains_modern.workspace.${section}Subtitle`) }}</p>
        </div>
      </div>
      <span v-if="section === 'overview'" class="b-domain-workspace__meta">{{
        $t("domains_modern.workspace.health.diagnostics")
      }}</span>
    </header>

    <div v-if="!canWrite" class="sd-modern-notice" role="status">
      <v-icon size="18" aria-hidden="true">{{
        eligible ? "visibility" : "lock_outline"
      }}</v-icon>
      <div class="sd-modern-notice__content">
        {{
          $t(
            eligible
              ? "domains_modern.workspace.readOnly"
              : "domains_modern.workspace.licenseNotice",
          )
        }}
      </div>
    </div>
    <div
      v-if="operationError && !quickField"
      class="sd-modern-notice"
      role="alert"
    >
      <v-icon size="18" color="error" aria-hidden="true">error_outline</v-icon>
      <div class="sd-modern-notice__content">{{ operationError }}</div>
    </div>
    <div v-if="operationMessage" class="sd-modern-notice" role="status">
      <v-icon size="18" aria-hidden="true">info_outline</v-icon>
      <div class="sd-modern-notice__content">{{ operationMessage }}</div>
    </div>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Overview ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <template v-if="section === 'overview'">
      <div class="b-domain-workspace__overview-grid">
        <div class="b-domain-workspace__overview-column">
          <section
            class="sd-modern-widget b-domain-workspace__widget b-domain-workspace__health"
            aria-live="polite"
          >
            <div class="b-domain-workspace__health-status">
              <span class="sd-modern-status sd-modern-status--plain"
                ><span
                  class="sd-modern-status__dot"
                  :class="
                    healthSummary.tone
                      ? 'sd-modern-status__dot--' + healthSummary.tone
                      : undefined
                  "
                />{{
                  $t("domains_modern.workspace.health." + healthSummary.label)
                }}</span
              >
              <span class="b-domain-workspace__eyebrow">{{
                $t("domains_modern.workspace.health." + healthSummary.source)
              }}</span>
            </div>
            <h2>
              {{
                $t(
                  "domains_modern.workspace.health.states." +
                    healthSummary.state +
                    "Title",
                )
              }}
            </h2>
            <p class="b-domain-workspace__health-description">
              {{
                $t(
                  "domains_modern.workspace.health.states." +
                    healthSummary.state +
                    "Hint",
                )
              }}
            </p>
            <div class="b-domain-workspace__health-actions">
              <v-btn
                v-if="healthSummary.action === 'open'"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                variant="flat"
                color="primary"
                class="sd-modern-button sd-modern-button--primary b-domain-workspace__health-action"
                append-icon="north_east"
                >{{
                  $t("domains_modern.workspace.health.openStorefront")
                }}</v-btn
              >
              <v-btn
                v-else
                variant="flat"
                color="primary"
                class="sd-modern-button sd-modern-button--primary b-domain-workspace__health-action"
                :prepend-icon="healthSummary.icon"
                :loading="busy === 'dns' && healthSummary.action === 'check'"
                :disabled="
                  ['check', 'enable'].includes(healthSummary.action) &&
                  (!canWrite || isBusy)
                "
                @click="runHealthAction($event)"
                >{{
                  $t("domains_modern.workspace.health." + healthSummary.button)
                }}</v-btn
              >
              <v-btn
                v-if="healthSummary.action === 'check'"
                variant="text"
                color="primary"
                class="sd-modern-button sd-modern-button--inline"
                @click="navigate('connection')"
                >{{ $t("domains_modern.workspace.health.setupDetails")
                }}<v-icon end size="16" aria-hidden="true">{{
                  $t("icons.chevron_next")
                }}</v-icon></v-btn
              >
            </div>
            <p class="b-domain-workspace__health-note">
              <v-icon size="16" aria-hidden="true">info_outline</v-icon
              ><span>{{
                $t("domains_modern.workspace.health.separateChecks")
              }}</span>
            </p>
          </section>
          <section class="sd-modern-widget b-domain-workspace__widget">
            <header class="b-domain-workspace__widget-heading">
              <v-icon size="18" aria-hidden="true">tune</v-icon>
              <div>
                <h2>
                  {{ $t("domains_modern.workspace.health.settingsTitle") }}
                </h2>
                <p>
                  {{ $t("domains_modern.workspace.health.settingsSubtitle") }}
                </p>
              </div>
            </header>
            <div class="b-domain-workspace__overview-list">
              <div
                v-for="row in overviewRows"
                :key="row.key"
                class="b-domain-workspace__overview-row-wrap"
              >
                <div class="b-domain-workspace__overview-row">
                  <v-icon size="18" aria-hidden="true">{{ row.icon }}</v-icon>
                  <div class="b-domain-workspace__overview-row-copy">
                    <h3>{{ row.title }}</h3>
                    <p>{{ row.value }}</p>
                  </div>
                  <v-btn
                    v-if="row.quick"
                    variant="text"
                    color="primary"
                    class="sd-modern-button sd-modern-button--inline"
                    :disabled="!canWrite || isBusy"
                    @click="openQuickEdit(row.quick, $event)"
                    >{{ $t("domains_modern.workspace.health.change")
                    }}<v-icon end size="16" aria-hidden="true">{{
                      $t("icons.chevron_next")
                    }}</v-icon></v-btn
                  >
                  <v-btn
                    v-else
                    variant="text"
                    color="primary"
                    class="sd-modern-button sd-modern-button--inline"
                    @click="navigate(row.section, row.setting)"
                    >{{
                      $t(
                        "domains_modern.workspace.health." +
                          (row.change ? "change" : "view"),
                      )
                    }}<v-icon end size="16" aria-hidden="true">{{
                      $t("icons.chevron_next")
                    }}</v-icon></v-btn
                  >
                </div>
              </div>
              <div
                v-if="!isExternal && !sitemapUrl.includes('*')"
                class="b-domain-workspace__overview-row-wrap"
              >
                <div class="b-domain-workspace__overview-row b-domain-workspace__overview-sitemap">
                  <v-icon size="18" aria-hidden="true">account_tree</v-icon>
                  <div class="b-domain-workspace__overview-row-copy">
                    <h3>{{ $t("domains_modern.workspace.sitemapAddress") }}</h3>
                    <p>
                      <a :href="sitemapUrl" target="_blank" rel="noopener noreferrer" class="b-domain-workspace__sitemap-link">
                        <bdi dir="ltr">{{ sitemapUrl }}</bdi>
                        <v-icon size="14" aria-hidden="true">north_east</v-icon>
                      </a>
                    </p>
                  </div>
                  <v-btn
                    icon
                    variant="text"
                    class="sd-modern-icon-button"
                    :aria-label="$t('domains_modern.workspace.copySitemap')"
                    @click.stop="copyToClipboard(sitemapUrl)"
                  >
                    <v-icon size="16">content_copy</v-icon>
                    <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">
                      {{ $t("domains_modern.workspace.copySitemap") }}
                    </v-tooltip>
                  </v-btn>
                </div>
              </div>
            </div>
          </section>
        </div>
        <aside class="b-domain-workspace__overview-column">
          <section class="sd-modern-widget b-domain-workspace__widget">
            <header class="b-domain-workspace__widget-heading">
              <v-icon size="18" aria-hidden="true">desktop_windows</v-icon>
              <div>
                <h2>
                  {{ $t("domains_modern.workspace.health.customerView") }}
                </h2>
                <p>
                  {{
                    $t(
                      "domains_modern.workspace.health." +
                        (isExternal ? "externalHint" : "hostedHint"),
                    )
                  }}
                </p>
              </div>
            </header>
            <b-domain-storefront-preview
              :shop="shop"
              :address="address"
              :home="configuredHome"
              :external="isExternal"
            />
            <dl class="b-domain-workspace__preview-facts">
              <div>
                <dt>{{ $t("domains_modern.list.home") }}</dt>
                <dd>{{ homeLabel }}</dd>
              </div>
              <div>
                <dt>{{ $t("domains_modern.workspace.health.primary") }}</dt>
                <dd>
                  {{
                    $t(
                      "domains_modern.workspace.health." +
                        (item.primary ? "primaryYes" : "primaryNo"),
                    )
                  }}
                </dd>
              </div>
            </dl>
            <v-btn
              variant="text"
              color="primary"
              class="sd-modern-button sd-modern-button--inline b-domain-workspace__preview-manage"
              @click="navigate('storefront')"
              >{{ $t("domains_modern.workspace.health.manageStorefront")
              }}<v-icon end size="16" aria-hidden="true">{{
                $t("icons.chevron_next")
              }}</v-icon></v-btn
            >
          </section>
          <section class="sd-modern-widget b-domain-workspace__widget">
            <header class="b-domain-workspace__widget-heading">
              <v-icon size="18" aria-hidden="true">translate</v-icon>
              <div>
                <h2>{{ $t("domains_modern.workspace.health.scopeTitle") }}</h2>
                <p>{{ $t("domains_modern.workspace.health.scopeSubtitle") }}</p>
              </div>
            </header>
            <div class="b-domain-workspace__overview-list">
              <div
                v-for="scope in [
                  {
                    key: 'languages',
                    icon: 'language',
                    value: languageSummary,
                  },
                  {
                    key: 'currencies',
                    icon: 'payments',
                    value: currencySummary,
                  },
                ]"
                :key="scope.key"
                class="b-domain-workspace__overview-row-wrap"
              >
                <div class="b-domain-workspace__overview-row">
                  <v-icon size="18" aria-hidden="true">{{ scope.icon }}</v-icon>
                  <div class="b-domain-workspace__overview-row-copy">
                    <h3>{{ $t("domains_modern.setting." + scope.key) }}</h3>
                    <p>{{ scope.value }}</p>
                  </div>
                  <v-btn
                    v-if="isCustom"
                    variant="text"
                    color="primary"
                    class="sd-modern-button sd-modern-button--inline"
                    @click="navigate('settings', 'scope')"
                    >{{ $t("global.actions.edit")
                    }}<v-icon end size="16" aria-hidden="true">{{
                      $t("icons.chevron_next")
                    }}</v-icon></v-btn
                  >
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
      <section class="sd-modern-widget b-domain-workspace__widget">
        <header class="b-domain-workspace__widget-heading">
          <v-icon size="18" aria-hidden="true">route</v-icon>
          <div>
            <h2>{{ $t("domains_modern.workspace.health.howTitle") }}</h2>
            <p>{{ $t("domains_modern.workspace.health.howSubtitle") }}</p>
          </div>
        </header>
        <b-domain-workspace-flow
          :shop="shop"
          :item="item"
          @navigate="navigate"
        />
      </section>
    </template>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Connection, ownership and SSL ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <template v-if="section === 'connection'">
      <section
        v-if="!isCustom"
        class="sd-modern-widget b-domain-workspace__widget"
      >
        <header class="b-domain-workspace__widget-heading">
          <v-icon size="18" aria-hidden="true">verified_user</v-icon>
          <div>
            <h2>{{ $t("domains_modern.workspace.hostedConnection") }}</h2>
            <p>{{ $t("domains_modern.workspace.hostedConnectionHint") }}</p>
          </div>
        </header>
      </section>
      <template v-else>
        <section class="sd-modern-widget b-domain-workspace__widget">
          <header class="b-domain-workspace__widget-heading">
            <v-icon size="18" aria-hidden="true">dns</v-icon>
            <div>
              <h2>
                {{
                  $t(
                    isExternal
                      ? "domains_modern.connection.verification"
                      : secure
                        ? "domains_modern.connection.secure"
                        : "domains_modern.connection.direct",
                  )
                }}
              </h2>
              <p>
                {{
                  $t(
                    isExternal
                      ? "domains_modern.connection.externalNote"
                      : secure
                        ? "domains_modern.connection.sslSecureHint"
                        : "domains_modern.connection.sslOwnHint",
                  )
                }}
              </p>
            </div>
          </header>
          <div v-if="!isExternal" class="b-domain-workspace__connection-steps">
            <div class="b-domain-workspace__connection-step">
              <span class="b-domain-workspace__step-number">1</span>
              <div>
                <h3>
                  {{
                    $t("domains_modern.workspace.health.dnsStepProviderTitle")
                  }}
                </h3>
                <p>
                  {{
                    $t("domains_modern.workspace.health.dnsStepProviderHint")
                  }}
                </p>
              </div>
            </div>
            <div class="b-domain-workspace__connection-step">
              <span class="b-domain-workspace__step-number">2</span>
              <div>
                <h3>
                  {{
                    $t("domains_modern.workspace.health.dnsStepRecordsTitle")
                  }}
                </h3>
                <p>
                  {{ $t("domains_modern.workspace.health.dnsStepRecordsHint") }}
                </p>
              </div>
            </div>
          </div>
          <v-radio-group
            v-if="canUseCname"
            v-model="routeType"
            inline
            hide-details
            class="b-domain-workspace__record-choice"
            :aria-label="$t('domains_modern.connection.requiredRecords')"
            ><v-radio label="A" value="A" /><v-radio
              label="CNAME"
              value="CNAME"
          /></v-radio-group>
          <v-select
            v-if="canUseCname && routeType === 'CNAME' && cnames.length > 1"
            v-model="cnameTarget"
            :items="cnames"
            label="CNAME"
            variant="underlined"
            hide-details
            class="sd-modern-underlined-field mt-4"
          />
          <v-radio-group
            v-if="isExternal"
            v-model="verificationMethod"
            inline
            hide-details
            class="b-domain-workspace__record-choice"
            :aria-label="$t('domains_modern.workspace.ownershipMethod')"
            ><v-radio
              :label="$t('domains_modern.connection.meta')"
              value="meta" /><v-radio
              :label="$t('domains_modern.connection.txt')"
              value="txt"
          /></v-radio-group>
          <b-domain-dns-records
            v-if="requiredRecords.length"
            :records="requiredRecords"
            class="mt-4"
          />
          <template v-if="isExternal && verificationMethod === 'meta'"
            ><p class="b-domain-workspace__section-help">
              {{ $t("domains_modern.connection.metaDesc") }}
            </p>
            <pre
              class="b-domain-workspace__code"
              v-copy
              dir="ltr"
              tabindex="0"
              >{{ verificationMeta }}</pre
            >
            <p>
              <bdi dir="ltr">{{ verificationUrl }}</bdi>
            </p></template
          >
          <p class="b-domain-workspace__section-help">
            {{ $t("domains_modern.connection.verifyHelp") }}
          </p>
          <div v-if="!isExternal" class="b-domain-workspace__connection-check">
            <div class="b-domain-workspace__connection-step">
              <span class="b-domain-workspace__step-number">3</span>
              <div>
                <h3>
                  {{ $t("domains_modern.workspace.health.dnsStepCheckTitle") }}
                </h3>
                <p>
                  {{ $t("domains_modern.workspace.health.dnsStepCheckHint") }}
                </p>
              </div>
            </div>
            <v-btn
              variant="flat"
              color="primary"
              class="sd-modern-button sd-modern-button--primary"
              prepend-icon="network_check"
              :loading="busy === 'dns'"
              :disabled="!canWrite || isBusy"
              @click="checkDns"
              >{{ $t("domains_modern.workspace.health.checkDns") }}</v-btn
            >
          </div>
          <div
            v-if="dnsError || dnsMessage"
            class="sd-modern-notice mt-4 b-domain-workspace__dns-result"
            :role="dnsError ? 'alert' : 'status'"
          >
            <v-icon
              size="18"
              :color="
                dnsError
                  ? 'error'
                  : dnsCheckState === 'accepted'
                    ? 'success'
                    : undefined
              "
              aria-hidden="true"
              >{{
                dnsError
                  ? "error_outline"
                  : dnsCheckState === "accepted"
                    ? "check"
                    : "info_outline"
              }}</v-icon
            >
            <div class="sd-modern-notice__content">
              {{ dnsError || dnsMessage }}
            </div>
          </div>
          <b-domain-dns-feedback
            v-if="detectedDns !== null"
            :expected="feedbackRecords"
            :detected="detectedDns"
            :domain="address"
            :secure="secure"
            :verification="dnsVerification"
            class="mt-5"
          />
          <p
            v-else-if="dnsCheckState === 'notChecked' && busy !== 'dns'"
            class="b-domain-workspace__section-help"
            role="status"
          >
            {{ $t("domains_modern.workspace.dnsNotChecked") }}
          </p>
          <b-domain-cloudflare-setup
            v-if="requiredRecords.length"
            :domain="address"
            :records="requiredRecords"
            :disabled="!canWrite || isBusy"
          />
          <details v-if="!isExternal" class="b-domain-workspace__guidance">
            <summary>{{ $t("domains_modern.connection.cloudflare") }}</summary>
            <p>{{ $t("domains_modern.connection.dnsGuideBody") }}</p>
            <v-img
              :src="require('../assets/cloudflare-dns.png')"
              :alt="$t('domains_modern.connection.dnsGuide')"
              :aspect-ratio="3.29"
              class="mt-4"
            />
            <p>{{ $t("domains_modern.connection.sslGuideBody") }}</p>
            <v-img
              v-if="!secure"
              :src="require('../assets/cloudflare-ssl.png')"
              :alt="$t('domains_modern.connection.sslGuide')"
              :aspect-ratio="1.47"
              class="mt-4"
            />
            <h3>{{ $t("domains_modern.connection.migration") }}</h3>
            <p>{{ $t("domains_modern.connection.migrationReady") }}</p>
            <p>{{ $t("domains_modern.connection.migrationOldHost") }}</p>
            <p>{{ $t("domains_modern.connection.migration503") }}</p>
          </details>
        </section>
        <section
          v-if="!isExternal"
          ref="sslSection"
          tabindex="-1"
          :aria-label="$t('domains_modern.workspace.health.sslTitle')"
          class="sd-modern-widget b-domain-workspace__widget b-domain-workspace__ssl"
        >
          <header class="b-domain-workspace__widget-heading">
            <v-icon size="18" aria-hidden="true">https</v-icon>
            <div>
              <h2>{{ $t("domains_modern.workspace.sslTitle") }}</h2>
              <p>
                {{
                  $t(
                    secure
                      ? "domains_modern.connection.sslSecureHint"
                      : "domains_modern.connection.sslOwnHint",
                  )
                }}
              </p>
            </div>
            <v-btn
              variant="outlined"
              class="sd-modern-button"
              prepend-icon="published_with_changes"
              :disabled="!canWrite || isBusy"
              :loading="busy === 'ssl'"
              @click="checkSsl"
              >{{ $t("domains_modern.setting.check_ssl") }}
              <v-tooltip
                activator="parent"
                location="top"
                open-on-focus
                content-class="sd-modern-tooltip text-start"
                >{{ $t("domains_modern.workspace.sslCheckHelp") }}</v-tooltip
              ></v-btn
            >
          </header>
          <div
            v-if="sslError || sslMessage"
            class="sd-modern-notice mt-4 mb-4 b-domain-workspace__ssl-result"
            :role="sslError ? 'alert' : 'status'"
          >
            <v-icon
              size="18"
              :color="
                sslError
                  ? 'error'
                  : sslResult?.ssl === true && !sslResult.skipped
                    ? 'success'
                    : undefined
              "
              aria-hidden="true"
              >{{
                sslError
                  ? "error_outline"
                  : sslResult?.ssl === true && !sslResult.skipped
                    ? "check"
                    : "info_outline"
              }}</v-icon
            >
            <div class="sd-modern-notice__content">
              {{ sslError || sslMessage }}
            </div>
          </div>
          <dl
            v-if="certificate"
            class="b-domain-workspace__facts b-domain-workspace__facts--two"
          >
            <div>
              <dt>{{ $t("domains_modern.setting.certificate") }}</dt>
              <dd>{{ certificate.Name }} · {{ certificate["Key Type"] }}</dd>
            </div>
            <div>
              <dt>{{ $t("domains_modern.setting.expiry") }}</dt>
              <dd class="b-domain-workspace__expiry">
                <span>{{ formatCertificateDate(certificate["Expiry Date"]) }}</span>
                <span class="sd-modern-status sd-modern-status--plain"
                  ><span
                    class="sd-modern-status__dot"
                    :class="
                      certificateState === 'expired'
                        ? 'sd-modern-status__dot--warning'
                        : certificateState === 'valid'
                          ? 'sd-modern-status__dot--success'
                          : undefined
                    "
                  />{{
                    $t(
                      certificateState === "expired"
                        ? "domains_modern.list.expired"
                        : certificateState === "valid"
                          ? "domains_modern.setting.valid"
                          : "domains_modern.connection.feedback.notChecked",
                    )
                  }}</span
                >
              </dd>
            </div>
            <div>
              <dt>{{ $t("domains_modern.setting.serial") }}</dt>
              <dd>
                <bdi dir="ltr">{{ certificate["Serial Number"] }}</bdi>
              </dd>
            </div>
            <div>
              <dt>{{ $t("commons.domains") }}</dt>
              <dd>
                <bdi dir="ltr">{{ certificate.Domains }}</bdi>
              </dd>
            </div>
            <div>
              <dt>{{ $t("domains_modern.workspace.certificateIssued") }}</dt>
              <dd>{{ formatCertificateDate(certificate["Issue Date"]) }}</dd>
            </div>
          </dl>
          <div class="b-domain-workspace__form-group">
            <u-smart-switch
              v-model="draft.https"
              :disabled="!canWrite || isBusy"
              border
              accessible
              class="sd-modern-smart-select"
              :label="$t('domains_modern.setting.redirect_title')"
              :true-title="$t('domains_modern.setting.force_https')"
              :true-description="$t('domains_modern.setting.https_description')"
              true-icon="https"
              :false-title="$t('domains_modern.setting.allow_http')"
              :false-description="$t('domains_modern.setting.http_description')"
              false-icon="http"
            />
            <p class="b-domain-workspace__section-help">
              {{ $t("domains_modern.setting.redirect_help") }}
            </p>
          </div>
          <div class="sd-modern-actions b-domain-workspace__actions">
            <v-btn
              color="primary"
              variant="flat"
              class="sd-modern-button sd-modern-button--primary"
              prepend-icon="save"
              :loading="busy === 'https'"
              :disabled="!canWrite || isBusy || !changed('https')"
              @click="saveSettings('https')"
              >{{ $t("global.actions.save") }}</v-btn
            >
          </div>
        </section>
      </template>
    </template>

    <!-- Draft-owning panels stay mounted while local routes change. -->
    <section
      v-if="visited.storefront"
      v-show="section === 'storefront'"
      class="sd-modern-widget b-domain-workspace__widget"
    >
      <div v-if="isExternal" class="sd-modern-notice">
        <v-icon size="18" aria-hidden="true">open_in_new</v-icon>
        <div class="sd-modern-notice__content">
          {{ $t("domains_modern.workspace.externalStorefront") }}
        </div>
      </div>
      <template v-else>
        <header class="b-domain-workspace__widget-heading">
          <v-icon size="18" aria-hidden="true">storefront</v-icon>
          <div>
            <h2>{{ $t("domains_modern.workspace.themeTitle") }}</h2>
            <p>{{ $t("domains_modern.workspace.themeSubtitle") }}</p>
          </div>
          <v-btn
            :to="{
              name: 'BPageShopSettingTheme',
              params: { shop_id: shop.id },
            }"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            color="primary"
            class="sd-modern-button sd-modern-button--inline"
            append-icon="north_east"
            >{{ $t("domains_modern.workspace.manageTheme") }}</v-btn
          >
        </header>
        <p v-if="!isCustom" class="b-domain-workspace__section-help">
          {{ $t("domains_modern.workspace.defaultHomeHelp") }}
        </p>
        <div class="b-domain-workspace__form-group">
          <b-shop-home-select
            ref="homeSelect"
            :key="resourceKey"
            :domain="isCustom ? item.domain : undefined"
            :shop="shop"
            modern
            :clearable="isCustom"
            :read-only="!canWrite || !!busy"
          />
        </div>
        <div
          v-if="item.official !== 'local'"
          class="b-domain-workspace__setting-row b-domain-workspace__primary-row"
        >
          <div>
            <h3>{{ $t("domains_modern.map.primary") }}</h3>
            <p>
              {{
                $t(
                  item.primary
                    ? "domains_modern.workspace.primaryLocked"
                    : homeDirty || homeBusy
                      ? "domains_modern.workspace.primaryPendingHome"
                      : "domains_modern.map.primaryTip",
                )
              }}
            </p>
          </div>
          <u-smart-toggle
            :model-value="!!item.primary"
            :readonly="!canChangePrimary"
            :loading="busy === 'primary'"
            role="checkbox"
            :aria-label="$t('domains_modern.map.primary')"
            :aria-checked="!!item.primary"
            :aria-disabled="!canChangePrimary"
            :tabindex="canChangePrimary ? 0 : -1"
            false-gray
            @update:model-value="changeParam('primary', $event)"
            @keydown.enter.prevent="changeParam('primary', true)"
            @keydown.space.prevent="changeParam('primary', true)"
          />
        </div>
      </template>
    </section>

    <section
      v-show="section === 'search'"
      class="sd-modern-widget b-domain-workspace__widget b-domain-workspace__search"
    >
      <div class="b-domain-workspace__search-layout">
        <div class="b-domain-workspace__search-controls">
          <header class="b-domain-workspace__widget-heading">
            <v-icon size="18" aria-hidden="true">manage_search</v-icon>
            <div>
              <h2>{{ $t("domains_modern.map.search") }}</h2>
              <p>{{ $t("domains_modern.workspace.indexingHelp") }}</p>
            </div>
          </header>
          <p
            v-if="item.official === 'local'"
            class="b-domain-workspace__section-help"
          >
            {{ $t("domains_modern.list.index_unavailable") }}
          </p>
          <div v-else class="b-domain-workspace__form-group">
            <u-smart-switch
              v-model="draft.indexed"
              :disabled="!canWrite || isBusy"
              border
              accessible
              class="sd-modern-smart-select"
              :true-title="$t('domains_modern.list.index_allowed')"
              :false-title="$t('domains_modern.list.index_off')"
              true-icon="search"
              false-icon="search_off"
            />
            <div class="sd-modern-actions b-domain-workspace__actions">
              <v-btn
                color="primary"
                variant="flat"
                class="sd-modern-button sd-modern-button--primary"
                prepend-icon="save"
                :disabled="!canWrite || isBusy || !changed('indexed')"
                :loading="busy === 'indexed'"
                @click="changeParam('indexed', draft.indexed)"
                >{{ $t("global.actions.save") }}</v-btn
              >
            </div>
          </div>
          <div
            v-if="isExternal"
            class="sd-modern-notice b-domain-workspace__search-sitemap"
          >
            <v-icon size="18" aria-hidden="true">info_outline</v-icon>
            <div class="sd-modern-notice__content">
              {{ $t("domains_modern.workspace.externalSearch") }}
            </div>
          </div>
          <section
            v-else
            class="b-domain-workspace__search-sitemap"
            :aria-labelledby="'domain-sitemap-' + resourceKey"
          >
            <h3 :id="'domain-sitemap-' + resourceKey">
              {{ $t("domains_modern.workspace.sitemapAddress") }}
            </h3>
            <div class="b-domain-workspace__sitemap-address">
              <bdi v-copy tabindex="0" dir="ltr">{{ sitemapUrl }}</bdi>
              <v-btn
                icon
                variant="text"
                class="sd-modern-icon-button"
                :aria-label="$t('domains_modern.workspace.copySitemap')"
                @click.stop="copyToClipboard(sitemapUrl)"
              >
                <v-icon size="16">content_copy</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  open-on-focus
                  content-class="sd-modern-tooltip text-start"
                  >{{ $t("domains_modern.workspace.copySitemap") }}</v-tooltip
                >
              </v-btn>
            </div>
            <div class="b-domain-workspace__inline-actions">
              <v-dialog
                v-model="showSitemap"
                fullscreen
                scrollable
                :aria-labelledby="'domain-sitemap-title-' + resourceKey"
              >
                <template #activator="{ props: activatorProps }">
                  <v-btn
                    v-bind="activatorProps"
                    variant="outlined"
                    class="sd-modern-button"
                    prepend-icon="account_tree"
                    >{{ $t("domains_modern.workspace.browseSitemap") }}</v-btn
                  > </template
                ><v-card class="b-domain-workspace__sitemap-dialog text-start"
                  ><header class="b-domain-workspace__sitemap-header">
                    <div>
                      <h2 :id="'domain-sitemap-title-' + resourceKey">
                        {{ $t("domains_modern.map.sitemap") }}
                      </h2>
                      <bdi dir="ltr">{{
                        item.domain?.domain ||
                        item.url.replace(/^https?:\/\//, "")
                      }}</bdi>
                    </div>
                    <v-tooltip
                      location="top"
                      open-on-focus
                      content-class="sd-modern-tooltip text-start"
                      ><template #activator="{ props }"
                        ><v-btn
                          v-bind="props"
                          icon
                          variant="text"
                          class="sd-modern-icon-button"
                          :aria-label="$t('global.actions.close')"
                          @click="showSitemap = false"
                          ><v-icon size="16">close</v-icon></v-btn
                        ></template
                      >{{ $t("global.actions.close") }}</v-tooltip
                    >
                  </header>
                  <v-card-text
                    class="b-domain-workspace__sitemap-body sd-modern-canvas"
                    ><shop-site-map
                      v-if="showSitemap && !isExternal"
                      modern
                      :shop="shop"
                      :base-url="item.url" /></v-card-text></v-card
              ></v-dialog>
              <v-btn
                :href="sitemapUrl"
                target="_blank"
                rel="noopener noreferrer"
                icon
                variant="text"
                class="sd-modern-icon-button"
                :aria-label="$t('user_dashboard.shops.modern.open_in_new_tab')"
              >
                <v-icon size="16">north_east</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  open-on-focus
                  content-class="sd-modern-tooltip text-start"
                  >{{
                    $t("user_dashboard.shops.modern.open_in_new_tab")
                  }}</v-tooltip
                >
              </v-btn>
            </div>
          </section>
        </div>
        <b-domain-search-illustration
          class="b-domain-workspace__search-illustration"
          :indexed="draft.indexed"
          :pending="changed('indexed')"
          :unavailable="item.official === 'local'"
        />
      </div>
    </section>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Settings ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <div v-show="section === 'settings'" class="b-domain-workspace__settings">
      <nav
        class="sd-modern-section-nav b-domain-workspace__local-nav"
        :aria-label="$t('domains_modern.workspace.settingsGroups')"
      >
        <button
          v-for="setting in settings"
          :key="setting.value"
          type="button"
          class="sd-modern-section-nav__item"
          :aria-current="
            activeSetting === setting.value ? 'location' : undefined
          "
          @click="navigate('settings', setting.value)"
        >
          {{ setting.label }}
        </button>
      </nav>
      <div class="b-domain-workspace__settings-content">
        <section
          v-show="activeSetting === 'access'"
          class="sd-modern-widget b-domain-workspace__widget"
        >
          <header class="b-domain-workspace__widget-heading">
            <v-icon size="18" aria-hidden="true">door_front</v-icon>
            <div>
              <h2>{{ $t("domains_modern.workspace.access") }}</h2>
              <p>{{ $t("domains_modern.map.enableHelp") }}</p>
            </div>
          </header>
          <div class="b-domain-workspace__form-group">
            <u-smart-switch
              v-model="draft.enable"
              :disabled="!canWrite || isBusy"
              border
              accessible
              class="sd-modern-smart-select"
              :true-title="$t('domains_modern.connection.active')"
              :false-title="$t('domains_modern.connection.inactive')"
              true-icon="check"
              false-icon="close"
            />
          </div>
          <div v-if="isExternal" class="b-domain-workspace__setting-row">
            <div>
              <h3>{{ $t("domains_modern.map.primary") }}</h3>
              <p>
                {{
                  $t(
                    item.primary
                      ? "domains_modern.workspace.primaryLocked"
                      : homeDirty || homeBusy
                        ? "domains_modern.workspace.primaryPendingHome"
                        : "domains_modern.map.primaryTip",
                  )
                }}
              </p>
            </div>
            <u-smart-toggle
              :model-value="!!item.primary"
              :readonly="!canChangePrimary"
              :loading="busy === 'primary'"
              role="checkbox"
              :aria-label="$t('domains_modern.map.primary')"
              :aria-checked="!!item.primary"
              :aria-disabled="!canChangePrimary"
              :tabindex="canChangePrimary ? 0 : -1"
              false-gray
              @update:model-value="changeParam('primary', $event)"
              @keydown.enter.prevent="changeParam('primary', true)"
              @keydown.space.prevent="changeParam('primary', true)"
            />
          </div>
          <div class="sd-modern-actions b-domain-workspace__actions">
            <v-btn
              color="primary"
              variant="flat"
              class="sd-modern-button sd-modern-button--primary"
              prepend-icon="save"
              :disabled="!canWrite || isBusy || !changed('enable')"
              :loading="busy === 'enable'"
              @click="changeParam('enable', draft.enable)"
              >{{ $t("global.actions.save") }}</v-btn
            >
          </div>
        </section>
        <section
          v-if="isCustom"
          v-show="activeSetting === 'scope'"
          class="sd-modern-widget b-domain-workspace__widget"
        >
          <header class="b-domain-workspace__widget-heading">
            <v-icon size="18" aria-hidden="true">translate</v-icon>
            <div>
              <h2>{{ $t("domains_modern.workspace.scope") }}</h2>
              <p>{{ $t("domains_modern.setting.resources_help") }}</p>
            </div>
          </header>
          <div class="b-domain-workspace__form-group">
            <u-language-input
              v-model="draft.languages"
              :available-languages="availableLanguages"
              :disabled="!canWrite || isBusy"
              :label="$t('domains_modern.setting.languages')"
              multiple
              clearable
              chips
              persistent-placeholder
              :placeholder="$t('domains_modern.list.all_languages')"
              max-width="null"
              class="sd-modern-underlined-field"
            /><u-currency-input
              v-model="draft.currencies"
              :active-currencies="shop.currencies"
              :disabled="!canWrite || isBusy"
              :label="$t('domains_modern.setting.currencies')"
              multiple
              clearable
              chips
              persistent-placeholder
              :placeholder="$t('domains_modern.list.all_currencies')"
              class="sd-modern-underlined-field mt-5"
            />
          </div>
          <div class="sd-modern-actions b-domain-workspace__actions">
            <v-btn
              color="primary"
              variant="flat"
              class="sd-modern-button sd-modern-button--primary"
              prepend-icon="save"
              :disabled="
                !canWrite ||
                isBusy ||
                !(changed('languages') || changed('currencies'))
              "
              :loading="busy === 'scope'"
              @click="saveSettings('scope')"
              >{{ $t("global.actions.save") }}</v-btn
            >
          </div>
        </section>
        <section
          v-show="activeSetting === 'oauth'"
          class="sd-modern-widget b-domain-workspace__widget"
        >
          <header class="b-domain-workspace__widget-heading">
            <v-icon size="18" aria-hidden="true">key</v-icon>
            <div>
              <h2>{{ $t("domains_modern.workspace.oauth") }}</h2>
              <p>{{ $t("domains_modern.connection.callbackHelp") }}</p>
            </div>
          </header>
          <dl
            v-if="callback"
            class="sd-modern-form-meta b-domain-workspace__callback"
          >
            <div>
              <dt>
                {{
                  $t(
                    item.client
                      ? "domains_modern.workspace.callbackConfigured"
                      : "domains_modern.workspace.callbackExpected",
                  )
                }}
              </dt>
              <dd>
                <bdi v-copy tabindex="0" dir="ltr">{{ callback }}</bdi>
              </dd>
            </div>
          </dl>
          <p v-if="!item.client" class="b-domain-workspace__section-help">
            {{ $t("domains_modern.workspace.callbackUnavailable") }}
          </p>
          <div
            v-if="!isExternal || !item.client"
            class="sd-modern-actions b-domain-workspace__actions"
          >
            <v-btn
              variant="outlined"
              class="sd-modern-button"
              prepend-icon="build"
              :disabled="!canWrite || isBusy"
              :loading="busy === 'repair'"
              @click="repairClient"
              >{{
                $t(
                  item.client
                    ? "domains_modern.map.repairAction"
                    : "domains_modern.connection.createClient",
                )
              }}</v-btn
            >
          </div>
        </section>
        <section
          v-if="isCustom"
          v-show="activeSetting === 'remove'"
          class="sd-modern-widget sd-modern-disclosure sd-modern-critical b-domain-workspace__widget"
        >
          <details :open="removeExpanded" @toggle="toggleRemoval">
            <summary>{{ $t("domains_modern.list.remove_title") }}</summary>
            <p>{{ $t("domains_modern.list.remove_help") }}</p>
            <div class="b-domain-workspace__verify">
              <u-smart-toggle
                :model-value="deleteVerified"
                :true-title="$t('domains_modern.workspace.verifyDelete')"
                :readonly="!canWrite || isBusy"
                role="checkbox"
                :aria-checked="deleteVerified"
                :aria-label="$t('domains_modern.workspace.verifyDelete')"
                :tabindex="canWrite && !busy ? 0 : -1"
                false-gray
                @update:model-value="verifyRemoval"
                @keydown.enter.prevent="verifyRemoval(!deleteVerified)"
                @keydown.space.prevent="verifyRemoval(!deleteVerified)"
              />
            </div>
            <div class="sd-modern-actions b-domain-workspace__actions">
              <v-btn
                color="error"
                variant="elevated"
                class="sd-modern-button sd-modern-button--danger"
                prepend-icon="delete_outline"
                :disabled="!canDelete"
                :loading="busy === 'delete'"
                @click="deleteDomain"
                >{{ $t("global.actions.delete") }}</v-btn
              >
            </div>
          </details>
        </section>
      </div>
    </div>
    <v-dialog
      :model-value="!!quickField"
      max-width="480"
      :persistent="isBusy"
      :aria-labelledby="'domain-quick-title-' + resourceKey"
      @update:model-value="!$event && closeQuickEdit()"
    >
      <v-card
        class="sd-modern-widget b-domain-workspace__quick-dialog text-start"
      >
        <header class="b-domain-workspace__quick-header">
          <div>
            <h2 :id="'domain-quick-title-' + resourceKey">
              {{
                $t(
                  "domains_modern.workspace.health." +
                    (quickField === "indexed" ? "searchTitle" : "accessTitle"),
                )
              }}
            </h2>
            <bdi dir="ltr">{{ address }}</bdi>
          </div>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :aria-label="$t('global.actions.close')"
            :disabled="isBusy"
            @click="closeQuickEdit"
            ><v-icon size="16" aria-hidden="true">close</v-icon
            ><v-tooltip
              activator="parent"
              location="top"
              open-on-focus
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.actions.close") }}</v-tooltip
            ></v-btn
          >
        </header>
        <v-card-text class="b-domain-workspace__quick-body">
          <p v-if="quickField === 'indexed' && isExternal">
            {{ $t("domains_modern.workspace.externalSearch") }}
          </p>
          <p v-else>
            {{
              $t(
                "domains_modern.workspace.health." +
                  (quickField === "indexed"
                    ? "searchEditHint"
                    : "accessEditHint"),
              )
            }}
          </p>
          <div v-if="operationError" class="sd-modern-notice" role="alert">
            <v-icon size="18" color="error" aria-hidden="true"
              >error_outline</v-icon
            >
            <div class="sd-modern-notice__content">{{ operationError }}</div>
          </div>
          <u-smart-switch
            v-model="quickValue"
            :disabled="!canWrite || isBusy"
            border
            accessible
            class="sd-modern-smart-select b-domain-workspace__quick-switch"
            :true-title="
              $t(
                quickField === 'indexed'
                  ? 'domains_modern.list.index_allowed'
                  : 'domains_modern.list.enabled',
              )
            "
            :false-title="
              $t(
                quickField === 'indexed'
                  ? 'domains_modern.list.index_off'
                  : 'domains_modern.list.disabled',
              )
            "
            :true-icon="quickField === 'indexed' ? 'search' : 'check'"
            :false-icon="quickField === 'indexed' ? 'search_off' : 'close'"
          />
          <p class="b-domain-workspace__quick-hint">
            {{
              $t(
                "domains_modern.workspace.health." +
                  (quickField && quickValue !== baseline[quickField]
                    ? "quickUnsavedHint"
                    : "quickSaveHint"),
              )
            }}
          </p>
        </v-card-text>
        <v-card-actions class="b-domain-workspace__quick-actions"
          ><v-btn
            variant="text"
            class="sd-modern-button"
            :disabled="isBusy"
            @click="closeQuickEdit"
            >{{ $t("global.actions.cancel") }}</v-btn
          ><v-btn
            color="primary"
            variant="flat"
            class="sd-modern-button sd-modern-button--primary"
            prepend-icon="save"
            :disabled="!quickCanSave"
            :loading="!!quickField && busy === quickField"
            @click="saveQuickEdit"
            >{{ $t("global.actions.save") }}</v-btn
          ></v-card-actions
        >
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import { ShopOptionsHelper } from "@selldone/core-js/helper";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import DomainMixin from "@selldone/components-vue/mixin/domain/DomainMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import ULanguageInput from "../../../ui/language/input/ULanguageInput.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import BShopHomeSelect from "../../shop/home/select/BShopHomeSelect.vue";
import ShopSiteMap from "../../sitemap/ShopSiteMap.vue";
import BDomainDnsRecords from "../add/BDomainDnsRecords.vue";
import BDomainDnsFeedback from "../add/BDomainDnsFeedback.vue";
import BDomainCloudflareSetup from "../add/BDomainCloudflareSetup.vue";
import BDomainWorkspaceFlow from "./BDomainWorkspaceFlow.vue";
import BDomainSearchIllustration from "./BDomainSearchIllustration.vue";
import BDomainStorefrontPreview from "./BDomainStorefrontPreview.vue";

const fields = ["enable", "indexed", "https", "languages", "currencies"];
const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export default {
  name: "BDomainWorkspace",
  mixins: [DomainMixin, DateMixin],
  components: {
    BDomainStorefrontPreview,
    BDomainSearchIllustration,
    BDomainWorkspaceFlow,
    BDomainDnsRecords,
    BDomainDnsFeedback,
    BDomainCloudflareSetup,
    BShopHomeSelect,
    ShopSiteMap,
    USmartSwitch,
    USmartToggle,
    ULanguageInput,
    UCurrencyInput,
  },
  props: {
    shop: { type: Object, required: true },
    item: { type: Object, required: true },
    section: {
      type: String,
      default: "overview",
      validator: (value) =>
        ["overview", "connection", "storefront", "search", "settings"].includes(
          value,
        ),
    },
    settingSection: { type: String, default: "access" },
  },
  emits: ["navigate", "refresh", "deleted"],
  data: () => ({
    draft: {
      enable: false,
      indexed: false,
      https: false,
      languages: [],
      currencies: [],
    },
    baseline: {},
    visited: { storefront: false },
    homeDirty: false,
    homeBusy: false,
    stopHomeWatch: null,
    busy: "",
    operationError: "",
    operationMessage: "",
    requestId: 0,
    detectedDns: null,
    dnsCheckState: "notChecked",
    dnsVerification: {},
    dnsError: "",
    dnsMessage: "",
    sslResult: null,
    sslError: "",
    sslMessage: "",
    quickField: "",
    quickValue: false,
    quickActivator: null,
    routeType: "A",
    cnameTarget: "",
    verificationMethod: "meta",
    deleteVerified: false,
    removeExpanded: false,
    showSitemap: false,
  }),
  computed: {
    sectionIcon() {
      return {
        overview: "dashboard",
        connection: "hub",
        storefront: "storefront",
        search: "manage_search",
        settings: "settings",
      }[this.section];
    },
    healthSummary() {
      let state,
        label = "notChecked",
        tone = "",
        action = "check",
        button = "checkDns",
        icon = "network_check",
        source = "savedSetup";
      if (!this.item.enable) {
        state = "disabled";
        label = "accessDisabled";
        tone = "error";
        action = "enable";
        button = "enableAddress";
        icon = "door_front";
      } else if (this.item.error) {
        state = "issue";
        label = "actionNeeded";
        tone = "warning";
        action = "connection";
        button = "reviewDns";
        icon = "dns";
      } else if (this.isExternal) {
        state = this.item.approved ? "external" : "ownership";
        label = "external";
        action = "connection";
        button = "reviewOwnership";
        icon = "verified_user";
      } else if (!this.isCustom) {
        state = "managed";
        label = "managed";
        action = "open";
        button = "openStorefront";
        icon = "north_east";
      } else if (["review", "error"].includes(this.dnsCheckState)) {
        state = "dnsReview";
        label = "actionNeeded";
        tone = "warning";
        action = "connection";
        button = "reviewDns";
        icon = "dns";
        source = "checkResult";
      } else if (this.certificateState === "expired") {
        state = "certificateExpired";
        label = "actionNeeded";
        tone = "warning";
        action = "ssl";
        button = "reviewSsl";
        icon = "https";
      } else if (this.dnsCheckState === "accepted") {
        state = "dnsAccepted";
        label = "checkAccepted";
        tone = "success";
        action = "ssl";
        button = "reviewSsl";
        icon = "https";
        source = "checkResult";
      } else if (this.dnsCheckState === "unavailable") {
        state = "dnsUnavailable";
        source = "checkResult";
      } else {
        state = this.item.approved ? "notChecked" : "pending";
      }
      return { state, label, tone, action, button, icon, source };
    },
    overviewRows() {
      const t = (key) => this.$t("domains_modern.workspace.health." + key);
      const sslHint = this.isExternal
        ? "sslExternalHint"
        : !this.isCustom
          ? "sslManagedHint"
          : this.certificateState === "expired"
            ? "sslExpiredHint"
            : this.certificateState === "valid"
              ? "sslValidHint"
              : this.secure
                ? "sslUnknownHint"
                : "sslOwnHint";
      return [
        {
          key: "access",
          icon: "door_front",
          title: t("accessTitle"),
          value: t(
            this.item.enable ? "accessEnabledHint" : "accessDisabledHint",
          ),
          quick: "enable",
        },
        {
          key: "ssl",
          icon: "https",
          title: t("sslTitle"),
          value: t(sslHint),
          section: "connection",
          setting: this.isCustom && !this.isExternal ? "ssl" : undefined,
        },
        {
          key: "home",
          icon: "home",
          title: this.$t("domains_modern.list.home"),
          value: this.homeLabel,
          section: "storefront",
          change: !this.isExternal,
        },
        {
          key: "search",
          icon: "manage_search",
          title: t("searchTitle"),
          value:
            this.item.official === "local"
              ? this.$t("domains_modern.list.index_unavailable")
              : t(this.item.indexed ? "searchAllowedHint" : "searchOffHint"),
          quick: this.item.official !== "local" ? "indexed" : undefined,
          section: "search",
        },
        {
          key: "login",
          icon: "key",
          title: t("loginTitle"),
          value: t(
            this.item.client ? "loginConfiguredHint" : "loginMissingHint",
          ),
          section: "settings",
          setting: "oauth",
        },
      ];
    },
    quickCanSave() {
      return (
        ["enable", "indexed"].includes(this.quickField) &&
        typeof this.quickValue === "boolean" &&
        this.canWrite &&
        !this.isBusy &&
        !(this.item.official === "local" && this.quickField === "indexed") &&
        (this.quickValue !== !!this.item[this.quickField] ||
          this.changed(this.quickField))
      );
    },
    isCustom() {
      return !!this.item.domain?.id;
    },
    isExternal() {
      return !!this.item.domain?.externally_hosted;
    },
    secure() {
      return !!this.item.domain?.ssl_proxy;
    },
    address() {
      return (
        this.item.domain?.domain ||
        this.item.url?.replace(/^https?:\/\//, "") ||
        this.item.name ||
        ""
      );
    },
    resourceKey() {
      return `${this.shop.id}:${this.item.domain?.id || this.item.official}`;
    },
    eligible() {
      return (
        !this.isCustom || Eligible.CanEditDomain(this.shop, this.item.domain.id)
      );
    },
    canWrite() {
      return (
        this.eligible &&
        !!this.writeShopAccess(ShopPermissionRegions.SETTINGS.code)
      );
    },
    hasUnsavedChanges() {
      return (
        fields.some((field) => this.changed(field)) ||
        this.homeDirty ||
        (!!this.quickField && this.quickValue !== this.draft[this.quickField])
      );
    },
    isBusy() {
      return !!this.busy || this.homeBusy;
    },
    canChangePrimary() {
      return (
        this.canWrite && !this.isBusy && !this.homeDirty && !this.item.primary
      );
    },
    settings() {
      return [
        "access",
        ...(this.isCustom ? ["scope"] : []),
        "oauth",
        ...(this.isCustom ? ["remove"] : []),
      ].map((value) => ({
        value,
        label: this.$t(`domains_modern.workspace.${value}`),
      }));
    },
    activeSetting() {
      return this.settings.some(
        (setting) => setting.value === this.settingSection,
      )
        ? this.settingSection
        : "access";
    },
    canDelete() {
      return (
        this.isCustom &&
        this.canWrite &&
        !this.isBusy &&
        this.section === "settings" &&
        this.activeSetting === "remove" &&
        this.removeExpanded &&
        this.deleteVerified
      );
    },
    availableLanguages() {
      return ShopOptionsHelper.GetLanguages(this.shop);
    },
    callback() {
      const client = this.item.client,
        value = client?.redirect;
      return (
        (Array.isArray(value) ? value.join("\n") : value) ||
        (Array.isArray(client?.redirect_uris)
          ? client.redirect_uris.join("\n")
          : "") ||
        this.item.callback_url ||
        ""
      );
    },
    certificate() {
      return this.item.certificate || this.item.domain?.certificate;
    },
    certificateState() {
      const expiry = this.certificateDate(this.certificate?.["Expiry Date"]);
      if (!expiry) return "unknown";
      const now = Date.now();
      if (expiry.getTime() <= now) return "expired";
      if (!this.item.ssl) return "unknown";

      const validity = this.certificate?.Validity;
      if (
        validity != null &&
        (typeof validity !== "string" ||
          !["valid", "expiring"].includes(validity.trim().toLowerCase()))
      )
        return "unknown";

      const issueValue = this.certificate?.["Issue Date"];
      if (issueValue != null) {
        const issue = this.certificateDate(issueValue);
        if (
          !issue ||
          issue.getTime() > now ||
          issue.getTime() >= expiry.getTime()
        )
          return "unknown";
      }
      return "valid";
    },
    connectionLabel() {
      return this.$t(
        this.item.error
          ? "domains_modern.list.connection_error"
          : this.connectionNeedsAttention
            ? "domains_modern.list.attention"
            : !this.isCustom
              ? "domains_modern.list.store_address"
              : this.item.approved
                ? "domains_modern.list.verified"
                : "domains_modern.list.pending",
      );
    },
    connectionDot() {
      return this.item.error
        ? "sd-modern-status__dot--error"
        : this.connectionNeedsAttention
          ? "sd-modern-status__dot--warning"
          : !this.isCustom || this.item.approved
            ? "sd-modern-status__dot--success"
            : "sd-modern-status__dot--warning";
    },
    connectionNeedsAttention() {
      return (
        this.isCustom &&
        !this.isExternal &&
        (!this.item.ssl || this.certificateState === "expired")
      );
    },
    configuredHome() {
      return this.item.primary || !this.item.domain?.home
        ? this.shop.home
        : this.item.domain.home;
    },
    homeLabel() {
      return this.isExternal
        ? this.$t("domains_modern.map.externalHome")
        : this.GetDomainHomeName(this.configuredHome);
    },
    languageSummary() {
      return this.item.domain?.languages?.length
        ? this.item.domain.languages
            .map((language) => this.getLanguageName(language))
            .join(" · ")
        : this.$t("domains_modern.list.all_languages");
    },
    currencySummary() {
      return this.item.domain?.currencies?.length
        ? this.item.domain.currencies.join(" · ")
        : this.$t("domains_modern.list.all_currencies");
    },
    sitemapUrl() {
      return this.item.site_map || `${this.item.url}/sitemap`;
    },
    relativeHost() {
      const wildcard = this.address.startsWith("*."),
        labels = this.address.replace(/^\*\./, "").split(".");
      const suffix =
        labels.length > 2 &&
        labels.at(-2).length <= 3 &&
        labels.at(-1).length <= 2
          ? 3
          : 2;
      return labels.length > suffix
        ? `${wildcard ? "*." : ""}${labels.slice(0, -suffix).join(".")}`
        : wildcard
          ? "*"
          : "@";
    },
    verificationHost() {
      const host = this.relativeHost;
      if (this.isExternal)
        return host === "@" || host === "*"
          ? "_selldone-verification"
          : `_selldone-verification.${host.replace(/^\*\./, "")}`;
      return host + (host !== "@" && host !== "*" ? "-challenge" : "");
    },
    verificationValue() {
      return `selldone-domain-verification=${this.shop.hash_id}`;
    },
    verificationMeta() {
      return `<meta name="selldone-domain-verification" content="${this.shop.hash_id}">`;
    },
    verificationUrl() {
      return `https://${this.address.replace(/^\*\./, "")}/`;
    },
    cnames() {
      return this.shop.custom_cnames || [];
    },
    canUseCname() {
      return (
        this.isCustom &&
        !this.isExternal &&
        !this.secure &&
        !["@", "*"].includes(this.relativeHost) &&
        !!this.cnames.length
      );
    },
    routingRecords() {
      return (this.shop.custom_ips || [])
        .filter((ip) =>
          this.secure
            ? this.shop.custom_ips_ssl_proxy?.includes(ip)
            : !this.shop.custom_ips_ssl_proxy?.includes(ip),
        )
        .map((value) => ({ type: "A", host: this.relativeHost, value }));
    },
    requiredRecords() {
      if (
        !this.isCustom ||
        (this.isExternal && this.verificationMethod !== "txt")
      )
        return [];
      const routing = this.isExternal
        ? []
        : this.canUseCname && this.routeType === "CNAME"
          ? [
              {
                type: "CNAME",
                host: this.relativeHost,
                value: this.cnames.includes(this.cnameTarget)
                  ? this.cnameTarget
                  : this.cnames[0],
              },
            ]
          : this.routingRecords;
      return [
        ...routing,
        {
          type: "TXT",
          host: this.verificationHost,
          value: this.verificationValue,
        },
      ];
    },
    feedbackRecords() {
      // The explicit legacy lookup reads NS/A/CNAME only; absence there says nothing about TXT ownership.
      return this.isExternal
        ? []
        : [
            ...this.routingRecords,
            ...(this.canUseCname
              ? this.cnames.map((value) => ({
                  type: "CNAME",
                  host: this.relativeHost,
                  value,
                }))
              : []),
          ];
    },
  },
  watch: {
    item: {
      deep: true,
      handler() {
        this.syncDrafts();
      },
    },
    resourceKey() {
      this.resetResource();
    },
    section(value) {
      if (value === "storefront") {
        this.visited.storefront = true;
        this.$nextTick(this.observeHome);
      }
      if (value !== "search") this.showSitemap = false;
      this.closeQuickEdit();
      this.$nextTick(this.focusConnectionSection);
      this.resetRemoval();
    },
    settingSection() {
      this.$nextTick(this.focusConnectionSection);
    },
    activeSetting() {
      this.resetRemoval();
    },
    canWrite(value) {
      if (!value) {
        this.quickField = "";
        this.quickActivator = null;
        this.resetRemoval();
      }
    },
    "shop.home"() {
      this.syncHome();
    },
  },
  created() {
    this.resetResource();
  },
  mounted() {
    this.observeHome();
    this.$nextTick(this.focusConnectionSection);
  },
  beforeUnmount() {
    this.requestId++;
    this.stopHomeWatch?.();
  },
  methods: {
    runHealthAction(event) {
      const action = this.healthSummary.action;
      if (action === "enable") return this.openQuickEdit("enable", event);
      if (action === "check") {
        this.navigate("connection");
        return this.checkDns();
      }
      this.navigate("connection", action === "ssl" ? "ssl" : undefined);
    },
    focusConnectionSection() {
      if (this.section !== "connection" || this.settingSection !== "ssl")
        return;
      this.$refs.sslSection?.scrollIntoView({ block: "start" });
      this.$refs.sslSection?.focus({ preventScroll: true });
    },
    openQuickEdit(field, event) {
      if (
        !this.canWrite ||
        this.isBusy ||
        !["enable", "indexed"].includes(field) ||
        (this.item.official === "local" && field === "indexed")
      )
        return false;
      this.quickValue = !!this.draft[field];
      this.quickField = field;
      this.quickActivator = event?.currentTarget || null;
      this.operationError = "";
      this.operationMessage = "";
      return true;
    },
    closeQuickEdit() {
      if (this.isBusy) return false;
      const activator = this.quickActivator;
      this.quickField = "";
      this.quickActivator = null;
      this.$nextTick(() => {
        if (activator?.isConnected) activator.focus();
      });
      return true;
    },
    async saveQuickEdit() {
      if (!this.quickCanSave) return false;
      const field = this.quickField,
        value = this.quickValue,
        key = this.resourceKey;
      this.draft[field] = value;
      if (value === !!this.item[field]) {
        this.closeQuickEdit();
        return true;
      }
      const saved = await this.changeParam(field, value);
      if (saved && this.resourceKey === key && this.quickField === field) {
        this.draft[field] = this.baseline[field];
        this.closeQuickEdit();
      }
      return saved;
    },
    navigate(section, setting) {
      this.$emit("navigate", section, setting);
    },
    changed(field) {
      const value = ["languages", "currencies"].includes(field)
        ? this.draft[field] || []
        : this.draft[field];
      return !equal(value, this.baseline[field]);
    },
    certificateDate(value) {
      if (!value) return null;
      const date = DateConverter.convertToLocalTime(value);
      return date instanceof Date && Number.isFinite(date.getTime())
        ? date
        : null;
    },
    formatCertificateDate(value) {
      return this.certificateDate(value)
        ? this.getLocalDateString(value)
        : this.$t("domains_modern.connection.feedback.notChecked");
    },
    observeHome() {
      if (!this.$refs.homeSelect || this.stopHomeWatch) return;
      this.stopHomeWatch = this.$watch(
        () => {
          const home = this.$refs.homeSelect;
          return [
            home?.static_page_mode,
            home?.home_page,
            home?.old_page,
            home?.busy_set,
          ];
        },
        ([staticPath, value, saved, busy], previous = []) => {
          this.homeDirty = value !== saved;
          // Native choices may wait for the existing throttle before busy_set starts.
          this.homeBusy =
            !!busy ||
            (!staticPath &&
              this.homeDirty &&
              (value !== previous[1] || (this.homeBusy && !previous[3])));
        },
        { immediate: true },
      );
    },
    syncHome() {
      const home = this.$refs.homeSelect;
      if (!home || this.homeDirty || this.homeBusy) return;
      const saved =
        this.isCustom && !this.item.primary
          ? this.item.domain.home
          : this.shop.home;
      const value = /^\d+$/.test(String(saved)) ? Number(saved) : saved;
      home.home_page = value;
      home.old_page = value;
    },
    sourceValues() {
      return {
        enable: !!this.item.enable,
        indexed: !!this.item.indexed,
        https: !!this.item.domain?.https,
        languages: [...(this.item.domain?.languages || [])],
        currencies: [...(this.item.domain?.currencies || [])],
      };
    },
    syncDrafts() {
      const source = this.sourceValues();
      fields.forEach((field) => {
        if (!(field in this.baseline) || !this.changed(field))
          this.draft[field] = source[field];
        this.baseline[field] = source[field];
      });
      this.syncHome();
    },
    resetResource() {
      this.requestId++;
      this.busy = "";
      this.operationError = "";
      this.operationMessage = "";
      this.baseline = {};
      this.syncDrafts();
      this.detectedDns = null;
      this.dnsCheckState = "notChecked";
      this.dnsVerification = {};
      this.dnsError = "";
      this.dnsMessage = "";
      this.sslResult = null;
      this.sslError = "";
      this.sslMessage = "";
      this.quickField = "";
      this.quickValue = false;
      this.quickActivator = null;
      this.routeType = "A";
      this.cnameTarget = "";
      this.verificationMethod = "meta";
      this.showSitemap = false;
      this.stopHomeWatch?.();
      this.stopHomeWatch = null;
      this.homeDirty = false;
      this.homeBusy = false;
      this.visited.storefront = this.section === "storefront";
      this.$nextTick(this.observeHome);
      this.resetRemoval();
    },
    resetRemoval() {
      this.deleteVerified = false;
      this.removeExpanded = false;
    },
    toggleRemoval(event) {
      this.removeExpanded = event.target.open;
      if (!this.removeExpanded) this.deleteVerified = false;
    },
    verifyRemoval(value) {
      if (
        this.canWrite &&
        !this.busy &&
        this.section === "settings" &&
        this.activeSetting === "remove" &&
        this.removeExpanded
      )
        this.deleteVerified = value === true;
    },
    acceptDomain(data) {
      if (data.domain && this.isCustom) {
        Object.assign(this.item.domain, data.domain);
        [
          "enable",
          "indexed",
          "primary",
          "approved",
          "ssl",
          "error",
          "certificate",
        ].forEach((field) => {
          if (field in data.domain) this.item[field] = data.domain[field];
        });
        this.AddOrUpdateItemByID(this.shop.domains, data.domain);
      } else if (data.local && this.item.official === "local") {
        this.shop.local = data.local;
        Object.assign(this.item, data.local);
      } else if (data.sub && this.item.official === "sub") {
        this.shop.sub = data.sub;
        Object.assign(this.item, data.sub);
      }
      this.syncDrafts();
    },
    async runWrite(kind, send, apply) {
      if (!this.canWrite || this.isBusy) return false;
      const key = this.resourceKey,
        requestId = ++this.requestId;
      this.busy = kind;
      this.operationError = "";
      this.operationMessage = "";
      try {
        const { data } = await send();
        if (key !== this.resourceKey || requestId !== this.requestId)
          return false;
        if (
          data.error ||
          (data.success === false && !(kind === "repair" && data.client))
        ) {
          this.operationError =
            data.error_msg ||
            data.message ||
            this.$t("domains_modern.workspace.saveFailed");
          return false;
        }
        this.busy = "";
        apply(data);
        if (kind !== "delete") this.$emit("refresh");
        return true;
      } catch (error) {
        if (key === this.resourceKey && requestId === this.requestId) {
          this.operationError = this.$t("domains_modern.workspace.saveFailed");
          NotificationService.showLaravelError(error);
        }
        return false;
      } finally {
        if (key === this.resourceKey && requestId === this.requestId)
          this.busy = "";
      }
    },
    changeParam(param, value) {
      if (
        !this.canWrite ||
        this.busy ||
        !["enable", "indexed", "primary"].includes(param) ||
        typeof value !== "boolean"
      )
        return;
      if (
        (this.item.official === "local" && param !== "enable") ||
        (param === "primary" && (!value || !this.canChangePrimary))
      )
        return;
      if (param !== "primary" && value === !!this.item[param]) return;
      const target = this.isCustom
        ? this.item.domain.domain
        : this.item.official;
      return this.runWrite(
        param,
        () =>
          axios.put(window.API.PUT_EDIT_DOMAIN(this.shop.id, target, param), {
            value,
          }),
        (data) => {
          if (param === "primary") {
            (this.shop.domains || []).forEach((domain) => {
              domain.primary = false;
            });
            if (this.shop.local) this.shop.local.primary = false;
            if (this.shop.sub) this.shop.sub.primary = false;
          }
          this.acceptDomain(data);
          NotificationService.showSuccessAlert(
            null,
            this.$t("domains_modern.workspace.saved"),
          );
        },
      );
    },
    saveSettings(group) {
      if (
        !this.isCustom ||
        !this.canWrite ||
        this.busy ||
        !["https", "scope"].includes(group) ||
        (group === "https" && this.isExternal)
      )
        return;
      const payload =
        group === "https"
          ? { https: this.draft.https }
          : {
              languages: [...(this.draft.languages || [])],
              currencies: [...(this.draft.currencies || [])],
            };
      if (Object.keys(payload).every((field) => !this.changed(field))) return;
      return this.runWrite(
        group,
        () =>
          axios.post(
            window.API.POST_SET_DOMAIN_SETTING(
              this.shop.id,
              this.item.domain.id,
            ),
            payload,
          ),
        (data) => {
          this.acceptDomain(data);
          NotificationService.showSuccessAlert(
            null,
            this.$t("domains_modern.workspace.saved"),
          );
        },
      );
    },
    checkResultMessage(data, fallback) {
      if (typeof data === "string" && data.trim()) return data;
      if (typeof data?.error_msg === "string" && data.error_msg.trim())
        return data.error_msg;
      const validation = Object.values(data?.errors || {})
        .flat()
        .filter((value) => typeof value === "string" && value.trim());
      if (validation.length) return validation.join(" · ");
      return (
        [data?.message, data?.error].find(
          (value) => typeof value === "string" && value.trim(),
        ) || fallback
      );
    },
    async checkSsl() {
      if (!this.isCustom || this.isExternal || !this.canWrite || this.isBusy)
        return;
      const key = this.resourceKey,
        requestId = ++this.requestId;
      this.busy = "ssl";
      this.sslResult = null;
      this.sslError = "";
      this.sslMessage = "";
      try {
        const { data } = await axios.post(
          window.API.POST_DOMAIN_CHECK_SSL(this.shop.id, this.item.domain.id),
        );
        if (key !== this.resourceKey || requestId !== this.requestId) return;
        this.sslResult = {
          ssl: typeof data?.domain?.ssl === "boolean" ? data.domain.ssl : null,
          skipped: data?.skipped === true,
        };
        if (
          data?.error ||
          data?.success === false ||
          this.sslResult.ssl === false
        ) {
          this.sslError = this.checkResultMessage(
            data,
            this.$t("domains_modern.workspace.sslCheckFailed"),
          );
        } else {
          this.sslMessage = this.checkResultMessage(
            data,
            this.$t(
              this.sslResult.ssl === true && !this.sslResult.skipped
                ? "domains_modern.workspace.sslCheckSuccess"
                : "domains_modern.workspace.sslCheckUnavailable",
            ),
          );
        }
        if (data?.domain) this.acceptDomain(data);
      } catch (error) {
        if (key === this.resourceKey && requestId === this.requestId) {
          this.sslError = this.checkResultMessage(
            error.response?.data || error,
            this.$t("domains_modern.workspace.sslCheckFailed"),
          );
        }
      } finally {
        if (key === this.resourceKey && requestId === this.requestId) {
          this.busy = "";
          // A failed HTTPS probe may still persist ssl=false without returning the domain.
          this.$emit("refresh");
        }
      }
    },
    async checkDns() {
      if (!this.isCustom || this.isExternal || !this.canWrite || this.isBusy)
        return;
      const key = this.resourceKey,
        requestId = ++this.requestId;
      this.busy = "dns";
      this.detectedDns = null;
      this.dnsCheckState = "notChecked";
      this.dnsVerification = {};
      this.dnsError = "";
      this.dnsMessage = "";
      try {
        // The legacy check may refresh approval and create a client; run it only after this explicit action.
        const { data } = await axios.get(
          window.API.GET_DOMAIN_INFO(this.shop.id, this.item.domain.domain),
        );
        if (key !== this.resourceKey || requestId !== this.requestId) return;
        this.detectedDns = Array.isArray(data?.dns) ? data.dns : null;
        const approved = data?.approved ?? data?.domain?.approved;
        // Only a result from this explicit check can become connection evidence.
        this.dnsCheckState =
          data?.error || data?.success === false
            ? "error"
            : this.detectedDns === null
              ? "unavailable"
              : approved === false
                ? "review"
                : approved === true &&
                    this.detectedDns.some((record) =>
                      ["A", "CNAME"].includes(String(record.type).toUpperCase()),
                    )
                  ? "accepted"
                  : "unavailable";
        this.dnsVerification = {
          valid_txt: data?.valid_txt,
          verified: data?.verified,
          approved: data?.approved,
          challenge_domain: data?.challenge_domain,
          dns_challenge: data?.dns_challenge,
          verification_host: data?.verification_host,
        };
        if (data?.client !== undefined) this.item.client = data.client;
        if (this.dnsCheckState === "error") {
          this.dnsError = this.checkResultMessage(
            data,
            this.$t("domains_modern.connection.dnsError"),
          );
        } else {
          this.dnsMessage = this.checkResultMessage(
            data,
            this.$t(
              "domains_modern.workspace.health.states." +
                (this.dnsCheckState === "accepted"
                  ? "dnsAcceptedHint"
                  : this.dnsCheckState === "review"
                    ? "dnsReviewHint"
                    : "dnsUnavailableHint"),
            ),
          );
          if (data?.domain) this.acceptDomain(data);
        }
      } catch (error) {
        if (key === this.resourceKey && requestId === this.requestId) {
          this.dnsCheckState = "error";
          this.dnsError = this.checkResultMessage(
            error.response?.data || error,
            this.$t("domains_modern.connection.dnsError"),
          );
        }
      } finally {
        if (key === this.resourceKey && requestId === this.requestId) {
          this.busy = "";
          this.$emit("refresh");
        }
      }
    },
    repairClient() {
      if (!this.canWrite || this.busy || (this.isExternal && this.item.client))
        return;
      const target = this.isCustom ? this.item.domain.id : this.item.official;
      return this.runWrite(
        "repair",
        () =>
          axios.post(
            window.API.POST_CREATE_CLIENT_FOR_DOMAIN(this.shop.id, target),
          ),
        (data) => {
          if (data.client) this.item.client = data.client;
          this.operationMessage =
            data.message || this.$t("domains_modern.workspace.repairDone");
        },
      );
    },
    deleteDomain() {
      if (!this.canDelete) return;
      const key = this.resourceKey;
      NotificationService.openDangerAlert(
        this.$t("admin_shop.dashboard.info.alert.title"),
        this.$t("admin_shop.dashboard.info.alert.message"),
        this.$t("global.actions.delete"),
        () => {
          if (key !== this.resourceKey || !this.canDelete) return;
          this.runWrite(
            "delete",
            () =>
              axios.delete(
                window.API.DELETE_EDIT_DOMAIN(
                  this.shop.id,
                  this.item.domain.domain,
                ),
              ),
            (data) => {
              this.DeleteItemByID(this.shop.domains, data.id);
              this.baseline = {};
              this.syncDrafts();
              this.homeDirty = false;
              this.resetRemoval();
              this.$emit("deleted", data.id);
            },
          );
        },
      );
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-workspace {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 32px 28px 38px;
  width: 100%;
  max-width: 1096px;
  margin-inline: auto;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  &__heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    margin-bottom: 2px;
  }
  &__heading h1 {
    margin: 0;
    font-family: inherit;
    font-size: 22px;
    font-weight: 500;
    line-height: 35px;
  }
  &__heading-copy {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }
  &__heading-copy > .v-icon {
    margin-top: 6px;
    color: var(--sd-modern-muted);
    flex: none;
  }
  &__meta {
    font-size: 12px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__heading p,
  &__widget-heading p,
  &__setting-row p {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 23px;
  }
  &__widget.sd-modern-widget {
    padding: 23px;
    border-radius: 17px;
  }
  &__widget-heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  &__widget-heading > .v-icon {
    color: var(--sd-modern-muted);
    margin-top: 3px;
    flex: none;
  }
  &__widget-heading > div {
    flex: 1;
    min-width: 0;
  }
  &__widget-heading > .v-btn,
  &__widget-heading > .sd-modern-icon-button {
    margin-inline-start: auto;
    flex: none;
  }
  &__widget-heading h2,
  &__widget h2,
  &__dialog h2 {
    margin: 0;
    font-family: inherit;
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
  }
  &__widget h3 {
    margin: 0;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  &__overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(235px, 1fr);
    gap: 22px;
    align-items: start;
  }
  &__overview-column {
    display: flex;
    flex-direction: column;
    gap: 22px;
    min-width: 0;
  }
  &__health-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  &__health-status .sd-modern-status {
    font-size: 13px;
    line-height: 21px;
    font-weight: 400;
  }
  &__eyebrow {
    font-size: 11px;
    line-height: 18px;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--sd-modern-muted);
  }
  &__health h2 {
    font-size: 20px;
    line-height: 30px;
    font-weight: 500;
    letter-spacing: -0.25px;
  }
  &__health-description {
    margin: 7px 0 0;
    font-size: 14px;
    line-height: 23px;
    color: var(--sd-modern-muted);
  }
  &__health-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 19px;
  }
  &__health-note {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 15px 0 0;
    font-size: 13px;
    line-height: 21px;
    color: var(--sd-modern-muted);
  }
  &__health-note > .v-icon {
    margin-top: 2px;
    flex: none;
  }
  &__overview-list {
    margin: 18px -12px -10px;
  }
  &__overview-row-wrap + &__overview-row-wrap {
    border-top: 1px solid var(--sd-modern-border);
  }
  &__overview-row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 14px 12px;
    border-radius: 9px;
  }
  &__overview-row:hover,
  &__overview-row:focus-within {
    background: var(--sd-modern-inset);
  }
  &__overview-row > .v-icon {
    color: var(--sd-modern-muted);
    flex: none;
  }
  &__overview-row-copy {
    min-width: 0;
    flex: 1;
  }
  &__overview-row-copy p {
    margin: 3px 0 0;
    font-size: 13px;
    line-height: 21px;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
  }
  &__overview-row > .v-btn {
    flex: none;
  }
  &__sitemap-link {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    max-width: 100%;
    color: inherit;
  }
  &__sitemap-link > bdi {
    min-width: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  &__sitemap-link > .v-icon {
    flex: none;
    color: inherit;
  }
  &__preview-facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin: 18px 0 0;
    padding-top: 18px;
    border-top: 1px solid var(--sd-modern-border);
  }
  &__preview-facts > div {
    min-width: 0;
  }
  &__preview-facts dt {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
  &__preview-facts dd {
    margin: 3px 0 0;
    font-size: 14px;
    line-height: 22px;
    overflow-wrap: anywhere;
  }
  &__preview-manage {
    margin-top: 6px;
  }
  &__connection-steps {
    margin-top: 23px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  &__connection-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }
  &__connection-step > div {
    min-width: 0;
  }
  &__connection-step p {
    margin: 3px 0 0;
    font-size: 13px;
    line-height: 22px;
    color: var(--sd-modern-muted);
  }
  &__step-number {
    display: grid;
    place-items: center;
    width: 25px;
    height: 25px;
    flex: none;
    border: 1px solid var(--sd-modern-border);
    border-radius: 50%;
    font-size: 12px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__connection-check {
    margin-top: 23px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }
  &__connection-check > .v-btn {
    flex: none;
  }
  &__ssl {
    scroll-margin-top: 24px;
  }
  &__facts {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    margin: 20px 0 0;
    padding-top: 20px;
    border-top: 1px solid var(--sd-modern-border);
  }
  &__facts--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  &__facts > div {
    min-width: 0;
  }
  &__facts dt,
  &__callback dt {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
  &__facts dd,
  &__callback dd {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 22px;
    overflow-wrap: anywhere;
  }
  &__facts .sd-modern-status {
    font-size: 13px;
    font-weight: 400;
    line-height: 22px;
  }
  &__expiry {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    column-gap: 10px;
    row-gap: 4px;
  }
  &__attention {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__attention > .v-icon {
    color: var(--sd-modern-muted);
    flex: none;
  }
  &__attention > div {
    flex: 1;
    min-width: 0;
  }
  &__attention p {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 23px;
  }
  &__form-group {
    margin-top: 24px;
  }
  &__section-help {
    margin: 14px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 23px;
  }
  &__record-choice {
    margin-top: 18px;
  }
  &__code {
    padding: 16px 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 22px;
    color: inherit;
    background: transparent;
  }
  &__guidance {
    margin-top: 22px;
    font-size: 13px;
    line-height: 23px;
  }
  &__guidance summary {
    padding-block: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
  &__guidance p {
    margin: 12px 0 0;
    color: var(--sd-modern-muted);
  }
  &__guidance h3 {
    margin-top: 20px;
  }
  &__setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding-block: 20px;
    border-bottom: 1px solid var(--sd-modern-border);
  }
  &__setting-row > div {
    min-width: 0;
  }
  &__primary-row {
    border-bottom: 0;
    padding-bottom: 0;
  }
  &__setting-row bdi {
    font-size: 13px;
    overflow-wrap: anywhere;
  }
  &__actions.sd-modern-actions {
    justify-content: flex-end;
    margin-top: 22px;
  }
  &__inline-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  &__search-layout {
    display: grid;
    grid-template-columns: minmax(0, 460px) minmax(0, 1fr);
    align-items: center;
    gap: 36px;
  }
  &__search-controls,
  &__search-illustration {
    min-width: 0;
  }
  &__search-sitemap {
    margin-block-start: 24px;
    padding-block-start: 22px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__sitemap-address {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    margin-block: 12px;
    padding: 10px 12px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
  }
  &__sitemap-address > bdi {
    font: inherit;
    font-size: 14px;
    line-height: 23px;
    overflow-wrap: anywhere;
    min-width: 0;
  }
  &__settings {
    display: grid;
    grid-template-columns: 164px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  &__settings-content {
    min-width: 0;
  }
  &__local-nav {
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
  }
  &__local-nav > .sd-modern-section-nav__item {
    text-align: start;
    justify-content: flex-start;
    min-height: 42px;
    padding: 10px 14px;
    font-size: 13px;
    line-height: 21px;
  }
  &__callback {
    margin-top: 22px;
  }
  &__verify {
    margin-top: 18px;
  }
  :deep(.sd-modern-button) {
    min-height: 42px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 22px;
    letter-spacing: 0;
  }
  :deep(.sd-modern-button .v-btn__content) {
    font: inherit;
    letter-spacing: 0;
  }
  :deep(.b-domain-workspace__health-action.sd-modern-button),
  &__health-actions > :deep(.sd-modern-button),
  &__overview-row > :deep(.sd-modern-button),
  :deep(.b-domain-workspace__preview-manage.sd-modern-button) {
    min-height: 36px;
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
  }
  :deep(.b-domain-workspace__health-action.sd-modern-button) {
    padding: 7px 12px;
  }
  :deep(.b-shop-home-select-modern__layout) {
    padding-bottom: 0;
  }
  @media (max-width: 750px) {
    padding: 25px 18px 32px;
    &__heading {
      align-items: flex-start;
      flex-wrap: wrap;
    }
    &__overview-grid {
      grid-template-columns: minmax(0, 1fr);
    }
    &__connection-check {
      flex-direction: column;
    }
    &__facts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    &__settings {
      grid-template-columns: minmax(0, 1fr);
      gap: 15px;
    }
    &__local-nav {
      flex-direction: row;
      flex-wrap: wrap;
    }
    &__local-nav > .sd-modern-section-nav__item {
      flex: 1;
      white-space: normal;
    }
    &__widget-heading {
      flex-wrap: wrap;
    }
    &__widget-heading:has(> .sd-modern-button) > div {
      flex-basis: calc(100% - 30px);
    }
    &__widget-heading > .v-btn {
      margin-inline-start: 30px;
    }
    &__attention {
      flex-wrap: wrap;
    }
  }
  @media (max-width: 900px) {
    &__search-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
    }
    &__search-illustration {
      width: min(480px, 100%);
      margin-inline: auto;
    }
  }
  @media (max-width: 480px) {
    padding: 23px 12px 30px;
    &__heading h1 {
      font-size: 22px;
      line-height: 35px;
    }
    &__widget.sd-modern-widget {
      padding: 18px;
    }
    &__facts {
      gap: 18px 12px;
    }
    &__facts--two {
      grid-template-columns: minmax(0, 1fr);
    }
    &__setting-row {
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 12px;
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    :deep(.sd-modern-button),
    &__local-nav > .sd-modern-section-nav__item {
      min-height: 44px;
    }
  }
}
.b-domain-workspace__quick-dialog.v-card {
  padding: 0;
  border-radius: 17px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  .b-domain-workspace__quick-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 21px;
    border-bottom: 1px solid var(--sd-modern-border);
  }
  .b-domain-workspace__quick-header > div {
    min-width: 0;
  }
  .b-domain-workspace__quick-header h2 {
    margin: 0;
    font-family: inherit;
    font-size: 18px;
    line-height: 27px;
    font-weight: 500;
  }
  .b-domain-workspace__quick-header bdi {
    display: block;
    margin-top: 3px;
    font-size: 13px;
    line-height: 21px;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
  }
  .b-domain-workspace__quick-body {
    padding: 21px;
  }
  .b-domain-workspace__quick-body > p {
    margin: 0;
    font-size: 13px;
    line-height: 22px;
    color: var(--sd-modern-muted);
  }
  .b-domain-workspace__quick-body .sd-modern-notice {
    margin-top: 14px;
  }
  .b-domain-workspace__quick-switch {
    margin-top: 18px;
  }
  .b-domain-workspace__quick-body > .b-domain-workspace__quick-hint {
    margin-top: 14px;
  }
  .b-domain-workspace__quick-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 0 21px 18px;
  }
  :deep(.sd-modern-button) {
    min-height: 36px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
    letter-spacing: 0;
  }
  :deep(.sd-modern-button .v-btn__content) {
    font: inherit;
    letter-spacing: 0;
  }
  @media (max-width: 600px), (pointer: coarse) {
    :deep(.sd-modern-button) {
      min-height: 44px;
    }
  }
}
.b-domain-workspace__sitemap-dialog.v-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  border-radius: 0;
  overflow: hidden;
  .b-domain-workspace__sitemap-header {
    display: flex;
    align-items: center;
    gap: 20px;
    flex: none;
    padding: 20px 28px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  .b-domain-workspace__sitemap-header > div {
    min-width: 0;
  }
  .b-domain-workspace__sitemap-header h2 {
    margin: 0;
    font: inherit;
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
  }
  .b-domain-workspace__sitemap-header bdi {
    display: block;
    margin-top: 3px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
    overflow-wrap: anywhere;
  }
  .b-domain-workspace__sitemap-header .sd-modern-icon-button {
    margin-inline-start: auto;
    flex: none;
  }
  .b-domain-workspace__sitemap-body {
    min-height: 0;
    flex: 1 1 auto;
    overflow: auto;
    padding: 0;
  }
  @media (max-width: 600px) {
    .b-domain-workspace__sitemap-header {
      padding: 16px 18px;
    }
  }
}
</style>
