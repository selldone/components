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
  <div class="b-email-editor text-start" v-bind="$attrs">
    <div class="sd-modern-content b-email-editor__content">
      <header class="b-email-editor__page-header">
        <div class="sd-modern-title">
          <v-icon size="18" aria-hidden="true">outgoing_mail</v-icon>
          <div>
            <h1 class="sd-modern-title-text">
              {{
                $t(
                  email
                    ? "email_builder.workspace.title"
                    : "email_builder.workspace.create_title",
                )
              }}
            </h1>
            <p class="sd-modern-subtitle">
              {{
                $t(
                  email
                    ? "email_builder.workspace.subtitle"
                    : "email_builder.workspace.create_subtitle",
                )
              }}
            </p>
          </div>
        </div>
        <span class="sd-modern-status sd-modern-status--plain"
          ><span
            class="sd-modern-status__dot"
            :class="emailStateTone"
            aria-hidden="true"
          />{{ emailStateLabel }}</span
        >
      </header>
      <div class="b-email-editor__layout">
        <nav
          class="sd-modern-section-nav b-email-editor__nav"
          :aria-label="$t('email_builder.workspace.title')"
        >
          <button
            v-for="section in editorSections"
            :key="section.key"
            type="button"
            class="sd-modern-section-nav__item"
            :aria-current="
              active_section === section.key ? 'location' : undefined
            "
            @click="active_section = section.key"
          >
            <v-icon size="17" aria-hidden="true">{{ section.icon }}</v-icon
            ><span>{{ section.title }}</span>
          </button>
          <p class="b-email-editor__nav-help">
            <v-icon size="14" aria-hidden="true">info_outline</v-icon
            >{{ $t("email_builder.workspace.save_help") }}
          </p>
        </nav>
        <div class="b-email-editor__workspace">
          <div
            v-if="email?.sent || !hasWriteAccess"
            class="sd-modern-notice b-email-editor__readonly"
            role="status"
          >
            <v-icon size="17" aria-hidden="true">info_outline</v-icon>
            <p>
              {{
                $t(
                  email?.sent
                    ? "email_builder.workspace.sent_readonly"
                    : "email_builder.workspace.read_only",
                )
              }}
            </p>
          </div>

          <!-- ██████████████████████████ Config ██████████████████████████ -->
          <section
            v-show="active_section === 'general'"
            class="sd-modern-widget b-email-editor__panel"
          >
            <header class="sd-modern-header">
              <div>
                <h2 class="sd-modern-title-text">
                  {{ $t("email_builder.workspace.general_title") }}
                </h2>
                <p class="sd-modern-subtitle">
                  {{ $t("email_builder.workspace.general_subtitle") }}
                </p>
              </div>
              <v-btn
                class="sd-modern-icon-button sd-modern-info-button"
                icon
                variant="text"
                :aria-label="$t('email_builder.workspace.general_title')"
                ><v-icon size="15" aria-hidden="true">info_outline</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  open-on-click
                  content-class="sd-modern-tooltip text-start"
                  >{{ $t("email_builder.workspace.internal_name_help") }}
                  {{ $t("email_builder.workspace.currency_locked") }}
                  {{ $t("email_builder.workspace.save_help") }}</v-tooltip
                ></v-btn
              >
            </header>
            <v-form
              ref="form"
              class="b-email-editor__fields sd-modern-underlined-field"
              :disabled="!can_edit"
              @submit.prevent="saveEmail()"
            >
              <div class="b-email-editor__field-full">
                <v-text-field
                  id="mail_name"
                  v-model="mail_name"
                  :rules="[GlobalRules.required()]"
                  :label="$t('email_builder.workspace.internal_name') + ' *'"
                  :messages="$t('email_builder.workspace.internal_name_help')"
                  maxlength="255"
                  required
                  variant="underlined"
                /><u-smart-suggestion
                  :samples="$tm('suggestions.shop_email.name')"
                  :class="{ 'b-email-editor__inactive': !can_edit }"
                  :inert="!can_edit || undefined"
                  add-session
                  @select="
                    (v) => {
                      if (can_edit) mail_name = v;
                    }
                  "
                />
              </div>
              <v-text-field
                v-if="email"
                class="b-email-editor__currency-field"
                :model-value="mail_currency"
                :label="$t('global.commons.currency')"
                :messages="$t('email_builder.workspace.currency_locked')"
                variant="underlined"
                readonly
              >
                <template #prepend-inner>
                  <u-currency-icon :currency="mail_currency" flag-only small />
                </template>
                <template #append-inner>
                  <v-icon size="14" aria-hidden="true">lock_outline</v-icon>
                </template>
              </v-text-field>
              <u-currency-input
                v-else
                v-model="mail_currency"
                :active-currencies="shop.currencies"
                :return-object="false"
                :label="$t('global.commons.currency')"
                :messages="$t('email_builder.workspace.currency_locked')"
                variant="underlined"
              />
              <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ 🆑 Cluster ━━━━━━━━━━━━━━━━━━━━━━━━ -->
              <b-cluster-input
                v-model="cluster_id"
                :return-object="false"
                clearable
                no-home
                :label="$t('email_builder.workspace.cluster')"
                :messages="$t('email_builder.workspace.cluster_help')"
                variant="underlined"
              />
            </v-form>
            <footer class="b-email-editor__actions">
              <span>{{ $t("email_builder.workspace.changes_apply") }}</span
              ><v-btn
                class="sd-modern-button sd-modern-button--primary"
                variant="flat"
                color="primary"
                :prepend-icon="email ? 'save' : 'add'"
                :disabled="!can_edit || busy_send"
                :loading="busy_save"
                @click="saveEmail()"
                >{{
                  $t(
                    email
                      ? "email_builder.workspace.save"
                      : "email_builder.workspace.create",
                  )
                }}</v-btn
              >
            </footer>
          </section>

          <!-- ██████████████████████████ User ██████████████████████████ -->
          <section
            v-show="active_section === 'audience'"
            class="sd-modern-widget b-email-editor__panel b-email-editor__audience"
          >
            <header class="sd-modern-header">
              <div>
                <h2 class="sd-modern-title-text">
                  {{ $t("email_builder.workspace.audience_title") }}
                </h2>
                <p class="sd-modern-subtitle">
                  {{ $t("email_builder.workspace.audience_subtitle") }}
                </p>
              </div>
              <v-btn
                class="sd-modern-icon-button sd-modern-info-button"
                icon
                variant="text"
                :aria-label="$t('email_builder.workspace.audience_title')"
                ><v-icon size="15" aria-hidden="true">info_outline</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  open-on-click
                  content-class="sd-modern-tooltip text-start"
                  >{{ $t("email_builder.workspace.audience_help") }}</v-tooltip
                ></v-btn
              >
            </header>
            <div class="b-email-editor__audience-summary">
              <span class="sd-modern-eyebrow">{{
                $t("email_builder.workspace.matching_customers")
              }}</span
              ><strong>{{
                users_count === null ? "—" : $n(users_count)
              }}</strong>
            </div>
            <b-customers-funnel
              v-model="filter"
              :read-only="!can_edit"
              :permanent-filters="[{ type: 'SUBSCRIBED', subscribed: true }]"
              :shop="shop"
              modern
              @update:count="(val) => (users_count = val)"
            />
            <footer class="b-email-editor__actions">
              <span>{{ $t("email_builder.workspace.changes_apply") }}</span
              ><v-btn
                class="sd-modern-button sd-modern-button--primary"
                variant="flat"
                color="primary"
                :prepend-icon="email ? 'save' : 'add'"
                :disabled="!can_edit || busy_send"
                :loading="busy_save"
                @click="saveEmail()"
                >{{
                  $t(
                    email
                      ? "email_builder.workspace.save"
                      : "email_builder.workspace.create",
                  )
                }}</v-btn
              >
            </footer>
          </section>

          <!-- ██████████████████████████ Design ██████████████████████████ -->
          <section
            v-show="active_section === 'design'"
            class="sd-modern-widget b-email-editor__panel b-email-editor__design"
          >
            <header class="sd-modern-header">
              <div>
                <h2 class="sd-modern-title-text">
                  {{ $t("email_builder.workspace.design_title") }}
                </h2>
                <p class="sd-modern-subtitle">
                  {{ $t("email_builder.workspace.design_subtitle") }}
                </p>
              </div>
              <div class="sd-modern-actions">
                <v-btn
                  class="sd-modern-button sd-modern-button--inline"
                  variant="text"
                  color="primary"
                  :prepend-icon="track_mode ? 'architecture' : 'ads_click'"
                  @click="track_mode = !track_mode"
                  >{{
                    $t(
                      track_mode
                        ? "email_builder.workspace.edit_mode"
                        : "email_builder.workspace.show_trackers",
                    )
                  }}</v-btn
                ><u-smart-menu
                  :items="menu_items"
                  modern
                  :title="$t('email_builder.workspace.options_title')"
                />
              </div>
            </header>
            <div class="b-email-editor__design-toolbar">
              <div class="sd-modern-actions">
                <v-btn
                  class="sd-modern-button sd-modern-button--inline"
                  variant="text"
                  color="primary"
                  prepend-icon="tune"
                  :disabled="!editMode"
                  @click="
                    showEdit(EmailOptionsHelper.GeneratePageOptions(structure))
                  "
                  >{{ $t("email_builder.workspace.page_settings") }}</v-btn
                ><v-menu v-if="editMode" content-class="text-start"
                  ><template #activator="{ props }"
                    ><v-btn
                      v-bind="props"
                      class="sd-modern-button sd-modern-button--inline"
                      variant="text"
                      color="primary"
                      prepend-icon="add"
                      >{{ $t("email_builder.workspace.add_section") }}</v-btn
                    ></template
                  ><v-list density="compact" class="text-start"
                    ><v-list-item
                      v-for="(definition, key) in EmailSectionStructures"
                      :key="key"
                      :title="sectionTitle(key)"
                      :prepend-icon="sectionIcon(key)"
                      @click="
                        addSection(key, structure.sections.length - 1)
                      " /></v-list
                ></v-menu>
              </div>
              <span>{{ structure.max_width || "600px" }}</span>
            </div>
            <p class="b-email-editor__design-tip">
              <v-icon size="14" aria-hidden="true">touch_app</v-icon
              >{{ $t("email_builder.workspace.design_tip") }}
            </p>
            <!-- ██████████████████████████ Email Editor ██████████████████████████ -->
            <div
              :class="{ 'on-drop': draged }"
              :style="{
                '--color-1': structure.color_1,
                '--color-2': structure.color_2,
                '--font-title': structure.font_title
                  ? structure.font_title
                  : 'Roboto',
                '--font-text': structure.font_text
                  ? structure.font_text
                  : 'Roboto',
                backgroundColor: structure.page_color
                  ? structure.page_color
                  : '#FAFAFA',
              }"
              class="s-drop-zone mx-auto d-flex flex-column rounded-lg"
              @dragenter="draged = true"
              @dragexit="draged = false"
              @dragover="dragOverHandler"
              @drop="dropHandler"
            >
              <div
                ref="scale_container"
                :style="{
                  maxWidth: structure.max_width ? structure.max_width : '600px',
                  backgroundColor: structure.sections_color
                    ? structure.sections_color
                    : '#FFF',
                }"
                class="scale-container mx-auto"
              >
                <b-email-marketing-track-spot
                  v-if="track_mode"
                  bg-color1="#1976D2"
                  bg-color2="#0097A7"
                  class="zoomIn"
                  color="#0288D1"
                  label="view"
                  top="5%"
                ></b-email-marketing-track-spot>

                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ HEADER ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <v-expand-transition>
                  <div
                    v-if="structure.header"
                    :style="{
                      'background-color': structure.color_1,
                      'background-image': structure.header.bg_image
                        ? `url('${structure.header.bg_image}')`
                        : `linear-gradient(160deg, ${structure.color_1} 0%, ${structure.color_2} 100%)`,
                    }"
                    class="py-5 position-relative"
                  >
                    <!--  ---------------------- Header ---------------------- -->

                    <v-btn
                      v-if="editMode"
                      class="option-btn sd-modern-icon-button"
                      icon
                      :aria-label="$t('email_builder.workspace.edit_section')"
                      variant="flat"
                      @click="
                        showEdit(
                          EmailOptionsHelper.GenerateHeaderOptions(structure),
                        )
                      "
                    >
                      <v-icon size="16" aria-hidden="true">edit</v-icon
                      ><v-tooltip
                        activator="parent"
                        location="top"
                        content-class="sd-modern-tooltip text-start"
                        >{{
                          $t("email_builder.workspace.edit_section")
                        }}</v-tooltip
                      >
                    </v-btn>

                    <div
                      :style="{ textAlign: structure.header.align }"
                      class="mx-auto p-5 mx-auto"
                      style="max-width: 960px"
                    >
                      <v-img
                        v-if="structure.header.image"
                        :max-width="structure.header.image_max_width"
                        :src="structure.header.image"
                        :width="
                          structure.header.image_width
                            ? structure.header.image_width
                            : '50%'
                        "
                        class="mx-auto my-2 zoomIn"
                        height="auto"
                        min-height="200px"
                      />

                      <h1
                        :class="{ editable: editMode }"
                        :contenteditable="editMode"
                        class="font-weight-black text-white mt-10"
                        @blur="(e) => innerUpdate(e, 'title', structure.header)"
                        v-html="structure.header.title"
                      ></h1>

                      <p
                        :class="{ editable: editMode }"
                        :contenteditable="editMode"
                        class="text-white"
                        @blur="
                          (e) => innerUpdate(e, 'sub_title', structure.header)
                        "
                        v-html="structure.header.sub_title"
                      ></p>
                      <b-email-marketing-editor-button
                        v-model:action="structure.header.action"
                        :edit-mode="editMode"
                        :structure="structure"
                        :tracking-mode="track_mode"
                        @show-edit="showEdit"
                      ></b-email-marketing-editor-button>
                    </div>
                  </div>
                </v-expand-transition>

                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ SECTIONS ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

                <div class="text-center" style="min-height: 80px">
                  <div
                    v-for="(section, index) in structure.sections"
                    :key="index"
                    :class="{ 'section-container-editable': editMode }"
                    :style="{
                      'background-image': section.bg_image
                        ? `url('${section.bg_image}')`
                        : null,
                    }"
                    class="position-relative"
                    style="background-size: cover; background-position: center"
                  >
                    <div v-if="editMode" class="b-email-editor__block-toolbar">
                      <span>{{ sectionTitle(section.type) }}</span>
                      <div>
                        <v-btn
                          class="sd-modern-icon-button"
                          icon
                          variant="text"
                          :disabled="index === 0"
                          :aria-label="$t('email_builder.workspace.move_up')"
                          @click="moveUp(section)"
                          ><v-icon size="16" aria-hidden="true"
                            >arrow_upward</v-icon
                          ><v-tooltip
                            activator="parent"
                            location="top"
                            content-class="sd-modern-tooltip text-start"
                            >{{
                              $t("email_builder.workspace.move_up")
                            }}</v-tooltip
                          ></v-btn
                        >
                        <v-btn
                          class="sd-modern-icon-button"
                          icon
                          variant="text"
                          :disabled="index === structure.sections.length - 1"
                          :aria-label="$t('email_builder.workspace.move_down')"
                          @click="moveDown(section)"
                          ><v-icon size="16" aria-hidden="true"
                            >arrow_downward</v-icon
                          ><v-tooltip
                            activator="parent"
                            location="top"
                            content-class="sd-modern-tooltip text-start"
                            >{{
                              $t("email_builder.workspace.move_down")
                            }}</v-tooltip
                          ></v-btn
                        >
                        <v-btn
                          class="sd-modern-icon-button"
                          icon
                          variant="text"
                          :aria-label="
                            $t('email_builder.workspace.edit_section')
                          "
                          @click="editSection(section)"
                          ><v-icon size="16" aria-hidden="true">edit</v-icon
                          ><v-tooltip
                            activator="parent"
                            location="top"
                            content-class="sd-modern-tooltip text-start"
                            >{{
                              $t("email_builder.workspace.edit_section")
                            }}</v-tooltip
                          ></v-btn
                        >
                        <v-btn
                          class="sd-modern-icon-button"
                          icon
                          variant="text"
                          :aria-label="
                            $t('email_builder.workspace.delete_section')
                          "
                          @click="deleteSection(index)"
                          ><v-icon size="16" aria-hidden="true"
                            >delete_outline</v-icon
                          ><v-tooltip
                            activator="parent"
                            location="top"
                            content-class="sd-modern-tooltip text-start"
                            >{{
                              $t("email_builder.workspace.delete_section")
                            }}</v-tooltip
                          ></v-btn
                        >
                      </div>
                    </div>
                    <div
                      :style="{
                        'background-color': section.bg_color,
                        color: section.dark ? '#fff' : 'unset',
                      }"
                      class="section-content"
                    >
                      <!--  ---------------------- Section > Product ---------------------- -->

                      <v-container
                        v-if="section.type === 'product'"
                        :style="{ textAlign: section.align }"
                        class=""
                      >
                        <v-row align="center" justify="center">
                          <v-col
                            :order="section.reverse ? 1 : 2"
                            cols="12"
                            sm="6"
                          >
                            <v-img
                              :src="
                                section.product
                                  ? getProductImage(section.product, 256)
                                  : image_placeholder
                              "
                              class="mx-auto my-3 pointer-pointer"
                              height="100%"
                              min-height="84"
                              min-width="84"
                              width="100%"
                              @click="
                                showEdit([
                                  {
                                    type: 'product',
                                    object: section,
                                    key: 'product',
                                  },
                                ])
                              "
                            />
                          </v-col>

                          <v-col
                            :order="section.reverse ? 2 : 1"
                            cols="12"
                            sm="6"
                          >
                            <span
                              v-if="section.span || editMode"
                              :class="{ editable: editMode }"
                              :contenteditable="editMode"
                              class="subheading"
                              @blur="(e) => innerUpdate(e, 'span', section)"
                              v-html="section.span"
                            ></span>

                            <h2
                              :class="editMode ? ' editable' : ''"
                              :contenteditable="editMode"
                              class="my-5"
                              @blur="(e) => innerUpdate(e, 'title', section)"
                              v-html="section.title"
                            ></h2>

                            <p
                              :class="editMode ? ' editable' : ''"
                              :contenteditable="editMode"
                              @blur="(e) => innerUpdate(e, 'message', section)"
                              v-html="section.message"
                            ></p>

                            <b-email-marketing-editor-button
                              v-model:action="section.action"
                              :edit-mode="editMode"
                              :structure="structure"
                              :tracking-mode="track_mode"
                              @show-edit="showEdit"
                            ></b-email-marketing-editor-button>
                          </v-col>
                        </v-row>
                      </v-container>

                      <!--  ---------------------- Section > Image ---------------------- -->

                      <div
                        v-if="section.type === 'image'"
                        :style="{ textAlign: section.align }"
                        class="pt-5"
                      >
                        <span
                          v-if="section.span || editMode"
                          :class="{ editable: editMode }"
                          :contenteditable="editMode"
                          class="text-center subheading"
                          @blur="(e) => innerUpdate(e, 'span', section)"
                          v-html="section.span"
                        ></span>

                        <v-img
                          :class="section.class"
                          :max-height="section.image_max_height"
                          :max-width="section.image_max_width"
                          :src="
                            section.image ? section.image : image_placeholder
                          "
                          class="mx-auto my-3 pointer-pointer"
                          min-height="64"
                          min-width="64"
                          width="100%"
                          @click="
                            showEdit([
                              {
                                type: 'section',
                                key: 'section1',
                                title: 'Image',
                                icon: 'image',
                                description:
                                  'You can upload an image in this location.',
                              },

                              {
                                type: 'image',
                                object: section,
                                key: 'image',
                                label: 'Select image',
                              },
                            ])
                          "
                        />

                        <h3
                          v-if="section.title || editMode"
                          :class="{ editable: editMode }"
                          :contenteditable="editMode"
                          class="my-5"
                          @blur="(e) => innerUpdate(e, 'title', section)"
                          v-html="section.title"
                        ></h3>

                        <b-email-marketing-editor-button
                          v-model:action="section.action"
                          :edit-mode="editMode"
                          :structure="structure"
                          :tracking-mode="track_mode"
                          @show-edit="showEdit"
                        ></b-email-marketing-editor-button>

                        <p
                          v-if="section.message || editMode"
                          :class="
                            (section.message_class
                              ? section.message_class
                              : '') + (editMode ? ' editable' : '')
                          "
                          :contenteditable="editMode"
                          @blur="(e) => innerUpdate(e, 'message', section)"
                          v-html="section.message"
                        ></p>
                      </div>

                      <!--  ---------------------- Section > Two Columns ---------------------- -->

                      <v-container v-if="section.type === 'two-columns'">
                        <v-row align="center" justify="center">
                          <v-col
                            :style="{ textAlign: section.s1.align }"
                            cols="12"
                            sm="6"
                          >
                            <v-img
                              :src="
                                section.s1.image
                                  ? section.s1.image
                                  : image_placeholder
                              "
                              class="mx-auto my-3 pointer-pointer"
                              height="84"
                              width="84"
                              @click="
                                showEdit([
                                  {
                                    type: 'section',
                                    key: 'section1',
                                    title: 'Image',
                                    icon: 'image',
                                    description:
                                      'You can upload an image in this location.',
                                  },

                                  {
                                    type: 'image',
                                    object: section.s1,
                                    key: 'image',
                                    label: 'Select image',
                                  },
                                ])
                              "
                            />

                            <h2
                              :class="editMode ? ' editable' : ''"
                              :contenteditable="editMode"
                              class="my-5"
                              @blur="(e) => innerUpdate(e, 'title', section.s1)"
                              v-html="section.s1.title"
                            ></h2>

                            <p
                              :class="
                                section.s1.class + (editMode ? ' editable' : '')
                              "
                              :contenteditable="editMode"
                              @blur="(e) => innerUpdate(e, 'html', section.s1)"
                              v-html="section.s1.html"
                            ></p>

                            <b-email-marketing-editor-button
                              v-model:action="section.s1.action"
                              :edit-mode="editMode"
                              :structure="structure"
                              :tracking-mode="track_mode"
                              @show-edit="showEdit"
                            ></b-email-marketing-editor-button>
                          </v-col>

                          <v-col
                            :style="{ textAlign: section.s2.align }"
                            cols="12"
                            sm="6"
                          >
                            <v-img
                              :src="
                                section.s2.image
                                  ? section.s2.image
                                  : image_placeholder
                              "
                              class="mx-auto my-3 pointer-pointer"
                              height="84"
                              width="84"
                              @click="
                                showEdit([
                                  {
                                    type: 'section',
                                    key: 'section1',
                                    title: 'Image',
                                    icon: 'image',
                                    description:
                                      'You can upload an image in this location.',
                                  },

                                  {
                                    type: 'image',
                                    object: section.s2,
                                    key: 'image',
                                    label: 'Select image',
                                  },
                                ])
                              "
                            />

                            <h2
                              :class="editMode ? ' editable' : ''"
                              :contenteditable="editMode"
                              class="my-5"
                              @blur="(e) => innerUpdate(e, 'title', section.s2)"
                              v-html="section.s2.title"
                            ></h2>

                            <p
                              :class="
                                section.s2.class + (editMode ? ' editable' : '')
                              "
                              :contenteditable="editMode"
                              @blur="(e) => innerUpdate(e, 'html', section.s2)"
                              v-html="section.s2.html"
                            ></p>

                            <b-email-marketing-editor-button
                              v-model:action="section.s2.action"
                              :edit-mode="editMode"
                              :structure="structure"
                              :tracking-mode="track_mode"
                              @show-edit="showEdit"
                            ></b-email-marketing-editor-button>
                          </v-col>
                        </v-row>
                      </v-container>

                      <!--  ---------------------- Section > Text ---------------------- -->

                      <div
                        v-if="section.type === 'text'"
                        :style="{ textAlign: section.align }"
                        class="pt-5"
                      >
                        <span
                          :class="section.class + (editMode ? ' editable' : '')"
                          :contenteditable="editMode"
                          class="mx-auto subheading"
                          @blur="(e) => innerUpdate(e, 'span', section)"
                          v-html="section.span"
                        ></span>

                        <h2
                          :class="section.class + (editMode ? ' editable' : '')"
                          :contenteditable="editMode"
                          class="mt-5 mb-5 mx-auto"
                          @blur="(e) => innerUpdate(e, 'title', section)"
                          v-html="section.title"
                        ></h2>

                        <b-email-marketing-editor-button
                          v-model:action="section.action"
                          :edit-mode="editMode"
                          :structure="structure"
                          :tracking-mode="track_mode"
                          @show-edit="showEdit"
                        ></b-email-marketing-editor-button>

                        <p
                          :class="section.class + (editMode ? ' editable' : '')"
                          :contenteditable="editMode"
                          class="max-width-container-1280px mx-auto mb-5 mt-3"
                          @blur="(e) => innerUpdate(e, 'text', section)"
                          v-html="section.text"
                        ></p>
                      </div>

                      <!--  ---------------------- Add > Actions ---------------------- -->

                      <v-row class="pb-5" justify="center">
                        <div
                          v-for="(action, index) in section.actions"
                          :key="index"
                        >
                          <b-email-marketing-editor-button
                            :action="action"
                            :edit-mode="editMode"
                            :in-array="section.actions"
                            :structure="structure"
                            :tracking-mode="track_mode"
                            @update:action="(v) => (action = v)"
                            @show-edit="showEdit"
                          ></b-email-marketing-editor-button>
                        </div>
                      </v-row>
                    </div>

                    <!--  ---------------------- Add > Buttons ---------------------- -->

                    <div v-if="editMode" class="b-email-editor__extra-actions">
                      <v-btn
                        class="sd-modern-button sd-modern-button--inline"
                        color="primary"
                        prepend-icon="add"
                        variant="text"
                        @click="addAction(section)"
                        >{{
                          $t("email_builder.workspace.add_extra_action")
                        }}</v-btn
                      >
                    </div>

                    <!--  ---------------------- Add > Inline Sections ---------------------- -->

                    <div v-if="editMode" class="b-email-editor__insert">
                      <v-menu content-class="text-start"
                        ><template #activator="{ props }"
                          ><v-btn
                            v-bind="props"
                            class="sd-modern-button sd-modern-button--inline"
                            variant="text"
                            color="primary"
                            prepend-icon="add"
                            >{{
                              $t("email_builder.workspace.insert_section")
                            }}</v-btn
                          ></template
                        ><v-list density="compact" class="text-start"
                          ><v-list-item
                            v-for="(definition, key) in EmailSectionStructures"
                            :key="key"
                            :title="sectionTitle(key)"
                            :prepend-icon="sectionIcon(key)"
                            @click="addSection(key, index)" /></v-list
                      ></v-menu>
                    </div>
                  </div>

                  <!--  ============== END SECTIONS ================ -->

                  <!--  ---------------------- Add > Inline Sections (No section exist!) ---------------------- -->

                  <div
                    v-if="editMode && !structure.sections.length"
                    class="b-email-editor__empty"
                  >
                    <v-icon size="24" aria-hidden="true">view_quilt</v-icon>
                    <p>{{ $t("email_builder.workspace.empty") }}</p>
                    <span>{{ $t("email_builder.workspace.empty_help") }}</span>
                    <div>
                      <v-btn
                        v-for="(definition, key) in EmailSectionStructures"
                        :key="key"
                        class="sd-modern-button"
                        variant="outlined"
                        :prepend-icon="sectionIcon(key)"
                        @click="addSection(key, -1)"
                        >{{ sectionTitle(key) }}</v-btn
                      >
                    </div>
                  </div>

                  <div style="min-height: 5vh" />

                  <!-- =================================== FOOTER ================================== -->
                  <v-expand-transition>
                    <v-sheet
                      v-if="structure.footer"
                      class="position-relative"
                      dark
                    >
                      <v-container
                        v-if="structure.footer"
                        class="position-relative text-start"
                      >
                        <v-row>
                          <v-col cols="12">
                            <h2>
                              <img
                                :src="getShopIcon(shop.id, 64)"
                                height="32"
                                style="
                                  border-radius: 50%;
                                  vertical-align: bottom;
                                "
                                width="32"
                              />
                              {{ shop.title }}
                            </h2>

                            <p
                              v-if="!edit_description || !editMode"
                              class="mt-2 animate-underline-editable"
                              @click="editMode && (edit_description = true)"
                            >
                              {{
                                structure.footer.description
                                  ? structure.footer.description.substring(
                                      0,
                                      128,
                                    )
                                  : (shop.description || "").substring(0, 128)
                              }}
                            </p>
                            <v-text-field
                              v-else
                              v-model="structure.footer.description"
                              :counter="128"
                              class="mt-2"
                              density="compact"
                              flat
                              variant="solo"
                              @blur="
                                (e) => {
                                  edit_description = false;
                                }
                              "
                            ></v-text-field>
                          </v-col>
                          <v-col cols="8">
                            <h2>Contact Info</h2>
                            <p class="text-muted">
                              {{ info.address }}
                              <br />
                              {{ info.phone }}
                              <br />
                              {{ info.email }}
                            </p>
                          </v-col>
                          <v-col cols="4">
                            <h2>Menu</h2>
                            <p class="text-muted">
                              Visit Store
                              <br />
                              About Us
                              <br />
                              FAQ
                              <br />
                              Privacy
                            </p>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-sheet>
                  </v-expand-transition>
                </div>
              </div>
            </div>

            <div v-if="editMode" class="b-email-editor__toggles">
              <u-smart-toggle
                v-model="has_header"
                false-gray
                false-icon="browser_not_supported"
                true-icon="drag_handle"
                :true-title="$t('email_builder.workspace.header')"
                :true-description="$t('email_builder.workspace.header_help')"
              /><u-smart-toggle
                v-model="has_footer"
                false-gray
                false-icon="browser_not_supported"
                true-icon="call_to_action"
                :true-title="$t('email_builder.workspace.footer')"
                :true-description="$t('email_builder.workspace.footer_help')"
              />
            </div>
            <footer class="b-email-editor__actions">
              <span>{{ $t("email_builder.workspace.changes_apply") }}</span
              ><v-btn
                class="sd-modern-button sd-modern-button--primary"
                variant="flat"
                color="primary"
                :prepend-icon="email ? 'save' : 'add'"
                :disabled="!can_edit || busy_send"
                :loading="busy_save"
                @click="saveEmail()"
                >{{
                  $t(
                    email
                      ? "email_builder.workspace.save"
                      : "email_builder.workspace.create",
                  )
                }}</v-btn
              >
            </footer>
          </section>

          <section
            v-show="active_section === 'send'"
            class="sd-modern-widget b-email-editor__panel"
          >
            <header class="sd-modern-header">
              <div>
                <h2 class="sd-modern-title-text">
                  {{ $t("email_builder.workspace.send_title") }}
                </h2>
                <p class="sd-modern-subtitle">
                  {{ $t("email_builder.workspace.send_subtitle") }}
                </p>
              </div>
              <span class="sd-modern-status sd-modern-status--plain">
                <span
                  class="sd-modern-status__dot"
                  :class="emailStateTone"
                  aria-hidden="true"
                />
                {{ emailStateLabel }}
              </span>
            </header>

            <div v-if="!email" class="sd-modern-notice" role="status">
              <v-icon size="18" aria-hidden="true">info_outline</v-icon>
              <span>{{ $t("email_builder.workspace.create_first") }}</span>
            </div>
            <div v-else-if="email.sent" class="sd-modern-notice" role="status">
              <v-icon size="18" aria-hidden="true">info_outline</v-icon>
              <span>{{ $t("email_builder.workspace.sent_readonly") }}</span>
            </div>

            <div class="b-email-editor__provider">
              <v-avatar v-if="service_provider" size="32" rounded="lg">
                <v-img
                  :src="service_provider.icon"
                  :alt="service_provider.title"
                />
              </v-avatar>
              <v-icon v-else size="24" aria-hidden="true">mail_outline</v-icon>
              <div class="b-email-editor__provider-copy">
                <strong>{{
                  service_provider?.title ||
                  $t("email_builder.workspace.provider_title")
                }}</strong>
                <p class="sd-modern-muted">
                  {{ $t("email_builder.workspace.provider_help") }}
                </p>
              </div>
              <span
                v-if="mailService"
                class="sd-modern-status sd-modern-status--plain"
              >
                <span
                  class="sd-modern-status__dot"
                  :class="
                    mailService.enable
                      ? 'sd-modern-status__dot--success'
                      : 'sd-modern-status__dot--error'
                  "
                  aria-hidden="true"
                />
                {{
                  $t(
                    mailService.enable
                      ? "global.commons.enable"
                      : "global.commons.disable",
                  )
                }}
              </span>
              <v-btn
                :to="{ name: 'BPageShopSettingEmail' }"
                class="sd-modern-button sd-modern-button--inline"
                color="primary"
                variant="text"
                prepend-icon="settings"
              >
                {{ $t("email_builder.workspace.provider_settings") }}
              </v-btn>
            </div>
            <p class="sd-modern-subtitle">
              {{ $t("email_builder.workspace.provider_domain_help") }}
            </p>
            <div
              v-if="mailService?.error"
              class="sd-modern-notice"
              role="alert"
            >
              <v-icon size="18" color="error" aria-hidden="true">report</v-icon>
              <span>{{ $t("email_builder.workspace.provider_issue") }}</span>
            </div>
            <div
              v-if="email && (!service || !service.enable)"
              class="sd-modern-notice"
              role="status"
            >
              <v-icon size="18" aria-hidden="true">info_outline</v-icon>
              <span>{{ $t("email_builder.workspace.no_service") }}</span>
            </div>

            <v-form
              ref="send_form"
              @submit.prevent="
                !sendDisabled && email && SaveAndSendMail(!email.in_que)
              "
            >
              <div
                class="b-email-editor__fields b-email-editor__send-fields sd-modern-underlined-field"
              >
                <v-text-field
                  v-model="mail_from"
                  class="b-email-editor__sender"
                  dir="ltr"
                  :disabled="
                    !email ||
                    !can_edit ||
                    !hasWriteAccess ||
                    busy_save ||
                    busy_send
                  "
                  :label="$t('email_builder.workspace.sender')"
                  :messages="
                    $t('email_builder.workspace.sender_help', {
                      domain: `@${mail_host}`,
                    })
                  "
                  :rules="[GlobalRules.counter(24), GlobalRules.required()]"
                  :suffix="'@' + mail_host"
                  counter="24"
                  placeholder="no-reply"
                  variant="underlined"
                />
                <div>
                  <v-text-field
                    v-model="mail_subject"
                    :disabled="
                      !email ||
                      !can_edit ||
                      !hasWriteAccess ||
                      busy_save ||
                      busy_send
                    "
                    :label="$t('email_builder.workspace.subject')"
                    :messages="$t('email_builder.workspace.subject_help')"
                    :rules="[GlobalRules.counter(120), GlobalRules.required()]"
                    counter="120"
                    variant="underlined"
                  />
                  <u-smart-suggestion
                    v-if="
                      email &&
                      can_edit &&
                      hasWriteAccess &&
                      !busy_save &&
                      !busy_send
                    "
                    :samples="$tm('suggestions.shop_email.subject')"
                    @select="(value) => (mail_subject = value)"
                  />
                </div>
              </div>

              <div class="b-email-editor__group">
                <h3>{{ $t("email_builder.workspace.delivery_timing") }}</h3>
                <p class="sd-modern-subtitle">
                  {{ $t("email_builder.workspace.schedule_help") }}
                </p>
                <u-smart-select
                  v-model="schedule_enable"
                  :items="deliveryChoices"
                  item-value="id"
                  item-text="title"
                  item-description="description"
                  item-icon="icon"
                  accessible
                  force-show-all
                  :aria-label="$t('email_builder.workspace.delivery_timing')"
                  :disabled="
                    !email ||
                    !can_edit ||
                    !hasWriteAccess ||
                    busy_save ||
                    busy_send
                  "
                  class="sd-modern-smart-select b-email-editor__timing"
                  border
                />
                <div
                  v-show="schedule_enable"
                  class="sd-modern-underlined-field b-email-editor__schedule-field"
                >
                  <u-date-input
                    v-model="mail_schedule"
                    :disabled="
                      !email ||
                      !can_edit ||
                      !hasWriteAccess ||
                      !schedule_enable ||
                      busy_save ||
                      busy_send
                    "
                    :label="$t('email_builder.workspace.schedule_at')"
                    :messages="$t('email_builder.workspace.schedule_time_help')"
                    :min="new Date().toISOString()"
                    :placeholder="$t('email_builder.schedule_placeholder')"
                    clearable
                    return-utc
                    variant="underlined"
                  />
                  <div
                    v-if="invalid_schedule"
                    class="sd-modern-notice"
                    role="alert"
                  >
                    <v-icon size="18" color="error" aria-hidden="true"
                      >error_outline</v-icon
                    >
                    <span>{{
                      $t("email_builder.workspace.invalid_schedule")
                    }}</span>
                    <v-btn
                      class="sd-modern-button sd-modern-button--inline"
                      variant="text"
                      :disabled="
                        !email ||
                        !can_edit ||
                        !hasWriteAccess ||
                        busy_save ||
                        busy_send
                      "
                      prepend-icon="close"
                      @click="
                        mail_schedule = null;
                        schedule_enable = false;
                      "
                      >{{
                        $t("email_builder.workspace.remove_schedule")
                      }}</v-btn
                    >
                  </div>
                </div>
              </div>

              <div class="b-email-editor__cost">
                <u-text-value-dashed>
                  <template #label>{{
                    $t("email_builder.workspace.cost_title")
                  }}</template>
                  <u-price
                    v-if="email && service && cost !== null"
                    :amount="cost"
                    :currency="email.currency"
                  />
                  <span v-else>—</span>
                </u-text-value-dashed>
                <p class="sd-modern-subtitle">
                  {{
                    email && service && cost !== null
                      ? $t("email_builder.workspace.cost_help", {
                          count: $n(users_count),
                          currency: email.currency,
                        })
                      : $t("email_builder.workspace.cost_unavailable")
                  }}
                </p>
              </div>
            </v-form>

            <div class="b-email-editor__group">
              <h3>{{ $t("email_builder.workspace.approval_title") }}</h3>
              <p class="sd-modern-subtitle">
                {{ $t("email_builder.workspace.approval_help") }}
              </p>
              <div class="b-email-editor__reviewer">
                <v-avatar size="32"
                  ><v-img :src="getUserAvatar(review_user_id)" alt=""
                /></v-avatar>
                <div class="b-email-editor__reviewer-copy">
                  <span class="sd-modern-muted">{{
                    $t("email_builder.workspace.reviewer")
                  }}</span>
                  <strong v-if="review_user?.name">{{
                    review_user.name
                  }}</strong>
                  <small v-if="review_user?.email">{{
                    review_user.email
                  }}</small>
                  <small v-else>{{
                    $t("email_builder.workspace.reviewer_help")
                  }}</small>
                </div>
                <v-btn
                  :to="{ name: 'BPageShopSettingEmail' }"
                  class="sd-modern-button sd-modern-button--inline"
                  color="primary"
                  variant="text"
                  prepend-icon="settings"
                >
                  {{ $t("email_builder.workspace.reviewer_settings") }}
                </v-btn>
              </div>

              <b-email-marketing-send-flow
                :email="email"
                :schedule-at="mail_schedule"
                :schedule-enabled="schedule_enable"
                :provider="service_provider"
                :active="active_section === 'send'"
              />
              <p
                v-if="schedule_enable && mail_schedule"
                class="sd-modern-subtitle"
              >
                {{
                  $t("email_builder.workspace.scheduled_for", {
                    date: getLocalTimeString(mail_schedule),
                  })
                }}
              </p>
            </div>

            <footer class="b-email-editor__actions">
              <div>
                <p class="sd-modern-subtitle">
                  {{
                    $t(
                      !email
                        ? "email_builder.workspace.create_first"
                        : email.sent
                          ? "email_builder.workspace.sent_readonly"
                          : email.in_que
                            ? "email_builder.workspace.cancel_help"
                            : "email_builder.workspace.send_request_help",
                    )
                  }}
                </p>
                <v-btn
                  class="sd-modern-button sd-modern-button--inline"
                  variant="text"
                  color="primary"
                  prepend-icon="account_tree"
                  @click="show_guide = true"
                  >{{ $t("email_builder.workspace.guide_title") }}</v-btn
                >
              </div>
              <v-btn
                v-if="email"
                :class="{
                  'sd-modern-button--primary': !email.in_que && !email.sent,
                }"
                class="sd-modern-button"
                :color="!email.in_que && !email.sent ? 'primary' : undefined"
                :variant="email.in_que ? 'outlined' : 'elevated'"
                :prepend-icon="
                  email.sent
                    ? 'done'
                    : email.in_que
                      ? 'cancel_schedule_send'
                      : schedule_enable
                        ? 'schedule_send'
                        : 'send'
                "
                :disabled="sendDisabled"
                :loading="busy_save || busy_send"
                @click="SaveAndSendMail(!email.in_que)"
                >{{
                  $t(
                    email.sent
                      ? "global.commons.done"
                      : email.in_que
                        ? "email_builder.workspace.cancel_request"
                        : schedule_enable
                          ? "email_builder.workspace.schedule_request"
                          : "email_builder.workspace.send_request",
                  )
                }}</v-btn
              >
            </footer>
          </section>

          <footer class="b-email-editor__section-footer">
            <v-btn
              class="sd-modern-button sd-modern-button--inline"
              variant="text"
              color="primary"
              :disabled="sectionIndex === 0"
              prepend-icon="arrow_back"
              @click="active_section = editorSections[sectionIndex - 1].key"
              >{{ $t("global.actions.previous") }}</v-btn
            ><span
              >{{ editorSections[sectionIndex].title }} ·
              {{ $n(sectionIndex + 1) }} / {{ $n(editorSections.length) }}</span
            ><v-btn
              class="sd-modern-button sd-modern-button--inline"
              variant="text"
              color="primary"
              :disabled="sectionIndex === editorSections.length - 1"
              append-icon="arrow_forward"
              @click="active_section = editorSections[sectionIndex + 1].key"
              >{{ $t("global.actions.next") }}</v-btn
            >
          </footer>
        </div>
      </div>
    </div>
    <slot />

    <!-- ██████████████████████████ DIALOG : Edit ██████████████████████████ -->
    <b-email-marketing-editor-section
      v-if="editMode"
      ref="section_editor"
      :email="email"
      :loaded-fonts="loaded_fonts"
      :shop="shop"
      modern
    />

    <v-dialog v-model="load_file" max-width="570" scrollable
      ><v-card class="sd-modern-widget b-email-editor-dialog text-start"
        ><header class="sd-modern-header">
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("email_builder.workspace.import_template") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("email_builder.workspace.import_template_help") }}
            </p>
          </div>
          <v-btn
            class="sd-modern-icon-button"
            icon
            variant="text"
            :aria-label="$t('global.actions.close')"
            @click="load_file = false"
            ><v-icon size="17" aria-hidden="true">close</v-icon
            ><v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.actions.close") }}</v-tooltip
            ></v-btn
          >
        </header>
        <s-drop-zone
          extension=".smail"
          icon="all_inbox"
          :label="$t('email_builder.workspace.import_template')"
          :hint="$t('email_builder.workspace.import_template_help')"
          @select:file="
            (event) => {
              loadFileTemplate(event);
              load_file = false;
            }
          " /></v-card
    ></v-dialog>
    <v-dialog v-model="show_guide" max-width="650" scrollable
      ><v-card class="sd-modern-widget b-email-editor-dialog text-start"
        ><header class="sd-modern-header">
          <h2 class="sd-modern-title-text">
            {{ $t("email_builder.workspace.guide_title") }}
          </h2>
          <v-btn
            class="sd-modern-icon-button"
            icon
            variant="text"
            :aria-label="$t('global.actions.close')"
            @click="show_guide = false"
            ><v-icon size="17" aria-hidden="true">close</v-icon
            ><v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.actions.close") }}</v-tooltip
            ></v-btn
          >
        </header>
        <p class="sd-modern-subtitle">
          {{ $t("email_builder.workspace.guide_intro") }}
        </p>
        <ol class="b-email-editor-dialog__steps">
          <li
            v-for="step in [
              'create',
              'audience',
              'design',
              'save',
              'request',
              'approve',
              'sending',
            ]"
            :key="step"
          >
            {{ $t("email_builder.workspace.guide_" + step) }}
          </li>
        </ol>
        <div class="b-email-editor__reviewer">
          <v-avatar size="30"
            ><v-img :src="getUserAvatar(review_user_id)"
          /></v-avatar>
          <div class="b-email-editor__reviewer-copy">
            {{ review_user?.name || $t("email_builder.workspace.reviewer")
            }}<small v-if="review_user">{{ review_user.email }}</small>
          </div>
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            prepend-icon="settings"
            :to="{ name: 'BPageShopSettingEmail' }"
            >{{ $t("email_builder.workspace.reviewer_settings") }}</v-btn
          >
        </div></v-card
      ></v-dialog
    >
  </div>
