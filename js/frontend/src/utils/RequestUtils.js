// generic call utility
/**
 *
 * @param {*} functionName - the url extension of the function being invoked
 * @param {*} cacheFunction - function used to cache the data to a react state
 * @param {*} params - additional params if they are required
 * @returns
 */
export const call = async (
  functionName,
  cacheFunction = () => {},
  method = "GET",
  data
) => {
  // create a config
  const config = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // data can be passed into the function
  if (data) config["body"] = JSON.stringify(data);

  // attempt fetch
  try {
    const res = await fetch(`${functionName}`, config)
      .then((result) => result.json())
      .then((body) => {
        cacheFunction(body);
        return body;
      });
    return res;
  } catch (err) {
    //failure results in error
    console.log(err);
  }
};
