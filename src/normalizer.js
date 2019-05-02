
const Normalizer = function(value)
{
    this._value = value;
}

Normalizer.prototype.run = function()
{
    return this._normalizeType();
}

/** normalize to string */
Normalizer.prototype._normalizeType = function()
{
    try{
        // remove null char
        this._value = this._value.replace(String.fromCharCode(00), "");

        // remove spaces
        var spaces = new RegExp(/(?:\n+|\r+|\v+|\s+|\t+|\f+)/,'gm');
        this._value = this._value.replace(spaces, " ");

        // remove quotes
        var quotes = new RegExp(/(?:\'+|\"+|\`+|\´+|\’+|\‘+)/,'gm');
        this._value.replace(quotes, "\"");

        //to lower case
        this._value = this._value.toLowerCase();
        return this._value;
    }catch (e){
        return this._value;
    }
}



module.exports = Normalizer;
