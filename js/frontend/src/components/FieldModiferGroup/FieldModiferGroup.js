import React from "react";
import FieldInput from "./FieldInput";

const FieldModiferGroup = (props) => {
  const { limObj, interfaceObj, obj, modifer, step, isAbs = false } = props;

  const inputs = Object.keys(interfaceObj).map((elem, index) => {
    // return an input object with modified update genome field
    const type =
      typeof obj[elem] === "string" || obj[elem] instanceof String
        ? "text"
        : "range";

    return (
      <FieldInput
        key={elem}
        field={elem}
        limObj={limObj}
        isAbs={isAbs}
        maxVal={interfaceObj[elem]}
        initVal={obj[elem]}
        type={type}
        updateGenome={modifer}
        step={step && step}
        contrast={index % 2}
      />
    );
  });
  return <React.Fragment>{inputs}</React.Fragment>;
};

export default FieldModiferGroup;
