import uuid from 'uuid'

class Connection {
	constructor( name, parent ) {
		this.uuid = uuid()
		this.name = name
		this.parent = parent
		this.free = true
		this.ui = { absolutePosition: { x: 0, y:0 } }
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
		let i = this.output.input.indexOf( this )
		if ( i > -1 ) this.output.input.splice( i, 1 )
		if ( this.output.input.length === 0 ) this.output.free = true
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
}

class Executable {
	constructor() {
		this._fnstr = ''
		this._task = null
	}
	compile() {
		try { this._task = new Function( 'input', this._fnstr ) }
		catch ( e ) { throw e }
	}
	execute() {
		var inpObj = {}
		this.input.forEach( inp => { inpObj[ inp.name ] = inp.retrieveData() } )
		try { var res = this._task.call( null, inpObj ) }
		catch ( e ) { throw e }
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
		this.ui = { absolutePosition: { x: 0, y: 0 } }
	}
	addInput() {
		for ( let i = 0; i < arguments.length; i++ ) {
			this.input.push( new Input( arguments[ i ], this ) )
		}
	}
	addOutput() {
		for ( let i = 0; i < arguments.length; i++ ) {
			this.output.push( new Output( arguments[ i ], this ) )
		}
	}
}

function create( name ) {
	return new Node( name )
}

export default { create, Node, Input, Output }
