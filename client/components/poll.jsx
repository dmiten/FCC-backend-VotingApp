"use strict";

import axios from "axios";
import React from "react";
import { Chart } from "react-google-charts";
import ClipboardButton from "react-clipboard.js";
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  Form,
  FormControl,
  Panel
} from "react-bootstrap";

export function renderPoll(poll) {

  let onClickDelete = () => {

        deletePollfromDb(poll._id)

        .then(result => {
          if (result === "poll deleted") {

            let _state = Object.assign({}, this.state);
            _state.ownPollsId.splice(_state.ownPollsId.indexOf(poll._id), 1);

            for (let i = 0; i < this.ownPolls.length; i++) {
              if (this.ownPolls[i]._id === poll._id) {
                this.ownPolls.splice(i, 1);
                break;
              }
            }

            for (let i = 0; i < _state.polls.length; i++) {
              if (_state.polls[i]._id === poll._id) {
                _state.polls.splice(i, 1);
                break;
              }
            }

            sessionStorage.setItem("ownPolls", JSON.stringify(this.ownPolls));
            sessionStorage.setItem("ownPollsId", JSON.stringify(_state.ownPollsId));

            pushToDb.bind(this)();

            this.setState({
              mode: _state.prevMode,
              ownPollsId: _state.ownPollsId,
              polls: _state.polls
            });
          }
        });
      },

      onSubmit = () => {
        let index = document.forms.pollform.options.value;

        if (document.forms.pollform.newoption) {
          if (!document.forms.pollform.newoption.value) {
            return;
          }
          poll.details.options.push(document.forms.pollform.newoption.value);
          poll.details.votes[index] = 0;
        }

        poll.details.votes[index] = poll.details.votes[index] + 1;
        poll.details.voted.push(this.state.fingerprint);

        axios.post("/poll/change", {
          fingerprint: this.state.fingerprint,
          poll: poll
        })
        .then(res => {
          if (res.data.message === "poll changed") {

            let _state = Object.assign({}, this.state);

            for (let i = 0; i < this.ownPolls.length; i++) {
              if (this.ownPolls[i]._id === poll._id) {
                this.ownPolls[i] = poll;
                break;
              }
            }

            for (let i = 0; i < _state.polls.length; i++) {
              if (_state.polls[i]._id === poll._id) {
                _state.polls[i] = poll;
                break;
              }
            }

            this.setState({
              currentPoll: poll,
              polls: _state.polls
            });
          }
        })
        .catch(err => console.log(err));
      },

      renderOptions = () => {
        let options = [];
        for (let i = 0; i < poll.details.options.length; i++) {
          options.push(

              <option key={poll.details.options[i]}
                      value={i}>
                {poll.details.options[i]}
              </option>
          )
        }
        if (this.state.userId) { // ◄---------------------------- for auth users

          options.push(
              <option key="forauthuser"
                      value={poll.details.options.length}>
                add new option
              </option>
          )
        }
        return options
      },

      addNewOption = () => {
        if (+document.forms.pollform.options.value === poll.details.options.length) {
          let elements =
              <FormControl className="polloptions"
                           name="newoption"
                           placeholder="here"
                           type="text"/>;

          this.setState({ additional: elements })
        } else {
          this.setState({ additional: "" })
        }
      },

      conditionalForm = () => { // ◄------------------------ if user didn't vote
        if (poll.details.voted.indexOf(this.state.fingerprint) === -1) {
          return (
              <Form name="pollform">
                <ControlLabel>
                  choose a option
                </ControlLabel>
                <FormControl componentClass="select"
                             className="polloptions"
                             name="options"
                             onChange={addNewOption}>
                  {renderOptions()}
                </FormControl>
                {this.state.additional}
              </Form>
          )
        }
      },

      conditionalButtonSubmit = () => { // ◄---------------- if user didn't vote
        if (poll.details.voted.indexOf(this.state.fingerprint) === -1) {
          return (
              <Button className="btn btn-warning pollbutton"
                      bsStyle="info"
                      onClick={onSubmit}>
                submit
              </Button>
          )
        }
      },

      conditionalButtonDelete = () => { // ◄--------------------- for owner only
        if (poll.owner === this.state.userId) {
          return (
              <Button className="pull-right pollbutton"
                      bsStyle="danger"
                      onClick={onClickDelete}>
                delete
              </Button>
          )
        }
      },

      chartData = () => {
        let chartData = [["option", "votes"]];
        for (let i = 0; i < poll.details.options.length; i++) {
          chartData.push([poll.details.options[i], poll.details.votes[i]])
        }
        return chartData
      },

      renderLink = () => {
        return (
            <ClipboardButton className="btn btn-success pollbutton"
                             data-clipboard-text={window.location.href + "poll/"
                             + poll._id}>
              copy link to clipboard
            </ClipboardButton>
        )
      };

    return (

        <Panel id="pollpanel"
               bsStyle="info"
               key={poll._id}
               header={conditionalPollHeader.bind(this)(poll)}>
          <div>
            {conditionalForm()}
            <Chart chartType="PieChart"
                   data={chartData()}
                   options={{ pieHole: 0.4 }}
                   graph_id="ieChart"
                   width="100%"
                   height="300px"
                   legend_toggle
                   />
            <ButtonToolbar>
              <Button className="btn btn-primary pollbutton"
                      onClick={() => {
                        this.setState({
                          additional: "",
                          mode: this.state.prevMode
                        })
                      }}>
                close
              </Button>
              {renderLink()}
              {conditionalButtonSubmit()}
              {conditionalButtonDelete()}
            </ButtonToolbar>
          </div>
        </Panel>
    )
}

export function conditionalPollHeader(poll) {
  if (poll.owner === this.state.userId) {
    return (
        poll.details.voted.length + " voted: " + poll.details.question
    )
  } else {
    return (
        poll.details.question
    )
  }
}

export function getPollDetails(pollId) { // ◄---------- get poll's details by id

  return (
      axios.post("/poll/get", { pollId: pollId })
      .then(res => {
        return res.data.poll;
      })
      .catch(err => console.log(err))
  );
}

export function getRandomPolls() { // ◄------------- get 10 random polls from db
  axios.post("/poll/list")
  .then(res => {
    if (res.data.polls) {
      this.setState({ polls: res.data.polls });
    }
    else {
      this.setState({ polls: [] })
    }
  })
  .catch(err => console.log(err))
}

export function deletePollfromDb(pollId) { // ◄--------------- delete poll by id
  return (
      axios.post("/poll/delete",
          { pollId: pollId },
          { headers: {
            "Authorization": sessionStorage.getItem("token")
          }})
      .then(res => {
        return res.data.message
      })
      .catch(err => console.log(err))
  )
}

export function pushToDb() { // ◄------------------ push to db (user) ownPollsId
  axios.post("/user/pushOwnPollsId",
      { ownPollsId: this.state.ownPollsId },
      { headers: {
        "Authorization": sessionStorage.getItem("token")
      }})
  .catch(err => console.log(err));
}