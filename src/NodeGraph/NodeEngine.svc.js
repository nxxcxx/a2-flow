import { Injectable, NgZone } from '@angular/core'

@Injectable()
export class NodeEngineService {

	constructor( zone: NgZone ) {
		this._reg = null
		this.zone = zone
		this.requestAnimationFrameId = null
	}

	sortNodes() {
		let sorted = this._reg.request( 'NodeConnection' ).computeToposort()
		this._store.nodes.forEach( n => { n.order = sorted.indexOf( n.uuid ) } )
		this._store.nodes.sort( ( a, b ) => { return a.order - b.order } )
	}

	parse() {
		this.sortNodes()
		for ( let node of this._store.nodes ) {
			node.parse()
		}
	}

	createInjectionObject() {
		let rendererSize = this._store.renderer.getSize()
		return {
			renderer: this._store.renderer,
			width: rendererSize.width,
			height: rendererSize.height
		}
	}

	step() {
		if ( this.requestAnimationFrameId === null ) {
			this._store.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
				n.execute( this.createInjectionObject() )
			} )
		}
	}

	run() {
		STATS.begin()
		this._store.nodes.filter( n => { return n.order !== -1 } ).forEach( n => {
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
			for ( let n of this._store.nodes ) {
				n.flush()
				n.flushOutput()
			}
		} catch ( ex ) {
			console.warn( ex )
		}
	}

}
