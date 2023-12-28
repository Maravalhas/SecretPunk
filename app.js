import { PointerLockControls } from './libs/pointerlock.js'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


//Animation Variables
let canvas, camera, renderer, loader, scene, controls, currentScene


//Objects Variables
let player, intersects, finalObject, time, loadingText, pointerPivot, pointer ,rotateHologram, loadingBlock

let loadedScenes = [false,false,false,false,false]
let trophySceneHeight = [2.030,1.650,1.150]

//Pre-defined information
let timer = 0
let timeToWin = 60
let endTime = 0
let loaded = 0
let lastLoaded = 0
let win = false


//GLFT OBJECTS
let sceneObjects = [6,7,7]
let planta,mascara,robot,xadrez,holograma,trofeu
let cesto, creme, papel, secador, spray, wig
let almofada,braço,gameboy,monitor,pistola,vr
let firstSceneObjectNames = ["Planta","Mascara","Robô","Xadrez","Holograma"]
let secondSceneObjectNames = ["Cesto", "Espuma", "Papel", "Secador", "Spray", "Estátua"]
let thirdSceneObjectNames = ["Almofada","Braço","Game-boy","Monitor","Pistola","Óculos VR"]
let selectableObjects = [] 
let text = []
let acceleration = 0.005


//Controlls
let moveForward = false
let moveBackward = false
let moveLeft = false
let moveRight = false
let mouse = new THREE.Vector2()
mouse.x = 0
mouse.y = 0
const velocity = new THREE.Vector3()
const direction = new THREE.Vector3()


function init(){

    canvas = document.getElementById("webGLCanvas")

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    /* Renderer */
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
    renderer.setSize(canvas.width, canvas.height)

    currentScene = 1

    createFirstScene()
    animate()
    click()
}


//Return objects by identification

function returnObjectById(id){

    return selectableObjects.find(object=> object.id == id)
}


//Get INPUTS

window.addEventListener('keydown',keyPressed)
window.addEventListener('keyup',keyLeft)

//Handle Inputs

function keyPressed(e){

    switch ( e.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = true;
            break;

        case 37: // left
        case 65: // a
            moveLeft = true;
            break;

        case 40: // down
        case 83: // s
            moveBackward = true;
            break;

        case 39: // right
        case 68: // d
            moveRight = true;
            break;
    }
}

function keyLeft(e){

    switch ( e.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = false;
            break;

        case 37: // left
        case 65: // a
            moveLeft = false;
            break;

        case 40: // down
        case 83: // s
            moveBackward = false;
            break;

        case 39: // right
        case 68: // d
            moveRight = false;
            break;
        }
}


//Handle Clicks
function click(){
    window.addEventListener( 'click', function () {

        if(controls.isLocked){

            let raycaster = new THREE.Raycaster()

            raycaster.setFromCamera(mouse,camera)

            intersects = raycaster.intersectObjects(selectableObjects, true)  

            if(intersects.length > 0){
    
                let objectToRemove = intersects[0].object
                
                while(objectToRemove.parent != scene){
                    objectToRemove = objectToRemove.parent
                } 

                finalObject = returnObjectById(objectToRemove.id)
            }

        }
        else{
            if(loaded === true){
                controls.lock() 
                if(time == undefined){
                    time = setInterval(handleTimer, 1000)
                }
            }
        }

    }, false )
}


//Load First Scene


