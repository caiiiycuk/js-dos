import React from "react";
import { Button, H1, Card, Elevation, H2, Navbar, NavbarHeading, NavbarGroup } from "@blueprintjs/core";

export default function Landing() {
    return <div style={{ padding: "1em" }}>
        <Navbar fixedToTop={true}>
            <NavbarGroup >
                <NavbarHeading>
                    <a href="https://js-dos.com">js-dos 6.22</a>
                </NavbarHeading>
            </NavbarGroup>
        </Navbar>
        <H1 style={{paddingTop: "50px"}}>Examples</H1>

        <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Card elevation={Elevation.TWO} style={{ margin: "1em" }}>
                <H2>Digger</H2>
                <p>
                    Classic dos game devloped in 1983. Here you can undestand:
                    <ul>
                        <li>how to run dos game in browser</li>
                        <li>how to configure dosbox performance</li>
                    </ul>
                </p>
                <Button text="Run" onClick={() => window.location.search = "digger"}></Button>
            </Card>

            <Card elevation={Elevation.TWO} style={{ margin: "1em" }}>
                <H2>Arkanoid</H2>
                <p>Original arcade game released by Tito in 1986. Here you can undestand:
                    <ul>
                        <li>how to use autolock feature to capture browser mouse</li>
                        <li>how to enter fullscreen mode</li>
                    </ul>
                </p>
                <Button text="Run" onClick={() => window.location.search = "arkanoid"}></Button>
            </Card>

            <Card elevation={Elevation.TWO} style={{ margin: "1em" }}>
                <H2>Dhrystone benchmark</H2>
                <p>
                    The Dhrystone "C" benchmark provides a measure of integer performance (no floating point instructions).
                    It became the key standard benchmark from 1984, with the growth of Unix systems.
                </p>
                <p>
                    Here you can examine your PC and find comparable old PC model.
                </p>
                <Button text="Run" onClick={() => window.location.search = "dhry2"}></Button>
            </Card>
        </div>
    </div>;
}