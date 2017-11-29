$(document).ready(function(){
	$("#hideAndShow").click(function(){
		$("#informations").slideToggle("fast");
		if($(this).text() == "Hide"){
			$(this).text("Show")	
		}else{
			$(this).text("Hide")
		}
		
	});

	$("#decode").click(function(){
		$("#textcode").text($("#code").val());
	});
});