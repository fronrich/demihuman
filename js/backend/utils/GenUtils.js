import { writeLog } from "./DebugUtils.js";

/***
 * GenUtils are functions which create the data structures needed to properly render the plants
 * These data structures essentially constitute the plant genome
 * The phenotypes will be rendered by the rendering engine
 */

import {
  randInt,
  randVar,
  randVarThresh,
  sinDeg,
  cosDeg,
} from "./MathUtils.js";

// helper fuction that generates a meristem object
const genMeristem = (x = 0, y = 0, parentAngle = 0) => {
  return { parentX: x, parentY: y, parentAngle: parentAngle };
};

const DEF_ORIGIN = genMeristem();

// generates a plant segment
// returns a meristem that can be used to bud other plant parts
// meristem can act as seed to place additional segments
const genSegment = (
  origin = DEF_ORIGIN,
  length = 5,
  relativeAngle = 0,
  width = 5
) => {
  // the true angle is used to calculate the trig
  const trueAngle = (relativeAngle + origin.parentAngle) % 360;

  // calculate x and y cords for the meristem
  // SOH CAH TOA
  const sinAngle = sinDeg(trueAngle);
  const cosAngle = cosDeg(trueAngle);

  const diffX = cosAngle * length;
  const diffY = sinAngle * length;

  // round to prevent sub-pixel calculations
  const newX = diffX + origin.parentX;
  const newY = diffY + origin.parentY;

  const meristem = genMeristem(newX, newY, trueAngle);

  // return the segment
  return {
    type: "segment",
    origin: origin,
    width: width,
    meristem: meristem,
  };
};

const genLeaf = (origin, length = 5, relativeAngle, width = 5) => {
  // derive a leaf from a segment by mutating the type
  let seg = genSegment(origin, length, relativeAngle + randVar(90), width);
  seg.type = "leaf";
  return seg;
};

const genPetal = (origin, length = 5, absAngle, width = 5) => {
  // derive a leaf from a segment by mutating the type
  let seg = genSegment(origin, length, absAngle, width);
  seg.type = "petal";
  return seg;
};

const genFlower = (origin, relativeAngle, petalCount, petalSpread) => {
  // calculate the min and max angle
  // noramlize the mean angle at 0
  const maxAngleUnormalized = 360 * (petalSpread / 100);

  const meanAngleUnormalized = maxAngleUnormalized / 2;

  const minAngleNormalized = meanAngleUnormalized - maxAngleUnormalized;

  const incAngle = maxAngleUnormalized / petalCount;

  let i = 0;
  const list = [];
  for (; i < petalCount; i++) {
    list.push(
      genPetal(origin, 5, relativeAngle + minAngleNormalized + incAngle * i, 5)
    );
  }
  return list;
};

/**
 * generate a branch using multiple segments
 * programatically, stems are just primary branches, so they borrow this code
 * These properties are very technical, and will be obfuscated later when deciding params
 *
 * @param {String} branchId - unique identifier of a branch, Used in pruneing
 * @param {meristem} origin - point of origin, either seed or meristem
 * @param {int} maxSegments - the number of times a branch can propogate outward in terms of segments
 * @param {int} width - width of the intial segment
 * @param {int} segLength - length of the initial segment
 * @param {int} relativeAngle - staring angle of the initial segment
 * @param {int} angleVarience - angles of propogating segments can differ by this amount from their parents
 * @param {int} maturityVarience - the percentage varience in the length of branches. can only vary negativley
 * @param {int} chanceSubranch - the chance out of 100 a subranch will form at a meristem
 * @param {int} subBranchMinSpread -
 * @param {int} subBranchMaxSpread -
 * @param {int} leafDensity - the density of leaves. loop will keep spawnning leaves at meristem until RNG(0, 100) returns value less than leaf density
 * leaf density cannot exceed 99 to prevent infinite loop
 */
