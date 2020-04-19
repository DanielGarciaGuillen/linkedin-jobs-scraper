const { LinkedinScraper, events } = require("./index.js");

/* 
var admin = require("firebase-admin");
const functions = require("firebase-functions");
const moment = require("moment");
var serviceAccount = require("../serviceAccountKey.json");
var isEqual = require("lodash/isEqual");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://linkedinjobs.firebaseio.com/",
  });
}

const generalTechJobsDB = admin.database().ref("general");

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: "1GB",
}; */
/* 
exports.InvestOttawaJobs = functions
  .runWith(runtimeOpts)
  .pubsub.schedule("58 7-23/8 * * *")
  .onRun(async (context) => {
    await generalTechScrapper();
    console.log("Scrapped jobs finished");
  }); */

const generalTechScrapper = () => {
  (async () => {
    // Programatically disable logger
    setTimeout(() => LinkedinScraper.disableLogger(), 5000);

    // Each scraper instance is associated with one browser.
    // Concurrent queries will be runned on different pages within the same browser instance.
    const scraper = new LinkedinScraper({
      headless: false,
      slowMo: 10,
    });

    // Listen for custom events
    scraper.on(
      events.custom.data,
      ({ query, location, link, title, company, place, description, date }) => {
        console.log(date);
        if (date.toLowerCase() === "1 day ago") {
          const job = {
            query,
            location,
            link,
            title,
            company,
            place,
            description,
            date,
          };
          console.log(job);
        }
      }
    );

    scraper.on(events.custom.error, (err) => console.log("ERROR", err));

    scraper.on(events.custom.end, () => {
      /*   generalTechJobs.forEach((job) => {
        const jobKey = generalTechJobsDB.push();
        jobKey.set(job);
      }); */
    });

    // Listen for puppeteer specific browser events
    scraper.on(events.puppeteer.browser.targetcreated, () => {});
    scraper.on(events.puppeteer.browser.targetchanged, () => {});
    scraper.on(events.puppeteer.browser.targetdestroyed, () => {});
    scraper.on(events.puppeteer.browser.disconnected, () => {});

    // This will be executed on browser side
    const descriptionProcessor = () =>
      document.querySelector(".job-result-card__listdate").innerText;

    // Run queries concurrently
    await Promise.all([
      scraper.run(["Software Engineer"], "Ottawa", {
        paginationMax: 15,
        /*   descriptionProcessor, */
      }),
      /*  scraper.run(["developer"], "Ottawa", {
        paginationMax: 1,
        descriptionProcessor
      }),
      scraper.run(["data_science"], "Ottawa", {
        paginationMax: 1,
        descriptionProcessor
      }),
      scraper.run(["customer_support"], "Ottawa", {
        paginationMax: 1,
        descriptionProcessor
      }),
      scraper.run(["tech"], "Ottawa", {
        paginationMax: 1,
        descriptionProcessor
      }), */
    ]);

    // Close browser
    await scraper.close();
  })();
};

generalTechScrapper();
