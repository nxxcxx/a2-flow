import { Injectable, ChangeDetectorRef } from '@angular/core'
import nodeFactory from 'src/NodeGraph/NodeFactory'

@Injectable()
export class NodeIMService {

	constructor( changeDetectorRef: ChangeDetectorRef ) {
		console.log( 'NodeIMService' )
		this._reg = null
		this.changeDetectorRef = changeDetectorRef
	}

	exportGraphConfiguration() {
		// TODO: the position export should be relative to zoom factor & scroll position?
		let graph = { nodes: [], connections: [] }
		for ( let node of this._reg.request( 'NodeGraph' ).nodes ) {
			let nodeObject = { input: [], output: [] }
			nodeObject.name = node.name
			nodeObject.uuid = node.uuid
			nodeObject.position = { x: ~~node.position.x, y: ~~node.position.y }
			nodeObject._fnstr = node._fnstr
			nodeObject.input = node.input.map( inp => ( { name: inp.name, uuid: inp.uuid } ) )
			nodeObject.output = node.output.map( opt => ( { name: opt.name, uuid: opt.uuid } ) )
			graph.nodes.push( nodeObject )
		}
		for ( let connection of this._reg.request( 'NodeGraph' ).connections ) {
			graph.connections.push( { output: connection[ 0 ].uuid, input: connection[ 1 ].uuid } )
		}
		graph = JSON.stringify( graph, null, 2 )
		let win = window.open()
		win.document.open()
		win.document.write( '<html><body><pre>' + graph + '</pre></body></html>' )
		win.document.close()
	}

	importGraphConfiguration() {

		// TODO: clean up existing nodes & connections, async
		let graph = JSON.parse( require( '!raw!src/test_mockup.json' ) )
		let nodes = []
		let uuid_io_map = {}
		for ( let node of graph.nodes ) {
			let nm = new nodeFactory.Node( node.name )
			nm._fnstr = node._fnstr
			nm.position = node.position
			for ( let input of node.input ) {
				let io = new nodeFactory.Input( input.name, nm )
				io.uuid = input.uuid
				uuid_io_map[ input.uuid ] = io
				nm.input.push( io )
			}
			for ( let output of node.output ) {
				let io = new nodeFactory.Output( output.name, nm )
				io.uuid = output.uuid
				uuid_io_map[ output.uuid ] = io
				nm.output.push( io )
			}
			nodes.push( nm )
		}
		this._reg.request( 'NodeGraph' ).nodes = nodes
		// need to trigger update before adding connections
		this.changeDetectorRef.detectChanges()
		for ( let conn of graph.connections ) {
			let output = uuid_io_map[ conn.output ]
			let input = uuid_io_map[ conn.input ]
			this._reg.request( 'NodeConnection' ).connectIO( output, input )
		}

	}

}
