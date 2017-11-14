var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User'},
  title: {type: String, required: true},
  location: {type: String, required: true},
  starts: {type: Date, required: true},
  ends: {type: Date, required: true},
  eventDescription: {type: String, required: true},
  organizerName: {type: String, required: true},
  organizerDescription: {type: String, required: true},
  eventType: {type: String, required: true},
  eventTopic: {type: String, required: true},
  ticketType: {type: String, required: true},
  ticketPrice: {type: Number, required: true}
},{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}  
})

schema.plugin(mongoosePaginate);

module.exports = mongoose.model('Event', schema);
