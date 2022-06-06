import React from "react";

const GenomeDisplay = (props = {}) => {
  const { genome } = props;
  console.log(genome);
  const display = () =>
    Object.keys(genome).map((gene) => {
      return (
        <React.Fragment key={gene}>
          &emsp; {gene}: {genome[gene]},<br />
        </React.Fragment>
      );
    });
  return (
    <span>
      {"Genome: {"}
      <br />
      {display()}
      {"}"}
    </span>
  );
};

export default GenomeDisplay;
