window.onload = function() {
    //var objects_list = VARS["objects_list"];
    //var anims_package = VARS["anims_package"];
    var objects_list = [];
    handleAnims(objects_list, 
        mergeJSON(textToJSON(
            document.getElementsByTagName("object")[0]
            .contentDocument.body.innerHTML
        ), 
    anims_file_transport));
};

// combines CP3 animations array with User Defined animations info array
function mergeJSON(temp, anims_package) {
    var anims = anims_package;
    for(var i=0;i<anims_package.user.length;i++) {
        if(temp[i]!==undefined) {
            anims.user[i].fx = temp[i].fx;
            for(var j=0;j<anims.user[i].steps.length;j++) {
                if(temp[i].steps[j]!==undefined) {
                    anims.user[i].steps[j].title = temp[i].steps[j].title;
                    anims.user[i].steps[j].text  = temp[i].steps[j].text;
                } else {
                    anims.user[i].steps[j].title = "Missing Title";
                    anims.user[i].steps[j].text  = "Missing Body Text";
                }
            }
        } else {
            anims.user[i].fx = "ERROR";
        }
    }

    console.log(anims);

    return anims;
}

function textToJSON(text) {
    text = text.substring(
        text.indexOf("<cycle>")+("<cycle>").length,
        text.indexOf("</cycle>")
    );
    var operations = [];
    while(text.indexOf("<operation>")!=-1) {
        var temp = text.substring(
            text.indexOf("<operation>"),
            text.indexOf("</operation>")+("<operation>").length+1
        );
        var tab_name = temp.substring(
            temp.indexOf("<tab-name>")+("<tab-name>").length,
            temp.indexOf("</tab-name>")
        );
        var steps = [];
        while(temp.indexOf("<step>")!=-1) {
            steps.push({
                "title": temp.substring(
                    temp.indexOf("<title>")+("<title>").length,
                    temp.indexOf("</title>")
                ),
                "text": temp.substring(
                    temp.indexOf("<text>")+("<text>").length,
                    temp.indexOf("</text>")
                )
            });
            temp = temp.replace(
                temp.substring(
                    temp.indexOf("<step>"),
                    temp.indexOf("</step>")+("<step>").length+1
                ),"");
        }
        operations.push({
            "fx": tab_name,
            "steps": steps
        });
        text = text.replace(
            text.substring(
                text.indexOf("<operation>"),
                text.indexOf("</operation>")+("<operation>").length+1
            ),"");
    }

    return operations;
}

