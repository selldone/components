const providers = {
  selldone: { name: "Selldone", logo: require("../../../assets/trademark/selldone.svg") },
  cloudflare: { name: "Cloudflare", logo: require("../../../assets/trademark/cloudflare.svg") },
  google_cloud: { name: "Google Cloud", logo: require("../../../assets/trademark/google-cloud.svg") },
  cloudfront: { name: "CloudFront" },
  fastly: { name: "Fastly" },
  akamai: { name: "Akamai" },
  azure: { name: "Azure" },
  vercel: { name: "Vercel" },
  bunny: { name: "Bunny" },
  arvancloud: { name: "ArvanCloud" },
  unknown: { name: "" },
};

/** Resolve only bounded saved evidence; configuration flags do not prove a provider. */
export function resolveDomainProvider(item: any) {
  if (["local", "sub"].includes(item?.official)) {
    return { ...providers.selldone, id: "selldone", kind: "builtin", checkedAt: null };
  }
  const saved = item?.connection_provider ?? item?.domain?.connection_provider ?? item?.domain?.info?.connection_provider;
  const timestamp = typeof saved?.checked_at === "string" && saved.checked_at.length <= 35 ? saved.checked_at.match(/^([1-9]\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-](?:0\d|1[0-3]):[0-5]\d|[+-]14:00)$/) : null;
  const validDate = timestamp && Number(timestamp[3]) <= new Date(Date.UTC(Number(timestamp[1]), Number(timestamp[2]), 0)).getUTCDate();
  if (!saved || typeof saved.id !== "string" || !Object.hasOwn(providers, saved.id) ||
    !["destination", "response_headers"].includes(saved.source) ||
    (saved.source === "destination") !== (saved.id === "selldone") ||
    !validDate || !Number.isFinite(Date.parse(saved.checked_at))) {
    return { ...providers.unknown, id: "unknown", kind: "not_checked", checkedAt: null };
  }
  return {
    ...providers[saved.id], id: saved.id, checkedAt: saved.checked_at,
    kind: saved.id === "unknown" ? "unknown" : saved.source === "destination" ? "direct" : "detected",
  };
}
