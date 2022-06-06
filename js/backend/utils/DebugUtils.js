import * as fs from "fs";

export const writeLog = (data) => {
  // Define some text to be written to a file
  try {
    // Write text to the given file name
    // await tells JavaScript to wait for the asyncronous function (Promise) to resolve before continuing
    fs.writeFile("../log.json", data, (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });
  } catch (error) {
    // Output any errors for inspection
    console.log(error);
  }
};
