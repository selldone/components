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
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <v-badge
        v-if="basketItemReturns.length"
        bordered
        :color="getDotColorOfReturnRequests(basketItemReturns)"
        overlap
        dot
      >
        <v-btn v-on="on" tile icon
          ><img
            src="../../../assets/icons/return-box.svg"
            width="24"
            @click.stop
            @click="$emit('click:return')"
        /></v-btn>
      </v-badge>
    </template>
    <p class="font-weight-bold border-bottom border-white">Return items</p>

    <v-simple-table dense dark>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Reason</th>
            <th class="text-left">Count</th>
            <th class="text-left">State</th>
            <th class="text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="basket_item_return in basketItemReturns"
            :key="basket_item_return.item_id"
          >
            <td>{{ basket_item_return.reason }}</td>
            <td>{{ basket_item_return.count }}</td>
            <td>
              <v-icon
                :color="
                  getReturnRequestStateObject(basket_item_return.state).color
                "
                small
                >{{
                  getReturnRequestStateObject(basket_item_return.state).icon
                }}</v-icon
              >
              {{
                $t(getReturnRequestStateObject(basket_item_return.state).name)
              }}
            </td>
            <td>
              {{ getLocalTimeStringSmall(basket_item_return.created_at) }}
              <v-icon
                v-if="
                  basket_item_return.created_at !==
                  basket_item_return.updated_at
                "
                >refresh</v-icon
              >
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-tooltip>
</template>

<script>
import { ReturnItemStates } from "@core/enums/basket/ReturnItemStates";

export default {
  name: "ReturnRequestButtonBadge",
  props: {
    basketItemReturns: {
      require: true,
    },
  },
  methods: {
    getDotColorOfReturnRequests(basket_item_returns) {
      if (
        basket_item_returns.some(
          (item) => item.state === ReturnItemStates.Pending.code
        )
      )
        return "red";

      if (
        basket_item_returns.some(
          (item) => item.state === ReturnItemStates.Rejected.code
        )
      )
        return "amber";

      return "green";
    },
  },
};
</script>

<style scoped></style>
