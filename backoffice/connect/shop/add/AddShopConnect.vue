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
  <div
    class="b-add-shop-connect text-start"
    :class="{ 'b-add-shop-connect--modern sd-modern-form': modern }"
  >
    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ Details / Settings (Shown only in edit) ▂▂▂▂▂▂▂▂▂▂▂▂ -->
    <template v-if="shopConnect">
      <div v-if="modern" class="b-add-shop-connect__policies">
        <section class="sd-modern-widget b-add-shop-connect__policy">
          <header class="b-add-shop-connect__heading">
            <div>
              <h2>
                <v-icon size="18" aria-hidden="true">cable</v-icon
                >{{ $t("shop_connect.settings_flow.connection_title") }}
              </h2>
              <p>{{ $t("shop_connect.settings_flow.connection_body") }}</p>
            </div>
            <span class="sd-modern-status sd-modern-status--plain">
              <span
                class="sd-modern-status__dot"
                :class="enable ? 'text-success' : 'b-add-shop-connect__muted'"
                aria-hidden="true"
              ></span>
              {{
                $t(
                  enable
                    ? "shop_connect.workspace.enabled"
                    : "shop_connect.workspace.disabled",
                )
              }}
            </span>
          </header>
          <u-smart-switch
            :accessible="modern"
            v-model="enable"
            :aria-label="$t('shop_connect.settings_flow.connection_title')"
            :readonly="!can_write"
            :false-title="$t('global.commons.disable')"
            :true-title="$t('global.commons.enable')"
            :true-description="$t('shop_connect.edit.enable.true_desc')"
            :false-description="
              $t('shop_connect.settings_flow.connection_paused')
            "
            false-gray
            false-icon="pause"
            true-icon="cloud_sync"
            border
          />
        </section>

        <section class="sd-modern-widget b-add-shop-connect__policy">
          <header class="b-add-shop-connect__heading">
            <div>
              <h2>
                <v-icon size="18" aria-hidden="true">inventory_2</v-icon
                >{{ $t("shop_connect.settings_flow.catalog_title") }}
              </h2>
              <p>{{ $t("shop_connect.settings_flow.catalog_body") }}</p>
            </div>
          </header>
          <u-smart-switch
            :accessible="modern"
            v-model="overwrite"
            :aria-label="$t('shop_connect.settings_flow.catalog_title')"
            :readonly="!can_write"
            :false-description="
              $t('shop_connect.settings_flow.catalog_keep_body')
            "
            :false-title="$t('shop_connect.settings_flow.catalog_keep')"
            :true-description="
              $t('shop_connect.settings_flow.catalog_replace_body')
            "
            :true-title="$t('shop_connect.settings_flow.catalog_replace')"
            false-gray
            false-icon="edit_off"
            true-icon="mode_edit"
            border
          />
          <add-shop-connect-flow
            side-panel
            kind="catalog"
            :shop="shop"
            :connect="connect"
            :enabled="enable"
            :overwrite="overwrite"
          />
        </section>

        <section
          v-if="connect.confirm"
          class="sd-modern-widget b-add-shop-connect__policy"
        >
          <header class="b-add-shop-connect__heading">
            <div>
              <h2>
                <v-icon size="18" aria-hidden="true">shopping_bag</v-icon
                >{{ $t("shop_connect.settings_flow.orders_title") }}
              </h2>
              <p>{{ $t("shop_connect.settings_flow.orders_body") }}</p>
            </div>
          </header>
          <u-smart-switch
            :accessible="modern"
            v-model="auto_confirm"
            :aria-label="$t('shop_connect.settings_flow.orders_title')"
            :readonly="!can_write"
            :false-description="
              $t('shop_connect.settings_flow.orders_manual_body')
            "
            :false-title="$t('shop_connect.settings_flow.orders_manual_title')"
            :true-description="
              $t('shop_connect.settings_flow.orders_auto_body')
            "
            :true-title="$t('shop_connect.settings_flow.orders_auto_title')"
            false-gray
            false-icon="person_outline"
            true-icon="flash_auto"
            border
          />
          <add-shop-connect-flow
            side-panel
            kind="orders"
            :shop="shop"
            :connect="connect"
            :enabled="enable"
            :auto-confirm="auto_confirm"
          />
        </section>

        <section
          v-if="connect.shipping"
          class="sd-modern-widget b-add-shop-connect__policy"
        >
          <header class="b-add-shop-connect__heading">
            <div>
              <h2>
                <v-icon size="18" aria-hidden="true">local_shipping</v-icon
                >{{ $t("shop_connect.settings_flow.shipping_title") }}
              </h2>
              <p>{{ $t("shop_connect.settings_flow.shipping_body") }}</p>
            </div>
          </header>
          <u-smart-switch
            :accessible="modern"
            v-model="shipping"
            :aria-label="$t('shop_connect.settings_flow.shipping_title')"
            :readonly="!can_write"
            :false-description="
              $t('shop_connect.settings_flow.shipping_shop_body')
            "
            :false-title="$t('shop_connect.settings_flow.shipping_shop_title')"
            :true-description="
              $t('shop_connect.settings_flow.shipping_provider_body')
            "
            :true-title="
              $t('shop_connect.settings_flow.shipping_provider_title', {
                provider: connect.name,
              })
            "
            false-gray
            true-icon="local_shipping"
            border
          />
          <div class="sd-modern-notice b-add-shop-connect__hint">
            <v-icon size="16" aria-hidden="true">info_outline</v-icon>
            <p>{{ $t("shop_connect.settings_flow.shipping_latency") }}</p>
          </div>
          <add-shop-connect-flow
            side-panel
            kind="shipping"
            :shop="shop"
            :connect="connect"
            :shipping="shipping"
          />
        </section>
      </div>
      <div v-else class="mb-5 widget-box">
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          :title="$t('shop_connect.edit.order.title')"
          icon="shopping_bag"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t("shop_connect.edit.order.subtitle") }}
        </v-list-subheader>
        <u-smart-switch
          :accessible="modern"
          :readonly="!can_write"
          v-model="enable"
          :false-title="$t('global.commons.disable')"
          :label="$t('shop_connect.edit.enable.label')"
          :true-description="$t('shop_connect.edit.enable.true_desc')"
          :true-title="$t('global.commons.enable')"
          class="my-3"
          false-gray
          false-icon="stop"
          true-icon="cloud_sync"
          border
        ></u-smart-switch>

        <u-smart-switch
          :accessible="modern"
          :readonly="!can_write"
          v-model="overwrite"
          :false-description="$t('shop_connect.edit.overwrite.false_desc')"
          :false-title="$t('shop_connect.edit.overwrite.false_title')"
          :true-description="$t('shop_connect.edit.overwrite.true_desc')"
          :true-title="$t('shop_connect.edit.overwrite.true_title')"
          class="my-3"
          false-gray
          false-icon="edit_off"
          true-icon="mode_edit"
          border
        ></u-smart-switch>

        <u-smart-switch
          :accessible="modern"
          :readonly="!can_write"
          v-if="connect.confirm"
          v-model="auto_confirm"
          :false-description="$t('shop_connect.edit.confirm.false_desc')"
          :false-title="$t('global.commons.disable')"
          :label="$t('shop_connect.edit.confirm.label')"
          :true-description="$t('shop_connect.edit.confirm.true_desc')"
          :true-title="$t('global.commons.enable')"
          class="my-3"
          false-gray
          false-icon="close"
          true-icon="flash_auto"
          border
        ></u-smart-switch>

        <v-expand-transition>
          <div v-if="auto_confirm">
            <v-list-subheader>
              <div>
                <v-icon class="me-1" size="small">tips_and_updates</v-icon>
                {{ $t("shop_connect.edit.confirm.tips") }}
              </div>
            </v-list-subheader>
          </div>
        </v-expand-transition>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Shipping  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <template v-if="connect.shipping">
          <v-list-subheader>
            {{ $t("shop_connect.edit.shipping.tips") }}
          </v-list-subheader>

          <u-smart-switch
            :accessible="modern"
            :readonly="!can_write"
            v-model="shipping"
            :false-description="$t('shop_connect.edit.shipping.false_desc')"
            :false-title="$t('shop_connect.edit.shipping.false_title')"
            :label="$t('shop_connect.edit.shipping.label')"
            :true-description="$t('shop_connect.edit.shipping.true_desc')"
            :true-title="$t('shop_connect.edit.shipping.true_title')"
            class="my-3"
            false-gray
            true-icon="local_shipping"
            border
          ></u-smart-switch>
        </template>
      </div>

      <add-shop-connect-import-preferences
        v-if="modern"
        standalone
        modern
        :shop="shop"
        :connect="connect"
        :shop-connect="shopConnect"
        :params="params"
        :overwrite="overwrite"
        :can-write="can_write"
        :endpoint-field="endpointFormField"
      />

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Save Action  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <s-widget-buttons :class="{ 'sd-modern-form-actions': modern }">
        <div v-if="modern" class="b-add-shop-connect__save-copy" role="status">
          <strong>{{
            $t(
              hasSettingsChanges
                ? "shop_connect.settings_flow.settings_unsaved"
                : "shop_connect.settings_flow.settings_saved",
            )
          }}</strong>
          <p>{{ $t("shop_connect.settings_flow.save_hint") }}</p>
        </div>
        <v-btn
          :class="{ 'sd-modern-button': modern }"
          :disabled="!can_write || (modern && (!hasSettingsChanges || loading))"
          :loading="busy_set"
          :color="modern && !hasSettingsChanges ? undefined : 'primary'"
          size="x-large"
          variant="elevated"
          @click="updateConnect"
        >
          <v-icon start>save</v-icon>
          {{
            $t(
              modern
                ? "shop_connect.settings_flow.save_action"
                : "global.actions.save_changes",
            )
          }}
        </v-btn>
      </s-widget-buttons>
    </template>

    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Select Service ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

    <div class="mb-5" :class="modern ? 'sd-modern-widget' : 'widget-box'">
      <u-widget-header
        :class="{ 'sd-modern-form-header': modern }"
        :title="
          $t(
            modern
              ? 'shop_connect.settings_flow.setup_title'
              : 'shop_connect.edit.service.title',
          )
        "
        icon="settings_ethernet"
      ></u-widget-header>
      <v-list-subheader>
        {{
          $t(
            modern
              ? "shop_connect.settings_flow.setup_body"
              : "shop_connect.edit.service.subtitle",
            { provider: connect?.name },
          )
        }}
      </v-list-subheader>

      <connect-input-field
        v-if="!modern || !shopConnect"
        :class="{ 'sd-modern-underlined-field': modern }"
        v-model="connect_id"
        v-model:default-connect="connect"
        :disable-fetch="!!shopConnect"
        :disabled="!!shopConnect"
        :shop="shop"
      ></connect-input-field>

      <div v-else class="b-add-shop-connect__provider">
        <v-avatar size="40" rounded aria-hidden="true">
          <v-img :src="getShopImagePath(connect.icon, 64)" alt="" />
        </v-avatar>
        <div>
          <strong>{{ connect.name }}</strong>
          <p>{{ mode_desc }}</p>
        </div>
      </div>

      <!-- Connect Chips -->
      <div v-if="connect" class="mb-2">
        <v-chip
          v-if="connect.read_categories"
          prepend-icon="folder"
          label
          size="x-small"
          :color="modern ? undefined : 'amber'"
          variant="flat"
          class="me-1"
          :class="{ 'sd-modern-tag': modern }"
        >
          {{ $t("global.commons.categories") }}
        </v-chip>
        <v-chip
          v-if="connect.read_products"
          prepend-icon="shelves"
          label
          size="x-small"
          :color="modern ? undefined : '#1976D2'"
          variant="flat"
          class="me-1"
          :class="{ 'sd-modern-tag': modern }"
        >
          {{ $t("global.commons.products") }}
        </v-chip>
        <v-chip
          v-if="connect.read_customers"
          prepend-icon="people"
          label
          size="x-small"
          :color="modern ? undefined : '#673AB7'"
          variant="flat"
          class="me-1"
          :class="{ 'sd-modern-tag': modern }"
        >
          {{ $t("global.commons.customers") }}
        </v-chip>
        <v-chip
          v-if="connect.read_orders"
          prepend-icon="shopping_bag"
          label
          size="x-small"
          :color="modern ? undefined : '#009688'"
          variant="flat"
          class="me-1"
          :class="{ 'sd-modern-tag': modern }"
        >
          {{ $t("global.commons.orders") }}
        </v-chip>
      </div>

      <v-expand-transition>
        <div v-if="connect">
          <div
            :class="{
              'b-add-shop-connect__credentials': modern && shopConnect,
            }"
          >
            <div
              v-if="modern && shopConnect"
              class="b-add-shop-connect__credential-summary"
            >
              <span class="b-add-shop-connect__credential-icon">
                <v-icon size="20" aria-hidden="true">lock_outline</v-icon>
              </span>
              <div class="b-add-shop-connect__credential-copy">
                <div class="b-add-shop-connect__credential-label">
                  <strong>{{ credentialFieldLabel }}</strong>
                  <span
                    class="sd-modern-status sd-modern-status--plain b-add-shop-connect__credential-state"
                  >
                    <v-icon
                      v-if="shopConnect.has_credentials === true"
                      size="14"
                      color="success"
                      aria-hidden="true"
                      >check</v-icon
                    >
                    {{
                      $t(
                        shopConnect.has_credentials === true
                          ? "shop_connect.settings_flow.credential_saved"
                          : shopConnect.has_credentials === false
                            ? "shop_connect.settings_flow.credential_missing"
                            : "shop_connect.settings_flow.credential_private",
                      )
                    }}
                  </span>
                </div>
                <p>
                  {{
                    $t(
                      shopConnect.has_credentials === false
                        ? "shop_connect.settings_flow.credential_missing_body"
                        : "shop_connect.settings_flow.credentials_replace_hint",
                    )
                  }}
                </p>
              </div>
              <v-btn
                v-if="credentialFormFields.length && !showCredentialInputs"
                class="sd-modern-button sd-modern-button--compact"
                variant="outlined"
                :disabled="!can_write"
                @click="replacingCredentials = true"
              >
                <v-icon start size="16" aria-hidden="true">edit</v-icon
                >{{
                  $t("shop_connect.settings_flow.replace_credential", {
                    field: credentialFieldLabel,
                  })
                }}
              </v-btn>
              <v-btn
                v-else-if="replacingCredentials"
                class="sd-modern-button sd-modern-button--compact"
                variant="text"
                :disabled="loading"
                @click="cancelCredentialReplacement"
                >{{
                  $t("shop_connect.settings_flow.cancel_replacement")
                }}</v-btn
              >
            </div>
            <v-expand-transition>
              <div
                v-if="setupFormFields.length && showCredentialInputs"
                :class="{
                  'b-add-shop-connect__credential-inputs':
                    modern && shopConnect,
                }"
              >
                <div v-for="item in setupFormFields" :key="item.name">
                  <v-text-field
                    :class="{ 'sd-modern-underlined-field': modern }"
                    v-if="!item.type"
                    v-model="params[item.name]"
                    :readonly="!can_write || (modern && loading)"
                    :type="
                      modern && item.name !== 'endpoint' ? 'password' : 'text'
                    "
                    :autocomplete="
                      modern && item.name !== 'endpoint'
                        ? 'new-password'
                        : undefined
                    "
                    :messages="modern ? item.hint : undefined"
                    :hint="modern ? undefined : item.hint"
                    :label="
                      modern && shopConnect
                        ? $t('shop_connect.settings_flow.new_credential', {
                            field: item.title,
                          })
                        : item.title
                    "
                    variant="underlined"
                  />
                </div>
              </div>
            </v-expand-transition>
          </div>

          <add-shop-connect-import-preferences
            v-if="!modern || !shopConnect"
            :modern="modern"
            :shop="shop"
            :connect="connect"
            :shop-connect="shopConnect"
            :params="params"
            :overwrite="overwrite"
            :can-write="can_write"
          />

          <v-expand-transition>
            <div
              v-if="
                modern &&
                shopConnect &&
                (hasConnectSetupChanges || hasSettingsChanges)
              "
              class="sd-modern-notice my-4"
              role="status"
            >
              <v-icon size="18" aria-hidden="true">sync_problem</v-icon>
              <div>
                <strong>{{
                  $t(
                    hasSettingsChanges
                      ? "shop_connect.settings_flow.settings_unsaved"
                      : "shop_connect.workspace.reconnect_title",
                  )
                }}</strong>
                <p class="ma-0">
                  {{
                    $t(
                      hasSettingsChanges
                        ? "shop_connect.settings_flow.save_before_reconnect"
                        : "shop_connect.settings_flow.reconnect_hint",
                    )
                  }}
                </p>
              </div>
            </div>
            <v-alert
              v-else-if="!modern && hasConnectSetupChanges"
              border="start"
              class="my-4 text-start"
              icon="sync_problem"
              color="#00796B"
              variant="tonal"
            >
              <div class="font-weight-bold mb-1">Reconnect required</div>
              <div>
                Connect setup settings have changed. Click Auto connect again to
                apply them; Save changes only stores shop connection options.
              </div>
            </v-alert>
          </v-expand-transition>

          <div
            v-if="modern && shopConnect"
            class="b-add-shop-connect__reconnect-help"
          >
            {{ $t("shop_connect.settings_flow.reconnect_scope") }}
            <p>{{ $t("shop_connect.settings_flow.reconnect_effects") }}</p>
          </div>
          <div
            v-if="connect"
            class="widget-buttons"
            :class="{ 'b-add-shop-connect__setup-actions': modern }"
          >
            <v-btn
              v-if="connect.direct_setup"
              :class="{ 'sd-modern-button': modern }"
              :disabled="
                !can_write ||
                (modern && setupActionBlocked) ||
                (connect.form &&
                  connect.form.length &&
                  connect.form.some(
                    (i) => ['endpoint'].includes(i.name) && !params[i.name],
                  ))
              "
              :loading="loading"
              :variant="connectActionVariant"
              :color="modern && setupActionBlocked ? undefined : 'primary'"
              size="x-large"
              @click="setupDirect()"
            >
              <v-icon start>{{
                modern && shopConnect ? "sync" : "add"
              }}</v-icon>
              {{ connectActionLabel }}

              <v-avatar
                :image="getShopImagePath(connect.icon)"
                class="mx-1 avatar-gradient -thin -connect"
                size="22"
              ></v-avatar>
              {{ connect.name }}
            </v-btn>

            <v-btn
              v-else
              :class="{ 'sd-modern-button': modern }"
              :disabled="
                !can_write ||
                (modern && setupActionBlocked) ||
                (connect.form &&
                  connect.form.length &&
                  connect.form.some(
                    (i) => ['endpoint'].includes(i.name) && !params[i.name],
                  ))
              "
              :href="connect_link"
              :loading="loading"
              :variant="connectActionVariant"
              :color="modern && setupActionBlocked ? undefined : 'primary'"
              size="x-large"
              @click="loading = true"
            >
              <v-icon start>{{
                modern && shopConnect ? "sync" : "add"
              }}</v-icon>
              {{ connectActionLabel }}

              <v-avatar
                :image="getShopImagePath(connect.icon)"
                class="mx-1 avatar-gradient -thin -connect"
                size="22"
              ></v-avatar>
              {{ connect.name }}

              <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
            </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </div>

    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Details (Shown only in edit) ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
    <template v-if="shopConnect">
      <component
        :is="modern ? 'details' : 'div'"
        class="mb-5 mt-10"
        :class="modern ? 'sd-modern-widget sd-modern-disclosure sd-modern-critical' : 'widget-box'"
      >
        <summary v-if="modern" class="sd-modern-disclosure__summary">
          <v-icon size="20" color="error" aria-hidden="true"
            >warning_amber</v-icon
          >
          <div class="sd-modern-disclosure__copy">
            <h2>{{ $t("shop_connect.workspace.critical_title") }}</h2>
            <p>{{ $t("shop_connect.workspace.critical_subtitle") }}</p>
          </div>
          <v-icon
            class="sd-modern-disclosure__chevron"
            size="18"
            aria-hidden="true"
            >expand_more</v-icon
          >
        </summary>
        <div :class="{ 'sd-modern-disclosure__content': modern }">
          <u-widget-header
            v-if="!modern"
            :title="$t('global.commons.critical_zone')"
            icon="warning_amber"
          >
          </u-widget-header>

          <u-smart-verify
            v-model="accept_delete"
            :true-description="delete_label"
            :true-title="$t('shop_connect.edit.remove.verify')"
            class="my-3"
            :color="modern ? 'error' : 'red'"
            :false-gray="modern"
          ></u-smart-verify>

          <div class="widget-buttons">
            <v-btn
              :class="{ 'sd-modern-button sd-modern-button--danger': modern }"
              :disabled="!accept_delete || !can_write"
              :loading="busy_delete"
              :color="modern ? 'error' : 'red'"
              :variant="modern ? 'elevated' : undefined"
              size="x-large"
              @click="remove"
            >
              <v-icon class="me-1" aria-hidden="true">{{
                modern ? "delete" : "remove"
              }}</v-icon>

              {{ $t("shop_connect.edit.remove.action") }}
            </v-btn>
          </div>
        </div>
      </component>
    </template>

    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Details (Shown only in add) ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

    <div
      v-if="connect && !shopConnect"
      class="mb-5"
      :class="modern ? 'sd-modern-widget' : 'widget-box'"
    >
      <u-widget-header
        :class="{ 'sd-modern-form-header': modern }"
        :title="`Functionality / ${mode}`"
        icon="settings_suggest"
      ></u-widget-header>

      <v-list-subheader>
        {{ mode_desc }}
      </v-list-subheader>

      <template v-if="connect.read_categories || connect.write_categories">
        <div class="font-weight-bold mt-5 mb-2">
          <v-icon class="me-1" size="small">folder</v-icon>
          {{ $t("global.commons.categories") }}
        </div>
        <connect-os-pods
          :connect="connect"
          :read="connect.read_categories"
          :shop="shop"
          :write="connect.write_categories"
        ></connect-os-pods>
      </template>

      <template v-if="connect.read_products || connect.write_products">
        <div class="font-weight-bold mt-5 mb-2">
          <v-icon class="me-1" size="small">inventory</v-icon>
          {{ $t("global.commons.products") }}
        </div>
        <connect-os-pods
          :connect="connect"
          :read="connect.read_products"
          :shop="shop"
          :write="connect.write_products"
        ></connect-os-pods>
      </template>

      <template v-if="connect.read_orders || connect.write_orders">
        <div class="font-weight-bold mt-5 mb-2">
          <v-icon class="me-1" size="small">shopping_bag</v-icon>
          {{ $t("global.commons.orders") }}
        </div>
        <connect-os-pods
          :connect="connect"
          :read="connect.read_orders"
          :shop="shop"
          :write="connect.write_orders"
        ></connect-os-pods>
      </template>

      <template v-if="connect.read_customers || connect.write_customers">
        <div class="font-weight-bold mt-5 mb-2">
          <v-icon class="me-1" size="small">group</v-icon>
          {{ $t("global.commons.customers") }}
        </div>
        <connect-os-pods
          :connect="connect"
          :read="connect.read_customers"
          :shop="shop"
          :write="connect.write_customers"
        ></connect-os-pods>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import ConnectInputField from "../../../connect/input/ConnectInputField.vue";
