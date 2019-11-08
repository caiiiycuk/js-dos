import React, { useState, useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import { Spinner, Intent, ButtonGroup, Button, Navbar, NavbarHeading, NavbarGroup, HTMLSelect, NavbarDivider, Checkbox, Alignment, NumericInput } from "@blueprintjs/core";
import { highlight, languages } from 'prismjs';

import 'prismjs/themes/prism.css';
import 'prismjs/themes/prism-tomorrow.css';
import { IconNames } from '@blueprintjs/icons';

export default function Renderer() {
  const url = "https://js-dos.com/6.22/current/test" + window.location.pathname + ".html";

  const [frameKey, setFrameKey] = useState<number>(0);
  const [content, setContent] = useState<string | null>(null);
  const [frameContent, setFrameConent] = useState<string | null>(null);
  const [request, setRequest] = useState<XMLHttpRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cycles, setCycles] = useState<number>(1000);
  const [wdosboxUrl, setWdosboxUrl] = useState<string>("wdosbox.js");
  const [autolock, setAutolock] = useState<boolean>(false);

  const [proxy, setProxy] = useState(null);

  const iframeCallback = useCallback((iframe) => {
    if (iframe !== null && frameContent != null) {
      const proxy = iframe.contentWindow;
      proxy.document.write(frameContent);
      iframe.focus();
      
      setProxy(proxy);
    }
  }, [frameKey]);

  if (error != null) {
    return <div>Unexpected error: {error}</div>;
  }

  const loaded = content !== null;
  if (!loaded) {
    if (!request) {
      const xmlRequest = new XMLHttpRequest();
      xmlRequest.open('GET', url);
      xmlRequest.onerror = () => {
        setError("Unable to download url: " + url);
      };
      xmlRequest.onreadystatechange = () => {
        if (xmlRequest.readyState === 4) {
          if (xmlRequest.status === 200) {
            setContent(xmlRequest.responseText);
            setFrameConent(xmlRequest.responseText);
            setFrameKey(frameKey + 1);
          } else {
            setError("Wrong response code: " + xmlRequest.status);
          }
        }
      };
      xmlRequest.send();
      setRequest(xmlRequest);
    }

    return <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "1em",
    }}>
      <div style={{ marginRight: "1em" }}><Spinner intent={Intent.PRIMARY} /></div>
      <div>Loading documentation
        <span className="bp3-text-large" style={{
          color: "#48AFF0",
          fontWeight: "bold",
        }}>{window.location.pathname}</span></div>
    </div >;
  }

  function reload() {
    setFrameConent(content);
    setFrameKey(frameKey + 1);
  }

  function doSetCycles(value: number) {
    const newContent = (content + "").replace(/cycles:.*/, "cycles: " + value + ",");
    setCycles(value);
    setContent(newContent);
  }

  function doSetVariant(value: string) {
    const newContent = (content + "").replace(/wdosboxUrl:.*/, 
      "wdosboxUrl: \"https://js-dos.com/6.22/current/" + value + "\",");
    setWdosboxUrl(value);
    setContent(newContent);
  }

  function doSetAutolock(value: boolean) {
    const newContent = (content + "").replace(/autolock:.*/, "autolock: " + value + ",");
    setAutolock(value);
    setContent(newContent);
  }

  function enterFullscreen() {
    (proxy as any).ci.fullscreen();
  }

  return <div style={{
    display: "flex",
    flexDirection: "column",
    height: "100%",
  }}>
    <iframe title="frame"
      tabIndex={1}
      key={"iframe_" + frameKey}
      ref={iframeCallback}
      allowFullScreen
      style={{
        border: "none",
        height: "400px",
      }} />
    <Navbar style={{ position: "relative" }}>
      <NavbarGroup>
        <NavbarHeading>Variant</NavbarHeading>
        <HTMLSelect options={["wdosbox.js", "wdosbox-emterp.js", "wdosbox-nosync.js",
          "dosbox-emterp.js", "dosbox-nosync.js"]} value={wdosboxUrl}
          onChange={(ev) => doSetVariant(ev.currentTarget.value)}></HTMLSelect>
        <NavbarDivider></NavbarDivider>
        <Checkbox checked={autolock} label="Mouselock" large={true}
          onChange={(ev) => doSetAutolock(ev.currentTarget.checked)}
          style={{ marginBottom: 0 }} alignIndicator={Alignment.RIGHT}></Checkbox>
        <NavbarDivider></NavbarDivider>
        <NavbarHeading>Cycles</NavbarHeading>
        <div style={{ width: "100px" }}>
          <NumericInput value={cycles} stepSize={100} majorStepSize={1000}
            fill={true} onValueChange={doSetCycles}></NumericInput>
        </div>
        <ButtonGroup style={{ position: "absolute", right: "1em" }}>
          <Button text="Fullscreen" icon={IconNames.FULLSCREEN} onClick={enterFullscreen}></Button>
          <Button icon={IconNames.REFRESH} onClick={reload}
            intent={content !== frameContent ? Intent.DANGER : Intent.NONE}>
          </Button>
        </ButtonGroup>
      </NavbarGroup>
    </Navbar>
    <div style={{ overflow: "auto" }}>
      <Editor
        value={content as string}
        onValueChange={setContent}
        highlight={code => highlight(code, languages.html, 'html')}
        padding={10}
        style={{
          backgroundColor: '#2d2d2d',
          fontFamily: '"Fira code", "Fira Mono", source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
          fontSize: 12,
        }}
      />
    </div>
  </div>;
}