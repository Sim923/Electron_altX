import fs from 'fs';
import path from "path";
import { app } from 'electron';
import { performance } from "perf_hooks";
import * as Sentry from '@sentry/node';
import Nightmare from "nightmare";
import "nightmare-wait-for-url";
import urlsGsearch from "./urlsGsearch";
import urlsYoutube from "./urlsYoutube";
import { basicURL } from "./index";

const isProd = process.env.NODE_ENV === 'production';

let sender = null;

const youtubes = urlsYoutube;
const searches = urlsGsearch;

const myTargets = [];

const randomNumber = (min, max) => {
  return Math.random() * (max - min) + min;
};

const randomMsSec = (min, max) => {
  return randomNumber(min, max) * 60 * 1000;
};

const mixTargets = () => {
  const min = 1;
  const max = 4;
  let i = 0;
  let j = 0;
  const yLength = youtubes.length;
  const gLength = searches.length;

  while (i < yLength && j < gLength) {
    let end = i + randomNumber(min, max);
    while (i < end && i < yLength) {
      myTargets.push(youtubes[i]);
      i += 1;
    }
    end = j + randomNumber(min, max);
    while (j < end && j < gLength) {
      myTargets.push(searches[j]);
      j += 1;
    }
  }

  if (i === yLength) {
    while (j < gLength) {
      myTargets.push(searches[j]);
      j += 1;
    }
  } else if (j === gLength) {
    while (i < yLength) {
      myTargets.push(youtubes[i]);
      i += 1;
    }
  }

  console.log(myTargets);
};

mixTargets();

let running_profiles = 0;
let running_bots = [];
let scheduled_bots = [];
let paused_bots = [];

let min_slp = 10;
let max_slp = 20;
let min_run = 45;
let max_run = 60;
let max_profiles = 1;
let gsearch = true;
let youtube = true;
const youtube_duration_min = 3;
const youtube_duration_max = 4;
const gsearch_duration_min = 0.01;
const gsearch_duration_max = 0.1;
const total_loop = 1;

Nightmare.action(
  "show",
  function(name, options, parent, win, renderer, done) {
    parent.respondTo("show", function(inactive, subDone) {
      if (win.getTitle() === 'Electron') {
        win.setTitle('altX Bot Tools');
      }
      if (inactive) {
        win.showInactive();
      } else {
        win.show();
      }

      subDone();
    });

    done();
  },
  function(inactive, done) {
    this.child.call("show", inactive, done);
  }
);

Nightmare.action(
  "hide",
  function(name, options, parent, win, renderer, done) {
    parent.respondTo("hide", function(subDone) {
      win.hide();
      subDone();
    });

    done();
  },
  function(done) {
    this.child.call("hide", done);
  }
);

const pathToNightmareElectronDist = path.join(process.resourcesPath, 'app.asar.unpacked/node_modules/nightmare/node_modules/electron/dist/');

const platformPathToElectron = {
  'win32': 'Electron.exe',
  'darwin': 'Electron.app/Contents/MacOS/Electron',
  'linux': 'electron',
}

