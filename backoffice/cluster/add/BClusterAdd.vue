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
  <v-card class="text-start">
    <v-card-title class="d-flex align-center">
      <b-cluster-folder
        v-if="cluster"
        :cluster="cluster"
        class="me-2"
        icon-only
        small
      ></b-cluster-folder>
      <v-icon v-else class="me-2">workspaces_filled</v-icon>
      {{ cluster ? "Edit Cluster" : "Add Cluster" }}
    </v-card-title>

    <v-card-text>
      <!-- ███████████████████████████ Setting ███████████████████████████ -->

      <div class="widget-box mb-5">
        <s-widget-header icon="tune" title="General Config"></s-widget-header>
        <v-list-subheader
          >Configure the cluster's name, description, and image
          here.</v-list-subheader
        >

        <v-text-field
          v-model="name"
          :counter="128"
          label="Name*"
          messages=" "
          placeholder="Enter a name, e.g. Winter Sales, Workshop Materials,..."
          variant="underlined"
        >
          <template v-slot:message>
            <u-smart-suggestion
              v-if="!cluster?.id"
              :samples="$tm('suggestions.cluster.name')"
              @select="(v) => (name = v)"
            >
            </u-smart-suggestion>
          </template>
        </v-text-field>

        <v-textarea
          v-model="description"
          auto-grow
          class="m-2"
          label="Description"
          placeholder="Write a short description..."
          rows="2"
          variant="underlined"
        >
        </v-textarea>

        <u-color-selector
          v-model="color"
          nullable
          title="Color"
        ></u-color-selector>

        <s-widget-header icon="folder" title="Parent"></s-widget-header>
        <v-list-subheader>
          You can achieve a more organized arrangement by establishing a
          hierarchy of clusters, designating a parent for each cluster.
        </v-list-subheader>

        <!-- Parent folder -->
        <b-cluster-input
          v-model="parent_id"
          class="m-2 mb-5"
          clearable
          label="Parent Cluster"
          placeholder="Select a parent... (optional)"
          variant="underlined"
        >
        </b-cluster-input>

        <s-widget-header icon="image" title="Image"></s-widget-header>
        <v-list-subheader>
          Optionally, assign an image to the cluster for easier identification.
        </v-list-subheader>
        <!-- Image -->
        <s-image-uploader
          v-if="cluster?.id"
          :image="getShopImagePath(icon)"
          :server="
            window.API.POST_SHOP_CLUSTER_UPLOAD_ICON(shop.id, cluster.id)
          "
          auto-compact
          class="m-2"
          label="Cluster Icon"
          max-file-size="2MB"
          @new-path="handleProcessFile"
        >
        </s-image-uploader>

        <v-file-input
          v-else
          v-model="selected_file"
          accept="image/*"
          class="m-2 mt-5"
          color="primary"
          label="Cluster Icon"
          placeholder="Select an image... (optional)"
          prepend-icon="attach_file"
          variant="underlined"
        />
      </div>

      <!-- ███████████████████████████ Critical ███████████████████████████ -->

      <div v-if="cluster" class="widget-box mb-5">
        <s-widget-header
          :title="$t('global.commons.critical_zone')"
          icon="warning_amber"
        >
        </s-widget-header>
        <v-list-subheader>
          Removing a cluster will not remove its resources.
        </v-list-subheader>

        <u-smart-verify
          v-model="accept_delete"
          color="red"
          false-gray
          true-title="I want to remove this cluster."
        ></u-smart-verify>

        <div class="widget-buttons">
          <v-btn
            :class="{ disabled: !accept_delete }"
            :loading="busy_delete"
            color="red"
            size="x-large"
            variant="text"
            @click="deleteClusterDialog()"
          >
            <v-icon class="me-1">delete</v-icon>
            Remove Cluster
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <v-card-actions>
      <div class="widget-buttons">
        <v-btn color="default" size="x-large" variant="text" @click="back()">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="cluster"
          :class="{ disabled: !name }"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editCluster()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else
          :class="{ disabled: !name }"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addCluster()"
        >
          <v-icon start>add</v-icon>

          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import SImageUploader from "../../../ui/uploader/SImageUploader.vue";
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import UColorSelector from "../../../ui/color/selector/UColorSelector.vue";
import BClusterFolder from "../../cluster/folder/BClusterFolder.vue";

export default {
  name: "BClusterAdd",
  components: {
    BClusterFolder,
    UColorSelector,
    USmartSuggestion,
    SImageUploader,
    BClusterInput,
    USmartVerify,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    cluster: {
      required: false,
      type: Object,
    },
  },

  data: () => ({
    tab: "setting",

    profile_pic: [],

    title: "",

    name: "",
    color: null,

    icon: null,

    description: "",

    star: true,

    parent_id: null,

    busy: false,
    busy_delete: false,

    selected_file: [],
    edit_name: false,

    accept_delete: false,

    //---------------------
    page: null,
    busy_save: null,
    augment: null,
    changed: false,

    busy_load: false,
  }),
  computed: {},
  watch: {
    cluster() {
      this.assignData();
    },
  },
  created() {
    this.assignData();
  },
  mounted() {},

  methods: {
    addCluster() {
      this.busy = true;

      let formData = new FormData();
      if (this.selected_file?.length)
        formData.append("photo", this.selected_file[0]);
      if (this.name) formData.append("name", this.name);
      if (this.description) formData.append("description", this.description);
      if (this.parent_id) formData.append("parent_id", this.parent_id);
      if (this.color) formData.append("color", this.color);

      axios
        .post(
          window.API.POST_SHOP_CLUSTERS_ADD(this.shop.id),

          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              "New custer has been created successfully.",
            );
            this.$emit("add", data.cluster);
            this.back();
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    editCluster() {
      this.busy = true;

      axios
        .put(window.API.PUT_SHOP_CLUSTERS_EDIT(this.shop.id, this.cluster.id), {
          name: this.name,
          description: this.description,
          color: this.color,
          parent_id: this.parent_id,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              "The cluster has been updated successfully.",
            );
            this.$emit("edit", data.cluster);
            this.back();
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    deleteClusterDialog() {
      this.openDangerAlert(
        "Delete Cluster",
        "Are you sure to delete this cluster?",
        "Yes, Delete Now",
        () => {
          this.deleteCluster(this.cluster);
        },
      );
    },

    deleteCluster(cluster) {
      this.busy_delete = true;
      axios
        .delete(window.API.DELETE_SHOP_CLUSTER(this.shop.id, cluster.id))
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              "The cluster has been removed successfully!",
            );
            this.$emit("delete", cluster.id);
            this.back();
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },

    back() {
      this.$emit("back");
    },

    handleProcessFile(path) {
      this.icon = path;
      this.cluster.icon = path;
    },

    assignData() {
      this.resetToDefault(); // 🞇 Reset to default

      if (this.cluster) {
        this.name = this.cluster.name;
        this.description = this.cluster.description;
        this.color = this.cluster.color;
        this.parent_id = this.cluster.parent_id;
        this.icon = this.cluster.icon;
      }
    },
  },
};
</script>

<style scoped></style>
