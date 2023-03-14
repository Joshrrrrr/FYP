let isFirefox = typeof browser !== "undefined";
let _browser = isFirefox ? browser : chrome;

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
            let btn = document.querySelector('.content-overlay-gate__allow-pointers button');
            if (btn) {
                btn.click();
                isMainPlayerError = false;
                setTimeout(function (){
                    let t_player = document.querySelector(".video-player").querySelector('video');
                    if (t_player) {
                        t_player.play();
                        setTimeout(function () {
                            fastForwardFuncExec();
                        }, 100);
                    }
                }, 2000);
                setTimeout(function (){
                    checkForAutoRefresh();
                }, 10000);
            } else{
                isMainPlayerError = true;
            }
    }
    function fastForwardFuncExec() {
        try {
            let video = document.querySelector('video');
            video.currentTime = video.buffered.end(video.buffered.length - 1);
        } catch (e) {

        }
    }
    function checkForAutoRefresh() {
        let el = document.querySelector('p[data-test-selector="content-overlay-gate__text"]');
        if (el) {
            if (['1000','2000','3000','4000'].some(x => el.innerText.indexOf(x) >= 0)) {
                refreshPageOnMainTwitchPlayerError();
            }
        } else {
            listenForPlayerError();
        }
    }

    function listenForPlayerError() {
        try{
            let t_player = document.querySelector(".video-player").querySelector('video');
            if (t_player.attributes.tp_abort_listener) {
                return;
            }

            t_player.addEventListener('abort', (event) => {
                if (options.isErrRefreshEnabled) {
                    setTimeout(function (){
                        checkForAutoRefresh();
                    },100)
                }
            });
            t_player.setAttribute('tp_abort_listener', 'true');
        } catch (e) {

        }
    }
    
    function clickChannelPointsBtn() {
        let btn = document.querySelector('.claimable-bonus__icon');
        if (btn) {
            btn.click();
        }
    }

    function setChannelPointsClickerListeners(channelPointsClickerInterval) {
        if (!channelPointsClickerInterval) {
            console.log('yes')
            clickChannelPointsBtn();
            channelPointsClickerInterval = setInterval(function() {
                clickChannelPointsBtn();
            }, 15000);
        }
    }
    var contain_arr = [];
    var parseStringAsXset = (s) => s.split(/\s+\band\b\s+|(?<!\s+and\b)\s+\(|\)\s+(?!\band\b)/i)
        .map(el=> 
            el.split(/\s+\bor\b\s+/i).map(ii=> 
                ii.replace(/\s*\)\s*/g,'')
                .replace(/\s*\(\s*/g,'')
                .replace(/\s+/g,'.{0,3}')
                .replace(/"/g,'\\b')
                .replace(/\*\*\*/g,'.{0,60}')
                .replace(/\*/g,'.{0,1}'))
                    .reduce((a,b)=> a+'|'+b)).filter(el=> el).map(r=> r.replace(/\+/g,'\\+'));

    function permutateNear(input,joiner){
    var nearx = /(?<=\||^)\S+?(?=\||$)/g;
    var base = input.replace(nearx, '').replace(/[\|]+/g, '|');
    var near_or = input.match(nearx) ? input.match(nearx).map(str=> {
        var arr = str.split(/~/);
        if(arr.length > 5){
        return str.replace(/[~]+/,'.');
        }else{
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
    return base + near_or;
    }

    function buildSearchSet(str,flags){
        if(str){
            var set = parseStringAsXset(str);
            var xset = set.map(r=> permutateNear(r,'.{0,49}')).map(r=> tryRegExp(r.replace(/^\||\|$/g,''),flags));
            return xset;
        }else{return null}
    }

    function tryRegExp(s,f){
        try{return new RegExp(s,f)}
        catch(err){return false}
    }
    //FUNCTIONAL ONE-LINERS
    const cn = (o, s) => o ? o.getElementsByClassName(s) : null;
    const gi = (o, s) => o ? o.getElementById(s) : null;
    const ele = (t) => document.createElement(t);
    const attr = (o, k, v) => {try{o.setAttribute(k, v);} catch(err) {console.log(err)}};
    const a = (l, r) => r.forEach(a => attr(l, a[0], a[1]));

    function inlineStyler(elm,css){
    Object.entries(JSON.parse(
    css.replace(/(?<=:)\s*(\b|\B)(?=.+?;)/g,'"')
        .replace(/(?<=:\s*.+?);/g,'",')
        .replace(/[a-zA-Z-]+(?=:)/g, k=> k.replace(/^\b/,'"').replace(/\b$/,'"'))
        .replace(/\s*,\s*}/g,'}')
    )).forEach(kv=> { elm.style[kv[0]] = kv[1]});
    }
    //GENERATES Z INDEX RANDOM FOR THE CONTAINER TO BE LAYERED ON TOP OF THE DOCUMENT BODY Z
    function topZIndexer(){
        let n = new Date().getTime() / 100000;
        let r = (n - Math.floor(n)) * 1000;
        return Math.round(n+r);
    }

    function createDownloadHTML() {
        const body_width = document.body.getBoundingClientRect().width;
        const download_bar_width = body_width * 0.98;
        let cont = gi(document,'download_notif');
        a(cont, [['id', 'download_notif'], ['style', `background: #242931; border: 2px solid #242931; border-radius: 0.2em;`]]);
        let perc = ele('div');
        a(perc, [['id', 'percentage_bar'],['class','options_main_cont'], ['style', `width: 0px; height: 36px; border-bottom-right-radius: 0.2em; border-top-right-radius: 0.2em; transition: all 1s;`]]);
        cont.appendChild(perc);
        let txt = ele('div');
        a(txt, [['id', 'percentage_txt'], ['style', `color: #ffffff; width: 300px;`]]);
        perc.appendChild(txt);
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
        if(gi(document,`${style_id}_style`)) gi(document,`${style_id}_style`).outerHTML = '';
        let csselm = ele('style');
        a(csselm,[['class',`${style_id}_style`]]);
        document.head.appendChild(csselm);
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
                box-shadow: rgba(136, 165, 191, 0.48) 6px 2px 6px 0px, rgba(255, 255, 255, 0.8) -6px -2px 6px -3px;
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

        inlineStyler(cont,`{display: grid; grid-template-columns: 582px; text-align: center; height: ${height}px; max-width: ${width}px; background: #495466; color: #000000; border-radius: 1em; padding: 12px; transition: all 111ms; position: fixed; z-index: ${topZIndexer()};}`);
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
        a(chat_msg,[['id','message_body'],['placeholder','Keyword in chat'],['class','textarea pad12']]);
        chat_msg.style.width='90%';
        chat_msg_cont.appendChild(chat_msg);
        chat_msg.onkeyup = (e)=> {
            console.log(e.key)
            if(e.key == "Enter"){
                initChatLogSearch();
            }
        };

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
    function keepElmInBoundary(elm){ 
        if(elm.getBoundingClientRect().right >= window.innerWidth){
            inlineStyler(elm,`{left: ${(window.innerWidth - (elm.getBoundingClientRect().width+30))}px;}`);
        }
        if(elm.getBoundingClientRect().bottom >= window.innerHeight){
            // inlineStyler(elm,`{top: ${(window.innerHeight - (elm.getBoundingClientRect().height+260))}px;}`);
            inlineStyler(elm,`{top: 50px;}`);

        }
    }
    function addSearchResultsToForm(elm_id, results,search){       
        if(gi(document,'filtered_download')) gi(document,'filtered_download').outerHTML = '';
        // if(gi(document,'timeline_chart_btn')) gi(document,'timeline_chart_btn').outerHTML = '';
        if(gi(document,'filtered_timeline_chart_btn')) gi(document,'filtered_timeline_chart_btn').outerHTML = '';
        
        var cont = cn(document,'main_info_card')?.[0];
        var left = gi(document,'main_card');
        var vodres = gi(document,elm_id);
        var btn = gi(document,'search_btn');
        inlineStyler(vodres,`{padding: 4px;}`);
        vodres.innerHTML = '';
// console.log(results);

        results.forEach(res=> {
            let itm = ele('div');
            vodres.appendChild(itm);
            let highlighted_msg_bod_text = res.message_body;

            search.searches.filter(s=> s.key == 'message_body')[0]?.x_arr?.forEach(x=> {
                highlighted_msg_bod_text = highlighted_msg_bod_text.replace(x, t=> `<mark>${t}</mark>`);
            });
            const badges = [];
            res.commenter_badge.forEach(badge=> {
                let badgeID = badge.setID;
                if(badgeID=="glitchcon2020"){
                    badges.push('https://static-cdn.jtvnw.net/badges/v1/1d4b03b9-51ea-42c9-8f29-698e3c85be3d/1');
                }else if(badgeID=="moderator"){
                    badges.push('https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1');
                }else if(badgeID=="subscriber"){
                    badges.push('https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1');
            }});
            const imageTags = badges.map((image) => {
                return `<span><img style="transform: translate(-1px,3px);" height="18px" height="18px" src="${image}" alt="Badge"/></span>`;
            });
            const imageHTML = imageTags.join('');
            
            itm.innerHTML = imageHTML+
            `<span class="username open_link" ${res.commenter_bio ? 'title="'+res.commenter_bio+'"' : ''} style="font-size: 1.1em; color: ${res.message_user_color}; cursor: pointer;">${res.commenter_display_name}</span>
            <span>  :    </span>
            <span class="timeoffset open_link" style="font-size: 0.76em; color: #ffffff; cursor: pointer;">${parseTimeOffset(res.content_offset_seconds)}</span>
            <span>  :    </span>
            <span style="color: #ffffff">${highlighted_msg_bod_text}</span>`;
            cn(itm,'username')[0].onclick = ()=> { window.open(`https://www.twitch.tv/${res.commenter_display_name}`)};
            cn(itm,'timeoffset')[0].onclick = ()=> { window.open(res.video_offset_link)};
        });
        let download_btn_cont = gi(document,'chat_log_download_btn_cont');
        inlineStyler(download_btn_cont,`{display: grid; grid-template-columns: 1fr 1fr; grid-gap: 24px;margin-top:10px;}`);
        
        let timeline_chart_btn = ele('div');
        download_btn_cont.appendChild(timeline_chart_btn);
        a(timeline_chart_btn,[['id','filtered_timeline_chart_btn'],['class','search_logs_btn_main centertext pad8']]);
        timeline_chart_btn.innerText = `Filtered chat logs graph`;
        timeline_chart_btn.onclick = () => {
            initTimelineChart(results);
        };
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
        var search_type = 'every';
        //THIS IS ALL THE CHAT LOGS DOWNLOADED IN ONE ARRAY
        var unq_msgs = unqMultiKey(contain_arr.flat(),{},['commenter_name','message_body','content_offset_seconds'])
        var username_search_type = 'string';
        var chat_msg_search_type = 'string';
        var username_input = '';
        var chat_msg_input = gi(document,'message_body')?.value?.trim();
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
        let filtered_chats = searchCommentsByKeysWithBool(unq_msgs,search);
        addSearchResultsToForm('results_main',filtered_chats,search);
        let date = new Date();
        var token_params = getTokensFromCookies();
        fetch('http://localhost:3000/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'channel': token_params.channel_login,
            'user': 'your_user',
            'timestamp': date.toLocaleString(),
            'searchterm': search.searches[0].val
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
        if(search?.searches?.length){
            arr.filter(r=> search.searches[search.search_type](sob=> sob.x_arr.every(x=> x.test(r[sob.key]))))
            const regex = new RegExp(`\\b${search.searches[0].val}\\b`, 'i');
            const filteredMessages  = arr.filter((message) => {
                console.log(message)
                return regex.test(message.message_body);
              });
            return filteredMessages;
        }else{
            return [];
        }   
    }

    //THIS PARSES THE SECONDS FROM THE OFFSET IN THE CHAT LOGS RESPONSE AND MAKES IT A TIMESTAMP
    function parseTimeOffset(s){
        const timeString = (n,k)=> `${n >= 1 && n < 10 ? '0'+n.toString() : n >= 10 && n >= 1 ? n : '00'}${k}`;
        let hours = (s/3600);
        let minutes = hours.toString().replace(/\d+(?=\.)/,'');
        let seconds = 60 * parseFloat(minutes);
        let time_arr = [Math.floor(hours),Math.floor(60 * minutes),Math.floor(60*seconds.toString().replace(/\d+(?=\.)/,''))];
        return `${timeString(time_arr[0],'h')}${timeString(time_arr[1],'m')}${timeString(time_arr[2],'s')}`;
    }

    async function injectVODsearchBtnIntoHeader(){
        if(document.getElementById('injectVODsearchBtnIntoHeader')) document.getElementById('injectVODsearchBtnIntoHeader').outerHTML = '';
        let nav = document.getElementsByTagName('nav')?.[0];
        let search_bar = nav?.getElementsByTagName('div')?.[0] ? Array.from(nav?.getElementsByTagName('div')).filter(i=> i.getAttribute('data-a-target') == "nav-search-box")?.[0]?.parentElement?.parentElement : [];
        let dlbtn = document.createElement('div');
        a(dlbtn,[['id','injectVODsearchBtnIntoHeader'],['class','options_main_cont'],['style','margin-bottom:2px;margin-top:8px;border-radius: 2em; cursor: pointer;']]);
        // a(dlbtn,[['id','injectVODsearchBtnIntoHeader'],['class','options_main_cont'],['style',`position: fixed; top: 20px; border-radius: 0.4em; height: 38px; transform: translate(0px, 5px); cursor: pointer; z-index: ${topZIndexer()};`]]);
        dlbtn.innerHTML = `<img style="margin-top:5px;margin-left:2px;width:65px; height:30px" src="https://cdn-icons-png.flaticon.com/512/3917/3917754.png"></img>`;
        search_bar.parentElement.insertBefore(dlbtn,search_bar.nextSibling);
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
            let vod_info = await requestFromBackground({cmd: 'vodInfo', token_params: token_params});
            const timeArr = vod_info.duration.split(/[hms]/).filter(str => str !== '');
            const hours = parseInt(timeArr[0], 10) || 0;
            const minutes = parseInt(timeArr[1], 10) || 0;
            const seconds = parseInt(timeArr[2], 10) || 0;
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;

            let first_comments = await requestFromBackground({cmd: 'vodChatExtractionAPI',  token_params: token_params, cursor: ''});
            let comments = parseVODchatComments(first_comments,token_params?.video_id);
            contain_arr.push(comments);
            // console.log(comments)
            updateDownloadBar({text:'',img:'',iteration:contain_arr.flat()?.[contain_arr.flat().length-1]?.content_offset_seconds,total_results:totalSeconds,status:true});
            var next_cursor = first_comments?.[0]?.data?.video?.comments?.edges?.length ? first_comments?.[0]?.data?.video?.comments?.edges?.at(-1).cursor : null;
            for(let i=0; i<999000; i++){//
                // console.log(next_cursor);
                // console.log(unqKey(contain_arr.flat(),'content_id'))
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

            const maxLength = 70;
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
            inlineStyler(gi(document,'main_card'),`{grid-template-rows: 5px 295px 50px 50px 40px;}`);
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

    function monitorURLChanges(){
        const url = window.location.href;
        if(
            !document.getElementById('injectVODsearchBtnIntoHeader') 
            && 
            /twitch\.tv\/videos\/\d+|twitch\.tv\/\w+(\?|$)/.test(url)
            && 
            page_change_monitor_object?.page_context?.href != url
        ) {
            page_change_monitor_object.fn();
            page_change_monitor_object['page_context']['href'] = url;
            if(
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
        function parseTimeOffset(s){
            const timeString = (n,k)=> `${n >= 1 && n < 10 ? '0'+n.toString() : n >= 10 && n >= 1 ? n : '00'}${k}`;
            let hours = (s/3600);
            let minutes = hours.toString().replace(/\d+(?=\.)/,'');
            let seconds = 60 * parseFloat(minutes);
            let time_arr = [
                Math.floor(hours),
                Math.floor(60 * minutes),
                Math.floor(60*seconds.toString().replace(/\d+(?=\.)/,''))
            ];
            return `${timeString(time_arr[0],'h')}${timeString(time_arr[1],'m')}${timeString(time_arr[2],'s')}`;
        }


        function unqCountWithFunction(records,key,fn){
            let keyvals = [];
            Object.entries(records.reduce((obj, b) => {
                obj[b] = ++obj[b] || 1;
                return obj;
            }, {})).forEach(kv=> {
                let k = {};
                k[key] = kv[0];
                k['count'] = kv[1];
                keyvals.push(k);
            });
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

        function buildTimelineAnalysis(records,key,rounder){ /* rounded down to the nearest 10 seconds */

            var records_with_rounding = addRoundedTimestampToRecords(records,key,rounder);

            var all_content_seconds = records.map(r=> r[key]).filter(r=> r).map(r=> Math.floor(r/rounder)*rounder);
            // var unq_content_seconds = unqHsh(all_content_seconds,{});
            
            var total_seconds = records?.length ? Math.max(...records.map(r=> r.content_offset_seconds).filter(r=> r)) : 0;

            var seconds_counted = unqCountWithFunction(all_content_seconds,key,parseFloat);
            
            var counts = seconds_counted.map(r=> r.count);
            var highest_value_count = Math.max(...counts);
            var average_count = counts.reduce((a,b)=> a+b)/counts.length;
            var total_seconds_rounded = Math.floor(total_seconds/rounder);

            var given_container_width = Math.round(window.innerWidth * 0.8);
            var data_to_container_pixel_differential_width = Math.round((given_container_width/total_seconds_rounded)*10000)/10000;
            
            var given_container_height = Math.round(given_container_width*0.6);
            var data_to_container_pixel_differential_height = Math.round((given_container_height/highest_value_count)*10000)/10000;

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

        function displayTextWidth(text, font) {
            var myCanvas = displayTextWidth.canvas || (displayTextWidth.canvas = document.createElement("canvas"));
            var context = myCanvas.getContext("2d");
            context.font = font;

            var metrics = context.measureText(text);
            return metrics.width;
        };

        function buildLineChart(rawdata,key,rounder){
            if(document.getElementById('linechart_container')) document.getElementById('linechart_container').outerHTML = '';
            const data = buildTimelineAnalysis(rawdata,key,rounder);
            console.log(rawdata)
            const ele = (t) => document.createElement(t);
            const attr = (o, k, v) => o.setAttribute(k, v);
            const a = (l, r) => r.forEach(a => attr(l, a[0], a[1]));
            function inlineStyler(elm,css){
            Object.entries(JSON.parse(
                css.replace(/(?<=:)\s*(\b|\B)(?=.+?;)/g,'"')
                .replace(/(?<=:\s*.+?);/g,'",')
                .replace(/[a-zA-Z-]+(?=:)/g, k=> k.replace(/^\b/,'"').replace(/\b$/,'"'))
                .replace(/\s*,\s*}/g,'}')
            )).forEach(kv=> { elm.style[kv[0]] = kv[1]});
            }
            function topZIndexer(){
            let n = new Date().getTime() / 1000000;
            let r = (n - Math.floor(n)) * 100000;
            return (Math.ceil(n+r) * 10);
            }
            var linechart_container = ele('div');
            a(linechart_container,[['id','linechart_container']]);

            inlineStyler(linechart_container,`{position: fixed; display: grid; grid-template-columns: 40px ${data.given_container_width}px 40px; background: transparent; z-index:${topZIndexer()}; top: 50px; left: 50px; height: ${data.given_container_height + 80}px; width: ${data.given_container_width + 80}px; padding:0px; border-radius: 1em;}`);
            document.body.appendChild(linechart_container);
            // 

            
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
                linechart_left_panel = ele('ele');
                a(linechart_left_panel,[['id','linechart_left_panel']]);
                inlineStyler(linechart_left_panel,`{color: #1c1c1c; width:100%; cursor: move; user-select: none; display: grid; grid-template-rows:${Array(count_axis_num_of_points).fill().map((_,i)=> ` ${count_pixel_gap}px`).reduce((a,b)=> a+b)}; grid-gap:0px;}`);
                left.appendChild(linechart_left_panel);
                Array(count_axis_num_of_points).fill().map((_,i)=> i++).forEach((t,i,r)=> {
                        let count_axis_marker = ele('div');
                        linechart_left_panel.appendChild(count_axis_marker);
                        inlineStyler(count_axis_marker,`{text-align:center;}`)//transform: translate(0px,-12px); 
                        count_axis_marker.innerText = Math.round(data.highest_value_count *(t/r.at(-1)));
                        // data?.given_container_height
                    })

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

                
                var increment_adjustments_slider = ele('input');
                a(increment_adjustments_slider,[['type','range'],['value',rounder],['min','10'],['max','300'],['style',`width:${displayTextWidth(`Showing time increments of ${rounder} seconds`,'')}px;`]]);
                increment_adjustments.appendChild(increment_adjustments_slider);
                increment_adjustments_slider.onchange = ()=> {
                    buildLineChart(rawdata,key,parseInt(increment_adjustments_slider.value));
                    // increment_adjustments_label.innerText = `Showing time increments of ${increment_adjustments_slider.value} seconds`;
                }
                increment_adjustments_slider.onmousedown = ()=> {
                    increment_adjustments_slider.onmousemove= ()=> {
                        increment_adjustments_label.innerText = `Selecting time increments of ${increment_adjustments_slider.value} seconds`;
                    }
                }
                increment_adjustments_slider.value = rounder;
                // console.log(`{display:grid; grid-template-columns:${Array(data?.seconds_counted.length).fill().map((_,i)=> ' '+data?.data_to_container_pixel_differential+'px').reduce((a,b)=> {return a+b})}; width:100%;}`)

                var linechart_data_cont = ele('div');
                inlineStyler(linechart_data_cont,`{display:grid; grid-template-columns:${Array(data?.seconds_counted.length).fill().map((_,i)=> ' '+data?.data_to_container_pixel_differential_width+'px').reduce((a,b)=> a+b)}; width:100%; background-color: #ffffff; opacity: 0.9; background-image: radial-gradient(#9294b6 0.35000000000000003px, #ffffff 0.35000000000000003px); background-size: 7px 7px;}`);
                center.appendChild(linechart_data_cont);
                // Array(data.given_container_width).fill().map((_,i)=> i++)
                console.log(data?.data_to_container_pixel_differential_width);
                // var calculatRadiusTransition = (dd,ii,rr)=> 
                data?.seconds_counted.forEach((d,i,r)=> {
                    // 
                        let data_col =  ele('div');
                        let data_height = d?.count ? d.count*data?.data_to_container_pixel_differential_height : 0;
                        a(data_col,[['mark',d.mark]]);
                        inlineStyler(data_col,`{width:${data?.data_to_container_pixel_differential_width}px; height:100%; display: grid; grid-template-rows:${data_height}px ${data.given_container_height-data_height}px; grid-gap: 0px; cursor: pointer;}`);
                        linechart_data_cont.appendChild(data_col);
                        data_col.onmouseenter = showDataPreview;
                        data_col.onmouseleave = killDataPreview;
                        data_col.onclick = openVideoTimestamp;
                        let radius = ' border-radius: 0 0 0.2em 0.2em;';//` border-radius: 0 0 ${r[i+1]?.count && d?.count ? (r[i+1].count/d.count)*data?.data_to_container_pixel_differential_height: d.count}px ${r[i-1]?.count && d?.count ? (d.count/r[i-1].count)*data?.data_to_container_pixel_differential_height : d.count}px;`
                        // console.log(radius)
                        let data_line = ele('div');
                        inlineStyler(data_line,`{width:100%; height:${data_height}px; background:#495466;${radius}}`);
                        data_col.appendChild(data_line);
                    })

            var right = ele('div');
            linechart_container.appendChild(right);
            inlineStyler(right,`{background: #ffffff; border-top-right-radius: 1em; border-bottom-right-radius: 1em;}`);
            // right.onmouseover = dragElement;

            function openVideoTimestamp(){
                let mark = parseInt(this.getAttribute('mark'));
                // let index = mark/rounder;
                // console.log(data.seconds_counted[mark]);
        // console.log(`https://www.twitch.tv/videos/${data?.content_id}/?t=${parseTimeOffset(mark+0.111)}`)
                window.open(`https://www.twitch.tv/videos/${data?.content_id}/?t=${parseTimeOffset(mark+0.111)}`)
            }
            function showDataPreview(){
                let mark = parseInt(this.getAttribute('mark'));
                let index = mark/rounder;
                // data[mark]
                let parent_rect = this.firstChild.getBoundingClientRect();
                let cont = ele('div');
                a(cont,[['id','line_chart_data_preview']]);
                inlineStyler(cont,`{border: 2px solid blue; border-radius: 0.4em; position: fixed; top:${parent_rect.bottom}px; left:${parent_rect.left+2}px; z-index:${topZIndexer()}; background:#ffffff; color:#1c1c1c; padding:12px;}`);
                cont.innerHTML = `<div>timestamp: ${parseTimeOffset(mark+0.111)}</div><div>#comments: ${data.seconds_counted[index]?.count ? data.seconds_counted[index]?.count : 0}</div>`;
                document.body.appendChild(cont);
                // console.log(data.seconds_counted[indext]);
                // `https://www.twitch.tv/videos/${data?.content_id}/?t=${}`
                // console.log(mark);
                createHorizontalLine(this.parentElement.parentElement,parent_rect.bottom)
                // ${data?.data_to_container_pixel_differential_width > 2}
                inlineStyler(this,`{background: rgb(255,0,0); background: linear-gradient(90deg, rgba(255,0,0,1) 2px, rgba(255,0,0,0) 2px);}`);
                
            }
            function createHorizontalLine(ref_elm,top){
                let liner = ele('div');
                a(liner,[['id','liner_red']]);
                document.body.appendChild(liner);
                inlineStyler(liner,`{z-index: ${topZIndexer()+10000}; position: fixed; top:${top}px; left:${ref_elm.getBoundingClientRect().left}px; width:${ref_elm.getBoundingClientRect().width}px; background:#242931; height:1px;}`);
            }
            function killDataPreview(){
                if(document.getElementById('line_chart_data_preview')) document.getElementById('line_chart_data_preview').outerHTML = '';
                if(document.getElementById('liner_red')) document.getElementById('liner_red').outerHTML = '';
                inlineStyler(this,`{background: transparent;}`);
            }
        }

        buildLineChart(all_chat_records,'content_offset_seconds',100)
    }
}
initTwitchVodMiner();