$(document).ready(function() {

	let loading = false;

	let timer = 0;

	const $crypto = $('.crypto');

	const $timer = $('#timer');

	const formatter = new Intl.NumberFormat('en-US', {
	  style: 'currency',
	  currency: 'USD',
	  minimumFractionDigits: 4,
	});

	function updateCurrencies(res) {

		const currencies = res.data;

		$crypto.slideUp('normal', () => {

			$crypto.empty();

			currencies.forEach((v, i) => {
			
				const pair = v.pair.split(':')[0];
				const last = formatter.format(v.last);

				$crypto.append(
					`<li> 
						<div class="pair">${pair}</div> 
						<div class="last">${last}</div> 
					</li>`
				);

			});

		}).slideDown(() => {

			loading = false;
		});

	}

	function getCryptoPrice() {

		if(loading) {
			return;
		}

		loading = true;

		$.ajax({
			method: 'GET',
			url: 'https://cex.io/api/tickers/USD',
			success: updateCurrencies,
		});

	}

	function init() {

		getCryptoPrice();

		setInterval(() => {

			const shouldUpdate = timer >= 5;

			if(shouldUpdate) {
				getCryptoPrice();
				timer = 0;
			} else {
				timer++;
			}

			$timer.text(shouldUpdate ? timer : 6 - timer);

		}, 1000);

	}

	init();

});