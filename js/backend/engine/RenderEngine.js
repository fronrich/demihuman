// use nodejs canvas to render in bg
import pkg from "canvas";
import { plantGeneric, plant } from "../utils/GenUtils.js";
import { sketch, stylize } from "../utils/VizUtils.js";
import SeededRandom from "../utils/RandUtils.js";

const { createCanvas } = pkg;
class RenderEngine {
  constructor(crop = true) {
    this.scale = 1;
    this.canvasSize = 5000;
    this.canvas = createCanvas(
      this.canvasSize * this.scale,
      this.canvasSize * this.scale
    );
    this.crop = crop;
  }

  async render(genome) {
    const SRNG = new SeededRandom();
    SRNG.reset();
    const plantStruct = plant(2500, 4000, genome);
    console.log("plant structure generated");
    await sketch(this.canvas, plantStruct, this.scale, false);
    const sketchBuff = this.canvas.toBuffer();
    console.log("rough sketch generated");

    const imgBuff = await stylize(sketchBuff, this.crop);
    console.log("done!");
    return imgBuff;
  }
}

export default RenderEngine;
