import "util";

/**
 * Simple hash code generator for strings.
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.hashcode
 * @param {string} str - a string to be hashed
 * @returns the hashed string
 */
st.util.hashcode = function (str) {
    var hash = 0, i, chr, len;
    if (str.length == 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // convert to 32bit integer
    }
    return hash;
};