function createFirstScene(){

    loadedScenes[0] = true

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 8

    controls = new PointerLockControls( camera, document.body )

    scene.background = new THREE.Color( 0x87ceeb )

    const loaderFont = new THREE.FontLoader()

    //Criar Loading Screen

    loaderFont.load('fonts/Roboto_Regular.json', function(font){

        loadingText = new THREE.Mesh(new THREE.TextGeometry("Loading",{font: font, size: 0.3, height: 0.01}), new THREE.MeshBasicMaterial({color:0xffffff}))
        loadingText.position.set(25,8,-25)
        scene.add(loadingText)
    })

        let geometry4 = new THREE.CubeGeometry(0.25,0.25,0.25)
        let material4 = new THREE.MeshBasicMaterial({visible:true,color:0xffffff})
        loadingBlock = new THREE.Mesh(geometry4, material4)
        loadingBlock.position.set(24.75,7,-25)
        scene.add(loadingBlock)

    //Carregar texto na tv

    for(let i = 0; i < firstSceneObjectNames.length; i++){

        loaderFont.load('fonts/Roboto_Regular.json', function(font){

            text[i] = new THREE.Mesh(new THREE.TextGeometry(`${firstSceneObjectNames[i]}`,{font: font, size: 0.3, height: 0.01}), new THREE.MeshBasicMaterial({color:0xffffff}))
            scene.add(text[i])
            text[i].rotation.y = -1.050

            i % 2 == 0 ? text[i].position.set(9.240,4.370 - i * 0.25,-13.980) : text[i].position.set(10.410,4.370 - (i - 1) * 0.25,-11.880)
        })
    }


    /* Criar Luz Ambiente */
    const ambient = new THREE.AmbientLight(0x404040, 2)
    scene.add(ambient)

    /* Criar Luz Direcional */
    const light = new THREE.DirectionalLight(0xffffff, 2)
    light.position.set(50, 50, 100)
    scene.add(light)

    let geometry = new THREE.CubeGeometry(1, 3, 1)
    let material = new THREE.MeshNormalMaterial({visible:false})
    player = new THREE.Mesh(geometry, material)
    scene.add(player)

    loader = new GLTFLoader()

    /* Carregar a sala */
    loader.load("sceneLevelOne/house/scene.gltf", function(gltf) {
        scene.add(gltf.scene);
        gltf.scene.position.set(-5.390, -0.290, -4.640);
        gltf.scene.rotation.set(0, 0.5, 0)
        loaded++
    })

    //Criar Relogio

    const geometry2 = new THREE.CircleGeometry( 1.25, 32 );
    const material2 = new THREE.MeshBasicMaterial( { color: 0x8b5a2b } );
    const clock = new THREE.Mesh( geometry2, material2 );
    clock.position.set(5.740,6.230,-16.870)
    clock.rotation.y = 0.495
    scene.add( clock )

    pointerPivot = new THREE.Object3D()
    clock.add(pointerPivot)

    const geometry3 = new THREE.CubeGeometry(0.1, 1, 0.1)
    const material3 = new THREE.MeshBasicMaterial( { color: 0x000000 } )
    pointer = new THREE.Mesh(geometry3,material3)
    pointer.position.y = 0.5
    pointerPivot.add( pointer )

    /* Carregar a planta*/
    loader.load("sceneLevelOne/planta/scene.gltf", function(gltf) {
        planta = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */
        planta.position.set(-2.670, 0.480, -11.320)
        planta.rotation.set(-4.659, -Math.PI, 0.000)
        planta.scale.set(0.3, 0.3, 0.3)
        scene.add(planta)
        loaded++
    }) 

    /* Carregar a mascara*/
    loader.load("sceneLevelOne/mascara/scene.gltf", function(gltf) {
        mascara = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */
        mascara.position.set(13.310, 5.780, -9.350)
        mascara.rotation.set(4.600, 0, -1.030)
        mascara.scale.set(0.010, 0.010, 0.010)
        scene.add(mascara);
        loaded++
    })

    /* Carregar o robot*/
    loader.load("sceneLevelOne/robot/scene.gltf", function(gltf) {
        robot = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */
        robot.position.set(7.48, 0.65, -15.720)
        robot.rotation.set(-1.523, -0.08, -0.71)
        robot.scale.set(0.300, 0.300, 0.300)
        scene.add(robot)
        loaded++
    })

    /* Carregar o xadrez*/
    loader.load("sceneLevelOne/xadrez/scene.gltf", function(gltf) {
        xadrez = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */
        xadrez.position.set(-3.990, 2.09, -7.14)
        xadrez.rotation.set(-1.54, 0, 1.08)
        xadrez.scale.set(1, 1, 1)
        scene.add(xadrez)
        loaded++
    })

    /* Carregar o holograma*/
    loader.load("sceneLevelOne/holograma/scene.gltf", function(gltf) {
        holograma = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */
        holograma.position.set(6.33, 1.18, -10.170)
        holograma.rotation.set(-1.510, 0, -1.030)
        holograma.scale.set(0.005, 0.005, 0.005)
        scene.add(holograma)
        loaded++
    })

    //Carregar Trofeu
    loader.load("./sceneLevelOne/trofeu/scene.gltf", function(gltf) {
            
        trofeu = gltf.scene.children[0]
        scene.add(trofeu)
        trofeu.position.y = 200
    })
}


