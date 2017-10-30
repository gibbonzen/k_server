$(function($){


	(function() {
		var panels = 'sidepanel';
		$('#menuParameters').click(function(){
			var pan = 'parameters';
			togglePanel(pan, panels);
	 	});

		$('#menuRoyaume').click(function(){
			var pan = 'royaume';
			togglePanel(pan, panels);
	 	});

		$('#menuProfil').click(function(){
			var pan = 'profil';
			togglePanel(pan, panels);
	 	});
	})();

	/////

	function togglePanel(panel, classToClose) {
		$('.' + panel).toggleClass('visible');
		fermerPanels(panel, classToClose);
	}

	function fermerPanels(src, classToClose) {
		var divs = $('.' + classToClose);

		for(var i = 0; i < divs.length; i++) {
			var div = divs[i];

			if(!($(div).hasClass(src))) {
				fermerPanel(div);
			}

		}
	}
	
	function fermerPanel(panel) {
		if($(panel).hasClass('visible')) {
			$(panel).removeClass('visible');
		}
	}

});