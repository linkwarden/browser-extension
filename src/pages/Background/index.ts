import { getBrowser } from '../../@/lib/utils.ts';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import { getConfig } from '../../@/lib/config.ts';
import { postLinkFetch } from '../../@/lib/actions/links.ts';
import { getCsrfTokenFetch, performLoginOrLogoutFetch } from '../../@/lib/auth/auth.ts';

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
    await postLinkFetch(baseUrl, {
      url: bookmark.url,
      collection: {
        name: "Unorganized",
      },
      tags: [],
      name: bookmark.title,
      description: bookmark.title,
    });
    console.log('Created', bookmark);
  } catch (error) {
    console.error(error);
  }
});
