var util = require('util');
var stream = require('stream');

function BufferStream(source) {
    if(!Buffer.isBuffer(source)) {
        throw(new Error( "Source must be a buffer." ));
    }

    // Super constructor.
    stream.Readable.call(this);
    this._source = source;
    // I keep track of which portion of the source buffer is currently being pushed
    // onto the internal stream buffer during read actions.
    this._offset = 0;
    this._length = source.length;
    // When the stream has ended, try to clean up the memory references.
    this.on("end", this._destroy);
};

util.inherits(BufferStream, stream.Readable);

module.exports = BufferStream;

BufferStream.prototype._destroy = function() {
    this._source = null;
    this._offset = null;
    this._length = null;
};


// I read chunks from the source buffer into the underlying stream buffer.
// --
// NOTE: We can assume the size value will always be available since we are not
// altering the readable state options when initializing the Readable stream.
BufferStream.prototype._read = function (size) {
    // If we haven't reached the end of the source buffer, push the next chunk onto
    // the internal stream buffer.
    if (this._offset < this._length) {
        this.push(this._source.slice(this._offset, (this._offset + size)));
        this._offset += size;
    }
    // If we've consumed the entire source buffer, close the readable stream.
    if (this._offset >= this._length) {
        this.push( null );
    }
};
