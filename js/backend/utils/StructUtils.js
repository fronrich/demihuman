export const getBranches = (struct) => {
  let branches = 0;
  const iter = (struct) => {
    const substruct = struct.struct;
    substruct.map((component) => {
      if (component.type === "branch") {
        branches++;
        iter(component);
      }
    });
  };

  iter(struct);
  return branches;
};
