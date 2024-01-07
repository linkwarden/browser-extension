import { getBrowser } from '../../@/lib/utils.ts';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import { getConfig } from '../../@/lib/config.ts';
import { deleteLinkFetch, postLinkFetch, updateLinkFetch } from '../../@/lib/actions/links.ts';
import { getCsrfTokenFetch, performLoginOrLogoutFetch } from '../../@/lib/auth/auth.ts';
import {
  bookmarkMetadata,
  deleteBookmarkMetadata, getBookmarkMetadataByBookmarkId, getBookmarkMetadataByUrl,
  saveBookmarkMetadata,
} from '../../@/lib/cache.ts';

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

// This is the main function that will be called when a bookmark is updated

// Ignore errors from typescript, they come up because of the method im using in the function  such as getBookmarkMetadataByUrl
// thats because the findIndex can return -1 if it doesnt find anything, and typescript doesnt like that
// which in this case doesnt make sense because we are updating or deleting a bookmark that we know exists, stupid typescript (me), update: i see why it can be undefined...

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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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

//TODO: Currently when a bookmark is added it only add the id from the server not from the browser, so i cant search from id from browser and get the id from the server,
// so in case we have the same url in different COllection it will delete the first it finds, i need to fix that, it should be easy,
// i just need to store the id from the browser and the id from the server in the cache, and then when i need to delete i just search for the id from the server and delete it

// This is the main function that will be called when a bookmark is deleted

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

    await Promise.all([
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deleteBookmarkMetadata(link?.bookmarkId),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deleteLinkFetch(baseUrl, link.id)
    ])


  } catch (error) {
    console.error(error);
  }
});



