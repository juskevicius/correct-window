const foreignUrlParts = [
  {
    profile: "Default", // chrome profile of the company I work at
    urls: ["figma.com", "something.company-i-work-at.com", "company-i-work-at.something.com"],
  },
  // extension installed on Profile 1
  {
    profile: "Profile 2", // chrome profile of the comapny-client
    urls: [
      "dev.comapny-client.com/comapny-client",
      "github.com/comapny-client",
    ],
  },

];

chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  const foreignUrl = foreignUrlParts.find((obj) =>
    obj.urls.some((part) => details.url.includes(part))
  );
  if (foreignUrl) {
    chrome.tabs.remove(details.tabId);
    chrome.runtime.sendNativeMessage(
      "com.mantas.windows",
      {
        url: details.url,
        profileName: foreignUrl.profile,
      },
      function (response) {
        console.log("Messaging host response: ", response);
      }
    );
  }
});
