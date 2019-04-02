'use strict';

var regexEscape = require('escape-string-regexp');

var sensitiveChars = ['\'', '"', '<', '>', '\\', '`', '=', ';', ':', '+', '#', '&', '\n', '\t', '\r', '\b', '\f'];

/**
 * 
 * - HTML Entity encoding -Done-
 * - HTML Decimal entity encoding -Done-
 * - UTF-8 Small-form variants -Done-
 * - HTML Encoding for small form variants -Done-
 * - Full-width UTF-8 characters -Done-
 * - HTML Encoding for full-width UTF-8 characters -Done-
 * 
 * @see https://websec.github.io/unicode-security-guide/ Sections: Best-fit matching, Normalization
 * 
 * This is the object we send to our API
 */
var sensitiveCharsEncoding = {
    '\'' : ['&#39;', '\uFF07', '&#65287;', '&#xFF07;'],
    '\\' : ['&#92;', '&#65128;', '&#xFE68;'],
    '"' : ['&#34;', '&quot;', '\uFF02', '&#65282;', '&#xFF02;'],
    '<' : ['&#60;', '&lt;', '\uFE64', '&#65124;', '&#xFE64;', '\uFF1C', '&#65308;', '&#xFF1C;'],
    '>' : ['&#62;', '&gt;', '\uFE65', '&#65125;', '&#xFE65;', '\uFF1E', '&#65310;', '&#xFF1E;'],
    '`' : ['&#96;'],
    '=' : ['&#61;', '\uFE66', '&#65126;', '&#xFE66;'],
    ';' : ['&#59;', '\uFE54', '&#65108;', '&#xFE54;'],
    ':' : ['&#58;', '\uFE55', '&#65109;', '&#xFE55;', '\uFE13', '&#65043;', '&#xFE13;', '\uFF1A', '&#65306;', '&#xFF1A;'],
    '+' : ['&#43;', '\uFE62', '&#65122;', '&#xFE62;'],
    '#' : ['&#35;', '\uFE5F', '&#65119;', '&#xFE5F;'],
    '&' : ['&#38;', '&amp;', '\uFE60', '&#65120;', '&#xFE60;'],
    '\n' : [],
    '\t' : [],
    '\r' : [],
    '\b' : [],
    '\f' : []
}

