import bodyParser from "body-parser";
import { dbRead, dbWrite } from "../utils/DatabaseUtils.js";
import { renderRes, renderDisk } from "../utils/RenderUtils.js";
import * as fs from "fs";
class RenderApis {
  constructor(app) {
    RenderApis.seedCache = ["hello world"];
    // create application/json parser
    this.jsonParser = bodyParser.json();
    this.app = app;
  }

  exec = async () => {
    await this.app.post("/upload", this.jsonParser, async (req, res) => {
      console.log("in upload");
      let data = await req.body;
      dbWrite(data);
      await res.send({ status: "complete" });
    });

    await this.app.get("/render", (req, res) => {
      try {
        res.setHeader("Content-Type", "image/png");
        // read from database
        const { seed, genome } = dbRead();
        // use this seed to generate the cache
        return renderRes(seed, genome, true, res);
      } catch (err) {
        console.log(err);
      }
    });

    await this.app.get("/render-bg", async (req, res) => {
      console.log("in render-bg");
      try {
        res.setHeader("Content-Type", "image/png");
        // read from database
        const { seed, genome, index } = dbRead();
        // use this seed to generate the cache
        return await renderDisk(
          seed,
          genome,
          true,
          `render${index ? `_${index}` : ""}.png`
        );
      } catch (err) {
        if (err) console.log(err);
      }
    });

    // render the sequences of genomes into a directory
    await this.app.get("/render-bg-sequence", async (req, res) => {
      try {
        res.setHeader("Content-Type", "image/png");
        // read from database
        const { seed, genomes } = dbRead();
        // for each genome, generate a new frame
        genomes.map((genome, index) => {
          renderDisk(seed, genome, false, `render_${index}.png`);
        });
      } catch (err) {
        console.log(err);
      }
    });
  };
}

export default RenderApis;