const runTask = async (task, isOneClick=false) => {
  console.log('runTask', task);
  const electronPath =
    process.env.NODE_ENV === "development"
      // eslint-disable-next-line
      ? require("nightmare/node_modules/electron")
      : path.join(pathToNightmareElectronDist, platformPathToElectron[process.platform]);
      /* : path.join(
          process.resourcesPath,
          `app.asar.unpacked/node_modules/nightmare/node_modules/electron/dist/${process.platform === "win32" ? "Electron.exe" : "Electron.app/Contents/MacOS/Electron" }`,
        ); */

  let proxy;
  let username;
  let password;
  if (task.proxy != null) {
    proxy = `${task.proxy.ipaddr}:${task.proxy.port}`;
    username = task.proxy.username;
    password = task.proxy.password;
  }
  let nightmare = new Nightmare({
    show: false,
    electronPath,
    waitTimeout: 6 * 1e4,
    gotoTimeout: 6 * 1e4,
    alwaysOnTop: false,
    title: "altX Bot Tools",
    icon: `${basicURL}/icon.ico`,
    switches: {
      "ignore-certificate-errors": true,
    },
    openDevTools: {
      mode: 'detach'
    },
  });

  if (proxy) {
    nightmare = new Nightmare({
      show: false,
      electronPath,
      waitTimeout: 3600000,
      gotoTimeout: 3600000,
      alwaysOnTop: false,
      switches: {
        "proxy-server": proxy,
        "ignore-certificate-errors": true,
      }
    });
  }
  console.log('++++++++', task);
  const is_cookie_running = true;
  const cookieDir = isProd ? path.join(app.getPath('appData'), 'cookies') :  path.join(__dirname, '..', '..', 'app', 'cookies');
  if (!fs.existsSync(cookieDir)) {
    // TODO for some strange reason recursive not working here cherviakov.ivan@gmail.com 18-09-2019
    fs.mkdirSync(cookieDir, { recursive: true });
  }

  const cookie_path_google = `${cookieDir}/${task.email}__google_cookie.json`;
  const cookie_path_youtube = `${cookieDir}/${task.email}__youtube_cookie.json`;
  const cookie_path_myaccount = `${cookieDir}/${task.email}__myaccount_cookie.json`;

  console.log(cookie_path_google)

  const xPathGoogleLoggedIn = "a[href*='https://accounts.google.com/SignOutOptions']";
  const xPathGoogleNotLoggedIn = "a[href*='https://accounts.google.com/ServiceLogin?']";

  const xPathYoutubeLoggedIn = "#avatar-btn";
  const xPathYoutubeNotLoggedIn = "a[href*='https://accounts.google.com/ServiceLogin?service=youtube']";

  const xPathMyAccountLoggedIn = 'figure[class="HJOYV HJOYVi11 Vz93id"]';
  const xPathMyAccountNotLoggedIn = "#identifierId, #identifier-shown #Email";
  const xPathMyAccountPassword = "input[name='password'], #password-shown #Passwd, #profileIdentifier";
  const xPathRecoveryEmail = 'input[name="knowledgePreregisteredEmailResponse"]'
  const xPathRecoveryLink = 'div[data-accountrecovery="false"]';

  const urlYoutube = "https://www.youtube.com";
  const urlGoogle = "https://www.google.com";
  const urlMyAccountGoogle = "https://myaccount.google.com/";
  const urlCaptcha = "https://aestell.com/recapctha";
  const xPathCapthcaTest = "button#gRecaptcha span";
  const xPathRecatpchaResult = "h4#response";

  console.log('+++++ is one click ++++', isOneClick);

  const accountLogin = async (is_logged_in, url, subSender, isOneClickSub=false) => {
    if (!is_logged_in) {
      await nightmare
        .cookies.clearAll()
        .goto(
          "https://accounts.google.com/signin/v2/identifier?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&followup=https%3A%2F%2Faccounts.google.com%2FManageAccount&flowName=GlifWebSignIn&flowEntry=ServiceLogin"
        )
        .wait(xPathMyAccountNotLoggedIn)
        .type(xPathMyAccountNotLoggedIn, task.email)
        .type(xPathMyAccountNotLoggedIn, "\u000d")
        .wait(xPathMyAccountPassword)
        .wait(3000);

      // await inputPassword();
      await nightmare
        .type(xPathMyAccountPassword, task.password)
        .type(xPathMyAccountPassword, "\u000d");

      console.log("inputed credentials, waiting mailbox ...", task.email);

      if (isOneClickSub === true) {
        const selectorImageChooseRecoveryEmail = '[src="//ssl.gstatic.com/accounts/marc/rescueemail.png"]';
        const selectorRecoveryEmail = '[name="email"]';
        const selectorDoneButton = '[type="submit"]';
        await nightmare.wait(`${xPathMyAccountLoggedIn}, ${selectorImageChooseRecoveryEmail}`);
        const imageChooseRecoveryEmailConfirmation = await nightmare.exists(selectorImageChooseRecoveryEmail);
        if (imageChooseRecoveryEmailConfirmation) {
          await nightmare.evaluate((selector) => {
            const confirmationButton = document.querySelector(selector).parentElement;
            if (confirmationButton) {
              confirmationButton.click();
            }
          }, selectorImageChooseRecoveryEmail);
          await nightmare.wait(selectorRecoveryEmail);
          const recoveryEmailInput = await nightmare.exists(selectorRecoveryEmail);
          if (recoveryEmailInput) {
            if (!task.recovery) {
              throw new Error(`recovery email not found: ${task.recovery}`);
            }
            await nightmare
              .type(selectorRecoveryEmail, task.recovery)
              .type(selectorRecoveryEmail, "\u000d")
              .click(selectorDoneButton)
              .wait(`${xPathMyAccountLoggedIn}`)
              .goto(urlMyAccountGoogle);
          }
        }
        await nightmare
          .wait(xPathMyAccountLoggedIn)
          .wait(1000)
        console.log("successfully logged in ...", task.email);
        return;
      }
      
      await nightmare.wait(`${xPathMyAccountLoggedIn}, ${xPathRecoveryEmail}, ${xPathRecoveryLink}`);
      const foundRecoveryLink = await nightmare.exists(xPathRecoveryLink);
      let foundRecoveryEmail = await nightmare.exists(xPathRecoveryEmail);
      console.log('________ RECOVER EMAIL FOUND_________', foundRecoveryLink, foundRecoveryEmail)
      if (foundRecoveryEmail || foundRecoveryLink) {
        if (!bot.show) {
          subSender.send("eye", { email: task.email, value: true });
          nightmare.show().then(console.log);
          bot.show = true;
        }

        if (foundRecoveryLink) {
          await nightmare
            .evaluate((xPathRecoveryLinkSub) => {
              const nodes = document.querySelectorAll(xPathRecoveryLinkSub);
              for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node && /email/.test(node.innerText)) {
                  node.click();
                  return true;
                }
              }

              return false;
            }, xPathRecoveryLink)
            .wait(xPathRecoveryEmail)
            .wait(3000)

          foundRecoveryEmail = await nightmare.exists(xPathRecoveryEmail);
        }

        if (foundRecoveryEmail) {
          if (task.recovery !== '') {
            const selector = `${xPathMyAccountLoggedIn}, div[data-user-email="${task.email.toLowerCase()}"]`
            await nightmare
              .type(xPathRecoveryEmail, task.recovery)
              .type(xPathRecoveryEmail, "\u000d")
              .wait(selector)
              .goto(urlMyAccountGoogle)
          }

          await nightmare
            .wait(xPathMyAccountLoggedIn)
            .wait(1000)
        }
      }
      console.log("successfully logged in ...", task.email);
      if (isOneClickSub) return;

      await export_cookie(urlYoutube);
      await export_cookie(urlGoogle);
      await export_cookie(url);
    }
  };

  const load_cookie = async (url, subSender, isOneClickSub = false) => {
    if (!is_cookie_running) return;
    const isYoutube = url.toLowerCase().includes(urlYoutube);
    const isGoogle = url.toLowerCase().includes(urlGoogle);
    const isMyGoogle = url.toLowerCase().includes(urlMyAccountGoogle);
    // console.log('******* LOAD COOKIE **********', 'Youtube=', isYoutube, ' Google=', isGoogle, ' MyGoogle=', isMyGoogle);

    if (!isGoogle && !isYoutube && !isMyGoogle) {
      throw new Error("Load Cookie url is not correct!");
    }

    let cookie_path = null;
    let is_logged_in = null;

    if (isMyGoogle) {
      const selector = `${xPathMyAccountLoggedIn},${xPathMyAccountNotLoggedIn}, ${xPathGoogleNotLoggedIn}`;
      cookie_path = cookie_path_myaccount;

      await nightmare
        .cookies.clearAll()
        .goto(urlMyAccountGoogle)
        .wait(selector);
    } else if (isYoutube) {
      const selector = `${xPathYoutubeLoggedIn}, ${xPathYoutubeNotLoggedIn}`;
      cookie_path = cookie_path_youtube;

      await nightmare
        .cookies.clearAll()
        .goto(urlYoutube)
        .wait(selector);
    } else if (isGoogle) {
      const selector = `${xPathGoogleLoggedIn}, ${xPathGoogleNotLoggedIn}`;
      cookie_path = cookie_path_google;

      await nightmare
        .cookies.clearAll()
        .goto(urlGoogle)
        .wait(selector)
    }

    // console.log('*** cookie path ***', cookie_path);
    try {
      const cookie_json_data = JSON.parse(fs.readFileSync(cookie_path));

      for (let i = 0; i < cookie_json_data.length; i++) {
        // eslint-disable-next-line
        await nightmare
          .cookies
          .set(cookie_json_data[i].name, cookie_json_data[i].value)
      }
    } catch (e) {
      Sentry.captureException(e);
      console.error('xxxxxxxxxxxxxx', e);
    }

    await nightmare
      .refresh()
      .wait(5000)

    if (isMyGoogle) {
      is_logged_in = await nightmare.exists(xPathMyAccountLoggedIn);
    } else if (isGoogle) {
      is_logged_in = await nightmare.exists(xPathGoogleLoggedIn);
    } else if (isYoutube) {
      is_logged_in = await nightmare.exists(xPathYoutubeLoggedIn);
    }

    if (isOneClickSub) return;
    
    await accountLogin(is_logged_in, url, subSender)
  }

  const export_cookie = async (url) => {
    const isYoutube = url.toLowerCase().includes(urlYoutube);
    const isGoogle = url.toLowerCase().includes(urlGoogle);
    const isMyGoogle = url.toLowerCase().includes(urlMyAccountGoogle);

    // console.log('******* EXPORT COOKIE **********', 'Youtube=', isYoutube, ' Google=', isGoogle, ' MyGoogle=',isMyGoogle);

    if (!isGoogle && !isYoutube && !isMyGoogle) {
      throw new Error("Load Cookie url is not correct!");
    }

    if (isMyGoogle) {
      const selector = `${xPathMyAccountLoggedIn},${xPathMyAccountNotLoggedIn},${xPathGoogleNotLoggedIn}`;
      try {
        fs.unlinkSync(cookie_path_myaccount);
      } catch (err) {
        Sentry.captureException(err);
      }

      await nightmare
        .goto(urlMyAccountGoogle)
        .wait(selector)
        .wait(1000)
        .catch(error => {
          Sentry.captureException(error);
          console.error('Search failed:', error)
        })

      const cookie_myaccount_logged_in = await nightmare.exists(xPathMyAccountLoggedIn)
      if (cookie_myaccount_logged_in) {
        await nightmare
          .cookies.get()
          .then(function (cookies) {
            fs.writeFileSync(cookie_path_myaccount, JSON.stringify(cookies), err => {
              if (err) {
                alert(`An error ocurred creating the file: ${err.message}`);
              }
            });
          // eslint-disable-next-line
          }.bind({ cookie_path_myaccount }))
      }
    } else if (isGoogle) {
      try {
        fs.unlinkSync(cookie_path_google);
      } catch (err) {
        Sentry.captureException(err);
      }

      const selector = `${xPathGoogleLoggedIn}, ${xPathGoogleNotLoggedIn}`;
      await nightmare
        .goto(urlGoogle)
        .wait(selector)
        .wait(1000)
        .catch(error => {
          Sentry.captureException(error);
          console.error('Search failed:', error)
        })

      const cookie_google_logged_in = await nightmare.exists(xPathGoogleLoggedIn)
      if (cookie_google_logged_in) {
        await nightmare
          .cookies.get()
          .then(function (cookies) {
            fs.writeFileSync(cookie_path_google, JSON.stringify(cookies), err => {
              if (err) {
                alert(`An error ocurred creating the file: ${err.message}`);
              }
            });
          // eslint-disable-next-line
          }.bind({ cookie_path_google }))
      }
    } else if (isYoutube) {
      try {
        fs.unlinkSync(cookie_path_youtube);
      } catch (err) { 
        Sentry.captureException(err);
      }

      const selector = `${xPathYoutubeLoggedIn},${xPathYoutubeNotLoggedIn}`;
      await nightmare
        .goto(urlYoutube)
        .wait(selector)
        .wait(1000)
        .catch(error => {
          Sentry.captureException(error);
          console.error('Search failed:', error)
        })

      const cookie_youtube_logged_in = await nightmare.exists(xPathYoutubeLoggedIn)

      if (cookie_youtube_logged_in) {
        await nightmare
          .cookies.get()
          .then(function (cookies) {
            fs.writeFileSync(cookie_path_youtube, JSON.stringify(cookies), err => {
              if (err) {
                Sentry.captureException(err);
                alert(`An error ocurred creating the file: ${err.message}`);
              }
            });
          // eslint-disable-next-line
          }.bind({ cookie_path_youtube }))
      }
    }

    // console.log('********** EXPORT COOKIE COMPLETE ***********')
  }

  if (isOneClick) {
    try {
      await nightmare
        // .useragent(
        //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.54 Safari/537.36"
        // )
        .authentication(username, password)
        .viewport(1200, 900)

      // nightmare.show().then(console.log);
      await accountLogin(false, urlMyAccountGoogle, sender, true);
        
      const captcha_result_text = await nightmare
        .goto(urlCaptcha)
        .wait(5000)
        .wait(xPathCapthcaTest)
        .evaluate((xPathCapthcaTestSub) => {
          return document.querySelector(xPathCapthcaTestSub).click();
        }, xPathCapthcaTest)
        .wait(5000)
        .evaluate((xPathRecatpchaResultSub) => {
          return document.querySelector(xPathRecatpchaResultSub).innerText;
        }, xPathRecatpchaResult);

      console.log('***** capthca result ******', captcha_result_text);
      if (captcha_result_text.includes('success')) {
        sender.send("captcha-result", { email: task.email, oneclick: 2 });
      } else {
        sender.send("captcha-result", { email: task.email, oneclick: 0 });
      }
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
    }

    await nightmare.end();
    nightmare.proc.disconnect();
    nightmare.proc.kill();
    nightmare.ended = true;
    nightmare = null;

    running_bots.splice(running_bots.findIndex(bot => bot.email === task.email));
    sender.send("actionLog", { status: "Scheming", email: task.email });
    return;
  }

  const bot = { nightmare, email: task.email, task, show: false };
  running_bots.push(bot);

  sender.send("actionLog", { status: "Logging in", email: task.email });
  sender.send("eye", { email: task.email, value: false });

  try {
    console.log('authenticating',nightmare, username, password);
    await nightmare
      .useragent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.54 Safari/537.36"
      )
      .authentication(username, password)
      .viewport(1200, 900)

    sender.send("actionLog", { status: "Readying", email: task.email });
    await load_cookie(urlMyAccountGoogle, sender);
    sender.send("actionLog", { status: "Logging in", email: task.email });
    const is_logged_in = await nightmare.exists(xPathMyAccountLoggedIn);
    console.log('******** check my account login **************', is_logged_in)

    await accountLogin(is_logged_in, urlMyAccountGoogle, sender);
    nightmare.hide().then(console.log);
    sender.send("eye", { email: task.email, value: false });
    bot.show = false;
  } catch (e) {
    Sentry.captureException(e);
    console.error(e);
    return;
  }

  const id = setTimeout(() => pauseTask(task), randomMsSec(min_run, max_run));
  bot.timeId = id;
  bot.fTime = performance.now();

  sender.send("actionLog", { status: "Marinating", email: task.email });

  const targets = myTargets.slice(0);
  targets.sort(() => Math.random() - 0.5);
  console.log('-------targets-------', targets)

  try {
    let length = 0;
    if (gsearch) length += searches.length;
    if (youtube) length += youtubes.length;
    if (length) {
      // sender.send("oneClick", { value: parseFloat(0.13), email: task.email });
    }

    const waitForReady = () => {
      return new Promise((res) => {
        const waitForURL = setInterval(async () => {
          const curl = await nightmare.url();
          console.log("current url ....", curl);
          if (curl !== "https://linkedin.com/") {
            res(true);
            clearInterval(waitForURL);
          }
        }, 500);
      });
    };

    for (let i = 0; i < total_loop; i += 1) {
      bot.currentTarget = 0;
      while (bot.currentTarget < targets.length) {
        const target = targets[bot.currentTarget];
        await waitForReady();
        try {
          if (target.toLowerCase().includes("youtube.com") && youtube) {
            console.log(
              "youtube video watching ....",
              target,
              task.email,
              Date(Date.now())
            );
            sender.send("actionLog", { status: "Readying", email: task.email });
            await load_cookie(urlYoutube, sender);
            sender.send("actionLog", { status: "Marinating", email: task.email });
            await nightmare.goto(target);
            await nightmare.wait(
              randomMsSec(youtube_duration_min, youtube_duration_max)
            );
            await export_cookie(urlYoutube);
          } else if (gsearch) {
            console.log(
              "Google bulk ad keyword searching ....",
              target,
              task.email,
              Date(Date.now())
            );

            sender.send("actionLog", { status: "Readying", email: task.email });
            await load_cookie(urlGoogle, sender);
            sender.send("actionLog", { status: "Marinating", email: task.email });

            await nightmare.goto(urlGoogle);
            await nightmare
              .wait("input[name='q']")
              .type("input[name='q']", target)
              .type("input[name='q']", "\u000d")
              .wait(randomMsSec(gsearch_duration_min, gsearch_duration_max));
            await export_cookie(urlGoogle);
          }
        } catch (e) {
          Sentry.captureException(e);
          console.error(e);
        }

        bot.currentTarget += 1;
      }
    }
  } catch (e) {
    Sentry.captureException(e);
    console.error(e);
    return;
  }

  await nightmare.end();
  nightmare.proc.disconnect();
  nightmare.proc.kill();
  nightmare.ended = true;
  nightmare = null;

  running_bots = running_bots.filter((runBot) => runBot.email !== task.email);
  sender.send("actionLog", { status: "Scheming", email: task.email });
};

