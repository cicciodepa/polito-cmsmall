const APIURL = "http://localhost:3000/api/";

function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> }
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {
          // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
          response
            .json()
            .then((json) => { resolve(json) })
            .catch((err) => reject({ error: "Cannot parse server response", message: err }));
        } else {
          // analyzing the cause of error
          response
            .json()
            .then((obj) => reject(obj)) // error msg in the response body
            .catch((err) => reject({ error: "Cannot parse server response", messageserver: err })); 
        }
      })
      .catch((err) => reject({ error: "Cannot communicate" })); // connection error
  });
}

const listPages = async () => {
  return getJson(fetch(APIURL + "pages", {
    credentials: "include"
  })
  )
};


const listUIDS = async () => {
  return getJson(
    fetch(APIURL + 'users/uids', {
      credentials: "include"
    }))
    .then(json => { return (json) })
}

const savePage = async (page) => {
  if (page.id === null) {
    return getJson(
      fetch(APIURL + "pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // this parameter specifies that authentication cookie must be forwared
        body: JSON.stringify(page),
      })
    );
  } else {
    return getJson(
      fetch(APIURL + "pages/" + page.id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // this parameter specifies that authentication cookie must be forwared
        body: JSON.stringify(page),
      })
    )
  }
};

const updatePage = async (page) => {
  return getJson(
    fetch(APIURL + `pages/${page.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(page),
    })
  );
};

const deletePage = async (pageID) => {
  return getJson(
    fetch(APIURL + `pages/${pageID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include" // this parameter specifies that authentication cookie must be forwared
    })
  );
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
  return getJson(
    fetch(APIURL + "sessions/current", {
      // this parameter specifies that authentication cookie must be forwared
      credentials: "include",
    })
  );
};

/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
  return getJson(
    fetch(APIURL + "sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(credentials),
    })
  );
};

const logOut = async () => {
  return getJson(
    fetch(APIURL + "sessions/current", {
      method: "DELETE",
      credentials: "include", // this parameter specifies that authentication cookie must be forwared
    })
  );
};

const setWebsite = async (website) => {
  return getJson(
    fetch(APIURL + 'site', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ website: website })
    })
  )
}

const getWebsite = async () => {
  return getJson(
    fetch(APIURL + 'site')
  )
}

const API = { getUserInfo, logIn, logOut, listPages, savePage, updatePage, listUIDS, deletePage, setWebsite, getWebsite };
export default API;
