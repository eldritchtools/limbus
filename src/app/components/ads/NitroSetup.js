import Script from "next/script";

export default function NitroSetup() {
    // return null;
    if(process.env.NEXT_PUBLIC_ENABLE_NITRO_ADS !== "true") return null;

    return <>
        <Script
            id="nitro-bootstrap"
            data-cfasync="false"
            strategy="afterInteractive"
        >
            {`window.nitroAds = window.nitroAds || {
        createAd: function() {
            return new Promise(e => {
                window.nitroAds.queue.push(["createAd", arguments, e])
            })
        },
        addUserToken: function() {
            window.nitroAds.queue.push(["addUserToken", arguments])
        },
        queue: []
    };`}
        </Script>

        <Script
            data-cfasync="false"
            src="https://s.nitropay.com/ads-2607.js"
            data-spa="auto"
            strategy="afterInteractive"
        />
    </>
}