import React from "react";
import { Button } from "@blueprintjs/core";

export default function Landing() {
    return <Button text="digger" onClick={() => window.location.search = "digger"}></Button>
}