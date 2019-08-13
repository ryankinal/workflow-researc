jsPlumb.bind('ready', function() {
	var dragging = false,
		data = {},
		connectionMenu = document.getElementById('connectionMenu'),
		hasConnectionMenu = false,
		overlayText = false;

	connectionMenu.id = '';

	var chart = jsPlumb.getInstance({
		Connector: ["Bezier", { curviness: 60 }],
		Endpoint: ['Dot', { radius: 7 }],
		EndpointStyle: { fill: '#F00' },
		Anchor: [ 0.5, 0.5, 1, 1]
	});

	chart.setContainer('flow');
	/*chart.draggable('first');
	chart.draggable('second');

	chart.addEndpoint('first', { anchor: 'Right', isSource: true, maxConnections: 16 });
	chart.makeTarget('second', { anchor: 'Continuous' });*/

	var items = document.querySelectorAll('.item');

	_.each(items, function(i) {
		i.addEventListener('mousedown', function(e) {
			var width = i.offsetWidth,
				height = i.offsetHeight,
				clone = i.cloneNode(true);
			
			document.body.appendChild(clone);

			clone.className = 'item item-clone';
			clone.style.width = width + 'px';
			clone.style.height = height + 'px';
			dragging = clone;
		});
	});

	window.addEventListener('mousemove', function(e) {
		var elements;

		if (dragging) {
			dragging.style.left = e.clientX + 3 + 'px';
			dragging.style.top = e.clientY + 3 + 'px';
			return false;
		}

		if (hasConnectionMenu) {
			elements = document.elementsFromPoint(e.clientX, e.clientY);

			_.each(elements, function(i) {
				if (i.parentNode && i.parentNode.className === 'connection-menu') {
					_.each(i.parentNode.children, function(c) {
						c.className = i.className.replace(/\s+selected/, '');
					});
					i.className += ' selected';
					overlayText = i.innerText;
				}
			});
		}
	});

	window.addEventListener('mouseup', function(e) {
		var endpoint,
			type;

		if (dragging) {
			dragging.parentNode.removeChild(dragging);
			type = dragging.id.toLowerCase().replace(/add/, '');

			if (e.target.id === 'flow') {
				element = dragging;
				element.id = 's' + Math.floor((Math.random() * 10000));
				element.className = 'node';
				element.style.height = 'auto';
				e.target.appendChild(element);
				chart.draggable(element);

				if (type !== 'joined') {
					chart.makeTarget(element, { anchor: 'Continuous' });
				}

				if (type === 'receive') {
					element.appendChild(connectionMenu.cloneNode(true));
				}

				endpoint = chart.addEndpoint(element, { anchor: 'Bottom', isSource: true, maxConnections: 16 })
			}

			dragging = false;
		}
	});

	var connectionStart = function(connection) {
			var source = document.getElementById(connection.sourceId),
				target = connection.target,
				menu = source.querySelector('.connection-menu');

			if (menu) {
				menu.style.display = 'block';	
				menu.style.left = '100%';
				menu.style.top = '0';
				hasConnectionMenu = true;

				_.each(menu.children, function(c) {
					c.className = c.className.replace(/\s+selected/, '');
				});
			}
		},
		connectionEnd = function(info) {
			var source = document.getElementById(info.sourceId),
				menu = source.querySelector('.connection-menu');

			if (menu) {
				menu.style.display = 'none';	
				menu.style.left = '100%';
				menu.style.top = '0';
				hasConnectionMenu = false;

				console.log(overlayText);

				if (overlayText && info.connection) {
					info.connection.addOverlay(["Label", { label: overlayText, location: 0.75 }]);
				}
			}

			overlayText = false;
		};

	chart.bind('connectionDrag', connectionStart);
	chart.bind('connectionAborted', connectionEnd);
	chart.bind('connection', connectionEnd);
	chart.bind('connectionDragStop', connectionEnd);
});