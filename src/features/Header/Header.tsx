import type { Component } from "solid-js";
import { css, cx } from "@emotion/css";

import logo from "./logo.svg";

const styles = css`
  text-align: left;
  padding: 25px;
`;

const Header: Component = () => {
  return <header class={styles}>GRAPPLEMAP</header>;
};

export default Header;
