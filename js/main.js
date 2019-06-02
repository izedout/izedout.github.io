var yourAudio = document.getElementById('myAudio'),
	ctrl = document.getElementById('button'),
	isPlaying = false;

ctrl.onclick = function () {
	if (isPlaying) {
		yourAudio.pause();
		isPlaying = false;
	} else {
		yourAudio.play();
		isPlaying = true;
	}
};

//

var container;

var camera, scene, renderer;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var object;

init();
animate();


function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = 10;

	// scene

	scene = new THREE.Scene();

	var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
	scene.add( ambientLight );

	var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	camera.add( pointLight );
	scene.add( camera );

	// manager

	function loadModel() {

		object.traverse( function ( child ) {

			if ( child.isMesh ) child.material.map = texture;

		} );

		object.position.y = 0;
		scene.add( object );

	}

	var manager = new THREE.LoadingManager( loadModel );

	manager.onProgress = function ( item, loaded, total ) {

		console.log( item, loaded, total );

	};

	// texture

	var textureLoader = new THREE.TextureLoader( manager );

	var texture = textureLoader.load( 'textures/UV_Grid_Sm.jpg' );

	// model

	function onProgress( xhr ) {

		if ( xhr.lengthComputable ) {

			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );

		}

	}

	function onError() {}

	var loader = new THREE.OBJLoader( manager );

	loader.load( 'models/obj/low poly brain only.obj', function ( obj ) {

		object = obj;

	}, onProgress, onError );

	//

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	//document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	//document.addEventListener( 'timeadvance', getMilliseconds(), 0 );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//
function animate() {
	requestAnimationFrame( animate );
	render();

}

function render() {

	if (isPlaying) {
		var x = camera.position.x;
		var z = camera.position.z;
	
		camera.position.x = x * Math.cos(0.01) + z * Math.sin(0.01);
		camera.position.z = z * Math.cos(0.01) - x * Math.sin(0.01);

		camera.lookAt( scene.position );
	};
	renderer.render( scene, camera );

}