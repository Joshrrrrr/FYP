let isFirefox = typeof browser !== "undefined";
let _browser = isFirefox ? browser : chrome;

_browser.runtime.onMessage.addListener((msg, sender, response) => {
    requestFromClientManager(msg).then(response);
    return true;
});

async function requestFromClientManager(msg){
    if(msg.cmd == 'vodInfo'){
        return await vodInfo(msg.token_params);
    }
    if(msg.cmd == 'vodChatExtractionAPI'){
        return await vodChatExtractionAPI(msg.token_params,msg.cursor);
    }
    if(msg.cmd == 'getCurrentStreamInfo'){
        return await getCurrentStreamInfo(msg.token_params);
    }

}

async function vodChatExtractionAPI(params,cursor){
    var {video_id, oauth, client_id, api_token, device_id} = params;
    var res = await
    fetch("https://gql.twitch.tv/gql", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US",
        "authorization": oauth,
        "client-id": client_id,
        "content-type": "text/plain;charset=UTF-8",
        "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Microsoft Edge\";v=\"108\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
    },
    "referrer": "https://www.twitch.tv/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": `[{\"operationName\":\"VideoCommentsByOffsetOrCursor\",\"variables\":
        {\"videoID\":\"${video_id}\",${cursor ? '\"cursor\":\"'+cursor+'\"' : '\"contentOffsetSeconds\":0'}},
        \"extensions\":{\"persistedQuery\":{\"version\":1,\"sha256Hash\":
        \"b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a\"}}}]`,
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
    });
    var d = await res.json();
    // console.log(d);
    return d;
}

async function vodInfo(params){
    var {video_id, oauth, client_id, api_token, device_id} = params;
    const headers = {
        'Authorization': "Bearer st8p967ni8jy88rgke2re43g6jl74t",
        'Client-Id': "jfzv7avfgwhd0oebjb8b2qr3bf6z5i"
      };
    try {
    const response = await fetch(`https://api.twitch.tv/helix/videos?id=${video_id}`, {
        method: 'GET',
        headers: headers
    });
    const data = await response.json();
    return { title: data.data[0].title, duration: data.data[0].duration,
        user: data.data[0].user_name, views: data.data[0].view_count};
    } catch (error) {
    console.error(error);
    return { title: 'err', duration: 'err', user: 'err', views: 'err'};
    }
}

async function getCurrentStreamInfo(params){
    var {client_id,oauth,device_id,channel_login} = params;
    var res = await fetch("https://gql.twitch.tv/gql", {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-US",
          "authorization": oauth,
          "client-id": client_id,
//           "client-session-id": "efd9736733d6b48d",
//           "client-version": "d0f4f183-c27f-4fe1-9dca-ad039ce8883b",
          "content-type": "text/plain;charset=UTF-8",
//           "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Microsoft Edge\";v=\"96\"",
          "sec-ch-ua-mobile": "?0",
//           "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-device-id": device_id
        },
        "referrer": "https://www.twitch.tv/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `[{\"operationName\":\"ChannelVideoLength\",\"variables\":{\"channelLogin\":\"${channel_login}\"},\"extensions\":{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"ac644fafd686f2cb0e3864075af7cf3bb33f4e0525bf84921b10eabaa4e048b5\"}}}]`,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
      });
    var d = await res.json();
    var video_id = d?.[0]?.data?.user?.videos?.edges?.map(i=> i?.node?.id)?.[0];

    return video_id;
}
