(function() {
	var stepSocket = new Rete.Socket('Step');

	const VueNumControl = {
	  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
	  template: '<input type="number" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop=""/>',
	  data() {
	    return {
	      value: 0,
	    }
	  },
	  methods: {
	    change(e){
	      this.value = +e.target.value;
	      this.update();
	    },
	    update() {
	      if (this.ikey)
	        this.putData(this.ikey, this.value)
	      this.emitter.trigger('process');
	    }
	  },
	  mounted() {
	    this.value = this.getData(this.ikey);
	  }
	}

	class DelayControl extends Rete.Control {
	  constructor(emitter, key, readonly) {
	    super(key);
	    this.component = VueNumControl;
	    this.props = { emitter, ikey: key, readonly };
	  }

	  setValue(val) {
	    this.vueContext.value = val;
	  }
	}

	class MessageControl extends Rete.Control {
		constructor(emitter, key, message) {
			super(key);
			this.emitter = emitter;
			this.data.render = 'vue';
			this.template = '<input :value="message" @input="change($event)" />';
			this.component = {
				props: ['message', 'emitter', 'ikey', 'getData', 'putData'],
				data() {
					return {
						message: ''
					};
				},
				methods: {
					change(e) {
						this.value = e.target.value;
						this.update;
					},
					update() {
						if (this.ikey) {
							this.putData(this.ikey, this.value);
						}

						this.emitter.trigger('process');
					}
				}
			}

			this.props = { emitter, ikey: key, message };
		}
	}

	class DelayComponent extends Rete.Component {
		constructor() {
			super('Delay');
		}

		builder(node) {
			node.addControl(new DelayControl(this.editor, 'delay', node.data.days));
			node.addOutput(new Rete.Output('next', '', stepSocket));
			node.addInput(new Rete.Input('previous', '', stepSocket));
		}
	}

	class EntryComponent extends Rete.Component {
		constructor() {
			super('Keyword');
		}

		builder(node) {
			node.addOutput(new Rete.Output('next', '', stepSocket));
		}
	}

	class MessageComponent extends Rete.Component {
		constructor() {
			super('Send Message');
		}

		builder(node) {
			node.addControl(new MessageControl(this.editor, 'message', node.data.message));
			node.addInput(new Rete.Input('previous', '', stepSocket));
			node.addOutput(new Rete.Output('next', '', stepSocket));
		}
	}

	const container = document.querySelector('#rete');
	const editor = new Rete.NodeEditor('demo@0.1.0', container);

	editor.use(ConnectionPlugin.default);
	editor.use(VueRenderPlugin.default);
	editor.use(ContextMenuPlugin.default, {
		searchBar: false,
		delay: 100,
		allocate(component) {
			return [];
		},
		rename(component) {
			return component.name;
		}
	});

	var components = [new DelayComponent, new EntryComponent, new MessageComponent];
	const engine = new Rete.Engine('demo@0.1.0');

	components.map(c => {
		editor.register(c);
		engine.register(c);
	});

	editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
		await engine.abort();
		await engine.process(editor.toJSON());
	});
})();