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
  <div class="pb-16" v-bind="$attrs">
    <v-toolbar color="transparent" flat></v-toolbar>

    <!-- ██████████████████████████ Config ██████████████████████████ -->

    <div class="widget-box -large mb-5">
      <u-widget-header
        :title="$t('global.commons.general_config')"
        add-caption="how it works?"
        add-icon="support"
        add-text
        icon="tune"
        @click:add="show_guide = true"
      ></u-widget-header>
      <v-list-subheader
        >The campaign name is visible exclusively to administrators. Currency is
        utilized to determine the campaign fee and evaluate your campaign's
        overall performance.
      </v-list-subheader>
      <v-form ref="form" class="max-widget-width mx-auto" lazy-validation>
        <v-text-field
          id="mail_name"
          v-model="mail_name"
          :rules="[GlobalRules.required()]"
          hide-details
          label="* Campaign name"
          variant="underlined"
        >
        </v-text-field>
        <u-smart-suggestion
          :samples="$tm('suggestions.shop_email.name')"
          add-session
          @select="(v) => (mail_name = v)"
        ></u-smart-suggestion>

        <u-currency-input
          v-model="mail_currency"
          :active-currencies="shop.currencies"
          :disabled="!!email"
          :return-object="false"
          :title="$t('global.commons.currency')"
          class="mb-5"
          messages="* Not changeable after create!"
          variant="underlined"
        ></u-currency-input>

        <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ 🆑 Cluster ━━━━━━━━━━━━━━━━━━━━━━━━ -->
        <b-cluster-input
          v-model="cluster_id"
          :return-object="false"
          clearable
          icon="workspaces_filled"
          label="Cluster"
          messages="By associating this email with a cluster, you can easily manage it alongside other resources in a single location."
          no-home
          variant="underlined"
        ></b-cluster-input>
        <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
      </v-form>
    </div>

    <!-- ██████████████████████████ User ██████████████████████████ -->

    <div class="widget-box -large mb-5">
      <u-widget-header
        :title="$t('global.commons.filter')"
        icon="filter_alt"
      ></u-widget-header>
      <v-list-subheader
        >Improve results by sending tailored emails to specific audiences. Apply
        filters to refine your target audience here.
      </v-list-subheader>

      <b-customers-funnel
        v-model="filter"
        :height="300"
        :permanent-filters="[{ type: 'SUBSCRIBED', subscribed: true }]"
        :shop="shop"
        :width="500"
        class="mx-auto"
        vertical
        @update:count="(val) => (users_count = val)"
      ></b-customers-funnel>
    </div>

    <!-- ██████████████████████████ Design ██████████████████████████ -->

    <div class="email-page widget-box -large">
      <div class="py-3 text-uppercase d-flex align-center">
        <v-icon class="mx-1">arrow_drop_down</v-icon>
        <small>{{ $t("email_builder.design_section") }}</small>

        <v-spacer></v-spacer>

        <v-btn
          class="mx-1 tnt"
          variant="text"
          @click="track_mode = !track_mode"
        >
          <v-icon class="me-1"
            >{{ track_mode ? "architecture" : "ads_click" }}
          </v-icon>
          {{ track_mode ? "Edit mode" : "Show trackers" }}
        </v-btn>

        <v-btn
          class="mx-1 tnt"
          variant="flat"
          @click="showEdit(EmailOptionsHelper.GeneratePageOptions(structure))"
        >
          <v-icon class="me-1">{{ "tune" }}</v-icon>
          Page Settings
        </v-btn>

        <u-smart-menu :items="menu_items"></u-smart-menu>
      </div>

      <!-- ██████████████████████████ Email Editor ██████████████████████████ -->
      <div
        :class="{ 'on-drop': draged }"
        :style="{
          '--color-1': structure.color_1,
          '--color-2': structure.color_2,
          '--font-title': structure.font_title
            ? structure.font_title
            : 'Roboto',
          '--font-text': structure.font_text ? structure.font_text : 'Roboto',
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
          :class="{ scale: scale_down }"
          :style="{
            'max-height': max_h,
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
                class="option-btn"
                icon
                title="Edit email design preferences."
                variant="flat"
                @click="
                  showEdit(EmailOptionsHelper.GenerateHeaderOptions(structure))
                "
              >
                <v-icon>edit</v-icon>
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
                  @blur="(e) => innerUpdate(e, 'sub_title', structure.header)"
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

          <div class="text-center" style="min-height: 40vh">
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
              <v-chip
                v-if="editMode"
                class="section-label justify-center"
                color="#000"
                label
                size="x-small"
                variant="flat"
                >{{ section.type }}
              </v-chip>
              <span
                caption="Move Down"
                class="option-btn left-loc-1 sub-caption -hover"
              >
                <v-btn
                  v-if="editMode && index < structure.sections.length - 1"
                  icon
                  size="small"
                  variant="text"
                  @click="moveDown(section)"
                >
                  <v-icon>keyboard_arrow_down</v-icon>
                </v-btn>
              </span>
              <span
                caption="Move Up"
                class="option-btn left-loc-2 sub-caption -hover"
              >
                <v-btn
                  v-if="editMode && index > 0"
                  icon
                  size="small"
                  variant="text"
                  @click="moveUp(section)"
                >
                  <v-icon>keyboard_arrow_up</v-icon>
                </v-btn>
              </span>
              <span
                caption="Delete"
                class="option-btn left-loc-3 sub-caption -hover"
              >
                <v-btn
                  v-if="editMode"
                  color="red"
                  icon
                  size="small"
                  variant="text"
                  @click="deleteSection(index)"
                >
                  <v-icon>close</v-icon>
                </v-btn>
              </span>

              <div
                :style="{
                  'background-color': section.bg_color,
                  color: section.dark ? '#fff' : 'unset',
                }"
                class="section-content"
              >
                <!--  ---------------------- Section > Product ---------------------- -->
                <v-btn
                  v-if="editMode && section.type === 'product'"
                  class="option-btn"
                  icon
                  title="Edit product section."
                  variant="flat"
                  @click="
                    showEdit(EmailOptionsHelper.GenerateProductOptions(section))
                  "
                >
                  <v-icon>edit</v-icon>
                </v-btn>

                <v-container
                  v-if="section.type === 'product'"
                  :style="{ textAlign: section.align }"
                  class=""
                >
                  <v-row align="center" justify="center">
                    <v-col :order="section.reverse ? 1 : 2" cols="12" sm="6">
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

                    <v-col :order="section.reverse ? 2 : 1" cols="12" sm="6">
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
                <v-btn
                  v-if="editMode && section.type === 'image'"
                  class="option-btn"
                  icon
                  title="Edit image section."
                  variant="flat"
                  @click="
                    showEdit(EmailOptionsHelper.GenerateImageOptions(section))
                  "
                >
                  <v-icon>edit</v-icon>
                </v-btn>

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
                    :src="section.image ? section.image : image_placeholder"
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
                      (section.message_class ? section.message_class : '') +
                      (editMode ? ' editable' : '')
                    "
                    :contenteditable="editMode"
                    @blur="(e) => innerUpdate(e, 'message', section)"
                    v-html="section.message"
                  ></p>
                </div>

                <!--  ---------------------- Section > Two Columns ---------------------- -->
                <v-btn
                  v-if="editMode && section.type === 'two-columns'"
                  class="option-btn"
                  icon
                  title="Edit columns section."
                  variant="flat"
                  @click="
                    showEdit(
                      EmailOptionsHelper.GenerateTwoColumnsOptions(section),
                    )
                  "
                >
                  <v-icon>edit</v-icon>
                </v-btn>

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
                <v-btn
                  v-if="editMode && section.type === 'text'"
                  class="option-btn"
                  icon
                  title="Edit text section."
                  variant="flat"
                  @click="
                    showEdit(EmailOptionsHelper.GenerateTextOptions(section))
                  "
                >
                  <v-icon>edit</v-icon>
                </v-btn>

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
                  <div v-for="(action, index) in section.actions" :key="index">
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

              <div v-if="editMode" class="actions-container">
                <p>Add extra</p>
                <v-btn
                  v-if="editMode"
                  class="ma-2"
                  color="primary"
                  prepend-icon="add"
                  variant="flat"
                  @click="addAction(section)"
                >
                  Actions
                </v-btn>
              </div>

              <!--  ---------------------- Add > Inline Sections ---------------------- -->

              <div v-if="editMode" class="inline-section">
                <!-- ================= Add Sections ================= -->
                <div class="hed-line center-absolute"></div>
                <p class="hed center-absolute">
                  <v-icon >keyboard_arrow_down</v-icon>
                  Add
                </p>
                <div class="overflow-auto d-flex justify-center">
                  <v-btn
                    v-for="(sec_type, key) in EmailSectionStructures"
                    :key="key"
                    class="m-2"
                    color="#fff"
                    prepend-icon="add"
                    variant="outlined"
                    @click="addSection(key, index)"
                  >
                    {{ key }}
                  </v-btn>
                </div>
              </div>
            </div>

            <!--  ============== END SECTIONS ================ -->

            <!--  ---------------------- Add > Inline Sections (No section exist!) ---------------------- -->

            <v-sheet
              v-if="editMode && !structure.sections.length"
              color="#00a89a"
              dark
            >
              <!-- ================= Add Sections ================= -->
              <p class="hed">
                <v-icon>keyboard_arrow_down</v-icon>
                Add
              </p>
              <div class="overflow-auto d-flex justify-center">
                <v-btn
                  v-for="(sec_type, key) in EmailSectionStructures"
                  :key="key"
                  class="m-2"
                  size="large"
                  variant="outlined"
                  @click="addSection(key, 0)"
                >
                  <v-icon>add</v-icon>
                  {{ key }}
                </v-btn>
              </div>
            </v-sheet>

            <div style="min-height: 5vh" />

            <!-- =================================== FOOTER ================================== -->
            <v-expand-transition>
              <v-sheet v-if="structure.footer" class="position-relative" dark>
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
                          style="border-radius: 50%; vertical-align: bottom"
                          width="32"
                        />
                        {{ shop.title }}
                      </h2>

                      <p
                        v-if="!edit_description"
                        class="mt-2 animate-underline-editable"
                        @click="edit_description = true"
                      >
                        {{
                          structure.footer.description
                            ? structure.footer.description.substring(0, 128)
                            : shop.description.substring(0, 128)
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

      <!-- ██████████████████████████ Toolbar bottom ██████████████████████████ -->
      <div v-if="editMode" class="max-widget-width mx-auto mt-5">
        <u-smart-toggle
          v-model="has_header"
          class="my-3"
          false-gray
          false-icon="browser_not_supported"
          true-description="Show/hide top banner."
          true-icon="drag_handle"
          true-title="Header"
        >
        </u-smart-toggle>

        <u-smart-toggle
          v-model="has_footer"
          class="my-3"
          false-gray
          false-icon="browser_not_supported"
          true-description="Show/hide auto-generated footer."
          true-icon="call_to_action"
          true-title="Footer"
        >
        </u-smart-toggle>
      </div>

      <!-- ================ Save ================ -->

      <!-- ██████████████████████ Server Not Available Alert ██████████████████████ -->

      <v-alert
        v-if="email && (!service || !service.enable)"
        class="m-2"
        color="red"
        density="compact"
        type="warning"
        >{{ $t("email_builder.service_unavailable") }}
      </v-alert>

      <div class="widget-buttons mt-5">
        <v-btn
          :disabled="!can_edit"
          :loading="busy_save"
          color="primary"
          size="x-large"
          @click="saveEmail()"
        >
          <v-icon class="me-2">{{ email ? "save" : "add" }}</v-icon>
          {{ email ? $t("global.actions.save") : $t("global.actions.add") }}
        </v-btn>
      </div>
      <v-list-subheader v-if="schedule_enable && mail_schedule">
        <v-icon class="me-1">schedule_send</v-icon>
        Mail has been schedule for {{ getLocalTimeString(mail_schedule) }} ●
        <b class="ms-1">{{ getFromNowString(mail_schedule) }}</b
        >.
        <v-chip
          v-if="invalid_schedule"
          class="ma-1"
          closable
          color="red"
          variant="elevated"
          @click="
            mail_schedule = null;
            schedule_enable = false;
          "
          >Invalid date! Click to remove.
        </v-chip>
      </v-list-subheader>

      <template v-if="email">
        <div :data-content="$t('global.commons.or')" class="hr-text my-4"></div>
        <div class="widget-buttons">
          <v-btn
            append-icon="send"
            class="s--button-flex"
            color="primary"
            size="x-large"
            @click="dialog_send = true"
          >
            <div>
              {{ $t("global.actions.send") }}
              <div class="small">Set sender, subject, schedule and send.</div>
            </div>
          </v-btn>
        </div>
      </template>

      <slot></slot>
    </div>
  </div>

  <!-- ██████████████████████████ DIALOG : Edit ██████████████████████████ -->
  <b-email-marketing-editor-section
    v-if="editMode"
    ref="section_editor"
    :email="email"
    :loaded-fonts="loaded_fonts"
    :shop="shop"
  >
  </b-email-marketing-editor-section>

  <!-- ██████████████████████████ DIALOG : Load file ██████████████████████████ -->
  <v-dialog
    v-model="load_file"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title>
        <v-icon class="me-1">architecture</v-icon>
        Load template file
      </v-card-title>
      <v-card-text>
        <div class="widget-box mb-5">
          <u-widget-header
            icon="upload"
            title="Upload design file"
          ></u-widget-header>
          <v-list-subheader
            >You can export and import design files and use prev-designed
            emails.
          </v-list-subheader>
          <s-drop-zone
            extension=".smail"
            hint="Drag and drop your email template file here, or click on the input field at the top."
            icon="all_inbox"
            label="Click & select email file (.smail)"
            @select:file="
              (event) => {
                loadFileTemplate(event);
                load_file = false;
              }
            "
          ></s-drop-zone>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="load_file = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ███████████████████████ Dialog > Guide ███████████████████████ -->
  <v-dialog
    v-model="show_guide"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title>
        <v-icon class="me-1">support</v-icon>
        Guide
      </v-card-title>
      <v-card-text class="text-start">
        <v-container class="typo-body">
          <h2>Running an Email Campaign: A Step-by-Step Guide</h2>

          Follow these simple steps to create and execute a successful email
          campaign:
          <ol>
            <li>Create a new email campaign.</li>
            <li>Choose your target audience using the filter section.</li>
            <li>
              Design your email in the design section and set up tracking spots
              (optional).
            </li>
            <li>Input the sender's name and email address.</li>
            <li>Optionally schedule your send, and click <b>Send Now</b>.</li>
            <li>
              A confirmation link is sent to the shop owner. If you have manager
              access, you can approve this campaign in the
              <b>Dashboard tab</b>.
            </li>
            <li>
              Once approved, the email will be sent to the selected audience.
            </li>
          </ol>

          <h2 class="mt-5">Who can approve this campaign?</h2>

          <div class="d-flex align-center my-3">
            <v-avatar class="avatar-gradient -thin -officer me-3">
              <img :src="getUserAvatar(review_user_id)" />
            </v-avatar>
            <div v-if="review_user" class="flex-grow-1">
              <b class="d-block">{{ review_user?.name }}</b>
              <small class="d-block">{{ review_user?.email }}</small>
            </div>
            <v-btn
              :to="{ name: 'BPageShopSettingEmail' }"
              color="primary"
              variant="text"
            >
              <v-icon class="me-1" size="small">settings</v-icon>
              Edit reviewer
            </v-btn>
          </div>

          <h2 class="mt-5">
            Will re-running a campaign result in duplicate emails for previous
            recipients?
          </h2>
          <p>
            No, each recipient will only receive a single campaign email.
            However, when you re-run the campaign, new qualifying users will be
            sent emails.
          </p>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="show_guide = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ██████████████████████████ Dialog >  Send ██████████████████████████ -->

  <v-bottom-sheet
    v-if="email"
    v-model="dialog_send"
    content-class="rounded-t-xl"
    max-width="840"
    scrollable
    width="98vw"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title>
        <v-icon class="me-2" color="#111">send</v-icon>
        {{ $t("global.commons.send") }}

        <v-chip
          v-if="email?.sent"
          class="ms-2"
          color="green"
          label
          size="small"
          variant="flat"
        >
          <v-icon size="small" start>check_circle</v-icon>

          Sent
        </v-chip>
      </v-card-title>
      <v-card-text>
        <div
          :class="{ disabled: email?.sent }"
          class="max-widget-width mx-auto"
        >
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Custom mail service ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <div class="widget-box -large mb-5">
            <u-widget-header :title="$t('global.commons.from')" icon="person">
            </u-widget-header>
            <v-list-subheader
              >To send emails from your domain, configure a custom email
              provider by navigating to Settings > Emails tab.
            </v-list-subheader>
            <v-list-item v-if="service_provider" class="mb-5">
              <template v-slot:prepend>
                <v-avatar>
                  <v-img :src="service_provider.icon"></v-img>
                </v-avatar>
              </template>

              <v-list-item-title class="d-flex align-center">
                <b>{{ service_provider.title }}</b>

                <v-spacer></v-spacer>
                <v-chip
                  v-if="mailService.enable"
                  class="mx-1"
                  color="success"
                  label
                  size="small"
                  variant="flat"
                  >{{ $t("global.commons.enable") }}
                </v-chip>
                <v-chip
                  v-else
                  class="mx-1"
                  color="red"
                  label
                  size="small"
                  variant="flat"
                  >{{ $t("global.commons.disable") }}
                </v-chip>
              </v-list-item-title>

              <v-list-item-subtitle v-if="mailService.error" class="text-red">
                <v-icon class="me-1" color="red" size="small">report</v-icon>
                {{ mailService.error }} (<b>{{ mailService.errors }}</b
                >)

                <v-btn
                  :to="{ name: 'BPageShopSettingEmail' }"
                  class="mx-2 tnt"
                  color="primary"
                  size="small"
                  variant="text"
                >
                  <v-icon class="me-1" size="small">settings_suggest</v-icon>
                  Fix issue
                </v-btn>
              </v-list-item-subtitle>
            </v-list-item>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Sender Info ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <v-text-field
              v-model="mail_from"
              :hint="`You can use ...@${mail_host}`"
              :label="$t('global.commons.email_from')"
              :rules="[GlobalRules.counter(24), GlobalRules.required()]"
              :suffix="'@' + mail_host"
              counter="24"
              placeholder="no-reply"
              variant="underlined"
            ></v-text-field>

            <v-text-field
              v-model="mail_subject"
              :label="$t('global.commons.subject')"
              :rules="[GlobalRules.counter(120), GlobalRules.required()]"
              placeholder="Amazing title for your email.."
              variant="underlined"
            ></v-text-field>
            <u-smart-suggestion
              :samples="$tm('suggestions.shop_email.subject')"
              @select="(v) => (mail_subject = v)"
            ></u-smart-suggestion>
          </div>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Schedule ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <div class="widget-box -large mb-5">
            <u-widget-header
              :title="$t('global.commons.schedule')"
              icon="av_timer"
            >
            </u-widget-header>
            <v-list-subheader
              >You can either send this email immediately after admin approval
              or schedule it to be sent at a specific time.
            </v-list-subheader>

            <u-smart-switch
              v-model="schedule_enable"
              :color="schedule_enable ? '#C2185B' : undefined"
              :hint="$t('email_builder.schedule_switch')"
              :true-title="$t('global.commons.schedule')"
              class="my-3"
              false-description="This email will be sent immediately after confirmation by shop admin."
              false-icon="send"
              false-title="Instant send"
              true-description="The email will be sent after confirmation and at the specified time."
              true-icon="schedule_send"
            >
            </u-smart-switch>
            <v-expand-transition>
              <div v-if="schedule_enable">
                <u-date-input
                  v-model="mail_schedule"
                  :disabled="!schedule_enable"
                  :label="$t('global.commons.schedule')"
                  :min="new Date().toISOString()"
                  :placeholder="$t('email_builder.schedule_placeholder')"
                  class="pt-5"
                  clearable
                  color="#C2185B"
                  return-utc
                  style="min-width: 320px"
                  variant="underlined"
                ></u-date-input>
              </div>
            </v-expand-transition>
          </div>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Cost ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <div class="widget-box -large mb-5">
            <u-widget-header
              :title="$t('global.commons.cost')"
              icon="request_quote"
            >
            </u-widget-header>
            <v-list-subheader
              >We only charge you for emails sent through campaigns managed by
              Selldone, as part of our commitment to preventing spam and
              avoiding customer annoyance. Please ensure that your connected
              wallet has sufficient funds.
            </v-list-subheader>
            <u-text-value-dashed>
              <template v-slot:label>
                <v-icon class="me-1" color="#111">monetization_on</v-icon>
                <b> {{ $t("global.commons.total") }}</b>
              </template>
              <u-price
                v-if="service"
                :amount="cost"
                :currency="email.currency"
                dark
                style="color: #0bc034"
                x-large
              ></u-price>
            </u-text-value-dashed>
            <small class="d-block mb-5"
              >This will be the cost of sending emails to
              {{ users_count }} users.</small
            >
          </div>
        </div>

        <u-pods-panel>
          <u-pod-node icon="email" title="Email"></u-pod-node>

          <u-pod-wire forward></u-pod-wire>

          <u-pod-node
            :color="!is_accepted ? '#eee' : undefined"
            :icon="
              is_accepted
                ? 'check_circle'
                : is_rejected
                  ? 'cancel'
                  : 'hourglass_empty'
            "
            :icon-color="is_accepted ? 'green' : is_rejected ? 'red' : '#111'"
            :title="
              is_accepted
                ? 'Verified'
                : is_rejected
                  ? 'Rejected'
                  : 'Waiting verify'
            "
          >
          </u-pod-node>

          <u-pod-wire
            :color="!is_accepted ? '#eee' : undefined"
            :stop="!is_accepted"
            forward
          >
          </u-pod-wire>

          <template v-if="mail_schedule">
            <u-pod-node
              :color="!is_accepted || !email.in_que ? '#eee' : undefined"
              icon="watch_later"
              title="Schedule"
            >
            </u-pod-node>

            <u-pod-wire
              :color="
                !is_accepted || !email.in_que || is_before_schedule_time
                  ? '#eee'
                  : undefined
              "
              :stop="!is_accepted || !email.in_que || is_before_schedule_time"
              forward
            >
            </u-pod-wire>
          </template>

          <u-pod-node
            :color="
              !is_accepted || !email.in_que || is_before_schedule_time
                ? '#eee'
                : undefined
            "
            :image="service_provider?.icon"
            title="Provider"
          >
          </u-pod-node>

          <u-pod-wire
            :color="
              !is_accepted || !email.in_que || is_before_schedule_time
                ? '#eee'
                : undefined
            "
            :stop="!is_accepted || !email.in_que || is_before_schedule_time"
            forward
          >
          </u-pod-wire>

          <u-pod-node
            :color="!email.sent ? '#eee' : undefined"
            icon="groups"
            title="User"
          >
          </u-pod-node>
        </u-pods-panel>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Actions ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-list-subheader v-if="email.sent">
          <v-icon class="me-1">warning_amber</v-icon>
          The email has already been sent, and therefore, it cannot be edited
          any further. Each email campaign can only be sent to users once.
        </v-list-subheader>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_send = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            v-if="email"
            :class="{ disabled: email.sent }"
            :color="
              !email.sent && !email.in_que
                ? mail_schedule
                  ? '#C2185B'
                  : 'primary'
                : '#111'
            "
            :loading="busy_send"
            :variant="
              !email.in_que
                ? 'elevated'
                : email.in_que && !email.sent
                  ? 'outlined'
                  : email.sent
                    ? 'text'
                    : undefined
            "
            size="x-large"
            @click="SaveAndSendMail(!email.in_que)"
          >
            {{
              email.sent
                ? $t("global.commons.done")
                : !email.in_que
                  ? mail_schedule
                    ? $t("global.actions.schedule")
                    : $t("global.actions.send_now")
                  : $t("global.actions.cancel")
            }}
            <v-icon class="ms-2"
              >{{
                email.sent
                  ? "check"
                  : !email.in_que
                    ? mail_schedule
                      ? "schedule_send"
                      : "send"
                    : "cancel_schedule_send"
              }}
            </v-icon>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import EmailSectionStructures from "./section/structure/EmailSectionStructures";
import BCustomersFunnel from "../../customer/funnel/BCustomersFunnel.vue";
import BEmailMarketingTrackSpot from "../../email-marketing/track-spot/BEmailMarketingTrackSpot.vue";
import UDateInput from "../../../ui/date/input/UDateInput.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import BEmailMarketingEditorButton from "./button/BEmailMarketingEditorButton.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import SDropZone from "../../../ui/uploader/SDropZone.vue";
import UTextValueDashed from "../../../ui/text/value-dashed/UTextValueDashed.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import { EmailProviders } from "@selldone/core-js/enums/email/EmailProviders";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import UPodsPanel from "../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../ui/pod/wire/UPodWire.vue";
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import USmartMenu from "../../../ui/smart/menu/USmartMenu.vue";
import { InlineEditorMixin } from "../../../mixin/InlineEditorMixin";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";
import BEmailMarketingEditorSection from "../../email-marketing/editor/section/BEmailMarketingEditorSection.vue";
import { EmailOptionsHelper } from "./section/options/EmailOptionsHelper.ts";

var WebFont = require("webfontloader");
export default {
  name: "BEmailMarketingEditor",
  mixins: [InlineEditorMixin],

  components: {
    BEmailMarketingEditorSection,
    USmartMenu,
    BClusterInput,
    UPodWire,
    UPodNode,
    UPodsPanel,
    USmartSuggestion,
    USmartToggle,
    USmartSwitch,
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
      tab: "design",

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
      users_count: 0,

      track_mode: false,

      //-----------------------
      show_guide: false,
    };
  },
  computed: {
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
      if (this.can_edit) {
        out.push({
          title: "Import Email Template",
          subtitle:
            "Select the .smail file, then import and load the email template.",

          click: this.showLoadFile,
          icon: "folder_open",
        });
      }

      if (this.email) {
        out.push(
          ...[
            {
              title: "Export Email Template",
              subtitle: "Download this email design as a template.",
              click: this.downloadJson,
              icon: "download",
            },
            {
              title: "Export Email HTML",

              subtitle: "Download the HTML renderer of this email.",
              click: this.downloadHtml,
              icon: "html",
            },

            {
              title: "Render Output",

              subtitle: "View the HTML version of this email.",
              href: window.API.GET_EMAIL_RENDER(this.shop.id, this.email.id),
              target: "_blank",
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
    scale_down() {
      return this.track_mode;
    },

    can_edit() {
      return !this.email || !this.email.sent;
    },

    cost() {
      if (!this.service) return 0;
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
    scale_down(scale_down) {
      let height = this.$refs.scale_container.clientHeight;
      // console.log('---------height----------',height)
      if (scale_down) {
        this.max_h = height / 2 + "px";
      } else {
        this.max_h = "unset";
      }
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

  methods: {
    downloadHtml() {
      this.busy_html = true;
      axios
        .get(window.API.GET_EMAIL_RENDER(this.shop.id, this.email.id))
        .then(({ data }) => {
          if (!data.error)
            this.downloadText(
              this.email.name + ".html",
              data,
              "data:html/plain;charset=utf-8,",
            );
          else this.showErrorAlert(null, data.error_msg);
        })
        .catch((err) => this.showErrorAlert(null, err))

        .finally(() => {
          this.busy_html = false;
        });
    },
    showLoadFile() {
      this.load_file = true;
    },
    loadFileTemplate(event) {
      if (!event) return;
      this.loadFile(event)
        .then((json) => {
          //console.log("---Load Json---", json);
          this.$emit("update:structure", json);
        })
        .catch((err) => this.showErrorAlert(null, err));
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

    validate() {
      this.$refs.form.validate();
      if (!this.mail_name) {
        ScrollHelper.scrollToElement("#mail_name", 100, "smooth");

        return false;
      }
      return true;
    },

    saveEmail(callback = null) {
      if (!this.validate()) return;

      this.busy_save = true;

      const pack = {
        currency: this.mail_currency,
        name: this.mail_name,
        schedule_at: this.mail_schedule,
        structure: this.structure,
        filter: this.filter,
        subject: this.mail_subject,
        from: this.mail_from,
        cluster_id: this.cluster_id,
      };

      let promise = null;
      if (this.email) {
        promise = axios.put(
          window.API.PUT_UPDATE_EMAIL(this.shop.id, this.email.id),
          pack,
        );
      } else {
        promise = axios.post(window.API.POST_CREATE_EMAIL(this.shop.id), pack);
      }
      promise
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(null, "Email saved.");

            if (callback) callback();

            // Go to mail edit page:
            if (!this.email) {
              this.$router.push({
                name: "BPageEmailMarketingEdit",
                params: { email_id: data.email.id },
              });
              return;
            }

            this.$emit(
              "update:email",
              this.MergeObjects(this.email, data.email),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
    SaveAndSendMail(send) {
      if (send)
        // Force save if send clicked!
        this.saveEmail(() => {
          this.sendMail(send);
        });
      else {
        this.sendMail(send);
      }
    },

    sendMail(send) {
      this.busy_send = false;
      let promise = null;
      if (send) {
        promise = axios.post(
          window.API.POST_SEND_EMAIL(this.shop.id, this.email.id),
        );
      } else {
        promise = axios.post(
          window.API.POST_CANCEL_EMAIL(this.shop.id, this.email.id),
        );
      }
      promise
        .then(({ data }) => {
          if (!data.error) {
            // console.log(Object.assign({}, this.email, data.email));

            this.$emit(
              "update:email",
              this.MergeObjects(this.email, data.email),
            );

            this.showSuccessAlert(null, "Email updated.");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_send = false;
        });
    },

    hasTracker(actions) {
      return actions && actions.some((item) => item.tracking);
    },
    moveDown(section) {
      const index = this.structure.sections.indexOf(section);
      this.structure.sections.splice(index, 1);

      this.structure.sections.splice(index + 1, 0, section);
    },
    moveUp(section) {
      const index = this.structure.sections.indexOf(section);
      this.structure.sections.splice(index, 1);

      this.structure.sections.splice(index - 1, 0, section);
    },

    showEdit(options) {
      if (!this.editMode) return;
      this.$refs.section_editor.showEmailSectionEditor(options);
    },

    //---------------------------------------
    addSection(type, index) {
      if (!this.editMode) return;

      let section = JSON.parse(JSON.stringify(EmailSectionStructures[type]));
      if (!this.structure.sections) this.structure.sections = [];
      //this.structure.sections.push(section)

      this.structure.sections.splice(index + 1, 0, section);
      this.$emit("update:structure", Object.assign({}, this.structure));
    },
    deleteSection(index) {
      if (!this.editMode) return;
      this.structure.sections.splice(index, 1);
      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    addFooter() {
      if (!this.editMode) return;

      this.structure.footer = { message: "" };

      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    removeFooter() {
      if (!this.editMode) return;

      this.structure.footer = null;

      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    addAction(section) {
      if (!this.editMode) return;

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
      if (!this.editMode) return;

      list.push({ item });

      this.$emit("update:structure", Object.assign({}, this.structure));
    },
    removeItemToList(list, item) {
      //console.log("removeItemToList", item);
      if (!this.editMode) return;
      const index = list.indexOf(item);
      if (index >= 0) {
        list.splice(index, 1);
        this.$emit("update:structure", Object.assign({}, this.structure));
      }
    },
    //----------------------------------------------------------------

    //----------------------------------------------------------------
    addHeader() {
      if (!this.editMode) return;

      if (!this.structure.header) this.structure.header = {};

      this.$emit("update:structure", Object.assign({}, this.structure));
    },
    removeHeader() {
      if (!this.editMode) return;

      this.structure.header = null;

      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    //----------------------------------------------------------------

    deleteProperty(section, key) {
      if (!this.editMode) return;

      delete section[key];
      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    addProperty(section, key, val = {}) {
      if (!this.editMode) return;

      section[key] = val;
      this.$emit("update:structure", Object.assign({}, this.structure));
    },

    forceUpdateContent() {
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
      this.downloadText(
        this.email.name + ".smail",
        JSON.stringify(this.structure, null, 4),
      );
    },
  },
};
</script>

<style lang="scss" scoped>
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
</style>