const startTask = async (task) => {
  console.log('startTask', task.email);
  console.log({ scheduled_bots, paused_bots, running_bots });
  running_profiles += 1;

  const scheduledBot = scheduled_bots.find((bot) => bot.email === task.email);
  if (scheduledBot) {
    scheduled_bots = scheduled_bots.filter((bot) => bot.email !== task.email);
  }

  const pausedBot = paused_bots.find((bot) => bot.email === task.email);

  if (pausedBot == null) {
    console.log("starting task ....", task.email);
    runTask(task);
  } else {
    console.log("resuming task ....", task.email);
    sender.send("actionLog", { status: "Marinating", email: task.email });
    paused_bots = paused_bots.filter((bot) => bot.email !== task.email);
    if (!running_bots.find((bot) => bot.email === task.email)) {
      running_bots.push(pausedBot);
    }
    let target = myTargets[pausedBot.currentTarget];
    while (!target) {
      // eslint-disable-next-line
      target = myTargets[--pausedBot.currentTarget];
    }
    if (target.includes("youtube.com") && youtube) {
      pausedBot.nightmare.goto(target);
    } else if (gsearch) {
      pausedBot.nightmare.goto("https://www.google.com/");
    }
    const id = setTimeout(() => pauseTask(task), randomMsSec(min_run, max_run));
    pausedBot.timeId = id;
    pausedBot.fTime = performance.now();
  }
};

