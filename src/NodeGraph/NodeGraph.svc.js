import { Injectable, NgZone, ChangeDetectorRef } from '@angular/core'
import nodeFactory from 'src/NodeGraph/NodeFactory'
import toposort from 'toposort'
import $ from 'jquery'
import { NodeStoreService } from 'src/NodeGraph/NodeStore.svc'

// CodeMirror ( import order is important )
import CodeMirror from 'codemirror'
import 'root/node_modules/codemirror/mode/javascript/javascript.js'
import 'root/node_modules/codemirror/keymap/vim.js'
import 'root/node_modules/codemirror/lib/codemirror.css'

@Injectable()
export class NodeGraphService {

	constructor( _store: NodeStoreService, zone: NgZone, changeDetectorRef: ChangeDetectorRef ) {
		this._store = _store
		this.zone = zone
		this.changeDetectorRef = changeDetectorRef
		this.viewportElem = null
		this.containerElem = null
		this.nodes = []
		this.connections = []
		this.connectingIO = { src: null, dst: null }
		this.isConnecting = false
		this.selectedNode = null
		this.codeMirror = null
		this.zoomFactor = 1.0
		this.requestAnimationFrameId = null
		this.renderer = null
		window.NGS= this
	}

	registerRenderer( renderer ) {
		this.renderer = renderer
	}

	registerViewportElem( viewportElem ) {
		this.viewportElem = $( viewportElem )
	}

	getViewportElem() {
		return this.viewportElem
	}

	setNodeContainerElem( containerElem ) {
		this.containerElem = $( containerElem )
	}

	getNodeContainerElem() {
		return this.containerElem
	}

