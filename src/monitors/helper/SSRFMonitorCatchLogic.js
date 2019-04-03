'use strict';

const {
    URL,
    parse
} = require('url');



function isSSRFVector(param, urlOption){
    
    var urlObject, paramURL, matched = false;
    if (typeof urlOption == "string") {
        try{
            urlObject = new URL(urlOption);
        }
        catch (e) {
            //urlString is not a valid URL, let upstairs code fail instead of shieldfy
            return false;
        }
    }
    else if (urlOption && urlOption[searchParamsSymbol] &&
        urlOption[searchParamsSymbol][searchParamsSymbol]) {
            //a url.URL instance
            urlObject = urlOption;
    }

    try{
        paramURL = new URL(param);
    }
    catch (e) {
        //urlString is not a valid URL, let upstairs code fail instead of shieldfy
        return false;
    }

    if (paramURL instanceof URL && urlObject instanceof URL) {
        // Object.keys(URL.prototype).foreach(prop => {

        // })
        if (paramToURL.host && urlObject.host && paramURL.host  == urlObject.host) {
            matched = true;
        }
        if (paramToURL.hostname && urlObject.hostname && paramURL.hostname  == urlObject.hostname) {
            matched = true;
        }
    }

    return matched;
}

module.exports = isSSRFVector;