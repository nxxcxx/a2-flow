import { Injectable } from 'angular2/core'
import nodeFactory from 'src/NodeGraph/NodeFactory'
import toposort from 'toposort'
import $ from 'jquery'

// CodeMirror ( import order is important )
import CodeMirror from 'codemirror'
import 'root/node_modules/codemirror/mode/javascript/javascript.js'
import 'root/node_modules/codemirror/lib/codemirror.css'

@Injectable()
export class NodeGraphService {

	constructor() {
		this.viewportElem = null
		this.nodes = []
		this.connections = []
		this.connectingIO = { src: null, dst: null }
		this.selectedNode = null
		this.codeMirror = null
		this.linking = false
		this.zoomFactor = 1.0
		// DEBUG
		window.NGS= this
		this.createTestNode3()
	}

	registerViewportElem( viewportElem ) {
		this.viewportElem = $( viewportElem )
	}

	getViewportElem() {
		return this.viewportElem
	}

	setNodeContainerElemId( id ) {
		this.nodeContainerElem = this.viewportElem.find( '#' + id )
	}

	getNodeContainerElem() {
		return this.nodeContainerElem
	}

	getNodeContainerTransformationMatrix() {
		return this.nodeContainerElem.css( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
	}

	initEditor( textareaElem ) {
		this.codeMirror = CodeMirror.fromTextArea( textareaElem, {
			lineNumbers: true,
			mode: 'javascript',
			theme: 'black',
			tabSize: 2
		} )
		this.codeMirror.on( 'change', cm => {
			// set selected node content
			if ( !this.selectedNode ) return
			this.selectedNode._fnstr = cm.doc.getValue()
		} )
	}

	getNodes() { return this.nodes }

	getConnections() { return this.connections }

	getSelectedNode() { return this.selectedNode }

	setSelectedNode( node ) {
		this.selectedNode = node
		// bring selected node to end of array so it render last in view
		let swapIndex = this.nodes.findIndex( currentNode => currentNode === node )
		this.nodes.push( this.nodes.splice( swapIndex, 1 )[ 0 ] )
		// set editor content
		this.codeMirror.doc.setValue( node._fnstr )
	}

	isConnectionExists( output, input ) {
		return this.connections.find( io => io[ 0 ] === output && io[ 1 ] === input ) !== undefined
	}

	isValidConnection( output, input ) {
		if (
			( output instanceof nodeFactory.Output ) &&
			( input instanceof nodeFactory.Input ) &&
			( output.parent.uuid !== input.parent.uuid ) &&
			!this.isConnectionExists( output, input )
		) {
			if ( this.validateCyclicConnection( output, input ) ) return false
			return true
		}
		return false
	}

	connectIO( output, input ) {
		if ( this.isValidConnection( output, input ) ) {
		// many -> one connection, if the same input already exists, remove & disconnect it
			if ( !input.free ) {
				this.disconnectInput( input )
			}
			input.connect( output )
			this.connections.push( [ output, input ] )
		}
	}

	disconnectIO( io ) {
		if ( io instanceof nodeFactory.Input ) {
			this.disconnectInput( io )
		} else if ( io instanceof nodeFactory.Output ) {
			// need to make a new copy because cannot call disconnectInput inside a loop
			for ( let input of Array.from( io.input ) ) {
				this.disconnectInput( input )
			}
		}
	}

	disconnectInput( input ) {
		input.disconnect()
		this.connections = this.connections.filter( io => io[ 1 ] !== input )
	}

	startConnectingIO( io )  {
		this.connectingIO.src = io
		this.linking = true
	}

	endConnectingIO( io ) {
		let cio = this.connectingIO
		cio.dst = io
		if ( cio.src instanceof nodeFactory.Output ) this.connectIO( cio.src, cio.dst )
		else if ( cio.src instanceof nodeFactory.Input ) this.connectIO( cio.dst, cio.src )
		cio.src = cio.dst = null
		this.linking = false
	}

	validateCyclicConnection( output, input ) {
		let test = Array.from( this.connections ).concat( [ [ output, input] ] )
		try { this.computeToposort( test ) }
		catch( ex ) { return true }
		return false
	}

	computeToposort( connections = this.connections ) {
		let edges = []
		connections.forEach( io => { edges.push( [ io[ 0 ].parent.uuid, io[ 1 ].parent.uuid ] ) } )
		return toposort( edges )
	}

	sortNodes() {
		let sorted = this.computeToposort( this.connections )
		this.nodes.forEach( n => { n.order = sorted.indexOf( n.uuid ) } )
		this.nodes.sort( ( a, b ) => { return a.order - b.order } )
	}

	run() {
		this.sortNodes()
		this.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
			n.parse()
			n.execute()
		} )
	}

	createTestNode() {
		let n
		n = nodeFactory.create( 'CONST' )
		n.addOutput( 'X', 'Y', 'Z' )
		n._fnstr = 'return { X: Math.random(), Y: Math.random(), Z: Math.random() }'
		n.parse()
		this.nodes.push( n )

		n = nodeFactory.create( 'VEC3' )
		n.addInput( 'U', 'V', 'W' )
		n.addOutput( 'VEC3', 'U', 'V', 'W' )
		n._fnstr = 'return { VEC3: [ input.U, input.V, input.W ], U: input.U, V: input.V, W: input.W }'
		n.parse()
		this.nodes.push( n )

		n = nodeFactory.create( 'CONSOLE' )
		n.addInput( 'LOG' )
		n._fnstr = 'console.log( input.LOG )'
		n.parse()
		this.nodes.push( n )

	}

	createTestNode2() {
		function genID() {
			let id = String.fromCharCode( Math.floor( Math.random() * 23 ) + 65 ) + ~~( Math.random() * 9 )
			return id
		}
		let n = nodeFactory.create( genID() )
		let [ ilen, olen ] = [ ~~( Math.random() * 6 ), ~~( Math.random() * 6 ) ]
		for ( let i = 0; i < ilen; i ++ ) n.addInput( genID() )
		for ( let i = 0; i < olen; i ++ ) n.addOutput( genID() )
		this.nodes.push( n )
	}

	createTestNode3() {
		let n
		n = nodeFactory.create( 'SRC' )
		n.addOutput( 'X', 'Y', 'Z' )
		n._fnstr =
		`this._initfn = function( input ) {
	console.log( 'SRC: initfn', this, input )
	this.t = 1
}
this._process = function( input ) {
	console.log( 'SRC: process', this, input )
  return {
  	X: this.t++, Y: 2, Z: 3
  }
}
console.log( 'SRC: parse', this )`
		this.nodes.push( n )
		n = nodeFactory.create( 'SINK' )
		n.addInput( 'U', 'V', 'W' )
		n._fnstr =
		`this._initfn = function( input ) {
	console.log( 'SINK: initfn', this, input )
}
this._process = function( input ) {
	console.log( 'SINK: process', this )
  console.log( input.U, input.V, input.W )
}
console.log( 'SINK: parse', this )`
		this.nodes.push( n )
	}

	parse() {
		this.sortNodes()
		this.nodes.forEach( n => {
			n.parse()
		} )
	}

	run2() {
		this.sortNodes()
		this.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
			n.execute()
		} )
	}

}
