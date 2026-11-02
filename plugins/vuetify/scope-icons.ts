import { h, type FunctionalComponent } from "vue";
import type { IconProps, IconSet } from "vuetify";
import { ScopeIconCatalog } from "@selldone/core-js/enums/permission/ScopeIcons";

const catalog = ScopeIconCatalog as {
  icons: Record<string, string[]>;
  scopes: Record<string, { glyph: string; operation?: string }>;
  operations: Record<string, string[]>;
};

const ScopeIcon: FunctionalComponent<IconProps> = (props) => {
  const scope =
    typeof props.icon === "string" ? catalog.scopes[props.icon] : null;
  const paths = catalog.icons[scope?.glyph || "key"];
  const mark = scope?.operation && catalog.operations[scope.operation];
  const draw = (items: string[]) => items.map((d) => h("path", { d }));
  return h(props.tag, { class: "sd-scope-icon" }, [
    h(
      "svg",
      {
        class: "v-icon__svg",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        style: { fill: "none" },
        stroke: "currentColor",
        "stroke-width": 1.65,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "aria-hidden": "true",
        focusable: "false",
      },
      [
        h("g", mark ? { transform: "scale(.76)" } : {}, draw(paths)),
        ...(mark ? draw(mark) : []),
      ],
    ),
  ]);
};
// VIcon retains native size, color, accessibility and interaction attributes.
ScopeIcon.props = ["icon", "tag"];

export const scopeIcons: IconSet = { component: ScopeIcon };
