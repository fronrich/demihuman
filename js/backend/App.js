import express from "express";
import RenderApis from "./apis/RenderApis.js";

import os from "os";
import cluster from "cluster";

const app = express();
const rAPIs = new RenderApis(app);
const PORT = process.env.PORT || 3001;

const main = async () => {
  app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  await rAPIs.exec();

  app.get("/", async (req, res) => {
    res.send("demihuman server is up!");
  });

  const cpus = os.cpus();
  let workers = [];

  // const clusterWorkerSize = 1;
  if (cpus.length > 1) {
    if (cluster.isPrimary) {
      workers = cpus.map((cpu) => {
        const worker = cluster.fork();
        // to receive messages from worker process
        worker.on("message", (message) => {
          console.log(message);
        });
        return worker;
      });

      cluster.on("exit", (worker) => {
        console.log("Main", worker.id, " has exitted.");
      });
    } else if (cluster.isWorker) {
      // process is clustered on a core and process id is assigned
      cluster.on("online", (worker) => {
        console.log("Worker " + worker.process.pid + " is listening");
      });
      cluster.on("exit", (worker, code, signal) => {
        console.log(
          "Worker",
          worker.process.pid,
          "died with code:",
          code,
          "and signal:",
          signal
        );
        console.log("Starting a new worker");
        cluster.fork();
        workers.push(cluster.fork());
        // to receive messages from worker process
        workers[workers.length - 1].on("message", function (message) {
          console.log(message);
        });
      });
      app.listen(PORT, () => {
        console.log(
          `Express server listening on port ${PORT} and worker ${process.pid}`
        );
      });
    }
  } else {
    app.listen(PORT, function () {
      console.log(
        `Express server listening on port ${PORT} with the single worker ${process.pid}`
      );
    });
  }
};

await main();
