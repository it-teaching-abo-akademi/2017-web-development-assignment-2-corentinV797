$(document).ready(function(){

	//Hide and Show function for informations panel
	$("#hideAndShow").click(function(){
		$("#informations").slideToggle("fast"); //speed of the animation
		if($(this).text() == "Hide"){
			$(this).text("Show"); //change text of the button	
		}else{
			$(this).text("Hide");
		}
		
	});

	//function that decodes the finnish code when clicking on the decode button
	$("#decode").click(function(){
		var code = $("#code").val(); //code value from the input text
		if (checkCode(code)){ //check if code is valid 
			getCode(code); //get informations from the code
		} else { //otherwise display empty informations
			$("#iban").text("Payee's IBAN: ");
			$("#amount").text("Amount to be paid: ");
			$("#ref").text("Payment reference: ");
			$("#date").text("Due date: ");	

			$("#barcode").hide();		
		}
	});

	//change color of the input text while typing
	$("#code").keydown(function(){
		$(this).css("background-color", "#DDD9D9");
	});

	//restore input text color while not typing
	$("#code").keyup(function(){
		$(this).css("background-color", "white");
	});

	//get informations from the code
	function getCode(c) {
		c = c.replace(/\s+/g, ''); //remove spaces from the code
		var version = c.charAt(0); //get version of the code (first digit)
		var iban = c.substring(1,17); //get iban
		var amount = c.substring(17,25); //get amount

		if (version == 4){ //check for the version of the code 			
			var ref = c.substring(28,48); //get reference (version 4)
		} else if (version == 5){
			var ref = c.substring(25,48); //get reference (version 5)
		}

		var date = c.substring(48,54); //get date
		var day = date.substring(4,7); //get day from date substring
		var month = date.substring(2,4); //get month from date substring
		var year = date.substring(0,2); //get year from date substring



		var cents = amount.substring(6,8); //get cents from amount substring
		var euros = amount.substring(0,6); //get euros from amount substring
		euros = euros.replace(/^0+/, ''); //remove useless first zeros before the euro amount
		var finalAmount = euros + "." + cents; //concatenate euros and cents 

		//display informations
		$("#iban").text("Payee's IBAN: " + iban); 
		$("#amount").text("Amount to be paid: " + finalAmount);
		$("#ref").text("Payment reference: " + ref);
		$("#date").text("Due date: " + day + "." + month + "." + year);

		//create barcode with JsBar library and show it
		JsBarcode("#barcode", c, {displayValue: false});
		$("#barcode").show();
	}

	//check if code is valid
	function checkCode(c) {
		c = c.replace(/\s+/g, ''); //remove spaces from the input text
		var isnum = /^\d+$/.test(c); //test if the input text is a number
		return c.length == 54 && isnum; //test if the input text is 54 digit long
	}
});