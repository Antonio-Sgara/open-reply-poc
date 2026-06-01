import React, { Component } from "react";
import PropTypes from "prop-types";
// import { API_URL } from './config'
import client from "./request";
import { PATH_API } from "model/common";

export default class OAuth extends Component {
  constructor(props) {
    super(props);

    this.state = {
      disabled: "",
      token: ""
    };

    this.onToken = this.onToken.bind(this);
  }

  onToken = () => {
    this.props.token(this.state);
  };

  checkPopup() {
    const check = setInterval(() => {
      const { popup } = this;
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(check);
        this.setState({ disabled: "" });
      }
    }, 1000);
  }

  openPopup() {
    // const width = 600,
    //   height = 600;
    // const left = window.innerWidth / 2 - width / 2;
    // const top = window.innerHeight / 2 - height / 2;
    // const url = `http://reptest.replycloud.prv:4400/gbiauthlogin`;
    //
    // return window.open(
    //   url,
    //   "",
    //   `toolbar=no, location=no, directories=no, status=no, menubar=no,
    //   scrollbars=no, resizable=no, copyhistory=no, width=${width},
    //   height=${height}, top=${top}, left=${left}`
    // );
  }

  startAuth = () => {
    // if (!this.state.disabled) {
    //   this.popup = this.openPopup();
    //   this.checkPopup();
    //   this.setState({ disabled: "disabled" });
    const url = `${PATH_API.DOMAIN}gbiauthlogin`;

    // const check = setInterval(() => {
    client
      .get(`gbiauthpoll`)
      .then(res => {
        if (res.data !== "") {
          // clearInterval(check);
          this.setState({ token: res.data });
          this.onToken();
          // this.popup.close();
        } else {
          // clearInterval(check);
          window.location.replace(url);
          // window.location = url;
        }
      })
      .catch(res => {
        // clearInterval(check);
        this.startAuth();
        // this.popup.close();
      });
    // }, 1000);
    // }
  };

  closeCard = () => {
    this.setState({ user: {} });
  };

  render() {
    //const { disabled } = this.state;
    return (
      <div>
        {
          // <div className='button-wrapper fadein-fast'>
          //     <button onClick={this.startAuth} className={`login ${disabled} button`} >
          //         Login
          //     </button>
          // </div>
        }
      </div>
    );
  }
}

OAuth.propTypes = {
  token: PropTypes.func.isRequired
};
