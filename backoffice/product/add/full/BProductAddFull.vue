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
  <div v-bind="$attrs" :class="{ 'b-product-add-full--modern': modern, 'b-product-add-full--general sd-modern-canvas': modernGeneral, 'b-product-add-full--general-info': modernWorkspace && step === TAB_GENERAL_INFO, 'b-product-add-full--features-info': modernWorkspace && step === TAB_RATING, 'b-product-add-full--spec-info': modernWorkspace && step === TAB_SPEC, 'b-product-add-full--images-info': modernWorkspace && step === TAB_IMAGES, 'b-product-add-full--inputs-info': modernWorkspace && step === TAB_INPUTS, 'b-product-add-full--price-info': modernWorkspace && step === TAB_PRICE, 'b-product-add-full--shipping-info': modernWorkspace && step === TAB_PHYSICAL_EXTRA_INFO, 'b-product-add-full--description-info': modernWorkspace && step === TAB_REVIEW_BLOG, 'b-product-add-full--inventory-info': modernWorkspace && step === TAB_VARIANTS, 'text-start': modernWorkspace }">
    <template v-if="!modernWorkspace && $product.id">
      <v-row align="center" no-gutters>
        <div style="min-width: 48px">
          <u-chart-radial-bar
            id="radial_bar"
            :colors="['#3F51B5']"
            :height="48"
            :labels="[$t('add_product.completed')]"
            :series="series"
            :to-colors="['#1976D2']"
            class="ms-2"
            small
          >
          </u-chart-radial-bar>
        </div>

        <span class="body-title"
          >%{{ series[0] }} {{ $t("add_product.completed") }}</span
        >

        <b-product-breadcrumbs
          v-if="$vuetify.display.smAndUp"
          :image-size="20"
          :product="$product"
          :shop="shop"
          class="flex-grow-0 ma-2 w-auto body-title"
        >
        </b-product-breadcrumbs>

        <v-spacer />

        <v-btn
          class="tnt ma-2"
          color="#D32F2F"
          rounded="xl"
          variant="text"
          @click="dialogDeleteProduct = true"
        >
          <v-icon start>delete</v-icon>
          {{ $t("global.actions.delete") }}
        </v-btn>
      </v-row>
    </template>

    <div v-if="!modernWorkspace && type">
      <u-tabs-rounded
        v-model="step"
        :src="type.image"
        :tabs="tabs"
        class="mt-4 mb-5 mx-1"
        scrollable
        small
        :disabled="!$product?.id"
      >
        <!-- TAB_IMAGES -->
        <template v-slot:[`item.${TAB_SPEC}`]>
          <div
            v-if="$product?.id"
            style="position: absolute; bottom: 2px; z-index: -1"
          >
            <v-chip
              v-if="$product.spec_order?.length"
              size="x-small"
              density="comfortable"
              color="#CDDC39"
              variant="flat"
              prepend-icon="check_circle"
            >
              {{ $t("add_product.menu_extra.has_spec") }}
            </v-chip>
            <v-chip
              v-else
              size="x-small"
              density="comfortable"
              color="#FFEB3B"
              variant="flat"
            >
              {{ $t("add_product.menu_extra.no_spec") }}
            </v-chip>
          </div>
        </template>

        <!-- TAB_IMAGES -->
        <template v-slot:[`item.${TAB_IMAGES}`]>
          <div
            v-if="$product?.id"
            style="position: absolute; bottom: 2px; z-index: -1"
          >
            <img
              v-if="$product.icon"
              key="p-icon"
              :src="getShopImagePath($product.icon, 64)"
              width="16"
              height="16"
              class="border rounded"
              style="margin-inline-start: 2px"
            />
            <img
              v-for="x in $product.images?.limit(2)"
              :key="x.id"
              :src="getShopImagePath(x.path, 64)"
              width="16"
              height="16"
              class="border rounded"
              style="margin-inline-start: 2px"
            />
            {{ $product.images?.length > 2 ? "..." : "" }}
          </div>
        </template>

        <!-- TAB_INPUTS -->
        <template v-slot:[`item.${TAB_INPUTS}`]>
          <div
            v-if="$product?.id"
            style="position: absolute; bottom: 2px; z-index: -1"
          >
            <v-chip
              v-if="$product.inputs?.length"
              size="x-small"
              density="comfortable"
              color="#CDDC39"
              variant="flat"
              prepend-icon="checklist"
            >
              {{ $t("add_product.menu_extra.form") }}
            </v-chip>
          </div>
        </template>

        <!-- TAB_PRICE -->
        <template v-slot:[`item.${TAB_PRICE}`]>
          <div
            v-if="$product?.id"
            style="position: absolute; bottom: 2px; z-index: -1"
          >
            <u-price
              :amount="$product.price"
              :currency="$product.currency"
            ></u-price>
          </div>
        </template>

        <!-- TAB_PHYSICAL_EXTRA_INFO -->
        <template v-slot:[`item.${TAB_PHYSICAL_EXTRA_INFO}`]>
          <div
            v-if="$product?.id && $product?.extra"
            style="position: absolute; bottom: 2px; z-index: -1"
            class="small"
          >
            <template v-if="$product.extra?.width">
              <v-icon>straighten</v-icon>
              {{ $product.extra.width }}x{{ $product.extra.length }}x{{
                $product.extra.height
              }}
            </template>
            <template v-if="$product.extra.weight">
              <v-icon class="ms-1">scale</v-icon>
              {{ $product.extra.weight }}
            </template>
          </div>
        </template>

        <!-- TAB_REVIEW_BLOG -->
        <template v-slot:[`item.${TAB_REVIEW_BLOG}`]>
          <div
            v-if="$product?.id"
            style="position: absolute; bottom: 2px; z-index: -1"
          >
            <v-chip
              v-if="SELECTED_ARTICLE_PACK?.article?.body?.length > 10"
              size="x-small"
              density="comfortable"
              color="#CDDC39"
              variant="flat"
              prepend-icon="format_quote"
              >{{ $t("add_product.menu_extra.description") }}
            </v-chip>
          </div>
        </template>

        <!-- TAB_VARIANTS -->
        <template v-slot:[`item.${TAB_VARIANTS}`]>
          <div
            v-if="$product?.id"
            style="position: absolute; bottom: 2px; z-index: -1"
          >
            <template v-if="$product.quantity > 0">
              {{ numeralFormat($product.quantity, "0.[0] a") }}
            </template>
            <v-chip
              v-else
              size="x-small"
              density="comfortable"
              color="#FFCDD2"
              variant="flat"
              prepend-icon="cancel"
              >{{ $t("global.commons.out_of_stock") }}
            </v-chip>
          </div>
        </template>
      </u-tabs-rounded>
    </div>

    <div ref="flowScroll" :class="{ 'b-product-add-full__scroll': modernWorkspace }">
      <div :class="{ 'b-product-add-full__layout': modernWorkspace }">
        <aside v-if="modernWorkspace" class="b-product-add-full__sidebar">
          <p v-if="modernGeneral" class="sd-modern-eyebrow b-product-add-full__rail-title">{{ $t('add_product.edit_info.modern.edit_product') }}</p>
          <div class="b-product-add-full__mobile-nav">
            <label :for="flowSelectId">{{ $t('add_product.flow.section') }}</label>
            <select
              :id="flowSelectId"
              :value="step"
              :disabled="flowBusy"
              @change="goTo(Number($event.target.value))"
            >
              <option
                v-for="tab in flowTabs"
                :key="tab.value"
                :value="tab.value"
                :disabled="!canSelectStep(tab.value)"
              >{{ tab.title }}</option>
            </select>
          </div>
          <nav class="sd-modern-section-nav b-product-add-full__nav" :aria-label="$t('add_product.flow.navigation')">
            <template v-for="tab in flowTabs" :key="tab.value">
              <div v-if="tab.group" class="sd-modern-eyebrow b-product-add-full__group">{{ tab.group }}</div>
              <button
                type="button"
                class="sd-modern-section-nav__item"
                :aria-current="step === tab.value ? 'location' : undefined"
                :disabled="!canSelectStep(tab.value)"
                @click="goTo(tab.value)"
              >
                <b-product-edit-info-icon :name="tab.icon" :size="16" />
                <span>{{ tab.title }}</span>
                <b-product-edit-info-icon v-if="completedSteps.includes(tab.value)" name="Check" class="b-product-add-full__saved" :size="12" />
              </button>
            </template>
          </nav>
          <p v-if="modern" class="b-product-add-full__context">{{ $t($product.id ? 'add_product.flow.created_hint' : 'add_product.flow.create_hint') }}</p>
          <div v-if="$product.id" class="b-product-add-full__product">
            <p class="b-product-add-full__completion"><b-product-edit-info-icon name="CircleCheck" :size="14" />{{ $t('add_product.completed') }} · {{ series[0] }}%</p>
            <b-product-breadcrumbs class="b-product-add-full__hierarchy" :image-size="20" :product="$product" :shop="shop" />
            <v-btn class="sd-modern-button sd-modern-button--inline" variant="text" :disabled="flowBusy" @click="dialogDeleteProduct = true">
              <template #prepend><b-product-edit-info-icon name="Trash2" :size="16" /></template>
              {{ $t('global.actions.delete') }}
            </v-btn>
          </div>
          <div v-if="canShowGooglePreview" class="b-product-add-full__preview-tools">
            <hr />
            <v-dialog
              v-model="show_preview"
              max-width="760"
              scrollable
              :theme="USER()?.preferences?.dark ? 'dark' : 'light'"
              :content-props="{ 'aria-label': $t('global.commons.seo_preview') }"
              @keydown.ctrl.s.stop.prevent
            >
              <template #activator="{ props }">
                <v-tooltip
                  class="b-product-add-full__preview-tooltip"
                  content-class="sd-modern-tooltip text-start"
                  location="top"
                  :open-on-focus="true"
                  :open-on-click="false"
                  :open-delay="300"
                  :close-delay="150"
                  :disabled="!$vuetify.display.lgAndUp || show_preview || dialogDeleteProduct || flowBusy"
                  :theme="USER()?.preferences?.dark ? 'dark' : 'light'"
                  interactive
                >
                  <template #activator="{ props: hoverProps }">
                    <v-btn v-bind="mergeProps(props, hoverProps)" class="sd-modern-button sd-modern-button--inline b-product-add-full__preview-launcher" variant="text" :disabled="flowBusy">
                      <template #prepend><img src="../../../../assets/trademark/google.svg" width="18" height="18" alt="" /></template>
                      {{ $t('global.commons.seo_preview') }}
                    </v-btn>
                  </template>
                  <div class="b-product-add-full__hover-preview" :aria-busy="busy_render_google">
                    <div :class="{ blurred: busy_render_google }" class="seo-preview" v-html="rendered_on_google"></div>
                  </div>
                </v-tooltip>
              </template>
              <v-card class="sd-modern-widget b-product-add-full__preview-dialog text-start">
                <header class="b-product-add-full__preview-header">
                  <h2><img src="../../../../assets/trademark/google.svg" width="20" height="20" alt="" />{{ $t('global.commons.seo_preview') }}</h2>
                  <v-btn class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" prepend-icon="refresh" :loading="busy_render_google" @click="getRenderedOnGoogle">{{ $t('global.actions.update') }}</v-btn>
                  <v-tooltip location="top" content-class="sd-modern-tooltip">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" class="sd-modern-icon-button" variant="text" icon="close" :aria-label="$t('global.actions.close')" @click="show_preview = false" />
                    </template>
                    {{ $t('global.actions.close') }}
                  </v-tooltip>
                </header>
                <v-card-text class="b-product-add-full__preview-body">
                  <div :class="{ blurred: busy_render_google }" class="seo-preview" v-html="rendered_on_google"></div>
                </v-card-text>
              </v-card>
            </v-dialog>
          </div>
        </aside>
        <main :class="{ 'b-product-add-full__main': modernWorkspace }">
          <header v-if="modernWorkspace" class="b-product-add-full__heading">
            <div>
              <p v-if="!modernGeneral" class="b-product-add-full__position">
                {{ $t('add_product.flow.position', { current: flowStepIndex + 1, total: flowTabs.length }) }}
                <template v-if="type && step !== TAB_TYPE"><span aria-hidden="true">·</span>{{ $t(type.name) }}</template>
              </p>
              <h2>{{ flowCurrentTab?.title }}</h2>
              <p class="b-product-add-full__subtitle">{{ modernGeneral && step === TAB_GENERAL_INFO ? $t('add_product.edit_info.modern.page_subtitle') : flowSubtitle }}</p>
            </div>
            <span v-if="modernGeneral && type" class="b-product-add-full__type-label"><b-product-edit-info-icon name="PackageOpen" :size="14" />{{ $t(type.name) }}</span>
            <v-btn v-if="step === TAB_GENERAL_INFO && !$product.id" color="primary" variant="text" class="sd-modern-button sd-modern-button--inline" :disabled="flowBusy" @click="goTo(TAB_TYPE)">
              {{ $t('add_product.flow.change_type') }}
            </v-btn>
          </header>
          <div>
            <div v-if="modern && step === TAB_GENERAL_INFO && !$product.id" class="sd-modern-notice b-product-add-full__create-notice" role="status">
              <v-icon size="17" aria-hidden="true">info_outline</v-icon>
              <span>{{ $t('add_product.flow.create_notice') }}</span>
            </div>

    <!-- ███████████████████████ Product Type ███████████████████████ -->

    <div v-if="step === TAB_TYPE" class="max-width-container-1280px mx-auto" :class="{ 'sd-modern-widget b-product-add-full__type': modern }">
      <u-widget-header
        v-if="!modern"
        :title="$t('global.commons.product_type')"
        icon="workspaces"
        :icon-color="modern ? undefined : '#333'"
        :class="{ 'sd-modern-form-header': modern }"
      ></u-widget-header>
      <v-list-subheader v-if="!modern">
        {{ $t("add_product.select_type.title") }}
      </v-list-subheader>

      <b-product-edit-type
        :modern="modern"
        :selected-type="type?.code"
        :shop="shop"
        has-add-connect-os
        has-add-dropshipping
        has-add-sku
        @select="(item) => setType(item)"
      ></b-product-edit-type>
    </div>

    <!-- ███████████████████████ Product Info ███████████████████████ -->

    <component :is="modernWorkspace ? 'VForm' : 'div'" v-if="isStepMounted(TAB_GENERAL_INFO)" v-show="step === TAB_GENERAL_INFO" ref="stepForm" @submit.prevent="submitStep">
    <b-product-edit-info
      :ref="(editor) => setStepEditor(editor, TAB_GENERAL_INFO)"
      :modern="modernWorkspace"
      :external-action-buttons="modernWorkspace"
      :class="{ 'b-product-add-full__general-editor sd-modern-underlined-field': modernWorkspace }"
      :busy="busy"
      :product="$product"
      :shop="shop"
      :vendor="vendor"
      @next="modernGeneral ? submitStep() : nextStep()"
    />
    </component>
    <!-- ███████████████████████ Product Rating ███████████████████████ -->

    <!-- Visibility belongs on DOM wrappers because some editors have fragment roots. -->
    <div v-if="isStepMounted(TAB_RATING)" v-show="step === TAB_RATING">
    <b-product-edit-features
      :ref="(editor) => setStepEditor(editor, TAB_RATING)"
      :modern="modernWorkspace"
      :external-action-buttons="modern"
      :class="{ 'b-product-add-full__features-editor sd-modern-underlined-field': modernWorkspace }"
      :product="$product"
      @next="nextStep()"
    />
    </div>
    <!-- ███████████████████████ Product Spec ███████████████████████ -->

    <div v-if="isStepMounted(TAB_SPEC)" v-show="step === TAB_SPEC">
    <b-product-edit-spec
      :ref="(editor) => setStepEditor(editor, TAB_SPEC)"
      :modern="modernWorkspace"
      :external-action-buttons="modern"
      :class="{ 'b-product-add-full__spec-editor sd-modern-underlined-field': modernWorkspace }"
      :product="$product"
      :shop="shop"
      @next="nextStep()"
      @update-spec="
        () => {
          if ($product) {
            //  $product.spec = $product.spec;
            //  $product.spec_order = $product.spec_order;
          }
        }
      "
    />
    </div>
    <!-- ███████████████████████ Product Images ███████████████████████ -->

    <div v-if="isStepMounted(TAB_IMAGES)" v-show="step === TAB_IMAGES">
    <b-product-edit-images
      :ref="(editor) => setStepEditor(editor, TAB_IMAGES)"
      :modern="modernWorkspace"
      :busy-save="busy"
      :external-action-buttons="modern"
      :class="{ 'sd-modern-underlined-field': modernWorkspace }"
      :product="$product"
      @next="nextStep()"
      @update:icon="(icon) => ($product.icon = icon)"
      @update:video="(video) => ($product.video = video)"
    />
    </div>
    <!-- ███████████████████████ Product Price ███████████████████████ -->

    <div v-if="isStepMounted(TAB_PRICE)" v-show="step === TAB_PRICE">
    <b-product-edit-price
      :ref="(editor) => setStepEditor(editor, TAB_PRICE)"
      :modern="modernWorkspace"
      :active="step === TAB_PRICE"
      :light="modernWorkspace"
      :external-action-buttons="modern || step !== TAB_PRICE"
      :class="modernWorkspace ? 'b-product-add-full__price-editor sd-modern-underlined-field' : 'mt-5'"
      :busy="busy"
      :is-marketplace="is_marketplace"
      :product="$product"
      :shop="shop"
      :vendor="vendor"
      has-button-next
      @next="nextStep()"
    />
    </div>

    <!-- ███████████████████████ Product Inputs ███████████████████████ -->

    <div v-if="isStepMounted(TAB_INPUTS)" v-show="step === TAB_INPUTS">
    <b-product-edit-inputs
      :ref="(editor) => setStepEditor(editor, TAB_INPUTS)"
      :modern="modernWorkspace"
      :external-action-buttons="modern || step !== TAB_INPUTS"
      :busy="busy"
      :product="$product"
      @next="nextStep()"
    />
    </div>
    <!-- ███████████████████████ Product Outputs ███████████████████████ -->

    <div v-if="isStepMounted(TAB_OUTPUTS)" v-show="step === TAB_OUTPUTS">
    <b-product-edit-outputs
      :ref="(editor) => setStepEditor(editor, TAB_OUTPUTS)"
      :external-action-buttons="modern"
      :class="{ 'b-product-add-full__editor sd-modern-underlined-field': modern }"
      :busy="busy"
      :product="$product"
      @next="nextStep()"
    />
    </div>
    <!-- ███████████████████████ Product Extra ███████████████████████ -->

    <div v-if="isStepMounted(TAB_PHYSICAL_EXTRA_INFO)" v-show="step === TAB_PHYSICAL_EXTRA_INFO">
    <b-product-edit-extra
      :ref="(editor) => setStepEditor(editor, TAB_PHYSICAL_EXTRA_INFO)"
      :modern="modernWorkspace"
      :active="step === TAB_PHYSICAL_EXTRA_INFO"
      :parent-busy="busy"
      :external-action-buttons="modern || step !== TAB_PHYSICAL_EXTRA_INFO"
      :class="modernWorkspace ? 'b-product-add-full__shipping-editor' : undefined"
      :product="$product"
      :shop="shop"
      @next="
        () => {
          if (step === TAB_PHYSICAL_EXTRA_INFO) nextStep();
        }
      "
    />
    </div>

    <!-- ███████████████████████ Product Article ███████████████████████ -->

    <div v-if="isStepMounted(TAB_REVIEW_BLOG)" v-show="step === TAB_REVIEW_BLOG" :class="{ 'b-product-add-full__article': modernWorkspace }">
      <article-viewer
        v-if="show_article"
        :ref="modernWorkspace ? (editor) => setStepEditor(editor, TAB_REVIEW_BLOG) : 'product_article'"
        :workspace="modernWorkspace"
        :active="step === TAB_REVIEW_BLOG"
        :article-type="article_type.code"
        :initial-article-pack="SELECTED_ARTICLE_PACK"
        :need-create-new="!SELECTED_ARTICLE_PACK"
        :owner="true"
        :product-id="$product.id"
        :shop="shop"
        :shop-id="shop.id"
        :show-author-info="false"
        :show-share-buttons="false"
        :tags="`${Slugify.apply(
          $product.category ? $product.category.title : null,
        )},${Slugify.apply($product.title)},${Slugify.apply($product.title_en)}`"
        :target-id="SELECTED_ARTICLE_PACK ? $product.id : 'new'"
        :class="modernWorkspace ? 'b-product-add-full__article-editor' : 'mt-5 min-height-60vh'"
        initial-render-state="editing"
        no-return-back-on-delete
        @delete="
          () => {
            DeleteItemByID(articles, SELECTED_ARTICLE_PACK.article.id);
            SELECTED_ARTICLE_PACK = null;

            show_article = false; //  force refresh!
            $nextTick(() => {
              show_article = true;
            });
          }
        "
        @update-article="
          (_article) => {
            if (!SELECTED_ARTICLE_PACK) {
              SELECTED_ARTICLE_PACK = { article: _article };
            } else {
              SELECTED_ARTICLE_PACK.article = _article;
            }
            AddOrUpdateItemByID(articles, _article);
          }
        "
      />

      <s-widget-buttons v-if="!modernWorkspace" auto-fixed-position class="mb-5 mt-12">
        <v-btn
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="nextStep()"
          v-ctrl.s="
            () => {
              nextStep();
            }
          "
        >
          {{ $t("global.actions.save_continue") }}

          <v-icon end>
            {{ $t("icons.arrow_end") }}
          </v-icon>
        </v-btn>
      </s-widget-buttons>
      <footer v-if="modernWorkspace && step === TAB_REVIEW_BLOG" class="b-product-add-full__description-actions">
        <div v-if="active_editor?.article" class="b-product-add-full__description-status">
          <p role="status" aria-live="polite">
            <b-product-edit-info-icon :name="generalDirty ? 'Circle' : 'CircleCheck'" :size="15" />
            {{ $t(generalDirty ? 'add_product.description_modern.unsaved' : 'add_product.description_modern.saved') }}
          </p>
          <small>{{ active_editor.product_save_hint || $t('add_product.description_modern.save_scope') }}</small>
        </div>
        <div v-if="modernGeneral" class="b-product-add-full__actions">
          <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :loading="flowBusy" :disabled="flowSubmitDisabled" aria-keyshortcuts="Control+s" @click="submitStep" v-ctrl.s="submitStep">
            <template #prepend><b-product-edit-info-icon name="Save" :size="16" /></template>
            {{ $t('global.actions.save_continue') }}
            <template #append><b-product-edit-info-icon name="ArrowRight" :size="16" class="b-product-add-full__description-direction" /></template>
          </v-btn>
        </div>
      </footer>
    </div>

    <!-- ███████████████████████ Product Variants ███████████████████████ -->

    <div v-if="isStepMounted(TAB_VARIANTS)" v-show="step === TAB_VARIANTS" :class="modernWorkspace && isPhysical ? 'b-product-add-full__inventory sd-modern-underlined-field' : modern ? 'b-product-add-full__editor sd-modern-underlined-field' : undefined">
      <b-product-inventory-management
        :ref="(editor) => setStepEditor(editor, TAB_VARIANTS)"
        :product="$product"
        :shop="shop"
        :vendor="vendor"
        :withTrashed="withTrashed"
        :modern="modernWorkspace"
        :product-workspace="modernWorkspace"
        :class="modernWorkspace ? undefined : 'mt-5'"
        @update:withTrashed="(val) => $emit('update:withTrashed', val)"
      />

      <footer v-if="modernGeneral && isPhysical && step === TAB_VARIANTS" class="b-product-add-full__inventory-actions">
        <p><b-product-edit-info-icon name="CircleCheck" :size="14" />{{ $t('add_product.inventory_modern.save_scope') }}</p>
        <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :loading="flowBusy" :disabled="flowSubmitDisabled" aria-keyshortcuts="Control+s" @click="submitStep" v-ctrl.s="submitStep">
          <template #prepend><b-product-edit-info-icon name="Check" :size="16" /></template>
          {{ $t('global.actions.finish') }}
        </v-btn>
      </footer>

      <div
        v-if="!modernWorkspace && !$route.params.product_id /*Not be in the product edit page!*/"
        class="widget-buttons mb-5 mt-12"
      >
        <v-btn
          :loading="busy"
          class="my-5"
          color="primary"
          rounded
          size="x-large"
          variant="elevated"
          @click="nextStep()"
        >
          {{ $t("global.actions.finish") }}

          <v-icon class="ms-2" size="small">
            {{ $t("icons.arrow_end") }}
          </v-icon>
        </v-btn>
      </div>
    </div>

          </div>

          <footer v-if="modernGeneral && step === TAB_GENERAL_INFO" class="b-product-add-full__general-actions">
            <p v-if="generalDirty !== null" role="status" aria-live="polite">{{ $t(generalDirty ? 'add_product.edit_info.modern.unsaved' : 'add_product.edit_info.modern.all_saved') }}</p>
            <div class="b-product-add-full__actions">
              <v-btn class="sd-modern-button" variant="outlined" :disabled="flowBusy || !generalDirty" @click="discardGeneralChanges">{{ $t('add_product.edit_info.modern.discard') }}</v-btn>
              <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :loading="flowBusy" :disabled="flowSubmitDisabled" aria-keyshortcuts="Control+s" @click="submitStep" v-ctrl.s="submitStep">
                <template #prepend><b-product-edit-info-icon name="Save" :size="16" /></template>
                {{ $t('add_product.edit_info.modern.save_changes') }}
              </v-btn>
            </div>
          </footer>

    <!-- ---------------------  Google search preview  ----------------------->

    <div v-if="!modernWorkspace && canShowGooglePreview" class="py-5">
      <v-btn
        v-if="!force_show_preview"
        class="my-10 tnt"
        variant="text"
        @click="show_preview = !show_preview"
        ><img
          class="me-1"
          height="20"
          src="../../../../assets/trademark/google.svg"
          width="20"
        />

        {{
          show_preview
            ? $t("global.actions.hide_preview")
            : $t("global.actions.show_preview")
        }}
      </v-btn>

      <v-expand-transition>
        <div v-if="show_preview || force_show_preview">
          <div :class="modern || (modernGeneral && [TAB_GENERAL_INFO, TAB_RATING, TAB_REVIEW_BLOG].includes(step)) ? 'b-product-add-full__seo' : 'widget-box'">
            <u-widget-header
              :add-caption="$t('global.actions.update')"
              :add-loading="busy_render_google"
              add-icon="refresh"
              add-text
              icon="fa:fa-brands fa-google"
              :title="$t('global.commons.seo_preview')"
              @click:add="getRenderedOnGoogle"
            ></u-widget-header>

            <div
              :class="{ blurred: busy_render_google }"
              class="seo-preview my-5"
              v-html="rendered_on_google"
            ></div>
          </div>
        </div>
      </v-expand-transition>
    </div>
        </main>
      </div>
    </div>
    <footer v-if="modern" class="b-product-add-full__footer">
      <div class="b-product-add-full__footer-inner">
        <p>{{ $t(step === TAB_TYPE ? 'add_product.flow.choose_hint' : step === TAB_RATING ? 'add_product.features_modern.save_hint' : step === TAB_VARIANTS ? 'add_product.inventory_modern.save_scope' : $product.id ? 'add_product.flow.save_hint' : 'add_product.flow.create_action_hint') }}</p>
        <div class="b-product-add-full__actions">
          <v-btn v-if="canGoBack" class="sd-modern-button b-product-add-full__back" variant="outlined" :disabled="flowBusy" prepend-icon="arrow_back" @click="previousStep">{{ $t('global.actions.back') }}</v-btn>
          <v-btn v-if="$product.id && step !== TAB_VARIANTS" class="sd-modern-button" variant="text" :disabled="flowBusy" prepend-icon="done" @click="finish">{{ $t('global.actions.finish') }}</v-btn>
          <v-btn
            class="sd-modern-button sd-modern-button--primary"
            :class="{ 'b-product-add-full__continue': step === TAB_TYPE || step === TAB_RATING }"
            color="primary"
            variant="elevated"
            :loading="flowBusy"
            :disabled="flowSubmitDisabled"
            :prepend-icon="step === TAB_SPEC ? undefined : step === TAB_TYPE || step === TAB_RATING ? 'arrow_forward' : step === TAB_GENERAL_INFO && !$product.id ? 'add' : step === TAB_VARIANTS ? 'done' : 'save'"
            aria-keyshortcuts="Control+s"
            @click="submitStep"
            v-ctrl.s="submitStep"
          >
            <template v-if="step === TAB_SPEC" #prepend><b-product-edit-info-icon name="Save" :size="16" /></template>
            {{ $t(step === TAB_TYPE || step === TAB_RATING ? 'global.actions.continue' : step === TAB_VARIANTS ? 'global.actions.finish' : 'global.actions.save_continue') }}
          </v-btn>
        </div>
      </div>
    </footer>
  </div>

  <!-- --------------------- Dialog delete --------------------- -->
  <v-dialog v-if="$product.id" v-model="dialogDeleteProduct" max-width="460">
    <v-card class="text-start" rounded="xl">
      <v-card-title class="d-flex align-center">
        <v-avatar
          v-if="$product.icon"
          class="me-2 avatar-gradient -thin -product"
          size="2.6em"
        >
          <img :src="getShopImagePath($product.icon, 64)" />
        </v-avatar>

        {{ $t("add_product.delete_product.title") }}
        <v-spacer></v-spacer>
        <v-icon class="m-2" color="#ddd" size="24">warning</v-icon>
      </v-card-title>

      <v-card-text>
        <div
          v-html="
            $t('add_product.delete_product.message', {
              product_title: $product.title,
            })
          "
        ></div>

        <hr class="my-5" />
        {{ $t("add_product.delete_product.tips") }}
      </v-card-text>

      <v-card-actions>
        <s-widget-buttons>
          <v-btn
            color="default"
            prepend-icon="close"
            size="x-large"
            variant="text"
            @click="dialogDeleteProduct = false"
          >
            {{ $t("global.actions.cancel") }}
          </v-btn>

          <v-btn
            :loading="busy_delete"
            color="red-darken-1"
            size="x-large"
            variant="flat"
            @click="deleteProduct()"
          >
            <v-icon start>delete</v-icon>
            {{ $t("global.actions.delete") }}
          </v-btn>
        </s-widget-buttons>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import BProductEditInfo from "../../../product/edit/info/BProductEditInfo.vue";
import BProductEditInfoIcon from "../../../product/edit/info/BProductEditInfoIcon.vue";
import BProductEditFeatures from "../../../product/edit/features/BProductEditFeatures.vue";
import BProductEditPrice from "../../../product/edit/price/BProductEditPrice.vue";
import BProductEditOutputs from "../../../product/edit/outputs/BProductEditOutputs.vue";
import BProductEditImages from "../../../product/edit/images/BProductEditImages.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductEditExtra from "../../../product/edit/extra/BProductEditExtra.vue";

import ArticleViewer from "../../../../article/ArticleViewer.vue";
import BProductEditSpec from "../../../product/edit/spec/BProductEditSpec.vue";
import BProductInventoryManagement from "../../inventory/management/BProductInventoryManagement.vue";
import UTabsRounded from "../../../../ui/tab/rounded/UTabsRounded.vue";
import UChartRadialBar from "../../../../ui/chart/radial/bar/UChartRadialBar.vue";
import { PricingTypes } from "@selldone/core-js/enums/product/PricingTypes";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import BProductBreadcrumbs from "../../../product/breadcrumbs/BProductBreadcrumbs.vue";
import BProductEditType from "../../../product/edit/type/BProductEditType.vue";
import { TrackSeller } from "@selldone/core-js/enums/gtag/TrackSeller";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";
import BProductEditInputs from "../../../product/edit/inputs/BProductEditInputs.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import { Article } from "@selldone/core-js";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { Slugify } from "@selldone/core-js/utils/slugify/slugify.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import { mergeProps, useId } from "vue";
import { VForm } from "vuetify/components";

const TAB_TYPE = 1;
const TAB_GENERAL_INFO = 2;
const TAB_RATING = 3;
const TAB_SPEC = 4;
const TAB_IMAGES = 5;

const TAB_INPUTS = 6;

const TAB_PRICE = 7;

const TAB_OUTPUTS = 8;

const TAB_PHYSICAL_EXTRA_INFO = 9;
const TAB_REVIEW_BLOG = 10;
const TAB_VARIANTS = 11;

/**
 * <b-product-add-full>
 */
export default {
  name: "BProductAddFull",
  setup() {
    return { flowSelectId: `product-flow-${useId()}`, mergeProps };
  },
  mixins: [],
  components: {
    VForm,
    UWidgetHeader,
    UPrice,
    SWidgetButtons,
    BProductEditType,
    BProductBreadcrumbs,
    UChartRadialBar,
    UTabsRounded,
    BProductInventoryManagement,
    BProductEditInputs,
    BProductEditExtra,
    BProductEditImages,
    BProductEditOutputs,
    BProductEditSpec,
    BProductEditPrice,
    BProductEditFeatures,
    BProductEditInfo,
    BProductEditInfoIcon,
    ArticleViewer,
  },
  /**
   * $product : Available in edit mode! But in add mode we should feed with initial values.
   */
  inject: ["$shop", "$product"],
  emits: ["update:withTrashed", "update:product", "edit", "add", "delete"],
  props: {
    modern: { type: Boolean, default: false },
    modernGeneral: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },

    withTrashed: {
      default: false,
      type: Boolean,
    },

    /**
     * Update route hash with current tab
     */
    replaceHashRoute: Boolean,
  },

  data: function () {
    return {
      Slugify: Slugify,

      show_article: true, // For refresh article!

      article_type: Article.Types.Product,

      TAB_TYPE: TAB_TYPE,
      TAB_GENERAL_INFO: TAB_GENERAL_INFO,
      TAB_RATING: TAB_RATING,
      TAB_SPEC: TAB_SPEC,
      TAB_IMAGES: TAB_IMAGES,
      TAB_PRICE: TAB_PRICE,
      TAB_INPUTS: TAB_INPUTS,
      TAB_OUTPUTS: TAB_OUTPUTS,
      TAB_PHYSICAL_EXTRA_INFO: TAB_PHYSICAL_EXTRA_INFO,
      TAB_REVIEW_BLOG: TAB_REVIEW_BLOG,

      TAB_VARIANTS: TAB_VARIANTS,

      tabs_name: {
        // use for hash url
        type: TAB_TYPE,
        general: TAB_GENERAL_INFO,
        rating: TAB_RATING,
        spec: TAB_SPEC,
        images: TAB_IMAGES,
        price: TAB_PRICE,
        inputs: TAB_INPUTS,
        outputs: TAB_OUTPUTS,
        extra: TAB_PHYSICAL_EXTRA_INFO,
        blog: TAB_REVIEW_BLOG,
        variants: TAB_VARIANTS,
      },

      busy: false, // Add or Edit button busy
      active_editor: null,
      stepEditors: {},
      visitedSteps: [],
      validatingStep: false,
      disposed: false,
      completedSteps: [],

      dialogDeleteProduct: false,

      step: 1,
      /*
            $product: {
              status: "Open",
              condition: ProductCondition.NEW.code,
              original: true,
            },*/
      type: null,

      ProductType: ProductType,

      //-------- Google Preview ----------
      busy_render_google: false,
      rendered_on_google: "",

      tab_mode: TAB_TYPE,
      // -------------------------------
      busy_delete: false,

      // -------------------------------
      show_preview: false,

      SELECTED_ARTICLE_PACK: null,

      // -------------------------------
      expanded_type: null,
    };
  },
  computed: {
    modernWorkspace() {
      return this.modern || !!this.modernGeneral;
    },
    generalDirty() {
      return typeof this.active_editor?.hasUnsavedChanges === 'boolean'
        ? this.active_editor.hasUnsavedChanges : null;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    option_types() {
      return ShopOptionsHelper.GetActiveTypes(this.shop);
    },

    available_types() {
      return Object.values(ProductType).filter((t) =>
        this.option_types.includes(t.code),
      );
    },

    tabs() {
      return [
        this.modern || !this.$product?.id /*In Edit Mode*/
          ? {
              title: this.$t("add_product.menu.type"),
              value: TAB_TYPE,
              color: "#512DA8",
              icon: "fa:fas fa-shapes",
            }
          : null,
        {
          title: this.$t("add_product.menu.general_info"),
          value: TAB_GENERAL_INFO,
          color: this.type?.color,
          icon: "fa:fas fa-pencil-ruler",
        },
        {
          title: this.$t("add_product.menu.rating"),
          value: TAB_RATING,
          color: this.type?.color,
          icon: "fa:fas fa-poll-h",
        },
        {
          title: this.$t("add_product.menu.spec"),
          value: TAB_SPEC,
          color: this.type?.color,
          icon: "fa:fas fa-sliders-h",
        },
        {
          title: this.$t("add_product.menu.images"),
          value: TAB_IMAGES,
          color: this.type?.color,
          icon: "fa:fas fa-image",
        },

        this.hasStep__Inputs
          ? {
              title: this.$t("add_product.menu.inputs"),
              value: TAB_INPUTS,
              color: this.type?.color,
              icon: "fa:fas fa-code-branch",
            }
          : null,

        {
          title: this.$t("add_product.menu.price"),
          value: TAB_PRICE,
          color: this.type?.color,
          icon: "fa:fas fa-cash-register",
        },

        this.hasStep__Outputs
          ? {
              title: this.$t("add_product.menu.outputs"),
              value: TAB_OUTPUTS,
              color: this.type?.color,
              icon: "fa:fas fa-code-branch",
            }
          : null,
        this.hasStep__physicalExtra
          ? {
              title: this.$t("add_product.menu.extra"),
              value: TAB_PHYSICAL_EXTRA_INFO,
              color: this.type?.color,
              icon: "fa:fas fa-dolly-flatbed",
            }
          : null,
        {
          title: this.$t("add_product.menu.review"),
          value: TAB_REVIEW_BLOG,
          color: this.type?.color,
          icon: "fa:fas fa-feather-alt",
        },
        this.hasStep__inventory
          ? {
              title: this.$t("add_product.menu.inventory"),
              value: TAB_VARIANTS,
              color: this.type?.color,
              icon: "fa:fas fa-boxes",
            }
          : null,
      ];
    },

    flowTabs() {
      const icons = {
        [TAB_TYPE]: 'Shapes',
        [TAB_GENERAL_INFO]: 'SquarePen',
        [TAB_RATING]: 'ListChecks',
        [TAB_SPEC]: 'SlidersHorizontal',
        [TAB_IMAGES]: 'Images',
        [TAB_INPUTS]: 'ClipboardList',
        [TAB_PRICE]: 'Tag',
        [TAB_OUTPUTS]: 'PackageCheck',
        [TAB_PHYSICAL_EXTRA_INFO]: 'Truck',
        [TAB_REVIEW_BLOG]: 'AlignLeft',
        [TAB_VARIANTS]: 'Archive',
      };
      return this.tabs.filter(Boolean).map((tab) => {
        const key = Object.keys(this.tabs_name).find((key) => this.tabs_name[key] === tab.value);
        return {
          ...tab,
          icon: icons[tab.value],
          title: tab.value === TAB_VARIANTS && this.type
            ? this.$t(`add_product.flow.inventory.${this.type.code}`)
            : this.$t(`add_product.flow.menu.${key}`),
          group: this.modernGeneral ? null : tab.value === TAB_TYPE ? this.$t('add_product.flow.start')
            : tab.value === TAB_GENERAL_INFO ? this.$t('add_product.flow.create')
              : tab.value === TAB_RATING ? this.$t('add_product.flow.refine') : null,
        };
      });
    },
    flowStepIndex() {
      return this.flowTabs.findIndex((tab) => tab.value === this.step);
    },
    flowCurrentTab() {
      return this.flowTabs[this.flowStepIndex];
    },
    flowSubtitle() {
      if (this.step === TAB_VARIANTS && this.isPhysical) return this.$t('add_product.inventory_modern.intro');
      const key = Object.keys(this.tabs_name).find((key) => this.tabs_name[key] === this.step);
      return this.$t(`add_product.flow.descriptions.${key}`);
    },
    flowBusy() {
      return this.busy || this.validatingStep || !!this.active_editor?.busy || (this.step === TAB_IMAGES && !!this.active_editor?.mediaBusy) || ([TAB_PRICE, TAB_REVIEW_BLOG, TAB_VARIANTS].includes(this.step) && !!this.active_editor?.workspaceBusy) || this.active_editor?.state === 'saving';
    },
    flowSubmitDisabled() {
      return this.flowBusy || (this.modernWorkspace && this.show_preview) || !this.type ||
        ([TAB_IMAGES, TAB_INPUTS, TAB_PRICE, TAB_PHYSICAL_EXTRA_INFO, TAB_REVIEW_BLOG, TAB_VARIANTS].includes(this.step) && !!this.active_editor?.saveBlocked) ||
        (!this.$product.id && this.step > TAB_GENERAL_INFO) ||
        (this.step === TAB_PRICE && this.active_editor?.calculatePrice < 0);
    },
    canGoBack() {
      return this.flowStepIndex > (this.$product.id ? 1 : 0);
    },

    canShowGooglePreview() {
      return this.shop && this.shop.id && this.$product.id;
    },
    force_show_preview() {
      if (this.modernWorkspace) return false;
      return [
        TAB_GENERAL_INFO,
        TAB_RATING,
        TAB_PRICE,
        TAB_REVIEW_BLOG,
      ].includes(this.step);
    },

    isPhysical() {
      return this.$product.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.$product.type === ProductType.VIRTUAL.code;
    },
    isFile() {
      return this.$product.type === ProductType.FILE.code;
    },
    isService() {
      return this.$product.type === ProductType.SERVICE.code;
    },

    hasStep__Inputs() {
      // Inputs
      return (
        this.type?.code === ProductType.VIRTUAL.code ||
        this.type?.code === ProductType.PHYSICAL.code ||
        this.type?.code === ProductType.SERVICE.code
      );
    },
    hasStep__Outputs() {
      // Outputs
      return (
        this.type?.code === ProductType.VIRTUAL.code ||
        this.type?.code === ProductType.SERVICE.code
      );
    },
    hasStep__physicalExtra() {
      // Extra
      return this.type?.code === ProductType.PHYSICAL.code;
    },

    hasStep__inventory() {
      return true;
    },

    series() {
      // console.log('series');
      this.step;
      let out = 0;
      out = 0;
      let product = this.$product;

      // Type: +10
      if (product.type) out += 10;

      // General info: +30
      if (product.title) out += 4;
      if (product.title_en) out += 4;
      if (product.icon) out += 5;
      if (product.blog) out += 1;
      if (product.category_id) out += 3;
      if (product.lead) out += 2;
      if (product.brand) out += 1;
      if (product.sku) out += 2;
      if (product.mpn) out += 2;
      if (product.gpc) out += 3;
      if (product.condition) out += 3;

      // Price: +10
      if (product.price) out += 5;
      if (product.currency) out += 5;

      // Spec: +15
      if (product.spec) out += 5;
      if (product.pros) out += 5;
      if (product.cons) out += 5;

      // Ratings: +10
      if (product.ratings) out += 10;

      // Inventory: +5

      if (product.quantity) out += 5;

      // Optional +6
      if (product.type === ProductType.PHYSICAL.code) {
        if (product.extra) out += 6;
      } else if (product.type === ProductType.VIRTUAL.code) {
        if (product.inputs) out += 3;
        if (product.outputs) out += 3;
      } else {
        out += 6;
      }

      // Article : +14
      if (this.SELECTED_ARTICLE_PACK?.article?.title?.length > 10) out += 3;
      if (this.SELECTED_ARTICLE_PACK?.article?.body?.length > 100) out += 11;
      //console.log("---calc---", out);
      if (out > 100) out = 100;
      return [out];
    },

    // ―――― Multi Language ――――

    articles() {
      return this.$product && this.$product.articles;
    },
  },
  watch: {
    step(step) {
      if (this.modernWorkspace) {
        if (!this.visitedSteps.includes(step)) this.visitedSteps.push(step);
        this.active_editor = this.stepEditors[step] || null;
      }
      this.$nextTick(() => {
        if (this.modern) {
          this.$refs.flowScroll?.scrollTo({ top: 0, behavior: 'instant' });
          return;
        }
        if (this.modernGeneral) {
          this.$refs.flowScroll?.scrollIntoView({ block: 'start', behavior: 'smooth' });
          return;
        }
        try {
          if (this.$product.id) {
            ScrollHelper.scrollToElement("#radial_bar", 0, "smooth");
          } else {
            ScrollHelper.scrollToTop(0, "smooth");
          }
        } catch (e) {}
      });

      if (this.replaceHashRoute) {
        const tab_hash =
          "#" +
          Object.keys(this.tabs_name).find(
            (key) => this.tabs_name[key] === step,
          );

        if (this.$route.hash !== tab_hash)
          this.$router.replace({
            hash: tab_hash,
          });
      }
    },
  },
  created() {
    if (this.$product.id) {
      this.step = 2;

      // console.log("this.$route.hash", this.$route.hash);
      if (this.$route.hash) {
        const hash = this.$route.hash.replace("#", "");
        if (hash && this.tabs_name[hash] && !(this.modernGeneral && this.tabs_name[hash] === TAB_TYPE)) {
          this.step = this.tabs_name[hash];
        }
      }
    } else {
      // New product mode:
      /*
not need!
      // set category:
      if(this.$route.query.dir){
        console.log('Current category:',this.$route.query.dir)
        this.$product.category_id=this.$route.query.dir
      }*/
    }

    this.type = this.$product.type ? ProductType[this.$product.type] : null;
    if (this.modern && !this.type && this.available_types.length) {
      this.setType(this.available_types[0]);
    }

    this.$product.inputs = this.$product.inputs ? this.$product.inputs : [];
    this.$product.outputs = this.$product.outputs ? this.$product.outputs : [];

    this.getRenderedOnGoogle();

    // Initial article pack:
    //console.log('---articles---',this.articles)
    if (this.articles?.length) {
      // 1. Select default language:
      let article = this.articles.find(
        (a) => a.lang.toLowerCase() === this.shop.language.toLowerCase(),
      );
      // 2. Select first:
      if (!article) article = this.articles[0];

      this.SELECTED_ARTICLE_PACK = this.generatePack(article);
    }
    // console.log('---SELECTED_ARTICLE_PACK---',this.SELECTED_ARTICLE_PACK)
  },

  beforeUnmount() {
    this.disposed = true;
  },

  methods: {
    generatePack(article) {
      if (!article) return null;
      return {
        article: article,
        can_edit: article.can_edit,
      };
    },

    getRenderedOnGoogle() {
      if (!this.canShowGooglePreview) return;

      let t = this;
      this.busy_render_google = true;

      axios
        .get(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.GET_MY_VENDOR_SEO_PREVIEW_PRODUCT(
                this.vendor.id,
                this.$product.id,
              )
            : window.API.GET_SEO_PREVIEW_PRODUCT(
                this.shop.id,
                this.$product.id,
              ),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.rendered_on_google = data.html;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_render_google = false;
        });
    },

    isStepMounted(step) {
      // Keep modern draft snapshots; inactive editors have no save button or shortcut.
      return this.step === step ||
        ((this.modern || (!!this.modernGeneral && ([TAB_GENERAL_INFO, TAB_INPUTS, TAB_PRICE, TAB_PHYSICAL_EXTRA_INFO, TAB_REVIEW_BLOG].includes(step) || (step === TAB_VARIANTS && this.isPhysical)))) && this.visitedSteps.includes(step));
    },

    setStepEditor(editor, step = this.step) {
      if (editor) this.stepEditors[step] = editor;
      else delete this.stepEditors[step];
      if (step === this.step) this.active_editor = editor;
    },

    canSelectStep(step) {
      if (this.flowBusy || !this.flowTabs.some((tab) => tab.value === step)) return false;
      if (this.step === TAB_VARIANTS && this.active_editor?.saveBlocked) return false;
      if (step === TAB_TYPE) return !this.$product.id;
      return !!this.type && (step === TAB_GENERAL_INFO || !!this.$product.id);
    },

    goTo(step) {
      if (this.modernWorkspace && !this.canSelectStep(step)) return;
      this.step = step;
    },

    previousStep() {
      if (this.canGoBack) this.goTo(this.flowTabs[this.flowStepIndex - 1].value);
    },

    async submitStep() {
      if (this.disposed) return;
      if (this.step === TAB_SPEC && this.active_editor?.dialog_ai) return;
      if (this.flowSubmitDisabled) return;
      if (this.step === TAB_IMAGES && this.active_editor?.prepareSave?.() === false) return;
      if (this.modernWorkspace && [TAB_PRICE, TAB_PHYSICAL_EXTRA_INFO].includes(this.step) && this.active_editor?.prepareSave?.() === false) return;
      if (this.step === TAB_GENERAL_INFO) {
        this.validatingStep = true;
        try {
          const result = await this.$refs.stepForm.validate();
          if (!result.valid) {
            this.active_editor?.revealValidation?.();
            return;
          }
        } finally {
          this.validatingStep = false;
        }
        if (this.disposed) return;
        if (this.modernGeneral) return this.editProduct();
      }
      // These editors own their saves and emit next only after success.
      if (this.step === TAB_SPEC) return this.active_editor.saveSpec(true);
      if (this.step === TAB_PHYSICAL_EXTRA_INFO) return this.active_editor.setExtraInfo();
      this.nextStep();
    },

    discardGeneralChanges() {
      if (this.flowBusy || this.step !== TAB_GENERAL_INFO) return;
      this.active_editor?.discardChanges?.();
      this.$refs.stepForm?.resetValidation();
    },

    setType(type) {
      if (this.modernWorkspace && this.$product.id) return;
      this.$product.type = type.code;
      this.type = type;

      if (!this.modern) this.nextStep();
    },
    addProduct(callback = null) {
      const generalEditor = this.stepEditors[TAB_GENERAL_INFO];
      this.busy = true;
      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_ADD_PRODUCT(this.vendor.id)
            : window.API.POST_ADD_PRODUCT(this.shop.id),

          {
            // For marketplace: Vendor owner
            vendor_id: this.$product.vendor_id,

            type: this.$product.type,

            unit: this.$product.unit,
            unit_float: this.$product.unit_float,
            price_input: this.$product.price_input, // default, area, volume
            action: this.$product.action,

            title: this.$product.title,
            title_en: this.$product.title_en,

            sku: this.$product.sku,
            mpn: this.$product.mpn,
            gtin: this.$product.gtin,
            gpc: this.$product.gpc,
            hsn: this.$product.hsn,

            condition: this.$product.condition,

            pricing: this.$product.pricing
              ? this.$product.pricing
              : PricingTypes.FIX.code,

            price: this.$product.price ? this.$product.price : 0,
            currency: this.$product.currency
              ? this.$product.currency
              : this.$shop.currencies[0],

            commission: this.$product.commission,
            discount: this.$product.discount,

            price_label: this.$product.price_label,

            icon: this.$product.icon,

            message: this.$product.message,

            inputs: this.$product.inputs ? this.$product.inputs : null,
            outputs: this.$product.outputs ? this.$product.outputs : null,

            blog: this.$product.blog,
            status: this.$product.status,

            category_id: this.$product.category_id,

            lead: this.$product.lead,

            style: this.$product.style,

            brand: this.$product.brand,
            warranty: this.$product.warranty,
            original: this.$product.original,
            return_warranty: this.$product.return_warranty,

            video: this.$product.video,

            // Logistic Profiles:
            warranty_id: this.$product.warranty_id,
            return_policy_id: this.$product.return_policy_id,
            guide_id: this.$product.guide_id,
            shipping_id: this.$product.shipping_id,

            // Tax profile:
            tax_id: this.$product.tax_id,

            // Map profile:
            map_id: this.$product.map_id,

            // Extra:
            extra: this.$product.extra,

            // Wholesaler:
            limit_min: this.$product.limit_min,
            limit_max: this.$product.limit_max,

            // External
            external: this.$product.external,

            // Shortcut categories:
            shortcuts: this.$product.shortcuts,

            // Property Set
            property_set_id: this.$product.property_set_id,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              "The product added to the list.",
            );
            this.$emit("add", data.product);
            Object.assign(this.$product, data.product);
            if (generalEditor) this.$nextTick(() => {
              if (!this.disposed && this.stepEditors[TAB_GENERAL_INFO] === generalEditor) generalEditor.markSaved?.();
            });

            this.getRenderedOnGoogle();

            const article = data.product.articles?.length
              ? data.product.articles[0]
              : null;
            if (article)
              this.SELECTED_ARTICLE_PACK = this.generatePack(article); // Load article pack.

            this.step = 3;
            this.$forceUpdate(); // Update vue component!

            if (callback) callback();

            //┌─────────────── 🫐 Analytics 🫐 ───────────────┐
            TrackSeller.onAddProduct(data.product);
            //└───────────────────────────────────────────────┘
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    editProduct(callback = null) {
      const generalEditor = this.stepEditors[TAB_GENERAL_INFO];
      const imagesEditor = this.step === TAB_IMAGES ? this.stepEditors[TAB_IMAGES] : null;
      const inputsEditor = this.stepEditors[TAB_INPUTS];
      const priceEditor = this.stepEditors[TAB_PRICE];
      this.busy = true;
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_EDIT_PRODUCT(
                this.vendor.id,
                this.$product.id,
              )
            : window.API.PUT_EDIT_PRODUCT(this.shop.id, this.$product.id),

          {
            // For marketplace: Vendor owner
            vendor_id: this.$product.vendor_id,

            type: this.$product.type,

            unit: this.$product.unit,
            unit_float: this.$product.unit_float,
            price_input: this.$product.price_input,
            action: this.$product.action,

            title: this.$product.title,
            title_en: this.$product.title_en,

            sku: this.$product.sku,
            mpn: this.$product.mpn,
            gtin: this.$product.gtin,
            gpc: this.$product.gpc,
            hsn: this.$product.hsn,
            condition: this.$product.condition,

            pricing: this.$product.pricing,
            price: this.$product.price,
            currency: this.$product.currency
              ? this.$product.currency
              : this.$t("global.currency_default"),
            commission: this.$product.commission,
            discount: this.$product.discount,

            dis_start: this.$product.dis_start,
            dis_end: this.$product.dis_end,

            price_label: this.$product.price_label,

            icon: this.$product.icon,

            message: this.$product.message,

            inputs: this.$product.inputs ? this.$product.inputs : null,
            outputs: this.$product.outputs ? this.$product.outputs : null,

            blog: this.$product.blog,
            status: this.$product.status,

            category_id: this.$product.category_id,

            lead: this.$product.lead,

            style: this.$product.style,

            brand: this.$product.brand,
            warranty: this.$product.warranty,
            original: this.$product.original,

            return_warranty: this.$product.return_warranty,

            video: this.$product.video,

            // Logistic Profiles:
            warranty_id: this.$product.warranty_id,
            return_policy_id: this.$product.return_policy_id,
            guide_id: this.$product.guide_id,
            shipping_id: this.$product.shipping_id,

            // Tax profile:
            tax_id: this.$product.tax_id,

            // Map profile:
            map_id: this.$product.map_id,

            // Extra:
            extra: this.$product.extra,

            // Wholesaler:
            limit_min: this.$product.limit_min,
            limit_max: this.$product.limit_max,

            // External
            external: this.$product.external,

            // Shortcut categories:
            shortcuts: this.$product.shortcuts,

            // Property Set
            property_set_id: this.$product.property_set_id,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(null, "The product edited.");

            Object.assign(this.$product, data.product); // Copy product data (refresh)
            if (imagesEditor && !this.disposed && this.stepEditors[TAB_IMAGES] === imagesEditor) imagesEditor.markSaved?.();
            if (inputsEditor && !this.disposed && this.stepEditors[TAB_INPUTS] === inputsEditor) inputsEditor.markSaved?.();
            if (priceEditor && !this.disposed && this.stepEditors[TAB_PRICE] === priceEditor) priceEditor.markSaved?.();
            if (generalEditor) this.$nextTick(() => {
              if (!this.disposed && this.stepEditors[TAB_GENERAL_INFO] === generalEditor) generalEditor.markSaved?.();
            });

            this.$emit("update:product", data.product);

            this.$emit("edit", data.product);

            this.getRenderedOnGoogle();

            if (callback) callback();

            // Goto to:
            if (!this.$product.id)
              // We have no route change => Move to up by code here!
              ScrollHelper.scrollToTop(0, "smooth");
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    deleteProduct() {
      this.busy_delete = true;
      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT(
                this.vendor.id,
                this.$product.id,
              )
            : window.API.DELETE_PRODUCT(this.shop.id, this.$product.id),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(null, "The product removed.");
            //this.$emit("delete", product);

            // Go to shop page > products
            this.$router.push({
              name: "BPageShopProductsList",
              params: { shop_id: this.shop.id },
              query: { dir: this.$product.category_id },
            });

            this.$emit("delete");
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },

    nextStep() {
      if (this.modernWorkspace && this.show_preview) return;
      if (this.modernWorkspace && this.step === TAB_VARIANTS) {
        if (this.flowSubmitDisabled) return;
        // Inventory operations save separately; Finish waits only for the product save.
        const editor = this.active_editor;
        this.editProduct(() => {
          if (!this.disposed && this.step === TAB_VARIANTS && this.stepEditors[TAB_VARIANTS] === editor) this.finish();
        });
        return;
      }
      if (this.modernWorkspace && this.step === TAB_REVIEW_BLOG) {
        if (this.flowSubmitDisabled) return;
        const editor = this.active_editor;
        const current = this.step;
        const next = this.flowTabs[this.flowStepIndex + 1]?.value;
        // Article saving owns validation and success; stale completions cannot navigate.
        editor?.saveChange?.(() => {
          if (this.disposed || this.step !== current || this.stepEditors[current] !== editor) return;
          if (next) this.step = next;
          else this.finish();
        });
        return;
      }
      if (this.modernWorkspace && this.step === TAB_PRICE) {
        if (this.flowBusy || this.active_editor?.saveBlocked || this.active_editor?.prepareSave?.() === false) return;
        if (this.modernGeneral) {
          const next = this.flowTabs[this.flowStepIndex + 1]?.value;
          this.editProduct(() => {
            if (!this.disposed && this.step === TAB_PRICE && next) this.step = next;
          });
          return;
        }
      }
      if (this.modernWorkspace && this.step === TAB_INPUTS) {
        if (this.busy || this.active_editor?.saveBlocked) return;
        if (this.modernGeneral) {
          this.editProduct(() => { if (!this.disposed && this.step === TAB_INPUTS) this.step = TAB_PRICE; });
          return;
        }
      }
      if (this.modernWorkspace && this.step === TAB_IMAGES) {
        if (this.busy || this.active_editor?.prepareSave?.() === false) return;
        if (this.modernGeneral) {
          this.editProduct(() => { if (!this.disposed && this.step === TAB_IMAGES) this.step = this.hasStep__Inputs ? TAB_INPUTS : TAB_PRICE; });
          return;
        }
      }
      if (this.modern) {
        if (!this.type || this.busy || (this.step > TAB_GENERAL_INFO && !this.$product.id)) return;
        const current = this.step;
        const next = this.flowTabs[this.flowStepIndex + 1]?.value;
        const advance = () => {
          if (!this.completedSteps.includes(current)) this.completedSteps.push(current);
          if (next) this.step = next;
          else this.finish();
        };
        if (current === TAB_GENERAL_INFO) {
          if (this.$product.id) this.editProduct(advance);
          else this.addProduct(advance);
        } else if ([TAB_SPEC, TAB_IMAGES, TAB_INPUTS, TAB_PRICE, TAB_OUTPUTS, TAB_VARIANTS].includes(current)) {
          this.editProduct(advance);
        } else {
          advance();
        }
        return;
      }
      if (this.step === TAB_TYPE) {
        this.step = TAB_GENERAL_INFO;
      } else if (this.step === TAB_GENERAL_INFO) {
        if (this.$product.id)
          this.editProduct(() => {
            this.step = TAB_RATING;
          });
        // this.$product.id: prevent re add in create product if go back in tabs!
        else
          this.addProduct(() => {
            this.step = TAB_RATING;
          }); // Pooling , Pros , Cons
      } else if (this.step === TAB_RATING) {
        this.step = TAB_SPEC; // Spec
      } else if (this.step === TAB_SPEC) {
        this.editProduct();
        this.step = TAB_IMAGES; // Pictures
      } else if (this.step === TAB_IMAGES) {
        this.editProduct();

        this.step = this.step = this.hasStep__Inputs ? TAB_INPUTS : TAB_PRICE;
      } else if (this.step === TAB_INPUTS) {
        this.editProduct();

        this.step = TAB_PRICE;
      } else if (this.step === TAB_PRICE) {
        // Price
        this.editProduct();

        this.step =
          /* this.hasStep__Inputs
                                                    ? TAB_INPUTS
                                                    :*/
          this.hasStep__Outputs
            ? TAB_OUTPUTS
            : this.hasStep__physicalExtra
              ? TAB_PHYSICAL_EXTRA_INFO
              : TAB_REVIEW_BLOG;
      } else if (this.step === TAB_INPUTS) {
        // Inputs
        this.editProduct();

        this.step = this.hasStep__Outputs
          ? TAB_OUTPUTS
          : this.hasStep__physicalExtra
            ? TAB_PHYSICAL_EXTRA_INFO
            : TAB_REVIEW_BLOG;
      } else if (this.step === TAB_OUTPUTS) {
        this.editProduct(); // Outputs

        if (this.type.code === ProductType.VIRTUAL.code)
          this.step = TAB_REVIEW_BLOG;
        else if (this.type.code === ProductType.PHYSICAL.code)
          this.step = TAB_PHYSICAL_EXTRA_INFO;
        else if (this.type.code === ProductType.SERVICE.code)
          this.step = TAB_REVIEW_BLOG;
      } else if (this.step === TAB_PHYSICAL_EXTRA_INFO) {
        ////  this.editProduct(); // Outputs

        this.step = TAB_REVIEW_BLOG;
      } else if (this.step === TAB_REVIEW_BLOG) {
        this.$refs.product_article.saveChange(() => {
          if (this.hasStep__inventory) {
            this.step = TAB_VARIANTS;
          } else {
            this.finish();
          }
        });
      } else if (this.step === TAB_VARIANTS) {
        this.editProduct();
        this.finish();
      }
    },

    finish() {
      this.$router.push({
        name: this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? "Vendor_ProductDashboard"
          : "BPageProductDashboard",
        params: {
          product_id: this.$product.id,
        },
        hash: "#dashboard",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-add-full--modern {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}

.b-product-add-full--modern,
.b-product-add-full--general {
  width: 100%;
  font-family: inherit;
  color: rgb(var(--v-theme-on-surface));

  .b-product-add-full__scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
  .b-product-add-full__layout { display: grid; grid-template-columns: 172px minmax(0, 1fr); gap: 22px; max-width: 1040px; margin-inline: auto; padding: 24px; align-items: start; }
  .b-product-add-full__sidebar { position: sticky; top: 24px; min-width: 0; max-height: calc(100dvh - 224px); overflow-y: auto; scrollbar-width: thin; padding: 3px; }
  .b-product-add-full__main { min-width: 0; }
  .b-product-add-full__mobile-nav { display: none; }
  .b-product-add-full__nav { padding-block: 3px; gap: 5px; }
  .b-product-add-full__nav > button { min-height: 42px; font-weight: 400; }
  .b-product-add-full__nav > button[aria-current] { font-weight: 500; }
  .b-product-add-full__nav > button:disabled { opacity: 0.55; }
  .b-product-add-full__group { margin: 15px 10px 7px; font-weight: 400; }
  .b-product-add-full__group:first-child { margin-block-start: 0; }
  .b-product-add-full__rail-title { margin: 5px 10px 15px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; }
  .b-product-add-full__saved { margin-inline-start: auto; }
  .b-product-add-full__context { margin: 20px 10px 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-add-full__product { margin: 22px 10px 0; overflow-wrap: anywhere; }
  .b-product-add-full__completion { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; color: var(--sd-modern-muted); font-size: 12px; }
  .b-product-add-full__product :deep(.body-title) { font-size: 12px; }
  .b-product-add-full__hierarchy { min-width: 0; }
  .b-product-add-full__hierarchy :deep(.v-breadcrumbs) {
    flex-direction: column;
    align-items: stretch;
    margin: 0;
    padding: 0;
    font-size: 13px;
    line-height: 20px;
    white-space: normal;
  }
  .b-product-add-full__hierarchy :deep(.v-breadcrumbs-divider) { display: none; }
  .b-product-add-full__hierarchy :deep(.v-breadcrumbs-item) { min-width: 0; padding: 0; }
  .b-product-add-full__hierarchy :deep(.v-breadcrumbs-item ~ .v-breadcrumbs-item) {
    margin-inline-start: 9px;
    padding-inline-start: 10px;
    border-inline-start: 1px solid var(--sd-modern-border);
  }
  .b-product-add-full__hierarchy :deep(.v-breadcrumbs-item > a) { display: block; width: 100%; min-width: 0; padding-block: 4px; }
  .b-product-add-full__hierarchy :deep(.v-breadcrumbs-item > a > span) { display: flex; align-items: flex-start; min-width: 0; }
  .b-product-add-full__hierarchy :deep(.v-avatar),
  .b-product-add-full__hierarchy :deep(.v-icon) { flex-shrink: 0; }
  .b-product-add-full__hierarchy :deep(.link-dash) { min-width: 0; overflow-wrap: anywhere; }
  .b-product-add-full__hierarchy :deep(a:focus-visible) { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; border-radius: 3px; }
  .b-product-add-full__preview-tools { margin: 22px 10px 0; }
  .b-product-add-full__preview-tools > hr { margin: 0 0 14px; border: 0; border-block-start: 1px solid var(--sd-modern-border); }
  .b-product-add-full__preview-launcher { width: 100%; height: auto; min-height: 42px; justify-content: flex-start; text-align: start; }
  .b-product-add-full__preview-launcher :deep(.v-btn__content) { white-space: normal; }
  .b-product-add-full__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 0 2px 18px; }
  .b-product-add-full__heading > div { min-width: 0; }
  .b-product-add-full__heading h2 { margin: 0; font-family: inherit; font-size: 19px; font-weight: 500; line-height: 28px; letter-spacing: -0.2px; }
  .b-product-add-full__position { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin: 0 0 5px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .b-product-add-full__subtitle { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .b-product-add-full__type-label { display: flex; align-items: center; gap: 5px; padding-top: 8px; color: var(--sd-modern-muted); font-size: 11px; white-space: nowrap; }
  .b-product-add-full__create-notice { display: flex; flex-wrap: nowrap; align-items: flex-start; gap: 9px; margin-bottom: 20px; padding: 12px 13px; font-size: 13px; line-height: 20px; }
  .b-product-add-full__create-notice > span { flex: 1; min-width: 0; }
  .b-product-add-full__create-notice > .v-icon { margin-top: 2px; flex-shrink: 0; color: var(--sd-modern-muted); }
  .b-product-add-full__type { width: 100%; max-width: none; padding: 22px; border-radius: 15px; }

  :deep(.b-product-add-full__editor .widget-box) {
    --background: rgb(var(--v-theme-surface));
    width: 100%;
    max-width: none;
    margin: 0 auto 20px !important;
    padding: 22px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 15px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    text-align: start;
  }
  :deep(.b-product-add-full__editor .widget-box > .s--widget-header h2),
  :deep(.b-product-add-full__editor .widget-box > h2),
  :deep(.b-product-add-full__editor .widget-box > .v-row > .v-col > h2) { font-family: inherit; font-size: 17px !important; font-weight: 500; line-height: 25px; }
  :deep(.b-product-add-full__editor .widget-box > .s--widget-header .--icon) { font-size: 20px !important; color: var(--sd-modern-muted); }
  :deep(.b-product-add-full__editor .widget-box > .v-list-subheader) { min-height: 0; height: auto; margin-block: 8px 16px; padding: 0; font-family: inherit; font-size: 13px; font-weight: 400; line-height: 20px; color: var(--sd-modern-muted); }
  :deep(.b-product-add-full__editor .widget-body) { margin-inline: 0; }
  :deep(.b-product-add-full__editor .v-alert) { background: var(--sd-modern-inset) !important; color: rgb(var(--v-theme-on-surface)) !important; }
  .b-product-add-full__article-editor { margin: 0; min-height: 340px; }
  .b-product-add-full__article { width: 100%; max-width: 760px; margin-inline: auto; }
  .b-product-add-full__inventory { width: 100%; max-width: 760px; margin-inline: auto; }
  .b-product-add-full__inventory-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-block-start: 22px; padding: 5px 0 9px; }
  .b-product-add-full__inventory-actions > p { display: flex; align-items: flex-start; gap: 7px; margin: 0; font-size: 11px; font-weight: 400; line-height: 18px; color: var(--sd-modern-muted); }
  .b-product-add-full__inventory-actions > p > svg { flex-shrink: 0; margin-block-start: 2px; }
  .b-product-add-full__inventory-actions > .v-btn { flex-shrink: 0; font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-product-add-full__inventory-actions :deep(.v-btn__content) { font: inherit; }
  .b-product-add-full__description-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding: 5px 0 9px; }
  .b-product-add-full__description-status { min-width: 0; }
  .b-product-add-full__description-status p { display: flex; align-items: center; gap: 7px; margin: 0; font-size: 12px; line-height: 19px; }
  .b-product-add-full__description-status small { display: block; margin-top: 3px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  &:dir(rtl) .b-product-add-full__description-direction { transform: scaleX(-1); }
  .b-product-add-full__seo { padding-block: 16px; text-align: start; }
  .b-product-add-full__seo :deep(h2) { font-family: inherit; font-size: 17px; font-weight: 500; line-height: 25px; }
  .b-product-add-full__seo .seo-preview { padding: 20px; background: rgb(var(--v-theme-surface)); border: 1px solid var(--sd-modern-border); border-radius: 15px; overflow-wrap: anywhere; }

  .b-product-add-full__footer { flex: 0 0 auto; background: rgb(var(--v-theme-surface)); border-block-start: 1px solid var(--sd-modern-border); }
  .b-product-add-full__footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; max-width: 1040px; padding: 17px 24px; margin-inline: auto; }
  .b-product-add-full__footer-inner > p { max-width: 240px; margin: 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  .b-product-add-full__actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 9px; margin-inline-start: auto; }
  .b-product-add-full__actions > .v-btn { margin: 0; font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-product-add-full__actions :deep(.v-btn__content) { font: inherit; }
  .b-product-add-full__actions :deep(.v-btn__prepend .v-icon) { font-size: 16px; }
  .b-product-add-full__general-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; padding: 12px 0 8px; }
  .b-product-add-full__general-actions > p { margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-add-full__general-actions .v-btn { padding-inline: 16px; }

  &:dir(rtl) .b-product-add-full__back :deep(.v-btn__prepend .v-icon),
  &:dir(rtl) .b-product-add-full__continue :deep(.v-btn__prepend .v-icon) { transform: scaleX(-1); }

  @media (max-width: 720px) {
    .b-product-add-full__layout { grid-template-columns: minmax(0, 1fr); gap: 20px; padding: 20px 18px; }
    .b-product-add-full__sidebar { position: static; max-height: none; overflow: visible; padding: 0; }
    .b-product-add-full__nav, .b-product-add-full__context, .b-product-add-full__product { display: none; }
    .b-product-add-full__mobile-nav { display: flex; align-items: center; gap: 15px; justify-content: space-between; }
    .b-product-add-full__preview-tools { margin: 16px 0 0; }
    .b-product-add-full__preview-tools > hr { margin-block-end: 8px; }
    .b-product-add-full__preview-launcher { width: auto; min-height: 44px; }
    .b-product-add-full__mobile-nav label { color: var(--sd-modern-muted); font-size: 12px; }
    .b-product-add-full__mobile-nav select { width: min(230px, 78%); min-height: 44px; padding: 8px 0; border-block-end: 1px solid var(--sd-modern-border); color: rgb(var(--v-theme-on-surface)); background: transparent; appearance: auto; font-family: inherit; font-size: 13px; }
    .b-product-add-full__mobile-nav option { color: rgb(var(--v-theme-on-surface)); background: rgb(var(--v-theme-surface)); }
    .b-product-add-full__mobile-nav select:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
    .b-product-add-full__type { padding: 19px 17px; }
    :deep(.b-product-add-full__editor .widget-box) { padding: 19px 17px; }
    .b-product-add-full__footer-inner { padding: 16px 18px; gap: 12px; }
    .b-product-add-full__footer-inner > p { max-width: none; }
    .b-product-add-full__actions > .v-btn { min-height: 44px; }
    .b-product-add-full__description-status { flex-basis: 100%; }
  }

  @media (max-width: 420px) {
    .b-product-add-full__actions { width: 100%; }
    .b-product-add-full__actions > .sd-modern-button--primary { flex: 1; }
    .b-product-add-full__heading { gap: 8px; }
  }
  @media (pointer: coarse) {
    .b-product-add-full__mobile-nav select { font-size: 16px; }
    .b-product-add-full__hierarchy :deep(.v-breadcrumbs-item > a) { min-height: 44px; display: flex; align-items: center; }
  }
  @media (max-width: 380px) {
    .b-product-add-full__general-actions .b-product-add-full__actions { display: grid; grid-template-columns: minmax(0, 1fr); }
    .b-product-add-full__general-actions .v-btn { width: 100%; }
  }
}

.b-product-add-full--general {
  // The product router-view supplies white inline; this workspace owns its neutral canvas.
  background: var(--sd-modern-canvas-color) !important;

  .b-product-add-full__scroll { overflow: visible; }
  .b-product-add-full__layout { grid-template-columns: 168px minmax(0, 1fr); gap: 26px; max-width: 1096px; padding: 30px 28px 34px; }
  .b-product-add-full__heading { padding-block-end: 22px; }
  .b-product-add-full__heading h2 { font-size: 23px; line-height: 31px; letter-spacing: -0.45px; }
  .b-product-add-full__nav > button { font-size: 12px; line-height: 18px; }

  @media (max-width: 800px) {
    .b-product-add-full__layout { grid-template-columns: 148px minmax(0, 1fr); gap: 18px; padding: 25px 18px; }
    .b-product-add-full__nav > button { font-size: 11px; }
  }
  @media (max-width: 720px) {
    .b-product-add-full__layout { grid-template-columns: minmax(0, 1fr); gap: 20px; padding: 20px 18px 26px; }
    .b-product-add-full__rail-title { margin: 0 0 11px; }
    .b-product-add-full__heading h2 { font-size: 21px; line-height: 29px; }
    .b-product-add-full__type-label { font-size: 10px; }
    .b-product-add-full__type-label > svg { display: none; }
    .b-product-add-full__inventory-actions { flex-wrap: wrap; }
    .b-product-add-full__inventory-actions > .v-btn { margin-inline-start: auto; min-height: 44px; }
  }
}

.b-product-add-full--general-info,
.b-product-add-full--features-info,
.b-product-add-full--spec-info,
.b-product-add-full--images-info,
.b-product-add-full--inputs-info,
.b-product-add-full--price-info,
.b-product-add-full--shipping-info,
.b-product-add-full--description-info,
.b-product-add-full--inventory-info {
  .b-product-add-full__heading,
  .b-product-add-full__general-actions,
  .b-product-add-full__seo { width: 100%; max-width: 760px; margin-inline: auto; }
}

.b-product-add-full--description-info,
.b-product-add-full--inventory-info {
  .b-product-add-full__heading h2 { font-size: 23px; font-weight: 500; line-height: 31px; letter-spacing: -0.45px; }
  .b-product-add-full__mobile-nav select { font-size: 16px; }
}

.b-product-add-full__hover-preview {
  max-height: min(420px, calc(100dvh - 96px));
  overflow-y: auto;
  overflow-wrap: anywhere;
  .seo-preview { margin: 0; }
}

@media (hover: none), (pointer: coarse) {
  .b-product-add-full__preview-tooltip :deep(.v-overlay__content) { display: none; }
}

.b-product-add-full__preview-dialog {
  padding: 0;
  border-radius: 18px;
  font-family: inherit;
  color: rgb(var(--v-theme-on-surface));

  .b-product-add-full__preview-header { display: flex; align-items: center; gap: 12px; padding: 20px 22px; border-block-end: 1px solid var(--sd-modern-border); }
  .b-product-add-full__preview-header h2 { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; margin: 0; font-family: inherit; font-size: 18px; font-weight: 500; line-height: 26px; }
  .b-product-add-full__preview-header h2 > img { flex-shrink: 0; }
  .b-product-add-full__preview-header > .v-btn { flex-shrink: 0; }
  .b-product-add-full__preview-body { padding: 22px; }
  .seo-preview { margin: 0; overflow-wrap: anywhere; }

  @media (max-width: 600px) {
    .b-product-add-full__preview-header { flex-wrap: wrap; padding: 16px; gap: 8px; }
    .b-product-add-full__preview-header h2 { font-size: 17px; line-height: 25px; }
    .b-product-add-full__preview-body { padding: 16px; }
  }
}

.seo-preview {
  //animation: blur 1s ease;
  transition: all 1s;

  &.blurred {
    filter: blur(6px);
  }
}
</style>
