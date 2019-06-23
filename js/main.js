var yourAudio = document.getElementById('myAudio'),
	ctrl = document.getElementById('button'),
	isPlaying = false;

ctrl.onclick = function () {
	context.resume();
	if (isPlaying) {
		yourAudio.pause();
		isPlaying = false;
	} else {
		yourAudio.play();
		isPlaying = true;
	}
};

//

var container,
    camera, 
	scene, 
	renderer,
	windowHalfX = window.innerWidth / 2,
	windowHalfY = window.innerHeight / 2,
	object;

init();
animate();

//Initializes three canvas - doesnt loop

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
	//loading bar in console
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

	//

	window.addEventListener( 'resize', onWindowResize, false );

};

// Window resize response
function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

};

// Animate (loops)
function animate() {
	requestAnimationFrame( animate );
	render();

};

// AUDIO FUNCTION

//WebAudio API Audio Context
const context = new AudioContext();
//Source for audio data to be analysed
let src = context.createMediaElementSource(yourAudio);
//Creates analyser
const analyser = context.createAnalyser();

//Connects the audio source data to the analyser (WebAudio)
src.connect(analyser);
//Connects the output of the analyser to the output of the webpage (WebAudio)
analyser.connect(context.destination);

// Number of frequncy ranges (bars) to analyse
analyser.fftSize = 32;

var currentScalar = 0,
	newScalar = 0;

function renderAudioStats(){
	
	var bufferLength = analyser.frequencyBinCount;
	var dataArray = new Uint8Array(bufferLength);

	// CALL THIS TO GET NEW VOLUME LEVEL
	analyser.getByteFrequencyData(dataArray);
		
	var newScalar = dataArray[2] + dataArray[12],
	//Reduces volume scalar to a value between 0 and 1 for BezierEasing to process
		newScalar = (newScalar / 255);
		
	// Prepares scalar for use, so scale is never below 0.5 or greater than 2.5
	var processedEasing = (newScalar + 0.5);
	
	if (processedEasing > 1.5) {
		object.scale.setScalar(processedEasing * 1.5);
	} else {
		object.scale.setScalar(1);
	}
	
	// Calls function every frame
	requestAnimationFrame(renderAudioStats);
};

// Render (loops)
function render() {

	// Calls Audio Visualization Function every frame
	requestAnimationFrame(renderAudioStats);
	
	//object.scale.setScalar(scalar * 0.05);

	
	if (isPlaying) {
				
		var x = camera.position.x;
		var z = camera.position.z;
	
		camera.position.x = x * Math.cos(0.01) + z * Math.sin(0.01);
		camera.position.z = z * Math.cos(0.01) - x * Math.sin(0.01);

		camera.lookAt( scene.position );
	};
	renderer.render( scene, camera );

};