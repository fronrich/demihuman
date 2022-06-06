import React from "react";
import Draggable from "react-draggable";
import styled from "styled-components";
import Loader from "./Loader";

const CanvasWrapper = styled.div`
  overflow: hidden;
  height: 100%;
  flex-basis: 67%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const CanvasBox = styled.div`
  overflow: scroll;
  width: 99%;
  height: 100%;
  border: 1px solid black;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const PlantDisplay = styled.img`
  display: ${({ visible }) => (visible ? "block" : "none")};
  pointer-events: none;
`;

const VisSpan = styled.span`
  display: ${({ visible }) => (visible ? "block" : "none")};
  pointer-events: none;
`;

const PlantWrapper = styled.div`
  width: auto;
  height: auto;
  pointer-events: all;
`;

const DraggableWrapper = styled.div`
  transform: scale(${({ zoom }) => zoom || 100}%);
  transition: 500ms;
`;

const Canvas = (props) => {
  const {
    displayModes,
    displayMode,
    timeStamp,
    loading,
    setLoading,
    zoom,
    idle,
  } = props;
  const { ANIMATION, BACKGROUND } = displayModes;
  return (
    <CanvasWrapper>
      <CanvasBox className="canvasBox">
        {!idle ? (
          <React.Fragment>
            <Loader visible={loading && displayMode !== ANIMATION} />
            {displayMode === BACKGROUND && (
              <VisSpan visible={!loading}>
                Sprites were rendered in the background. Check your file
                directory.
              </VisSpan>
            )}
            <DraggableWrapper zoom={zoom}>
              <Draggable
                scale={zoom / 100}
                // grid={[100, 100]}
                defaultClassName="draggable"
              >
                <PlantWrapper>
                  <PlantDisplay
                    visible={!loading && displayMode !== BACKGROUND}
                    src={`http://localhost:3001/render/?t=${timeStamp}`}
                    alt="plant"
                    onLoad={() => {
                      setLoading(false);
                    }}
                  />
                </PlantWrapper>
              </Draggable>
            </DraggableWrapper>
          </React.Fragment>
        ) : (
          <span>Process A Genome to Get Started!</span>
        )}
      </CanvasBox>
    </CanvasWrapper>
  );
};

export default Canvas;