const genBranch = (
  branchId = "b_0",
  origin = DEF_ORIGIN,
  maxSegments = 10,
  width = 50,
  segLength = 5,
  relativeAngle = 0,
  angleVarience = 0,
  maturityVarience = 10,
  chanceSubranch = 50,
  subBranchMinSpread = 70,
  subBranchMaxSpread = 90,
  leafDensity = 80,
  leafSchematic = {},
  flowerDensity = 20,
  flowerSchematic = {}
) => {
  // init branch data struct
  const branchStruct = {
    type: "branch",
    id: branchId,
    struct: [],
  };

  const trueSegCount =
    maxSegments -
    Math.floor(maxSegments * (randInt(0, maturityVarience) / 100));

  // generate the first segment
  let currSeg = genSegment(origin, segLength, relativeAngle, width);

  //push first segment
  branchStruct.struct.push(currSeg);

  let currWidth = width;
  let currLen = segLength;
  let currAngle = relativeAngle;

  const widthDec = width / trueSegCount;
  const lenDec = segLength / trueSegCount;

  // const widthDec = 1;
  // const lenDec = 1;

  const absLeafDensity = leafDensity < 99 ? leafDensity : 99;

  // deconstruct leaf schematic
  const { leafLength, leafWidth } = leafSchematic;

  // deconstruct flower schematic
  const { flowerPetalCount, flowerPetalSpread } = flowerSchematic;
  // generate rest of the segments, subranch using looped recursion

  let newOrigin = currSeg.meristem;
  for (let i = 1; i < trueSegCount; i++) {
    // update length and width
    currWidth =
      Math.floor(currWidth - widthDec) > 1
        ? Math.floor(currWidth - widthDec)
        : 1;
    currLen =
      Math.floor(currLen - lenDec) > 1 ? Math.floor(currLen - lenDec) : 1;
    currAngle = randVar(angleVarience);
    newOrigin = currSeg.meristem;

    // generate new segment then push it
    currSeg = genSegment(newOrigin, currLen, currAngle, currWidth);

    // push first segment
    branchStruct.struct.push(currSeg);

    // if the chance arises, generate a smaller version of the branch, and append it to this branch
    let branchRNG = randInt(0, 100);
    if (branchRNG <= chanceSubranch) {
      const subranch = genBranch(
        branchId + "_" + i,
        newOrigin,
        trueSegCount,
        currWidth,
        currLen / 2,
        currAngle + randVarThresh(subBranchMinSpread, subBranchMaxSpread),
        angleVarience,
        maturityVarience / 2,
        chanceSubranch * 0.75,
        subBranchMinSpread / 1.5,
        subBranchMaxSpread / 1.5,
        absLeafDensity,
        leafSchematic,
        flowerDensity,
        flowerSchematic
      );
      branchStruct.struct.push(subranch);
    }
  }

  // while at branch tip, loop to match leaf density
  let leafCount = 0;
  while (randInt(0, 100) < absLeafDensity) {
    // spawn leaf
    const leaf = genLeaf(newOrigin, leafLength, currAngle, leafWidth);
    branchStruct.struct.push(leaf);
    leafCount++;
  }

  // on the very end of a branch, generate flowers
  // generate if leafCount is 0 or if randvar is below flower density
  if (
    (flowerDensity !== 0 && leafCount === 0) ||
    randInt(0, 100) < flowerDensity
  ) {
    // create a flower
    genFlower(newOrigin, currAngle, flowerPetalCount, flowerPetalSpread).map(
      (petal) => branchStruct.struct.push(petal)
    );
  }

  return branchStruct;
};

export const genGenericStem = () => {
  const branches = genBranch();
  return branches;
};

// compiles the genome into a paramaterized format
// a compiled genome can then be passed to the germinate function
// genomes are an easy way to store plants as compressed data
// since their phenotypes are represented by much larger jsons
/**
 *
 * @param {int} height - the height of the plant
 * @param {percent} segmentation - the segmentation, height will be divided by segmentation
 * to get the height of each segment
 * The more segments there are, the more modular the plant becomes
 * This means taht more segments means more meristems
 * @param {percent} branchThickness - how thick the root branch (stem) starts out
 * @param {percent} branchSpread - effects the angle branches spawn at
 * 0 - subranches can spwan parelell to their parent
 * 100 - subranches spawn completley perpendicular to their parent
 * @param {percent} branchDensity - effects the chance of subranching
 * @param {percent} branchVariability - effects the max difference in angles between segments
 * and maturity between branches
 * @param {hexrgb} branchColor - determines the color of branches
 * @param {percentage} leafDensity - the density at which leaves can spwan at a meristem
 * leaves will spawn until a RNG(0, 100) returns a number less than this amount
 * @param {int} leafLength - the length of a leaf
 * @param {int} leafWidth - the width of a leaf
 * @param {hexrgb} leafColor - color of leaf
 * @param {percent} flowerDensity - the percent chance that a flow will spawn at the end of a branch
 * @param {int} flowerPetalCount - the number of petals per flower
 * @param {percent} flowerPetalSpread - determines how spread out petals are
 * 0 - paralell to branch
 * 100 - distributed evenly 360 degrees
 * @param {hexrgb} flowerPetalColor - petal color
 * @returns a genome
 */
