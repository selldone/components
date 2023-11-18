<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ List > Return Requests ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

  <div>
    <div
      v-for="item in itemsHasReturnRequest"
      :key="item.id"
      class="return-request-frame"
      :class="{ 'selected-item': isSelectedBasketItemReturn(item) }"
    >
      <div class="float-end small p-2 not-selectable text-center">
        <h1>RR-{{ item.return_request.id }}</h1>

        <i class="fas fa-exchange-alt" />
        {{ $t("global.basket_return_request_view.title") }}

        <i
          v-if="isSelectedBasketItemReturn(item)"
          class="fas fa-circle text-success mx-1"
        />
      </div>
      <div class="frame-container">
        <div class="title-bar">
          <circle-image
            :size="48"
            :src="getProductImage(item.product_id)"
            class="image"
          />
          <b class="m-0 pt-1"
            >{{ item.product.title }}

            <i v-if="item.product.original" class="fas fa-certificate" />
            <i v-if="item.product.warranty" class="fas fa-shield-alt mx-2" />
          </b>
          <p class="small text-muted m-0">
            {{ item.product.title_en }}
          </p>
        </div>
        <variant-item-view-micro
          v-if="item.variant"
          class="variant"
          :product-variant="item.variant"
        />

        <s-value-dashed>
          <template v-slot:label>
            {{ $t("global.basket_return_request_view.delivery_date") }}
          </template>
          {{ getLocalTimeString(basket.delivery_at) }}
        </s-value-dashed>

        <s-value-dashed>
          <template v-slot:label>
            {{ $t("global.basket_return_request_view.return_date") }}
          </template>

          {{ getLocalTimeString(item.return_request.created_at) }}
          <span
            class="font-weight-bold ms-4"
            title="The time between receiving and returning the order by customer."
            ><i class="fas fa-history" />
            {{
              getFromOtherTimeString(
                item.return_request.created_at,
                basket.delivery_at
              )
            }}</span
          >
        </s-value-dashed>

        <s-value-dashed>
          <template v-slot:label>
            {{ $t("global.basket_return_request_view.items_count") }}
          </template>
          <b> {{ item.return_request.count }}</b>
          {{ $t("global.basket_return_request_view.items_count_unit") }}
        </s-value-dashed>

        <s-value-dashed>
          <template v-slot:label>
            {{ $t("global.basket_return_request_view.reason") }}
          </template>
          <b>
            {{
              $t(
                getReturnBasketItemReasonObject(item.return_request.reason)
                  .title
              )
            }}
          </b>
        </s-value-dashed>

        <s-value-dashed>
          <template v-slot:label>
            {{ $t("global.basket_return_request_view.description") }}
          </template>
          <b> {{ item.return_request.note }}</b>
        </s-value-dashed>

        <s-value-dashed>
          <template v-slot:label>
            {{ $t("global.basket_return_request_view.status") }}
          </template>
          <b class="state-badge ms-2">
            {{
              $t(getReturnRequestStateObject(item.return_request.state).name)
            }}
            <v-icon
              class="me-2"
              small
              :color="
                getReturnRequestStateObject(item.return_request.state).color
              "
              >{{ getReturnRequestStateObject(item.return_request.state).icon }}
            </v-icon>
          </b>
        </s-value-dashed>
      </div>

      <div
        class="d-flex justify-space-around align-items-center text-center attachment-container"
      >
        <div>
          <a
            :href="getImagePath(item.return_request)"
            target="_blank"
            :class="{ disabled: !getImagePath(item.return_request) }"
          >
            <circle-image
              v-if="getImagePath(item.return_request)"
              class="m-auto"
              :src="getImagePath(item.return_request)"
              :size="48"
            />
            <v-img
              v-else
              class="m-auto"
              :src="require('@/Components/assets/icons/camera.svg')"
              :width="48"
              :height="48"
            />

            <p class="m-2">
              {{
                getImagePath(item.return_request)
                  ? $t("global.basket_return_request_view.download_image")
                  : $t("global.not_exist")
              }}
            </p>
          </a>
        </div>

        <div>
          <a
            :href="getVideoPath(item.return_request)"
            target="_blank"
            :class="{ disabled: !getVideoPath(item.return_request) }"
          >
            <v-img
              class="m-auto"
              :src="require('@/Components/assets/icons/film.svg')"
              :width="48"
              :height="48"
            />
            <p class="m-2">
              {{
                getVideoPath(item.return_request)
                  ? $t("global.basket_return_request_view.download_film")
                  : $t("global.not_exist")
              }}
            </p>
          </a>
        </div>
        <div>
          <a
            :href="getVoicePath(item.return_request)"
            target="_blank"
            :class="{ disabled: !getVoicePath(item.return_request) }"
          >
            <v-img
              class="m-auto"
              :src="require('@/Components/assets/icons/voice.svg')"
              :width="48"
              :height="48"
            />
            <p class="m-2">
              {{
                getVoicePath(item.return_request)
                  ? $t("global.basket_return_request_view.download_voice")
                  : $t("global.not_exist")
              }}
            </p>
          </a>
        </div>
      </div>

      <div v-if="isAdmin || isRole" class="admin">
        <div class="widget-buttons">
          <v-btn
            depressed
            color="#388E3C"
            dark
            x-large
            @click="updateReturnState(item, 'Accepted')"
            :class="{ disabled: item.return_request.state === 'Accepted' }"
            :loading="busy_item === 'Accepted' + item.id"
          >
            <v-icon class="me-1">check</v-icon>
            {{ $t("global.basket_return_request_view.accept_by_admin_action") }}
          </v-btn>

          <v-btn
            depressed
            color="#D32F2F"
            dark
            x-large
            @click="updateReturnState(item, 'Rejected')"
            :class="{ disabled: item.return_request.state === 'Rejected' }"
            :loading="busy_item === 'Rejected' + item.id"
          >
            <v-icon class="me-1">close</v-icon>
            {{ $t("global.basket_return_request_view.reject_by_admin_action") }}
          </v-btn>
        </div>

        <p class="text-start mt-3">
          <i class="fas fa-exclamation-triangle ml-1" />
          {{ $t("global.basket_return_request_view.message_for_admin") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ReturnItemStates } from "../../../../core/enums/basket/ReturnItemStates";
import { ReturnOrderReason } from "../../../../core/enums/basket/ReturnOrderReason";
import CircleImage from "@components/ui/image/CircleImage.vue";
import VariantItemViewMicro from "@components/product/variant/VariantItemViewMicro.vue";
import SValueDashed from "@components/ui/text/SValueDashed.vue";

export default {
  name: "BasketReturnItemsRequestView",
  components: {
    SValueDashed,
    VariantItemViewMicro,
    CircleImage,
  },

  props: {
    basket: {
      required: true,
      type: Object,
    },

    isAdmin: {
      required: false,
      type: Boolean,
      default: false,
    },

    // ----- Role -----
    isRole: {
      required: false,
      type: Boolean,
      default: false,
    },
    role: {},
  },

  data: function () {
    return {
      busy_item: null,
    };
  },
  computed: {
    itemsHasReturnRequest() {
      if (!this.basket || !this.basket.items) return null;
      return this.basket.items.filter((item) => {
        return !!item.return_request;
      });
    },
  },

  watch: {},
  created() {},

  methods: {
    isSelectedBasketItemReturn(item) {
      return Number(this.$route.query.return_id) === item.return_request.id;
    },

    getReturnRequestStateObject(state) {
      let out = ReturnItemStates[state];
      return out ? out : {};
    },

    getReturnBasketItemReasonObject(code) {
      let out = ReturnOrderReason.physical.find((item) => item.value === code);
      return out ? out : {};
    },

    getImagePath(return_request) {
      if (return_request && return_request.image)
        return this.getShopFileTempPath(return_request.image);
      return null;
    },

    getVideoPath(return_request) {
      if (return_request && return_request.video)
        return this.getShopFileTempPath(return_request.video);
      return null;
    },
    getVoicePath(return_request) {
      if (return_request && return_request.voice)
        return this.getShopFileTempPath(return_request.voice);
      return null;
    },

    updateReturnState(item, state) {
      this.busy_item = state + item.id;

      let url = null;
      if (this.isAdmin) {
        url = window.API.POST_UPDATE_RETURN_REQUEST_STATE(
          this.$route.params.shop_id,
          this.$route.params.basket_id,
          item.id
        );
      } else if (this.isRole) {
        url = window.API.POST_MY_ROLE_TASK_ACTION(
          this.role.id,
          this.basket.id,
          "return-request"
        );
      }

      axios
        .post(url, {
          state: state,
          item_id: item.id, // Use by role controller (server)
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t(
                "global.basket_return_request_view.notifications.update_status_success"
              )
            );
            item.return_request = data.return_request;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_item = null;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.return-request-frame {
  text-align: start;
  color: white;
  background-color: #2d3440;
  margin: 12px;

  border-top-right-radius: 12px;
  border-top-left-radius: 12px;

  &.selected-item {
    background-color: #21262f;
  }

  .frame-container {
    padding: 8px;
  }

  &:after {
    background: linear-gradient(
        -45deg,
        #fff 16px,
        red 16px,
        blue 16px,
        transparent 0
      ),
      linear-gradient(45deg, #fff 16px, transparent 0);
    background-position: left top;
    background-repeat: repeat-x;
    background-size: 22px 32px;
    content: " ";
    display: block;

    height: 32px;
    width: 100%;

    position: relative;
    top: 0px;
    left: 0;
  }

  .disabled {
    opacity: 0.5;
    cursor: default;
  }

  small {
    color: rgba(255, 255, 255, 0.89) !important;
  }

  a {
    color: white;
    font-weight: 400;

    &:hover {
      color: #a6cde2;
    }
  }

  .text-muted {
    color: rgba(255, 255, 255, 0.89) !important;
  }

  .variant {
    border-radius: 6px;
    margin: 4px 8px;
  }

  .attachment-container {
    position: relative;
    display: block;
    //background-color: #fff;
    // color: #333;
    border-style: dashed;
    border-width: 1px;
    border-color: white;
    border-radius: 12px;
    margin: 8px;
    padding: 16px 8px;
  }

  .admin {
    padding: 16px;
  }

  b {
    font-weight: 500;
  }

  .title-bar {
    min-height: 64px;

    .image {
      float: right;
      margin: 8px;
      width: 64px;
    }
  }

  .state-badge {
    background-color: #fff;
    color: black;
    border-radius: 16px;
    padding: 6px 22px;
  }
}
</style>
