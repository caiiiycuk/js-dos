import React, { useState, useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import { Spinner, Intent, ButtonGroup, Button, Navbar, NavbarHeading, NavbarGroup, HTMLSelect, NavbarDivider, Checkbox, Alignment, Classes } from "@blueprintjs/core";
import { highlight, languages } from 'prismjs';

import 'prismjs/themes/prism.css';
import 'prismjs/themes/prism-tomorrow.css';
import { IconNames } from '@blueprintjs/icons';

export default function Renderer(props: { path: string, cycles: string, autolock: boolean }) {
  const url = "https://js-dos.com/6.22/current/test/" + props.path + ".html";

  const [frameKey, setFrameKey] = useState<number>(0);
  const [content, setContent] = useState<string | null>(null);
  const [frameContent, setFrameConent] = useState<string | null>(null);
  const [request, setRequest] = useState<XMLHttpRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cycles, setCycles] = useState<string>(props.cycles);
  const [wdosboxUrl, setWdosboxUrl] = useState<string>("wdosbox.js");
  const [autolock, setAutolock] = useState<boolean>(props.autolock);

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
            const content = transformContent(xmlRequest.responseText, wdosboxUrl, cycles, autolock)
              .replace(/.*js-dos\.js.*/, "  <script src=\"https://js-dos.com/6.22/current/js-dos.js\"></script>");
            setContent(content);
            setFrameConent(content);
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

  function transformContent(content: string | null, variant: string, cycles: string, autolock: boolean) {
    if (!Number.parseInt(cycles)) {
      cycles = "\"" + cycles + "\"";
    }
    const newContent = (content + "")
      .replace(/autolock:.*/, "autolock: " + autolock + ",")
      .replace(/cycles:.*/, "cycles: " + cycles + ",")
      .replace(/wdosboxUrl:.*/, "wdosboxUrl: \"https://js-dos.com/6.22/current/" + variant + "\",");

    return newContent;
  }

  function doSetCycles(value: string) {
    setCycles(value);
    setContent(transformContent(content, wdosboxUrl, value, autolock));
  }

  function doSetVariant(value: string) {
    setWdosboxUrl(value);
    setContent(transformContent(content, value, cycles, autolock));
  }

  function doSetAutolock(value: boolean) {
    setAutolock(value);
    setContent(transformContent(content, wdosboxUrl, cycles, value));
  }

  function enterFullscreen() {
    (proxy as any).ci.fullscreen();
  }

  return <div style={{
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    height: "100%",
  }}>
    <Navbar>
      <NavbarGroup >
        <NavbarHeading>
          <a href="https://js-dos.com">js-dos 6.22</a>
        </NavbarHeading>
        <NavbarDivider>
        </NavbarDivider>
        <NavbarHeading>
          <a href="https://js-dos.com/6.22/examples">Examples</a>
        </NavbarHeading>
      </NavbarGroup>
    </Navbar>
    <iframe title="frame"
      tabIndex={1}
      key={"iframe_" + frameKey}
      ref={iframeCallback}
      allowFullScreen
      style={{
        flexShrink: 0,
        flexGrow: 0,
        alignSelf: "center",
        border: "none",
        width: "64vh",
        height: "40vh",
      }} />
    <Navbar style={{
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      height: "auto",
      paddingTop: "5px",
      paddingBottom: "5px",
    }}>
      <NavbarGroup style={{
        flexWrap: "wrap",
        height: "auto",
      }}>
        <NavbarHeading>Variant</NavbarHeading>
        <HTMLSelect options={[
          "wdosbox.js", "wdosbox-emterp.js", "wdosbox-nosync.js",
          "dosbox-emterp.js", "dosbox-nosync.js", 
          "wdosbox-profiling.js", "wdosbox-emterp-profiling.js", "wdosbox-nosync-profiling.js",
        ]} value={wdosboxUrl}
          onChange={(ev) => doSetVariant(ev.currentTarget.value)}></HTMLSelect>
        <NavbarDivider></NavbarDivider>
        <Checkbox checked={autolock} label="Mouselock" large={true}
          onChange={(ev) => doSetAutolock(ev.currentTarget.checked)}
          style={{ marginBottom: 0 }} alignIndicator={Alignment.RIGHT}></Checkbox>
        <NavbarDivider></NavbarDivider>
        <NavbarHeading>Cycles</NavbarHeading>
        <div style={{ width: "100px" }}>
          <input className={Classes.INPUT}
            value={cycles} dir="auto" onChange={(e) => doSetCycles(e.currentTarget.value)} />
        </div>
      </NavbarGroup>
      <NavbarGroup>
        <ButtonGroup>
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