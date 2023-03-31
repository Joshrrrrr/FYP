let isFirefox = typeof browser !== "undefined";
let _browser = isFirefox ? browser : chrome;
let match_whole=false;

async function initTwitchVodMiner(){
    async function requestFromBackground(obj){
        return new Promise((res,rej) => {
            _browser.runtime.sendMessage(obj, response=> {
        res(response)
    })
        })
    }
    _browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.action === "toggleAutoRefresh" && message.enabled) {
          // Enable or disable auto refresh based on the message value
            window.addEventListener('visibilitychange', function() {
            let isMainPlayerError = false;
            refreshPageOnMainTwitchPlayerError(isMainPlayerError);
        });
        } else if (message.action === "toggleAutoClicker" && message.enabled) {
          // Enable or disable auto clicker based on the message value
          let channelPointsClickerInterval = null;
          setChannelPointsClickerListeners(channelPointsClickerInterval)
        }
    });

    //IF WINDOW STARTS OR CHANGES CHECK FOR TWITCH PLAYER ERROR AND REFRESH

    function refreshPageOnMainTwitchPlayerError(isMainPlayerError) {
    // Check if the button to allow ads to play is present
    let btn = document.querySelector('.content-overlay-gate__allow-pointers button');
    if (btn) {
        // Click the button to allow ads to play
        btn.click();
        // Set the error flag to false
        isMainPlayerError = false;
        // Wait 2 seconds
        setTimeout(function (){
            // Get the Twitch video player
            let t_player = document.querySelector(".video-player").querySelector('video');
            if (t_player) {
                // Play the video
                t_player.play();
                // Wait 1/10 of a second
                setTimeout(function () {
                    // Execute the fast forward function
                    fastForwardFuncExec();
                }, 100);
            }
        }, 2000);
        // Wait 10 seconds
        setTimeout(function (){
            // Check for auto refresh
            checkForAutoRefresh();
        }, 10000);
    } else{
        // Set the error flag to true
        isMainPlayerError = true;
    }
}
    function fastForwardFuncExec() {
        // try to catch an error
        try {
            // get the video
            let video = document.querySelector('video');
            // set the video's current time to the end of the buffered video
            video.currentTime = video.buffered.end(video.buffered.length - 1);
        } catch (e) {
            // if there is an error, don't do anything
        }
    }
    function checkForAutoRefresh() {
    // Find the element that contains the text for the error message
    let el = document.querySelector('p[data-test-selector="content-overlay-gate__text"]');

    // Does the error message contain any of the text we're looking for?
    if (el) {
        // If so, check to see if it contains the text for the 3 second, 2 second, 1 second, or 0 second error messages
        if (['1000','2000','3000','4000'].some(x => el.innerText.indexOf(x) >= 0)) {
            // If so, refresh the page
            refreshPageOnMainTwitchPlayerError();
        }
    } else {
        // If not, keep checking
        listenForPlayerError();
    }
}

    function listenForPlayerError() {
        try{
            // Select the video element from the DOM
            let t_player = document.querySelector(".video-player").querySelector('video');
            // Check if the tp_abort_listener attribute is set
            if (t_player.attributes.tp_abort_listener) {
                // If it is, return so we don't add the event listener again
                return;
            }

            // Add the event listener to the video player
            t_player.addEventListener('abort', (event) => {
                // Check if the option to refresh on error is enabled
                if (options.isErrRefreshEnabled) {
                    // If it is, set a timeout to check for an auto-refresh
                    setTimeout(function (){
                        checkForAutoRefresh();
                    },100)
                }
            });
            // Set the tp_abort_listener attribute to true
            t_player.setAttribute('tp_abort_listener', 'true');
        } catch (e) {
            // If there is a problem, log an error in the console
            console.error("Error adding abort listener: ", e);
        }
    }
    
    // Declare a function called clickChannelPointsBtn. This function will be called later in the code.
    function clickChannelPointsBtn() {
        // Select the channel points button.
        let btn = document.querySelector('.claimable-bonus__icon');
        // If the channel points button is present, click it.
        if (btn) {
            btn.click();
        }
    }

    // Declare a function called setChannelPointsClickerListeners. This function will be called later in the code.
    function setChannelPointsClickerListeners(channelPointsClickerInterval) {
        // If the channelPointsClickerInterval variable is undefined, run the code inside the if statement.
        if (!channelPointsClickerInterval) {
            // Call the clickChannelPointsBtn function.
            clickChannelPointsBtn();
            // Set the channelPointsClickerInterval variable to an interval that calls the clickChannelPointsBtn function every 15 seconds.
            channelPointsClickerInterval = setInterval(function() {
                clickChannelPointsBtn();
            }, 15000);
        }
    }
    var contain_arr = [];
    var parseStringAsXset = (s) => s.split(/\s+\band\b\s+|(?<!\s+and\b)\s+\(|\)\s+(?!\band\b)/i)
        .map(el=> 
            //for each substring, split it up again based on the 'or' operator, and then process the individual terms
            el.split(/\s+\bor\b\s+/i).map(ii=> 
                ii.replace(/\s*\)\s*/g,'') //remove any whitespace before or after closing parentheses
                .replace(/\s*\(\s*/g,'') //remove any whitespace before or after opening parentheses
                .replace(/\s+/g,'.{0,3}') //replace any whitespace with up to three characters
                .replace(/"/g,'\\b') //replace any quotes with a word boundary
                .replace(/\*\*\*/g,'.{0,60}') //replace triple asterisks with up to 60 characters
                .replace(/\*/g,'.{0,1}')) //replace single asterisks with up to one character
                    //combine the individual terms with an 'or' operator
                    .reduce((a,b)=> a+'|'+b))
                        //remove any empty strings
                        .filter(el=> el)
                            //add word boundaries before and after each term
                            .map(r=> r.replace(/\+/g,'\\+'));

    function permutateNear(input,joiner){
    // match all words between | or the start/end of the string
    var nearx = /(?<=\||^)\S+?(?=\||$)/g;
    // store base string
    var base = input.replace(nearx, '').replace(/[\|]+/g, '|');
    // store near string
    var near_or = input.match(nearx) ? input.match(nearx).map(str=> {
        // split near string by ~
        var arr = str.split(/~/);
        // if more than 5 words, return as is
        if(arr.length > 5){
        return str.replace(/[~]+/,'.');
        }else{
        // store all combinations of words
        var cont = [];
        var containArr = [];
        function comboLoop(arr, cont){
            if (arr.length == 0) {
            var row = cont.join(joiner);
            containArr.push(row)
            }
            for (var i = 0; i < arr.length; i++) {
            var x = arr.splice(i, 1);
            cont.push(x);
            comboLoop(arr, cont);
            cont.pop();
            arr.splice(i, 0, x);
            }
        }
        comboLoop(arr, cont);
        return containArr.reduce((a,b)=> a+'|'+b);
        }
    }).flat().reduce((a,b)=> a+'|'+b) : '';
    // return base string with near string
    return base + near_or;
    }

    function buildSearchSet(str,flags){
        // this function takes a string of search terms and returns an array of regexp objects
        if(str){
            // if the string is empty, return null
            var set = parseStringAsXset(str);
            // parse the search string into a list of search terms
            var xset = set.map(r=> permutateNear(r,'.{0,49}')).map(r=> tryRegExp(r.replace(/^\||\|$/g,''),flags));
            // convert each search term into a regexp object
            return xset;
        }else{return null}
    }

    function tryRegExp(s,f){
        // this function takes a string and returns a regexp object if the string is a valid regexp
        try{return new RegExp(s,f)}
        catch(err){return false}
    }
    //FUNCTIONAL ONE-LINERS
    const cn = (o, s) => o ? o.getElementsByClassName(s) : null; // get elements by class name
    const gi = (o, s) => o ? o.getElementById(s) : null; // get element by id
    const ele = (t) => document.createElement(t); // create element
    const attr = (o, k, v) => {try{o.setAttribute(k, v);} catch(err) {console.log(err)}}; // set attribute
    const a = (l, r) => r.forEach(a => attr(l, a[0], a[1])); // apply attributes

    function inlineStyler(elm,css){
    Object.entries(JSON.parse(
        // Replace all the spaces between the colon and the first character of the value with a double quote
        css.replace(/(?<=:)\s*(\b|\B)(?=.+?;)/g,'"')
            // Replace all the semi-colons at the end of the value with a double quote and a comma
            .replace(/(?<=:\s*.+?);/g,'",')
            // Add double quotes around the property name
            .replace(/[a-zA-Z-]+(?=:)/g, k=> k.replace(/^\b/,'"').replace(/\b$/,'"'))
            // Remove any spaces after the comma
            .replace(/\s*,\s*}/g,'}')
    )).forEach(kv=> { elm.style[kv[0]] = kv[1]});
    }
    //GENERATES Z INDEX RANDOM FOR THE CONTAINER TO BE LAYERED ON TOP OF THE DOCUMENT BODY Z
    function topZIndexer() {
    // Create a new date object
    let n = new Date().getTime() / 100000;
    // Round the result to 3 decimal places
    let r = (n - Math.floor(n)) * 1000;
    // Return the rounded result
    return Math.round(n+r);
}

    function createDownloadHTML() {
        // Get the width of the body
        const body_width = document.body.getBoundingClientRect().width;
        // Set the width of the download bar
        const download_bar_width = body_width * 0.98;
        // Get the download bar element
        let cont = gi(document,'download_notif');
        // Set the attributes of the download bar
        a(cont, [['id', 'download_notif'], ['style', `background: #242931; border: 2px solid #242931; border-radius: 0.2em;`]]);
        // Create the percentage bar element
        let perc = ele('div');
        // Set the attributes of the percentage bar
        a(perc, [['id', 'percentage_bar'],['class','options_main_cont'], ['style', `width: 0px; height: 36px; border-bottom-right-radius: 0.2em; border-top-right-radius: 0.2em; transition: all 1s;`]]);
        // Add the percentage bar to the download bar
        cont.appendChild(perc);
        // Create the percentage text element
        let txt = ele('div');
        // Set the attributes of the percentage text element
        a(txt, [['id', 'percentage_txt'], ['style', `color: #ffffff; width: 300px;`]]);
        // Add the percentage text element to the percentage bar
        perc.appendChild(txt);
        // Set the text of the percentage text element
        txt.innerHTML = 'Downloading logs';
    }
    function updateDownloadBar(obj){
        if(!gi(document,'download_notif')) createDownloadHTML();
        const {text,img,iteration,total_results,status} = obj;
        const body_width = gi(document,'download_notif').getBoundingClientRect().width;
        const download_bar_width = body_width * 0.98;
        let cont = gi(document,'download_notif');
        if(cont){
            let perc = gi(document,'percentage_bar');
            let txt = gi(document,'percentage_txt');
            cont.style.width = `${download_bar_width}px;}`;
            perc.style.width = `${( download_bar_width * ( iteration / total_results ) )}px`;
        txt.innerHTML = `<div style="display: grid; grid-template-columns: 80px 160px 10px; grid-gap: 8px;"><div style="transform:translate(0px,15px);">${Math.floor(( ( iteration / total_results ) * 10000)/100)}%</div></div>`;
            if(status !== true) {
                cont.outerHTML = '';
                if(gi(document,'dl_progress')) gi(document,'dl_progress').outerHTML = '';
            };
        }
    }

    function setQuickliCSS(style_id){
        // If the style element already exists, delete it
        if(gi(document,`${style_id}_style`)) gi(document,`${style_id}_style`).outerHTML = '';
        // Create the css style element
        let csselm = ele('style');
        // Add the class attribute to the element
        a(csselm,[['class',`${style_id}_style`]]);
        // Append the style element to the head
        document.head.appendChild(csselm);
        // Add the css to the style element
        csselm.innerHTML = `
            .hh4 {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .pad8 {
                padding: 8px;
            }
            .pad12 {
                padding: 12px;
            }
            .centertext {
                text-align: center;
            }
            .h32 {
                height: 32px;
                width:32px;
            }
            .mover-left-gradient {
                background-image: linear-gradient(to bottom right, #ffffff, #ffffff, #f7f9fa, #f2f4f5);
                border-bottom-right-radius: 1em;
            }
            .textarea {
                outline: none;
                margin: 8px;
                border-radius: 0.4em;
                border: 0px;
                background: transparent;
                color: #ffffff;
            }
            .textarea:focus {
                box-shadow: rgb(204, 219, 232) 2px 4px 4px 1px inset, rgba(255, 255, 255, 0.5) -2px -2px 4px 2px inset;
            }
            .open_link {
                background: transparent;
                border-radius: 0.2em;
            }
            .open_link:hover {
                background: #ad92d472;
                border-radius: 0.2em;
            }
            .${style_id} {
                font-size: 1.5em;
                cursor: pointer;
                background: #242931;
                color: #ffffff;
                border-radius: 2em;
                transition: all 111ms;
            }
            .${style_id}:hover {
                box-shadow: rgba(0, 0, 0, 0.8) 6px 2px 6px 0px, rgba(0, 0, 0, 0.8) -6px -2px 6px -3px;
                color: #788fa5;
            }
            .${style_id}:active {
                box-shadow:
                -8px -4px 8px 0px #ffffff,
                6px 2px 6px 0px rgb(204, 219, 232),
                4px 4px 4px 0px rgb(204, 219, 232) inset,
                -4px -4px 4px 0px #ffffff inset;
                color: #788fa5;
            }
            .always_white always_white{
                color: #3d00ad;
            }
            .always_white:hover {
                color: #ffffff;
            }
            .options_main_cont {
                background: #5b6980;
            }
            @keyframes gradient_quickli {
                0% {
                    background-position: 0% 50%;
                }
                50% {
                    background-position: 100% 50%;
                }
                100% {
                    background-position: 0% 50%;
                }
            }`;
    }
    setQuickliCSS('search_logs_btn_main');

    async function buildContainer(){
        setQuickliCSS('search_logs_btn_main');
        const height = window.innerHeight * 1; // window.innerHeight <=600 ? window.innerHeight * 0.9 : window.innerHeight > 600 && window.innerHeight < 1100 ? window.innerHeight * 0.7 : window.innerHeight * 0.6;
        const width = window.innerWidth <= 800 ? window.innerWidth * 0.9 : window.innerWidth > 800 && window.innerWidth < 1161 ? window.innerWidth * 0.7 : window.innerWidth * 0.6;

        if(cn(document,'main_info_card')) Array.from(cn(document,'main_info_card')).forEach(r=> { r.outerHTML = ''; });
        const cont = ele('div');
        a(cont,[['class','main_info_card']]);

        inlineStyler(cont,`{display: grid; grid-template-columns: 582px; text-align: center; height: ${height}px; max-width: ${width}px; background: #495466; color: #ffffff; border-radius: 1em; padding: 12px; transition: all 111ms; position: fixed; z-index: ${topZIndexer()};}`);
        document.body.appendChild(cont);

        const left = ele('div');
        a(left,[['id','main_card']])
        inlineStyler(left,`{padding: 0px; display: grid; grid-template-rows: 25px 40px 0px 40px; grid-gap: 8px;}`);
        cont.appendChild(left);

        const cls = ele('div');
        left.appendChild(cls);
        a(cls,[['class','search_logs_btn_main h32']]);
        cls.innerHTML = `<svg style="border-radius: 2em; height: 30px; width: 30px;" x="0px" y="0px" viewBox="0 0 100 100"><g style="transform: scale(1, 1)" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(2, 2)" stroke="#495466" stroke-width="8"><path d="M47.806834,19.6743435 L47.806834,77.2743435" transform="translate(49, 50) rotate(225) translate(-49, -50) "/><path d="M76.6237986,48.48 L19.0237986,48.48" transform="translate(49, 50) rotate(225) translate(-49, -50) "/></g></g></svg>`;
        cls.onclick = () => {
            cont.outerHTML = '';
            injectVODsearchBtnIntoHeader();
        };
        
        var head_desc = ele('div');
        a(head_desc,[['id','download_notif']]);
        left.appendChild(head_desc);

        var chat_msg_cont = ele('div');
        inlineStyler(chat_msg_cont,`{border-radius: 2em; grid-gap: 4px;}`);
        left.appendChild(chat_msg_cont);

        var chat_msg = ele('input');
        a(chat_msg,[['id','message_body'],['placeholder','Keyword in chat'],['class','textarea pad12'],['style','background-color:#3d4655']]);
        chat_msg.style.width='80%';
        chat_msg_cont.appendChild(chat_msg);
        chat_msg.onkeyup = (e)=> {
            if(e.key == "Enter"){
                initChatLogSearch();
            }
        };
        var match = ele('button');
        a(match,[['id','match'],['class','pad12'],['style','border-radius:5px;border:1px solid #808080;'],['alt', 'Match whole word'],["title","Match whole word"]]);
        match.innerHTML='&#x1F3AB;';
        chat_msg_cont.appendChild(match);
        match.onclick = function() {
            match_whole = !match_whole;
            if(match_whole){
                a(match,[['id','match'],['class','pad12'],['style','background-color:#242931;border-radius:5px;border:1px solid #808080;'],['alt', 'Match whole word'],["title","Match whole word"]]);
            }else{
                a(match,[['id','match'],['class','pad12'],['style','border-radius:5px;border:1px solid #808080;'],['alt', 'Match whole word'],["title","Match whole word"]]);
            }
        }
        const btn = ele('div');
        a(btn,[['id','search_btn'],['class','search_logs_btn_main centertext pad8']]);
        left.appendChild(btn);
        
        btn.style.height= '43px';
        btn.style.margin= '0';
        btn.style.left= '50%';

        btn.innerText = 'Downloading logs, please wait';
        createDownloadHTML();
        btn.onclick = initChatLogSearch;

        const results_cont = ele('div');
        a(results_cont,[['id','results_main']]);
        inlineStyler(results_cont,`{margin-top:18px;text-align:left;height: ${(window.innerHeight * 0.5)}px; overflow-y: auto;}`);
        left.appendChild(results_cont);

        let left_node_heights = Array.from(left.childNodes).map(t=> t.getBoundingClientRect().height);
        //inlineStyler(panel,`{height: ${(left_node_heights.reduce((a,b)=> a+b) + (left_node_heights.length *12))-30}px;}`);
        inlineStyler(cont,`{height: ${left_node_heights.reduce((a,b)=> a+b) + (left_node_heights.length *12)}px;}`);
        keepElmInBoundary(cont);
        inlineStyler(cont,`{left: ${((window.innerWidth - cont.getBoundingClientRect().width) * 0.5)}px;}`);
        keepElmInBoundary(cont);   
    }
    function keepElmInBoundary(elm){ //function that keeps elm within the boundaries of the window
        if(elm.getBoundingClientRect().right >= window.innerWidth){ //if the elm is out of the window on the right side
            inlineStyler(elm,`{left: ${(window.innerWidth - (elm.getBoundingClientRect().width+30))}px;}`); //move the elm to the left side of the window
        }
        if(elm.getBoundingClientRect().bottom >= window.innerHeight){ //if the elm is out of the window on the bottom side
            // inlineStyler(elm,`{top: ${(window.innerHeight - (elm.getBoundingClientRect().height+260))}px;}`); //move the elm to the top side of the window
            inlineStyler(elm,`{top: 50px;}`); //move the elm to the top side of the window

        }
    }
    function addSearchResultsToForm(elm_id, results,search){       
        // Remove the download button
        if(gi(document,'filtered_download')) gi(document,'filtered_download').outerHTML = '';
        // Remove the timeline chart button
        if(gi(document,'filtered_timeline_chart_btn')) gi(document,'filtered_timeline_chart_btn').outerHTML = '';
                
        // Create a container for the VOD results
        var cont = cn(document,'main_info_card')?.[0];
        var left = gi(document,'main_card');
        var vodres = gi(document,elm_id);
        var btn = gi(document,'search_btn');
        inlineStyler(vodres,`{padding: 4px;}`);
        vodres.innerHTML = '';
        
        // 1. We'll create a new div element for each result in the results array.
        results.forEach(res=> {
            let itm = ele('div');
            vodres.appendChild(itm);
            let highlighted_msg_bod_text = res.message_body;

            // 2. Now we'll loop through the search settings and find the message_body one.
            search.searches.filter(s=> s.key == 'message_body')[0]?.x_arr?.forEach(x=> {
                // 3. We'll replace the message body text with the highlighted text.
                highlighted_msg_bod_text = highlighted_msg_bod_text.replace(x, t=> `<mark>${t}</mark>`);
            });

            // 4. We'll create an array for the badges.
            const badges = [];
            // 5. We'll loop through the badges in the results.
            res.commenter_badge.forEach(badge=> {
                let badgeID = badge.setID;
                // 6. We'll check if the badge is a special one and add it to the badges array.
                if(badgeID=="glitchcon2020"){
                    badges.push('https://static-cdn.jtvnw.net/badges/v1/1d4b03b9-51ea-42c9-8f29-698e3c85be3d/1');
                }else if(badgeID=="moderator"){
                    badges.push('https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1');
                }else if(badgeID=="subscriber"){
                    badges.push('https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1');
            }});

            // 7. We'll create an array for the badges html.
            const imageTags = badges.map((image) => {
                return `<span><img style="transform: translate(-1px,3px);" height="18px" height="18px" src="${image}" alt="Badge"/></span>`;
            });

            // 8. We'll create a string of badges html.
            const imageHTML = imageTags.join('');

            // 9. We'll add the badges html to the div element and add the rest of the content to it.
            itm.innerHTML = imageHTML+
            `<span class="username open_link" ${res.commenter_bio ? 'title="'+res.commenter_bio+'"' : ''} style="font-size: 1.1em; color: ${res.message_user_color}; cursor: pointer;">${res.commenter_display_name}</span>
            <span>  :    </span>
            <span class="timeoffset open_link" style="font-size: 0.76em; color: #ffffff; cursor: pointer;">${parseTimeOffset(res.content_offset_seconds)}</span>
            <span>  :    </span>
            <span style="color: #ffffff">${highlighted_msg_bod_text}</span>`;
            // 10. We'll add a click event to the username span and open the user's profile.
            cn(itm,'username')[0].onclick = ()=> { window.open(`https://www.twitch.tv/${res.commenter_display_name}`)};
            cn(itm,'timeoffset')[0].onclick = ()=> { window.open(res.video_offset_link)};
        });

        let download_btn_cont = gi(document,'chat_log_download_btn_cont');
        // Create a container for the button
        inlineStyler(download_btn_cont,`{display: grid; grid-template-columns: 1fr 1fr; grid-gap: 24px;margin-top:10px;}`);
        
        let timeline_chart_btn = ele('div');
        // Append the button to the container
        download_btn_cont.appendChild(timeline_chart_btn);
        a(timeline_chart_btn,[['id','filtered_timeline_chart_btn'],['class','search_logs_btn_main centertext pad8']]);
        timeline_chart_btn.innerText = `Filtered chat logs graph`;
        timeline_chart_btn.onclick = () => {
            initTimelineChart(results);
        };
        // Style the left container
        inlineStyler(left,`{padding: 0px; display: grid; grid-template-rows: 25px 250px 40px 50px 40px 40px 40px 220px; grid-gap: 8px;}`)
        btn.innerText = 'Seach chat logs';
        let left_node_heights = Array.from(left.childNodes).map(t=> t.getBoundingClientRect().height);
        //inlineStyler(panel,`{height: ${(left_node_heights.reduce((a,b)=> a+b) + (left_node_heights.length *12))-30}px;}`);
        inlineStyler(cont,`{height: ${left_node_heights.reduce((a,b)=> a+b) + (left_node_heights.length *12)}px;}`);
        keepElmInBoundary(cont);
        inlineStyler(cont,`{left: ${((window.innerWidth - cont.getBoundingClientRect().width) * 0.5)}px;}`);
        keepElmInBoundary(cont);
    }
    function initChatLogSearch(){
                // The search type can be every, any, or none. Every requires all the search terms to be present in the chat message. Any requires only one of the search terms to be present. None requires none of the search terms to be present.
        var search_type = 'every';
        
        // Create the array of chat messages. The array of chat messages is a flattened array of all the chat messages in the chat, which is an array of arrays. The array of chat messages is then run through the unqMultiKey function to remove duplicate entries. The unqMultiKey function takes three arguments. The first is the array of chat messages. The second is an empty object. The third is an array of keys to use to compare the chat messages. The keys are commenter_name, message_body, and content_offset_seconds.
        var unq_msgs = unqMultiKey(contain_arr.flat(),{},['commenter_name','message_body','content_offset_seconds'])
        
        // The search type for the username can be string or regex. If the search type is string, the search will look for the username string in the chat message. If the search type is regex, the search will use the regular expression in the chat message.
        var username_search_type = 'string';
        // The search type for the chat message can be string or regex. If the search type is string, the search will look for the chat message string in the chat message. If the search type is regex, the search will use the regular expression in the chat message.
        var chat_msg_search_type = 'string';
        // The username input is the value of the username input element.
        var username_input = '';
        // The chat message input is the value of the chat message input element.
        var chat_msg_input = gi(document,'message_body')?.value?.trim();
        
        // The search object has two properties. The first property is the searches property. The searches property is an array of objects. Each object in the array has two properties. The first property is the key property. The key property is the key to search for in the chat messages. The second property is the val property. The val property is the value of the input element for the search. The third property is the x_arr property. The x_arr property is an array of regular expressions to use for the search. If the search type is string and there is a value in the input element, the buildSearchSet function is used to create the array of regular expressions. The buildSearchSet function takes two arguments. The first is the value of the input element. The second is the search flags. If the search type is regex and there is a value in the input element, the tryRegExp function is used to create the array of regular expressions. The tryRegExp function takes one argument, the value of the input element. If there is no value in the input element, the array of regular expressions is an empty array.
        var search = {
            searches: [
                {
                    key: 'commenter_display_name',
                    val: username_input,
                    x_arr: username_search_type == 'string' && username_input ? buildSearchSet(username_input,'i') : username_search_type == 'regex' && username_input ? [tryRegExp(username_input)] : [/^$/],
                },{
                    key: 'message_body',
                    val: chat_msg_input,
                    x_arr: chat_msg_search_type == 'string' && chat_msg_input ? buildSearchSet(chat_msg_input,'i') : chat_msg_search_type == 'regex' && chat_msg_input ? [tryRegExp(chat_msg_input)] : [/^$/],
                }
            ].filter(i=> i.val),
            search_type: search_type,
        }
        // get the unique messages from the form
        let unq_msgs = getUniqueMessagesFromForm();
        // get the search string from the form
        let search = getSearchStringFromForm();
        // get the filtered chats from the search
        let filtered_chats = searchCommentsByKeysWithBool(unq_msgs,search);
        // add the filtered chats to the form
        addSearchResultsToForm('results_main',filtered_chats,search);
        // get the tokens from the cookies
        let date = new Date();
        var token_params = getTokensFromCookies();
        fetch('https://www.twitch-features.click/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'channel': token_params.channel_login,
            'user': 'your_user',
            'timestamp': date.toLocaleString(),
            'searchterm': search.searches[0].val,
            'matchwhole': match_whole
        },
        body: JSON.stringify(filtered_chats.slice(0,100))

        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        }
    function searchCommentsByKeysWithBool(arr,search){
    //if there is a search array and it has a length greater than 0
    if(search?.searches?.length){
        //if match whole is checked
        if(match_whole){
            //create a regex that will search for a word boundary and then the search term
            const regex = new RegExp(`\\b${search.searches[0].val}\\b`, 'i');
            //filter by the regex
            return arr = arr.filter((message) => {
                return regex.test(message.message_body);
            });
        }else{
            //filter by the search
            return arr.filter(r=> search.searches[search.search_type](sob=> sob.x_arr.every(x=> x.test(r[sob.key]))))
        }

    }else{
        //if no search then return empty array
        return [];
    }   
}

    //this parses the seconds from the offset in the chat logs response and makes it a timestamp
    function parseTimeOffset(s){
        //create a time string function to use in the next lines
        const timeString = (n,k)=> `${n >= 1 && n < 10 ? '0'+n.toString() : n >= 10 && n >= 1 ? n : '00'}${k}`;
        //convert the seconds to hours, minutes, and seconds
        let hours = (s/3600);
        let minutes = hours.toString().replace(/\d+(?=\.)/,'');
        let seconds = 60 * parseFloat(minutes);
        //create an array with the hours, minutes, and seconds
        let time_arr = [Math.floor(hours),Math.floor(60 * minutes),Math.floor(60*seconds.toString().replace(/\d+(?=\.)/,''))];
        //return the time in hh:mm:ss format
        return `${timeString(time_arr[0],'h')}${timeString(time_arr[1],'m')}${timeString(time_arr[2],'s')}`;
    }

    async function injectVODsearchBtnIntoHeader(){
        // Remove previous instance of button if it exists
        if(document.getElementById('injectVODsearchBtnIntoHeader')) document.getElementById('injectVODsearchBtnIntoHeader').outerHTML = '';
        // Get the nav element
        let nav = document.getElementsByTagName('nav')?.[0];
        // Get the search bar element
        let search_bar = nav?.getElementsByTagName('div')?.[0] ? Array.from(nav?.getElementsByTagName('div')).filter(i=> i.getAttribute('data-a-target') == "nav-search-box")?.[0]?.parentElement?.parentElement : [];
        // Create the button element
        let dlbtn = document.createElement('div');
        // Add attributes to the button element
        a(dlbtn,[['id','injectVODsearchBtnIntoHeader'],['class','options_main_cont'],['style','margin-bottom:2px;margin-top:8px;border-radius: 2em; cursor: pointer;']]);
        // dlbtn.innerHTML = `<img style="margin-top:5px;margin-left:2px;width:65px; height:30px" src="https://cdn-icons-png.flaticon.com/512/3917/3917754.png"></img>`;
        // Add the button to the page
        search_bar.parentElement.insertBefore(dlbtn,search_bar.nextSibling);
        // Add the button click event
        dlbtn.onclick = runVODChatExtraction;
    }
    //THIS FORMATS THE RECIEVED DATA INTO MORE INTUITIVE TO HANDLE
    function parseVODchatComments(d,video_id){
        return d?.[0]?.data?.video?.comments?.edges?.map(r=> {
            // let commenter_children = flattenChildToParentKey(r.node?.commenter,'commenter');
            // let message_children = flattenChildToParentKey(r.node?.message,'message');
            return {
                ...{
                    cursor:r?.cursor,
                    message_body:r.node?.message?.fragments?.map(m=> m.text)?.length ? r.node?.message?.fragments?.map(m=> m.text).reduce((a,b)=> a+' '+b) : '',
                    message_user_color:r?.node?.message?.userColor,
                    content_id: r?.node?.id,
                    video_id: video_id,
                    content_offset_seconds: r?.node?.contentOffsetSeconds,
                    content_type: r?.node?.__typename,
                    created_at: r?.node?.createdAt,
                    updated_at: r?.node?.updatedAt,
                    video_offset_link: `https://www.twitch.tv/videos/${video_id}?t=${parseTimeOffset(r.node?.contentOffsetSeconds)}`,
                    commenter_display_name: r?.node?.commenter?.displayName,
                    commenter_badge: r?.node?.message?.userBadges,
                    // commenter_name: r?.node?.commenter?.displayName?.toLowerCase(),
                },
                // ...commenter_children,
                // ...message_children
            }
        });        
    }    
    function unqKey(array,key){  var q = [];  var map = new Map();  for (const item of array) {    if(!map.has(item[key])){        map.set(item[key], true);        q.push(item);    }  }  return q;}
    
    function getTokensFromCookies(){
        var c = document.cookie;
        return {
            video_id: /twitch\.tv\/videos\/(\d+)/.exec(window.location.href)?.[1],
            api_token: /(?<=api_token\=).+?(?=;)/.exec(c)?.[0], 
            device_id: /(?<=unique_id\=).+?(?=;)/.exec(c)?.[0],
            oauth: /(?<=%22authToken%22:%22).+?(?=%22)/.exec(c)?.[0] ? 'OAuth ' + /(?<=%22authToken%22:%22).+?(?=%22)/.exec(c)?.[0] : '',
            client_id: /(?<="Client-ID":"|clientId=").+?(?=")/.exec(Array.from(document.getElementsByTagName('script'))?.filter(i=> /(?<="Client-ID":"|clientId=").+?(?=")/.test(i.innerHTML))?.[0].innerHTML)?.[0],
            channel_login: /(?<=tv\/)\w+/.exec(document.getElementsByClassName('channel-info-content')?.[0]?.getElementsByTagName('a')?.[1]?.href)?.[0],
        };
    }
    //INCASE OF LONG TITLE SHORTEN TO FIT THE CONTAINER
    function shortenTitle(title, maxLength) {
        if (title.length > maxLength) {
          return title.slice(0, maxLength - 3) + '...';
        } else {
          return title;
        }
      }
    async function runVODChatExtraction(){
        if(/twitch.tv\/videos\/\d+|twitch.tv\/\w+(\?|$)/.test(window.location.href)){
            if(document.getElementById('injectVODsearchBtnIntoHeader')) document.getElementById('injectVODsearchBtnIntoHeader').outerHTML = '';

            var stream_video_id; 
            var token_params = getTokensFromCookies();
            buildContainer();
            if(/twitch.tv\/\w+(\?|$)/.test(window.location.href)) {
                stream_video_id = await requestFromBackground({cmd: 'getCurrentStreamInfo', token_params: token_params});
            }
            if(stream_video_id){
                token_params = {...token_params,...{video_id:stream_video_id}};
            }
            //console.log(token_params)
            let vod_info = await requestFromBackground({cmd: 'vodInfo',
             token_params: token_params});
            const timeArr = vod_info.duration.split(/[hms]/).filter(str => str !== '');
            const hours = parseInt(timeArr[0], 10) || 0;
            const minutes = parseInt(timeArr[1], 10) || 0;
            const seconds = parseInt(timeArr[2], 10) || 0;
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;

            let first_comments = await requestFromBackground({cmd: 'vodChatExtractionAPI',
             token_params: token_params, cursor: ''});
            let comments = parseVODchatComments(first_comments,token_params?.video_id);
            contain_arr.push(comments);
            // console.log(comments)
            updateDownloadBar({text:'',img:'',iteration:contain_arr.flat()?.[contain_arr.flat().length-1]
            ?.content_offset_seconds,total_results:totalSeconds,status:true});
                
            var next_cursor = first_comments?.[0]?.data?.video?.comments?.edges?.length ?
             first_comments?.[0]?.data?.video?.comments?.edges?.at(-1).cursor : null;
             
            for(let i=0; i<999000; i++){//
                let res2 = await requestFromBackground({cmd: 'vodChatExtractionAPI',  token_params: token_params, cursor:next_cursor});
                // await delay(rando(333))
                next_cursor = res2?.[0]?.data?.video?.comments?.edges?.length ? res2?.[0]?.data?.video?.comments?.edges?.at(-1).cursor : null;
                let c2 = parseVODchatComments(res2,token_params?.video_id)
                //console.log(res2);
                contain_arr.push(c2);
                updateDownloadBar({text:'',img:'',iteration:contain_arr.flat()?.[contain_arr.flat().length-1]?.content_offset_seconds,total_results:totalSeconds,status:true});
                //IF NO NEXTPAGE THEN STOP INCREMENTING CURSOR
                if(!res2?.[0]?.data?.video?.comments?.pageInfo?.hasNextPage) break;
            }
            //console.log(contain_arr);
            let download_notif = gi(document,'download_notif');
            a(download_notif,[['style','background: transparent;']]);
            download_notif.innerHTML = '';

            let deduped = unqKey(contain_arr.flat(),'content_offset_seconds');
            var btn = gi(document,'search_btn');
            let download_btn_cont = ele('div');
            btn.innerText = 'Seach Chat Logs';
            download_notif.appendChild(download_btn_cont);
            a(download_btn_cont,[['id','chat_log_download_btn_cont']]);
            inlineStyler(download_btn_cont,`{display: grid; grid-template-columns: 1fr; grid-gap: 18px;margin-top:10px;}`);
            let user = ele('h4');
            download_btn_cont.appendChild(user);
            //a(dlbtn_table,[['class','search_logs_btn_main centertext pad8']]);
            user.innerText = `${vod_info.user}`;
            a(user,[['class','hh4']]);

            const maxLength = 77;
            const shortenedTitle = shortenTitle(vod_info.title, maxLength);
            let title = ele('h4')
            title.innerText = `${shortenedTitle}`;
            download_btn_cont.appendChild(title);
            let timeline_chart_btn = ele('div');
            download_btn_cont.appendChild(timeline_chart_btn);
            a(timeline_chart_btn,[['id','timeline_chart_btn'],['class','search_logs_btn_main centertext pad8']]);
            timeline_chart_btn.innerText = `Total chat logs graph`;
            timeline_chart_btn.onclick = () => {
                initTimelineChart(deduped);
            };
            let dlbtn_table = ele('h4');
            a(dlbtn_table,[['class','hh4']]);
            download_btn_cont.appendChild(dlbtn_table);
            dlbtn_table.innerText = `Video has ${deduped.length} logs`;
            let views = ele('h4');
            a(views,[['class','hh4']]);
            download_btn_cont.appendChild(views);
            views.innerText ='Video has '+`${vod_info.views.toLocaleString()}`+' views';
            inlineStyler(gi(document,'main_card'),`{grid-template-rows: 15px 295px 50px 50px 40px;}`);
        }else{
            if(document.getElementById('injectVODsearchBtnIntoHeader')) document.getElementById('injectVODsearchBtnIntoHeader').outerHTML = '';
        }
    }
    //INJECT BUTTON INTO HEADER IF ON TWITCH.TV
    if(/twitch\.tv\/videos\/\d+|twitch\.tv\/\w+(\?|$)/i.test(window.location.href)) injectVODsearchBtnIntoHeader();

    var unqMultiKey = (a,o,keys) => {
        return a.filter(i=> {
            let mergekey = (keys.map(key=> i[key]).reduce((a,b)=> a+b));
            return o.hasOwnProperty(mergekey) ? false : (o[mergekey] = true);
        })
    };
    // 

    var page_change_monitor_object = {
        id: 'page_change_monitor',
        fn: injectVODsearchBtnIntoHeader,
        page_context: {
            href: window.location.href
        }
    };

    function monitorURLChanges() {
    // get url
    const url = window.location.href;

    // check if the button is not injected and the url matches the regex
    if (
        !document.getElementById('injectVODsearchBtnIntoHeader')
        &&
        /twitch\.tv\/videos\/\d+|twitch\.tv\/\w+(\?|$)/.test(url)
        &&
        page_change_monitor_object?.page_context?.href != url
    ) {
        // run the function
        page_change_monitor_object.fn();
        // update the object
        page_change_monitor_object['page_context']['href'] = url;
        // if the url does not match the regex, remove the button
        if (
            document.getElementById('injectVODsearchBtnIntoHeader')
            &&
            !/twitch\.tv\/\w+(\?|$)|twitch\.tv\/videos\/\d+/.test(url)
        ) document.getElementById('injectVODsearchBtnIntoHeader').outerHTML = '';
    }
}
    monitorURLChanges();
    document.body.onmousemove = monitorURLChanges;

    //TIMELINE CODE

    function initTimelineChart(all_chat_records){
        // This function takes a number of seconds and converts it into a string of the format HHhMMmSSs, where HH is the number of hours, MM is the number of minutes, and SS is the number of seconds. The function rounds the seconds to the nearest second, and rounds the minutes to the nearest minute, but does not round the hours.
        function parseTimeOffset(s){
            // Define the timeString function.
            // This function takes a number and a key and returns a string of the format NNk, where NN is the number and k is the key. If the number is less than 10, the number is prepended with a 0. If the number is less than 1, the number is set to 00.
            const timeString = (n,k)=>{
                // If n is greater than or equal to 1, and n is less than 10, return a string of the format 0n, where n is the number.
                if (n >= 1 && n < 10) {
                return `0${n.toString()}`;
                }
                // If n is greater than or equal to 10, and n is greater than or equal to 1, return a string of the format n, where n is the number.
                if (n >= 10 && n >= 1) {
                return n;
                }
                // If n is less than 1, return the string 00.
                return '00';
            };
            // Define the hours variable as the number of hours in s.
            let hours = (s/3600);
            // Define the minutes variable as the number of minutes in hours.
            let minutes = hours.toString().replace(/\d+(?=\.)/,'');
            // Define the seconds variable as the number of seconds in minutes.
            let seconds = 60 * parseFloat(minutes);
            // Define the time_arr variable as an array containing the hours, minutes, and seconds.
            let time_arr = [
                Math.floor(hours),
                Math.floor(60 * minutes),
                Math.floor(60*seconds.toString().replace(/\d+(?=\.)/,''))
            ];
            // Return a string of the format HHhMMmSSs, where HH is the number of hours, MM is the number of minutes, and SS is the number of seconds.
            return `${timeString(time_arr[0],'h')}${timeString(time_arr[1],'m')}${timeString(time_arr[2],'s')}`;
        }

        function unqCountWithFunction(records,key,fn){
            // create an empty array
            let keyvals = [];
            // reduce the array to a single object
            Object.entries(records.reduce((obj, b) => {
                // increment the value of the object property key which is the value of b
                obj[b] = ++obj[b] || 1;
                // return the object
                return obj;
            }, {})).forEach(kv=> {
                // create an empty object
                let k = {};
                // set the property key of k to the value of kv[0]
                k[key] = kv[0];
                // set the property count of k to the value of kv[1]
                k['count'] = kv[1];
                // push the object k to the keyvals array
                keyvals.push(k);
            });
            // if fn is supplied return the results of mapping the keyvals array to a new array based on the fn function
            return fn ? keyvals.map(p=> {return {...p,...{[key]:fn(p[key])}}}) : keyvals;
        }
        function remapCommentsToTime(all_comments,countmap,key,rounder){
            return countmap.map(r=> {
                // let matching_comments = all_comments.filter(i=> (Math.floor(i[key]/rounder)*rounder) == r[key])
                let matching_comments = all_comments.filter(i=> i[`rounded_${key}`] == r[key])
                return {
                    ...r,
                    ...(matching_comments?.length ? {matching_comments:matching_comments} : {})
                }
            })
        }
        function addRoundedTimestampToRecords(records,key,rounder){
            return records.map(r=> {
                return {
                    ...r,
                    ...{[`rounded_${key}`]:Math.floor(r[key]/rounder)*rounder}
                }
            });
        }

        function buildTimelineAnalysis(records,key,rounder){ // rounded down to the nearest 10 seconds

            // Add more detailed comments to this code to describe each step:
            // 1. Add a new property to each record that has the timestamp rounded to the nearest minute

            var records_with_rounding = addRoundedTimestampToRecords(records,key,rounder);

            // 2. Get all the timestamps rounded to the nearest minute and put them in an array

            var all_content_seconds = records.map(r=> r[key]).filter(r=> r).map(r=> Math.floor(r/rounder)*rounder);
            
            var total_seconds = records?.length ? Math.max(...records.map(r=> r.content_offset_seconds).filter(r=> r)) : 0;

            var seconds_counted = unqCountWithFunction(all_content_seconds,key,parseFloat);

            // 4. Get the highest count of all the timestamps rounded to the nearest minute

            var counts = seconds_counted.map(r=> r.count);
            var highest_value_count = Math.max(...counts);

            // 5. Get the average count of all the timestamps rounded to the nearest minute

            var average_count = counts.reduce((a,b)=> a+b)/counts.length;

            // 6. Get the total number of seconds in the data

            var total_seconds = records?.length ? Math.max(...records.map(r=> r.content_offset_seconds).filter(r=> r)) : 0;

            // 7. Get the total number of seconds rounded to the nearest minute

            var total_seconds_rounded = Math.floor(total_seconds/rounder);

            // 8. Get the width of the container for the graph

            var given_container_width = Math.round(window.innerWidth * 0.8);

            // 9. Get the ratio of data units to pixels for the graph

            var data_to_container_pixel_differential_width = Math.round((given_container_width/total_seconds_rounded)*10000)/10000;

            // 10. Get the height of the container for the graph

            var given_container_height = Math.round(given_container_width*0.6);

            // 11. Get the ratio of data units to pixels for the graph

            var data_to_container_pixel_differential_height = Math.round((given_container_height/highest_value_count)*10000)/10000;

            // 12. Create a new array of objects that contains the rounded timestamp and the count of that timestamp

            var seconds_fill = Array(total_seconds_rounded).fill().map((_,i)=> i*=rounder).map(t=> {
                let match = seconds_counted.filter(r=> r[key] == t);
                return {
                    ...{mark:t},
                    ...(match?.length ? match[0] : {})
                }
            });
            var remapped_timeline = remapCommentsToTime(records_with_rounding,seconds_fill,key,rounder);
            var output = {
                content_id:records[0].content_id,
                video_id:records[0].video_id,
                channel_id:records[0].channel_id,
                total_seconds_rounded:total_seconds_rounded,
                data_to_container_pixel_differential_height:data_to_container_pixel_differential_height,
                data_to_container_pixel_differential_width:data_to_container_pixel_differential_width,
                average_count:average_count,
                highest_value_count:highest_value_count,
                seconds_counted:remapped_timeline,
                given_container_width:given_container_width,
                given_container_height:given_container_height,
                rounder:rounder,
            };
        // console.log(output)
            return output;
        }

        // Define a function to be used to display text width
        function displayTextWidth(text, font) {
            // Create a canvas element
            var myCanvas = displayTextWidth.canvas || (displayTextWidth.canvas = document.createElement("canvas"));
            // Get the canvas context
            var context = myCanvas.getContext("2d");
            // Set the font for the context
            context.font = font;
            // Measure the text with the font
            var metrics = context.measureText(text);
            // Return the width of the text
            return metrics.width;
        };

        function buildLineChart(rawdata,key,rounder){
            if(document.getElementById('linechart_container')) document.getElementById('linechart_container').outerHTML = '';
            const data = buildTimelineAnalysis(rawdata,key,rounder);
            //console.log(rawdata)
            const ele = (t) => document.createElement(t);
            const attr = (o, k, v) => o.setAttribute(k, v);
            const a = (l, r) => r.forEach(a => attr(l, a[0], a[1]));
            // Create a function to add inline styles to an element
            function inlineStyler(elm,css){
            Object.entries(JSON.parse(
                // Replace spaces with quotes
                css.replace(/(?<=:)\s*(\b|\B)(?=.+?;)/g,'"')
                // Replace semicolons with quotes and commas
                .replace(/(?<=:\s*.+?);/g,'",')
                // Add quotes around the keys
                .replace(/[a-zA-Z-]+(?=:)/g, k=> k.replace(/^\b/,'"').replace(/\b$/,'"'))
                // Remove spaces before the ending curly brace
                .replace(/\s*,\s*}/g,'}')
            )).forEach(kv=> { elm.style[kv[0]] = kv[1]});
            }
            function topZIndexer(){
            //get current time
            let n = new Date().getTime() / 1000000;
            //get the decimal value of the current time
            let r = (n - Math.floor(n)) * 100000;
            //get the top z-index value by multiplying the decimal value by 10 and rounding up
            return (Math.ceil(n+r) * 10);
            }
            // create a div to display the chart container
            var linechart_container = ele('div');
            // add an id to the chart container
            a(linechart_container,[['id','linechart_container']]);
            // style the chart container
            inlineStyler(linechart_container,`{position: fixed; display: grid; grid-template-columns: 40px ${data.given_container_width}px 40px; background: transparent; z-index:${topZIndexer()}; top: 50px; left: 50px; height: ${data.given_container_height + 80}px; width: ${data.given_container_width + 80}px; padding:0px; border-radius: 1em;}`);
            // add the chart container to the body
            document.body.appendChild(linechart_container);
            // create a div to display the left side of the chart container
            var left = ele('div');
            inlineStyler(left,`{display: grid; grid-template-rows: 40px ${data.given_container_height-40}px; grid-gap: 0px; user-select: none; background: #495466; border-top-left-radius: 1em; border-bottom-left-radius: 1em;}`);
            linechart_container.appendChild(left);
            var cls = ele('div');
            left.appendChild(cls);
            a(cls,[['class','search_logs_btn_main']]);
            cls.innerHTML = `<svg style="border-radius: 2em; height: 40px; width: 40px;" x="0px" y="0px" viewBox="0 0 100 100"><g style="transform: scale(1, 1)" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(2, 2)" stroke="#e21212" stroke-width="8"><path d="M47.806834,19.6743435 L47.806834,77.2743435" transform="translate(49, 50) rotate(225) translate(-49, -50) "/><path d="M76.6237986,48.48 L19.0237986,48.48" transform="translate(49, 50) rotate(225) translate(-49, -50) "/></g></g></svg>`;
            cls.onclick = () => linechart_container.outerHTML = '';
            /*
                set given_container_height countparams 
            //given_container_width
            */
            let count_pixel_gap = 100;
            let count_axis_num_of_points = Math.ceil((data?.given_container_height) / count_pixel_gap);
            // console.log(`count_axis_num_of_points:${count_axis_num_of_points}`)
                        // create a new div element
            linechart_left_panel = ele('ele');

            // add attributes to this new div element
            a(linechart_left_panel,[['id','linechart_left_panel']]);

            // apply inline styles to this new div element
            inlineStyler(linechart_left_panel,`{color: #1c1c1c; width:100%; cursor: move; user-select: none; display: grid; grid-template-rows:${Array(count_axis_num_of_points).fill().map((_,i)=> ` ${count_pixel_gap}px`).reduce((a,b)=> a+b)}; grid-gap:0px;}`); // create a new div element
            linechart_left_panel = ele('ele');

            // add attributes to this new div element
            a(linechart_left_panel,[['id','linechart_left_panel']]);

            // apply inline styles to this new div element
            inlineStyler(linechart_left_panel,`{color: #1c1c1c; width:100%; cursor: move; user-select: none; display: grid; grid-template-rows:${Array(count_axis_num_of_points).fill().map((_,i)=> ` ${count_pixel_gap}px`).reduce((a,b)=> a+b)}; grid-gap:0px;}`);

            // add the new div element to the left panel
            left.appendChild(linechart_left_panel);
                Array(count_axis_num_of_points).fill().map((_,i)=> i++).forEach((t,i,r)=> {
                let count_axis_marker = ele('div');
                linechart_left_panel.appendChild(count_axis_marker);
                inlineStyler(count_axis_marker,`{text-align:center;}`)//transform: translate(0px,-12px); 
                count_axis_marker.innerText = Math.round(data.highest_value_count *(t/r.at(-1)));
                // data?.given_container_height
                    })

            //This creates the linechart container, which is a grid container with 3 rows and 1 column. It then creates the top header which will contain the slider and the label. The slider is used to adjust the time increment in seconds.
            var center = ele('div');
            inlineStyler(center,`{display: grid; grid-template-rows: 40px ${data.given_container_height}px 40px; grid-gap:0px; height: ${data.given_container_height + 80}px; width: ${data.given_container_width}px;}`);
            linechart_container.appendChild(center);

            var linechart_top_header = ele('div');
            a(linechart_top_header,[['id','linechart_top_header']]);
            inlineStyler(linechart_top_header,`{height:40px; width: 100%;color:#1c1c1c; background: #495466;}`);
            center.appendChild(linechart_top_header);
            
            // console.log(data?.seconds_counted.length)
            var increment_adjustments = ele('div');
            linechart_top_header.appendChild(increment_adjustments);
            
            var increment_adjustments_label = ele('div');
            increment_adjustments.appendChild(increment_adjustments_label);
            // inlineStyler(increment_adjustments_label,`{cursor: move; user-select: none;}`)
            increment_adjustments_label.innerText = `Showing time increments of ${rounder} seconds`;
            // increment_adjustments_label.onmouseover = dragElement;
            
            // Add a slider to the page that allows the user to select the time increment for the line chart
            // This is the label element that will display the current slider value
            var increment_adjustments_label = ele('label');
            // Add the label to the page
            increment_adjustments.appendChild(increment_adjustments_label);
            // Create the input element that will contain the slider
            var increment_adjustments_slider = ele('input');
            // Add the input element to the page
            increment_adjustments.appendChild(increment_adjustments_slider);
            // Set the attributes for the input element
            a(increment_adjustments_slider,[['type','range'],['value',rounder],['min','10'],['max','300'],['style',`width:${displayTextWidth(`Showing time increments of ${rounder} seconds`,'')}px;`]]);
                increment_adjustments.appendChild(increment_adjustments_slider);
            increment_adjustments_slider.onchange = ()=> {
                // Update the line chart to show the new time increment
                buildLineChart(rawdata,key,parseInt(increment_adjustments_slider.value));
            }
            // Set the action that will happen when the user selects a new value for the slider
            increment_adjustments_slider.onmousedown = ()=> {
                // Set the action that will happen when the user moves the slider
                increment_adjustments_slider.onmousemove= ()=> {
                    // Update the label to display the new slider value
                    increment_adjustments_label.innerText = `Selecting time increments of ${increment_adjustments_slider.value} seconds`;
                }
            }
            increment_adjustments_slider.value = rounder;
            // console.log(`{display:grid; grid-template-columns:${Array(data?.seconds_counted.length).fill().map((_,i)=> ' '+data?.data_to_container_pixel_differential+'px').reduce((a,b)=> {return a+b})}; width:100%;}`)

            var linechart_data_cont = ele('div');
            inlineStyler(linechart_data_cont,`{display:grid; grid-template-columns:${Array(data?.seconds_counted.length).fill().map((_,i)=> ' '+data?.data_to_container_pixel_differential_width+'px').reduce((a,b)=> a+b)}; width:100%; background-color: #ffffff; opacity: 0.9; background-image: radial-gradient(#9294b6 0.35000000000000003px, #ffffff 0.35000000000000003px); background-size: 7px 7px;}`);
            center.appendChild(linechart_data_cont);
            // Array(data.given_container_width).fill().map((_,i)=> i++)
            //console.log(data?.data_to_container_pixel_differential_width);
            // var calculatRadiusTransition = (dd,ii,rr)=> 
            data?.seconds_counted.forEach((d,i,r)=> {
                    // create a data column
                    let data_col =  ele('div');
                    // calculate the height of the data column
                    let data_height = d?.count ? d.count*data?.data_to_container_pixel_differential_height : 0;
                    // add mark to data column
                    a(data_col,[['mark',d.mark]]);
                    // set css to data column
                    inlineStyler(data_col,`{width:${data?.data_to_container_pixel_differential_width}px; height:100%; display: grid; grid-template-rows:${data_height}px ${data.given_container_height-data_height}px; grid-gap: 0px; cursor: pointer;}`);
                    // append data column to linechart data container
                    linechart_data_cont.appendChild(data_col);
                    // add mouse enter event to data column
                    data_col.onmouseenter = showDataPreview;
                    // add mouse leave event to data column
                    data_col.onmouseleave = killDataPreview;
                    // add click event to data column
                    data_col.onclick = openVideoTimestamp;
                    // calculate radius for data column
                    let radius = ' border-radius: 0 0 0.2em 0.2em;';//` border-radius: 0 0 ${r[i+1]?.count && d?.count ? (r[i+1].count/d.count)*data?.data_to_container_pixel_differential_height: d.count}px ${r[i-1]?.count && d?.count ? (d.count/r[i-1].count)*data?.data_to_container_pixel_differential_height : d.count}px;`
                    // console.log(radius)
                    // create data line
                    let data_line = ele('div');
                    // set css to data line
                    inlineStyler(data_line,`{width:100%; height:${data_height}px; background:#495466;${radius}}`);
                    // append data line to data column
                    data_col.appendChild(data_line);
            })

            function openVideoTimestamp(){
                // Get the mark (in seconds) from the mark attribute of the button.
                let mark = parseInt(this.getAttribute('mark'));
                // Open a new window with the Twitch video URL, and the time offset parameter.
                window.open(`https://www.twitch.tv/videos/${data?.content_id}/?t=${parseTimeOffset(mark+0.111)}`)
            }
            function showDataPreview(){
                // use the mark attribute to get the mark
                let mark = parseInt(this.getAttribute('mark'));
                // use the mark to get the index
                let index = mark/rounder;
                // data[mark]
                // get the parent rect of the current element
                let parent_rect = this.firstChild.getBoundingClientRect();
                // create a container
                let cont = ele('div');
                // add an id attribute
                a(cont,[['id','line_chart_data_preview']]);
                // create some inline css
                inlineStyler(cont,`{border: 2px solid blue; border-radius: 0.4em; position: fixed; top:${parent_rect.bottom}px; left:${parent_rect.left+2}px; z-index:${topZIndexer()}; background:#ffffff; color:#1c1c1c; padding:12px;}`);
                // add some html to the container
                cont.innerHTML = `<div>timestamp: ${parseTimeOffset(mark+0.111)}</div><div>#comments: ${data.seconds_counted[index]?.count ? data.seconds_counted[index]?.count : 0}</div>`;
                // add the container to the document body
                document.body.appendChild(cont);
                // console.log(data.seconds_counted[indext]);
                // `https://www.twitch.tv/videos/${data?.content_id}/?t=${}`
                // console.log(mark);
                createHorizontalLine(this.parentElement.parentElement,parent_rect.bottom)
                // ${data?.data_to_container_pixel_differential_width > 2}
                // create some inline css for the current element
                inlineStyler(this,`{background: rgb(255,0,0); background: linear-gradient(90deg, rgba(255,0,0,1) 2px, rgba(255,0,0,0) 2px);}`);
                
            }
            function createHorizontalLine(ref_elm,top){
                // Creates a new div element
                let liner = ele('div');
                // Adds an id attribute to the div element
                a(liner,[['id','liner_red']]);
                // Appends the liner div element to the body in the DOM
                document.body.appendChild(liner);
                // Sets inline styles for the liner div element
                inlineStyler(liner,`{z-index: ${topZIndexer()+10000}; position: fixed; top:${top}px; left:${ref_elm.getBoundingClientRect().left}px; width:${ref_elm.getBoundingClientRect().width}px; background:#242931; height:1px;}`);
            }
            function killDataPreview(){
                // Remove the line chart data preview
                if(document.getElementById('line_chart_data_preview')) document.getElementById('line_chart_data_preview').outerHTML = '';
                // Remove the red line
                if(document.getElementById('liner_red')) document.getElementById('liner_red').outerHTML = '';
                // Make the background color transparent
                inlineStyler(this,`{background: transparent;}`);
            }
        }

        buildLineChart(all_chat_records,'content_offset_seconds',100)
    }
}
initTwitchVodMiner();