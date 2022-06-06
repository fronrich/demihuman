import React from "react";
import RadioButton from "./RadioButton";

const RadioGroup = (props) => {
  const { group, radios, mutator, defaultVal } = props;
  const buttons = radios.map((radio, index) => {
    const { value, display } = radio;
    return (
      <RadioButton
        key={`${group}_${value}`}
        group={group}
        value={value}
        display={display}
        mutator={mutator}
        isChecked={value === defaultVal}
        contrast={index % 2}
      />
    );
  });

  return <div>{buttons}</div>;
};

export default RadioGroup;
