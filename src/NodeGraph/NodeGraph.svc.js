import { Injectable } from 'angular2/core'
import nodeFactory from './NodeFactory.svc'
import toposort from 'toposort'

// CodeMirror ( import order is important )
import CodeMirror from 'codemirror'
import 'root/node_modules/codemirror/mode/javascript/javascript.js'
import 'root/node_modules/codemirror/lib/codemirror.css'

@Injectable()
export class NodeGraphService {

	constructor() {
		window.NM = this
		this.nodes = []
		this.connections = []
		this.connectingIO = { src: null, dst: null }
		this.selectedNode = null
		this.codeMirror = null
		this.linking = false
		// test
		this.createTestNode()
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
				input.disconnect()
				this.disconnectInput( input )
			}
			input.connect( output )
			this.connections.push( [ output, input ] )
		}
	}

	disconnectIO( io ) {
		if ( io instanceof nodeFactory.Input ) {
			io.disconnect()
			this.disconnectInput( io )
		} else if ( io instanceof nodeFactory.Output ) {
			// need to make a new copy because cannot call disconnectInput inside a loop
			for ( let inp of Array.from( io.input ) ) {
				inp.disconnect()
				this.disconnectInput( inp )
			}
		} else { throw 'wtf' }
	}

	disconnectInput( input ) {
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
		catch( e ) { return true }
		return false
	}

	computeToposort( connections = this.connections ) {
		let edges = []
		connections.forEach( io => { edges.push( [ io[ 0 ].parent.uuid, io[ 1 ].parent.uuid ] ) } )
		return toposort( edges )
	}

	createTestNode() {
		let n = nodeFactory.create( 'CONST' )
		n.addOutput( 'X', 'Y', 'Z' )
		n._fnstr = 'return { X: 42, Y: 33, Z: 76 }'
		n.parse()
		this.nodes.push( n )

		n = nodeFactory.create( 'VEC3' )
		n.addInput( 'U', 'V', 'W' )
		n.addOutput( 'VEC3' )
		n._fnstr = 'return { VEC3: [ input.U, input.V, input.W ] }'
		n.parse()
		this.nodes.push( n )

		n = nodeFactory.create( 'VEC3' )
		n.addInput( 'S', 'T', 'P' )
		n.addOutput( 'VEC3' )
		n._fnstr = 'return { VEC3: [ input.S, input.T, input.P ] }'
		n.parse()
		this.nodes.push( n )

		n = nodeFactory.create( 'DOT' )
		n.addInput( 'V1', 'V2' )
		n.addOutput( 'F' )
		n._fnstr = 'return { F: input.V1[0]*input.V2[0]+input.V1[1]*input.V2[1]+input.V1[2]*input.V2[2] }'
		n.parse()
		this.nodes.push( n )

		n = nodeFactory.create( 'CONSOLE' )
		n.addInput( 'LOG' )
		n._fnstr = 'console.log( input.LOG )'
		n.parse()
		this.nodes.push( n )

		n = nodeFactory.create( 'BUFFER GEOMETRY' )
		n.addInput( 'U', 'V', 'W' )
		n.addOutput( 'VEC3' )
		n._fnstr = 'return { VEC3: [ input.U, input.V, input.W ] }'
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

	computeTopologicalOrder() {
		let sorted = this.computeToposort( this.connections )
		this.nodes.forEach( n => { n.order = sorted.indexOf( n.uuid ) } )
	}

	run() {
		this.nodes.sort( ( a, b ) => { return a.order - b.order } )
		this.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
			n.parse()
			n.execute()
		} )
	}

}
