import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  text-align: left;
  background-color: ${({ contrast }) => (contrast ? "#eee" : "none")};
`;

const RadioButton = (props) => {
  const { group, value, display, mutator, contrast = false } = props;
  const id = `${group}_${value}`;
  return (
    <Wrapper key={id} contrast={contrast}>
      <input
        type="radio"
        value={value}
        id={id}
        onChange={(e) => {
          mutator(e.target.value);
        }}
        name={group}
        // checked={isChecked && "Checked"}
      />
      <label htmlFor={id}>{display || value}</label>
    </Wrapper>
  );
};

export default RadioButton;