export const addTask = (task) => {
  console.log('addTask', task.email);
  if (scheduled_bots.find((bot) => bot.email === task.email) ||
      paused_bots.find((bot) => bot.email === task.email) ||
      running_bots.find((bot) => bot.email === task.email)) {
    console.error('this task already in process', task.email, 'exiting');
    return;
  }
  console.log({ scheduled_bots, paused_bots, running_bots });
  const bot = { email: task.email };
  if (!scheduled_bots.find((sBot) => sBot.email === task.email)) {
    scheduled_bots.push(bot);
  }
  sender.send("actionLog", { status: "Scheduling", email: task.email });
  const id = setInterval(() => {
    if (running_profiles < max_profiles) {
      clearInterval(id);
      bot.timeId = null;
      startTask(task)
        .catch((err) => {
          Sentry.captureException(err);
          console.error(err);
        });
    }
  }, 1000);
  bot.timeId = id;
};

export const startOneClick = (task) => {
  console.log('startOneClick', task.email);
  const bot = { email: task.email };

  const id = setInterval(() => {
    clearInterval(id);
    bot.timeId = null;
    const scheduledBot = scheduled_bots.find((sBot) => sBot.email === task.email);
    if (scheduledBot) {
      scheduled_bots = scheduled_bots.filter((fBot) => fBot.email !== task.email);
    }

    const pausedBot = paused_bots.find((pBot) => pBot.email === task.email);

    if (pausedBot == null) {
      console.log("starting one click ....", task.email);
      runTask(task, true)
        .catch((err) => {
          Sentry.captureException(err);
          console.error(err);
          if (!err.message.includes('IPC channel is already disconnected')) {
            sender.send("captcha-result", { email: task.email, oneclick: 0 });
          }
        });
    }
  }, 1000);
  bot.timeId = id;
};

