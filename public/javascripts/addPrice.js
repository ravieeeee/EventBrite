$(function() {
	$('#ticketPrice').hide();
	$('#maxParticipants').hide();
	$("input[name='ticketType']:radio").change(function() {
		var serviceType = this.value;

		if (serviceType == "free") {
			$('#ticketPrice').hide();
		}

		if (serviceType == "paid") {
			$('#ticketPrice').show();
		}
	});
	$("input[name='maxParticipantsType']:radio").change(function() {
		var serviceType = this.value;

		if (serviceType == "no consideration") {
			$('#maxParticipants').hide();
		}

		if (serviceType == "set the value") {
			$('#maxParticipants').show();
		}
	});
});