
function SiteSettingsViewModel() {
    var self = this;
    self.Pref = ko.observable('');
    self.q2 = ko.observable('');
    self.q3 = ko.observable('');
    self.Pref1 = ko.computed(
       {
           read: function () {
               if (ko.utils.unwrapObservable(self.Pref) == "true")
                   return "Correct!!";
               else if (ko.utils.unwrapObservable(self.Pref) == "false")
                   return "Incorrect!!";
               else
                   return "Not yet attempted";
           }

       }, this);

       self.answer2 = ko.computed(
       {
           read: function () {
               if (ko.utils.unwrapObservable(self.q2) == "false")
                   return "Correct!!";
               else if (ko.utils.unwrapObservable(self.q2) == "true")
                   return "Incorrect!!";
               else
                   return " Not yet attempted";
           }

       }, this);

       self.answer3 = ko.computed(
          {
              read: function () {
                  if (ko.utils.unwrapObservable(self.q3) == "true")
                      return "Correct!!";
                  else if (ko.utils.unwrapObservable(self.q3) == "false")
                      return "Incorrect!!";
                  else
                      return " Not yet attempted";
              }

          }, this);
}

ko.applyBindings(new SiteSettingsViewModel())

