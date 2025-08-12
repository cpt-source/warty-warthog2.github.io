window.onload = function(){
    fetch("anims_package.csv")
        .then((res) => res.text())
        .then((text) => {
            my_anims = arrayToJSON(csvToArray(text));
            //console.log(text,csvToArray(text));
            console.log(my_anims);
        })
        .catch((e) => console.error(e));
};

function csvToArray(str, delimiter = ",") {
    var buffer = str;
    var arr = [];
    while(buffer.indexOf("\r") > 0) {
        var row = buffer.slice(0, buffer.indexOf("\r")).split(delimiter);
        row[0] = row[0].replace("\n","");
        arr.push(row);
        buffer = buffer.slice(buffer.indexOf("\r")+1,buffer.length);
    }
    var row = buffer.split(delimiter);
    row[0] = row[0].replace("\n","");
    arr.push(row);

    return arr;
  }

function arrayToJSON(arr) {
    var pkg = {};

    var x=0,k=0;
    for(var i=0;i<arr.length;i++) {
        if(pkg[arr[i][0]]===undefined) {
            pkg[arr[i][0]] = [];
            pkg[arr[i][0]].push({
                "fx":arr[i][1],
                "steps":[]
            });
        }
        
        if(pkg[arr[i][0]][x].fx!=arr[i][1]) {
            pkg[arr[i][0]].push({});
            x = pkg[arr[i][0]].length-1;
        }
            
        if(pkg[arr[i][0]][x].steps===undefined) {
           pkg[arr[i][0]][x].steps = [];
           k = 0;

        } else {
            k = pkg[arr[i][0]][x].steps.length;
            k = k==0?0:k;
        }
        //console.log(x,pkg,k);

        pkg[arr[i][0]][x].fx = arr[i][1];
        if(arr[i][1]!="null") {
            var filename = arr[i][1]+"_"+(k+1)+".txt";
            setText(filename,i,x,k);

        } else {
            pkg[arr[i][0]][x].steps[k] = {
                "title":"null title",
                "text":"null text",
            };
        }
        pkg[arr[i][0]][x].steps[k] = {
            "start":arr[i][2].split("|")[0],
            "end":  arr[i][2].split("|")[1],
            "alpha":arr[i][3].split("|"),
            "focus":arr[i][4].split("|")
        };
    }
    //console.log(pkg);

    function setText(filename,i,x,k) {
        fetch("./user/"+filename)
            .then((res) => res.text())
            .then((text) => {
                var titleOpen = "{{title}}";
                var titleClose = "{{/title}}";
                var bodyOpen = "{{body}}";
                var bodyClose = "{{/body}}";
                title = text.substring(
                    text.indexOf(titleOpen)+titleOpen.length,
                    text.indexOf(titleClose)
                );
                body = text.substring(
                    text.indexOf(bodyOpen)+bodyOpen.length,
                    text.indexOf(bodyClose)
                );
                
                pkg[arr[i][0]][x].steps[k] = {
                    "title":title,
                    "text":body,
                    "start":arr[i][2].split("|")[0],
                    "end":  arr[i][2].split("|")[1],
                    "alpha":arr[i][3].split("|"),
                    "focus":arr[i][4].split("|")
                }
            })
            .catch((e) => {
                console.error(e)
                return [undefined,undefined];
            });
    }

    return pkg;
}
  