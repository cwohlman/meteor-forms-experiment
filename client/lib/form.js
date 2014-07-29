Template.form.helpers({
	context: function () {
		this.dict = this.dict || new ReactiveDict();
		this.item = this.item || {};
		x = this.dict;
		return {
			dict: this.dict
			, item: _({})
				.chain()
				.extend(this.item)
				.extend(this.dict.get('item') || {})
				.value()
			, source: this.item
		};
	}
});