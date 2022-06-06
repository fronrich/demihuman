import "./App.css";
import Interface from "./components/Interface";
import styled from "styled-components";

const border = 20;

const Body = styled.div`
  width: calc(97vw);
  height: calc(97vh - ${border}px);
  padding: ${border}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function App() {
  return (
    <Body>
      <Interface />
    </Body>
  );
}

export default App;