</template>

<script lang="ts">
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions.ts";
import EmailSectionStructures from "./section/structure/EmailSectionStructures";
import BCustomersFunnel from "../../customer/funnel/BCustomersFunnel.vue";
import BEmailMarketingTrackSpot from "../../email-marketing/track-spot/BEmailMarketingTrackSpot.vue";
import UDateInput from "../../../ui/date/input/UDateInput.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import BEmailMarketingEditorButton from "./button/BEmailMarketingEditorButton.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import SDropZone from "../../../ui/uploader/SDropZone.vue";
import UTextValueDashed from "../../../ui/text/value-dashed/UTextValueDashed.vue";
import USmartSelect from "../../../ui/smart/select/USmartSelect.vue";
import { EmailProviders } from "@selldone/core-js/enums/email/EmailProviders";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import BEmailMarketingSendFlow from "./flow/BEmailMarketingSendFlow.vue";

import BClusterInput from "../../cluster/input/BClusterInput.vue";
import USmartMenu from "../../../ui/smart/menu/USmartMenu.vue";
import { InlineEditorMixin } from "../../../mixin/InlineEditorMixin";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";
import BEmailMarketingEditorSection from "../../email-marketing/editor/section/BEmailMarketingEditorSection.vue";
import { EmailOptionsHelper } from "./section/options/EmailOptionsHelper.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { FileHelper } from "@selldone/core-js";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

