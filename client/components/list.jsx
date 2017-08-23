"use strict";

import React from "react";

import {
  Button,
  Panel
} from "react-bootstrap";

import { getPollDetails, conditionalPollHeader } from "./poll.jsx";

export default function list(polls) {

  let _polls = [];

  for (let i = 0; i < polls.length; i++) {
    _polls.push(

        <Panel id="pollpanel"
               bsStyle="info"
               key={polls[i]._id}
               header={conditionalPollHeader.bind(this)(polls[i])}>
          <Button bsStyle="info"
                  onClick={() => {
                    getPollDetails(polls[i]._id)
                    .then(res => {
                      this.setState({
                        currentPoll: res,
                        mode: "poll"
                      })
                    })
                  }}>
            open
          </Button>
        </Panel>
    )
  }

  return (
      <div>
        {_polls}
      </div>
  )
};