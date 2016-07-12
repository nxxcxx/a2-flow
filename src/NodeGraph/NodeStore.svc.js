import { Injectable } from '@angular/core'

@Injectable()
export class NodeStoreService {

	constructor() {
		console.log( 'NodeStoreService' )
		this.viewportElem = null
		this.containerElem = null
		this.nodes = []
		this.connections = []
		this.connectingIO = { src: null, dst: null }
		this.isConnecting = false
		this.selectedNode = null
		this.codeMirror = null
		this.renderer = null
		this.zoomFactor = 1.0
	}

}
