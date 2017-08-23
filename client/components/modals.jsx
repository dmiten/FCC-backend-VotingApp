"use strict";

import axios from "axios";
import React from "react";
import {
  Button,
  Form,
  FormControl,
  Modal
} from "react-bootstrap";

import "./app.css";

import { getPollDetails, pushToDb } from "./poll.jsx";

export const modals = {};

let validateEmail = (email) => {
      return (
          new RegExp("^(([^<>()\\[\\]\\\\.,;:\\s@\"]+(\\.[^<>()\\[\\" +
          "]\\\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9" +
          "]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$", "i")
      ).test(email);
    },

    getValue = (name) => document.forms.modalform.elements[name].value,

    passNotMatched = () => getValue("password") !== getValue("confirmpassword"),

    showStatusMessage = (message) => {
      document.getElementById("modalmessage").innerHTML = message;
    };

function onClick(actionName) { // ◄---------------------- shared onClick handler

  if (actionName === "close") {
    this.setState({ showModal: false });
    return;
  }

  if (actionName === "signup" || actionName === "login") {

    if (!getValue("email") || !getValue("password")) {
      showStatusMessage("email & password can't be empty");
      return;
    }

    if (!validateEmail(getValue("email"))) {
      showStatusMessage("strange email");
      return;
    }

    if (actionName === "signup") {
      if (passNotMatched()) {
        showStatusMessage("password not confirmed");
        return;
      }
      if (sessionStorage.getItem("token")) {
        showStatusMessage("you have to logged out first");
        return;
      }
    }

    if (actionName === "login" && sessionStorage.getItem("token")) {
      showStatusMessage("you logged in as " + sessionStorage.getItem("email") +
          " already");
      return;
    }

    axios.post("/user/" + actionName, {
      email: getValue("email"),
      password: getValue("password")
    })
    .then(res => {

      if (res.data.user) {

        sessionStorage.setItem("userId", res.data.user.userId);
        sessionStorage.setItem("email", res.data.user.email);
        sessionStorage.setItem("token", res.data.token);

        if (actionName === "login" && res.data.user.ownPollsId) {

          sessionStorage.setItem("ownPollsId",
              JSON.stringify(res.data.user.ownPollsId));

          this.setState({ ownPollsId: res.data.user.ownPollsId });

          res.data.user.ownPollsId.map(id => { // ◄--- fetching ownPolls details
            getPollDetails(id)
            .then(poll => {
              this.ownPolls.push(poll);
              sessionStorage.setItem("ownPolls", JSON.stringify(this.ownPolls));
            });
          });
        }
        this.setState({ userId: res.data.user.userId });
      }
      showStatusMessage(res.data.message);
    })
    .catch(err => {
      showStatusMessage(err.message);
    });
  }

  if (actionName === "logout") {
    axios.post("/user/logout",
        { email: sessionStorage.getItem("email") },
        { headers: {
          "Authorization": sessionStorage.getItem("token")
        }}
    )
    .then(res => {
      showStatusMessage(res.data.message);
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("ownPollsId");
      sessionStorage.removeItem("ownPolls");
      this.setState({
        ownPollsId: [],
        currentPoll: {},
        mode: "home",
        userId: ""
      });
    })
    .catch(err => {
      showStatusMessage(err.message);
    });
  }
}

function makeNewPoll() { // ◄------ make & add new poll handler (mongodb, state)

  if (!getValue("question")
      || !getValue("options")
      || !sessionStorage.getItem("token")) {
    showStatusMessage("question & options can't be empty");
    return;
  }

  let _state = Object.assign({}, this.state),
      options = getValue("options").split(/\n/),
      poll = {
        question: getValue("question"),
        options: options,
        votes: options.map(() => 0)
      };

  axios.post("/poll/add",
      { poll: poll },
      { headers: {
        "Authorization": sessionStorage.getItem("token")
      }})
  .then(res => {
    if (res.data.poll) {

      _state.ownPollsId.push(res.data.poll._id);

      this.ownPolls.push(res.data.poll);

      sessionStorage.setItem("ownPolls", JSON.stringify(this.ownPolls));
      sessionStorage.setItem("ownPollsId", JSON.stringify(_state.ownPollsId));

      pushToDb.bind(this)();

      this.setState({ ownPollsId: _state.ownPollsId });
    }
    showStatusMessage(res.data.message);
  })
  .catch(err => console.log(err));

}

