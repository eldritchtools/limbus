const ROOT = "https://limbus-assets.eldritchtools.com";

const ASSETS_ROOT = process.env.NEXT_PUBLIC_ENABLE_LOCAL_DATA === "true" ? "/api/local-assets" : `${ROOT}/assets`;
const DATA_ROOT = process.env.NEXT_PUBLIC_ENABLE_LOCAL_DATA === "true" ? "/api/local-data" : `${ROOT}/data`;
const PUBLIC_ROOT = ROOT;

export { ASSETS_ROOT, DATA_ROOT, PUBLIC_ROOT };