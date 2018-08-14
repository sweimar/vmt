const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const Course = require('./Course');
const Room = new mongoose.Schema({
  template: {type: ObjectId, ref: 'RoomTemplate'},
  name: {type: String},
  description: {type: String},
  roomType: {type: String, default: 'geogebra'},
  course: {type: ObjectId, ref: 'Course'},
  creator: {type: ObjectId, ref: 'User', required: true},
  events: [{type: ObjectId, ref: 'Event'}],
  chat: [{type: ObjectId, ref: 'Message'}],
  members: [{user: {type: ObjectId, ref: 'User'}, role: {type: String}, _id: false}],
  currentUsers: {type: [{type: ObjectId, ref: 'User'}], default: []},
  tabs: [{
    ggbFile: {type: String,},
    desmosLink: {type: String,},
    _id: false,
  }],
  notifications: [{user: {type: ObjectId, ref: 'User'}, notificationType: {type: String}, _id: false}],
  isPublic: {type: Boolean, default: false}
},
{timestamps: true});

Room.pre('save', function (next) {
  console.log("room pre save hook ", this.course)
  console.log(this.creator)
  // ON CREATION UPDATE THE CONNECTED MODELS
  if (this.isNew) {
    User.findById(this.creator)
    .then(user => {
      if (!user.rooms) {user.rooms = [this._id]}
      else {user.rooms.push(this._id)}
      user.save();
    })
    .catch(err => {
      return console.log(err)
    })
    if (this.course) {
      console.log('looking for course')
      Course.findById(this.course)
      .then(course => {
        if (!course.rooms) {course.rooms = [this._id]}
        else {course.rooms.push(this._id)}
        // add this room members of this course
        const members = course.members.reduce((filtered, member) => {
          if (member.user !== this.creator) {
            filtered.push(member.user._id)
          }
        }, [])
        console.log('MEMBERS ', members)
        if (members) {
          User.update({_id: {$in: members}}, {$addToSet: {rooms: this._id}})
          .then(users => {

          })

        }
        course.save();
      })
      .catch(err => console.log(err))
    }
  }
  next();
});

Room.post('save', function(doc) { // intentionally not using arrow functions so 'this' refers to the model
  // If this is a post request hook

})

module.exports = mongoose.model('Room', Room);
