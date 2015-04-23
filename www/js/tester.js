// var vm;
// function initTest() {
    
//     var vm = new SiteSettingsViewModel();
// }

// $(function () {

//     QUnit.module("ViewModels/SiteSettingsViewModel", {
//         setup: initTest
//     });

//     QUnit.test("check each option", function () {
//         var data = {
//             Pref: "true",
//            // q2:"false"
//            // q3: "true"
//         };
//         vm.Pref1(data);
//         equal(ko.utils.unwrapObservable(), "true");
//     });
// }

// test("create user do create", function() {
//     stop(2);        
        
//     $.mockjax({
//         url: "/x",
//         contentType: "application/json",
//         responseTime: 0,
//         response: function (settings) {
//             this.responseText = {"username": "bar", "state": "DONE"};     
//             start(); 
//         }            
//     });

//     viewModel.username("user0");
//     viewModel.createUser();
        
//     setTimeout(function() {
//         equal(viewModel.state(), "DONE");        
//         start();
//     }, 150);
// });


test('outputs correctly',function()
{
    var element = $('<input type="radio" />')[0],
    observable = ko.observable(),
    SiteSettingsViewModel = function() {return observable},
    moneyBinding = ko.applyBindings();

    //bind element to moneyBinding
    moneyBinding.init(element, SiteSettingsViewModel);

    //update observable
    observable("true");

    //trigger binding update
    moneyBinding.update(element,SiteSettingsViewModel);

    //get value bound to input, post-binding update
    var result = $(element).val();

    //assert results
    equal(result, "true", "Expected output to match");
});
