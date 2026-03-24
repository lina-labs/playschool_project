import addFadeOut from './fade.js';
let startIndex = 0; //the msgInCol'index for the first message to be output
let endIndex =0; //the msgInCol'index for the last message to be output
let text_area = document.getElementsByClassName("forText")[0];
let text_area_bg = document.getElementsByClassName("text_area_bg")[0];
let icontainer = document.getElementsByClassName("iconContainer")[0];
let iTag = document.getElementById("tri-icon");
let soundIcon = null;
let bgIcon = null;
let effectIcon = null;
let mask_bg = document.getElementsByClassName("mask_bg")[0];
let effect = document.getElementById("effect");
let parent = window.parent;
let audio = parent.document.getElementById("bgm");
let allow_bg = sessionStorage.getItem('bg_confirmed');
let allow_eff = sessionStorage.getItem('eff_confirmed');
let clickOverview = false;
let clickAchievement = false;
let img_mask = document.getElementsByClassName('img_mask')[0];
let ori_img_mask_height = null;
let imgMaskflag = 0;
let fontStyle = document.getElementById('fontStyle');
let role = sessionStorage.getItem('role');
let speaker_area = document.getElementsByClassName("name")[0];


// Calculate the maximum number of characters in a line
let maxLen;
function getMaxLen() {
    let column = text_area.getBoundingClientRect();
    const style = window.getComputedStyle(text_area);
    const fontSize = parseInt(style.fontSize);
    const result = Math.floor(column.width / fontSize);
    return result;
}

function init() {
	if (img_mask != null){
		ori_img_mask_height = img_mask.offsetHeight;
	}
	//menuClick();
	maxLen = getMaxLen();
	soundIcon = soundControl.querySelector("i");
	bgIcon = bgControl.querySelector("i");
	effectIcon = effectControl.querySelector("i");
	if (allow_bg == 1) {
		playmusic();
	}
	else if (allow_bg == 0){
		if(audio != null)
			audio.volume = 0;
	}

	if (allow_eff == 1) {
		if(effect != null){
        	effect.volume = 0.6;
		}
    }
    else if (allow_eff == 0){
        if(effect != null){
            effect.volume = 0;
        }
    }
	menuClick();
}

let msgIndex = 0; //目前的訊息index
let textArrIndex = 0;
let has_nextMessage = 1;
let char_color = { '團長': 'Pink', '子柔': '#ffc422', '阿高': '#edff22', '阿哲': '#22ffd3', '小辛': '#22c0ff' };

function showText() {
	text_area.innerHTML = '';
	if (has_nextMessage == 0 || (textArrIndex == textArr.length && textArr.length != 0)) {
			let url = "/scenes/" + next;
			if (next == 'end'){
				url = '/end';
			}
			window.location.href = url+role;
	}
	else {
		let text = "";
		let name = '';
		if (textArr == '') {
			has_nextMessage = 0;
		}
		else { //如果對話有文字的話
			has_nextMessage = 1;
			//get speaker name and show it in the dialog box
			name = textArr[textArrIndex]['speaker'];
			if (fontStyle){
				fontStyle.href = '/css/'+textArr[textArrIndex]['css'];
			}

			if (name != '') {
				if (name in char_color) {
					speaker_area.style.color = char_color[name];
				}
				else {
					speaker_area.style.color = 'Snow';
				}
				name = '【' + name + '】';
			}
			name += '<br>';
			let sentences = textArr[textArrIndex]['text'];//get the text of this scene

			if (sentences.length > 0) { //如果有文字
				for (let i = startIndex; i < endIndex; i++, startIndex++) {
					text += sentences[msgIndex][i];
					//show M=maxLen
					//if the length of the next sentence is one, then put in the same line
					if (i < sentences[msgIndex].length - 1) {
						if (sentences[msgIndex][i + 1].length == 1) {
							text += sentences[msgIndex][++i];
							startIndex++;
						}
					}
					text += '<br>';

					if (i == sentences[msgIndex].length - 1) {
						if (msgIndex + 1 < sentences.length) { //to next sentence
							msgIndex++;
						}
						else { //to next message
							textArrIndex++;
							msgIndex = 0;
						}
						startIndex = 0;
						endIndex = LINE;
						break;
					}
				}
				endIndex = startIndex + LINE;
			}
        }
		//show text
		let typed = new Typed(".forText", {
			strings: [text],
			bindInputFocusEvents: true,
			typeSpeed: 5,
			smartBackspace: false,
			fadeOut: true,
			showCursor: false
		})
		//show name
		addFadeOut(name); //speaker_area.innerHTML = name;
		if (hasbtn) {
			showButtons();
		}
		//    text_area.innerHTML = text;
	}
}

