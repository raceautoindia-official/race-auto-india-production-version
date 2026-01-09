import schedule from "node-schedule";

// Schedule job to run every 10 seconds
const job = schedule.scheduleJob("*/10 * * * * *", function () {
  console.log("This job runs every 10 seconds!");
});
