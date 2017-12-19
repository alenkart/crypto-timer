'use strict';

function getCurrency(pair) {
	return pair.split(':')[0];
}

function Graph({ canvasId, rectSize }) {

	const data = {};
	const canvas = document.getElementById(canvasId);
	const ctx = canvas.getContext("2d");

	const yMiddle = canvas.height/2;
	const rectMiddle = rectSize/2;

	let x = 0;
	let y = yMiddle-rectMiddle;
	let lastX = 0;
	let lastY = yMiddle-rectMiddle;
	let initialised = false;

	let counter = 0;

	rectSize = typeof rectSize === 'number' && rectSize > 0 
		? rectSize 
		: 4; 

	this.key = "";

	this.switchKey = (key) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.key = key;
		this.drawBackground();
		x = 0;
	} 

	this.drawBackground = () => {

		ctx.beginPath();
		ctx.moveTo(0, yMiddle);
		ctx.lineTo(canvas.width, yMiddle);
		ctx.stroke();
	}

	this.draw = () => {

		counter++;

		if(!initialised) {
			this.drawBackground();
			initialised = true;
		} 

		const history = data[this.key];

		if(!this.key || !history || history.length % 2 !== 0) {
			return;
		}

		lastX = x;
		lastY = y;

		const reduce = history.reduce((p, c) => c - p);
		y = yMiddle-reduce-rectMiddle;
		x += rectSize*2;	

		ctx.beginPath();
		ctx.moveTo(lastX + rectMiddle, lastY + rectMiddle);
		ctx.lineTo(x + rectMiddle, y + rectMiddle);
		ctx.stroke();

		if(reduce == 0) {
			ctx.fillStyle =  "#3498db";
		} else {
			ctx.fillStyle = (reduce < 0) ? "#e74c3c" : "#2ecc71";;
		} 

		ctx.fillRect(x, y, rectSize, rectSize);

	}

	this.addData = (rowData) => {
		
		rowData.forEach((v, i) => {

			const key = getCurrency(v.pair);

			if(!Array.isArray(data[key])) {

				data[key] = [];
			} 

			if(data[key].length > 1) {

				data[key].shift();
			} 

			data[key].push( Number(v.last) );
		});
	}
}

$(document).ready(function() {

	let timer = 0;
	let loading = false;

	const $graphTitle = $('#graph-title');
	const $crypto = $('.crypto');
	const $timer = $('#timer');

	const graph = new Graph({
		canvasId: 'graph',
		rectSize: 6
	});

	const formatter = new Intl.NumberFormat('en-US', {
	  style: 'currency',
	  currency: 'USD',
	  minimumFractionDigits: 4,
	});

	function updateCurrencies(currencies) {

		$crypto.slideUp('normal', () => {

			$crypto.empty();

			currencies.forEach((v, i) => {

				const currency = getCurrency(v.pair);
				const last = formatter.format(v.last);

				$crypto.append(
					`<li class="currency" data-currency="${currency}"> 
						<div class="pair">${currency}</div> 
						<div class="last">${last}</div> 
					</li>`
				);

			});

		}).slideDown(() => {

			loading = false;
		});

	}

	function getCryptoPrice(cb) {

		const api = 'https://cex.io/api/tickers/USD';

		if(loading) {
			return;
		}

		loading = true;

		$.ajax({
			method: 'GET',
			url: api,
			success: cb,
		});

	}

	function updateUi() {

		getCryptoPrice((res) => {

			const currencies = res.data;

			graph.addData(currencies);
			graph.draw();

			updateCurrencies(currencies);
			
		});
	}

	function interval() {

		const shouldUpdate = timer >= 5;

		if(!shouldUpdate) {

			timer++;
		
		} else {

			updateUi();
			timer = 0;
		}

		$timer.text(shouldUpdate ? timer : 6 - timer);
	}

	function init() {

		graph.key = "BTC";

		graph.draw();

		$crypto.on('click', '.currency', function() {
			graph.switchKey( $( this ).data('currency') );
			$graphTitle.text(graph.key);
		});

		updateUi();

		setInterval(interval, 1000);
	}

	init();

});