function handleAnims(objects_list, anims_package) {
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
        millis = millis < 10 ? "0" + millis : millis;
        millis = String(millis).substring(0,2);
        return `${second}:${millis}`;
    };

    var playpauseClick, frwdClick, bkwrdClick;
    var cop_section = document.getElementById("cop-section");
    var flex_block = cop_section.getElementsByClassName("step-tabs")[0];
    var tabs = flex_block.getElementsByTagName("div");
    var text_area = cop_section.getElementsByClassName("text-area")[0];
    var top_text = text_area.getElementsByClassName("top")[0];
    var bottom_text = text_area.getElementsByClassName("bottom")[0];
    var step_number = top_text.getElementsByTagName("span")[0];
    var step_title = top_text.getElementsByTagName("span")[1];
    var step_text = bottom_text.getElementsByTagName("span")[0];
    var timer, clock;
    var isPlaying = false;

    function printInfo(args, cur_step) {
        step_number.innerHTML = "Step "+(cur_step+1);
        step_title.innerHTML = args[cur_step].title.length>64?args[cur_step].title.substring(0,64-3)+"...":args[cur_step].title;
        step_text.innerHTML = args[cur_step].text.length>264?args[cur_step].text.substring(0,264-3)+"...":args[cur_step].text;
    }

    function selectOp(target) {
        playpause.removeEventListener('click', playpauseClick);
        frwd.removeEventListener('click', frwdClick);
        bkwrd.removeEventListener('click', bkwrdClick);
        isPlaying = false;
        clearInterval(timer);
        clearInterval(clock);
        playpause.innerHTML = '<i class="fa-solid fa-play"></i>';
        currentTimeRef.innerHTML = timeFormatter((0/step)*(interval));

        var anim;
        for(var i=0;i<anims_package.user.length;i++) {
            if(anims_package.user[i].fx == target.id) {
                anim = anims_package.user[i];
                break;
            }
        }

        var steps_arr = anim.steps;
        var steps_length = steps_arr.length;
        var start = steps_arr[0].start;
        var end = steps_arr[steps_length-1].end;

        frames = end - start;
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
        
        if(cop_section.style.display == "grid") {
            target.classList.remove('hilight');
            console.log('puzzles.procedures["goToFrame"](animations.explode.start);');
            //puzzles.procedures["goToFrame"](animations.explode.start);
            cop_section.style.display = "none";

        } else {
            tabs = flex_block.getElementsByTagName("div");
            tabs[0].classList.remove('hilight');
            if(tabs.length > 1) tabs[1].classList.remove('hilight');
            if(tabs.length > 2) tabs[2].classList.remove('hilight');
            target.classList.add('hilight');
            console.log('puzzles.procedures["animMaterials"](objects);');
            //puzzles.procedures["animMaterials"](objects);
            cop_section.style.display = "block";
            doPlay(steps_arr);
        }
    }

    for(var i=0;i<anims_package.user.length;i++) 
    {
        var elem = document.createElement("div");
        elem.id = anims_package.user[i].fx;
        elem.innerHTML = anims_package.user[i].fx.charAt(0).toUpperCase() + 
                anims_package.user[i].fx.slice(1);

        elem.addEventListener("click",function(event){ selectOp(event.target) });
        
        flex_block.appendChild(elem);
    }
    selectOp(document.getElementById(anims_package.user[0].fx)); // autoselect first animation
    //VARS["anims_package"] = animations;
    //VARS["start"] = animations.explode.start;

    function doPlay(args) {
        maxDuration.innerText = timeFormatter((max/step)*(interval));
        playbar.value = 0;

        var status = parseInt(playbar.value);

        var cur_step = 0;
        var cur_frame = args[0].start+((status/max)*frames);
        printInfo(args, cur_step);

        isPlaying = false;
        playpauseClick = function () {
            if (!isPlaying) {
                isPlaying = !isPlaying;
                timer = setInterval(function(){
                    status = status>=max? 0:status+step;
                    cur_frame = args[0].start+((status/max)*frames);

                    if(args[cur_step+1]!==undefined && cur_frame >= args[cur_step].end)     // go to next step
                        cur_step++;
                    else if(args[cur_step-1]!==undefined && cur_frame < args[cur_step].start) // go to previous step
                        cur_step--;
                    
                    printInfo(args, cur_step);

                    console.log("go to frame:",cur_frame);
                    //puzzles.procedures["goToFrame"](cur_frame);
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
                cur_step = 0;
                playpause.innerHTML = '<i class="fa-solid fa-play"></i>';
            }
        };
        playpause.addEventListener("click", playpauseClick);

        frwdClick = function () {
            cur_step = cur_step+1>=args.length?0:cur_step+1;
            status = args[cur_step].start / (args[args.length-1].end - args[0].start);
            status*=max;
                    
            printInfo(args, cur_step);
            playbar.value = status;
        };
        frwd.addEventListener("click", frwdClick);
        
        bkwrdClick = function () {
            cur_step = cur_step-1<0?args.length-1:cur_step-1;
            status = args[cur_step].start / (args[args.length-1].end - args[0].start);
            status*=max;
                    
            printInfo(args, cur_step);
            playbar.value = status;
        }
        bkwrd.addEventListener("click", bkwrdClick);

        playbar.oninput = function() {
            status = parseInt(playbar.value);
            cur_frame = args[0].start+((status/max)*frames);

            for(var j=0;j<args.length;j++) {
                if(args[j]!==undefined && cur_frame >= args[j].start && cur_frame <= args[j].end) {
                    cur_step = j;
                    break;
                }
            }
            
            printInfo(args, cur_step);
            isPlaying = false;
            clearInterval(timer);
            clearInterval(clock);
            playpause.innerHTML = '<i class="fa-solid fa-play"></i>';

            console.log("go to frame:",cur_frame);
            //puzzles.procedures["goToFrame"](cur_frame);
            currentTimeRef.innerHTML = timeFormatter((status/step)*(interval));
            maxDuration.innerText = timeFormatter((max/step)*(interval));
        };
    }
}