export const CompileGenome = (props) => {
  const {
    height,
    segmentation,
    branchThickness,
    branchSpread,
    branchDensity,
    branchVariability,
    branchColor,
    leafDensity,
    leafLength,
    leafWidth,
    leafColor,
    flowerDensity,
    flowerPetalCount,
    flowerPetalSpread,
    flowerPetalColor,
  } = props;
  // calculate segment length based on height
  const segLen = height / segmentation;
  const MAX_SPREAD = 85;

  // true branhc density correlates with chanceSubranch
  const trueBranchDensity = branchDensity < 99 ? branchDensity : 99;
  const branchAngleVarience = MAX_SPREAD * (branchVariability / 100);
  const maturityVarience = branchVariability;
  return {
    SEGMENTATION: segmentation,
    SEGMENT_LENGTH: segLen,
    STEM_WIDTH: branchThickness,
    MIN_BRANCH_SPREAD: MAX_SPREAD * (branchSpread / 100),
    MAX_BRANCH_SPREAD: MAX_SPREAD,
    BRANCH_DENSITY: trueBranchDensity,
    BRANCH_ANGLE_VARIENCE: branchAngleVarience,
    BRANCH_MATURITY_VARIENCE: maturityVarience,
    BRANCH_COLOR: branchColor,
    LEAF_DENSITY: leafDensity,
    LEAF_LENGTH: leafLength,
    LEAF_WIDTH: leafWidth,
    LEAF_COLOR: leafColor,
    FLOWER_DENSITY: flowerDensity,
    FLOWER_PETAL_COUNT: flowerPetalCount,
    FLOWER_PETAL_SPREAD: flowerPetalSpread,
    FLOWER_PETAL_COLOR: flowerPetalColor,
  };
};

// germinate a seed based on a genome at cords x,y
export const germinate = (x, y, genome) => {
  const {
    SEGMENTATION,
    SEGMENT_LENGTH,
    STEM_WIDTH,
    MIN_BRANCH_SPREAD,
    MAX_BRANCH_SPREAD,
    BRANCH_DENSITY,
    BRANCH_ANGLE_VARIENCE,
    BRANCH_MATURITY_VARIENCE,
    BRANCH_COLOR,
    LEAF_DENSITY,
    LEAF_LENGTH,
    LEAF_WIDTH,
    LEAF_COLOR,
    FLOWER_DENSITY,
    FLOWER_PETAL_COUNT,
    FLOWER_PETAL_SPREAD,
    FLOWER_PETAL_COLOR,
  } = genome;
  const UPRIGHT = 270;
  const seed = genMeristem(x, y, 0);
  const LEAF_SCHEMATIC = { leafLength: LEAF_LENGTH, leafWidth: LEAF_WIDTH };
  const FLOWER_SCHEMATIC = {
    flowerPetalCount: FLOWER_PETAL_COUNT,
    flowerPetalSpread: FLOWER_PETAL_SPREAD,
    flowerPetalColor: FLOWER_PETAL_COLOR,
  };
  const struct = genBranch(
    "r_0",
    seed,
    SEGMENTATION,
    STEM_WIDTH,
    SEGMENT_LENGTH,
    UPRIGHT,
    BRANCH_ANGLE_VARIENCE,
    BRANCH_MATURITY_VARIENCE,
    BRANCH_DENSITY,
    MIN_BRANCH_SPREAD,
    MAX_BRANCH_SPREAD,
    LEAF_DENSITY,
    LEAF_SCHEMATIC,
    FLOWER_DENSITY,
    FLOWER_SCHEMATIC
  );
  const render = {
    COLOR: {
      segment: BRANCH_COLOR,
      leaf: LEAF_COLOR,
      petal: FLOWER_PETAL_COLOR,
    },
    STRUCTURE: struct,
  };

  return render;
};

// creates a plant of genome with (x,y) as the origin
export const plant = (x, y, genome = {}) => {
  const struct = germinate(x, y, CompileGenome(genome));
  return struct;
};

export const plantGeneric = () => {
  const props = {
    height: 1000,
    segmentation: 20,
    branchThickness: 50,
    branchSpread: 30,
    branchDensity: 20,
    branchVariability: 10,
    branchColor: "#3d301f",
    leafDensity: 40,
    leafLength: 400,
    leafWidth: 10,
    leafColor: "#456b2f",
    flowerDensity: 1,
    flowerPetalCount: 3,
    flowerPetalSpread: 45,
    flowerPetalColor: "#cafff8",
  };
  return plant(1000, 1800, props);
};
