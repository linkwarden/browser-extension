import { getBrowser, getCurrentTabInfo, setIcon } from '../../@/lib/utils.ts';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import { getConfig, isConfigured } from '../../@/lib/config.ts';
import {
  deleteLinkFetch,
  postLinkFetch,
  updateLinkFetch,
  getLinkFetch,
} from '../../@/lib/actions/links.ts';
import {
  bookmarkMetadata,
  deleteBookmarkMetadata,
  getBookmarkMetadataByBookmarkId,
  getBookmarkMetadataByUrl,
  getBookmarksMetadata,
  saveBookmarkMetadata,
} from '../../@/lib/cache.ts';
import ContextType = chrome.contextMenus.ContextType;
import OnClickData = chrome.contextMenus.OnClickData;
import {
  getCsrfTokenFetch,
  getSessionFetch,
  performLoginOrLogoutFetch,
} from '../../@/lib/auth/auth.ts';
import OnInputEnteredDisposition = chrome.omnibox.OnInputEnteredDisposition;

const browser = getBrowser();

// This is the main functions that will be called when a bookmark is created, update or deleted
// Won't work with axios xhr or something not supported by the browser

browser.bookmarks.onCreated.addListener(
  async (_id: string, bookmark: BookmarkTreeNode) => {
    try {
      const { syncBookmarks, baseUrl, username, password, usingSSO } =
        await getConfig();
      if (!syncBookmarks || !bookmark.url) {
        return;
      }
      const session = await getSessionFetch(baseUrl);

      // Check if the bookmark already exists in the server by checking the url so, it doesn't create duplicates
      // I know, could use the method search from the api, but I want to avoid as much api specific calls as possible
      // in case isn't supported, so I prefer to do it this way, if performance is an issue I will think of change to that.

      const existingLink = await getBookmarkMetadataByUrl(bookmark.url);
      if (existingLink) {
        return;
      }

      if (!session && !usingSSO) {
        const csrfToken = await getCsrfTokenFetch(baseUrl);

        await performLoginOrLogoutFetch(
          `${baseUrl}/api/v1/auth/callback/credentials`,
          {
            csrfToken: csrfToken,
            callbackUrl: `${baseUrl}/api/v1/auth/callback`,
            json: true,
            redirect: false,
            username: username,
            password: password,
          }
        );
      } else if (!session && usingSSO) {
        return;
      }

      const newLink = await postLinkFetch(baseUrl, {
        url: bookmark.url,
        collection: {
          name: 'Unorganized',
        },
        tags: [],
        name: bookmark.title,
        description: bookmark.title,
      });

      const newLinkJson = await newLink.json();
      const newLinkUrl: bookmarkMetadata = newLinkJson.response;
      newLinkUrl.bookmarkId = bookmark.id;

      await saveBookmarkMetadata(newLinkUrl);
    } catch (error) {
      console.error(error);
    }
  }
);

browser.bookmarks.onChanged.addListener(
  async (id: string, changeInfo: chrome.bookmarks.BookmarkChangeInfo) => {
    try {
      const { syncBookmarks, baseUrl, username, password, usingSSO } =
        await getConfig();
      if (!syncBookmarks || !changeInfo.url) {
        return;
      }

      const link = await getBookmarkMetadataByBookmarkId(id);

      if (!link) {
        return;
      }

      const session = await getSessionFetch(baseUrl);

      if (!session && !usingSSO) {
        const csrfToken = await getCsrfTokenFetch(baseUrl);

        await performLoginOrLogoutFetch(
          `${baseUrl}/api/v1/auth/callback/credentials`,
          {
            csrfToken: csrfToken,
            callbackUrl: `${baseUrl}/api/v1/auth/callback`,
            json: true,
            redirect: false,
            username: username,
            password: password,
          }
        );
      } else if (!session && usingSSO) {
        return;
      }

      const updatedLink = await updateLinkFetch(baseUrl, link.id, {
        url: changeInfo.url,
        collection: {
          name: 'Unorganized',
        },
        tags: [],
        name: changeInfo.title,
        description: changeInfo.title,
      });

      const updatedLinkJson = await updatedLink.json();
      const newLinkUrl: bookmarkMetadata = updatedLinkJson.response;
      newLinkUrl.bookmarkId = id;

      await saveBookmarkMetadata(newLinkUrl);
    } catch (error) {
      console.error(error);
    }
  }
);

