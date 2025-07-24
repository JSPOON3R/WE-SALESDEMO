console.log("background script works!");
magicLinkInput = {};

async function generateMagicLink() {
    const res = await fetch('https://primaholding-magic-links-27136674ebe5.herokuapp.com/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(magicLinkInput)
    });

    const data = await res.json();
    console.log(data); 
    browser.runtime.sendMessage({action: "magic-link-ready", magicLink: data});
}

browser.runtime.onMessage.addListener((message) => {
    console.log("from extension... ", message);
    if (message.action === "magic-link-request") {
        magicLinkInput.newTab = message.newTabLink;
        magicLinkInput.sessionId = message.sessionId;
        magicLinkInput.spaceId = message.spaceId;
        magicLinkInput.spaceUrl = message.spaceUrl;
        magicLinkInput.user = browser.webfuseSession.env.Name
        console.log("Magic link info updated: ", magicLinkInput);
        generateMagicLink();
    }
});