//Load Second Scene


function createSecondScene(){

    loadedScenes[1] = true

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 8

    controls = new PointerLockControls( camera, document.body )

    /* Criar Luz Ambiente */
    const ambient = new THREE.AmbientLight(0x404040, 2)
    scene.add(ambient)

    /* Criar Luz Direcional */
    const light = new THREE.DirectionalLight(0xffffff, 2)
    light.position.set(50, 50, 100)
    scene.add(light)

    loader.load("sceneLevelTwo/Banho/scene_Bath.gltf", function(gltf) {
        scene.add(gltf.scene);
        gltf.scene.position.set(-5.390, -0.290, -4.640);
        gltf.scene.rotation.set(0, 0.5, 0);
        loaded++
    })

    //Criar Loading Screen

    const loaderFont = new THREE.FontLoader()

    loaderFont.load('fonts/Roboto_Regular.json', function(font){

        loadingText = new THREE.Mesh(new THREE.TextGeometry("Loading",{font: font, size: 0.3, height: 0.01}), new THREE.MeshBasicMaterial({color:0xffffff}))
        loadingText.position.set(25,8,-25)
        scene.add(loadingText)
    })

    loadingBlock.position.set(24.75,7,-25)
    scene.add(loadingBlock)
    
    for(let i = 0; i < secondSceneObjectNames.length; i++){

        loaderFont.load('fonts/Roboto_Regular.json', function(font){

            text[i] = new THREE.Mesh(new THREE.TextGeometry(`${secondSceneObjectNames[i]}`,{font: font, size: 0.3, height: 0.01}), new THREE.MeshBasicMaterial({color:0xffffff}))
            scene.add(text[i])
            text[i].rotation.y = 0.510

            i % 2 == 0 ? text[i].position.set(1.240,7.340 - i * 0.25,-14.110) : text[i].position.set(3.930,7.340 - (i - 1) * 0.25,-15.610)
        })
    }


    //Criar Relogio

    const geometry2 = new THREE.CircleGeometry( 1.25, 32 );
    const material2 = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    const clock = new THREE.Mesh( geometry2, material2 );
    clock.position.set(9.230,7.120,-16.400)
    clock.rotation.y = -1.035
    scene.add( clock )

    clock.add(pointerPivot)

    const geometry3 = new THREE.CubeGeometry(0.1, 1, 0.1)
    const material3 = new THREE.MeshBasicMaterial( { color: 0x000000 } )
    pointer = new THREE.Mesh(geometry3,material3)
    pointer.position.y = 0.5
    pointerPivot.add( pointer )

    /* Carregar o Cesto */
    loader.load("sceneLevelTwo/cesto/scene.gltf", function(gltf) {
        cesto = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        cesto.position.set(1.041, 0, -3.890)
        cesto.rotation.set(-1.517, 0, 0)
        cesto.scale.set(1, 1, 1)
        scene.add(cesto)
        loaded++
    })


    loader.load("sceneLevelTwo/creme/scene.gltf", function(gltf) {
        creme = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        creme.position.set(4.710, 1.680, -15.410)
        creme.rotation.set(-1.517, 0, -3.142)
        creme.scale.set(0.100, 0.100, 0.100)
        scene.add(creme)
        loaded++
    })

    loader.load("sceneLevelTwo/papel/scene.gltf", function(gltf) {
        papel = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */
        
        papel.position.set(7, 1.270, -14.920)
        papel.rotation.set(-1.517, 0, -3.591)
        papel.scale.set(0.001, 0.001, 0.001)
        scene.add(papel)
        loaded++
    })


    loader.load("sceneLevelTwo/secador/scene.gltf", function(gltf) {
        secador = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        secador.position.set(-1.080, 0.440, -7.600)
        secador.rotation.set(0.153, -1.160, -3.521)
        secador.scale.set(0.100, 0.100, 0.100)
        scene.add(secador)
        loaded++
    })

    loader.load("sceneLevelTwo/spray/scene.gltf", function(gltf) {
        spray = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        spray.position.set(8.590, 2.920, -15.420)
        spray.rotation.set(-1.517, 0, -3.142)
        spray.scale.set(0.150, 0.150, 0.150)
        scene.add(spray)
        loaded++
    })


    loader.load("sceneLevelTwo/wig/scene.gltf", function(gltf) {
        wig = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        wig.position.set(18.390, 3.430, 5.200)
        wig.rotation.set(-1.517, 0.070, -1.059)
        wig.scale.set(0.001, 0.001, 0.001)
        scene.add(wig)
        loaded++
    })

    //Carregar Trofeu
    loader.load("./sceneLevelOne/trofeu/scene.gltf", function(gltf) {
            
        trofeu = gltf.scene.children[0]
        scene.add(trofeu)
        trofeu.position.y = 200
    })
}


