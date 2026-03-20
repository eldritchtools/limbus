const ROOT = "https://limbus-assets.eldritchtools.com";

const ASSETS_ROOT = process.env.ENABLE_LOCAL_DATA ? "api/local-assets" : `${ROOT}/assets`;
const DATA_ROOT = process.env.ENABLE_LOCAL_DATA ? "api/local-data" : `${ROOT}/data`;
const PUBLIC_ROOT = ROOT;

export { ASSETS_ROOT, DATA_ROOT, PUBLIC_ROOT };