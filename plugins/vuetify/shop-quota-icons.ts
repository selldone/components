import { h, type FunctionalComponent } from "vue";
import type { IconProps, IconSet } from "vuetify";
import ShopQuota, {
  SHOP_QUOTA_ICON_SPRITE,
  ShopQuotaGroupIcons,
} from "@selldone/core-js/enums/shop/quota/ShopQuota";

const names = new Set(
  [
    ...Object.values(ShopQuota).map((resource) => resource.icon),
    ...Object.values(ShopQuotaGroupIcons),
  ].map((icon) => icon.slice("quota:".length)),
);

const ShopQuotaIcon: FunctionalComponent<IconProps> = (props) => {
  const name =
    typeof props.icon === "string" && names.has(props.icon)
      ? props.icon
      : "other";
  return h(props.tag, { class: "sd-shop-quota-icon" }, [
    h(
      "svg",
      {
        class: "v-icon__svg",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        "aria-hidden": "true",
        focusable: "false",
      },
      [h("use", { href: `${SHOP_QUOTA_ICON_SPRITE}#${name}` })],
    ),
  ]);
};
// Keep native VIcon classes, size, color, accessibility and event attributes on its wrapper.
ShopQuotaIcon.props = ["icon", "tag"];

export const shopQuotaIcons: IconSet = { component: ShopQuotaIcon };
