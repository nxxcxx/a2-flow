import uuid from 'uuid'

class Connection {
	constructor( name, parent ) {
		this.uuid = uuid()
		this.name = name
		this.parent = parent
		this.free = true
		this.position = { x: 0, y: 0 }
	}
}

class Input extends Connection {
	constructor( name, parent ) {
		super( name, parent )
		this.output = null
		this.type = 1
	}
	connect( output ) {
		if ( output instanceof Output ) {
			this.output = output
			this.free = false
			output.input.push( this )
			output.free = false
		}
	}
	disconnect() {
		if ( this.output ) {
			let i = this.output.input.indexOf( this )
			if ( i > -1 ) this.output.input.splice( i, 1 )
			if ( this.output.input.length === 0 ) this.output.free = true
		}
		this.output = null
		this.free = true
	}
	retrieveData() {
		return this.output === null ? null : this.output.data
	}
}

class Output extends Connection {
	constructor( name, parent ) {
		super( name, parent )
		this.data = null
		this.input = []
		this.type = 0
	}
	flush() {
		this.data = null
	}
}

class Executable {
	constructor() {
		this._fnstr = ''
		this._parseTask = null
		this._initialized = false
	}
	_init( inputObj, injectObj ) {
		if ( this._initialized ) return
		this.init( inputObj, injectObj )
		this._initialized = true
	}
	parse() {
		try {
			this.init = () => {}
			this.process = () => {}
			this._parseTask = new Function( this._fnstr )
			this._parseTask()
			this._initialized = false
		} catch ( ex ) {
			console.warn( ex, this.name, this.uuid )
		}
	}
	execute( injectObj = {} ) {
		var inpObj = {}
		this.input.forEach( inp => { inpObj[ inp.name ] = inp.retrieveData() } )
		try {
			this._init.call( this, inpObj, injectObj )
			var res = this.process.call( this, inpObj, injectObj )
		} catch ( ex ) {
			console.warn( ex, this.name, this.uuid )
		}
		this.output.forEach( io => { io.data = res[ io.name ] } )
	}
}

class Node extends Executable {
	constructor( name ) {
		super()
		this.uuid = uuid()
		this.name = name
		this.input = []
		this.output = []
		this.order = -1
		this.position = { x: 0, y: 0 }
	}
	addInput() {
		for ( let arg of arguments ) {
			this.input.push( new Input( arg, this ) )
		}
	}
	addOutput() {
		for ( let arg of arguments ) {
			this.output.push( new Output( arg, this ) )
		}
	}
	flushOutput() {
		this.output.forEach( output => output.flush() )
	}
	deleteIO( io ) {
		this.input = this.input.filter( inp => inp !== io )
		this.output = this.output.filter( opt => opt !== io )
	}
}

export default { Node, Input, Output }
