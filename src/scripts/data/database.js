import { openDB } from "idb";

const DATABASE_NAME = "story-app-db";
const DATABASE_VERSION = 1;
const BOOKMARK_STORE_NAME = "bookmark-stories";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(BOOKMARK_STORE_NAME, {
      keyPath: "id"
    });
  }
});

const Database = {
  async putStory(story) {
    if (!Object.hasOwn(story, "id")) {
      throw new Error("`id` is required to save");
    }

    return (await dbPromise).put(BOOKMARK_STORE_NAME, story);
  },

  async getStoryById(id) {
    if (!id) {
      throw new Error("`id` is required to get");
    }

    return (await dbPromise).get(BOOKMARK_STORE_NAME, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(BOOKMARK_STORE_NAME);
  },

  async removeStory(id) {
    return (await dbPromise).delete(BOOKMARK_STORE_NAME, id);
  }
};

export default Database;
