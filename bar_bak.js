document.getElementById("cop-section").style.display = "none";

const playbar = document.getElementById("playbar").getElementsByTagName("input")[0];
const playpause = document.getElementById("play-pause");
const frwd = document.getElementById("skip-10");
const bkwrd = document.getElementById("skipminus-10");
const currentTimeRef = document.getElementById("current-time");
const maxDuration = document.getElementById("max-duration");

var frames = 500;
const max = 100;
var step = max / frames; // step = max / frames
const interval = 10; // ms per frame
const timeFormatter = (timeInput) => {
    let second = Math.floor((timeInput/1000) % 60);
    second = second < 10 ? "0" + second : second;
    let millis = Math.floor(timeInput % 1000);
    //millis = millis < 100 ? "0" + millis : millis;
    //millis = millis < 10 ? "0" + millis : millis;
    millis = String(millis).substring(0,2);
    return `${second}:${millis}`;
};

var objects_list = VARS["objects_list"];
var anims_package = VARS["anims_package"];
console.log(objects_list, anims_package);
var animations = {};
var cur_anim = 0;
var playpauseClick, frwdClick, bkwrdClick;

//var flex_block = document.getElementById("flex-block");
var flex_block = document.getElementById("cop-section").getElementsByClassName("step-tabs")[0];

for(var i=0;i<anims_package.length;i++) {
    animations[anims_package[i][0]] = {
        "start": anims_package[i][1],
        "end": anims_package[i][2],
        "alpha": anims_package[i][3]==null?[]:
            anims_package[i][3].split("|")
    };
    if(anims_package[i][0]!="explode") {
        var elem = document.createElement("div");
        elem.id = anims_package[i][0]+"-button";
        //elem.setAttribute("class", "icon-link w-inline-block");
        //elem.setAttribute("href", "");
        elem.innerHTML = anims_package[i][0].charAt(0).toUpperCase() + 
                anims_package[i][0].slice(1);
        
        var args = animations[anims_package[i][0]];
        
        var objects = [];
        for(var j=0;j<args.alpha.length;j++) {
            for(var k=0;k<objects_list.length;k++) {
                if(args.alpha[j]==objects_list[k]) {
                    objects[j] = k;
                    break;
                }
            }
        }
        //console.log(objects);
        elem.addEventListener("click",function(event)
        {
            frames = args.end - args.start;
            step = max / frames; // step = max / frames
            playbar.max = max;
            playbar.step = step;
            playbar.setAttribute("style",
                "background-image:"+
                "repeating-linear-gradient("+
                    "to right, rgba(255, 255, 255, 0.2),"+
                    "rgba(255, 255, 255, 0.2) calc("+step+"%), "+
                    "#05051a "+step+"%"+
                  ");"
            );
            
            // Option 1
            //puzzles.procedures["playAnimation"](args);
            
            // Option 2
            var player = document.getElementById("cop-section");
            if(player.style.display == "grid") {
                event.target.classList.remove('hilight');
                puzzles.procedures["goToFrame"](animations.explode.start);
                player.style.display = "none";
                
                playpause.removeEventListener('click', playpauseClick);
                frwd.removeEventListener('click', frwdClick);
                bkwrd.removeEventListener('click', bkwrdClick);
            } else {
                event.target.classList.add('hilight');
                puzzles.procedures["animMaterials"](objects);
                player.style.display = "block";
                doPlay(args);
            }
        });
        
        flex_block.appendChild(elem);
    }
}
VARS["anims_package"] = animations;
VARS["start"] = animations.explode.start;

function doPlay(args) {
    maxDuration.innerText = timeFormatter((max/step)*(interval));
    playbar.value = 0;

    var status = parseInt(playbar.value);
    var timer, clock;

    let isPlaying = false;
    playpauseClick = function () {
        if (!isPlaying) {
            isPlaying = !isPlaying;
            timer = setInterval(function(){
                status = status>=max? 0:status+step;
                var cur_frame = args.start+((status/max)*frames);
                //console.log("go to frame:",cur_frame);
                puzzles.procedures["goToFrame"](cur_frame);
                if(status >= max) {
                    isPlaying = false;
                    clearInterval(timer);
                    clearInterval(clock);
                    playpause.innerHTML = '<i class="fa-solid fa-play"></i>';
                }
                playbar.value = status;
            },interval)
            clock = setInterval(() => {
                currentTimeRef.innerHTML = timeFormatter((status/step)*(interval));
                maxDuration.innerText = timeFormatter((max/step)*(interval));
            }, 1);

            playpause.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            isPlaying = !isPlaying;
            clearInterval(timer);
            clearInterval(clock);
            playpause.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    };
    playpause.addEventListener("click", playpauseClick);

    frwdClick = function () {
        status = status+step>max?0:status+step;
        playbar.value = status;
    };
    frwd.addEventListener("click", frwdClick);
    
    bkwrdClick = function () {
        status = status-step<0?max:status-step;
        playbar.value = status;
    }
    bkwrd.addEventListener("click", bkwrdClick);

    playbar.oninput = function() {
        status = parseInt(playbar.value);
        var cur_frame = args.start+((status/max)*frames);
        //console.log("go to frame:",cur_frame);
        puzzles.procedures["goToFrame"](cur_frame);
        currentTimeRef.innerHTML = timeFormatter((status/step)*(interval));
        maxDuration.innerText = timeFormatter((max/step)*(interval));
    };
}