//show options
function showButtons() {
    if (hasbtn) {
        mask_bg.removeEventListener('mousedown', showText);
        text_area_bg.removeEventListener('mousedown', showText);
        document.removeEventListener('keydown',KeyShowText);
		let btnContainer = document.getElementsByClassName("buttonShow")[0];
        for (let x = 0; x < options.length; x++) {
            let button = options[x];
            let btn = document.createElement("button");
            btn.innerText = button.text;
            btn.setAttribute("class", "button");
            btn.id = x;
            if (button.flag == 1) {
                btn.style.backgroundColor = 'gray';
				btn.style.color = 'black';
            }
            if (reachSelLimit == 'false' || button.flag == 1) {
                btn.addEventListener('mousedown', function () {

                    let url = "/scenes/" + button.next;
                    if (allow_eff == 1) {
                        var clickEffect = new Audio("/audio/click.mp3");
                        clickEffect.load();
                        clickEffect.currentTime = 0;
                        clickEffect.volume = 0.6;
                        clickEffect.play();
                    }
                    setTimeout(function () {
                        if (btn.textContent == '重新開始') {
                            window.parent.location.reload();
                        }
                        else {
                            window.location.href = url+role;
                        }
                    }, 150);
                });
            }
            btnContainer.appendChild(btn); // add btn into <div class="buttonDiv">
        }
    }
}

//To split each message using "\n"
function splitEachMsg() {
    let resultArrays = [];
    textArr.forEach(msgdict => {
        let resultArrays = [];
        msgdict['text'].forEach(msg => {
            let parts = msg.split('\n').map(sen => sen.trim()).filter(sen => sen !== '');
            resultArrays.push(parts);
        });
        msgdict['text'] = resultArrays;
    });
}

//To split a segmented message into N lines
function msgIntoSegment() {
    let M = maxLen - 1;
    textArr.forEach(msgdict => {
        let sentences = [];
        msgdict['text'].forEach(msg => {
            //itereate msgdict['text']中的每個陣列中的元素
            let msgInCol = [];
            msg.forEach(s => {
                let remainText = s;
                // Continue splitting the message untill the remaining character count is less than maxLen
                while (remainText.length > M) {
                    let sentence = remainText.substring(0, M);
                    remainText = remainText.substring(M);
                    msgInCol.push(sentence);
                }
                if (remainText.length > 0) {
                    msgInCol.push(remainText);
                }
            });
            sentences.push(msgInCol);
        });
        msgdict['text'] = sentences;
    });
}

function playBGM(audioElement, currentVolume, targetVolume) {
	if (allow_bg == 1){
		let fadeInterval;
		let fadeDuration = 3000;
		let fadeSteps = 200;
		let step = (targetVolume - currentVolume) / fadeSteps;
		let intervalTime = fadeDuration / fadeSteps;
		fadeInterval = setInterval(function () {
			if (currentVolume >= targetVolume) {
				clearInterval(fadeInterval);
			} 
			else {
				if (allow_bg == 1){
	 	        	currentVolume += step;
					audioElement.volume = currentVolume;
				}
				else {
					audioElement.volume = 0;
					clearInterval(fadeInterval);
				}
			}
		}, intervalTime);
	}
}

