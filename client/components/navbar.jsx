"use strict";

import React from "react";

import {
  Nav,
  Navbar,
  NavDropdown,
  NavItem,
  MenuItem,
} from "react-bootstrap";

import "./app.css";

import { modals } from "./modals.jsx";
import { getRandomPolls } from "./poll.jsx";

export default function navbar() {

  let conditional = {};

  conditional.elements = () => {

    if (sessionStorage.getItem("token")) { // ◄--- if we have token -> auth user
      return (
          <Nav className="navpullright"
               pullRight={true}>
            <NavDropdown eventKey="1"
                         id="dropdown"
                         title={sessionStorage.getItem("email")}>
              <MenuItem eventKey="1.1"
                        onClick={() => this.setState({ mode: "ownPolls" })}>
                  my polls
              </MenuItem>
              <MenuItem eventKey="1.2"
                        onClick={() => {
                          this.setState({
                            modal: modals.addPoll,
                            showModal: true
                          })
                        }}>
                add poll
              </MenuItem>
              <MenuItem eventKey="1.3"
                        onClick={() => {
                          this.setState({
                            modal: modals.logout,
                            showModal: true
                          })
                        }}>
                logout
              </MenuItem>
            </NavDropdown>
          </Nav>
      );

    } else { // ◄------------------------------------------ nav for unauth users
      return (
          <Nav className="navpullright"
               pullRight={true}>
            <NavItem eventKey={1}
                     onClick={() => {
                       this.setState({
                         modal: modals.signup,
                         showModal: true
                       })
                     }}>
              signup
            </NavItem>
            <NavItem eventKey={2}
                     onClick={() => {
                       this.setState({
                         modal: modals.login,
                         showModal: true
                       })
                     }}>
              login
            </NavItem>
          </Nav>
      )
    }
  };

  conditional.buttons = () => {

    if (this.state.mode === "home"
        || this.state.mode === "poll" && this.state.prevMode === "home") {
      return (
          <div className="cursorpointer"
               onClick={() => {
                 getRandomPolls.bind(this)();
                 this.setState({ mode: "home" })
               }}>
            <span className="fa fa-refresh"/>
          </div>
      )
    }

    if (this.state.mode === "ownPolls"
        || this.state.mode === "poll" && this.state.prevMode === "ownPolls") {
      return (
          <div className="cursorpointer"
               onClick={() => this.setState({ mode: "home" })}>
            <span className="fa fa-home"/>
          </div>
      )
    }
  };

  return (
      <Navbar collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            {conditional.buttons()}
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          {conditional.elements()}
        </Navbar.Collapse>
      </Navbar>
  )
}