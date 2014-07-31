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
	'click .btn-iamjoe': function (e, tmpl) {
		this.set('name', 'Joe Bloh');
	}
	, 'submit .form-simple': function (e, tmpl) {
		e.preventDefault();
		alert("I am: " + this.item.name + "\n" + JSON.stringify(this.item));
	}
	, 'change .form-simple input': function (e, tmpl) {
		this.set("name", e.currentTarget.value);
	}
});

Forms.handleSubmit(
	Template.Home
	, '.form-basic'
	, {
		name: {
			required: true
		}
	}
	, function (values) {
		alert(JSON.stringify(values));
	}
	);

