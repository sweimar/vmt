/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  DashboardLayout,
  SidePanel,
  ActivityDetails,
  ResourceList,
} from '../Layout/Dashboard';
import {
  Aux,
  // Modal,
  Button,
  BreadCrumbs,
  TabList,
  EditText,
  TrashModal,
  Error,
} from '../Components';
import {
  getCourses,
  getRooms,
  updateActivity,
  getActivities,
  getCurrentActivity,
} from '../store/actions';
import { populateResource } from '../store/reducers';

class Activity extends Component {
  constructor(props) {
    super(props);
    const { activity } = this.props;
    this.state = {
      owner: false,
      tabs: [{ name: 'Details' }, { name: 'Rooms' }, { name: 'Settings' }],
      // assigning: false, // this seems to be duplicated in Layout/Dashboard/MakeRooms.js
      editing: false,
      name: activity ? activity.name : null,
      description: activity ? activity.description : null,
      instructions: activity ? activity.instructions : null,
      privacySetting: activity ? this.privacySetting : null,
      // isAdmin: false,
    };
  }

  componentDidMount() {
    const { activity, connectGetCurrentActivity, match, user } = this.props;
    if (!activity) {
      connectGetCurrentActivity(match.params.activity_id); // WHY ARE WE DOING THIS??
    }
    const { resource } = match.params;
    if (resource === 'rooms') {
      // this.fetchRooms();
    }
    // Check ability to edit
    if (activity.creator === user._id) {
      this.setState({ owner: true });
    }
  }

  componentDidUpdate(prevProps) {
    const { activity, match, loading } = this.props;
    if (!activity) {
      return;
    }

    if (!prevProps.activity && activity) {
      const { name, description, instructions, privacySetting } = activity;
      this.setState({
        name,
        description,
        instructions,
        privacySetting,
      });
    }
    const prevResource = prevProps.match.params.resource;
    const { resource } = match.params;
    if (prevResource !== resource && resource === 'rooms') {
      // this.fetchRooms()
    }
    if (
      prevProps.loading.updateResource === null &&
      loading.updateResource === 'activity'
    ) {
      this.setState({
        name: activity.name,
        description: activity.description,
        privacySetting: activity.privacySetting,
        instructions: activity.instructions,
      });
    }
  }

  // fetchRooms() {
  //   const { activity, populatedActivity } = this.props;
  //   if (activity.rooms.length !== populatedActivity.rooms.length) {
  //     this.props.getRooms(activity.rooms)
  //   }
  // }

  toggleEdit = () => {
    const { activity } = this.props;
    this.setState(prevState => ({
      editing: !prevState.editing,
      name: activity.name,
      description: activity.description,
      privacySetting: activity.privacySetting,
      instructions: activity.instructions,
    }));
  };
  // options is for radioButton/checkbox inputs
  updateActivityInfo = (event, option) => {
    const { value, name } = event.target;
    this.setState({ [name]: option || value });
  };

  updateActivity = () => {
    const { connectUpdateActivity, activity } = this.props;
    const {
      name,
      instructions,
      details,
      privacySetting,
      description,
    } = this.state;
    const body = { name, details, instructions, privacySetting, description };
    Object.keys(body).forEach(key => {
      if (body[key] === activity[key]) {
        delete body[key];
      }
    });
    connectUpdateActivity(activity._id, body);
    this.setState({
      editing: false,
    });
  };

  trashActivity = () => {
    this.setState({ trashing: true });
  };

