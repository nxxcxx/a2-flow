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

	getViewportElem() { return this.viewportElem }

	setNodeContainerElemId( id ) { this.nodeContainerElem = this.viewportElem.find( '#' + id ) }

	getNodeContainerElem() { return this.nodeContainerElem }

	getNodeContainerTransformationMatrix() {
		return this.nodeContainerElem.css( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
	}

	initEditor( textareaElem ) {
		let cm = this.codeMirror = CodeMirror.fromTextArea( textareaElem, {
			lineNumbers: true,
			mode: 'javascript',
			theme: 'black',
			tabSize: 2
		} )
		cm.setSize( '100%', 400 )
		cm.on( 'change', cm => {
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
		let swapIndex = this.nodes.findIndex( currentNode => currentNode === node )
		this.nodes.push( this.nodes.splice( swapIndex, 1 )[ 0 ] )
		this.codeMirror.doc.setValue( node._fnstr )
	}

	isConnectionExists( output, input ) {
		return this.connections.find( io => io[ 0 ] === output && io[ 1 ] === input ) !== undefined
	}

	isValidConnection( output, input ) {
		return (
			( output instanceof nodeFactory.Output ) &&
			( input instanceof nodeFactory.Input ) &&
			( output.parent.uuid !== input.parent.uuid ) &&
			!this.isConnectionExists( output, input ) &&
			!this.isConnectionCyclic( output, input )
		)
	}

	connectIO( output, input ) {
		if ( this.isValidConnection( output, input ) ) {
			this.disconnectInput( input )
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

	isConnectionCyclic( output, input ) {
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
		let sorted = this.computeToposort()
		this.nodes.forEach( n => { n.order = sorted.indexOf( n.uuid ) } )
		this.nodes.sort( ( a, b ) => { return a.order - b.order } )
	}

	parse() {
		this.sortNodes()
		this.nodes.forEach( n => {
			n.parse()
		} )
	}

	run() {
		this.sortNodes()
		this.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
			n.execute()
		} )
	}


	createTestNode3() {
		let n
		n = nodeFactory.create( 'SRC' )
		n.addOutput( 'X', 'Y', 'Z' )
		n._fnstr =
		`this.init = function( input ) {
	console.log( 'SRC: initfn', input )
	this.t = 1
}
this.process = function( input ) {
	console.log( 'SRC: process', input )
	return {
		X: this.t++, Y: Math.random(), Z: Math.random()
	}
}
console.log( 'SRC: parse' )`
		this.nodes.push( n )

		n = nodeFactory.create( 'SINK0' )
		n.addInput( 'U', 'V', 'W' )
		n._fnstr =
		`this.init = function( input ) {
	console.log( 'SINK0: initfn', input )
}
this.process = function( input ) {
	console.log( 'SINK0: process', input )
}
console.log( 'SINK0: parse' )`
		this.nodes.push( n )

		n = nodeFactory.create( 'SINK1' )
		n.addInput( 'X', 'Y', 'Z' )
		n._fnstr =
		`this.init = function( input ) {
	console.log( 'SINK1: initfn', input )
}
this.process = function( input ) {
	console.log( 'SINK1: process', input )
}
console.log( 'SINK1: parse' )`
		this.nodes.push( n )

		n = nodeFactory.create( 'V3' )
		n.addInput( 'U', 'V', 'W' )
		n.addOutput( 'V3', 'U', 'V', 'W' )
		n._fnstr =
`this.init = function( input ) {
	console.log( 'V3: initfn', input )
}
this.process = function( input ) {
	console.log( 'V3: process', input )
	return {
		V3: [ input.U, input.V, input.W ], U: input.U, V: input.V, W: input.W
	}
}
console.log( 'V3: parse' )`
		this.nodes.push( n )

	}

}
