/****************************************************************************************************************************************
 * functions.js
 * Anupama Bhatta
 * This file contains functions to support Mortgage Schedule Calculator page Ch10_Project_Base.html
 *****************************************************************************************************************************************/

//Define global variables
var dropSize = document.getElementById("dropSize");
var dropSquareFeet = document.getElementById("dropSquareFeet");
var dropBedroomCount = document.getElementById("dropBedroomCount");
var chkPropertyOptions = document.getElementsByName("propertyOptions");

var dropCreditRating = document.getElementById("dropCreditRating");
var dropLoanLength = document.getElementById("dropLoanLength");


function formatCurrency(number) {
    return "$" + number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDecimal(number) {
    return number.toFixed(2);
}

function populateSquareFeet(form, dropSize) {
    var dropDownBox = form.elements["dropSquareFeet"];
    dropDownBox.innerHTML = ""; // clear previous options

    var optBase = dropSize * 1000;
    var optValue = "";

    addOption("", "Select square feet", dropDownBox);

    for (let index = 0; index < 5; index++) {
        optValue = optBase + 200 * index;
        addOption(optValue, optValue, dropDownBox);
    }

    dropDownBox.removeAttribute("disabled");
}

function populateBedrooms(form, iSquareFeet) {
    var bedroomRatio = 600;
    var dropBedroomCount = form.elements["dropBedroomCount"];
    dropBedroomCount.innerHTML = ""; // clear previous options

    var bedroomCount = Math.floor(iSquareFeet / bedroomRatio);

    addOption("", "Select number of bedroom", dropBedroomCount)

    for (let index = 1; index <= bedroomCount; index++) {
        addOption(index, index, dropBedroomCount)
    }
    dropBedroomCount.removeAttribute("disabled");
}

function addOption(value, text, dropDownBox) {
    // build option element dynamically
    var optElement = document.createElement("option");
    optElement.text = text;
    optElement.value = value;

    //append option to dropdown
    dropDownBox.appendChild(optElement);
}

function getPrice(form) {
    var iSquareFeet = form["dropSquareFeet"].value;

    var iBedrooms = form["dropBedroomCount"].value;

    var price = iSquareFeet * 130 + iBedrooms * 3500;

    var propertyOpts = document.getElementsByName("propertyOptions") //all of check box

    for (let index = 0; index < propertyOpts.length; index++) {
        propertyOpts[index].removeAttribute("disabled");

        if (propertyOpts[index].checked)
            price += parseFloat(propertyOpts[index].value);
        else {
            if (propertyOpts[index].disabled)
                propertyOpts[index].removeAttribute("disabled")
        }
    }

    document.getElementById("price").innerHTML = formatCurrency(price);
    return price;
}

function getInterest(form) {
    if (!dropCreditRating.checkValidity() || !validateRadioButtons() || !dropLoanLength.checkValidity())
        return 0;

    var radUse = form["radUse"];

    if (!validateLoanOptions()) {
        return 0;
    } else {
        // calculate interest
        var creditRating = parseInt(dropCreditRating.value);
        var loanLength = parseInt(dropLoanLength.value);
        var businessSurcharge = parseFloat(radUse.value);

        var interest = 3.0 + ((creditRating / 8) + (loanLength / 30)) * businessSurcharge;

        document.getElementById("interestRate").innerHTML = interest.toFixed(2) + "%";
        return interest;
    }
}

function validateRadioButtons() {
    var fldRadUse = document.getElementById("fldRadUse");
    var radUse = document.getElementsByName("radUse");

    var val = "";
    for (let index = 0; index < radUse.length; index++) {
        if (radUse[index].checked)
            val = radUse[index].value;
    }

    if (isNaN(val) || val == "") {
        fldRadUse.classList.add("validation-error");
        return false;
    } else {
        fldRadUse.classList.remove("validation-error");
        return true;
    }
}

function validateDropDown(control) {
    if (control.checkValidity()) {
        control.classList.remove("validation-error");
        return true;
    } else {
        control.classList.add("validation-error");
        return false;
    }
}

function validatePropertyOptions() {
    var msg = "";
    var message = document.getElementById("PropertyValidationErrors");

    if (!validateDropDown(dropSize))
        msg += "Please select property size.</br>";

    if (!validateDropDown(dropSquareFeet))
        msg += "Please select property square footage.</br>";

    if (!validateDropDown(dropBedroomCount))
        msg += "Please select number of bedrooms.</br>";

    if (msg != "") {
        message.innerHTML = msg;
        message.classList.remove("hidden");
        return false;
    }
    else {
        message.classList.add("hidden");
        return true;
    }
}

function validateLoanOptions() {
    var msg = "";
    var message = document.getElementById("LoanValidationErrors");

    if (!validateRadioButtons())
        msg += "Please select loan use.</br>";

    if (!validateDropDown(dropCreditRating))
        msg += "Please select your credit rating.</br>";

    if (!validateDropDown(dropLoanLength))
        msg += "Please select the loan length in years.</br>";

    if (msg != "") {
        message.innerHTML = msg;
        message.classList.remove("hidden");
        return false;
    }
    else {
        message.classList.add("hidden");
        return true;
    }
}

function generateSchedule(form) {

    var propertyOK = validatePropertyOptions();
    var loanOK = validateLoanOptions();

    if (!propertyOK | !loanOK) {
        return;
    }

    var annualInterest = getInterest(form);
    var interest = annualInterest / 12 / 100; //monthly interest ratio
    var price = getPrice(form);

    if (interest == 0 || price == 0) {
        //display summary error message at the top of each section
    }
    else {
        var paymentCount = parseInt(form["dropLoanLength"].value) * 12; //number of monthly payments
        var numerator = interest * (1 + interest) ** paymentCount;
        var denom = (1 + interest) ** paymentCount - 1;
        var monthlyPay = price * (numerator / denom);
    }

    var output = "                      \
                <table>      <thead>    \
                <th>#</th>              \
                <th>Payment</th>        \
                <th>Principal</th>      \
                <th>Interest</th>       \
                <th>Balance</th>        \
                </thead> ";


    var interestAmt = 0;
    var balance = price;
    var monthlyPrincipal = 0;

    for (let i = 1; i <= paymentCount; i++) {
        interestAmt = balance * interest;
        monthlyPrincipal = monthlyPay - interestAmt;
        balance = balance - monthlyPay + interestAmt;

        output += "<tr> \ "
            + "<td>" + i + "</td>"
            + "<td>" + formatCurrency(monthlyPay) + "</td>"
            + "<td>" + formatCurrency(monthlyPrincipal) + "</td>"
            + "<td>" + formatCurrency(interestAmt) + "</td>"
            + "<td>" + formatCurrency(balance) + "</td>"
            + "</tr>";
    }

    output += "</tbody></table>"

    document.getElementById("schedule").innerHTML = output;

    displaySummary(paymentCount, price, form["dropLoanLength"].value, annualInterest);

}

function displaySummary(paymentCount, price, loanLength, interest) {

    document.getElementById("summaryPrice").innerHTML = formatCurrency(price);
    document.getElementById("summaryLength").innerHTML = loanLength;
    document.getElementById("summaryInterest").innerHTML = formatDecimal(interest) + "%";
    document.getElementById("summaryPaymentCount").innerHTML = paymentCount;

    document.getElementById("loan-summary").classList.remove("hidden");
}

function clearForm(form) {
    form.reset();
    document.getElementById("fldRadUse").classList.remove("validation-error");

    // removing errors
    removeError(form, "dropCreditRating");
    removeError(form, "dropLoanLength");
    removeError(form, "dropSize");
    removeError(form, "dropSquareFeet");
    removeError(form, "dropBedroomCount");

    document.getElementById("PropertyValidationErrors").classList.add("hidden");
    document.getElementById("LoanValidationErrors").classList.add("hidden");
    document.getElementById("loan-summary").classList.add("hidden");

    document.getElementById("price").innerHTML = "";
    document.getElementById("interestRate").innerHTML = "";
    document.getElementById("schedule").innerHTML = "";
}

function removeError(form, controlId) {
    var control = form[controlId]
    control.classList.remove("validation-error");
}