var keywords = {

        HTMLevents : [
            "onafterprint",
            "onbeforeprint",
            "onbeforeunload",
            "onerror",
            "onhashchange",
            "onload",
            "onmessage",
            "onoffline",
            "ononline",
            "onpagehide",
            "onpageshow",
            "onpopstate",
            "onresize",
            "onstorage",
            "onunload",
        ],
        HTMLtags : [
            
            "!--...--",
            "!DOCTYPE",
            "a",
            "abbr",
            "acronym",
            "address",
            "applet",
            "area",
            "article",
            "aside",
            "audio",
            "b",
            "base",
            "basefont",
            "bdi",
            "bdo",
            "big",
            "blockquote",
            "body",
            "br",
            "button",
            "canvas",
            "caption",
            "center",
            "cite",
            "code",
            "col",
            "colgroup",
            "data",
            "datalist",
            "dd",
            "del",
            "details",
            "dfn",
            "dialog",
            "dir",
            "div",
            "dl",
            "dt",
            "em",
            "embed",
            "fieldset",
            "figcaption",
            "figure",
            "font",
            "footer",
            "form",
            "frame",
            "frameset",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "head",
            "header",
            "hr",
            "html",
            "i",
            "iframe",
            "img",
            "input",
            "ins",
            "kbd",
            "label",
            "legend",
            "li",
            "link",
            "main",
            "map",
            "mark",
            "meta",
            "meter",
            "nav",
            "noframes",
            "noscript",
            "object",
            "ol",
            "optgroup",
            "option",
            "output",
            "p",
            "param",
            "picture",
            "pre",
            "progress",
            "q",
            "rp",
            "rt",
            "ruby",
            "s",
            "samp",
            "script",
            "section",
            "select",
            "small",
            "source",
            "span",
            "strike",
            "strong",
            "style",
            "sub",
            "summary",
            "sup",
            "svg",
            "table",
            "tbody",
            "td",
            "template",
            "textarea",
            "tfoot",
            "th",
            "thead",
            "time",
            "title",
            "tr",
            "track",
            "tt",
            "u",
            "ul",
            "var",
            "video",
            "wbr",
        ],
        HTMLattributes : [
            "accept",
            "accept-charset",
            "accesskey",
            "action",
            "align",
            "alt",
            "async",
            "autocomplete",
            "autofocus",
            "autoplay",
            "bgcolor",
            "border",
            "charset",
            "checked",
            "cite",
            "class",
            "color",
            "cols",
            "colspan",
            "content",
            "contenteditable",
            "controls",
            "coords",
            "data",
            "data-*",
            "datetime",
            "default",
            "defer",
            "dir",
            "dirname",
            "disabled",
            "download",
            "draggable",
            "dropzone",
            "enctype",
            "for",
            "form",
            "formaction",
            "headers",
            "height",
            "hidden",
            "high",
            "href",
            "hreflang",
            "http-equiv",
            "id",
            "ismap",
            "kind",
            "label",
            "lang",
            "list",
            "loop",
            "low",
            "max",
            "maxlength",
            "media",
            "method",
            "min",
            "multiple",
            "muted",
            "name",
            "novalidate",
            "onabort",
            "onafterprint",
            "onbeforeprint",
            "onbeforeunload",
            "onblur",
            "oncanplay",
            "oncanplaythrough",
            "onchange",
            "onclick",
            "oncontextmenu",
            "oncopy",
            "oncuechange",
            "oncut",
            "ondblclick",
            "ondrag",
            "ondragend",
            "ondragenter",
            "ondragleave",
            "ondragover",
            "ondragstart",
            "ondrop",
            "ondurationchange",
            "onemptied",
            "onended",
            "onerror",
            "onfocus",
            "onhashchange",
            "oninput",
            "oninvalid",
            "onkeydown",
            "onkeypress",
            "onkeyup",
            "onload",
            "onloadeddata",
            "onloadedmetadata",
            "onloadstart",
            "onmousedown",
            "onmousemove",
            "onmouseout",
            "onmouseover",
            "onmouseup",
            "onmousewheel",
            "onoffline",
            "ononline",
            "onpageshow",
            "onpaste",
            "onpause",
            "onplay",
            "onplaying",
            "onprogress",
            "onratechange",
            "onreset",
            "onresize",
            "onscroll",
            "onsearch",
            "onseeked",
            "onseeking",
            "onselect",
            "onstalled",
            "onsubmit",
            "onsuspend",
            "ontimeupdate",
            "ontoggle",
            "onunload",
            "onvolumechange",
            "onwaiting",
            "onwheel",
            "open",
            "optimum",
            "pattern",
            "placeholder",
            "poster",
            "preload",
            "readonly",
            "rel",
            "required",
            "reversed",
            "rows",
            "rowspan",
            "sandbox",
            "scope",
            "selected",
            "shape",
            "size",
            "sizes",
            "span",
            "spellcheck",
            "src",
            "srcdoc",
            "srclang",
            "srcset",
            "start",
            "step",
            "style",
            "tabindex",
            "target",
            "title",
            "translate",
            "type",
            "usemap",
            "value",
            "width",
            "wrap"
        ],
    javascriptBuiltinFunctions : [
            "close",
            "stop",
            "focus",
            "blur",
            "open",
            "alert",
            "confirm",
            "prompt",
            "print",
            "postMessage",
            "captureEvents",
            "releaseEvents",
            "getSelection",
            "getComputedStyle",
            "matchMedia",
            "moveTo",
            "moveBy",
            "resizeTo",
            "resizeBy",
            "scroll",
            "scrollTo",
            "scrollBy",
            "requestAnimationFrame",
            "cancelAnimationFrame",
            "getDefaultComputedStyle",
            "scrollByLines",
            "scrollByPages",
            "sizeToContent",
            "updateCommands",
            "find",
            "dump",
            "setResizable",
            "requestIdleCallback",
            "cancelIdleCallback",
            "btoa",
            "atob",
            "setTimeout",
            "clearTimeout",
            "setInterval",
            "clearInterval",
            "createImageBitmap",
            "fetch"
        ]
}

