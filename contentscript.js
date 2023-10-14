chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scanPage") {
        let pageText = document.body.innerText;
        let wordInstances = findWordInstances(pageText, "house");
        sendResponse({ wordInstances: wordInstances });
    }
});

function findWordInstances(text, word) {
    let regex = new RegExp("\\b" + word + "\\b", "gi");
    let matches = text.match(regex) || [];
    return matches.length;
}
