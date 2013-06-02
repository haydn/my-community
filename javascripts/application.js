$(function() {

	$.getJSON("data/processed/abs.json")
	.done(function( json ) {
	  console.log( "JSON Data: " + json );
	  var data = json["5000"]["people"];
	  $("#resident-total").text(data.total);
	  $("#resident-australian-residents").text(data.australian_residents);
	  $("#resident-de-facto").text(data.defacto);
	  $("#resident-married").text(data.married);
	  $("#resident-not-married").text(data.not_married);
	  $("#resident-median-age").text(data.media_age);
	  $("#resident-men").text(data.men);
	  $("#resident-women").text(data.women);
	  $("#resident-weekly-income").text(data.weekly_income);
	})
	.fail(function( jqxhr, textStatus, error ) {
	  var err = textStatus + ', ' + error;
	  console.log( "Request Failed: " + err);
	});

});
