import { getBrowser } from '../../@/lib/utils.ts';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import { getConfig } from '../../@/lib/config.ts';
import { deleteLinkFetch, postLinkFetch, updateLinkFetch } from '../../@/lib/actions/links.ts';
import { getCsrfTokenFetch, performLoginOrLogoutFetch } from '../../@/lib/auth/auth.ts';
import {
  bookmarkMetadata,
  deleteBookmarkMetadata,
  getBookmarkMetadataByUrl,
  saveBookmarkMetadata,
} from '../../@/lib/cache.ts';

const browser = getBrowser();

const getCurrentBookmarks = async () => {
  return await browser.bookmarks.getTree();
}

// Testing will remove later
const logBookmarks = (bookmarks: BookmarkTreeNode[]) => {
  for (const bookmark of bookmarks) {
    if (bookmark.url) {
      const { url, title, parentId } = bookmark;
      console.log(url, title, parentId);
    }
    else if (bookmark.children) {
      logBookmarks(bookmark.children);
    }
  }
}

// Testing will remove later
(async () => {
  try {
    const { syncBookmarks } = await getConfig();
    if (!syncBookmarks) {
      return;
    }
    const [root] = await getCurrentBookmarks();
    logBookmarks(root.children);
  } catch (error) {
    console.error(error);
  }
})();

// This is the main function that will be called when a bookmark is created
// idk why wont work with axios...
browser.bookmarks.onCreated.addListener(async (_id: string, bookmark: BookmarkTreeNode) => {
  try {
    const { syncBookmarks, baseUrl, username, password } = await getConfig();
    if (!syncBookmarks || !bookmark.url) {
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

    await saveBookmarkMetadata(newLinkUrl)

  } catch (error) {
    console.error(error);
  }
});

// This is the main function that will be called when a bookmark is updated

// Ignore errors from typescript, they come up because of the method im using in the function  such as getBookmarkMetadataByUrl
// thats because the findIndex can return -1 if it doesnt find anything, and typescript doesnt like that
// which in this case doesnt make sense because we are updating or deleting a bookmark that we know exists, stupid typescript (me)

browser.bookmarks.onChanged.addListener(async (_id: string, changeInfo: chrome.bookmarks.BookmarkChangeInfo) => {
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

    const link = await getBookmarkMetadataByUrl(changeInfo.url)

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

    await saveBookmarkMetadata(newLinkUrl)

  } catch (error) {
    console.error(error);
  }
});

// This is the main function that will be called when a bookmark is deleted

browser.bookmarks.onRemoved.addListener(async (_id: string, removeInfo: chrome.bookmarks.BookmarkRemoveInfo) => {
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
    const link = await getBookmarkMetadataByUrl(removeInfo.node.url)

    await Promise.all([
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deleteBookmarkMetadata(link?.id),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deleteLinkFetch(baseUrl, link?.id)
    ])


  } catch (error) {
    console.error(error);
  }
});



