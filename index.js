
  // Made By Social404 Do Not Leak!
  
  // Libs
  const crypto = require("crypto")
  const puppeteer = require('puppeteer-extra')
  const StealthPlugin = require('puppeteer-extra-plugin-stealth')
  const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
  const { uniqueNamesGenerator, adjectives, colors, animals, countries, names, languages, starWars } = require('unique-names-generator')
  const { PuppeteerBlocker } = require('@cliqz/adblocker-puppeteer')
  const {fetch} = require('cross-fetch')
  const fs = require('fs')
  const { Console } = require('console')

  // Settings
  const captchakey = ''
  const PROXY_ADDR = ''
  const PROXY_USERNAME = ''
  const PROXY_PASSWORD = ''
  const BROWSER_CONFIG = {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      "--proxy-server=" + PROXY_ADDR,
      '--window-size=1600,900',
    ],
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    headless: false,
  }

  // Init plugins
  puppeteer.use(StealthPlugin())

  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: captchakey,
      },
      visualFeedback: true,
      throwOnError: true
    })
  )

  // Console logs
  const o = fs.createWriteStream('./stdout.log', {flags:'a'})
  const errorOutput = fs.createWriteStream('./stderr.log', {flags:'a'})
  const accounts = fs.createWriteStream('accounts.txt', {flags:'a'})
  const logger = new Console(o, errorOutput)

  const t0 = process.hrtime();
  function write_log(goodnews, text){
    const t1 = process.hrtime(t0);
    const time = (t1[0]* 1000000000 + t1[1]) / 1000000000;
    const color = goodnews ? "\x1b[32m" : "\x1b[31m";

    console.log(`${color} [LOG - ${time}s] \x1b[37m ${text}`);
    logger.log(`[LOG - ${time}s] ${text}`);
  }

  // Code start there
  async function fill_input(page, infoname, info){
    const p = await page.$('input[name=' + infoname + ']');
    await p.focus();
    await page.keyboard.type(info);
  }

  async function click_date(page, name, min, max) {
    var i = await page.$('[class*=input' + name + "]");
    await i.click();
    var r = Math.floor(Math.random() * (max - min + 1)) + min;

    await page.waitForSelector('[class*=option]');
    await page.$eval("[class$=option]", function(e, r){e.parentNode.childNodes[r].click()}, r);

    return r
  }

  async function fill_discord(DiscordPage, username, password, email){
    await DiscordPage.bringToFront();
    await DiscordPage.goto('https://discord.com/register', {"waitUntil" : "networkidle0", timeout: 70000});

    write_log(true, "Create discord account");
    await click_date(DiscordPage, "Year", 17, 24);
    await click_date(DiscordPage, "Day", 0, 28);
    await click_date(DiscordPage, "Month", 0, 11);

    DiscordPage.waitForSelector('input[type*=checkbox]').then(() => {
      DiscordPage.$eval('input[type*=checkbox]', el => el.click());
    }).catch(e => {});

    await fill_input(DiscordPage, "username", username);
    await fill_input(DiscordPage, "password", password);
    await fill_input(DiscordPage, "email", email);
    await DiscordPage.$eval('button[type=submit]', (el) => el.click());
  }

  const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  async function break_captcha(DiscordPage){
    try {
      await DiscordPage.waitForSelector('[src*=sitekey]');
      write_log(false, "Captcha found");

      while(true){
        try{
          await DiscordPage.solveRecaptchas();
          var t;

          write_log(true, "Captcha passed");
          return true;
        } catch(err) {
          write_log(false, "Captcha - Error");
          sleep(3000);
        }
      }
    } catch(e){
      write_log(true, "Captcha not found");
    };
  }

  async function generate_email(MailPage){
    write_log(true, "Creating mail");
    PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
      blocker.enableBlockingInPage(MailPage);
    });

    await MailPage.bringToFront();
    await MailPage.goto("https://temp-mail.org/fr/", { waitUntil: 'networkidle2', timeout: 0});
    var info_id = "#mail";

    try {
      await MailPage.waitForSelector(info_id);
      await MailPage.waitForFunction((info_id) => document.querySelector(info_id).value.indexOf("@") != -1, {}, info_id);
      
      var email = await MailPage.$eval('#mail', el => el.value);
      return email;
    } catch(e){
      console.log("Found error - Mail generation");
      return false;
    };
  }

  async function validate_email(MailPage){
    write_log(true, "Verifying mail");
    await MailPage.bringToFront();

    while(true){
      await MailPage.mouse.wheel({ deltaY: (Math.random()-0.5)*200 });

      try {
        await MailPage.waitForSelector('[title*=Discord]', {timeout: 500});
        sleep(1000);
        await MailPage.$eval('[title*=Discord]', e => e.parentNode.click());
      
        await MailPage.waitForSelector("td > a[href*='discord'][style*=background]");
        const elem = await MailPage.$eval("td > a[href*='discord'][style*=background]", el => el.href);
      
        return elem;
      } catch(e){};
    }
  }

  async function verif_compte(browser, link){
    const page = await browser.newPage();
    await page.goto(link, {"waitUntil" : "networkidle0", "timeout": 60000});
    break_captcha(page);
  }

  async function create_accinfos(browser, d) {
    // Variables importantes
    const username = uniqueNamesGenerator({dictionaries: [adjectives, colors, animals, countries, names, languages, starWars],  separator: '', style: "capital",length: 3,});
    const password = crypto.randomBytes(16).toString('hex');
    const MailPage = (await browser.pages())[0];
    var email;

    while(!email){
      try {
        email = await generate_email(MailPage);
      } catch(e){};
    }

    write_log(true, `Username: ${username}`);
    write_log(true, `Password: ${password}`);
    write_log(true, `E-mail: ${email}`);

    // Create acc, pass captcha
    const DiscordPage = d;
    await fill_discord(DiscordPage, username, password, email);

    const client = d._client;
    var token;

    client.on('Network.webSocketFrameSent', ({requestId, timestamp, response}) => {
      try {
        const json = JSON.parse(response.payloadData);
        if(!token && json["d"]["token"]){
          token = json["d"]["token"];
          write_log(true, `Token: ${token}`);
        };
      } catch(e){};
    })
    await break_captcha(DiscordPage);

    // Verify email
    let page_a_valider = await validate_email(MailPage);
    await verif_compte(browser, page_a_valider);
    write_log(true, "Account verified");

    if(!token){
      write_log(false, "Token not found, trying to get it")
      await DiscordPage.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    };

    return `${email}:${username}:${password}:${token}`;
  }

  (async () => {
    console.log("======");
    const browser = await puppeteer.launch(BROWSER_CONFIG);

    try {
      const page = await browser.newPage();
    
      await page.authenticate({
        username: PROXY_USERNAME,
        password: PROXY_PASSWORD
      });

      await page.goto('http://httpbin.org/ip');
      const infos = await create_accinfos(browser, page);
      write_log(true, "Complete infos");
      accounts.write(infos + "\n");
    } catch(e) {
      console.log(e);
    } finally {
      write_log(true, "Done");
      try{
        browser.close();
      } catch(e){};
    }
  })();






  async function check_proxy(file){
    var proxy = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(file),
      output: process.stdout,
      console: true
    });
    for await (const line of rl) {
      var s = line.split(":");
      if(s.length == 0){
        continue;
      }
    };
    return proxy;
  }