browser.bookmarks.onRemoved.addListener(
  async (id: string, removeInfo: chrome.bookmarks.BookmarkRemoveInfo) => {
    try {
      const { syncBookmarks, baseUrl, username, password, usingSSO } =
        await getConfig();
      if (!syncBookmarks || !removeInfo.node.url) {
        return;
      }
      const link = await getBookmarkMetadataByBookmarkId(id);

      if (!link) {
        return;
      }

      const session = await getSessionFetch(baseUrl);

      if (!session && !usingSSO) {
        const csrfToken = await getCsrfTokenFetch(baseUrl);

        await performLoginOrLogoutFetch(
          `${baseUrl}/api/v1/auth/callback/credentials`,
          {
            csrfToken: csrfToken,
            callbackUrl: `${baseUrl}/api/v1/auth/callback`,
            json: true,
            redirect: false,
            username: username,
            password: password,
          }
        );
      } else if (!session && usingSSO) {
        return;
      }

      await Promise.all([
        deleteBookmarkMetadata(link.bookmarkId),
        deleteLinkFetch(baseUrl, link.id),
      ]);
    } catch (error) {
      console.error(error);
    }
  }
);

// This is for the context menus!
// Example taken from: https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api-samples/contextMenus/basic/sample.js

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await genericOnClick(info, tab);
});

// A generic onclick callback function.
async function genericOnClick(
  info: OnClickData,
  tab: chrome.tabs.Tab | undefined
) {
  const { syncBookmarks, baseUrl, username, password, usingSSO } =
    await getConfig();
  const configured = await isConfigured();
  if (!tab?.url || !tab?.title || !configured) {
    return;
  }
  switch (info.menuItemId) {
    case 'radio':
      // Radio item function
      console.log('Radio item clicked. Status:', info.checked);
      break;
    case 'checkbox':
      // Checkbox item function
      console.log('Checkbox item clicked. Status:', info.checked);
      break;
    default:
      // Handle cases where sync is enabled or not
      if (syncBookmarks) {
        browser.bookmarks.create({
          parentId: '1',
          title: tab.title,
          url: tab.url,
        });
      } else {
        try {
          const session = await getSessionFetch(baseUrl);

          if (!session && !usingSSO) {
            const csrfToken = await getCsrfTokenFetch(baseUrl);

            await performLoginOrLogoutFetch(
              `${baseUrl}/api/v1/auth/callback/credentials`,
              {
                csrfToken: csrfToken,
                callbackUrl: `${baseUrl}/api/v1/auth/callback`,
                json: true,
                redirect: false,
                username: username,
                password: password,
              }
            );
          } else if (!session && usingSSO) {
            return;
          }

          const newLink = await postLinkFetch(baseUrl, {
            url: tab.url,
            collection: {
              name: 'Unorganized',
            },
            tags: [],
            name: tab.title,
            description: tab.title,
          });

          const newLinkJson = await newLink.json();
          const newLinkUrl: bookmarkMetadata = newLinkJson.response;
          newLinkUrl.bookmarkId = tab.id?.toString();

          await saveBookmarkMetadata(newLinkUrl);
        } catch (error) {
          console.error(error);
        }
      }
  }
}
browser.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  const contexts: ContextType[] = [
    'page',
    'selection',
    'link',
    'editable',
    'image',
    'video',
    'audio',
  ];
  for (const context of contexts) {
    const title: string = 'Add link to Linkwarden';
    browser.contextMenus.create({
      title: title,
      contexts: [context],
      id: context,
    });
  }
});

// Omnibox implementation

