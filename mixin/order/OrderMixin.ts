/*
 * Copyright (c) 2023-2024. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

//―――――――――――――――――――――― Event Bus ――――――――――――――――――――

import { Basket, BasketItemReturn } from "@selldone/core-js/models";

const OrderMixin = {
  methods: {
    //―――――――――――――――――――――― Status ――――――――――――――――――――

    getStatusString(status: string) {
      if (!status) return "";
      if (status === "Unpaid") return this.$t("global.status.unpaid");
      else if (status === "Paid" || status === "Payed")
        return this.$t("global.status.paid");
      else if (status === "Canceled") return this.$t("global.status.canceled");
      else if (status === "Completed")
        return this.$t("global.status.completed");
      else if (status === "Reserved") return this.$t("global.status.reserved");
      else if (status === "COD") return this.$t("global.status.COD");
      else if (status === "Sold") return this.$t("global.status.sold");
      else if (status === "Open") return this.$t("global.status.open");
      else if (status === "Cancel") return this.$t("global.status.cancel");
      else if (
        status.toLowerCase() === "accept" ||
        status.toLowerCase() === "accepted"
      )
        return this.$t("global.status.accept");
      else if (
        status.toLowerCase() === "reject" ||
        status.toLowerCase() === "rejected"
      )
        return this.$t("global.status.reject");
      else if (status.toLowerCase() === "pending")
        return this.$t("global.status.pending");

      return status;
    },
    getStatusColor(status: string) {
      if (!status) return "#444";
      if (status === "Unpaid") return "#FFA000";
      else if (status === "Paid" || status === "Payed") return "green";
      else if (status === "Canceled") return "#D32F2F";
      else if (status === "Completed") return "#00796B";
      else if (status === "Reserved") return "#FFA000";
      else if (status === "COD") return "#1976D2";
      else if (status === "Sold") return "#00796B";
      else if (status === "Open") return "#1976D2";
      else if (status === "Cancel") return "#D32F2F";

      return "#111";
    },

    getStatusIcon(status: string) {
      if (!status) return "";
      if (status === "Unpaid") return "fa:fas fa-question ";
      else if (status === "Paid" || status === "Payed")
        return "fa:fas fa-check ";
      else if (status === "Canceled") return "fa:fas fa-times ";
      else if (status === "Completed") return "fa:fas fa-check-double ";
      else if (status === "Reserved") return "fa:fas fa-hourglass-start ";
      else if (status === "COD") return "fa:fas fa-hand-holding-usd";
    },

    getDeliveryStateString(
      state: keyof typeof Basket.PhysicalOrderStates | null,
    ) {
      if (!state) return "";
      return this.$t(Basket.PhysicalOrderStates[state].name);
    },

    getDeliveryStateIcon(state: string | null) {
      if (!state) return "";
      // @ts-ignore
      return Basket.PhysicalOrderStates[state].icon;
    },

    //―――――――――――――――――――――― Basket > Return Order ――――――――――――――――――――

    getReturnRequestStateObject(state: keyof typeof BasketItemReturn.States) {
      const out = BasketItemReturn.States[state];
      return out ? out : {};
    },
  },
};

export default OrderMixin;