import ConnectOsPods from "../../../connect/pods/ConnectOsPods.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import { ToQueryString } from "@selldone/core-js/helper/string/StringHelper";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import { Connect } from "@selldone/core-js";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import AddShopConnectFlow from "./flow/AddShopConnectFlow.vue";
import AddShopConnectImportPreferences from "./AddShopConnectImportPreferences.vue";

export default {
  name: "AddShopConnect",
  mixins: [],
  emits: ["edit", "delete", "add"],
  components: {
    AddShopConnectFlow,
    AddShopConnectImportPreferences,
    SWidgetButtons,
    USmartVerify,
    USmartSwitch,
    ConnectOsPods,
    ConnectInputField,
  },

  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    shopConnect: {
      required: false,
      type: Object,
    },
    initialSelectedConnectId: {
      // Default Selected ID (In route query)
      type: Number,
    },
    initialEndpoint: {
      // Default Entered Endpoint (In route query)
    },
  },
  data: () => ({
    connect: null,
    connect_id: null,
    enable: false,
    auto_confirm: false,
    shipping: false,
    overwrite: false,

    loading: false,

    params: {
      test: true,
      keep_image_urls: false,
      import_out_of_stock_products: false,
    },
    saved_request_params: null,
    saved_settings: null,
    replacingCredentials: false,

    //--------------------
    busy_set: false,

    accept_delete: false,
    busy_delete: false,
  }),
  computed: {
    can_write() {
      return this.writeShopAccess(ShopPermissionRegions.CHANNELS.code);
    },
    credentialFormFields() {
      return (this.connect?.form || []).filter(
        (item) => !item.type && item.name !== "endpoint",
      );
    },
    endpointFormField() {
      return (this.connect?.form || []).find(
        (item) => !item.type && item.name === "endpoint",
      );
    },
    setupFormFields() {
      return this.modern && this.shopConnect
        ? this.credentialFormFields
        : this.connect?.form || [];
    },
    credentialFieldLabel() {
      return this.credentialFormFields.length === 1
        ? this.credentialFormFields[0].title
        : this.$t("shop_connect.settings_flow.credentials_title");
    },
    showCredentialInputs() {
      return (
        !this.modern ||
        !this.shopConnect ||
        this.shopConnect.has_credentials === false ||
        this.replacingCredentials
      );
    },
    connectionSettingsSnapshot() {
      return {
        enable: this.enable,
        auto_confirm: this.auto_confirm,
        shipping: this.shipping,
        overwrite: this.overwrite,
        endpoint: this.params.endpoint,
        test: this.params.test,
        keep_image_urls: this.request_params.keep_image_urls,
        import_out_of_stock_products:
          this.request_params.import_out_of_stock_products,
      };
    },
    hasSettingsChanges() {
      return (
        !!this.saved_settings &&
        JSON.stringify(
          this.normalizedConnectRequestParams(this.connectionSettingsSnapshot),
        ) !== JSON.stringify(this.saved_settings)
      );
    },
    setupActionBlocked() {
      if (this.busy_set) return true;
      if (this.shopConnect && this.hasSettingsChanges) return true;
      if (!this.credentialFormFields.length) return false;
      return (
        !this.showCredentialInputs ||
        !this.credentialFormFields.some((item) =>
          String(this.params[item.name] || "").trim(),
        )
      );
    },
    request_params() {
      const params = Object.assign({}, this.params);
      if (this.connect?.mode !== Connect.Modes.Migration.code) {
        delete params.keep_image_urls;
      }
      if (!this.connect?.read_products) {
        delete params.import_out_of_stock_products;
      }
      return params;
    },

    connect_link() {
      const query = /*  this.connect.form !test param!&&*/ this.request_params
        ? ToQueryString(this.request_params)
        : "";

      return (
        this.connect &&
        `/connect/${this.connect.code}/login/${this.shop.id}?${query}`
      );
    },

    hasConnectSetupChanges() {
      if (!this.shopConnect || !this.saved_request_params) return false;
      if (this.modern) {
        return this.credentialFormFields.some((item) =>
          String(this.params[item.name] || "").trim(),
        );
      }

      return (
        JSON.stringify(
          this.normalizedConnectRequestParams(this.request_params),
        ) !== JSON.stringify(this.saved_request_params)
      );
    },

    connectActionVariant() {
      if (this.modern && this.shopConnect)
        return this.hasConnectSetupChanges ? "elevated" : "outlined";
      return !this.shopConnect || this.hasConnectSetupChanges
        ? "elevated"
        : "text";
    },

    connectActionLabel() {
      if (this.modern)
        return this.$t(
          this.shopConnect
            ? "shop_connect.settings_flow.reconnect_action"
            : "shop_connect.settings_flow.connect_action",
        );
      return this.hasConnectSetupChanges
        ? this.modern
          ? this.$t("shop_connect.workspace.reconnect_action")
          : "Reconnect & apply settings"
        : this.$t("shop_connect.edit.add_action");
    },

    delete_label() {
      if (this.modern) {
        const key =
          this.connect.mode === Connect.Modes.Migration.code
            ? "remove_migration"
            : this.connect.mode === Connect.Modes.Dropshipping.code
              ? "remove_dropshipping"
              : "remove_service";
        return this.$t(`shop_connect.workspace.${key}`, {
          name: this.connect.name,
        });
      }
      if (this.connect.mode === Connect.Modes.Migration.code)
        return `I want to delete the ${this.connect.name} connection. All synced products will remain, and just its Connect badge in products management will be removed.`;
      else if (this.connect.mode === Connect.Modes.Dropshipping.code)
        return `I want to delete ${this.connect.name} <-> product connection. All synced products will be removed (Move to trashed).`;

      return `I want to delete ${this.connect.name} service.`;
    },

    mode() {
      return this.connect.mode;
    },
    mode_desc() {
      return Connect.Modes[this.mode] && this.$t(Connect.Modes[this.mode].desc);
    },
  },
  watch: {
    connect(connect) {
      if (connect && !connect.enable) {
        this.params.test = true; // Force test mode in private providers!
      }
      this.params = Object.assign({}, this.params); // Fix bug in the connect_link update!
    },
  },

  created() {
    if (this.shopConnect) {
      this.connect = this.shopConnect.connect;
      this.connect_id = this.shopConnect.connect_id;
      this.enable = this.shopConnect.enable;
      this.auto_confirm = this.shopConnect.auto_confirm;
      this.shipping = this.shopConnect.shipping;
      this.overwrite = this.shopConnect.overwrite;

      // Autofill endpoint value: (Used in connect to some services like WooCommerce)
      if (this.shopConnect.endpoint)
        this.params.endpoint = this.shopConnect.endpoint;
      // Autofill test value:
      this.params.test =
        this.shopConnect.test || (this.connect && !this.connect.enable);
      this.params.keep_image_urls =
        this.shopConnect.settings?.keep_image_urls === true;
      this.params.import_out_of_stock_products =
        this.shopConnect.settings?.import_out_of_stock_products === true;
    } else if (this.initialSelectedConnectId) {
      this.connect_id = this.initialSelectedConnectId;
      this.params.endpoint = this.initialEndpoint ? this.initialEndpoint : "";
    }

    this.rememberSavedConnectRequestParams();
    this.rememberSavedConnectionSettings();
  },

  methods: {
    cancelCredentialReplacement() {
      for (const item of this.credentialFormFields)
        delete this.params[item.name];
      this.replacingCredentials = false;
    },
    rememberSavedConnectionSettings() {
      this.saved_settings = this.normalizedConnectRequestParams(
        this.connectionSettingsSnapshot,
      );
    },
    reconcileConnectionSettings(connection, submittedSettings) {
      const received = { ...submittedSettings };
      for (const key of [
        "enable",
        "auto_confirm",
        "shipping",
        "overwrite",
        "endpoint",
        "test",
      ]) {
        if (Object.prototype.hasOwnProperty.call(connection, key))
          received[key] = connection[key];
      }
      if (connection.settings) {
        received.keep_image_urls =
          this.request_params.keep_image_urls === undefined
            ? undefined
            : connection.settings.keep_image_urls === true;
        received.import_out_of_stock_products =
          this.request_params.import_out_of_stock_products === undefined
            ? undefined
            : connection.settings.import_out_of_stock_products === true;
      }
      const current = this.connectionSettingsSnapshot;
      for (const key of Object.keys(received)) {
        // Keep any draft changes made while provider authorization was pending.
        if (current[key] !== submittedSettings[key]) continue;
        if (
          [
            "endpoint",
            "test",
            "keep_image_urls",
            "import_out_of_stock_products",
          ].includes(key)
        )
          this.params[key] = received[key];
        else this[key] = received[key];
      }
      this.saved_settings = this.normalizedConnectRequestParams(received);
    },
    normalizedConnectRequestParams(params) {
      return Object.keys(params || {})
        .sort()
        .reduce((normalized, key) => {
          if (params[key] !== undefined) normalized[key] = params[key];
          return normalized;
        }, {});
    },

    rememberSavedConnectRequestParams() {
      this.saved_request_params = this.normalizedConnectRequestParams(
        this.request_params,
      );
    },

    setupDirect() {
      if (!this.can_write || this.loading) return;
      if (this.modern && this.setupActionBlocked) return;
      this.loading = true;
      const submittedSettings = this.connectionSettingsSnapshot;

      axios
        .post(
          window.API.POST_SHOP_CONNECT_SETUP_DIRECT(
            this.shop.id,
            this.connect.code,
          ),
          this.request_params,
        )
        .then(({ data }) => {
          if (!data.error) {
            if (this.modern && this.shopConnect) {
              if (
                !data.shop_connect ||
                typeof data.shop_connect !== "object" ||
                Array.isArray(data.shop_connect) ||
                !data.shop_connect.id
              ) {
                NotificationService.showErrorAlert(
                  null,
                  this.$t("shop_connect.workspace.request_error"),
                );
                return;
              }
              this.reconcileConnectionSettings(
                data.shop_connect,
                submittedSettings,
              );
              this.$emit("edit", data.shop_connect);
              this.cancelCredentialReplacement();
            } else this.$emit("add", data.shop_connect);
            this.rememberSavedConnectRequestParams();

            NotificationService.showSuccessAlert(
              null,
              "Connect has been added successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateConnect() {
      if (!this.can_write || this.busy_set) return;
      if (this.modern && this.loading) return;
      this.busy_set = true;
      const submittedSettings = this.connectionSettingsSnapshot;

      axios
        .put(
          window.API.PUT_UPDATE_SHOP_CONNECT(this.shop.id, this.shopConnect.id),
          {
            code: this.connect.code,
            ...submittedSettings,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("edit", data.shop_connect);
            this.saved_settings =
              this.normalizedConnectRequestParams(submittedSettings);
            NotificationService.showSuccessAlert(
              null,
              "Connect has been updated successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    remove() {
      if (!this.can_write || !this.accept_delete || this.busy_delete) return;
      this.busy_delete = true;

      axios
        .delete(
          window.API.DELETE_SHOP_CONNECT(this.shop.id, this.shopConnect.id),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("delete", data.id);

            this.$router.push({ name: "BPageShopChannelConnect" });

            NotificationService.showSuccessAlert(
              null,
              "Connect has been deleted successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-add-shop-connect--modern {
  width: 100%;
  max-width: none;
  .b-add-shop-connect__policies {
    display: grid;
    gap: 20px;
    margin-block-end: 16px;
  }
  .b-add-shop-connect__policy {
    min-width: 0;
    padding: 24px;
  }
  .b-add-shop-connect__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-block-end: 18px;
    > div {
      min-width: 0;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      line-height: 22px;
    }
    p {
      margin: 6px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 20px;
    }
    .sd-modern-status {
      flex-shrink: 0;
      margin-block-start: 2px;
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
    }
  }
  .b-add-shop-connect__muted {
    color: var(--sd-modern-muted);
  }
  .b-add-shop-connect__save-copy {
    flex: 1 1 240px;
    text-align: start;
    strong {
      font-size: 12px;
      font-weight: 500;
      line-height: 20px;
    }
    p {
      margin: 3px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 20px;
    }
  }
  .b-add-shop-connect__credentials {
    margin-block: 20px 16px;
    padding: 16px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    background: var(--sd-modern-inset);
  }
  .b-add-shop-connect__credential-summary {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
  }
  .b-add-shop-connect__credential-icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
  }
  .b-add-shop-connect__credential-label {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .b-add-shop-connect__credential-copy {
    min-width: 0;
    strong {
      font-size: 13px;
      font-weight: 600;
      line-height: 20px;
    }
    .b-add-shop-connect__credential-state {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 1px 7px;
      border: 1px solid var(--sd-modern-border);
      border-radius: 6px;
      background: rgb(var(--v-theme-surface));
      font-size: 12px;
      line-height: 20px;
    }
    p {
      margin: 6px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 20px;
    }
  }
  .b-add-shop-connect__credential-inputs {
    margin-block-start: 12px;
  }
  .b-add-shop-connect__reconnect-help {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
    margin-block: 16px;
    p {
      margin: 6px 0 0;
    }
  }
  .b-add-shop-connect__hint {
    margin-block-start: 12px;
    font-size: 12px;
    line-height: 20px;
    p {
      margin: 0;
    }
  }
  .b-add-shop-connect__provider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-block: 16px 12px;
    strong {
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
    }
    p {
      margin: 2px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 20px;
    }
  }
  :deep(.sd-modern-form-actions.widget-buttons) {
    width: 100%;
    max-width: none;
    margin-inline: 0;
    margin-block: 0 24px;
    padding: 0;
    justify-content: flex-end;
    > .sd-modern-button {
      flex-grow: 0;
      margin: 0;
    }
  }
  .b-add-shop-connect__setup-actions.widget-buttons {
    width: 100%;
    max-width: none;
    margin-inline: 0;
    padding: 0;
    justify-content: flex-end;
    > .sd-modern-button {
      flex: 0 1 auto;
      width: auto;
      margin: 0;
    }
  }
  @media (min-width: 1100px) {
    .b-add-shop-connect__policy:has(> .b-shop-connect-flow) {
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
      grid-template-rows: auto auto minmax(0, 1fr);
      column-gap: 32px;
      align-items: start;
      > :not(.b-shop-connect-flow) {
        grid-column: 1;
      }
      > .b-shop-connect-flow {
        grid-column: 2;
        grid-row: 1 / span 3;
        padding-block-start: 0;
      }
    }
  }
  .sd-modern-button {
    min-height: 40px;
    padding: 9px 15px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  > .sd-modern-widget {
    padding: 24px;
    font-size: 13px;
    line-height: 22px;
  }
  > .sd-modern-disclosure {
    padding: 0;
  }
  :deep(.s--widget-header h2) {
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
    letter-spacing: 0;
  }
  :deep(.v-list-subheader) {
    min-height: 0;
    padding: 0;
    margin-block: 0 16px;
    font-size: 13px;
    line-height: 22px;
    color: var(--sd-modern-muted);
  }
  :deep(.v-list-subheader__text) {
    min-width: 0;
    max-width: 100%;
    white-space: normal;
    overflow-wrap: anywhere;
    overflow: visible;
  }
  :deep(.s--smart-select h3) {
    font-size: 13px;
    font-weight: 500;
    line-height: 22px;
  }
  :deep(.s--smart-select .mnh b) {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  :deep(.s--smart-select .small) {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
    opacity: 1 !important;
  }
  .sd-modern-disclosure__copy h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
  }
  .sd-modern-disclosure__copy p {
    margin: 5px 0 0;
    font-size: 13px;
    line-height: 22px;
    color: var(--sd-modern-muted);
  }
  .sd-modern-disclosure__summary,
  .sd-modern-disclosure__content {
    padding: 24px;
  }
  :deep(.sd-modern-underlined-field .v-field__input),
  :deep(.sd-modern-underlined-field .v-label) {
    font-size: 13px;
  }
  .sd-modern-tag {
    color: rgb(var(--v-theme-on-surface));
    background: var(--sd-modern-inset);
  }
  .widget-buttons {
    gap: 8px;
    flex-wrap: wrap;
  }
  @media (max-width: 600px) {
    .b-add-shop-connect__credential-summary {
      grid-template-columns: 32px minmax(0, 1fr);
      align-items: start;
      > .v-btn {
        grid-column: 1 / -1;
        width: 100%;
        max-width: 100%;
        height: auto;
        min-height: 44px;
        :deep(.v-btn__content) {
          white-space: normal;
          text-align: start;
        }
      }
    }
    .b-add-shop-connect__credential-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }
    .b-add-shop-connect__policy {
      padding: 18px;
    }
    .b-add-shop-connect__heading {
      flex-wrap: wrap;
      gap: 8px;
    }
    > .sd-modern-widget,
    .sd-modern-disclosure__summary,
    .sd-modern-disclosure__content {
      padding: 20px;
    }
    > .sd-modern-disclosure {
      padding: 0;
    }
    :deep(.sd-modern-underlined-field .v-field__input) {
      font-size: 16px;
    }
    .widget-buttons > .sd-modern-button {
      max-width: 100%;
      white-space: normal;
      height: auto;
      min-height: 44px;
    }
  }
}
</style>
