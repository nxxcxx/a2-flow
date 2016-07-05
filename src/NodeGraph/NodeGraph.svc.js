import { Injectable, NgZone } from 'angular2/core'
import nodeFactory from 'src/NodeGraph/NodeFactory'
import toposort from 'toposort'
import $ from 'jquery'

// CodeMirror ( import order is important )
import CodeMirror from 'codemirror'
import 'root/node_modules/codemirror/mode/javascript/javascript.js'
import 'root/node_modules/codemirror/lib/codemirror.css'

@Injectable()
export class NodeGraphService {

	constructor( zone: NgZone ) {
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
		// this.createTestNode3()
		this.requestAnimationFrameId = null
		this.zone = zone
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
		cm.setSize( '100%', 460 )
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
		this.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
			n.execute()
		} )
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

	step() {
		if ( this.requestAnimationFrameId === null ) {
			this.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
				n.execute()
			} )
		}
	}

	flushNodesData() {
		for ( let node of this.nodes ) {
			node.flush()
		}
	}

	createTestNode3() {
		let n = nodeFactory.create( 'RENDERER' )
		n.addInput( 'Camera', 'Scene' )
		n._fnstr = `this.init = input => {
			this.renderer = new THREE.WebGLRenderer( {
				canvas: document.getElementById( 'canvas' )
			} )
			this.renderer.setClearColor( 0x29333d )
			this.renderer.clear()
		}

		this.process = input => {
			this.renderer.render( input.Scene, input.Camera )
		}

		this.flush = () => {
			this.renderer.dispose()
			this.renderer = null
			this.flushOutput()
		}`
		this.nodes.push( n )

		n = nodeFactory.create( 'SCENE' )
		n.addInput( 'Object3D' )
		n.addOutput( 'Scene' )
		n._fnstr = `this.init = input => {
			this.scene = new THREE.Scene()
			this.mesh = input.Object3D
			this.scene.add( this.mesh )
		}

		this.process = input => {
			return {
				Scene: this.scene
			}
		}

		this.flush = () => {
			this.scene.remove( this.mesh )
			this.scene = null
			this.flushOutput()
		}`
		this.nodes.push( n )

		n = nodeFactory.create( 'GEOMETRY' )
		n.addOutput( 'Geometry' )
		n._fnstr = `this.init = input => {
			this.geometry = new THREE.IcosahedronGeometry(
				600,
				1
			)
		}

		this.process = input => {
			return {
				Geometry: this.geometry
			}
		}

		this.flush = () => {
			this.geometry.dispose()
			this.geometry = null
			this.flushOutput()
		}`
		this.nodes.push( n )

		n = nodeFactory.create( 'Material' )
		n.addInput( 'Color' )
		n.addOutput( 'Material' )
		n._fnstr = `this.init = input => {
			this.material = new THREE.MeshBasicMaterial(
				{ color: 0xffffff, wireframe: true }
			)
		}

		this.process = input => {
			return {
				Material: this.material
			}
		}

		this.flush = () => {
			this.material.dispose()
			this.material = null
			this.flushOutput()
		}`
		this.nodes.push( n )

		n = nodeFactory.create( 'MESH' )
		n.addInput( 'Geometry', 'Material', 'Data' )
		n.addOutput( 'Mesh' )
		n._fnstr = `this.init = input => {
			this.mesh = new THREE.Mesh(
				input.Geometry,
				input.Material
			)
		}

		this.process = input => {
			this.mesh.rotation.y += input.Data
			return {
				Mesh: this.mesh
			}
		}

		this.flush = () => {
			this.mesh = null
			this.flushOutput()
		}`
		this.nodes.push( n )

		n = nodeFactory.create( 'DATA' )
		n.addOutput( 'X', 'Y', 'Z' )
		n._fnstr = `this.init = () => {}
		this.process = () => {
			return {
				X: Math.random() * 0.025,
				Y: Math.random(),
				Z: Math.random()
			}
		}
		this.flush = () => {
			this.flushOutput()
		}`
		this.nodes.push( n )

		n = nodeFactory.create( 'CAMERA' )
		n.addOutput( 'Camera' )
		n._fnstr = `this.init = () => {
			this.camera = new THREE.PerspectiveCamera( 75, 300 / 180, 1, 10000 )
			this.camera.position.z = 1000
		}

		this.process = () => {
			return {
				Camera: this.camera
			}
		}

		this.flush = () => {
			this.camera = null
			this.flushOutput()
		}`
		this.nodes.push( n )

	}

	exportGraphConfiguration() {
		// TODO: the position export should be relative to zoom factor & scroll position?
		let graph = { nodes: [], connections: [] }
		for ( let node of this.nodes ) {
			let nodeObject = { input: [], output: [] }
			nodeObject.name = node.name
			nodeObject.uuid = node.uuid
			nodeObject.position = node.ui.absolutePosition
			nodeObject._fnstr = node._fnstr
			for ( let input of node.input ) {
				nodeObject.input.push( {
					name: input.name,
					uuid: input.uuid
				} )
			}
			for ( let output of node.output ) {
				nodeObject.output.push( {
					name: output.name,
					uuid: output.uuid
				} )
			}
			graph.nodes.push( nodeObject )
		}
		for ( let connection of this.connections ) {
			graph.connections.push( {
				output: connection[ 0 ].uuid,
				input:  connection[ 1 ].uuid
			} )
		}
		graph = JSON.stringify( graph, null, 2 )
		let win = window.open()
		win.document.open()
		win.document.write( '<html><body><pre>' + graph + '</pre></body></html>' )
		win.document.close()
	}

	importGraphConfiguration() {

		let graph = JSON.parse( require( '!raw!src/test_mockup.json' ) )
		let nodes = []
		let uuid_io_map = {}
		for ( let node of graph.nodes ) {
			let nm = new nodeFactory.Node( node.name )
			nm._fnstr = node._fnstr
			nm.ui.absolutePosition.x = node.position.x
			nm.ui.absolutePosition.y = node.position.y
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
		this.zone.run( () => { console.log( 'this is the new $rootScope.apply()' ) } )
		for ( let conn of graph.connections ) {
			let output = uuid_io_map[ conn.output ]
			let input = uuid_io_map[ conn.input ]
			this.connectIO( output, input )
		}
		this.zone.run( () => { console.log( 'this is the new $rootScope.apply()' ) } )

	}

}