const pauseTask = async (task) => {
  console.log('pause task', task.email);
  console.log({ scheduled_bots, paused_bots, running_bots });
  const runningBot = running_bots.find((bot) => bot.email === task.email);
  if (runningBot == null) {
    console.log("No running task to pause", task.email);
    return;
  }

  try {
    console.log("pausing task ....", task.email);
    sender.send("actionLog", { email: task.email, status: "Napping" });
    const { nightmare: runningNightmare } = runningBot;
    running_profiles -= 1;
    const id = setTimeout(() => startTask(task).catch((err) => {
      console.error(err);
      Sentry.captureException(err);
    }), randomMsSec(min_slp, max_slp));
    if (!paused_bots.find((bot) => bot.email === task.email)) {
      paused_bots.push(runningBot);
    }
    runningBot.timeId = id;
    runningBot.fTime = performance.now();
    await runningNightmare.goto("https://linkedin.com/");
  } catch (e) {
    Sentry.captureException(e);
    console.error(e);
  } finally {
    running_bots = running_bots.filter((bot) => bot.email !== task.email);
  }
};

export const stopTask = async (task) => {
  console.log("terminating task ....", task.email);
  console.log({ scheduled_bots, paused_bots, running_bots });
  sender.send("actionLog", { status: "Terminated", email: task.email });
  const scheduledBot = scheduled_bots.find((bot) => bot.email === task.email);
  const runningBot = running_bots.find((bot) => bot.email === task.email);
  const pausedBot = paused_bots.find((bot) => bot.email === task.email);
  if (scheduledBot) {
    console.log('bot scheduled', scheduledBot.timeId);
    clearTimeout(scheduledBot.timeId);
    clearInterval(scheduledBot.timeId);
    scheduled_bots = scheduled_bots.filter((bot) => bot.email !== task.email);
    console.log({ scheduled_bots, paused_bots, running_bots });
    return;
  }
  if (runningBot) {
    console.log('bot running', runningBot.timeId);
    clearTimeout(runningBot.timeId);
    clearInterval(runningBot.timeId);
    try {
      await runningBot.nightmare.end();
      runningBot.nightmare.proc.disconnect();
      runningBot.nightmare.proc.kill();
      runningBot.nightmare.ended = true;
      runningBot.nightmare = null;
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
    } finally {
      running_bots = running_bots.filter((bot) => bot.email !== task.email);
      running_profiles -= 1;
      console.log({ scheduled_bots, paused_bots, running_bots });
    }
    return;
  } 
  if (pausedBot) {
    console.log('bot paused', pausedBot.timeId);
    clearTimeout(pausedBot.timeId);
    clearInterval(pausedBot.timeId);
    try {
      await pausedBot.nightmare.end();
      pausedBot.nightmare.proc.disconnect();
      pausedBot.nightmare.proc.kill();
      pausedBot.nightmare.ended = true;
      pausedBot.nightmare = null;
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
    } finally {
      paused_bots = paused_bots.filter((bot) => bot.email !== task.email);
      console.log({ scheduled_bots, paused_bots, running_bots });
    }
    return;
  }
  console.log("No task to terminate");
};

