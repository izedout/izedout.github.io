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

	//document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	//document.addEventListener( 'timeadvance', getMilliseconds(), 0 );

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

const context = new AudioContext();
let src = context.createMediaElementSource(yourAudio);
const analyser = context.createAnalyser();

src.connect(analyser);
analyser.connect(context.destination);

// Number of frequncy ranges (bars)
analyser.fftSize = 32;

var currentScalar = 0;
var newScalar = 0;
//var bufferLength;

function renderAudioStats(){
	
	var bufferLength = analyser.frequencyBinCount;
	var dataArray = new Uint8Array(bufferLength);
	//console.log('DATA-ARRAY: ', dataArray)

	// CALL THIS TO GET NEW VOLUME LEVEL
	analyser.getByteFrequencyData(dataArray);
	//console.log(dataArray);
	
	// Gets average volume accross all frequencies (value between 0 and 255)
	//var sum = dataArray.reduce((a, b) => a + b, 0);
	//var newScalar = sum / dataArray.length;
	
	var newScalar = dataArray[1];
	
	//Reduces volume scalar to a value between 0 and 1 for BezierEasing to process
	
	newScalar = (newScalar / 255);
	//currentScalar = currentScalar / 255; //shouldnt be needed as last value was already divided by 255
	
	// SHOULD be updating scalar variable to smoothly change towards the newscalar variable
	//var easing = ((currentScalar + newScalar) / 2);
	
	// grabs value from Bezier curve and prepares it for use to scale object
	var processedEasing = (newScalar + 0.5);
	object.scale.setScalar(processedEasing);
	bruh;
	// Resets currentScalar value for next iteration
	//currentScalar = newScalar;
	
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