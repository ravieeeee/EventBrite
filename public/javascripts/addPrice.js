$(function() {
	$('#ticketPrice').hide();
	$("input[name='ticketType']:radio").change(function() {
		var serviceType = this.value;

		if (serviceType == "free") {
			$('#ticketPrice').hide();
		}

		if (serviceType == "paid") {
			$('#ticketPrice').show();
		}
	});
});