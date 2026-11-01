import type { Shop } from "@selldone/core-js/models/shop/shop.model";
import type { Domain } from "@selldone/core-js/models/shop/domain/domain.model";
import type { ShopGateway } from "@selldone/core-js/models/shop/gateway/shop-gateway.model";
import type { Gateway } from "@selldone/core-js/models/shop/gateway/gateway.model";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import { EmailProviders } from "@selldone/core-js/enums/email/EmailProviders";
import { SmsProviders } from "@selldone/core-js/enums/sms/SmsProviders";
import { ShopCautionHelper } from "@selldone/core-js/helper/shop/ShopCautionHelper";

type DomainStatus = Partial<
  Pick<Domain, "id" | "primary" | "enable" | "approved" | "domain" | "error">
>;
type GatewayStatus = Partial<
  Pick<ShopGateway, "id" | "enable" | "livemode">
> & {
  gateway?: Partial<
    Pick<Gateway, "enable" | "currency" | "cash" | "cod" | "dir">
  > | null;
};
type ServiceStatus = {
  id?: number;
  enable?: boolean;
  driver?: string | null;
  errors?: number | string | null;
};

/** Loaded dashboard fields only; missing relations are not evidence of a failure. */
export type TechnicalHealthShop = Partial<
  Pick<Shop, "id" | "active" | "currencies">
> & {
  sample?: boolean;
  sub?: Partial<Pick<Domain, "id" | "primary" | "enable">> | null;
  domains?: (DomainStatus | null)[] | null;
  shop_gateways?: (GatewayStatus | null)[] | null;
  mail_service?: ServiceStatus | null;
  sms_service?: ServiceStatus | null;
};
export type TechnicalCaution = ReturnType<typeof ShopCautionHelper.Caution> & {
  diagnosticKey: string;
};
type Translate = (
  key: string,
  params?: Record<string, string | number>,
) => string;
type CheckCode =
  | "inactive"
  | "primary_disabled"
  | "domain_error"
  | "payment_disabled"
  | "test_payments"
  | "email_errors"
  | "sms_errors";

export function getTechnicalCautions(
  shop: TechnicalHealthShop | null | undefined,
  t: Translate,
): TechnicalCaution[] {
  if (
    !shop ||
    shop.sample === true ||
    typeof shop.id !== "number" ||
    !Number.isSafeInteger(shop.id) ||
    shop.id <= 0
  )
    return [];

  const cautions: TechnicalCaution[] = [];
  const shopId = shop.id;
  const add = (
    code: CheckCode,
    entity: string,
    route: NonNullable<TechnicalCaution["to"]>,
    params?: Record<string, string | number>,
  ) => {
    const prefix = `admin_shop.dashboard.technical.checks.${code}`;
    cautions.push({
      ...ShopCautionHelper.Caution(
        "warning",
        t(`${prefix}.title`, params),
        t(`${prefix}.message`, params),
        route,
        t(`${prefix}.action`, params),
      ),
      diagnosticKey: `${code}:${entity}`,
    });
  };
  const settings = (name: string) => ({ name, params: { shop_id: shopId } });

  if (shop.active === false)
    add("inactive", `shop:${shopId}`, settings("BPageShopSettingInfo"));

  const domains = Array.isArray(shop.domains) ? shop.domains : [];
  if (
    (shop.sub?.primary === true && shop.sub.enable === false) ||
    domains.some(
      (domain) => domain?.primary === true && domain.enable === false,
    )
  )
    add(
      "primary_disabled",
      `shop:${shopId}`,
      settings("BPageShopSettingDomain"),
    );

  for (const domain of domains) {
    if (
      domain?.primary === true &&
      domain.enable === true &&
      domain.approved === true &&
      typeof domain.id === "number" &&
      Number.isSafeInteger(domain.id) &&
      domain.id > 0 &&
      typeof domain.domain === "string" &&
      domain.domain.trim() &&
      typeof domain.error === "string" &&
      domain.error.trim()
    )
      add(
        "domain_error",
        `domain:${domain.id}`,
        {
          name: "BPageDomainOverview",
          params: { shop_id: shopId, domain_key: String(domain.id) },
        },
        { domain: domain.domain },
      );
  }

  const currencies = Array.isArray(shop.currencies) ? shop.currencies : [];
  const paymentMethods = (
    Array.isArray(shop.shop_gateways) ? shop.shop_gateways : []
  ).filter((method) => {
    const gateway = method?.gateway;
    return (
      method?.enable === true &&
      gateway?.cash === false &&
      typeof gateway.currency === "string" &&
      Currency[gateway.currency]?.code === gateway.currency &&
      currencies.includes(gateway.currency)
    );
  });
  if (paymentMethods.some((method) => method?.gateway?.enable === false)) {
    add(
      "payment_disabled",
      `shop:${shopId}`,
      settings("BPageShopFinanceGateways"),
    );
  }
  if (
    shop.active === true &&
    paymentMethods.some(
      (method) =>
        method?.gateway?.enable === true &&
        method.gateway.cod === false &&
        method.gateway.dir === false &&
        method.livemode === false,
    )
  ) {
    add(
      "test_payments",
      `shop:${shopId}`,
      settings("BPageShopFinanceGateways"),
    );
  }

  for (const [code, service, providers, route] of [
    [
      "email_errors",
      shop.mail_service,
      EmailProviders,
      "BPageShopSettingEmail",
    ],
    ["sms_errors", shop.sms_service, SmsProviders, "BPageShopSettingSms"],
  ] as const) {
    if (
      service?.enable !== true ||
      !providers.some(
        (provider) =>
          provider.driver !== "default" && provider.driver === service.driver,
      )
    )
      continue;
    if (
      typeof service.errors !== "number" &&
      !(typeof service.errors === "string" && service.errors.trim())
    )
      continue;
    const count = Number(service.errors);
    // Recorded counters do not establish a live failure; SMS sends can bypass the selector's error limit.
    if (Number.isFinite(count) && Number.isInteger(count) && count >= 100) {
      const id =
        typeof service.id === "number" &&
        Number.isSafeInteger(service.id) &&
        service.id > 0
          ? service.id
          : service.driver;
      add(code, `service:${id}:${service.driver}`, settings(route), { count });
    }
  }
  return cautions;
}