function menuClick() {
	let achievement = document.getElementById("achievement");
	let home = document.getElementById("home");
	let overview = document.getElementById("overview");
	let prevPage = document.getElementById("prevPage");
	let back = document.getElementById("back");
	let leave = document.getElementById("leave");
	let soundControl = document.getElementById("soundControl");
	let bgControl = document.getElementById("bgControl");
	let effectControl = document.getElementById("effectControl");
	let music_menu = document.getElementById("music_menu");
	let clickEffect = new Audio("/audio/click.mp3");
	let cl_check = 0;
	clickEffect.load();
	home.addEventListener('mousedown', function () {
    	if (allow_eff == 1) 
        	clickEffect.volume = 0.6;
    	else
        	clickEffect.volume = 0;
  
		clickEffect.play();
       	setTimeout(function () {
			window.parent.location.reload();}, 150);
	});

	prevPage.addEventListener('mousedown', function () {
		if (allow_eff == 1) 
            clickEffect.volume = 0.6;
        else
            clickEffect.volume = 0;
		clickEffect.play();
		setTimeout(function () {
			window.location.href = "/scenes/" + prev_page + role + '&prev=1';}, 150);
	});

	back.addEventListener('mousedown', function () {
		if (allow_eff == 1) 
            clickEffect.volume = 0.6;
        else
            clickEffect.volume = 0;
		clickEffect.play();
		setTimeout(function () {
			window.location.href = '/scenes/' + curr_page + role + '&cur=1';}, 150);
	});

	leave.addEventListener('mousedown', function () {
		let confirmation = window.confirm("確定要離開嗎？");
		if (allow_eff == 1) 
            clickEffect.volume = 0.6;
        else
            clickEffect.volume = 0;
		clickEffect.play();
		setTimeout(function () {
			if (confirmation) {
				window.location.href = "/end" + role;
			}}, 150);
	});

	soundControl.addEventListener('mousedown', function () {
		if (allow_eff == 1) 
            clickEffect.volume = 0.6;
        else
            clickEffect.volume = 0;  
		clickEffect.play();

		if(allow_bg == 1){
			bgIcon.classList.add("fa-volume-up");
		}
		else{
			bgIcon.classList.add("fa-volume-off");
		}

		if(allow_eff == 1){
			effectIcon.classList.add("fa-volume-up");
		}
		else{
			effectIcon.classList.add("fa-volume-off");
		}
		if(cl_check==0){
			music_menu.style.display="block";
			cl_check=1;
		}
		else{
			music_menu.style.display="none";
            cl_check=0;
		}
	});

	bgControl.addEventListener('mousedown',function(){
		if (allow_eff == 1)
            clickEffect.volume = 0.6;
        else
            clickEffect.volume = 0;
		if(allow_bg == 1){
            bgIcon.classList.remove("fa-volume-up");
            bgIcon.classList.add("fa-volume-off");
            audio.volume = 0;
			sessionStorage.setItem('bg_confirmed',0);
			allow_bg = 0;
        }
        else{
            bgIcon.classList.remove("fa-volume-off");
            bgIcon.classList.add("fa-volume-up");
            sessionStorage.setItem('bg_confirmed',1);
			allow_bg = 1;
            audio.volume=0.2;
            audio.play();
        }
        clickEffect.play();
	});

	effectControl.addEventListener('mousedown',function(){
        if(allow_eff == 1){
            effectIcon.classList.remove("fa-volume-up");
            effectIcon.classList.add("fa-volume-off");
            sessionStorage.setItem('eff_confirmed',0);
            allow_eff = 0;
            clickeEffect.volume = 0;
        }
        else{
            effectIcon.classList.remove("fa-volume-off");
            effectIcon.classList.add("fa-volume-up");
            clickEffect.volume = 0.6;
			sessionStorage.setItem('eff_confirmed',1);
			allow_eff = 1;
        }
        clickEffect.play();
    });

	achievement.addEventListener('mousedown', function () {
		mask_bg.style.backgroundColor = 'rgba(70,70,70,0.8)';
		removeEleInUI();
		//add items
		for (const sc_no in achievementItems){
			addLinkItem(sc_no,achievementItems[sc_no]['scName'],achievementItems[sc_no]['flag'], false, true);
		}

		if (allow_eff == 1) 
            clickEffect.volume = 0.6;
        else
            clickEffect.volume = 0;
		clickEffect.play();
	});

	overview.addEventListener('mousedown', function (){
		mask_bg.style.backgroundColor = 'rgba(70,70,70,0.8)';
		removeEleInUI();
		//add items
		for (const sc_no in overviewItems) {
			addLinkItem(sc_no,overviewItems[sc_no]['scName'],overviewItems[sc_no]['flag'], true, false);
				/*if (index == sc_name_Object.length -1 && curr_page == key){
					AddDirectory(key,value,true);
				}
				else if (index == sc_name_Object.length -1){
					AddDirectory(key,value,false);
					AddDirectory(curr_page, curr_page, true);
				}
				else{
					AddDirectory(key,value,false);
				}*/
		}
		if (allow_eff == 1) 
            clickEffect.volume = 0.6;
        else
            clickEffect.volume = 0;
		clickEffect.play();
	});


}

