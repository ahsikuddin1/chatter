import React, { useContext } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import './App.scss';
import { UserContext } from './contexts/user.context';
import Nav from './components/nav/nav.component';
import MobileNav from './components/mobile-nav/mobile-nav.component';
import Home from './screens/home/home.component';
import Register from './screens/register/register.component';
import Login from './screens/login/login.component';
import Post from './screens/post/post.component';
import Users from './screens/users/users.component';
import Profile from './screens/profile/profile.component';
import Follows from './screens/follows/follows.component';
import Notifications from './screens/notifications/notifications.component';
import Trending from './screens/trending/trending.component';
import HashtagPosts from './screens/hashtag-posts/hashtag-posts.component';

const App = () => {
  const { user } = useContext(UserContext);

  return (
    <div className='App'>
      <Nav />
      <MobileNav />
      <div className='body'>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/posts' component={Home} />
          <Route exact path='/users' component={Users} />
          <Route path='/register' component={Register} />
          <Route path='/trending/:category' component={HashtagPosts} />
          <Route path='/trending' component={Trending} />
          <Route path='/login' component={Login} />
          <Route
            path='/notifications'
            component={user ? Notifications : Login}
          />
          <Route exact path='/users/:username' component={Profile} />
          <Route path='/users/:username/followers' component={Follows} />
          <Route path='/users/:username/following' component={Follows} />
          <Route path='/posts/:id' component={Post} />
          <Route path='/comments/:subcomment_id' component={Post} />
          <Redirect to='/' />
        </Switch>
      </div>
    </div>
  );
};

export default App;