var WebFont = require("webfontloader");
export default {
  name: "BEmailMarketingEditor",
  mixins: [InlineEditorMixin, DateMixin],

  components: {
    UCurrencyIcon,
    BEmailMarketingEditorSection,
    USmartMenu,
    BClusterInput,

    BEmailMarketingSendFlow,
    USmartSuggestion,
    USmartToggle,
    USmartSelect,
    UTextValueDashed,
    SDropZone,
    BEmailMarketingEditorButton,
    UCurrencyInput,
    UDateInput,
    BEmailMarketingTrackSpot,
    BCustomersFunnel,
  },

  props: {
    email: {
      require: false,
    },
    initialConfig: {
      type: Object,
      default: null,
    },
    service: {}, // enable    cost

    shop: {
      require: true,
    },
    structure: {
      require: true,
    },
    hasEditMode: {
      type: Boolean,
      default: false,
    },

    mailService: {
      // Custom mail service info (Mailgun, ...)
      required: false,
      type: Object,
    },
  },

  data() {
    return {
      image_placeholder: require("@selldone/core-js/helper/image/assets/image-placeholder.svg"),

      dialog_options: null,
      dialog_show: false,

      EmailSectionStructures: EmailSectionStructures,

      dialog_file_select: false,
      current_image_option: null,

      current_dir: null, //Global kepp current dir

      //-----------------------
      edit_name: !this.$props.email, // initial by edit mode when add new email

      mail_name: null,
      mail_subject: "",
      mail_from: "team",
      mail_schedule: null,
      schedule_enable: this.$props.email && !!this.$props.email.schedule_at,
      mail_currency: SetupService.DefaultCurrency(),

      cluster_id: null,

      //-----------------------

      dialog_send: false,

      //-----------------------

      filter: [],

      //-----------------------

      has_header: !!this.$props.structure.header,
      has_footer: !!this.$props.structure.footer,

      //-----------------------
      active_section: "general",
      request_epoch: 0,

      busy_save: false,

      max_h: "unset",

      edit_description: false,

      loaded_fonts: [],

      load_file: false, // Dialog load file
      draged: false,

      //-----------------------
      busy_send: false,

      busy_html: false,

      //-----------------------
      users_count: null,

      track_mode: false,

      //-----------------------
      show_guide: false,
    };
  },
  computed: {
    deliveryChoices() {
      return [
        {
          id: false,
          title: "email_builder.workspace.send_after_approval",
          description: "email_builder.workspace.send_after_approval_help",
          icon: "send",
        },
        {
          id: true,
          title: "email_builder.workspace.schedule_later",
          description: "email_builder.workspace.schedule_later_help",
          icon: "schedule_send",
        },
      ];
    },
    resourceKey() {
      return String(this.shop?.id) + ":" + String(this.email?.id ?? "new");
    },
    hasWriteAccess() {
      return this.canWriteCurrent();
    },
    editorSections() {
      return [
        {
          key: "general",
          icon: "tune",
          title: this.$t("email_builder.workspace.general_title"),
        },
        {
          key: "audience",
          icon: "groups",
          title: this.$t("email_builder.workspace.audience_title"),
        },
        {
          key: "design",
          icon: "view_quilt",
          title: this.$t("email_builder.workspace.design_title"),
        },
        {
          key: "send",
          icon: "send",
          title: this.$t("email_builder.workspace.send_title"),
        },
      ];
    },
    sectionIndex() {
      return this.editorSections.findIndex(
        (section) => section.key === this.active_section,
      );
    },
    emailStateLabel() {
      if (!this.email) return this.$t("email_builder.workspace.status_new");
      if (this.email.sent) return this.$t("global.commons.sent");
      if (this.email.approve === "REJECT")
        return this.$t("email_builder.workspace.rejected");
      if (this.email.in_que)
        return this.$t(
          this.email.approve === "ACCEPT"
            ? this.is_before_schedule_time
              ? "email_builder.workspace.schedule"
              : "email_builder.workspace.accepted"
            : "email_builder.workspace.pending",
        );
      return this.$t("email_builder.workspace.status_not_queued");
    },
    emailStateTone() {
      if (
        this.email?.sent ||
        (this.email?.in_que &&
          this.email.approve === "ACCEPT" &&
          !this.is_before_schedule_time)
      )
        return "sd-modern-status__dot--success";
      if (this.email?.approve === "REJECT")
        return "sd-modern-status__dot--error";
      if (this.email?.in_que) return "sd-modern-status__dot--warning";
      return "";
    },
    sendDisabled() {
      if (!this.email || !this.can_edit || this.busy_save || this.busy_send)
        return true;
      if (this.email.in_que) return false; // Cancellation is independent of provider and audience availability.
      return (
        !this.service?.enable ||
        !(this.users_count > 0) ||
        this.invalid_schedule ||
        (this.schedule_enable && !this.mail_schedule)
      );
    },
    EmailOptionsHelper() {
      return EmailOptionsHelper;
    },
    invalid_schedule() {
      return (
        this.schedule_enable &&
        this.mail_schedule &&
        this.mail_schedule.convertToLocalDate()?.isBeforeToday()
      );
    },

    service_provider() {
      return (
        this.mailService &&
        EmailProviders.find((i) => i.driver === this.mailService.driver)
      );
    },

    mail_host() {
      return this.mailService && this.mailService.enable
        ? this.mailService.host
        : `${this.shop.name}.${SetupService.ShopsDomain()}`;
    },

    info() {
      return this.shop.info ? this.shop.info : {};
    },

    menu_items() {
      const out = [];
      if (this.editMode) {
        out.push({
          title: this.$t("email_builder.workspace.import_template"),
          subtitle: this.$t("email_builder.workspace.import_template_help"),

          click: this.showLoadFile,
          icon: "folder_open",
        });
      }

      if (this.email) {
        out.push(
          ...[
            {
              title: this.$t("email_builder.workspace.export_template"),
              subtitle: this.$t("email_builder.workspace.export_template_help"),
              click: this.downloadJson,
              icon: "download",
            },
            {
              title: this.$t("email_builder.workspace.export_html"),

              subtitle: this.$t("email_builder.workspace.export_html_help"),
              click: this.downloadHtml,
              icon: "html",
            },

            {
              title: this.$t("email_builder.workspace.render_output"),

              subtitle: this.$t("email_builder.workspace.render_output_help"),
              href: window.API.GET_EMAIL_RENDER(this.shop.id, this.email.id),
              target: "_blank",
              rel: "noopener noreferrer",
              icon: "pageview",
            },
          ],
        );
      }

      return out;
    },

    editMode() {
      return this.hasEditMode && this.can_edit;
    },

    can_edit() {
      return this.hasWriteAccess && (!this.email || !this.email.sent);
    },

    cost() {
      if (!this.service || this.users_count === null) return null;
      return this.users_count * this.service.cost;
    },

    preferences() {
      return this.shop.preferences;
    },
    review_user_id() {
      return this.preferences?.review_id
        ? this.preferences?.review_id
        : this.shop.user_id;
    },
    review_user() {
      return this.preferences?.review_user;
    },

    is_accepted() {
      return this.email?.approve === "ACCEPT";
    },
    is_rejected() {
      return this.email?.approve === "REJECT";
    },
    is_pending() {
      return this.email?.approve === "PENDING";
    },

    is_before_schedule_time() {
      return (
        this.email?.schedule_at &&
        this.email.schedule_at.convertToLocalDate().isAfterToday()
      );
    },
  },

  watch: {
    resourceKey() {
      this.request_epoch++;
      this.busy_save = false;
      this.busy_send = false;
      this.busy_html = false;
      this.load_file = false;
      this.show_guide = false;
    },
    has_footer(has_footer) {
      if (has_footer) this.addFooter();
      else this.removeFooter();
    },

    has_header(has_header) {
      if (has_header) this.addHeader();
      else this.removeHeader();
    },
    schedule_enable(schedule_enable) {
      if (!schedule_enable) this.mail_schedule = null;
    },
  },
  created() {
    if (this.shop.currencies && this.shop.currencies.length)
      this.mail_currency = this.shop.currencies[0];

    if (this.email) {
      this.mail_currency = this.email.currency;
      this.mail_name = this.email.name;
      this.mail_schedule = this.email.schedule_at;
      //  this.structure = this.email.structure;
      this.filter = this.email.filter;
      this.mail_subject = this.email.subject;
      this.mail_from = this.email.from;
      this.cluster_id = this.email.cluster_id;

      this.$emit("update:structure", this.structure);
    } else if (this.initialConfig) {
      this.mail_name = this.initialConfig.name ?? null;
      if (this.shop.currencies?.includes(this.initialConfig.currency))
        this.mail_currency = this.initialConfig.currency;
      this.cluster_id = this.initialConfig.cluster_id ?? null;
    }

    // Load initial fonts:
    if (this.structure) {
      let fonts = [];
      if (this.structure.font_title) fonts.push(this.structure.font_title);
      if (this.structure.font_text) fonts.push(this.structure.font_text);

      this.loaded_fonts = fonts;
      if (fonts.length)
        WebFont.load({
          google: {
            families: fonts,
          },
        });
    }
  },
  mounted() {
    ScrollHelper.scrollToTop(0, "smooth");
  },

  beforeUnmount() {
    this.request_epoch++;
  },
  methods: {
    canWriteCurrent() {
      return (
        !!this.shop?.id &&
        typeof this.readShopAccess === "function" &&
        this.readShopAccess(ShopPermissionRegions.MARKETING.code) &&
        typeof this.writeShopAccess === "function" &&
        this.writeShopAccess(ShopPermissionRegions.MARKETING.code)
      );
    },
    isCurrentRequest(key, epoch) {
      return this.resourceKey === key && this.request_epoch === epoch;
    },
    sectionTitle(type) {
      return this.$t(
        "email_builder.workspace.section_" + type.replace("-", "_"),
      );
    },
    sectionIcon(type) {
      return (
        {
          product: "inventory_2",
          image: "image",
          "two-columns": "view_column",
          text: "text_fields",
        }[type] || "view_quilt"
      );
    },
    editSection(section) {
      const generators = {
        product: "GenerateProductOptions",
        image: "GenerateImageOptions",
        "two-columns": "GenerateTwoColumnsOptions",
        text: "GenerateTextOptions",
      };
      if (generators[section.type])
        this.showEdit(EmailOptionsHelper[generators[section.type]](section));
    },
    innerUpdate(event, key, object) {
      if (this.editMode && this.canWriteCurrent())
        InlineEditorMixin.methods.innerUpdate.call(this, event, key, object);
    },
    downloadHtml() {
      if (
        !this.email ||
        this.busy_html ||
        !this.readShopAccess(ShopPermissionRegions.MARKETING.code)
      )
        return;
      const key = this.resourceKey,
        epoch = this.request_epoch;
      this.busy_html = true;
      axios
        .get(window.API.GET_EMAIL_RENDER(this.shop.id, this.email.id))
        .then(({ data }) => {
          if (
            !this.isCurrentRequest(key, epoch) ||
            !this.readShopAccess(ShopPermissionRegions.MARKETING.code)
          )
            return;
          if (!data.error)
            FileHelper.DownloadText(
              this.email.name + ".html",
              data,
              "data:html/plain;charset=utf-8,",
            );
          else NotificationService.showErrorAlert(null, data.error_msg);
        })
        .catch((err) => {
          if (
            this.isCurrentRequest(key, epoch) &&
            this.readShopAccess(ShopPermissionRegions.MARKETING.code)
          )
            NotificationService.showErrorAlert(null, err);
        })

        .finally(() => {
          if (this.isCurrentRequest(key, epoch)) this.busy_html = false;
        });
    },
    showLoadFile() {
      if (!this.editMode || !this.canWriteCurrent()) return;
      this.load_file = true;
    },
    loadFileTemplate(event) {
      if (!event || !this.editMode || !this.canWriteCurrent()) return;
      const key = this.resourceKey,
        epoch = this.request_epoch;
      FileHelper.LoadFile(event)
        .then((json) => {
          if (
            !this.isCurrentRequest(key, epoch) ||
            !this.editMode ||
            !this.canWriteCurrent()
          )
            return;
          if (
            !json ||
            typeof json !== "object" ||
            !Array.isArray(json.sections) ||
            json.sections.some(
              (section) => !section || !EmailSectionStructures[section.type],
            )
          ) {
            NotificationService.showErrorAlert(
              null,
              this.$t("email_builder.workspace.template_invalid"),
            );
            return;
          }
          this.$emit("update:structure", json);
        })
        .catch((err) => {
          if (
            this.isCurrentRequest(key, epoch) &&
            this.editMode &&
            this.canWriteCurrent()
          )
            NotificationService.showErrorAlert(null, err);
        });
    },

    dropHandler(ev) {
      //console.log("File(s) dropped");
      this.draged = false;

      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();

      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (ev.dataTransfer.items[i].kind === "file") {
            const file = ev.dataTransfer.items[i].getAsFile();
            //console.log("1 - ... file[" + i + "].name = " + file.name);
            this.loadFileTemplate(file);
            break;
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.files.length; i++) {
          const file = ev.dataTransfer.files[i];
          //console.log("2 - ... file[" + i + "].name = " + file.name);
          this.loadFileTemplate(file);
          break;
        }
      }
    },
    dragOverHandler(ev) {
      //console.log("File(s) in drop zone");

      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();
    },

    async validate() {
      const result = await this.$refs.form?.validate();
      if (
        !result?.valid ||
        !this.mail_name?.trim() ||
        (!this.email && !this.shop.currencies?.includes(this.mail_currency))
      ) {
        this.active_section = "general";
        return false;
      }
      return true;
    },

    async saveEmail(callback = null) {
      if (
        !this.canWriteCurrent() ||
        this.email?.sent ||
        this.busy_save ||
        this.busy_send
      )
        return false;
      this.busy_save = true;
      const key = this.resourceKey,
        epoch = this.request_epoch,
        shopId = this.shop.id,
        emailId = this.email?.id;
      try {
        if (
          !(await this.validate()) ||
          !this.isCurrentRequest(key, epoch) ||
          !this.canWriteCurrent() ||
          this.email?.sent
        )
          return false;
        const pack = {
          currency: this.email?.currency || this.mail_currency,
          name: this.mail_name,
          schedule_at: this.mail_schedule,
          structure: this.structure,
          filter: this.filter,
          subject: this.mail_subject,
          from: this.mail_from,
          cluster_id: this.cluster_id,
        };
        const { data } = emailId
          ? await axios.put(window.API.PUT_UPDATE_EMAIL(shopId, emailId), pack)
          : await axios.post(window.API.POST_CREATE_EMAIL(shopId), pack);
        if (!this.isCurrentRequest(key, epoch) || !this.canWriteCurrent())
          return false;
        if (data.error) {
          NotificationService.showErrorAlert(null, data.error_msg);
          return false;
        }
        if (
          !data.email?.id ||
          (emailId && String(data.email.id) !== String(emailId)) ||
          (data.email.shop_id != null &&
            String(data.email.shop_id) !== String(shopId))
        )
          return false;
        NotificationService.showSuccessAlert(
          null,
          this.$t("email_builder.workspace.saved"),
        );
        if (!emailId) {
          this.$router.push({
            name: "BPageEmailMarketingEdit",
            params: { shop_id: shopId, email_id: data.email.id },
          });
          return true;
        }
        this.$emit("update:email", this.MergeObjects(this.email, data.email));
        if (
          callback &&
          this.isCurrentRequest(key, epoch) &&
          this.canWriteCurrent() &&
          !this.email?.sent
        )
          await callback();
        return true;
      } catch (error) {
        if (this.isCurrentRequest(key, epoch) && this.canWriteCurrent())
          NotificationService.showLaravelError(error);
        return false;
      } finally {
        if (this.isCurrentRequest(key, epoch)) this.busy_save = false;
      }
    },
    async SaveAndSendMail(send) {
      if (
        !this.email ||
        !this.canWriteCurrent() ||
        this.email.sent ||
        this.busy_save ||
        this.busy_send
      )
        return;
      if (!send) {
        if (this.email.in_que) return this.sendMail(false);
        return;
      }
      if (this.sendDisabled || this.email.in_que) return;
      const key = this.resourceKey,
        epoch = this.request_epoch;
      const validation = await this.$refs.send_form?.validate();
      if (
        !validation?.valid ||
        !this.isCurrentRequest(key, epoch) ||
        !this.canWriteCurrent() ||
        this.sendDisabled
      )
        return;
      // Force save if send clicked; approval remains a separate server-reviewed operation.
      return this.saveEmail(() => this.sendMail(true));
    },
    async sendMail(send) {
      if (
        !this.email ||
        !this.canWriteCurrent() ||
        this.email.sent ||
        this.busy_send ||
        (send && this.email.in_que) ||
        (!send && !this.email.in_que)
      )
        return;
      if (
        send &&
        (!this.service?.enable ||
          !(this.users_count > 0) ||
          this.invalid_schedule ||
          (this.schedule_enable && !this.mail_schedule))
      )
        return;
      this.busy_send = true;
      const key = this.resourceKey,
        epoch = this.request_epoch,
        shopId = this.shop.id,
        emailId = this.email.id;
      try {
        const { data } = await axios.post(
          send
            ? window.API.POST_SEND_EMAIL(shopId, emailId)
            : window.API.POST_CANCEL_EMAIL(shopId, emailId),
        );
        if (!this.isCurrentRequest(key, epoch) || !this.canWriteCurrent())
          return;
        if (data.error) {
          NotificationService.showErrorAlert(null, data.error_msg);
          return;
        }
        if (
          !data.email ||
          String(data.email.id) !== String(emailId) ||
          (data.email.shop_id != null &&
            String(data.email.shop_id) !== String(shopId))
        )
          return;
        this.$emit("update:email", this.MergeObjects(this.email, data.email));
        NotificationService.showSuccessAlert(
          null,
          this.$t("email_builder.workspace.updated"),
        );
      } catch (error) {
        if (this.isCurrentRequest(key, epoch) && this.canWriteCurrent())
          NotificationService.showLaravelError(error);
      } finally {
        if (this.isCurrentRequest(key, epoch)) this.busy_send = false;
      }
    },

    hasTracker(actions) {
      return actions && actions.some((item) => item.tracking);
    },
    moveDown(section) {
      if (!this.editMode || !this.canWriteCurrent()) return;
      const index = this.structure.sections.indexOf(section);
      if (index < 0 || index >= this.structure.sections.length - 1) return;
      this.structure.sections.splice(index, 1);

      this.structure.sections.splice(index + 1, 0, section);
    },
    moveUp(section) {
      if (!this.editMode || !this.canWriteCurrent()) return;
      const index = this.structure.sections.indexOf(section);
      if (index <= 0) return;
      this.structure.sections.splice(index, 1);

      this.structure.sections.splice(index - 1, 0, section);
    },

    showEdit(options) {
      if (!this.editMode || !this.canWriteCurrent()) return;
      this.$refs.section_editor.showEmailSectionEditor(options);
    },

    //---------------------------------------
    addSection(type, index) {
      if (!this.editMode || !this.canWriteCurrent()) return;

      let section = JSON.parse(JSON.stringify(EmailSectionStructures[type]));
      if (!this.structure.sections) this.structure.sections = [];
      //this.structure.sections.push(section)

      this.structure.sections.splice(index + 1, 0, section);
      this.$emit("update:structure", Object.assign({}, this.structure));
    },
    deleteSection(index) {
      if (!this.editMode || !this.canWriteCurrent()) return;
      this.structure.sections.splice(index, 1);
      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    addFooter() {
      if (!this.editMode || !this.canWriteCurrent()) return;

      this.structure.footer = { message: "" };

      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    removeFooter() {
      if (!this.editMode || !this.canWriteCurrent()) return;

      this.structure.footer = null;

      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    addAction(section) {
      if (!this.editMode || !this.canWriteCurrent()) return;

      if (!section.actions) section.actions = [];

      section.actions.push({
        xlarge: true,
        depressed: true,
        rounded: true,
        dark: true,
        text: "Click",
      });

      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    addNewItemToList(list, item) {
      if (!this.editMode || !this.canWriteCurrent()) return;

      list.push({ item });

      this.$emit("update:structure", Object.assign({}, this.structure));
    },
    removeItemToList(list, item) {
      //console.log("removeItemToList", item);
      if (!this.editMode || !this.canWriteCurrent()) return;
      const index = list.indexOf(item);
      if (index >= 0) {
        list.splice(index, 1);
        this.$emit("update:structure", Object.assign({}, this.structure));
      }
    },
    //----------------------------------------------------------------

    //----------------------------------------------------------------
    addHeader() {
      if (!this.editMode || !this.canWriteCurrent()) return;

      if (!this.structure.header) this.structure.header = {};

      this.$emit("update:structure", Object.assign({}, this.structure));
    },
    removeHeader() {
      if (!this.editMode || !this.canWriteCurrent()) return;

      this.structure.header = null;

      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    //----------------------------------------------------------------

    deleteProperty(section, key) {
      if (!this.editMode || !this.canWriteCurrent()) return;

      delete section[key];
      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    addProperty(section, key, val = {}) {
      if (!this.editMode || !this.canWriteCurrent()) return;

      section[key] = val;
      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    forceUpdateContent() {
      if (!this.editMode || !this.canWriteCurrent()) return;
      this.$emit("update:structure", Object.assign({}, this.structure));
    },
    //---------------------------------------

    limited_list(list, count = 16) {
      let n = 0;
      return list.filter((item) => {
        return n++ < count;
      });
    },

    downloadJson() {
      if (
        !this.email ||
        !this.readShopAccess(ShopPermissionRegions.MARKETING.code)
      )
        return;
      FileHelper.DownloadText(
        this.email.name + ".smail",
        JSON.stringify(this.structure, null, 4),
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.b-email-editor {
  .option-btn {
    position: absolute;
    right: 16px;
    opacity: 0.9;
    // margin-top: 12px;
    top: 36px !important;
    background-color: #fff;
    z-index: 10;
    border-radius: 50%;

    transition: all 0.3s ease-in-out;

    &:hover {
      transform: scale(1.5, 1.5);
    }

    &.loc2 {
      right: 64px;
    }

    &.left-loc-1 {
      right: unset;
      left: 16px;
    }

    &.left-loc-2 {
      right: unset;
      left: 64px;
    }

    &.left-loc-3 {
      right: unset;
      left: 112px;
    }

    @media only screen and (min-width: 900px) {
      right: calc(-16px - 36px);
      &.loc2 {
        right: calc(-64px - 36px);
      }
      &.left-loc-1 {
        left: calc(-16px - 36px);
      }
      &.left-loc-2 {
        left: calc(-64px - 36px);
      }
      &.left-loc-3 {
        left: calc(-112px - 36px);
      }
    }

    &:hover {
      opacity: 1;
    }
  }

  .section-label {
    position: absolute;
    left: 6px;
    top: 4px;
    text-transform: uppercase;
    min-width: 100px;
    text-align: center;
    @media only screen and (min-width: 900px) {
      left: -120px;
    }
  }

  .section-content {
    max-width: 570px;
    margin: auto;
    overflow: hidden;
  }

  .section-container-editable {
    min-height: 200px;
    transition: all 0.45s !important;
    z-index: 0;

    &:hover {
      box-shadow: 0px 10px 50px 0px rgba(0, 0, 0, 0.2);
      transition: all 0.35s !important;
      background-color: #fff !important;
      transform: translateY(-2px);
      z-index: 1;

      .actions-container {
        -webkit-animation-name: slideInUp;
        animation-name: slideInUp;
        pointer-events: unset;
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    .actions-container {
      position: absolute;
      pointer-events: none;
      transition: all 0.4s;
      bottom: 40px;
      opacity: 0;
      left: 6px;
      background-color: rgba(250, 250, 250, 0.94);
      padding: 8px;
      border-radius: 6px;
      border: solid #eee thin;
      box-shadow: 0px 10px 50px 0px rgba(0, 0, 0, 0.2) !important;
      transform: translate3d(0, 100%, 0);

      p {
        margin: 0;
        text-align: start;
        font-size: 0.8em;
        color: #aaa;
      }
    }
  }

  .inline-section {
    max-height: 36px;
    min-height: 36px;
    z-index: 20;

    position: absolute;
    left: 0;
    width: 100%;
    bottom: -18px;
    transition: all 0.4s;
    cursor: pointer;
    opacity: 0.8;
    padding-top: 36px;
    overflow: hidden;

    .hed {
      font-size: 14px;
      font-weight: bold;
      color: white;

      background-color: #00a89a;
      border-radius: 12px;
      padding: 4px 12px;

      i {
        vertical-align: bottom;
      }
    }

    .hed-line {
      background-color: #00a89a;
      height: 4px;
      width: 100%;
    }

    &:hover {
      max-height: 120px;
      opacity: 1;
      padding-top: 0px;
      background-color: #00a89a;

      .hed {
        opacity: 0;
      }
    }
  }

  .email-page {
    position: relative;
    border-radius: 16px;
  }

  .scale-container {
    transition: all 0.5s;
    position: relative;

    &.scale {
      transform: scale(0.5);
      transform-origin: top;
    }
  }

  .editable {
    min-height: 24px;
    font-family: var(--font-text), serif;
  }

  .subheading {
    margin-bottom: 20px !important;
    display: inline-block;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 2px;
    position: relative;
    min-height: 20px;
  }

  .subheading::after {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -10px;
    content: "";
    width: 100%;
    height: 2px;
    background-color: var(--color-1);
    background-image: linear-gradient(
      to left,
      var(--color-1) 0%,
      var(--color-2) 100%
    );
    margin: 0 auto;
  }

  .scale-container {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-family: var(--font-title), serif;
    }
  }
}
.b-email-editor {
  padding: 34px 32px 38px;
  position: relative;
  color: rgb(var(--v-theme-on-surface));
  &__content {
    max-width: 1040px;
    width: 100%;
    min-width: 0;
    margin: auto;
  }
  &__page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-block-end: 25px;
  }
  .sd-modern-title {
    align-items: flex-start;
    gap: 12px;
  }
  .sd-modern-title > .v-icon {
    margin-block-start: 5px;
  }
  .sd-modern-title-text {
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
    letter-spacing: 0;
    margin: 0;
  }
  .sd-modern-subtitle {
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
    margin: 5px 0 0;
    overflow-wrap: anywhere;
  }
  .sd-modern-button {
    font-size: 13px;
    line-height: 20px;
  }
  .sd-modern-eyebrow {
    font-size: 10px;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0.8px;
  }
  .sd-modern-status--plain {
    font-size: 11px;
    line-height: 18px;
    white-space: nowrap;
    padding-block-start: 4px;
  }
  &__layout {
    display: grid;
    grid-template-columns: 155px minmax(0, 1fr);
    gap: 25px;
    align-items: start;
  }
  &__nav {
    display: grid;
    gap: 6px;
    padding: 4px 2px;
  }
  &__nav .sd-modern-section-nav__item {
    font-size: 12px;
    line-height: 19px;
    padding: 12px;
    gap: 11px;
    min-height: 43px;
    text-align: start;
  }
  &__nav-help {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 19px 10px 0;
    margin: 0;
    font-size: 11px;
    line-height: 18px;
    color: var(--sd-modern-muted);
    > .v-icon {
      margin-block-start: 2px;
    }
  }
  &__workspace {
    min-width: 0;
  }
  &__panel.sd-modern-widget {
    padding: 27px;
    border-radius: 18px;
    font-size: 13px;
    line-height: 21px;
    min-width: 0;
  }
  .sd-modern-header {
    align-items: flex-start;
    flex-wrap: nowrap;
    gap: 16px;
    margin-block-end: 25px;
  }
  .sd-modern-header > div:first-child {
    min-width: 0;
  }
  .sd-modern-header > .sd-modern-actions {
    flex-shrink: 0;
  }
  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 25px 23px;
  }
  &__field-full {
    grid-column: 1/-1;
    min-width: 0;
  }
  &__fields.b-email-editor__send-fields {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
  &__sender :deep(.v-text-field__suffix) {
    align-self: stretch;
    align-items: center;
    padding-block: 28px 8px;
    font-size: 13px;
    line-height: 24px;
  }
  &__fields > :deep(.v-input),
  &__fields > :deep(.v-select) {
    min-width: 0;
  }
  &__fields :deep(.v-field__input),
  &__fields :deep(.v-field__field) {
    font-size: 13px;
    line-height: 20px;
  }
  &__fields :deep(.v-label) {
    font-size: 12px;
    line-height: 19px;
  }
  &__fields :deep(.v-messages) {
    font-size: 11px;
    line-height: 18px;
  }
  &__fields :deep(.v-input__details) {
    padding-inline: 0;
  }
  &__fields :deep(.u-smart-suggestion) {
    margin-block-start: 7px;
  }
  &__inactive {
    opacity: 0.6;
  }
  &__currency-field :deep(.-flag) {
    width: 18px;
    margin: 0 !important;
  }
  &__currency-field :deep(.imc) {
    width: 18px;
    min-width: 18px;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    flex-wrap: wrap;
    border-block-start: 1px solid var(--sd-modern-border);
    padding-block-start: 21px;
    margin-block-start: 27px;
    > span {
      font-size: 11px;
      line-height: 18px;
      color: var(--sd-modern-muted);
      flex: 1;
      min-width: 120px;
    }
    > div {
      flex: 1;
      min-width: 200px;
    }
  }
  &__readonly {
    margin-block-end: 18px;
    font-size: 12px;
    line-height: 20px;
    align-items: flex-start;
    p {
      margin: 0;
    }
  }
  &__audience-summary {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-block-end: 22px;
    strong {
      font-size: 30px;
      line-height: 40px;
      font-weight: 400;
      font-variant-numeric: tabular-nums;
    }
  }
  &__audience :deep(.b-customers-funnel-modern) {
    display: grid;
    grid-template-columns: minmax(0, 0.87fr) minmax(0, 1.2fr);
    gap: 25px;
  }
  &__audience :deep(.b-customers-funnel-modern__report) {
    grid-column: 1;
    grid-row: 1;
    padding: 0 23px 0 0;
    border: 0;
    border-inline-end: 1px solid var(--sd-modern-border);
    margin: 0;
    min-width: 0;
  }
  &__audience :deep(.b-customers-filter-design-modern) {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
  }
  &__audience :deep(.b-customers-funnel-modern__report .sd-modern-header) {
    flex-wrap: wrap;
    gap: 8px;
    margin-block-end: 18px;
  }
  &__audience :deep(.b-customers-funnel-modern__report .sd-modern-actions) {
    gap: 4px;
    flex-wrap: wrap;
  }
  &__audience :deep(.b-customers-funnel-modern__report .sd-modern-button) {
    font-size: 12px;
    line-height: 20px;
    padding: 6px 3px;
    min-height: 32px;
  }
  &__audience :deep(.b-customers-funnel-modern__step) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 9px;
    margin-block-end: 21px;
    padding: 0;
    border: 0;
  }
  &__audience :deep(.b-customers-funnel-modern__label) {
    grid-column: 1;
    grid-row: 1;
    font-size: 12px;
    line-height: 19px;
  }
  &__audience :deep(.b-customers-funnel-modern__count) {
    grid-column: 2;
    grid-row: 1;
    font-size: 12px;
    line-height: 19px;
  }
  &__audience :deep(.b-customers-funnel-modern__track) {
    grid-column: 1/-1;
    grid-row: 2;
    height: 6px;
    border-radius: 9px;
  }
  &__audience :deep(.b-customers-funnel-modern__track > span) {
    background: #8a75ce;
  }
  &__audience :deep(.b-customers-funnel-modern__drop) {
    grid-column: 2;
    grid-row: 3;
    margin: 0;
    font-size: 11px;
    line-height: 18px;
  }
  &__audience :deep(.b-customers-filter-design-modern__row) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 7px;
    padding: 11px 0;
  }
  &__audience :deep(.b-customers-filter-design-modern__number),
  &__audience :deep(.b-customers-filter-design-modern__handle) {
    display: none;
  }
  &__audience :deep(.b-customers-filter-design-modern__edit) {
    grid-column: 1;
    min-width: 0;
    padding: 0;
    text-align: start;
  }
  &__audience :deep(.b-customers-filter-design-modern__actions) {
    grid-column: 1/-1;
    justify-content: flex-end;
    gap: 7px;
  }
  &__audience
    :deep(.b-customers-filter-design-modern__actions .sd-modern-icon-button) {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
  }
  &__audience
    :deep(.b-customers-filter-design-modern__edit .b--customers-filter-item) {
    font-size: 12px;
    line-height: 19px;
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  &__audience :deep(.b-customers-filter-design-modern > .sd-modern-button) {
    background: transparent;
    color: rgb(var(--v-theme-primary));
    min-height: 32px;
    font-size: 12px;
    padding-inline: 0;
    box-shadow: none;
  }
  &__design .sd-modern-header {
    flex-wrap: wrap;
    margin-block-end: 16px;
  }
  &__design-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    border-block-start: 1px solid var(--sd-modern-border);
    padding-block: 10px;
    > span {
      font-size: 11px;
      line-height: 18px;
      color: var(--sd-modern-muted);
    }
  }
  &__design .sd-modern-button--inline {
    font-size: 12px;
    line-height: 20px;
    min-height: 32px;
  }
  &__design-tip {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    font-size: 11px;
    line-height: 18px;
    color: var(--sd-modern-muted);
    margin: 0 0 14px;
    > .v-icon {
      margin-block-start: 2px;
    }
  }
  .s-drop-zone {
    padding: 20px 15px;
    border: 1px dashed var(--sd-modern-border);
    overflow: visible;
  }
  .scale-container {
    width: 100%;
    font-size: 15px;
    line-height: 22.5px;
    min-width: 0;
  }
  .option-btn {
    position: absolute;
    inset-inline-end: 10px;
    inset-inline-start: auto;
    top: 10px !important;
    opacity: 1;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border-radius: 8px;
    transition: none;
    &:hover {
      transform: none;
    }
  }
  .section-container-editable {
    min-height: 0;
    transition: none !important;
    &:hover {
      box-shadow: none;
      background-color: transparent !important;
      transform: none;
      z-index: auto;
    }
  }
  &__block-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border-block-end: 1px solid var(--sd-modern-border);
    > span {
      font-size: 10px;
      font-weight: 400;
      line-height: 16px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: var(--sd-modern-muted);
    }
    > div {
      display: flex;
      align-items: center;
      gap: 7px;
    }
  }
  &__block-toolbar .sd-modern-icon-button {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
  }
  &__extra-actions {
    text-align: start;
    background: rgb(var(--v-theme-surface));
    padding: 5px 12px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__insert {
    padding: 7px 8px;
    background: rgb(var(--v-theme-surface));
    border-block: 1px dashed var(--sd-modern-border);
    text-align: center;
  }
  &__empty {
    display: grid;
    justify-items: center;
    gap: 9px;
    padding: 30px 14px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font-size: 13px;
    line-height: 21px;
    > span {
      font-size: 12px;
      color: var(--sd-modern-muted);
    }
    > div {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
  }
  &__toggles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
    padding-block-start: 17px;
    margin-block-start: 20px;
  }
  &__group {
    margin-block-start: 23px;
    padding-block-start: 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__group .sd-modern-title-text,
  &__group > h3 {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    margin: 0;
  }
  &__group > .sd-modern-subtitle {
    font-size: 12px;
    line-height: 19px;
    margin-block-start: 4px;
  }
  &__timing {
    margin-block-start: 16px;
  }
  &__timing :deep(> .rounded-card) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  &__timing :deep(> .rounded-card > .pp) {
    min-width: 0;
    border-block: 0 !important;
    padding: 16px 13px !important;
  }
  &__schedule-field {
    margin-block-start: 20px;
  }
  &__cost {
    margin-block-start: 25px;
  }
  &__cost :deep(.u--price) {
    font-size: 18px;
    font-weight: 400;
    line-height: 27px;
  }
  &__provider {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    border-block-end: 1px solid var(--sd-modern-border);
    padding-block-end: 20px;
    margin-block-end: 23px;
  }
  &__provider-copy {
    flex: 1;
    min-width: 100px;
  }
  &__provider .v-avatar,
  &__reviewer .v-avatar {
    flex: 0 0 32px;
    min-width: 32px;
    width: 32px;
    height: 32px;
    aspect-ratio: 1;
  }
  &__provider small {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__provider strong {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  &__provider p {
    font-size: 11px;
    line-height: 18px;
    margin: 0;
  }
  &__reviewer {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    margin-block: 18px;
    > .b-email-editor__reviewer-copy {
      flex: 1;
      min-width: 0;
      font-size: 12px;
      line-height: 19px;
      > span,
      > strong {
        display: block;
        font-weight: 400;
      }
      overflow-wrap: anywhere;
    }
    small {
      display: block;
      color: var(--sd-modern-muted);
      font-size: 11px;
      line-height: 18px;
      overflow-wrap: anywhere;
    }
  }
  &__section-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 17px 2px 0;
    > span {
      font-size: 11px;
      line-height: 18px;
      color: var(--sd-modern-muted);
      text-align: center;
    }
    .sd-modern-button {
      font-size: 12px;
      line-height: 20px;
      min-height: 32px;
    }
  }
  @media (max-width: 760px) {
    padding: 25px 20px 28px;
    &__layout {
      grid-template-columns: 1fr;
      gap: 17px;
    }
    &__nav {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    &__nav .sd-modern-section-nav__item {
      flex: 1;
      min-width: 100px;
      justify-content: center;
      white-space: normal;
      padding: 10px;
    }
    &__nav-help {
      display: none;
    }
    &__page-header {
      margin-block-end: 16px;
    }
    &__panel.sd-modern-widget {
      padding: 24px;
    }
  }
  @media (max-width: 510px) {
    padding: 22px 12px;
    &__page-header {
      flex-wrap: wrap;
      gap: 9px;
    }
    &__panel.sd-modern-widget {
      padding: 20px;
      border-radius: 15px;
    }
    &__fields,
    &__toggles {
      grid-template-columns: 1fr;
    }
    &__timing :deep(> .rounded-card) {
      grid-template-columns: minmax(0, 1fr);
    }
    &__reviewer {
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr);
      > .sd-modern-button {
        grid-column: 2;
        justify-self: start;
      }
    }
    &__audience :deep(.b-customers-funnel-modern) {
      grid-template-columns: 1fr;
    }
    &__audience :deep(.b-customers-funnel-modern__report) {
      grid-column: 1;
      grid-row: 1;
      border-inline-end: 0;
      padding-inline-end: 0;
      padding-block-end: 20px;
      border-block-end: 1px solid var(--sd-modern-border);
    }
    &__audience :deep(.b-customers-filter-design-modern) {
      grid-column: 1;
      grid-row: 2;
    }
    &__fields :deep(.v-field__input) {
      font-size: 16px;
    }
    .s-drop-zone {
      padding: 9px;
    }
    &__block-toolbar {
      padding: 9px 6px;
      gap: 6px;
    }
    &__block-toolbar > div {
      gap: 5px;
    }
    &__actions > .sd-modern-button {
      margin-inline-start: auto;
    }
    &__section-footer > span {
      font-size: 10px;
    }
  }
  @media (pointer: coarse) {
    &__nav .sd-modern-section-nav__item,
    &__design .sd-modern-button--inline,
    &__section-footer .sd-modern-button {
      min-height: 44px;
    }
    &__block-toolbar .sd-modern-icon-button,
    &__audience
      :deep(.b-customers-filter-design-modern__actions .sd-modern-icon-button) {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .scale-container {
      transition: none;
    }
  }
}
.b-email-editor-dialog.sd-modern-widget {
  padding: 24px;
  border-radius: 18px;
  font-size: 13px;
  line-height: 21px;
  .sd-modern-title-text {
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
  }
  .sd-modern-subtitle {
    font-size: 13px;
    line-height: 21px;
  }
  .sd-modern-header {
    align-items: flex-start;
  }
  .b-email-editor-dialog__steps {
    margin-block: 20px;
    padding-inline-start: 22px;
    li {
      margin-block: 13px;
    }
  }
}
</style>