	getNodeContainerTransformationMatrix() {
		return this.containerElem.css( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
	}

	initEditor( textareaElem ) {
		let cm = this.codeMirror = CodeMirror.fromTextArea( textareaElem, {
			lineNumbers: true,
			mode: 'javascript',
			keyMap: 'vim',
			theme: 'black',
			tabSize: 2
		} )
		cm.setSize( '100%', 460 )
		cm.on( 'change', cm => {
			if ( !this.selectedNode ) return
			this.selectedNode._fnstr = cm.doc.getValue()
		} )
		window.CM = cm
		cm.constructor.Vim.map( 'jj', '<Esc>', 'insert' )
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

	clearSelectedNode() {
		this.selectedNode = null
	}

	isConnectionExists( output, input ) {
		return this.connections.find( io => io[ 0 ] === output && io[ 1 ] === input ) !== undefined
	}

	isValidConnection( output, input ) {
		return (
			output instanceof nodeFactory.Output &&
			input instanceof nodeFactory.Input &&
			output.parent.uuid !== input.parent.uuid &&
			!this.isConnectionExists( output, input ) &&
			!this.isConnectionCyclic( output, input )
		)
	}

	connectIO( output, input ) {
		if ( this.isValidConnection( output, input ) ) {
			this._disconnectInput( input )
			input.connect( output )
			this.connections.push( [ output, input ] )
		}
	}

	disconnectIO( io ) {
		if ( io instanceof nodeFactory.Input ) {
			this._disconnectInput( io )
		} else if ( io instanceof nodeFactory.Output ) {
			// need to make a new copy because cannot call _disconnectInput inside a loop
			for ( let input of [ ...io.input] ) {
				this._disconnectInput( input )
			}
		}
	}

	_disconnectInput( input ) {
		input.disconnect()
		this.connections = this.connections.filter( io => io[ 1 ] !== input )
	}

	startConnectingIO( io )  {
		this.connectingIO.src = io
		this.isConnecting = true
	}

	endConnectingIO( io ) {
		let cio = this.connectingIO
		cio.dst = io
		if ( cio.src instanceof nodeFactory.Output ) this.connectIO( cio.src, cio.dst )
		else if ( cio.src instanceof nodeFactory.Input ) this.connectIO( cio.dst, cio.src )
		cio.src = cio.dst = null
		this.isConnecting = false
	}

	isConnectionCyclic( output, input ) {
		let testCase = [ ...this.connections, [ output, input ] ]
		try { this.computeToposort( testCase ) }
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

	createInjectionObject() {
		let rendererSize = this.renderer.getSize()
		return {
			renderer: this.renderer,
			width: rendererSize.width,
			height: rendererSize.height
		}
	}

	step() {
		if ( this.requestAnimationFrameId === null ) {
			this.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
				n.execute( this.createInjectionObject() )
			} )
		}
	}

	run() {
		STATS.begin()
		this.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
			n.execute( this.createInjectionObject() )
		} )
		STATS.end()
		this.requestAnimationFrameId = window.requestAnimationFrame( this.run.bind( this ) ).data.handleId
	}

	loopStart() {
		if ( this.requestAnimationFrameId === null ) {
			this.zone.runOutsideAngular( () => {
				this.run()
			} )
		}
	}

	loopStop() {
		if ( this.requestAnimationFrameId !== null ) {
			window.cancelAnimationFrame( this.requestAnimationFrameId )
			this.requestAnimationFrameId = null
		}
	}

	flushNodesData() {
		try {
			for ( let node of this.nodes ) {
				node.flush()
			}
		} catch ( ex ) {
			console.warn( ex )
		}
	}

	exportGraphConfiguration() {
		// TODO: the position export should be relative to zoom factor & scroll position?
		let graph = { nodes: [], connections: [] }
		for ( let node of this.nodes ) {
			let nodeObject = { input: [], output: [] }
			nodeObject.name = node.name
			nodeObject.uuid = node.uuid
			nodeObject.position = { x: ~~node.position.x, y: ~~node.position.y }
			nodeObject._fnstr = node._fnstr
			nodeObject.input = node.input.map( inp => ( { name: inp.name, uuid: inp.uuid } ) )
			nodeObject.output = node.output.map( opt => ( { name: opt.name, uuid: opt.uuid } ) )
			graph.nodes.push( nodeObject )
		}
		for ( let connection of this.connections ) {
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
		this.nodes = nodes
		// need to trigger update before adding connections
		this.changeDetectorRef.detectChanges()
		for ( let conn of graph.connections ) {
			let output = uuid_io_map[ conn.output ]
			let input = uuid_io_map[ conn.input ]
			this.connectIO( output, input )
		}

	}

	// TODO:
	// addNewNode( name, type ) {}
	// deleteNode( node ) {}
	// addNewIO( node, type, name ) {}
	// deleteIO( node, type, name ) {}

	deleteIOByReference( io ) {
		this.disconnectIO( io )
		let node = this.nodes.find( node => !!node.input.find( inp => inp === io ) || !!node.output.find( opt => opt === io ) )
		node && node.deleteIO( io )
	}

	addNewNode( name ) {
		let n = new nodeFactory.Node( name )
		this.nodes.push( n )
	}

	deleteNode( node ) {
		for ( let io of [ ...node.output, ...node.input ] ) {
			this.disconnectIO( io )
		}
		this.nodes = this.nodes.filter( n => n !== node )
	}

	addNewIO( node, type, name ) {
		let op = [ 'addOutput', 'addInput' ]
		node[ op[ type ] ]( name )
	}

	createTestNode() {
		function genID() {
			let id = String.fromCharCode( Math.floor( Math.random() * 23 ) + 65 ) + ~~( Math.random() * 9 )
			return id
		}
		let n = new nodeFactory.Node( genID() )
		let [ ilen, olen ] = [ ~~( Math.random() * 6 ), ~~( Math.random() * 6 ) ]
		for ( let i = 0; i < ilen; i ++ ) n.addInput( genID() )
		for ( let i = 0; i < olen; i ++ ) n.addOutput( genID() )
		this.nodes.push( n )
	}

}
