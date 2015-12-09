jQuery.sap.declare("catalog.util.Utilities");

catalog.util.Utilities = {

	calculateValue: function(amt, val, cos) {
		// 1.Valorization amt*val/100 + amt;
		// 2.Cost amt*cos/100 ceiling 10
		// 3.Value valorization - cost rounding -> to integer
		var rValue = (parseInt(amt) * parseInt(val) / 100 + parseInt(amt)) - (parseInt(amt) * parseInt(cos) / 100);
		rValue = Math.round(rValue);
		return rValue;
	},

	calculateOptions: function(val) {
		// Valorization divided by 10
		var rValue = parseInt(val) / 10;
		rValue = Math.round(rValue);
		return rValue;
	}
};