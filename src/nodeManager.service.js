import { Injectable } from 'angular2/core'
import nodeFactory from './nodeFactory'
import toposort from 'toposort'

@Injectable()
export class NodeManager {

	constructor() {
		this.nodes = []
		this.connections = []
		this.connectingIO = { src: null, dst: null }
		this.selectedNode = null

		// test
		this.createTestNode()
		this.createTestNode()
		this.createTestNode()
		this.createTestNode()
		this.createTestNode()
		this.createTestNode()
		this.createTestNode()
	}

	getNodes() { return this.nodes }

	getConnections() { return this.connections }

	getSelectedNode() { return this.selectedNode }

	setSelectedNode( node ) {
		this.selectedNode = node
		// bring selected node to end of array so it render last in view
		let swapIndex = this.nodes.findIndex( currentNode => currentNode === node )
		this.nodes.push( this.nodes.splice( swapIndex, 1 )[ 0 ] )
	}

	isConnectionExists( output, input ) {
		return this.connections.find( io => io[ 0 ] === output && io[ 1 ] === input ) !== undefined
	}

	isValidConnection( output, input ) {
		// for debugging
		// if ( !( output instanceof nodeFactory.Output ) ) console.warn( 'invalid output')
		// if ( !( input instanceof nodeFactory.Input ) ) console.warn( 'invalid input')
		// if ( this.isConnectionExists( output, input ) ) console.warn( 'connection already exists' )
		// if ( output.parent.uuid === input.parent.uuid ) console.warn( 'same node io' )
		// console.warn( 'cylic:', this.testCyclicConnection( output, input ) )
		if (
			( output !== input ) &&
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
	}

	endConnectingIO( io ) {
		let cio = this.connectingIO
		cio.dst = io
		if ( cio.src instanceof nodeFactory.Output ) this.connectIO( cio.src, cio.dst )
		else this.connectIO( cio.dst, cio.src )
		cio.src = cio.dst = null
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
		var n = nodeFactory.create( 'Vector3' )
		n.addInput( 'bufferGeometry', 'shader', 'modifier' )
		n.addOutput( 'vec3', 'buffer' )
		n._fnstr = ''
		n.compile()
		this.nodes.push( n )

		n = nodeFactory.create( 'BufferGeometry' )
		n.addInput( 'geometry', 'shader', 'buffer' )
		n.addOutput( 'Mesh', 'shader' )
		n._fnstr = ''
		n.compile()
		this.nodes.push( n )
	}

}
