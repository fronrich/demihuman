const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pointer = (async function recursion(value) {
  if (value === 0) return 0;
  setTimeout(async () => {
    console.log(value);
    await timeout(Math.random() * 2000);
    return value + (await recursion(value - 1));
  }, 0);
})(async () => console.log("res", await recursion(10)))();
