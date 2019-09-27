const request = require("request");

let testUrl = "https://kith.com";

export const checkProxy = (myProxy, username, password) => {
  console.log("proxy", myProxy, username, password);
  let proxy = `http://${myProxy}`;
  if (username) proxy = `http://${username}:${password}@${myProxy}`;

  let finished = false;
  return new Promise((resolve) => {
    request.get(
      testUrl,
      {
        proxy,
        time: true
      },
      (err, resp) => {
        if (err) {
          resolve("bad");
        } else {
          const elp = resp.elapsedTime;
          if (!finished) {
            resolve(parseInt(elp > 200 ? elp - 200 : elp, 10).toString());
          }
        }
      }
    );
    setTimeout(() => {
      finished = true;
      resolve("bad");
    }, 3000);
  });
};

export const setTestUrl = url => {
  testUrl = url;
};
