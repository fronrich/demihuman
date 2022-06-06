import _ from "lodash";

// create a relativeMutation
// for each gene in the mutation, the gene in the original genome
// is altered by mutation[gene] incremements
// if there is a color, the rgbs channels will be averaged

export const relativeMutation = (genome, mutation) => {
  // create a deep copy
  const currGenome = _.cloneDeep(genome);

  Object.keys(mutation).map((gene) => {
    const modifer = mutation[gene];
    const orgGene = currGenome[gene];
    if (typeof modifer === "string") {
      try {
        // in theory, by color averaging, the plant will evolve towards this color
        // more and more with every generation
        const colorAvg = (hex1, hex2) => {
          try {
            var aRgbHex1 = hex1.replace("#", "").match(/.{1,2}/g);
            var aRgb1 = [
              parseInt(aRgbHex1[0], 16),
              parseInt(aRgbHex1[1], 16),
              parseInt(aRgbHex1[2], 16),
            ];
            var aRgbHex2 = hex2.replace("#", "").match(/.{1,2}/g);
            var aRgb2 = [
              parseInt(aRgbHex2[0], 16),
              parseInt(aRgbHex2[1], 16),
              parseInt(aRgbHex2[2], 16),
            ];

            const newRbgHex = aRgb1.map((channel, index) => {
              return (channel + aRgb2[index]) / 2;
            });

            let newColor = "#";
            // convert to hex with noise added
            // convert 0's to '00'
            newRbgHex.forEach((channel) => {
              newColor += channel !== 0 ? channel.toString(16) : "00";
            });
            return newColor;
          } catch {
            return hex1;
          }
        };
        const newColor = colorAvg(modifer, orgGene);
        currGenome[gene] = newColor;
      } catch {}
    } else {
      currGenome[gene] += mutation[gene];
    }
    return 1;
  });

  // return the mutated genome
  return currGenome;
};

export const absMutation = (genome, mutation) => {
  // create a deep copy
  const currGenome = _.cloneDeep(genome);

  Object.keys(mutation).map((gene) => {
    currGenome[gene] = mutation[gene];

    return 1;
  });

  // return the mutated genome
  return currGenome;
};

// simulates generational mutations
// recursivley applies a relative mutation, saving each generations
// genome into an array
// from an animation perspective, can also be used to simulate
// growth, shrinkage, wilting, etc.
export const progressiveMutation = (genome, mutation, generations) => {
  // gen 0
  const genomes = [genome];
  let currGenome = genome;

  for (let i = 1; i < generations; i++) {
    currGenome = relativeMutation(currGenome, mutation);
    genomes.push(currGenome);
  }

  return genomes;
};
