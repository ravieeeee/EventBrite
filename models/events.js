var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  title: {type: String, required: true},
  location: {type: String, required: true},
  startsDate: {type: Date, required: true},
  endsDate: {type: Date, required: true},
  eventDescription: {type: String, required: true},
  organizerName: {type: String, required: true},
  organizerDescription: {type: String, required: true},
  eventType: {type: String, required: true},
  eventTopic: {type: String, required: true},
  ticketPrice: {type: Number, required: true}
},{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}  
})

schema.plugin(mongoosePaginate);

module.exports = mongoose.model('Event', schema);
