import { getStorageItem, setStorageItem } from './utils.ts';
import { bookmarkFormValues } from './validators/bookmarkForm.ts';

const BOOKMARKS_METADATA_KEY = 'lw_bookmarks_metadata_cache';
// TODO: Implement caching for tabs metadata maybe?
// I want to cache the all current favorited links in the browser, and cache the ones coming from the server
// so that I can compare them and only update the ones that are different from the server to the browser and vice versa (if needed)
// I think I can do this by using the bookmark id as the key, and the value will be the link object itself (or maybe just the url?)
// I think I can also use the url as the key, and the value will be the bookmark id (or maybe just the bookmark object itself?)

export interface bookmarkMetadata extends bookmarkFormValues{
  id: number;
  collectionId: number;
}

const DEFAULTS: bookmarkMetadata[] = [
  {
    id: 0,
    collectionId: 0,
    name: '',
    url: '',
    description: '',
    collection: {
      id: 0,
      name: '',
      ownerId: 0,
    },
    tags: [],
  }
];

export async function getBookmarksMetadata(): Promise<bookmarkMetadata[]> {
  const bookmarksMetadata = await getStorageItem(BOOKMARKS_METADATA_KEY);
  return bookmarksMetadata ? JSON.parse(bookmarksMetadata) : DEFAULTS;
}

export async function saveBookmarksMetadata(bookmarksMetadata: bookmarkMetadata[]) {
  return await setStorageItem(BOOKMARKS_METADATA_KEY, JSON.stringify(bookmarksMetadata));
}

export async function clearBookmarksMetadata() {
  return await setStorageItem(BOOKMARKS_METADATA_KEY, JSON.stringify([]));
}

export async function getBookmarkMetadataById(id: number): Promise<bookmarkMetadata | undefined> {
  const bookmarksMetadata = await getBookmarksMetadata();
  return bookmarksMetadata.find((bookmarkMetadata) => bookmarkMetadata.id === id);
}

export async function getBookmarkMetadataByUrl(url: string): Promise<bookmarkMetadata | undefined> {
  const bookmarksMetadata = await getBookmarksMetadata();
  return bookmarksMetadata.find((bookmarkMetadata) => bookmarkMetadata.url === url);
}

export async function saveBookmarkMetadata(bookmarkMetadata: bookmarkMetadata) {
  const bookmarksMetadata = await getBookmarksMetadata();
  const index = bookmarksMetadata.findIndex((bookmarkMetadata) => bookmarkMetadata.id === bookmarkMetadata.id);
  if (index !== -1) {
    bookmarksMetadata[index] = bookmarkMetadata;
  } else {
    bookmarksMetadata.push(bookmarkMetadata);
  }
  return await saveBookmarksMetadata(bookmarksMetadata);
}

export async function deleteBookmarkMetadata(id: number) {
  const bookmarksMetadata = await getBookmarksMetadata();
  const index = bookmarksMetadata.findIndex((bookmarkMetadata) => bookmarkMetadata.id === id);
  if (index !== -1) {
    bookmarksMetadata.splice(index, 1);
  }
  return await saveBookmarksMetadata(bookmarksMetadata);
}

export async function deleteBookmarkMetadataByUrl(url: string) {
  const bookmarksMetadata = await getBookmarksMetadata();
  const index = bookmarksMetadata.findIndex((bookmarkMetadata) => bookmarkMetadata.url === url);
  if (index !== -1) {
    bookmarksMetadata.splice(index, 1);
  }
  return await saveBookmarksMetadata(bookmarksMetadata);
}






