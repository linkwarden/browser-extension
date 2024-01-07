import { getBrowser } from '../../@/lib/utils.ts';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import { getConfig, isConfigured } from '../../@/lib/config.ts';
import { deleteLinkFetch, postLinkFetch, updateLinkFetch } from '../../@/lib/actions/links.ts';
import { getCsrfTokenFetch, performLoginOrLogoutFetch } from '../../@/lib/auth/auth.ts';
import {
  bookmarkMetadata,
  deleteBookmarkMetadata, getBookmarkMetadataByBookmarkId, getBookmarkMetadataByUrl,
  saveBookmarkMetadata,
} from '../../@/lib/cache.ts';
import ContextType = chrome.contextMenus.ContextType;
import OnClickData = chrome.contextMenus.OnClickData;

const browser = getBrowser();

// This is the main function that will be called when a bookmark is created
// idk why wont work with axios...
browser.bookmarks.onCreated.addListener(async (_id: string, bookmark: BookmarkTreeNode) => {
  try {
    const { syncBookmarks, baseUrl, username, password } = await getConfig();
    if (!syncBookmarks || !bookmark.url) {
      return;
    }

    // Check if the bookmark already exists in the server by checking the url so, it doesn't create duplicates
    // I know, could use the method search from the api, but I want to avoid as much api specific calls as possible
    // in case isn't supported, so I prefer to do it this way, if performance is an issue I will think of change to that.

    const existingLink = await getBookmarkMetadataByUrl(bookmark.url);
    if (existingLink) {
      return;
    }

    const csrfToken = await getCsrfTokenFetch(baseUrl);
    await performLoginOrLogoutFetch(
      `${baseUrl}/api/v1/auth/callback/credentials`,
      {
        username: username,
        password: password,
        redirect: false,
        csrfToken,
        callbackUrl: `${baseUrl}/login`,
        json: true,
      }
    );
    const newLink = await postLinkFetch(baseUrl, {
      url: bookmark.url,
      collection: {
        name: "Unorganized",
      },
      tags: [],
      name: bookmark.title,
      description: bookmark.title,
    });

    const newLinkJson = await newLink.json()
    const newLinkUrl: bookmarkMetadata = newLinkJson.response;
    newLinkUrl.bookmarkId = bookmark.id;

    await saveBookmarkMetadata(newLinkUrl)

  } catch (error) {
    console.error(error);
  }
});

browser.bookmarks.onChanged.addListener(async (id: string, changeInfo: chrome.bookmarks.BookmarkChangeInfo) => {
  try {
    const { syncBookmarks, baseUrl, username, password } = await getConfig();
    if (!syncBookmarks || !changeInfo.url) {
      return;
    }
    const csrfToken = await getCsrfTokenFetch(baseUrl);
    await performLoginOrLogoutFetch(
      `${baseUrl}/api/v1/auth/callback/credentials`,
      {
        username: username,
        password: password,
        redirect: false,
        csrfToken,
        callbackUrl: `${baseUrl}/login`,
        json: true,
      }
    );

    const link = await getBookmarkMetadataByBookmarkId(id);

    if (!link) {
      return;
    }

    const updatedLink = await updateLinkFetch(baseUrl, link.id, {
      url: changeInfo.url,
      collection: {
        name: "Unorganized",
      },
      tags: [],
      name: changeInfo.title,
      description: changeInfo.title,
    });

    const updatedLinkJson = await updatedLink.json()
    const newLinkUrl: bookmarkMetadata = updatedLinkJson.response;
    newLinkUrl.bookmarkId = id;

    await saveBookmarkMetadata(newLinkUrl)

  } catch (error) {
    console.error(error);
  }
});

browser.bookmarks.onRemoved.addListener(async (id: string, removeInfo: chrome.bookmarks.BookmarkRemoveInfo) => {
  try {
    const { syncBookmarks, baseUrl, username, password } = await getConfig();
    if (!syncBookmarks || !removeInfo.node.url) {
      return;
    }
    const csrfToken = await getCsrfTokenFetch(baseUrl);
    await performLoginOrLogoutFetch(
      `${baseUrl}/api/v1/auth/callback/credentials`,
      {
        username: username,
        password: password,
        redirect: false,
        csrfToken,
        callbackUrl: `${baseUrl}/login`,
        json: true,
      }
    );
    const link = await getBookmarkMetadataByBookmarkId(id);

    if (!link) {
      return;
    }

    await Promise.all([
      deleteBookmarkMetadata(link.bookmarkId),
      deleteLinkFetch(baseUrl, link.id)
    ])


  } catch (error) {
    console.error(error);
  }
});

// Example taken from: https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api-samples/contextMenus/basic/sample.js

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  await genericOnClick(info, tab);
});

// A generic onclick callback function.
async function genericOnClick(info: OnClickData, tab: chrome.tabs.Tab | undefined) {
  const { syncBookmarks, baseUrl } = await getConfig();
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
          const csrfToken = await getCsrfTokenFetch(baseUrl);
          await performLoginOrLogoutFetch(
            `${baseUrl}/api/v1/auth/callback/credentials`,
            {
              username: 'test',
              password: 'test',
              redirect: false,
              csrfToken,
              callbackUrl: `${baseUrl}/login`,
              json: true,
            }
          );
          const newLink = await postLinkFetch(baseUrl, {
            url: tab.url,
            collection: {
              name: "Unorganized",
            },
            tags: [],
            name: tab.title,
            description: tab.title,
          });

          const newLinkJson = await newLink.json()
          const newLinkUrl: bookmarkMetadata = newLinkJson.response;
          newLinkUrl.bookmarkId = tab.id?.toString();

          await saveBookmarkMetadata(newLinkUrl)
        } catch (error) {
          console.error(error);
        }

      }
  }
}
chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  const contexts: ContextType[] = [
    'page',
    'selection',
    'link',
    'editable',
    'image',
    'video',
    'audio'
  ];
  for (const context of contexts) {
    const  title: string = "Add link to Linkwarden";
    chrome.contextMenus.create({
      title: title,
      contexts: [context],
      id: context
    });
  }
});



