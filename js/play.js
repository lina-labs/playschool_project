//for template/play.html
function detectLandscape() {
    let orientationType = screen.orientation.type;
	if (orientationType == 'landscape-primary'){
		document.body.classList.add('leftRotate');
	}
	else if (orientationType == 'landscape-secondary'){
		document.body.classList.add('rightRotate');
	}
	else{
		document.body.classList.remove('leftRotate');
		document.body.classList.remove('rightRotate');
	
	}
}
window.addEventListener('load', detectLandscape);
window.addEventListener('resize', detectLandscape);
