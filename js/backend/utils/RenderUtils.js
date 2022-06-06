import RenderEngine from "../engine/RenderEngine.js";
import SeededRandom from "./RandUtils.js";
import os from "os";
import process from "process";
import * as fs from "fs";

// use seed and genome to generate an image buffer
const getImgBuf = async (seed, genome, crop = true) => {
  // use this seed to generate the cache
  const SRNG = new SeededRandom();
  SRNG.setSeed(seed);
  SRNG.reset();
  const re = new RenderEngine(crop);

  return await re.render(genome);
};

// render plant viz as api response
export const renderRes = async (seed, genome, crop, res) => {
  return await res.send(await getImgBuf(seed, genome, crop));
};

// render plant viz to the disk
export const renderDisk = async (seed, genome, crop, dest) => {
  const relDest = process.cwd() + "/../../render/" + dest;
  console.log("render to", relDest);

  return await fs.writeFile(
    relDest,
    await getImgBuf(seed, genome, crop),
    "binary",
    function (err) {
      console.log(relDest);
      if (err) console.log(err);
    }
  );
};
