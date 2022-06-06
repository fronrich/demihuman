import { randInt } from "./MathUtils.js";

// single threaded, async utils
// a process collecting stack used for compiling async processes
// parent process makes this useful for recursive and iterative async calls
export class AsyncProcessPool {
  constructor(lim = 9000000) {
    this.MARKERS = {
      ABSENT: 0,
      PRESENT: 1,
    };
    this.lim = lim;
    this.beganExec = false;

    this.mostRecentId = 0;
    this.execList = new Array(lim).fill(0);
    this.finishList = new Array(lim).fill(0);

    // maximum concurrent processes
    this.maxExec = 0;
    this.maxfinish = 0;
    this.currExec = 0;

    AsyncProcessPool.logProcExec = async (procId) => {
      this.execList[procId] = this.MARKERS.ABSENT;
      this.maxExec++;
      this.currExec++;
    };

    // process must have been in exec before it can finish
    AsyncProcessPool.logProcFinish = async (procId) => {
      // check for process in exec
      if (this.execList[procId] !== this.MARKERS.PRESENT) {
        throw new Error(
          "Contradiction: process finished before it was executed"
        );
      } else {
        this.execList[procId] = this.MARKERS.ABSENT;
        this.finishList[procId] = this.MARKERS.PRESENT;
        this.maxfinish++;
        this.currExec--;
      }
    };

    AsyncProcessPool.createId = () => {
      let id = randInt(0, this.lim);

      if (
        this.execList[id] === this.MARKERS.PRESENT ||
        this.finishList[id] === this.MARKERS.PRESENT
      ) {
        id = AsyncProcessPool.createId();
      }
      return id;
    };
  }

  spawnSubProc = async (func = async () => {}, ...props) => {
    this.beganExec = true;
    const id = AsyncProcessPool.createId();
    // console.log("proc id", id, "created");
    setTimeout(async () => {
      await AsyncProcessPool.logProcExec(id);
      await func(...props);
      await AsyncProcessPool.logProcFinish(id);
    }, 0);
    // return res;
  };

  getPool = async () => {
    return {
      IN_PROGESS: this.execStack,
      TERMINATED: this.finishStack,
    };
  };

  // block the program until all processes have finished
  block = async (callback = () => {}, ...props) => {
    let unblock = false;
    setTimeout(() => {
      console.log("blocked");
      while (!this.beganExec) {
        console.log(this.beganExec);
      }
      if (this.beganExec) {
        console.log("already began exec");
        console.log("max fin", this.maxfinish);
        console.log("max exec", this.maxExec);
        while (this.maxfinish <= this.maxExec || this.currExec !== 0) {}
      }
      callback(...props);
      unblock = true;
      return unblock;
    }, 0);
  };

  // all the threads have compiled
  // do some garbage collection
  clean = async () => {
    console.log("clean");
    this.execList = [];
    this.finishList = [];
    // maximum concurrent processes
    this.maxExec = 0;
    this.maxfinish = 0;
    this.currExec = 0;
  };
}
