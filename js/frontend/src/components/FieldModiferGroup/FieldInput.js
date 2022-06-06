import React, { useState } from "react";
import styled from "styled-components";
import limGenome from "../../data/limGenome";
import { SliderPicker } from "react-color";
import Accordian from "../Accordian";

const Wrapper = styled.div`
  width: 100%;
  label {
    display: flex;
    justify-content: flex-start;
    width: 100%;
  }
  input {
    width: 100%;
  }
  padding: 5px 0;
  background-color: ${({ contrast }) => (contrast ? "#eee" : "none")};
`;

const InputWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const Swatch = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 10px;
  background-color: ${({ color }) => color || "none"};
`;

const FieldInput = (props) => {
  // if type is a color, add swatch
  const regexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  const {
    field,
    initVal,
    type,
    updateGenome,
    step = limGenome[field] / 20 || 1,
    limObj,
    isAbs,
    inGroup = true,
    max = 0,
    contrast = false,
  } = props;
  const [state, setState] = useState(initVal);
  const stateManagement = (e) => {
    if (inGroup) {
      updateGenome(field, e.target.value);
    } else updateGenome(e.target.value);
    // update self
    setState(e.target.value);
  };
  return (
    <Wrapper key={field} contrast={contrast}>
      <label>
        {field}: {state}
      </label>
      <InputWrapper>
        {regexColor.test(state) ? (
          <Accordian title="Select">
            <SliderPicker
              color={state}
              onChange={(color) => {
                const { hex } = color;
                setState(hex);
                updateGenome(field, hex);
              }}
            />
          </Accordian>
        ) : (
          <input
            min={isAbs && type === "range" ? -limObj[field] : 0}
            max={limObj ? limObj[field] : max}
            name={field}
            step={step}
            type={type}
            value={state}
            onChange={(e) => stateManagement(e)}
          />
        )}
      </InputWrapper>
    </Wrapper>
  );
};

export default FieldInput;
