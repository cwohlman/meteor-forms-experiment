Template.Home.helpers({
	item: function () {
		return {
			name: 'Joe'
		};
	}
	, nameField: function () {
		return {
			name: 'name'
			, type: 'text'
		};
	}
});

Template.Home.events({

});

Template.input.helpers({
	val: function (name) {
		return this.item[name];
	}
});

Template.input.events({
	'keyup input': function (e, tmpl) {
		var name = e.currentTarget.name;
		var value = e.currentTarget.value;
		this.set(name, value);
	}
});
