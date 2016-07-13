class NodeGroup {

	constructor() {

		this.name = ''
		this.upstreamRef = [] // array of Input reference
		this.downstreamRef = [] // array of Output reference
		this.children = [] // array of Node / NodeGroup

	}

	addUpstreamRef( input ) {
		this.upstreamRef.push( input )
	}

}
