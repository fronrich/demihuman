import SeededRandom from "./RandUtils.js";

const SRNG = new SeededRandom();

// Utilities used for math in different places

export const randInt = (min = 0, max) => {
  return SRNG.randInt(min, max);
};

// get a varience ranging from positve num to negative num
export const randVar = (num) => {
  const range = num * 2;
  const startNum = randInt(0, range);
  return range - startNum - num;
};

// get a number within a variance that is at least minThresh distance from 0
export const randVarThresh = (minThresh, maxThresh) => {
  const sign = SRNG.random() < 0.5 ? -1 : 1;
  return randInt(minThresh, maxThresh) * sign;
};

// trig functions

const degToRad = (degrees) => {
  return (Math.PI / 180) * degrees;
};

export const sinDeg = (degrees) => {
  return Math.sin(degToRad(degrees));
};

export const cosDeg = (degrees) => {
  return Math.cos(degToRad(degrees));
};
