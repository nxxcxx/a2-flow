import { Injectable, NgZone } from '@angular/core'

@Injectable()
export class NodeEngineService {

	constructor( zone: NgZone ) {

		console.log( 'NodeEngineService' )
		this._reg = null
		this.zone = zone
		this.requestAnimationFrameId = null

	}

	sortNodes() {
		let sorted = this._reg.request( 'NodeConnection' ).computeToposort()
		this._reg.request( 'NodeGraph' ).nodes.forEach( n => { n.order = sorted.indexOf( n.uuid ) } )
		this._reg.request( 'NodeGraph' ).nodes.sort( ( a, b ) => { return a.order - b.order } )
	}

	parse() {
		this.sortNodes()
		this._reg.request( 'NodeGraph' ).nodes.forEach( n => {
			n.parse()
		} )
	}

	createInjectionObject() {
		let rendererSize = this._reg.request( 'NodeGraph' ).renderer.getSize()
		return {
			renderer: this._reg.request( 'NodeGraph' ).renderer,
			width: rendererSize.width,
			height: rendererSize.height
		}
	}

	step() {
		if ( this.requestAnimationFrameId === null ) {
			this._reg.request( 'NodeGraph' ).nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
				n.execute( this.createInjectionObject() )
			} )
		}
	}

	run() {
		STATS.begin()
		this._reg.request( 'NodeGraph' ).nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
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
			for ( let n of this._reg.request( 'NodeGraph' ).nodes ) {
				n.flush()
				n.flushOutput()
			}
		} catch ( ex ) {
			console.warn( ex )
		}
	}

}
