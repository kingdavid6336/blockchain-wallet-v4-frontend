import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { actions, model } from 'data'
import { Wrapper } from 'components/Public'

import { getData } from './selectors'
import Loading from './template.loading'
import Success from './template.success'
import Error from './template.error'

const AuthorizeLoginWrapper = styled(Wrapper)`
  padding: 48px 0;
  width: 320px;
`

const {
  VERIFY_DEVICE_ACCEPTED,
  VERIFY_DEVICE_EMAIL_SENT,
  VERIFY_DEVICE_REJECTED
} = model.analytics.PREFERENCE_EVENTS.SECURITY

class AuthorizeLogin extends React.PureComponent {
  constructor (props) {
    super(props)
    this.onAccept = this.onAccept.bind(this)
    this.onReject = this.onReject.bind(this)
    this.state = {
      token: decodeURIComponent(
        props.location.pathname.split('/authorize-approve/')[1]
      ),
      loginApproved: false
    }
  }

  componentDidMount () {
    const { analyticsActions, miscActions } = this.props
    miscActions.authorizeLogin(this.state.token)
    analyticsActions.logEvent(VERIFY_DEVICE_EMAIL_SENT)
  }

  onAccept (e) {
    const { analyticsActions, miscActions } = this.props
    e.preventDefault()
    miscActions.authorizeLogin(this.state.token, true)
    analyticsActions.logEvent(VERIFY_DEVICE_ACCEPTED)
  }

  onReject (e) {
    const { analyticsActions, miscActions } = this.props
    e.preventDefault()
    miscActions.authorizeLogin(this.state.token, false)
    analyticsActions.logEvent(VERIFY_DEVICE_REJECTED)
  }

  render () {
    const { data } = this.props

    let AuthorizeLoginStatus = data.cata({
      Success: value => (
        <Success
          value={value}
          onAccept={this.onAccept}
          onReject={this.onReject}
          handleSuccessContainer={() => this.setState({ loginApproved: true })}
        />
      ),
      Failure: value => <Error value={value} />,
      Loading: () => <Loading />,
      NotAsked: () => <Loading />
    })

    return this.state.loginApproved ? (
      <AuthorizeLoginWrapper>{AuthorizeLoginStatus}</AuthorizeLoginWrapper>
    ) : (
      <Wrapper>{AuthorizeLoginStatus}</Wrapper>
    )
  }
}

const mapStateToProps = state => ({
  data: getData(state)
})

const mapDispatchToProps = dispatch => ({
  analyticsActions: bindActionCreators(actions.analytics, dispatch),
  miscActions: bindActionCreators(actions.core.data.misc, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthorizeLogin)
