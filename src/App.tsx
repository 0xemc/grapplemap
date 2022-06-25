import type { Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import Header from "./features/Header";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Header />
    </div>
  );
};

export default App;