//Load Third Scene


function createThirdScene(){

    loadedScenes[2] = true

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 8

    controls = new PointerLockControls( camera, document.body )

    const ambient = new THREE.AmbientLight(0x404040, 2)
    scene.add(ambient)

    /* Criar Luz Direcional */
    const light = new THREE.DirectionalLight(0xffffff, 2)
    light.position.set(50, 50, 100)
    scene.add(light)

    loader.load("sceneLevelThree/quarto/scene_bed.gltf", function(gltf) {
        scene.add(gltf.scene);
        gltf.scene.position.set(-5.390, -0.290, -4.640);
        gltf.scene.rotation.set(0, 0.5, 0);
        loaded++
    })

    //Criar Loading Screen

    const loaderFont = new THREE.FontLoader()

    loaderFont.load('fonts/Roboto_Regular.json', function(font){

        loadingText = new THREE.Mesh(new THREE.TextGeometry("Loading",{font: font, size: 0.3, height: 0.01}), new THREE.MeshBasicMaterial({color:0xffffff}))
        loadingText.position.set(25,8,-25)
        scene.add(loadingText)
    })

    loadingBlock.position.set(24.75,7,-25)
    scene.add(loadingBlock)
    
    for(let i = 0; i < thirdSceneObjectNames.length; i++){

        loaderFont.load('fonts/Roboto_Regular.json', function(font){

            text[i] = new THREE.Mesh(new THREE.TextGeometry(`${thirdSceneObjectNames[i]}`,{font: font, size: 0.3, height: 0.01}), new THREE.MeshBasicMaterial({color:0xffffff}))
            scene.add(text[i])
            text[i].rotation.y = -1.050

            i % 2 == 0 ? text[i].position.set(5.340,9.370 - i * 0.25,-8.400) : text[i].position.set(6.770,9.370 - (i - 1) * 0.25,-5.940)
        })
    }


    //Criar Relogio

    const geometry2 = new THREE.CircleGeometry( 1.25, 32 );
    const material2 = new THREE.MeshBasicMaterial( { color: 0x296d68} );
    const clock = new THREE.Mesh( geometry2, material2 );
    clock.position.set(-11.020,4.6,-9.030)
    clock.rotation.y = 0.495
    scene.add( clock )

    clock.add(pointerPivot)

    const geometry3 = new THREE.CubeGeometry(0.1, 1, 0.1)
    const material3 = new THREE.MeshBasicMaterial( { color: 0x000000 } )
    pointer = new THREE.Mesh(geometry3,material3)
    pointer.position.y = 0.5
    pointerPivot.add( pointer )

    //carregar almofada

    loader.load("sceneLevelThree/almofada/scene.gltf", function(gltf) {
        almofada = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        almofada.position.set(-9.559, 0.890, -3.890)
        almofada.rotation.set(-3.217, 0, 0)
        almofada.scale.set(0.500, 0.500, 0.500)
        scene.add(almofada)
        loaded++
    })

    //carregar braço

    loader.load("sceneLevelThree/braço/scene.gltf", function(gltf) {

        braço = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        braço.position.set(2.060, 1.280, -9.990)
        braço.rotation.set(-1.517, 0, 3.142)
        braço.scale.set(0.050, 0.050, 0.050)
        scene.add(braço)
        loaded++
    })

    //carregar gameboy

    loader.load("sceneLevelThree/game_Boy/scene.gltf", function(gltf) {
        gameboy = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        gameboy.position.set(-1.140, 1.020, 0)
        gameboy.rotation.set(-1.517, 0, 3.142)
        gameboy.scale.set(5, 5, 5)
        scene.add(gameboy)
        loaded++
    })

    //carregar monitor

    loader.load("sceneLevelThree/monitor/scene.gltf", function(gltf) {
        monitor = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        monitor.position.set(-13.760, 3.350, -7.890)
        monitor.rotation.set(-1.670, -0.020, 0.050)
        monitor.scale.set(1, 1, 1)
        scene.add(monitor)
        loaded++
    })

    //carregar pistola

    loader.load("sceneLevelThree/pistola/scene.gltf", function(gltf) {
        pistola = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        pistola.position.set(2.660, 7.080, -12.800)
        pistola.rotation.set(-1.517, 0, 1.981)
        pistola.scale.set(0.005, 0.005, 0.005)
        scene.add(pistola)
        loaded++
    })

    //carregar vr

    loader.load("sceneLevelThree/vr/scene.gltf", function(gltf) {
        vr = gltf.scene.children[0] /* Children que contem o objecto para podermos controlar a posicao e rotacao */

        vr.position.set(-2.810, 1.480, -12.130)
        vr.rotation.set(-1.517, 0.070, -1.059)
        vr.scale.set(0.500, 0.500, 0.500)
        scene.add(vr)
        loaded++
    })

    //Carregar Trofeu
    loader.load("./sceneLevelOne/trofeu/scene.gltf", function(gltf) {
            
        trofeu = gltf.scene.children[0]
        scene.add(trofeu)
        trofeu.position.y = 200
    })
}


