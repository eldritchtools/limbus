export default function NitroSetup() {
    return null;
    if(process.env.NEXT_PUBLIC_ENABLE_NITRO_ADS !== "true") return null;

    return <>
        <script
            data-cfasync="false"
            dangerouslySetInnerHTML={{
                __html: `
                    window.nitroAds = window.nitroAds || {
                        createAd: function() {
                            return new Promise(e => {
                                window.nitroAds.queue.push(["createAd", arguments, e])
                            })
                        },
                        addUserToken: function() {
                            window.nitroAds.queue.push(["addUserToken", arguments])
                        },
                        queue: []
                    };
                `,
            }}
        />
        <script
            data-cfasync="false"
            async
            src="https://s.nitropay.com/ads-2607.js"
            data-spa="auto"
        />
    </>
}