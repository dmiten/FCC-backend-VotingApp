"use strict"

import Fingerprint2 from "fingerprintjs2";
import React from "react";

import "./app.css";

import { modals } from "./modals.jsx";
import header from "./header.jsx";
import navbar from "./navbar.jsx";
import list from "./list.jsx";
import { renderPoll, getPollDetails, getRandomPolls } from "./poll.jsx";

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.ownPolls = JSON.parse(sessionStorage.getItem("ownPolls")) || [];
    this.state = {
      additional: "",
      fingerprint: localStorage.getItem("fingerprint") || "",
      currentPoll: {},
      modal: modals.login,
      mode: "home",
      ownPollsId: JSON.parse(sessionStorage.getItem("ownPollsId")) || [],
      polls: [],
      prevMode: "",
      showModal: false,
      userId: sessionStorage.getItem("userId") || ""
    };
  }

  componentWillMount() {

    let pollId = window.location.pathname.split("/").splice(2,1).toString();
    history.replaceState(null, null, "/");

    if (pollId) {
      getPollDetails(pollId)
      .then(poll => {
        if (poll) {
          this.setState({
            mode: "poll",
            currentPoll: poll,
            prevState: "home"
          });
        }
      });
    }

    if (!this.state.fingerprint) {
      new Fingerprint2().get((result, components) => {
        this.setState({ fingerprint: result });
        localStorage.setItem("fingerprint", result);
      });
    }

    getRandomPolls.bind(this)();
  }

  componentDidUpdate(prevProps, prevState) { // ◄--------------------- "history"
    if (this.state.mode !== prevState.mode) {
      this.setState({ prevMode: prevState.mode });
    }
  }

  render() {
    let conditionalElements = () => {

      if (this.state.mode === "home") {
        return list.bind(this)(this.state.polls);
      }

      if (this.state.mode === "ownPolls") {
        return list.bind(this)(this.ownPolls);
      }

      if (this.state.mode === "poll") {
        return renderPoll.bind(this)(this.state.currentPoll);
      }
    };

    return (
        <div className="jumbotron"
             id="main">
          {header()}
          {navbar.bind(this)()}
          {conditionalElements()}
          {modals.render.bind(this)()}
        </div>
    )
  }
}