//Load Win SCENE


function createWinScene(){

    loadedScenes[3] = true

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 8

    controls = new PointerLockControls( camera, document.body )

    const ambient = new THREE.AmbientLight(0x404040, 2)
    scene.add(ambient)

    /* Criar Luz Direcional */
    const light = new THREE.DirectionalLight(0xffffff, 2)
    light.position.set(50, 50, 100)
    scene.add(light)

    //Carregar Trofeu
    loader.load("./sceneLevelOne/trofeu/scene.gltf", function(gltf) {
            
        trofeu = gltf.scene.children[0]
        scene.add(trofeu)
        trofeu.position.set(25.7,6.00,-25)
        trofeu.rotation.set(-1.571,0,-1.710)
    })
}

//Animate Function

function animate(){


    //START ANIMATION

    requestAnimationFrame( animate )

    //HANDLE MOVEMENT

    if ( controls.isLocked === true ) {

        const delta =  0.04

        velocity.x -= velocity.x *  delta;
        velocity.z -= velocity.z *  delta;

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * delta;

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        
        player.position.copy(camera.position)

    }


    //Delete selectable Objects

    function remove(){
        selectableObjects = selectableObjects.filter(obj=> obj != finalObject)
        finalObject = undefined
    }

    if(loaded === sceneObjects[currentScene-1]){

        camera.position.set(0,4,0)
        camera.lookAt(0,4,0)
        switch(currentScene){
            case 1:{
                
                selectableObjects = [planta,mascara,robot,xadrez,holograma] 
                break
            }
            case 2:{
                
                selectableObjects = [cesto,creme,papel,secador,spray,wig]
                break
            }
            case 3:{

                selectableObjects = [almofada,braço,gameboy,monitor,pistola,vr]
                break
            }
        }
        loaded = true
        removeLoadingScreen()
    }

//Determine current Scene

    switch(currentScene){

        case 1:{

            loadedScenes[0] === false ? createFirstScene() : {}

            //Selected Object

            if(finalObject){
                switch(finalObject){

                    case planta:{

                        if(finalObject.scale.x > 0.01){

                            finalObject.scale.x -= 0.01
                            finalObject.scale.y -= 0.01
                            finalObject.scale.z -= 0.01

                        }
                        else{
                            remove()
                            scene.remove(text[0])
                            scene.remove(planta)
                        }

                        break
                    }

                    case mascara:{

                        if(finalObject.position.y > 0.01){

                            finalObject.position.y -= 0.01 + acceleration
                            finalObject.rotation.x += 0.01
                            acceleration += 0.005
                        }
                        else{remove(); scene.remove(text[1])}

                        break
                    }

                    case robot:{   

                        if(robot.scale.x < 0.6){

                            robot.scale.x += 0.01
                            robot.scale.y += 0.01
                            robot.scale.z += 0.01
                        }else if(robot.position.y < 8){

                            robot.position.y += 0.5
                        }else{ 
                            remove() 
                            scene.remove(text[2])
                            scene.remove(robot)
                        }

                        break
                    }

                    case xadrez:{

                        if(finalObject.rotation.x < 1.6){
                            finalObject.rotation.x += 0.05
                            finalObject.position.x -= 0.01
                        }
                        else{remove(); scene.remove(text[3])}

                        break
                    }

                    case holograma:{

                        rotateHologram = setInterval(animateHologram, 15)
                        remove()
                        scene.remove(text[4])

                        break
                    }

                    case trofeu:{

                        remove()
                        clearScene()
                        break
                    }
                }
            }
            //CASE WIN

            if(selectableObjects.length < 1 && loaded === true && trofeu.position.y == 200){
                trofeu.position.set(-2.220, 6, -4.240)
                trofeu.rotation.set(-1.561,0.000,-0.350)
                trofeu.scale.set(0.6,0.6,0.6)
                selectableObjects.push(trofeu)
                endTime += timer
                win = true
            }

            break
        }
            
        case 2:{
            
            loadedScenes[1] === false ? createSecondScene() : {}

            if(finalObject){

                switch(finalObject){

                    case cesto:{
                            scene.remove(cesto)
                            scene.remove(text[0])
                            remove()
                            break
                    }
                    case creme:{

                            scene.remove(creme)
                            scene.remove(text[1])
                            remove()
                            break
                    }

                    case papel:{

                            scene.remove(papel)
                            scene.remove(text[2])
                            remove()
                            break
                    }

                    case secador:{
                            scene.remove(secador)
                            scene.remove(text[3])
                            remove()
                            break
                    }

                    case spray:{
                            scene.remove(spray)
                            scene.remove(text[4])
                            remove()
                            break
                    }

                    case wig:{
                            scene.remove(wig)
                            scene.remove(text[5])
                            remove()
                            break
                    }

                    case trofeu:{
                        
                        remove()
                        clearScene()
                        break
                    }

                }
            }

            if(selectableObjects.length < 1 && loaded === true && trofeu.position.y == 200){
                trofeu.position.set(5.030, 6, -14.920)
                trofeu.rotation.set(-1.561,0.000,-1.010)
                trofeu.scale.set(0.6,0.6,0.6)
                selectableObjects.push(trofeu)
                endTime += timer
                win = true
            }

            break
        }

        case 3:{

            loadedScenes[2] === false ? createThirdScene() : {}

            if(finalObject){

                switch(finalObject){
                    case almofada:{
                            scene.remove(almofada)
                            scene.remove(text[0])
                            remove()
                            break
                    }
                    case braço:{
                            scene.remove(braço)
                            scene.remove(text[1])
                            remove()
                            break
                    }

                    case gameboy:{
                            scene.remove(gameboy)
                            scene.remove(text[2])
                            remove()
                            break
                    }

                    case monitor:{
                            scene.remove(monitor)
                            scene.remove(text[3])
                            remove()
                            break
                    }

                    case pistola:{
                            scene.remove(pistola)
                            scene.remove(text[4])
                            remove()
                            break
                    }

                    case vr:{
                            scene.remove(vr)
                            scene.remove(text[5])
                            remove()
                            break
                    }

                    case trofeu:{
                        
                        remove()
                        clearScene()
                        break
                    }

                }
            }

            if(selectableObjects.length < 1 && loaded === true && trofeu.position.y == 200){
                trofeu.position.set(-0.850,6, -10.290)
                trofeu.rotation.set(-1.561,0.000,1.250)
                trofeu.scale.set(0.5,0.5,0.5)
                selectableObjects.push(trofeu)
                endTime += timer
                win = true
            }

            break
        }

        case 4:{

            loadedScenes[3] === false ? createWinScene() : {}

            break
        }

        case 5:{
            loadedScenes[4] === false ? createWinScene() : {}

            break
        }
    }
        //Animate Trophy

        if(win === true && trofeu.position.y > trophySceneHeight[currentScene-1]){
                clearInterval(time)
                trofeu.position.y -= 0.01
                camera.lookAt(trofeu.position)
                controls.unlock()
        }
    

        //CASE LOSE

        if(timer >= timeToWin){
           if(camera.position.y > -5){
            camera.position.y -= 0.08
           } 
           else{

            clearInterval(time)
            loadedScenes = [false,false,false,false,false]
            clearScene("lose")
            } 
        }


        //RENDER

        renderer.render(scene, camera)
        
        if(loaded !== true){
        
            camera.lookAt(25.7,8,-25)
            camera.position.set(25,8,-20)

            if(lastLoaded < loaded && loaded < 6){

            loadingBlock.scale.x += loaded * 0.5
            loadingBlock.position.x = 24.75 + loadingBlock.scale.x * 0.25 / 2
            lastLoaded = loaded
            }
        }
}


//Win Cases

function removeLoadingScreen(){

    scene.remove(loadingText)
    scene.remove(loadingBlock)
}


function clearScene(prop){

    while(scene.children.length > 0){ 
        scene.remove(scene.children[0])
    }

    loadingBlock.position.x = 24.75
    loadingBlock.scale.x = 0.25
    win = false
    loaded = 0
    timer = 0
    time = undefined
    pointerPivot.rotation.z = 0
    lastLoaded = 0

    if(prop == "lose"){
        
        currentScene = 1
    }else{
        
        currentScene++
    }
}


//If Window's Resized


window.addEventListener("resize", e=>{

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    camera.aspect = canvas.width / canvas.height
    camera.updateProjectionMatrix()
    renderer.setSize(canvas.width, canvas.height)
})


//EXTRA ANIMATIONS


function handleTimer(){
    pointerPivot.rotation.z -= Math.PI / 30
    timer++
    timer == 30 ? pointer.material.color.setHex(0xfce303) : {}
    timer == 45 ? pointer.material.color.setHex(0xff0000) : {}
}

function animateHologram(){

    holograma.rotation.z += 0.005
}

window.onload = init()