modals.signup = {

  header: function() { // ◄----------------------------------------- signup form
    return (
        <div className="text-center">
          <span className="fa fa-sign-in">&nbsp;</span>
          signup
        </div>
    )
  },

  body: function() {
    return (
        <div>
          <Form horizontal
                name="modalform">
              <FormControl className="forminput"
                           name="email"
                           placeholder="email"
                           type="email"/>
              <FormControl className="forminput"
                           name="password"
                           placeholder="password"
                           type="password"/>
              <FormControl className="forminput"
                           name="confirmpassword"
                           placeholder="confirm password"
                           type="password"/>
          </Form>
          <div className="text-center">
            <span id="modalmessage">&nbsp;</span>
          </div>
        </div>
    )
  },

  footer: function() {
    return (
        <div>
          <Button onClick={() => onClick.bind(this)("close")}>
            close
          </Button>
          <Button bsStyle="primary"
                  onClick={() => onClick.bind(this)("signup")}>
            signup
          </Button>
        </div>
    )
  }
};

modals.login = { // ◄------------------------------------------------ login form

  header: function() {
    return (
        <div className="text-center">
          <span className="fa fa-sign-in"/>
          &nbsp;login
        </div>
    )
  },

  body: function() {
    return (
        <div>
          <Form horizontal
                name="modalform">
            <FormControl className="forminput"
                         name="email"
                         placeholder="email"
                         type="email"/>
            <FormControl className="forminput"
                         name="password"
                         placeholder="password"
                         type="password"/>
          </Form>
          <div className="text-center">
            <span id="modalmessage">&nbsp;</span>
          </div>
        </div>
    )
  },

  footer: function() {
    return (
        <div>
          <Button onClick={() => onClick.bind(this)("close")}>
            close
          </Button>
          <Button bsStyle="primary"
                  onClick={() => onClick.bind(this)("login")}>
            login
          </Button>
        </div>
    )
  }
};

modals.logout = { // ◄---------------------------------------------- logout form

  header: function() {
    return (
        <div className="text-center">
          <span className="fa fa-sign-out"/>
          &nbsp;logout
        </div>
    )
  },

  body: function() {
    return (
        <div>
          <text>
            you are going to logout
          </text>
          <div className="text-center">
            <span id="modalmessage">&nbsp;</span>
          </div>
        </div>
    )
  },

  footer: function() {
    return (
        <div>
          <Button onClick={() => onClick.bind(this)("close")}>
            close
          </Button>
          <Button bsStyle="primary"
                  onClick={() => onClick.bind(this)("logout")}>
            logout
          </Button>
        </div>
    )
  }
};

modals.addPoll = { // ◄-------------------------------------------- add new poll

  header: function() {
    return (
        <div className="text-center">
          <span className="fa fa-plus"/>
          &nbsp;add new poll
        </div>
    )
  },

  body: function() {
    return (
        <div>

          <Form horizontal
                name="modalform">
            <FormControl className="forminput"
                         name="question"
                         placeholder="question"
                         type="text"/>
            <FormControl componentClass="textarea"
                         className="forminput"
                         name="options"
                         placeholder="options by lines"/>
          </Form>

          <div className="text-center">
            <span id="modalmessage">&nbsp;</span>
          </div>
        </div>
    )
  },

  footer: function() {
    return (
        <div>
          <Button onClick={() => onClick.bind(this)("close")}>
            close
          </Button>
          <Button bsStyle="primary"
                  onClick={() => makeNewPoll.bind(this)()}>
            add
          </Button>
        </div>
    )
  }

};

modals.render = function() {

  return (
      <Modal show={this.state.showModal}
             onHide={() => this.setState({ showModal: false })}>
        <Modal.Header closeButton>
          <Modal.Title>
            {this.state.modal.header.bind(this)()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.modal.body.bind(this)()}
        </Modal.Body>
        <Modal.Footer>
          {this.state.modal.footer.bind(this)()}
        </Modal.Footer>
      </Modal>
  )
};