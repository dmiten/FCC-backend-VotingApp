"use strict";

import React from "react";

import "./app.css";

export default function header() {

  return (
      <div id="header">
        <div id="name">
          quizme&nbsp;|&nbsp;
          <span id="votingapp">
              <sub>
                voting app
              </sub>
            </span>
        </div>
        <div id="copyright">
          <span>
                dmiten |&nbsp;
            <a href="https://github.com/dmiten/FCC-backend-VotingApp"
               target="blank">
                <span className="fa fa-github"/>
              </a>
          </span>
          &nbsp;2017
        </div>
        <br/>
      </div>
  )
}