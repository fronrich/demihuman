import React, { useState } from "react";
import styled from "styled-components";
import { call } from "../utils/RequestUtils";
import sampleGenome from "../data/sampleGenome";
import sampleMutation from "../data/sampleMutation";
import FieldInput from "./FieldModiferGroup/FieldInput";
import FieldModiferGroup from "./FieldModiferGroup";
import RadioGroup from "./RadioGroup";
import Canvas from "./Canvas";
import { progressiveMutation } from "../utils/GenomeUtils";
import limGenome from "../data/limGenome";
import limMutation from "../data/limMutation";
import Accordian from "./Accordian";
import * as randomWords from "random-words";

const MainWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
`;

const Panel = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow-y: scroll;
  flex-basis: 15%;
  span {
    text-align: left;
  }
`;

const PanelRev = styled(Panel)`
  justify-content: flex-end;
`;

const Interface = () => {
  const DISPLAYMODES = {
    CANVAS: 0,
    ANIMATION: 1,
    BACKGROUND: 2,
  };
  const [loading, setLoading] = useState(true);
  const [timeStamp, setTimeStamp] = useState(Date.now());
  const [displayMode, setdisplayMode] = useState(DISPLAYMODES.CANVAS);
  const [zoom, setZoom] = useState(100);
  const [idle, setIdle] = useState(true);

  const [generations, setGenerations] = useState(10);

  const [genome, setGenome] = useState(sampleGenome);
  const [mutation, setMutation] = useState(sampleMutation);

  const [seed, setSeed] = useState(randomWords());

  const updateObj = (field, value, interfaceObj, obj, modifer) => {
    // do type conversion if needed
    if (
      typeof interfaceObj[field] === "string" ||
      interfaceObj[field] instanceof String
    ) {
      if (!(typeof value === "string" || value instanceof String))
        value = value.toString();
    } else {
      value = Number.parseInt(value);
    }

    // update the genome syncronously
    const currObj = obj;
    currObj[field] = value;
    modifer(currObj);
    return currObj;
  };

  const updateGenome = (gene, value) => {
    return updateObj(gene, value, sampleGenome, genome, setGenome);
  };

  const updateMutation = (gene, value) => {
    return updateObj(gene, value, sampleMutation, mutation, setMutation);
  };

  const processRequest = async (mode) => {
    const { CANVAS, ANIMATION, BACKGROUND } = DISPLAYMODES;
    console.log("mode", mode);
    const subSeed = seed === "" ? randomWords({ exactly: 20, join: "" }) : seed;
    const data =
      mode !== ANIMATION
        ? {
            seed: subSeed,
            genome,
          }
        : {
            seed: subSeed,
            genome,
            genomes: progressiveMutation(genome, mutation, generations),
          };

    console.log(data);

    if (mode === CANVAS) {
      await call("upload", () => {}, "POST", data);
      await setLoading(true);
    } else if (mode === ANIMATION) {
      await call("upload", () => {}, "POST", data);
      await setLoading(true);
      call("render-bg-sequence", () => {}, "GET");

      // FIXME: ASYNC animation method
      // const genomeProc = data.genomes.map(async (genome, index) => {
      //   const individualData = {
      //     seed: subSeed,
      //     index,
      //     genome,
      //   };
      //   await call("upload", () => {}, "POST", data);
      //   await call("render", () => {}, "GET");
      // });
      // await setLoading(true);
    } else if (mode === BACKGROUND) {
      await call("upload", () => {}, "POST", data);
      await setLoading(true);
      call("render-bg", () => {}, "GET");
    } else {
      throw new Error("Invalid State");
    }
    await setTimeStamp(Date.now());
    await setIdle(false);
  };

  return (
    <MainWrapper>
      <PanelRev>
        {parseInt(displayMode) === DISPLAYMODES.ANIMATION && (
          <Accordian title="Generational Relative Mutator">
            <FieldModiferGroup
              limObj={limMutation}
              interfaceObj={sampleMutation}
              obj={mutation}
              modifer={updateMutation}
              step={1}
              isAbs
            />
          </Accordian>
        )}
        <Accordian title="Primary Genome Editor">
          <FieldModiferGroup
            limObj={limGenome}
            interfaceObj={sampleGenome}
            obj={genome}
            modifer={updateGenome}
          />
        </Accordian>
      </PanelRev>
      <Canvas
        displayModes={DISPLAYMODES}
        displayMode={parseInt(displayMode)}
        timeStamp={timeStamp}
        loading={loading}
        setLoading={setLoading}
        idle={idle}
        zoom={zoom}
      />
      <PanelRev>
        <h1>Global Settings</h1>
        <h2>Display Mode</h2>
        <RadioGroup
          group="displayMode"
          radios={Object.keys(DISPLAYMODES).map((dm) => {
            return {
              value: DISPLAYMODES[dm],
              display: dm.toLowerCase(),
            };
          })}
          mutator={setdisplayMode}
          defaultVal={DISPLAYMODES.CANVAS}
        />

        <FieldInput
          field="Percent Zoom"
          initVal={zoom}
          step={10}
          type="range"
          updateGenome={setZoom}
          inGroup={false}
          max={1000}
        />
        <FieldInput
          field="Global Seed"
          initVal={seed}
          type="text"
          updateGenome={setSeed}
          inGroup={false}
        />
        {parseInt(displayMode) === DISPLAYMODES.ANIMATION && (
          <FieldInput
            field="Generations (Frames)"
            initVal={generations}
            type="text"
            updateGenome={setGenerations}
            inGroup={false}
          />
        )}
        <button onClick={async () => processRequest(parseInt(displayMode))}>
          Process Genome
        </button>
      </PanelRev>
    </MainWrapper>
  );
};

export default Interface;