  render() {
    const {
      activity,
      course,
      match,
      user,
      loading,
      updateFail,
      updateKeys,
      rooms,
      history,
      connectUpdateActivity,
    } = this.props;
    const {
      editing,
      privacySetting,
      name,
      description,
      instructions,
      owner,
      tabs,
      trashing,
    } = this.state;
    if (activity) {
      const { resource } = match.params;
      const additionalDetails = {
        type: activity.roomType,
        privacy: (
          <Error
            error={updateFail && updateKeys.indexOf('privacySetting') > -1}
          >
            <EditText
              change={this.updateActivityInfo}
              inputType="radio"
              editing={editing}
              options={['public', 'private']}
              name="privacySetting"
            >
              {privacySetting}
            </EditText>
          </Error>
        ),
      };

      let crumbs = [{ title: 'My VMT', link: '/myVMT/activities' }];
      if (course) {
        crumbs = [
          { title: 'My VMT', link: '/myVMT/courses' },
          {
            title: `${course.name}`,
            link: `/myVMT/courses/${course._id}/activities`,
          },
          {
            title: `${activity.name}`,
            link: `/myVMT/courses/${course._id}/activities/${
              activity._id
            }/details`,
          },
        ];
      } else {
        crumbs.push({
          title: `${activity.name}`,
          link: `/myVMT/activities/${activity._id}/details`,
        });
      }

      let mainContent = (
        <ActivityDetails
          activity={activity}
          update={this.updateActivityInfo}
          instructions={instructions}
          editing={editing}
          owner={owner || user.isAdmin}
          toggleEdit={this.toggleEdit}
          userId={user._id}
          course={course}
          loading={loading}
        />
      );

      if (resource === 'rooms') {
        mainContent = (
          <ResourceList
            userResources={activity.rooms.map(roomId => rooms[roomId])}
            notifications={[]}
            user={user}
            resource={resource}
            parentResource={course ? 'course' : 'activity'}
            parentResourceId={course ? course._id : activity._id}
          />
        );
      }

      return (
        <Aux>
          <DashboardLayout
            breadCrumbs={
              <BreadCrumbs crumbs={crumbs} notifications={user.notifications} />
            }
            sidePanel={
              <SidePanel
                image={activity.image}
                editing={editing}
                name={
                  <Error error={updateFail && updateKeys.indexOf('name')}>
                    <EditText
                      change={this.updateActivityInfo}
                      inputType="title"
                      name="name"
                      editing={editing}
                    >
                      {name}
                    </EditText>
                  </Error>
                }
                subTitle={
                  <Error
                    error={updateFail && updateKeys.indexOf('description')}
                  >
                    <EditText
                      change={this.updateActivityInfo}
                      inputType="text"
                      name="description"
                      editing={editing}
                    >
                      {description}
                    </EditText>
                  </Error>
                }
                owner={owner || user.isAdmin}
                additionalDetails={additionalDetails}
                editButton={
                  owner || user.isAdmin ? (
                    <Aux>
                      <div
                        role="button"
                        style={{
                          display: editing ? 'none' : 'block',
                        }}
                        data-testid="edit-activity"
                        onClick={this.toggleEdit}
                        onKeyPress={this.toggleEdit}
                        tabIndex="-1"
                      >
                        Edit Activity <i className="fas fa-edit" />
                      </div>
                      {editing ? (
                        // @TODO this should be a resuable component
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                          }}
                        >
                          <Button
                            click={this.updateActivity}
                            data-testid="save-activity"
                            theme="Small"
                          >
                            Save
                          </Button>
                          <Button
                            click={this.trashActivity}
                            data-testid="trash-activity"
                            theme="Danger"
                          >
                            <i className="fas fa-trash-alt" />
                          </Button>
                          <Button click={this.toggleEdit} theme="Cancel">
                            Cancel
                          </Button>
                        </div>
                      ) : null}
                    </Aux>
                  ) : null
                }
              />
            }
            mainContent={mainContent}
            tabs={<TabList routingInfo={match} tabs={tabs} />}
          />
          {trashing ? (
            <TrashModal
              resource="activity"
              resourceId={activity._id}
              update={connectUpdateActivity}
              show={trashing}
              closeModal={() => {
                this.setState({ trashing: false });
              }}
              history={history}
            />
          ) : null}
        </Aux>
      );
    }
    return null;
  }
}

Activity.propTypes = {
  match: PropTypes.shape({}).isRequired,
  activity: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  course: PropTypes.shape({}),
  history: PropTypes.shape({}).isRequired,
  loading: PropTypes.bool.isRequired,
  updateFail: PropTypes.bool.isRequired,
  updateKeys: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  rooms: PropTypes.shape({}).isRequired,
  // connectGetCourses: PropTypes.func.isRequired,
  // connectGetRooms: PropTypes.func.isRequired,
  connectUpdateActivity: PropTypes.func.isRequired,
  // connectGetActivities: PropTypes.func.isRequired,
  connectGetCurrentActivity: PropTypes.func.isRequired,
};

Activity.defaultProps = {
  course: null,
};

const mapStateToProps = (state, ownProps) => {
  // eslint-disable-next-line camelcase
  const { activity_id, course_id } = ownProps.match.params;
  return {
    activity: state.activities.byId[activity_id],
    populatedActivity: state.activities.byId[activity_id]
      ? populateResource(state, 'activities', activity_id, ['rooms'])
      : {},
    course: state.courses.byId[course_id],
    rooms: state.rooms.byId,
    userId: state.user._id,
    user: state.user,
    loading: state.loading.loading,
    updateFail: state.loading.updateFail,
    updateKeys: state.loading.updateKeys,
  };
};

export default connect(
  mapStateToProps,
  {
    connectGetCourses: getCourses,
    connectGetRooms: getRooms,
    connectUpdateActivity: updateActivity,
    connectGetActivities: getActivities,
    connectGetCurrentActivity: getCurrentActivity,
  }
)(Activity);
