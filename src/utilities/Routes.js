import React from 'react';
import { Switch, Route} from 'react-router-dom'

import Home from '../containers/pages/Home'

const Routes = (props) => {
  return(
    <Switch>
      {/* <Route exact component={LoginPage} path="/login"/> */}
      <Route exact component={Home} path="/"/>
      <Route component={CatchAllPage} />
    </Switch>
  )
}

//A protected route that redirects to login if user is not authenticated
// const PrivateRoute = ({ component: Component, ...rest }) => (
//   <Route {...rest} render={(props) => (
//     Api.hasToken() === true
//       ? <Component {...props} />
//       : <Redirect to={{
//           pathname: '/login',
//           state: { from: props.location }
//         }} />
//   )} />
// );

const CatchAllPage = () => (
  <div>
    Nope
  </div>
  // <ErrorPage heading="404 Error - page not found">
  // </ErrorPage>
)

export default Routes;