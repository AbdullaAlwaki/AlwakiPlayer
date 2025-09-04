const serverData = JSON.parse(sessionStorage.getItem("currentProfile")) || {};
const server_info = serverData.server_info || {};
const user_info = serverData.user_info || {};

export async function liveCategoriesList() {
  // Return a promise that resolves with the data (from DB or fetch)
  const profileName = serverData.profile || user_info.username || "default";
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      // Fallback: use sessionStorage with profileName as key
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const sessionKey = `liveCatDB_${profileName}`;
      const cached = sessionStorage.getItem(sessionKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (
            parsed.liveCategories &&
            parsed.time &&
            now - parsed.time < oneDay
          ) {
            resolve(parsed.liveCategories);
            return;
          }
        } catch {}
      }
      // Fetch and save to sessionStorage
      fetch(
        `${server_info.server_protocol}://${server_info.url}:${server_info.port}/player_api.php?username=${user_info.username}&password=${user_info.password}&action=get_live_categories`
      )
        .then((r) => r.text())
        .then((text) => {
          const data = JSON.parse(text);
          sessionStorage.setItem(
            sessionKey,
            JSON.stringify({ liveCategories: data, time: now })
          );
          resolve(data);
        })
        .catch(reject);
      return;
    }
    // IndexedDB path: use a single object store and profileName as the id
    const storeName = "liveCatDB";
    const request = window.indexedDB.open("AlwakiPlayerDB", 1);
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    request.onsuccess = async function (event) {
      const db = event.target.result;
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const getRequest = store.get(profileName);
      getRequest.onsuccess = async function () {
        const result = getRequest.result;
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (
          result &&
          result.liveCategories &&
          result.time &&
          now - result.time < oneDay
        ) {
          db.close();
          resolve(result.liveCategories);
        } else {
          // Fetch and save to DB
          try {
            const response = await fetch(
              `${server_info.server_protocol}://${server_info.url}:${server_info.port}/player_api.php?username=${user_info.username}&password=${user_info.password}&action=get_live_categories`
            );
            const text = await response.text();

            const data = JSON.parse(text);

            const writeTx = db.transaction(storeName, "readwrite");
            const writeStore = writeTx.objectStore(storeName);
            writeStore.put({
              id: profileName,
              liveCategories: data,
              time: now,
            });
            writeTx.oncomplete = function () {
              db.close();
              resolve(data);
            };
            writeTx.onerror = function () {
              db.close();
              resolve(data);
            };
          } catch (error) {
            db.close();
            reject(error);
          }
        }
      };
      getRequest.onerror = function () {
        db.close();
        reject("Error reading liveCatDB from IndexedDB");
      };
    };
    request.onerror = function (event) {
      reject("IndexedDB error: " + event.target.errorCode);
    };
  });
}
