import { Component } from 'react';
import socket from '../../utils/sockets';
import { normalize } from '../../store/utils/normalize';
import { connect } from 'react-redux';
import { capitalize } from 'lodash';
import {
  addNotification,
  addUserCourses,
  addUserRooms,
  gotCourses,
  gotRooms,
  getUser,
  addCourseRooms,
  addRoomMember,
  addCourseMember,
  updateUser
} from '../../store/actions';

class SocketProvider extends Component {
  state = {
    initializedCount: 0
  }
  componentDidMount() {
    console.log(socket.listeners())
    if (this.props.user.loggedIn) {
      // console.log(socket._callbacks)
      socket.removeAllListeners()
      // console.log(socket._callbacks)
      this.initializeListeners();
    }
  }

  shouldComponentUpdate(nextProps) {
    if (!this.props.user.loggedIn && nextProps.user.loggedIn) {
      return true;
    } else return false;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.user.loggedIn && this.props.user.loggedIn) {
      // console.log(socket._callbacks)
console.log("LISTENERS: ", socket.listeners)
      socket.removeAllListeners()
      console.log("LISTENERS: ", socket.listeners)
      console.log(socket._callbacks)
      this.initializeListeners();
    }
  }

  initializeListeners() {
    console.log(this.state.initializedCount)
    this.setState({initializedCount: this.state.initializedCount + 1})
    let { socketId, _id } = this.props.user;
    socket.emit('CHECK_SOCKET', {socketId, _id }, (res, err) => {
      if (err) {
        //something went wrong updatnig user socket
        console.log('err updating user socketId', err);
        // HOW SHOULD WE HANDLE THIS @TODO
        return
      }
      this.props.updateUser({connected: true})
      console.log('checked socket', res);
    })


    socket.on('NEW_NOTIFICATION', data => {
      console.log('new ntf')
      let { notification, course, room } = data;
      let type = notification.notificationType;
      let resource = notification.resourceType;

      this.props.addNotification(notification)

      if (type === 'newMember') {
        // add new member to room
        let actionName = `add${capitalize(resource)}Member`;
        this.props[actionName](notification.resourceId, notification.fromUser);
      }
      if (course) {
        let normalizedCourse = normalize([course])
        this.props.gotCourses(normalizedCourse);

        this.props.addUserCourses([course._id])
      }

      if (room) {
        let normalizedRoom = normalize([data.room])

        this.props.gotRooms(normalizedRoom, true)
        this.props.addUserRooms([data.room])
        if (data.room.course) {
          this.props.addCourseRooms(data.room.course, [data.room._id])
        }
      }
    })

    socket.on('disconnect', () => {
      console.log('socket disconnected')
      this.props.updateUser({connected: false})
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('reconnected after ', attemptNumber, ' attempts')
      // MAYBE FETCH THE USER TO GET MISSING NOTIFICATIONS AND THE LIKE
      this.props.getUser(this.props.user._id)
      this.props.updateUser({connected: true})
    })
  }

  componentWillUnmount() {
    console.log('socket provider unmounted')
    socket.removeAllListeners()
  }

  render(){
    return this.props.children
  }
}

const mapStateToProps = state => {
  return {user: state.user}
}

export default connect(mapStateToProps, {
  addNotification,
  addUserCourses,
  getUser,
  addUserRooms,
  gotCourses,
  gotRooms,
  addCourseRooms,
  addRoomMember,
  addCourseMember,
  updateUser,
})(SocketProvider);