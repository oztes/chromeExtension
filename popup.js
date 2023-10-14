document.getElementById('scanBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let currentTab = tabs[0];
        chrome.scripting.executeScript({
            target: {tabId: currentTab.id},
            function: findWordInContent,
        });
    });
});

function findWordInContent() {
    chrome.runtime.sendMessage({ action: "scanPage" }, (response) => {
        document.getElementById('result').innerText = 
            `Found the word "house" ${response.wordInstances} times.`;
    });
}
