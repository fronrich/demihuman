import React from "react";
import styled, { keyframes } from "styled-components";

const Container = styled.div`
  visibility: ${({ visible }) => (visible ? "visible" : "hidden")};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const sineUp = keyframes`
 0% { transform: translateY(0) }
 50% { transform: translateY(10px) }
 100% { transform: translateY(0) }
`;

const sineDown = keyframes`
 0% { transform: translateY(10px) }
 50% { transform: translateY(0) }
 100% { transform: translateY(10px) }
`;

const Wrapper = styled.div`
  display: flex;
`;

const LoaderGeneric = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 0 75%;
  margin: 10px;
  background: linear-gradient(to right, red, purple);
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: smooth;
`;

const LoaderIconUp = styled(LoaderGeneric)`
  animation-name: ${sineUp};
`;

const LoaderIconDown = styled(LoaderGeneric)`
  animation-name: ${sineDown};
`;

const Loader = (props) => {
  const { visible } = props;
  return (
    <Container visible={visible}>
      <Wrapper>
        <LoaderIconUp />
        <LoaderIconDown />
        <LoaderIconUp />
      </Wrapper>
      <span>Loading...</span>
    </Container>
  );
};

export default Loader;
