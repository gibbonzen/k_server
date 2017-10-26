$(function($){
	$('#menuParameters').click(function(){
		$('.sidepanel').toggleClass('visible');
 	});

	$('.menuPanelHide').click(function() {
		if($('.sidepanel').hasClass('visible')) {
			$('.sidepanel').removeClass('visible');
		}
	})

});