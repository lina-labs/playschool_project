export default function(name) {
	let speakerArea = document.getElementsByClassName("name")[0];
	let personDiv = document.getElementsByClassName('person')[0];
	let allow_eff = sessionStorage.getItem('eff_confirmed');
	speakerArea.innerHTML = name;
	speakerArea.classList.add("fade-out");

	setTimeout(function() {
    speakerArea.classList.remove("fade-out");
  }, 500);

  if( photo == "pig.png" && speakerArea.textContent.includes("【豬公】")){
  	personDiv.classList.add("pig");
  	var pigEffect = new Audio("/audio/pig_sound.mp3");
	pigEffect.load();
	pigEffect.currentTime = 0;
    	if(allow_eff == 1)
		pigEffect.volume = 0.6;
	else
		pigEffect.volume = 0;
    	pigEffect.play();	}
	else if(photo == "pig.png"){
		setTimeout(function() {
		    personDiv.classList.remove("pig");
  		}, 500);

	}

}