browser.omnibox.onInputStarted.addListener(async () => {
  const configured = await isConfigured();
  const description = configured
    ? 'Search links in linkwarden'
    : 'Please configure the extension first';

  browser.omnibox.setDefaultSuggestion({
    description: description,
  });
});

browser.omnibox.onInputChanged.addListener(
  async (
    text: string,
    suggest: (arg0: { content: string; description: string }[]) => void
  ) => {
    const configured = await isConfigured();

    if (!configured) {
      return;
    }

    const currentBookmarks = await getBookmarksMetadata();

    const searchedBookmarks = currentBookmarks.filter((bookmark) => {
      return bookmark.name?.includes(text) || bookmark.url.includes(text);
    });

    const bookmarkSuggestions = searchedBookmarks.map((bookmark) => {
      return {
        content: bookmark.url,
        description: bookmark.name || bookmark.url,
      };
    });
    suggest(bookmarkSuggestions);
  }
);

// This part was taken https://github.com/sissbruecker/linkding-extension/blob/master/src/background.js Thanks to @sissbruecker

browser.omnibox.onInputEntered.addListener(
  async (content: string, disposition: OnInputEnteredDisposition) => {
    if (!(await isConfigured()) || !content) {
      return;
    }

    const isUrl = /^http(s)?:\/\//.test(content);
    const url = isUrl ? content : `lk`;

    // Edge doesn't allow updating the New Tab Page (tested with version 117).
    // Trying to do so will throw: "Error: Cannot update NTP tab."
    // As a workaround, open a new tab instead.
    if (disposition === 'currentTab') {
      const tabInfo = await getCurrentTabInfo();
      if (tabInfo.url === 'edge://newtab/') {
        disposition = 'newForegroundTab';
      }
    }

    switch (disposition) {
      case 'currentTab':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await browser.tabs.update({ url });
        break;
      case 'newForegroundTab':
        await browser.tabs.create({ url });
        break;
      case 'newBackgroundTab':
        await browser.tabs.create({ url, active: false });
        break;
    }
  }
);

// Update icon is link is already saved
const updateIcon = async () => {
  let supportedProtocols = ['http:', 'https:'];

  let getActiveTab = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  let urlString = getActiveTab[0]?.url;
  if (urlString) {
    let url = new URL(urlString);
    if (supportedProtocols.includes(url.protocol)) {
      let exists = await doesLinkExist(url);
      console.log(exists);
      exists ? setIcon('./saved.jpg') : setIcon('./48.png');
    } else {
      setIcon('./48.png');
    }
    console.log(`Active tab: ${getActiveTab[0].url}`);
  }
};

const doesLinkExist = async (url: URL): Promise<boolean> => {
  const { syncBookmarks, baseUrl, username, password, usingSSO } =
    await getConfig();
  console.log(syncBookmarks); // needed to fix compile error

  const configured = await isConfigured();
  if (!configured) {
    return false;
  }

  const session = await getSessionFetch(baseUrl);

  if (!session && !usingSSO) {
    const csrfToken = await getCsrfTokenFetch(baseUrl);

    await performLoginOrLogoutFetch(
      `${baseUrl}/api/v1/auth/callback/credentials`,
      {
        csrfToken: csrfToken,
        callbackUrl: `${baseUrl}/api/v1/auth/callback`,
        json: true,
        redirect: false,
        username: username,
        password: password,
      }
    );
  } else if (!session && usingSSO) {
    return false;
  }

  const result = await getLinkFetch(baseUrl, url.href);
  console.log(result);

  if (result.response.length >= 1) {
    // manually checking if the link actually exists because api
    // returns approximate results
    return result.response.some((link: any) => link.url == url.href);
  } else {
    console.log('Link not found');
    return false;
  }
};

// From : https://github.com/mdn/webextensions-examples/blob/main/bookmark-it/background.js
browser.bookmarks.onCreated.addListener(updateIcon);

// listen for bookmarks being removed
browser.bookmarks.onRemoved.addListener(updateIcon);

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateIcon);

// listen to tab switching
browser.tabs.onActivated.addListener(updateIcon);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateIcon);
