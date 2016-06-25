import { Injectable } from 'angular2/core'
import nodeFactory from './nodeFactory'
import toposort from 'toposort'

// CodeMirror ( import order is important )
import CodeMirror from 'codemirror'
import 'root/node_modules/codemirror/mode/javascript/javascript.js'
import 'root/node_modules/codemirror/lib/codemirror.css'
// import 'root/node_modules/codemirror/theme/neo.css'

@Injectable()
export class NodeManager {

	constructor() {
		window.NM = this
		this.nodes = []
		this.connections = []
		this.connectingIO = { src: null, dst: null }
		this.selectedNode = null
		this.codeMirror = null
		// test
		this.createTestNode()

		this.linking = false
		document.addEventListener( 'mouseup', () => {
			this.linking = false
			console.log( this.linking )
		} )
	}

	initEditor( textareaElem ) {
		this.codeMirror = CodeMirror.fromTextArea( textareaElem, {
			lineNumbers: true,
			// mode: 'javascript',
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
			if ( this.testCyclicConnection( output, input ) ) return false
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
		} else {
			// need to make a new copy because cannot call disconnectInput inside a loop
			for ( let inp of Array.from( io.input ) ) {
				inp.disconnect()
				this.disconnectInput( inp )
			}
		}
	}

	disconnectInput( input ) {
		this.connections = this.connections.filter( io => io[ 1 ] !== input )
	}

	startConnectingIO( io )  {
		this.connectingIO.src = io
		// TODO: activate temp connection
		this.linking = true
	}

	endConnectingIO( io ) {
		let cio = this.connectingIO
		cio.dst = io
		if ( cio.src ) {
			if ( cio.src instanceof nodeFactory.Output ) this.connectIO( cio.src, cio.dst )
			else this.connectIO( cio.dst, cio.src )
		}
		cio.src = cio.dst = null
		// TODO: deactivate temp connection
		this.linking = false
		console.log( 'todo' )
	}

	testCyclicConnection( output, input ) {
		let test = Array.from( this.connections )
		test.push( [ output, input ] )
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
		let n = nodeFactory.create( 'Constants' )
		n.addOutput( 'x', 'y', 'z' )
		n._fnstr = 'return { x: 42, y: 33, z: 76 }'
		n.compile()
		this.nodes.push( n )

		n = nodeFactory.create( 'Vector3' )
		n.addInput( 'u', 'v', 'w' )
		n.addOutput( 'vec3' )
		n._fnstr = 'return { vec3: [ input.u, input.v, input.w ] }'
		n.compile()
		this.nodes.push( n )

		n = nodeFactory.create( 'Vector3' )
		n.addInput( 's', 't', 'p' )
		n.addOutput( 'vec3' )
		n._fnstr = 'return { vec3: [ input.s, input.t, input.p ] }'
		n.compile()
		this.nodes.push( n )

		n = nodeFactory.create( 'Dot' )
		n.addInput( 'v1', 'v2' )
		n.addOutput( 'f' )
		n._fnstr = 'return { f: input.v1[0]*input.v2[0]+input.v1[1]*input.v2[1]+input.v1[2]*input.v2[2] }'
		n.compile()
		this.nodes.push( n )

		n = nodeFactory.create( 'Console' )
		n.addInput( 'log' )
		n._fnstr = 'console.log( input.log )'
		n.compile()
		this.nodes.push( n )
	}

	computeTopologicalOrder() {
		let sorted = this.computeToposort( this.connections )
		this.nodes.forEach( n => { n.order = sorted.indexOf( n.uuid ) } )
	}

	run() {
		this.nodes.sort( ( a, b ) => { return a.order - b.order } )
		this.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
			var err = n.compile()
			if ( err ) console.error( `Node order No.${n.order}`, err )
			n.execute()
		} )
	}

}
