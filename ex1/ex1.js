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
		var code = $("#code").val();
		if (checkCode(code)){
			getCode(code);
		} else {
			$("#iban").text("Payee's IBAN: ");
			$("#amount").text("Amount to be paid: ");
			$("#ref").text("Payment reference: ");
			$("#date").text("Due date: ");	

			$("#barcode").hide();		
		}
	});

	$("#code").keydown(function(){
		$(this).css("background-color", "#DDD9D9");
	});

	$("#code").keyup(function(){
		$(this).css("background-color", "white");
	});

	function getCode(c) {
		c = c.replace(/\s+/g, '');
		var version = c.charAt(0);
		var iban = c.substring(1,17);
		var amount = c.substring(17,25);

		if (version == 4){			
			var ref = c.substring(28,48);
		} else if (version == 5){
			var ref = c.substring(25,48);
		}

		var date = c.substring(48,54);
		var day = date.substring(4,7);
		var month = date.substring(2,4);
		var year = date.substring(0,2);



		var cents = amount.substring(6,8);
		var euros = amount.substring(0,6);
		euros = euros.replace(/^0+/, '');
		var finalAmount = euros + "." + cents;

		$("#iban").text("Payee's IBAN: " + iban);
		$("#amount").text("Amount to be paid: " + finalAmount);
		$("#ref").text("Payment reference: " + ref);
		$("#date").text("Due date: " + day + "." + month + "." + year);

		JsBarcode("#barcode", c, {displayValue: false});
		$("#barcode").show();
	}

	function checkCode(c) {
		c = c.replace(/\s+/g, '');
		var isnum = /^\d+$/.test(c);
		return c.length == 54 && isnum;
	}
});