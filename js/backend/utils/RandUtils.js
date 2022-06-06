/**
 * This should be the ONLY RNG used in a project
 * Unless you are intentionally cross referencing different types of randoms
 * At the same time. The use cases for that are very rare, so declare an
  return plant(1000, 1800, props);
 * instance of this RNG in yiu main or index.js and pass it as parameters into other
 * classes and functions when needed
 *
 * Once set, the seed is a static variable, so all instances of SeededRandom will
 * share the same seed
 *
 * The state is also shared, so resetting the state in one instance will reset the state for all instances
 */
class SeededRandom {
  static #seed;
  static #originalSeed;
  static #unhashedSeed;

  // seed should be set once at runtime
  // object uses static seed which means that all instances use the same seed
  // and update the same seed
  setSeed = (seed = Number.MAX_SAFE_INTEGER) => {
    SeededRandom.#unhashedSeed = seed;
    // hashes seed in case the seed is a non-integer
    const hashSeed = (seed) => {
      // if the seed is a string, hash it, else, keep as number
      if (typeof seed === "string" || seed instanceof String) {
        if (Number.isInteger(seed)) {
          // if seed is an int represented by a string, then parse int out of it
          seed = parseInt(seed);
        } else {
          // hash the seed if it is a string
          const encode = (string, base) => {
            let ret = 0;
            var length = string.length;
            for (var i = 0; i < length; i++) ret += string.charCodeAt(i);
            // use division hash to generate space
            // this is the largest prime not close to a factor of 2 (2^31 - 1 is int max)
            const LARGE_PRIME = 9_999_991;
            const hash = (k) => {
              return (k * (k + 3)) % LARGE_PRIME;
            };
            return hash(ret);
          };
          seed = encode(seed);
        }
      }

      return seed;
    };

    const hashedSeed = hashSeed(seed);

    // this seed wil be mutated to produce predictable pseudorandomness
    SeededRandom.#seed = hashedSeed;

    // this seed is static
    // it is what is returned when calling "getSeed"
    SeededRandom.#originalSeed = hashedSeed;
  };

  //  reset the RNG during runtime. Useful for temporarily isolating procedural generation
  reset = () => {
    SeededRandom.#seed = SeededRandom.#originalSeed;
  };

  getSeed = () => {
    return SeededRandom.#originalSeed;
  };

  getUnhashedSeed = () => {
    return SeededRandom.#unhashedSeed;
  };

  random = () => {
    /**
     * From StackOverflow @bryc
     * Mulberry32 is a simple generator with a 32-bit state,
     * but is extremely fast and has good quality randomness
     * (author states it passes all tests of gjrand testing
     * suite and has a full 232 period, but I haven't verified).
     *
     * Mulberry32 published by @cprosche on GitHub
     */
    const mulberry32 = (a) => {
      const randfloat = () => {
        var t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      return randfloat();
    };

    // seeded random utilities
    const mutateSeed = () => {
      const oldSeed = SeededRandom.#seed;
      const newSeed = (oldSeed + 1) | 1;

      // set new seed
      SeededRandom.#seed = newSeed;

      // return the new seed if need be
      return newSeed;
    };

    const rand = mulberry32(SeededRandom.#seed);

    // update the seed
    mutateSeed();

    return rand;
  };

  randInt = (min = 0, max = 100) => {
    return Math.floor(this.random() * (max - min + 1)) + min;
  };

  // testing utils
  // test for uniform distribution of random numbers
  testDist = (sampSize = 10000, verbose = false) => {
    console.log("seed:", this.getSeed());
    console.log("unhashed seed:", this.getUnhashedSeed());

    console.log();

    const list = {};
    let min = 1;
    let max = 1;
    for (var i = 0; i < sampSize; i++) {
      const num = this.random();
      if (!list[num]) {
        list[num] = 1;
      } else {
        list[num] += 1;
        if (list[num] > max) {
          max = list[num];
        }
      }
    }

    if (verbose) console.log(list);

    const keys = Object.keys(list).length;

    console.log("Distribution:");
    console.log("Total sample size:", sampSize);
    console.log("Unique Entries:", keys);
    console.log("Percent Unique:", (keys / sampSize) * 100 + "%");
    console.log("Max Count:", max);
    console.log("Min Count:", min);
    console.log("Range:", max - min);
    console.log("Max probability:", max / sampSize);
    console.log("Min probability:", min / sampSize);
  };
}

export default SeededRandom;
