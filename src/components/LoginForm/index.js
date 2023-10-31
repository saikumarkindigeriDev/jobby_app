import {Component} from 'react'

import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'

import './index.css'

const logoImg = 'https://assets.ccbp.in/frontend/react-js/logo-img.png '

class LoginForm extends Component {
  state = {
    username: '',
    password: '',
    showErrMsg: false,
    errMsg: '',
  }

  onChangeUserName = e => {
    this.setState({username: e.target.value})
  }

  onChangePassword = e => {
    this.setState({password: e.target.value})
  }

  submitSuccess = jwtToken => {
    Cookies.set('jwt_token', jwtToken, {expires: 30})
    const {history} = this.props
    history.replace('/')
  }

  loginFailed = errorMsg => {
    this.setState({showErrMsg: true, errMsg: errorMsg})
  }

  onSubmitLoginForm = async e => {
    e.preventDefault()
    const {username, password} = this.state

    const userDetails = {username, password}
    const url = 'https://apis.ccbp.in/login'
    const options = {
      method: 'POST',
      body: JSON.stringify(userDetails),
    }
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      this.submitSuccess(data.jwt_token)
    } else {
      this.loginFailed(data.error_msg)
    }
  }

  render() {
    const {username, password, showErrMsg, errMsg} = this.state

    const jwtToken = Cookies.get('jwt_token')
    if (jwtToken !== undefined) {
      return <Redirect to="/" />
    }

    return (
      <div className="login-container">
        <form
          className="login-form-container"
          onSubmit={this.onSubmitLoginForm}
        >
          <div className="form-logo-container">
            <img
              src={logoImg}
              alt="website logo"
              className="login-logo-image"
            />
          </div>
          <label className="form-label" htmlFor="username">
            USERNAME
            <br />
          </label>
          <input
            className="form-input"
            type="text"
            value={username}
            onChange={this.onChangeUserName}
            id="username"
            placeholder="Username"
          />
          <br />
          <label className="form-label" htmlFor="password">
            PASSWORD
          </label>
          <br />

          <input
            type="password"
            className="form-input"
            value={password}
            onChange={this.onChangePassword}
            id="password"
            placeholder="Password"
          />
          <br />
          <button type="submit" className="form-submit-button">
            Login
          </button>
          {showErrMsg && <p className="error-message">*{errMsg}</p>}
        </form>
      </div>
    )
  }
}

export default LoginForm
