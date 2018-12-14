import React from "react";
import Logo from "../../resources/icons/logo.png";
import { Link } from "react-router-dom";

import "./Layout.scss";

export const Layout = ({ white, ...props }) => {
  if (white) {
    document.body.classList.add("white_background");
  } else {
    document.body.classList.remove("white_background");
  }

  return <div className="main_wrapper">{props.children}</div>;
};

export const Header = props => {
  return (
    <div className="header_wrapper">
        <span className="brand">GRAPPLE MAP</span>
        <img src={Logo} alt="Logo" />
      <span className="float_right">{props.children}</span>
    </div>
  );
};

export const Content = props => {
  return <div className="content_wrapper">{props.children}</div>;
};
