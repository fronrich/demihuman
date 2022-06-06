import Jimp from "jimp";
import { randVar } from "./MathUtils.js";
import { getBranches } from "./StructUtils.js";

const colorAdd = (hex, add) => {
  // create macro noise to differently color different parts of the plant
  try {
    var aRgbHex = hex.replace("#", "").match(/.{1,2}/g);
    var aRgb = [
      parseInt(aRgbHex[0], 16),
      parseInt(aRgbHex[1], 16),
      parseInt(aRgbHex[2], 16),
    ];
    let newColor = "#";
    // convert to hex with noise added
    aRgb.map((channel) => {
      const trailColor = channel + add;
      newColor += (
        trailColor > 0 && trailColor < 255 ? trailColor : channel
      ).toString(16);
    });
    return newColor;
  } catch {
    return hex;
  }
};

// subtract sub from hex
// returns darker color
const colorSub = (hex, sub) => {
  return colorAdd(hex, sub * -1);
};

// create a variation of hex color
const colorVar = (hex, varience = 40) => {
  const noise = randVar(varience);
  return colorAdd(hex, noise);
};

// draw a line
const drawLine = async (
  canvas,
  x1,
  y1,
  x2,
  y2,
  width,
  color,
  outlineType = "branch"
) => {
  const brush = canvas.getContext("2d", { alpha: true });
  // outline around line
  brush.beginPath();
  // draw between x1,y1, and x2,y2
  brush.moveTo(x1, y1);
  brush.lineTo(x2, y2);

  brush.strokeStyle = colorSub(color, 40);
  brush.lineWidth = width + 3;
  brush.lineCap = outlineType === "segment" ? "butt" : "round";
  brush.stroke();

  brush.closePath();

  // line
  brush.beginPath();
  // draw between x1,y1, and x2,y2
  brush.moveTo(x1, y1);
  brush.lineTo(x2, y2);

  brush.strokeStyle = color;
  brush.lineWidth = width;
  brush.lineCap = "round";
  brush.stroke();

  brush.closePath();
};

// html5 canvas plant renderer
// multithreadeded for super fast rendering
export const sketch = async (canvas, renderJSON, scale = 1) => {
  const { COLOR, STRUCTURE } = renderJSON;
  let iter = 0;
  let completion = 0;
  const loadInc = 5;
  const totalBranches = getBranches(STRUCTURE);
  console.log("drawing", totalBranches, "branches.");
  console.log("progress: 0%");

  const renderSubStruct = async (superstruct, depth) => {
    iter++;
    if (iter % Math.floor(totalBranches / loadInc) === 0) {
      completion += 100 / loadInc;
      console.log("progress:", completion + "%");
    }
    superstruct.map(async (struct) => {
      // check type of item
      const type = struct.type;

      // if branch, recurse
      if (type === "branch") {
        // recursive child processes
        const substruct = struct.struct;

        renderSubStruct(substruct, depth + 1);
      } else {
        // draw component
        const x1 = Number.parseInt(struct.origin.parentX * scale);
        const y1 = Number.parseInt(struct.origin.parentY * scale);

        const x2 = Number.parseInt(struct.meristem.parentX * scale);
        const y2 = Number.parseInt(struct.meristem.parentY * scale);

        const color = type === "leaf" ? colorVar(COLOR[type], 20) : COLOR[type];
        drawLine(canvas, x1, y1, x2, y2, struct.width * scale, color, type);
        return 1;
      }
    });
  };
  return await renderSubStruct(STRUCTURE.struct, 0);
};

export const stylize = async (imgBuffer, crop = true) => {
  // render lighting
  const lighting = async () =>
    await Jimp.read(imgBuffer).then(async (image) => {
      image
        .resize(2048, 2048, Jimp.RESIZE_NEAREST_NEIGHBOR)
        .scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
          var red = image.bitmap.data[idx + 0];
          var green = image.bitmap.data[idx + 1];
          var blue = image.bitmap.data[idx + 2];
          const isBlack = red === 0 && green === 0 && blue === 0;

          if (!isBlack) {
            image.bitmap.data[idx + 0] = 255;
            image.bitmap.data[idx + 1] = 255;
            image.bitmap.data[idx + 2] = 255;
          } else {
            image.bitmap.data[idx + 3] = 0;
          }
        })
        .grayscale()
        .gaussian(1)
        .opaque()
        .blur(3);

      return image.getBufferAsync(Jimp.MIME_PNG);
    });
  return await Jimp.read(imgBuffer)
    .then(async (image) => {
      //pixelate the image
      const img = image
        // pixelate
        .resize(2048, 2048, Jimp.RESIZE_NEAREST_NEIGHBOR);
      // add lighting
      // .composite(await Jimp.read(lighting()), 0, 0, {
      //   mode: Jimp.BLEND_MULTIPLY,
      //   opacitySource: 0.8,
      //   opacityDest: 1,
      // })

      // noise
      // .scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      //   // x, y is the position of this pixel on the image
      //   // idx is the position start position of this rgba tuple in the bitmap Buffer
      //   // this is the image

      //   var red = image.bitmap.data[idx + 0];
      //   var green = image.bitmap.data[idx + 1];
      //   var blue = image.bitmap.data[idx + 2];

      //   // rgba values run from 0 - 255
      //   // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
      //   const isBlack = red === 0 && green === 0 && blue === 0;

      //   if (isBlack) {
      //     image.bitmap.data[idx + 3] = 0;
      //   }
      // });

      const rend = crop ? img.autocrop() : img;

      return rend.getBufferAsync(Jimp.MIME_PNG);
    })
    .catch((err) => {
      // Handle an exception.
      console.log(err);
    });
};