export const showTask = async task => {
  let index = running_bots.findIndex(bot => bot.email === task.email);
  if (index !== -1) {
    console.log("showing running task ....", task.email);
    await running_bots[index].nightmare.show();
    running_bots[index].show = true;
  } else {
    index = paused_bots.findIndex(bot => bot.email === task.email);
    if (index !== -1) {
      console.log("showing paused task ....", task.email);
      await paused_bots[index].nightmare.show();
      paused_bots[index].show = true;
    }
  }
};

export const hideTask = async task => {
  let index = running_bots.findIndex(bot => bot.email === task.email);
  if (index !== -1) {
    console.log("hiding running task ....", task.email);
    await running_bots[index].nightmare.hide();
    running_bots[index].show = false;
  } else {
    index = paused_bots.findIndex(bot => bot.email === task.email);
    if (index !== -1) {
      console.log("hiding paused task ....", task.email);
      await paused_bots[index].nightmare.hide();
      paused_bots[index].show = false;
    }
  }
};

export const changeSetting = (duration, maxProfile, gSearch, yOutube) => {
  setSettings(duration, maxProfile, gSearch, yOutube);
};

const setDuration = (type, duration) => {
  if (
    type === "slp" &&
    (min_slp !== duration.min || max_slp !== duration.max)
  ) {
    min_slp = duration.min;
    max_slp = duration.max;

    paused_bots.forEach((bot) => {
      const updatedBot = { ...bot };
      const elp = performance.now() - updatedBot.fTime;
      const rmt = randomMsSec(min_slp, max_slp) - elp;
      clearTimeout(updatedBot.timeId);
      if (rmt > 0) {
        updatedBot.timeId = setTimeout(() => startTask(updatedBot.task).catch((err) => {
          console.error(err);
          Sentry.captureException(err);
        }), rmt);
      } else {
        startTask(updatedBot.task)
          .catch((err) => {
            console.error(err);
            Sentry.captureException(err);
          });
      }
    });
  } else if (
    type === "run" &&
    (min_run !== duration.min || max_run === duration.max)
  ) {
    min_run = duration.min;
    max_run = duration.max;

    running_bots.forEach(bot => {
      const updatedBot = { ...bot };
      const elp = performance.now() - updatedBot.fTime;
      const rmt = randomMsSec(min_run, max_run) - elp;
      clearTimeout(updatedBot.timeId);
      if (rmt > 0) {
        updatedBot.timeId = setTimeout(() => pauseTask(updatedBot.task), rmt);
      } else {
        pauseTask(updatedBot.task);
      }
    });
  }
};

const setSettings = (duration, maxProfile, gs, yt) => {
  console.log("settings ....");
  setDuration("slp", duration.sleep);
  setDuration("run", duration.run);
  max_profiles = maxProfile;
  gsearch = gs;
  youtube = yt;
};

export const setSender = emitter => {
  sender = emitter;
};