/**
 * @description turns each of the lists in keywords into a regex to run the parameter against
 * @param {*} keywords 
 */
function makeKeywordsRegexes(keywords){
    let regexes = {};
    Object.keys(keywords).forEach(keywordsListName => {
        keywords[keywordsListName] = keywords[keywordsListName].sort(function(a, b){
            //DESC
            return b.length - a.length;
        })
        regexes[keywordsListName] = new RegExp("(" + keywords[keywordsListName].join("|") + ")", 'ig');
    })
    return regexes;
}

var keywordsRegexes = makeKeywordsRegexes(keywords);

function keywordsReplacerFunction(match, _, offset, string){
    if(string[offset+match.length].match(/[a-zA-Z]/i)
    || string[offset-1].match(/[a-zA-Z]/i)    
    ){
        return match;
    }
    return "(" + match + ")?" ;
}



/**
 * @description Invert the sensitiveCharsEncoding object so that each 
 * encoded character is a key to the value of the decoded character.
 * .
 * .
 * 
 * @param {sensitiveCharsEncoding} sensitiveCharsEncoding 
 */
function encodingToDecoding(sensitiveCharsEncoding){
    let sensitiveCharsDecoding = {};

    Object.keys(sensitiveCharsEncoding).forEach(decodedChar => {

        sensitiveCharsEncoding[decodedChar].forEach(encodedChar => {

            sensitiveCharsDecoding[encodedChar] = new Array(decodedChar);

        });

    });

    return sensitiveCharsDecoding;
};

var sensitiveCharsDecoding = encodingToDecoding(sensitiveCharsEncoding);


/**
 * @description Creates a regex pattern similar to sensitiveCharsRegex but 
 * this one contains all encoded state values for each character. Used in case #3.
 * .
 * .
 * .
 * @param {sensitiveCharsDecoding} sensitiveCharsDecoding 
 */
function makeEncodedCharsRegex(sensitiveCharsDecoding){
    let regExp =  RegExp('(' + Object.keys(sensitiveCharsDecoding).join('|') + ')', 'gi');
    return regExp;
}

var sensitiveCharsRegexEncoded = makeEncodedCharsRegex(sensitiveCharsDecoding);


/**
 * @description Makes a mixed character map to merge cases 2 & 3 as per TODO item #4
 * 
 * 
 * @param {sensitiveCharsEncoding} sensitiveCharsEncoding 
 * @param {sensitiveCharsDecoding} sensitiveCharsDecoding
 */
function makeMixedCharMap(sensitiveCharsEncoding, sensitiveCharsDecoding){
    
    let mixedCharMap = {};

    Object.keys(sensitiveCharsDecoding).forEach(encodedChar => {
        let alternativesArray = 
            sensitiveCharsEncoding[sensitiveCharsDecoding[encodedChar]]
            .slice();
            
        alternativesArray.push(sensitiveCharsDecoding[encodedChar][0]);

        mixedCharMap[encodedChar] = alternativesArray;
    });

    Object.keys(sensitiveCharsEncoding).forEach(decodedChar => {
        mixedCharMap[decodedChar] = sensitiveCharsEncoding[decodedChar];
    })

    return mixedCharMap
}

var mixedCharMap = makeMixedCharMap(sensitiveCharsEncoding, sensitiveCharsDecoding);

var mixedSensitiveCharRegex = RegExp('(' + Object.keys(sensitiveCharsDecoding).concat(sensitiveChars).map(item =>{ return regexEscape(item)}).join('|') + ')', 'gi');


/**
 * @description checks if a user parameter can be a Reflected-XSS vector by 
 * performing a set of checks on the parameter.
 * .
 * .
 * .
 * @param {String} param The user parameter to check
 * @param {String} resChunk the response to be sent to the user or a part of it
 * .
 * .
 * 
 * TODO:
 * 1- Add case #4
 * 
 * 2- Add UTF-8 characters that browsers or backends sometimes transform into HTML entities to sensitive . -Done-
 * 
 * 3- Add checks against removal of javascript and HTML KEYWORDS, their removal can lead to shieldfy missing the payload
 * 
 * 4- Merge everything other than case 1 in a single case to account for payloads that use mixed techniques
 * 
 * 5- Make regex case-insensitive. -Done-
 * 
 */
