<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
  <v-chip
    :size="small ? 'small' : undefined"
    class="border"
    label
    title=""
    variant="text"
  >
    <v-avatar rounded start title="Connect OS | Bridge"
      ><img :src="getConnectIcon(connectOrders.connect_id)"
    /></v-avatar>

    <u-price
      v-if="connectOrders.price"
      :amount="connectOrders.price"
      :currency="connectOrders.currency"
      title="Cost"
    ></u-price>

    <!-- Cancel -->
    <v-icon
      v-if="connectOrders.cancel_at"
      :title="`Canceled at: ${getFromNowString(connectOrders.cancel_at)}`"
      class="ms-2"
      color="red"
      >cancel
    </v-icon>

    <!-- Confirm -->
    <span v-else-if="connectOrders.confirm_at">
      <v-icon class="ms-2">published_with_changes </v-icon>

      <v-tooltip
        activator="parent"
        content-class="text-start bg-black"
        location="bottom"
        max-width="320"
      >
        <div class="mb-1 d-flex align-center">
          <img
            :src="getConnectIcon(connectOrders.connect_id)"
            class="me-2"
            height="16"
            width="16"
          />
          <b>Confirmed Date</b>
        </div>

        {{ getFromNowString(connectOrders.confirm_at) }}
        <div class="small">
          {{ getLocalTimeString(connectOrders.confirm_at) }}
        </div>
      </v-tooltip>
    </span>

    <!-- Sync -->
    <span v-else-if="connectOrders.sync_at">
      <v-icon class="ms-2" color="#111">cloud_sync </v-icon>

      <v-tooltip
        activator="parent"
        color="#000"
        content-class="text-start bg-black"
        location="bottom"
        max-width="320"
      >
        <div class="mb-1 d-flex align-center">
          <img
            :src="getConnectIcon(connectOrders.connect_id)"
            class="me-2"
            height="16"
            width="16"
          />
          <b>Last Sync Date</b>
        </div>

        {{ getFromNowString(connectOrders.sync_at) }}
        <div class="small">{{ getLocalTimeString(connectOrders.sync_at) }}</div>
      </v-tooltip>
    </span>

    <v-icon v-else class="fa-spin fa-spin-reverse" title="Syncing..."
      >sync
    </v-icon>

    <!-- Error -->

    <span v-if="connectOrders.error">
      <v-icon class="ms-2" color="red">report </v-icon>
      <v-tooltip
        activator="parent"
        content-class="text-start bg-black"
        location="bottom"
        max-width="320"
      >
        <div class="mb-1 d-flex align-center">
          <img
            :src="getConnectIcon(connectOrders.connect_id)"
            class="me-2"
            height="16"
            width="16"
          />
          <b>Error</b>
        </div>

        {{ connectOrders.error }}
      </v-tooltip>
    </span>
  </v-chip>
</template>

<script>
export default {
  name: "ConnectOrderChip",
  props: {
    connectOrders: {
      required: true,
      type: Object,
    },
    small: Boolean,
  },
};
</script>

<style scoped></style>
