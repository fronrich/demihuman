import React, { useState } from "react";

import styled from "styled-components";

const MainWrapper = styled.div`
  height: fit-content;
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  opacity: 100;
  overflow: hidden;
  ${({ show }) =>
    !show &&
    `
    height: 0; 
    opacity: 0;
  `}
  transition: 200ms;
`;

const Accordian = (props) => {
  const { title, children } = props;
  const [show, toggleShow] = useState(false);

  return (
    <MainWrapper>
      <button onClick={() => toggleShow(!show)}>{title}</button>
      <Wrapper show={show}>{children}</Wrapper>
    </MainWrapper>
  );
};

export default Accordian;