function removeEleInUI(){
	let imgElements = document.querySelectorAll('img');
	imgElements.forEach(imgElement => {
  		imgElement.remove();
	});
	let btnContainer = document.getElementsByClassName("buttonShow")[0];
	if (btnContainer != null){
		btnContainer.innerHTML ='';
	}
	if(iTag != null){
		iTag.remove();
	}	
	text_area.remove();
	mask_bg.style.removeProperty('cursor');
	mask_bg.style.cursor='auto';
	mask_bg.removeEventListener('mousedown', showText);
	text_area_bg.removeEventListener('mousedown', showText);
	text_area_bg.style.removeProperty('cursor');
	text_area_bg.style.cursor='auto';
	speaker_area.remove();
	let ul = document.getElementById('list');
	ul.innerHTML = '';	
}

function addLinkItem(sc_no, scName, flag, addLink, addMedal){
	let ul = document.getElementById('list');
	let li = document.createElement('li');
	li.className = 'elementor-icon-list-item';
	let link = document.createElement('a');
	
	let span = document.createElement('span');
	span.className = 'elementor-icon-list-text';
	let icon_li = document.createElement('li');	
	let textNode = document.createTextNode(' '+scName);
	if (flag){
		if(addLink){
			link.href='/scenes/'+sc_no+role+'&overview=1';
		}
		span.style.color = 'Gold';
		icon_li.style.color = 'Gold';
	}
	if (addMedal){
		icon_li.className = 'fa-solid fa-medal';
	}
	icon_li.id = 'arrow';
	span.appendChild(icon_li);
	span.appendChild(textNode);
	link.appendChild(span);
	li.appendChild(link);
	ul.appendChild(li);
}

function playmusic() {
	if (audio != null){ //let url+= ~/scenes/sc_num can access
		if (effect != null) {
			audio.volume = 0;
			if(allow_eff == 1)
				effect.volume = 0.6;
			else
				effect.volume = 0 ;
			effect.play();
			effect.addEventListener('ended', function () {
				if (audio.volume < 0.2)
					playBGM(audio, audio.volume, 0.2);
			});
		} 
		else {
			if (audio.volume < 0.2)
				playBGM(audio, audio.volume, 0.2);
		}
	}
}

function KeyShowText(e){
	console.log(e.key);
    if(e.key == ' ' ||e.key == 'Enter' || e.key == 'ArrowDown' ||e.key == 'ArrowRight'){
            showText();
        }

        if(e.key == 'ArrowLeft' ||e.key =='ArrowUp'){
            window.location.href = "/scenes/" + prev_page + role + '&prev=1';
        }
}
//call menuclick() and getMaxLen()
if (typeof LINE !== 'undefined'){
	endIndex = startIndex + LINE;
	init();
	
	//showMSG();
	// add text area's click event listener
	mask_bg.addEventListener("mousedown", showText);
	text_area_bg.addEventListener("mousedown", showText);
	if (textArr != '') {
		splitEachMsg();
		msgIntoSegment();
	}
 
	document.body.addEventListener("focus",function(e){
		document.body.focus();
	});
	document.addEventListener("keydown",KeyShowText);
	showText();

}