function isReflectedXssVector(param, resChunk){
       

    /*
    *
    * @description This is the replacer function we use when performing string.match
    *  
    *  there may be instances where a '\' will be detected by the regex but it's not there because it's 
    *  part of the payload it's there because it's escaping a regex-sensitive character, this is to detect
    *  those instances and leave the backslash untouched
    */
    function replacerFunctionClosure(charMap){

        var charMap = charMap;

        var insideHTMLEntity = false;

        function isHTMLEncoding(match, offset, string){

            //Maximum length of an HTML encoded character ex: &#65304; , here it's 7 digits long.
            const MAX_LENGTH = 5;

            // if(match[0] == '&' && match[match.length -1] == ';'){
            //     return true;
            // }
            if(match == "&"){
                let stringFromMatch = string.slice(offset);
                let probableHTMLEncoding = 
                stringFromMatch
                .slice(stringFromMatch.indexOf(match), stringFromMatch.indexOf(match) + MAX_LENGTH + 1);

               if(probableHTMLEncoding.match(/&#[a-z0-9]{1,5};/)){

                   insideHTMLEntity = true;
                   return true;
               }
            }
            return false;

        }

        function isUTFEncoding(match){

        }

        /**
         * @description we replace pieces of the user parameter with regex patterns to detect reflection even
         * if the parameter is altered, this function serves to only replace special characters that are part of 
         * the user's input (eg. not a backslash for escaping a regex-special character) and we also keep encoded 
         * characters intact (eg. if the input contains &lt;, it will be treated as a single piece of the input to be replaced
         * with equivalent alternatives, and not make the mistake of replacing '&' or ';' seperately )
         * 
         * 
         */
        return function encodingReservingReplacer(match, offset, string){

            let specials = [
                  "-"
                , "["
                , "]"
                , "/"
                , "{"
                , "}"
                , "("
                , ")"
                , "*"
                , "+"
                , "?"
                , "."
                , "\\"
                , "^"
                , "$"
                , "|"
            ];

            // If it's a backslash and has a regex-special character after it, leave it as is, because we'll be using
            // this string as a regex, so we want regex-special characters to be escaped properly
            if(match == '\\' && specials.indexOf(string[offset + 1]) > -1){
                return match;
            }
            else if(insideHTMLEntity){
                if(match == ';'){
                    insideHTMLEntity = false;
                }
                return match;
            }
            else if(isHTMLEncoding(match, offset, string)){
                return match;
            }
            
            //replaces the sensitive character that has been matched -be it encoded or not-, with a regex pattern that allows
            //us to match the parameter in the response even if this character was altered by encoding, decoding, or removed.
            var alterations = charMap[match].map((alteration) => {return regexEscape(alteration)});
            var regex = '(' + alterations.join('|') + '|.)?';
            return regex;
        
        }
    }

    //1- Basic check
    if(resChunk.indexOf(param) > -1){
        return true;
    }

    let paramRegexEscaped = regexEscape(param);



    /* *************************************************************************************************
     * 2-
     * @description The application may be filtering/encoding out some characters, this is to catch the parameter's 
     * presence in the response even if HTML some sensitive characters were stripped from it or HTML encoded.
     * 
     * For information regarding the weird Regex manipulation logic:
     * @see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
     */

    let mixedCaseParamRegex = paramRegexEscaped
    .replace(mixedSensitiveCharRegex, replacerFunctionClosure(mixedCharMap));

    Object.keys(keywordsRegexes).forEach(regexName => {
        mixedCaseParamRegex = mixedCaseParamRegex.replace(keywordsRegexes[regexName], keywordsReplacerFunction);
    });

    // debug('Parameter "' + param + '" was turned into Regex: ' + mixedCaseParamRegex);
    if(resChunk.match(mixedCaseParamRegex)){
        return true;
    }; 

    /************************************************************************************************** */

    //4- The parameter is being split up before being reflected into the response


    return false;

}

module.exports = isReflectedXssVector;